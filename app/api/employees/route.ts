import { NextRequest, NextResponse } from 'next/server';
import { kvGet, kvSet } from '@/lib/kv';
import { AgencyName } from '@/features/schedule/lib/schedule';
import { Employee } from '@/features/grafik/lib/grafik';

const KEY = 'employees';

export async function GET(request: NextRequest) {
  const agency = request.nextUrl.searchParams.get('agency') as AgencyName | null;
  const employees = (await kvGet<Employee[]>(KEY)) ?? [];
  const filtered = agency ? employees.filter((e) => e.agency === agency) : employees;
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as { name: string; agency: AgencyName };
  const name = body.name?.trim();

  if (!name || !body.agency) {
    return NextResponse.json({ error: 'name and agency are required' }, { status: 400 });
  }

  const employees = (await kvGet<Employee[]>(KEY)) ?? [];
  const employee: Employee = {
    id: crypto.randomUUID(),
    name,
    agency: body.agency,
  };
  employees.push(employee);
  await kvSet(KEY, employees);

  return NextResponse.json(employee, { status: 201 });
}
