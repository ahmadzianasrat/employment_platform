# Hamqar (همکار)

A trilingual (English/Pashto/Dari) CV and cover letter platform for Afghan
job seekers at hamqar.com. Free CV builder, cover letter builder, and
document vault for anyone — plus a **paid application service**: send us
the job you want to apply for and how you paid, and our team prepares a
complete, ready-to-submit PDF package (CV + cover letter customized for
that job, plus your ID card, education, and experience documents).

**If you're picking this project up in a fresh chat with no other context,
read this file top to bottom first**, then `CHANGES.md` for the detailed
history, then `DEPLOYMENT.md` for the hosting setup.

> **August 2026 note:** this used to be a job board that aggregated
> listings via a separate PHP scraper. That has been removed — see
> "Pivot: job board → CV/cover-letter + paid application service" in
> `CHANGES.md` for what changed and why, and "Owner's part" below for
> what still needs to be filled in before this can go live in its new
> form. The old `jobs` table and the PHP scraper still exist but are no
> longer used by this app — see "Known gotchas" #6 below.

## Live site
`https://hamqar.com` — hosted on GitHub Pages, domain + email through Hostinger.

## Stack
- **Frontend**: React + TypeScript + Vite, Tailwind v4, React Router
- **Backend**: Supabase (Postgres + Auth + Storage + Realtime), accessed
  directly from the frontend via `@supabase/supabase-js` — no custom backend server
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
  components/ui/         Shared buttons, icons, FaqAccordion, Spinner
  lib/
    auth/                Supabase Auth context
    i18n/                Trilingual strings (STRINGS object) + language context
    supabase/            Supabase client (publishable key only)
    config/               Contact config (WhatsApp number, Telegram channel links — Telegram links must be updated with real ones, see below)
  modules/
    home/                Landing page: hero, how-it-works, features, pricing teaser, FAQ
    pricing/             Pricing page (two tier cards)
    guide/                Education/guide page (account setup, free tools, uploads, Gmail, payment, job finding)
    orders/               Paid-service request form (up to 3 job slots) + submission API
    profile/              Profile page: contact numbers, CV/vault status, order quota, deliverables + API
    cv/                   CV builder + PDF export
    coverLetter/          Cover letter builder + PDF export
    auth/                Sign in / sign up page
    admin/                Admin: orders review (per-job status + deliverable upload), document review, blog CRUD
    documents/             Document vault (ID card, diplomas, work experience, etc.)
    blog/                  Blog list + post pages
    legal/                 Privacy policy / terms of use
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

Current tables in active use: `admin_users`, `document_entries` (with
`verified`/`verified_at`/`verified_by`), `document_files`, `cv_profiles`,
`cover_letter_profiles`, `blog_posts`, `service_requests` (order-level:
tier, contact, payment — see migration 015), `service_request_jobs`
(job-level: up to 3 rows per order, each with its own target job, status,
and delivered CV/cover-letter paths — see migration 016), `profiles`
(mobile + WhatsApp contact numbers, migration 016). Storage buckets:
`documents` (private to the uploading user, plus read-only access for
admins), `service-requests` (private, same pattern — job-post screenshots
and payment-proof screenshots), and `deliverables` (private, admin
writes/customer reads — the finished CV + cover letter PDF per job,
migration 016).

The old `jobs`, `saved_jobs`, and `job_alerts` tables still exist in
Supabase from the previous job-board version but are **no longer read or
written by this app**. They're harmless to leave in place; dropping them
is optional cleanup, not required — see "Owner's part" below.

## Deployment
See `DEPLOYMENT.md` for the full walkthrough. Short version:
- Push to `main` → GitHub Actions builds and deploys to GitHub Pages automatically
- Domain (`hamqar.com`) and email (`support@hamqar.com`, `info@hamqar.com`)
  are managed at Hostinger — DNS is split: MX records → Hostinger (email),
  A/CNAME records → GitHub Pages (site). These are independent and don't conflict.

## Your part (things only you can fill in)

This is a direct answer to "explain my part clearly" — everything below
needs a real decision or a real value from you before the site is fully
usable in production. Nothing here blocks the build; the app runs and
looks correct without them, but a real customer would hit a dead end.

1. **Run migrations 015 and 016** (`database/migrations/015_service_requests.sql`,
   `016_profiles_and_job_slots.sql`) in the Supabase SQL Editor, in order.
   Nothing under `/order`, `/profile`, or `/admin` works until both are
   applied — see `database/migrations/README.md`. If 015 was already
   applied in an earlier session, 016 still needs to run — it normalizes
   the schema (moves job details into a new `service_request_jobs` table
   so a tier-3 order can hold 3 separate jobs) and adds `profiles` +
   the `deliverables` bucket.
2. **The WhatsApp number is real, the Telegram job-finding channels are
   still placeholders.** `src/lib/config/channelLinks.ts` now has
   `+93 70 733 9100` as the primary contact (WhatsApp is used for all
   "contact us" moments — paid-service questions, payment coordination —
   per your instruction to drop Telegram as a contact method).
   `TELEGRAM_PASHTO_URL`/`TELEGRAM_DARI_URL` are unchanged from before —
   still fake `t.me/...` URLs — since those two channels are for
   *browsing job listings*, a separate thing from contact. Point those at
   your real channels before promoting the Guide/Home job-finding section.
