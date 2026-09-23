import {
  addDrillSession, getStats, saveStats, updateStreak, getMistake, putMistake, getAllMistakes,
  getDrillSessions, getDrillSessionsOn, getDueCards, currentStreak, kvSet, kvDelete, kvEntries,
} from './db';
import type { DrillSession, MistakeItem, UserStats } from './types';
import { dayKey } from './lib/dates';
import { sessionModule } from './modules';
import { createDaily } from './kit/streak';

/**
 * Shared daily counter read by the g92 menu ("Dnes procvičeno N", streak chips).
 * Counts MINUTES of practice — the same daily goal the learner sets in onboarding / Nastavení
 * and sees in the ring on "Dnes" (one goal, one unit).
 */
export const daily = createDaily('anglictina', { goal: 25, unit: ['minuta', 'minuty', 'minut'] });

/** Keep the kit daily goal in sync with settings.minutesPerDay. */
export function setDailyGoalMinutes(minutes: number) {
  const goal = Math.max(5, Math.round(minutes || 25));
  try {
    daily.setGoal(goal);
  } catch {
    /* ignore */
  }
}

/** Minutes practised on a local day (same computation as the ring on "Dnes"). */
export async function minutesOnDay(day: string): Promise<number> {
  const sessions = await getDrillSessionsOn(day);
  return sessions.reduce((sum, s) => sum + (s.endedAt ? Math.max(0, (s.endedAt - s.startedAt) / 60_000) : 0), 0);
}

// ─── Sessions ────────────────────────────────────────────────────────

export interface SessionInput {
  /** Module id from src/modules.ts */
  module: string;
  /** Broad type for older statistics (defaults to module). */
  type?: string;
  startedAt: number;
  endedAt?: number;
  total: number;
  correct: number;
  tags?: string[];
  /** Override the credited-minutes cap (e.g. 120 for a full exam). */
  maxMinutes?: number;
  /** Client session id (see pending sessions). */
  sid?: string;
}

/** Upper bound on minutes credited for one session (guards against a tab left open). */
export function creditedMinutes(startedAt: number, endedAt: number, total: number, maxMinutes = 90): number {
  const raw = Math.max(0, (endedAt - startedAt) / 60_000);
  const cap = Math.min(maxMinutes, 2 + total * 2.5);
  return Math.min(raw, cap);
}

type SessionListener = (s: DrillSession) => void;
const listeners = new Set<SessionListener>();

export type Milestone = { kind: 'daily-goal' | 'streak'; value: number };
type MilestoneListener = (m: Milestone) => void;
const milestoneListeners = new Set<MilestoneListener>();

/** Subscribe to celebrations: daily goal reached, streak milestones. */
export function onMilestone(fn: MilestoneListener): () => void {
  milestoneListeners.add(fn);
  return () => milestoneListeners.delete(fn);
}

