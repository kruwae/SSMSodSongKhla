-- attendanceSodSongKhla initial Supabase schema
-- Production-ready foundation for the attendance system.
-- This migration is intentionally idempotent where possible and safe to re-run in fresh environments.

begin;

create extension if not exists "pgcrypto";
create extension if not exists "citext";

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
  )
  values (
    new.id,
    lower(coalesce(new.email, '')),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1)),
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'employee'),
    true,
    timezone('utc', now()),
    timezone('utc', now())
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = excluded.full_name,
    updated_at = excluded.updated_at;

  return new;
end;
$$;

create or replace function public.calculate_work_hours(p_check_in timestamptz, p_check_out timestamptz)
returns numeric
language sql
immutable
as $$
  select case
    when p_check_in is null or p_check_out is null then null
    when p_check_out < p_check_in then null
    else round(extract(epoch from (p_check_out - p_check_in)) / 3600.0, 2)
  end;
$$;

create or replace function public.detect_late_status(p_check_in timestamptz, p_shift_start time with time zone)
returns boolean
language sql
immutable
as $$
  select case
    when p_check_in is null or p_shift_start is null then false
    else (p_check_in at time zone 'utc')::time > p_shift_start
  end;
$$;

create or replace function public.cleanup_expired_qr_tokens()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  deleted_count integer;
begin
  delete from public.qr_tokens
  where expires_at < timezone('utc', now())
     or is_used = true
     or revoked_at is not null;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

create or replace function public.generate_qr_token()
returns text
language sql
stable
as $$
  select replace(encode(gen_random_bytes(32), 'base64'), '/', '_');
$$;

