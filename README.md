# Hamqar (همکار)

A trilingual (English/Pashto/Dari) job board for Afghan job seekers. Aggregates
listings from ACBAR, ReliefWeb, jobs.af, and Wazifaha via a separate PHP
scraper, plus a CV builder, cover letter builder, document vault, saved jobs,
a blog, and an admin review panel — all backed by Supabase.

**If you're picking this project up in a fresh chat with no other context,
read this file top to bottom first**, then `CHANGES.md` for the detailed
history, then `DEPLOYMENT.md` for the hosting setup.

## Live site
`https://hamqar.com` — hosted on GitHub Pages, domain + email through Hostinger.

## Stack
- **Frontend**: React + TypeScript + Vite, Tailwind v4, React Router
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime), accessed
  directly from the frontend via `@supabase/supabase-js` — no custom backend server
- **Job scraper**: separate PHP/Laravel app on Hostinger shared hosting
  (`domains/ahmadzianasrat.com/public_html/ngo-jobs-publisher`), scrapes
  ACBAR/ReliefWeb/Wazifaha/jobs.af, posts to Telegram/Facebook, and pushes
  each newly-discovered vacancy to the Supabase `jobs` table
- **Hosting**: GitHub Pages (frontend) + Hostinger (domain registration + email only)

## Branding
Logo/favicon source files: `public/logo-full.png` (full lockup with
`hamqar.com` tagline, currently unused in the app but kept for reference/
future use — e.g. a larger "About" page placement) and the derived
favicon set (`public/favicon-16.png`, `favicon-32.png`,
`apple-touch-icon.png`, `favicon-512.png`), all generated from the same
source app-icon artwork. The header logo (`BrandMark.tsx`, via
`src/assets/hamqar-icon.png`) uses that same app-icon artwork directly —
it already has its own white rounded-card background, so it reads
cleanly against the dark navbar without needing a transparent cutout. If
the logo changes, regenerate both the favicon set and
`src/assets/hamqar-icon.png` from the new source image.

## Repo
`https://github.com/ahmadzianasrat/employment_platform` — owned by the
`ahmadzianasrat` GitHub account. Working folder on the developer's machine
is `employment-platform-v2` (the original `employment-platform` folder had
a git history mixup — see "Known gotchas" below — and should be deleted or
ignored).

## Folder structure
```
src/
  components/layout/     Header, Footer, LanguageSwitcher, BrandMark
  lib/
    auth/                Supabase Auth context
    i18n/                Trilingual strings (STRINGS object) + language context
    supabase/             Supabase client (publishable key only)
    config/               Placeholder links (Telegram channels, etc.)
  modules/
    jobs/                Job board, job detail, saved jobs, realtime hooks, provinces filter
    cv/                  CV builder + PDF export
    auth/                Sign in / sign up page
    admin/               Admin job review panel, duplicate detection
    documents/           Document vault (ID card, diplomas, work experience, etc.)
database/
  migrations/            All SQL run against Supabase, in order — see its own README
.github/workflows/       GitHub Actions deploy workflow
public/
  .htaccess              Unused (was for a Hostinger-hosting path we moved away from) — harmless, left in place
  404.html + index.html  GitHub Pages SPA routing workaround (see below)
  CNAME                  Custom domain for GitHub Pages — must stay in sync with actual domain
```

## Environment variables
`.env` (gitignored, never committed):
```
VITE_SUPABASE_URL=https://vyltyflejyjhckxzjwjt.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable key>
```
Same two values are also stored as **GitHub repo secrets** (Settings →
Secrets and variables → Actions) since the Actions build needs them at
build time and can't read the local `.env`.

## Database
All schema changes are tracked as numbered SQL files in
`database/migrations/`, with their own README tracking which have been
applied. **Always check that README before assuming the live Supabase
database matches this codebase** — migrations are applied manually via
Supabase's SQL Editor, not automatically.

Current tables: `jobs`, `saved_jobs`, `admin_users`, `document_entries`
(now with `verified`/`verified_at`/`verified_by`), `document_files`,
`cv_profiles`, `job_alerts`, `blog_posts`, `cover_letter_profiles`.
Storage buckets: `documents` (private to the uploading user, plus
read-only access for admins as of migration 007).

## Deployment
See `DEPLOYMENT.md` for the full walkthrough. Short version:
- Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically
- Domain (`hamqar.com`) and email (`support@hamqar.com`, `info@hamqar.com`)
  are managed at Hostinger — DNS is split: MX records → Hostinger (email),
  A/CNAME records → GitHub Pages (site). These are independent and don't conflict.

