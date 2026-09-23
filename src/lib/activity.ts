import { recordActivity } from '../kit';
import { getAllSRSStates, getStats, getExamSessions, currentStreak } from '../db';
import { VOCAB_TOTAL } from '../data/vocabMeta';

/** Report progress to the shared g92 menu ("Pokračovat" card, per-app stats). */
export async function reportActivity(): Promise<void> {
  try {
    const [srs, stats, exams] = await Promise.all([getAllSRSStates('vocab'), getStats(), getExamSessions()]);
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
      progress: Math.min(1, learned / VOCAB_TOTAL),
      metric: { label: 'Slovíček', value: learned },
      note: note ?? null,
    });
  } catch {
    /* activity is best-effort */
  }
}
