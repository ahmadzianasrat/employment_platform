import { supabase } from '../../../lib/supabase/client';
import type { Job } from '../../jobs/types/job';

export async function fetchAllJobsForAdmin(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []) as Job[];
}

export async function updateJobStatus(id: string, status: Job['status']): Promise<void> {
  const { error } = await supabase.from('jobs').update({ status }).eq('id', id);
  if (error) throw error;
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<void> {
  const { error } = await supabase.from('jobs').update(patch).eq('id', id);
  if (error) throw error;
}

export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase.from('jobs').delete().eq('id', id);
  if (error) throw error;
}
