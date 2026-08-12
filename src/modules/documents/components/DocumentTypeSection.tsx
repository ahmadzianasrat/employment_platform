import { useRef, useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { createEntryWithFiles, addFilesToEntry } from '../api/documentsApi';
import { trackEvent } from '../../../lib/analytics/ga';
import { ACCEPTED_FILE_EXTENSIONS } from '../data/documentTypes';
import { DocumentFilesList } from './DocumentFilesList';
import { btnSecondarySm, btnDashed } from '../../../components/ui/buttonStyles';
import { IconPlus } from '../../../components/ui/icons';
import type { DocumentEntry } from '../types/document';
import type { DocumentTypeConfig } from '../data/documentTypes';

interface Props {
  typeConfig: DocumentTypeConfig;
  entries: DocumentEntry[];
  userId: string;
  onChanged: () => void;
}

export function DocumentTypeSection({ typeConfig, entries, userId, onChanged }: Props) {
  const { tr } = useLanguage();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newLabel, setNewLabel] = useState('');
  const [addingNew, setAddingNew] = useState(entries.length === 0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleCreateEntry(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const { error } = await createEntryWithFiles(
      userId,
      typeConfig.key,
      typeConfig.repeatable ? newLabel || null : null,
      Array.from(files)
    );
    setUploading(false);
    if (error) {
      setError(error);
      return;
    }
    setNewLabel('');
    setAddingNew(false);
    trackEvent({ name: 'document_uploaded', document_type: typeConfig.key });
    onChanged();
  }

  async function handleAddFilesToEntry(entryId: string, files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const { error } = await addFilesToEntry(userId, entryId, Array.from(files));
    setUploading(false);
    if (error) {
      setError(error);
      return;
    }
    trackEvent({ name: 'document_uploaded', document_type: typeConfig.key });
    onChanged();
  }

  const showAddButton = typeConfig.repeatable && !addingNew;

  return (
    <div className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
      <h3 className="font-display text-base font-semibold text-(--color-ink)">
        {tr('documents', typeConfig.labelKey)}
      </h3>

      <div className="mt-3 space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className={entries.length > 1 ? 'border-t border-(--color-line) pt-3' : ''}>
            {entry.label && <p className="mb-2 text-sm font-medium text-(--color-ink)">{entry.label}</p>}
            <DocumentFilesList files={entry.files} onFileRemoved={onChanged} />
            <label className={`${btnSecondarySm} mt-2 cursor-pointer`}>
              <IconPlus />
              {tr('documents', 'addFiles')}
              <input
                type="file"
                multiple
                accept={ACCEPTED_FILE_EXTENSIONS}
                className="hidden"
                onChange={(e) => handleAddFilesToEntry(entry.id, e.target.files)}
              />
            </label>
          </div>
        ))}

        {addingNew && (
          <div className={entries.length > 0 ? 'border-t border-(--color-line) pt-3' : ''}>
            {typeConfig.repeatable && (
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder={tr('documents', 'labelPlaceholder')}
                className="mb-2 w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2 text-sm outline-none focus:border-(--color-lapis)"
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ACCEPTED_FILE_EXTENSIONS}
              disabled={uploading}
              onChange={(e) => handleCreateEntry(e.target.files)}
              className="block w-full text-sm text-(--color-muted) file:mr-3 file:rounded-(--radius-md) file:border-0 file:bg-(--color-lapis) file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
            />
          </div>
        )}

        {uploading && <p className="text-xs text-(--color-muted)">{tr('documents', 'uploading')}</p>}
        {error && <p className="text-xs text-(--color-danger)">{error}</p>}

        {showAddButton && (
          <button onClick={() => setAddingNew(true)} className={btnDashed}>
            <IconPlus />
            {tr('documents', 'addNew')}
          </button>
        )}
      </div>
    </div>
  );
}
