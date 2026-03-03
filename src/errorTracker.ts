const STORAGE_KEY = 'anglictina_errors';
const MAX_ENTRIES = 500;

export interface ErrorEntry {
  timestamp: number;
  module: string;
  category: string;
  question: string;
  userAnswer: string;
  correctAnswer: string;
}

export interface ErrorAnalysis {
  totalErrors: number;
  byModule: Record<string, number>;
  byCategory: Record<string, number>;
  recentErrors: ErrorEntry[];
  weakestModule: string;
  weakestCategory: string;
}

function loadErrors(): ErrorEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveErrors(entries: ErrorEntry[]) {
  const trimmed = entries.slice(-MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
}

export function trackError(
  module: string,
  category: string,
  question: string,
  userAnswer: string,
  correctAnswer: string,
) {
  const entries = loadErrors();
  entries.push({ timestamp: Date.now(), module, category, question, userAnswer, correctAnswer });
  saveErrors(entries);
}

export function getErrorAnalysis(): ErrorAnalysis {
  const entries = loadErrors();
  const byModule: Record<string, number> = {};
  const byCategory: Record<string, number> = {};

  for (const e of entries) {
    byModule[e.module] = (byModule[e.module] || 0) + 1;
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  }

  const weakestModule = Object.entries(byModule).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';
  const weakestCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '';

  return {
    totalErrors: entries.length,
    byModule,
    byCategory,
    recentErrors: entries.slice(-20).reverse(),
    weakestModule,
    weakestCategory,
  };
}

export function clearErrors() {
  localStorage.removeItem(STORAGE_KEY);
}

const MODULE_LABELS: Record<string, string> = {
  vocab: 'Slovíčka',
  grammar: 'Gramatika',
  prepositions: 'Předložky',
  confusables: 'Záměnná slova',
  irregular_verbs: 'Nepravidelná slovesa',
  word_order: 'Skládání vět',
  reading: 'Čtení',
  listening: 'Poslech',
};

export function getModuleLabel(module: string): string {
  return MODULE_LABELS[module] || module;
}
