import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { IRREGULAR_VERBS, type IrregularVerb } from '../data/irregularVerbs';
import { speak } from '../tts';
import { shuffleArray } from '../utils';

type Phase = 'select' | 'table' | 'flashcard' | 'quiz' | 'result';
type Level = 'all' | 'A1' | 'A2' | 'B1';
type Mode = 'table' | 'flashcard' | 'quiz';

type QuizSubType = 'base_to_past' | 'base_to_pp' | 'cs_to_base';

interface QuizQuestion {
  verb: IrregularVerb;
  subType: QuizSubType;
  prompt: string;
  promptLabel: string;
  correctAnswer: string;
}

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  A2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  B1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const LEVEL_ROW_COLORS: Record<string, string> = {
  A1: 'border-l-green-400',
  A2: 'border-l-blue-400',
  B1: 'border-l-purple-400',
};

function buildQuizQuestions(verbs: IrregularVerb[]): QuizQuestion[] {
  const subTypes: QuizSubType[] = ['base_to_past', 'base_to_pp', 'cs_to_base'];

  return verbs.map((verb, i) => {
    const subType = subTypes[i % 3];

    switch (subType) {
      case 'base_to_past':
        return {
          verb,
          subType,
          prompt: verb.base,
          promptLabel: 'Napiš tvar past simple:',
          correctAnswer: verb.past,
        };
      case 'base_to_pp':
        return {
          verb,
          subType,
          prompt: verb.base,
          promptLabel: 'Napiš tvar past participle:',
          correctAnswer: verb.pastParticiple,
        };
      case 'cs_to_base':
        return {
          verb,
          subType,
          prompt: verb.meaningCs,
          promptLabel: 'Napiš základní tvar (infinitiv):',
          correctAnswer: verb.base,
        };
    }
  });
}

function normalize(s: string): string {
  return s.trim().toLowerCase();
}

function checkAnswer(input: string, correct: string): boolean {
  const norm = normalize(input);
  const variants = correct.split('/').map(normalize);
  return variants.some((v) => v === norm);
}

const TTS_ICON = (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
  </svg>
);

const DRILL_COUNT = 20;

