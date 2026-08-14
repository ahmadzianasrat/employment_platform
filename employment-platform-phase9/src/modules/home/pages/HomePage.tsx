import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { btnPrimary, btnSecondary } from '../../../components/ui/buttonStyles';
import { FaqAccordion } from '../../../components/ui/FaqAccordion';
import { IconFileText, IconMail, IconWallet } from '../../../components/ui/icons';

export function HomePage() {
  const { tr } = useLanguage();

  const steps = [
    { title: tr('home', 'step1Title'), body: tr('home', 'step1Body') },
    { title: tr('home', 'step2Title'), body: tr('home', 'step2Body') },
    { title: tr('home', 'step3Title'), body: tr('home', 'step3Body') },
  ];

  const features = [
    { icon: <IconFileText className="h-6 w-6" />, title: tr('home', 'featureCvTitle'), body: tr('home', 'featureCvBody'), to: '/cv-builder' },
    { icon: <IconMail className="h-6 w-6" />, title: tr('home', 'featureCoverTitle'), body: tr('home', 'featureCoverBody'), to: '/cover-letter' },
    { icon: <IconFileText className="h-6 w-6" />, title: tr('home', 'featureDocsTitle'), body: tr('home', 'featureDocsBody'), to: '/documents' },
    { icon: <IconWallet className="h-6 w-6" />, title: tr('home', 'featurePaidTitle'), body: tr('home', 'featurePaidBody'), to: '/pricing' },
  ];

  const faqItems = [1, 2, 3, 4, 5, 6].map((n) => ({
    question: tr('faq', `q${n}`),
    answer: tr('faq', `a${n}`),
  }));

  return (
    <div>
      {/* Hero */}
      <section className="border-b border-(--color-line) bg-(--color-paper-raised)">
        <div className="mx-auto max-w-4xl px-6 py-16 text-center sm:py-20">
          <h1 className="font-display text-3xl font-bold leading-tight text-(--color-ink) sm:text-4xl">
            {tr('home', 'heroTitle')}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-(--color-muted) sm:text-lg">{tr('home', 'heroSubtitle')}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/cv-builder" className={btnPrimary}>
              {tr('home', 'heroCtaPrimary')}
            </Link>
            <Link to="/pricing" className={btnSecondary}>
              {tr('home', 'heroCtaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-5xl px-6 py-14">
        <h2 className="text-center font-display text-2xl font-semibold text-(--color-ink)">{tr('home', 'howItWorksHeading')}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s, i) => (
            <div key={i} className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-saffron)/15 text-sm font-bold text-(--color-saffron)">
                {i + 1}
              </span>
              <h3 className="mt-3 font-display text-base font-semibold text-(--color-ink)">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-(--color-muted)">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="border-y border-(--color-line) bg-(--color-paper-raised) py-14">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center font-display text-2xl font-semibold text-(--color-ink)">{tr('home', 'featuresHeading')}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {features.map((f) => (
              <Link
                key={f.title}
                to={f.to}
                className="flex gap-4 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper) p-5 transition-colors hover:border-(--color-lapis)"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-(--radius-md) bg-(--color-lapis)/10 text-(--color-lapis)">
                  {f.icon}
                </span>
                <span>
                  <span className="block font-display text-base font-semibold text-(--color-ink)">{f.title}</span>
                  <span className="mt-1 block text-sm leading-relaxed text-(--color-muted)">{f.body}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="mx-auto max-w-3xl px-6 py-14 text-center">
        <h2 className="font-display text-2xl font-semibold text-(--color-ink)">{tr('home', 'pricingTeaserHeading')}</h2>
        <p className="mx-auto mt-3 max-w-xl text-(--color-muted)">{tr('home', 'pricingTeaserBody')}</p>
        <Link to="/pricing" className={`${btnPrimary} mt-6 inline-flex`}>
          {tr('home', 'pricingTeaserCta')}
        </Link>
      </section>

      {/* FAQ */}
      <section className="border-t border-(--color-line) bg-(--color-paper-raised) py-14">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center font-display text-2xl font-semibold text-(--color-ink)">{tr('home', 'faqHeading')}</h2>
          <p className="mx-auto mt-2 max-w-xl text-center text-sm text-(--color-muted)">{tr('home', 'faqSubtitle')}</p>
          <div className="mt-7">
            <FaqAccordion items={faqItems} />
          </div>
        </div>
      </section>
    </div>
  );
}
