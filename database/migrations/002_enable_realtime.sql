-- Migration 002: Enable Realtime on jobs + saved_jobs
-- Required for live updates in the app (no manual refresh needed).
-- Realtime is off by default per table in Supabase.

alter publication supabase_realtime add table public.jobs;
alter publication supabase_realtime add table public.saved_jobs;
