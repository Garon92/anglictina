export interface VocabWord {
  id: string;
  en: string;
  cs: string;
  example: string;
  exampleCs: string;
  phonetic?: string;
  band: 1 | 2 | 3;
  topics: string[];
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'preposition' | 'conjunction' | 'pronoun' | 'determiner' | 'interjection' | 'phrase';
}

export interface GrammarExercise {
  id: string;
  type: 'cloze' | 'mcq' | 'translate' | 'open_cloze';
  category: string;
  level: 'A1' | 'A2' | 'B1';
  prompt: string;
  options?: string[];
  answer: string;
  explanationCs: string;
  tags: string[];
}

export interface ReadingText {
  id: string;
  title: string;
  level: 'A1' | 'A2' | 'B1';
  text: string;
  topic: string;
  questions: ReadingQuestion[];
}

export interface ReadingQuestion {
  id: string;
  type: 'mcq' | 'truefalse' | 'tfns';
  question: string;
  options: string[];
  answerIndex: number;
}

export interface MatchingExercise {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  topic: string;
  instructionCs: string;
  items: { id: string; text: string }[];
  options: { id: string; text: string }[];
  correctMatches: Record<string, string>;
}

export interface GappedTextExercise {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  topic: string;
  text: string;
  sentences: { id: string; text: string }[];
  correctGaps: Record<string, string>;
}

export interface ListeningExercise {
  id: string;
  type: 'dictation' | 'comprehension' | 'gapfill';
  level: 'A1' | 'A2' | 'B1';
  topic: string;
  script: string;
  questions: ListeningQuestion[];
}

export interface ListeningQuestion {
  id: string;
  type: 'mcq' | 'truefalse' | 'fill';
  question: string;
  options?: string[];
  answerIndex?: number;
  answer?: string;
}

export interface PhrasalVerbEntry {
  id: string;
  verb: string;
  meaningCs: string;
  example: string;
  exampleCs: string;
  level: 'A2' | 'B1';
  category: string;
}

export interface WritingTemplate {
  id: string;
  type: 'email' | 'letter' | 'essay' | 'description';
  titleCs: string;
  level: 'A2' | 'B1';
  structureCs: string;
  usefulPhrases: { en: string; cs: string }[];
  example: string;
}

export interface GrammarTopic {
  id: string;
  titleCs: string;
  titleEn: string;
  level: 'A1' | 'A2' | 'B1';
  explanationCs: string;
  examples: { en: string; cs: string }[];
  keyRules: string[];
}

export interface SRSState {
  cardId: string;
  deckId: string;
  dueAt: number;
  intervalDays: number;
  ease: number;
  lapses: number;
  lastGrade: number;
  lastReviewAt: number;
  totalReviews: number;
  /** When the card was first reviewed (added in v2; missing on older cards). */
  firstReviewAt?: number;
}

export interface ReviewLog {
  id?: number;
  timestamp: number;
  cardId: string;
  deckId: string;
  grade: number;
  responseMs: number;
}

export interface DrillSession {
  id?: number;
  /** Local day key YYYY-MM-DD (older records may carry the UTC day). */
  date: string;
  /** Broad activity type (legacy values kept for old records). */
  type: string;
  /** Module id from src/modules.ts (added in v2; inferred from tags for older records). */
  module?: string;
  startedAt: number;
  endedAt?: number;
  totalItems: number;
  correctItems: number;
  tags: string[];
}

export interface ExamSession {
  id?: number;
  type: 'internal' | 'timer_only';
  startedAt: number;
  endedAt?: number;
  /** Points (0–100) for full simulations; percentage for older/partial records. */
  scoreTotal: number;
  maxScore: number;
  /** Percentages per subtest. */
  scoreBySkill: {
    listening: number;
    reading: number;
    language: number;
  };
  notes: string;
  /** v2: which practice set / mode, and points per part (index 0 = part 1). */
  setId?: string;
  mode?: 'full' | 'listening' | 'reading' | 'part' | 'mini';
  partPoints?: number[];
  partMax?: number[];
  passed?: boolean;
  /** v2: stored answers + set id per part (index 0 = part 1) for the review screen. */
  answers?: unknown;
  sources?: string[];
  parts?: number[];
}

