# Deployment Guide — Hybrid: GitHub Pages (site) + Hostinger (domain + email)

This is the current plan: the website is hosted on GitHub Pages (free,
global CDN, automatic deploys on every push), while the domain and
professional email are managed through Hostinger. Email and website
hosting use different DNS record types (MX vs A/CNAME), so they don't
conflict — no need to spend one of your 3 Hostinger website slots.

## Part 1 — Hosting the site on GitHub Pages

### 1. Push this project to a new GitHub repository
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 2. Add your Supabase credentials as repo secrets
The `.env` file is gitignored (correctly — it's never pushed), so the
build needs these injected at build time instead.

In your GitHub repo: **Settings → Secrets and variables → Actions → New
repository secret**. Add two:
- `VITE_SUPABASE_URL` → `https://vyltyflejyjhckxzjwjt.supabase.co`
- `VITE_SUPABASE_PUBLISHABLE_KEY` → your publishable key

(Only the publishable key — never the secret/service key.)

### 3. Enable GitHub Pages
**Settings → Pages → Build and deployment → Source → GitHub Actions**

The next push to `main` triggers `.github/workflows/deploy.yml`, which
builds and publishes the app automatically. You'll get a URL like
`https://YOUR_USERNAME.github.io/YOUR_REPO/` immediately, before the
domain is even connected.

⚠️ **This has silently reverted to "Deploy from a branch" at least once
already**, which serves the raw unbuilt repo instead of the actual build
output (symptom: viewing page source shows `<script src="/src/main.tsx">`
instead of `/assets/index-[hash].js`; JS fails to load with a MIME-type
error in the console). If the live site is ever blank or broken despite
Actions showing a green checkmark, **check this setting first** before
troubleshooting DNS, caching, or anything else — it was the actual root
cause of an extended debugging session that initially looked like a DNS
propagation issue.

## Part 2 — Buying the domain + setting up email at Hostinger

### 1. Buy the domain through Hostinger (or anywhere)

### 2. Set up Hostinger Email for it
hPanel → Emails → Claim free email (or your paid plan) → select the
domain → Confirm. When prompted, choose the **automatic** DNS setup —
Hostinger will add the required MX/SPF/DKIM/DMARC records for you.

### 3. Point the website records at GitHub Pages
hPanel → Domains → your domain → DNS Zone. Add/edit:

**Root domain** — four `A` records, all pointing to GitHub Pages:
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**`www` subdomain** — one `CNAME` record:
```
www → YOUR_USERNAME.github.io
```

⚠️ **Only touch the A/CNAME records.** Leave the MX/SPF/DKIM/DMARC
records Hostinger added in step 2 completely alone — that's what makes
email work, and it's independent of these.

### 4. Tell GitHub about the domain
Repo **Settings → Pages → Custom domain** → enter your domain → Save.
This creates a `CNAME` file in the repo automatically.

### 5. Wait, then enable HTTPS
DNS propagation can take minutes to a few hours. Once GitHub can verify
it, go back to **Settings → Pages** and check "Enforce HTTPS" — GitHub
provisions a free SSL certificate automatically.

## Why GitHub Pages needs an extra trick that Hostinger didn't

Apache (Hostinger) supports `.htaccess` rewrite rules, so a direct link
to a client-side route like `/blog/some-slug` can be redirected to
`index.html` server-side, transparently. GitHub Pages has no equivalent
server-side rewrite capability — instead, this project uses the standard
GitHub Pages SPA workaround:
- `public/404.html` — GitHub Pages serves this for any unmatched path;
  it redirects to `index.html` with the intended path encoded in a query string
- `index.html` — has a small script that decodes that query string and
  restores the clean URL before React Router mounts

This is already set up and doesn't need any action from you — just
explaining why these two extra files exist in case you're wondering.
`public/.htaccess` is also still in the project (harmless, unused by
GitHub Pages) in case this ever moves back to Hostinger-hosted later.

## Deploying updates going forward
Just `git push` to `main` — the GitHub Action handles build + deploy
automatically. No manual upload step, unlike the Hostinger flow.

## Local production preview (optional, before pushing)
```bash
npm run build
npm run preview
```

## Part 3 — Optional: Google Analytics

Analytics is disabled by default — nothing is tracked until you configure
it. To enable:

1. Create a free GA4 property at https://analytics.google.com and grab
   its Measurement ID (looks like `G-XXXXXXXXXX`).
2. Add it as a repo secret: **Settings → Secrets and variables → Actions
   → New repository secret** → `VITE_GA_MEASUREMENT_ID` → paste the ID.
   (`.github/workflows/deploy.yml` already passes this through to the
   build if the secret exists — no further changes needed.)
3. For local dev, add the same value to your `.env` file.

See `src/lib/analytics/ga.ts` for how this works — it's a no-op with no
network requests at all if the measurement ID isn't set.

## Go-live checklist

Before pointing real traffic (Telegram posts, social shares, etc.) at
the site:

- [ ] **Run migration 017** (`service_requests.status` auto-recompute
      trigger) — fixes a bug where a tier-3 order kept showing
      "delivered" after a new job was added to it. Everything through
      016 is confirmed applied. See `database/migrations/README.md`.
- [x] **WhatsApp, Telegram contact, easy-load, and HesabPay numbers are
      all real and live** in `src/lib/config/channelLinks.ts` and shown
      directly on Pricing/Guide/Order.
- [x] **Confirm at least one row exists in `admin_users`**
      (`ahmadzianasrat100@gmail.com` is currently the admin) — see the
      comment at the bottom of
      `database/migrations/003_admin_permissions.sql` if you need to add
      another.
- [ ] **Push this update and let it deploy once**, then check:
  - `https://hamqar.com/sitemap.xml` and `https://hamqar.com/robots.txt`
    still load correctly
  - Open Graph preview card — paste `https://hamqar.com` into
    https://www.opengraph.xyz to check it. The image itself
    (`public/og-image.png`) still has the flagged watermark/logo issue
    noted in earlier `CHANGES.md` entries; consider replacing it.
- [ ] **Read `/privacy` and `/terms`** — updated for the paid service and
      the Profile page's contact numbers, but still starting drafts (see
      the note at the top of each), not reviewed by a lawyer. Worth a
      careful look given customers send payment details and ID scans.
- [ ] **Review the trilingual copy** for Pashto/Dari accuracy — see
      "Your part" in `README.md`.
- [x] **`VITE_GA_MEASUREMENT_ID` configured** — page views and
      feature-usage events (CV/cover-letter downloads, document uploads,
      `service_request_submitted` with tier + payment method) are live
      under Reports → Engagement → Events in GA.
