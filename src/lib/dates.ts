/** Local-time day helpers. All "day keys" are YYYY-MM-DD in the user's local time zone. */

const DAY_MS = 86_400_000;

export function dayKey(date: Date | number = new Date()): string {
  const d = typeof date === 'number' ? new Date(date) : date;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse a YYYY-MM-DD key as local midnight. */
export function parseDayKey(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(key: string, days: number): string {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

/** Whole calendar days from `a` to `b` (b - a), DST-safe. */
export function daysBetween(a: string, b: string): number {
  const da = parseDayKey(a);
  const db = parseDayKey(b);
  return Math.round((Date.UTC(db.getFullYear(), db.getMonth(), db.getDate()) - Date.UTC(da.getFullYear(), da.getMonth(), da.getDate())) / DAY_MS);
}

export function startOfDay(date: Date | number = new Date()): number {
  const d = new Date(typeof date === 'number' ? date : date.getTime());
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** End of the local day (exclusive), useful for "due today" checks. */
export function endOfDay(date: Date | number = new Date()): number {
  const d = new Date(startOfDay(date));
  d.setDate(d.getDate() + 1);
  return d.getTime();
}

/** Last `n` day keys ending today (oldest first). */
export function lastDays(n: number, today = dayKey()): string[] {
  return Array.from({ length: n }, (_, i) => addDays(today, i - (n - 1)));
}

/** Days until a YYYY-MM-DD date (0 = today, negative = past). */
export function daysUntil(dateKey: string, today = dayKey()): number {
  return daysBetween(today, dateKey);
}

export const DAY_NAMES_SHORT = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'];

export function czechPlural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n);
  if (abs === 1) return one;
  if (abs >= 2 && abs <= 4) return few;
  return many;
}
