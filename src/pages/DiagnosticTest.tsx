import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { getStats, saveStats } from '../db';
import { DIAGNOSTIC_QUESTIONS, DIAGNOSTIC_SCORING } from '../data/diagnostic';
import type { DiagnosticQuestion } from '../data/diagnostic';
import { isAnswerCorrect } from '../lib/answer';
import { dayKey } from '../lib/dates';
import { formatDate } from '../utils';
import { getModule } from '../modules';
import { useKeyboard } from '../hooks/useKeyboard';
import { ModuleCard, ProgressBar } from '../components/ui';
import {
  useDrillSession, DrillSetup, DrillTopBar, OptionList, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Level = 'A1' | 'A2' | 'B1';
type Skill = 'vocab' | 'grammar' | 'reading';
type Phase = 'intro' | 'test' | 'results';
type ScoreEntry = { date: string; score: number; maxScore: number };

interface Answer {
  correct: boolean;
  points: number;
}

const LEVELS: Level[] = ['A1', 'A2', 'B1'];
const SKILLS: Skill[] = ['vocab', 'grammar', 'reading'];

const LEVEL_BADGE: Record<Level, string> = {
  A1: '!bg-success-soft !text-success',
  A2: '!bg-info-soft !text-info',
  B1: '!bg-accent-soft !text-accent-text',
};

const LEVEL_EMOJI: Record<Level, string> = { A1: '🌱', A2: '📘', B1: '🎓' };

const LEVEL_DESC: Record<Level, string> = {
  A1: 'Začátečník — zvládáš základní slovíčka a jednoduché věty.',
  A2: 'Mírně pokročilý/á — domluvíš se v běžných situacích.',
  B1: 'Středně pokročilý/á — to je úroveň maturity. Teď jde o jistotu a detaily.',
};

const SKILL_LABELS: Record<Skill, string> = {
  vocab: 'Slovíčka',
  grammar: 'Gramatika',
  reading: 'Čtení',
};

const SKILL_ADVICE: Record<Skill, string> = {
  vocab: 'Nejvíc ti pomůže rozšiřovat slovní zásobu — pár minut slovíček denně udělá hodně.',
  grammar: 'Nejvíc ti pomůže procvičovat gramatiku — začni tématy, která doporučujeme níže.',
  reading: 'Nejvíc ti pomůže číst a poslouchat anglické texty a hledat v nich hlavní myšlenku.',
};

/** Module ids (src/modules.ts) recommended for a weak skill at a given level. */
const RECOMMENDED: Record<Skill, Record<Level, string[]>> = {
  vocab: {
    A1: ['vocab', 'vocab_topics', 'matching'],
    A2: ['vocab', 'vocab_topics', 'phrasal_verbs'],
    B1: ['vocab', 'confusables', 'word_formation'],
  },
  grammar: {
    A1: ['articles', 'grammar', 'irregular_verbs'],
    A2: ['grammar', 'prepositions', 'irregular_verbs'],
    B1: ['conditionals', 'passive_voice', 'reported_speech'],
  },
  reading: {
    A1: ['reading', 'listening', 'vocab_topics'],
    A2: ['reading', 'listening', 'word_order'],
    B1: ['reading', 'listening', 'sentence_transform'],
  },
};

/** Balanced skills: next steps for each level. */
const NEXT_STEPS: Record<Level, string[]> = {
  A1: ['grammar', 'vocab', 'reading'],
  A2: ['reading', 'grammar', 'phrasal_verbs'],
  B1: ['sentence_transform', 'word_formation', 'reading'],
};

function correctAnswer(q: DiagnosticQuestion): string {
  if (q.type === 'mcq') return q.options?.[q.answerIndex ?? -1] ?? '';
  return q.answer ?? '';
}

function LevelBadge({ level, big = false }: { level: Level; big?: boolean }) {
  return <span className={`badge ${LEVEL_BADGE[level]} ${big ? '!px-4 !py-1.5 !text-2xl !font-black' : ''}`}>{level}</span>;
}

function DiffBadge({ diff }: { diff: number }) {
  if (diff === 0) return <span className="text-xs font-bold text-muted">±0 b.</span>;
  return (
    <span className={`text-xs font-bold ${diff > 0 ? 'text-success' : 'text-danger'}`}>
      {diff > 0 ? '+' : '−'}
      {Math.abs(diff)} b.
    </span>
  );
}

function safeDate(key: string) {
  const d = new Date(`${key}T12:00:00`);
  return Number.isNaN(d.getTime()) ? key : formatDate(d);
}

export default function DiagnosticTest() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [history, setHistory] = useState<ScoreEntry[]>([]);
  /** The test taken right before the current one (for "Oproti minule"). */
  const [previous, setPrevious] = useState<ScoreEntry | null>(null);
  const [complete, setComplete] = useState(false);
  const savedRef = useRef(false);
  const answersRef = useRef<Record<string, Answer>>({});
  const session = useDrillSession('diagnostic');

  const total = DIAGNOSTIC_QUESTIONS.length;
  const q = DIAGNOSTIC_QUESTIONS[idx];

  useEffect(() => {
    let alive = true;
    getStats()
      .then((stats) => {
        if (alive) setHistory(Array.isArray(stats.diagnosticScores) ? stats.diagnosticScores : []);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  function resetItem() {
    setSelected(null);
    setText('');
    setResult(null);
  }

  function start() {
    setIdx(0);
    resetItem();
    setAnswers({});
    answersRef.current = {};
    setComplete(false);
    setPrevious(null);
    savedRef.current = false;
    session.start();
    setPhase('test');
    window.scrollTo({ top: 0 });
  }

  function submit(opt?: number) {
    if (!q || result !== null) return;
    let user: string;
    let correct: boolean;
    if (q.type === 'mcq' && q.options) {
      if (opt === undefined) return;
      setSelected(opt);
      user = q.options[opt];
      correct = opt === q.answerIndex;
    } else {
      user = text.trim();
      if (!user) return;
      correct = isAnswerCorrect(user, q.answer ?? '');
    }
    const a: Answer = { correct, points: correct ? DIAGNOSTIC_SCORING.pointsPerLevel[q.level] : 0 };
    answersRef.current = { ...answersRef.current, [q.id]: a };
    setAnswers(answersRef.current);
    setResult(correct);
    session.answer({
      itemId: q.id,
      category: q.skill,
      prompt: q.question,
      options: q.type === 'mcq' ? q.options : undefined,
      kind: q.type === 'mcq' ? 'mcq' : 'text',
      answer: correctAnswer(q),
      userAnswer: user,
      explanation: q.explanationCs,
      correct,
      // A placement test should not flood the mistakes queue.
      noTrack: true,
    });
  }

  async function finish(full: boolean) {
    await session.finish();
    if (full && !savedRef.current) {
      savedRef.current = true;
      const score = Object.values(answersRef.current).reduce((s, a) => s + a.points, 0);
      const entry: ScoreEntry = { date: dayKey(), score, maxScore: DIAGNOSTIC_SCORING.maxPoints };
      setPrevious(history.length ? history[history.length - 1] : null);
      setHistory((h) => [...h, entry]);
      try {
        // Sequential after session.finish() — both update the same stats record.
        const stats = await getStats();
        stats.diagnosticScores = [...(stats.diagnosticScores ?? []), entry];
        await saveStats(stats);
      } catch (e) {
        console.warn('saving diagnostic score failed', e);
      }
    }
    setComplete(full);
    setPhase('results');
    window.scrollTo({ top: 0 });
  }

  async function next() {
    if (idx + 1 >= total) await finish(true);
    else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'test');

  /* ─── Intro ──────────────────────────────────────────────────────── */
  if (phase === 'intro') {
    const recent = history.slice(-5);
    const offset = history.length - recent.length;
    return (
      <DrillSetup
        title="Rozřazovací test"
        subtitle="Zjisti svou aktuální úroveň angličtiny (A1–B1)."
        icon="🩺"
        onStart={start}
        startLabel={history.length ? 'Začít test znovu' : 'Začít test'}
        footer={
          history.length > 0 && (
            <section className="card !p-4" aria-labelledby="diag-history">
              <h2 id="diag-history" className="section-title">
                Historie testů
              </h2>
              <ul className="divide-y divide-border">
                {recent.map((s, i) => {
                  const lvl = DIAGNOSTIC_SCORING.getLevel(s.score);
                  const pct = s.maxScore > 0 ? Math.round((s.score / s.maxScore) * 100) : 0;
                  const prev = history[offset + i - 1];
                  return (
                    <li key={`${s.date}-${offset + i}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm">
                      <span className="min-w-0 flex-1 text-fg">{safeDate(s.date)}</span>
                      <LevelBadge level={lvl} />
                      <span className="w-20 text-right tabular-nums text-muted">
                        {s.score}/{s.maxScore} b.
                      </span>
                      <span className="w-12 text-right tabular-nums text-muted">{pct} %</span>
                      <span className="w-14 text-right">{prev ? <DiffBadge diff={s.score - prev.score} /> : null}</span>
                    </li>
                  );
                })}
              </ul>
            </section>
          )
        }
      >
        <div className="space-y-3 text-sm leading-relaxed text-fg">
          <p>
            Test má <strong>{total} otázek</strong> se stoupající obtížností — slovíčka, gramatika i čtení. Zabere asi 10–15 minut.
          </p>
          <ul className="grid gap-2 sm:grid-cols-3">
            {LEVELS.map((l) => (
              <li key={l} className="flex items-center gap-2 rounded-xl bg-surface-2 px-3 py-2">
                <LevelBadge level={l} />
                <span className="text-muted">
                  {DIAGNOSTIC_SCORING.pointsPerLevel[l]} {DIAGNOSTIC_SCORING.pointsPerLevel[l] === 1 ? 'bod' : 'body'} za otázku
                </span>
              </li>
            ))}
          </ul>
          <p className="text-muted">
            Po každé otázce uvidíš správnou odpověď s vysvětlením. Na konci se dozvíš svou úroveň a co procvičovat dál. Nic se neděje, když něco nevíš — test
            má ukázat, kde právě jsi.
          </p>
        </div>
      </DrillSetup>
    );
  }

  /* ─── Results ────────────────────────────────────────────────────── */
  if (phase === 'results') {
    const score = Object.values(answers).reduce((s, a) => s + a.points, 0);
    const level = DIAGNOSTIC_SCORING.getLevel(score);
    const answeredCount = Object.keys(answers).length;
    const breakdown = (pred: (x: DiagnosticQuestion) => boolean) => {
      const qs = DIAGNOSTIC_QUESTIONS.filter(pred);
      return { correct: qs.filter((x) => answers[x.id]?.correct).length, total: qs.length };
    };
    const bySkill = SKILLS.map((s) => ({ skill: s, ...breakdown((x) => x.skill === s) }))
      .map((s) => ({ ...s, pct: s.total ? s.correct / s.total : 0 }));
    const weakest = [...bySkill].sort((a, b) => a.pct - b.pct)[0];
    const balanced = weakest.pct >= 0.8;
    const recIds = balanced ? NEXT_STEPS[level] : RECOMMENDED[weakest.skill][level];
    const recommended = recIds.map((id) => getModule(id)).filter((m) => m !== undefined);

    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Udělat test znovu"
        title={complete ? 'Test dokončen' : 'Test nedokončen'}
      >
        {complete ? (
          <>
            <section className="card mt-5 !p-5 text-center" aria-labelledby="diag-level">
              <div className="text-4xl" aria-hidden="true">
                {LEVEL_EMOJI[level]}
              </div>
              <h2 id="diag-level" className="mt-2 flex flex-wrap items-center justify-center gap-2 text-xl font-black text-fg">
                Tvoje úroveň: <LevelBadge level={level} big />
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted">{LEVEL_DESC[level]}</p>
              <p className="mt-3 text-2xl font-black tabular-nums text-fg">
                {score}
                <span className="text-base text-muted"> / {DIAGNOSTIC_SCORING.maxPoints} bodů</span>
              </p>
              {previous && (
                <p className="mt-1 text-sm text-muted">
                  Oproti minule ({safeDate(previous.date)}, {DIAGNOSTIC_SCORING.getLevel(previous.score)}):{' '}
                  <DiffBadge diff={score - previous.score} />
                </p>
              )}
            </section>

            <section className="card mt-4 !p-5" aria-labelledby="diag-by-level">
              <h2 id="diag-by-level" className="section-title">
                Podle úrovně otázek
              </h2>
              <ul className="space-y-3">
                {LEVELS.map((l) => {
                  const b = breakdown((x) => x.level === l);
                  return (
                    <li key={l}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="flex items-center gap-2 font-bold text-fg">
                          <LevelBadge level={l} /> otázky
                        </span>
                        <span className="tabular-nums text-muted">
                          {b.correct}/{b.total} správně
                        </span>
                      </div>
                      <ProgressBar value={b.correct} max={b.total} label={`${l}: ${b.correct} z ${b.total}`} />
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className="card mt-4 !p-5" aria-labelledby="diag-by-skill">
              <h2 id="diag-by-skill" className="section-title">
                Podle dovednosti
              </h2>
              <ul className="space-y-3">
                {bySkill.map((s) => (
                  <li key={s.skill}>
                    <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                      <span className="font-bold text-fg">{SKILL_LABELS[s.skill]}</span>
                      <span className="tabular-nums text-muted">
                        {s.correct}/{s.total} ({Math.round(s.pct * 100)} %)
                      </span>
                    </div>
                    <ProgressBar
                      value={s.correct}
                      max={s.total}
                      tone={s.pct >= 0.7 ? 'success' : s.pct >= 0.4 ? 'warning' : 'danger'}
                      label={`${SKILL_LABELS[s.skill]}: ${Math.round(s.pct * 100)} %`}
                    />
                  </li>
                ))}
              </ul>
            </section>

            <section className="mt-4" aria-labelledby="diag-next">
              <div className="feedback feedback--info">
                <h2 id="diag-next" className="font-black text-fg">
                  <span aria-hidden="true">💡 </span>Co dál?
                </h2>
                <p className="mt-1 text-sm text-fg">
                  {balanced
                    ? 'Skvělá práce! Máš vyrovnané znalosti ve všech oblastech. Tady je pár tipů, jak se posunout dál:'
                    : SKILL_ADVICE[weakest.skill]}
                </p>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {recommended.map((m) => (
                  <ModuleCard key={m.id} to={m.path} icon={m.icon} title={m.title} desc={m.desc} />
                ))}
                {level === 'B1' && <ModuleCard to="/exam" icon="🎯" title="Simulace maturity" desc="Vyzkoušej si celý didaktický test" />}
                <ModuleCard to="/study-plan" icon="📅" title="Studijní plán" desc="Týdenní rozvrh do maturity" />
              </div>
            </section>
          </>
        ) : (
          <div className="card mt-5 !p-4 text-sm text-muted">
            Zodpovězeno {answeredCount} z {total} otázek. Úroveň spočítáme, až projdeš celý test — tenhle pokus se do historie neuložil.
          </div>
        )}
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/review">Zobrazit celkový pokrok</Link>
        </p>
      </ResultScreen>
    );
  }

  /* ─── Test ───────────────────────────────────────────────────────── */
  if (!q) return null;
  const last = idx + 1 >= total;

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={total}
        correct={session.correct}
        onExit={() => void finish(false)}
        title="Rozřazovací test"
        extra={<LevelBadge level={q.level} />}
      />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{SKILL_LABELS[q.skill]}</span>
          <span className="text-xs text-muted">
            {DIAGNOSTIC_SCORING.pointsPerLevel[q.level]} {DIAGNOSTIC_SCORING.pointsPerLevel[q.level] === 1 ? 'bod' : 'body'}
          </span>
        </div>
        {q.type === 'fill' && <p className="mb-1 text-sm font-bold text-muted">Doplň chybějící slovo:</p>}
        <p className="mb-4 text-lg leading-relaxed font-bold break-words text-fg" lang="en">
          {q.question}
        </p>

        {q.type === 'mcq' && q.options ? (
          <OptionList
            key={q.id}
            options={q.options}
            selected={selected}
            correctIndex={q.answerIndex ?? -1}
            revealed={result !== null}
            onSelect={(i) => submit(i)}
          />
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <TextAnswer
                key={q.id}
                value={text}
                onChange={setText}
                onSubmit={() => submit()}
                disabled={result !== null}
                status={result === null ? null : result ? 'correct' : 'wrong'}
              />
            </div>
            {result === null && (
              <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={() => submit()}>
                Ověřit
              </button>
            )}
          </div>
        )}

        {result !== null && (
          <Feedback
            correct={result}
            answer={correctAnswer(q)}
            userAnswer={q.type === 'fill' ? text.trim() : undefined}
            explanation={q.explanationCs}
          />
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
