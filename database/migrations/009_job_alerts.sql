-- Migration 009: Job alerts
--
-- Stores each user's alert criteria (province + profession, either can be
-- "any"). Matching happens client-side against the existing realtime job
-- subscription (see useJobAlertMatches) — when a new job lands that
-- matches one of the signed-in user's alerts, they get an in-app
-- notification while on the site.
--
-- NOTE — scope of what this migration enables: this is IN-APP matching
-- only. True email/Telegram delivery for users who aren't currently on
-- the site would need a server-side piece (a Supabase Edge Function on a
-- cron trigger, checking new jobs since its last run against every
-- user's alerts, then calling an email provider) plus an email provider
-- API key, which is a real follow-up project, not something wired up
-- here. Flagging clearly so this isn't mistaken for full email delivery.

create table public.job_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  label text,
  province text not null default 'all', -- 'all' or a province key from provinces.ts
  profession text not null default 'all', -- 'all' or an exact profession string
  created_at timestamptz not null default now()
);

create index job_alerts_user_id_idx on public.job_alerts(user_id);

alter table public.job_alerts enable row level security;

create policy "Users can view their own job alerts"
  on public.job_alerts for select
  using (auth.uid() = user_id);

create policy "Users can create their own job alerts"
  on public.job_alerts for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own job alerts"
  on public.job_alerts for delete
  using (auth.uid() = user_id);
