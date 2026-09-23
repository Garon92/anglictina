import type { SRSState } from './types';
import { startOfDay } from './lib/dates';

/**
 * Spaced-repetition scheduler (SM-2 family, Anki-like buttons) tuned for A1–B1 vocabulary.
 *
 * Grades:
 *   0 = Znovu (forgot)   1 = legacy "wrong" (treated as forgot)
 *   2 = Těžké (hard)     3 = Dobře (good)     4 = Snadné (easy)
 * Grades ≥ 2 count as a successful recall (this matches historical review logs, where
 * the old UI stored 0 = "Neumím" and 3 = "Umím").
 *
 * Day intervals are anchored to the start of the local day, so a card scheduled
 * "in 1 day" becomes due at midnight rather than exactly 24 hours later.
 */

export type Grade = 0 | 1 | 2 | 3 | 4;

export const GRADE_AGAIN: Grade = 0;
export const GRADE_HARD: Grade = 2;
export const GRADE_GOOD: Grade = 3;
export const GRADE_EASY: Grade = 4;

export const MIN_EASE = 1.3;
export const MAX_EASE = 3.2;
export const INITIAL_EASE = 2.5;
export const MAX_INTERVAL_DAYS = 365;
/** A failed card comes back after this many ms (it is also re-queued within the session). */
export const RELEARN_DELAY_MS = 10 * 60_000;
/** Interval (days) from which a card counts as "mature" (well learned). */
export const MATURE_DAYS = 21;

const DAY_MS = 86_400_000;

export function isPass(grade: number): boolean {
  return grade >= 2;
}

function dayDue(now: number, days: number): number {
  return startOfDay(now) + days * DAY_MS;
}

/** Deterministic ±5 % fuzz so cards learned together don't all come due on the same day. */
function fuzz(days: number, seed: string): number {
  if (days < 3) return days;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  const f = ((Math.abs(h) % 1000) / 1000 - 0.5) * 0.1; // −5 % … +5 %
  return Math.max(1, Math.round(days * (1 + f)));
}

/** Compute the interval (days) a grade would produce, without mutating anything. */
export function nextIntervalDays(state: SRSState, grade: number): number {
  if (!isPass(grade)) return 0;
  const prev = state.intervalDays;
  const ease = state.ease || INITIAL_EASE;
  let days: number;
  if (prev < 1) {
    // new or relearning card: graduate to 1 day, or 4 days when it was easy
    days = grade >= 4 ? 4 : 1;
  } else if (grade === 2) {
    days = Math.max(prev + 1, Math.round(prev * 1.2));
  } else if (grade >= 4) {
    days = Math.max(prev + 2, Math.round(prev * ease * 1.3));
  } else {
    days = Math.max(prev + 1, Math.round(prev * ease));
  }
  return Math.min(MAX_INTERVAL_DAYS, days);
}

export function processReview(state: SRSState, grade: number, now = Date.now()): SRSState {
  const totalReviews = state.totalReviews + 1;
  let { ease, lapses } = state;
  ease = ease || INITIAL_EASE;

  if (!isPass(grade)) {
    const wasGraduated = state.intervalDays >= 1;
    return {
      ...state,
      intervalDays: 0,
      ease: Math.max(MIN_EASE, ease - (wasGraduated ? 0.2 : 0)),
      lapses: lapses + (wasGraduated ? 1 : 0),
      lastGrade: grade,
      lastReviewAt: now,
      totalReviews,
      firstReviewAt: state.firstReviewAt ?? now,
      dueAt: now + RELEARN_DELAY_MS,
    };
  }

  const baseDays = nextIntervalDays(state, grade);
  const days = Math.min(MAX_INTERVAL_DAYS, fuzz(baseDays, `${state.cardId}:${totalReviews}`));
  if (grade === 2) ease = Math.max(MIN_EASE, ease - 0.15);
  else if (grade >= 4) ease = Math.min(MAX_EASE, ease + 0.15);

  return {
    ...state,
    intervalDays: days,
    ease,
    lapses,
    lastGrade: grade,
    lastReviewAt: now,
    totalReviews,
    firstReviewAt: state.firstReviewAt ?? now,
    dueAt: dayDue(now, days),
  };
}

export function createInitialSRSState(cardId: string, deckId: string): SRSState {
  return {
    cardId,
    deckId,
    dueAt: 0,
    intervalDays: 0,
    ease: INITIAL_EASE,
    lapses: 0,
    lastGrade: -1,
    lastReviewAt: 0,
    totalReviews: 0,
  };
}

export type CardStage = 'new' | 'learning' | 'young' | 'mature';

export function cardStage(state: SRSState | undefined): CardStage {
  if (!state || state.totalReviews === 0) return 'new';
  if (state.intervalDays < 1) return 'learning';
  if (state.intervalDays < MATURE_DAYS) return 'young';
  return 'mature';
}

/** Is the card due at `now`? Day-scheduled cards are due for the whole local day. */
export function isDue(state: SRSState, now = Date.now()): boolean {
  return state.totalReviews > 0 && state.dueAt <= now;
}

/** Human label for the interval a grade would give, e.g. "10 min", "1 d", "3 týd.". */
export function intervalLabel(days: number): string {
  if (days <= 0) return '10 min';
  if (days < 7) return `${days} d`;
  if (days < 30) return `${Math.round(days / 7)} týd.`;
  if (days < 365) return `${Math.round(days / 30)} měs.`;
  return `${Math.round(days / 365)} r.`;
}

export function getGradeLabel(grade: number): { label: string; color: string } {
  switch (grade) {
    case 0:
    case 1:
      return { label: 'Znovu', color: '#ef4444' };
    case 2:
      return { label: 'Těžké', color: '#f59e0b' };
    case 3:
      return { label: 'Dobře', color: '#22c55e' };
    case 4:
      return { label: 'Snadné', color: '#3b82f6' };
    default:
      return { label: '?', color: '#6b7280' };
  }
}

/**
 * Re-insert a failed card later in the current session queue (learning step).
 * Returns a new array; the card is placed `gap` positions after the current one
 * (or at the end when the queue is short).
 */
export function requeue<T>(queue: T[], currentIndex: number, item: T, gap = 4): T[] {
  const pos = Math.min(queue.length, currentIndex + 1 + gap);
  const next = queue.slice();
  next.splice(pos, 0, item);
  return next;
}
