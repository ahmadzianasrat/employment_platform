// Runs as a `prebuild` step (see package.json) — npm automatically runs
// this before `npm run build`. Writes public/sitemap.xml, which Vite then
// copies into dist/ as part of the normal build.
//
// Static pages are always included. Blog posts and manually-added job
// listings (source = 'manual') are fetched live from Supabase's REST API
// and included too, since those are pages we actually host — unlike most
// job listings, which link straight to their original source (see
// src/modules/jobs/lib/jobLink.ts) and so aren't the canonical page for
// that content.
//
// Falls back to static-pages-only (with a console warning, not a build
// failure) if Supabase credentials aren't available — e.g. a local dev
// build without a .env file. This script was written and syntax-checked
// in an environment with no network access to Supabase, so the first
// real deploy is the first time the live-fetch path actually runs —
// worth checking the Actions log and the resulting sitemap.xml after
// that first deploy to confirm the blog/job entries look right.

import { writeFileSync } from 'node:fs';

const SITE_URL = 'https://hamqar.com';

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/cv-builder', priority: '0.6', changefreq: 'monthly' },
  { path: '/cover-letter', priority: '0.6', changefreq: 'monthly' },
  { path: '/blog', priority: '0.7', changefreq: 'daily' },
];

function urlEntry(loc, lastmod, priority, changefreq) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : null,
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : null,
    priority ? `    <priority>${priority}</priority>` : null,
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n');
}

async function fetchSupabaseTable(table, params) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const endpoint = `${url}/rest/v1/${table}?${params}`;
  const res = await fetch(endpoint, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    console.warn(`[sitemap] Failed to fetch ${table}: ${res.status} ${res.statusText}`);
    return null;
  }
  return res.json();
}

async function main() {
  const entries = STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p.path}`, null, p.priority, p.changefreq));

  const posts = await fetchSupabaseTable(
    'blog_posts',
    'select=slug,updated_at&published=eq.true&order=published_at.desc&limit=500'
  );
  if (posts) {
    for (const post of posts) {
      entries.push(urlEntry(`${SITE_URL}/blog/${post.slug}`, post.updated_at?.slice(0, 10), '0.6', 'weekly'));
    }
  } else {
    console.warn('[sitemap] Skipping blog posts — no Supabase credentials in this build environment.');
  }

  const manualJobs = await fetchSupabaseTable(
    'jobs',
    'select=id,updated_at&source=eq.manual&status=eq.active&order=created_at.desc&limit=500'
  );
  if (manualJobs) {
    for (const job of manualJobs) {
      entries.push(urlEntry(`${SITE_URL}/jobs/${job.id}`, job.updated_at?.slice(0, 10), '0.5', 'weekly'));
    }
  } else {
    console.warn('[sitemap] Skipping manual job listings — no Supabase credentials in this build environment.');
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');
  console.log(`[sitemap] Wrote public/sitemap.xml with ${entries.length} URLs.`);
}

main().catch((err) => {
  // Never fail the build over the sitemap — worst case, ship the previous one.
  console.error('[sitemap] Generation failed, continuing build without updating sitemap.xml:', err);
});
