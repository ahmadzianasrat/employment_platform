import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../../lib/auth/AuthContext';
import { fetchJobAlerts } from '../api/jobAlertsApi';
import type { JobAlert } from '../api/jobAlertsApi';
import { locationMatchesProvince } from '../data/provinces';
import type { Job } from '../types/job';

/**
 * In-app alert matching: diffs the realtime job list for newly-arrived
 * jobs and checks them against the signed-in user's saved alert criteria.
 * This only fires while the user has the site open — it's not email or
 * Telegram delivery (see migration 009 for why that's a separate,
 * not-yet-built piece).
 */
export function useJobAlertMatches(jobs: Job[]) {
  const { user } = useAuth();
  const [matches, setMatches] = useState<Job[]>([]);
  const alertsRef = useRef<JobAlert[]>([]);
  const seenIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (!user) {
      alertsRef.current = [];
      return;
    }
    fetchJobAlerts(user.id).then((alerts) => {
      alertsRef.current = alerts;
    });
  }, [user]);

  useEffect(() => {
    if (jobs.length === 0) return;

    // First time we see a non-empty job list, just record the baseline —
    // don't fire alerts for jobs that were already there before we loaded.
    if (seenIdsRef.current === null) {
      seenIdsRef.current = new Set(jobs.map((j) => j.id));
      return;
    }

    const seen = seenIdsRef.current;
    const newlyArrived = jobs.filter((j) => !seen.has(j.id));
    if (newlyArrived.length === 0) return;

    for (const job of newlyArrived) seen.add(job.id);

    if (!user || alertsRef.current.length === 0) return;

    const matched = newlyArrived.filter((job) =>
      alertsRef.current.some((alert) => {
        const provinceOk = alert.province === 'all' || locationMatchesProvince(job.location, alert.province);
        const professionOk = alert.profession === 'all' || job.profession === alert.profession;
        return provinceOk && professionOk;
      })
    );

    if (matched.length > 0) {
      setMatches((prev) => [...prev, ...matched]);
    }
  }, [jobs, user]);

  function dismiss(jobId: string) {
    setMatches((prev) => prev.filter((j) => j.id !== jobId));
  }

  return { matches, dismiss };
}
