import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { isExternalJob } from '../lib/jobLink';
import type { Job } from '../types/job';

export function JobAlertToastStack({ jobs, onDismiss }: { jobs: Job[]; onDismiss: (jobId: string) => void }) {
  const { tr } = useLanguage();
  if (jobs.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2 sm:w-full">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="rounded-(--radius-lg) border border-(--color-saffron)/40 bg-(--color-paper-raised) p-3 shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-(--color-saffron)">
                {tr('jobAlerts', 'matchesYourAlert')}
              </p>
              <p className="mt-1 text-sm font-medium text-(--color-ink)">{job.title}</p>
              {job.employer && <p className="text-xs text-(--color-muted)">{job.employer}</p>}
            </div>
            <button
              onClick={() => onDismiss(job.id)}
              aria-label="Dismiss"
              className="shrink-0 text-(--color-muted) hover:text-(--color-ink)"
            >
              ✕
            </button>
          </div>
          {isExternalJob(job) ? (
            <a
              href={job.source_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onDismiss(job.id)}
              className="mt-2 inline-block text-xs font-semibold text-(--color-lapis) hover:underline"
            >
              {tr('jobAlerts', 'viewJob')} →
            </a>
          ) : (
            <Link
              to={`/jobs/${job.id}`}
              onClick={() => onDismiss(job.id)}
              className="mt-2 inline-block text-xs font-semibold text-(--color-lapis) hover:underline"
            >
              {tr('jobAlerts', 'viewJob')} →
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