3. **Real HesabPay number.** Still nowhere in the app by design — the
   guide tells customers "the number we give you on WhatsApp." Decide
   whether to show it directly on the Pricing/Guide/Order pages instead
   (simpler for customers, but public), or keep it WhatsApp-only.
4. **Easy-load agent number**, if you use one — same choice as above.
5. **`support@hamqar.com`** is still referenced alongside WhatsApp on the
   Privacy and Terms pages and in the footer — confirm this mailbox
   exists and is checked.
6. **Decide the fate of the PHP scraper and old `jobs`/`saved_jobs`/
   `job_alerts` tables** — unchanged from before, still dormant, still
   your call whether to stop the scraper's cron job on Hostinger.
7. **Review the Pashto and Dari translations** — same caveat as before,
   now covering even more text: the new account-creation guide section,
   the tier-3 "3 separate jobs" clarification, the Profile page, and
   every CV/cover-letter mention now using the سي وي / کوور ليټر (کوور
   ليتر in Dari) + English-term format you specified. Worth a careful
   native-speaker read given how much of it touches money and documents.
8. **Decide who counts as "admin"** — unchanged, same `admin_users` table.
9. **Fulfillment is still manual, but now per-job.** For a tier-3 order,
   an admin marks each of the up to 3 job slots "in progress"/"delivered"
   independently on the Admin Orders page, and uploads that job's
   finished CV + cover letter PDF there — those two files (not the full
   package with ID card/diplomas/etc., which stays a manual WhatsApp/
   email delivery) then show up for the customer to download from their
   Profile page.

## What else could be worth adding

Not built this session, but worth considering for later:
- **Automatic WhatsApp/email notification** when an admin marks a job
  delivered — right now the customer only finds out by checking their
  Profile page or being messaged manually.
- **A public order-status lookup** (e.g. "check my order" by phone
  number) for customers who haven't made an account yet, if that ever
  becomes a support burden.
- **A simple admin dashboard** — count of new/in-progress/delivered
  orders, revenue this week/month — once order volume makes eyeballing
  the list impractical.
- **Testimonials or a delivered-package example** on the Pricing page,
  once you have a few real customers willing to be featured — this is
  usually what convinces a first-time buyer more than the FAQ does.
- **A referral or repeat-customer incentive**, since word of mouth /
  Telegram sharing is clearly already part of how people find you.

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
   routes like `/blog/some-slug` rely on the `public/404.html` +
   `index.html` redirect trick — don't remove these thinking they're
   dead code.

6. **The old `jobs` table and PHP scraper are dormant, not deleted.**
   As of this change, no code in this repo reads or writes the `jobs`,
   `saved_jobs`, or `job_alerts` tables anymore. The PHP scraper (a
   separate app on Hostinger) is untouched by this change and will keep
   running unless stopped independently — see "Your part" above.

7. **Telegram channel links are still placeholders.**
   `src/lib/config/channelLinks.ts` has `TELEGRAM_PASHTO_URL` /
   `TELEGRAM_DARI_URL` set to fake URLs — must be updated before real
   users click them (see "Your part" above).

## Features implemented so far
- CV builder with PDF export (personal info, education, experience,
  skills, languages with native-language highlighting, address), **four**
  visual templates (Classic, Modern sidebar, Minimal centered, Compact
  two-column) with a **live scaled preview** next to the form so users can
  see the layout before downloading, autosaved to Supabase per signed-in
  user (`cv_profiles` table) so it survives refreshes and works across
  devices — signed-out visitors can still use the builder, it just
  doesn't persist
- Cover Letter Builder (`/cover-letter`): same pattern as the CV builder —
  autosaved to Supabase (`cover_letter_profiles`), two templates (Formal /
  Modern) with a live preview, optional "fill in my contact details from
  my CV" button
- Document vault: upload ID card, passport, driving license, TIN, school
  diploma (single-entry types) and university diplomas, work experience,
  employment contracts, references (repeatable — multiple entries
  allowed), bulk upload with per-file type assignment, PDF/JPG/PNG/WEBP,
  15MB per file limit, private per-user storage. Oversized photos
  (JPEG/PNG/WEBP over 300KB) are downscaled and re-encoded client-side
  before upload to cut Storage usage (`src/lib/utils/compressImage.ts`),
  and PDFs are re-saved with object-stream compression via `pdf-lib`
  (`src/lib/utils/compressPdf.ts`). Users can view *and download* each
  uploaded file. Also supports uploading a **single combined PDF**
  (`AllInOneUpload.tsx`), and a **merge & download** button that combines
  every per-type document into one downloadable PDF.
- **Pricing page** (`/pricing`): two tiers — 80 AFN for one job
  application, 200 AFN for three — each listing what's included, with a
  "Request this package" CTA into the order form.
