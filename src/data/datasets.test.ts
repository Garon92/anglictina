/**
 * Data validation for all exercise datasets: unique ids, no empty fields, answer keys that
 * point at existing options, gap counts, token sets… Run with `npm run check:data`.
 */
import { describe, expect, it } from 'vitest';
import { GRAMMAR_EXERCISES } from './grammar';
import { READING_TEXTS } from './reading';
import { LISTENING_EXERCISES } from './listening';
import { ARTICLE_EXERCISES } from './articles';
import { WORD_ORDER_EXERCISES } from './wordOrder';
import { TRANSLATION_EXERCISES } from './translations';
import { PREPOSITION_EXERCISES } from './prepositions';
import { CONFUSABLE_PAIRS } from './confusables';
import { IDIOMS, COLLOCATIONS } from './idioms';
import { PHRASAL_VERBS } from './phrases';
import { IRREGULAR_VERBS } from './irregularVerbs';
import { WORD_FORMATION_EXERCISES } from './wordFormation';
import { ERROR_CORRECTIONS } from './errorCorrection';
import { SENTENCE_TRANSFORMS } from './sentenceTransform';
import { CONDITIONAL_EXERCISES } from './conditionals';
import { PASSIVE_EXERCISES } from './passiveVoice';
import { REPORTED_SPEECH_EXERCISES } from './reportedSpeech';
import { CZECH_ERRORS } from './czechErrors';
import { DIAGNOSTIC_QUESTIONS } from './diagnostic';
import { VOCAB_TOPICS } from './vocabTopics';
import { CONVERSATION_TOPICS } from './conversation';
import { WRITING_TEMPLATES } from './writing';
import { GRAMMAR_REFERENCE } from './grammarReference';

function uniqueIds(name: string, items: { id: string }[]) {
  const seen = new Set<string>();
  const dups: string[] = [];
  for (const x of items) {
    if (seen.has(x.id)) dups.push(x.id);
    seen.add(x.id);
  }
  expect(dups, `${name}: duplicate ids`).toEqual([]);
}

function noEmptyStrings(name: string, items: object[], fields: string[]) {
  const bad: string[] = [];
  for (const it of items) {
    for (const f of fields) {
      const v = (it as Record<string, unknown>)[f];
      if (typeof v !== 'string' || !v.trim()) bad.push(`${(it as { id?: string }).id ?? '?'}.${f}`);
    }
  }
  expect(bad, `${name}: empty fields`).toEqual([]);
}

function noDuplicateText(name: string, items: { id: string }[], key: (x: never) => string) {
  const seen = new Map<string, string>();
  const dups: string[] = [];
  for (const it of items) {
    const k = key(it as never).trim().toLowerCase().replace(/\s+/g, ' ');
    if (seen.has(k)) dups.push(`${seen.get(k)} = ${it.id}`);
    seen.set(k, it.id);
  }
  expect(dups, `${name}: duplicate prompts`).toEqual([]);
}

function mcqValid(name: string, items: { id: string; options?: string[]; answer: string; type?: string }[]) {
  const bad: string[] = [];
  for (const it of items) {
    if (!it.options?.length) continue;
    if (it.type && it.type !== 'mcq') continue;
    if (!it.options.includes(it.answer)) bad.push(`${it.id}: answer "${it.answer}" not in options`);
    if (new Set(it.options.map((o) => o.trim().toLowerCase())).size !== it.options.length) bad.push(`${it.id}: duplicate options`);
    if (it.answer.includes('|')) bad.push(`${it.id}: MCQ answer must not contain "|"`);
  }
  expect(bad, `${name}: MCQ problems`).toEqual([]);
}

describe('grammar', () => {
  it('is consistent', () => {
    uniqueIds('grammar', GRAMMAR_EXERCISES);
    noEmptyStrings('grammar', GRAMMAR_EXERCISES, ['prompt', 'answer', 'explanationCs', 'category']);
    mcqValid('grammar', GRAMMAR_EXERCISES);
    noDuplicateText('grammar', GRAMMAR_EXERCISES, (x: { prompt: string }) => x.prompt);
  });
});

