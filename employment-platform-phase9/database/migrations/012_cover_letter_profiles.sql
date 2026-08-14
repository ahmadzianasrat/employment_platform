-- Migration 012: Cover letter profiles
--
-- Same pattern as migration 008 (cv_profiles): one row per user,
-- autosaved from the new cover letter builder.

create table public.cover_letter_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  template text not null default 'formal',
  updated_at timestamptz not null default now()
);

alter table public.cover_letter_profiles enable row level security;

create policy "Users can view their own cover letter profile"
  on public.cover_letter_profiles for select
  using (auth.uid() = user_id);

create policy "Users can insert their own cover letter profile"
  on public.cover_letter_profiles for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own cover letter profile"
  on public.cover_letter_profiles for update
  using (auth.uid() = user_id);
