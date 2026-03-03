import { useState, useMemo, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import {
  CONDITIONAL_TYPES,
  CONDITIONAL_EXERCISES,
} from '../data/conditionals';
import type { ConditionalExercise } from '../data/conditionals';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'reference' | 'drill' | 'result';
type Tab = 'reference' | 'drill';
type CondTypeFilter = 'all' | '0' | '1' | '2' | '3' | 'mixed';

const TYPE_LABELS: Record<string, string> = {
  all: 'Vše',
  '0': 'Typ 0',
  '1': 'Typ 1',
  '2': 'Typ 2',
  '3': 'Typ 3',
  mixed: 'Mix',
};

const MATCH_TYPE_OPTIONS = [
  { value: '0', label: 'Typ 0' },
  { value: '1', label: 'Typ 1' },
  { value: '2', label: 'Typ 2' },
  { value: '3', label: 'Typ 3' },
  { value: 'mixed', label: 'Mix' },
];

const LEVELS = ['all', 'A2', 'B1'] as const;
const COND_FILTERS: CondTypeFilter[] = ['all', '0', '1', '2', '3', 'mixed'];
const DRILL_COUNT = 20;

function normalize(s: string): string {
  return s.toLowerCase().replace(/['']/g, "'").trim();
}

export default function ConditionalsDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('select');
  const [tab, setTab] = useState<Tab>('drill');
  const [selectedType, setSelectedType] = useState<CondTypeFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  const [exercises, setExercises] = useState<ConditionalExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function filteredPool() {
    let pool: ConditionalExercise[] = CONDITIONAL_EXERCISES;
    if (selectedType !== 'all') {
      pool = pool.filter((e) => e.conditionalType === selectedType);
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    return pool;
  }

  function startDrill() {
    const pool = filteredPool();
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setChecked(false);
      setUserAnswer('');
      setSelectedOption(null);
      setIsCorrect(false);
      setScore({ correct: 0, total: 0 });
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function checkAnswer() {
    const ex = exercises[currentIndex];
    let correct = false;

    if (ex.type === 'fill') {
      const parts = ex.answer.split(',').map((s) => normalize(s));
      const userParts = userAnswer.split(',').map((s) => normalize(s));
      correct =
        parts.length === userParts.length &&
        parts.every((p, i) => p === userParts[i]);
    } else if (ex.type === 'mcq') {
      correct = selectedOption === ex.answer;
    } else {
      correct = selectedOption === ex.answer;
    }

    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
      trackError(
        'grammar',
        'conditionals_' + ex.conditionalType,
        ex.prompt,
        ex.type === 'fill' ? userAnswer : selectedOption ?? '(prázdné)',
        ex.answer,
      );
    }

    setIsCorrect(correct);
    setChecked(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setChecked(false);
      setUserAnswer('');
      setSelectedOption(null);
      setIsCorrect(false);
    }
  }

  async function finishDrill() {
    const userStats = await getStats();
    userStats.totalExercisesDone += score.total;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'grammar',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: score.total,
      correctItems: score.correct,
      tags: [
        'conditionals',
        ...(selectedType !== 'all' ? ['cond_' + selectedType] : []),
      ],
    });

    setPhase('result');
    playComplete();
  }

  const ex = phase === 'drill' ? exercises[currentIndex] : null;

  const keyMap = useMemo(() => {
    if (!ex || phase !== 'drill') return {};

    if (checked) return { Enter: nextExercise, ' ': nextExercise };

    const map: Record<string, () => void> = {};

    if (ex.type === 'mcq' && ex.options) {
      ex.options.forEach((opt, i) => {
        map[String(i + 1)] = () => setSelectedOption(opt);
      });
    }

    if (ex.type === 'match_type') {
      map['1'] = () => setSelectedOption('0');
      map['2'] = () => setSelectedOption('1');
      map['3'] = () => setSelectedOption('2');
      map['4'] = () => setSelectedOption('3');
      map['5'] = () => setSelectedOption('mixed');
    }

    map['Enter'] = () => {
      if (ex.type === 'fill' && userAnswer.trim()) checkAnswer();
      if ((ex.type === 'mcq' || ex.type === 'match_type') && selectedOption)
        checkAnswer();
    };

    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ex, phase, checked, userAnswer, selectedOption]);

  useKeyboard(keyMap, phase === 'drill');

  // ─── SELECT PHASE ───
  if (phase === 'select') {
    const poolSize = filteredPool().length;

    return (
      <div className="page-container">
        <button
          className="btn-ghost text-sm mb-4"
          onClick={() => navigate('/')}
        >
          ← Zpět
        </button>
        <h1 className="page-title">Podmínkové věty (Conditionals)</h1>
        <p className="page-subtitle">
          If + podmínka → výsledek. Klíčová gramatika pro maturitu B1.
        </p>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'reference'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setTab('reference')}
          >
            Přehled
          </button>
          <button
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'drill'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setTab('drill')}
          >
            Cvičení
          </button>
        </div>

        {tab === 'reference' && (
          <button
            className="btn-primary btn-lg w-full"
            onClick={() => setPhase('reference')}
          >
            Zobrazit přehled typů
          </button>
        )}

        {tab === 'drill' && (
          <>
            {/* Level filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Úroveň
              </h3>
              <div className="flex gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedLevel === lvl
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    onClick={() => setSelectedLevel(lvl)}
                  >
                    {lvl === 'all' ? 'Vše' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Conditional type filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Typ kondicionálu
              </h3>
              <div className="flex flex-wrap gap-2">
                {COND_FILTERS.map((ct) => (
                  <button
                    key={ct}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedType === ct
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    onClick={() => setSelectedType(ct)}
                  >
                    {TYPE_LABELS[ct]}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary btn-lg w-full"
              onClick={startDrill}
              disabled={poolSize === 0}
            >
              {poolSize > 0
                ? `Začít (${Math.min(poolSize, DRILL_COUNT)} úloh)`
                : 'Žádná cvičení pro tento filtr'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ─── REFERENCE PHASE ───
  if (phase === 'reference') {
    return (
      <div className="page-container">
        <button
          className="btn-ghost text-sm mb-4"
          onClick={() => setPhase('select')}
        >
          ← Zpět
        </button>
        <h1 className="page-title">Přehled podmínkových vět</h1>
        <p className="page-subtitle mb-6">
          Klikni na typ pro zobrazení detailů, příkladů a vzorce.
        </p>

        <div className="space-y-3">
          {CONDITIONAL_TYPES.map((ct) => {
            const isOpen = expandedRef === ct.id;
            return (
              <div key={ct.id} className="card !p-0 overflow-hidden">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                  onClick={() =>
                    setExpandedRef(isOpen ? null : ct.id)
                  }
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {ct.nameCs}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {ct.name}
                    </p>
                  </div>
                  <span
                    className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700 pt-4 space-y-4">
                    {/* Formula */}
                    <div className="bg-primary-50 dark:bg-primary-900/30 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide mb-1">
                        Vzorec
                      </p>
                      <p className="text-sm font-mono text-primary-800 dark:text-primary-200">
                        {ct.formula}
                      </p>
                    </div>

                    {/* Usage */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                        Kdy používáme
                      </p>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {ct.usageCs}
                      </p>
                    </div>

                    {/* Examples */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Příklady
                      </p>
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2">
                        {ct.examples.map((ex, i) => (
                          <div key={i}>
                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                              {ex.en}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                              {ex.cs}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Signal words */}
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">
                        Signální slova
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {ct.signalWords.map((sw) => (
                          <span
                            key={sw}
                            className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                          >
                            {sw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── RESULT PHASE ───
  if (phase === 'result') {
    const pct =
      score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Podmínkové věty hotové!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {score.correct} / {score.total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Výborně! Kondicionály ti jdou skvěle!'
            : pct >= 50
              ? 'Dobrý základ, projdi si přehled typů.'
              : 'Projdi si přehled a zkus znovu – kondicionály chtějí praxi!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setSelectedType('all');
              setSelectedLevel('all');
            }}
          >
            Znovu
          </button>
        </div>
      </div>
    );
  }

  // ─── DRILL PHASE ───
  if (!ex) return null;

  const canCheck =
    (ex.type === 'fill' && userAnswer.trim().length > 0) ||
    ((ex.type === 'mcq' || ex.type === 'match_type') &&
      selectedOption !== null);

  const typeLabel =
    ex.conditionalType === 'mixed'
      ? 'Smíšený'
      : `Typ ${ex.conditionalType}`;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          className="btn-ghost text-sm"
          onClick={() => setPhase('select')}
        >
          ← Zpět
        </button>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-green-600 dark:text-green-400">
            {score.correct}✓
          </span>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {currentIndex + 1} / {exercises.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{
            width: `${(currentIndex / exercises.length) * 100}%`,
          }}
        />
      </div>

      {/* Exercise card */}
      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {typeLabel}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {ex.level}
          </span>
          <span className="badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            {ex.type === 'fill'
              ? 'Doplň'
              : ex.type === 'mcq'
                ? 'Výběr'
                : 'Urči typ'}
          </span>
        </div>

        {/* Prompt */}
        <p className="text-lg leading-relaxed text-slate-900 dark:text-slate-100 mb-5">
          {ex.prompt}
        </p>

        {/* FILL input */}
        {ex.type === 'fill' && (
          <div>
            <input
              className="input w-full"
              type="text"
              placeholder="Napiš správný tvar…"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !checked && userAnswer.trim())
                  checkAnswer();
              }}
              disabled={checked}
              autoFocus
            />
            {checked && !isCorrect && (
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Správná odpověď:{' '}
                <span className="font-semibold text-green-600 dark:text-green-400">
                  {ex.answer}
                </span>
              </p>
            )}
          </div>
        )}

        {/* MCQ options */}
        {ex.type === 'mcq' && ex.options && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ex.options.map((opt, i) => {
              let cls =
                'w-full px-4 py-3 rounded-xl text-sm font-medium text-left transition-all border-2 ';

              if (checked) {
                if (opt === ex.answer) {
                  cls +=
                    'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300';
                } else if (opt === selectedOption && !isCorrect) {
                  cls +=
                    'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                } else {
                  cls +=
                    'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
                }
              } else if (selectedOption === opt) {
                cls += 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
              } else {
                cls +=
                  'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500';
              }

              return (
                <button
                  key={opt}
                  className={cls}
                  onClick={() => !checked && setSelectedOption(opt)}
                  disabled={checked}
                >
                  <span className="text-xs text-slate-400 dark:text-slate-500 mr-2">
                    {i + 1}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* MATCH_TYPE options */}
        {ex.type === 'match_type' && (
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">
              O jaký typ kondicionálu se jedná?
            </p>
            <div className="flex flex-wrap gap-2">
              {MATCH_TYPE_OPTIONS.map((opt) => {
                let cls =
                  'px-4 py-2.5 rounded-xl text-sm font-medium transition-all border-2 ';

                if (checked) {
                  if (opt.value === ex.answer) {
                    cls +=
                      'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300';
                  } else if (
                    opt.value === selectedOption &&
                    !isCorrect
                  ) {
                    cls +=
                      'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300';
                  } else {
                    cls +=
                      'border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500';
                  }
                } else if (selectedOption === opt.value) {
                  cls += 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300';
                } else {
                  cls +=
                    'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500';
                }

                return (
                  <button
                    key={opt.value}
                    className={cls}
                    onClick={() =>
                      !checked && setSelectedOption(opt.value)
                    }
                    disabled={checked}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Keyboard hints */}
        {!checked && ex.type === 'mcq' && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Klávesy: 1–4 pro výběr, Enter pro potvrzení
          </p>
        )}
        {!checked && ex.type === 'match_type' && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Klávesy: 1 = Typ 0 · 2 = Typ 1 · 3 = Typ 2 · 4 = Typ 3 · 5 = Mix
          </p>
        )}

        {/* Feedback */}
        {checked && (
          <>
            <div
              className={`mt-4 px-4 py-3 rounded-xl border-2 ${
                isCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/30'
              }`}
            >
              <span className="font-medium dark:text-slate-100">
                {isCorrect ? '✅ Správně!' : '❌ Špatně'}
              </span>
            </div>

            <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 {ex.explanationCs}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Action button */}
      {!checked ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={!canCheck}
          onClick={checkAnswer}
        >
          Zkontrolovat
        </button>
      ) : (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length
            ? 'Zobrazit výsledky'
            : 'Další úloha →'}
        </button>
      )}
    </div>
  );
}
