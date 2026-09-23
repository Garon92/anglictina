import { describe, expect, it } from 'vitest';
import { recommendModule, moduleStats, CORE_PATH } from './recommend';
import { countNewToday } from './vocabDeck';
import { createInitialSRSState } from './srs';
import type { DrillSession } from './types';

const s = (module: string, date: string, total: number, correct: number): DrillSession => ({
  date, type: module, module, startedAt: 1, endedAt: 2, totalItems: total, correctItems: correct, tags: [module],
});

describe('recommendModule', () => {
  it('suggests the first core module for a new learner', () => {
    expect(recommendModule([], {}, '2026-09-23').module.id).toBe(CORE_PATH[0]);
  });
  it('prefers the weakest recently practised module', () => {
    const sessions = [s('articles', '2026-09-20', 10, 9), s('prepositions', '2026-09-21', 10, 4), s('grammar', '2026-09-22', 10, 6)];
    const r = recommendModule(sessions, {}, '2026-09-23');
    expect(r.module.id).toBe('prepositions');
    expect(r.reason).toContain('40 %');
  });
  it('skips modules already practised today', () => {
    const sessions = [s('prepositions', '2026-09-23', 10, 2)];
    expect(recommendModule(sessions, {}, '2026-09-23').module.id).not.toBe('prepositions');
  });
  it('aggregates module stats and infers modules of legacy sessions from tags', () => {
    const legacy = { date: '2026-01-01', type: 'grammar', startedAt: 1, totalItems: 5, correctItems: 5, tags: ['articles'] } as DrillSession;
    const st = moduleStats([legacy, s('articles', '2026-01-02', 5, 1)]);
    expect(st.articles.sessions).toBe(2);
    expect(st.articles.correct).toBe(6);
    expect(st.articles.lastDay).toBe('2026-01-02');
  });
});

describe('countNewToday', () => {
  it('counts cards first reviewed today (and legacy single-review cards)', () => {
    const now = new Date(2026, 8, 23, 12).getTime();
    const today = { ...createInitialSRSState('a', 'vocab'), totalReviews: 1, firstReviewAt: now - 3600e3 };
    const old = { ...createInitialSRSState('b', 'vocab'), totalReviews: 3, firstReviewAt: now - 5 * 86400e3 };
    const legacy = { ...createInitialSRSState('c', 'vocab'), totalReviews: 1 };
    expect(countNewToday([today, old, legacy], [{ cardId: 'c' }, { cardId: 'b' }], now)).toBe(2);
  });
});
