import { useState } from 'react';
import { Link } from 'react-router';
import type { ExamSet } from './types';
import type { ExamAnswers, ExamScore } from './scoring';
import { subtestPct } from './scoring';
import { partInfo, PASS_RATIO, SUBTESTS, type PartNo, type Subtest } from './structure';
import PartView from './PartViews';
import { Stars, ProgressBar } from '../components/ui';
import { ScoreScale } from '../pages/Dashboard';

export default function ExamResults({
  score,
  parts,
  source,
  answers,
  title,
  subtitle,
  onRetry,
  practice,
}: {
  score: ExamScore;
  parts: PartNo[];
  source: (p: PartNo) => ExamSet;
  answers: ExamAnswers;
  title: string;
  subtitle?: string;
  onRetry?: () => void;
  practice?: boolean;
}) {
  const [reviewPart, setReviewPart] = useState<PartNo | null>(null);
  const pct = Math.round(score.ratio * 100);
  const full = score.max === 100;
  const stars = score.ratio >= 0.85 ? 3 : score.ratio >= 0.65 ? 2 : score.ratio >= PASS_RATIO ? 1 : 0;

  if (reviewPart !== null) {
    const info = partInfo(reviewPart);
    const idx = parts.indexOf(reviewPart);
    return (
      <div className="page-container page-container--wide">
        <button type="button" className="btn-ghost btn-sm -ml-2 mb-3" onClick={() => setReviewPart(null)}>
          ‹ Zpět na výsledek
        </button>
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <span className="tile-icon" aria-hidden="true">{info.icon}</span>
          <div className="min-w-0 flex-1">
            <div className="eyebrow">Rozbor · Část {reviewPart}</div>
            <h1 className="text-xl font-black text-fg">{info.title}</h1>
          </div>
          <span className="badge !text-sm">{score.parts[idx]?.points ?? 0} / {score.parts[idx]?.max ?? 0} b</span>
        </div>
        <PartView part={reviewPart} set={source(reviewPart)} answers={answers} onChange={() => {}} review practice plays={{}} onPlay={() => {}} />
        <div className="mt-6 flex flex-wrap justify-between gap-3">
          <button type="button" className="btn-secondary" disabled={idx <= 0} onClick={() => setReviewPart(parts[idx - 1])}>‹ Předchozí část</button>
          {idx < parts.length - 1 ? (
            <button type="button" className="btn-primary" onClick={() => { setReviewPart(parts[idx + 1]); window.scrollTo({ top: 0 }); }}>Další část ›</button>
          ) : (
            <button type="button" className="btn-primary" onClick={() => setReviewPart(null)}>Hotovo</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="page-container page-container--wide">
      <section className="card g92-card--accent !p-6 text-center">
        <div className="eyebrow">{subtitle ?? 'Výsledek'}</div>
        <h1 className="mt-1 text-2xl font-black text-fg">{title}</h1>
        <div className="mt-3"><Stars count={stars} size="lg" animate /></div>
        <div className="mt-2 text-5xl font-black tabular-nums text-fg">
          {score.points}<span className="text-2xl text-muted"> / {score.max} {full ? 'bodů' : 'b'}</span>
        </div>
        <div className={`mt-2 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black ${score.passed ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>
          {score.passed ? '✓ Nad hranicí úspěšnosti' : '✗ Pod hranicí úspěšnosti'} ({pct} % · hranice 44 %)
        </div>
        <div className="mx-auto mt-3 max-w-md">
          <ScoreScale score={pct} />
        </div>
        <p className="mx-auto mt-6 max-w-md text-sm text-muted">
          {score.passed
            ? pct >= 80
              ? 'Výborný výsledek! Takhle u maturity nemusíš mít strach.'
              : 'Prošel/prošla bys. Projdi si chyby a zkus další sadu — každý bod rezervy se hodí.'
            : 'Zatím pod hranicí. Podívej se, ve kterých částech ztrácíš nejvíc bodů, a zaměř se na ně.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button type="button" className="btn-primary btn-lg" onClick={() => setReviewPart(parts[0])}>Projít odpovědi</button>
          {onRetry && <button type="button" className="btn-secondary btn-lg" onClick={onRetry}>{practice ? 'Jiná sada' : 'Nový test'}</button>}
          <Link to="/exam" className="btn-ghost btn-lg">Zpět na přehled</Link>
        </div>
      </section>

      {parts.length > 1 && (
        <section className="mt-5 grid gap-3 sm:grid-cols-3">
          {(Object.keys(SUBTESTS) as Subtest[]).filter((k) => score.bySubtest[k].max > 0).map((k) => {
            const s = score.bySubtest[k];
            const p = subtestPct(s);
            return (
              <div key={k} className="card !p-4">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-bold text-fg">{SUBTESTS[k].icon} {SUBTESTS[k].title}</span>
                  <span className="text-sm font-black tabular-nums text-fg">{s.points}/{s.max}</span>
                </div>
                <ProgressBar value={p} max={100} tone={p >= 70 ? 'success' : p >= 44 ? 'warning' : 'danger'} label={SUBTESTS[k].title} />
              </div>
            );
          })}
        </section>
      )}

      <section className="mt-5">
        <h2 className="section-title">Podle částí</h2>
        <ul className="grid gap-2 sm:grid-cols-2">
          {score.parts.map((s) => {
            const info = partInfo(s.part);
            const r = s.max ? s.points / s.max : 0;
            return (
              <li key={s.part} className="min-w-0">
                <button type="button" className="card card-link flex w-full items-center gap-3 !p-3 text-left" onClick={() => setReviewPart(s.part)}>
                  <span className="tile-icon" aria-hidden="true">{info.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-xs font-bold text-muted">Část {s.part}</span>
                    <span className="block truncate font-bold text-fg">{info.title}</span>
                    <ProgressBar value={r} className="mt-1 !h-1.5" tone={r >= 0.7 ? 'success' : r >= 0.44 ? 'warning' : 'danger'} label={info.title} />
                  </span>
                  <span className="text-sm font-black tabular-nums text-fg">{s.points}/{s.max}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
