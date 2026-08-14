export function Spinner({ className = 'h-4 w-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={`animate-spin ${className}`}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Centered spinner + label for a whole page/section's loading state. */
export function LoadingBlock({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`flex items-center justify-center gap-2.5 py-14 text-sm text-(--color-muted) ${className}`}>
      <Spinner className="h-4 w-4 text-(--color-lapis)" />
      {label}
    </div>
  );
}
