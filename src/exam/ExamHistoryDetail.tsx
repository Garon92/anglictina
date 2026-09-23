import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { getExamSession } from '../db';
import type { ExamSession } from '../types';
import ExamResults from './ExamResults';
import { scoreExam, emptyAnswers, type ExamAnswers } from './scoring';
import { getSet, EXAM_SETS } from './sets';
import { MODE_LABELS, partInfo, type PartNo } from './structure';

export default function ExamHistoryDetail() {
  const { id } = useParams();
  const [session, setSession] = useState<ExamSession | null | undefined>(undefined);

  useEffect(() => {
    const n = Number(id);
    if (!Number.isFinite(n)) {
      setSession(null);
      return;
    }
    getExamSession(n).then((s) => setSession(s ?? null)).catch(() => setSession(null));
  }, [id]);

  if (session === undefined) return <div className="page-container"><div className="skeleton h-48 w-full" /></div>;

  if (!session || !session.answers || !session.sources || !session.parts) {
    return (
      <div className="page-container py-10 text-center">
        <div className="mb-3 text-5xl" aria-hidden="true">🗂️</div>
        <h1 className="page-title">{session ? 'Rozbor není k dispozici' : 'Pokus nenalezen'}</h1>
        <p className="page-subtitle">{session ? 'U starších pokusů se odpovědi neukládaly.' : 'Takový výsledek v tomto zařízení není uložený.'}</p>
        <Link to="/exam" className="btn-primary">Zpět na přehled</Link>
      </div>
    );
  }

  const parts = session.parts as PartNo[];
  const sources = session.sources;
  const source = (p: PartNo) => getSet(sources[p - 1]) ?? EXAM_SETS[0];
  const answers = { ...emptyAnswers(), ...(session.answers as Partial<ExamAnswers>) };
  // Re-score with the current answer keys (data fixes apply retroactively).
  const score = scoreExam(parts, source, answers);
  const date = new Date(session.startedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' });
  const title = session.mode === 'part'
    ? partInfo(parts[0]).title
    : session.setId === 'mix' ? 'Mix ze všech sad' : getSet(session.setId ?? '')?.title ?? 'Cvičný test';

  return (
    <ExamResults
      score={score}
      parts={parts}
      source={source}
      answers={answers}
      title={title}
      subtitle={`${session.mode ? MODE_LABELS[session.mode as keyof typeof MODE_LABELS] ?? 'Test' : 'Test'} · ${date}`}
    />
  );
}