export interface UserSettings {
  locale: string;
  examDate: string;
  goalScore: number;
  minutesPerDay: number;
  newCardsPerDay: number;
  maxReviewsPerDay: number;
  ttsEnabled: boolean;
  ttsLang: string;
  ttsRate: number;
  ttsVoice: string;
  onboardingDone: boolean;
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  showCountdown: boolean;
}

export interface UserStats {
  streakDays: number;
  lastActiveDate: string;
  totalStudyMinutes: number;
  totalCardsLearned: number;
  totalExercisesDone: number;
  bestStreak: number;
  diagnosticScores: { date: string; score: number; maxScore: number }[];
}

export const DEFAULT_SETTINGS: UserSettings = {
  locale: 'cs-CZ',
  examDate: '2028-05-05',
  goalScore: 60,
  minutesPerDay: 25,
  newCardsPerDay: 8,
  maxReviewsPerDay: 40,
  ttsEnabled: true,
  ttsLang: 'en-GB',
  ttsRate: 0.9,
  ttsVoice: '',
  onboardingDone: false,
  theme: 'auto',
  fontSize: 'medium',
  soundEnabled: true,
  showCountdown: true,
};

export const DEFAULT_STATS: UserStats = {
  streakDays: 0,
  lastActiveDate: '',
  totalStudyMinutes: 0,
  totalCardsLearned: 0,
  totalExercisesDone: 0,
  bestStreak: 0,
  diagnosticScores: [],
};

export const MATURITA_TOPICS = [
  { id: 'family', cs: 'Rodina a vztahy', en: 'Family & Relationships' },
  { id: 'housing', cs: 'Bydlení', en: 'Housing & Living' },
  { id: 'education', cs: 'Vzdělávání a škola', en: 'Education & School' },
  { id: 'work', cs: 'Práce a kariéra', en: 'Work & Career' },
  { id: 'freetime', cs: 'Volný čas a koníčky', en: 'Free Time & Hobbies' },
  { id: 'travel', cs: 'Cestování a doprava', en: 'Travel & Transport' },
  { id: 'health', cs: 'Zdraví a tělo', en: 'Health & Body' },
  { id: 'food', cs: 'Jídlo a pití', en: 'Food & Drink' },
  { id: 'shopping', cs: 'Nakupování a služby', en: 'Shopping & Services' },
  { id: 'nature', cs: 'Příroda a životní prostředí', en: 'Nature & Environment' },
  { id: 'media', cs: 'Média a technologie', en: 'Media & Technology' },
  { id: 'culture', cs: 'Kultura a společnost', en: 'Culture & Society' },
  { id: 'weather', cs: 'Počasí a roční období', en: 'Weather & Seasons' },
  { id: 'sports', cs: 'Sport', en: 'Sports' },
  { id: 'daily', cs: 'Denní rutina', en: 'Daily Routine' },
] as const;

export type TopicId = typeof MATURITA_TOPICS[number]['id'];

/** A remembered mistake that is re-drilled until answered correctly twice (DB v2). */
export interface MistakeItem {
  /** `${module}:${itemId}` */
  key: string;
  module: string;
  category: string;
  /** Question shown to the learner (may contain "___" for the gap). */
  prompt: string;
  /** How to re-ask: pick an option, type the answer, or reveal & self-grade. */
  kind: 'mcq' | 'text' | 'reveal';
  options?: string[];
  /** Correct answer for display; may contain "a|b" alternatives. */
  answer: string;
  accept?: string[];
  explanation?: string;
  /** Optional short context (e.g. Czech translation, hint). */
  context?: string;
  lastWrong: string;
  wrongCount: number;
  rightStreak: number;
  createdAt: number;
  updatedAt: number;
  dueAt: number;
  resolvedAt?: number;
}

/** Generic key-value record for small app state (DB v2). */
export interface KVRecord {
  key: string;
  value: unknown;
}
