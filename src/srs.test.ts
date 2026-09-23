import { describe, expect, it } from 'vitest';
import {
  processReview, createInitialSRSState, nextIntervalDays, cardStage, isDue, requeue,
  MIN_EASE, RELEARN_DELAY_MS, intervalLabel,
} from './srs';
import { startOfDay } from './lib/dates';

const DAY = 86_400_000;
const NOW = new Date(2026, 4, 1, 15, 30).getTime();

describe('SRS scheduling', () => {
  it('graduates a new card to 1 day on "good" and 4 days on "easy"', () => {
    const s = createInitialSRSState('w1', 'vocab');
    const good = processReview(s, 3, NOW);
    expect(good.intervalDays).toBe(1);
    expect(good.dueAt).toBe(startOfDay(NOW) + DAY);
    expect(good.totalReviews).toBe(1);
    expect(good.firstReviewAt).toBe(NOW);
    const easy = processReview(s, 4, NOW);
    expect(easy.intervalDays).toBe(4);
  });

  it('keeps a forgotten new card in learning and brings it back soon', () => {
    const s = processReview(createInitialSRSState('w2', 'vocab'), 0, NOW);
    expect(s.intervalDays).toBe(0);
    expect(s.dueAt).toBe(NOW + RELEARN_DELAY_MS);
    expect(s.lapses).toBe(0);
    expect(cardStage(s)).toBe('learning');
  });

  it('grows intervals with ease and shrinks ease on "hard"', () => {
    let s = processReview(createInitialSRSState('w3', 'vocab'), 3, NOW);
    s = processReview(s, 3, NOW + DAY);
    expect(s.intervalDays).toBeGreaterThanOrEqual(2);
    const before = s.intervalDays;
    const hard = processReview(s, 2, NOW + 3 * DAY);
    expect(hard.ease).toBeLessThan(s.ease);
    expect(hard.intervalDays).toBeGreaterThan(before);
    const good = processReview(s, 3, NOW + 3 * DAY);
    expect(good.intervalDays).toBeGreaterThanOrEqual(hard.intervalDays);
  });

  it('counts a lapse only for graduated cards and never drops ease below the minimum', () => {
    let s = { ...createInitialSRSState('w4', 'vocab'), intervalDays: 30, ease: 1.35, totalReviews: 6 };
    s = processReview(s, 0, NOW);
    expect(s.lapses).toBe(1);
    expect(s.ease).toBe(MIN_EASE);
    expect(s.intervalDays).toBe(0);
  });

  it('treats legacy grade 1 as a failure', () => {
    const s = processReview({ ...createInitialSRSState('w5', 'vocab'), intervalDays: 5, totalReviews: 3 }, 1, NOW);
    expect(s.intervalDays).toBe(0);
  });

  it('caps intervals at one year', () => {
    const s = { ...createInitialSRSState('w6', 'vocab'), intervalDays: 300, ease: 3, totalReviews: 10 };
    expect(nextIntervalDays(s, 4)).toBe(365);
  });

  it('knows stages and due state', () => {
    expect(cardStage(undefined)).toBe('new');
    const young = { ...createInitialSRSState('w7', 'vocab'), intervalDays: 5, totalReviews: 3, dueAt: NOW - 1 };
    expect(cardStage(young)).toBe('young');
    expect(isDue(young, NOW)).toBe(true);
    expect(cardStage({ ...young, intervalDays: 40 })).toBe('mature');
  });

  it('requeues a failed item a few positions later', () => {
    expect(requeue(['a', 'b', 'c', 'd', 'e', 'f'], 0, 'a', 3)).toEqual(['a', 'b', 'c', 'd', 'a', 'e', 'f']);
    expect(requeue(['a', 'b'], 1, 'b', 3)).toEqual(['a', 'b', 'b']);
  });

  it('labels intervals', () => {
    expect(intervalLabel(0)).toBe('10 min');
    expect(intervalLabel(3)).toBe('3 d');
    expect(intervalLabel(14)).toBe('2 týd.');
  });
});
