import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, addExamSession, getStats, saveStats, updateStreak } from '../db';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { READING_TEXTS } from '../data/reading';
import { VOCABULARY } from '../data/vocabulary';
import { shuffleArray, pickRandom } from '../utils';

type Phase = 'menu' | 'timer' | 'mixed_drill' | 'result';

interface MixedQuestion {
  type: 'vocab' | 'grammar' | 'reading';
  question: string;
  options: string[];
  answerIndex: number;
  category?: string;
}

export default function ExamSim() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('menu');

  // Timer mode
  const [timerMinutes, setTimerMinutes] = useState(110);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const intervalRef = useRef<number>(0);

  // Mixed drill mode
  const [questions, setQuestions] = useState<MixedQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState({ correct: 0, total: 0, byType: { vocab: [0, 0], grammar: [0, 0], reading: [0, 0] } });
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function startTimer() {
    setTimerSeconds(timerMinutes * 60);
    setTimerRunning(true);
    setPhase('timer');

    intervalRef.current = window.setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setTimerRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function stopTimer() {
    clearInterval(intervalRef.current);
    setTimerRunning(false);
    setPhase('menu');
  }

  function generateMixedQuestions(): MixedQuestion[] {
    const result: MixedQuestion[] = [];

    const vocabWords = pickRandom(VOCABULARY, 15);
    for (const word of vocabWords) {
      const wrong = pickRandom(
        VOCABULARY.filter((w) => w.id !== word.id).map((w) => w.cs),
        3
      );
      const options = shuffleArray([word.cs, ...wrong]);
      result.push({
        type: 'vocab',
        question: `Co znamená "${word.en}"?`,
        options,
        answerIndex: options.indexOf(word.cs),
      });
    }

    const grammarExs = pickRandom(
      GRAMMAR_EXERCISES.filter((e) => e.type === 'mcq' && e.options),
      10
    );
    for (const ex of grammarExs) {
      result.push({
        type: 'grammar',
        question: ex.prompt,
        options: ex.options!,
        answerIndex: ex.options!.indexOf(ex.answer),
        category: ex.category,
      });
    }

    const readingTexts = pickRandom(READING_TEXTS, 2);
    for (const text of readingTexts) {
      for (const q of text.questions.slice(0, 3)) {
        result.push({
          type: 'reading',
          question: `[${text.title}] ${q.question}`,
          options: q.options,
          answerIndex: q.answerIndex,
        });
      }
    }

    return shuffleArray(result);
  }

  function startMixedDrill() {
    const qs = generateMixedQuestions();
    setQuestions(qs);
    setCurrentQ(0);
    setSelectedAnswer(null);
    setShowAnswer(false);
    setScore({ correct: 0, total: 0, byType: { vocab: [0, 0], grammar: [0, 0], reading: [0, 0] } });
    setStartTime(Date.now());
    setPhase('mixed_drill');
  }

  function checkMixedAnswer() {
    setShowAnswer(true);
    const q = questions[currentQ];
    const isCorrect = selectedAnswer === q.answerIndex;
    setScore((prev) => {
      const newScore = { ...prev };
      newScore.total += 1;
      if (isCorrect) newScore.correct += 1;
      const bt = newScore.byType[q.type];
      bt[1] += 1;
      if (isCorrect) bt[0] += 1;
      return newScore;
    });
  }

  function nextMixedQ() {
    if (currentQ + 1 >= questions.length) {
      finishMixed();
    } else {
      setCurrentQ((i) => i + 1);
      setSelectedAnswer(null);
      setShowAnswer(false);
    }
  }

  async function finishMixed() {
    const stats = await getStats();
    stats.totalExercisesDone += score.total;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'exam',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: score.total,
      correctItems: score.correct,
      tags: ['exam', 'mixed'],
    });

    const scaledScore = Math.round((score.correct / score.total) * 100);
    await addExamSession({
      type: 'internal',
      startedAt: startTime,
      endedAt: Date.now(),
      scoreTotal: scaledScore,
      maxScore: 100,
      scoreBySkill: {
        listening: 0,
        reading: Math.round((score.byType.reading[0] / Math.max(1, score.byType.reading[1])) * 40),
        language: Math.round(
          ((score.byType.vocab[0] + score.byType.grammar[0]) /
            Math.max(1, score.byType.vocab[1] + score.byType.grammar[1])) *
            60
        ),
      },
      notes: '',
    });

    setPhase('result');
  }

  if (phase === 'menu') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Simulace zkoušky</h1>
        <p className="page-subtitle">Procvič si formát maturitního testu.</p>

        <div className="space-y-4">
          <div className="card-hover cursor-pointer" onClick={startMixedDrill}>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-slate-900">Mini-test</h3>
                <p className="text-sm text-slate-500">
                  ~30 otázek ze slovíček, gramatiky a čtení. Výsledek ve formátu bodového hodnocení.
                </p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-2xl">⏱️</div>
              <div>
                <h3 className="font-bold text-slate-900">Časovač pro oficiální test</h3>
                <p className="text-sm text-slate-500">
                  Otevři si PDF test z CERMAT vedle a spusť odpočet. Dělej jako na reálné maturitě.
                </p>
              </div>
            </div>
            <label className="block mb-3">
              <span className="text-sm text-slate-600">Čas ({timerMinutes} minut)</span>
              <input
                type="range"
                className="w-full mt-1"
                min={10}
                max={120}
                step={5}
                value={timerMinutes}
                onChange={(e) => setTimerMinutes(+e.target.value)}
              />
              <div className="flex justify-between text-xs text-slate-400">
                <span>10 min</span>
                <span>Oficiální: 110 min</span>
                <span>120 min</span>
              </div>
            </label>
            <button className="btn-primary w-full" onClick={startTimer}>
              Spustit časovač
            </button>
          </div>

          <div className="card bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">💡 Kde najdeš oficiální testy?</h3>
            <p className="text-sm text-blue-700 mb-3">
              CERMAT zveřejňuje testy z předchozích let včetně poslechů a klíčů správných odpovědí.
            </p>
            <a
              href="https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi"
              target="_blank"
              rel="noopener noreferrer"
              className="btn bg-blue-600 text-white hover:bg-blue-700 text-sm"
            >
              Otevřít CERMAT →
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'timer') {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    const progress = 1 - timerSeconds / (timerMinutes * 60);

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[70vh]">
        <div className="text-center mb-8">
          <p className="text-sm text-slate-500 mb-2">Zbývající čas</p>
          <div className={`text-6xl font-mono font-bold ${timerSeconds < 300 ? 'text-red-500' : timerSeconds < 600 ? 'text-amber-500' : 'text-slate-900'}`}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
        </div>

        <div className="w-full max-w-xs mb-8">
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${timerSeconds < 300 ? 'bg-red-500' : timerSeconds < 600 ? 'bg-amber-500' : 'bg-primary-500'}`}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>

        {timerSeconds === 0 ? (
          <div className="text-center">
            <div className="text-5xl mb-4">⏰</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Čas vypršel!</h2>
            <button className="btn-primary btn-lg" onClick={() => setPhase('menu')}>
              Zpět do menu
            </button>
          </div>
        ) : (
          <button className="btn-danger btn-lg" onClick={stopTimer}>
            Zastavit časovač
          </button>
        )}
      </div>
    );
  }

  if (phase === 'mixed_drill') {
    const q = questions[currentQ];
    if (!q) return null;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <span className={`badge ${
            q.type === 'vocab' ? 'bg-blue-100 text-blue-700' :
            q.type === 'grammar' ? 'bg-purple-100 text-purple-700' :
            'bg-green-100 text-green-700'
          }`}>
            {q.type === 'vocab' ? 'Slovíčka' : q.type === 'grammar' ? 'Gramatika' : 'Čtení'}
          </span>
          <span className="text-sm text-slate-500 font-medium">
            {currentQ + 1} / {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentQ / questions.length) * 100}%` }}
          />
        </div>

        <div className="card !p-6 mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 leading-relaxed">{q.question}</h3>

          {!showAnswer ? (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedAnswer === i
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => setSelectedAnswer(i)}
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
                      : selectedAnswer === i
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-100'
                  }`}
                >
                  {opt} {i === q.answerIndex && ' ✓'}
                </div>
              ))}
            </div>
          )}
        </div>

        {!showAnswer ? (
          <button
            className="btn-primary btn-lg w-full"
            disabled={selectedAnswer === null}
            onClick={checkMixedAnswer}
          >
            Zkontrolovat
          </button>
        ) : (
          <button className="btn-primary btn-lg w-full" onClick={nextMixedQ}>
            {currentQ + 1 >= questions.length ? 'Zobrazit výsledky' : 'Další →'}
          </button>
        )}
      </div>
    );
  }

  if (phase === 'result') {
    const pct = score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0;
    const passed = pct >= 44;

    return (
      <div className="page-container">
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">{passed ? (pct >= 70 ? '🎉' : '✅') : '😔'}</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Výsledek mini-testu</h2>
          <div className="text-4xl font-bold mt-2" style={{ color: pct >= 60 ? '#22c55e' : pct >= 44 ? '#eab308' : '#ef4444' }}>
            {pct} bodů
          </div>
          <p className="text-sm text-slate-500 mt-1">
            {passed ? 'Prospěl/a! 🎓' : 'Zatím neprospěl/a — ale to nevadí, trénuj dál!'}
          </p>
        </div>

        <div className="card mb-4">
          <h3 className="section-title">Rozpad výsledků</h3>
          <div className="space-y-3">
            <ResultRow
              label="Slovíčka"
              correct={score.byType.vocab[0]}
              total={score.byType.vocab[1]}
            />
            <ResultRow
              label="Gramatika"
              correct={score.byType.grammar[0]}
              total={score.byType.grammar[1]}
            />
            <ResultRow
              label="Čtení"
              correct={score.byType.reading[0]}
              total={score.byType.reading[1]}
            />
          </div>
        </div>

        <div className="card mb-4">
          <h3 className="section-title">Celkově</h3>
          <p className="text-sm text-slate-600">
            {score.correct} / {score.total} správně ({pct}%)
          </p>
          <div className="w-full bg-slate-100 rounded-full h-3 mt-2 overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${pct}%`,
                backgroundColor: pct >= 60 ? '#22c55e' : pct >= 44 ? '#eab308' : '#ef4444',
              }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0</span>
            <span className="text-amber-500 font-medium">44 (min.)</span>
            <span>100</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary flex-1" onClick={() => { setPhase('menu'); }}>
            Zkusit znovu
          </button>
        </div>
      </div>
    );
  }

  return null;
}

function ResultRow({ label, correct, total }: { label: string; correct: number; total: number }) {
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm text-slate-600">{label}</span>
        <span className="text-sm font-semibold text-slate-800">{correct}/{total} ({pct}%)</span>
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            backgroundColor: pct >= 70 ? '#22c55e' : pct >= 44 ? '#eab308' : '#ef4444',
          }}
        />
      </div>
    </div>
  );
}
