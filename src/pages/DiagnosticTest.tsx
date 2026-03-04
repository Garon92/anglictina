import { useState, useEffect, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, saveStats } from '../db';
import { DIAGNOSTIC_QUESTIONS, DIAGNOSTIC_SCORING } from '../data/diagnostic';
import type { DiagnosticQuestion } from '../data/diagnostic';

type Level = 'A1' | 'A2' | 'B1';
type Skill = 'vocab' | 'grammar' | 'reading';
type Phase = 'intro' | 'test' | 'results' | 'review';

interface Answer {
  questionId: string;
  userAnswer: string;
  correct: boolean;
  points: number;
}

const LEVEL_COLORS: Record<Level, { bg: string; text: string; border: string; ring: string }> = {
  A1: { bg: 'bg-green-500', text: 'text-green-400', border: 'border-green-500', ring: 'ring-green-500/30' },
  A2: { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500', ring: 'ring-blue-500/30' },
  B1: { bg: 'bg-purple-500', text: 'text-purple-400', border: 'border-purple-500', ring: 'ring-purple-500/30' },
};

const LEVEL_EMOJI: Record<Level, string> = { A1: '🌱', A2: '📘', B1: '🎓' };

const SKILL_LABELS: Record<Skill, string> = {
  vocab: 'Slovíčka',
  grammar: 'Gramatika',
  reading: 'Čtení',
};

function isCorrect(q: DiagnosticQuestion, userAnswer: string): boolean {
  if (q.type === 'mcq') {
    return q.options?.[q.answerIndex!] === userAnswer;
  }
  return userAnswer.trim().toLowerCase() === q.answer?.trim().toLowerCase();
}

function getCorrectAnswer(q: DiagnosticQuestion): string {
  if (q.type === 'mcq') return q.options![q.answerIndex!];
  return q.answer!;
}

export default function DiagnosticTest() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [fillInput, setFillInput] = useState('');
  const [feedback, setFeedback] = useState<{ correct: boolean; correctAnswer: string } | null>(null);
  const [lastDiagnostic, setLastDiagnostic] = useState<{ date: string; level: Level } | null>(null);
  const [allScores, setAllScores] = useState<{ date: string; score: number; maxScore: number }[]>([]);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const currentQ = DIAGNOSTIC_QUESTIONS[currentIdx];

  useEffect(() => {
    getStats().then((stats) => {
      if (stats.diagnosticScores.length > 0) {
        const last = stats.diagnosticScores[stats.diagnosticScores.length - 1];
        setLastDiagnostic({
          date: last.date,
          level: DIAGNOSTIC_SCORING.getLevel(last.score),
        });
        setAllScores(stats.diagnosticScores);
      }
    });
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

  useEffect(() => {
    if (phase === 'test' && currentQ?.type === 'fill') {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [phase, currentIdx, currentQ?.type]);

  function handleAnswer(userAnswer: string) {
    const q = currentQ;
    const correct = isCorrect(q, userAnswer);
    const points = correct ? DIAGNOSTIC_SCORING.pointsPerLevel[q.level] : 0;
    const newAnswer: Answer = { questionId: q.id, userAnswer, correct, points };

    setAnswers((prev) => [...prev, newAnswer]);
    setFeedback({ correct, correctAnswer: getCorrectAnswer(q) });

    advanceTimer.current = setTimeout(() => {
      setFeedback(null);
      setFillInput('');
      if (currentIdx + 1 < totalQuestions) {
        setCurrentIdx((i) => i + 1);
      } else {
        finishTest([...answers, newAnswer]);
      }
    }, 1000);
  }

  async function finishTest(finalAnswers: Answer[]) {
    startTransition(() => setPhase('results'));
    if (saved) return;
    const totalScore = finalAnswers.reduce((sum, a) => sum + a.points, 0);
    const stats = await getStats();
    stats.diagnosticScores.push({
      date: new Date().toISOString().slice(0, 10),
      score: totalScore,
      maxScore: DIAGNOSTIC_SCORING.maxPoints,
    });
    await saveStats(stats);
    setSaved(true);
  }

  const totalScore = answers.reduce((sum, a) => sum + a.points, 0);
  const determinedLevel = DIAGNOSTIC_SCORING.getLevel(totalScore);

  function getBreakdownByLevel(level: Level) {
    const qs = DIAGNOSTIC_QUESTIONS.filter((q) => q.level === level);
    const correct = qs.filter((q) => answers.find((a) => a.questionId === q.id)?.correct).length;
    return { correct, total: qs.length };
  }

  function getBreakdownBySkill(skill: Skill) {
    const qs = DIAGNOSTIC_QUESTIONS.filter((q) => q.skill === skill);
    const correct = qs.filter((q) => answers.find((a) => a.questionId === q.id)?.correct).length;
    return { correct, total: qs.length };
  }

  function getRecommendation(): string {
    const skills: { skill: Skill; pct: number }[] = (['vocab', 'grammar', 'reading'] as Skill[]).map((s) => {
      const b = getBreakdownBySkill(s);
      return { skill: s, pct: b.total > 0 ? b.correct / b.total : 0 };
    });
    skills.sort((a, b) => a.pct - b.pct);
    const weakest = skills[0];

    if (weakest.pct >= 0.8) {
      return 'Skvělá práce! Máš vyrovnané znalosti ve všech oblastech. Pokračuj v procvičování.';
    }
    const labels: Record<Skill, string> = {
      vocab: 'Slovíčka jsou tvá slabá stránka. Zaměř se na rozšiřování slovní zásoby.',
      grammar: 'Gramatika je tvá slabá stránka. Zaměř se na procvičování gramatických pravidel.',
      reading: 'Čtení s porozuměním ti dělá problémy. Zkus číst více anglických textů.',
    };
    return labels[weakest.skill];
  }

  const incorrectAnswers = answers.filter((a) => !a.correct);

  // ─── INTRO ───
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-6">
          <div className="text-5xl">📝</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Diagnostický test
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Zjisti svou aktuální úroveň angličtiny
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Test má {totalQuestions} otázek se stoupající obtížností. Na konci se dozvíš svou úroveň (A1/A2/B1).
          </p>

          {allScores.length > 0 && (
            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Historie testů</p>
              {allScores.slice(-5).map((s, i) => {
                const lvl = DIAGNOSTIC_SCORING.getLevel(s.score);
                const pct = Math.round((s.score / s.maxScore) * 100);
                const prev = i > 0 ? allScores.slice(-5)[i - 1] : null;
                const diff = prev ? s.score - prev.score : 0;
                return (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{s.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${LEVEL_COLORS[lvl].text}`}>{lvl}</span>
                      <span className="text-gray-500">{pct}%</span>
                      {diff !== 0 && (
                        <span className={`text-xs font-medium ${diff > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {diff > 0 ? '+' : ''}{diff}b
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <button
            onClick={() => startTransition(() => setPhase('test'))}
            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg transition-colors"
          >
            Začít test
          </button>

          <button
            onClick={() => navigate('/')}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ← Zpět domů
          </button>
        </div>
      </div>
    );
  }

  // ─── TEST ───
  if (phase === 'test') {
    const progress = ((currentIdx + (feedback ? 1 : 0)) / totalQuestions) * 100;
    const levelColor = LEVEL_COLORS[currentQ.level];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>Otázka {currentIdx + 1}/{totalQuestions}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold text-white ${levelColor.bg}`}>
                {currentQ.level}
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
              <div
                className="h-2.5 rounded-full bg-indigo-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-6">
            <div className="flex items-start gap-3">
              <span className={`shrink-0 mt-0.5 w-8 h-8 rounded-lg ${levelColor.bg} flex items-center justify-center text-white text-xs font-bold`}>
                {currentIdx + 1}
              </span>
              <p className="text-gray-900 dark:text-white font-medium leading-relaxed">
                {currentQ.question}
              </p>
            </div>

            {/* MCQ options */}
            {currentQ.type === 'mcq' && currentQ.options && (
              <div className="space-y-3">
                {currentQ.options.map((opt, i) => {
                  let btnClass = 'w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition-all ';
                  if (feedback) {
                    if (i === currentQ.answerIndex) {
                      btnClass += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400';
                    } else if (opt === answers[answers.length - 1]?.userAnswer && !feedback.correct) {
                      btnClass += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400';
                    } else {
                      btnClass += 'border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500';
                    }
                  } else {
                    btnClass += 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20';
                  }

                  return (
                    <button
                      key={i}
                      disabled={!!feedback}
                      onClick={() => handleAnswer(opt)}
                      className={btnClass}
                    >
                      <span className="mr-2 text-xs text-gray-400">{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill input */}
            {currentQ.type === 'fill' && (
              <div className="space-y-3">
                {feedback ? (
                  <div className={`px-4 py-3 rounded-xl border-2 font-medium ${
                    feedback.correct
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}>
                    {feedback.correct ? fillInput : `${fillInput} → ${feedback.correctAnswer}`}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (fillInput.trim()) handleAnswer(fillInput.trim());
                    }}
                    className="flex gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={fillInput}
                      onChange={(e) => setFillInput(e.target.value)}
                      placeholder="Napiš odpověď..."
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 transition-colors"
                      autoComplete="off"
                      autoCapitalize="off"
                    />
                    <button
                      type="submit"
                      disabled={!fillInput.trim()}
                      className="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white font-bold transition-colors"
                    >
                      Potvrdit
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Feedback indicator */}
            {feedback && (
              <div className={`text-center text-sm font-bold ${feedback.correct ? 'text-green-500' : 'text-red-500'}`}>
                {feedback.correct ? '✓ Správně!' : '✗ Špatně'}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── RESULTS ───
  if (phase === 'results') {
    const levelColor = LEVEL_COLORS[determinedLevel];
    const a1 = getBreakdownByLevel('A1');
    const a2 = getBreakdownByLevel('A2');
    const b1 = getBreakdownByLevel('B1');

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto space-y-6 py-8">
          {/* Level badge */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 text-center space-y-4">
            <div className="text-5xl">{LEVEL_EMOJI[determinedLevel]}</div>
            <div className={`inline-block px-6 py-3 rounded-2xl text-3xl font-black text-white ${levelColor.bg} ring-4 ${levelColor.ring}`}>
              {determinedLevel}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Tvá úroveň: {determinedLevel}
            </h1>
            <p className="text-2xl font-bold text-gray-700 dark:text-gray-300">
              {totalScore}/{DIAGNOSTIC_SCORING.maxPoints} bodů
            </p>
            {allScores.length > 1 && (() => {
              const prevScore = allScores[allScores.length - 2];
              const diff = totalScore - prevScore.score;
              const prevLevel = DIAGNOSTIC_SCORING.getLevel(prevScore.score);
              return (
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Oproti minule ({prevScore.date}, {prevLevel}):{' '}
                  <span className={`font-bold ${diff > 0 ? 'text-green-500' : diff < 0 ? 'text-red-500' : 'text-gray-500'}`}>
                    {diff > 0 ? '+' : ''}{diff} bodů
                  </span>
                </div>
              );
            })()}
          </div>

          {/* Breakdown by level */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Výsledky podle úrovně</h2>
            {([['A1', a1], ['A2', a2], ['B1', b1]] as [Level, { correct: number; total: number }][]).map(([level, data]) => (
              <div key={level} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className={`font-bold ${LEVEL_COLORS[level].text}`}>{level} otázky</span>
                  <span className="text-gray-600 dark:text-gray-400">{data.correct}/{data.total} správně</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${LEVEL_COLORS[level].bg} transition-all duration-700`}
                    style={{ width: `${data.total > 0 ? (data.correct / data.total) * 100 : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown by skill */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
            <h2 className="font-bold text-gray-900 dark:text-white">Výsledky podle dovednosti</h2>
            {(['vocab', 'grammar', 'reading'] as Skill[]).map((skill) => {
              const data = getBreakdownBySkill(skill);
              const pct = data.total > 0 ? (data.correct / data.total) * 100 : 0;
              return (
                <div key={skill} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-gray-700 dark:text-gray-300">{SKILL_LABELS[skill]}</span>
                    <span className="text-gray-600 dark:text-gray-400">{data.correct}/{data.total} ({Math.round(pct)}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ${
                        pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recommendation */}
          <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-5">
            <p className="text-sm font-medium text-indigo-800 dark:text-indigo-300 flex items-start gap-2">
              <span className="text-lg">💡</span>
              <span>{getRecommendation()}</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {incorrectAnswers.length > 0 && (
              <button
                onClick={() => startTransition(() => setPhase('review'))}
                className="flex-1 py-3 rounded-xl border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
              >
                Zobrazit chyby ({incorrectAnswers.length})
              </button>
            )}
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
            >
              Domů
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── REVIEW ───
  if (phase === 'review') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-lg mx-auto space-y-4 py-8">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Chyby ({incorrectAnswers.length})
            </h1>
            <button
              onClick={() => startTransition(() => setPhase('results'))}
              className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
            >
              ← Zpět na výsledky
            </button>
          </div>

          {incorrectAnswers.map((a) => {
            const q = DIAGNOSTIC_QUESTIONS.find((qq) => qq.id === a.questionId)!;
            const levelColor = LEVEL_COLORS[q.level];
            return (
              <div key={a.questionId} className="bg-white dark:bg-gray-800 rounded-2xl shadow p-5 space-y-3">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${levelColor.bg}`}>
                    {q.level}
                  </span>
                  <span className="text-xs text-gray-400">{SKILL_LABELS[q.skill]}</span>
                </div>
                <p className="text-gray-900 dark:text-white font-medium text-sm leading-relaxed">
                  {q.question}
                </p>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                    <span className="font-bold">✗</span>
                    <span>Tvá odpověď: <span className="font-medium">{a.userAnswer}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <span className="font-bold">✓</span>
                    <span>Správná odpověď: <span className="font-medium">{getCorrectAnswer(q)}</span></span>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-3 text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                  {q.explanationCs}
                </div>
              </div>
            );
          })}

          <button
            onClick={() => startTransition(() => setPhase('results'))}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors"
          >
            Zpět na výsledky
          </button>
        </div>
      </div>
    );
  }

  return null;
}