## Known gotchas (read before debugging something that looks broken)

1. **GitHub Pages "Source" setting must be "GitHub Actions", not "Deploy
   from a branch."** It reverted to "branch" mode at least once already,
   which silently serves the raw unbuilt repo (you'll see
   `<script src="/src/main.tsx">` in page source instead of a built
   `/assets/index-[hash].js` — that's the tell). Check
   `Settings → Pages → Source` if the live site ever looks broken/blank
   after a deploy that showed green in Actions.

2. **Windows zip extraction silently drops dotfiles.** `.gitignore`,
   `.github/`, `public/.htaccess`, `public/.nojekyll` have all gone
   missing this way at least once. Always extract with **7-Zip**, never
   Windows' built-in "Extract All," and verify with
   `Get-ChildItem -Force` after extracting.

3. **Claude (in chat) cannot push to the GitHub repo directly.** Any
   code changes from a Claude conversation land in Claude's own sandbox
   copy — they have to be delivered as a zip and manually
   extracted/committed/pushed by the developer. "Claude already pushed
   it" is never true; always re-verify.

4. **Vite's `base` config must match where the site is actually served
   from.** Currently `base: '/'` in `vite.config.ts` because the custom
   domain serves from root. If this project ever moves to a GitHub
   Pages *project* URL without a custom domain (e.g.
   `username.github.io/repo-name/`), this needs to go back to
   `/repo-name/` — see the git history around the "Fix asset paths"
   commit for the full reasoning.

5. **GitHub Pages has no server-side rewrite rules** (unlike Apache's
   `.htaccess`, which is still in this repo but unused). Client-side
   routes like `/jobs/some-id` rely on the `public/404.html` +
   `index.html` redirect trick — don't remove these thinking they're
   dead code.

6. **`profession` and `gender`** on jobs are populated by the PHP
   scraper's AI (Groq) extraction step at *publish* time, not scrape
   time — see `CHANGES.md` for the full explanation of that timing
   trade-off. A job can exist in Supabase for a while with these fields
   null before they populate, if the publish queue is backlogged.

7. **Organization logos are deliberately NOT fetched from the web.**
   The app uses deterministic colored initials instead — see
   `CHANGES.md` ("Pagination, truncation, org avatars") for why
   (Clearbit's free logo API is dead, replacements need a domain we
   don't have, and Claude's sandbox can't reach arbitrary image hosts
   anyway). If real logos are wanted later, the intended path is
   admin-uploaded logos in Supabase Storage, not scraping.

8. **Telegram channel links are placeholders.** `src/lib/config/channelLinks.ts`
   has `TELEGRAM_PASHTO_URL` / `TELEGRAM_DARI_URL` set to fake URLs —
   must be updated before real users click them.

## Features implemented so far
- Trilingual job board (table view): search, profession filter,
  province-based location filter (substring match, handles multi-province
  listings), pagination (20/page), realtime updates (no refresh needed)
- Job detail page
- CV builder with PDF export (personal info, education, experience,
  skills, languages with native-language highlighting, address), **four**
  visual templates (Classic, Modern sidebar, Minimal centered, Compact
  two-column) with a **live scaled preview** next to the form so users can
  see the layout before downloading, autosaved to Supabase per signed-in
  user (`cv_profiles` table) so it survives refreshes and works across
  devices — signed-out visitors can still use the builder, it just
  doesn't persist
- Auth (email/password via Supabase Auth), saved/bookmarked jobs
- Document vault: upload ID card, passport, driving license, TIN, school
  diploma (single-entry types) and university diplomas, work experience,
  employment contracts, references (repeatable — multiple entries
  allowed), bulk upload with per-file type assignment, PDF/JPG/PNG/WEBP,
  15MB per file limit, private per-user storage. Oversized photos
  (JPEG/PNG/WEBP over 300KB) are downscaled and re-encoded client-side
  before upload to cut Storage usage (`src/lib/utils/compressImage.ts`),
  and PDFs are re-saved with object-stream compression via `pdf-lib`
  (`src/lib/utils/compressPdf.ts`) — this shrinks text/metadata-heavy
  PDFs noticeably but won't meaningfully shrink a scanned photo saved as
  a PDF, since that needs re-encoding the embedded image itself, not just
  the PDF structure. Users can view *and download* each
  uploaded file from My Documents. Also supports uploading a **single
  combined PDF** if the user already has everything scanned into one file
  (`AllInOneUpload.tsx`, separate from the per-type slots), and a
  **merge & download** button that combines every per-type document into
  one downloadable PDF (via `pdf-lib`, images auto-converted to
  embeddable formats) — this page is lazy-loaded since `pdf-lib` is heavy.
- Admin panel: view/edit/hide/delete jobs, cross-source duplicate
  detection (flags candidates, never auto-merges), pagination (20/page),
  and a manual "Add Job" form (source = `manual`, requires migration 010
  for the admin INSERT policy). Also includes **read-only document
  review** (`/admin/documents`): admins can view/download any user's
  uploaded documents and mark entries as "verified", but cannot edit,
  delete, or upload on a user's behalf — see migration 007. And an
  **admin blog CRUD page** (`/admin/blog`) — see the Blog section below.
- Blog (`/blog`, `/blog/:slug`): admin-authored posts (plain text with
  blank-line paragraph breaks — no rich-text editor, deliberately, to
  keep scope sane and avoid storing/rendering arbitrary HTML), draft vs.
  published state, optional cover image URL, social sharing (native Web
  Share API where available, plus explicit Facebook/X/WhatsApp/copy-link
  buttons) on each post. See migration 011.
- Cover Letter Builder (`/cover-letter`): same pattern as the CV builder —
  autosaved to Supabase (`cover_letter_profiles`, migration 012), two
  templates (Formal / Modern) with a live preview, optional "fill in my
  contact details from my CV" button. Lazy-loaded, same bundle-size
  reasoning as the CV builder.
- PHP scraper → Supabase sync (one-way push at discovery, AI fields
  populate at publish time)
- Mobile-first responsive header with a hamburger menu — sign-in is
  always reachable on small screens even when signed out
- Job alerts: signed-in users can save province/profession criteria
  (`/job-alerts`) and get an **in-app toast** when a matching job appears
  while they have the site open. This is NOT email/Telegram delivery for
  when they're away — that needs a server-side cron (Supabase Edge
  Function) + an email provider, and hasn't been built. See migration
  009's comment for the full reasoning.
