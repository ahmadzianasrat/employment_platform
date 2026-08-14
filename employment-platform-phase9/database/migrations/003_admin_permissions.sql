-- Migration 003: Admin permissions
-- Creates the admin_users table and grants admins visibility/write access
-- to all jobs regardless of status. Run this, THEN run the "make yourself
-- an admin" statement below with your own sign-up email.

create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

create policy "Users can check their own admin status"
  on public.admin_users for select
  using (auth.uid() = user_id);

-- Admins can see every job regardless of status (active/hidden/expired) —
-- this is IN ADDITION to the existing public "active only" policy, not a
-- replacement. Postgres OR's multiple permissive SELECT policies together.
create policy "Admins can view all jobs"
  on public.jobs for select
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can update jobs"
  on public.jobs for update
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

create policy "Admins can delete jobs"
  on public.jobs for delete
  using (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));

-- Run this separately, after you've signed up an account in the app,
-- with your own email substituted in:
--
-- insert into public.admin_users (user_id)
-- select id from auth.users where email = 'your-actual-email@example.com';
