import { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { useAuth } from '../../../lib/auth/AuthContext';
import { useIsAdmin } from '../hooks/useIsAdmin';
import { fetchAllDocumentsForAdmin, getSignedUrlForAdmin, setEntryVerified } from '../api/adminDocumentsApi';
import type { AdminDocumentEntry } from '../api/adminDocumentsApi';
import { downloadFile } from '../../../lib/utils/downloadFile';
import { AdminNav } from '../components/AdminNav';
import { DOCUMENT_TYPES } from '../../documents/data/documentTypes';
import { btnLapisOutlineSm, btnSecondarySm } from '../../../components/ui/buttonStyles';
import { IconDownload, IconEye, IconCheck, IconShieldCheck } from '../../../components/ui/icons';
import { LoadingBlock } from '../../../components/ui/Spinner';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function AdminDocumentsPage() {
  const { isAdmin, checking: adminChecking } = useIsAdmin();
  const { user } = useAuth();
  const { tr } = useLanguage();

  const [entries, setEntries] = useState<AdminDocumentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [busyEntryId, setBusyEntryId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    load();
  }, [isAdmin]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAllDocumentsForAdmin();
      setEntries(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }

  async function handleView(storagePath: string) {
    const url = await getSignedUrlForAdmin(storagePath);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleDownload(storagePath: string, filename: string) {
    const url = await getSignedUrlForAdmin(storagePath);
    if (!url) return;
    await downloadFile(url, filename);
  }

  async function handleToggleVerified(entry: AdminDocumentEntry) {
    if (!user) return;
    setBusyEntryId(entry.id);
    try {
      await setEntryVerified(entry.id, !entry.verified, user.id);
      setEntries((prev) =>
        prev.map((e) =>
          e.id === entry.id
            ? { ...e, verified: !e.verified, verified_at: !e.verified ? new Date().toISOString() : null }
            : e
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update verification status.');
    } finally {
      setBusyEntryId(null);
    }
  }

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (typeFilter !== 'all' && e.document_type !== typeFilter) return false;
      if (verifiedFilter === 'verified' && !e.verified) return false;
      if (verifiedFilter === 'unverified' && e.verified) return false;
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const matchesEmail = e.ownerEmail?.toLowerCase().includes(q);
        const matchesLabel = e.label?.toLowerCase().includes(q);
        if (!matchesEmail && !matchesLabel) return false;
      }
      return true;
    });
  }, [entries, typeFilter, verifiedFilter, search]);

  // Group by owner so an admin can review one person's whole document set at a time.
  const grouped = useMemo(() => {
    const map = new Map<string, { ownerEmail: string | null; entries: AdminDocumentEntry[] }>();
    for (const entry of filtered) {
      const key = entry.user_id;
      if (!map.has(key)) map.set(key, { ownerEmail: entry.ownerEmail, entries: [] });
      map.get(key)!.entries.push(entry);
    }
    return Array.from(map.values());
  }, [filtered]);

  if (adminChecking) return null;
  if (!isAdmin) return <Navigate to="/" replace />;

  function typeLabel(documentType: string): string {
    if (documentType === 'all_in_one') return 'All-in-one PDF';
    const config = DOCUMENT_TYPES.find((t) => t.key === documentType);
    return config ? tr('documents', config.labelKey) : documentType;
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <AdminNav />
      <h1 className="font-display text-2xl font-semibold text-(--color-ink)">Admin — Document Review</h1>
      <p className="mt-1 text-sm text-(--color-muted)">
        Read-only access to documents users have uploaded for their applications. You can view, download, and mark
        entries as verified — you cannot edit or delete a user's files here.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or label…"
          className="min-w-[220px] flex-1 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm"
        />
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm"
        >
          <option value="all">All document types</option>
          {DOCUMENT_TYPES.map((t) => (
            <option key={t.key} value={t.key}>
              {tr('documents', t.labelKey)}
            </option>
          ))}
        </select>
        <select
          value={verifiedFilter}
          onChange={(e) => setVerifiedFilter(e.target.value as typeof verifiedFilter)}
          className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm"
        >
          <option value="all">Verified + unverified</option>
          <option value="verified">Verified only</option>
          <option value="unverified">Unverified only</option>
        </select>
      </div>

      {error && <p className="mt-4 text-sm text-(--color-danger)">{error}</p>}
      {loading && <LoadingBlock label="Loading documents…" />}

      {!loading && grouped.length === 0 && (
        <p className="mt-8 text-sm text-(--color-muted)">No documents match your filters.</p>
      )}

      <div className="mt-6 space-y-6">
        {grouped.map((group) => (
          <div key={group.ownerEmail ?? Math.random()} className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <h2 className="font-display text-base font-semibold text-(--color-lapis)">
              {group.ownerEmail ?? 'Unknown user'}
            </h2>
            <div className="mt-3 space-y-3">
              {group.entries.map((entry) => (
                <div key={entry.id} className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-sm font-medium text-(--color-ink)">
                      {typeLabel(entry.document_type)}
                      {entry.label && <span className="text-(--color-muted)"> — {entry.label}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      {entry.verified && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-(--color-success)/12 px-2.5 py-1 text-xs font-semibold text-(--color-success)">
                          <IconShieldCheck />
                          Verified
                        </span>
                      )}
                      <button
                        onClick={() => handleToggleVerified(entry)}
                        disabled={busyEntryId === entry.id}
                        className={btnSecondarySm}
                      >
                        <IconCheck />
                        {entry.verified ? 'Unmark verified' : 'Mark verified'}
                      </button>
                    </div>
                  </div>

                  <ul className="mt-2 space-y-1.5">
                    {entry.files.map((file) => (
                      <li key={file.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <span className="min-w-0 truncate text-(--color-muted)" title={file.original_filename}>
                          {file.original_filename} ({formatSize(file.size_bytes)})
                        </span>
                        <span className="flex shrink-0 gap-2">
                          <button onClick={() => handleView(file.storage_path)} className={btnLapisOutlineSm}>
                            <IconEye />
                            View
                          </button>
                          <button
                            onClick={() => handleDownload(file.storage_path, file.original_filename)}
                            className={btnLapisOutlineSm}
                          >
                            <IconDownload />
                            Download
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
