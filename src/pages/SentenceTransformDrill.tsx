import { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import {
  SENTENCE_TRANSFORMS,
  TRANSFORM_CATEGORIES,
} from '../data/sentenceTransform';
import type { SentenceTransformExercise } from '../data/sentenceTransform';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'drill' | 'result';

const DRILL_COUNT = 15;
const LEVELS = ['all', 'A2', 'B1'] as const;
const CATEGORIES = Object.keys(TRANSFORM_CATEGORIES);

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/['']/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[.!?,;]/g, '')
    .trim();
}

function isAnswerCorrect(
  userInput: string,
  exercise: SentenceTransformExercise,
): boolean {
  const norm = normalize(userInput);
  if (norm === normalize(exercise.gapAnswer)) return true;
  if (exercise.alternatives?.some((alt) => normalize(alt) === norm))
    return true;
  return false;
}

export default function SentenceTransformDrill() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const [exercises, setExercises] = useState<SentenceTransformExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (phase === 'drill' && !checked) {
      inputRef.current?.focus();
    }
  }, [phase, currentIndex, checked]);

  function filteredPool() {
    let pool: SentenceTransformExercise[] = SENTENCE_TRANSFORMS;
    if (selectedCats.length > 0) {
      pool = pool.filter((e) => selectedCats.includes(e.category));
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    return pool;
  }

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function startDrill() {
    const pool = filteredPool();
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    setExercises(selected);
    setCurrentIndex(0);
    setUserInput('');
    setChecked(false);
    setIsCorrect(false);
    setScore({ correct: 0, total: 0 });
    setStartTime(Date.now());
    setPhase('drill');
  }

  function checkAnswer() {
    if (!userInput.trim()) return;
    const ex = exercises[currentIndex];
    const correct = isAnswerCorrect(userInput, ex);
    setIsCorrect(correct);
    setChecked(true);
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
      trackError(
        'grammar',
        'sentence_transform_' + ex.category,
        ex.original,
        userInput.trim(),
        ex.gapAnswer,
      );
    }
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setUserInput('');
      setChecked(false);
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
        'sentence_transform',
        ...(selectedCats.length > 0 ? selectedCats : ['all']),
      ],
    });

    setPhase('result');
    playComplete();
  }

  const ex = phase === 'drill' ? exercises[currentIndex] : null;

  const keyMap = useMemo((): Record<string, () => void> => {
    if (!ex || phase !== 'drill') return {};
    if (checked) return { Enter: nextExercise };
    return {
      Enter: () => {
        if (userInput.trim()) checkAnswer();
      },
    };
  }, [ex, phase, checked, userInput]);
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
        <h1 className="page-title">Transformace vět</h1>
        <p className="page-subtitle">
          Přepiš větu s použitím klíčového slova – klasická maturitní úloha.
        </p>

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

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Kategorie{' '}
            {selectedCats.length > 0 && `(${selectedCats.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCats.includes(cat)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => toggleCat(cat)}
              >
                {TRANSFORM_CATEGORIES[cat]}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary btn-lg w-full"
          disabled={poolSize === 0}
          onClick={startDrill}
        >
          {poolSize > 0
            ? `Začít (${Math.min(poolSize, DRILL_COUNT)} úloh)`
            : 'Žádná cvičení pro tento filtr'}
        </button>
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
          Transformace hotové!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {score.correct} / {score.total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Výborně! Transformace vět ti jdou skvěle!'
            : pct >= 50
              ? 'Dobrá práce, příště to bude ještě lepší.'
              : 'Nevadí, procvičuj dál a bude to lepší!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setSelectedCats([]);
              setSelectedLevel('all');
            }}
          >
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  // ─── DRILL PHASE ───
  if (!ex) return null;

  const promptParts = ex.prompt.split('_____');

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
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
        />
      </div>

      {/* Score */}
      <div className="flex items-center justify-end gap-2 mb-4">
        <span className="text-sm font-medium text-green-600 dark:text-green-400">
          ✓ {score.correct}
        </span>
        <span className="text-slate-300 dark:text-slate-600">|</span>
        <span className="text-sm font-medium text-red-500 dark:text-red-400">
          ✗ {score.total - score.correct}
        </span>
      </div>

      {/* Exercise card */}
      <div className="card !p-5 sm:!p-6 mb-5">
        {/* Badges */}
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
            {TRANSFORM_CATEGORIES[ex.category] ?? ex.category}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs">
            {ex.level}
          </span>
        </div>

        {/* Original sentence */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
            Původní věta
          </p>
          <p className="text-lg text-slate-900 dark:text-slate-100 leading-relaxed">
            {ex.original}
          </p>
        </div>

        {/* Key word */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
            Klíčové slovo
          </p>
          <span className="inline-block px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 font-bold text-base tracking-wide">
            {ex.keyWord}
          </span>
        </div>

        {/* Prompt with input */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Doplň mezeru
          </p>
          <div className="flex flex-wrap items-center gap-1 text-lg text-slate-900 dark:text-slate-100 leading-loose">
            <span>{promptParts[0]}</span>
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              disabled={checked}
              placeholder="..."
              className={`input inline-block min-w-[140px] max-w-[320px] text-center text-base px-3 py-1.5 mx-1 ${
                checked
                  ? isCorrect
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                  : ''
              }`}
              autoComplete="off"
              spellCheck={false}
            />
            {promptParts[1] !== undefined && <span>{promptParts[1]}</span>}
          </div>
        </div>

        {/* Feedback */}
        {checked && (
          <div className="mt-4 space-y-3">
            {isCorrect ? (
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <span>✅</span>
                <span className="font-medium">Správně!</span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-1">
                  <span>❌</span>
                  <span className="font-medium">Špatně</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Správná odpověď:{' '}
                  <span className="font-semibold">{ex.gapAnswer}</span>
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Celá věta:{' '}
                  <span className="font-medium italic">{ex.answer}</span>
                </p>
              </div>
            )}

            {/* Czech hint */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 {ex.hintCs}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      {!checked ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={!userInput.trim()}
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

      {/* Keyboard hint */}
      {!checked && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 text-center">
          Enter = zkontrolovat
        </p>
      )}
    </div>
  );
}