export default function IrregularVerbsDrill() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedLevel, setSelectedLevel] = useState<Level>('all');
  const [selectedMode, setSelectedMode] = useState<Mode>('table');

  const [items, setItems] = useState<IrregularVerb[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState(0);

  // Flashcard
  const [revealed, setRevealed] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  // Quiz
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Result
  const [resultCorrect, setResultCorrect] = useState(0);
  const [resultTotal, setResultTotal] = useState(0);

  function getFilteredVerbs(): IrregularVerb[] {
    if (selectedLevel === 'all') return IRREGULAR_VERBS;
    return IRREGULAR_VERBS.filter((v) => v.level === selectedLevel);
  }

  function startDrill() {
    const pool = getFilteredVerbs();
    if (pool.length === 0) return;

    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    setItems(selected);
    setCurrentIndex(0);
    setStartTime(Date.now());
    setRevealed(false);
    setKnownCount(0);
    setCorrectCount(0);
    setUserInput('');
    setFeedback(null);

    if (selectedMode === 'quiz') {
      setQuestions(shuffleArray(buildQuizQuestions(selected)));
    }

    setPhase(selectedMode);
  }

  function handleFlashcardRate(known: boolean) {
    const newKnown = known ? knownCount + 1 : knownCount;
    if (known) setKnownCount(newKnown);

    if (currentIndex + 1 >= items.length) {
      finishDrill(newKnown, items.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  }

  function handleQuizSubmit() {
    if (feedback !== null || !userInput.trim()) return;
    const q = questions[currentIndex];
    const isCorrect = checkAnswer(userInput, q.correctAnswer);
    if (isCorrect) setCorrectCount((c) => c + 1);
    setFeedback(isCorrect ? 'correct' : 'wrong');
  }

  function handleQuizNext() {
    const newCorrect = correctCount;
    if (currentIndex + 1 >= questions.length) {
      finishDrill(newCorrect, questions.length);
    } else {
      setCurrentIndex((i) => i + 1);
      setUserInput('');
      setFeedback(null);
    }
  }

  useEffect(() => {
    if (phase === 'quiz' && feedback === null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [currentIndex, phase, feedback]);

  async function finishDrill(correct: number, total: number) {
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
      correctItems: correct,
      tags: ['irregular_verbs'],
    });

    setResultCorrect(correct);
    setResultTotal(total);
    setPhase('result');
  }

  // ──── SELECT PHASE ────

  if (phase === 'select') {
    const pool = getFilteredVerbs();

    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
          ← Zpět
        </button>
        <h1 className="page-title">Nepravidelná slovesa</h1>
        <p className="page-subtitle">Procvič si tři tvary</p>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Úroveň</h3>
          <div className="flex gap-2 flex-wrap">
            {(['all', 'A1', 'A2', 'B1'] as const).map((lvl) => (
              <button
                key={lvl}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  selectedLevel === lvl
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                }`}
                onClick={() => setSelectedLevel(lvl)}
              >
                {lvl === 'all' ? 'Vše' : lvl}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Režim</h3>
          <div className="flex gap-2 flex-wrap">
            {([['table', 'Tabulka'], ['flashcard', 'Flashcards'], ['quiz', 'Kvíz']] as const).map(
              ([mode, label]) => (
                <button
                  key={mode}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    selectedMode === mode
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
                  }`}
                  onClick={() => setSelectedMode(mode)}
                >
                  {label}
                </button>
              ),
            )}
          </div>
        </div>

        {selectedMode === 'table' ? (
          <button
            className="btn-primary btn-lg w-full"
            disabled={pool.length === 0}
            onClick={() => setPhase('table')}
          >
            {pool.length === 0 ? 'Žádná slovesa pro tento filtr' : `Zobrazit tabulku (${pool.length} sloves)`}
          </button>
        ) : (
          <button
            className="btn-primary btn-lg w-full"
            disabled={pool.length === 0}
            onClick={startDrill}
          >
            {pool.length === 0
              ? 'Žádná slovesa pro tento filtr'
              : `Začít (${Math.min(pool.length, DRILL_COUNT)} sloves)`}
          </button>
        )}
      </div>
    );
  }

  // ──── TABLE MODE ────

  if (phase === 'table') {
    const verbs = getFilteredVerbs();

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
            ← Zpět
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {verbs.length} sloves
          </span>
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Přehled nepravidelných sloves
        </h2>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-slate-200 dark:border-slate-700">
                <th className="text-left py-2 pr-2 text-slate-500 dark:text-slate-400 font-medium">Base</th>
                <th className="text-left py-2 pr-2 text-slate-500 dark:text-slate-400 font-medium">Past</th>
                <th className="text-left py-2 pr-2 text-slate-500 dark:text-slate-400 font-medium">Past Participle</th>
                <th className="text-left py-2 text-slate-500 dark:text-slate-400 font-medium">Český význam</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {verbs.map((v) => (
                <tr
                  key={v.id}
                  className={`border-b border-slate-100 dark:border-slate-700/50 border-l-4 ${LEVEL_ROW_COLORS[v.level]}`}
                >
                  <td className="py-2.5 pr-2 font-semibold text-slate-900 dark:text-white">{v.base}</td>
                  <td className="py-2.5 pr-2 text-slate-700 dark:text-slate-300">{v.past}</td>
                  <td className="py-2.5 pr-2 text-slate-700 dark:text-slate-300">{v.pastParticiple}</td>
                  <td className="py-2.5 text-slate-500 dark:text-slate-400">{v.meaningCs}</td>
                  <td className="py-2.5 pl-1">
                    <button
                      className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 p-1"
                      onClick={() => speak(v.base)}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // ──── RESULT PHASE ────

  if (phase === 'result') {
    const pct = resultTotal > 0 ? Math.round((resultCorrect / resultTotal) * 100) : 0;

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hotovo!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">
          {resultCorrect} / {resultTotal} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80
            ? 'Výborně! Nepravidelná slovesa ti jdou!'
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
            }}
          >
            Znovu
          </button>
        </div>
      </div>
    );
  }

  // ──── FLASHCARD PHASE ────

  if (phase === 'flashcard') {
    const verb = items[currentIndex];
    if (!verb) return null;
    const progress = currentIndex / items.length;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
            ← Zpět
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {currentIndex + 1} / {items.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="card !p-6 sm:!p-8 text-center mb-6 min-h-[280px] flex flex-col justify-center">
          <span className={`badge ${LEVEL_COLORS[verb.level]} mx-auto mb-3`}>
            {verb.level}
          </span>

          <div className="flex items-center justify-center gap-2 mb-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{verb.base}</h2>
            <button
              className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 p-1"
              onClick={() => speak(verb.base)}
            >
              {TTS_ICON}
            </button>
          </div>

          <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">infinitiv</p>

          {revealed ? (
            <div className="animate-in fade-in duration-300 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-amber-50 dark:bg-amber-900/30 rounded-xl p-3">
                  <p className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">Past Simple</p>
                  <p className="text-lg font-bold text-amber-800 dark:text-amber-200">{verb.past}</p>
                </div>
                <div className="bg-violet-50 dark:bg-violet-900/30 rounded-xl p-3">
                  <p className="text-xs text-violet-600 dark:text-violet-400 font-medium mb-1">Past Participle</p>
                  <p className="text-lg font-bold text-violet-800 dark:text-violet-200">{verb.pastParticiple}</p>
                </div>
              </div>
              <div className="text-lg text-primary-600 dark:text-primary-400 font-semibold">
                {verb.meaningCs}
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-left">
                <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{verb.example}"</p>
              </div>
            </div>
          ) : (
            <button
              className="btn-primary btn-lg mx-auto mt-4"
              onClick={() => {
                setRevealed(true);
                speak(verb.base);
              }}
            >
              Ukázat tvary
            </button>
          )}
        </div>

        {revealed && (
          <div className="grid grid-cols-2 gap-3">
            <button
              className="py-3 rounded-xl text-center transition-all active:scale-95 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-300 font-medium"
              onClick={() => handleFlashcardRate(false)}
            >
              ❌ Neznám
            </button>
            <button
              className="py-3 rounded-xl text-center transition-all active:scale-95 bg-green-50 hover:bg-green-100 text-green-700 dark:bg-green-900/30 dark:hover:bg-green-900/50 dark:text-green-300 font-medium"
              onClick={() => handleFlashcardRate(true)}
            >
              ✅ Znám
            </button>
          </div>
        )}
      </div>
    );
  }

  // ──── QUIZ PHASE ────

  if (phase === 'quiz') {
    const q = questions[currentIndex];
    if (!q) return null;
    const progress = currentIndex / questions.length;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
            ← Zpět
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {currentIndex + 1} / {questions.length}
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
            <span className={`badge ${LEVEL_COLORS[q.verb.level]}`}>{q.verb.level}</span>
            <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
              {q.subType === 'base_to_past' ? 'Past Simple' : q.subType === 'base_to_pp' ? 'Past Participle' : 'Infinitiv'}
            </span>
          </div>

          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{q.promptLabel}</p>

          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{q.prompt}</h3>
            {q.subType !== 'cs_to_base' && (
              <button
                className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 p-1"
                onClick={() => speak(q.prompt)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
                </svg>
              </button>
            )}
          </div>

          {feedback === null ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleQuizSubmit();
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-lg focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="Tvoje odpověď..."
                autoComplete="off"
                autoCapitalize="off"
              />
              <button
                type="submit"
                className="btn-primary btn-lg w-full mt-3"
                disabled={!userInput.trim()}
              >
                Zkontrolovat
              </button>
            </form>
          ) : (
            <div>
              <div
                className={`px-4 py-3 rounded-xl border-2 text-lg font-medium ${
                  feedback === 'correct'
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                }`}
              >
                {feedback === 'correct' ? '✓ ' : '✗ '}
                {userInput}
              </div>

              {feedback === 'wrong' && (
                <div className="mt-3 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700">
                  <p className="text-sm text-green-700 dark:text-green-300">
                    Správná odpověď: <strong className="text-green-900 dark:text-green-100">{q.correctAnswer}</strong>
                  </p>
                </div>
              )}

              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>{q.verb.base}</strong> → {q.verb.past} → {q.verb.pastParticiple}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">{q.verb.meaningCs}</p>
                <p className="text-xs text-blue-500 dark:text-blue-400 mt-1 italic">"{q.verb.example}"</p>
              </div>

              <button className="btn-primary btn-lg w-full mt-3" onClick={handleQuizNext}>
                {currentIndex + 1 >= questions.length ? 'Zobrazit výsledky' : 'Další otázka →'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
