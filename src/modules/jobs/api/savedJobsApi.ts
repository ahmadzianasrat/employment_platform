import { supabase } from '../../../lib/supabase/client';
import type { Job } from '../types/job';

export async function fetchSavedJobIds(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase.from('saved_jobs').select('job_id').eq('user_id', userId);
  if (error || !data) return new Set();
  return new Set(data.map((row) => row.job_id as string));
}

export async function fetchSavedJobs(userId: string): Promise<Job[]> {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('job_id, jobs(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return [];
  return data.map((row) => row.jobs).filter(Boolean) as unknown as Job[];
}

export async function saveJob(userId: string, jobId: string): Promise<boolean> {
  const { error } = await supabase.from('saved_jobs').insert({ user_id: userId, job_id: jobId });
  return !error;
}

export async function unsaveJob(userId: string, jobId: string): Promise<boolean> {
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', userId)
    .eq('job_id', jobId);
  return !error;
}
