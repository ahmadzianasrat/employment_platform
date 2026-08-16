import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import {
  fetchAllServiceRequestsForAdmin,
  getServiceRequestFileUrl,
  setServiceRequestStatus,
  setJobSlotStatus,
  uploadDeliverable,
  type AdminServiceRequest,
} from '../api/adminOrdersApi';
import { AdminNav } from '../components/AdminNav';
import { btnLapisOutlineSm, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { FileInputButton } from '../../../components/ui/FileInputButton';
import { IconEye, IconChevronDown } from '../../../components/ui/icons';
import { LoadingBlock } from '../../../components/ui/Spinner';
import type { ServiceRequestStatus, JobSlotStatus } from '../../orders/types/order';

const STATUS_OPTIONS: ServiceRequestStatus[] = ['new', 'in_progress', 'delivered', 'cancelled'];
const JOB_STATUS_OPTIONS: JobSlotStatus[] = ['pending', 'in_progress', 'delivered'];

const STATUS_COLOR: Record<ServiceRequestStatus, string> = {
  new: 'bg-(--color-saffron)/15 text-(--color-saffron)',
  in_progress: 'bg-(--color-lapis)/12 text-(--color-lapis)',
  delivered: 'bg-(--color-success)/12 text-(--color-success)',
  cancelled: 'bg-(--color-danger)/10 text-(--color-danger)',
};

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString();
}

