-- Migration 004: Optional profession + gender fields
--
-- These are NOT captured by the PHP scraper (ACBAR/ReliefWeb/Wazifaha/jobs.af
-- don't reliably expose structured profession/gender data), so these are
-- nullable, admin-editable fields — populated manually per job where useful,
-- left blank otherwise. The UI shows "—" for jobs where these aren't set.

alter table public.jobs add column profession varchar(100);
alter table public.jobs add column gender varchar(30);
