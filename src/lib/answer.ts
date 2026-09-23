/**
 * Tolerant comparison of typed answers.
 * - case-insensitive, collapses whitespace, unifies curly quotes/apostrophes and dashes
 * - ignores final punctuation (. ! ? ,) and surrounding quotes
 * - accepts standard English contraction variants (don't = do not, it's = it is / it has, …)
 * - an answer may contain alternatives separated by "|" (e.g. "burnt|burned")
 */

/** Unambiguous contractions → single expansion. Order matters. */
const FIXED: [RegExp, string][] = [
  [/\bwon't\b/g, 'will not'],
  [/\bshan't\b/g, 'shall not'],
  [/\bcan't\b/g, 'cannot'],
  [/\bcan not\b/g, 'cannot'],
  [/\bain't\b/g, 'is not'],
  [/\b(\w+)n't\b/g, '$1 not'],
  [/\bi'm\b/g, 'i am'],
  [/\b(\w+)'re\b/g, '$1 are'],
  [/\b(\w+)'ll\b/g, '$1 will'],
  [/\b(\w+)'ve\b/g, '$1 have'],
  [/\blet's\b/g, 'let us'],
];

/** Ambiguous contractions → several possible expansions. */
const AMBIGUOUS: { re: RegExp; options: string[] }[] = [
  { re: /\b(he|she|it|that|there|what|who|where|how|here|this)'s\b/, options: ['is', 'has'] },
  { re: /\b(i|you|we|they|he|she|it|there|who|that)'d\b/, options: ['would', 'had'] },
];

export function normalizeAnswer(input: string): string {
  let s = input
    .normalize('NFC')
    .toLowerCase()
    .replace(/[‘’‛′`´]/g, "'")
    .replace(/[“”„″]/g, '"')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  s = s.replace(/^["']+|["']+$/g, '').trim();
  s = s.replace(/[.!?,;:]+$/g, '').trim();
  s = s.replace(/\s+([.,!?;:])/g, '$1');
  return s;
}

/** All canonical expansions of a (normalized) answer. */
export function canonicalForms(input: string): string[] {
  let base = normalizeAnswer(input);
  for (const [re, rep] of FIXED) base = base.replace(re, rep);
  let forms = [base];
  for (let guard = 0; guard < 6; guard++) {
    let changed = false;
    const next: string[] = [];
    for (const f of forms) {
      const hit = AMBIGUOUS.find((a) => a.re.test(f));
      if (!hit) { next.push(f); continue; }
      changed = true;
      for (const opt of hit.options) next.push(f.replace(hit.re, `$1 ${opt}`));
    }
    forms = [...new Set(next)];
    if (!changed || forms.length > 32) break;
  }
  return forms;
}

const GAP_SEP = /\s*(?:\.\.\.|…)\s*/;

/** Does the answer describe several gaps ("has ... gone")? */
export function isMultiGap(answer: string): boolean {
  return GAP_SEP.test(answer);
}

/** Answer variants split into gap parts: "has ... gone|'s ... gone" → [["has","gone"],["'s","gone"]]. */
export function gapVariants(answer: string): string[][] {
  return answer.split('|').map((v) => v.split(GAP_SEP).map((p) => p.trim()).filter(Boolean)).filter((v) => v.length > 0);
}

/** Check several typed gap answers against a multi-gap answer (each part compared tolerantly). */
export function isGapAnswerCorrect(userParts: string[], answer: string): boolean {
  return gapVariants(answer).some((parts) =>
    parts.length === userParts.length && parts.every((p, i) => isAnswerCorrect(userParts[i] ?? '', p)),
  );
}

/** Split "a|b" alternatives and extra accepted answers into a flat list. */
export function answerVariants(answer: string, extra: readonly string[] = []): string[] {
  const all = [answer, ...extra].flatMap((a) => a.split('|')).map((a) => a.trim()).filter(Boolean);
  return [...new Set(all)];
}

export function isAnswerCorrect(user: string, answer: string, extra: readonly string[] = []): boolean {
  if (!normalizeAnswer(user)) return false;
  const userForms = new Set(canonicalForms(user));
  if (answerVariants(answer, extra).some((a) => canonicalForms(a).some((f) => userForms.has(f)))) return true;
  // Multi-gap answer typed into a single box: ignore the separators ("has ... gone" = "has gone" = "has, gone").
  if (isMultiGap(answer)) {
    const flat = (s: string) => canonicalForms(s.replace(/\s*(?:\.\.\.|…|\/|,|;)\s*/g, ' '));
    const userFlat = new Set(flat(user));
    return gapVariants(answer).some((parts) => flat(parts.join(' ')).some((f) => userFlat.has(f)));
  }
  return false;
}

/** Display form of an answer that may contain "|" alternatives. */
export function displayAnswer(answer: string): string {
  return answer.split('|').map((a) => a.trim()).filter(Boolean).join(' / ');
}

/** Primary (first) form of an answer with alternatives. */
export function primaryAnswer(answer: string): string {
  return answer.split('|')[0].trim();
}

/** Count words (for "max 3 words" style checks). */
export function wordCount(s: string): number {
  const t = normalizeAnswer(s);
  return t ? t.split(' ').length : 0;
}
