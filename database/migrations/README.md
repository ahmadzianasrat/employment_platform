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
| `007_admin_document_review.sql` | Adds `verified`/`verified_at`/`verified_by` to `document_entries`; grants admins read-only SELECT on document entries/files/storage; adds `admin_list_document_owners()` for the admin UI | ⏳ Not yet applied — run this next |
| `008_cv_profiles.sql` | Creates `cv_profiles` table (one row per user, autosaved from the CV builder) + RLS | ⏳ Not yet applied — run after 007 |
| `009_job_alerts.sql` | Creates `job_alerts` table (province/profession alert criteria) + RLS | ⏳ Not yet applied — run after 008 |

Each file is idempotent-unsafe by design (uses `create table`, not
`create table if not exists`) — running a file twice on the same database
will error on the second run, which is intentional: it means you've
already applied it and something else is wrong if you're trying again.

## Adding a new migration

Name the next one `007_description.sql`, add a row to the table above, and
note the date/time (Kabul time) it was applied in `CHANGES.md`.
