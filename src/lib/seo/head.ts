const SITE_URL = 'https://hamqar.com';

/**
 * Client-side routing means every route serves the same index.html, so
 * the <link rel="canonical"> baked into that file is only ever correct
 * for "/". Left unfixed, every other page (a blog post, a job detail
 * page) would tell search engines "the real version of this is the
 * homepage" — actively preventing those pages from being indexed on
 * their own. Called once per route change.
 */
export function setCanonicalPath(path: string): void {
  let link = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'canonical';
    document.head.appendChild(link);
  }
  link.href = `${SITE_URL}${path}`;
}
