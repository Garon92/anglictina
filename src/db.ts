import { openDB, type DBSchema, type IDBPDatabase, type IDBPTransaction, type StoreNames } from 'idb';
import type {
  SRSState, ReviewLog, DrillSession, ExamSession, UserSettings, UserStats, MistakeItem, KVRecord,
} from './types';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from './types';
import { dayKey, addDays } from './lib/dates';

/**
 * IndexedDB schema history
 *  v1 — settings, stats, srsState, reviewLog, drillSession, examSession
 *  v2 — + mistakes (migrated from localStorage "anglictina_errors"), + kv
 * Upgrades only ever ADD stores/indexes; user data is never cleared by a migration.
 */
export const DB_NAME = 'anglictina-db';
export const DB_VERSION = 2;
export const LEGACY_ERRORS_KEY = 'anglictina_errors';

interface AppDB extends DBSchema {
  settings: { key: string; value: UserSettings };
  stats: { key: string; value: UserStats };
  srsState: {
    key: string;
    value: SRSState;
    indexes: { 'by-due': number; 'by-deck': string };
  };
  reviewLog: {
    key: number;
    value: ReviewLog;
    indexes: { 'by-card': string; 'by-timestamp': number };
  };
  drillSession: {
    key: number;
    value: DrillSession;
    indexes: { 'by-date': string };
  };
  examSession: {
    key: number;
    value: ExamSession;
    indexes: { 'by-date': number };
  };
  mistakes: {
    key: string;
    value: MistakeItem;
    indexes: { 'by-due': number; 'by-module': string };
  };
  kv: { key: string; value: KVRecord };
}

type AnyStore = StoreNames<AppDB>;
const ALL_STORES: AnyStore[] = ['settings', 'stats', 'srsState', 'reviewLog', 'drillSession', 'examSession', 'mistakes', 'kv'];

interface LegacyErrorEntry {
  timestamp: number;
  module: string;
  category: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

function hashKey(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}

/** Convert the old localStorage error log into mistake items (one per unique question). */
export function legacyErrorsToMistakes(entries: LegacyErrorEntry[], now = Date.now()): MistakeItem[] {
  const byKey = new Map<string, MistakeItem>();
  for (const e of entries) {
    if (!e || typeof e.question !== 'string' || typeof e.correctAnswer !== 'string') continue;
    const module = e.module || 'other';
    const key = `${module}:legacy-${hashKey(`${e.question}|${e.correctAnswer}`)}`;
    const prev = byKey.get(key);
    const ts = typeof e.timestamp === 'number' ? e.timestamp : now;
    if (prev) {
      prev.wrongCount += 1;
      prev.lastWrong = e.userAnswer ?? prev.lastWrong;
      prev.updatedAt = Math.max(prev.updatedAt, ts);
    } else {
      byKey.set(key, {
        key,
        module,
        category: e.category || '',
        prompt: e.question,
        kind: 'reveal',
        answer: e.correctAnswer,
        lastWrong: e.userAnswer ?? '',
        wrongCount: 1,
        rightStreak: 0,
        createdAt: ts,
        updatedAt: ts,
        dueAt: 0,
      });
    }
  }
  return [...byKey.values()];
}

function readLegacyErrors(): LegacyErrorEntry[] {
  try {
    const raw = globalThis.localStorage?.getItem(LEGACY_ERRORS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function upgradeDB(
  db: IDBPDatabase<AppDB>,
  oldVersion: number,
  tx: IDBPTransaction<AppDB, AnyStore[], 'versionchange'>,
) {
  if (oldVersion < 1) {
    db.createObjectStore('settings');
    db.createObjectStore('stats');

    const srsStore = db.createObjectStore('srsState', { keyPath: 'cardId' });
    srsStore.createIndex('by-due', 'dueAt');
    srsStore.createIndex('by-deck', 'deckId');

    const reviewStore = db.createObjectStore('reviewLog', { keyPath: 'id', autoIncrement: true });
    reviewStore.createIndex('by-card', 'cardId');
    reviewStore.createIndex('by-timestamp', 'timestamp');

    const drillStore = db.createObjectStore('drillSession', { keyPath: 'id', autoIncrement: true });
    drillStore.createIndex('by-date', 'date');

    const examStore = db.createObjectStore('examSession', { keyPath: 'id', autoIncrement: true });
    examStore.createIndex('by-date', 'startedAt');
  }
  if (oldVersion < 2) {
    const mistakes = db.createObjectStore('mistakes', { keyPath: 'key' });
    mistakes.createIndex('by-due', 'dueAt');
    mistakes.createIndex('by-module', 'module');
    db.createObjectStore('kv', { keyPath: 'key' });

    // Migrate the legacy localStorage error log. The localStorage copy is left in place as a backup.
    const store = tx.objectStore('mistakes');
    for (const item of legacyErrorsToMistakes(readLegacyErrors())) void store.put(item);
  }
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<AppDB>> {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, _newVersion, tx) {
        upgradeDB(db, oldVersion, tx);
      },
      blocking() {
        // Another tab wants a newer schema: close so it can upgrade, then reload lazily.
        void dbPromise?.then((d) => d.close());
        dbPromise = null;
      },
    });
  }
  return dbPromise;
}

/** For tests: forget the cached connection. */
export async function resetDBConnection(): Promise<void> {
  if (dbPromise) (await dbPromise).close();
  dbPromise = null;
}

// ─── Settings & stats ────────────────────────────────────────────────

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB();
  const s = await db.get('settings', 'main');
  return { ...DEFAULT_SETTINGS, ...(s ?? {}) };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'main');
}

