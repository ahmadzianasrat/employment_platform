import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import type { Job } from '../types/job';
import { SaveJobButton } from './SaveJobButton';
import { SourceBadge } from './SourceBadge';
import { isExternalJob } from '../lib/jobLink';

function formatDeadline(dateStr: string | null): string | null {
  if (!dateStr) return null;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

function isRecentlyPosted(createdAt: string): boolean {
  const days = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
  return days <= 3;
}

export function JobCard({ job }: { job: Job }) {
  const { tr } = useLanguage();
  const deadline = formatDeadline(job.expires_on ?? job.deadline_raw);
  const external = isExternalJob(job);

  const cardContent = (
    <>
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-semibold leading-snug text-(--color-ink) group-hover:text-(--color-lapis)">
          {job.title}
          {isRecentlyPosted(job.created_at) && (
            <span className="ms-2 inline-block rounded-full bg-(--color-success)/10 px-2 py-0.5 align-middle text-[10px] font-semibold text-(--color-success)">
              {tr('jobBoard', 'newBadge')}
            </span>
          )}
        </h3>
        <SourceBadge source={job.source} label={job.source_label ?? job.source} />
      </div>

      {job.employer && (
        <p className="mt-1 text-sm font-medium text-(--color-muted)">{job.employer}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--color-muted)">
        {job.location && <span>📍 {job.location}</span>}
        {deadline && (
          <span className="font-medium text-(--color-danger)">
            {tr('jobBoard', 'deadline')}: {deadline}
          </span>
        )}
      </div>

      {(job.profession || job.gender) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {job.profession && (
            <span className="rounded-full bg-(--color-lapis)/8 px-2 py-0.5 text-xs text-(--color-lapis)">
              {job.profession}
            </span>
          )}
          {job.gender && (
            <span className="rounded-full bg-(--color-muted)/10 px-2 py-0.5 text-xs text-(--color-muted)">
              {job.gender}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
        <SaveJobButton jobId={job.id} />
        <span className="text-xs font-semibold text-(--color-lapis) group-hover:underline">
          {tr('jobBoard', 'viewDetails')} {external ? '↗' : '→'}
        </span>
      </div>
    </>
  );

  const className =
    'group block rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5 transition-shadow hover:shadow-md';

  if (external) {
    return (
      <a href={job.source_url} target="_blank" rel="noopener noreferrer" className={className}>
        {cardContent}
      </a>
    );
  }

  return (
    <Link to={`/jobs/${job.id}`} className={className}>
      {cardContent}
    </Link>
  );
}
