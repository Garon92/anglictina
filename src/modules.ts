/**
 * Registry of all learning modules — single source of truth for navigation, the practice hub,
 * statistics labels and mistake labels.
 */

export type ModuleGroup = 'vocab' | 'grammar' | 'reading' | 'listening' | 'productive' | 'quiz' | 'reference' | 'tools';

export interface ModuleDef {
  /** Stable id used in drill sessions and mistakes. */
  id: string;
  path: string;
  title: string;
  desc: string;
  icon: string;
  group: ModuleGroup;
  /** Which subtest of the didaktický test this mainly trains. */
  examSkill?: 'listening' | 'reading' | 'language';
  /** Does this module record practice sessions? */
  tracked?: boolean;
  /** Search keywords (without diacritics is fine). */
  keywords?: string;
}

export const GROUPS: { id: ModuleGroup; title: string; desc: string; icon: string }[] = [
  { id: 'vocab', title: 'Slovní zásoba', desc: 'Slovíčka, fráze a slovní tvary', icon: '📝' },
  { id: 'grammar', title: 'Gramatika', desc: 'Jazyková kompetence krok za krokem', icon: '✏️' },
  { id: 'reading', title: 'Čtení', desc: 'Porozumění textu', icon: '📖' },
  { id: 'listening', title: 'Poslech', desc: 'Porozumění mluvenému slovu', icon: '🎧' },
  { id: 'productive', title: 'Psaní a mluvení', desc: 'Písemná práce a ústní zkouška', icon: '💬' },
  { id: 'quiz', title: 'Kvízy a výzvy', desc: 'Rychlé opakování napříč tématy', icon: '⚡' },
  { id: 'reference', title: 'Příručka', desc: 'Pravidla, přehledy a tahák', icon: '📚' },
  { id: 'tools', title: 'Nástroje', desc: 'Hledání, oblíbené a vlastní slovíčka', icon: '🧰' },
];

