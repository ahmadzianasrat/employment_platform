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

## Update — Verified badges everywhere, document merging, 4 CV templates + live preview, navbar color, admin add-job, blog: 2026-08-09 5:15 PM

### 1. Verification badge on all scraped sources
`sourceTrust.ts` now marks ACBAR, ReliefWeb, jobs.af, and Wazifaha as
"verified" — all four are the platform's own vetted scraper sources.
Manually admin-added listings keep their own distinct badge.

### 2. Removed the logo between position and organization
Dropped the `OrgAvatar` column from the job board table — was sitting as
a lone icon between the title and employer name for no real reason.

### 3. Loading spinners everywhere
New `Spinner`/`LoadingBlock` component
(`src/components/ui/Spinner.tsx`), swapped in for the plain "Loading…"
text on Job Detail, Saved Jobs, Job Alerts, Admin Jobs, Admin Documents,
and the Documents vault.

### 4. Upload a single "all my documents" PDF
New `AllInOneUpload.tsx` section at the top of My Documents — if a user
already has everything scanned into one PDF, they can upload that
directly instead of splitting it across the per-type slots. Stored as its
own `document_entries` row (`document_type = 'all_in_one'`), single-file,
PDF-only, replace-on-reupload. Counts as "documents complete" on its own
for the profile-completeness widget.

### 5. Merge & download everything
New button on the Documents page (`MergeAndDownloadButton.tsx` +
`mergeDocuments.ts`, using `pdf-lib`) that combines every uploaded
document — across all types, excluding the all-in-one PDF above — into a
single downloadable PDF. PDFs are merged page-by-page; images become
their own page (WEBP auto-converted to PNG first, since pdf-lib can only
embed JPEG/PNG). Files that fail to merge are skipped and reported rather
than aborting the whole thing. Because `pdf-lib` is a heavy dependency,
**the Documents page is now lazy-loaded** (`React.lazy` in `App.tsx`) —
without this the main bundle grew by ~350KB gzipped for every visitor,
including ones who never touch the document vault.

### 6. Admin jobs page: layout fix + manual "Add Job"
- Fixed the card layout — action buttons were overflowing/wrapping badly
  on narrower widths; now `flex-wrap` with proper stacking on small
  screens, consistent with the shared button styles used elsewhere.
- Every job card now has a status-colored left border (not just duplicate
  groups) — green/gray/red for active/hidden/expired — so the list has
  visual structure even outside "show duplicates" view.
- New "Add job" button opens a full manual-entry form → `createManualJob`
  → inserts with `source = 'manual'`. Needed a new RLS policy since
  admins previously had SELECT/UPDATE/DELETE but no INSERT on `jobs` —
  see migration 010.

### 7. CV templates: 2 more + a live preview
- Added "Minimal" (centered header, thin rules, understated) and
  "Compact" (dense two-column, no colored block, fits more per page)
  alongside Classic and Modern — four templates total, `CvTemplate` type
  updated everywhere.
