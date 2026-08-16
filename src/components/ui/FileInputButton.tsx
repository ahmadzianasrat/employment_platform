import { useId } from 'react';
import { IconUpload, IconCheck } from './icons';

interface FileInputButtonProps {
  label: string;
  selectedLabel: string;
  accept: string;
  file: File | null;
  onChange: (file: File | null) => void;
}

/**
 * A native <input type="file"> is unstyleable in a way that reads as a
 * button, so this hides the real input and drives it from a styled
 * <label> instead — the label's "for" wiring means a click still opens
 * the native file picker with no JS needed for that part.
 */
export function FileInputButton({ label, selectedLabel, accept, file, onChange }: FileInputButtonProps) {
  const inputId = useId();

  return (
    <div className="mt-1">
      <label
        htmlFor={inputId}
        className={`inline-flex cursor-pointer items-center gap-2 rounded-(--radius-md) border px-4 py-2 text-sm font-medium transition-colors ${
          file
            ? 'border-(--color-success)/40 bg-(--color-success)/8 text-(--color-success)'
            : 'border-dashed border-(--color-line) text-(--color-lapis) hover:border-(--color-lapis) hover:bg-(--color-lapis)/5'
        }`}
      >
        {file ? <IconCheck className="h-4 w-4" /> : <IconUpload />}
        {file ? selectedLabel : label}
      </label>
      <input
        id={inputId}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="sr-only"
      />
      {file && <p className="mt-1.5 truncate text-xs text-(--color-muted)">{file.name}</p>}
    </div>
  );
}