function OrderCard({ order, onRefresh }: { order: AdminServiceRequest; onRefresh: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleView(path: string | null) {
    if (!path) return;
    const url = await getServiceRequestFileUrl(path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleOrderStatus(status: ServiceRequestStatus) {
    setBusy(true);
    try {
      await setServiceRequestStatus(order.id, status);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setBusy(false);
    }
  }

  async function handleJobStatus(jobId: string, status: JobSlotStatus) {
    setBusy(true);
    try {
      await setJobSlotStatus(jobId, status);
      onRefresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update job status.');
    } finally {
      setBusy(false);
    }
  }

  async function handleDeliverableUpload(jobId: string, kind: 'cv' | 'cover_letter', file: File | null) {
    if (!file) return;
    setBusy(true);
    setError(null);
    const { error: uploadError } = await uploadDeliverable(order.user_id, jobId, kind, file);
    setBusy(false);
    if (uploadError) {
      setError(uploadError);
      return;
    }
    onRefresh();
  }

  return (
    <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised)">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-start"
        aria-expanded={expanded}
      >
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-semibold text-(--color-ink)">
            {order.ownerEmail ?? 'unknown account'}
            {order.ownerProfileName && <span className="font-normal text-(--color-muted)"> · {order.ownerProfileName}</span>}
          </p>
          <p className="mt-0.5 text-xs text-(--color-muted)">
            {order.tier === '1' ? '1 application' : '3 applications'} · {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[order.status]}`}>{order.status.replace('_', ' ')}</span>
          <IconChevronDown className={`h-4 w-4 text-(--color-muted) transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {expanded && (
        <div className="border-t border-(--color-line) p-5">
          <p className="text-sm text-(--color-muted)">
            {order.contact_name} · {order.contact_phone}
          </p>

          <div className="mt-3 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) p-3 text-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
              Payment — {order.payment_method === 'easy_load' ? 'Easy-load' : 'HesabPay'}
            </h3>
            <ul className="mt-1 space-y-0.5 text-(--color-ink)">
              <li>Sender/agent number: {order.payment_sender_number ?? '—'}</li>
              {order.payment_method === 'hesab_pay' && <li>Account owner: {order.payment_account_owner ?? '—'}</li>}
              <li>Sent at: {formatDate(order.payment_sent_at)}</li>
              {order.payment_transaction_id && <li>Transaction ID: {order.payment_transaction_id}</li>}
            </ul>
            {order.payment_proof_storage_path && (
              <button onClick={() => handleView(order.payment_proof_storage_path)} className={`${btnLapisOutlineSm} mt-2`}>
                <IconEye />
                View payment proof
              </button>
            )}
          </div>

          {order.notes && <p className="mt-3 text-sm text-(--color-muted)">Note from customer: {order.notes}</p>}

          <div className="mt-4 space-y-3">
            {order.jobs.map((job, i) => (
              <div key={job.id} className="rounded-(--radius-md) border border-(--color-line) p-3.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">Job {i + 1}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[job.status === 'pending' ? 'new' : job.status]}`}>
                    {job.status.replace('_', ' ')}
                  </span>
                </div>
                {job.target_job_link && (
                  <p className="mt-1.5 break-all text-sm">
                    <a href={job.target_job_link} target="_blank" rel="noopener noreferrer" className="text-(--color-lapis) hover:underline">
                      {job.target_job_link}
                    </a>
                  </p>
                )}
                {job.target_job_note && <p className="mt-1 text-sm text-(--color-ink)">{job.target_job_note}</p>}
                {job.screenshot_storage_path && (
                  <button onClick={() => handleView(job.screenshot_storage_path)} className={`${btnLapisOutlineSm} mt-2`}>
                    <IconEye />
                    View job screenshot
                  </button>
                )}

                <div className="mt-3 grid gap-3 border-t border-(--color-line) pt-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-medium text-(--color-muted)">Deliver CV</p>
                    <FileInputButton
                      label={job.delivered_cv_storage_path ? 'Replace file' : 'Upload CV'}
                      selectedLabel="Uploaded"
                      accept=".pdf"
                      file={null}
                      onChange={(f) => handleDeliverableUpload(job.id, 'cv', f)}
                    />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-(--color-muted)">Deliver cover letter</p>
                    <FileInputButton
                      label={job.delivered_cover_letter_storage_path ? 'Replace file' : 'Upload cover letter'}
                      selectedLabel="Uploaded"
                      accept=".pdf"
                      file={null}
                      onChange={(f) => handleDeliverableUpload(job.id, 'cover_letter', f)}
                    />
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {JOB_STATUS_OPTIONS.map((s) => (
                    <button key={s} disabled={busy || job.status === s} onClick={() => handleJobStatus(job.id, s)} className={btnSecondarySm}>
                      Mark {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {error && <p className="mt-3 text-sm text-(--color-danger)">{error}</p>}

          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-(--color-line) pt-3">
            <span className="text-xs font-medium text-(--color-muted)">
              Order status is set automatically from the job statuses above.
            </span>
            {order.status === 'cancelled' ? (
              <button disabled={busy} onClick={() => handleOrderStatus('in_progress')} className={btnSecondarySm}>
                Reopen order
              </button>
            ) : (
              <button disabled={busy} onClick={() => handleOrderStatus('cancelled')} className={btnSecondarySm}>
                Cancel order
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function AdminOrdersPage() {
  const { isAdmin, checking: adminChecking } = useIsAdmin();

  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceRequestStatus>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllServiceRequestsForAdmin();
      setRequests(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [r.ownerEmail, r.contact_name, r.contact_phone, ...r.jobs.map((j) => j.target_job_link)].filter(Boolean).join(' ').toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [requests, statusFilter, search]);

  if (adminChecking) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Admin — Paid Service Orders</h1>
      <p className="mt-1 text-sm text-(--color-muted)">
        Click an order to expand it. Verify the payment proof, work each job to "In progress," upload the finished
        CV/cover letter per job, then mark it delivered — the customer will see it on their Profile page.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email, name, phone, or job link…"
          className="min-w-[240px] flex-1 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-(--color-danger)">{error}</p>}
      {loading && <LoadingBlock label="Loading orders…" />}
      {!loading && filtered.length === 0 && <p className="mt-8 text-sm text-(--color-muted)">No orders match your filters.</p>}

      <div className="mt-6 space-y-3">
        {filtered.map((r) => (
          <OrderCard key={r.id} order={r} onRefresh={load} />
        ))}
      </div>
    </div>
  );
}
