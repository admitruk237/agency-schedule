import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv';
import { AgencyName } from '@/features/schedule/lib/schedule';
import { DaysOffEntry, Employee, daysOffKey, getSaturdays } from '@/features/grafik/lib/grafik';

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { agency: AgencyName; year: number; month: number };
  const { agency, year, month } = body;

  if (!agency || !year || !month) {
    return NextResponse.json({ error: 'agency, year, month are required' }, { status: 400 });
  }

  const employees = (await kvGet<Employee[]>('employees')) ?? [];
  const agencyEmployees = employees.filter((e) => e.agency === agency);
  const saturdays = getSaturdays(year, month);

  const indexKey = 'daysoff:index';
  const index = (await kvGet<string[]>(indexKey)) ?? [];

  for (const employee of agencyEmployees) {
    const key = daysOffKey(employee.id, year, month);
    const existing = await kvGet<DaysOffEntry>(key);
    const off = Array.from(
      new Set([...(existing?.off ?? []), ...saturdays]),
    ).sort((a, b) => a - b);
    const entry: DaysOffEntry = {
      employeeId: employee.id,
      year,
      month,
      off,
      sick: existing?.sick ?? [],
    };
    await kvSet(key, entry);
    if (!index.includes(key)) index.push(key);
  }

  await kvSet(indexKey, index);

  return NextResponse.json({ updated: agencyEmployees.length, saturdays });
}
