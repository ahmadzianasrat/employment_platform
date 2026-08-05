import { useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { DOCUMENT_TYPES, ACCEPTED_FILE_EXTENSIONS } from '../data/documentTypes';
import { createEntryWithFiles, validateFile } from '../api/documentsApi';

interface PendingFile {
  file: File;
  documentType: string; // '' = not yet chosen
}

export function BulkUploadZone({ userId, onUploaded }: { userId: string; onUploaded: () => void }) {
  const { tr } = useLanguage();
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;
    const newOnes: PendingFile[] = Array.from(fileList).map((file) => ({ file, documentType: '' }));
    setPending((prev) => [...prev, ...newOnes]);
  }

  function updateType(index: number, documentType: string) {
    setPending((prev) => prev.map((p, i) => (i === index ? { ...p, documentType } : p)));
  }

  function removePending(index: number) {
    setPending((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleConfirm() {
    setError(null);
    const unassigned = pending.some((p) => !p.documentType);
    if (unassigned) {
      setError('Please choose a document type for every file before confirming.');
      return;
    }

    for (const p of pending) {
      const validationError = validateFile(p.file);
      if (validationError) {
        setError(`${p.file.name}: ${validationError}`);
        return;
      }
    }

    setUploading(true);
    // Bulk upload creates one entry per file (unlabeled) — for repeatable
    // types like work experience, the user can distinguish entries later;
    // this keeps bulk upload simple rather than asking for a label per file.
    for (const p of pending) {
      const { error } = await createEntryWithFiles(userId, p.documentType, null, [p.file]);
      if (error) {
        setError(error);
        setUploading(false);
        return;
      }
    }
    setUploading(false);
    setPending([]);
    onUploaded();
  }

  return (
    <div className="rounded-(--radius-lg) border-2 border-dashed border-(--color-line) bg-(--color-paper-raised) p-6">
      <h3 className="font-display text-base font-semibold text-(--color-ink)">
        {tr('documents', 'bulkUploadTitle')}
      </h3>
      <p className="mt-1 text-sm text-(--color-muted)">{tr('documents', 'bulkUploadHint')}</p>

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`mt-3 flex cursor-pointer items-center justify-center rounded-(--radius-md) border-2 border-dashed py-8 text-sm transition-colors ${
          dragOver
            ? 'border-(--color-lapis) bg-(--color-lapis)/5 text-(--color-lapis)'
            : 'border-(--color-line) text-(--color-muted)'
        }`}
      >
        {tr('documents', 'dragOrClick')}
        <input
          type="file"
          multiple
          accept={ACCEPTED_FILE_EXTENSIONS}
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </label>

      {pending.length > 0 && (
        <div className="mt-4 space-y-2">
          {pending.map((p, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper) px-3 py-2"
            >
              <span className="flex-1 truncate text-sm" title={p.file.name}>
                {p.file.name}
              </span>
              <select
                value={p.documentType}
                onChange={(e) => updateType(i, e.target.value)}
                className="rounded border border-(--color-line) bg-(--color-paper-raised) px-2 py-1 text-sm"
              >
                <option value="">{tr('documents', 'chooseType')}</option>
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.key} value={t.key}>
                    {tr('documents', t.labelKey)}
                  </option>
                ))}
              </select>
              <button
                onClick={() => removePending(i)}
                className="text-xs font-medium text-(--color-danger) hover:underline"
              >
                {tr('documents', 'remove')}
              </button>
            </div>
          ))}

          {error && <p className="text-sm text-(--color-danger)">{error}</p>}

          <button
            onClick={handleConfirm}
            disabled={uploading}
            className="rounded-(--radius-md) bg-(--color-saffron) px-5 py-2 text-sm font-semibold text-white hover:bg-(--color-saffron-light) disabled:opacity-60"
          >
            {uploading ? tr('documents', 'uploading') : tr('documents', 'confirmUpload')}
          </button>
        </div>
      )}
    </div>
  );
}
