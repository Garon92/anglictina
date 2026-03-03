import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { PHRASAL_VERBS, PHRASE_CATEGORIES } from '../data/phrases';
import { speak } from '../tts';
import { shuffleArray, pickRandom } from '../utils';
import type { PhrasalVerbEntry } from '../types';

type Phase = 'select' | 'drill' | 'result';
type DrillMode = 'flashcard' | 'quiz';

interface QuizQuestion {
  entry: PhrasalVerbEntry;
  options: string[];
  correctIndex: number;
  showEnglish: boolean;
}

function buildQuizQuestions(
  items: PhrasalVerbEntry[],
  pool: PhrasalVerbEntry[],
): QuizQuestion[] {
  return items.map((entry, i) => {
    const showEnglish = i % 2 === 0;

    const sameCat = pool.filter((p) => p.id !== entry.id && p.category === entry.category);
    const otherPool = sameCat.length >= 3 ? sameCat : pool.filter((p) => p.id !== entry.id);
    const distractors = pickRandom(otherPool, 3);

    let options: string[];
    if (showEnglish) {
      options = shuffleArray([
        entry.meaningCs,
        ...distractors.map((d) => d.meaningCs),
      ]);
    } else {
      options = shuffleArray([
        entry.verb,
        ...distractors.map((d) => d.verb),
      ]);
    }

    const correctAnswer = showEnglish ? entry.meaningCs : entry.verb;
    const correctIndex = options.indexOf(correctAnswer);

    return { entry, options, correctIndex, showEnglish };
  });
}

