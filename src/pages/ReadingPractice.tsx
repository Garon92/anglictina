import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { READING_TEXTS } from '../data/reading';
import type { ReadingText, ReadingQuestion } from '../types';

type Phase = 'select' | 'reading' | 'questions' | 'result';

export default function ReadingPractice() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();
  const [phase, setPhase] = useState<Phase>('select');
  const [selectedText, setSelectedText] = useState<ReadingText | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [showAnswer, setShowAnswer] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');

  const filteredTexts = READING_TEXTS.filter((t) => {
    if (filterLevel !== 'all' && t.level !== filterLevel) return false;
    if (filterTopic !== 'all' && t.topic !== filterTopic) return false;
    return true;
  });

  const topics = [...new Set(READING_TEXTS.map((t) => t.topic))];

  function selectText(text: ReadingText) {
    startTransition(() => {
      setSelectedText(text);
      setAnswers(new Array(text.questions.length).fill(null));
      setCurrentQ(0);
      setStartTime(Date.now());
      setPhase('reading');
    });
  }

  function startQuestions() {
    startTransition(() => setPhase('questions'));
  }

  function selectAnswer(qIndex: number, optIndex: number) {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optIndex;
    setAnswers(newAnswers);
  }

  function checkAnswer() {
    setShowAnswer(true);
  }

  function nextQuestion() {
    if (currentQ + 1 >= (selectedText?.questions.length ?? 0)) {
      finishReading();
    } else {
      setCurrentQ((i) => i + 1);
      setShowAnswer(false);
    }
  }

  async function finishReading() {
    if (!selectedText) return;

    const correct = selectedText.questions.filter(
      (q, i) => answers[i] === q.answerIndex
    ).length;

    const stats = await getStats();
    stats.totalExercisesDone += selectedText.questions.length;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'reading',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: selectedText.questions.length,
      correctItems: correct,
      tags: ['reading', selectedText.topic],
    });

    startTransition(() => setPhase('result'));
  }

  if (phase === 'select') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
        <h1 className="page-title">Čtení s porozuměním</h1>
        <p className="page-subtitle">{READING_TEXTS.length} textů — vyber si podle úrovně nebo tématu.</p>

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
          <button
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterTopic === 'all' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setFilterTopic('all')}
          >
            Všechna témata
          </button>
          {topics.map((topic) => (
            <button
              key={topic}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filterTopic === topic ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              onClick={() => setFilterTopic(topic)}
            >
              {topic}
            </button>
          ))}
        </div>

        <p className="text-xs text-slate-400 mb-3">{filteredTexts.length} textů</p>
        <div className="space-y-3">
          {filteredTexts.map((text) => (
            <button
              key={text.id}
              className="card-hover w-full text-left"
              onClick={() => selectText(text)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-slate-800 dark:text-slate-100">{text.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${
                      text.level === 'A1' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
                      text.level === 'A2' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                      'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                    }`}>{text.level}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{text.questions.length} otázek</span>
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

  if (phase === 'reading' && selectedText) {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => startTransition(() => setPhase('select'))}>← Zpět</button>

        <div className="flex items-center gap-2 mb-4">
          <span className={`badge ${
            selectedText.level === 'A1' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' :
            selectedText.level === 'A2' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
            'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
          }`}>{selectedText.level}</span>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedText.title}</h2>
        </div>

        <div className="card !p-5 mb-6">
          <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">{selectedText.text}</p>
        </div>

        <button className="btn-primary btn-lg w-full" onClick={startQuestions}>
          Přejít k otázkám ({selectedText.questions.length})
        </button>
      </div>
    );
  }

  if (phase === 'questions' && selectedText) {
    const q = selectedText.questions[currentQ];
    const isCorrect = answers[currentQ] === q.answerIndex;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => startTransition(() => setPhase('reading'))}>← Text</button>
          <span className="text-sm text-slate-500 font-medium">
            {currentQ + 1} / {selectedText.questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${(currentQ / selectedText.questions.length) * 100}%` }}
          />
        </div>

        <div className="card !p-6 mb-4">
          {q.type === 'tfns' && (
            <span className="inline-block mb-2 text-xs font-medium px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300">
              True / False / Not stated
            </span>
          )}
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">{q.question}</h3>

          {!showAnswer ? (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    answers[currentQ] === i
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 text-slate-800 dark:text-slate-200'
                  }`}
                  onClick={() => selectAnswer(currentQ, i)}
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
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                    : answers[currentQ] === i
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                    : 'border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                {opt} {i === q.answerIndex && ' ✓'}
              </div>
            ))}
              <div className={`mt-3 p-3 rounded-xl ${isCorrect ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                  {isCorrect ? '✅ Správně!' : '❌ Špatně.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {!showAnswer ? (
          <button
            className="btn-primary btn-lg w-full"
            disabled={answers[currentQ] === null}
            onClick={checkAnswer}
          >
            Zkontrolovat
          </button>
        ) : (
          <button className="btn-primary btn-lg w-full" onClick={nextQuestion}>
            {currentQ + 1 >= selectedText.questions.length ? 'Zobrazit výsledky' : 'Další otázka →'}
          </button>
        )}
      </div>
    );
  }

  if (phase === 'result' && selectedText) {
    const correct = selectedText.questions.filter(
      (q, i) => answers[i] === q.answerIndex
    ).length;
    const pct = Math.round((correct / selectedText.questions.length) * 100);

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{selectedText.title}</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">
          {correct} / {selectedText.questions.length} správně ({pct}%)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80 ? 'Výborné porozumění!' : pct >= 50 ? 'Dobrý výsledek.' : 'Zkus text přečíst znovu.'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={() => startTransition(() => { setPhase('select'); setSelectedText(null); })}>
            Další text
          </button>
        </div>
      </div>
    );
  }

  return null;
}