export async function getStats(): Promise<UserStats> {
  const db = await getDB();
  const s = await db.get('stats', 'main');
  return { ...DEFAULT_STATS, ...(s ?? {}) };
}

export async function saveStats(stats: UserStats): Promise<void> {
  const db = await getDB();
  await db.put('stats', stats, 'main');
}

/**
 * Register study activity for today and update the streak.
 * Call when a learning session is completed (not merely when the app is opened).
 */
export async function updateStreak(today = dayKey()): Promise<UserStats> {
  const stats = await getStats();
  if (stats.lastActiveDate === today) return stats;
  stats.streakDays = stats.lastActiveDate === addDays(today, -1) ? stats.streakDays + 1 : 1;
  stats.lastActiveDate = today;
  if (stats.streakDays > stats.bestStreak) stats.bestStreak = stats.streakDays;
  await saveStats(stats);
  return stats;
}

/** Streak as it should be displayed today (0 when the chain is broken). Read-only. */
export function currentStreak(stats: UserStats, today = dayKey()): number {
  if (!stats.lastActiveDate) return 0;
  if (stats.lastActiveDate === today || stats.lastActiveDate === addDays(today, -1)) return stats.streakDays;
  return 0;
}

// ─── SRS ─────────────────────────────────────────────────────────────

export async function getSRSState(cardId: string): Promise<SRSState | undefined> {
  const db = await getDB();
  return db.get('srsState', cardId);
}

export async function saveSRSState(state: SRSState): Promise<void> {
  const db = await getDB();
  await db.put('srsState', state);
}

export async function deleteSRSState(cardId: string): Promise<void> {
  const db = await getDB();
  await db.delete('srsState', cardId);
}

/** Cards that are due now (reviewed at least once), most overdue first. */
export async function getDueCards(deckId?: string, limit = 500, now = Date.now()): Promise<SRSState[]> {
  const db = await getDB();
  const due = await db.getAllFromIndex('srsState', 'by-due', IDBKeyRange.upperBound(now));
  return due
    .filter((s) => s.totalReviews > 0 && (!deckId || s.deckId === deckId))
    .slice(0, limit);
}

export async function getAllSRSStates(deckId?: string): Promise<SRSState[]> {
  const db = await getDB();
  if (deckId) return db.getAllFromIndex('srsState', 'by-deck', deckId);
  return db.getAll('srsState');
}

export async function addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('reviewLog', log as ReviewLog);
}

export async function getReviewLogs(since?: number): Promise<ReviewLog[]> {
  const db = await getDB();
  if (since) return db.getAllFromIndex('reviewLog', 'by-timestamp', IDBKeyRange.lowerBound(since));
  return db.getAll('reviewLog');
}

// ─── Sessions ────────────────────────────────────────────────────────

export async function addDrillSession(session: Omit<DrillSession, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('drillSession', session as DrillSession);
}

/** Sessions with date >= `since` (YYYY-MM-DD), or all. */
export async function getDrillSessions(since?: string): Promise<DrillSession[]> {
  const db = await getDB();
  if (since) return db.getAllFromIndex('drillSession', 'by-date', IDBKeyRange.lowerBound(since));
  return db.getAll('drillSession');
}

/** Sessions of exactly one local day. */
export async function getDrillSessionsOn(day: string): Promise<DrillSession[]> {
  const db = await getDB();
  return db.getAllFromIndex('drillSession', 'by-date', day);
}

export async function addExamSession(session: Omit<ExamSession, 'id'>): Promise<number> {
  const db = await getDB();
  return db.add('examSession', session as ExamSession);
}

