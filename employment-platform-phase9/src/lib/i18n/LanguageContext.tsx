import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { LANGUAGES, STRINGS, t, type Language } from './strings';

interface LanguageContextValue {
  language: Language;
  dir: 'ltr' | 'rtl';
  setLanguage: (lang: Language) => void;
  tr: (section: keyof typeof STRINGS, key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'employment-platform-language';

function getInitialLanguage(): Language {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'en' || stored === 'ps' || stored === 'da') return stored;
  return 'en';
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);
  const dir = LANGUAGES.find((l) => l.code === language)?.dir ?? 'ltr';

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = dir;
  }, [language, dir]);

  function setLanguage(lang: Language) {
    localStorage.setItem(STORAGE_KEY, lang);
    setLanguageState(lang);
  }

  function tr(section: keyof typeof STRINGS, key: string) {
    return t(STRINGS, language, section, key);
  }

  return (
    <LanguageContext.Provider value={{ language, dir, setLanguage, tr }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
