# attendanceSodSongKhla

Production-ready attendance system foundation built with Vite + React + TypeScript, Supabase, and a Tailwind-friendly component architecture.

## Supabase setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env` and fill in your project values.
3. Apply the initial schema migration:
   - `supabase/migrations/001_init.sql`
4. Ensure the following are configured in Supabase:
   - Authentication enabled
   - Email sign-in or your preferred auth provider
   - RLS enabled on the application tables
   - A scheduled job or Edge Function for QR token cleanup if you want automatic housekeeping

## Database migration

The initial migration creates:

- `departments`
- `offices`
- `profiles`
- `devices`
- `shifts`
- `attendance_records`
- `leave_requests`
- `notifications`
- `qr_tokens`

It also includes:

- Row Level Security policies
- indexes and constraints
- update timestamp triggers
- `handle_new_user()` auth bootstrap trigger
- `calculate_work_hours()` attendance helper
- `detect_late_status()` lateness helper
- `cleanup_expired_qr_tokens()` maintenance helper
- seed data for one default department and one office

## Admin bootstrap

The default bootstrap flow is designed so the first authenticated user can be promoted to admin by updating their profile in Supabase:

1. Sign up or invite the first user.
2. In the Supabase SQL editor, promote the profile:
   - `update public.profiles set role = 'admin' where id = '<auth-user-uuid>';`
3. Optionally assign that admin to the seeded department and office.
4. From that point on, the admin can manage departments, offices, employees, devices, attendance, leaves, and notifications.

### Recommended bootstrap checklist

- Update the seeded office address, coordinates, and radius to match your real site.
- Create additional departments/offices before onboarding employees.
- Review RLS policies before opening production access.
- Set up a scheduled cleanup for expired QR tokens if you plan to use QR-based check-in.

## Notes

- QR token generation is represented at the database layer by helper functions, but the actual issuance flow should be handled by an Edge Function or server-side endpoint.
- This repository is intended as a foundation; feature pages and API integration are expected to be expanded alongside the Supabase schema.# SSMSodSongKhla