export async function getExamSessions(): Promise<ExamSession[]> {
  const db = await getDB();
  return db.getAll('examSession');
}

export async function getExamSession(id: number): Promise<ExamSession | undefined> {
  const db = await getDB();
  return db.get('examSession', id);
}

// ─── Mistakes ────────────────────────────────────────────────────────

export async function getMistake(key: string): Promise<MistakeItem | undefined> {
  const db = await getDB();
  return db.get('mistakes', key);
}

export async function putMistake(item: MistakeItem): Promise<void> {
  const db = await getDB();
  await db.put('mistakes', item);
}

export async function getAllMistakes(): Promise<MistakeItem[]> {
  const db = await getDB();
  return db.getAll('mistakes');
}

export async function deleteMistakes(keys: string[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction('mistakes', 'readwrite');
  await Promise.all(keys.map((k) => tx.store.delete(k)));
  await tx.done;
}

// ─── Key-value ───────────────────────────────────────────────────────

export async function kvGet<T>(key: string): Promise<T | undefined> {
  const db = await getDB();
  const rec = await db.get('kv', key);
  return rec?.value as T | undefined;
}

export async function kvSet<T>(key: string, value: T): Promise<void> {
  const db = await getDB();
  await db.put('kv', { key, value });
}

export async function kvDelete(key: string): Promise<void> {
  const db = await getDB();
  await db.delete('kv', key);
}

// ─── Backup ──────────────────────────────────────────────────────────

const LS_BACKUP_KEYS = ['anglictina_favorites', 'anglictina_custom_words'];

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const localStorageData: Record<string, unknown> = {};
  for (const k of LS_BACKUP_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (raw) localStorageData[k] = JSON.parse(raw);
    } catch { /* ignore */ }
  }
  const data = {
    app: 'anglictina',
    schema: DB_VERSION,
    exportedAt: new Date().toISOString(),
    settings: await db.get('settings', 'main'),
    stats: await db.get('stats', 'main'),
    srsStates: await db.getAll('srsState'),
    reviewLogs: await db.getAll('reviewLog'),
    drillSessions: await db.getAll('drillSession'),
    examSessions: await db.getAll('examSession'),
    mistakes: await db.getAll('mistakes'),
    kv: await db.getAll('kv'),
    localStorage: localStorageData,
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);
  if (!data || typeof data !== 'object') throw new Error('Neplatný soubor zálohy.');
  const db = await getDB();
  const tx = db.transaction(ALL_STORES, 'readwrite');
  const ops: Promise<unknown>[] = [];
  if (data.settings) ops.push(tx.objectStore('settings').put(data.settings, 'main'));
  if (data.stats) ops.push(tx.objectStore('stats').put(data.stats, 'main'));
  for (const s of data.srsStates ?? []) ops.push(tx.objectStore('srsState').put(s));
  for (const r of data.reviewLogs ?? []) ops.push(tx.objectStore('reviewLog').put(r));
  for (const s of data.drillSessions ?? []) ops.push(tx.objectStore('drillSession').put(s));
  for (const s of data.examSessions ?? []) ops.push(tx.objectStore('examSession').put(s));
  for (const m of data.mistakes ?? []) ops.push(tx.objectStore('mistakes').put(m));
  for (const k of data.kv ?? []) ops.push(tx.objectStore('kv').put(k));
  // Old backups (v1) carried no mistakes but may have been made alongside the LS error log.
  await Promise.all(ops);
  await tx.done;
  if (data.localStorage && typeof data.localStorage === 'object') {
    for (const k of LS_BACKUP_KEYS) {
      if (k in data.localStorage) localStorage.setItem(k, JSON.stringify(data.localStorage[k]));
    }
  }
}

export async function getDrillStatsByType(): Promise<Record<string, { sessions: number; correct: number; total: number }>> {
  const db = await getDB();
  const all = await db.getAll('drillSession');
  const result: Record<string, { sessions: number; correct: number; total: number }> = {};
  for (const s of all) {
    if (!result[s.type]) result[s.type] = { sessions: 0, correct: 0, total: 0 };
    result[s.type].sessions += 1;
    result[s.type].correct += s.correctItems;
    result[s.type].total += s.totalItems;
  }
  return result;
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(ALL_STORES, 'readwrite');
  await Promise.all(ALL_STORES.map((name) => tx.objectStore(name).clear()));
  await tx.done;
  try {
    localStorage.removeItem(LEGACY_ERRORS_KEY);
  } catch { /* ignore */ }
}
