import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { fetchAllJobsForAdmin, updateJob, updateJobStatus, deleteJob } from '../api/adminJobsApi';
import { findDuplicateGroups } from '../lib/findDuplicates';
import type { Job } from '../../jobs/types/job';

type StatusFilter = 'all' | 'active' | 'hidden' | 'expired';

export function AdminJobsPage() {
  const { isAdmin, checking } = useIsAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Job>>({});

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  async function load() {
    setLoading(true);
    const data = await fetchAllJobsForAdmin();
    setJobs(data);
    setLoading(false);
  }

  const duplicateGroups = useMemo(() => findDuplicateGroups(jobs), [jobs]);

  // Map job id -> a stable color index for its duplicate group, so grouped
  // rows share a visible left-border color without needing manual sorting.
  const duplicateGroupColor = useMemo(() => {
    const map = new Map<string, number>();
    let i = 0;
    for (const group of duplicateGroups.values()) {
      for (const job of group) map.set(job.id, i);
      i++;
    }
    return map;
  }, [duplicateGroups]);

  const groupColors = ['#C87A2E', '#1B4B6B', '#3C7A5C', '#A83A3A', '#6B4C9A'];

  const visibleJobs = useMemo(() => {
    let list = jobs;
    if (statusFilter !== 'all') list = list.filter((j) => j.status === statusFilter);
    if (duplicatesOnly) list = list.filter((j) => duplicateGroupColor.has(j.id));
    return list;
  }, [jobs, statusFilter, duplicatesOnly, duplicateGroupColor]);

  if (checking) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  async function handleToggleStatus(job: Job) {
    const newStatus = job.status === 'active' ? 'hidden' : 'active';
    await updateJobStatus(job.id, newStatus);
    setJobs((prev) => prev.map((j) => (j.id === job.id ? { ...j, status: newStatus } : j)));
  }

  async function handleDelete(job: Job) {
    if (!confirm(`Delete "${job.title}" permanently? This cannot be undone.`)) return;
    await deleteJob(job.id);
    setJobs((prev) => prev.filter((j) => j.id !== job.id));
  }

  function startEdit(job: Job) {
    setEditingId(job.id);
    setEditDraft({
      title: job.title,
      employer: job.employer,
      location: job.location,
      deadline_raw: job.deadline_raw,
      expires_on: job.expires_on,
      profession: job.profession,
      gender: job.gender,
    });
  }

  async function saveEdit(id: string) {
    await updateJob(id, editDraft);
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...editDraft } : j)));
    setEditingId(null);
  }

  const totalDuplicateJobs = Array.from(duplicateGroupColor.keys()).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Admin — Job Listings</h1>
      <p className="mt-1 text-sm text-(--color-muted)">
        {jobs.length} total listings
        {totalDuplicateJobs > 0 && (
          <> · {totalDuplicateJobs} flagged as possible cross-platform duplicates</>
        )}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-1.5 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="hidden">Hidden</option>
          <option value="expired">Expired</option>
        </select>

        <label className="flex items-center gap-2 text-sm text-(--color-ink)">
          <input
            type="checkbox"
            checked={duplicatesOnly}
            onChange={(e) => setDuplicatesOnly(e.target.checked)}
          />
          Show possible duplicates only
        </label>

        <button
          onClick={load}
          className="ml-auto rounded-(--radius-md) border border-(--color-line) px-3 py-1.5 text-sm font-medium text-(--color-lapis) hover:bg-(--color-lapis)/5"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <p className="mt-8 text-(--color-muted)">Loading…</p>
      ) : (
        <div className="mt-6 space-y-2">
          {visibleJobs.map((job) => {
            const groupIdx = duplicateGroupColor.get(job.id);
            const borderColor = groupIdx !== undefined ? groupColors[groupIdx % groupColors.length] : undefined;
            const isEditing = editingId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) p-4"
                style={borderColor ? { borderLeft: `4px solid ${borderColor}` } : undefined}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      className="w-full rounded border border-(--color-line) px-2 py-1 text-sm font-semibold"
                      value={editDraft.title ?? ''}
                      onChange={(e) => setEditDraft((d) => ({ ...d, title: e.target.value }))}
                    />
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        className="rounded border border-(--color-line) px-2 py-1 text-sm"
                        placeholder="Employer"
                        value={editDraft.employer ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, employer: e.target.value }))}
                      />
                      <input
                        className="rounded border border-(--color-line) px-2 py-1 text-sm"
                        placeholder="Location"
                        value={editDraft.location ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, location: e.target.value }))}
                      />
                      <div>
                        <input
                          className="w-full rounded border border-(--color-line) px-2 py-1 text-sm"
                          placeholder="Deadline (display text)"
                          value={editDraft.deadline_raw ?? ''}
                          onChange={(e) => setEditDraft((d) => ({ ...d, deadline_raw: e.target.value }))}
                        />
                        <p className="mt-0.5 text-[10px] text-(--color-muted)">Display text only</p>
                      </div>
                      <div>
                        <input
                          type="date"
                          className="w-full rounded border border-(--color-line) px-2 py-1 text-sm"
                          value={editDraft.expires_on ?? ''}
                          onChange={(e) => setEditDraft((d) => ({ ...d, expires_on: e.target.value || null }))}
                        />
                        <p className="mt-0.5 text-[10px] text-(--color-muted)">
                          Actual date — drives sorting &amp; expiry
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <input
                        className="rounded border border-(--color-line) px-2 py-1 text-sm"
                        placeholder="Profession (optional)"
                        value={editDraft.profession ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, profession: e.target.value || null }))}
                      />
                      <input
                        className="rounded border border-(--color-line) px-2 py-1 text-sm"
                        placeholder="Gender (optional)"
                        value={editDraft.gender ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, gender: e.target.value || null }))}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveEdit(job.id)}
                        className="rounded bg-(--color-lapis) px-3 py-1 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="rounded border border-(--color-line) px-3 py-1 text-xs font-medium"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-(--color-ink)">{job.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            job.status === 'active'
                              ? 'bg-(--color-success)/10 text-(--color-success)'
                              : 'bg-(--color-muted)/10 text-(--color-muted)'
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="rounded-full bg-(--color-lapis)/10 px-2 py-0.5 text-[11px] font-medium text-(--color-lapis)">
                          {job.source_label ?? job.source}
                        </span>
                      </div>
                      <p className="mt-0.5 text-sm text-(--color-muted)">
                        {job.employer} {job.location && `· ${job.location}`} {job.deadline_raw && `· deadline: ${job.deadline_raw}`} {job.profession && `· ${job.profession}`} {job.gender && `· ${job.gender}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEdit(job)}
                        className="rounded border border-(--color-line) px-3 py-1 text-xs font-medium text-(--color-ink) hover:bg-black/5"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(job)}
                        className="rounded border border-(--color-line) px-3 py-1 text-xs font-medium text-(--color-ink) hover:bg-black/5"
                      >
                        {job.status === 'active' ? 'Hide' : 'Unhide'}
                      </button>
                      <button
                        onClick={() => handleDelete(job)}
                        className="rounded border border-(--color-danger)/40 px-3 py-1 text-xs font-medium text-(--color-danger) hover:bg-(--color-danger)/5"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {visibleJobs.length === 0 && (
            <p className="text-sm text-(--color-muted)">No jobs match the current filter.</p>
          )}
        </div>
      )}
    </div>
  );
}
