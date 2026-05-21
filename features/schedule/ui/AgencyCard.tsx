'use client';

import { AgencyName, AgencySchedule } from '../lib/schedule';

interface Props {
  schedule: AgencySchedule;
}

interface CardTheme {
  gradient: string;
  shine: string;
  text: string;
  subtext: string;
  corridorBg: string;
  badgePrzeceny: string;
  badgeHaly: string;
  border: string;
}

const THEMES: Record<AgencyName, CardTheme> = {
  Olensen: {
    gradient: 'card-metallic-olensen',
    shine: 'from-pink-100/60',
    text: 'text-rose-950',
    subtext: 'text-rose-700',
    corridorBg: 'bg-rose-950/10 text-rose-950 border-rose-300/50',
    badgePrzeceny: 'bg-rose-900 text-rose-50 shadow-rose-900/30',
    badgeHaly: 'bg-rose-700 text-rose-50 shadow-rose-700/30',
    border: 'border-rose-200/60',
  },
  PT: {
    gradient: 'card-metallic-pt',
    shine: 'from-emerald-100/60',
    text: 'text-emerald-950',
    subtext: 'text-emerald-700',
    corridorBg: 'bg-emerald-950/10 text-emerald-950 border-emerald-300/50',
    badgePrzeceny: 'bg-emerald-900 text-emerald-50 shadow-emerald-900/30',
    badgeHaly: 'bg-emerald-700 text-emerald-50 shadow-emerald-700/30',
    border: 'border-emerald-200/60',
  },
  Progres: {
    gradient: 'card-metallic-progres',
    shine: 'from-white/70',
    text: 'text-slate-800',
    subtext: 'text-slate-500',
    corridorBg: 'bg-slate-900/10 text-slate-800 border-slate-300/60',
    badgePrzeceny: 'bg-slate-800 text-slate-50 shadow-slate-800/30',
    badgeHaly: 'bg-slate-600 text-slate-50 shadow-slate-600/30',
    border: 'border-slate-200/80',
  },
  Synergia: {
    gradient: 'card-metallic-synergia',
    shine: 'from-red-100/60',
    text: 'text-red-950',
    subtext: 'text-red-700',
    corridorBg: 'bg-red-950/10 text-red-950 border-red-300/50',
    badgePrzeceny: 'bg-red-900 text-red-50 shadow-red-900/30',
    badgeHaly: 'bg-red-700 text-red-50 shadow-red-700/30',
    border: 'border-red-200/60',
  },
};

export default function AgencyCard({ schedule }: Props) {
  const theme = THEMES[schedule.name];
  const hasBadge = schedule.hasPrzeceny || schedule.hasHaly;

  return (
    <div
      className={`
        relative overflow-hidden rounded-2xl border ${theme.border}
        ${theme.gradient}
        shadow-xl shadow-black/20
        flex flex-col min-h-64
        transition-transform duration-200 hover:-translate-y-1 hover:shadow-2xl
      `}
    >
      {/* Metallic shine overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${theme.shine} to-transparent pointer-events-none`}
      />

      {/* Top highlight line */}
      <div className="absolute top-0 left-4 right-4 h-px bg-white/50" />

      <div className="relative flex flex-col flex-1 p-6 gap-4">
        {/* Badges row */}
        <div className="flex flex-wrap gap-2 min-h-7">
          {schedule.hasPrzeceny && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow ${theme.badgePrzeceny}`}
            >
              <span className="text-[10px]">🏷</span>
              Przeceny
            </span>
          )}
          {schedule.hasHaly && (
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase shadow ${theme.badgeHaly}`}
            >
              <span className="text-[10px]">🚛</span>
              Haly
            </span>
          )}
        </div>

        {/* Agency name */}
        <div className="flex-1 flex flex-col justify-center">
          <p className={`text-xs font-semibold uppercase tracking-widest ${theme.subtext} mb-1`}>
            Agencja
          </p>
          <h2 className={`text-3xl font-bold tracking-tight ${theme.text}`}>{schedule.name}</h2>
        </div>

        {/* Corridor */}
        <div
          className={`self-start px-4 py-2 rounded-xl border text-sm font-bold tracking-wide ${theme.corridorBg}`}
        >
          Korytarz&nbsp;
          <span className="text-base">{schedule.corridor}</span>
        </div>
      </div>

      {/* Bottom shimmer */}
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/5 to-transparent pointer-events-none" />
    </div>
  );
}
