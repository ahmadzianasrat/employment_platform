-- Migration 017: auto-recompute order status from its job slots
--
-- Bug this fixes: an admin marks the one job on a tier-1 order (or the
-- last job on a tier-3 order) "delivered," which used to also require a
-- separate manual "mark order delivered" click — and nothing reset that
-- back if the customer later added another job to a tier-3 order via
-- their Profile page. The order kept showing "delivered" even though a
-- brand new pending job now existed underneath it.
--
-- Fix: `service_requests.status` (for the 'new'/'in_progress'/'delivered'
-- states — 'cancelled' is untouched, see below) is no longer set by
-- hand. It's recomputed by this trigger every time a service_request_jobs
-- row is inserted or its status changes:
--   - no jobs yet                                → 'new'
--   - tier '3' with fewer than 3 job rows so far  → 'in_progress'
--     (even if every existing job is delivered — there's still an open
--     slot, so the order isn't finished)
--   - every existing job slot is 'delivered'      → 'delivered'
--   - otherwise (some pending/in_progress)        → 'in_progress'
-- 'cancelled' orders are left alone — the trigger skips recomputing a
-- cancelled order, since an admin cancelling is a deliberate override
-- that a stray job-status update shouldn't undo.

create or replace function public.recompute_service_request_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_request_id uuid;
  request_tier varchar(20);
  current_status varchar(20);
  job_count int;
  delivered_count int;
  expected_count int;
  new_status varchar(20);
begin
  target_request_id := coalesce(new.service_request_id, old.service_request_id);

  select tier, status into request_tier, current_status
  from public.service_requests
  where id = target_request_id;

  if current_status = 'cancelled' then
    return coalesce(new, old);
  end if;

  select count(*), count(*) filter (where status = 'delivered')
  into job_count, delivered_count
  from public.service_request_jobs
  where service_request_id = target_request_id;

  expected_count := case when request_tier = '3' then 3 else 1 end;

  if job_count = 0 then
    new_status := 'new';
  elsif delivered_count = job_count and job_count >= expected_count then
    new_status := 'delivered';
  else
    new_status := 'in_progress';
  end if;

  update public.service_requests
  set status = new_status, updated_at = now()
  where id = target_request_id and status <> new_status;

  return coalesce(new, old);
end;
$$;

create trigger service_request_jobs_recompute_status
  after insert or update of status or delete on public.service_request_jobs
  for each row
  execute function public.recompute_service_request_status();

-- Backfill: recompute every existing order's status once, in case any
-- were left in a stale state before this trigger existed.
update public.service_requests r
set status = (
  case
    when r.status = 'cancelled' then r.status
    when (select count(*) from public.service_request_jobs j where j.service_request_id = r.id) = 0 then 'new'
    when (
      select count(*) filter (where j.status = 'delivered') = count(*)
        and count(*) >= (case when r.tier = '3' then 3 else 1 end)
      from public.service_request_jobs j where j.service_request_id = r.id
    ) then 'delivered'
    else 'in_progress'
  end
);
