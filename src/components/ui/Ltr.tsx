import type { ReactNode } from 'react';

/**
 * Wraps LTR content (phone numbers, currency codes, URLs) so it renders
 * correctly inside RTL (Pashto/Dari) text. Without this, the browser's
 * bidi algorithm reorders digit/punctuation runs like "+93 70 733 9100"
 * when they sit inside an RTL-directioned parent — e.g. it can come out
 * reading "0019337079+3". `dir="ltr"` plus `unicode-bidi: isolate` pins
 * the run's internal order regardless of the surrounding text direction.
 */
export function Ltr({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <span dir="ltr" className={`inline-block [unicode-bidi:isolate] ${className}`}>
      {children}
    </span>
  );
}
