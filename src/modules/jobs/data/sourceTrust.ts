/**
 * Which listing sources get a "verified source" badge on the job board.
 *
 * ACBAR and ReliefWeb are established, institutional NGO/UN job
 * aggregators with their own vetting of postings. jobs.af and Wazifaha
 * are general-purpose Afghan job boards — still legitimate, just without
 * the same institutional vetting, so they're shown as "standard" rather
 * than unbadged/suspicious. Manually-added listings (via the admin panel)
 * are marked separately since a human on this team added them directly.
 *
 * This is a product judgment call, not a claim about actual fraud risk —
 * easy to adjust in this one place if the trust ordering should change.
 */

export type SourceTrustLevel = 'verified' | 'standard' | 'manual';

const VERIFIED_SOURCES = new Set(['acbar', 'reliefweb']);

export function getSourceTrustLevel(source: string): SourceTrustLevel {
  if (source === 'manual') return 'manual';
  if (VERIFIED_SOURCES.has(source)) return 'verified';
  return 'standard';
}
