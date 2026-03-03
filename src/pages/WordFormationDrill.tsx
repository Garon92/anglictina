import { useState, useMemo, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  WORD_FORMATION_EXERCISES,
  WORD_FAMILIES,
  WF_CATEGORIES,
  type WordFormationExercise,
} from '../data/wordFormation';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';
import { shuffleArray } from '../utils';

type TabMode = 'reference' | 'drill';
type Phase = 'select' | 'drill' | 'result';
type LevelFilter = 'Vše' | 'A2' | 'B1';

const REFERENCE_FAMILIES = WORD_FAMILIES.slice(0, 30);
const CATEGORY_KEYS = Object.keys(WF_CATEGORIES);

function isAnswerCorrect(userAnswer: string, correctAnswer: string): boolean {
  return userAnswer.trim().toLowerCase() === correctAnswer.trim().toLowerCase();
}

function renderSentenceWithBaseWord(sentence: string, baseWord: string) {
  const match = sentence.match(/\(([^)]+)\)\s*$/);
  if (!match) return sentence;
  const before = sentence.slice(0, match.index);
  return (
    <>
      {before}
      <span className="text-amber-600 dark:text-amber-400 font-semibold">({baseWord})</span>
    </>
  );
}

export default function WordFormationDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [tabMode, setTabMode] = useState<TabMode>('drill');
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('Vše');
  const [exercises, setExercises] = useState<WordFormationExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);
  const [expandedFamily, setExpandedFamily] = useState<string | null>(null);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function startDrill() {
    let pool = WORD_FORMATION_EXERCISES;
    if (selectedCats.length > 0) {
      pool = pool.filter((e) => selectedCats.includes(e.category));
    }
    if (levelFilter === 'A2') {
      pool = pool.filter((e) => e.level === 'A2');
    } else if (levelFilter === 'B1') {
      pool = pool.filter((e) => e.level === 'B1');
    }
    const selected = shuffleArray(pool).slice(0, 15);
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setUserAnswer('');
      setShowResult(false);
      setStats({ correct: 0, total: 0 });
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function checkAnswer() {
    const ex = exercises[currentIndex];
    const correct = isAnswerCorrect(userAnswer, ex.answer);

    if (correct) {
      playCorrect();
    } else {
      playIncorrect();
      trackError('word_formation', ex.category, ex.sentence, userAnswer.trim(), ex.answer);
    }

    setStats((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));
    setShowResult(true);
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      setCurrentIndex((i) => i + 1);
      setUserAnswer('');
      setShowResult(false);
    }
  }

  async function finishDrill() {
    const userStats = await getStats();
    userStats.totalExercisesDone += stats.total;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'word_formation',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: stats.total,
      correctItems: stats.correct,
      tags: selectedCats.length > 0 ? selectedCats : ['all'],
    });

    setPhase('result');
    playComplete();
  }

  const keyMap = useMemo((): Record<string, () => void> => {
    if (phase !== 'drill' || !exercises[currentIndex]) return {};
    const ex = exercises[currentIndex];
    if (showResult) {
      return { Enter: nextExercise };
    }
    return {
      Enter: () => {
        if (userAnswer.trim()) checkAnswer();
      },
    };
  }, [phase, exercises, currentIndex, showResult, userAnswer]);

  useKeyboard(keyMap, phase === 'drill');

  const isRef = tabMode === 'reference';

  // ── Reference mode ──
  if (isRef) {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate(-1)}>
          ← Zpět
        </button>
        <h1 className="page-title">Tvoření slov</h1>
        <p className="page-subtitle">Přehled slovních rodin — 30 základních slov.</p>

        <div className="flex gap-2 mb-6">
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-primary-500 text-white"
            onClick={() => setTabMode('reference')}
          >
            Přehled
          </button>
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={() => setTabMode('drill')}
          >
            Cvičení
          </button>
        </div>

        <div className="space-y-2">
          {REFERENCE_FAMILIES.map((family) => (
            <div key={family.base} className="card overflow-hidden">
              <button
                className="w-full text-left flex items-center justify-between py-2"
                onClick={() =>
                  setExpandedFamily(expandedFamily === family.base ? null : family.base)
                }
              >
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {family.base}
                </span>
                <span className="text-slate-400 dark:text-slate-500">
                  {expandedFamily === family.base ? '▼' : '▶'}
                </span>
              </button>
              {expandedFamily === family.base && (
                <ul className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600 space-y-1.5">
                  {family.forms.map((f) => (
                    <li
                      key={f.word}
                      className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2"
                    >
                      <span className="font-medium">{f.word}</span>
                      <span className="text-slate-500 dark:text-slate-400">
                        — {f.posCs}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Drill: select phase ──
  if (phase === 'select') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate(-1)}>
          ← Zpět
        </button>
        <h1 className="page-title">Tvoření slov</h1>
        <p className="page-subtitle">Doplň správný tvar slova podle zadaného základu.</p>

        <div className="flex gap-2 mb-6">
          <button
            className="px-4 py-2 rounded-xl text-sm font-medium transition-all bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            onClick={() => setTabMode('reference')}
          >
            Přehled
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              !isRef
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setTabMode('drill')}
          >
            Cvičení
          </button>
        </div>

        <div className="mb-6">
          <h3 className="section-title">Úroveň</h3>
          <div className="flex gap-2">
            {(['Vše', 'A2', 'B1'] as const).map((lvl) => (
              <button
                key={lvl}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  levelFilter === lvl
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => setLevelFilter(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="section-title">
            Kategorie {selectedCats.length > 0 && `(${selectedCats.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_KEYS.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCats.includes(cat)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => toggleCat(cat)}
              >
                {WF_CATEGORIES[cat] || cat}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary btn-lg w-full" onClick={startDrill}>
          Začít cvičení (15 úloh)
        </button>
      </div>
    );
  }

  // ── Drill: result phase ──
  if (phase === 'result') {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Cvičení hotové!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {stats.correct} / {stats.total} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Skvělé, tvoření slov zvládáš!'
            : pct >= 50
              ? 'Dobrý základ, pokračuj.'
              : 'Zkus si projít přehled slovních rodin.'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate(-1)}>
            Zpět
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setSelectedCats([]);
            }}
          >
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  // ── Drill: active exercise ──
  const ex = exercises[currentIndex];
  if (!ex) return null;

  const isCorrect = showResult && isAnswerCorrect(userAnswer, ex.answer);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
          ← Zpět
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {stats.correct} / {stats.total} • {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{
            width: `${((currentIndex + (showResult ? 1 : 0)) / exercises.length) * 100}%`,
          }}
        />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {WF_CATEGORIES[ex.category] || ex.category}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {ex.level}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
          {renderSentenceWithBaseWord(ex.sentence, ex.baseWord)}
        </h3>

        {!showResult && (
          <input
            type="text"
            className="input text-lg"
            placeholder="Doplň správný tvar..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && userAnswer.trim()) checkAnswer();
            }}
            autoFocus
          />
        )}

        {showResult && (
          <div
            className={`px-4 py-3 rounded-xl ${
              isCorrect
                ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500'
                : 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{isCorrect ? '✅' : '❌'}</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {isCorrect ? 'Správně!' : `Správná odpověď: ${ex.answer}`}
              </span>
            </div>
            {!isCorrect && userAnswer && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                Tvoje odpověď: {userAnswer}
              </p>
            )}
          </div>
        )}

        {showResult && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">💡 {ex.hintCs}</p>
          </div>
        )}
      </div>

      {!showResult ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={!userAnswer.trim()}
          onClick={checkAnswer}
        >
          Zkontrolovat
        </button>
      ) : (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length ? 'Zobrazit výsledky' : 'Další úloha →'}
        </button>
      )}
    </div>
  );
}
