# Employment Platform

A trilingual (English/Pashto/Dari) job board for Afghan job seekers. Aggregates
listings from ACBAR, ReliefWeb, jobs.af, and Wazifaha via a separate PHP
scraper, plus a CV builder, document vault, saved jobs, and an admin review
panel — all backed by Supabase.

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

Current tables: `jobs`, `saved_jobs`, `admin_users`, `document_entries`,
`document_files`. Storage buckets: `documents` (private).

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
  skills, languages with native-language highlighting, address)
- Auth (email/password via Supabase Auth), saved/bookmarked jobs
- Document vault: upload ID card, passport, driving license, TIN, school
  diploma (single-entry types) and university diplomas, work experience,
  employment contracts, references (repeatable — multiple entries
  allowed), bulk upload with per-file type assignment, PDF/JPG/PNG/WEBP,
  15MB per file limit, private per-user storage
- Admin panel: view/edit/hide/delete jobs, cross-source duplicate
  detection (flags candidates, never auto-merges), pagination (20/page)
- PHP scraper → Supabase sync (one-way push at discovery, AI fields
  populate at publish time)

## Not built yet
- AI-powered CV tailoring / cover letter generation
- Payments/credits system
- Employer-facing accounts (direct job posting)
- Admin ability to view/verify uploaded documents (deliberately not
  built — documents are currently private to the uploading user only)
