import { describe, expect, it } from 'vitest';
import { dayKey, addDays, daysBetween, lastDays, daysUntil, czechPlural } from './dates';

describe('dates', () => {
  it('formats local day keys', () => {
    expect(dayKey(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
    expect(dayKey(new Date(2026, 11, 31, 0, 1))).toBe('2026-12-31');
  });
  it('adds days across month/year boundaries', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  it('counts days between keys (DST safe)', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-10-24', '2026-10-26')).toBe(2);
    expect(daysUntil('2026-05-05', '2026-05-01')).toBe(4);
  });
  it('lists last n days oldest first', () => {
    expect(lastDays(3, '2026-01-02')).toEqual(['2025-12-31', '2026-01-01', '2026-01-02']);
  });
  it('czech plurals', () => {
    expect(czechPlural(1, 'den', 'dny', 'dní')).toBe('den');
    expect(czechPlural(3, 'den', 'dny', 'dní')).toBe('dny');
    expect(czechPlural(5, 'den', 'dny', 'dní')).toBe('dní');
    expect(czechPlural(0, 'den', 'dny', 'dní')).toBe('dní');
  });
});
