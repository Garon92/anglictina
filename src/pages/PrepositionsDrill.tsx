import { useState, useMemo, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { PREPOSITION_EXERCISES, PREPOSITION_CATEGORIES } from '../data/prepositions';
import type { PrepositionExercise } from '../data/prepositions';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

type Phase = 'select' | 'drill' | 'result';

interface AnswerRecord {
  exercise: PrepositionExercise;
  selected: string;
  correct: boolean;
}

export default function PrepositionsDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  const [exercises, setExercises] = useState<PrepositionExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [startTime, setStartTime] = useState(0);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function getFilteredPool(): PrepositionExercise[] {
    let pool: PrepositionExercise[] = PREPOSITION_EXERCISES;
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    if (selectedCats.length > 0) {
      pool = pool.filter((e) => selectedCats.includes(e.category));
    }
    return pool;
  }

  function startDrill() {
    const pool = getFilteredPool();
    if (pool.length === 0) return;
    const selected = shuffleArray(pool).slice(0, 20);
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setAnswers([]);
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function handleOptionClick(option: string) {
    if (answered) return;
    setSelectedOption(option);

    const ex = exercises[currentIndex];
    const isCorrect = option.toLowerCase() === ex.answer.toLowerCase();
    if (isCorrect) playCorrect();
    else playIncorrect();

    setAnswers((prev) => [...prev, { exercise: ex, selected: option, correct: isCorrect }]);
    setAnswered(true);
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  }

  async function finishDrill() {
    const correctCount = answers.filter((a) => a.correct).length;
    const total = exercises.length;

    const userStats = await getStats();
    userStats.totalExercisesDone += total;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'grammar',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: total,
      correctItems: correctCount,
      tags: ['prepositions'],
    });

    playComplete();
    setPhase('result');
  }

  function renderSentence(sentence: string) {
    const parts = sentence.split('___');
    if (parts.length < 2) return <span>{sentence}</span>;

    return (
      <>
        {parts[0]}
        <span className="inline-block min-w-[4rem] border-b-2 border-primary-500 text-center font-bold mx-1 px-1">
          {answered && selectedOption ? selectedOption : '\u2026'}
        </span>
        {parts[1]}
      </>
    );
  }

  const ex = exercises[currentIndex] as PrepositionExercise | undefined;

  const keyMap = useMemo(() => {
    if (!ex || phase !== 'drill') return {};
    if (answered) return { Enter: nextExercise, ' ': nextExercise };
    const map: Record<string, () => void> = {};
    ex.options.forEach((opt, i) => {
      map[String(i + 1)] = () => handleOptionClick(opt);
    });
    return map;
  }, [ex, phase, answered, currentIndex]);
  useKeyboard(keyMap, phase === 'drill');

  // ──── SELECT PHASE ────

  if (phase === 'select') {
    const poolSize = getFilteredPool().length;

    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
          ← Zpět
        </button>
        <h1 className="page-title">Předložky</h1>
        <p className="page-subtitle">
          in, on, at a další — největší past angličtiny
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Úroveň</h3>
          <div className="flex gap-2">
            {['all', 'A1', 'A2', 'B1'].map((lvl) => (
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

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Kategorie {selectedCats.length > 0 && `(${selectedCats.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PREPOSITION_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCats.includes(key)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => toggleCat(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary btn-lg w-full"
          disabled={poolSize === 0}
          onClick={startDrill}
        >
          {poolSize === 0
            ? 'Žádné cvičení pro tento filtr'
            : `Začít (${Math.min(poolSize, 20)} otázek)`}
        </button>
      </div>
    );
  }

  // ──── RESULT PHASE ────

  if (phase === 'result') {
    const correctCount = answers.filter((a) => a.correct).length;
    const total = answers.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const wrong = answers.filter((a) => !a.correct);

    return (
      <div className="page-container">
        <div className="flex flex-col items-center justify-center min-h-[40vh] text-center mb-6">
          <div className="text-6xl mb-4">
            {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Předložky hotové!
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-1">
            {correctCount} / {total} správně ({pct} %)
          </p>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
            {pct >= 80
              ? 'Výborně, předložky ti jdou!'
              : pct >= 50
                ? 'Dobrý základ, procvičuj dál.'
                : 'Nevadí, opakování dělá mistra!'}
          </p>
        </div>

        {wrong.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-3">
              Chyby k zopakování ({wrong.length})
            </h3>
            <div className="space-y-3">
              {wrong.map((a, i) => (
                <div
                  key={i}
                  className="card !p-4 border-l-4 border-l-red-400"
                >
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 mb-1">
                    {a.exercise.sentence.replace('___', `[${a.exercise.answer}]`)}
                  </p>
                  <p className="text-xs text-red-500 mb-1">
                    Tvoje odpověď: <strong>{a.selected}</strong>
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {a.exercise.explanationCs}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary flex-1"
            onClick={() => {
              setPhase('select');
              setSelectedCats([]);
            }}
          >
            Znovu
          </button>
        </div>
      </div>
    );
  }

  // ──── DRILL PHASE ────

  if (!ex) return null;

  const progress = currentIndex / exercises.length;
  const isCorrect = answered && selectedOption?.toLowerCase() === ex.answer.toLowerCase();

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
          ← Zpět
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {PREPOSITION_CATEGORIES[ex.category] || ex.category}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {ex.level}
          </span>
        </div>

        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100 mb-6 leading-relaxed">
          {renderSentence(ex.sentence)}
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {ex.options.map((opt, i) => {
            let btnClass =
              'w-full py-3.5 px-4 rounded-full text-center font-medium text-base transition-all active:scale-95 border-2 ';

            if (!answered) {
              btnClass +=
                'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/30';
            } else if (opt.toLowerCase() === ex.answer.toLowerCase()) {
              btnClass +=
                'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
            } else if (opt === selectedOption) {
              btnClass +=
                'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
            } else {
              btnClass +=
                'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500';
            }

            return (
              <button
                key={i}
                className={btnClass}
                onClick={() => handleOptionClick(opt)}
                disabled={answered}
              >
                <span className="text-xs text-slate-400 dark:text-slate-500 mr-1">{i + 1}</span>{' '}
                {opt}
                {answered && opt.toLowerCase() === ex.answer.toLowerCase() && ' ✓'}
              </button>
            );
          })}
        </div>

        {answered && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">
              💡 {ex.explanationCs}
            </p>
          </div>
        )}
      </div>

      {answered && (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length ? 'Zobrazit výsledky' : 'Další →'}
        </button>
      )}
    </div>
  );
}
