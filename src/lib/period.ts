import type { Locale } from "../i18n/locales";

const MONTHS: Record<Locale, readonly string[]> = {
  pt: ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

const PRESENT: Record<Locale, string> = { pt: "atual", en: "present" };

export function parseYearMonth(yearMonth: string): { year: number; month: number } {
  const [year, month] = yearMonth.split("-").map(Number);
  return { year: year as number, month: month as number };
}

function monthLabel(yearMonth: string, locale: Locale): string {
  const { month } = parseYearMonth(yearMonth);
  return MONTHS[locale][month - 1] as string;
}

export function formatPeriod(start: string, end: string | null, locale: Locale): string {
  const startParts = parseYearMonth(start);
  const startLabel = `${monthLabel(start, locale)} ${startParts.year}`;

  if (end === null) {
    return `${startLabel} – ${PRESENT[locale]}`;
  }

  const endParts = parseYearMonth(end);

  if (startParts.year === endParts.year) {
    return `${monthLabel(start, locale)}–${monthLabel(end, locale)} ${startParts.year}`;
  }

  return `${startLabel} – ${monthLabel(end, locale)} ${endParts.year}`;
}

export function semesterHalf(start: string): 1 | 2 {
  const { month } = parseYearMonth(start);
  return month <= 6 ? 1 : 2;
}

const ORDINALS = ["1st", "2nd", "3rd", "4th", "5th", "6th"];

export function formatSemester(
  semester: number,
  start: string,
  locale: Locale,
  template: string,
): string {
  const { year } = parseYearMonth(start);
  const half = semesterHalf(start);

  if (locale === "en") {
    return template
      .replace("{ordinal}", ORDINALS[semester - 1] ?? `${semester}th`)
      .replace("{ano}", String(year))
      .replace("{metade}", String(half));
  }

  return template
    .replace("{n}", String(semester))
    .replace("{ano}", String(year))
    .replace("{metade}", String(half));
}
