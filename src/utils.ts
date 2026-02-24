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

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' });
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / 86400000);
}

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
