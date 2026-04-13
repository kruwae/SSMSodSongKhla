-- attendanceSodSongKhla follow-up schema
-- Adds attendance proof metadata and RPC-safe role-aware helpers.
-- Designed to be compatible with the existing initial migration.

begin;

create or replace function public.is_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.role = 'admin'
      and p.is_active = true
  );
$$;

create or replace function public.is_manager_or_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = p_user_id
      and p.role in ('admin', 'manager')
      and p.is_active = true
  );
$$;

alter table public.attendance_records
  add column if not exists check_in_latitude numeric(10, 7),
  add column if not exists check_in_longitude numeric(10, 7),
  add column if not exists check_out_latitude numeric(10, 7),
  add column if not exists check_out_longitude numeric(10, 7),
  add column if not exists check_in_face_image_url text,
  add column if not exists check_out_face_image_url text,
  add column if not exists check_in_face_reference text,
  add column if not exists check_out_face_reference text,
  add column if not exists check_in_face_match_score numeric(5, 2),
  add column if not exists check_out_face_match_score numeric(5, 2),
  add column if not exists check_in_location_accuracy_meters numeric(8, 2),
  add column if not exists check_out_location_accuracy_meters numeric(8, 2),
  add column if not exists check_in_verified boolean not null default false,
  add column if not exists check_out_verified boolean not null default false,
  add column if not exists verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected', 'flagged')),
  add column if not exists verification_notes text,
  add column if not exists verification_metadata jsonb not null default '{}'::jsonb;

