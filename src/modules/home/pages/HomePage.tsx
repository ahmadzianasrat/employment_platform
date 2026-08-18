import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { btnPrimary, btnSecondary } from '../../../components/ui/buttonStyles';
import { FaqAccordion } from '../../../components/ui/FaqAccordion';
import { IconFileText, IconMail, IconWallet } from '../../../components/ui/icons';
import { CvPreview } from '../../cv/components/CvPreview';
import { CV_EXAMPLES } from '../../examples/data/sampleData';

// The two most visually distinct templates, used purely to show off real
// output on the homepage — same components/data as /examples, not
// separate marketing images to keep in sync by hand.
const HERO_SHOWCASE = CV_EXAMPLES.filter((ex) => ex.template === 'sidebar' || ex.template === 'modern');

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
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="text-center lg:text-left">
              <h1 className="font-display text-3xl font-bold leading-tight text-(--color-ink) sm:text-4xl">
                {tr('home', 'heroTitle')}
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-(--color-muted) sm:text-lg lg:mx-0">{tr('home', 'heroSubtitle')}</p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <Link to="/cv-builder" className={btnPrimary}>
                  {tr('home', 'heroCtaPrimary')}
                </Link>
                <Link to="/pricing" className={btnSecondary}>
                  {tr('home', 'heroCtaSecondary')}
                </Link>
              </div>
            </div>

            {/* Real, live-rendered CV templates — same components as the CV
                builder and /examples — so this is an honest preview of the
                actual output, not a mockup image that could drift out of
                sync with what the templates really look like. */}
            <div className="mx-auto flex w-full max-w-sm gap-4 sm:max-w-md">
              {HERO_SHOWCASE.map((ex, i) => (
                <Link
                  key={ex.id}
                  to="/examples"
                  className={`block flex-1 transition-transform hover:-translate-y-1 ${i === 1 ? 'mt-8' : ''}`}
                >
                  <div className="pointer-events-none rounded-(--radius-lg) shadow-lg ring-1 ring-black/5">
                    <CvPreview cv={ex.cv} template={ex.template} sticky={false} showFooterNote={false} />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          <div className="mt-6 text-center lg:text-right">
            <Link to="/examples" className="text-sm font-semibold text-(--color-lapis) hover:underline">
              {tr('home', 'heroShowcaseCta')}
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