create table if not exists public.departments (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.offices (
  id uuid primary key default gen_random_uuid(),
  department_id uuid not null references public.departments(id) on delete restrict,
  code text not null unique,
  name text not null,
  address text,
  latitude numeric(10, 7),
  longitude numeric(10, 7),
  radius_meters integer not null default 100 check (radius_meters > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email citext not null unique,
  employee_code text unique,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'employee' check (role in ('admin', 'manager', 'employee')),
  department_id uuid references public.departments(id) on delete set null,
  office_id uuid references public.offices(id) on delete set null,
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.devices (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  device_fingerprint text not null unique,
  device_name text,
  platform text,
  push_token text,
  is_verified boolean not null default false,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  grace_period_minutes integer not null default 10 check (grace_period_minutes >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  office_id uuid references public.offices(id) on delete set null,
  shift_id uuid references public.shifts(id) on delete set null,
  check_in_at timestamptz not null default timezone('utc', now()),
  check_out_at timestamptz,
  work_hours numeric(6, 2) generated always as (public.calculate_work_hours(check_in_at, check_out_at)) stored,
  late_status boolean not null default false,
  check_in_source text not null default 'mobile' check (check_in_source in ('mobile', 'web', 'qr', 'admin')),
  check_out_source text check (check_out_source in ('mobile', 'web', 'qr', 'admin')),
  notes text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  approver_id uuid references public.profiles(id) on delete set null,
  type text not null check (type in ('annual', 'sick', 'personal', 'other')),
  reason text not null,
  start_date date not null,
  end_date date not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_at timestamptz,
  reviewed_note text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint leave_request_dates_check check (end_date >= start_date)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete cascade,
  title text not null,
  body text not null,
  category text not null default 'system' check (category in ('system', 'attendance', 'leave', 'device', 'admin')),
  action_url text,
  is_read boolean not null default false,
  sent_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.qr_tokens (
  id uuid primary key default gen_random_uuid(),
  office_id uuid not null references public.offices(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  issued_by uuid references public.profiles(id) on delete set null,
  is_used boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_departments_is_active on public.departments (is_active);
create index if not exists idx_offices_department_id on public.offices (department_id);
create index if not exists idx_offices_is_active on public.offices (is_active);
create index if not exists idx_profiles_department_id on public.profiles (department_id);
create index if not exists idx_profiles_office_id on public.profiles (office_id);
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_devices_profile_id on public.devices (profile_id);
create index if not exists idx_shifts_office_id on public.shifts (office_id);
create index if not exists idx_attendance_profile_id on public.attendance_records (profile_id);
create index if not exists idx_attendance_office_id on public.attendance_records (office_id);
create index if not exists idx_attendance_check_in_at on public.attendance_records (check_in_at desc);
create index if not exists idx_leave_requests_profile_id on public.leave_requests (profile_id);
create index if not exists idx_leave_requests_status on public.leave_requests (status);
create index if not exists idx_notifications_profile_id on public.notifications (profile_id);
create index if not exists idx_notifications_is_read on public.notifications (is_read);
create index if not exists idx_qr_tokens_office_id on public.qr_tokens (office_id);
create index if not exists idx_qr_tokens_expires_at on public.qr_tokens (expires_at);

drop trigger if exists trg_update_departments_updated_at on public.departments;
create trigger trg_update_departments_updated_at
before update on public.departments
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_offices_updated_at on public.offices;
create trigger trg_update_offices_updated_at
before update on public.offices
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_profiles_updated_at on public.profiles;
create trigger trg_update_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_devices_updated_at on public.devices;
create trigger trg_update_devices_updated_at
before update on public.devices
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_shifts_updated_at on public.shifts;
create trigger trg_update_shifts_updated_at
before update on public.shifts
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_attendance_updated_at on public.attendance_records;
create trigger trg_update_attendance_updated_at
before update on public.attendance_records
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_leave_requests_updated_at on public.leave_requests;
create trigger trg_update_leave_requests_updated_at
before update on public.leave_requests
for each row execute function public.update_updated_at_column();

drop trigger if exists trg_update_notifications_updated_at on public.notifications;
create trigger trg_update_notifications_updated_at
before update on public.notifications
for each row execute function public.update_updated_at_column();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

alter table public.departments enable row level security;
alter table public.offices enable row level security;
alter table public.profiles enable row level security;
alter table public.devices enable row level security;
alter table public.shifts enable row level security;
alter table public.attendance_records enable row level security;
alter table public.leave_requests enable row level security;
alter table public.notifications enable row level security;
alter table public.qr_tokens enable row level security;

drop policy if exists "departments_read_authenticated" on public.departments;
create policy "departments_read_authenticated" on public.departments
for select to authenticated using (true);

drop policy if exists "departments_write_admin" on public.departments;
create policy "departments_write_admin" on public.departments
for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "offices_read_authenticated" on public.offices;
create policy "offices_read_authenticated" on public.offices
for select to authenticated using (true);

drop policy if exists "offices_write_admin" on public.offices;
create policy "offices_write_admin" on public.offices
for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
for select to authenticated using (
  id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
for update to authenticated using (
  id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "devices_select_own_or_admin" on public.devices;
create policy "devices_select_own_or_admin" on public.devices
for select to authenticated using (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "devices_write_own_or_admin" on public.devices;
create policy "devices_write_own_or_admin" on public.devices
for all to authenticated using (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "shifts_read_authenticated" on public.shifts;
create policy "shifts_read_authenticated" on public.shifts
for select to authenticated using (true);

drop policy if exists "shifts_write_admin" on public.shifts;
create policy "shifts_write_admin" on public.shifts
for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "attendance_select_self_or_admin" on public.attendance_records;
create policy "attendance_select_self_or_admin" on public.attendance_records
for select to authenticated using (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "attendance_write_self_or_admin" on public.attendance_records;
create policy "attendance_write_self_or_admin" on public.attendance_records
for insert to authenticated with check (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "attendance_update_self_or_admin" on public.attendance_records;
create policy "attendance_update_self_or_admin" on public.attendance_records
for update to authenticated using (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "leave_select_self_or_admin" on public.leave_requests;
create policy "leave_select_self_or_admin" on public.leave_requests
for select to authenticated using (
  profile_id = auth.uid()
  or approver_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "leave_write_self" on public.leave_requests;
create policy "leave_write_self" on public.leave_requests
for insert to authenticated with check (profile_id = auth.uid());

drop policy if exists "leave_update_self_or_approver_or_admin" on public.leave_requests;
create policy "leave_update_self_or_approver_or_admin" on public.leave_requests
for update to authenticated using (
  profile_id = auth.uid()
  or approver_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  profile_id = auth.uid()
  or approver_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "notifications_select_own_or_admin" on public.notifications;
create policy "notifications_select_own_or_admin" on public.notifications
for select to authenticated using (
  profile_id = auth.uid()
  or profile_id is null
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "notifications_update_own_or_admin" on public.notifications;
create policy "notifications_update_own_or_admin" on public.notifications
for update to authenticated using (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  profile_id = auth.uid()
  or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "qr_tokens_admin_only" on public.qr_tokens;
create policy "qr_tokens_admin_only" on public.qr_tokens
for all to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

insert into public.departments (code, name, description)
values ('admin', 'Administration', 'Seeded default department for attendanceSodSongKhla')
on conflict (code) do nothing;

insert into public.offices (department_id, code, name, address, latitude, longitude, radius_meters)
select d.id, 'HQ-01', 'Main Office', 'Seeded main office for attendanceSodSongKhla', 7.2023, 100.5951, 120
from public.departments d
where d.code = 'admin'
on conflict (code) do nothing;

commit;

-- Optional helper for scheduled cleanup from Supabase cron or pg_cron.
-- select public.cleanup_expired_qr_tokens();
