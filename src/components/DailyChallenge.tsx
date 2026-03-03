import { useState, useEffect } from 'react';
import { getStats, saveStats } from '../db';
import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { shuffleArray, todayKey } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

interface ChallengeQuestion {
  type: 'vocab' | 'grammar';
  question: string;
  options: string[];
  correctIndex: number;
  hint?: string;
}

function generateDailyQuestions(): ChallengeQuestion[] {
  const seed = todayKey().replace(/-/g, '');
  const numSeed = parseInt(seed, 10);

  const richVocab = VOCABULARY.filter((w) => w.example !== '');
  const vocabPool = shuffleArray(richVocab).slice(0, 200);
  const grammarPool = GRAMMAR_EXERCISES.filter((e) => e.type === 'mcq' && e.options);

  const questions: ChallengeQuestion[] = [];

  for (let i = 0; i < 3; i++) {
    const idx = (numSeed + i * 7) % vocabPool.length;
    const word = vocabPool[idx];
    const wrongWords = shuffleArray(richVocab.filter((w) => w.en !== word.en)).slice(0, 3);
    const allOptions = shuffleArray([word.cs, ...wrongWords.map((w) => w.cs)]);
    questions.push({
      type: 'vocab',
      question: `Co znamená "${word.en}"?`,
      options: allOptions,
      correctIndex: allOptions.indexOf(word.cs),
      hint: word.example,
    });
  }

  for (let i = 0; i < 2; i++) {
    const idx = (numSeed + i * 13) % grammarPool.length;
    const ex = grammarPool[idx];
    questions.push({
      type: 'grammar',
      question: ex.prompt,
      options: ex.options!,
      correctIndex: ex.options!.indexOf(ex.answer),
    });
  }

  return questions;
}

export default function DailyChallenge() {
  const [questions] = useState(generateDailyQuestions);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    getStats().then((s) => {
      const key = `dc_${todayKey()}`;
      if ((s as any)[key]) {
        setAlreadyDone(true);
      }
    });
  }, []);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === questions[current].correctIndex;
    if (correct) {
      setScore((s) => s + 1);
      playCorrect();
    } else {
      playIncorrect();
    }
    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setDone(true);
        playComplete();
        getStats().then((s) => {
          const key = `dc_${todayKey()}`;
          saveStats({ ...s, [key]: true } as any);
        });
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1200);
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="card mb-4 w-full text-left border-2 border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <div className="font-semibold text-amber-800 dark:text-amber-200">Denní výzva</div>
              <div className="text-xs text-amber-600 dark:text-amber-400">
                {alreadyDone ? 'Splněno! Přijď zítra.' : '5 otázek — rychlý mini-test'}
              </div>
            </div>
          </div>
          {alreadyDone ? (
            <span className="text-green-500 text-xl">✓</span>
          ) : (
            <span className="text-amber-500 text-sm font-medium">Otevřít →</span>
          )}
        </div>
      </button>
    );
  }

  if (alreadyDone) {
    return (
      <div className="card mb-4 border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
        <div className="text-center py-2">
          <div className="text-3xl mb-2">✅</div>
          <div className="font-semibold text-green-800 dark:text-green-200">Dnešní výzva splněna!</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">Přijď zítra na další.</div>
          <button onClick={() => setCollapsed(true)} className="text-xs text-slate-400 mt-3 underline">
            Skrýt
          </button>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="card mb-4 border-2 border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/30">
        <div className="text-center py-2">
          <div className="text-3xl mb-2">{score === 5 ? '🏆' : score >= 3 ? '⭐' : '💪'}</div>
          <div className="font-bold text-lg text-green-800 dark:text-green-200">
            {score}/{questions.length} správně
          </div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">
            {score === 5 ? 'Perfektní! Jsi úžasná!' : score >= 3 ? 'Dobrá práce!' : 'Nevadí, zítra to bude lepší!'}
          </div>
          <button onClick={() => setCollapsed(true)} className="text-xs text-slate-400 mt-3 underline">
            Skrýt
          </button>
        </div>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="card mb-4 border-2 border-amber-200 dark:border-amber-700">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚡</span>
          <span className="font-semibold text-amber-800 dark:text-amber-200 text-sm">Denní výzva</span>
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400">
          {current + 1}/{questions.length}
        </span>
      </div>

      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 mb-4">
        <div
          className="bg-amber-500 h-full rounded-full transition-all"
          style={{ width: `${((current + 1) / questions.length) * 100}%` }}
        />
      </div>

      <p className="text-slate-900 dark:text-white font-medium mb-3">{q.question}</p>
      {q.hint && <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-3">"{q.hint}"</p>}

      <div className="grid gap-2">
        {q.options.map((opt, idx) => {
          let cls = 'w-full text-left px-4 py-2.5 rounded-xl border transition-all text-sm ';
          if (selected === null) {
            cls += 'border-slate-200 dark:border-slate-600 hover:border-primary-300 dark:hover:border-primary-500 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800';
          } else if (idx === q.correctIndex) {
            cls += 'border-green-500 bg-green-50 dark:bg-green-900/40 text-green-800 dark:text-green-200 font-medium';
          } else if (idx === selected) {
            cls += 'border-red-500 bg-red-50 dark:bg-red-900/40 text-red-800 dark:text-red-200';
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
  );
}
