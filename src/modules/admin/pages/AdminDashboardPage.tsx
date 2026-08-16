import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { fetchDashboardStats, type DashboardStats } from '../api/adminDashboardApi';
import { AdminNav } from '../components/AdminNav';
import { LoadingBlock } from '../../../components/ui/Spinner';
import { IconWallet, IconFileText, IconCheck } from '../../../components/ui/icons';

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-bold text-(--color-ink)">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-(--color-muted)">{sub}</p>}
    </div>
  );
}

export function AdminDashboardPage() {
  const { isAdmin, checking: adminChecking } = useIsAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAdmin) return;
    fetchDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (adminChecking) return null;
  if (!isAdmin) return <Navigate to="/" replace />;
  if (loading || !stats) return <LoadingBlock label="Loading dashboard…" className="py-16" />;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Admin — Dashboard</h1>
      <p className="mt-1 text-sm text-(--color-muted)">
        A quick snapshot. Revenue is estimated from order tiers (80/200 AFN), not a real payment ledger — it
        counts every non-cancelled order regardless of whether every job in it has been delivered yet.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="New orders" value={stats.ordersByStatus.new} />
        <StatCard label="In progress" value={stats.ordersByStatus.in_progress} />
        <StatCard label="Delivered" value={stats.ordersByStatus.delivered} />
        <StatCard label="Cancelled" value={stats.ordersByStatus.cancelled} />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <StatCard label="Estimated revenue" value={`${stats.estimatedRevenueAfn} AFN`} sub={`${stats.totalOrders} total orders`} />
        <StatCard label="Job slots pending" value={stats.jobsPendingCount} sub="Not yet delivered, across all orders" />
        <StatCard label="Documents to verify" value={stats.documentsPendingVerification} sub="Unverified uploads across all users" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-semibold text-(--color-ink)">Recent orders</h2>
            <Link to="/admin/orders" className="text-sm font-medium text-(--color-lapis) hover:underline">
              View all
            </Link>
          </div>
          <div className="mt-3 space-y-2">
            {stats.recentOrders.length === 0 && <p className="text-sm text-(--color-muted)">No orders yet.</p>}
            {stats.recentOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-(--radius-md) border border-(--color-line) px-3 py-2 text-sm">
                <span className="text-(--color-ink)">{o.contactName}</span>
                <span className="text-(--color-muted)">
                  {o.tier === '1' ? '1 application' : '3 applications'} · {o.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
          <h2 className="font-display text-base font-semibold text-(--color-ink)">Quick links</h2>
          <div className="mt-3 space-y-2">
            <Link to="/admin/orders" className="flex items-center gap-2.5 rounded-(--radius-md) border border-(--color-line) px-3 py-2.5 text-sm hover:border-(--color-lapis)">
              <IconWallet className="h-4 w-4 text-(--color-lapis)" />
              Review and fulfill orders
            </Link>
            <Link to="/admin/documents" className="flex items-center gap-2.5 rounded-(--radius-md) border border-(--color-line) px-3 py-2.5 text-sm hover:border-(--color-lapis)">
              <IconFileText className="h-4 w-4 text-(--color-lapis)" />
              Verify uploaded documents
            </Link>
            <Link to="/admin/blog" className="flex items-center gap-2.5 rounded-(--radius-md) border border-(--color-line) px-3 py-2.5 text-sm hover:border-(--color-lapis)">
              <IconCheck className="h-4 w-4 text-(--color-lapis)" />
              Publish blog drafts ({stats.blogDrafts})
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
