import 'fake-indexeddb/auto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createRun, pauseRun, resumeRun, runParts, submitRun, saveRun, loadRun, partHistory, pickSetForPart, activeTime, remainingTime } from './run';
import { EXAM_SETS } from './sets';
import { resetDBConnection, DB_NAME, getExamSessions, getDrillSessions, getAllMistakes } from '../db';

(globalThis as any).localStorage ??= { getItem: () => null, setItem() {}, removeItem() {} };

beforeEach(async () => {
  await resetDBConnection();
  await new Promise<void>((r) => { const q = indexedDB.deleteDatabase(DB_NAME); q.onsuccess = q.onerror = q.onblocked = () => r(); });
});

describe('exam runs', () => {
  it('creates timed full runs and untimed part training', () => {
    const full = createRun({ mode: 'full', setId: 'set-b' });
    expect(runParts(full)).toHaveLength(10);
    expect(full.sources.every((s) => s === 'set-b')).toBe(true);
    expect(full.deadline! - full.startedAt).toBe(110 * 60_000);
    const part = createRun({ mode: 'part', part: 8, setId: 'set-c', practice: true, timed: false });
    expect(runParts(part)).toEqual([8]);
    expect(part.deadline).toBeNull();
    expect(part.current).toBe(8);
  });

  it('mix picks existing sets per part', () => {
    const mix = createRun({ mode: 'reading', setId: 'mix' });
    const ids = new Set(EXAM_SETS.map((s) => s.id));
    expect(mix.sources.every((s) => ids.has(s))).toBe(true);
    expect(runParts(mix)).toEqual([5, 6, 7, 8, 9, 10]);
  });

  it('pauses and resumes the clock', () => {
    const run = createRun({ mode: 'listening', setId: 'set-a' });
    const paused = pauseRun(run, run.startedAt + 60_000);
    expect(paused.remainingMs).toBe(39 * 60_000);
    const resumed = resumeRun(paused, run.startedAt + 3_600_000);
    expect(resumed.deadline).toBe(run.startedAt + 3_600_000 + 39 * 60_000);
    expect(resumed.remainingMs).toBeUndefined();
  });

  it('persists, submits, records history and gap mistakes', async () => {
    const set = EXAM_SETS[0];
    const run = createRun({ mode: 'full', setId: set.id });
    run.answers.p9 = set.part9.gaps.map((g) => ((g.answer + 1) % 3) as 0 | 1 | 2); // all wrong
    run.answers.p2 = set.part2.statements.map((s) => s.answer); // 8 points
    await saveRun(run);
    expect((await loadRun())?.id).toBe(run.id);
    const { score, sessionId } = await submitRun(run);
    expect(score.points).toBe(8);
    expect(sessionId).toBeTypeOf('number');
    expect(await loadRun()).toBeUndefined();
    const exams = await getExamSessions();
    expect(exams[0].mode).toBe('full');
    expect(exams[0].partPoints?.[1]).toBe(8);
    const ds = (await getDrillSessions())[0];
    expect(ds.module).toBe('exam');
    expect(ds.totalItems).toBe(18); // only answered items count
    const mistakes = await getAllMistakes();
    expect(mistakes).toHaveLength(10); // part 9 wrong answers only (part 10 unanswered is skipped)
    expect(mistakes[0].kind).toBe('mcq');
    const hist = await partHistory();
    expect(hist[2].best).toBe(1);
    expect(pickSetForPart(hist[2].sets)).not.toBe(set.id);
  });
});

describe('exam practice credit', () => {
  it('an empty submission records no practice session', async () => {
    const run = createRun({ mode: 'part', part: 9, setId: 'set-a', practice: true, timed: false });
    await submitRun(run);
    expect(await getDrillSessions()).toHaveLength(0);
    expect(await getExamSessions()).toHaveLength(1);
  });
  it('credits only active time (pauses excluded)', async () => {
    const run = createRun({ mode: 'part', part: 2, setId: 'set-a', practice: true, timed: false });
    const t0 = run.startedAt;
    const paused = pauseRun(run, t0 + 5 * 60_000); // 5 min work
    const resumed = resumeRun(paused, t0 + 10 * 3600_000); // 10 h later
    expect(activeTime(resumed, t0 + 10 * 3600_000 + 2 * 60_000)).toBe(7 * 60_000);
    expect(remainingTime(run)).toBeNull();
  });
});
