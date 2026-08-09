-- Migration 008: CV profiles
--
-- The CV builder previously held its data in component state only — lost
-- on refresh/navigation, and with no server-side record, the new "profile
-- completeness" nudge on the job board has nothing to check. This adds a
-- single-row-per-user table the CV builder autosaves to.

create table public.cv_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  template text not null default 'classic',
  updated_at timestamptz not null default now()
);

alter table public.cv_profiles enable row level security;

create policy "Users can view their own CV profile"
  on public.cv_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own CV profile"
  on public.cv_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own CV profile"
  on public.cv_profiles for update
  using (auth.uid() = user_id);

-- Deliberately no delete policy — clearing the CV builder form just saves
-- empty data, there's no product need to delete the row, and not adding
-- one is one less thing that could be misused.
