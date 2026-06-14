import path from 'path';
import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { AgencyName } from '../../schedule/lib/schedule';
import { DaysOffEntry, Employee, daysInMonth, getDayStatus } from '../lib/grafik';
import { Language, MONTH_NAMES, translations } from '../../i18n/translations';

// Geist supports Cyrillic and Polish/Romanian diacritics, unlike the standard Helvetica PDF font.
Font.register({
  family: 'Geist',
  src: path.join(process.cwd(), 'assets/fonts/Geist-Regular.ttf'),
});

const COL_WIDTH = 20;
const ROW_HEIGHT = 14;
const HEADER_HEIGHT = 110;
const DAY_COL_WIDTH = 60;

const styles = StyleSheet.create({
  page: { padding: 24, fontFamily: 'Geist' },
  title: { fontSize: 12, fontWeight: 700, marginBottom: 8 },
  table: { borderWidth: 1, borderColor: '#000' },
  row: { flexDirection: 'row' },
  cornerCell: {
    width: DAY_COL_WIDTH,
    height: HEADER_HEIGHT,
    borderWidth: 0.5,
    borderColor: '#000',
    justifyContent: 'flex-end',
    padding: 4,
  },
  cornerText: { fontSize: 9, fontWeight: 700 },
  headerCell: {
    width: COL_WIDTH,
    height: HEADER_HEIGHT,
    borderWidth: 0.5,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  headerTextWrap: {
    width: HEADER_HEIGHT - 8,
    transform: 'rotate(-90deg)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { fontSize: 7 },
  dayCell: {
    width: DAY_COL_WIDTH,
    height: ROW_HEIGHT,
    borderWidth: 0.5,
    borderColor: '#000',
    justifyContent: 'center',
    paddingLeft: 4,
  },
  dayText: { fontSize: 8 },
  cell: {
    width: COL_WIDTH,
    height: ROW_HEIGHT,
    borderWidth: 0.5,
    borderColor: '#000',
  },
  cellOff: { backgroundColor: '#808080' },
  cellSick: { backgroundColor: '#fde68a' },
  legend: { flexDirection: 'row', marginTop: 12, alignItems: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginRight: 16 },
  legendSwatch: { width: 10, height: 10, borderWidth: 0.5, borderColor: '#000', marginRight: 4 },
  legendText: { fontSize: 8 },
});

interface Props {
  agency: AgencyName;
  year: number;
  month: number;
  lang: Language;
  employees: Employee[];
  entries: Record<string, DaysOffEntry>;
}

export default function GrafikPdfDocument({ agency, year, month, lang, employees, entries }: Props) {
  const total = daysInMonth(year, month);
  const days = Array.from({ length: total }, (_, i) => i + 1);
  const monthLabel = MONTH_NAMES[lang][month - 1];
  const monthAbbr = monthLabel.slice(0, 4).toLowerCase();
  const t = translations[lang];

  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>
          {agency} — {monthLabel} {year}
        </Text>
        <View style={styles.table}>
          <View style={styles.row}>
            <View style={styles.cornerCell}>
              <Text style={styles.cornerText}>{monthLabel}</Text>
            </View>
            {employees.map((employee) => (
              <View key={employee.id} style={styles.headerCell}>
                <View style={styles.headerTextWrap}>
                  <Text style={styles.headerText}>{employee.name}</Text>
                </View>
              </View>
            ))}
          </View>
          {days.map((day) => {
            const dayLabel = `${day}-${monthAbbr}.`;
            return (
              <View key={day} style={styles.row}>
                <View style={styles.dayCell}>
                  <Text style={styles.dayText}>{dayLabel}</Text>
                </View>
                {employees.map((employee) => {
                  const entry = entries[employee.id];
                  const status = entry ? getDayStatus(entry, day) : 'work';
                  return (
                    <View
                      key={employee.id}
                      style={[
                        styles.cell,
                        status === 'off' ? styles.cellOff : {},
                        status === 'sick' ? styles.cellSick : {},
                      ]}
                    />
                  );
                })}
              </View>
            );
          })}
        </View>
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.cellOff]} />
            <Text style={styles.legendText}>{t['grafik.legendOff']}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, styles.cellSick]} />
            <Text style={styles.legendText}>{t['grafik.legendSick']}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
