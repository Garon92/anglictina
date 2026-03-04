import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { CZECH_ERRORS, CZECH_ERROR_CATEGORIES, type CzechErrorEntry } from '../data/czechErrors';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { trackError } from '../errorTracker';

type Phase = 'setup' | 'drill' | 'result';

const DRILL_COUNT = 15;

export default function CzechErrorsDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedCats, setSelectedCats] = useState<Set<string>>(new Set(CZECH_ERROR_CATEGORIES));
  const [exercises, setExercises] = useState<CzechErrorEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [userPick, setUserPick] = useState<'wrong' | 'correct' | null>(null);
  const [startTime, setStartTime] = useState(Date.now());

  function toggleCat(cat: string) {
    setSelectedCats((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function startDrill() {
    const pool = CZECH_ERRORS.filter((e) => selectedCats.has(e.category));
    if (pool.length < 3) return;
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setRevealed(false);
      setUserPick(null);
      setScore({ correct: 0, total: 0 });
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function handlePick(pick: 'wrong' | 'correct') {
    if (revealed) return;
    setUserPick(pick);
    setRevealed(true);

    const ex = exercises[currentIndex];
    const isCorrectPick = pick === 'wrong';
    if (isCorrectPick) {
      setScore((s) => ({ correct: s.correct + 1, total: s.total + 1 }));
      playCorrect();
    } else {
      setScore((s) => ({ ...s, total: s.total + 1 }));
      playIncorrect();
      trackError('czech_errors', ex.category, ex.wrongEn, 'Myslel/a jsem, že je správně', ex.correctEn);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
      setUserPick(null);
    }
  }

  async function finishDrill() {
    const stats = await getStats();
    stats.totalExercisesDone += exercises.length;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();
    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'czech_errors' as any,
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: exercises.length,
      correctItems: score.correct + (userPick === 'wrong' ? 0 : 0),
      tags: ['czech_errors'],
    });
    setPhase('result');
    playComplete();
  }

  if (phase === 'setup') {
    const pool = CZECH_ERRORS.filter((e) => selectedCats.has(e.category));
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Časté chyby Čechů</h1>
        <p className="page-subtitle">Rozpoznej chybné anglické věty, které Češi říkají špatně</p>

        <div className="card mb-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Kategorie</h3>
          <div className="flex flex-wrap gap-2">
            {CZECH_ERROR_CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCats.has(cat)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
                onClick={() => toggleCat(cat)}
              >
                {cat} ({CZECH_ERRORS.filter((e) => e.category === cat).length})
              </button>
            ))}
          </div>
        </div>

        <button
          className="btn-primary w-full"
          onClick={startDrill}
          disabled={pool.length < 3}
        >
          Začít ({Math.min(DRILL_COUNT, pool.length)} otázek)
        </button>
        {pool.length < 3 && (
          <p className="text-xs text-red-500 text-center mt-2">Vyber alespoň jednu kategorii s 3+ otázkami</p>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hotovo!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">
          {score.correct} / {score.total} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80 ? 'Výborně! Umíš rozpoznat typické české chyby.' : pct >= 50 ? 'Dobrá práce, pokračuj.' : 'Nevadí, tohle je cenné procvičení!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={() => { setPhase('setup'); }}>Znovu</button>
        </div>
      </div>
    );
  }

  const ex = exercises[currentIndex];
  if (!ex) return null;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => navigate('/')}>← Zpět</button>
        <span className="text-sm text-slate-500 font-medium">{currentIndex + 1} / {exercises.length}</span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${((currentIndex + 1) / exercises.length) * 100}%` }} />
      </div>

      <div className="card !p-5 mb-4">
        <span className="badge bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 mb-3">{ex.category}</span>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">Čech by řekl: "{ex.czechSource}"</p>

        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 mb-4">
          <p className="text-lg font-semibold text-slate-900 dark:text-white leading-relaxed">
            {ex.wrongEn}
          </p>
        </div>

        {!revealed ? (
          <div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-3 text-center">Je tato věta správně?</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="py-3 rounded-xl text-center font-medium transition-all active:scale-95 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50"
                onClick={() => handlePick('wrong')}
              >
                ❌ Špatně
              </button>
              <button
                className="py-3 rounded-xl text-center font-medium transition-all active:scale-95 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/50"
                onClick={() => handlePick('correct')}
              >
                ✓ Správně
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className={`p-3 rounded-xl ${userPick === 'wrong' ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
              <p className="text-sm font-medium mb-1 text-slate-700 dark:text-slate-200">
                {userPick === 'wrong' ? '✓ Správně! Tato věta je chybná.' : '✕ Špatně — tato věta NENÍ správně!'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs text-blue-600 dark:text-blue-400 mb-1 font-medium">Správně by mělo být:</p>
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-200">{ex.correctEn}</p>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">💡 {ex.explanationCs}</p>

            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{ex.example}"</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ex.exampleCs}</p>
            </div>

            <button className="btn-primary w-full" onClick={nextQuestion}>
              {currentIndex + 1 >= exercises.length ? 'Dokončit' : 'Další →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
