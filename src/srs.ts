import type { SRSState } from './types';

const MIN_EASE = 1.3;
const INITIAL_EASE = 2.5;
const INITIAL_INTERVALS = [0, 1, 3];

/**
 * Simplified SM-2 algorithm adapted for A1-B1 learner.
 * Grades: 0 = no idea, 1 = wrong, 2 = hard but correct, 3 = easy
 */
export function processReview(state: SRSState, grade: number): SRSState {
  const now = Date.now();
  let { intervalDays, ease, lapses, totalReviews } = state;

  totalReviews += 1;

  if (grade < 2) {
    // Failed: reset interval, count lapse
    lapses += 1;
    intervalDays = INITIAL_INTERVALS[1];
    ease = Math.max(MIN_EASE, ease - 0.2);
  } else {
    if (totalReviews <= 3) {
      intervalDays = INITIAL_INTERVALS[Math.min(totalReviews, 2)];
    } else {
      intervalDays = Math.round(intervalDays * ease);
    }

    if (grade === 2) {
      ease = Math.max(MIN_EASE, ease - 0.15);
    } else if (grade === 3) {
      ease = ease + 0.1;
    }
  }

  intervalDays = Math.max(1, Math.min(intervalDays, 365));

  return {
    ...state,
    intervalDays,
    ease,
    lapses,
    lastGrade: grade,
    lastReviewAt: now,
    totalReviews,
    dueAt: now + intervalDays * 86400000,
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

export function getGradeLabel(grade: number): { label: string; color: string; emoji: string } {
  switch (grade) {
    case 0: return { label: 'Nevím', color: '#ef4444', emoji: '😕' };
    case 1: return { label: 'Špatně', color: '#f97316', emoji: '😬' };
    case 2: return { label: 'Těžké', color: '#eab308', emoji: '🤔' };
    case 3: return { label: 'Snadné', color: '#22c55e', emoji: '😊' };
    default: return { label: '?', color: '#6b7280', emoji: '❓' };
  }
}

export function getDueStatus(dueAt: number): 'overdue' | 'due' | 'upcoming' | 'new' {
  if (dueAt === 0) return 'new';
  const now = Date.now();
  const diffHours = (dueAt - now) / 3600000;
  if (diffHours < -24) return 'overdue';
  if (diffHours < 0) return 'due';
  return 'upcoming';
}
