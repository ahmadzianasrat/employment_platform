/**
 * Which listing sources get a "verified source" badge on the job board.
 *
 * All aggregated sources (ACBAR, ReliefWeb, jobs.af, Wazifaha) are shown
 * as verified — they're the established job boards this platform scrapes
 * from, not open self-listing platforms, so a badge distinguishing them
 * is mainly useful against manually-added listings (added directly by an
 * admin, not pulled from a vetted board).
 *
 * This is a product judgment call, not a claim about actual fraud risk —
 * easy to adjust in this one place if the trust ordering should change.
 */

export type SourceTrustLevel = 'verified' | 'standard' | 'manual';

const VERIFIED_SOURCES = new Set(['acbar', 'reliefweb', 'jobsaf', 'wazifaha']);

export function getSourceTrustLevel(source: string): SourceTrustLevel {
  if (source === 'manual') return 'manual';
  if (VERIFIED_SOURCES.has(source)) return 'verified';
  return 'standard';
}