- New `CvPreview.tsx`: a scaled-down live HTML approximation of whichever
  template is selected, updating as the user types, shown next to the
  form. It's a close visual mirror of each PDF template, not a literal
  pixel-perfect render of the PDF itself — noted in the UI ("actual PDF
  may wrap slightly differently").
- Builder layout widened to a two-column grid (form + sticky preview) on
  larger screens; template picker is now a 4-up grid.

### 8. Footer contact email
Was still the placeholder `contact@yourdomain.com` — now
`support@hamqar.com`.

### 9. Navbar background
Replaced the diagonal lapis gradient with a solid `--color-ink`
background — cleaner, more premium-feeling, still on-brand (saffron
accent border/active-state dots unchanged).

### 10. Blog section
- New `blog_posts` table (migration 011): plain-text content with
  blank-line paragraph breaks — deliberately not a rich-text/WYSIWYG
  editor, both to keep this a reasonably-scoped feature and to avoid
  storing/rendering arbitrary HTML.
- Public `/blog` (list) and `/blog/:slug` (detail) pages. Detail page has
  social sharing: native Web Share API where the browser supports it,
  plus explicit Facebook/X/WhatsApp buttons and a copy-link button.
- Admin CRUD at `/admin/blog` (new tab in `AdminNav`): create/edit/delete
  posts, draft vs. published toggle, auto-slug-from-title (editable),
  optional cover image URL and author byline.
- RLS: public can read published posts only; admins get full CRUD
  (mirrors the `admin_users` pattern used for jobs/documents).

### Docs
- `README.md`: updated feature list, table list for all of the above
- `database/migrations/README.md`: added migrations 010 and 011
- This entry in `CHANGES.md`

---

## Update — Real branding, hero/navbar/footer fixes, cover letter builder, PDF compression: 2026-08-09 10:54 PM

### 1–3. Real logo, app name, and favicon
- Replaced the placeholder geometric `BrandMark` SVG with your actual
  logo. Cropped the icon out of the uploaded `logo__2_.png` (isolating
  just the circular handshake/mountain mark from the full lockup) and
  made the background transparent via chroma-keying, so it sits cleanly
  on the dark navbar. Source: `src/assets/hamqar-icon.png` (33KB,
  resized from the original — see "Branding" section in `README.md` for
  how to re-derive it if the logo changes).
- `appName` string now reads "همکار" in all three languages (was
  "Employment Platform" / translated equivalents). `<title>` updated to
  "Hamqar — همکار".
- Favicon replaced with your uploaded `favicon.png`, generated as a
  proper set (16px, 32px, 180px apple-touch-icon, 512px) and wired into
  `index.html`.

### 4. Hero section background
The "Find your next role" band was a flat dark-blue block
(`--color-lapis-dark`) sitting directly under the header, which is now
also dark (`--color-ink`) — two different dark blues stacked created an
ugly seam. Replaced with a clean paper/cream background, dark text, and a
small saffron accent bar above the heading.

### 5. Blog delete confirmation
`AdminBlogPage`'s delete button now confirms first — matches the same
`confirm()` pattern already used for job deletion in `AdminJobsPage`.

### 6. Cover Letter Builder (new)
- New `/cover-letter` page: guided fields (your details, recipient,
  opening/motivation/closing paragraphs, sign-off) rather than one blank
  textarea — meant to help people who haven't written a formal cover
  letter before structure one properly.
- Two templates (Formal — traditional business-letter layout; Modern —
  colored header band) with a live scaled preview, same pattern as the
  CV builder.
- Autosaves to Supabase per signed-in user (`cover_letter_profiles`
  table, migration 012), mirroring `cv_profiles`.
- "Fill in my contact details from my CV" button — pulls name/email/
  phone/address from the CV profile if one exists, so users don't retype
  the same info twice.
- Lazy-loaded (`React.lazy` in `App.tsx`) for the same bundle-size reason
  as the CV builder — jsPDF is shared between both via a common chunk
  rather than duplicated.

### 7. Navbar alignment
Root cause: the desktop nav collapsed to mobile at the `sm` breakpoint
(640px), but the nav had grown to 6+ links (Jobs, CV Builder, Cover
Letter, Blog, Saved, Documents, Alerts, Admin) — nowhere near enough room
at that width, causing crowding/wrapping. Switched the desktop/mobile
toggle to the `lg` breakpoint (1024px) throughout `Header.tsx` and
tightened nav item spacing slightly.

### 8. Telegram links in the footer
Added Pashto (`t.me/pashtoJobs`) and Dari (`t.me/dariJobs`) channel links
to the footer with a Telegram icon, trilingual labels.

### 9. PDF compression on upload
New `compressPdf.ts`, using `pdf-lib`'s object-stream save option, wired
into every document upload path (per-type slots, bulk upload, and the
all-in-one PDF). Being upfront about its actual effect: this compresses
the PDF's internal structure (redundant objects, cross-reference streams,
metadata) — it does NOT re-encode embedded images at lower quality, so a
scanned ID photo saved as a PDF won't shrink much beyond what its
embedded JPEG already is. Real image-in-PDF recompression would need
decoding and re-encoding each embedded image stream, which is a
meaningfully bigger feature than "compress PDFs too" implied — flagged as
a possible follow-up in `README.md`.

