import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { FileInputButton } from '../../../components/ui/FileInputButton';
import type { JobTargetInput } from '../types/order';

interface JobTargetFieldsProps {
  value: JobTargetInput;
  onChange: (value: JobTargetInput) => void;
  label?: string;
}

const inputClass =
  'mt-1 w-full rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-2 text-sm text-(--color-ink) outline-none transition-colors focus:border-(--color-lapis)';
const labelClass = 'text-sm font-medium text-(--color-ink)';

export function JobTargetFields({ value, onChange, label }: JobTargetFieldsProps) {
  const { tr } = useLanguage();

  return (
    <div className="space-y-3">
      {label && <p className="text-sm font-semibold text-(--color-lapis)">{label}</p>}
      <div>
        <label className={labelClass}>{tr('order', 'jobLinkLabel')}</label>
        <input
          type="text"
          value={value.targetJobLink}
          onChange={(e) => onChange({ ...value, targetJobLink: e.target.value })}
          placeholder={tr('order', 'jobLinkPlaceholder')}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{tr('order', 'jobNoteLabel')}</label>
        <textarea
          value={value.targetJobNote}
          onChange={(e) => onChange({ ...value, targetJobNote: e.target.value })}
          rows={2}
          placeholder={tr('order', 'jobNotePlaceholder')}
          className={inputClass}
        />
      </div>
      <div>
        <label className={labelClass}>{tr('order', 'jobScreenshotLabel')}</label>
        <FileInputButton
          label={tr('order', 'chooseScreenshot')}
          selectedLabel={tr('order', 'screenshotSelected')}
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          file={value.screenshotFile}
          onChange={(file) => onChange({ ...value, screenshotFile: file })}
        />
      </div>
    </div>
  );
}
