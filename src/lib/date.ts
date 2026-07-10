const WEEKDAYS_NL = ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag'];
const MONTHS_NL = [
  'januari', 'februari', 'maart', 'april', 'mei', 'juni',
  'juli', 'augustus', 'september', 'oktober', 'november', 'december',
];

export function pad(n: number): string {
  return n < 10 ? `0${n}` : `${n}`;
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function addDays(d: Date, days: number): Date {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function isPastDate(iso: string): boolean {
  return fromISODate(iso).getTime() < startOfDay(new Date()).getTime();
}

export function isSameDate(iso: string, d: Date): boolean {
  return iso === toISODate(d);
}

/** Human-friendly Dutch date label: "vandaag", "morgen", or "18 juli" / "18 juli 2027" */
export function formatDateNL(iso: string, opts: { withWeekday?: boolean } = {}): string {
  const d = fromISODate(iso);
  const today = startOfDay(new Date());
  const target = startOfDay(d);
  const diffDays = Math.round((target.getTime() - today.getTime()) / 86_400_000);

  if (diffDays === 0) return 'vandaag';
  if (diffDays === 1) return 'morgen';
  if (diffDays === -1) return 'gisteren';

  const withYear = d.getFullYear() !== today.getFullYear();
  const base = `${d.getDate()} ${MONTHS_NL[d.getMonth()]}${withYear ? ' ' + d.getFullYear() : ''}`;
  if (opts.withWeekday) {
    return `${WEEKDAYS_NL[d.getDay()]} ${base}`;
  }
  return base;
}

export function formatTimeNL(time: string | null): string {
  if (!time) return '';
  return time;
}

export function nextWeekdayOccurrence(ref: Date, targetWeekday: number, skipToNextWeek: boolean): Date {
  const refStart = startOfDay(ref);
  let diff = (targetWeekday - refStart.getDay() + 7) % 7;
  if (skipToNextWeek) diff += 7;
  return addDays(refStart, diff);
}

/** Given a month/day with no year, pick the nearest year that isn't in the past. */
export function inferYear(ref: Date, month: number, day: number): number {
  const refStart = startOfDay(ref);
  const candidate = new Date(refStart.getFullYear(), month, day);
  return candidate.getTime() < refStart.getTime() ? refStart.getFullYear() + 1 : refStart.getFullYear();
}

export const WEEKDAY_NAMES_NL = WEEKDAYS_NL;
export const MONTH_NAMES_NL = MONTHS_NL;