Also fixed a bundle-size regression this introduced: `compressPdf.ts`
(and therefore `pdf-lib`) was being pulled into the *main* bundle via
`documentsApi.ts → profileCompletionApi.ts → ProfileCompletionWidget`,
which sits on the job board and isn't lazy-loaded. Switched the PDF-
compression import to a dynamic `import()` so `pdf-lib` only loads when
someone's actually uploading a file, not on every page load.

### Docs
- `README.md`: renamed header from "Employment Platform" to "Hamqar
  (همکار)", updated feature list (cover letter builder, PDF compression
  caveat), new "Branding" section documenting the logo/favicon source
  files, updated table list
- `database/migrations/README.md`: added migration 012
- This entry in `CHANGES.md`

---

## Update — Telegram link fix, logo revert, full translation pass, external job links, job board redesign: 2026-08-10

### 1. Telegram links fixed for real this time
Root cause: `src/lib/config/channelLinks.ts` still had the original
placeholder URLs (`t.me/your_pashto_channel` / `t.me/your_dari_channel`)
— I'd fixed the footer's own copy of these URLs in an earlier pass but
missed that the job board pulled from a different, still-unfixed source.
Fixed the actual config file this time, and refactored the footer to
import from it instead of hardcoding its own copy, so the two can't drift
apart again.

### 2. Logo/favicon reverted to your actual artwork
Went back to using your uploaded `favicon.png` directly as the header
logo (it has its own white rounded-card background, so it reads cleanly
against the dark navbar — the previous cropped/transparent version didn't
have that contrast anchor). Removed the separate "همکار" text label next
to it in the header since the logo image already contains the wordmark.

### 3. Full translation pass
Added `jobAlerts`, `profile`, `blog`, and `coverLetter` sections to
`strings.ts` and wired them through every public-facing screen that was
still hardcoded English: Header nav labels, Job Alerts page, job-alert
toast, profile-completeness widget, Blog list/detail pages, the entire
Cover Letter Builder, and the job board's pagination/profession-filter/
sample-data-notice copy. Left the CV/cover-letter **PDF section headers**
("SUMMARY", "EXPERIENCE", etc.) in English deliberately — that's actual
document content following a widely-recognized CV format convention, not
app chrome, and localizing it would make the live preview mismatch the
generated PDF. Admin screens remain English-only per the existing
convention (noted at the top of `strings.ts`).

### 4. "View details" now goes to the original source
New `src/modules/jobs/lib/jobLink.ts`: scraped listings (anything except
`source === 'manual'`) now link straight to `job.source_url` in a new
tab — that's the actual source of truth for deadlines and application
instructions, not our re-parsed copy. Manually-added listings still open
our own detail page, since there's no external source to send them to.
Applied consistently across the job board, job cards (Saved Jobs), and
job-alert toast notifications.

### 5–6. Job board redesign
- Replaced the dense, horizontally-scrolling table with a responsive
  card grid (reusing an enhanced `JobCard`, now shared with Saved Jobs
  for visual consistency site-wide) — 1 column on mobile, up to 3 on
  desktop. Cards show a "New" badge for recent postings, verified-source
  badge, profession/gender chips, and the deadline in red.
- Removed the two Telegram icon buttons that were repeated on *every
  single row* — consolidated into one promotional banner in the
  redesigned hero instead.
- Hero section: added a soft two-tone radial gradient background, a live
  listings-count stat chip, an "Updated daily" chip, and the
  consolidated Telegram channel CTA.