export const MODULES: ModuleDef[] = [
  // Slovní zásoba
  { id: 'vocab', path: '/vocab', title: 'Slovíčka', desc: '2 800 nejčastějších slov s opakováním', icon: '🗂️', group: 'vocab', examSkill: 'language', tracked: true, keywords: 'srs karticky ngsl slovicka opakovani' },
  { id: 'vocab_topics', path: '/vocab-topics', title: 'Slovíčka podle témat', desc: 'Maturitní témata s příklady', icon: '🧭', group: 'vocab', keywords: 'temata rodina cestovani' },
  { id: 'phrasal_verbs', path: '/phrasal-verbs', title: 'Frázová slovesa', desc: 'get up, look after, give up…', icon: '🧩', group: 'vocab', examSkill: 'language', tracked: true, keywords: 'phrasal verbs' },
  { id: 'idioms', path: '/idioms', title: 'Idiomy a kolokace', desc: 'Ustálená spojení', icon: '💎', group: 'vocab', examSkill: 'language', tracked: true, keywords: 'idioms collocations make do' },
  { id: 'irregular_verbs', path: '/irregular-verbs', title: 'Nepravidelná slovesa', desc: 'go – went – gone', icon: '🔁', group: 'vocab', examSkill: 'language', tracked: true, keywords: 'irregular verbs past participle' },
  { id: 'confusables', path: '/confusables', title: 'Záměnná slova', desc: 'false friends, make × do…', icon: '🔀', group: 'vocab', examSkill: 'language', tracked: true, keywords: 'false friends confusables' },
  { id: 'word_formation', path: '/word-formation', title: 'Tvoření slov', desc: 'Předpony a přípony', icon: '🔧', group: 'vocab', examSkill: 'language', tracked: true, keywords: 'word formation prefix suffix' },
  { id: 'custom_words', path: '/custom-words', title: 'Vlastní slovíčka', desc: 'Tvůj osobní slovníček', icon: '✍️', group: 'vocab', tracked: true, keywords: 'vlastni slovnicek' },
  { id: 'matching', path: '/matching', title: 'Pexeso', desc: 'Spojuj slova s překladem', icon: '🃏', group: 'vocab', tracked: true, keywords: 'hra pexeso matching' },

  // Gramatika
  { id: 'grammar', path: '/grammar', title: 'Gramatika – mix', desc: 'Časy, modální slovesa, stupňování…', icon: '✏️', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'grammar mix' },
  { id: 'tenses', path: '/tenses', title: 'Přehled časů', desc: '12 časů s příklady a testem', icon: '⏱️', group: 'grammar', keywords: 'tenses casy present past' },
  { id: 'articles', path: '/articles', title: 'Členy', desc: 'a / an / the / –', icon: '📐', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'articles a an the' },
  { id: 'prepositions', path: '/prepositions', title: 'Předložky', desc: 'in / on / at a další', icon: '📌', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'prepositions in on at' },
  { id: 'conditionals', path: '/conditionals', title: 'Podmínkové věty', desc: 'If… typy 0–3', icon: '🔀', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'conditionals if' },
  { id: 'passive_voice', path: '/passive', title: 'Trpný rod', desc: 'is made, was built…', icon: '🔄', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'passive voice trpny rod' },
  { id: 'reported_speech', path: '/reported-speech', title: 'Nepřímá řeč', desc: 'He said that…', icon: '🗨️', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'reported speech neprima rec' },
  { id: 'word_order', path: '/word-order', title: 'Slovosled', desc: 'Skládej věty ve správném pořadí', icon: '🧱', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'word order slovosled' },
  { id: 'error_correction', path: '/error-correction', title: 'Oprav chybu', desc: 'Najdi a oprav chybu ve větě', icon: '🩹', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'error correction chyby' },
  { id: 'sentence_transform', path: '/sentence-transform', title: 'Přeformulace', desc: 'Stejný význam, jiná stavba', icon: '🔁', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'transformation key word' },
  { id: 'czech_errors', path: '/czech-errors', title: 'Typické chyby Čechů', desc: 'Čeština nám podráží nohy', icon: '🇨🇿', group: 'grammar', examSkill: 'language', tracked: true, keywords: 'czech errors chyby cechu' },
  { id: 'translation', path: '/translation', title: 'Překlad vět', desc: 'Z češtiny do angličtiny', icon: '🔤', group: 'grammar', tracked: true, keywords: 'translation preklad' },

  // Čtení / Poslech
  { id: 'reading', path: '/reading', title: 'Čtení s porozuměním', desc: '50 textů s otázkami', icon: '📖', group: 'reading', examSkill: 'reading', tracked: true, keywords: 'reading cteni texty' },
  { id: 'listening', path: '/listening', title: 'Poslech', desc: 'Diktáty, porozumění a doplňování', icon: '🎧', group: 'listening', examSkill: 'listening', tracked: true, keywords: 'listening poslech' },

  // Psaní a mluvení
  { id: 'writing', path: '/writing', title: 'Psaní', desc: 'Šablony, fráze a vzorové texty', icon: '✉️', group: 'productive', keywords: 'writing psani email dopis' },
  { id: 'conversation', path: '/conversation', title: 'Ústní zkouška', desc: 'Témata, otázky a vzorové odpovědi', icon: '🎙️', group: 'productive', keywords: 'conversation ustni temata mluveni' },

  // Kvízy
  { id: 'mixed', path: '/mixed-quiz', title: 'Mix kvíz', desc: 'Otázky ze všech modulů', icon: '🎲', group: 'quiz', tracked: true, keywords: 'mix quiz' },
  { id: 'speed', path: '/speed', title: 'Rychlovka', desc: '20 otázek proti času', icon: '⏱️', group: 'quiz', tracked: true, keywords: 'speed rychlovka cas' },
  { id: 'favorites_quiz', path: '/favorites-quiz', title: 'Kvíz z oblíbených', desc: 'Procvič si uložená slova', icon: '💛', group: 'quiz', tracked: true, keywords: 'oblibene favorites' },
  { id: 'diagnostic', path: '/diagnostic', title: 'Rozřazovací test', desc: 'Zjisti svou úroveň A1–B1', icon: '🩺', group: 'quiz', tracked: true, keywords: 'diagnostika uroven test' },

  // Příručka
  { id: 'grammar_ref', path: '/grammar-ref', title: 'Přehled gramatiky', desc: 'Pravidla s příklady', icon: '📋', group: 'reference', keywords: 'grammar reference pravidla' },
  { id: 'cheatsheet', path: '/cheatsheet', title: 'Tahák', desc: 'Vše podstatné na jedné stránce', icon: '🖨️', group: 'reference', keywords: 'tahak cheatsheet tisk' },
  { id: 'study_plan', path: '/study-plan', title: 'Studijní plán', desc: 'Týdenní rozvrh do maturity', icon: '📅', group: 'reference', keywords: 'plan rozvrh' },

  // Nástroje
  { id: 'search', path: '/search', title: 'Hledání', desc: 'Slovník napříč obsahem', icon: '🔍', group: 'tools', keywords: 'hledani slovnik search' },
  { id: 'favorites', path: '/favorites', title: 'Oblíbené', desc: 'Uložená slova a fráze', icon: '⭐', group: 'tools', keywords: 'oblibene' },
];

