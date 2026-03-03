import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { WORD_ORDER_EXERCISES, WORD_ORDER_CATEGORIES } from '../data/wordOrder';
import { shuffleArray } from '../utils';
import type { WordOrderExercise } from '../data/wordOrder';

type Phase = 'select' | 'drill' | 'result';

const DRILL_COUNT = 15;
const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
const CATEGORIES = Object.keys(WORD_ORDER_CATEGORIES);

function normalize(s: string): string {
  return s.toLowerCase().replace(/[.!?,]/g, '').trim();
}

export default function WordOrderDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const [exercises, setExercises] = useState<WordOrderExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [availableWords, setAvailableWords] = useState<{ word: string; idx: number }[]>([]);
  const [selectedWords, setSelectedWords] = useState<{ word: string; idx: number }[]>([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function startDrill() {
    let pool = WORD_ORDER_EXERCISES;
    if (selectedCats.length > 0) {
      pool = pool.filter((e) => selectedCats.includes(e.category));
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    setupWords(selected[0]);
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function setupWords(ex: WordOrderExercise) {
    const shuffled = shuffleArray(ex.words.map((w, i) => ({ word: w, idx: i })));
    setAvailableWords(shuffled);
    setSelectedWords([]);
    setChecked(false);
    setIsCorrect(false);
  }

  function selectWord(item: { word: string; idx: number }) {
    if (checked) return;
    setAvailableWords((prev) => prev.filter((w) => w.idx !== item.idx));
    setSelectedWords((prev) => [...prev, item]);
  }

  function deselectWord(item: { word: string; idx: number }) {
    if (checked) return;
    setSelectedWords((prev) => prev.filter((w) => w.idx !== item.idx));
    setAvailableWords((prev) => [...prev, item]);
  }

  function checkAnswer() {
    const ex = exercises[currentIndex];
    const userSentence = selectedWords.map((w) => w.word).join(' ');
    const correct = normalize(userSentence) === normalize(ex.answer);
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
      setupWords(exercises[nextIdx]);
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
      tags: ['word_order', ...(selectedCats.length > 0 ? selectedCats : ['all'])],
    });

    setPhase('result');
  }

  // ── SELECT PHASE ──────────────────────────────────────────────
  if (phase === 'select') {
    const poolSize = WORD_ORDER_EXERCISES.filter((e) => {
      if (selectedCats.length > 0 && !selectedCats.includes(e.category)) return false;
      if (selectedLevel !== 'all' && e.level !== selectedLevel) return false;
      return true;
    }).length;

    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Skládání vět</h1>
        <p className="page-subtitle">Seřaď slova do správného pořadí</p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Úroveň</h3>
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
            Kategorie {selectedCats.length > 0 && `(${selectedCats.length})`}
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
                {WORD_ORDER_CATEGORIES[cat]}
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary btn-lg w-full"
          disabled={poolSize === 0}
          onClick={startDrill}
        >
          Začít ({Math.min(DRILL_COUNT, poolSize)} vět)
        </button>
        {poolSize === 0 && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Pro vybraný filtr nejsou žádná cvičení.
          </p>
        )}
      </div>
    );
  }

  // ── RESULT PHASE ──────────────────────────────────────────────
  if (phase === 'result') {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Skládání vět hotové!
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">
          {score.correct} / {score.total} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80
            ? 'Výborně! Slovosled ti jde skvěle!'
            : pct >= 50
            ? 'Dobrá práce, příště to bude ještě lepší.'
            : 'Nevadí, procvičuj dál a bude to lepší!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button
            className="btn-primary"
            onClick={() => { setPhase('select'); setSelectedCats([]); setSelectedLevel('all'); }}
          >
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  // ── DRILL PHASE ───────────────────────────────────────────────
  const ex = exercises[currentIndex];
  if (!ex) return null;

  const allPlaced = availableWords.length === 0;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>← Zpět</button>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
        />
      </div>

      <div className="card !p-5 sm:!p-6 mb-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
            {WORD_ORDER_CATEGORIES[ex.category] ?? ex.category}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs">
            {ex.level}
          </span>
        </div>

        <p className="text-sm text-slate-400 dark:text-slate-500 italic mb-5">
          {ex.hintCs}
        </p>

        {/* Available words */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Dostupná slova
          </p>
          <div className="flex flex-wrap gap-2 min-h-[44px]">
            {availableWords.map((item) => (
              <button
                key={item.idx}
                onClick={() => selectWord(item)}
                disabled={checked}
                className="px-3.5 py-2 rounded-lg text-sm font-medium
                  bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200
                  shadow-sm hover:shadow-md hover:bg-slate-200 dark:hover:bg-slate-600
                  active:scale-95 transition-all duration-150
                  disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {item.word}
              </button>
            ))}
            {availableWords.length === 0 && !checked && (
              <span className="text-xs text-slate-400 dark:text-slate-500 italic self-center">
                Všechna slova jsou umístěna
              </span>
            )}
          </div>
        </div>

        {/* Selected words (sentence being built) */}
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
            Tvoje věta
          </p>
          <div
            className={`flex flex-wrap gap-2 min-h-[52px] p-3 rounded-xl border-2 transition-colors ${
              checked
                ? isCorrect
                  ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20'
                  : 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20'
                : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800'
            }`}
          >
            {selectedWords.length === 0 && (
              <span className="text-sm text-slate-300 dark:text-slate-600 italic self-center">
                Klikni na slova výše…
              </span>
            )}
            {selectedWords.map((item) => (
              <button
                key={item.idx}
                onClick={() => deselectWord(item)}
                disabled={checked}
                className="px-3.5 py-2 rounded-lg text-sm font-medium
                  bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200
                  shadow-sm hover:shadow-md hover:bg-primary-200 dark:hover:bg-primary-800
                  active:scale-95 transition-all duration-150
                  disabled:cursor-not-allowed"
              >
                {item.word}
              </button>
            ))}
          </div>
        </div>

        {/* Feedback after check */}
        {checked && (
          <div className="mt-4">
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
                  Správná odpověď: <span className="font-semibold">{ex.answer}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {!checked ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={!allPlaced}
          onClick={checkAnswer}
        >
          Zkontrolovat
        </button>
      ) : (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length ? 'Zobrazit výsledky' : 'Další →'}
        </button>
      )}
    </div>
  );
}
