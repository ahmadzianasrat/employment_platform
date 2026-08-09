# Employment Platform — Phase 1 Changelog

> Timestamps below are added from this point forward per your request. Entries before the Admin Panel update predate this convention, so they're dated (day only) rather than timestamped precisely.

## Update — Initial scaffold: 2026-08-01
- **Project setup**: React + Vite + TypeScript, Tailwind v4, React Router
- **Trilingual system**: `src/lib/i18n/strings.ts` — English/Pashto/Dari, RTL auto-switches based on language, persisted in localStorage
- **Supabase connection**: wired to your live project (publishable key only — safe for frontend)
- **Job board**: search + location filter, job cards, detail page. Pulls from live Supabase `jobs` table, falls back to bundled sample data if the table is empty
- **CV builder**: structured form (personal info, experience, education, skills) → real PDF download via jsPDF, using a clean single-column template
- **Domain-based folder structure**: `src/modules/jobs/`, `src/modules/cv/`, each with their own components/pages/api/types
- SQL: `database/migrations/001_core_schema.sql`

## Update — Navbar + CV additions: 2026-08-01
- Fixed navbar: subtle lapis gradient + saffron bottom border instead of the flat solid block
- CV builder: added Address field, and a full Languages section (name + proficiency dropdown, native language auto-highlighted with a saffron badge/star in both the form and the exported PDF)

## Update — Header redesign: 2026-08-01
- Added a small geometric brand mark (8-pointed star, echoing Central Asian/Afghan ornamental patterns) next to the wordmark
- Nav links restyled: uppercase, letter-spaced, with a small saffron dot indicator above the active link instead of a generic underline; wrapped in a subtle divider rail
- Language switcher tightened to match: sharp corners, uppercase labels, saffron fill on active language instead of the soft rounded pill

## Update — PHP scraper → Supabase sync: 2026-08-01
- Added `pushToSupabase()` to `PublishNewJobs.php` on the Hostinger/Laravel side — fires once per newly-discovered vacancy, before publish throttling/Telegram/Facebook, so it captures every discovered job (not just the ones that make it to your channels)
- Added `supabase` config block to `config/jobs_publisher.php`, `SUPABASE_URL` / `SUPABASE_SECRET_KEY` to `.env`
- Verified working end-to-end: real scraped jobs now land in Supabase automatically every ~15 minutes (cron cadence unchanged)

