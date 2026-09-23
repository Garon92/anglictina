export function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function pickRandom<T>(arr: T[], count: number): T[] {
  return shuffleArray(arr).slice(0, count);
}

/** Deterministic PRNG (mulberry32) — same seed, same sequence. */
export function seededRandom(seed: string | number): () => number {
  let h = typeof seed === 'number' ? seed : 0;
  if (typeof seed === 'string') for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i) | 0;
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleSeeded<T>(arr: readonly T[], rand: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Unique by a key (first occurrence wins). */
export function uniqueBy<T>(arr: readonly T[], key: (x: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    const k = key(x);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(x);
  }
  return out;
}

/** Pick `n` distractors different from `correct` (by display text), shuffled together with it. */
export function buildOptions(correct: string, pool: readonly string[], n = 3, rand: () => number = Math.random): { options: string[]; correctIndex: number } {
  const norm = (s: string) => s.trim().toLowerCase();
  const distractors = uniqueBy(
    shuffleSeeded(pool.filter((p) => p && norm(p) !== norm(correct)), rand),
    norm,
  ).slice(0, n);
  const options = shuffleSeeded([correct, ...distractors], rand);
  return { options, correctIndex: options.indexOf(correct) };
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
}

/** Local day key YYYY-MM-DD (was UTC before v2). */
export { dayKey as todayKey, daysUntil } from './lib/dates';

export function formatMinutes(mins: number): string {
  if (mins < 60) return `${Math.round(mins)} min`;
  const h = Math.floor(mins / 60);
  const m = Math.round(mins % 60);
  return m > 0 ? `${h} h ${m} min` : `${h} h`;
}

export function percentOf(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function getMotivationalMessage(streakDays: number): string {
  if (streakDays === 0) return 'Začni dnes svůj streak! 💪';
  if (streakDays === 1) return 'Skvělý start! Pokračuj zítra! 🌱';
  if (streakDays < 7) return `${streakDays} dní v řadě! Jdeš na to! 🔥`;
  if (streakDays < 14) return `${streakDays} dní! Už je to návyk! ⭐`;
  if (streakDays < 30) return `${streakDays} dní! Neuvěřitelné! 🚀`;
  if (streakDays < 100) return `${streakDays} dní! Jsi legenda! 👑`;
  return `${streakDays} dní! Absolutní šampion! 🏆`;
}

export function getScoreColor(percent: number): string {
  if (percent >= 80) return '#22c55e';
  if (percent >= 60) return '#84cc16';
  if (percent >= 44) return '#eab308';
  if (percent >= 25) return '#f97316';
  return '#ef4444';
}

export function downloadFile(content: string, filename: string, type = 'application/json') {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Rough language guess for the `lang` attribute: Czech if the text has Czech diacritics. */
export function guessLang(text: string): 'cs' | 'en' {
  return /[ěščřžýáíéůúťďňĚŠČŘŽÝÁÍÉŮÚŤĎŇ]/.test(text) ? 'cs' : 'en';
}
