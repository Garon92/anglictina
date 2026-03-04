import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { CONFUSABLE_PAIRS, CONFUSABLE_CATEGORIES } from '../data/confusables';
import type { ConfusablePair } from '../data/confusables';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

type Phase = 'select' | 'reference' | 'quiz' | 'result';

interface QuizItem {
  sentence: string;
  answer: string;
  wrongOption: string;
  pair: ConfusablePair;
}

export default function ConfusablesDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [mode, setMode] = useState<'reference' | 'quiz'>('quiz');

  // Reference mode
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Quiz mode
  const [quizItems, setQuizItems] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function getFilteredPairs(): ConfusablePair[] {
    let pool = CONFUSABLE_PAIRS;
    if (selectedLevel !== 'all') {
      pool = pool.filter((p) => p.level === selectedLevel);
    }
    if (selectedCats.length > 0) {
      pool = pool.filter((p) => selectedCats.includes(p.category));
    }
    return pool;
  }

  function startMode() {
    const pairs = getFilteredPairs();
    if (pairs.length === 0) return;

    if (mode === 'reference') {
      startTransition(() => {
        setExpandedId(null);
        setSearch('');
        setPhase('reference');
      });
      return;
    }

    const allExercises: QuizItem[] = pairs.flatMap((pair) =>
      pair.exercises.map((ex) => ({
        sentence: ex.sentence,
        answer: ex.answer,
        wrongOption: ex.wrongOption,
        pair,
      })),
    );

    const shuffled = shuffleArray(allExercises).slice(0, 20);
    startTransition(() => {
      setQuizItems(shuffled);
      setCurrentIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setCorrectCount(0);
      setStartTime(Date.now());
      setPhase('quiz');
    });
  }

  function handleOptionClick(option: string) {
    if (answered) return;
    setSelectedOption(option);
    setAnswered(true);

    if (option === quizItems[currentIndex].answer) {
      setCorrectCount((c) => c + 1);
      playCorrect();
    } else {
      playIncorrect();
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 >= quizItems.length) {
      finishQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  }

  async function finishQuiz() {
    playComplete();

    const userStats = await getStats();
    userStats.totalExercisesDone += quizItems.length;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'grammar',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: quizItems.length,
      correctItems: correctCount,
      tags: ['confusables'],
    });

    setPhase('result');
  }

  // ──── SELECT PHASE ────

  if (phase === 'select') {
    const poolSize = getFilteredPairs().length;
    const exerciseCount = getFilteredPairs().reduce(
      (sum, p) => sum + p.exercises.length,
      0,
    );

    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
          ← Zpět
        </button>
        <h1 className="page-title">Záměnná slova</h1>
        <p className="page-subtitle">
          Nauč se rozlišovat slova, která se často pletou
        </p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
            Kategorie {selectedCats.length > 0 && `(${selectedCats.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(CONFUSABLE_CATEGORIES).map(([key, label]) => (
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
            Režim
          </h3>
          <div className="flex gap-2">
            {([['reference', 'Přehled'], ['quiz', 'Kvíz']] as const).map(
              ([m, label]) => (
                <button
                  key={m}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    mode === m
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => setMode(m)}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        <button
          className="btn-primary btn-lg w-full"
          disabled={poolSize === 0}
          onClick={startMode}
        >
          {poolSize === 0
            ? 'Žádné páry pro tento filtr'
            : mode === 'reference'
              ? `Zobrazit přehled (${poolSize} párů)`
              : `Začít kvíz (${Math.min(exerciseCount, 20)} otázek)`}
        </button>
      </div>
    );
  }

  // ──── REFERENCE PHASE ────

  if (phase === 'reference') {
    const filtered = getFilteredPairs().filter((p) => {
      if (!search.trim()) return true;
      const s = search.toLowerCase();
      return (
        p.wordA.toLowerCase().includes(s) ||
        p.wordB.toLowerCase().includes(s) ||
        p.meaningA_cs.toLowerCase().includes(s) ||
        p.meaningB_cs.toLowerCase().includes(s)
      );
    });

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button
            className="btn-ghost text-sm"
            onClick={() => setPhase('select')}
          >
            ← Zpět
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {filtered.length} párů
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Přehled záměnných slov
        </h2>

        <input
          type="text"
          placeholder="Hledat slovo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 mb-4 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <div className="space-y-3 pb-8">
          {filtered.map((pair) => {
            const isExpanded = expandedId === pair.id;

            return (
              <div
                key={pair.id}
                className="card !p-0 overflow-hidden"
              >
                <button
                  className="w-full text-left px-4 py-3 flex items-center justify-between gap-2"
                  onClick={() =>
                    setExpandedId(isExpanded ? null : pair.id)
                  }
                >
                  <div className="flex items-center gap-2 flex-wrap min-w-0">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {pair.wordA}
                    </span>
                    <span className="text-slate-400">vs.</span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">
                      {pair.wordB}
                    </span>
                    <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs">
                      {pair.level}
                    </span>
                    <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
                      {CONFUSABLE_CATEGORIES[pair.category]}
                    </span>
                  </div>
                  <svg
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-3 border-t border-slate-100 dark:border-slate-700 pt-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3">
                        <p className="font-semibold text-blue-800 dark:text-blue-300">
                          {pair.wordA}
                        </p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                          {pair.meaningA_cs}
                        </p>
                        <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 italic">
                          "{pair.exampleA}"
                        </p>
                      </div>
                      <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3">
                        <p className="font-semibold text-amber-800 dark:text-amber-300">
                          {pair.wordB}
                        </p>
                        <p className="text-sm text-amber-600 dark:text-amber-400">
                          {pair.meaningB_cs}
                        </p>
                        <p className="text-xs text-amber-500 dark:text-amber-400 mt-1 italic">
                          "{pair.exampleB}"
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-3">
                      <p className="text-sm text-slate-700 dark:text-slate-300">
                        💡 {pair.explanationCs}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {filtered.length === 0 && (
            <p className="text-center text-slate-400 py-8">
              Žádné výsledky pro "{search}"
            </p>
          )}
        </div>
      </div>
    );
  }

  // ──── RESULT PHASE ────

  if (phase === 'result') {
    const total = quizItems.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Kvíz dokončen!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {correctCount} / {total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Výborně! Záměnná slova ti jdou skvěle!'
            : pct >= 50
              ? 'Dobrý základ, ale zkus to ještě jednou.'
              : 'Nevadí, opakování dělá mistra!'}
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
            Znovu
          </button>
        </div>
      </div>
    );
  }

  // ──── QUIZ PHASE ────

  const item = quizItems[currentIndex];
  if (!item) return null;

  const progress = (currentIndex + 1) / quizItems.length;
  const options = shuffleArray([item.answer, item.wrongOption]);
  const sentenceParts = item.sentence.split('___');
  const isCorrect = selectedOption === item.answer;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button
          className="btn-ghost text-sm"
          onClick={() => setPhase('select')}
        >
          ← Zpět
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {currentIndex + 1} / {quizItems.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {CONFUSABLE_CATEGORIES[item.pair.category]}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {item.pair.level}
          </span>
        </div>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
          Doplň správné slovo:
        </p>

        <p className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-6 leading-relaxed">
          {sentenceParts[0]}
          <span
            className={`inline-block min-w-[80px] border-b-2 px-1 mx-1 font-semibold ${
              !answered
                ? 'border-primary-400 text-primary-500'
                : isCorrect
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-red-500 text-red-600 dark:text-red-400'
            }`}
          >
            {selectedOption || '___'}
          </span>
          {sentenceParts[1] || ''}
        </p>

        {!answered && (
          <div className="grid grid-cols-2 gap-3">
            {options.map((opt) => (
              <button
                key={opt}
                className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-400 text-slate-900 dark:text-slate-100 font-medium transition-all active:scale-95 text-center"
                onClick={() => handleOptionClick(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {answered && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {options.map((opt) => {
                const isAnswer = opt === item.answer;
                const wasSelected = opt === selectedOption;
                let cls =
                  'px-4 py-3 rounded-xl border-2 font-medium text-center ';
                if (isAnswer) {
                  cls +=
                    'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300';
                } else if (wasSelected) {
                  cls +=
                    'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300';
                } else {
                  cls +=
                    'border-slate-100 dark:border-slate-700 text-slate-400';
                }
                return (
                  <div key={opt} className={cls}>
                    {opt} {isAnswer && '✓'}
                  </div>
                );
              })}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 rounded-xl p-3">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                {item.pair.wordA} vs. {item.pair.wordB}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                💡 {item.pair.explanationCs}
              </p>
            </div>
          </>
        )}
      </div>

      {answered && (
        <button className="btn-primary btn-lg w-full" onClick={nextQuestion}>
          {currentIndex + 1 >= quizItems.length
            ? 'Zobrazit výsledky'
            : 'Další →'}
        </button>
      )}
    </div>
  );
}
