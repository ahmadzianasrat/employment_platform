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

export interface NewManualJob {
  title: string;
  employer: string | null;
  location: string | null;
  deadline_raw: string | null;
  expires_on: string | null;
  profession: string | null;
  gender: string | null;
  description: string | null;
  education: string | null;
  experience: string | null;
  source_url: string | null; // optional external/apply link — shown as "Apply" if provided
}

/** Admin-added listing, not pulled from the scraper. `source` = 'manual' distinguishes it everywhere (badges, filters, dedup). */
export async function createManualJob(job: NewManualJob): Promise<{ error: string | null }> {
  const { error } = await supabase.from('jobs').insert({
    source: 'manual',
    source_job_id: `manual-${crypto.randomUUID()}`,
    source_url: job.source_url?.trim() || '',
    is_manual: true,
    status: 'active',
    source_label: 'Manual',
    title: job.title,
    employer: job.employer,
    location: job.location,
    deadline_raw: job.deadline_raw,
    expires_on: job.expires_on,
    profession: job.profession,
    gender: job.gender,
    description: job.description,
    education: job.education,
    experience: job.experience,
  });
  return { error: error?.message ?? null };
}
