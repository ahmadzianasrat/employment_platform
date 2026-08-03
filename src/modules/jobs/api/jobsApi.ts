import { supabase } from '../../../lib/supabase/client';
import { SAMPLE_JOBS } from '../data/sampleJobs';
import type { Job } from '../types/job';

/**
 * Fetch active jobs. Falls back to sample data when the live table is
 * empty (e.g. before the scraper sync is wired up) or unreachable, so the
 * UI is always testable without blocking on the backend being fully live.
 */
export async function fetchActiveJobs(): Promise<{ jobs: Job[]; isSampleData: boolean }> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (data && data.length > 0) {
      return { jobs: data as Job[], isSampleData: false };
    }
    return { jobs: SAMPLE_JOBS, isSampleData: true };
  } catch {
    return { jobs: SAMPLE_JOBS, isSampleData: true };
  }
}

export async function fetchJobById(id: string): Promise<Job | null> {
  const sampleMatch = SAMPLE_JOBS.find((j) => j.id === id);

  try {
    const { data, error } = await supabase.from('jobs').select('*').eq('id', id).single();
    if (error) throw error;
    return data as Job;
  } catch {
    return sampleMatch ?? null;
  }
}