- **Guide page** (`/guide`): step-by-step, trilingual instructions, now
  9 sections — using the free builders, creating and confirming an
  account (with a note that you need a personal email address), uploading
  documents, creating a Gmail account and keeping credentials safe,
  sending attachments by Gmail without them getting stuck, how to request
  the paid service (WhatsApp), how to pay (easy-load and HesabPay, with
  what to send us), finding jobs via the two Telegram channels, and "send
  us any job link/screenshot, we handle the rest."
- **Order page** (`/order`, sign-in required): the paid-service request
  form — tier selection, contact details, payment details that branch by
  method (HesabPay: sender number + account owner name + time; easy-load:
  agent/own number + time + optional transaction ID) with a styled
  file-picker button (not a bare native `<input type="file">`) for the
  payment screenshot, and **1 to 3 job-target blocks** depending on tier:
  the tier-3 package is 3 separate jobs, not the same job three times, so
  the form lets a customer fill in up to 3 independent job
  links/notes/screenshots, or submit fewer now and add the rest later
  from their Profile page. Submits to `service_requests` +
  `service_request_jobs` (migration 016) and the `service-requests`
  storage bucket.
- **Profile page** (`/profile`, sign-in required): mobile + WhatsApp
  contact numbers, saved separately from the per-order contact name/phone
  on `service_requests` (in case someone orders on behalf of a relative);
  CV/cover-letter save status with a link into each builder; a document
  vault completion progress bar (X of N document types uploaded); and,
  per order, a quota bar for tier-3 packages ("2/3 jobs used") with an
  "add another job" flow for any unused slots, plus download buttons for
  each job's delivered CV and cover letter once an admin has uploaded
  them.
- **Home page FAQ**: six questions covering whether the builders are
  free, what the paid package includes, pricing (now explicit that the
  200 AFN tier is 3 separate jobs), how to pay, what to do without a job
  link yet, and data privacy.
- Admin panel: **Orders** (`/admin`) — every order across all users,
  shown as a collapsed card (email + name only) that expands on click;
  each expands to show payment details, every job slot in that order with
  its own status and a styled upload button for the delivered CV and
  delivered cover letter PDF, and per-job / per-order status controls
  (new → in progress → delivered/cancelled). **Document review**
  (`/admin/documents`): admins can view/download any user's uploaded
  documents and mark entries as "verified," but cannot edit, delete, or
  upload on a user's behalf. **Blog CRUD** (`/admin/blog`).
- Blog (`/blog`, `/blog/:slug`): admin-authored posts (plain text with
  blank-line paragraph breaks), draft vs. published state, optional cover
  image URL, social sharing (native Web Share API where available, plus
  explicit Facebook/X/WhatsApp/copy-link buttons) on each post.
- Mobile-first responsive header with a hamburger menu — sign-in is
  always reachable on small screens even when signed out
- CV builder, cover letter builder, document vault, and the order form
  are all lazy-loaded (`React.lazy`) so their heavy dependencies (jsPDF,
  pdf-lib) only load for people who actually open those pages
- SEO/launch prep: `robots.txt`, a build-time-generated `sitemap.xml`
  (static pages including `/pricing` and `/guide`, plus blog posts
  fetched live from Supabase during the build — see
  `scripts/generate-sitemap.mjs`), Open Graph/Twitter card meta tags with
  a real preview image (`public/og-image.png`), a per-route canonical URL
  (see `src/lib/seo/head.ts`), optional Google Analytics (off by default,
  see `src/lib/analytics/ga.ts` and `DEPLOYMENT.md`), and starting-draft
  `/privacy` and `/terms` pages, updated for the paid service
- Full trilingual coverage: every public-facing screen goes through
  `strings.ts` — admin screens remain English-only by the existing
  convention
- Feature-usage analytics: beyond page views, GA4 events fire on CV/cover
  letter PDF downloads (with template), document uploads (per-type, bulk,
  and all-in-one), document merges, paid service-request submissions
  (with tier + payment method), and sign-up/sign-in — see
  `src/lib/analytics/ga.ts` for the full event taxonomy

## Not built yet
- AI-powered CV tailoring / cover letter generation for the paid service
  (currently a human — you — writes/customizes each package by hand,
  using the same CV builder and cover letter builder tools)
- Automatic delivery of the finished package back to the customer (no
  auto-email/auto-Telegram-send — you deliver it manually and mark the
  order "Delivered" in the admin Orders page)
- Real PDF compression that re-encodes embedded images at lower quality
  (current PDF compression only optimizes the PDF's internal structure —
  see the Documents section above)
- Self-service account deletion (privacy policy references contacting
  support for this instead)
- Professional Pashto/Dari translation of `/privacy` and `/terms` (kept
  English-only deliberately — see the comment at the top of
  `PrivacyPolicyPage.tsx`); the new Home/Pricing/Guide/Order page copy
  *is* trilingual, but machine/AI-translated, not professionally
  reviewed — see "Your part" above
- A reviewed-by-an-actual-lawyer privacy policy and terms of use (current
  ones are a reasonable starting draft, not legal advice)
- Automatic cleanup/removal of the old `jobs`/`saved_jobs`/`job_alerts`
  tables and the PHP scraper (left running/in place deliberately — see
  "Your part" above)
