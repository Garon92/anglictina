import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SRSState, ReviewLog, DrillSession, ExamSession, UserSettings, UserStats } from './types';
import { DEFAULT_SETTINGS, DEFAULT_STATS } from './types';

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
}

let dbPromise: Promise<IDBPDatabase<AppDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<AppDB>('anglictina-db', 1, {
      upgrade(db) {
        db.createObjectStore('settings');
        db.createObjectStore('stats');

        const srsStore = db.createObjectStore('srsState', { keyPath: 'cardId' });
        srsStore.createIndex('by-due', 'dueAt');
        srsStore.createIndex('by-deck', 'deckId');

        const reviewStore = db.createObjectStore('reviewLog', {
          keyPath: 'id',
          autoIncrement: true,
        });
        reviewStore.createIndex('by-card', 'cardId');
        reviewStore.createIndex('by-timestamp', 'timestamp');

        const drillStore = db.createObjectStore('drillSession', {
          keyPath: 'id',
          autoIncrement: true,
        });
        drillStore.createIndex('by-date', 'date');

        const examStore = db.createObjectStore('examSession', {
          keyPath: 'id',
          autoIncrement: true,
        });
        examStore.createIndex('by-date', 'startedAt');
      },
    });
  }
  return dbPromise;
}

export async function getSettings(): Promise<UserSettings> {
  const db = await getDB();
  const s = await db.get('settings', 'main');
  return s ?? { ...DEFAULT_SETTINGS };
}

export async function saveSettings(settings: UserSettings): Promise<void> {
  const db = await getDB();
  await db.put('settings', settings, 'main');
}

export async function getStats(): Promise<UserStats> {
  const db = await getDB();
  const s = await db.get('stats', 'main');
  return s ?? { ...DEFAULT_STATS };
}

export async function saveStats(stats: UserStats): Promise<void> {
  const db = await getDB();
  await db.put('stats', stats, 'main');
}

export async function updateStreak(): Promise<UserStats> {
  const stats = await getStats();
  const today = new Date().toISOString().slice(0, 10);

  if (stats.lastActiveDate === today) return stats;

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (stats.lastActiveDate === yesterday) {
    stats.streakDays += 1;
  } else if (stats.lastActiveDate !== today) {
    stats.streakDays = 1;
  }
  stats.lastActiveDate = today;
  if (stats.streakDays > stats.bestStreak) {
    stats.bestStreak = stats.streakDays;
  }
  await saveStats(stats);
  return stats;
}

export async function getSRSState(cardId: string): Promise<SRSState | undefined> {
  const db = await getDB();
  return db.get('srsState', cardId);
}

export async function saveSRSState(state: SRSState): Promise<void> {
  const db = await getDB();
  await db.put('srsState', state);
}

export async function getDueCards(deckId?: string, limit = 50): Promise<SRSState[]> {
  const db = await getDB();
  const now = Date.now();
  const all = await db.getAllFromIndex('srsState', 'by-due');
  return all
    .filter((s) => s.dueAt <= now && (!deckId || s.deckId === deckId))
    .slice(0, limit);
}

export async function getAllSRSStates(deckId?: string): Promise<SRSState[]> {
  const db = await getDB();
  if (deckId) {
    return db.getAllFromIndex('srsState', 'by-deck', deckId);
  }
  return db.getAll('srsState');
}

export async function addReviewLog(log: Omit<ReviewLog, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('reviewLog', log as ReviewLog);
}

export async function getReviewLogs(since?: number): Promise<ReviewLog[]> {
  const db = await getDB();
  if (since) {
    const all = await db.getAllFromIndex('reviewLog', 'by-timestamp');
    return all.filter((r) => r.timestamp >= since);
  }
  return db.getAll('reviewLog');
}

export async function addDrillSession(session: Omit<DrillSession, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('drillSession', session as DrillSession);
}

export async function getDrillSessions(since?: string): Promise<DrillSession[]> {
  const db = await getDB();
  const all = await db.getAll('drillSession');
  if (since) return all.filter((s) => s.date >= since);
  return all;
}

export async function addExamSession(session: Omit<ExamSession, 'id'>): Promise<void> {
  const db = await getDB();
  await db.add('examSession', session as ExamSession);
}

export async function getExamSessions(): Promise<ExamSession[]> {
  const db = await getDB();
  return db.getAll('examSession');
}

export async function exportAllData(): Promise<string> {
  const db = await getDB();
  const data = {
    exportedAt: new Date().toISOString(),
    settings: await db.get('settings', 'main'),
    stats: await db.get('stats', 'main'),
    srsStates: await db.getAll('srsState'),
    reviewLogs: await db.getAll('reviewLog'),
    drillSessions: await db.getAll('drillSession'),
    examSessions: await db.getAll('examSession'),
  };
  return JSON.stringify(data, null, 2);
}

export async function importData(json: string): Promise<void> {
  const data = JSON.parse(json);
  const db = await getDB();

  const tx = db.transaction(
    ['settings', 'stats', 'srsState', 'reviewLog', 'drillSession', 'examSession'],
    'readwrite'
  );

  if (data.settings) await tx.objectStore('settings').put(data.settings, 'main');
  if (data.stats) await tx.objectStore('stats').put(data.stats, 'main');

  if (data.srsStates) {
    const store = tx.objectStore('srsState');
    for (const s of data.srsStates) await store.put(s);
  }
  if (data.reviewLogs) {
    const store = tx.objectStore('reviewLog');
    for (const r of data.reviewLogs) await store.put(r);
  }
  if (data.drillSessions) {
    const store = tx.objectStore('drillSession');
    for (const s of data.drillSessions) await store.put(s);
  }
  if (data.examSessions) {
    const store = tx.objectStore('examSession');
    for (const s of data.examSessions) await store.put(s);
  }

  await tx.done;
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
  const tx = db.transaction(
    ['settings', 'stats', 'srsState', 'reviewLog', 'drillSession', 'examSession'],
    'readwrite'
  );
  await tx.objectStore('settings').clear();
  await tx.objectStore('stats').clear();
  await tx.objectStore('srsState').clear();
  await tx.objectStore('reviewLog').clear();
  await tx.objectStore('drillSession').clear();
  await tx.objectStore('examSession').clear();
  await tx.done;
}
