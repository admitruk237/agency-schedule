'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Download, Loader2, Plus, Trash2 } from 'lucide-react';
import { AgencyName } from '../../schedule/lib/schedule';
import {
  AGENCIES,
  DaysOffEntry,
  Employee,
  daysInMonth,
  getDayStatus,
  getSaturdays,
  nextDayStatus,
} from '../lib/grafik';
import { useLanguage } from '../../i18n/LanguageContext';

function emptyEntry(employeeId: string, year: number, month: number): DaysOffEntry {
  return { employeeId, year, month, off: [], sick: [] };
}

export default function GrafikBoard() {
  const { t, language, monthNames, weekdayShort } = useLanguage();
  const today = new Date();
  const [agency, setAgency] = useState<AgencyName>('Olensen');
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [entries, setEntries] = useState<Record<string, DaysOffEntry>>({});
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [holidayDay, setHolidayDay] = useState(1);
  const [markingHoliday, setMarkingHoliday] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    const empRes = await fetch(`/api/employees?agency=${agency}`);
    const emps: Employee[] = await empRes.json();

    const entryPairs = await Promise.all(
      emps.map(async (emp) => {
        const res = await fetch(`/api/days-off?employeeId=${emp.id}&year=${year}&month=${month}`);
        const data: DaysOffEntry = await res.json();
        return [emp.id, data] as const;
      }),
    );

    setEmployees(emps);
    setEntries(Object.fromEntries(entryPairs));
    setLoading(false);
  }, [agency, year, month]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function addEmployee() {
    const name = newName.trim();
    if (!name) return;

    const res = await fetch('/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, agency }),
    });
    const employee: Employee = await res.json();

    setNewName('');
    setEmployees((prev) => [...prev, employee]);
    setEntries((prev) => ({ ...prev, [employee.id]: emptyEntry(employee.id, year, month) }));
  }

  async function deleteEmployee(id: string) {
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    setEntries((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  async function cycleDay(employeeId: string, day: number) {
    const current = entries[employeeId] ?? emptyEntry(employeeId, year, month);
    const status = getDayStatus(current, day);
    const next = nextDayStatus(status);

    const off = current.off.filter((d) => d !== day);
    const sick = current.sick.filter((d) => d !== day);
    if (next === 'off') off.push(day);
    if (next === 'sick') sick.push(day);

    const updated: DaysOffEntry = { employeeId, year, month, off, sick };
    setEntries((prev) => ({ ...prev, [employeeId]: updated }));

    await fetch('/api/days-off', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
  }

  async function markSaturdays() {
    setMarking(true);
    await fetch('/api/days-off/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agency, year, month, days: getSaturdays(year, month) }),
    });
    await loadData();
    setMarking(false);
  }

  async function markHoliday() {
    setMarkingHoliday(true);
    await fetch('/api/days-off/bulk', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ agency, year, month, days: [holidayDay] }),
    });
    await loadData();
    setMarkingHoliday(false);
  }

  function downloadPdf() {
    window.open(`/api/grafik/pdf?agency=${agency}&year=${year}&month=${month}&lang=${language}`, '_blank');
  }

  const total = daysInMonth(year, month);
  const days = Array.from({ length: total }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          {t('common.backToSchedule')}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">{t('grafik.title')}</h1>
        <p className="text-sm text-zinc-500 mb-8">{t('grafik.description')}</p>

        {/* Controls */}
        <div className="flex flex-wrap items-end gap-3 mb-6">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">{t('common.agency')}</span>
            <select
              value={agency}
              onChange={(e) => setAgency(e.target.value as AgencyName)}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
            >
              {AGENCIES.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">{t('common.month')}</span>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white"
            >
              {monthNames.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">{t('common.year')}</span>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white w-24"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs text-zinc-500 uppercase tracking-wide">{t('common.day')}</span>
            <select
              value={holidayDay}
              onChange={(e) => setHolidayDay(Number(e.target.value))}
              className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white w-20"
            >
              {days.map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={markHoliday}
            disabled={markingHoliday || employees.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-50 transition-all duration-150"
          >
            {markingHoliday && <Loader2 size={14} className="animate-spin" />}
            {t('grafik.markHoliday')}
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={markSaturdays}
            disabled={marking || employees.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white disabled:opacity-50 transition-all duration-150"
          >
            {marking && <Loader2 size={14} className="animate-spin" />}
            {t('grafik.markSaturdays')}
          </button>

          <button
            type="button"
            onClick={downloadPdf}
            disabled={employees.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-zinc-900 text-sm font-semibold hover:bg-zinc-200 disabled:opacity-50 transition-colors"
          >
            <Download size={16} />
            {t('grafik.downloadPdf')}
          </button>
        </div>

        {/* Add employee */}
        <div className="flex items-center gap-2 mb-6">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addEmployee()}
            placeholder={t('grafik.employeeNamePlaceholder')}
            className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white flex-1 max-w-sm placeholder:text-zinc-500"
          />
          <button
            type="button"
            onClick={addEmployee}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 hover:border-zinc-500 text-sm font-medium text-zinc-300 hover:text-white transition-all duration-150"
          >
            <Plus size={16} />
            {t('grafik.add')}
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mb-4 text-xs text-zinc-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-zinc-600 inline-block" />
            {t('grafik.legendOff')}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-600/70 inline-block" />
            {t('grafik.legendSick')}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 size={16} className="animate-spin" />
            {t('common.loading')}
          </div>
        ) : employees.length === 0 ? (
          <p className="text-sm text-zinc-500">{t('grafik.noEmployees')}</p>
        ) : (
          <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
            <table className="border-collapse text-xs w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 z-10 bg-zinc-900 border border-zinc-800 px-3 py-2 text-left font-semibold min-w-[90px]">
                    {monthNames[month - 1]}
                  </th>
                  {employees.map((emp) => (
                    <th
                      key={emp.id}
                      className="border border-zinc-800 bg-zinc-900 px-1 py-2 align-bottom"
                    >
                      <div className="flex flex-col items-center justify-between h-28 gap-2">
                        <button
                          type="button"
                          onClick={() => deleteEmployee(emp.id)}
                          className="text-zinc-600 hover:text-red-400 transition-colors"
                          aria-label={t('grafik.deleteEmployee', { name: emp.name })}
                        >
                          <Trash2 size={12} />
                        </button>
                        <span className="whitespace-nowrap text-[11px] font-medium [writing-mode:vertical-rl] rotate-180">
                          {emp.name}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {days.map((day) => {
                  const date = new Date(year, month - 1, day);
                  const weekday = weekdayShort[date.getDay()];
                  const isSaturday = date.getDay() === 6;
                  return (
                    <tr key={day}>
                      <td
                        className={`sticky left-0 z-10 border border-zinc-800 px-3 py-1 text-zinc-300 ${
                          isSaturday ? 'bg-zinc-800/60' : 'bg-zinc-900'
                        }`}
                      >
                        {day} <span className="text-zinc-500">{weekday}</span>
                      </td>
                      {employees.map((emp) => {
                        const entry = entries[emp.id] ?? emptyEntry(emp.id, year, month);
                        const status = getDayStatus(entry, day);
                        return (
                          <td
                            key={emp.id}
                            onClick={() => cycleDay(emp.id, day)}
                            className={`border border-zinc-800 cursor-pointer transition-colors w-7 h-7 ${
                              status === 'off'
                                ? 'bg-zinc-600'
                                : status === 'sick'
                                  ? 'bg-amber-600/70'
                                  : 'bg-zinc-950 hover:bg-zinc-800'
                            }`}
                          />
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}
