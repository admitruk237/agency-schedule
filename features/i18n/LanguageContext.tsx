'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  DEFAULT_LANGUAGE,
  LOCALE_MAP,
  Language,
  MONTH_NAMES,
  WEEKDAY_SHORT,
  translations,
} from './translations';

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  locale: string;
  monthNames: string[];
  weekdayShort: string[];
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'agency-schedule-language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && stored in translations) setLanguageState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  }, []);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let text = translations[language][key] ?? translations[DEFAULT_LANGUAGE][key] ?? key;
      if (vars) {
        for (const [name, value] of Object.entries(vars)) {
          text = text.replace(`{${name}}`, String(value));
        }
      }
      return text;
    },
    [language],
  );

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        locale: LOCALE_MAP[language],
        monthNames: MONTH_NAMES[language],
        weekdayShort: WEEKDAY_SHORT[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
