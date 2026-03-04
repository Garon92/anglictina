import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { getErrorAnalysis, getModuleLabel, type ErrorEntry } from '../errorTracker';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

interface QuizItem {
  error: ErrorEntry;
  options: string[];
  correctIndex: number;
}

function buildQuiz(errors: ErrorEntry[]): QuizItem[] {
  const unique = new Map<string, ErrorEntry>();
  for (const e of errors) {
    const key = `${e.question}|${e.correctAnswer}`;
    unique.set(key, e);
  }

  const items = shuffleArray([...unique.values()]).slice(0, 20);
  const allAnswers = [...new Set(errors.map((e) => e.correctAnswer))];

  return items.map((error) => {
    const sameModuleWrongs = shuffleArray(
      errors
        .filter((e) => e.correctAnswer !== error.correctAnswer && e.module === error.module)
        .map((e) => e.correctAnswer)
    );
    const crossModuleWrongs = shuffleArray(
      allAnswers.filter((a) => a !== error.correctAnswer)
    );

    const wrongSet = new Set<string>();
    for (const w of sameModuleWrongs) { if (wrongSet.size >= 3) break; wrongSet.add(w); }
    for (const w of crossModuleWrongs) { if (wrongSet.size >= 3) break; wrongSet.add(w); }
    if (error.userAnswer && error.userAnswer !== error.correctAnswer) {
      wrongSet.add(error.userAnswer);
    }

    const wrongOptions = shuffleArray([...wrongSet]).slice(0, 3);
    const allOptions = [error.correctAnswer, ...wrongOptions];
    const deduped = [...new Set(allOptions)];
    const shuffled = shuffleArray(deduped);
    return {
      error,
      options: shuffled,
      correctIndex: shuffled.indexOf(error.correctAnswer),
    };
  });
}

export default function MistakeDrill() {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [noErrors, setNoErrors] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const analysis = getErrorAnalysis();
    if (analysis.totalErrors < 3) {
      setNoErrors(true);
      return;
    }
    const allErrors = JSON.parse(localStorage.getItem('anglictina_errors') || '[]') as ErrorEntry[];
    setQuiz(buildQuiz(allErrors));
  }, []);

  async function finish(finalScore: number) {
    const stats = await getStats();
    stats.totalExercisesDone += quiz.length;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();
    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'mixed',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: quiz.length,
      correctItems: finalScore,
      tags: ['mistake_drill'],
    });
    setDone(true);
    playComplete();
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === quiz[current].correctIndex;
    if (correct) { setScore((s) => s + 1); playCorrect(); }
    else playIncorrect();

    setTimeout(() => {
      if (current + 1 >= quiz.length) {
        finish(score + (correct ? 1 : 0));
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1500);
  }

  if (noErrors) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Žádné chyby k procvičení!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Ještě nemáš dost zaznamenaných chyb. Vrať se po pár cvičeních.
        </p>
        <button className="btn-primary" onClick={() => navigate('/')}>Domů</button>
      </div>
    );
  }

  if (quiz.length === 0) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 animate-pulse">Připravuji cvičení z tvých chyb...</p>
      </div>
    );
  }

  if (done) {
    const pct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Opakování hotovo!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">
          {score} / {quiz.length} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80 ? 'Výborně! Chyby se učíš z nich.' : pct >= 50 ? 'Dobrá práce, pokračuj.' : 'Nevadí, opakování dělá mistra!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={() => navigate('/review')}>Statistiky</button>
        </div>
      </div>
    );
  }

  const item = quiz[current];

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => navigate('/')}>← Zpět</button>
        <span className="text-sm text-slate-500 font-medium">{current + 1} / {quiz.length}</span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div className="bg-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${((current + 1) / quiz.length) * 100}%` }} />
      </div>

      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">Opakování chyby</span>
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs">
            {getModuleLabel(item.error.module)}
          </span>
        </div>

        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 leading-relaxed">
          {item.error.question}
        </h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Minule jsi odpověděl/a: <span className="text-red-500 font-medium">{item.error.userAnswer}</span>
        </p>

        <div className="space-y-2">
          {item.options.map((opt, idx) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ';
            if (selected === null) {
              cls += 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 text-slate-700 dark:text-slate-200';
            } else if (idx === item.correctIndex) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium';
            } else if (idx === selected) {
              cls += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            } else {
              cls += 'border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500 opacity-60';
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