### 7. Stopped naming specific source organizations in generic copy
The hero subtitle and the "About this site" blurb both named ACBAR/
ReliefWeb/jobs.af/Wazifaha explicitly — reworded to "trusted job boards
across Afghanistan" / "trusted public sources" in all three languages.
Per-listing source attribution (the badge on each individual job) is
unaffected — that's factual per-job data, not generic site copy.

### Docs
- This entry in `CHANGES.md`
- No new migrations this round — everything above is application code.

---

## Update — Launch prep: SEO, sitemap, Open Graph, analytics, legal pages: 2026-08-11

Following up on "part 3" of the go-live checklist from the previous
session (parts 1–2, real job data + admin access, were confirmed done
separately).

### robots.txt + sitemap.xml
- `public/robots.txt` — allows all crawlers, points to the sitemap.
- `scripts/generate-sitemap.mjs`, wired in as an npm `prebuild` step (runs
  automatically before every `npm run build`, including in the GitHub
  Actions deploy). Static pages (home, CV builder, cover letter, blog
  index) are always included. Blog posts and manually-added job listings
  are fetched live from Supabase's REST API at build time and included
  too — those are pages we actually host, unlike most job listings, which
  link straight to their original source (see `jobLink.ts` from the
  previous session) and so aren't the canonical page for that content.
  Falls back to static-pages-only with a console warning (never fails the
  build) if Supabase credentials aren't in the build environment — e.g. a
  local dev build with no `.env`.
  **Caveat**: this script was written and syntax-tested in a sandbox with
  no network access to Supabase, so the live-fetch path has not actually
  run yet — check `hamqar.com/sitemap.xml` after the next deploy to
  confirm blog/job entries show up correctly, per the go-live checklist
  in `DEPLOYMENT.md`.

### Open Graph / social preview
- `index.html`: meta description, canonical tag, full Open Graph tag set,
  and a Twitter/X card — so pasting a hamqar.com link into Telegram,
  Facebook, or WhatsApp shows a real preview instead of a blank card.
- New `public/og-image.png` (1200×630), generated from your logo — dark
  navy background, soft lapis/saffron gradient accents, the logo, and a
  trilingual tagline.

### Per-route canonical URLs
Because this is a client-side-routed SPA, every page serves the same
`index.html` — the static canonical tag in it is only ever correct for
`/`. Left as-is, every other page (a blog post, a job detail page) would
tell search engines "the real version of this is the homepage," which
actively prevents those pages from being indexed on their own. New
`src/lib/seo/head.ts` updates the canonical tag on every route change.

### Optional Google Analytics
New `src/lib/analytics/ga.ts` — fully inert (no script injected, no
requests made) unless `VITE_GA_MEASUREMENT_ID` is set. I can't create a
GA account on your behalf; `DEPLOYMENT.md` has the exact steps to wire
one up (~5 minutes) once you have a Measurement ID. Fires a `page_view`
on every client-side route change, since GA's own automatic tracking only
sees the very first load in an SPA.

### Privacy Policy + Terms of Use
New `/privacy` and `/terms` pages, linked from the footer. These are
**starting drafts, not legal advice** — worth a real review given the
site collects ID cards, passports, and other identity documents. Kept
**English-only deliberately**, unlike the rest of the app's UI copy:
legal text carries real liability risk if a casual (non-professional)
translation ends up meaning something subtly different in Pashto or Dari.
That's a scope line I drew on purpose, not an oversight — flagged in both
files' top comments and in `README.md`'s "Not built yet."

### DEPLOYMENT.md
Added a "Go-live checklist" section covering all of the above plus the
things I can't verify myself from here (real job data in the `jobs`
table, migrations applied, an `admin_users` row for you, and what to
check right after the next deploy).

---

## Update — Sitemap diagnostics: 2026-08-11 10:40 AM

You reported `sitemap.xml` only showing the 4 static pages after
deploying the launch-prep changes, with the rest of the go-live checklist
confirmed done (real job data present, migrations applied, admin access
working).

