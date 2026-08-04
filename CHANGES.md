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
