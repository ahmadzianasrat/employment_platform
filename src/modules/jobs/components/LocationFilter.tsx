import { useEffect, useRef, useState } from 'react';
import { AFGHAN_PROVINCES } from '../data/provinces';
import { useLanguage } from '../../../lib/i18n/LanguageContext';

interface Props {
  value: string; // 'all' or a province name
  onChange: (value: string) => void;
}

export function LocationFilter({ value, onChange }: Props) {
  const { tr } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const label = value === 'all' ? tr('jobBoard', 'allLocationsFilter') : value;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper-raised)] px-4 py-2.5 text-sm outline-none focus:border-[var(--color-lapis)] sm:w-56"
      >
        <span>{label}</span>
        <span className="text-[var(--color-muted)]">▾</span>
      </button>

      {open && (
        <div className="absolute z-10 mt-1 max-h-72 w-64 overflow-y-auto rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-paper-raised)] p-2 shadow-lg">
          <label className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-black/5">
            <input
              type="radio"
              name="location-filter"
              checked={value === 'all'}
              onChange={() => {
                onChange('all');
                setOpen(false);
              }}
            />
            {tr('jobBoard', 'allLocationsFilter')}
          </label>
          <div className="my-1 border-t border-[var(--color-line)]" />
          {AFGHAN_PROVINCES.map((province) => (
            <label
              key={province}
              className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-black/5"
            >
              <input
                type="radio"
                name="location-filter"
                checked={value === province}
                onChange={() => {
                  onChange(province);
                  setOpen(false);
                }}
              />
              {province}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
