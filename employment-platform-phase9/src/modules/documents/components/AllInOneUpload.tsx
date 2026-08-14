import { useRef, useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { createEntryWithFiles, deleteEntry } from '../api/documentsApi';
import { trackEvent } from '../../../lib/analytics/ga';
import { DocumentFilesList } from './DocumentFilesList';
import { btnPrimary, btnDashed } from '../../../components/ui/buttonStyles';
import { IconPlus } from '../../../components/ui/icons';
import type { DocumentEntry } from '../types/document';

export const ALL_IN_ONE_TYPE = 'all_in_one';

export function AllInOneUpload({
  userId,
  entry,
  onChanged,
}: {
  userId: string;
  entry: DocumentEntry | undefined;
  onChanged: () => void;
}) {
  const { tr } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    if (file.type !== 'application/pdf') {
      setError(tr('documents', 'allInOnePdfOnly'));
      return;
    }
    setError(null);
    setUploading(true);

    // Single-entry slot: replace whatever was there before.
    if (entry) {
      await deleteEntry(entry.id, entry.files);
    }
    const { error: uploadError } = await createEntryWithFiles(userId, ALL_IN_ONE_TYPE, null, [file]);
    setUploading(false);
    if (uploadError) {
      setError(uploadError);
      return;
    }
    trackEvent({ name: 'all_in_one_document_uploaded' });
    onChanged();
  }

  return (
    <div className="rounded-(--radius-lg) border-2 border-dashed border-(--color-lapis)/30 bg-(--color-lapis)/5 p-5">
      <h2 className="font-display text-base font-semibold text-(--color-ink)">
        {tr('documents', 'allInOneTitle')}
      </h2>
      <p className="mt-1 text-sm text-(--color-muted)">{tr('documents', 'allInOneSubtitle')}</p>

      {entry && entry.files.length > 0 ? (
        <div className="mt-4">
          <DocumentFilesList
            files={entry.files}
            onFileRemoved={async () => {
              await deleteEntry(entry.id, []);
              onChanged();
            }}
          />
          <button onClick={() => inputRef.current?.click()} disabled={uploading} className={`mt-2 ${btnPrimary}`}>
            <IconPlus />
            {uploading ? tr('documents', 'uploading') : tr('documents', 'allInOneReplace')}
          </button>
        </div>
      ) : (
        <button onClick={() => inputRef.current?.click()} disabled={uploading} className={`mt-4 ${btnDashed}`}>
          <IconPlus />
          {uploading ? tr('documents', 'uploading') : tr('documents', 'allInOneUpload')}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={(e) => handleSelect(e.target.files)}
      />
      {error && <p className="mt-2 text-sm text-(--color-danger)">{error}</p>}
    </div>
  );
}
