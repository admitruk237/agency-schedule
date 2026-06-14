import { NextRequest, NextResponse } from 'next/server';
import { kvGet } from '@/lib/kv';
import { AgencyName } from '@/features/schedule/lib/schedule';
import {
  AGENCIES,
  AgencySummary,
  DaysOffEntry,
  Employee,
  daysOffKey,
} from '@/features/grafik/lib/grafik';

export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get('year'));
  const month = Number(request.nextUrl.searchParams.get('month'));
  const day = Number(request.nextUrl.searchParams.get('day'));

  if (!year || !month || !day) {
    return NextResponse.json({ error: 'year, month, day are required' }, { status: 400 });
  }

  const employees = (await kvGet<Employee[]>('employees')) ?? [];

  const summary: Record<AgencyName, AgencySummary> = {
    Olensen: { off: 0, sick: 0, total: 0 },
    PT: { off: 0, sick: 0, total: 0 },
    Progres: { off: 0, sick: 0, total: 0 },
    Synergia: { off: 0, sick: 0, total: 0 },
  };

  for (const agency of AGENCIES) {
    summary[agency].total = employees.filter((e) => e.agency === agency).length;
  }

  await Promise.all(
    employees.map(async (employee) => {
      const entry = await kvGet<DaysOffEntry>(daysOffKey(employee.id, year, month));
      if (!entry) return;
      if (entry.sick.includes(day)) {
        summary[employee.agency].sick += 1;
      } else if (entry.off.includes(day)) {
        summary[employee.agency].off += 1;
      }
    }),
  );

  return NextResponse.json(summary);
}
