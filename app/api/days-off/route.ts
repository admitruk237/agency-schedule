import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv';
import { DaysOffEntry, daysOffKey } from '@/features/grafik/lib/grafik';

export async function GET(request: NextRequest) {
  const employeeId = request.nextUrl.searchParams.get('employeeId');
  const year = Number(request.nextUrl.searchParams.get('year'));
  const month = Number(request.nextUrl.searchParams.get('month'));

  if (!employeeId || !year || !month) {
    return NextResponse.json(
      { error: 'employeeId, year, month are required' },
      { status: 400 },
    );
  }

  const entry = await kvGet<DaysOffEntry>(daysOffKey(employeeId, year, month));
  return NextResponse.json(
    entry ?? { employeeId, year, month, off: [], sick: [] },
  );
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as DaysOffEntry;
  const { employeeId, year, month, off, sick } = body;

  if (!employeeId || !year || !month || !Array.isArray(off) || !Array.isArray(sick)) {
    return NextResponse.json(
      { error: 'employeeId, year, month, off, sick are required' },
      { status: 400 },
    );
  }

  const key = daysOffKey(employeeId, year, month);
  const entry: DaysOffEntry = { employeeId, year, month, off, sick };
  await kvSet(key, entry);

  const indexKey = 'daysoff:index';
  const index = (await kvGet<string[]>(indexKey)) ?? [];
  if (!index.includes(key)) {
    index.push(key);
    await kvSet(indexKey, index);
  }

  return NextResponse.json(entry);
}
