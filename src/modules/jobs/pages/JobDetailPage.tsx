import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { fetchJobById } from '../api/jobsApi';
import type { Job } from '../types/job';
import { SaveJobButton } from '../components/SaveJobButton';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tr } = useLanguage();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchJobById(id).then((result) => {
      if (cancelled) return;
      setJob(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return <p className="mx-auto max-w-3xl px-6 py-14 text-(--color-muted)">{tr('common', 'loading')}</p>;
  }

  if (!job) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-14">
        <p className="text-(--color-muted)">{tr('jobBoard', 'noResults')}</p>
        <Link to="/" className="mt-4 inline-block text-(--color-lapis) underline">
          {tr('jobBoard', 'backToJobs')}
        </Link>
      </div>
    );
  }

  const isExpired = job.expires_on ? new Date(job.expires_on) < new Date() : false;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <Link to="/" className="text-sm text-(--color-lapis) hover:underline">
        ← {tr('jobBoard', 'backToJobs')}
      </Link>

      <div className="mt-4 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-8">
        <div className="flex items-start justify-between gap-3">
          <h1 className="font-display text-2xl font-semibold text-(--color-ink)">{job.title}</h1>
          {job.source_label && (
            <span className="shrink-0 rounded-full bg-(--color-lapis)/10 px-3 py-1 text-xs font-medium text-(--color-lapis)">
              {job.source_label}
            </span>
          )}
        </div>

        {job.employer && <p className="mt-1 text-(--color-muted)">{job.employer}</p>}

        <div className="mt-3">
          <SaveJobButton jobId={job.id} />
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-y border-(--color-line) py-4 text-sm">
          {job.location && (
            <div>
              <div className="text-(--color-muted)">{tr('jobBoard', 'filterLocation')}</div>
              <div className="font-medium">{job.location}</div>
            </div>
          )}
          {job.expires_on && (
            <div>
              <div className="text-(--color-muted)">{tr('jobBoard', 'deadline')}</div>
              <div className="font-medium">{new Date(job.expires_on).toLocaleDateString()}</div>
            </div>
          )}
          {job.profession && (
            <div>
              <div className="text-(--color-muted)">{tr('jobBoard', 'colProfession')}</div>
              <div className="font-medium">{job.profession}</div>
            </div>
          )}
          {job.gender && (
            <div>
              <div className="text-(--color-muted)">{tr('jobBoard', 'colGender')}</div>
              <div className="font-medium">{job.gender}</div>
            </div>
          )}
        </div>

        {isExpired && (
          <p className="mt-4 rounded-(--radius-md) bg-(--color-danger)/10 px-4 py-2 text-sm text-(--color-danger)">
            {tr('jobBoard', 'expired')}
          </p>
        )}

        {job.description && (
          <div className="mt-6">
            <h2 className="font-display text-lg font-semibold">{tr('cv', 'description')}</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-(--color-ink)">
              {job.description}
            </p>
          </div>
        )}

        {job.education && (
          <div className="mt-4">
            <h2 className="font-display text-lg font-semibold">{tr('cv', 'sectionEducation')}</h2>
            <p className="mt-1 text-sm leading-relaxed">{job.education}</p>
          </div>
        )}

        {job.experience && (
          <div className="mt-4">
            <h2 className="font-display text-lg font-semibold">{tr('cv', 'sectionExperience')}</h2>
            <p className="mt-1 text-sm leading-relaxed">{job.experience}</p>
          </div>
        )}

        {job.source_url && (
          <a
            href={job.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block rounded-(--radius-md) bg-(--color-saffron) px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-(--color-saffron-light)"
          >
            {tr('jobBoard', 'applyOnSource')}
          </a>
        )}
      </div>
    </div>
  );
}