## Update — Auth + Saved Jobs: 2026-08-01
- Supabase Auth wired in: email/password sign up and sign in, session persisted automatically
- New `/sign-in` page (toggles between sign in / sign up), new `/saved` page (protected — redirects to sign-in if logged out)
- Header now shows "Sign in" when logged out, or "Saved" nav link + "Sign out" when logged in
- Save/bookmark button added to job cards and the job detail page — uses the `saved_jobs` table + RLS policies. Disabled automatically on sample/demo jobs (no real row to save against)
- Sign-up requires email confirmation by default (Supabase's default setting)

## Update — Realtime (no more manual refresh): 2026-08-01
- `useRealtimeJobs` hook: job board subscribes live to INSERT/UPDATE/DELETE on `jobs`. New scraped jobs appear automatically; a job going inactive/hidden removes it from the list live.
- `useRealtimeSavedJobs` hook: Saved Jobs page subscribes to the current user's own `saved_jobs` rows. Saving/unsaving updates the list without navigating away and back.
- SQL: `database/migrations/002_enable_realtime.sql`

## Update — Admin review panel + duplicate detection: 2026-08-02 10:12 AM
- New `admin_users` table + RLS policies — admins can view all jobs regardless of status, and update/delete
- New `/admin` route (English-only, matching your existing admin-screen convention) — visible only to admins, everyone else redirected home
- Admin panel: view all jobs, inline edit (title/employer/location/deadline), hide/unhide toggle, delete, filter by status
- Duplicate detection: normalizes title + employer (case, punctuation, "(re-announced)" suffix stripped) and groups jobs matching across *different* sources — flags candidates with a colored border + a "duplicates only" filter, does NOT auto-merge or auto-hide anything. Same-source re-announcements are correctly excluded.
- Admin link appears in header nav only for logged-in admins
- SQL: `database/migrations/003_admin_permissions.sql`

## Update — Admin edit date bug fix: 2026-08-02 10:55 AM
- **Bug**: editing a job's deadline in the admin panel updated `deadline_raw` (display text) but not `expires_on` (the actual date column) — and the public job board/detail page always prefers `expires_on` when both exist, so the edit silently had no visible effect.
- **Fix**: admin edit form now has two separate fields — a text field for the display string, and a real date picker for `expires_on` — both save together. Labeled clearly in the UI so it's obvious which one drives what.

---

## Update — Footer + deployment pipeline: 2026-08-02 11:05 AM
- New trilingual `Footer` component: explains listings are aggregated from public sources (ACBAR, ReliefWeb, jobs.af, Wazifaha) and to verify deadlines on the original posting, plus a contact address placeholder (`src/components/layout/Footer.tsx` — **update the `CONTACT_EMAIL` constant before going live**)
- Layout now uses a sticky footer (flex column, footer pinned to bottom even on short pages)
- New `.github/workflows/deploy.yml` — builds and deploys to GitHub Pages automatically on every push to `main`, via GitHub's native Pages Actions deployment (no `gh-pages` branch needed)
- New `DEPLOYMENT.md` — full walkthrough: pushing to GitHub, adding Supabase credentials as repo secrets, enabling Pages, and connecting a custom domain (DNS records for Hostinger or any registrar)

---

## Update — Switched deployment target to Hostinger: 2026-08-03 11:05 AM
- Decided against GitHub Pages in favor of deploying to a 2nd website on the existing Hostinger shared hosting account — consolidates infrastructure (same account already running the PHP scraper), includes professional email, no extra hosting cost since it's already paid for, and gives cleaner client-side routing support than GitHub Pages' workaround
- Removed `.github/workflows/deploy.yml` (GitHub Pages-specific, no longer used)
- Added `public/.htaccess` — Apache rewrite rules so React Router's client-side routes (`/jobs/:id`, `/admin`, `/saved`, etc.) work correctly on direct load/refresh, not just in-app navigation. Copied into `dist/` automatically on every build.
- Rewrote `DEPLOYMENT.md` for the Hostinger flow: build locally, upload `dist/` contents via SFTP/SSH or File Manager to the new site's `public_html`
- Deployment is currently manual (`npm run build` + `scp`) — can be automated later via GitHub Actions if it becomes tedious, same pattern as the PHP scraper's deploy, but not built until actually needed

---

## Update — Hybrid deployment: GitHub Pages (site) + Hostinger (domain + email): 2026-08-03 11:28 AM
- Confirmed with Hostinger's own docs: email hosting is independent of website hosting, and a free/paid email plan can be claimed for any domain even with no site hosted there — so this hybrid doesn't cost a website slot
- Restored `.github/workflows/deploy.yml` — GitHub Pages is the host again, Hostinger only handles the domain + email
- Added the standard GitHub Pages SPA routing workaround, since GitHub Pages (unlike Apache) has no server-side rewrite rules:
  - `public/404.html` — GitHub Pages serves this for any unmatched path; it redirects to `index.html` with the intended path encoded in a query string
  - `index.html` — new script decodes that query string and restores the clean URL before React Router mounts
  - `public/.nojekyll` — prevents GitHub Pages from running the build through Jekyll processing
- `public/.htaccess` left in place, unused by GitHub Pages but harmless — kept in case of a future move back to Apache-based hosting
- Rewrote `DEPLOYMENT.md` for the hybrid flow: Part 1 (GitHub Pages hosting setup), Part 2 (Hostinger domain purchase + email + DNS split between MX records for email and A/CNAME records for the site)
- Fixed the generic "employment-platform" browser tab title → "Employment Platform"

---

## Update — Job board redesign, provinces filter, Kabul-time changelog: 2026-08-04 01:02 PM (Kabul time)

**Note:** timestamps from this entry forward are in Kabul time (UTC+4:30), not the sandbox's local time as before — per your request.

**Root cause of the blank `hamqar.com` page, resolved**: `git pull` reported "up to date" because I never had push access to your actual GitHub repo — I can only edit files in my own working copy. The subfolder-path fix, `CNAME` file, and Tailwind syntax cleanup from earlier were never actually deployed. Delivered as a fresh zip this time instead of relying on git sync.

- **`base` flipped to `/`** in `vite.config.ts`, confirmed root-level asset paths in the build output — this is what was actually broken on `hamqar.com`
- **`.gitignore` re-added** — same dotfile-loss pattern as `.github` and `.htaccess` before (Windows zip extraction silently drops dotfiles); flagged a verification step to catch this going forward
- **Job board rebuilt as a table** (title/organization/profession/deadline/gender/location/source/details, sequential row numbers, "New" badge for listings <3 days old, deadline shown in red) — matching the reference design
- **New `profession` and `gender` columns** added to the `jobs` table (migration `004_optional_profession_gender.sql`) — nullable, since the PHP scraper doesn't capture these; admin-editable per job, shown as "—" when unset. Sample data updated with example values.
- **Location filter** rebuilt as a dropdown with "All Locations" + all 34 Afghan provinces as radio options — matches by substring against the job's free-text location field, so a job listing multiple provinces (e.g. "Kabul, Herat") correctly matches either province, not just an exact single-value match
- **Profession filter** added — dropdown built dynamically from distinct profession values present in current listings
- **Language dropdown** added inline in the job board's filter row (in addition to the existing header switcher) to match the reference design
- **Telegram (Pashto) / Telegram (Dari) buttons** added per row, replacing the reference design's generic Telegram/WhatsApp icons — both are placeholder links for now (`src/lib/config/channelLinks.ts` — **update `TELEGRAM_PASHTO_URL` / `TELEGRAM_DARI_URL` before going live**). Assumed these are global community channel links (same for every row), not per-job — flag if that assumption's wrong.
- **Apply button/column removed** from the table (per request) — the job detail page's "Apply on original site" link was deliberately left in place, since that's the actual mechanism for reaching a real application, not the same thing as the table's decorative Apply button. Flag if this should also be hidden.
- **Organization logos**: not implemented (per request) — table shows organization name as plain text only
- SQL: `database/migrations/004_optional_profession_gender.sql`

---

## Update — Pagination, truncation, org avatars, icon fix: 2026-08-05 02:37 AM (Kabul time)
- **Location/Organization cells truncate** with an ellipsis instead of expanding row height, full text available on hover via `title` attribute — fixes the extreme row-height issue on multi-province listings
- **Pagination added** — 20 jobs per page, resets to page 1 whenever a filter/search changes so you're never stranded on an empty page
- **Telegram Dari icon fixed** — was mistakenly using a WhatsApp-style bubble icon; both Pashto and Dari buttons now use the identical Telegram paper-plane icon, differentiated only by color/tooltip, not by using two different icon families
- **Organization avatars added** between Position and Organization columns — deliberately NOT hotlinked/scraped logos (see reasoning below), using deterministic colored initials instead (same pattern as Slack/GitHub/Discord's default avatars)
  - **Why not real logos**: sandbox network can't reach arbitrary image hosts to download/self-host logos into the repo; Clearbit's free logo API (the obvious historical choice) was permanently shut down Dec 2025, and every current replacement requires an API key plus a company *domain* — which we don't have, only free-text organization names scraped from postings, so there's no reliable name→domain resolution without guessing
  - **Resource impact of the chosen approach**: zero — no network requests, no external dependency, pure CSS/SVG rendering from data already in hand
  - **If real logos matter later**: recommended path is admin-uploaded logos per organization stored in Supabase Storage (self-hosted, not hotlinked) — a deliberate future feature, not built now

---

## Update — GitHub Pages Source bug found & fixed, document vault, admin pagination: 2026-08-05 01:33 PM (Kabul time)

**Root cause of the extended blank-page saga, finally found**: `Settings → Pages → Source` had reverted to (or never actually left) **"Deploy from a branch"** instead of **"GitHub Actions."** This meant GitHub was serving the raw repo `index.html` verbatim — `<script src="/src/main.tsx">`, completely unbuilt — never our actual `dist/` output. Every DNS check, cache flush, and browser troubleshooting step along the way was correctly executed and genuinely ruled out those layers one by one; the actual bug was upstream of all of it. Fixed by switching the Source setting back to "GitHub Actions" in the repo settings.

Also discovered mid-session: a second, disconnected git history got created by re-running `git init` inside the original `employment-platform` folder (not `-v2`). Nothing was lost (the push failed before it could overwrite anything on GitHub), but the fix was to treat `employment-platform-v2` as the only real working copy from that point on and `robocopy` the newer files across, rather than trying to reconcile two histories. **The original `employment-platform` folder should be deleted or renamed to avoid ever running git commands in it again.**

### Document vault (new)
- Two-table design: `document_entries` (one row per document *instance*) + `document_files` (one or more files per entry) — lets a single entry (e.g. one specific university degree) hold multiple files (e.g. diploma scan + transcript)
- Single-entry types: ID card, passport, driving license, TIN, school diploma
- Repeatable types (unlimited entries, each with an optional label): university diploma, work experience, employment contract, reference
- Bulk upload zone: drag/drop multiple files at once, assign each a document type, confirm — creates one unlabeled entry per file (repeatable-type files can be organized further afterward; bulk upload intentionally doesn't ask for a label per file to keep the flow fast)
- Accepts PDF, JPG, PNG, WEBP; 15MB per file limit
- Private Supabase Storage bucket (`documents`), folder-scoped RLS so a user can only ever read/write their own files, even with a guessed path
- **Documents are private to the uploading user only — not visible to admins.** Deliberate choice, not an oversight; flag if admin verification access is wanted later, since that's an additional RLS policy to add on purpose, not something to assume.
- New `/documents` route + "My Documents" nav link (visible when logged in)
- SQL: `database/migrations/005_document_vault.sql`, `database/migrations/006_document_storage_bucket.sql`

### Admin pagination
- Admin jobs table now paginates at 20/page, matching the public job board's pagination, resets to page 1 on filter change

### Documentation overhaul
- `README.md` rewritten from scratch (was still the default Vite scaffold text this whole time) — now a real project reference covering stack, folder structure, env vars, known gotchas (GitHub Pages Source setting, Windows dotfile extraction, Claude's sandbox/push limitations, `base` path sensitivity, SPA routing workaround, profession/gender timing, logo decision, placeholder Telegram links), and feature status. **Read this first in any fresh conversation about this project.**
- `database/migrations/README.md` updated with migrations 005/006, and a note to verify 004's actual applied status rather than assume

---

## Update — Downloads, admin document review, upload compression, CV/mobile design pass: 2026-08-08 9:07 PM

### 1. Download button in My Documents
Each file under a document type now has **View** / **Download** / **Remove**
buttons (previously only View/Remove). Uses a new `downloadFile()` helper
(`src/lib/utils/downloadFile.ts`) that fetches the signed URL as a blob and
triggers a real save-to-disk — the plain `<a download>` attribute doesn't
reliably force a download for cross-origin URLs like Supabase's signed
URLs, most browsers just navigate to the file instead.

### 2. Admin document review (was deliberately not built before — now is)
- New `/admin/documents` page: admins can view/download any user's
  uploaded documents, grouped by user, filterable by document type and
  verified status, with a "Mark verified" toggle per entry.
- **Read-only by design**: admins get SELECT on `document_entries`,
  `document_files`, and the `documents` storage bucket — but no
  INSERT/DELETE on files or storage objects. The only thing admins can
  write is the new `verified` flag on `document_entries`. A compromised
  or careless admin account can look, but can't tamper with or delete a
  user's uploaded files.
- New columns: `document_entries.verified` (bool), `verified_at`,
  `verified_by`.
- New `admin_list_document_owners()` Postgres function (security definer,
  re-checks admin status itself) — lets the admin UI show which email
  each document entry belongs to, since there's no `profiles` table and
  admins otherwise have no way to read `auth.users` from the client.
- Small `AdminNav` tab bar (Jobs / Documents) added to both admin pages.
- SQL: `database/migrations/007_admin_document_review.sql`

### 3. Upload compression
Images (JPEG/PNG/WEBP) over 300KB are downscaled (max 2000px on the long
side) and re-encoded as JPEG at 82% quality client-side, before upload —
cuts Storage usage for the common case (phone camera photos of documents,
routinely 4000px+ and several MB). Falls back to the original file if
compression fails or wouldn't actually shrink it. See
`src/lib/utils/compressImage.ts` for the full reasoning, including why
PDFs are explicitly *not* compressed here (needs a real PDF library, not
a canvas trick — flagged as a possible follow-up, not done in this pass).

### 4. CV builder design pass
Replaced every plain-text "Remove" / "+ Add" link with real styled
buttons (danger-outline for remove, dashed for add, primary for the PDF
download) using new shared `src/components/ui/buttonStyles.ts` +
dependency-free `src/components/ui/icons.tsx` (small inline SVGs — no new
icon library). Each form section is now a bordered card instead of
floating text. The "Download PDF" button is now a sticky bottom bar so
it's reachable without scrolling back up, especially on mobile. Same
button/icon treatment applied to the document vault (Add more files, Add
another, Remove, View, Download) for visual consistency across the app.

### 5. Mobile-first fix: sign-in button was missing on mobile
Header previously had no mobile nav at all — on narrow screens the
desktop nav (including Sign in) just disappeared with nothing replacing
it. Rebuilt `Header.tsx` with a proper hamburger menu: a working
menu/drawer toggle, and the **Sign in** button now always visible
top-right on mobile regardless of menu state (not buried behind a tap).
Nav links, language switcher, and sign-out live in the drawer when open.

### Docs
- `README.md`: updated feature list (download button, admin document
  review, upload compression, mobile header), updated table list, moved
  "admin doc review" out of "Not built yet"
- `database/migrations/README.md`: added migration 007, confirmed 004–006
  as applied per your note that all SQL has been run
- This entry in `CHANGES.md`

---

## Update — Job alerts, profile nudge, CV templates, verified-source badge, lazy-loading: 2026-08-08 9:59 PM

### 1. Job alerts (in-app only — read this before assuming it emails anyone)
- New `/job-alerts` page: signed-in users save province/profession
  criteria. Matching runs client-side against the existing realtime job
  subscription (`useJobAlertMatches`) — when a new job lands that matches
  a saved alert, a toast notification appears while they're on the site.
- **This does not send email or Telegram messages when the user is
  away.** That needs a server-side piece (Supabase Edge Function on a
  cron trigger + an email provider API key) that wasn't built — the
  alerts page UI says this explicitly, and it's called out in migration
  009's SQL comments so it isn't mistaken for full delivery later.
- SQL: `database/migrations/009_job_alerts.sql`

### 2. Profile completeness nudge
- New widget on the job board (signed-in users only, dismissible per
  session): shows whether the CV builder has meaningful data and how many
  of the 9 document types have at least one file uploaded, with direct
  links to finish each.
- This needed the CV builder to actually persist somewhere to check
  against — see next item.

### 3. CV builder now persists (autosave)
- New `cv_profiles` table — one row per user, autosaved 1.2s after the
  last edit while signed in. Loads automatically on return visits, so the
  form no longer resets on refresh/navigation. Signed-out visitors can
  still use the builder for a one-off download; it just won't be saved,
  and the page says so.
- SQL: `database/migrations/008_cv_profiles.sql`

### 4. CV templates
- Added a second visual PDF template ("Modern" — lapis sidebar with
  contact/skills/languages, main column for summary/experience/education)
  alongside the existing "Classic" single-column layout. Template choice
  is part of the autosaved profile.

### 5. Employer verification badge
- Jobs from ACBAR/ReliefWeb (established NGO/UN aggregators) now show a
  green "verified source" badge on the job board; jobs.af/Wazifaha keep
  the plain source badge; manually admin-added listings get their own
  saffron badge. This is a product judgment call about which sources have
  their own institutional vetting, not a fraud claim — easy to re-tier in
  one place (`src/modules/jobs/data/sourceTrust.ts`) if it should change.

### 6. Lazy-loading the CV builder
- `CvBuilderPage` is now `React.lazy`-loaded behind a `Suspense` boundary
  in `App.tsx`. It's the single biggest dependency in the app (jsPDF +
  html2canvas). Build output now shows it as its own ~414KB chunk instead
  of being baked into the main bundle — visitors who only browse jobs no
  longer download it.

### 7. Job board loading skeleton
- Replaced the plain "Loading…" text with skeleton table rows
  (`JobTableSkeleton.tsx`) while the initial job fetch is in flight —
  gives the page its real structure immediately instead of a blank gap.

### Docs
- `README.md`: updated feature list and table list for all of the above
- `database/migrations/README.md`: added migrations 008 and 009
- This entry in `CHANGES.md`

---

## Running it locally
```
npm install
npm run dev
```
Opens at `http://localhost:5173`. `.env` has your Supabase URL + publishable key.

To test on your phone (same WiFi): `npm run dev -- --host`, then open the "Network" URL it prints.

## Database migrations
All SQL that's been run against Supabase lives in `database/migrations/`, in order, with a README describing each one. Anyone setting up a fresh environment (or you, six months from now) should be able to run those files top to bottom and end up with an identical schema.

## What's NOT included yet
- Any AI features
- Employer-facing accounts / direct posting
- Payments/credits

## Known items
- Large bundle size warning on build (jsPDF pulls in html2canvas) — not a problem at this scale, worth revisiting later with code-splitting if it matters.
