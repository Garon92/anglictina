import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import {
  REPORTED_SPEECH_RULES,
  REPORTED_SPEECH_EXERCISES,
  RS_CATEGORIES,
} from '../data/reportedSpeech';
import type { ReportedSpeechExercise } from '../data/reportedSpeech';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'reference' | 'drill' | 'result';
type Tab = 'reference' | 'drill';
type CategoryFilter = 'all' | 'statements' | 'questions' | 'commands' | 'mixed';

const CATEGORY_LABELS: Record<string, string> = {
  all: 'Vše',
  ...RS_CATEGORIES,
};

const LEVELS = ['all', 'A2', 'B1'] as const;
const CAT_FILTERS: CategoryFilter[] = ['all', 'statements', 'questions', 'commands', 'mixed'];
const DRILL_COUNT = 20;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[''`]/g, "'")
    .replace(/[""„]/g, '"')
    .replace(/\s+/g, ' ')
    .replace(/\.\s*$/, '')
    .trim();
}

function fuzzyMatch(userInput: string, expected: string): boolean {
  const u = normalize(userInput);
  const e = normalize(expected);
  if (u === e) return true;

  const keyParts = e
    .replace(/^(he|she|they|it|we|i)\s+(said|told|asked)\s+/i, '')
    .split(/\s+/)
    .filter((w) => w.length > 2);
  const matchCount = keyParts.filter((part) => u.includes(part)).length;
  return keyParts.length > 0 && matchCount >= keyParts.length * 0.85;
}

export default function ReportedSpeechDrill() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('select');
  const [tab, setTab] = useState<Tab>('drill');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [expandedRef, setExpandedRef] = useState<string | null>(null);

  const [exercises, setExercises] = useState<ReportedSpeechExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [checked, setChecked] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function filteredPool() {
    let pool: ReportedSpeechExercise[] = REPORTED_SPEECH_EXERCISES;
    if (selectedCategory !== 'all') {
      pool = pool.filter((e) => e.category === selectedCategory);
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    return pool;
  }

  function startDrill() {
    const pool = filteredPool();
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    setExercises(selected);
    setCurrentIndex(0);
    setChecked(false);
    setUserAnswer('');
    setSelectedOption(null);
    setIsCorrect(false);
    setScore({ correct: 0, total: 0 });
    setStartTime(Date.now());
    setPhase('drill');
  }

  function checkAnswer() {
    const ex = exercises[currentIndex];
    let correct = false;

    if (ex.type === 'transform') {
      correct = fuzzyMatch(userAnswer, ex.answer);
    } else if (ex.type === 'fill') {
      correct = normalize(userAnswer) === normalize(ex.answer);
    } else {
      correct = selectedOption === ex.answer;
    }

    if (correct) {
      playCorrect();
    } else {
      trackError(
        'grammar',
        'reported_speech_' + ex.category,
        ex.prompt,
        ex.type === 'mcq' ? selectedOption ?? '(prázdné)' : userAnswer,
        ex.answer,
      );
      playIncorrect();
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
      setCurrentIndex((i) => i + 1);
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
        'reported_speech',
        ...(selectedCategory !== 'all' ? ['rs_' + selectedCategory] : []),
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

    map['Enter'] = () => {
      if ((ex.type === 'transform' || ex.type === 'fill') && userAnswer.trim()) checkAnswer();
      if (ex.type === 'mcq' && selectedOption) checkAnswer();
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
        <h1 className="page-title">Nepřímá řeč (Reported Speech)</h1>
        <p className="page-subtitle">
          Převádění přímé řeči na nepřímou — klíčové téma pro maturitu B1.
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
            Přehled pravidel
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
            Zobrazit přehled pravidel
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

            {/* Category filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Kategorie
              </h3>
              <div className="flex flex-wrap gap-2">
                {CAT_FILTERS.map((cat) => (
                  <button
                    key={cat}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedCategory === cat
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {CATEGORY_LABELS[cat]}
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
        <h1 className="page-title">Pravidla nepřímé řeči</h1>
        <p className="page-subtitle mb-6">
          Klikni na pravidlo pro zobrazení příkladu a vysvětlení.
        </p>

        <div className="space-y-3">
          {REPORTED_SPEECH_RULES.map((rule) => {
            const isOpen = expandedRef === rule.id;
            return (
              <div key={rule.id} className="card !p-0 overflow-hidden">
                <button
                  className="w-full px-5 py-4 flex items-center justify-between text-left"
                  onClick={() => setExpandedRef(isOpen ? null : rule.id)}
                >
                  <div>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {rule.titleCs}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {rule.title}
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
                    {/* Direct → Reported example */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Přímá řeč
                        </p>
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {rule.directExample}
                        </p>
                      </div>
                      <div className="text-center text-slate-400 dark:text-slate-500">↓</div>
                      <div>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
                          Nepřímá řeč
                        </p>
                        <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
                          {rule.reportedExample}
                        </p>
                      </div>
                    </div>

                    {/* Czech explanation */}
                    <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl px-4 py-3">
                      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">
                        Vysvětlení
                      </p>
                      <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                        {rule.explanationCs}
                      </p>
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
          Nepřímá řeč hotová!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {score.correct} / {score.total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Výborně! Nepřímou řeč zvládáš skvěle!'
            : pct >= 50
              ? 'Dobrý základ, projdi si přehled pravidel.'
              : 'Projdi si pravidla a zkus znovu – reported speech chce praxi!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setSelectedCategory('all');
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
    ((ex.type === 'transform' || ex.type === 'fill') && userAnswer.trim().length > 0) ||
    (ex.type === 'mcq' && selectedOption !== null);

  const categoryLabel = RS_CATEGORIES[ex.category] ?? ex.category;

  const typeLabel =
    ex.type === 'transform'
      ? 'Přepiš'
      : ex.type === 'fill'
        ? 'Doplň'
        : 'Výběr';

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
            {categoryLabel}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {ex.level}
          </span>
          <span className="badge bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
            {typeLabel}
          </span>
        </div>

        {/* Direct speech (shown for transform) */}
        {ex.type === 'transform' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-3 mb-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">
              Přímá řeč
            </p>
            <p className="text-base font-medium text-slate-800 dark:text-slate-200">
              {ex.directSpeech}
            </p>
          </div>
        )}

        {/* Prompt */}
        <p className="text-lg leading-relaxed text-slate-900 dark:text-slate-100 mb-5">
          {ex.prompt}
        </p>

        {/* TRANSFORM input */}
        {ex.type === 'transform' && (
          <div>
            <input
              className="input w-full"
              type="text"
              placeholder="Napiš celou větu v nepřímé řeči…"
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

        {/* FILL input */}
        {ex.type === 'fill' && (
          <div>
            <input
              className="input w-full"
              type="text"
              placeholder="Doplň chybějící slovo…"
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

        {/* Keyboard hints */}
        {!checked && ex.type === 'mcq' && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
            Klávesy: 1–4 pro výběr, Enter pro potvrzení
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