- Profile completeness nudge on the job board: shows signed-in users
  whether their CV and document vault are filled in, with direct links to
  finish, dismissible per session
- Employer verification badge: ACBAR/ReliefWeb listings marked "verified
  source" (established NGO/UN aggregators), manual admin-added listings
  marked separately — see `src/modules/jobs/data/sourceTrust.ts` for the
  reasoning and how to adjust it
- CV builder route is lazy-loaded (`React.lazy`) so the jsPDF/html2canvas
  bundle (the largest dependency in the app) only loads for people who
  actually open the CV builder
- Job board shows skeleton loading rows instead of a plain "Loading…" text
  while the initial job fetch is in flight
- SEO/launch prep: `robots.txt`, a build-time-generated `sitemap.xml`
  (static pages always included; blog posts and manually-added jobs
  fetched live from Supabase during the build — see
  `scripts/generate-sitemap.mjs`), Open Graph/Twitter card meta tags with
  a real preview image (`public/og-image.png`) so shared links look right
  on Telegram/Facebook/WhatsApp, a per-route canonical URL (SPAs default
  to one static canonical for every page otherwise — see
  `src/lib/seo/head.ts`), optional Google Analytics (off by default, see
  `src/lib/analytics/ga.ts` and `DEPLOYMENT.md`), and starting-draft
  `/privacy` and `/terms` pages
- Full trilingual coverage: every public-facing screen added since the
  original build now goes through `strings.ts` — admin screens remain
  English-only by the existing convention

## Not built yet
- AI-powered CV tailoring / cover letter generation
- Payments/credits system
- Employer-facing accounts (direct job posting)
- Real PDF compression that re-encodes embedded images at lower quality
  (current PDF compression only optimizes the PDF's internal structure —
  see the Documents section above)
- Actual email/Telegram delivery for job alerts when the user isn't on
  the site (current alerts are in-app only — see above)
- Self-service account deletion (privacy policy references contacting
  support for this instead)
- Professional Pashto/Dari translation of `/privacy` and `/terms` (kept
  English-only deliberately — see the comment at the top of
  `PrivacyPolicyPage.tsx`)
- A reviewed-by-an-actual-lawyer privacy policy and terms of use (current
  ones are a reasonable starting draft, not legal advice)
