-- Migration 014: Relabel manual job listings as "Hamqar.com"
--
-- The admin "Add Job" form used to default source_label to 'Manual'.
-- Changed the app default to 'Hamqar.com' so manually-added listings
-- show the same kind of source badge as scraped ones instead of reading
-- as an internal/administrative label. This backfills any rows already
-- created with the old default — harmless no-op if none exist yet.

update public.jobs
set source_label = 'Hamqar.com'
where source = 'manual'
  and source_label = 'Manual';
