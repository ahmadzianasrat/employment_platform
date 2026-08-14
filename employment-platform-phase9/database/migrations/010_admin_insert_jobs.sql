-- Migration 010: Admin manual job creation
--
-- Migration 003 gave admins SELECT/UPDATE/DELETE on `jobs` but never
-- INSERT — there was no "add a job manually" feature yet. Adding it now
-- for the new admin "Add Job" form (source = 'manual').

create policy "Admins can insert jobs"
  on public.jobs for insert
  with check (exists (select 1 from public.admin_users a where a.user_id = auth.uid()));
