import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../../lib/auth/AuthContext';
import { fetchJobAlerts, createJobAlert, deleteJobAlert } from '../api/jobAlertsApi';
import type { JobAlert } from '../api/jobAlertsApi';
import { AFGHAN_PROVINCES } from '../data/provinces';
import { btnPrimary, btnDangerOutlineSm } from '../../../components/ui/buttonStyles';
import { IconTrash } from '../../../components/ui/icons';

export function JobAlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const [alerts, setAlerts] = useState<JobAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [province, setProvince] = useState('all');
  const [profession, setProfession] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    load();
  }, [user]);

  async function load() {
    if (!user) return;
    setLoading(true);
    const data = await fetchJobAlerts(user.id);
    setAlerts(data);
    setLoading(false);
  }

  async function handleCreate() {
    if (!user) return;
    setError(null);
    setSaving(true);
    const label = [province !== 'all' ? province : null, profession.trim() || null].filter(Boolean).join(' · ') || 'Any new job';
    const { error: createError } = await createJobAlert(user.id, {
      label,
      province,
      profession: profession.trim() || 'all',
    });
    setSaving(false);
    if (createError) {
      setError(createError);
      return;
    }
    setProvince('all');
    setProfession('');
    load();
  }

  async function handleDelete(alertId: string) {
    await deleteJobAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }

  if (authLoading) return null;
  if (!user) return <Navigate to="/sign-in" replace />;

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Job Alerts</h1>
      <p className="mt-1 text-(--color-muted)">
        Get notified in-app when a new job matching your criteria is posted while you're on the site.
      </p>
      <p className="mt-1 text-xs text-(--color-muted)">
        Note: this notifies you while you have Hamqar open in a tab — it doesn't send email or Telegram
        messages when you're away. That would need a server-side piece we haven't built yet.
      </p>

      <div className="mt-6 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-4">
        <h2 className="text-sm font-semibold text-(--color-ink)">New alert</h2>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2 text-sm"
          >
            <option value="all">Any province</option>
            {AFGHAN_PROVINCES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          <input
            value={profession}
            onChange={(e) => setProfession(e.target.value)}
            placeholder="Profession (optional, e.g. Nursing)"
            className="flex-1 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2 text-sm"
          />
          <button onClick={handleCreate} disabled={saving} className={btnPrimary}>
            {saving ? 'Adding…' : 'Add alert'}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-(--color-danger)">{error}</p>}
      </div>

      <div className="mt-6 space-y-2">
        {loading ? (
          <p className="text-sm text-(--color-muted)">Loading…</p>
        ) : alerts.length === 0 ? (
          <p className="text-sm text-(--color-muted)">No alerts yet — add one above.</p>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="flex items-center justify-between rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2.5"
            >
              <span className="text-sm text-(--color-ink)">{alert.label ?? 'Any new job'}</span>
              <button onClick={() => handleDelete(alert.id)} className={btnDangerOutlineSm}>
                <IconTrash />
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
