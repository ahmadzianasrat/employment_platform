import { useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { getSignedUrl, deleteFile } from '../api/documentsApi';
import { downloadFile } from '../../../lib/utils/downloadFile';
import { btnLapisOutlineSm, btnDangerOutlineSm } from '../../../components/ui/buttonStyles';
import { IconDownload, IconEye, IconTrash } from '../../../components/ui/icons';
import type { DocumentFile } from '../types/document';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DocumentFilesList({
  files,
  onFileRemoved,
}: {
  files: DocumentFile[];
  onFileRemoved: (fileId: string) => void;
}) {
  const { tr } = useLanguage();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyAction, setBusyAction] = useState<'view' | 'download' | 'remove' | null>(null);

  async function handleView(file: DocumentFile) {
    setBusyId(file.id);
    setBusyAction('view');
    const url = await getSignedUrl(file.storage_path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
    setBusyId(null);
    setBusyAction(null);
  }

  async function handleDownload(file: DocumentFile) {
    setBusyId(file.id);
    setBusyAction('download');
    try {
      const url = await getSignedUrl(file.storage_path);
      if (url) await downloadFile(url, file.original_filename);
    } finally {
      setBusyId(null);
      setBusyAction(null);
    }
  }

  async function handleRemove(file: DocumentFile) {
    setBusyId(file.id);
    setBusyAction('remove');
    await deleteFile(file);
    onFileRemoved(file.id);
    setBusyId(null);
    setBusyAction(null);
  }

  if (files.length === 0) {
    return <p className="text-sm text-(--color-muted)">{tr('documents', 'noFilesYet')}</p>;
  }

  return (
    <ul className="space-y-2">
      {files.map((file) => {
        const isBusy = busyId === file.id;
        return (
          <li
            key={file.id}
            className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2.5"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="min-w-0 truncate text-sm" title={file.original_filename}>
                {file.original_filename}{' '}
                <span className="text-(--color-muted)">({formatSize(file.size_bytes)})</span>
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <button onClick={() => handleView(file)} disabled={isBusy} className={btnLapisOutlineSm}>
                <IconEye />
                {tr('documents', 'view')}
              </button>
              <button onClick={() => handleDownload(file)} disabled={isBusy} className={btnLapisOutlineSm}>
                <IconDownload />
                {isBusy && busyAction === 'download' ? tr('documents', 'downloading') : tr('documents', 'download')}
              </button>
              <button onClick={() => handleRemove(file)} disabled={isBusy} className={btnDangerOutlineSm}>
                <IconTrash />
                {tr('documents', 'remove')}
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
