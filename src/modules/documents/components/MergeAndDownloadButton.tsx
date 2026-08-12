import { useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { mergeAndDownloadDocuments } from '../lib/mergeDocuments';
import { trackEvent } from '../../../lib/analytics/ga';
import { btnPrimary } from '../../../components/ui/buttonStyles';
import { IconDownload } from '../../../components/ui/icons';
import type { DocumentEntry } from '../types/document';
import { ALL_IN_ONE_TYPE } from './AllInOneUpload';

export function MergeAndDownloadButton({ entries }: { entries: DocumentEntry[] }) {
  const { tr } = useLanguage();
  const [busy, setBusy] = useState(false);
  const [progressLabel, setProgressLabel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [skippedMsg, setSkippedMsg] = useState<string | null>(null);

  const mergeableEntries = entries.filter((e) => e.document_type !== ALL_IN_ONE_TYPE && e.files.length > 0);
  const fileCount = mergeableEntries.reduce((sum, e) => sum + e.files.length, 0);

  async function handleMerge() {
    if (fileCount === 0) {
      setError(tr('documents', 'mergeNoFiles'));
      return;
    }
    setError(null);
    setSkippedMsg(null);
    setBusy(true);
    try {
      const { skipped } = await mergeAndDownloadDocuments(mergeableEntries, (progress) => {
        setProgressLabel(`${progress.current}/${progress.total} — ${progress.currentFileName}`);
      });
      trackEvent({ name: 'documents_merged_downloaded', file_count: fileCount });
      if (skipped.length > 0) {
        setSkippedMsg(`${tr('documents', 'mergeSkippedSome')}${skipped.join(', ')}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to merge documents.');
    } finally {
      setBusy(false);
      setProgressLabel(null);
    }
  }

  return (
    <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
      <h2 className="font-display text-base font-semibold text-(--color-ink)">
        {tr('documents', 'mergeDownloadTitle')}
      </h2>
      <p className="mt-1 text-sm text-(--color-muted)">{tr('documents', 'mergeDownloadHint')}</p>

      <button onClick={handleMerge} disabled={busy} className={`mt-4 ${btnPrimary}`}>
        <IconDownload />
        {busy ? progressLabel ?? tr('documents', 'merging') : tr('documents', 'mergeDownloadButton')}
      </button>

      {error && <p className="mt-2 text-sm text-(--color-danger)">{error}</p>}
      {skippedMsg && <p className="mt-2 text-sm text-(--color-muted)">{skippedMsg}</p>}
    </div>
  );
}
