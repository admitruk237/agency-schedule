import { NextResponse } from 'next/server';
import { kvDel, kvGet, kvSet } from '@/lib/kv';
import { Employee } from '@/features/grafik/lib/grafik';

const KEY = 'employees';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const employees = (await kvGet<Employee[]>(KEY)) ?? [];
  const next = employees.filter((e) => e.id !== id);
  await kvSet(KEY, next);

  // Clean up any days-off entries for this employee
  const indexKey = 'daysoff:index';
  const index = (await kvGet<string[]>(indexKey)) ?? [];
  const remaining: string[] = [];
  for (const key of index) {
    if (key.startsWith(`daysoff:${id}:`)) {
      await kvDel(key);
    } else {
      remaining.push(key);
    }
  }
  await kvSet(indexKey, remaining);

  return NextResponse.json({ ok: true });
}
