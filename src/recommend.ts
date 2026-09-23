import type { DrillSession } from './types';
import { MODULES, sessionModule, type ModuleDef } from './modules';
import { dayKey, daysBetween } from './lib/dates';

export interface ModuleStat {
  sessions: number;
  total: number;
  correct: number;
  lastDay: string;
}

export function moduleStats(sessions: DrillSession[]): Record<string, ModuleStat> {
  const out: Record<string, ModuleStat> = {};
  for (const s of sessions) {
    const id = sessionModule(s);
    const st = (out[id] ??= { sessions: 0, total: 0, correct: 0, lastDay: '' });
    st.sessions += 1;
    st.total += s.totalItems;
    st.correct += s.correctItems;
    if (s.date > st.lastDay) st.lastDay = s.date;
  }
  return out;
}

/** Core path for beginners — the order in which untouched modules are suggested. */
export const CORE_PATH = [
  'articles', 'prepositions', 'grammar', 'reading', 'irregular_verbs', 'listening', 'word_order',
  'confusables', 'phrasal_verbs', 'czech_errors', 'conditionals', 'passive_voice', 'word_formation',
  'reported_speech', 'error_correction', 'sentence_transform', 'idioms', 'translation',
];

export interface Recommendation {
  module: ModuleDef;
  reason: string;
}

/**
 * Suggest one module to practise today:
 * 1. weakest recently practised module (accuracy < 75 %), else
 * 2. the next core module not practised in the last 7 days (rotates by day), else
 * 3. the module practised longest ago.
 */
export function recommendModule(
  sessions: DrillSession[],
  mistakesByModule: Record<string, number> = {},
  today = dayKey(),
): Recommendation {
  const recent = sessions.filter((s) => daysBetween(s.date, today) <= 30);
  const stats = moduleStats(recent);
  const all = moduleStats(sessions);
  const candidates = CORE_PATH.map((id) => MODULES.find((m) => m.id === id)).filter((m): m is ModuleDef => !!m);

  const practisedToday = new Set(sessions.filter((s) => s.date === today).map((s) => sessionModule(s)));

  const weak = candidates
    .filter((m) => !practisedToday.has(m.id))
    .map((m) => ({ m, st: stats[m.id], mistakes: mistakesByModule[m.id] ?? 0 }))
    .filter((x) => x.st && x.st.total >= 5 && x.st.correct / x.st.total < 0.75)
    .sort((a, b) => a.st!.correct / a.st!.total - b.st!.correct / b.st!.total || b.mistakes - a.mistakes);
  if (weak.length) {
    const { m, st } = weak[0];
    return { module: m, reason: `Úspěšnost ${Math.round((st!.correct / st!.total) * 100)} % — stojí za zopakování` };
  }

  const untouched = candidates.filter((m) => !all[m.id] && !practisedToday.has(m.id));
  if (untouched.length) return { module: untouched[0], reason: 'Nové téma, které ještě čeká' };

  const stale = candidates
    .filter((m) => !practisedToday.has(m.id))
    .map((m) => ({ m, last: all[m.id]?.lastDay ?? '' }))
    .sort((a, b) => a.last.localeCompare(b.last));
  if (stale.length) {
    const days = stale[0].last ? daysBetween(stale[0].last, today) : 0;
    return {
      module: stale[0].m,
      reason: days > 1 ? `Naposledy před ${days} dny` : 'Udrž si formu',
    };
  }
  return { module: candidates[0], reason: 'Udrž si formu' };
}