describe('diagnostic', () => {
  it('has valid keys', () => {
    uniqueIds('diagnostic', DIAGNOSTIC_QUESTIONS);
    for (const q of DIAGNOSTIC_QUESTIONS) {
      if (q.type === 'mcq') {
        expect(q.options?.length, q.id).toBeGreaterThan(1);
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex!, q.id).toBeLessThan(q.options!.length);
      } else {
        expect(q.answer?.trim(), q.id).toBeTruthy();
      }
    }
  });
});

describe('reading & listening', () => {
  it('reading answer indexes are in range', () => {
    uniqueIds('reading', READING_TEXTS);
    uniqueIds('reading questions', READING_TEXTS.flatMap((t) => t.questions));
    for (const t of READING_TEXTS) {
      expect(t.text.trim().length, t.id).toBeGreaterThan(100);
      for (const q of t.questions) {
        expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
        expect(q.answerIndex, q.id).toBeLessThan(q.options.length);
        expect(new Set(q.options).size, q.id).toBe(q.options.length);
      }
    }
  });
  it('listening items are answerable', () => {
    uniqueIds('listening', LISTENING_EXERCISES);
    for (const ex of LISTENING_EXERCISES) {
      expect(ex.script.trim(), ex.id).toBeTruthy();
      for (const q of ex.questions) {
        if (q.type === 'fill') {
          expect(q.answer?.trim(), q.id).toBeTruthy();
          expect(ex.script.toLowerCase(), q.id).toContain(q.answer!.split('|')[0].toLowerCase());
        } else {
          expect(q.answerIndex, q.id).toBeGreaterThanOrEqual(0);
          expect(q.answerIndex!, q.id).toBeLessThan(q.options!.length);
        }
      }
      if (ex.type === 'dictation') {
        const q = ex.questions[0];
        expect(q.options?.filter((o) => o === ex.script), ex.id).toHaveLength(1);
      }
    }
  });
});

