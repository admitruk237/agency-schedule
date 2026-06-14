'use client';

import { Globe } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { LANGUAGES, LANGUAGE_LABELS, Language } from './translations';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-3 right-3 z-50 flex items-center gap-1.5 bg-zinc-900/90 backdrop-blur border border-zinc-700 rounded-xl px-2.5 py-1.5 shadow-lg">
      <Globe size={14} className="text-zinc-500" />
      <select
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="bg-transparent text-xs font-medium text-zinc-300 focus:outline-none cursor-pointer"
        aria-label="Język / Мова / Limbă"
      >
        {LANGUAGES.map((code) => (
          <option key={code} value={code} className="bg-zinc-900">
            {LANGUAGE_LABELS[code]}
          </option>
        ))}
      </select>
    </div>
  );
}
