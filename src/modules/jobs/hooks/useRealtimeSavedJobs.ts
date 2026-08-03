import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { fetchSavedJobs } from '../api/savedJobsApi';
import { fetchJobById } from '../api/jobsApi';
import type { Job } from '../types/job';

interface SavedJobRow {
  job_id: string;
  jobs: Job;
}

/**
 * Loads the user's saved jobs once, then keeps the list live via a
 * Supabase Realtime subscription scoped to their own saved_jobs rows
 * (RLS already restricts this to the logged-in user server-side).
 */
export function useRealtimeSavedJobs(userId: string | null) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setJobs([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    fetchSavedJobs(userId).then((jobs) => {
      if (cancelled) return;
      setJobs(jobs);
      setLoading(false);
    });

    const channel = supabase
      .channel(`saved-jobs-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'saved_jobs', filter: `user_id=eq.${userId}` },
        async (payload) => {
          const jobId = (payload.new as { job_id: string }).job_id;
          const job = await fetchJobById(jobId);
          if (!job) return;
          setJobs((prev) => (prev.some((j) => j.id === job.id) ? prev : [job, ...prev]));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'saved_jobs', filter: `user_id=eq.${userId}` },
        (payload) => {
          const jobId = (payload.old as { job_id: string }).job_id;
          setJobs((prev) => prev.filter((j) => j.id !== jobId));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [userId]);

  return { jobs, loading };
}

export type { SavedJobRow };
