import type { ExamSession } from '../types';
import { PARTS, type Subtest } from './structure';

/** Max points of a subtest in a stored attempt (0 = not part of the attempt, null = legacy record). */
export function subtestMax(e: ExamSession, sub: Subtest): number | null {
  if (!e.partMax) return null;
  return PARTS.filter((p) => p.subtest === sub).reduce((s, p) => s + (e.partMax?.[p.no - 1] ?? 0), 0);
}

/** "55 %" or "–" when the subtest wasn't part of the attempt. */
export function skillPct(e: ExamSession, sub: Subtest): string {
  const max = subtestMax(e, sub);
  if (max === 0) return '–';
  return `${Math.round(e.scoreBySkill[sub])} %`;
}

/** Short summary "P 55 % · Č 50 % · J –". */
export function skillSummary(e: ExamSession): string {
  return `P ${skillPct(e, 'listening')} · Č ${skillPct(e, 'reading')} · J ${skillPct(e, 'language')}`;
}

export function attemptLabel(e: ExamSession): string {
  if (e.mode === 'full') return 'Celý test';
  if (e.mode === 'listening') return 'Jen poslech';
  if (e.mode === 'reading') return 'Čtení + jazyk';
  if (e.mode === 'part') return 'Trénink části';
  if (e.notes === 'mini-test' || e.mode === 'mini') return 'Mini-test';
  return 'Simulace (starší verze)';
}

/** Score as points for full tests, percentage otherwise. */
export function scoreText(e: ExamSession): string {
  if (e.mode === 'full') return `${Math.round(e.scoreTotal)} b`;
  return `${e.maxScore ? Math.round((e.scoreTotal / e.maxScore) * 100) : 0} %`;
}

export function passedAttempt(e: ExamSession): boolean {
  return e.maxScore > 0 && e.scoreTotal / e.maxScore >= 0.44;
}
