import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useRealtimeSavedJobs } from '../hooks/useRealtimeSavedJobs';
import { JobCard } from '../components/JobCard';

export function SavedJobsPage() {
  const { user, loading: authLoading } = useAuth();
  const { tr } = useLanguage();
  const { jobs, loading } = useRealtimeSavedJobs(user?.id ?? null);

  if (authLoading) return null;
  if (!user) return <Navigate to="/sign-in" replace />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-[var(--color-ink)]">
        {tr('jobBoard', 'savedTitle')}
      </h1>

      <div className="mt-6">
        {loading ? (
          <p className="text-[var(--color-muted)]">{tr('common', 'loading')}</p>
        ) : jobs.length === 0 ? (
          <p className="text-[var(--color-muted)]">{tr('jobBoard', 'noSavedJobs')}</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
