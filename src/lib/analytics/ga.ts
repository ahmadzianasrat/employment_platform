// Loads Google Analytics (GA4) only if VITE_GA_MEASUREMENT_ID is set.
// With no ID configured, every function here is a silent no-op — nothing
// is injected into the page, no requests are made. This is deliberate:
// there's no analytics account set up yet, and this shouldn't start
// tracking anyone by default the moment this code ships.
//
// To enable: create a free GA4 property at https://analytics.google.com,
// grab its Measurement ID (looks like "G-XXXXXXXXXX"), and set it as
// VITE_GA_MEASUREMENT_ID — both in your local .env and as a GitHub repo
// secret (Settings → Secrets and variables → Actions), then add it to
// the `env:` block in .github/workflows/deploy.yml the same way the
// Supabase secrets are wired in.

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let initialized = false;

export function initAnalytics(): void {
  if (!MEASUREMENT_ID || initialized) return;
  initialized = true;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  // Disable GA's own automatic page_view on load — we send it manually per
  // route change instead (see trackPageView), since this is a client-side
  // routed SPA and GA's default only fires once on initial script load.
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });
}

export function trackPageView(path: string, title?: string): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  window.gtag('event', 'page_view', {
    page_path: path,
    page_title: title,
    page_location: window.location.href,
  });
}

/**
 * Feature-usage events — this is what actually answers "which parts of
 * the site are people using," which plain page-view analytics can't:
 * someone can visit /cv-builder without ever downloading a CV, or visit
 * /documents without uploading anything. These fire on the *completion*
 * of an action, not just navigating to the page that offers it.
 *
 * In GA4: Reports → Engagement → Events shows counts per event name.
 * For a breakdown by parameter (e.g. which CV template is more popular),
 * register the parameter as a custom dimension under Admin → Custom
 * definitions, or build an Exploration.
 */
export type AnalyticsEvent =
  | { name: 'cv_pdf_downloaded'; template: string }
  | { name: 'cover_letter_pdf_downloaded'; template: string }
  | { name: 'document_uploaded'; document_type: string }
  | { name: 'all_in_one_document_uploaded' }
  | { name: 'documents_merged_downloaded'; file_count: number }
  | { name: 'job_alert_created' }
  | { name: 'job_saved' }
  | { name: 'sign_up_completed' }
  | { name: 'sign_in_completed' };

export function trackEvent(event: AnalyticsEvent): void {
  if (!MEASUREMENT_ID || !window.gtag) return;
  const { name, ...params } = event;
  window.gtag('event', name, params);
}
