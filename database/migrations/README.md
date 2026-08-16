# Database Migrations

Run these in order, in the Supabase SQL Editor, whenever setting up a new
environment (or catching up an existing one that's missing later ones).

| File | What it does | Status |
|---|---|---|
| `001_core_schema.sql` | Creates `jobs` and `saved_jobs` tables, indexes, RLS policies | ✅ Applied |
| `002_enable_realtime.sql` | Enables live updates on `jobs` and `saved_jobs` | ✅ Applied |
| `003_admin_permissions.sql` | Creates `admin_users` table + admin RLS policies | ✅ Applied |
| `004_optional_profession_gender.sql` | Adds nullable `profession`/`gender` columns to `jobs` | ✅ Applied |
| `005_document_vault.sql` | Creates `document_entries` + `document_files` tables + RLS | ✅ Applied |
| `006_document_storage_bucket.sql` | Creates private `documents` storage bucket + folder-scoped RLS | ✅ Applied |
| `007_admin_document_review.sql` | Adds `verified`/`verified_at`/`verified_by` to `document_entries`; grants admins read-only SELECT on document entries/files/storage; adds `admin_list_document_owners()` for the admin UI | ✅ Applied |
| `008_cv_profiles.sql` | Creates `cv_profiles` table (one row per user, autosaved from the CV builder) + RLS | ✅ Applied |
| `009_job_alerts.sql` | Creates `job_alerts` table (province/profession alert criteria) + RLS | ✅ Applied |
| `010_admin_insert_jobs.sql` | Grants admins INSERT on `jobs` (for the manual "Add Job" form from the old job-board version) | ✅ Applied |
| `011_blog.sql` | Creates `blog_posts` table + RLS (public reads published only, admins full CRUD) | ✅ Applied |
| `012_cover_letter_profiles.sql` | Creates `cover_letter_profiles` table (one row per user, autosaved from the Cover Letter Builder) + RLS | ✅ Applied |
| `013_expire_old_jobs.sql` | Updates the public jobs RLS policy to exclude jobs past their `expires_on` date, regardless of status; best-effort daily `pg_cron` job to flip status to `'expired'` for admin visibility | ✅ Applied |
| `014_manual_source_label.sql` | Backfills `source_label` from `'Manual'` to `'Hamqar.com'` on existing manually-added jobs | ✅ Applied |
| `015_service_requests.sql` | Creates `service_requests` table (paid CV/cover-letter application-package orders) + RLS; creates private `service-requests` storage bucket + folder-scoped RLS; adds `admin_list_service_request_owners()` for the admin Orders UI | ✅ Applied |
| `016_profiles_and_job_slots.sql` | Creates `profiles` table (contact numbers); normalizes `service_requests` into a `service_request_jobs` child table (up to 3 job slots per order); creates private `deliverables` storage bucket | ✅ Applied |
| `017_auto_status_recompute.sql` | Adds a trigger that recomputes `service_requests.status` from its job slots' statuses whenever a job is added or its status changes, so an order can't be left showing "delivered" after a new job slot is added to it | ⏳ Not yet applied — **run this to fix the stale-"delivered"-status bug on tier-3 orders** |

Each file is idempotent-unsafe by design (uses `create table`, not
`create table if not exists`) — running a file twice on the same database
will error on the second run, which is intentional: it means you've
already applied it and something else is wrong if you're trying again.

## Adding a new migration

Name the next one `016_description.sql`, add a row to the table above, and
note the date/time (Kabul time) it was applied in `CHANGES.md`.
