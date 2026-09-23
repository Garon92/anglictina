import { describe, expect, it } from 'vitest';
import { EXAM_SETS } from './sets';
import { PARTS, partMax, partsForMode } from './structure';
import { emptyAnswers, scoreExam, isOpenAnswerCorrect, stripAffixes, sentenceAroundGap, itemResults, answeredCount, type ExamAnswers } from './scoring';
import type { ExamSet } from './types';

function perfectAnswers(set: ExamSet): ExamAnswers {
  return {
    p1: set.part1.items.map((x) => x.answer),
    p2: set.part2.statements.map((x) => x.answer),
    p3: set.part3.questions.map((q) => q.accept[0]),
    p4: set.part4.items.map((x) => x.answer),
    p5: set.part5.items.map((x) => x.answer),
    p6: set.part6.statements.map((x) => x.answer),
    p7: set.part7.questions.map((x) => x.answer),
    p8: set.part8.people.map((x) => x.answer),
    p9: set.part9.gaps.map((g) => g.answer),
    p10: set.part10.gaps.map((g) => g.accept[0]),
  };
}

describe('exam structure', () => {
  it('matches the official test: 64 tasks, 100 points, 40/40/20', () => {
    expect(PARTS.reduce((s, p) => s + p.items, 0)).toBe(64);
    expect(PARTS.reduce((s, p) => s + partMax(p.no), 0)).toBe(100);
    const sub = (k: string) => PARTS.filter((p) => p.subtest === k).reduce((s, p) => s + partMax(p.no), 0);
    expect([sub('listening'), sub('reading'), sub('language')]).toEqual([40, 40, 20]);
    expect(partsForMode('reading')).toEqual([5, 6, 7, 8, 9, 10]);
  });
});

describe.each(EXAM_SETS.map((s) => [s.id, s] as const))('practice set %s', (_id, set) => {
  it('has the exact item counts of the real test', () => {
    expect(set.part1.items).toHaveLength(4);
    set.part1.items.forEach((it) => expect(it.options).toHaveLength(4));
    expect(set.part2.statements).toHaveLength(8);
    expect(set.part3.questions).toHaveLength(8);
    expect(set.part4.items).toHaveLength(4);
    expect(set.part5.items).toHaveLength(5);
    expect(set.part6.statements).toHaveLength(10);
    expect(set.part7.questions).toHaveLength(5);
    expect(set.part8.people).toHaveLength(5);
    expect(set.part8.offers).toHaveLength(7);
    expect(set.part9.gaps).toHaveLength(10);
    expect(set.part10.gaps).toHaveLength(5);
  });

  it('marks every gap exactly once and in order', () => {
    const nums = (t: string) => [...t.matchAll(/\{\{(\d+)\}\}/g)].map((m) => Number(m[1]));
    expect(nums(set.part9.text)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(nums(set.part10.text)).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('has valid answer keys', () => {
    for (const it of [...set.part1.items, ...set.part4.items, ...set.part5.items, ...set.part7.questions]) {
      expect(it.answer).toBeGreaterThanOrEqual(0);
      expect(it.answer).toBeLessThan(4);
      expect(new Set(it.options.map((o) => (typeof o === 'string' ? o : o.caption).trim().toLowerCase())).size).toBe(4);
    }
    const used = set.part8.people.map((p) => p.answer);
    expect(new Set(used).size).toBe(5);
    used.forEach((a) => expect(a).toBeLessThan(7));
    set.part9.gaps.forEach((g) => {
      expect(g.options).toHaveLength(3);
      expect(g.answer).toBeLessThan(3);
    });
    set.part3.questions.forEach((q) => {
      expect(q.accept.length).toBeGreaterThan(0);
      q.accept.forEach((a) => expect(a.trim().split(/\s+/).length).toBeLessThanOrEqual(3 + (q.prefix ? 2 : 0)));
    });
    set.part10.gaps.forEach((g) => expect(g.accept.length).toBeGreaterThan(0));
  });

  it('has Czech explanations everywhere', () => {
    const all = [
      ...set.part1.items, ...set.part2.statements, ...set.part3.questions, ...set.part4.items, ...set.part5.items,
      ...set.part6.statements, ...set.part7.questions, ...set.part8.people, ...set.part9.gaps, ...set.part10.gaps,
    ];
    all.forEach((x) => expect(x.explanationCs.trim().length).toBeGreaterThan(5));
  });

  it('scores a perfect attempt as 100 and an empty one as 0', () => {
    const full = partsForMode('full');
    expect(scoreExam(full, () => set, perfectAnswers(set)).points).toBe(100);
    const empty = scoreExam(full, () => set, emptyAnswers());
    expect(empty.points).toBe(0);
    expect(empty.passed).toBe(false);
  });

  it('has part 3 model answers that literally occur in the script', () => {
    const script = set.part3.script.toLowerCase().replace(/[’']/g, "'");
    for (const q of set.part3.questions) {
      const ok = q.accept.some((a) => script.includes(a.toLowerCase().replace(/[’']/g, "'")));
      expect(ok, `${set.id} part3: ${q.question} → ${q.accept.join(' | ')}`).toBe(true);
    }
  });
});

describe('scoring rules', () => {
  const set = EXAM_SETS[0];
  it('computes the pass mark at 44 %', () => {
    const a = emptyAnswers();
    // part 3 perfect = 16, part 2 perfect = 8, part 6 perfect = 10, part 9 perfect = 10 → 44
    a.p3 = set.part3.questions.map((q) => q.accept[0]);
    a.p2 = set.part2.statements.map((x) => x.answer);
    a.p6 = set.part6.statements.map((x) => x.answer);
    a.p9 = set.part9.gaps.map((g) => g.answer);
    const s = scoreExam(partsForMode('full'), () => set, a);
    expect(s.points).toBe(44);
    expect(s.passed).toBe(true);
    expect(s.bySubtest.listening.points).toBe(24);
  });
  it('rejects open answers longer than 3 words', () => {
    expect(isOpenAnswerCorrect('at the old station', ['the old station'])).toBe(false);
    expect(isOpenAnswerCorrect('the old station', ['the old station'])).toBe(true);
  });
  it('accepts answers that repeat the printed prefix', () => {
    expect(stripAffixes('in 2019', 'in')).toBe('2019');
    expect(stripAffixes('£45', '£')).toBe('45');
    expect(isOpenAnswerCorrect('in 1998', ['1998'], 'in')).toBe(true);
  });
  it('counts answered items', () => {
    const a = emptyAnswers();
    a.p3[0] = 'x';
    a.p3[1] = '  ';
    expect(answeredCount(3, a)).toBe(1);
    expect(itemResults(10, set, a)).toHaveLength(5);
  });
  it('extracts the sentence around a gap', () => {
    expect(sentenceAroundGap('One {{1}} two. Three {{2}} four {{3}}. Five.', 2)).toBe('Three ___ four ….');
  });
});
