import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useRealtimeJobs } from '../hooks/useRealtimeJobs';
import { useJobAlertMatches } from '../hooks/useJobAlertMatches';
import { JobAlertToastStack } from '../components/JobAlertToast';
import { LocationFilter } from '../components/LocationFilter';
import { SourceBadge } from '../components/SourceBadge';
import { JobTableSkeleton } from '../components/JobTableSkeleton';
import { ProfileCompletionWidget } from '../../profile/components/ProfileCompletionWidget';
import { locationMatchesProvince } from '../data/provinces';
import { TELEGRAM_PASHTO_URL, TELEGRAM_DARI_URL } from '../../../lib/config/channelLinks';
import type { Language } from '../../../lib/i18n/strings';

const PAGE_SIZE = 20;

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
      <section className="bg-(--color-lapis-dark) py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {tr('jobBoard', 'title')}
          </h1>
          <p className="mt-3 max-w-xl text-white/70">{tr('jobBoard', 'subtitle')}</p>
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
            <option value="all">All Professions</option>
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
              Manage alerts
            </Link>
          )}
        </div>

        {isSampleData && !loading && (
          <p className="mt-4 text-xs text-(--color-muted)">
            Showing sample listings — connect the live scraper feed to replace these.
          </p>
        )}

        <div className="mt-6">
          {loading ? (
            <JobTableSkeleton />
          ) : filtered.length === 0 ? (
            <p className="text-(--color-muted)">{tr('jobBoard', 'noResults')}</p>
          ) : (
            <>
              <div className="overflow-x-auto rounded-(--radius-lg) border border-(--color-line)">
                <table className="w-full min-w-[960px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-(--color-lapis) text-left text-xs font-semibold uppercase tracking-wide text-white">
                      <th className="px-3 py-3">{tr('jobBoard', 'colId')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colPosition')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colOrganization')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colProfession')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colDeadline')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colGender')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colLocation')}</th>
                      <th className="px-3 py-3">{tr('jobBoard', 'colSource')}</th>
                      <th className="px-3 py-3 text-center">{tr('jobBoard', 'telegramPashto')}</th>
                      <th className="px-3 py-3 text-center">{tr('jobBoard', 'telegramDari')}</th>
                      <th className="px-3 py-3 text-center">{tr('jobBoard', 'colDetails')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageJobs.map((job, i) => {
                      const deadline = formatDeadline(job.expires_on ?? job.deadline_raw);
                      const rowNumber = (page - 1) * PAGE_SIZE + i + 1;
                      return (
                        <tr
                          key={job.id}
                          className="border-t border-(--color-line) bg-(--color-paper-raised) align-middle hover:bg-black/[0.02]"
                        >
                          <td className="px-3 py-3 text-(--color-muted)">{rowNumber}</td>
                          <td className="max-w-[220px] px-3 py-3">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="font-medium text-(--color-lapis) hover:underline"
                            >
                              {job.title}
                            </Link>
                            {isRecentlyPosted(job.created_at) && (
                              <span className="ml-2 rounded-full bg-(--color-success)/10 px-2 py-0.5 text-[10px] font-semibold text-(--color-success)">
                                New
                              </span>
                            )}
                          </td>
                          <td className="max-w-[160px] truncate px-3 py-3" title={job.employer ?? undefined}>
                            {job.employer ?? '—'}
                          </td>
                          <td className="px-3 py-3">{job.profession ?? '—'}</td>
                          <td className="whitespace-nowrap px-3 py-3 font-medium text-(--color-danger)">
                            {deadline ?? '—'}
                          </td>
                          <td className="px-3 py-3">{job.gender ?? '—'}</td>
                          <td
                            className="max-w-[140px] truncate px-3 py-3"
                            title={job.location ?? undefined}
                          >
                            {job.location ?? '—'}
                          </td>
                          <td className="px-3 py-3">
                            <SourceBadge source={job.source} label={job.source_label ?? job.source} />
                          </td>
                          <td className="px-3 py-3 text-center">
                            <a
                              href={TELEGRAM_PASHTO_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={tr('jobBoard', 'telegramPashto')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#229ED9]/10 text-[#229ED9] hover:bg-[#229ED9]/20"
                            >
                              <TelegramIcon className="h-4 w-4" />
                            </a>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <a
                              href={TELEGRAM_DARI_URL}
                              target="_blank"
                              rel="noopener noreferrer"
                              title={tr('jobBoard', 'telegramDari')}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-(--color-success)/10 text-(--color-success) hover:bg-(--color-success)/20"
                            >
                              <TelegramIcon className="h-4 w-4" />
                            </a>
                          </td>
                          <td className="px-3 py-3 text-center">
                            <Link
                              to={`/jobs/${job.id}`}
                              className="whitespace-nowrap rounded-(--radius-md) border border-(--color-line) px-3 py-1 text-xs font-medium text-(--color-ink) hover:bg-black/5"
                            >
                              {tr('jobBoard', 'viewDetails')}
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between text-sm">
                  <p className="text-(--color-muted)">
                    Page {page} of {totalPages} · {filtered.length} jobs
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-(--radius-md) border border-(--color-line) px-3 py-1.5 font-medium text-(--color-ink) disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-(--radius-md) border border-(--color-line) px-3 py-1.5 font-medium text-(--color-ink) disabled:opacity-40"
                    >
                      Next
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
