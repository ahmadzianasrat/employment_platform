import { Link } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { IconTelegram } from '../ui/icons';
import { TELEGRAM_PASHTO_URL, TELEGRAM_DARI_URL } from '../../lib/config/channelLinks';
// Support address for hamqar.com
const CONTACT_EMAIL = 'support@hamqar.com';

export function Footer() {
  const { tr } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-(--color-line) bg-(--color-paper-raised)">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-(--color-lapis)">
          {tr('footer', 'aboutHeading')}
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-(--color-muted)">
          {tr('footer', 'about')}
        </p>

        <div className="mt-6 flex flex-col gap-2 border-t border-(--color-line) pt-6 text-sm text-(--color-muted) sm:flex-row sm:items-center sm:justify-between">
          <p>
            {tr('footer', 'contact')}:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-(--color-lapis) hover:underline">
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            © {year} {tr('brand', 'appName')}. {tr('footer', 'rightsReserved')}
          </p>
        </div>

        <div className="mt-4 flex gap-4 border-t border-(--color-line) pt-4 text-xs text-(--color-muted)">
          <Link to="/privacy" className="hover:text-(--color-lapis) hover:underline">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-(--color-lapis) hover:underline">
            Terms of Use
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-2 border-t border-(--color-line) pt-4 text-sm text-(--color-muted) sm:flex-row sm:items-center sm:gap-4">
          <span>{tr('footer', 'followUs')}:</span>
          <a
            href={TELEGRAM_PASHTO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-(--color-lapis) hover:underline"
          >
            <IconTelegram />
            {tr('footer', 'pashtoTelegram')}
          </a>
          <a
            href={TELEGRAM_DARI_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-(--color-lapis) hover:underline"
          >
            <IconTelegram />
            {tr('footer', 'dariTelegram')}
          </a>
        </div>
      </div>
    </footer>
  );
}
