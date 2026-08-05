import { useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { getSignedUrl, deleteFile } from '../api/documentsApi';
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

  async function handleView(file: DocumentFile) {
    const url = await getSignedUrl(file.storage_path);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function handleRemove(file: DocumentFile) {
    setBusyId(file.id);
    await deleteFile(file);
    onFileRemoved(file.id);
    setBusyId(null);
  }

  if (files.length === 0) {
    return <p className="text-sm text-(--color-muted)">{tr('documents', 'noFilesYet')}</p>;
  }

  return (
    <ul className="space-y-1.5">
      {files.map((file) => (
        <li
          key={file.id}
          className="flex items-center justify-between gap-3 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2 text-sm"
        >
          <span className="truncate" title={file.original_filename}>
            {file.original_filename}{' '}
            <span className="text-(--color-muted)">({formatSize(file.size_bytes)})</span>
          </span>
          <span className="flex shrink-0 gap-2">
            <button
              onClick={() => handleView(file)}
              className="text-xs font-medium text-(--color-lapis) hover:underline"
            >
              {tr('documents', 'view')}
            </button>
            <button
              onClick={() => handleRemove(file)}
              disabled={busyId === file.id}
              className="text-xs font-medium text-(--color-danger) hover:underline disabled:opacity-50"
            >
              {tr('documents', 'remove')}
            </button>
          </span>
        </li>
      ))}
    </ul>
  );
}
