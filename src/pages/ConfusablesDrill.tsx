import { useMemo, useRef, useState } from 'react';
import { CONFUSABLE_PAIRS, CONFUSABLE_CATEGORIES } from '../data/confusables';
import type { ConfusablePair } from '../data/confusables';
import { shuffleArray, uniqueBy } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import { speak } from '../tts';
import { czechPlural } from '../lib/dates';
import { EmptyState, PageHeader, SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'reference' | 'quiz' | 'result';
type Mode = 'quiz' | 'reference';
const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
type Level = (typeof LEVELS)[number];
const CATEGORY_KEYS = Object.keys(CONFUSABLE_CATEGORIES);

/** One quiz question; the two options are shuffled once when the round is built. */
interface QuizItem {
  itemId: string;
  sentence: string;
  answer: string;
  options: string[];
  correctIndex: number;
  pair: ConfusablePair;
}

const norm = (s: string) => s.trim().toLowerCase();
/** Lower-case without diacritics, for searching Czech meanings. */
const fold = (s: string) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

function buildQuiz(pairs: ConfusablePair[], count: number): QuizItem[] {
  const all = pairs.flatMap((pair) =>
    pair.exercises.map((ex, i) => ({ pair, ex, itemId: `${pair.id}-${i}` })),
  );
  return shuffleArray(all)
    .slice(0, count)
    .map(({ pair, ex, itemId }) => {
      const options = shuffleArray(uniqueBy([ex.answer, ex.wrongOption], norm));
      return { itemId, sentence: ex.sentence, answer: ex.answer, options, correctIndex: options.indexOf(ex.answer), pair };
    });
}

function pairExplanation(p: ConfusablePair): string {
  return `${p.wordA} = ${p.meaningA_cs}; ${p.wordB} = ${p.meaningB_cs}. ${p.explanationCs}`;
}

export default function ConfusablesDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<Mode>('quiz');
  const [level, setLevel] = useState<Level>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(20);

  // Reference
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [search, setSearch] = useState('');

  // Quiz
  const [items, setItems] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const leaving = useRef(false);
  const session = useDrillSession('confusables', { tags: cats.length ? cats : ['all'] });

  const pairs = useMemo(
    () => CONFUSABLE_PAIRS.filter((p) => (!cats.length || cats.includes(p.category)) && (level === 'all' || p.level === level)),
    [cats, level],
  );
  const exerciseCount = useMemo(() => pairs.reduce((sum, p) => sum + p.exercises.length, 0), [pairs]);

  const say = (text: string) => void speak(text, settings.ttsRate);

  function resetItem() {
    setSelected(null);
    setResult(null);
  }

  function startQuiz() {
    if (!pairs.length) return;
    setItems(buildQuiz(pairs, count));
    setIdx(0);
    resetItem();
    leaving.current = false;
    session.start();
    setPhase('quiz');
  }

  function onStart() {
    if (mode === 'reference') {
      setExpanded(new Set());
      setSearch('');
      setPhase('reference');
    } else {
      startQuiz();
    }
  }

  const item = items[idx];

  function choose(i: number) {
    if (!item || result !== null) return;
    const correct = i === item.correctIndex;
    setSelected(i);
    setResult(correct);
    session.answer({
      itemId: item.itemId,
      category: item.pair.category,
      prompt: item.sentence,
      options: item.options,
      kind: 'mcq',
      answer: item.answer,
      userAnswer: item.options[i],
      explanation: pairExplanation(item.pair),
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
    if (idx + 1 >= items.length) {
      void showResult();
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(result !== null ? { Enter: next, ' ': next } : {}, phase === 'quiz');

  /* ─── Setup ─── */
  if (phase === 'setup') {
    const isQuiz = mode === 'quiz';
    return (
      <DrillSetup
        title="Záměnná slova"
        subtitle="borrow × lend, make × do, false friends… Nauč se rozlišovat slova, která se často pletou."
        icon="🔀"
        poolSize={isQuiz ? exerciseCount : pairs.length === 0 ? 0 : undefined}
        onStart={onStart}
        startLabel={isQuiz ? 'Začít kvíz' : 'Zobrazit přehled'}
        count={isQuiz ? count : undefined}
        onCountChange={isQuiz ? setCount : undefined}
      >
        <FilterGroup
          label="Režim"
          hint={isQuiz ? 'Kvíz: vyber správné slovo do věty.' : `Přehled: ${pairs.length} ${czechPlural(pairs.length, 'dvojice', 'dvojice', 'dvojic')} slov s významem a příklady.`}
        >
          <Chip active={isQuiz} onClick={() => setMode('quiz')}>Kvíz</Chip>
          <Chip active={!isQuiz} onClick={() => setMode('reference')}>Přehled</Chip>
        </FilterGroup>
        <FilterGroup label={`Kategorie${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORY_KEYS.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {CONFUSABLE_CATEGORIES[c]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ─── Reference list ─── */
  if (phase === 'reference') {
    const q = fold(search.trim());
    const filtered = q
      ? pairs.filter((p) => [p.wordA, p.wordB, p.meaningA_cs, p.meaningB_cs].some((s) => fold(s).includes(q)))
      : pairs;
    const toggle = (id: string) =>
      setExpanded((prev) => {
        const nextSet = new Set(prev);
        if (nextSet.has(id)) nextSet.delete(id);
        else nextSet.add(id);
        return nextSet;
      });

    return (
      <div className="page-container page-container--wide">
        <button
          type="button"
          className="-ml-2 mb-2 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-bold text-muted hover:bg-surface-2 hover:text-fg"
          onClick={() => setPhase('setup')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Záměnná slova
        </button>
        <PageHeader
          title="Přehled záměnných slov"
          subtitle={`${filtered.length} ${czechPlural(filtered.length, 'dvojice', 'dvojice', 'dvojic')} · klepnutím zobrazíš význam a příklady`}
          icon="📖"
          back={null}
          actions={
            <button type="button" className="btn-primary" onClick={startQuiz} disabled={!pairs.length}>
              Kvíz
            </button>
          }
        />

        <label className="mb-4 block">
          <span className="sr-only">Hledat slovo nebo význam</span>
          <input
            type="search"
            className="input"
            placeholder="Hledat slovo nebo význam…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoComplete="off"
            spellCheck={false}
          />
        </label>

        {filtered.length === 0 ? (
          <EmptyState icon="🔍" title="Nic jsme nenašli">
            {search.trim() ? <>Pro „{search.trim()}“ tu není žádná dvojice. Zkus jiné slovo.</> : 'Pro tento výběr nejsou žádné dvojice.'}
          </EmptyState>
        ) : (
          <ul className="grid items-start gap-3 md:grid-cols-2">
            {filtered.map((pair) => {
              const open = expanded.has(pair.id);
              const panelId = `conf-${pair.id}`;
              return (
                <li key={pair.id} className="card !p-0">
                  <button
                    type="button"
                    className="flex min-h-[52px] w-full items-center gap-2 rounded-[inherit] px-4 py-3 text-left"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => toggle(pair.id)}
                  >
                    <span className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="font-bold break-words text-fg" lang="en">{pair.wordA}</span>
                      <span className="text-sm text-subtle">vs.</span>
                      <span className="font-bold break-words text-fg" lang="en">{pair.wordB}</span>
                      <span className="badge !bg-accent-soft !text-accent-text">{pair.level}</span>
                      <span className="badge">{CONFUSABLE_CATEGORIES[pair.category]}</span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      width="20"
                      height="20"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>
                  {open && (
                    <div id={panelId} className="space-y-3 border-t border-border px-4 pt-3 pb-4">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <WordBox word={pair.wordA} meaning={pair.meaningA_cs} example={pair.exampleA} onSpeak={say} tone="info" />
                        <WordBox word={pair.wordB} meaning={pair.meaningB_cs} example={pair.exampleB} onSpeak={say} tone="warning" />
                      </div>
                      <p className="feedback feedback--info text-sm leading-relaxed text-fg">{pair.explanationCs}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  /* ─── Result ─── */
  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={startQuiz}
        restartLabel="Nové kolo"
      >
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr</button>
          <button
            type="button"
            className="btn-ghost btn-sm"
            onClick={() => {
              setExpanded(new Set());
              setSearch('');
              setPhase('reference');
            }}
          >
            Přehled záměnných slov
          </button>
        </div>
      </ResultScreen>
    );
  }

  /* ─── Quiz ─── */
  if (!item) return null;
  const last = idx + 1 >= items.length;
  const parts = item.sentence.split(/_{3,}/);
  const picked = selected !== null ? item.options[selected] : null;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={items.length} correct={session.correct} onExit={() => void showResult()} title="Záměnná slova" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{CONFUSABLE_CATEGORIES[item.pair.category]}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{item.pair.level}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">Doplň správné slovo:</p>
        <p className="mb-5 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < parts.length - 1 &&
                (result === null ? (
                  <span className="mx-1 inline-block min-w-[4rem] border-b-2 border-accent px-1 text-center text-accent-text">
                    <span aria-hidden="true">…</span>
                    <span className="sr-only">(mezera)</span>
                  </span>
                ) : (
                  <span className="mx-1 inline-flex flex-wrap items-baseline gap-1.5">
                    {!result && picked && <span className="text-danger line-through decoration-2">{picked}</span>}
                    <span className="rounded-md bg-success-soft px-1.5 text-success">{item.answer}</span>
                  </span>
                ))}
            </span>
          ))}
        </p>

        <OptionList
          options={item.options}
          selected={selected}
          correctIndex={item.correctIndex}
          revealed={result !== null}
          onSelect={choose}
          columns={2}
        />

        {result !== null && (
          <Feedback
            correct={result}
            explanation={
              <>
                <span className="mb-1 block text-fg">
                  <strong lang="en">{item.pair.wordA}</strong> = {item.pair.meaningA_cs} · <strong lang="en">{item.pair.wordB}</strong> = {item.pair.meaningB_cs}
                </span>
                {item.pair.explanationCs}
              </>
            }
          />
        )}
        {result !== null && <NextButton onClick={next} last={last} />}
      </div>
    </div>
  );
}

function WordBox({ word, meaning, example, onSpeak, tone }: {
  word: string;
  meaning: string;
  example: string;
  onSpeak: (text: string) => void;
  tone: 'info' | 'warning';
}) {
  return (
    <div className={`rounded-xl p-3 ${tone === 'info' ? 'bg-info-soft' : 'bg-warning-soft'}`}>
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className={`font-black break-words ${tone === 'info' ? 'text-info' : 'text-warning'}`} lang="en">{word}</p>
          <p className="text-sm text-fg">{meaning}</p>
        </div>
        <SpeakButton onClick={() => onSpeak(example)} label={`Přehrát příklad: ${example}`} />
      </div>
      <p className="mt-1.5 text-sm break-words text-muted italic" lang="en">„{example}“</p>
    </div>
  );
}
