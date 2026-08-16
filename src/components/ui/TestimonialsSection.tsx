import { TESTIMONIALS } from '../../lib/config/testimonials';
import { useLanguage } from '../../lib/i18n/LanguageContext';
import { IconQuote } from './icons';

// A small fixed palette of accent colors, picked deterministically from
// the testimonial's index so the same person always gets the same
// color, without needing to store one.
const AVATAR_COLORS = [
  'bg-(--color-lapis)/12 text-(--color-lapis)',
  'bg-(--color-saffron)/15 text-(--color-saffron)',
  'bg-(--color-success)/12 text-(--color-success)',
];

function initials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();
}

export function TestimonialsSection() {
  const { tr } = useLanguage();

  if (TESTIMONIALS.length === 0) return null;

  return (
    <section className="mx-auto mt-14 max-w-4xl px-6">
      <div className="text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-(--color-saffron)/12 text-(--color-saffron)">
          <IconQuote className="h-5 w-5" />
        </span>
        <h2 className="mt-3 font-display text-2xl font-semibold text-(--color-ink)">{tr('pricing', 'testimonialsHeading')}</h2>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        {TESTIMONIALS.map((t, i) => (
          <blockquote
            key={i}
            className="relative rounded-(--radius-lg) border border-(--color-line) bg-(--color-paper-raised) p-6 pt-8 shadow-sm transition-shadow hover:shadow-md"
          >
            <IconQuote className="absolute end-5 top-5 h-8 w-8 text-(--color-line)" />
            <p className="relative text-[15px] leading-relaxed text-(--color-ink)">"{t.quote}"</p>
            <footer className="mt-4 flex items-center gap-3">
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  AVATAR_COLORS[i % AVATAR_COLORS.length]
                }`}
              >
                {initials(t.name)}
              </span>
              <span>
                <span className="block text-sm font-semibold text-(--color-ink)">{t.name}</span>
                {t.context && <span className="block text-xs text-(--color-muted)">{t.context}</span>}
              </span>
            </footer>
          </blockquote>
        ))}
      </div>
    </section>
  );
}
