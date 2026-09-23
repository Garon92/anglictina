import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { applyAnswerToMistake, creditedMinutes, recordAnswer, recordSession, getActiveMistakes, getDueMistakes, recordMistakeReview, getMistakeSummary, CLEAR_AFTER } from './progress';
import { resetDBConnection, DB_NAME, getDrillSessions, getStats } from './db';
import { dayKey } from './lib/dates';

(globalThis as any).localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };

beforeEach(async () => {
  await resetDBConnection();
  await new Promise<void>((r) => { const q = indexedDB.deleteDatabase(DB_NAME); q.onsuccess = q.onerror = q.onblocked = () => r(); });
});

const wrong = { module: 'grammar', itemId: 'g1', category: 'tenses', prompt: 'She ___ home.', answer: 'went', userAnswer: 'go', correct: false };

describe('mistake state machine', () => {
  it('creates, increments and clears after consecutive correct answers', () => {
    const m1 = applyAnswerToMistake(undefined, wrong, 1000)!;
    expect(m1.key).toBe('grammar:g1');
    expect(m1.wrongCount).toBe(1);
    expect(m1.kind).toBe('text');
    const m2 = applyAnswerToMistake(m1, wrong, 2000)!;
    expect(m2.wrongCount).toBe(2);
    let m = m2;
    for (let i = 0; i < CLEAR_AFTER; i++) m = applyAnswerToMistake(m, { ...wrong, correct: true }, 3000 + i)!;
    expect(m.resolvedAt).toBeDefined();
  });
  it('a wrong answer after progress resets the streak and re-opens a resolved mistake', () => {
    let m = applyAnswerToMistake(undefined, wrong, 1)!;
    m = applyAnswerToMistake(m, { ...wrong, correct: true }, 2)!;
    expect(m.rightStreak).toBe(1);
    m = applyAnswerToMistake(m, wrong, 3)!;
    expect(m.rightStreak).toBe(0);
    expect(m.resolvedAt).toBeUndefined();
  });
  it('ignores correct answers for unknown items', () => {
    expect(applyAnswerToMistake(undefined, { ...wrong, correct: true })).toBeUndefined();
  });
  it('uses mcq kind when options are present', () => {
    expect(applyAnswerToMistake(undefined, { ...wrong, options: ['go', 'went'] })!.kind).toBe('mcq');
  });
});

describe('persistence', () => {
  it('records answers and reviews', async () => {
    await recordAnswer(wrong);
    await recordAnswer({ ...wrong, itemId: 'g2', prompt: 'x' });
    expect(await getActiveMistakes()).toHaveLength(2);
    expect(await getDueMistakes()).toHaveLength(2);
    await recordMistakeReview('grammar:g1', true);
    expect(await getDueMistakes()).toHaveLength(1); // g1 now due tomorrow
    await recordMistakeReview('grammar:g1', true);
    const summary = await getMistakeSummary();
    expect(summary.active).toBe(1);
    expect(summary.resolved).toBe(1);
    expect(summary.byModule.grammar).toBe(1);
  });

  it('records sessions with local date and capped minutes', async () => {
    const now = Date.now();
    await recordSession({ module: 'articles', startedAt: now - 5 * 3600_000, endedAt: now, total: 10, correct: 8 });
    const sessions = await getDrillSessions();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].date).toBe(dayKey(now));
    expect(sessions[0].module).toBe('articles');
    const stats = await getStats();
    expect(stats.totalExercisesDone).toBe(10);
    expect(stats.totalStudyMinutes).toBeCloseTo(creditedMinutes(now - 5 * 3600_000, now, 10));
    expect(stats.streakDays).toBe(1);
    expect(await recordSession({ module: 'x', startedAt: now, total: 0, correct: 0 })).toBeNull();
  });
});
