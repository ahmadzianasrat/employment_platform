import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import type { Job } from '../types/job';
import { SaveJobButton } from './SaveJobButton';

function formatDeadline(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export function JobCard({ job }: { job: Job }) {
  const { tr } = useLanguage();
  const deadline = formatDeadline(job.expires_on ?? job.deadline_raw);

  return (
    <Link
      to={`/jobs/${job.id}`}
      className="group block rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-(--color-ink) group-hover:text-(--color-lapis)">
          {job.title}
        </h3>
        {job.source_label && (
          <span className="shrink-0 rounded-full bg-(--color-lapis)/10 px-2.5 py-0.5 text-xs font-medium text-(--color-lapis)">
            {job.source_label}
          </span>
        )}
      </div>

      {job.employer && (
        <p className="mt-1 text-sm font-medium text-(--color-muted)">{job.employer}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-muted)">
        {job.location && <span>{job.location}</span>}
        {deadline && (
          <span>
            {tr('jobBoard', 'deadline')}: {deadline}
          </span>
        )}
      </div>

      <div className="mt-3">
        <SaveJobButton jobId={job.id} />
      </div>
    </Link>
  );
}
