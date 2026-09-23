import { describe, expect, it } from 'vitest';
import { isAnswerCorrect, normalizeAnswer, displayAnswer, canonicalForms, wordCount, isGapAnswerCorrect, gapVariants } from './answer';

describe('normalizeAnswer', () => {
  it('lowercases, trims and collapses spaces', () => {
    expect(normalizeAnswer('  Has   BEEN  ')).toBe('has been');
  });
  it('unifies curly apostrophes and strips final punctuation', () => {
    expect(normalizeAnswer('I don’t know.')).toBe("i don't know");
    expect(normalizeAnswer('“Hello!”')).toBe('hello');
  });
});

describe('isAnswerCorrect', () => {
  it('accepts exact answers regardless of case', () => {
    expect(isAnswerCorrect('The', 'the')).toBe(true);
    expect(isAnswerCorrect('a', 'the')).toBe(false);
  });
  it('accepts contraction variants both ways', () => {
    expect(isAnswerCorrect('do not', "don't")).toBe(true);
    expect(isAnswerCorrect("won't", 'will not')).toBe(true);
    expect(isAnswerCorrect("can't", 'cannot')).toBe(true);
    expect(isAnswerCorrect("I'm going", 'I am going')).toBe(true);
    expect(isAnswerCorrect('she has been', "she's been")).toBe(true);
    expect(isAnswerCorrect('she is tired', "she's tired")).toBe(true);
    expect(isAnswerCorrect('I had gone', "I'd gone")).toBe(true);
  });
  it('supports pipe alternatives and extra accepted answers', () => {
    expect(isAnswerCorrect('burned', 'burnt|burned')).toBe(true);
    expect(isAnswerCorrect('burnt', 'burnt|burned')).toBe(true);
    expect(isAnswerCorrect('twelve', '12', ['twelve'])).toBe(true);
  });
  it('rejects empty input', () => {
    expect(isAnswerCorrect('   ', '')).toBe(false);
    expect(isAnswerCorrect('', 'the')).toBe(false);
  });
  it('does not treat possessive nouns as contractions', () => {
    expect(canonicalForms("John's book")).toEqual(["john's book"]);
  });
});

describe('helpers', () => {
  it('displays alternatives', () => {
    expect(displayAnswer('burnt|burned')).toBe('burnt / burned');
  });
  it('counts words', () => {
    expect(wordCount(' in the  morning ')).toBe(3);
    expect(wordCount('')).toBe(0);
  });
});

describe('multi-gap answers', () => {
  it('accepts separators or none in a single box', () => {
    expect(isAnswerCorrect('Does speak', 'Does ... speak')).toBe(true);
    expect(isAnswerCorrect('does ... speak', 'Does ... speak')).toBe(true);
    expect(isAnswerCorrect('does, speak', 'Does ... speak')).toBe(true);
    expect(isAnswerCorrect('do speak', 'Does ... speak')).toBe(false);
  });
  it('checks gap parts separately', () => {
    expect(isGapAnswerCorrect(['has', 'gone'], "has ... gone|'s ... gone")).toBe(true);
    expect(isGapAnswerCorrect(["'s", 'gone'], "has ... gone|'s ... gone")).toBe(true);
    expect(isGapAnswerCorrect(['has'], 'has ... gone')).toBe(false);
    expect(gapVariants('a ... b|c … d')).toEqual([['a', 'b'], ['c', 'd']]);
  });
});