/** Modules that exist only as special routes (not listed in the hub). */
export const SPECIAL_MODULES: Record<string, { title: string; icon: string }> = {
  mistakes: { title: 'Opakování chyb', icon: '🔁' },
  exam: { title: 'Simulace maturity', icon: '🎯' },
  daily: { title: 'Denní výzva', icon: '☀️' },
  other: { title: 'Ostatní', icon: '•' },
};

const BY_ID = new Map(MODULES.map((m) => [m.id, m]));
const BY_PATH = new Map(MODULES.map((m) => [m.path, m]));

export function getModule(id: string): ModuleDef | undefined {
  return BY_ID.get(id);
}

export function getModuleByPath(path: string): ModuleDef | undefined {
  return BY_PATH.get(path);
}

export function moduleTitle(id: string): string {
  return BY_ID.get(id)?.title ?? SPECIAL_MODULES[id]?.title ?? LEGACY_LABELS[id] ?? id;
}

export function moduleIcon(id: string): string {
  return BY_ID.get(id)?.icon ?? SPECIAL_MODULES[id]?.icon ?? '•';
}

const LEGACY_LABELS: Record<string, string> = {
  vocab: 'Slovíčka',
  grammar: 'Gramatika',
  irregular_verbs: 'Nepravidelná slovesa',
  mistake_drill: 'Opakování chyb',
};

/** Map legacy tag values (older sessions) to module ids. */
const TAG_TO_MODULE: Record<string, string> = {
  articles: 'articles',
  confusables: 'confusables',
  idioms: 'idioms',
  irregular_verbs: 'irregular_verbs',
  prepositions: 'prepositions',
  translation: 'translation',
  word_order: 'word_order',
  favorites_quiz: 'favorites_quiz',
  matching_game: 'matching',
  mistake_drill: 'mistakes',
  mixed_quiz: 'mixed',
  speed_challenge: 'speed',
  czech_errors: 'czech_errors',
  conditionals: 'conditionals',
  passive: 'passive_voice',
  passive_voice: 'passive_voice',
  reported_speech: 'reported_speech',
  sentence_transform: 'sentence_transform',
  error_correction: 'error_correction',
  listening: 'listening',
  reading: 'reading',
  srs: 'vocab',
  exam: 'exam',
};

/** Module id of a drill session (explicit in v2, inferred from type/tags for older records). */
export function sessionModule(s: { type: string; module?: string; tags?: string[] }): string {
  if (s.module) return s.module;
  for (const t of s.tags ?? []) {
    if (TAG_TO_MODULE[t]) return TAG_TO_MODULE[t];
  }
  if (s.type === 'exam') return 'exam';
  if (BY_ID.has(s.type)) return s.type;
  return s.type || 'other';
}
