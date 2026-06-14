import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { kvGet } from '@/lib/kv';
import { AgencyName } from '@/features/schedule/lib/schedule';
import { DaysOffEntry, Employee, daysOffKey } from '@/features/grafik/lib/grafik';
import { LANGUAGES, Language } from '@/features/i18n/translations';
import GrafikPdfDocument from '@/features/grafik/ui/GrafikPdfDocument';

export async function GET(request: NextRequest) {
  const agency = request.nextUrl.searchParams.get('agency') as AgencyName | null;
  const year = Number(request.nextUrl.searchParams.get('year'));
  const month = Number(request.nextUrl.searchParams.get('month'));
  const langParam = request.nextUrl.searchParams.get('lang') as Language | null;
  const lang: Language = langParam && LANGUAGES.includes(langParam) ? langParam : 'pl';

  if (!agency || !year || !month) {
    return NextResponse.json({ error: 'agency, year, month are required' }, { status: 400 });
  }

  const allEmployees = (await kvGet<Employee[]>('employees')) ?? [];
  const employees = allEmployees.filter((e) => e.agency === agency);

  const entries: Record<string, DaysOffEntry> = {};
  await Promise.all(
    employees.map(async (employee) => {
      const entry = await kvGet<DaysOffEntry>(daysOffKey(employee.id, year, month));
      if (entry) entries[employee.id] = entry;
    }),
  );

  const buffer = await renderToBuffer(
    <GrafikPdfDocument agency={agency} year={year} month={month} lang={lang} employees={employees} entries={entries} />,
  );

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="grafik-${agency}-${year}-${month}.pdf"`,
    },
  });
}
