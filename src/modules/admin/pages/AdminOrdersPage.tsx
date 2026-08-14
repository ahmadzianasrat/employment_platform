import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import {
  fetchAllServiceRequestsForAdmin,
  getServiceRequestFileUrl,
  setServiceRequestStatus,
  type AdminServiceRequest,
} from '../api/adminOrdersApi';
import { AdminNav } from '../components/AdminNav';
import { btnLapisOutlineSm, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { IconEye } from '../../../components/ui/icons';
import { LoadingBlock } from '../../../components/ui/Spinner';
import type { ServiceRequestStatus } from '../../orders/types/order';

const STATUS_OPTIONS: ServiceRequestStatus[] = ['new', 'in_progress', 'delivered', 'cancelled'];

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

export function AdminOrdersPage() {
  const { isAdmin, checking: adminChecking } = useIsAdmin();

  const [requests, setRequests] = useState<AdminServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | ServiceRequestStatus>('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

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
      setError(e instanceof Error ? e.message : 'Failed to load service requests.');
    } finally {
      setLoading(false);
    }
  }

  async function handleView(path: string | null) {
    if (!path) return;
    const url = await getServiceRequestFileUrl(path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleStatusChange(id: string, status: ServiceRequestStatus) {
    setBusyId(id);
    try {
      await setServiceRequestStatus(id, status);
      setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status.');
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      if (statusFilter !== 'all' && r.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const hay = [r.ownerEmail, r.contact_name, r.contact_phone, r.target_job_link].filter(Boolean).join(' ').toLowerCase();
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
        Requests for the paid CV + cover letter + application package. Verify the payment proof before moving a
        request to "In progress", then prepare and deliver the final PDF manually (outside this app) and mark it
        "Delivered".
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

      <div className="mt-6 space-y-4">
        {filtered.map((r) => (
          <div key={r.id} className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-base font-semibold text-(--color-lapis)">
                  {r.contact_name} — {r.ownerEmail ?? 'unknown account'}
                </h2>
                <p className="text-sm text-(--color-muted)">
                  {r.contact_phone} · Tier: {r.tier === '1' ? '1 application (80 AFN)' : '3 applications (200 AFN)'} · Submitted{' '}
                  {formatDate(r.created_at)}
                </p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_COLOR[r.status]}`}>
                {r.status.replace('_', ' ')}
              </span>
            </div>

            <div className="mt-3 grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">Target job</h3>
                {r.target_job_link && (
                  <p className="mt-1 break-all">
                    <a href={r.target_job_link} target="_blank" rel="noopener noreferrer" className="text-(--color-lapis) hover:underline">
                      {r.target_job_link}
                    </a>
                  </p>
                )}
                {r.target_job_note && <p className="mt-1 text-(--color-ink)">{r.target_job_note}</p>}
                {r.screenshot_storage_path && (
                  <button onClick={() => handleView(r.screenshot_storage_path)} className={`${btnLapisOutlineSm} mt-2`}>
                    <IconEye />
                    View job screenshot
                  </button>
                )}
              </div>

              <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) p-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">
                  Payment — {r.payment_method === 'easy_load' ? 'Easy-load' : 'HesabPay'}
                </h3>
                <ul className="mt-1 space-y-0.5 text-(--color-ink)">
                  <li>Sender/agent number: {r.payment_sender_number ?? '—'}</li>
                  {r.payment_method === 'hesab_pay' && <li>Account owner: {r.payment_account_owner ?? '—'}</li>}
                  <li>Sent at: {formatDate(r.payment_sent_at)}</li>
                  {r.payment_transaction_id && <li>Transaction ID: {r.payment_transaction_id}</li>}
                </ul>
                {r.payment_proof_storage_path && (
                  <button onClick={() => handleView(r.payment_proof_storage_path)} className={`${btnLapisOutlineSm} mt-2`}>
                    <IconEye />
                    View payment proof
                  </button>
                )}
              </div>
            </div>

            {r.notes && <p className="mt-3 text-sm text-(--color-muted)">Note from customer: {r.notes}</p>}

            <div className="mt-4 flex flex-wrap gap-2 border-t border-(--color-line) pt-3">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  disabled={busyId === r.id || r.status === s}
                  onClick={() => handleStatusChange(r.id, s)}
                  className={btnSecondarySm}
                >
                  Mark {s.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
