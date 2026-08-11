import { useState } from 'react';
import { useLanguage } from '../../../lib/i18n/LanguageContext';

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M13.5 21v-7.5H16l.5-3.5h-3V7.8c0-1 .3-1.7 1.7-1.7H16.6V3.1C16.3 3 15.3 3 14.2 3c-2.4 0-4 1.5-4 4.2V10H7.7v3.5h2.5V21h3.3Z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.9 3H22l-7.2 8.2L23 21h-6.6l-5.2-6.6L5.2 21H2l7.7-8.8L1.6 3h6.8l4.7 6.1L18.9 3Zm-1.2 16.2h1.7L7.4 4.7H5.6l12.1 14.5Z" />
    </svg>
  );
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M20.5 3.5A10.4 10.4 0 0 0 12.1 0C6.3 0 1.6 4.7 1.6 10.5c0 1.9.5 3.6 1.4 5.2L1.5 21l5.4-1.4a10.4 10.4 0 0 0 5.2 1.4c5.8 0 10.5-4.7 10.5-10.5 0-2.8-1.1-5.4-3.1-7.3ZM12.1 19a8.4 8.4 0 0 1-4.3-1.2l-.3-.2-3.2.8.9-3.1-.2-.3a8.5 8.5 0 1 1 7.1 4Zm4.6-6.3c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1-.2.2-.7.8-.8 1-.2.2-.3.2-.5.1-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6-.1-.2 0-.4.1-.5l.4-.4.2-.3v-.3c0-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.2-.9.9-.9 2.2s1 2.6 1.1 2.7c.1.2 2 3 4.7 4.2.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <path d="M9 12a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.4 1.4" />
      <path d="M15 12a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.4-1.4" />
    </svg>
  );
}
function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 10.6 6.8-3.8M8.6 13.4l6.8 3.8" />
    </svg>
  );
}

const iconBtn =
  'inline-flex h-9 w-9 items-center justify-center rounded-full border border-(--color-line) text-(--color-ink) transition-colors hover:border-(--color-lapis) hover:text-(--color-lapis)';

export function ShareButtons({ url, title }: { url: string; title: string }) {
  const { tr } = useLanguage();
  const [copied, setCopied] = useState(false);

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // user cancelled — no-op
      }
    }
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {typeof navigator !== 'undefined' && 'share' in navigator && (
        <button onClick={handleNativeShare} className={iconBtn} title="Share" aria-label="Share">
          <ShareIcon />
        </button>
      )}
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title="Share on Facebook"
        aria-label="Share on Facebook"
      >
        <FacebookIcon />
      </a>
      <a
        href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title="Share on X"
        aria-label="Share on X"
      >
        <XIcon />
      </a>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className={iconBtn}
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <WhatsAppIcon />
      </a>
      <button onClick={handleCopy} className={iconBtn} title="Copy link" aria-label="Copy link">
        <LinkIcon />
      </button>
      {copied && <span className="text-xs text-(--color-success)">{tr('blog', 'linkCopied')}</span>}
    </div>
  );
}
