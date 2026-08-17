-- Migration 019: Per-user preferred language (for email notifications)
--
-- Adds `preferred_language` to `profiles` so the job-delivered
-- notification email (supabase/functions/notify-job-delivered) can be
-- sent in the customer's own language instead of English-only, as noted
-- as a known gap at the bottom of this README.
--
-- Defaults to Pashto ('ps') rather than English, per the site's primary
-- audience — this also means existing `profiles` rows (created before
-- this column existed) come out reading as Pashto with no backfill step
-- needed, since the NOT NULL DEFAULT applies retroactively.
--
-- Not tied to the in-app UI language toggle (localStorage, browser-only,
-- see LanguageContext.tsx) on purpose: someone could browse the site in
-- English but still want emails in Pashto, e.g. reading it for a
-- relative. Kept as a separate, explicit choice on the Profile page.

alter table public.profiles
  add column preferred_language varchar(2) not null default 'ps'
  check (preferred_language in ('en', 'ps', 'da'));
