import { useState, useMemo, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { GRAMMAR_EXERCISES, GRAMMAR_CATEGORIES, CATEGORY_NAMES } from '../data/grammar';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';
import type { GrammarExercise } from '../types';

type Phase = 'select' | 'drill' | 'result';

export default function GrammarDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [exercises, setExercises] = useState<GrammarExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function startDrill() {
    let pool = GRAMMAR_EXERCISES;
    if (selectedCats.length > 0) {
      pool = pool.filter((e) => selectedCats.includes(e.category));
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    const selected = shuffleArray(pool).slice(0, 15);
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setStats({ correct: 0, total: 0 });
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function checkAnswer() {
    const ex = exercises[currentIndex];
    let isCorrect = false;

    if (ex.type === 'mcq' && ex.options) {
      isCorrect = ex.options[selectedOption!] === ex.answer;
    } else {
      isCorrect = userAnswer.trim().toLowerCase() === ex.answer.toLowerCase();
    }

    if (isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
      const ua = ex.type === 'mcq' && ex.options ? ex.options[selectedOption!] : userAnswer.trim();
      trackError('grammar', ex.category, ex.prompt, ua, ex.answer);
    }

    setStats((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
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
      setSelectedOption(null);
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
      type: 'grammar',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: stats.total,
      correctItems: stats.correct,
      tags: selectedCats.length > 0 ? selectedCats : ['all'],
    });

    setPhase('result');
    playComplete();
  }

  if (phase === 'select') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Gramatická cvičení</h1>
        <p className="page-subtitle">Vyber si oblast nebo začni mix ze všeho.</p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Úroveň</h3>
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
          <h3 className="text-sm font-semibold text-slate-600 mb-2">
            Témata {selectedCats.length > 0 && `(${selectedCats.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {GRAMMAR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCats.includes(cat)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => toggleCat(cat)}
              >
                {CATEGORY_NAMES[cat] || cat}
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

  if (phase === 'result') {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Gramatika hotová!</h2>
        <p className="text-slate-600 mb-1">
          {stats.correct} / {stats.total} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80 ? 'Skvělé, gramatiku zvládáš!' : pct >= 50 ? 'Dobrý základ, pokračuj.' : 'Zkus si projít přehled gramatiky.'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={() => { setPhase('select'); setSelectedCats([]); }}>
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  const ex = exercises[currentIndex];

  const keyMap = useMemo(() => {
    if (!ex || phase !== 'drill') return {};
    if (showResult) return { Enter: nextExercise, ' ': nextExercise };
    if (ex.type === 'mcq' && ex.options) {
      const map: Record<string, () => void> = {};
      ex.options.forEach((_, i) => { map[String(i + 1)] = () => setSelectedOption(i); });
      map['Enter'] = () => { if (selectedOption !== null) checkAnswer(); };
      return map;
    }
    return {};
  }, [ex, phase, showResult, selectedOption]);
  useKeyboard(keyMap, phase === 'drill');

  if (!ex) return null;

  const isCorrect = ex.type === 'mcq' && ex.options
    ? ex.options[selectedOption!] === ex.answer
    : userAnswer.trim().toLowerCase() === ex.answer.toLowerCase();

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>← Zpět</button>
        <span className="text-sm text-slate-500 font-medium">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
        />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {CATEGORY_NAMES[ex.category] || ex.category}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">{ex.level}</span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 leading-relaxed">
          {(ex.type === 'open_cloze' || ex.type === 'translate') && (
            <span className="text-sm text-slate-500 dark:text-slate-400 block mb-1">
              {ex.type === 'open_cloze' ? 'Doplň chybějící slovo:' : 'Přelož do angličtiny:'}
            </span>
          )}
          {String(ex.prompt ?? '')}
        </h3>

        {ex.type === 'mcq' && ex.options && !showResult && (
          <div className="space-y-2">
            {ex.options.map((opt, i) => (
              <button
                key={i}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedOption === i
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                    : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500'
                }`}
                onClick={() => setSelectedOption(i)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {ex.type === 'mcq' && ex.options && showResult && (
          <div className="space-y-2">
            {ex.options.map((opt, i) => (
              <div
                key={i}
                className={`px-4 py-3 rounded-xl border-2 ${
                  opt === ex.answer
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                    : selectedOption === i
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30'
                    : 'border-slate-200 dark:border-slate-600'
                }`}
              >
                {opt} {opt === ex.answer && ' ✓'}
              </div>
            ))}
          </div>
        )}

        {(ex.type === 'cloze' || ex.type === 'translate' || ex.type === 'open_cloze') && !showResult && (
          <input
            type="text"
            className="input text-lg"
            placeholder={ex.type === 'open_cloze' ? 'Doplň slovo...' : 'Tvoje odpověď...'}
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && checkAnswer()}
            autoFocus
          />
        )}

        {(ex.type === 'cloze' || ex.type === 'translate' || ex.type === 'open_cloze') && showResult && (
          <div className={`px-4 py-3 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-500' : 'bg-red-50 dark:bg-red-900/30 border-2 border-red-500'}`}>
            <div className="flex items-center gap-2">
              <span>{isCorrect ? '✅' : '❌'}</span>
              <span className="font-medium dark:text-slate-100">{isCorrect ? 'Správně!' : `Správná odpověď: ${ex.answer}`}</span>
            </div>
            {!isCorrect && userAnswer && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">Tvoje odpověď: {userAnswer}</p>
            )}
          </div>
        )}

        {showResult && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
            <p className="text-sm text-blue-800 dark:text-blue-300">💡 {String(ex.explanationCs ?? '')}</p>
          </div>
        )}
      </div>

      {!showResult ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={ex.type === 'mcq' ? selectedOption === null : !userAnswer.trim().length}
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
