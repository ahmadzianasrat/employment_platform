// Runs as a `prebuild` step (see package.json) — npm automatically runs
// this before `npm run build`. Writes public/sitemap.xml, which Vite then
// copies into dist/ as part of the normal build.
//
// Static pages are always included. Blog posts are fetched live from
// Supabase's REST API and included too, since each one is a page we
// actually host with its own content.
//
// Logging is intentionally verbose and specific — three very different
// situations can all otherwise look identical ("only 4 static URLs in
// the sitemap"), and that ambiguity is exactly what caused confusion the
// first time this ran:
//   1. Supabase credentials missing from the build environment
//   2. Credentials present, but the request itself failed (bad key, RLS,
//      wrong table/column name, etc.)
//   3. Credentials present, request succeeded, table just has 0 matching
//      rows (e.g. no blog posts published yet, no jobs manually added
//      yet) — this is NOT a bug, just genuinely no content yet
// Check the GitHub Actions build log for the `[sitemap]` lines after a
// deploy — they now say explicitly which of the three happened.

import { writeFileSync } from 'node:fs';

const SITE_URL = 'https://hamqar.com';

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/cv-builder', priority: '0.6', changefreq: 'monthly' },
  { path: '/cover-letter', priority: '0.6', changefreq: 'monthly' },
  { path: '/pricing', priority: '0.8', changefreq: 'monthly' },
  { path: '/guide', priority: '0.7', changefreq: 'monthly' },
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

/**
 * Returns { ok: true, rows: [...] } on success (rows may be an empty
 * array — that's a valid, meaningful result, not a failure), or
 * { ok: false, reason, detail } describing exactly why not.
 */
async function fetchSupabaseTable(table, params) {
  const url = process.env.VITE_SUPABASE_URL;
  const key = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    return {
      ok: false,
      reason: 'no-credentials',
      detail: 'VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY not set in this build environment',
    };
  }

  const endpoint = `${url}/rest/v1/${table}?${params}`;
  let res;
  try {
    res = await fetch(endpoint, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  } catch (err) {
    return { ok: false, reason: 'network-error', detail: String(err) };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    return {
      ok: false,
      reason: 'request-failed',
      detail: `HTTP ${res.status} ${res.statusText} — ${body.slice(0, 300)}`,
    };
  }

  const rows = await res.json();
  return { ok: true, rows };
}

function logResult(table, result) {
  if (result.ok) {
    console.log(`[sitemap] ${table}: fetched OK, ${result.rows.length} row(s).`);
  } else if (result.reason === 'no-credentials') {
    console.warn(`[sitemap] ${table}: SKIPPED — ${result.detail}`);
  } else {
    console.error(`[sitemap] ${table}: FETCH FAILED (${result.reason}) — ${result.detail}`);
  }
}

async function main() {
  const entries = STATIC_PAGES.map((p) => urlEntry(`${SITE_URL}${p.path}`, null, p.priority, p.changefreq));

  const postsResult = await fetchSupabaseTable(
    'blog_posts',
    'select=slug,updated_at&published=eq.true&order=published_at.desc&limit=500'
  );
  logResult('blog_posts', postsResult);
  if (postsResult.ok) {
    for (const post of postsResult.rows) {
      entries.push(urlEntry(`${SITE_URL}/blog/${post.slug}`, post.updated_at?.slice(0, 10), '0.6', 'weekly'));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join('\n')}\n</urlset>\n`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');
  console.log(`[sitemap] Wrote public/sitemap.xml with ${entries.length} URL(s) total.`);
}

main().catch((err) => {
  // Never fail the build over the sitemap — worst case, ship the previous one.
  console.error('[sitemap] Generation failed, continuing build without updating sitemap.xml:', err);
});
