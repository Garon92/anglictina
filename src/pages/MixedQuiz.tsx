import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { IDIOMS } from '../data/idioms';
import { CONDITIONAL_EXERCISES } from '../data/conditionals';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';

interface QuizQ {
  module: string;
  moduleLabel: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

function generateMixedQuiz(count: number): QuizQ[] {
  const questions: QuizQ[] = [];

  const vocabPool = shuffleArray(VOCABULARY.filter((w) => w.cs && w.example)).slice(0, count * 2);
  for (const w of vocabPool.slice(0, Math.ceil(count * 0.25))) {
    const wrongs = shuffleArray(vocabPool.filter((v) => v.id !== w.id)).slice(0, 3).map((v) => v.cs);
    const opts = shuffleArray([w.cs, ...wrongs]);
    questions.push({
      module: 'vocab', moduleLabel: 'Slovíčka',
      question: `Co znamená "${w.en}"?`,
      options: opts, correctIndex: opts.indexOf(w.cs),
    });
  }

  const gramPool = shuffleArray(GRAMMAR_EXERCISES.filter((e) => e.type === 'mcq' && e.options && e.options.length === 4));
  for (const e of gramPool.slice(0, Math.ceil(count * 0.2))) {
    questions.push({
      module: 'grammar', moduleLabel: 'Gramatika',
      question: e.prompt,
      options: e.options!, correctIndex: e.options!.indexOf(e.answer),
      explanation: e.explanationCs,
    });
  }

  const irregPool = shuffleArray(IRREGULAR_VERBS);
  for (const v of irregPool.slice(0, Math.ceil(count * 0.15))) {
    const wrongs = shuffleArray(irregPool.filter((iv) => iv.id !== v.id)).slice(0, 3).map((iv) => `${iv.past} / ${iv.pastParticiple}`);
    const correct = `${v.past} / ${v.pastParticiple}`;
    const opts = shuffleArray([correct, ...wrongs]);
    questions.push({
      module: 'irregular', moduleLabel: 'Neprav. slovesa',
      question: `Jaké jsou tvary slovesa "${v.base}"? (past / past participle)`,
      options: opts, correctIndex: opts.indexOf(correct),
      explanation: v.meaningCs,
    });
  }

  const idiomPool = shuffleArray(IDIOMS);
  for (const id of idiomPool.slice(0, Math.ceil(count * 0.15))) {
    const wrongs = shuffleArray(idiomPool.filter((i) => i.id !== id.id)).slice(0, 3).map((i) => i.meaningCs);
    const opts = shuffleArray([id.meaningCs, ...wrongs]);
    questions.push({
      module: 'idioms', moduleLabel: 'Idiomy',
      question: `Co znamená "${id.idiom}"?`,
      options: opts, correctIndex: opts.indexOf(id.meaningCs),
      explanation: id.example,
    });
  }

  const condPool = shuffleArray(CONDITIONAL_EXERCISES.filter((e) => e.type === 'mcq' && e.options));
  for (const e of condPool.slice(0, Math.ceil(count * 0.15))) {
    questions.push({
      module: 'conditionals', moduleLabel: 'Podmínky',
      question: e.prompt,
      options: e.options!, correctIndex: e.options!.indexOf(e.answer),
      explanation: e.explanationCs,
    });
  }

  const reverseVocab = shuffleArray(VOCABULARY.filter((w) => w.cs && w.example)).slice(0, count);
  for (const w of reverseVocab.slice(0, Math.ceil(count * 0.1))) {
    const wrongs = shuffleArray(reverseVocab.filter((v) => v.id !== w.id)).slice(0, 3).map((v) => v.en);
    const opts = shuffleArray([w.en, ...wrongs]);
    questions.push({
      module: 'vocab', moduleLabel: 'Slovíčka (CZ→EN)',
      question: `Jak se anglicky řekne "${w.cs}"?`,
      options: opts, correctIndex: opts.indexOf(w.en),
    });
  }

  return shuffleArray(questions).slice(0, count);
}

const MODULE_COLORS: Record<string, string> = {
  vocab: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  grammar: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  irregular: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  idioms: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  conditionals: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
};

export default function MixedQuiz() {
  const navigate = useNavigate();
  const [quizSize, setQuizSize] = useState(30);
  const [started, setStarted] = useState(false);
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState<{ q: QuizQ; picked: number }[]>([]);

  const moduleStats = useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {};
    for (const q of questions) {
      if (!stats[q.moduleLabel]) stats[q.moduleLabel] = { total: 0, correct: 0 };
      stats[q.moduleLabel].total++;
    }
    for (const wa of wrongAnswers) {
      if (stats[wa.q.moduleLabel]) stats[wa.q.moduleLabel].correct--;
    }
    for (const q of questions) {
      if (stats[q.moduleLabel]) stats[q.moduleLabel].correct = stats[q.moduleLabel].total;
    }
    for (const wa of wrongAnswers) {
      if (stats[wa.q.moduleLabel]) stats[wa.q.moduleLabel].correct--;
    }
    return stats;
  }, [questions, wrongAnswers]);

  function start() {
    setQuestions(generateMixedQuiz(quizSize));
    setStarted(true);
    setStartTime(Date.now());
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setWrongAnswers([]);
  }

  const handleFinish = useCallback(async (finalScore: number) => {
    setDone(true);
    playComplete();
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
      correctItems: finalScore,
      tags: ['mixed_quiz'],
    });
  }, [questions, startTime]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const q = questions[current];
    const correct = idx === q.correctIndex;
    if (correct) { setScore((s) => s + 1); playCorrect(); }
    else {
      playIncorrect();
      trackError('mixed', q.module, q.question, q.options[idx], q.options[q.correctIndex]);
      setWrongAnswers((prev) => [...prev, { q, picked: idx }]);
    }

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        handleFinish(score + (correct ? 1 : 0));
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1200);
  }

  if (!started) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">🎲</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Celkový mix kvíz</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Náhodné otázky ze slovíček, gramatiky, sloves, idiomů i podmínek. Jak moc toho umíš?
        </p>
        <div className="flex gap-2 mb-6">
          {[15, 30, 50].map((n) => (
            <button
              key={n}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${quizSize === n ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
              onClick={() => setQuizSize(n)}
            >
              {n} otázek
            </button>
          ))}
        </div>
        <button className="btn-primary btn-lg" onClick={start}>Začít!</button>
        <button className="btn-ghost text-sm mt-4" onClick={() => navigate('/')}>← Zpět</button>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    return (
      <div className="page-container">
        <div className="text-center mb-6">
          <div className="text-6xl mb-3">{pct >= 80 ? '🏆' : pct >= 60 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Hotovo!</h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">{score} / {questions.length} ({pct}%)</p>
          <p className="text-sm text-slate-400">za {elapsed}s</p>
        </div>

        <div className="card mb-4">
          <h3 className="section-title">Podle modulů</h3>
          <div className="space-y-2">
            {Object.entries(moduleStats).map(([label, s]) => (
              <div key={label} className="flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
                <span className="font-medium text-slate-900 dark:text-white">{s.correct}/{s.total}</span>
              </div>
            ))}
          </div>
        </div>

        {wrongAnswers.length > 0 && (
          <div className="card mb-4">
            <h3 className="section-title">Chyby ({wrongAnswers.length})</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {wrongAnswers.map((wa, i) => (
                <div key={i} className="text-sm border-b border-slate-100 dark:border-slate-700 pb-2">
                  <p className="text-slate-700 dark:text-slate-300 mb-1">{wa.q.question}</p>
                  <p className="text-red-500 text-xs">Tvoje: {wa.q.options[wa.picked]}</p>
                  <p className="text-green-600 dark:text-green-400 text-xs">Správně: {wa.q.options[wa.q.correctIndex]}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={start}>Znovu</button>
        </div>
      </div>
    );
  }

  const q = questions[current];
  if (!q) return null;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{current + 1}/{questions.length}</span>
        <span className="text-sm text-slate-400">Skóre: {score}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div className="bg-primary-500 h-full rounded-full transition-all duration-300" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="card !p-6 mb-4">
        <span className={`badge text-[10px] mb-3 ${MODULE_COLORS[q.module] || 'bg-slate-100 text-slate-600'}`}>
          {q.moduleLabel}
        </span>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 leading-relaxed">{q.question}</h3>
        <div className="space-y-2">
          {q.options.map((opt, idx) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ';
            if (selected === null) {
              cls += 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 text-slate-700 dark:text-slate-200';
            } else if (idx === q.correctIndex) {
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
        {selected !== null && q.explanation && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 italic">{q.explanation}</p>
        )}
      </div>
    </div>
  );
}
