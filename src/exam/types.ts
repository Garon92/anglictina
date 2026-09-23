/**
 * Content schema for original practice tests modelled on the structure of the
 * CERMAT "didaktický test" (anglický jazyk, B1) — 10 parts, 64 tasks, 100 points,
 * pass mark 44 %, 110 minutes (poslech ~40 min, čtení a jazyková kompetence 70 min).
 *
 * All texts in the sets are ORIGINAL (written for this app); only the task formats
 * mirror the official test.
 *
 * Listening scripts: one utterance per line. A line may start with a speaker tag
 *   "M:" (male voice), "W:" (female voice) or "N:" (narrator). Lines without a tag are
 *   read by the narrator. Example:
 *     "W: Hi Tom, are you coming to the party tonight?\nM: I'm not sure, I've got a cold."
 * Gap texts (parts 9 and 10) mark gaps as {{n}} where n is 1-based gap index
 * (part 10 also uses {{0}} for the worked example).
 */

export type Idx4 = 0 | 1 | 2 | 3;
export type Idx3 = 0 | 1 | 2;

/** A "picture" option for part 1: rendered as a big emoji composition + short caption. */
export interface PictureOption {
  emoji: string;
  caption: string;
}

export interface ExamPart1Item {
  /** Question printed in the booklet and read before the recording. */
  question: string;
  /** Short dialogue (usually 2 speakers, 50–90 words). */
  script: string;
  options: [PictureOption, PictureOption, PictureOption, PictureOption];
  answer: Idx4;
  explanationCs: string;
}

export interface TrueFalseItem {
  text: string;
  answer: boolean;
  explanationCs: string;
}

export interface OpenAnswerItem {
  question: string;
  /** Optional words printed before/after the answer line, e.g. "in ___" or "£ ___". */
  prefix?: string;
  suffix?: string;
  /** Accepted answers (max 3 words each). First one is the model answer. Case-insensitive. */
  accept: string[];
  explanationCs: string;
}

export interface Mcq4Item {
  question: string;
  options: [string, string, string, string];
  answer: Idx4;
  explanationCs: string;
}

export interface ExamPart4Item extends Mcq4Item {
  /** Short recording (40–90 words). */
  script: string;
}

export interface ExamPart5Item extends Mcq4Item {
  /** Short authentic-style text: notice, message, advert, post… (40–90 words). */
  text: string;
  /** Optional kind label shown above the text, e.g. "Notice", "Text message". */
  kind?: string;
}

export interface MatchingPerson {
  name: string;
  /** 35–60 words describing requirements. */
  text: string;
  /** Index into offers (0 = A … 6 = G). */
  answer: number;
  explanationCs: string;
}

export interface MatchingOffer {
  title: string;
  /** 50–90 words. */
  text: string;
}

export interface ClozeMcqGap {
  options: [string, string, string];
  answer: Idx3;
  explanationCs: string;
}

export interface OpenClozeGap {
  /** Accepted words (usually exactly one form, occasionally alternatives). */
  accept: string[];
  explanationCs: string;
}

export interface ExamSet {
  id: string;
  title: string;
  /** Short Czech description of the topics in the set. */
  descriptionCs: string;

  // ── POSLECH (40 bodů) ────────────────────────────────────────────
  /** Úlohy 1–4: four short recordings, choose the right picture A–D. 4 × 2 b. */
  part1: { items: ExamPart1Item[] };
  /** Úlohy 5–12: one dialogue, 8 true/false statements. 8 × 1 b. */
  part2: { introCs: string; script: string; statements: TrueFalseItem[] };
  /** Úlohy 13–20: one monologue, 8 open questions answered in max 3 words. 8 × 2 b. */
  part3: { introCs: string; script: string; questions: OpenAnswerItem[] };
  /** Úlohy 21–24: four short recordings, MCQ A–D. 4 × 2 b. */
  part4: { items: ExamPart4Item[] };

  // ── ČTENÍ (40 bodů) ─────────────────────────────────────────────
  /** Úlohy 25–29: five short texts, one MCQ A–D each. 5 × 2 b. */
  part5: { items: ExamPart5Item[] };
  /** Úlohy 30–39: informational text, 10 true/false statements. 10 × 1 b. */
  part6: { introCs: string; title: string; text: string; statements: TrueFalseItem[] };
  /** Úlohy 40–44: article/blog, 5 MCQ A–D. 5 × 2 b. */
  part7: { introCs: string; title: string; text: string; questions: Mcq4Item[] };
  /** Úlohy 45–49: five people, seven offers A–G (two extra). 5 × 2 b. */
  part8: { introCs: string; people: MatchingPerson[]; offers: MatchingOffer[] };

  // ── JAZYKOVÁ KOMPETENCE (20 bodů) ───────────────────────────────
  /** Úlohy 50–59: text with 10 gaps, MCQ A–C each. 10 × 1 b. */
  part9: { introCs: string; title: string; text: string; gaps: ClozeMcqGap[] };
  /** Úlohy 60–64: text with 5 gaps, one word in the correct form. 5 × 2 b. */
  part10: { introCs: string; title: string; text: string; example: string; gaps: OpenClozeGap[] };
}
