import { useLanguage } from '../../lib/i18n/LanguageContext';

// TODO: replace with your real contact address before going live.
const CONTACT_EMAIL = 'contact@yourdomain.com';

export function Footer() {
  const { tr } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-[var(--color-line)] bg-[var(--color-paper-raised)]">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-[var(--color-lapis)]">
          {tr('footer', 'aboutHeading')}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--color-muted)]">
          {tr('footer', 'about')}
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-[var(--color-line)] pt-6 text-sm text-[var(--color-muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            {tr('footer', 'contact')}:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[var(--color-lapis)] hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            © {year} {tr('brand', 'appName')}. {tr('footer', 'rightsReserved')}
          </p>
        </div>
      </div>
    </footer>
  );
}