create index if not exists idx_attendance_check_in_latitude on public.attendance_records (check_in_latitude);
create index if not exists idx_attendance_check_in_longitude on public.attendance_records (check_in_longitude);
create index if not exists idx_attendance_check_out_at on public.attendance_records (check_out_at desc);
create index if not exists idx_attendance_verification_status on public.attendance_records (verification_status);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_check_in_location_check'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_check_in_location_check
      check (
        (check_in_latitude is null and check_in_longitude is null)
        or (
          check_in_latitude between -90 and 90
          and check_in_longitude between -180 and 180
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_check_out_location_check'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_check_out_location_check
      check (
        (check_out_latitude is null and check_out_longitude is null)
        or (
          check_out_latitude between -90 and 90
          and check_out_longitude between -180 and 180
        )
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'attendance_records_face_match_score_check'
      and conrelid = 'public.attendance_records'::regclass
  ) then
    alter table public.attendance_records
      add constraint attendance_records_face_match_score_check
      check (
        (check_in_face_match_score is null or (check_in_face_match_score between 0 and 100))
        and (check_out_face_match_score is null or (check_out_face_match_score between 0 and 100))
      );
  end if;
end $$;

create or replace function public.create_attendance_check_in(
  p_profile_id uuid,
  p_office_id uuid,
  p_shift_id uuid default null,
  p_check_in_at timestamptz default timezone('utc', now()),
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_location_accuracy_meters numeric default null,
  p_face_image_url text default null,
  p_face_reference text default null,
  p_face_match_score numeric default null,
  p_source text default 'mobile',
  p_notes text default null,
  p_verification_metadata jsonb default '{}'::jsonb
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record public.attendance_records;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if auth.uid() <> p_profile_id and not public.is_admin_user(auth.uid()) then
    raise exception 'forbidden';
  end if;

  insert into public.attendance_records (
    profile_id,
    office_id,
    shift_id,
    check_in_at,
    check_in_latitude,
    check_in_longitude,
    check_in_location_accuracy_meters,
    check_in_face_image_url,
    check_in_face_reference,
    check_in_face_match_score,
    check_in_source,
    notes,
    check_in_verified,
    verification_status,
    verification_metadata
  )
  values (
    p_profile_id,
    p_office_id,
    p_shift_id,
    p_check_in_at,
    p_latitude,
    p_longitude,
    p_location_accuracy_meters,
    p_face_image_url,
    p_face_reference,
    p_face_match_score,
    coalesce(nullif(p_source, ''), 'mobile'),
    p_notes,
    case when public.is_admin_user(auth.uid()) then true else false end,
    case when public.is_admin_user(auth.uid()) then 'verified' else 'pending' end,
    coalesce(p_verification_metadata, '{}'::jsonb)
  )
  returning * into v_record;

  return v_record;
end;
$$;

create or replace function public.complete_attendance_check_out(
  p_attendance_id uuid,
  p_check_out_at timestamptz default timezone('utc', now()),
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_location_accuracy_meters numeric default null,
  p_face_image_url text default null,
  p_face_reference text default null,
  p_face_match_score numeric default null,
  p_source text default 'mobile',
  p_notes text default null,
  p_verification_metadata jsonb default '{}'::jsonb
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record public.attendance_records;
  v_is_owner boolean;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  select
    a.*,
    (a.profile_id = auth.uid()) into v_record, v_is_owner
  from public.attendance_records a
  where a.id = p_attendance_id
  for update;

  if not found then
    raise exception 'attendance_record_not_found';
  end if;

  if not v_is_owner and not public.is_admin_user(auth.uid()) then
    raise exception 'forbidden';
  end if;

  update public.attendance_records
  set
    check_out_at = p_check_out_at,
    check_out_latitude = p_latitude,
    check_out_longitude = p_longitude,
    check_out_location_accuracy_meters = p_location_accuracy_meters,
    check_out_face_image_url = p_face_image_url,
    check_out_face_reference = p_face_reference,
    check_out_face_match_score = p_face_match_score,
    check_out_source = coalesce(nullif(p_source, ''), 'mobile'),
    check_out_verified = case when public.is_admin_user(auth.uid()) then true else check_out_verified end,
    verification_status = case
      when public.is_admin_user(auth.uid()) then 'verified'
      when verification_status = 'rejected' then verification_status
      else 'pending'
    end,
    notes = coalesce(p_notes, notes),
    verification_metadata = coalesce(verification_metadata, '{}'::jsonb) || coalesce(p_verification_metadata, '{}'::jsonb)
  where id = p_attendance_id
  returning * into v_record;

  return v_record;
end;
$$;

create or replace function public.review_leave_request(
  p_leave_request_id uuid,
  p_status text,
  p_reviewed_note text default null
)
returns public.leave_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record public.leave_requests;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  if not public.is_manager_or_admin_user(auth.uid()) then
    raise exception 'forbidden';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'invalid_status';
  end if;

  update public.leave_requests
  set
    status = p_status,
    approver_id = auth.uid(),
    reviewed_at = timezone('utc', now()),
    reviewed_note = p_reviewed_note
  where id = p_leave_request_id
  returning * into v_record;

  if not found then
    raise exception 'leave_request_not_found';
  end if;

  return v_record;
end;
$$;

create or replace function public.admin_upsert_profile(
  p_profile_id uuid,
  p_email citext,
  p_full_name text,
  p_role text default null,
  p_phone text default null,
  p_avatar_url text default null,
  p_department_id uuid default null,
  p_office_id uuid default null,
  p_is_active boolean default null,
  p_employee_code text default null
)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile public.profiles;
begin
  if auth.uid() is null or not public.is_admin_user(auth.uid()) then
    raise exception 'forbidden';
  end if;

  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    phone,
    avatar_url,
    department_id,
    office_id,
    is_active,
    employee_code,
    updated_at
  )
  values (
    p_profile_id,
    lower(coalesce(p_email, '')),
    coalesce(p_full_name, ''),
    coalesce(nullif(p_role, ''), 'employee'),
    p_phone,
    p_avatar_url,
    p_department_id,
    p_office_id,
    coalesce(p_is_active, true),
    p_employee_code,
    timezone('utc', now())
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    role = excluded.role,
    phone = excluded.phone,
    avatar_url = excluded.avatar_url,
    department_id = excluded.department_id,
    office_id = excluded.office_id,
    is_active = excluded.is_active,
    employee_code = excluded.employee_code,
    updated_at = excluded.updated_at
  returning * into v_profile;

  return v_profile;
end;
$$;

create or replace function public.admin_upsert_office(
  p_office_id uuid default null,
  p_department_id uuid,
  p_code text,
  p_name text,
  p_address text default null,
  p_latitude numeric default null,
  p_longitude numeric default null,
  p_radius_meters integer default 100,
  p_is_active boolean default true
)
returns public.offices
language plpgsql
security definer
set search_path = public
as $$
declare
  v_office public.offices;
begin
  if auth.uid() is null or not public.is_admin_user(auth.uid()) then
    raise exception 'forbidden';
  end if;

  insert into public.offices (
    id,
    department_id,
    code,
    name,
    address,
    latitude,
    longitude,
    radius_meters,
    is_active,
    updated_at
  )
  values (
    coalesce(p_office_id, gen_random_uuid()),
    p_department_id,
    p_code,
    p_name,
    p_address,
    p_latitude,
    p_longitude,
    coalesce(p_radius_meters, 100),
    coalesce(p_is_active, true),
    timezone('utc', now())
  )
  on conflict (id) do update set
    department_id = excluded.department_id,
    code = excluded.code,
    name = excluded.name,
    address = excluded.address,
    latitude = excluded.latitude,
    longitude = excluded.longitude,
    radius_meters = excluded.radius_meters,
    is_active = excluded.is_active,
    updated_at = excluded.updated_at
  returning * into v_office;

  return v_office;
end;
$$;

create or replace function public.mark_notification_read(
  p_notification_id uuid
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notification public.notifications;
begin
  if auth.uid() is null then
    raise exception 'authentication_required';
  end if;

  update public.notifications
  set is_read = true
  where id = p_notification_id
    and (
      profile_id = auth.uid()
      or profile_id is null
      or public.is_admin_user(auth.uid())
    )
  returning * into v_notification;

  if not found then
    raise exception 'notification_not_found';
  end if;

  return v_notification;
end;
$$;

drop policy if exists "attendance_insert_self_or_admin" on public.attendance_records;
create policy "attendance_insert_self_or_admin" on public.attendance_records
for insert to authenticated
with check (
  profile_id = auth.uid()
  or public.is_admin_user(auth.uid())
);

drop policy if exists "attendance_update_self_or_admin" on public.attendance_records;
create policy "attendance_update_self_or_admin" on public.attendance_records
for update to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin_user(auth.uid())
)
with check (
  profile_id = auth.uid()
  or public.is_admin_user(auth.uid())
);

drop policy if exists "leave_update_self_or_approver_or_admin" on public.leave_requests;
create policy "leave_update_self_or_approver_or_admin" on public.leave_requests
for update to authenticated
using (
  profile_id = auth.uid()
  or approver_id = auth.uid()
  or public.is_manager_or_admin_user(auth.uid())
)
with check (
  profile_id = auth.uid()
  or approver_id = auth.uid()
  or public.is_manager_or_admin_user(auth.uid())
);

drop policy if exists "notifications_insert_admin_only" on public.notifications;
create policy "notifications_insert_admin_only" on public.notifications
for insert to authenticated
with check (public.is_admin_user(auth.uid()));

drop policy if exists "notifications_update_own_or_admin" on public.notifications;
create policy "notifications_update_own_or_admin" on public.notifications
for update to authenticated
using (
  profile_id = auth.uid()
  or profile_id is null
  or public.is_admin_user(auth.uid())
)
with check (
  profile_id = auth.uid()
  or profile_id is null
  or public.is_admin_user(auth.uid())
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
for update to authenticated
using (
  id = auth.uid()
  or public.is_admin_user(auth.uid())
)
with check (
  id = auth.uid()
  or public.is_admin_user(auth.uid())
);

drop policy if exists "offices_write_admin" on public.offices;
create policy "offices_write_admin" on public.offices
for all to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "departments_write_admin" on public.departments;
create policy "departments_write_admin" on public.departments
for all to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "shifts_write_admin" on public.shifts;
create policy "shifts_write_admin" on public.shifts
for all to authenticated
using (public.is_admin_user(auth.uid()))
with check (public.is_admin_user(auth.uid()));

drop policy if exists "devices_write_own_or_admin" on public.devices;
create policy "devices_write_own_or_admin" on public.devices
for all to authenticated
using (
  profile_id = auth.uid()
  or public.is_admin_user(auth.uid())
)
with check (
  profile_id = auth.uid()
  or public.is_admin_user(auth.uid())
);

commit;