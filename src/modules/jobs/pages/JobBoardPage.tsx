import { useMemo, useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useRealtimeJobs } from '../hooks/useRealtimeJobs';
import { JobCard } from '../components/JobCard';

export function JobBoardPage() {
  const { tr } = useLanguage();
  const { jobs, loading, isSampleData } = useRealtimeJobs();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('all');

  const locations = useMemo(() => {
    const unique = new Set(jobs.map((j) => j.location).filter(Boolean) as string[]);
    return Array.from(unique).sort();
  }, [jobs]);

  const filtered = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        search.trim() === '' ||
        job.title.toLowerCase().includes(search.toLowerCase()) ||
        (job.employer ?? '').toLowerCase().includes(search.toLowerCase());
      const matchesLocation = location === 'all' || job.location === location;
      return matchesSearch && matchesLocation;
    });
  }, [jobs, search, location]);

  return (
    <div>
      <section className="bg-[var(--color-lapis-dark)] py-14">
        <div className="mx-auto max-w-6xl px-6">
          <h1 className="font-display text-3xl font-semibold text-white sm:text-4xl">
            {tr('jobBoard', 'title')}
          </h1>
          <p className="mt-3 max-w-xl text-white/70">{tr('jobBoard', 'subtitle')}</p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tr('jobBoard', 'searchPlaceholder')}
            className="flex-1 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-lapis)]"
          />
          <select
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-lapis)]"
          >
            <option value="all">{tr('jobBoard', 'allLocations')}</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {isSampleData && !loading && (
          <p className="mt-4 text-xs text-[var(--color-muted)]">
            Showing sample listings — connect the live scraper feed to replace these.
          </p>
        )}

        <div className="mt-6">
          {loading ? (
            <p className="text-[var(--color-muted)]">{tr('common', 'loading')}</p>
          ) : filtered.length === 0 ? (
            <p className="text-[var(--color-muted)]">{tr('jobBoard', 'noResults')}</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
