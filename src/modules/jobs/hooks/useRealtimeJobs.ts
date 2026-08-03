import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase/client';
import { fetchActiveJobs } from '../api/jobsApi';
import type { Job } from '../types/job';

interface UseRealtimeJobsResult {
  jobs: Job[];
  loading: boolean;
  isSampleData: boolean;
}

/**
 * Loads active jobs once, then keeps the list live via a Supabase Realtime
 * subscription — new scraped jobs appear automatically, edits/hides update
 * in place, no page refresh required.
 *
 * Requires the `jobs` table to be added to Supabase's realtime publication
 * (see project setup notes) — falls back gracefully to the static fetch
 * if realtime isn't enabled, it just won't live-update.
 */
export function useRealtimeJobs(): UseRealtimeJobsResult {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSampleData, setIsSampleData] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchActiveJobs().then((result) => {
      if (cancelled) return;
      setJobs(result.jobs);
      setIsSampleData(result.isSampleData);
      setLoading(false);
    });

    // Once real data exists, sample data is never shown again for this
    // session, so we only need to subscribe when we're not showing samples.
    const channel = supabase
      .channel('jobs-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'jobs' },
        (payload) => {
          const newJob = payload.new as Job;
          if (newJob.status !== 'active') return;
          setJobs((prev) => {
            if (prev.some((j) => j.id === newJob.id)) return prev;
            return [newJob, ...prev];
          });
          setIsSampleData(false);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'jobs' },
        (payload) => {
          const updated = payload.new as Job;
          setJobs((prev) => {
            if (updated.status !== 'active') {
              return prev.filter((j) => j.id !== updated.id);
            }
            const exists = prev.some((j) => j.id === updated.id);
            if (!exists) return [updated, ...prev];
            return prev.map((j) => (j.id === updated.id ? updated : j));
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'jobs' },
        (payload) => {
          const deletedId = (payload.old as Partial<Job>).id;
          setJobs((prev) => prev.filter((j) => j.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { jobs, loading, isSampleData };
}