describe('drills', () => {
  it('articles have one answer per gap', () => {
    uniqueIds('articles', ARTICLE_EXERCISES);
    for (const a of ARTICLE_EXERCISES) {
      const gaps = a.sentence.split('___').length - 1;
      expect(gaps, a.id).toBe(a.gaps.length);
    }
  });
  it('word order tokens form the answer', () => {
    uniqueIds('word order', WORD_ORDER_EXERCISES);
    const norm = (s: string) => s.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).filter(Boolean).sort().join(' ');
    for (const w of WORD_ORDER_EXERCISES) expect(norm(w.words.join(' ')), w.id).toBe(norm(w.answer));
  });
  it('translations, prepositions, idioms, phrasal verbs, irregular verbs', () => {
    uniqueIds('translations', TRANSLATION_EXERCISES);
    noEmptyStrings('translations', TRANSLATION_EXERCISES, ['czech', 'english']);
    uniqueIds('prepositions', PREPOSITION_EXERCISES);
    mcqValid('prepositions', PREPOSITION_EXERCISES);
    noEmptyStrings('prepositions', PREPOSITION_EXERCISES, ['sentence', 'answer', 'explanationCs']);
    uniqueIds('idioms', IDIOMS);
    noEmptyStrings('idioms', IDIOMS, ['idiom', 'meaningCs', 'example']);
    uniqueIds('collocations', COLLOCATIONS);
    for (const c of COLLOCATIONS) expect(c.verb.toLowerCase(), c.id).not.toBe(c.wrongVerb.toLowerCase());
    uniqueIds('phrasal verbs', PHRASAL_VERBS);
    noEmptyStrings('phrasal verbs', PHRASAL_VERBS, ['verb', 'meaningCs', 'example', 'exampleCs']);
    noDuplicateText('phrasal verbs', PHRASAL_VERBS, (x: { verb: string; meaningCs: string }) => `${x.verb}|${x.meaningCs}`);
    uniqueIds('irregular verbs', IRREGULAR_VERBS);
    noEmptyStrings('irregular verbs', IRREGULAR_VERBS, ['base', 'past', 'pastParticiple', 'meaningCs']);
    noDuplicateText('irregular verbs', IRREGULAR_VERBS, (x: { base: string }) => x.base);
  });
  it('confusables, word formation, error correction, transformations', () => {
    uniqueIds('confusables', CONFUSABLE_PAIRS);
    for (const p of CONFUSABLE_PAIRS) {
      for (const e of p.exercises) {
        expect(e.answer.toLowerCase(), p.id).not.toBe(e.wrongOption.toLowerCase());
        expect(e.sentence, p.id).toContain('___');
      }
    }
    uniqueIds('word formation', WORD_FORMATION_EXERCISES);
    noEmptyStrings('word formation', WORD_FORMATION_EXERCISES, ['sentence', 'baseWord', 'answer']);
    uniqueIds('error correction', ERROR_CORRECTIONS);
    for (const e of ERROR_CORRECTIONS) {
      expect(e.sentence, e.id).toContain(e.errorWord);
      expect(e.sentence, e.id).not.toBe(e.correctedSentence);
    }
    uniqueIds('sentence transforms', SENTENCE_TRANSFORMS);
    noEmptyStrings('sentence transforms', SENTENCE_TRANSFORMS, ['original', 'keyWord', 'answer', 'prompt']);
  });
  it('conditionals, passive, reported speech', () => {
    uniqueIds('conditionals', CONDITIONAL_EXERCISES);
    mcqValid('conditionals', CONDITIONAL_EXERCISES);
    uniqueIds('passive', PASSIVE_EXERCISES);
    mcqValid('passive', PASSIVE_EXERCISES);
    uniqueIds('reported speech', REPORTED_SPEECH_EXERCISES);
    mcqValid('reported speech', REPORTED_SPEECH_EXERCISES);
    for (const list of [CONDITIONAL_EXERCISES, PASSIVE_EXERCISES, REPORTED_SPEECH_EXERCISES]) {
      noEmptyStrings('grammar drills', list, ['prompt', 'answer', 'explanationCs']);
    }
  });
  it('czech errors', () => {
    uniqueIds('czech errors', CZECH_ERRORS);
    for (const c of CZECH_ERRORS) expect(c.wrongEn.trim(), c.id).not.toBe(c.correctEn.trim());
  });
});

describe('reference content', () => {
  it('has no empty entries', () => {
    uniqueIds('vocab topics', VOCAB_TOPICS);
    for (const t of VOCAB_TOPICS) for (const w of t.words) expect(w.en && w.cs, t.id).toBeTruthy();
    uniqueIds('conversation', CONVERSATION_TOPICS);
    noEmptyStrings('conversation', CONVERSATION_TOPICS, ['titleCs', 'titleEn', 'sampleAnswer']);
    uniqueIds('writing', WRITING_TEMPLATES);
    noEmptyStrings('writing', WRITING_TEMPLATES, ['titleCs', 'example']);
    uniqueIds('grammar reference', GRAMMAR_REFERENCE);
  });
});

describe('Czech typography', () => {
  it('closes Czech quotes „…“ with “, not an ASCII quote', async () => {
    const files = import.meta.glob('./**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
    expect(Object.keys(files).length).toBeGreaterThan(20);
    const bad: string[] = [];
    for (const [f, src] of Object.entries(files)) {
      if (f.endsWith('.test.ts')) continue;
      const m = src.match(/„[^“"\n]*"/g);
      if (m) bad.push(`${f}: ${m.length}× e.g. ${m[0]}`);
    }
    expect(bad).toEqual([]);
  });
});
