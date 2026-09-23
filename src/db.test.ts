import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { openDB } from 'idb';
import {
  DB_NAME, getDB, resetDBConnection, getSettings, getStats, getAllSRSStates, getAllMistakes,
  getDrillSessions, updateStreak, currentStreak, exportAllData, importData, clearAllData, getDueCards,
  LEGACY_ERRORS_KEY, legacyErrorsToMistakes,
} from './db';
import type { UserStats } from './types';

class MemoryStorage {
  private m = new Map<string, string>();
  getItem(k: string) { return this.m.has(k) ? this.m.get(k)! : null; }
  setItem(k: string, v: string) { this.m.set(k, String(v)); }
  removeItem(k: string) { this.m.delete(k); }
  clear() { this.m.clear(); }
}
(globalThis as any).localStorage = new MemoryStorage();

async function createV1Database() {
  const db = await openDB(DB_NAME, 1, {
    upgrade(d) {
      d.createObjectStore('settings');
      d.createObjectStore('stats');
      const srs = d.createObjectStore('srsState', { keyPath: 'cardId' });
      srs.createIndex('by-due', 'dueAt');
      srs.createIndex('by-deck', 'deckId');
      const rl = d.createObjectStore('reviewLog', { keyPath: 'id', autoIncrement: true });
      rl.createIndex('by-card', 'cardId');
      rl.createIndex('by-timestamp', 'timestamp');
      const ds = d.createObjectStore('drillSession', { keyPath: 'id', autoIncrement: true });
      ds.createIndex('by-date', 'date');
      const es = d.createObjectStore('examSession', { keyPath: 'id', autoIncrement: true });
      es.createIndex('by-date', 'startedAt');
    },
  });
  await db.put('settings', { onboardingDone: true, theme: 'dark', goalScore: 70 }, 'main');
  await db.put('stats', { streakDays: 5, lastActiveDate: '2026-01-01', totalStudyMinutes: 120, totalCardsLearned: 40, totalExercisesDone: 300, bestStreak: 9, diagnosticScores: [] }, 'main');
  await db.put('srsState', { cardId: 'ngsl-12', deckId: 'vocab', dueAt: 1, intervalDays: 3, ease: 2.5, lapses: 0, lastGrade: 3, lastReviewAt: 1, totalReviews: 2 });
  await db.add('drillSession', { date: '2026-01-01', type: 'grammar', startedAt: 1, endedAt: 60001, totalItems: 10, correctItems: 7, tags: ['articles'] });
  db.close();
}

beforeEach(async () => {
  await resetDBConnection();
  await new Promise<void>((resolve) => {
    const req = indexedDB.deleteDatabase(DB_NAME);
    req.onsuccess = () => resolve();
    req.onerror = () => resolve();
    req.onblocked = () => resolve();
  });
  localStorage.clear();
});

describe('IndexedDB migration v1 → v2', () => {
  it('keeps all v1 data and migrates the localStorage error log', async () => {
    await createV1Database();
    localStorage.setItem(LEGACY_ERRORS_KEY, JSON.stringify([
      { timestamp: 10, module: 'grammar', category: 'tenses', question: 'She ___ (go) home.', userAnswer: 'go', correctAnswer: 'went' },
      { timestamp: 20, module: 'grammar', category: 'tenses', question: 'She ___ (go) home.', userAnswer: 'goed', correctAnswer: 'went' },
      { timestamp: 30, module: 'vocab', category: '', question: 'apple', userAnswer: 'hruška', correctAnswer: 'jablko' },
    ]));

    const db = await getDB();
    expect(db.version).toBe(2);
    expect([...db.objectStoreNames].sort()).toEqual(
      ['drillSession', 'examSession', 'kv', 'mistakes', 'reviewLog', 'settings', 'srsState', 'stats'],
    );

    const settings = await getSettings();
    expect(settings.onboardingDone).toBe(true);
    expect(settings.goalScore).toBe(70);
    // defaults are filled in for fields that did not exist in older versions
    expect(settings.newCardsPerDay).toBeGreaterThan(0);

    expect((await getStats()).bestStreak).toBe(9);
    expect(await getAllSRSStates('vocab')).toHaveLength(1);
    expect(await getDrillSessions()).toHaveLength(1);

    const mistakes = await getAllMistakes();
    expect(mistakes).toHaveLength(2);
    const went = mistakes.find((m) => m.answer === 'went')!;
    expect(went.wrongCount).toBe(2);
    expect(went.lastWrong).toBe('goed');
    expect(went.kind).toBe('reveal');
    // the legacy key is kept as a backup
    expect(localStorage.getItem(LEGACY_ERRORS_KEY)).not.toBeNull();
  });

  it('creates a fresh database from scratch', async () => {
    const db = await getDB();
    expect(db.version).toBe(2);
    expect((await getSettings()).onboardingDone).toBe(false);
    expect(await getAllMistakes()).toEqual([]);
  });
});

describe('legacyErrorsToMistakes', () => {
  it('ignores malformed entries', () => {
    expect(legacyErrorsToMistakes([null as any, { foo: 1 } as any])).toEqual([]);
  });
});

describe('streak', () => {
  it('increments on consecutive days and resets after a gap', async () => {
    let s = await updateStreak('2026-02-01');
    expect(s.streakDays).toBe(1);
    s = await updateStreak('2026-02-01');
    expect(s.streakDays).toBe(1);
    s = await updateStreak('2026-02-02');
    expect(s.streakDays).toBe(2);
    s = await updateStreak('2026-02-05');
    expect(s.streakDays).toBe(1);
    expect(s.bestStreak).toBe(2);
  });
  it('displays 0 when the chain is broken', () => {
    const stats = { streakDays: 4, lastActiveDate: '2026-02-01' } as UserStats;
    expect(currentStreak(stats, '2026-02-02')).toBe(4);
    expect(currentStreak(stats, '2026-02-03')).toBe(0);
  });
});

describe('due cards', () => {
  it('returns only reviewed cards that are due', async () => {
    const db = await getDB();
    await db.put('srsState', { cardId: 'a', deckId: 'vocab', dueAt: 100, intervalDays: 1, ease: 2.5, lapses: 0, lastGrade: 3, lastReviewAt: 1, totalReviews: 1 });
    await db.put('srsState', { cardId: 'b', deckId: 'vocab', dueAt: 5000, intervalDays: 1, ease: 2.5, lapses: 0, lastGrade: 3, lastReviewAt: 1, totalReviews: 1 });
    await db.put('srsState', { cardId: 'c', deckId: 'custom', dueAt: 100, intervalDays: 1, ease: 2.5, lapses: 0, lastGrade: 3, lastReviewAt: 1, totalReviews: 1 });
    expect((await getDueCards('vocab', 50, 1000)).map((s) => s.cardId)).toEqual(['a']);
    expect((await getDueCards(undefined, 50, 1000)).map((s) => s.cardId).sort()).toEqual(['a', 'c']);
  });
});

describe('backup', () => {
  it('round-trips export → clear → import', async () => {
    await createV1Database();
    localStorage.setItem('anglictina_favorites', JSON.stringify([{ id: 'x', type: 'vocab', text: 'x', translation: 'x', addedAt: 1 }]));
    const json = await exportAllData();
    await clearAllData();
    localStorage.removeItem('anglictina_favorites');
    expect(await getAllSRSStates()).toHaveLength(0);
    await importData(json);
    expect(await getAllSRSStates()).toHaveLength(1);
    expect((await getSettings()).goalScore).toBe(70);
    expect(JSON.parse(localStorage.getItem('anglictina_favorites')!)).toHaveLength(1);
  });
});
