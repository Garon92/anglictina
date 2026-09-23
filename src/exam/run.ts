import { kvDelete, kvGet, kvSet, addExamSession, getExamSessions } from '../db';
import { recordAnswer, recordSession } from '../progress';
import { EXAM_SETS, getSet } from './sets';
import type { ExamSet } from './types';
import { emptyAnswers, scoreExam, itemResults, sentenceAroundGap, answeredCount, type ExamAnswers, type ExamScore } from './scoring';
import { minutesForMode, partsForMode, partInfo, type ExamMode, type PartNo } from './structure';
import { shuffleArray } from '../utils';

export const RUN_KEY = 'exam:current';

export interface ExamRun {
  id: string;
  mode: ExamMode;
  part?: PartNo;
  /** Set id per part (index 0 = part 1). */
  sources: string[];
  /** Training mode: unlimited replays, transcripts after checking. */
  practice: boolean;
  timed: boolean;
  answers: ExamAnswers;
  /** Recording key → number of plays used. */
  plays: Record<string, number>;
  startedAt: number;
  deadline: number | null;
  /** Remaining ms when the run was left (the clock pauses while you are away). */
  remainingMs?: number;
  /** Active working time before the current stretch (ms), and when the current stretch began. */
  activeMs?: number;
  resumedAt?: number;
  current: PartNo;
}

