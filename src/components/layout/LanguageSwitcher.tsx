import { LANGUAGES } from '../../lib/i18n/strings';
import { useLanguage } from '../../lib/i18n/LanguageContext';

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center rounded-sm border border-white/25 bg-white/5">
      {LANGUAGES.map((lang, i) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          aria-pressed={language === lang.code}
          className={`px-3 py-1.5 text-[13px] font-semibold uppercase tracking-[0.06em] transition-colors ${
            i > 0 ? 'border-l border-white/15' : ''
          } ${
            language === lang.code
              ? 'bg-(--color-saffron) text-white'
              : 'text-white/65 hover:text-white'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
