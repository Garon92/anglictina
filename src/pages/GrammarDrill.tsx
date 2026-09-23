import { useMemo, useState } from 'react';
import { GRAMMAR_EXERCISES, GRAMMAR_CATEGORIES, CATEGORY_NAMES } from '../data/grammar';
import { shuffleArray } from '../utils';
import { isAnswerCorrect, isGapAnswerCorrect, isMultiGap, gapVariants } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import type { GrammarExercise } from '../types';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, TextAnswer, MultiGapAnswer,
  Feedback, NextButton, ResultScreen, countGaps,
} from '../components/drill';
import { Link } from 'react-router';

type Phase = 'setup' | 'drill' | 'result';
const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;

/** Number of separate inputs an exercise needs (1 for single answers). */
function gapInputs(ex: GrammarExercise): number {
  if (ex.type === 'mcq' || !isMultiGap(ex.answer)) return 1;
  const parts = gapVariants(ex.answer)[0]?.length ?? 1;
  return countGaps(ex.prompt) === parts ? parts : 1;
}

export default function GrammarDrill() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [cats, setCats] = useState<string[]>([]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [count, setCount] = useState(15);
  const [items, setItems] = useState<GrammarExercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [gaps, setGaps] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [overridden, setOverridden] = useState(false);
  const session = useDrillSession('grammar', { tags: cats.length ? cats : ['all'] });

  const pool = useMemo(
    () => GRAMMAR_EXERCISES.filter((e) => (!cats.length || cats.includes(e.category)) && (level === 'all' || e.level === level)),
    [cats, level],
  );

  const ex = items[idx];
  const nGaps = ex ? gapInputs(ex) : 1;

  function start() {
    setItems(shuffleArray(pool).slice(0, count));
    setIdx(0);
    resetItem();
    session.start();
    setPhase('drill');
  }

  function resetItem() {
    setSelected(null);
    setText('');
    setGaps([]);
    setResult(null);
    setOverridden(false);
  }

  function submit(opt?: number) {
    if (!ex || result !== null) return;
    let correct: boolean;
    let user: string;
    if (ex.type === 'mcq' && ex.options) {
      if (opt === undefined) return;
      setSelected(opt);
      user = ex.options[opt];
      correct = user === ex.answer;
    } else if (nGaps > 1) {
      user = gaps.join(' … ');
      correct = isGapAnswerCorrect(gaps, ex.answer);
    } else {
      user = text.trim();
      if (!user) return;
      correct = isAnswerCorrect(user, ex.answer);
    }
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: ex.prompt,
      options: ex.type === 'mcq' ? ex.options : undefined,
      kind: ex.type === 'mcq' ? 'mcq' : 'text',
      answer: ex.answer,
      userAnswer: user,
      explanation: ex.explanationCs,
      correct,
    });
  }

  async function next() {
    if (idx + 1 >= items.length) {
      await session.finish();
      setPhase('result');
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'drill');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Gramatika – mix"
        subtitle="Časy, modální slovesa, stupňování, otázky… Vyber si oblast, nebo nech mix ze všeho."
        icon="✏️"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={
          <p className="text-center text-sm text-muted">
            Potřebuješ si pravidla připomenout? <Link to="/grammar-ref">Přehled gramatiky</Link> · <Link to="/tenses">Přehled časů</Link>
          </p>
        }
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Témata${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {GRAMMAR_CATEGORIES.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {CATEGORY_NAMES[c] || c}
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
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr témat</button>
        </div>
      </ResultScreen>
    );
  }

  if (!ex) return null;
  const last = idx + 1 >= items.length;
  const correctIndex = ex.options ? ex.options.indexOf(ex.answer) : -1;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={items.length} correct={session.correct} onExit={() => void session.finish().then(() => setPhase('result'))} title="Gramatika" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{CATEGORY_NAMES[ex.category] || ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>
        {ex.type === 'translate' && <p className="mb-1 text-sm font-bold text-muted">Přelož do angličtiny:</p>}
        {ex.type === 'open_cloze' && <p className="mb-1 text-sm font-bold text-muted">{nGaps > 1 ? 'Doplň chybějící slova:' : 'Doplň chybějící slovo:'}</p>}
        {ex.type === 'cloze' && nGaps > 1 && <p className="mb-1 text-sm font-bold text-muted">Doplň všechny mezery:</p>}
        <p className="mb-4 text-xl leading-relaxed font-bold text-fg" lang={ex.type === 'translate' ? 'cs' : 'en'}>{ex.prompt}</p>

        {ex.type === 'mcq' && ex.options ? (
          <OptionList options={ex.options} selected={selected} correctIndex={correctIndex} revealed={result !== null} onSelect={(i) => submit(i)} />
        ) : nGaps > 1 ? (
          <>
            <MultiGapAnswer count={nGaps} values={gaps} onChange={setGaps} onSubmit={() => submit()} disabled={result !== null} status={result === null ? null : result || overridden ? 'correct' : 'wrong'} />
            {result === null && (
              <button type="button" className="btn-primary btn-lg mt-3 w-full sm:w-auto" disabled={gaps.filter((g) => g?.trim()).length < nGaps} onClick={() => submit()}>
                Ověřit
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <TextAnswer
                value={text}
                onChange={setText}
                onSubmit={() => submit()}
                disabled={result !== null}
                status={result === null ? null : result || overridden ? 'correct' : 'wrong'}
                placeholder={ex.type === 'translate' ? 'Napiš anglickou větu…' : 'Napiš odpověď…'}
                multiline={ex.type === 'translate'}
              />
            </div>
            {result === null && (
              <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={() => submit()}>Ověřit</button>
            )}
          </div>
        )}

        {result !== null && (
          <Feedback
            correct={result || overridden}
            answer={ex.answer}
            userAnswer={ex.type === 'mcq' ? undefined : nGaps > 1 ? gaps.join(' … ') : text.trim()}
            explanation={ex.explanationCs}
            title={overridden ? 'Uznáno' : undefined}
          >
            {!result && !overridden && ex.type === 'translate' && (
              <button type="button" className="btn-ghost btn-sm mt-2 !px-2" onClick={() => { setOverridden(true); session.markLastCorrect(); }}>
                Můj překlad je taky správně
              </button>
            )}
          </Feedback>
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