export function createRun(opts: { mode: ExamMode; setId: string; part?: PartNo; practice?: boolean; timed?: boolean }): ExamRun {
  const parts = partsForMode(opts.mode, opts.part);
  let sources: string[];
  if (opts.setId === 'mix') {
    sources = Array.from({ length: 10 }, () => shuffleArray(EXAM_SETS)[0].id);
  } else {
    sources = Array(10).fill(getSet(opts.setId)?.id ?? EXAM_SETS[0].id);
  }
  const timed = opts.timed ?? !opts.practice;
  const now = Date.now();
  return {
    id: `${now.toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    mode: opts.mode,
    part: opts.part,
    sources,
    practice: !!opts.practice,
    timed,
    answers: emptyAnswers(),
    plays: {},
    startedAt: now,
    deadline: timed ? now + minutesForMode(opts.mode, opts.part) * 60_000 : null,
    current: parts[0],
  };
}

export function runParts(run: ExamRun): PartNo[] {
  return partsForMode(run.mode, run.part);
}

export function runSource(run: ExamRun) {
  return (p: PartNo): ExamSet => getSet(run.sources[p - 1]) ?? EXAM_SETS[0];
}

export async function loadRun(): Promise<ExamRun | undefined> {
  try {
    const r = await kvGet<ExamRun>(RUN_KEY);
    if (!r || !r.answers || !Array.isArray(r.sources)) return undefined;
    return r;
  } catch {
    return undefined;
  }
}

/** Pause the clock (store the remaining time). */
export function pauseRun(run: ExamRun, now = Date.now()): ExamRun {
  if (run.resumedAt === -1) return run; // already paused
  const activeMs = activeTime(run, now);
  const base = { ...run, activeMs, resumedAt: -1 };
  if (!run.deadline || run.remainingMs !== undefined) return base;
  return { ...base, remainingMs: Math.max(0, run.deadline - now) };
}

/** Milliseconds actually spent working on the run (pauses excluded). */
export function activeTime(run: ExamRun, now = Date.now()): number {
  const since = run.resumedAt === -1 ? now : (run.resumedAt ?? run.startedAt);
  return (run.activeMs ?? 0) + Math.max(0, now - since);
}

/** Remaining time in ms (paused runs report the frozen value), or null for untimed runs. */
export function remainingTime(run: ExamRun, now = Date.now()): number | null {
  if (run.remainingMs !== undefined) return run.remainingMs;
  return run.deadline ? Math.max(0, run.deadline - now) : null;
}

/** Resume a paused clock. */
export function resumeRun(run: ExamRun, now = Date.now()): ExamRun {
  const resumed = run.resumedAt === -1 ? { ...run, resumedAt: now } : run;
  if (resumed.remainingMs === undefined) return resumed;
  const { remainingMs, ...rest } = resumed;
  return { ...rest, deadline: run.deadline ? now + remainingMs : null };
}

export function saveRun(run: ExamRun): Promise<void> {
  return kvSet(RUN_KEY, run);
}

export function clearRun(): Promise<void> {
  return kvDelete(RUN_KEY);
}

export function setTitle(run: ExamRun): string {
  const ids = new Set(runParts(run).map((p) => run.sources[p - 1]));
  if (ids.size > 1) return 'Mix ze všech sad';
  return getSet([...ids][0])?.title ?? 'Cvičný test';
}

/** Save the finished attempt: exam history, activity session, and gap mistakes. */
export async function submitRun(run: ExamRun): Promise<{ score: ExamScore; sessionId?: number }> {
  const parts = runParts(run);
  const src = runSource(run);
  const score = scoreExam(parts, src, run.answers);
  const endedAt = Date.now();
  const pct = (k: 'listening' | 'reading' | 'language') =>
    score.bySubtest[k].max ? Math.round((score.bySubtest[k].points / score.bySubtest[k].max) * 100) : 0;

  const partPoints = Array(10).fill(0);
  const partMaxArr = Array(10).fill(0);
  for (const p of score.parts) {
    partPoints[p.part - 1] = p.points;
    partMaxArr[p.part - 1] = p.max;
  }

  const sessionId = await addExamSession({
    type: 'internal',
    startedAt: run.startedAt,
    endedAt,
    scoreTotal: score.points,
    maxScore: score.max,
    scoreBySkill: { listening: pct('listening'), reading: pct('reading'), language: pct('language') },
    notes: '',
    setId: new Set(parts.map((p) => run.sources[p - 1])).size > 1 ? 'mix' : run.sources[parts[0] - 1],
    mode: run.mode,
    partPoints,
    partMax: partMaxArr,
    passed: score.passed,
    answers: run.answers,
    sources: run.sources,
    parts,
  });

  // Only answered items count as practice, and only active time (pauses excluded).
  const answered = parts.reduce((s, p) => s + answeredCount(p, run.answers), 0);
  const correct = score.parts.reduce((s, p) => s + p.correct, 0);
  if (answered > 0) {
    await recordSession({
      module: 'exam',
      type: 'exam',
      startedAt: endedAt - activeTime(run, endedAt),
      endedAt,
      total: answered,
      correct: Math.min(correct, answered),
      tags: [run.mode, ...(run.part ? [`part${run.part}`] : [])],
      maxMinutes: 120,
    });
  }

  // Grammar gaps (parts 9 and 10) are self-contained enough to be re-drilled as mistakes.
  for (const p of parts) {
    if (p !== 9 && p !== 10) continue;
    const set = src(p);
    const res = itemResults(p, set, run.answers);
    res.forEach((ok, i) => {
      const n = i + 1;
      // Unanswered gaps are not stored as mistakes (a half-empty test would flood the queue).
      const given = p === 9 ? run.answers.p9[i] : run.answers.p10[i];
      if (given === null || given === undefined || (typeof given === 'string' && !given.trim())) return;
      if (p === 9) {
        const gap = set.part9.gaps[i];
        const sentence = sentenceAroundGap(set.part9.text, n);
        if (!sentence) return;
        const chosen = run.answers.p9[i];
        void recordAnswer({
          module: 'exam',
          itemId: `${set.id}-p9-${n}`,
          category: 'part9',
          prompt: sentence,
          kind: 'mcq',
          options: gap.options,
          answer: gap.options[gap.answer],
          userAnswer: chosen !== null && chosen !== undefined ? gap.options[chosen] : '',
          explanation: gap.explanationCs,
          correct: ok,
        });
      } else {
        const gap = set.part10.gaps[i];
        const sentence = sentenceAroundGap(set.part10.text, n);
        if (!sentence) return;
        void recordAnswer({
          module: 'exam',
          itemId: `${set.id}-p10-${n}`,
          category: 'part10',
          prompt: sentence,
          kind: 'text',
          answer: gap.accept[0],
          accept: gap.accept.slice(1),
          userAnswer: run.answers.p10[i] ?? '',
          explanation: gap.explanationCs,
          correct: ok,
        });
      }
    });
  }

  await clearRun();
  return { score, sessionId };
}

/** Best result per part (0–1) across history, and which sets were used per part. */
export async function partHistory(): Promise<Record<number, { best: number; sets: Set<string> }>> {
  const out: Record<number, { best: number; sets: Set<string> }> = {};
  const sessions = await getExamSessions();
  for (const s of sessions) {
    if (!s.partPoints || !s.partMax || !s.parts) continue;
    for (const p of s.parts) {
      const max = s.partMax[p - 1];
      if (!max) continue;
      const r = (out[p] ??= { best: 0, sets: new Set() });
      r.best = Math.max(r.best, s.partPoints[p - 1] / max);
      if (s.sources?.[p - 1]) r.sets.add(s.sources[p - 1]);
    }
  }
  return out;
}

/** Pick a set for part training: first one not used yet for this part, otherwise random. */
export function pickSetForPart(used: Set<string> | undefined): string {
  const fresh = EXAM_SETS.find((s) => !used?.has(s.id));
  return (fresh ?? shuffleArray(EXAM_SETS)[0]).id;
}

export function partLabel(p: PartNo): string {
  const info = partInfo(p);
  const last = info.firstTask + info.items - 1;
  return `Část ${p} · úlohy ${info.firstTask}–${last}`;
}
