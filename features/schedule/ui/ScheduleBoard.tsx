'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CalendarDays, Clock4, Info, RefreshCw, Settings, Tag, Truck, Users } from 'lucide-react';
import {
  DEFAULT_ROTATION_CONFIG,
  RotationConfig,
  calculateSchedule,
  formatDate,
  formatShortDate,
  getWeekRange,
} from '../lib/schedule';
import AgencyCard from './AgencyCard';
import CalendarModal from './CalendarModal';
import AbsenceSummary from '../../grafik/ui/AbsenceSummary';
import { useLanguage } from '../../i18n/LanguageContext';

function isSaturday(date: Date): boolean {
  return date.getDay() === 6;
}

export default function ScheduleBoard() {
  const { t, locale } = useLanguage();
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [showCalendar, setShowCalendar] = useState(false);
  const [rotationConfig, setRotationConfig] = useState<RotationConfig>(DEFAULT_ROTATION_CONFIG);

  useEffect(() => {
    fetch('/api/rotation')
      .then((res) => res.json())
      .then((data: RotationConfig) => setRotationConfig(data))
      .catch(() => setRotationConfig(DEFAULT_ROTATION_CONFIG));
  }, []);

  const schedule = calculateSchedule(selectedDate, rotationConfig);
  const { start, end } = getWeekRange(selectedDate);
  const isToday = formatDate(selectedDate) === formatDate(new Date());

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10 sm:py-14">

        {/* Header */}
        <div className="mb-8 sm:mb-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                {t('home.subtitle')}
              </p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                {t('home.titleLine1')}
                <br />
                <span className="text-zinc-400">{t('home.titleLine2')}</span>
              </h1>
            </div>

            {/* Header actions */}
            <div className="flex items-center gap-2 shrink-0">
              <Link
                href="/grafik"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-150"
              >
                <Users size={16} />
                {t('home.employeeSchedule')}
              </Link>
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-150"
              >
                <Settings size={16} />
                {t('home.adminPanel')}
              </Link>
              <button
                onClick={() => setShowCalendar(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-150"
              >
                <CalendarDays size={16} />
                {t('home.checkOtherDate')}
              </button>
            </div>
          </div>

          {/* Date & week info */}
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3 text-sm">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 w-fit">
              <span className="text-zinc-500">{t('home.displayedDate')}</span>
              <span className="font-semibold text-white capitalize">
                {formatDate(selectedDate, locale)}
              </span>
              {isToday && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-700 text-zinc-300">
                  {t('home.today')}
                </span>
              )}
            </div>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <RefreshCw size={12} />
                {t('home.backToToday')}
              </button>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-zinc-500">
            <span className="inline-block w-2 h-2 rounded-full bg-zinc-600" />
            {t('home.workWeek')}&nbsp;
            <span className="text-zinc-400 font-medium">
              {formatShortDate(start, locale)} {t('home.weekdaySun')} — {formatShortDate(end, locale)}{' '}
              {t('home.weekdayFri')}
            </span>
            <span className="text-zinc-600 ml-1">· {t('home.saturdayOff')}</span>
          </div>

          {isSaturday(selectedDate) && (
            <div className="mt-3 px-4 py-2 rounded-xl bg-zinc-800/60 border border-zinc-700 text-xs text-zinc-400 w-fit">
              ℹ️ {t('home.saturdayNotice')}
            </div>
          )}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
          {schedule.map((agency) => (
            <AgencyCard key={agency.name} schedule={agency} />
          ))}
        </div>

        {/* Absence summary */}
        <AbsenceSummary date={selectedDate} />

        {/* Legend & Info */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {/* Badge legend */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-500 mb-4">
              {t('home.legendTitle')}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
                  <Tag size={10} />
                  {t('card.przeceny')}
                </span>
                <p className="text-xs text-zinc-400">{t('home.legendPrzecenyDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-zinc-800 text-zinc-200 border border-zinc-700">
                  <Truck size={10} />
                  {t('card.haly')}
                </span>
                <p className="text-xs text-zinc-400">{t('home.legendHalyDesc')}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-900 text-indigo-200 border border-indigo-700">
                  <Clock4 size={10} />
                  16:00
                </span>
                <p className="text-xs text-zinc-400">{t('home.legend1600Desc')}</p>
              </div>
            </div>
          </div>

          {/* Auto-update & contact */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-start gap-2">
              <RefreshCw size={14} className="text-zinc-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t('home.autoUpdate1')}&nbsp;
                <span className="text-zinc-300 font-medium">{t('home.autoUpdateBold')}</span>{' '}
                {t('home.autoUpdate2')}
              </p>
            </div>
            <div className="flex items-start gap-2">
              <Info size={14} className="text-zinc-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400 leading-relaxed">
                {t('home.contactText')}{' '}
                <span className="text-white font-semibold">Andrii Dmytruk</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {showCalendar && (
        <CalendarModal
          selected={selectedDate}
          onSelect={setSelectedDate}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </main>
  );
}
