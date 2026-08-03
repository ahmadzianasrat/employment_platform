export function BrandMark({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} fill="none" aria-hidden="true">
      <g stroke="var(--color-saffron)" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M16 3 L20 12 L29 16 L20 20 L16 29 L12 20 L3 16 L12 12 Z" />
      </g>
      <circle cx="16" cy="16" r="2.4" fill="var(--color-saffron)" />
    </svg>
  );
}
