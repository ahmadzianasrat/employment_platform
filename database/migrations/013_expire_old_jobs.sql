-- Migration 013: Hide expired jobs from public listings
--
-- Nothing previously transitioned a job's status to 'expired' once its
-- expires_on date passed — it just silently stayed 'active' forever
-- until an admin manually hid it. Two independent fixes:
--
--   1. (Primary — always works, no dependencies) The public RLS policy
--      now also excludes jobs whose expires_on date has passed,
--      regardless of status. This is the actual fix for "expired jobs
--      shouldn't show publicly" — it doesn't depend on any scheduled
--      job succeeding, and applies uniformly to the job board, the
--      sitemap generator, and anywhere else querying with the anon key.
--   2. (Secondary — best-effort) A daily pg_cron job that flips status
--      to 'expired' for jobs past their deadline, purely so the admin
--      panel's status badge/filter is accurate. Wrapped in exception
--      handling — if pg_cron isn't available on your Supabase plan or
--      needs enabling via the dashboard first, this part is skipped
--      harmlessly and part 1 above still fully handles the
--      public-facing requirement on its own.

drop policy "Jobs are publicly readable" on public.jobs;

create policy "Jobs are publicly readable"
  on public.jobs for select
  using (status = 'active' and (expires_on is null or expires_on >= current_date));

-- Best-effort admin-visibility improvement — safe to skip if it errors.
do $$
begin
  create extension if not exists pg_cron;

  create or replace function public.expire_old_jobs()
  returns void
  language sql
  as $fn$
    update public.jobs
    set status = 'expired'
    where status = 'active'
      and expires_on is not null
      and expires_on < current_date;
  $fn$;

  perform cron.schedule('expire-old-jobs-daily', '0 3 * * *', 'select public.expire_old_jobs();');
exception
  when others then
    raise notice 'pg_cron setup skipped (likely needs enabling via the Supabase dashboard first, or is unavailable on this plan): %', sqlerrm;
end $$;
