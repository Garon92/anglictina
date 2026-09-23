import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { buildOptions, shuffleArray, uniqueBy } from '../utils';
import { createStore, isDialogOpen } from '../kit';
import { useKeyboard } from '../hooks/useKeyboard';
import { StatTile } from '../components/ui';
import {
  useDrillSession, DrillSetup, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'game' | 'result';

interface SpeedQuestion {
  id: string;
  type: 'vocab' | 'grammar';
  instruction?: string;
  prompt: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

interface Answered {
  correct: boolean;
  seconds: number;
  points: number;
}

const QUESTION_COUNT = 20;
const LIMIT_MS = 10_000;
const TICK_MS = 100;

const store = createStore('anglictina-speed', { version: 1, defaults: { best: 0 } });

const norm = (s: string) => s.trim().toLowerCase();

/** Points for a correct answer: 10 + one bonus point for every whole second left. */
function pointsFor(msLeft: number) {
  return 10 + Math.max(0, Math.floor(msLeft / 1000));
}

function generateQuestions(): SpeedQuestion[] {
  const out: SpeedQuestion[] = [];
  const allCs = VOCABULARY.map((w) => w.cs);
  const words = uniqueBy(shuffleArray(VOCABULARY.filter((w) => w.example && w.cs && w.en)), (w) => norm(w.en)).slice(0, QUESTION_COUNT / 2);
  for (const w of words) {
    const same = new Set(VOCABULARY.filter((v) => norm(v.en) === norm(w.en)).map((v) => norm(v.cs)));
    const { options, correctIndex } = buildOptions(w.cs, allCs.filter((c) => !same.has(norm(c))));
    out.push({
      id: `vocab:${w.id}`,
      type: 'vocab',
      instruction: 'Co znamená:',
      prompt: w.en,
      question: `Co znamená „${w.en}“?`,
      options,
      correctIndex,
    });
  }
  for (const e of shuffleArray(GRAMMAR_EXERCISES.filter((x) => x.type === 'mcq' && x.options))) {
    if (out.length >= QUESTION_COUNT) break;
    const options = uniqueBy(e.options!, norm);
    const correctIndex = options.indexOf(e.answer);
    if (options.length < 3 || correctIndex < 0) continue;
    out.push({ id: `grammar:${e.id}`, type: 'grammar', prompt: e.prompt, question: e.prompt, options, correctIndex, explanation: e.explanationCs });
  }
  return shuffleArray(out);
}

function Countdown({ msLeft }: { msLeft: number }) {
  const pct = Math.max(0, Math.min(100, (msLeft / LIMIT_MS) * 100));
  const secs = Math.ceil(msLeft / 1000);
  const color = msLeft > 5000 ? 'var(--g92-success)' : msLeft > 2500 ? 'var(--g92-warning)' : 'var(--g92-danger)';
  return (
    <div className="mb-4 flex items-center gap-3">
      <div
        className="bar flex-1 !h-3"
        role="progressbar"
        aria-label="Zbývající čas"
        aria-valuemin={0}
        aria-valuemax={LIMIT_MS / 1000}
        aria-valuenow={secs}
      >
        <span style={{ width: `${pct}%`, background: color, transition: `width ${TICK_MS}ms linear, background-color 300ms` }} />
      </div>
      <span
        className={`w-12 text-right text-lg font-black tabular-nums ${msLeft <= 3000 ? 'text-danger' : 'text-fg'}`}
        aria-hidden="true"
      >
        {secs} s
      </span>
    </div>
  );
}

export default function SpeedChallenge() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [questions, setQuestions] = useState<SpeedQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [timedOut, setTimedOut] = useState(false);
  const [msLeft, setMsLeft] = useState(LIMIT_MS);
  const [answered, setAnswered] = useState<Answered[]>([]);
  const [best, setBest] = useState(() => store.get('best'));
  const [newBest, setNewBest] = useState(false);
  const [complete, setComplete] = useState(false);
  const deadline = useRef(0);
  const answeredRef = useRef<Answered[]>([]);
  const session = useDrillSession('speed');

  const q = questions[idx];

  function beginQuestion() {
    deadline.current = Date.now() + LIMIT_MS;
    setMsLeft(LIMIT_MS);
    setSelected(null);
    setResult(null);
    setTimedOut(false);
  }

  function start() {
    setQuestions(generateQuestions());
    setIdx(0);
    answeredRef.current = [];
    setAnswered([]);
    setNewBest(false);
    setComplete(false);
    session.start();
    beginQuestion();
    setPhase('game');
  }

  /** Register an answer (`opt === null` = time ran out). Pauses the timer until "Další". */
  function answer(opt: number | null) {
    if (!q || result !== null || phase !== 'game') return;
    const left = Math.max(0, deadline.current - Date.now());
    const correct = opt !== null && opt === q.correctIndex;
    const rec: Answered = { correct, seconds: (LIMIT_MS - left) / 1000, points: correct ? pointsFor(left) : 0 };
    answeredRef.current = [...answeredRef.current, rec];
    setAnswered(answeredRef.current);
    setMsLeft(left);
    setSelected(opt);
    setTimedOut(opt === null);
    setResult(correct);
    session.answer({
      itemId: q.id,
      category: q.type,
      prompt: q.question,
      options: q.options,
      kind: 'mcq',
      answer: q.options[q.correctIndex],
      userAnswer: opt === null ? '(čas vypršel)' : q.options[opt],
      explanation: q.explanation,
      correct,
    });
  }
  const onTimeout = useEffectEvent(() => answer(null));

  // Switching tabs/apps pauses the question: the remaining time is kept and the deadline moved.
  useEffect(() => {
    if (phase !== 'game' || result !== null) return;
    let hiddenLeft: number | null = null;
    const onVis = () => {
      if (document.hidden) hiddenLeft = Math.max(0, deadline.current - Date.now());
      else if (hiddenLeft !== null) {
        deadline.current = Date.now() + hiddenLeft;
        hiddenLeft = null;
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [phase, idx, result]);

  // Deadline-based countdown; runs only while a question is open (paused during feedback).
  useEffect(() => {
    if (phase !== 'game' || result !== null) return;
    let lastTick = Date.now();
    const id = window.setInterval(() => {
      const now = Date.now();
      const dt = now - lastTick;
      lastTick = now;
      if (document.hidden) return; // paused (see above)
      // An open dialog (e.g. "Ukončit cvičení?") also stops the clock.
      if (isDialogOpen()) {
        deadline.current += dt;
        return;
      }
      const left = deadline.current - Date.now();
      if (left <= 0) {
        window.clearInterval(id);
        onTimeout();
      } else {
        setMsLeft(left);
      }
    }, TICK_MS);
    return () => window.clearInterval(id);
  }, [phase, idx, result]);

  async function finish(full: boolean) {
    await session.finish();
    if (full) {
      const score = answeredRef.current.reduce((s, a) => s + a.points, 0);
      const r = store.submitBest('best', score);
      setBest(r.best);
      setNewBest(r.isNewBest && score > 0);
    }
    setComplete(full);
    setPhase('result');
  }

  async function next() {
    if (idx + 1 >= questions.length) await finish(true);
    else {
      setIdx(idx + 1);
      beginQuestion();
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'game');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Rychlovka"
        subtitle={`${QUESTION_COUNT} otázek, na každou 10 sekund. Mix slovíček a gramatiky — bez dlouhého přemýšlení!`}
        icon="⏱️"
        onStart={start}
        startLabel="Start!"
      >
        <ul className="space-y-2 text-sm text-fg">
          <li className="flex gap-2">
            <span aria-hidden="true">⏱️</span>
            <span>Čas běží jen při otázce — po odpovědi se zastaví, takže si v klidu přečteš vysvětlení.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">⭐</span>
            <span>Za správnou odpověď 10 bodů + 1 bod za každou ušetřenou sekundu.</span>
          </li>
          <li className="flex gap-2">
            <span aria-hidden="true">⌨️</span>
            <span>Na počítači můžeš odpovídat klávesami 1–4 a pokračovat Enterem.</span>
          </li>
        </ul>
        {best > 0 && (
          <p className="rounded-xl bg-surface-2 px-3 py-2 text-sm text-muted">
            Tvůj rekord: <strong className="text-fg tabular-nums">{best} bodů</strong>
          </p>
        )}
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    const score = answered.reduce((s, a) => s + a.points, 0);
    const totalTime = answered.reduce((s, a) => s + a.seconds, 0);
    const avg = answered.length ? totalTime / answered.length : 0;
    const correctTimes = answered.filter((a) => a.correct).map((a) => a.seconds);
    const fastest = correctTimes.length ? Math.min(...correctTimes) : null;
    const timeouts = answered.filter((a) => a.seconds >= LIMIT_MS / 1000 && !a.correct).length;
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Hrát znovu"
        title={newBest ? 'Nový rekord!' : undefined}
      >
        {answered.length > 0 && (
          <section className="mt-5" aria-label="Statistiky">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatTile value={score} label="bodů" icon="⭐" tone="accent" />
              <StatTile value={`${totalTime.toFixed(1)} s`} label="celkový čas" icon="⏱️" />
              <StatTile value={`${avg.toFixed(1)} s`} label="průměr na otázku" icon="📊" />
              <StatTile value={fastest !== null ? `${fastest.toFixed(1)} s` : '–'} label="nejrychlejší správně" icon="⚡" tone="success" />
            </div>
            <p className="mt-3 text-center text-sm text-muted">
              {complete
                ? newBest
                  ? 'Překonal/a jsi svůj rekord — skvělé!'
                  : `Tvůj rekord: ${best} bodů.`
                : 'Kolo nebylo dokončené, takže se do rekordu nepočítá.'}
              {timeouts > 0 && ` Čas vypršel u ${timeouts} ${timeouts === 1 ? 'otázky' : 'otázek'}.`}
            </p>
          </section>
        )}
      </ResultScreen>
    );
  }

  if (!q) return null;
  const last = idx + 1 >= questions.length;
  const score = answered.reduce((s, a) => s + a.points, 0);

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={questions.length}
        correct={session.correct}
        onExit={() => void finish(false)}
        title="Rychlovka"
        extra={<span className="badge !bg-accent-soft !text-accent-text tabular-nums">⭐ {score}</span>}
      />
      <Countdown msLeft={msLeft} />

      <div className="card !p-5">
        <div className="mb-3">
          <span className={`badge ${q.type === 'vocab' ? '!bg-info-soft !text-info' : '!bg-accent-soft !text-accent-text'}`}>
            {q.type === 'vocab' ? 'Slovíčko' : 'Gramatika'}
          </span>
        </div>
        {q.instruction && <p className="mb-1 text-sm font-bold text-muted">{q.instruction}</p>}
        <p className="mb-4 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
          {q.prompt}
        </p>
        <OptionList
          key={q.id}
          options={q.options}
          selected={selected}
          correctIndex={q.correctIndex}
          revealed={result !== null}
          onSelect={(i) => answer(i)}
          columns={2}
          lang={q.type === 'vocab' ? 'cs' : 'en'}
        />
        {result !== null && (
          <Feedback
            correct={result}
            answer={q.options[q.correctIndex]}
            title={timedOut ? 'Čas vypršel' : result ? `Správně! +${answered[answered.length - 1]?.points ?? 0} bodů` : undefined}
            explanation={q.explanation}
          />
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
