import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { TRANSLATION_EXERCISES, GRAMMAR_FOCUS_LABELS } from '../data/translations';
import type { TranslationExercise } from '../data/translations';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'drill' | 'result';
type MatchType = 'exact' | 'alternative' | 'partial' | 'wrong';

function checkAnswer(
  userAnswer: string,
  exercise: TranslationExercise,
): { correct: boolean; matchType: MatchType } {
  const normalize = (s: string) =>
    s.toLowerCase().replace(/[.!?,;:'"]/g, '').trim().replace(/\s+/g, ' ');
  const ua = normalize(userAnswer);

  if (ua === normalize(exercise.english)) return { correct: true, matchType: 'exact' };
  if (exercise.alternatives.some((alt) => normalize(alt) === ua))
    return { correct: true, matchType: 'alternative' };

  const keywordCount = exercise.keyWords.filter((kw) => ua.includes(kw.toLowerCase())).length;
  if (keywordCount >= exercise.keyWords.length * 0.7)
    return { correct: false, matchType: 'partial' };

  return { correct: false, matchType: 'wrong' };
}

const GRAMMAR_KEYS = Object.keys(GRAMMAR_FOCUS_LABELS);

export default function TranslationDrill() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedFoci, setSelectedFoci] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [exercises, setExercises] = useState<TranslationExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [lastMatch, setLastMatch] = useState<MatchType | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function toggleFocus(focus: string) {
    setSelectedFoci((prev) =>
      prev.includes(focus) ? prev.filter((f) => f !== focus) : [...prev, focus],
    );
  }

  function startDrill() {
    let pool = TRANSLATION_EXERCISES;
    if (selectedFoci.length > 0) {
      pool = pool.filter((e) => selectedFoci.includes(e.grammarFocus));
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    const selected = shuffleArray(pool).slice(0, 15);
    setExercises(selected);
    setCurrentIndex(0);
    setUserAnswer('');
    setShowResult(false);
    setLastMatch(null);
    setHintVisible(false);
    setStats({ correct: 0, total: 0 });
    setStartTime(Date.now());
    setPhase('drill');
  }

  function doCheck() {
    const ex = exercises[currentIndex];
    const result = checkAnswer(userAnswer, ex);

    if (result.correct) {
      playCorrect();
    } else {
      playIncorrect();
      trackError('translation', ex.grammarFocus, ex.czech, userAnswer.trim(), ex.english);
    }

    setLastMatch(result.matchType);
    setStats((prev) => ({
      correct: prev.correct + (result.correct ? 1 : 0),
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
      setLastMatch(null);
      setHintVisible(false);
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
      tags: ['translation', ...(selectedFoci.length > 0 ? selectedFoci : [])],
    });

    setPhase('result');
    playComplete();
  }

  /* ── Select phase ──────────────────────────────────────────────── */

  if (phase === 'select') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
          ← Zpět
        </button>
        <h1 className="page-title">Překlad vět</h1>
        <p className="page-subtitle">Překládej z češtiny do angličtiny</p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Úroveň
          </h3>
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
            Gramatika {selectedFoci.length > 0 && `(${selectedFoci.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {GRAMMAR_KEYS.map((key) => (
              <button
                key={key}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedFoci.includes(key)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
                onClick={() => toggleFocus(key)}
              >
                {GRAMMAR_FOCUS_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary btn-lg w-full" onClick={startDrill}>
          Začít (15 vět)
        </button>
      </div>
    );
  }

  /* ── Result phase ──────────────────────────────────────────────── */

  if (phase === 'result') {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Překlad hotový!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {stats.correct} / {stats.total} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Výborně, překlady ti jdou skvěle!'
            : pct >= 50
              ? 'Dobrý základ, zkus to znovu pro lepší výsledek.'
              : 'Nevadí, cvičení dělá mistra! Zkus si to znovu.'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setSelectedFoci([]);
            }}
          >
            Znovu
          </button>
        </div>
      </div>
    );
  }

  /* ── Drill phase ───────────────────────────────────────────────── */

  const ex = exercises[currentIndex];

  const keyMap = useMemo((): Record<string, () => void> => {
    if (!ex || phase !== 'drill') return {};
    if (showResult) return { Enter: nextExercise, ' ': nextExercise };
    return {};
  }, [ex, phase, showResult, currentIndex]);
  useKeyboard(keyMap, phase === 'drill');

  if (!ex) return null;

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
          style={{ width: `${((currentIndex + (showResult ? 1 : 0)) / exercises.length) * 100}%` }}
        />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300">
            {GRAMMAR_FOCUS_LABELS[ex.grammarFocus] || ex.grammarFocus}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {ex.level}
          </span>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-5 mb-4">
          <p className="text-xs font-medium text-blue-500 dark:text-blue-400 uppercase tracking-wide mb-1">
            Česky
          </p>
          <p className="text-lg font-semibold text-blue-900 dark:text-blue-100 leading-relaxed">
            {ex.czech}
          </p>
        </div>

        {!showResult && (
          <>
            <input
              type="text"
              className="input text-lg mb-3"
              placeholder="Your English translation…"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && userAnswer.trim() && doCheck()}
              autoFocus
            />

            {ex.hint && !hintVisible && (
              <button
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline mb-2"
                onClick={() => setHintVisible(true)}
              >
                💡 Nápověda
              </button>
            )}
            {ex.hint && hintVisible && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl mb-2">
                <p className="text-sm text-amber-800 dark:text-amber-300">💡 {ex.hint}</p>
              </div>
            )}
          </>
        )}

        {showResult && (
          <>
            <div
              className={`px-4 py-3 rounded-xl border-2 mb-3 ${
                lastMatch === 'exact' || lastMatch === 'alternative'
                  ? 'bg-green-50 dark:bg-green-900/30 border-green-500'
                  : lastMatch === 'partial'
                    ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-500'
                    : 'bg-red-50 dark:bg-red-900/30 border-red-500'
              }`}
            >
              <p className="font-medium dark:text-slate-100">
                {lastMatch === 'exact' && '✅ Správně!'}
                {lastMatch === 'alternative' && '✅ Správně! (alternativní překlad)'}
                {lastMatch === 'partial' &&
                  '⚠️ Skoro! Tvá odpověď obsahuje klíčová slova, ale není přesná.'}
                {lastMatch === 'wrong' && '❌ Špatně'}
              </p>
              {(lastMatch === 'partial' || lastMatch === 'wrong') && userAnswer.trim() && (
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Tvoje odpověď: <span className="italic">{userAnswer.trim()}</span>
                </p>
              )}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Správný překlad:
              </p>
              <p className="text-slate-900 dark:text-slate-100 font-medium">{ex.english}</p>
              {ex.alternatives.length > 0 && (
                <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-600">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Také správně:
                  </p>
                  {ex.alternatives.map((alt, i) => (
                    <p key={i} className="text-sm text-slate-600 dark:text-slate-400">
                      • {alt}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {!showResult ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={!userAnswer.trim().length}
          onClick={doCheck}
        >
          Zkontrolovat
        </button>
      ) : (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length ? 'Zobrazit výsledky' : 'Další věta →'}
        </button>
      )}
    </div>
  );
}
