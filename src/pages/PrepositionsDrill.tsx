import { useMemo, useRef, useState } from 'react';
import { PREPOSITION_EXERCISES, PREPOSITION_CATEGORIES } from '../data/prepositions';
import type { PrepositionExercise } from '../data/prepositions';
import { shuffleArray, uniqueBy } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
type Level = (typeof LEVELS)[number];
const CATEGORY_KEYS = Object.keys(PREPOSITION_CATEGORIES);

/** One exercise with its answer options shuffled once when the round is built. */
interface Round {
  ex: PrepositionExercise;
  options: string[];
  correctIndex: number;
}

const norm = (s: string) => s.trim().toLowerCase();

function buildRound(ex: PrepositionExercise): Round {
  const unique = uniqueBy(ex.options, norm);
  if (!unique.some((o) => norm(o) === norm(ex.answer))) unique.push(ex.answer);
  const options = shuffleArray(unique);
  return { ex, options, correctIndex: options.findIndex((o) => norm(o) === norm(ex.answer)) };
}

export default function PrepositionsDrill() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [cats, setCats] = useState<string[]>([]);
  const [level, setLevel] = useState<Level>('all');
  const [count, setCount] = useState(20);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const leaving = useRef(false);
  const session = useDrillSession('prepositions', { tags: cats.length ? cats : ['all'] });

  const pool = useMemo(
    () => PREPOSITION_EXERCISES.filter((e) => (!cats.length || cats.includes(e.category)) && (level === 'all' || e.level === level)),
    [cats, level],
  );

  const round = rounds[idx];

  function resetItem() {
    setSelected(null);
    setResult(null);
  }

  function start() {
    if (!pool.length) return;
    setRounds(shuffleArray(pool).slice(0, count).map(buildRound));
    setIdx(0);
    resetItem();
    leaving.current = false;
    session.start();
    setPhase('drill');
  }

  function choose(i: number) {
    if (!round || result !== null) return;
    const { ex, options, correctIndex } = round;
    const correct = i === correctIndex;
    setSelected(i);
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: ex.sentence,
      options,
      kind: 'mcq',
      answer: options[correctIndex],
      userAnswer: options[i],
      explanation: ex.explanationCs,
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
        title="Předložky"
        subtitle="in, on, at a další — jedna z největších pastí angličtiny. Vyber si oblast, nebo nech mix ze všeho."
        icon="📌"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Kategorie${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORY_KEYS.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              <span className="whitespace-normal text-left">{PREPOSITION_CATEGORIES[c]}</span>
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
  const { ex, options, correctIndex } = round;
  const last = idx + 1 >= rounds.length;
  const parts = ex.sentence.split(/_{3,}/);

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={rounds.length} correct={session.correct} onExit={() => void showResult()} title="Předložky" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{PREPOSITION_CATEGORIES[ex.category] || ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">Doplň správnou předložku:</p>
        <p className="mb-5 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 && (
                <Gap
                  picked={selected !== null ? options[selected] : null}
                  answer={options[correctIndex]}
                  result={result}
                />
              )}
            </span>
          ))}
        </p>

        <OptionList
          options={options}
          selected={selected}
          correctIndex={correctIndex}
          revealed={result !== null}
          onSelect={choose}
          columns={2}
        />

        {result !== null && <Feedback correct={result} explanation={ex.explanationCs} />}
        {result !== null && <NextButton onClick={next} last={last} />}
      </div>
    </div>
  );
}

/** The blank in the sentence: "…" before answering, then the right answer (and the wrong pick struck through). */
function Gap({ picked, answer, result }: { picked: string | null; answer: string; result: boolean | null }) {
  if (result === null) {
    return (
      <span className="mx-1 inline-block min-w-[3.5rem] border-b-2 border-accent px-1 text-center text-accent-text">
        <span aria-hidden="true">…</span>
        <span className="sr-only">(mezera)</span>
      </span>
    );
  }
  return (
    <span className="mx-1 inline-flex flex-wrap items-baseline gap-1.5">
      {!result && picked && <span className="text-danger line-through decoration-2">{picked}</span>}
      <span className="rounded-md bg-success-soft px-1.5 text-success">{answer}</span>
    </span>
  );
}
