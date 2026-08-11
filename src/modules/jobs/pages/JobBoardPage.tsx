import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useRealtimeJobs } from '../hooks/useRealtimeJobs';
import { useJobAlertMatches } from '../hooks/useJobAlertMatches';
import { JobAlertToastStack } from '../components/JobAlertToast';
import { LocationFilter } from '../components/LocationFilter';
import { JobCard } from '../components/JobCard';
import { JobTableSkeleton } from '../components/JobTableSkeleton';
import { ProfileCompletionWidget } from '../../profile/components/ProfileCompletionWidget';
import { locationMatchesProvince } from '../data/provinces';
import { TELEGRAM_PASHTO_URL, TELEGRAM_DARI_URL } from '../../../lib/config/channelLinks';
import type { Language } from '../../../lib/i18n/strings';

const PAGE_SIZE = 21;

// Single reusable Telegram "paper plane" icon — used for BOTH the Pashto and
// Dari channel buttons so they read as the same kind of action, distinguished
// only by color/tooltip, not by using a mismatched WhatsApp-style icon for one.
function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M21.5 3.5 2.7 10.9c-1.1.44-1.1 1.06-.2 1.34l4.8 1.5 1.86 5.66c.22.6.44.84.9.84.46 0 .66-.2 1.9-1.4l2-2 4.2 3.1c.78.43 1.34.2 1.54-.72l2.8-13.4c.3-1.14-.44-1.66-1.2-1.32Z" />
    </svg>
  );
}

export function JobBoardPage() {
  const { tr, language, setLanguage } = useLanguage();
  const { user } = useAuth();
  const { jobs, loading, isSampleData } = useRealtimeJobs();
  const { matches, dismiss } = useJobAlertMatches(jobs);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');
  const [profession, setProfession] = useState('all');
  const [page, setPage] = useState(1);

  const professions = useMemo(() => {
    const unique = new Set(jobs.map((j) => j.profession).filter(Boolean) as string[]);
    return Array.from(unique).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search.trim() === '' ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        (job.employer ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesLocation = location === 'all' || locationMatchesProvince(job.location, location);
      const matchesProfession = profession === 'all' || job.profession === profession;
      return matchesSearch && matchesLocation && matchesProfession;
    });
  }, [jobs, search, location, profession]);

  // Reset to page 1 whenever a filter changes, so you're never stuck on a
  // page number that no longer has any results.
  useEffect(() => {
    setPage(1);
  }, [search, location, profession]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageJobs = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <JobAlertToastStack jobs={matches} onDismiss={dismiss} />
      <section
        className="relative overflow-hidden border-b border-(--color-line) py-16"
        style={{
          background:
            'radial-gradient(circle at 15% 20%, rgba(27,75,107,0.07), transparent 45%), radial-gradient(circle at 85% 15%, rgba(200,122,46,0.08), transparent 40%), var(--color-paper-raised)',
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="h-1 w-14 rounded-full bg-(--color-saffron)" />
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-semibold text-(--color-ink) sm:text-4xl">
            {tr('jobBoard', 'title')}
          </h1>
          <p className="mt-3 max-w-xl text-(--color-muted)">{tr('jobBoard', 'subtitle')}</p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-4 py-2">
              <span className="font-display text-xl font-semibold text-(--color-lapis)">{jobs.length}</span>{' '}
              <span className="text-sm text-(--color-muted)">{tr('jobBoard', 'statsListings')}</span>
            </div>
            <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-4 py-2 text-sm text-(--color-muted)">
              {tr('jobBoard', 'statsUpdatedDaily')}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper) px-4 py-3">
            <span className="text-sm text-(--color-ink)">{tr('jobBoard', 'heroTelegramCta')}</span>
            <a
              href={TELEGRAM_PASHTO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-[#229ED9]/10 px-3 py-1 text-xs font-semibold text-[#229ED9] hover:bg-[#229ED9]/20"
            >
              <TelegramIcon className="h-3.5 w-3.5" />
              {tr('jobBoard', 'telegramPashto')}
            </a>
            <a
              href={TELEGRAM_DARI_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-(--color-success)/10 px-3 py-1 text-xs font-semibold text-(--color-success) hover:bg-(--color-success)/20"
            >
              <TelegramIcon className="h-3.5 w-3.5" />
              {tr('jobBoard', 'telegramDari')}
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <ProfileCompletionWidget />

        <div className="flex flex-col flex-wrap gap-3 sm:flex-row sm:items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as Language)}
            className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2.5 text-sm outline-none focus:border-(--color-lapis)"
          >
            <option value="en">English</option>
            <option value="ps">پښتو</option>
            <option value="da">دری</option>
          </select>

          <div className="relative flex-1 sm:min-w-[220px]">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tr('jobBoard', 'searchPlaceholder')}
              className="w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-4 py-2.5 pr-9 text-sm outline-none focus:border-(--color-lapis)"
            />
            <svg
              className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--color-muted)"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="9" cy="9" r="6" />
              <path d="M18 18l-4-4" strokeLinecap="round" />
            </svg>
          </div>

          <select
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2.5 text-sm outline-none focus:border-(--color-lapis) sm:w-52"
          >
            <option value="all">{tr('jobBoard', 'allCategories')}</option>
            {professions.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <LocationFilter value={location} onChange={setLocation} />

          {user && (
            <Link
              to="/job-alerts"
              className="ml-auto text-sm font-medium text-(--color-lapis) hover:underline"
            >
              {tr('jobAlerts', 'manageAlerts')}
            </Link>
          )}
        </div>

        {isSampleData && !loading && (
          <p className="mt-4 text-xs text-(--color-muted)">{tr('jobBoard', 'sampleDataNotice')}</p>
        )}

        <div className="mt-6">
          {loading ? (
            <JobTableSkeleton />
          ) : filtered.length === 0 ? (
            <p className="text-(--color-muted)">{tr('jobBoard', 'noResults')}</p>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pageJobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-6 flex items-center justify-between text-sm">
                  <p className="text-(--color-muted)">
                    {tr('jobBoard', 'pageSummary')
                      .replace('{page}', String(page))
                      .replace('{totalPages}', String(totalPages))
                      .replace('{count}', String(filtered.length))}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-(--radius-md) border border-(--color-line) px-3 py-1.5 font-medium text-(--color-ink) disabled:opacity-40"
                    >
                      {tr('jobBoard', 'prevPage')}
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-(--radius-md) border border-(--color-line) px-3 py-1.5 font-medium text-(--color-ink) disabled:opacity-40"
                    >
                      {tr('jobBoard', 'nextPage')}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}
