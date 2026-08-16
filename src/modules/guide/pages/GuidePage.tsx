import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { TELEGRAM_PASHTO_URL, TELEGRAM_DARI_URL, WHATSAPP_URL, WHATSAPP_NUMBER_DISPLAY } from '../../../lib/config/channelLinks';
import { btnPrimary, btnSecondary } from '../../../components/ui/buttonStyles';
import { IconTelegram, IconWhatsapp, IconMail, IconUser } from '../../../components/ui/icons';

function Section({ id, heading, icon, children }: { id: string; heading: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20 border-b border-(--color-line) py-8 first:pt-0 last:border-b-0">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-(--radius-md) bg-(--color-lapis)/10 text-(--color-lapis)">
          {icon}
        </span>
        <h2 className="font-display text-xl font-semibold text-(--color-ink)">{heading}</h2>
      </div>
      <div className="mt-3 space-y-3 text-sm leading-relaxed text-(--color-muted)">{children}</div>
    </section>
  );
}

export function GuidePage() {
  const { tr } = useLanguage();

  const toc = [
    { id: 'free-tools', label: tr('guide', 'freeToolsHeading') },
    { id: 'account', label: tr('guide', 'accountHeading') },
    { id: 'upload-docs', label: tr('guide', 'uploadDocsHeading') },
    { id: 'gmail', label: tr('guide', 'gmailHeading') },
    { id: 'gmail-send', label: tr('guide', 'gmailSendHeading') },
    { id: 'paid-help', label: tr('guide', 'paidHeading') },
    { id: 'how-to-pay', label: tr('guide', 'howToPayHeading') },
    { id: 'job-finding', label: tr('guide', 'jobFindingHeading') },
    { id: 'send-us', label: tr('guide', 'sendUsHeading') },
  ];

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="font-display text-3xl font-bold text-(--color-ink)">{tr('guide', 'title')}</h1>
      <p className="mt-3 text-(--color-muted)">{tr('guide', 'subtitle')}</p>

      <nav className="mt-6 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-(--color-muted)">{tr('guide', 'title')}</p>
        <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
          {toc.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="text-sm text-(--color-lapis) hover:underline">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-8">
        <Section id="free-tools" heading={tr('guide', 'freeToolsHeading')} icon={<IconUser />}>
          <p>{tr('guide', 'freeToolsBody')}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/cv-builder" className={btnSecondary}>
              {tr('nav', 'cvBuilder')}
            </Link>
            <Link to="/cover-letter" className={btnSecondary}>
              {tr('nav', 'coverLetter')}
            </Link>
          </div>
        </Section>

        <Section id="account" heading={tr('guide', 'accountHeading')} icon={<IconMail />}>
          <p>{tr('guide', 'accountBody')}</p>
          <Link to="/sign-in" className={`${btnSecondary} mt-1 inline-flex`}>
            {tr('nav', 'signIn')}
          </Link>
        </Section>

        <Section id="upload-docs" heading={tr('guide', 'uploadDocsHeading')} icon={<IconUser />}>
          <p>{tr('guide', 'uploadDocsBody')}</p>
        </Section>

        <Section id="gmail" heading={tr('guide', 'gmailHeading')} icon={<IconMail />}>
          <p>{tr('guide', 'gmailBody')}</p>
        </Section>

        <Section id="gmail-send" heading={tr('guide', 'gmailSendHeading')} icon={<IconMail />}>
          <p>{tr('guide', 'gmailSendBody')}</p>
        </Section>

        <Section id="paid-help" heading={tr('guide', 'paidHeading')} icon={<IconWhatsapp />}>
          <p>{tr('guide', 'paidBody')}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={btnPrimary}>
              <IconWhatsapp />
              {tr('guide', 'whatsappCtaLabel')} ({WHATSAPP_NUMBER_DISPLAY})
            </a>
            <Link to="/order" className={btnSecondary}>
              {tr('guide', 'orderCta')}
            </Link>
          </div>
        </Section>

        <Section id="how-to-pay" heading={tr('guide', 'howToPayHeading')} icon={<IconWhatsapp />}>
          <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) p-4">
            <h3 className="font-semibold text-(--color-ink)">{tr('guide', 'howToPayEasyLoadTitle')}</h3>
            <p className="mt-1">{tr('guide', 'howToPayEasyLoadBody')}</p>
          </div>
          <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) p-4">
            <h3 className="font-semibold text-(--color-ink)">{tr('guide', 'howToPayHesabTitle')}</h3>
            <p className="mt-1">{tr('guide', 'howToPayHesabBody')}</p>
          </div>
          <div className="rounded-(--radius-md) border border-(--color-line) bg-(--color-paper-raised) p-4">
            <h3 className="font-semibold text-(--color-ink)">{tr('guide', 'howToPayAfterTitle')}</h3>
            <p className="mt-1">{tr('guide', 'howToPayAfterBody')}</p>
          </div>
        </Section>

        <Section id="job-finding" heading={tr('guide', 'jobFindingHeading')} icon={<IconTelegram />}>
          <p>{tr('guide', 'jobFindingBody')}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <a href={TELEGRAM_PASHTO_URL} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              <IconTelegram />
              {tr('guide', 'telegramPashtoLabel')}
            </a>
            <a href={TELEGRAM_DARI_URL} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              <IconTelegram />
              {tr('guide', 'telegramDariLabel')}
            </a>
          </div>
        </Section>

        <Section id="send-us" heading={tr('guide', 'sendUsHeading')} icon={<IconWhatsapp />}>
          <p>{tr('guide', 'sendUsBody')}</p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Link to="/order" className={`${btnPrimary} inline-flex`}>
              {tr('guide', 'orderCta')}
            </Link>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className={btnSecondary}>
              <IconWhatsapp />
              {tr('guide', 'whatsappCtaLabel')}
            </a>
          </div>
        </Section>
      </div>
    </div>
  );
}
