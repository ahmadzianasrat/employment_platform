import { Link } from 'react-router-dom';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { IconTelegram, IconWhatsapp, IconMail } from '../ui/icons';
import { TELEGRAM_PASHTO_URL, TELEGRAM_DARI_URL, WHATSAPP_URL, WHATSAPP_NUMBER_DISPLAY, SUPPORT_EMAIL } from '../../lib/config/channelLinks';

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

        <div className="mt-6 border-t border-(--color-line) pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">{tr('footer', 'contact')}</p>
          <div className="mt-2 flex flex-col gap-2.5 text-sm sm:flex-row sm:items-center sm:gap-6">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-semibold text-(--color-success) hover:underline"
            >
              <IconWhatsapp className="h-4 w-4" />
              {tr('footer', 'whatsappPreferred')} · {WHATSAPP_NUMBER_DISPLAY}
            </a>
            <a href={`mailto:${SUPPORT_EMAIL}`} className="inline-flex items-center gap-1.5 text-(--color-lapis) hover:underline">
              <IconMail className="h-4 w-4" />
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-(--color-line) pt-4 text-sm text-(--color-muted) sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-4 text-xs">
            <Link to="/privacy" className="hover:text-(--color-lapis) hover:underline">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-(--color-lapis) hover:underline">
              Terms of Use
            </Link>
          </div>
          <p className="text-xs">
            © {year} {tr('brand', 'appName')}. {tr('footer', 'rightsReserved')}
          </p>
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
