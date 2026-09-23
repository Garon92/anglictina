import { countLabel, recordActivity } from '../kit';
import { getAllSRSStates, getStats, getExamSessions, currentStreak, kvGet } from '../db';
import { daily, minutesOnDay } from '../progress';
import { dayKey } from './dates';

/**
 * Report progress to the shared g92 menu ("Pokračovat" card, per-app stats).
 * The progress bar shows today's share of the daily goal (motivating from day one),
 * the metric the number of words in spaced repetition.
 */
export async function reportActivity(): Promise<void> {
  try {
    const [srs, stats, exams, minutes, pendingExam] = await Promise.all([
      getAllSRSStates('vocab'),
      getStats(),
      getExamSessions(),
      minutesOnDay(dayKey()),
      kvGet<{ id: string }>('exam:current'),
    ]);
    const learned = srs.filter((s) => s.totalReviews > 0).length;
    const lastExam = exams
      .filter((e) => e.mode === 'full')
      .sort((a, b) => b.startedAt - a.startedAt)[0];
    const streak = currentStreak(stats);
    const note = pendingExam
      ? 'Rozpracovaný test'
      : lastExam
        ? `Poslední test: ${countLabel(lastExam.scoreTotal, 'bod', 'body', 'bodů')}`
        : streak > 1
          ? `Série ${countLabel(streak, 'den', 'dny', 'dní')}`
          : undefined;
    recordActivity('anglictina', {
      progress: Math.min(1, minutes / Math.max(1, daily.goal())),
      metric: { value: learned, unit: ['slovíčko', 'slovíčka', 'slovíček'] },
      note: note ?? null,
      href: pendingExam ? '/anglictina/exam' : null,
    });
  } catch {
    /* activity is best-effort */
  }
}
