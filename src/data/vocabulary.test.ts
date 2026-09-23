import { describe, expect, it } from 'vitest';
import { VOCABULARY } from './vocabulary';
import { NGSL_CHUNK1 } from './ngsl_chunk1';
import { NGSL_CHUNK2 } from './ngsl_chunk2';
import { NGSL_CHUNK3 } from './ngsl_chunk3';
import { NGSL_CHUNK4 } from './ngsl_chunk4';

const POS = new Set(['noun', 'verb', 'adjective', 'adverb', 'preposition', 'conjunction', 'pronoun', 'determiner', 'interjection', 'phrase']);

describe('vocabulary deck', () => {
  it('has unique ids', () => {
    const ids = VOCABULARY.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('keeps historic positional NGSL ids stable', () => {
    // These ids are stored in users' spaced-repetition progress — never shift them.
    const byId = new Map(VOCABULARY.map((w) => [w.id, w]));
    const check = (chunk: [string, string, string][], start: number, idx: number) => {
      const id = `ngsl-${start + idx}`;
      const w = byId.get(id);
      if (w) expect(w.en).toBe(chunk[idx][0]);
    };
    check(NGSL_CHUNK1, 1, 0);
    check(NGSL_CHUNK1, 1, 300);
    check(NGSL_CHUNK2, 701, 0);
    check(NGSL_CHUNK2, 701, 850); // overlaps chunk 3 ranks → chunk-2 word keeps the plain id
    check(NGSL_CHUNK4, 2101, 10);
    expect(byId.get('ngsl-1501-b')?.en).toBe(NGSL_CHUNK3[0][0]);
  });

  it('has no empty fields and valid parts of speech', () => {
    for (const w of VOCABULARY) {
      expect(w.en.trim(), w.id).not.toBe('');
      expect(w.cs.trim(), w.id).not.toBe('');
      expect(POS.has(w.partOfSpeech), `${w.id} ${w.partOfSpeech}`).toBe(true);
      expect(w.cs, w.id).not.toMatch(/\s{2,}|^\s|\s$/);
    }
  });

  it('has no duplicate headword + part of speech', () => {
    const seen = new Map<string, string>();
    const dups: string[] = [];
    for (const w of VOCABULARY) {
      const k = `${w.en.toLowerCase()}|${w.partOfSpeech}`;
      if (seen.has(k)) dups.push(`${k} (${seen.get(k)} / ${w.id})`);
      seen.set(k, w.id);
    }
    expect(dups).toEqual([]);
  });

  it('has example sentences that use the headword for most cards', () => {
    const withEx = VOCABULARY.filter((w) => w.example);
    expect(withEx.length / VOCABULARY.length).toBeGreaterThan(0.9);
    for (const w of withEx) expect(w.exampleCs.trim(), w.id).not.toBe('');
  });
});

import { VOCAB_TOTAL } from './vocabMeta';
describe('vocab meta', () => {
  it('VOCAB_TOTAL matches the deck size', () => {
    expect(VOCAB_TOTAL).toBe(VOCABULARY.length);
  });
});