The old script couldn't distinguish three very different situations that
all looked identical from the outside ("only 4 URLs"): missing
credentials, a failed request, or credentials + request both fine but the
tables genuinely having 0 matching rows. That last one is actually the
most likely explanation here — the sitemap only includes **published**
blog posts and **manually-added** (`source = 'manual'`) jobs, not
scraped ones (scraped jobs link externally per `jobLink.ts` from an
earlier session, so they're not our canonical page for that content, and
they're already covered via the homepage). If no blog post has been
published yet and no job has been added through the admin "Add Job" form
yet, 4 static URLs is the *correct* output, not a bug.

Rewrote `scripts/generate-sitemap.mjs` to log unambiguously which of the
three happened, per table, in the GitHub Actions build log:
- `SKIPPED — ... not set` — credentials genuinely missing
- `FETCH FAILED (reason) — detail` — credentials present, request itself
  failed, with the actual error message
- `fetched OK, N row(s)` — worked correctly; N=0 is a valid result, not
  an error

Tested both the no-credentials and unreachable-host paths locally to
confirm neither crashes the build (a bad Supabase URL should never take
down the whole deploy over the sitemap). Still haven't been able to test
the success path against your actual project — I have no network access
to Supabase from this sandbox — so the next deploy's Actions log is the
first real signal either way.

`DEPLOYMENT.md`'s go-live checklist updated with these three log
signatures so this is diagnosable in one look going forward.

---

## Update — Feature-usage analytics, expired jobs hidden, manual job branding, logo size, OG image: 2026-08-11 8:36 PM

Confirmed from the previous session: the sitemap situation was expected
behavior, not a bug — `[sitemap]` logs showed `fetched OK, 0 row(s)` for
both blog posts and manual jobs, meaning the fetch works correctly and
there's simply no published content of either kind yet.

### 1. Feature-usage analytics (beyond page views)
Plain GA page-view tracking can't answer "is anyone actually using the CV
builder" — someone can visit `/cv-builder` and never download anything.
Added `trackEvent()` to `src/lib/analytics/ga.ts` with a typed event
taxonomy, wired into the actual completion of each feature (not just
navigating to its page):
- `cv_pdf_downloaded` (with template)
- `cover_letter_pdf_downloaded` (with template)
- `document_uploaded` (with document type) — fires from the per-type
  section, bulk upload, and covers all upload paths
- `all_in_one_document_uploaded`
- `documents_merged_downloaded` (with file count)
- `job_alert_created`
- `job_saved`
- `sign_up_completed` / `sign_in_completed`

Same "inert until configured" behavior as page-view tracking — no-ops
silently if `VITE_GA_MEASUREMENT_ID` isn't set. Once GA has a day or two
of data, these show up under Reports → Engagement → Events.

### 2. Manual jobs now branded as "Hamqar.com"
Admin "Add Job" listings previously defaulted `source_label` to
`'Manual'`, which read as an internal/administrative label rather than a
proper source. Changed the default to `'Hamqar.com'` so manually-added
listings get the same kind of source badge treatment as scraped ones.
Migration 014 backfills any rows already created with the old default.

### 3. Expired jobs hidden from public listings
Nothing previously transitioned a job to `'expired'` status once its
`expires_on` date passed — it just silently stayed `'active'` and kept
showing publicly forever until an admin manually hid it. Migration 013:
- **Primary fix**: the public RLS policy on `jobs` now excludes anything
  past its `expires_on` date regardless of status. This is the actual
  fix and doesn't depend on anything else succeeding — applies uniformly
  to the job board, the sitemap generator, anywhere querying with the
  anon key.
- **Secondary, best-effort**: a daily `pg_cron` job flips status to
  `'expired'` for admin-panel accuracy, wrapped in exception handling —
  skipped harmlessly if `pg_cron` isn't available on your plan or needs
  dashboard-enabling first. The primary fix above doesn't depend on this
  succeeding.

### 4. Logo enlarged
Header logo `h-10 w-10` → `h-14 w-14`.

### 5. Open Graph image replaced
Swapped in your uploaded image at `public/og-image.png` (1200×630,
already the right dimensions). **Two things flagged, not silently
shipped**:
- The image has a visible watermark (repeated "hamqar.com" text and an
  oversized translucent logo) that looks like unfinished output from a
  non-final AI image tool — worth a final/clean version before wide use.
- It displays UN, WHO, UNHCR, NRC, DRC, MSF, IOM, and Save the Children
  logos prominently. Several of these (the UN emblem especially) have
  legally protected usage restrictions, and displaying them like this on
  your primary public-facing share image could read as implying an
  affiliation or endorsement, and risks a takedown request. Used as
  instructed, but flagging clearly rather than staying quiet about it.

### DEPLOYMENT.md
Go-live checklist updated — most items checked off per your confirmation,
with two new action items called out explicitly rather than blindly
checked: migrations 013/014 need running (they didn't exist when the
rest of the checklist was confirmed), and the Open Graph preview is worth
re-checking after the next deploy since the image itself just changed.

---

## Update — Pivot: job board → CV/cover-letter + paid application service: 2026-08-13

Per your numbered request list, this session removed the job board
entirely and rebuilt the app around its actual core purpose: free CV and
cover letter tools for everyone, plus a paid service where you prepare a
customized, ready-to-submit application package for one specific job.

### Removed
- **Entire jobs module** (`src/modules/jobs/`): job board, job detail
  page, saved jobs, job alerts — all deleted, along with the profile-
  completeness widget that only lived on the job board.
- Admin Jobs page, `adminJobsApi.ts`, duplicate-detection helper
  (`findDuplicates.ts`) — deleted. The `/admin` route is now Orders (see
  below), not Jobs.
- All job-board-related `nav`/`jobBoard`/`jobAlerts`/`profile` i18n
  strings.
- Job-board references in the sitemap generator (dropped the per-job
  `/jobs/:id` entries), `index.html` meta/OG tags, `robots.txt` context,
  and the SEO canonical-path comment.
- **Not removed**: the underlying Supabase `jobs`/`saved_jobs`/
  `job_alerts` tables, and the separate PHP scraper. Both are now dormant
  (nothing in this app reads or writes them) but left in place — dropping
  them is optional cleanup for you, not something Claude should do
  unilaterally to data outside this repo. See "Your part" in `README.md`.

### Added — Home page (`/`, request #1 and #5)
New landing page (`src/modules/home/pages/HomePage.tsx`) replacing the
job board as the homepage: hero, a 3-step "how it works" (build for free
→ or let us do it → get one ready-to-send PDF), a features grid (CV
Builder, Cover Letter Builder, Document Vault, Paid Application Package),
a pricing teaser, and a 6-question **FAQ section** (request #5) built on a
new reusable `FaqAccordion` component (`src/components/ui/FaqAccordion.tsx`).

### Added — Pricing page (`/pricing`, request #2)
`src/modules/pricing/pages/PricingPage.tsx` — two tier cards: **80 AFN /
1 job application** and **200 AFN / 3 job applications**, each listing
what's included (customized CV, customized cover/motivation letter, ID
card + education + experience attached, one final PDF, submission
instructions), a payment-methods callout (easy-load / HesabPay, request
#4), and a "Request this package" button into the order form.

### Added — Guide / education page (`/guide`, request #3)
`src/modules/guide/pages/GuidePage.tsx` — a single long page with a
jump-link table of contents, covering exactly what you asked for: using
the free CV/cover-letter builders, uploading documents, creating a Gmail
account and keeping credentials safe, sending attachments by Gmail
without them getting stuck in the queue, how to request paid help, how to
pay (easy-load and HesabPay, with what to send us and when), finding jobs
via the two Telegram channels, and "send us any job link or screenshot
from any platform — we handle the rest."

### Added — Order / paid-service request form (`/order`, request #6)
`src/modules/orders/` (new module): `OrderPage.tsx` is a sign-in-required
form covering:
- Tier selection (1 or 3 applications)
- Target job: link, free-text note, and/or screenshot upload (at least
  one required)
- Contact name + phone
- Payment method (easy-load / HesabPay) with **method-specific fields**
  exactly as you specified: HesabPay asks which number they paid from,
  who owns that number, and when; easy-load asks the agent/own number,
  when, and an optional transaction number — plus a required payment
  screenshot for either method
- `serviceRequestsApi.ts` creates the row then uploads both possible
  screenshots into the new private `service-requests` storage bucket,
  reusing the same image-compression path as the document vault

`AuthPage.tsx` was updated to accept a `redirectTo` in router state, so a
signed-out visitor who hits "Apply for the paid service" and gets bounced
to sign-in lands back on `/order` afterward instead of the homepage.

### Added — Admin Orders page (`/admin`, replaces `/admin/jobs`)
`adminOrdersApi.ts` + `AdminOrdersPage.tsx` — lists every request across
all users (owner email resolved via a new `admin_list_service_request_owners()`
function, same pattern as the document-owners one from migration 007),
signed-URL viewing of the job screenshot and payment-proof screenshot,
search/filter by email/name/phone/job link, and one-click status changes
(new → in progress → delivered → cancelled).

### Added — SQL migration 015 (`service_requests`)
New `service_requests` table + private `service-requests` storage
bucket, following the exact same RLS shape as `document_entries`/
`documents` (migrations 005–007): a customer sees/creates only their own
rows, admins see/update every row. **Not yet applied — this is required
before `/order` or the admin Orders page will work; see `database/migrations/README.md`.**

### Updated for the pivot (request #7 — "all parts should be always translated")
- `strings.ts`: added fully trilingual (English/Pashto/Dari) copy for the
  new `home`, `pricing`, `guide`, `order`, and `faq` sections — this is
  the largest single addition to the i18n file so far. As with the
  existing legal-page caveat, this is Claude's best-effort Pashto/Dari,
  not a native speaker's professional pass — worth a careful review
  given customers will be making real payments based on the Guide page
  specifically. See "Your part" in `README.md`.
- `Header.tsx` nav rebuilt: Home, CV Builder, Cover Letter, Pricing,
  Guide, Blog, My Documents (signed-in only), a prominent "Apply for the
  paid service" button, Admin (if applicable) — job/saved/alerts links
  removed.
- `Footer.tsx` "about" copy rewritten to describe the CV/cover-letter +
  paid-service model instead of the job-aggregation model.
- `/privacy` and `/terms`: updated (still English-only, still not legal
  advice — see the existing note at the top of each file) to cover what
  data the paid-service request form collects, how admins use it, and
  added a "Paid application service" terms section covering payment and
  refund expectations.
- `scripts/generate-sitemap.mjs`: static-page list now includes
  `/pricing` and `/guide`; dropped the per-job Supabase fetch.

### Explaining your part (request #9 and #10)
Rather than repeat it here, the full list of things that need a real
decision or value from you — running migration 015, the still-placeholder
Telegram links, where the actual HesabPay/easy-load numbers get shown to
customers, reviewing the new Pashto/Dari copy, and the fact that
fulfillment (actually writing each customized CV/cover letter and sending
the final PDF back) is still a manual step you do per order — is now in
**README.md, "Your part (things only you can fill in)"**. Flagging it
there instead of only in this changelog so it stays visible to a fresh
Claude session or anyone else picking this up later.

### Verified
- `tsc -b` — clean, no type errors.
- `vite build` — succeeds; output includes `OrderPage` as its own
  lazy-loaded chunk (9.91 kB / 2.62 kB gzipped), same pattern as the CV
  builder / cover letter builder / documents page chunks.

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
