import { AgencyName } from '../../schedule/lib/schedule';

export interface Employee {
  id: string;
  name: string;
  agency: AgencyName;
}

export interface AgencySummary {
  off: number;
  sick: number;
  total: number;
}

export interface DaysOffEntry {
  employeeId: string;
  year: number;
  month: number; // 1-12
  off: number[]; // вихідний
  sick: number[]; // хворобовий
}

export type DayStatus = 'work' | 'off' | 'sick';

export const AGENCIES: AgencyName[] = ['Olensen', 'PT', 'Progres', 'Synergia'];

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

export function getSaturdays(year: number, month: number): number[] {
  const total = daysInMonth(year, month);
  const saturdays: number[] = [];
  for (let day = 1; day <= total; day++) {
    if (new Date(year, month - 1, day).getDay() === 6) {
      saturdays.push(day);
    }
  }
  return saturdays;
}

export function daysOffKey(employeeId: string, year: number, month: number): string {
  return `daysoff:${employeeId}:${year}-${month}`;
}

export function getDayStatus(entry: { off: number[]; sick: number[] }, day: number): DayStatus {
  if (entry.sick.includes(day)) return 'sick';
  if (entry.off.includes(day)) return 'off';
  return 'work';
}

export function nextDayStatus(status: DayStatus): DayStatus {
  if (status === 'work') return 'off';
  if (status === 'off') return 'sick';
  return 'work';
}
