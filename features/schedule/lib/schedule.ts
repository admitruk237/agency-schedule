export type AgencyName = 'Olensen' | 'PT' | 'Progres' | 'Synergia';

// Reference: Sunday 2026-05-17 — this is week 0
const REF = new Date(2026, 4, 17, 0, 0, 0, 0);

const CORRIDORS = ['30-31', '36', '37'] as const;
type Corridor = (typeof CORRIDORS)[number];

const CORRIDOR_INITIAL: Record<Exclude<AgencyName, 'PT'>, number> = {
  Olensen: 1,  // slot 1 = '36'
  Progres: 2,  // slot 2 = '37'
  Synergia: 0, // slot 0 = '30-31'
};

// Rotation orders (week 0 = index 0)
const PRZECENY_ORDER: AgencyName[] = ['Olensen', 'PT', 'Progres', 'Synergia'];
const HALY_ORDER: AgencyName[] = ['PT', 'Synergia', 'Olensen', 'Progres'];

export interface AgencySchedule {
  name: AgencyName;
  corridor: string;
  hasPrzeceny: boolean;
  hasHaly: boolean;
}

function getWeekSunday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() - d.getDay());
  return d;
}

export function getWeekOffset(date: Date): number {
  const sunday = getWeekSunday(date);
  const ms = sunday.getTime() - REF.getTime();
  return Math.round(ms / (7 * 24 * 60 * 60 * 1000));
}

export function calculateSchedule(date: Date): AgencySchedule[] {
  const offset = getWeekOffset(date);
  const pIdx = ((offset % 4) + 4) % 4;
  const hIdx = ((offset % 4) + 4) % 4;

  const agencies: AgencyName[] = ['Olensen', 'PT', 'Progres', 'Synergia'];

  return agencies.map((agency) => {
    let corridor: string;

    if (agency === 'PT') {
      corridor = '35';
    } else {
      const initial = CORRIDOR_INITIAL[agency as Exclude<AgencyName, 'PT'>];
      const idx = ((initial + offset) % 3 + 3) % 3;
      corridor = CORRIDORS[idx] as Corridor;
    }

    return {
      name: agency,
      corridor,
      hasPrzeceny: agency === PRZECENY_ORDER[pIdx],
      hasHaly: agency === HALY_ORDER[hIdx],
    };
  });
}

export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = getWeekSunday(date);
  const end = new Date(start);
  end.setDate(end.getDate() + 5); // Friday
  return { start, end };
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function toInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function fromInputValue(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}
