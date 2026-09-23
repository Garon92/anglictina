import { useMemo, useRef, useState } from 'react';
import { CZECH_ERRORS, CZECH_ERROR_CATEGORIES, type CzechErrorEntry } from '../data/czechErrors';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import { speak } from '../tts';
import { SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';

/** Options exactly as stored for the mistakes queue. */
const OPTIONS = ['Správně', 'Špatně'];
const OK = 0;
const BAD = 1;

/** One card: the entry and which version of the sentence is shown. */
interface Round {
  ex: CzechErrorEntry;
  /** true → the correct sentence is shown, false → the wrong one. */
  showCorrect: boolean;
}

/** About half of the cards show the correct sentence, half the wrong one — random each round. */
function buildRounds(pool: CzechErrorEntry[], count: number): Round[] {
  const picked = shuffleArray(pool).slice(0, count);
  const nCorrect = picked.length % 2 === 0 ? picked.length / 2 : Math.floor(picked.length / 2) + (Math.random() < 0.5 ? 1 : 0);
  const flags = shuffleArray(picked.map((_, i) => i < nCorrect));
  return picked.map((ex, i) => ({ ex, showCorrect: flags[i] }));
}

export default function CzechErrorsDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(15);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const leaving = useRef(false);
  const session = useDrillSession('czech_errors', { tags: cats.length ? cats : ['all'] });

  const pool = useMemo(() => CZECH_ERRORS.filter((e) => !cats.length || cats.includes(e.category)), [cats]);
  const catCounts = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of CZECH_ERRORS) m.set(e.category, (m.get(e.category) ?? 0) + 1);
    return m;
  }, []);

  const round = rounds[idx];

  function resetItem() {
    setSelected(null);
    setResult(null);
  }

  function start() {
    if (!pool.length) return;
    setRounds(buildRounds(pool, count));
    setIdx(0);
    resetItem();
    leaving.current = false;
    session.start();
    setPhase('drill');
  }

  function choose(i: number) {
    if (!round || result !== null) return;
    const { ex, showCorrect } = round;
    const shown = showCorrect ? ex.correctEn : ex.wrongEn;
    const correctIndex = showCorrect ? OK : BAD;
    const correct = i === correctIndex;
    setSelected(i);
    setResult(correct);
    session.answer({
      itemId: `${ex.id}:${showCorrect ? 'ok' : 'bad'}`,
      category: ex.category,
      prompt: `Je tato věta správně? „${shown}“`,
      options: OPTIONS,
      kind: 'mcq',
      answer: OPTIONS[correctIndex],
      userAnswer: OPTIONS[i],
      explanation: `Chybně: ${ex.wrongEn} → Správně: ${ex.correctEn} ${ex.explanationCs}`,
      correct,
    });
  }

  async function showResult() {
    if (leaving.current) return;
    leaving.current = true;
    await session.finish();
    setPhase('result');
  }

  function next() {
    if (result === null || leaving.current) return;
    if (idx + 1 >= rounds.length) {
      void showResult();
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(result !== null ? { Enter: next, ' ': next } : {}, phase === 'drill');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Typické chyby Čechů"
        subtitle="Čeština nám podráží nohy. Poznáš, jestli je anglická věta správně, nebo v ní je typická česká chyba?"
        icon="🇨🇿"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
      >
        <FilterGroup label={`Kategorie${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CZECH_ERROR_CATEGORIES.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {c} <span className="text-xs opacity-70">({catCounts.get(c) ?? 0})</span>
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Nové kolo"
      >
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr</button>
        </div>
      </ResultScreen>
    );
  }

  if (!round) return null;
  const { ex, showCorrect } = round;
  const shown = showCorrect ? ex.correctEn : ex.wrongEn;
  const last = idx + 1 >= rounds.length;
  const revealed = result !== null;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={rounds.length} correct={session.correct} onExit={() => void showResult()} title="Typické chyby Čechů" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{ex.category}</span>
        </div>
        <p className="mb-2 text-sm font-bold text-muted">Je tato věta správně?</p>
        <p
          className={`mb-5 rounded-xl border p-4 text-xl leading-relaxed font-bold break-words text-fg ${
            revealed ? (showCorrect ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft') : 'border-border bg-surface-2'
          }`}
          lang="en"
        >
          {shown}
        </p>

        <OptionList
          options={OPTIONS}
          selected={selected}
          correctIndex={showCorrect ? OK : BAD}
          revealed={revealed}
          onSelect={choose}
          columns={2}
          lang="cs"
        />

        {revealed && (
          <Feedback correct={result}>
            <p className="mt-1 text-sm text-fg">
              {showCorrect ? 'Tahle věta byla v pořádku.' : 'V téhle větě byla typická česká chyba.'}
            </p>
            <div className="mt-3 space-y-2">
              <div className="flex items-start gap-2 rounded-lg bg-surface p-2.5">
                <span className="mt-0.5 font-black text-danger" aria-hidden="true">✗</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-danger">Chybně</div>
                  <div className="break-words text-fg line-through decoration-danger/60" lang="en">{ex.wrongEn}</div>
                </div>
              </div>
              <div className="flex items-start gap-2 rounded-lg bg-surface p-2.5">
                <span className="mt-0.5 font-black text-success" aria-hidden="true">✓</span>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-success">Správně</div>
                  <div className="font-bold break-words text-fg" lang="en">{ex.correctEn}</div>
                </div>
                <SpeakButton onClick={() => void speak(ex.correctEn, settings.ttsRate)} label={`Přehrát: ${ex.correctEn}`} />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted">
              Česky: <span className="font-bold text-fg">„{ex.czechSource}“</span>
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{ex.explanationCs}</p>
            <div className="mt-3 rounded-lg bg-surface p-2.5 text-sm">
              <div className="text-xs font-bold text-muted">Příklad</div>
              <div className="break-words text-fg italic" lang="en">{ex.example}</div>
              <div className="text-muted">{ex.exampleCs}</div>
            </div>
          </Feedback>
        )}
        {revealed && <NextButton onClick={next} last={last} />}
      </div>
    </div>
  );
}
