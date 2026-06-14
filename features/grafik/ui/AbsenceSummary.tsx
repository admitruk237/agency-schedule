'use client';

import { useEffect, useState } from 'react';
import { UserX, Thermometer } from 'lucide-react';
import { AgencyName } from '../../schedule/lib/schedule';
import { AGENCIES, AgencySummary } from '../lib/grafik';
import { useLanguage } from '../../i18n/LanguageContext';

interface Props {
  date: Date;
}

export default function AbsenceSummary({ date }: Props) {
  const { t } = useLanguage();
  const [summary, setSummary] = useState<Record<AgencyName, AgencySummary> | null>(null);

  useEffect(() => {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    let cancelled = false;
    fetch(`/api/grafik/summary?year=${year}&month=${month}&day=${day}`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setSummary(data);
      })
      .catch(() => {
        if (!cancelled) setSummary(null);
      });

    return () => {
      cancelled = true;
    };
  }, [date]);

  if (!summary) return null;

  const total = AGENCIES.reduce(
    (acc, agency) => acc + summary[agency].off + summary[agency].sick,
    0,
  );

  if (total === 0) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 mb-6">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
        {t('absence.title')}
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {AGENCIES.map((agency) => {
          const data = summary[agency];
          if (data.off === 0 && data.sick === 0) return null;
          return (
            <div
              key={agency}
              className="flex flex-col gap-2 px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700"
            >
              <span className="text-sm font-semibold text-white">{agency}</span>
              {data.off > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-zinc-300">
                  <UserX size={12} className="text-zinc-400" />
                  {data.off} {t('absence.off')}
                </span>
              )}
              {data.sick > 0 && (
                <span className="flex items-center gap-1.5 text-xs text-amber-300">
                  <Thermometer size={12} />
                  {data.sick} {t('absence.sick')}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
