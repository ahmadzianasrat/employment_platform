// Shared button classes — keeps CV builder, document vault, and admin
// screens visually consistent instead of each page inventing its own
// "plain link that acts like a button" style.

export const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 rounded-(--radius-md) bg-(--color-saffron) px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-(--color-saffron-light) disabled:cursor-not-allowed disabled:opacity-50';

export const btnSecondary =
  'inline-flex items-center justify-center gap-1.5 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-4 py-2 text-sm font-medium text-(--color-ink) transition-colors hover:border-(--color-lapis) hover:text-(--color-lapis) disabled:cursor-not-allowed disabled:opacity-50';

export const btnSecondarySm =
  'inline-flex items-center justify-center gap-1 rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) px-3 py-1.5 text-xs font-semibold text-(--color-ink) transition-colors hover:border-(--color-lapis) hover:text-(--color-lapis) disabled:cursor-not-allowed disabled:opacity-50';

export const btnDangerOutlineSm =
  'inline-flex items-center justify-center gap-1 rounded-(--radius-md) border border-(--color-danger)/35 bg-(--color-paper-raised) px-3 py-1.5 text-xs font-semibold text-(--color-danger) transition-colors hover:bg-(--color-danger)/8 disabled:cursor-not-allowed disabled:opacity-50';

export const btnLapisOutlineSm =
  'inline-flex items-center justify-center gap-1 rounded-(--radius-md) border border-(--color-lapis)/35 bg-(--color-paper-raised) px-3 py-1.5 text-xs font-semibold text-(--color-lapis) transition-colors hover:bg-(--color-lapis)/8 disabled:cursor-not-allowed disabled:opacity-50';

export const btnDashed =
  'inline-flex w-full items-center justify-center gap-1.5 rounded-(--radius-md) border border-dashed border-(--color-line) px-4 py-2.5 text-sm font-medium text-(--color-lapis) transition-colors hover:border-(--color-lapis) hover:bg-(--color-lapis)/5';
