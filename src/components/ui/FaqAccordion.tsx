import { useState } from 'react';
import { IconChevronDown } from './icons';

export interface FaqItem {
  question: string;
  answer: string;
}

export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-(--color-line) rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised)">
      {items.map((item, i) => {
        const open = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-4 py-3.5 text-start text-sm font-semibold text-(--color-ink) hover:text-(--color-lapis) sm:px-5"
            >
              <span>{item.question}</span>
              <IconChevronDown className={`h-4 w-4 shrink-0 text-(--color-muted) transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
              <div className="px-4 pb-4 text-sm leading-relaxed text-(--color-muted) sm:px-5">{item.answer}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
