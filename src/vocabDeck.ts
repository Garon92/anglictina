import { getAllSRSStates, getReviewLogs } from './db';
import { startOfDay } from './lib/dates';
import { cardStage } from './srs';
import type { SRSState, UserSettings, VocabWord } from './types';

export const VOCAB_DECK = 'vocab';

export interface DeckOverview {
  total: number;
  due: number;
  newToday: number;
  newLimit: number;
  newAvailable: number;
  reviewedToday: number;
  /** Cards learned before today that were reviewed today (real "repetition" work). */
  oldReviewedToday: number;
  learning: number;
  young: number;
  mature: number;
  seen: number;
}

/** Cards first reviewed today (new cards introduced today). */
export function countNewToday(states: SRSState[], logsToday: { cardId: string }[], now = Date.now()): number {
  const sod = startOfDay(now);
  const ids = new Set<string>();
  for (const s of states) {
    if (s.firstReviewAt !== undefined && s.firstReviewAt >= sod) ids.add(s.cardId);
  }
  // Older cards have no firstReviewAt: fall back to "only one review ever and it was today".
  const todayIds = new Set(logsToday.map((l) => l.cardId));
  for (const s of states) {
    if (s.firstReviewAt === undefined && s.totalReviews <= 1 && todayIds.has(s.cardId)) ids.add(s.cardId);
  }
  return ids.size;
}

export async function getDeckOverview(settings: UserSettings, deckId = VOCAB_DECK, totalCards = 0, now = Date.now()): Promise<DeckOverview> {
  const [states, logs] = await Promise.all([getAllSRSStates(deckId), getReviewLogs(startOfDay(now))]);
  const logsToday = logs.filter((l) => l.deckId === deckId);
  let due = 0, learning = 0, young = 0, mature = 0, seen = 0;
  for (const s of states) {
    if (s.totalReviews === 0) continue;
    seen++;
    if (s.dueAt <= now) due++;
    const st = cardStage(s);
    if (st === 'learning') learning++;
    else if (st === 'young') young++;
    else if (st === 'mature') mature++;
  }
  const newToday = countNewToday(states, logsToday, now);
  return {
    total: totalCards,
    due,
    newToday,
    newLimit: settings.newCardsPerDay,
    newAvailable: Math.max(0, Math.min(settings.newCardsPerDay - newToday, totalCards - seen)),
    reviewedToday: new Set(logsToday.map((l) => l.cardId)).size,
    oldReviewedToday: (() => {
      const sod = startOfDay(now);
      const byId = new Map(states.map((s) => [s.cardId, s]));
      const ids = new Set<string>();
      for (const l of logsToday) {
        const st = byId.get(l.cardId);
        if (!st) continue;
        const learnedBefore = st.firstReviewAt !== undefined ? st.firstReviewAt < sod : st.totalReviews > 1;
        if (learnedBefore) ids.add(l.cardId);
      }
      return ids.size;
    })(),
    learning,
    young,
    mature,
    seen,
  };
}

/** Order in which new words are introduced: curated rich entries first, then NGSL by frequency. */
export function newWordQueue(words: VocabWord[], seenIds: Set<string>, opts: { band?: 1 | 2 | 3 | 0; topic?: string } = {}): VocabWord[] {
  return words.filter((w) => {
    if (seenIds.has(w.id)) return false;
    if (opts.band && w.band !== opts.band) return false;
    if (opts.topic && !w.topics.includes(opts.topic)) return false;
    return true;
  });
}
