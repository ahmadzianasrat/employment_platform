import type { Job } from '../types/job';

/**
 * Scraped listings should send the person straight to the original
 * posting — that's the actual source of truth (accurate deadline,
 * application instructions, etc.), and our internal detail page is just
 * a re-parsed copy. Manually-added listings (source === 'manual') have
 * no meaningful external source, so those stay on our own detail page.
 */
export function isExternalJob(job: Job): boolean {
  return job.source !== 'manual' && Boolean(job.source_url?.trim());
}