/** Subscribe to completed sessions (used for activity reporting / dashboard refresh). */
export function onSessionRecorded(fn: SessionListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Record a finished practice session: drill session row, stats, streak.
 * Empty sessions (0 answered items) are ignored.
 */
export async function recordSession(input: SessionInput): Promise<UserStats | null> {
  if (input.total <= 0) return null;
  const endedAt = input.endedAt ?? Date.now();
  // Keep the credited duration consistent with stats by moving startedAt if we capped it.
  const minutes = creditedMinutes(input.startedAt, endedAt, input.total, input.maxMinutes);
  const startedAt = Math.max(input.startedAt, endedAt - minutes * 60_000);
  const session: Omit<DrillSession, 'id'> = {
    date: dayKey(endedAt),
    type: input.type ?? input.module,
    module: input.module,
    startedAt,
    endedAt,
    totalItems: input.total,
    correctItems: Math.min(input.correct, input.total),
    tags: [input.module, ...(input.tags ?? [])],
    ...(input.sid ? { sid: input.sid } : {}),
  };
  await addDrillSession(session);
  const stats = await getStats();
  stats.totalExercisesDone += input.total;
  stats.totalStudyMinutes += minutes;
  await saveStats(stats);
  const updated = await updateStreak(dayKey(endedAt));
  let goalReached = false;
  try {
    const day = dayKey(endedAt);
    const total = Math.round(await minutesOnDay(day));
    const delta = total - daily.today(new Date(endedAt));
    if (delta > 0) goalReached = daily.record(delta, new Date(endedAt)).reachedNow;
  } catch {
    /* best-effort */
  }
  const streakGrew = updated.lastActiveDate === dayKey(endedAt) && updated.streakDays !== stats.streakDays;
  for (const fn of milestoneListeners) {
    try {
      if (goalReached) fn({ kind: 'daily-goal', value: daily.goal() });
      if (streakGrew && [3, 7, 14, 30, 50, 100].includes(updated.streakDays)) fn({ kind: 'streak', value: updated.streakDays });
    } catch { /* ignore */ }
  }
  for (const fn of listeners) {
    try { fn(session as DrillSession); } catch { /* ignore */ }
  }
  return updated;
}

// ─── Unfinished sessions ─────────────────────────────────────────────
// Every answer updates a "pending" record, so work is never lost — even when the tab is closed
// mid-session. Pending records older than a few minutes are turned into normal sessions.

const PENDING_PREFIX = 'pending-session:';
/** Identifies this page load; pending records of other (closed) pages can be recovered at once. */
const PAGE_ID = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
/** Pending ids written by this page and still running here. */
const ownPending = new Set<string>();

export interface PendingSession {
  id: string;
  module: string;
  type?: string;
  tags?: string[];
  startedAt: number;
  updatedAt: number;
  total: number;
  correct: number;
  pageId?: string;
}

// Other open tabs answer "is this pending session still running in your page?"
let channel: BroadcastChannel | null = null;
function getChannel(): BroadcastChannel | null {
  if (channel || typeof BroadcastChannel === 'undefined') return channel;
  try {
    channel = new BroadcastChannel('anglictina-pending');
    channel.onmessage = (e: MessageEvent<{ type: string; ids?: string[] }>) => {
      if (e.data?.type === 'ping' && e.data.ids) {
        const alive = e.data.ids.filter((id) => ownPending.has(id));
        if (alive.length) channel?.postMessage({ type: 'alive', ids: alive });
      }
    };
  } catch {
    channel = null;
  }
  return channel;
}

async function aliveElsewhere(ids: string[], waitMs = 250): Promise<Set<string>> {
  const ch = getChannel();
  const alive = new Set<string>();
  if (!ch || ids.length === 0) return alive;
  const listener = (e: MessageEvent<{ type: string; ids?: string[] }>) => {
    if (e.data?.type === 'alive') e.data.ids?.forEach((id) => alive.add(id));
  };
  ch.addEventListener('message', listener);
  ch.postMessage({ type: 'ping', ids });
  await new Promise((r) => setTimeout(r, waitMs));
  ch.removeEventListener('message', listener);
  return alive;
}

export function savePendingSession(p: PendingSession): Promise<void> {
  ownPending.add(p.id);
  getChannel();
  return kvSet(PENDING_PREFIX + p.id, { ...p, pageId: PAGE_ID }).catch(() => {});
}

export function clearPendingSession(id: string): Promise<void> {
  ownPending.delete(id);
  return kvDelete(PENDING_PREFIX + id).catch(() => {});
}

/**
 * Record pending sessions that were left behind (closed tab, Back out of the app, crash).
 * Records of other page loads are recovered right away unless another open tab reports them as
 * still running; records of this page only when older than `minAgeMs`. Returns how many.
 */
export async function recoverPendingSessions(minAgeMs = 5 * 60_000, now = Date.now()): Promise<number> {
  let n = 0;
  try {
    const entries = await kvEntries<PendingSession>(PENDING_PREFIX);
    const candidates = entries.filter(({ value: p }) => p && !ownPending.has(p.id) && (p.pageId !== PAGE_ID || now - p.updatedAt >= minAgeMs));
    const foreign = candidates.filter(({ value: p }) => p.pageId !== PAGE_ID && now - p.updatedAt < minAgeMs).map(({ value: p }) => p.id);
    const alive = await aliveElsewhere(foreign);
    for (const { key, value: p } of candidates) {
      if (alive.has(p.id)) continue;
      await kvDelete(key);
      if (p.total <= 0) continue;
      // Already recorded (e.g. saved on pagehide, but the pending record wasn't cleared)?
      const sameDay = await getDrillSessionsOn(dayKey(p.updatedAt));
      if (sameDay.some((s) => s.sid === p.id)) continue;
      await recordSession({ module: p.module, type: p.type, tags: p.tags, startedAt: p.startedAt, endedAt: p.updatedAt, total: p.total, correct: p.correct, sid: p.id });
      n++;
    }
  } catch {
    /* best-effort */
  }
  return n;
}

// ─── Mistakes ────────────────────────────────────────────────────────

export interface AnswerInput {
  module: string;
  /** Stable id of the exercise within the module (fallback: the prompt). */
  itemId?: string;
  category?: string;
  prompt: string;
  kind?: MistakeItem['kind'];
  options?: string[];
  answer: string;
  accept?: string[];
  explanation?: string;
  context?: string;
  userAnswer?: string;
  correct: boolean;
}

/** Number of correct answers in a row needed to clear a mistake. */
export const CLEAR_AFTER = 2;
const DAY_MS = 86_400_000;

export function mistakeKey(module: string, itemId: string): string {
  return `${module}:${itemId}`;
}

/** Pure state transition for a mistake after an answer. */
export function applyAnswerToMistake(prev: MistakeItem | undefined, input: AnswerInput, now = Date.now()): MistakeItem | undefined {
  if (input.correct) {
    if (!prev || prev.resolvedAt) return prev;
    const rightStreak = prev.rightStreak + 1;
    return {
      ...prev,
      rightStreak,
      updatedAt: now,
      dueAt: now + DAY_MS,
      resolvedAt: rightStreak >= CLEAR_AFTER ? now : undefined,
    };
  }
  const key = mistakeKey(input.module, input.itemId ?? input.prompt);
  const base: MistakeItem = prev ?? {
    key,
    module: input.module,
    category: input.category ?? '',
    prompt: input.prompt,
    kind: input.kind ?? (input.options?.length ? 'mcq' : 'text'),
    answer: input.answer,
    wrongCount: 0,
    rightStreak: 0,
    lastWrong: '',
    createdAt: now,
    updatedAt: now,
    dueAt: now,
  };
  return {
    ...base,
    // Refresh content (the exercise text may have been corrected in a newer app version).
    prompt: input.prompt,
    kind: input.kind ?? base.kind,
    options: input.options ?? base.options,
    answer: input.answer,
    accept: input.accept ?? base.accept,
    explanation: input.explanation ?? base.explanation,
    context: input.context ?? base.context,
    category: input.category ?? base.category,
    lastWrong: input.userAnswer ?? '',
    wrongCount: base.wrongCount + 1,
    rightStreak: 0,
    updatedAt: now,
    dueAt: now,
    resolvedAt: undefined,
  };
}

/**
 * Remember the outcome of an answer. Wrong answers are stored as mistakes to review;
 * correct answers count towards clearing an existing mistake.
 */
export async function recordAnswer(input: AnswerInput): Promise<void> {
  try {
    const key = mistakeKey(input.module, input.itemId ?? input.prompt);
    const prev = await getMistake(key);
    if (input.correct && (!prev || prev.resolvedAt)) return;
    const next = applyAnswerToMistake(prev, input);
    if (next) await putMistake(next);
  } catch (e) {
    console.warn('recordAnswer failed', e);
  }
}

/** Result of reviewing a mistake in the mistakes drill. */
export async function recordMistakeReview(key: string, correct: boolean, userAnswer = ''): Promise<MistakeItem | undefined> {
  const prev = await getMistake(key);
  if (!prev) return undefined;
  const next = applyAnswerToMistake(prev, {
    module: prev.module, itemId: key.slice(prev.module.length + 1), prompt: prev.prompt,
    answer: prev.answer, correct, userAnswer,
    kind: prev.kind, options: prev.options, accept: prev.accept, explanation: prev.explanation, context: prev.context,
    category: prev.category,
  });
  if (next) await putMistake(next);
  return next;
}

export async function getActiveMistakes(): Promise<MistakeItem[]> {
  const all = await getAllMistakes();
  return all.filter((m) => !m.resolvedAt).sort((a, b) => a.dueAt - b.dueAt);
}

export async function getDueMistakes(now = Date.now()): Promise<MistakeItem[]> {
  return (await getActiveMistakes()).filter((m) => m.dueAt <= now);
}

export interface MistakeSummary {
  active: number;
  due: number;
  resolved: number;
  byModule: Record<string, number>;
  byCategory: Record<string, number>;
  weakestModule: string;
}

export async function getMistakeSummary(now = Date.now()): Promise<MistakeSummary> {
  const all = await getAllMistakes();
  const byModule: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  let active = 0, due = 0, resolved = 0;
  for (const m of all) {
    if (m.resolvedAt) { resolved++; continue; }
    active++;
    if (m.dueAt <= now) due++;
    byModule[m.module] = (byModule[m.module] || 0) + 1;
    if (m.category) byCategory[m.category] = (byCategory[m.category] || 0) + 1;
  }
  const weakestModule = Object.entries(byModule).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  return { active, due, resolved, byModule, byCategory, weakestModule };
}

// ─── Today ───────────────────────────────────────────────────────────

export interface TodaySummary {
  minutes: number;
  items: number;
  correct: number;
  sessions: DrillSession[];
  modules: Set<string>;
  streak: number;
  stats: UserStats;
  dueCards: number;
}

export async function getTodaySummary(): Promise<TodaySummary> {
  const today = dayKey();
  const [sessions, stats, due] = await Promise.all([getDrillSessions(today), getStats(), getDueCards('vocab')]);
  const todays = sessions.filter((s) => s.date === today);
  let minutes = 0, items = 0, correct = 0;
  const modules = new Set<string>();
  for (const s of todays) {
    if (s.endedAt) minutes += Math.max(0, (s.endedAt - s.startedAt) / 60_000);
    items += s.totalItems;
    correct += s.correctItems;
    modules.add(sessionModule(s));
  }
  return { minutes, items, correct, sessions: todays, modules, streak: currentStreak(stats, today), stats, dueCards: due.length };
}

/** The learner overrode an automatic "wrong" (e.g. a valid free translation): undo the new mistake. */
export async function forgiveMistake(module: string, itemId: string): Promise<void> {
  try {
    const key = mistakeKey(module, itemId);
    const prev = await getMistake(key);
    if (!prev) return;
    if (prev.wrongCount <= 1) {
      const { deleteMistakes } = await import('./db');
      await deleteMistakes([key]);
    } else {
      await putMistake({ ...prev, wrongCount: prev.wrongCount - 1 });
    }
  } catch {
    /* ignore */
  }
}
