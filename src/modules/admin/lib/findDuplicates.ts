import type { Job } from '../../jobs/types/job';

function normalize(text: string | null): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\(re[- ]?announced\)/gi, '')
    .replace(/[^\p{L}\p{N}\s]/gu, '') // strip punctuation, keep letters/numbers (unicode-aware for Pashto/Dari)
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Groups jobs that likely represent the same underlying vacancy posted
 * across multiple sources (e.g. ACBAR + Wazifaha both carrying the same
 * NGO posting). Matching is intentionally strict — same normalized title
 * AND same normalized employer — so it flags true candidates for a human
 * to confirm rather than silently merging or hiding anything automatically.
 */
export function findDuplicateGroups(jobs: Job[]): Map<string, Job[]> {
  const groups = new Map<string, Job[]>();

  for (const job of jobs) {
    const key = `${normalize(job.title)}|${normalize(job.employer)}`;
    if (!key.trim() || key === '|') continue; // skip jobs with no usable title/employer
    const existing = groups.get(key) ?? [];
    existing.push(job);
    groups.set(key, existing);
  }

  // Only keep groups with more than one job AND spanning more than one source —
  // two postings from the same source with the same title are a re-announcement,
  // not a cross-platform duplicate.
  const duplicates = new Map<string, Job[]>();
  for (const [key, group] of groups) {
    const sources = new Set(group.map((j) => j.source));
    if (group.length > 1 && sources.size > 1) {
      duplicates.set(key, group);
    }
  }

  return duplicates;
}
