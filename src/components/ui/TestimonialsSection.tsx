import { TESTIMONIALS } from '../../lib/config/testimonials';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function TestimonialsSection() {
  const { tr } = useLanguage();

  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="mx-auto max-w-4xl px-6 py-10">
      <h2 className="text-center font-display text-2xl font-semibold text-(--color-ink)">{tr('pricing', 'testimonialsHeading')}</h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <blockquote key={i} className="rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-5">
            <p className="text-sm leading-relaxed text-(--color-ink)">"{t.quote}"</p>
            <footer className="mt-3 text-xs font-semibold text-(--color-muted)">
              {t.name}
              {t.context && <span className="font-normal"> · {t.context}</span>}
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
