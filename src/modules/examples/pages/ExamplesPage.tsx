import { Link } from 'react-router-dom';
import { useLanguage } from '../../../lib/i18n/LanguageContext';
import { CvPreview } from '../../cv/components/CvPreview';
import { CoverLetterPreview } from '../../coverLetter/components/CoverLetterPreview';
import { CV_EXAMPLES, COVER_LETTER_EXAMPLES } from '../data/sampleData';
import { btnPrimary, btnSecondary } from '../../../components/ui/buttonStyles';

export function ExamplesPage() {
  const { tr } = useLanguage();

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-(--color-ink)">{tr('examples', 'title')}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-(--color-muted)">{tr('examples', 'subtitle')}</p>
        <p className="mx-auto mt-3 max-w-2xl rounded-(--radius-md) bg-(--color-saffron)/10 px-4 py-2.5 text-sm font-medium text-(--color-ink)">
          {tr('examples', 'disclaimer')}
        </p>
      </div>

      <h2 className="mt-12 font-display text-xl font-semibold text-(--color-ink)">{tr('nav', 'cvBuilder')}</h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {CV_EXAMPLES.map((ex) => (
          <div key={ex.id}>
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-(--color-lapis)">{ex.fieldLabel}</p>
            <CvPreview cv={ex.cv} template={ex.template} />
          </div>
        ))}
      </div>

      <h2 className="mt-14 font-display text-xl font-semibold text-(--color-ink)">{tr('nav', 'coverLetter')}</h2>
      <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {COVER_LETTER_EXAMPLES.map((ex) => (
          <div key={ex.id}>
            <p className="mb-2 text-center text-xs font-semibold uppercase tracking-wide text-(--color-lapis)">{ex.fieldLabel}</p>
            <CoverLetterPreview letter={ex.letter} template={ex.template} />
          </div>
        ))}
      </div>

      <div className="mt-14 flex flex-col items-center gap-3 rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-8 text-center">
        <p className="max-w-xl text-(--color-muted)">{tr('examples', 'cta')}</p>
        <div className="flex gap-3">
          <Link to="/pricing" className={btnPrimary}>
            {tr('home', 'pricingTeaserCta')}
          </Link>
          <Link to="/cv-builder" className={btnSecondary}>
            {tr('home', 'heroCtaPrimary')}
          </Link>
        </div>
      </div>
    </div>
  );
}
