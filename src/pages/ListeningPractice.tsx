import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { LISTENING_EXERCISES } from '../data/listening';
import { speak } from '../tts';
import type { ListeningExercise, ListeningQuestion } from '../types';
import { shuffleArray } from '../utils';

type Phase = 'select' | 'exercise' | 'result';

const TYPE_LABELS: Record<ListeningExercise['type'], string> = {
  dictation: 'Diktát',
  comprehension: 'Porozumění',
  gapfill: 'Doplňování',
};

const TYPE_ICONS: Record<ListeningExercise['type'], string> = {
  dictation: '✍️',
  comprehension: '🎧',
  gapfill: '📝',
};

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300',
  A2: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  B1: 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
};

function PlayButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-3 mx-auto px-8 py-4 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-semibold text-lg shadow-lg hover:shadow-xl transition-all active:scale-95"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
      </svg>
      {label}
    </button>
  );
}

function SlowPlayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 font-medium text-sm transition-all active:scale-95"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
      </svg>
      🐢 Pomalu
    </button>
  );
}

export default function ListeningPractice() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('select');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | string | null)[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [fillInput, setFillInput] = useState('');
  const [startTime, setStartTime] = useState(0);

  const filteredExercises = LISTENING_EXERCISES.filter((ex) => {
    if (filterLevel !== 'all' && ex.level !== filterLevel) return false;
    if (filterType !== 'all' && ex.type !== filterType) return false;
    return true;
  });

  function startExercise(ex: ListeningExercise) {
    const shuffled = shuffleArray(ex.questions);
    setExercise(ex);
    setQuestions(shuffled);
    setCurrentQ(0);
    setAnswers(new Array(shuffled.length).fill(null));
    setShowAnswer(false);
    setHasPlayed(false);
    setFillInput('');
    setStartTime(Date.now());
    setPhase('exercise');
  }

  function handlePlay() {
    if (!exercise) return;
    speak(exercise.script);
    setHasPlayed(true);
  }

  function handleSlowPlay() {
    if (!exercise) return;
    speak(exercise.script, 0.7);
    setHasPlayed(true);
  }

  function selectOption(qIdx: number, optIdx: number) {
    if (showAnswer) return;
    const next = [...answers];
    next[qIdx] = optIdx;
    setAnswers(next);
  }

  function submitFill() {
    if (showAnswer) return;
    const next = [...answers];
    next[currentQ] = fillInput.trim();
    setAnswers(next);
    setShowAnswer(true);
  }

  function checkAnswer() {
    setShowAnswer(true);
  }

  function isCurrentCorrect(): boolean {
    const q = questions[currentQ];
    if (!q) return false;
    if (q.type === 'fill') {
      return (
        typeof answers[currentQ] === 'string' &&
        (answers[currentQ] as string).toLowerCase() === (q.answer ?? '').toLowerCase()
      );
    }
    return answers[currentQ] === q.answerIndex;
  }

  function nextQuestion() {
    if (currentQ + 1 >= questions.length) {
      finishExercise();
    } else {
      setCurrentQ((i) => i + 1);
      setShowAnswer(false);
      setFillInput('');
    }
  }

  function computeScore(): { correct: number; total: number; pct: number } {
    let correct = 0;
    questions.forEach((q, i) => {
      if (q.type === 'fill') {
        if (
          typeof answers[i] === 'string' &&
          (answers[i] as string).toLowerCase() === (q.answer ?? '').toLowerCase()
        )
          correct++;
      } else {
        if (answers[i] === q.answerIndex) correct++;
      }
    });
    const total = questions.length;
    return { correct, total, pct: total > 0 ? Math.round((correct / total) * 100) : 0 };
  }

  async function finishExercise() {
    if (!exercise) return;
    const { correct } = computeScore();

    const stats = await getStats();
    stats.totalExercisesDone += questions.length;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'listening',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: questions.length,
      correctItems: correct,
      tags: ['listening', exercise.type, exercise.topic],
    });

    setPhase('result');
  }

  // ─── SELECT PHASE ──────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Poslech</h1>
        <p className="page-subtitle">
          {LISTENING_EXERCISES.length} cvičení — poslouchej a odpovídej.
        </p>

        <div className="mb-4 flex gap-2 flex-wrap">
          {['all', 'A1', 'A2', 'B1'].map((lvl) => (
            <button
              key={lvl}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                filterLevel === lvl ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              onClick={() => setFilterLevel(lvl)}
            >
              {lvl === 'all' ? 'Vše' : lvl}
            </button>
          ))}
        </div>

        <div className="mb-4 flex gap-2 flex-wrap">
          {(['all', 'dictation', 'comprehension', 'gapfill'] as const).map((t) => (
            <button
              key={t}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterType === t ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              onClick={() => setFilterType(t)}
            >
              {t === 'all' ? 'Vše' : TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-3">{filteredExercises.length} cvičení</p>

        <div className="space-y-3">
          {filteredExercises.map((ex) => (
            <button
              key={ex.id}
              className="card-hover w-full text-left"
              onClick={() => startExercise(ex)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{TYPE_ICONS[ex.type]}</span>
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                      {TYPE_LABELS[ex.type]} — {ex.topic}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${LEVEL_COLORS[ex.level]}`}>{ex.level}</span>
                    <span className="text-xs text-slate-400">
                      {ex.questions.length} {ex.questions.length === 1 ? 'otázka' : ex.questions.length < 5 ? 'otázky' : 'otázek'}
                    </span>
                  </div>
                </div>
                <span className="text-slate-300 dark:text-slate-500 text-xl">→</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // ─── EXERCISE PHASE ────────────────────────────────────────────────
  if (phase === 'exercise' && exercise) {
    const q = questions[currentQ];

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>← Zpět</button>
          <span className="text-sm text-slate-500 font-medium">
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentQ / questions.length) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`badge ${LEVEL_COLORS[exercise.level]}`}>{exercise.level}</span>
          <span className="text-xs text-slate-400">{TYPE_LABELS[exercise.type]}</span>
        </div>

        {/* Play controls */}
        <div className="flex flex-col items-center gap-3 mb-6">
          <PlayButton onClick={handlePlay} label={hasPlayed ? 'Přehrát znovu' : 'Přehrát'} />
          {exercise.type === 'comprehension' && (
            <SlowPlayButton onClick={handleSlowPlay} />
          )}
          {!hasPlayed && (
            <p className="text-xs text-slate-400 text-center">Klikni pro přehrání nahrávky</p>
          )}
        </div>

        {/* Question area — only show after first play */}
        {hasPlayed && q && (
          <div className="card !p-6 mb-4">
            {q.type === 'truefalse' && (
              <span className="inline-block mb-2 text-xs font-medium px-2 py-0.5 rounded bg-amber-100 text-amber-700">
                True / False
              </span>
            )}
            <h3 className="text-lg font-semibold text-slate-900 mb-4">{q.question}</h3>

            {/* MCQ / TrueFalse options */}
            {(q.type === 'mcq' || q.type === 'truefalse') && q.options && (
              <>
                {!showAnswer ? (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <button
                        key={i}
                        className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          answers[currentQ] === i
                            ? 'border-primary-500 bg-primary-50'
                            : 'border-slate-100 hover:border-slate-200'
                        }`}
                        onClick={() => selectOption(currentQ, i)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={`px-4 py-3 rounded-xl border-2 ${
                          i === q.answerIndex
                            ? 'border-green-500 bg-green-50'
                            : answers[currentQ] === i
                            ? 'border-red-500 bg-red-50'
                            : 'border-slate-100'
                        }`}
                      >
                        {opt} {i === q.answerIndex && ' ✓'}
                      </div>
                    ))}
                    <div className={`mt-3 p-3 rounded-xl ${isCurrentCorrect() ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className={`text-sm font-medium ${isCurrentCorrect() ? 'text-green-700' : 'text-red-700'}`}>
                        {isCurrentCorrect() ? '✅ Správně!' : '❌ Špatně.'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Fill-in input */}
            {q.type === 'fill' && (
              <>
                {!showAnswer ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input w-full"
                      placeholder="Napiš odpověď…"
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && fillInput.trim()) submitFill();
                      }}
                    />
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className={`px-4 py-3 rounded-xl border-2 ${
                      isCurrentCorrect()
                        ? 'border-green-500 bg-green-50'
                        : 'border-red-500 bg-red-50'
                    }`}>
                      <p className="text-sm">
                        Tvá odpověď: <strong>{answers[currentQ] as string}</strong>
                      </p>
                      {!isCurrentCorrect() && (
                        <p className="text-sm mt-1">
                          Správně: <strong className="text-green-700">{q.answer}</strong>
                        </p>
                      )}
                    </div>
                    <div className={`mt-3 p-3 rounded-xl ${isCurrentCorrect() ? 'bg-green-50' : 'bg-red-50'}`}>
                      <p className={`text-sm font-medium ${isCurrentCorrect() ? 'text-green-700' : 'text-red-700'}`}>
                        {isCurrentCorrect() ? '✅ Správně!' : '❌ Špatně.'}
                      </p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Action buttons */}
        {hasPlayed && q && (
          <>
            {q.type === 'fill' ? (
              !showAnswer ? (
                <button
                  className="btn-primary btn-lg w-full"
                  disabled={!fillInput.trim()}
                  onClick={submitFill}
                >
                  Zkontrolovat
                </button>
              ) : (
                <button className="btn-primary btn-lg w-full" onClick={nextQuestion}>
                  {currentQ + 1 >= questions.length ? 'Zobrazit výsledky' : 'Další otázka →'}
                </button>
              )
            ) : (
              !showAnswer ? (
                <button
                  className="btn-primary btn-lg w-full"
                  disabled={answers[currentQ] === null}
                  onClick={checkAnswer}
                >
                  Zkontrolovat
                </button>
              ) : (
                <button className="btn-primary btn-lg w-full" onClick={nextQuestion}>
                  {currentQ + 1 >= questions.length ? 'Zobrazit výsledky' : 'Další otázka →'}
                </button>
              )
            )}
          </>
        )}
      </div>
    );
  }

  // ─── RESULT PHASE ──────────────────────────────────────────────────
  if (phase === 'result' && exercise) {
    const { correct, total, pct } = computeScore();

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {TYPE_LABELS[exercise.type]} — {exercise.topic}
        </h2>
        <p className="text-slate-600 mb-1">
          {correct} / {total} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80
            ? 'Výborný poslech!'
            : pct >= 50
            ? 'Dobrý výsledek, pokračuj dál.'
            : 'Zkus si cvičení pustit znovu.'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setExercise(null);
            }}
          >
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  return null;
}
