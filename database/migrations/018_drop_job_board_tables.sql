-- Migration 018: Remove pre-pivot job board tables
--
-- `jobs`, `saved_jobs`, and `job_alerts` were the old job-board feature,
-- retired when the site pivoted to the free CV/cover-letter builders +
-- paid application service. Confirmed zero references anywhere in src/ —
-- no page, hook, or API file queries any of these three tables.
--
-- ****************************************************************
-- READ BEFORE RUNNING: the separate PHP scraper on Hostinger (outside
-- this repo, not something I have visibility into) may still be
-- inserting new rows into `jobs` on a schedule — you mentioned new jobs
-- are still landing in the database. Once this migration runs, every one
-- of the scraper's insert attempts will start failing (table won't
-- exist), silently, on whatever schedule it runs. That's harmless to
-- this app either way since nothing reads from `jobs` anymore, but the
-- scraper itself will just keep erroring forever unless you also turn
-- off its cron/task on Hostinger. Worth doing at the same time so it's
-- not left running for nothing.
-- ****************************************************************
--
-- Drops, in dependency order: the pg_cron job + function from migration
-- 013 first (they reference `jobs`), then `job_alerts` and `saved_jobs`
-- (no other tables depend on them), then `jobs` itself last since
-- `saved_jobs` has a foreign key into it. Realtime publication membership
-- (migration 002) and all RLS policies on these tables are dropped
-- automatically along with the tables — nothing extra to clean up there.

do $$
begin
  perform cron.unschedule('expire-old-jobs-daily');
exception
  when others then
    raise notice 'pg_cron unschedule skipped (job may not exist, or pg_cron is not installed on this project): %', sqlerrm;
end $$;

drop function if exists public.expire_old_jobs();

drop table if exists public.job_alerts;
drop table if exists public.saved_jobs;
drop table if exists public.jobs;
