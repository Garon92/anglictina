import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

interface SpeedQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  type: 'vocab' | 'grammar';
}

function generateQuestions(): SpeedQuestion[] {
  const questions: SpeedQuestion[] = [];

  const richVocab = VOCABULARY.filter((w) => w.example !== '' && w.cs);
  const vocabPool = shuffleArray(richVocab).slice(0, 100);
  for (let i = 0; i < 10; i++) {
    const word = vocabPool[i];
    const wrongs = shuffleArray(vocabPool.filter((w) => w.id !== word.id)).slice(0, 3).map((w) => w.cs);
    const opts = shuffleArray([word.cs, ...wrongs]);
    questions.push({
      question: `"${word.en}" znamená:`,
      options: opts,
      correctIndex: opts.indexOf(word.cs),
      type: 'vocab',
    });
  }

  const mcqPool = shuffleArray(GRAMMAR_EXERCISES.filter((e) => e.type === 'mcq' && e.options)).slice(0, 10);
  for (const ex of mcqPool) {
    questions.push({
      question: ex.prompt,
      options: ex.options!,
      correctIndex: ex.options!.indexOf(ex.answer),
      type: 'grammar',
    });
  }

  return shuffleArray(questions);
}

export default function SpeedChallenge() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<'intro' | 'game' | 'result'>('intro');
  const [questions] = useState(generateQuestions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [totalTime, setTotalTime] = useState(0);
  const [times, setTimes] = useState<number[]>([]);
  const [startTime, setStartTime] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStart = useRef(Date.now());

  const nextQuestion = useCallback(() => {
    const elapsed = (Date.now() - questionStart.current) / 1000;
    setTimes((t) => [...t, elapsed]);

    if (current + 1 >= questions.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('result');
      playComplete();
      (async () => {
        const stats = await getStats();
        stats.totalExercisesDone += questions.length;
        stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
        await saveStats(stats);
        await updateStreak();
        await addDrillSession({
          date: new Date().toISOString().slice(0, 10),
          type: 'mixed',
          startedAt: startTime,
          endedAt: Date.now(),
          totalItems: questions.length,
          correctItems: score,
          tags: ['speed_challenge'],
        });
      })();
      return;
    }

    setCurrent((c) => c + 1);
    setSelected(null);
    setTimeLeft(10);
    questionStart.current = Date.now();
  }, [current, questions.length, score, startTime]);

  useEffect(() => {
    if (phase !== 'game') return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 0.1) {
          playIncorrect();
          nextQuestion();
          return 10;
        }
        return t - 0.1;
      });
      setTotalTime((t) => t + 0.1);
    }, 100);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, nextQuestion]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[current].correctIndex;
    if (correct) { setScore((s) => s + 1); playCorrect(); }
    else playIncorrect();
    setTimeout(nextQuestion, 600);
  }

  function startGame() {
    setPhase('game');
    setStartTime(Date.now());
    questionStart.current = Date.now();
    setTimeLeft(10);
  }

  if (phase === 'intro') {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Rychlostní výzva</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-2">
          20 otázek. 10 sekund na každou. Jak rychle zvládneš?
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-8">
          Mix slovíček a gramatiky. Bez přemýšlení!
        </p>
        <button className="btn-primary btn-lg" onClick={startGame}>Start!</button>
        <button className="btn-ghost text-sm mt-4" onClick={() => navigate('/')}>← Zpět</button>
      </div>
    );
  }

  if (phase === 'result') {
    const pct = Math.round((score / questions.length) * 100);
    const avgTime = times.length > 0 ? (times.reduce((a, b) => a + b, 0) / times.length).toFixed(1) : '0';
    const fastestTime = times.length > 0 ? Math.min(...times).toFixed(1) : '0';

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '⚡' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hotovo!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-4">
          {score} / {questions.length} správně ({pct}%)
        </p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="card text-center !p-3">
            <div className="text-xl font-bold text-primary-600 dark:text-primary-400">{Math.round(totalTime)}s</div>
            <div className="text-xs text-slate-400">celkový čas</div>
          </div>
          <div className="card text-center !p-3">
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{avgTime}s</div>
            <div className="text-xs text-slate-400">průměr/otázka</div>
          </div>
          <div className="card text-center !p-3">
            <div className="text-xl font-bold text-green-600 dark:text-green-400">{fastestTime}s</div>
            <div className="text-xs text-slate-400">nejrychlejší</div>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={() => { setCurrent(0); setSelected(null); setScore(0); setTotalTime(0); setTimes([]); startGame(); }}>
            Znovu
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  const timerPct = (timeLeft / 10) * 100;
  const timerColor = timeLeft > 5 ? 'bg-green-500' : timeLeft > 2 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{current + 1}/{questions.length}</span>
        <span className={`text-lg font-bold ${timeLeft <= 3 ? 'text-red-500 animate-pulse' : 'text-slate-700 dark:text-slate-200'}`}>
          {Math.ceil(timeLeft)}s
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mb-6">
        <div className={`${timerColor} h-full rounded-full transition-all duration-100`} style={{ width: `${timerPct}%` }} />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className={`badge text-xs ${q.type === 'vocab' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'}`}>
            {q.type === 'vocab' ? 'Slovíčko' : 'Gramatika'}
          </span>
          <span className="text-xs text-slate-400">Skóre: {score}</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">{q.question}</h3>
        <div className="grid grid-cols-2 gap-2">
          {q.options.map((opt, idx) => {
            let cls = 'px-3 py-3 rounded-xl border-2 text-center text-sm font-medium transition-all ';
            if (selected === null) {
              cls += 'border-slate-200 dark:border-slate-600 hover:border-primary-400 text-slate-700 dark:text-slate-200 active:scale-95';
            } else if (idx === q.correctIndex) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
            } else if (idx === selected) {
              cls += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            } else {
              cls += 'border-slate-200 dark:border-slate-600 text-slate-400 opacity-50';
            }
            return (
              <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={selected !== null}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
