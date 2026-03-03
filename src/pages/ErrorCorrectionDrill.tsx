import { useState, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import {
  ERROR_CORRECTIONS,
  EC_CATEGORIES,
} from '../data/errorCorrection';
import type { ErrorCorrectionExercise } from '../data/errorCorrection';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'drill' | 'result';
type StepPhase = 'pick' | 'type' | 'feedback';

const DRILL_COUNT = 15;
const LEVELS = ['all', 'A2', 'B1'] as const;
const CATEGORIES = Object.keys(EC_CATEGORIES);
const MAX_WRONG_PICKS = 2;

function normalize(s: string): string {
  return s.toLowerCase().replace(/['']/g, "'").trim();
}

function fuzzyMatch(user: string, expected: string): boolean {
  return normalize(user) === normalize(expected);
}

function splitSentenceIntoWords(sentence: string): string[] {
  return sentence.match(/[\w'']+|[^\s\w]/g) ?? [];
}

export default function ErrorCorrectionDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('select');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedCats, setSelectedCats] = useState<string[]>([]);

  const [exercises, setExercises] = useState<ErrorCorrectionExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stepPhase, setStepPhase] = useState<StepPhase>('pick');
  const [selectedWordIdx, setSelectedWordIdx] = useState<number | null>(null);
  const [wrongPicks, setWrongPicks] = useState(0);
  const [correctionInput, setCorrectionInput] = useState('');
  const [wasCorrectPick, setWasCorrectPick] = useState(false);
  const [wasCorrectType, setWasCorrectType] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function toggleCat(cat: string) {
    setSelectedCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  function filteredPool() {
    let pool: ErrorCorrectionExercise[] = ERROR_CORRECTIONS;
    if (selectedCats.length > 0) {
      pool = pool.filter((e) => selectedCats.includes(e.category));
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    return pool;
  }

  function startDrill() {
    const pool = filteredPool();
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    resetStep();
    startTransition(() => {
      setExercises(selected);
      setCurrentIndex(0);
      setScore({ correct: 0, total: 0 });
      setStartTime(Date.now());
      setPhase('drill');
    });
  }

  function resetStep() {
    setStepPhase('pick');
    setSelectedWordIdx(null);
    setWrongPicks(0);
    setCorrectionInput('');
    setWasCorrectPick(false);
    setWasCorrectType(false);
    setRevealed(false);
  }

  function handleWordClick(wordIdx: number, word: string) {
    if (stepPhase !== 'pick') return;

    const ex = exercises[currentIndex];
    const errorTokens = splitSentenceIntoWords(ex.errorWord);
    const sentenceTokens = splitSentenceIntoWords(ex.sentence);

    const errorStartIdx = findErrorStartIndex(sentenceTokens, errorTokens);
    const isInError =
      errorStartIdx !== -1 &&
      wordIdx >= errorStartIdx &&
      wordIdx < errorStartIdx + errorTokens.length;

    if (isInError) {
      setSelectedWordIdx(wordIdx);
      setWasCorrectPick(true);
      setStepPhase('type');
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      const newWrongPicks = wrongPicks + 1;
      setWrongPicks(newWrongPicks);
      setSelectedWordIdx(wordIdx);
      playIncorrect();

      if (newWrongPicks >= MAX_WRONG_PICKS) {
        setWasCorrectPick(false);
        setRevealed(true);
        setStepPhase('feedback');
        trackError(
          'grammar',
          'error_correction_' + ex.category,
          ex.sentence,
          word,
          ex.errorWord,
        );
        setScore((prev) => ({ correct: prev.correct, total: prev.total + 1 }));
      } else {
        setTimeout(() => setSelectedWordIdx(null), 600);
      }
    }
  }

  function handleSubmitCorrection() {
    const ex = exercises[currentIndex];
    if (fuzzyMatch(correctionInput, ex.correctedWord)) {
      setWasCorrectType(true);
      setStepPhase('feedback');
      playCorrect();
      setScore((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
    } else {
      setWasCorrectType(false);
      setRevealed(true);
      setStepPhase('feedback');
      playIncorrect();
      trackError(
        'grammar',
        'error_correction_' + ex.category,
        ex.sentence,
        correctionInput,
        ex.correctedWord,
      );
      setScore((prev) => ({ correct: prev.correct, total: prev.total + 1 }));
    }
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      setCurrentIndex((prev) => prev + 1);
      resetStep();
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
        'error_correction',
        ...(selectedCats.length > 0 ? selectedCats : ['all']),
      ],
    });

    setPhase('result');
    playComplete();
  }

  // ── SELECT PHASE ──
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
        <h1 className="page-title">Najdi a oprav chybu</h1>
        <p className="page-subtitle">
          Vyber chybné slovo ve větě a napiš správný tvar
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
                {EC_CATEGORIES[cat]}
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
            ? `Začít (${Math.min(DRILL_COUNT, poolSize)} vět)`
            : 'Žádná cvičení pro tento filtr'}
        </button>
        {poolSize === 0 && (
          <p className="text-sm text-red-500 mt-2 text-center">
            Pro vybraný filtr nejsou žádná cvičení.
          </p>
        )}
      </div>
    );
  }

  // ── RESULT PHASE ──
  if (phase === 'result') {
    const pct =
      score.total > 0
        ? Math.round((score.correct / score.total) * 100)
        : 0;

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Hledání chyb hotové!
        </h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">
          {score.correct} / {score.total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Výborně! Chyby ti neuniknou!'
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

  // ── DRILL PHASE ──
  const ex = exercises[currentIndex];
  if (!ex) return null;

  const sentenceWords = splitSentenceIntoWords(ex.sentence);
  const errorTokens = splitSentenceIntoWords(ex.errorWord);
  const errorStartIdx = findErrorStartIndex(sentenceWords, errorTokens);
  const progressPct = (currentIndex / exercises.length) * 100;

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
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-2">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {/* Score summary */}
      <div className="flex items-center justify-between mb-5">
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Skóre: {score.correct} / {score.total}
        </span>
        <div className="flex items-center gap-2">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
            {EC_CATEGORIES[ex.category] ?? ex.category}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs">
            {ex.level}
          </span>
        </div>
      </div>

      {/* Exercise card */}
      <div className="card !p-5 sm:!p-6 mb-5">
        {/* Instruction */}
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4 uppercase tracking-wide">
          {stepPhase === 'pick'
            ? 'Klikni na chybné slovo'
            : stepPhase === 'type'
              ? 'Napiš správný tvar'
              : 'Výsledek'}
        </p>

        {/* Sentence as word pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {sentenceWords.map((word, idx) => {
            const isPunctuation = /^[^\w]$/.test(word);
            if (isPunctuation) {
              return (
                <span
                  key={idx}
                  className="text-lg text-slate-700 dark:text-slate-200 -ml-1 mr-0.5 self-center"
                >
                  {word}
                </span>
              );
            }

            const isInError =
              errorStartIdx !== -1 &&
              idx >= errorStartIdx &&
              idx < errorStartIdx + errorTokens.length;

            let pillClasses =
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ';

            if (stepPhase === 'feedback' || revealed) {
              if (isInError) {
                pillClasses +=
                  'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-2 border-red-400 dark:border-red-600 line-through';
              } else {
                pillClasses +=
                  'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-default';
              }
            } else if (
              selectedWordIdx === idx &&
              !wasCorrectPick &&
              stepPhase === 'pick'
            ) {
              pillClasses +=
                'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-2 border-amber-400 dark:border-amber-500 animate-pulse';
            } else if (isInError && stepPhase === 'type') {
              pillClasses +=
                'bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 border-2 border-primary-400 dark:border-primary-500';
            } else if (stepPhase === 'pick') {
              pillClasses +=
                'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 hover:shadow-md active:scale-95 cursor-pointer shadow-sm';
            } else {
              pillClasses +=
                'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 cursor-default';
            }

            return (
              <button
                key={idx}
                className={pillClasses}
                onClick={() => handleWordClick(idx, word)}
                disabled={stepPhase !== 'pick'}
              >
                {word}
              </button>
            );
          })}
        </div>

        {/* Wrong pick hint */}
        {stepPhase === 'pick' && wrongPicks > 0 && wrongPicks < MAX_WRONG_PICKS && (
          <p className="text-sm text-amber-600 dark:text-amber-400 mb-3">
            ❌ Špatné slovo — zkus znovu ({MAX_WRONG_PICKS - wrongPicks}{' '}
            {MAX_WRONG_PICKS - wrongPicks === 1 ? 'pokus' : 'pokusy'} zbývá)
          </p>
        )}

        {/* Correction input */}
        {stepPhase === 'type' && (
          <div className="mt-2">
            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">
              Správný tvar místo „
              <span className="text-red-500 dark:text-red-400 font-semibold">
                {ex.errorWord}
              </span>
              ":
            </label>
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                className="input flex-1"
                value={correctionInput}
                onChange={(e) => setCorrectionInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && correctionInput.trim()) {
                    handleSubmitCorrection();
                  }
                }}
                placeholder="Napiš opravu…"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
              />
              <button
                className="btn-primary"
                disabled={!correctionInput.trim()}
                onClick={handleSubmitCorrection}
              >
                Ověřit
              </button>
            </div>
          </div>
        )}

        {/* Feedback */}
        {stepPhase === 'feedback' && (
          <div className="mt-4 space-y-3">
            {/* Correct / Incorrect banner */}
            {wasCorrectPick && wasCorrectType ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-green-500 bg-green-50 dark:bg-green-900/30">
                <span className="text-lg">✅</span>
                <span className="font-medium text-green-700 dark:text-green-300">
                  Správně!
                </span>
              </div>
            ) : (
              <div className="px-4 py-3 rounded-xl border-2 border-red-500 bg-red-50 dark:bg-red-900/30">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">❌</span>
                  <span className="font-medium text-red-700 dark:text-red-300">
                    {!wasCorrectPick
                      ? 'Chybné slovo nebylo nalezeno'
                      : 'Špatná oprava'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Chyba: „
                  <span className="font-semibold text-red-600 dark:text-red-400 line-through">
                    {ex.errorWord}
                  </span>
                  " → Správně: „
                  <span className="font-semibold text-green-600 dark:text-green-400">
                    {ex.correctedWord}
                  </span>
                  "
                </p>
              </div>
            )}

            {/* Corrected sentence */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wide">
                Správná věta
              </p>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                {ex.correctedSentence}
              </p>
            </div>

            {/* Czech explanation */}
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/30">
              <p className="text-sm text-blue-800 dark:text-blue-300 leading-relaxed">
                💡 {ex.explanationCs}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 opacity-75">
                Kategorie: {EC_CATEGORIES[ex.category] ?? ex.category}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Action button */}
      {stepPhase === 'feedback' && (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length
            ? 'Zobrazit výsledky'
            : 'Další →'}
        </button>
      )}
    </div>
  );
}

function findErrorStartIndex(
  sentenceTokens: string[],
  errorTokens: string[],
): number {
  if (errorTokens.length === 0) return -1;
  for (let i = 0; i <= sentenceTokens.length - errorTokens.length; i++) {
    let match = true;
    for (let j = 0; j < errorTokens.length; j++) {
      if (
        sentenceTokens[i + j].toLowerCase() !== errorTokens[j].toLowerCase()
      ) {
        match = false;
        break;
      }
    }
    if (match) return i;
  }
  return -1;
}
