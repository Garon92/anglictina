import { recordActivity } from '../kit';
import { getAllSRSStates, getStats, getExamSessions, currentStreak } from '../db';
import { daily, minutesOnDay } from '../progress';
import { dayKey } from './dates';

/**
 * Report progress to the shared g92 menu ("Pokračovat" card, per-app stats).
 * The progress bar shows today's share of the daily goal (motivating from day one),
 * the metric the number of words in spaced repetition.
 */
export async function reportActivity(): Promise<void> {
  try {
    const [srs, stats, exams, minutes] = await Promise.all([getAllSRSStates('vocab'), getStats(), getExamSessions(), minutesOnDay(dayKey())]);
    const learned = srs.filter((s) => s.totalReviews > 0).length;
    const lastExam = exams
      .filter((e) => e.mode === 'full')
      .sort((a, b) => b.startedAt - a.startedAt)[0];
    const streak = currentStreak(stats);
    const note = lastExam
      ? `Poslední test: ${lastExam.scoreTotal} b`
      : streak > 1
        ? `Série ${streak} dní`
        : undefined;
    recordActivity('anglictina', {
      progress: Math.min(1, minutes / Math.max(1, daily.goal())),
      metric: { label: 'Slovíček', value: learned },
      note: note ?? null,
    });
  } catch {
    /* activity is best-effort */
  }
}
