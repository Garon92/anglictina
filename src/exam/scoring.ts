import type { ExamSet } from './types';
import { partInfo, partMax, PASS_RATIO, SUBTESTS, type PartNo, type Subtest } from './structure';
import { isAnswerCorrect, normalizeAnswer, wordCount } from '../lib/answer';

/**
 * Answers for one attempt, per part (index = item). `null` / '' = unanswered.
 * p1,p4,p5,p7: option index 0–3 · p2,p6: true/false · p3,p10: text · p8: offer index 0–6 · p9: option 0–2
 */
export interface ExamAnswers {
  p1: (number | null)[];
  p2: (boolean | null)[];
  p3: string[];
  p4: (number | null)[];
  p5: (number | null)[];
  p6: (boolean | null)[];
  p7: (number | null)[];
  p8: (number | null)[];
  p9: (number | null)[];
  p10: string[];
}

export function emptyAnswers(): ExamAnswers {
  const n = (k: number) => Array.from({ length: k }, () => null);
  return {
    p1: n(4), p2: n(8), p3: Array(8).fill(''), p4: n(4), p5: n(5),
    p6: n(10), p7: n(5), p8: n(5), p9: n(10), p10: Array(5).fill(''),
  };
}

/** Which set provides each part (index 0 = part 1). A single set for normal tests, mixed for "Mix". */
export type PartSources = ExamSet[];

/** Strip words printed around the answer line (e.g. "in ___", "£ ___") if the student typed them too. */
export function stripAffixes(user: string, prefix?: string, suffix?: string): string {
  let s = normalizeAnswer(user);
  const p = prefix ? normalizeAnswer(prefix) : '';
  const q = suffix ? normalizeAnswer(suffix) : '';
  if (p && s.startsWith(p + ' ')) s = s.slice(p.length + 1);
  else if (p && s.startsWith(p) && /^[£$€]/.test(p)) s = s.slice(p.length).trim();
  if (q && s.endsWith(' ' + q)) s = s.slice(0, -q.length - 1);
  return s;
}

export function isOpenAnswerCorrect(user: string, accept: string[], prefix?: string, suffix?: string): boolean {
  if (!user.trim()) return false;
  if (wordCount(user) > 3 + (prefix ? wordCount(prefix) : 0) + (suffix ? wordCount(suffix) : 0)) return false;
  const [first, ...rest] = accept;
  if (isAnswerCorrect(user, first, rest)) return true;
  const stripped = stripAffixes(user, prefix, suffix);
  return stripped !== normalizeAnswer(user) && wordCount(stripped) <= 3 && isAnswerCorrect(stripped, first, rest);
}

/** Per-item correctness of a part. */
export function itemResults(part: PartNo, set: ExamSet, a: ExamAnswers): boolean[] {
  switch (part) {
    case 1: return set.part1.items.map((it, i) => a.p1[i] === it.answer);
    case 2: return set.part2.statements.map((it, i) => a.p2[i] === it.answer);
    case 3: return set.part3.questions.map((q, i) => isOpenAnswerCorrect(a.p3[i] ?? '', q.accept, q.prefix, q.suffix));
    case 4: return set.part4.items.map((it, i) => a.p4[i] === it.answer);
    case 5: return set.part5.items.map((it, i) => a.p5[i] === it.answer);
    case 6: return set.part6.statements.map((it, i) => a.p6[i] === it.answer);
    case 7: return set.part7.questions.map((q, i) => a.p7[i] === q.answer);
    case 8: return set.part8.people.map((p, i) => a.p8[i] === p.answer);
    case 9: return set.part9.gaps.map((g, i) => a.p9[i] === g.answer);
    case 10: return set.part10.gaps.map((g, i) => {
      const u = (a.p10[i] ?? '').trim();
      if (!u || wordCount(u) > 1) return false;
      const [first, ...rest] = g.accept;
      return isAnswerCorrect(u, first, rest);
    });
  }
}

export function answeredCount(part: PartNo, a: ExamAnswers): number {
  const arr = a[`p${part}` as keyof ExamAnswers] as unknown[];
  return arr.filter((x) => x !== null && x !== '' && x !== undefined && !(typeof x === 'string' && !x.trim())).length;
}

export interface PartScore {
  part: PartNo;
  points: number;
  max: number;
  correct: number;
  items: number;
}

export interface ExamScore {
  parts: PartScore[];
  points: number;
  max: number;
  ratio: number;
  passed: boolean;
  bySubtest: Record<Subtest, { points: number; max: number }>;
}

export function scoreExam(parts: PartNo[], sources: (p: PartNo) => ExamSet, answers: ExamAnswers): ExamScore {
  const scores: PartScore[] = parts.map((p) => {
    const res = itemResults(p, sources(p), answers);
    const correct = res.filter(Boolean).length;
    return { part: p, correct, items: res.length, points: correct * partInfo(p).pointsPerItem, max: partMax(p) };
  });
  const points = scores.reduce((s, x) => s + x.points, 0);
  const max = scores.reduce((s, x) => s + x.max, 0);
  const bySubtest = { listening: { points: 0, max: 0 }, reading: { points: 0, max: 0 }, language: { points: 0, max: 0 } };
  for (const s of scores) {
    const st = partInfo(s.part).subtest;
    bySubtest[st].points += s.points;
    bySubtest[st].max += s.max;
  }
  const ratio = max ? points / max : 0;
  return { parts: scores, points, max, ratio, passed: ratio >= PASS_RATIO - 1e-9, bySubtest };
}

export function subtestPct(s: { points: number; max: number }): number {
  return s.max ? Math.round((s.points / s.max) * 100) : 0;
}

export { SUBTESTS };

/** Sentence of a gap text containing gap n, with the gap replaced by "___" and other gaps by "…". */
export function sentenceAroundGap(text: string, n: number): string {
  const marker = `{{${n}}}`;
  const flat = text.replace(/\n+/g, ' ');
  const idx = flat.indexOf(marker);
  if (idx < 0) return '';
  const before = flat.slice(0, idx);
  const after = flat.slice(idx + marker.length);
  const startMatch = before.match(/.*[.!?]\s/s);
  const start = startMatch ? startMatch[0].length : 0;
  const endRel = after.search(/[.!?](\s|$)/);
  const end = endRel >= 0 ? idx + marker.length + endRel + 1 : flat.length;
  return flat.slice(start, end).replace(marker, '___').replace(/\{\{\d+\}\}/g, '…').trim();
}
