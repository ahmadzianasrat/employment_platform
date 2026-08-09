import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import {
  fetchAllJobsForAdmin,
  updateJob,
  updateJobStatus,
  deleteJob,
  createManualJob,
} from '../api/adminJobsApi';
import type { NewManualJob } from '../api/adminJobsApi';
import { findDuplicateGroups } from '../lib/findDuplicates';
import { AdminNav } from '../components/AdminNav';
import type { Job } from '../../jobs/types/job';
import { LoadingBlock } from '../../../components/ui/Spinner';
import { btnPrimary, btnSecondarySm, btnDangerOutlineSm } from '../../../components/ui/buttonStyles';
import { IconPlus } from '../../../components/ui/icons';

const EMPTY_NEW_JOB: NewManualJob = {
  title: '',
  employer: '',
  location: '',
  deadline_raw: '',
  expires_on: '',
  profession: '',
  gender: '',
  description: '',
  education: '',
  experience: '',
  source_url: '',
};

type StatusFilter = 'all' | 'active' | 'hidden' | 'expired';
const PAGE_SIZE = 20;

export function AdminJobsPage() {
  const { isAdmin, checking } = useIsAdmin();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [duplicatesOnly, setDuplicatesOnly] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Job>>({});
  const [page, setPage] = useState(1);
  const [addingNew, setAddingNew] = useState(false);
  const [newJob, setNewJob] = useState<NewManualJob>(EMPTY_NEW_JOB);
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

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
  const statusColors: Record<Job['status'], string> = {
    active: '#3C7A5C',
    hidden: '#8A8A8A',
    expired: '#A83A3A',
  };

  const visibleJobs = useMemo(() => {
    let list = jobs;
    if (statusFilter !== 'all') list = list.filter((j) => j.status === statusFilter);
    if (duplicatesOnly) list = list.filter((j) => duplicateGroupColor.has(j.id));
    return list;
  }, [jobs, statusFilter, duplicatesOnly, duplicateGroupColor]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, duplicatesOnly]);

  const totalPages = Math.max(1, Math.ceil(visibleJobs.length / PAGE_SIZE));
  const pageJobs = visibleJobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  async function handleCreateJob() {
    if (!newJob.title.trim()) {
      setCreateError('Title is required.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    const { error } = await createManualJob({
      ...newJob,
      employer: newJob.employer?.trim() || null,
      location: newJob.location?.trim() || null,
      deadline_raw: newJob.deadline_raw?.trim() || null,
      expires_on: newJob.expires_on?.trim() || null,
      profession: newJob.profession?.trim() || null,
      gender: newJob.gender?.trim() || null,
      description: newJob.description?.trim() || null,
      education: newJob.education?.trim() || null,
      experience: newJob.experience?.trim() || null,
      source_url: newJob.source_url?.trim() || null,
    });
    setCreating(false);
    if (error) {
      setCreateError(error);
      return;
    }
    setNewJob(EMPTY_NEW_JOB);
    setAddingNew(false);
    load();
  }

  const totalDuplicateJobs = Array.from(duplicateGroupColor.keys()).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
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
          className="rounded-(--radius-md) border border-(--color-line) px-3 py-1.5 text-sm font-medium text-(--color-lapis) hover:bg-(--color-lapis)/5"
        >
          Refresh
        </button>

        <button onClick={() => setAddingNew((v) => !v)} className={`ml-auto ${btnPrimary}`}>
          <IconPlus />
          Add job
        </button>
      </div>

      {addingNew && (
        <div className="mt-4 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-4">
          <h2 className="text-sm font-semibold text-(--color-ink)">New manual job listing</h2>
          <div className="mt-3 space-y-2">
            <input
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm font-semibold"
              placeholder="Job title *"
              value={newJob.title}
              onChange={(e) => setNewJob((d) => ({ ...d, title: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <input
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Employer"
                value={newJob.employer ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, employer: e.target.value }))}
              />
              <input
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Location"
                value={newJob.location ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, location: e.target.value }))}
              />
              <input
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Deadline (display text)"
                value={newJob.deadline_raw ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, deadline_raw: e.target.value }))}
              />
              <input
                type="date"
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                value={newJob.expires_on ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, expires_on: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <input
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Profession"
                value={newJob.profession ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, profession: e.target.value }))}
              />
              <input
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Gender (optional)"
                value={newJob.gender ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, gender: e.target.value }))}
              />
              <input
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Apply link (URL or mailto:, optional)"
                value={newJob.source_url ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, source_url: e.target.value }))}
              />
            </div>
            <textarea
              className="w-full rounded border border-(--color-line) px-2 py-1.5 text-sm"
              placeholder="Description"
              rows={3}
              value={newJob.description ?? ''}
              onChange={(e) => setNewJob((d) => ({ ...d, description: e.target.value }))}
            />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <textarea
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Education requirements"
                rows={2}
                value={newJob.education ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, education: e.target.value }))}
              />
              <textarea
                className="rounded border border-(--color-line) px-2 py-1.5 text-sm"
                placeholder="Experience requirements"
                rows={2}
                value={newJob.experience ?? ''}
                onChange={(e) => setNewJob((d) => ({ ...d, experience: e.target.value }))}
              />
            </div>

            {createError && <p className="text-sm text-(--color-danger)">{createError}</p>}

            <div className="flex flex-wrap gap-2 pt-1">
              <button onClick={handleCreateJob} disabled={creating} className={btnPrimary}>
                {creating ? 'Publishing…' : 'Publish job'}
              </button>
              <button
                onClick={() => {
                  setAddingNew(false);
                  setNewJob(EMPTY_NEW_JOB);
                  setCreateError(null);
                }}
                className={btnSecondarySm}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <LoadingBlock label="Loading jobs…" />
      ) : (
        <div className="mt-6 space-y-2">
          {pageJobs.map((job) => {
            const groupIdx = duplicateGroupColor.get(job.id);
            const borderColor =
              groupIdx !== undefined ? groupColors[groupIdx % groupColors.length] : statusColors[job.status];
            const isEditing = editingId === job.id;

            return (
              <div
                key={job.id}
                className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) p-4 shadow-sm transition-shadow hover:shadow-md"
                style={{ borderLeft: `4px solid ${borderColor}` }}
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
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => saveEdit(job.id)} className={btnPrimary}>
                        Save
                      </button>
                      <button onClick={() => setEditingId(null)} className={btnSecondarySm}>
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-(--color-ink)">{job.title}</h3>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            job.status === 'active'
                              ? 'bg-(--color-success)/10 text-(--color-success)'
                              : job.status === 'expired'
                                ? 'bg-(--color-danger)/10 text-(--color-danger)'
                                : 'bg-(--color-muted)/10 text-(--color-muted)'
                          }`}
                        >
                          {job.status}
                        </span>
                        <span className="rounded-full bg-(--color-lapis)/10 px-2 py-0.5 text-[11px] font-medium text-(--color-lapis)">
                          {job.source_label ?? job.source}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-(--color-muted)">
                        {job.employer && <span>{job.employer}</span>}
                        {job.location && <span>📍 {job.location}</span>}
                        {job.deadline_raw && <span>⏳ {job.deadline_raw}</span>}
                        {job.profession && <span>{job.profession}</span>}
                        {job.gender && <span>{job.gender}</span>}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                      <button onClick={() => startEdit(job)} className={btnSecondarySm}>
                        Edit
                      </button>
                      <button onClick={() => handleToggleStatus(job)} className={btnSecondarySm}>
                        {job.status === 'active' ? 'Hide' : 'Unhide'}
                      </button>
                      <button onClick={() => handleDelete(job)} className={btnDangerOutlineSm}>
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

          {totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between text-sm">
              <p className="text-(--color-muted)">
                Page {page} of {totalPages} · {visibleJobs.length} jobs
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
        </div>
      )}
    </div>
  );
}