export default function PhrasalVerbsDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('select');
  const [drillMode, setDrillMode] = useState<DrillMode>('flashcard');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const [items, setItems] = useState<PhrasalVerbEntry[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // Flashcard state
  const [revealed, setRevealed] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [unknownCount, setUnknownCount] = useState(0);

  // Quiz state
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function getFilteredPool(): PhrasalVerbEntry[] {
    let pool = PHRASAL_VERBS;
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

    const selected = pickRandom(pool, 15);
    const quizQ = drillMode === 'quiz' ? buildQuizQuestions(selected, pool) : [];
    startTransition(() => {
      setItems(selected);
      setCurrentIndex(0);
      setStartTime(Date.now());
      setRevealed(false);
      setKnownCount(0);
      setUnknownCount(0);
      setCorrectCount(0);
      setSelectedOption(null);
      setShowResult(false);
      if (drillMode === 'quiz') setQuestions(quizQ);
      setPhase('drill');
    });
  }

  function handleFlashcardRate(known: boolean) {
    if (known) setKnownCount((c) => c + 1);
    else setUnknownCount((c) => c + 1);

    if (currentIndex + 1 >= items.length) {
      finishDrill(
        known ? knownCount + 1 : knownCount,
        items.length,
      );
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  function checkQuizAnswer() {
    if (selectedOption === null) return;
    const q = questions[currentIndex];
    if (selectedOption === q.correctIndex) {
      setCorrectCount((c) => c + 1);
    }
    setShowResult(true);
  }

  function nextQuizQuestion() {
    if (currentIndex + 1 >= questions.length) {
      finishDrill(correctCount, questions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setShowResult(false);
    }
  }

  async function finishDrill(correct: number, total: number) {
    const userStats = await getStats();
    userStats.totalExercisesDone += total;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'phrasal_verbs',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: total,
      correctItems: correct,
      tags: selectedCats.length > 0 ? selectedCats : ['all'],
    });

    setPhase('result');
  }

  // ──── SELECT PHASE ────

  if (phase === 'select') {
    const poolSize = getFilteredPool().length;

    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
          ← Zpět
        </button>
        <h1 className="page-title">Frázová slovesa</h1>
        <p className="page-subtitle">Procvič si anglická frázová slovesa.</p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Úroveň</h3>
          <div className="flex gap-2">
            {['all', 'A2', 'B1'].map((lvl) => (
              <button
                key={lvl}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
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
            Kategorie {selectedCats.length > 0 && `(${selectedCats.length})`}
          </h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PHRASE_CATEGORIES).map(([key, label]) => (
              <button
                key={key}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedCats.includes(key)
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => toggleCat(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 mb-2">Režim</h3>
          <div className="flex gap-2">
            {([['flashcard', 'Flashcards'], ['quiz', 'Kvíz']] as const).map(
              ([mode, label]) => (
                <button
                  key={mode}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    drillMode === mode
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setDrillMode(mode)}
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
          onClick={startDrill}
        >
          {poolSize === 0
            ? 'Žádná slovesa pro tento filtr'
            : `Začít (${Math.min(poolSize, 15)} sloves)`}
        </button>
      </div>
    );
  }

  // ──── RESULT PHASE ────

  if (phase === 'result') {
    const total = items.length;
    const correct = drillMode === 'flashcard' ? knownCount : correctCount;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {drillMode === 'flashcard' ? 'Flashcards hotovo!' : 'Kvíz hotový!'}
        </h2>
        <p className="text-slate-600 mb-1">
          {correct} / {total}{' '}
          {drillMode === 'flashcard' ? 'známých' : 'správně'} ({pct}%)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80
            ? 'Výborně, frázová slovesa ti jdou!'
            : pct >= 50
              ? 'Dobrý základ, pokračuj v procvičování.'
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
            }}
          >
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  // ──── DRILL PHASE ────

  const progress = currentIndex / items.length;

  // Flashcard mode
  if (drillMode === 'flashcard') {
    const entry = items[currentIndex];
    if (!entry) return null;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
            ← Zpět
          </button>
          <span className="text-sm text-slate-500 font-medium">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="card !p-6 sm:!p-8 text-center mb-6 min-h-[280px] flex flex-col justify-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <span className="badge bg-slate-100 text-slate-600">
              {PHRASE_CATEGORIES[entry.category] || entry.category}
            </span>
            <span className="badge bg-primary-100 text-primary-700">{entry.level}</span>
          </div>

          <div className="flex items-center justify-center gap-2 mt-4 mb-4">
            <h2 className="text-3xl font-bold text-slate-900">{entry.verb}</h2>
            <button
              className="text-primary-500 hover:text-primary-700 p-1"
              onClick={() => speak(entry.verb)}
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
              </svg>
            </button>
          </div>

          {revealed ? (
            <div className="animate-in fade-in duration-300">
              <div className="text-xl text-primary-600 font-semibold mb-4">
                {entry.meaningCs}
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-left">
                <p className="text-sm text-slate-700 italic mb-1">"{entry.example}"</p>
                <p className="text-xs text-slate-500">{entry.exampleCs}</p>
              </div>
            </div>
          ) : (
            <button
              className="btn-primary btn-lg mx-auto mt-4"
              onClick={() => setRevealed(true)}
            >
              Ukázat význam
            </button>
          )}
        </div>

        {revealed && (
          <div className="grid grid-cols-2 gap-3">
            <button
              className="py-3 rounded-xl text-center transition-all active:scale-95 bg-red-50 hover:bg-red-100 text-red-700 font-medium"
              onClick={() => handleFlashcardRate(false)}
            >
              ❌ Neznám
            </button>
            <button
              className="py-3 rounded-xl text-center transition-all active:scale-95 bg-green-50 hover:bg-green-100 text-green-700 font-medium"
              onClick={() => handleFlashcardRate(true)}
            >
              ✅ Znám
            </button>
          </div>
        )}
      </div>
    );
  }

  // Quiz mode
  const q = questions[currentIndex];
  if (!q) return null;

  const isCorrect = selectedOption === q.correctIndex;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
          ← Zpět
        </button>
        <span className="text-sm text-slate-500 font-medium">
          {currentIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 text-slate-600">
            {PHRASE_CATEGORIES[q.entry.category] || q.entry.category}
          </span>
          <span className="badge bg-primary-100 text-primary-700">{q.entry.level}</span>
        </div>

        <p className="text-sm text-slate-500 mb-1">
          {q.showEnglish ? 'Vyber správný český význam:' : 'Vyber správné frázové sloveso:'}
        </p>

        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-semibold text-slate-900">
            {q.showEnglish ? q.entry.verb : q.entry.meaningCs}
          </h3>
          {q.showEnglish && (
            <button
              className="text-primary-500 hover:text-primary-700 p-1"
              onClick={() => speak(q.entry.verb)}
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
        </div>

        {!showResult && (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                  selectedOption === i
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-slate-100 hover:border-slate-200'
                }`}
                onClick={() => setSelectedOption(i)}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {showResult && (
          <div className="space-y-2">
            {q.options.map((opt, i) => (
              <div
                key={i}
                className={`px-4 py-3 rounded-xl border-2 ${
                  i === q.correctIndex
                    ? 'border-green-500 bg-green-50'
                    : selectedOption === i
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-100'
                }`}
              >
                {opt}
                {i === q.correctIndex && ' ✓'}
              </div>
            ))}
          </div>
        )}

        {showResult && (
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-800">
              💡 <strong>{q.entry.verb}</strong> — {q.entry.meaningCs}
            </p>
            <p className="text-xs text-blue-600 mt-1 italic">"{q.entry.example}"</p>
            <p className="text-xs text-blue-500">{q.entry.exampleCs}</p>
          </div>
        )}
      </div>

      {!showResult ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={selectedOption === null}
          onClick={checkQuizAnswer}
        >
          Zkontrolovat
        </button>
      ) : (
        <button className="btn-primary btn-lg w-full" onClick={nextQuizQuestion}>
          {currentIndex + 1 >= questions.length ? 'Zobrazit výsledky' : 'Další otázka →'}
        </button>
      )}
    </div>
  );
}
