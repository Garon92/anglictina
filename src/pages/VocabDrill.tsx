import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDueCards, getSRSState, saveSRSState, addReviewLog, getStats, saveStats, getAllSRSStates, addDrillSession, updateStreak } from '../db';
import { processReview, createInitialSRSState, getGradeLabel } from '../srs';
import { speak, stopSpeaking } from '../tts';
import { VOCABULARY } from '../data/vocabulary';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { toggleFavorite, isFavorite } from '../favorites';
import type { UserSettings, SRSState, VocabWord } from '../types';

interface CardItem {
  word: VocabWord;
  srs: SRSState;
  isNew: boolean;
}

export default function VocabDrill({ settings }: { settings: UserSettings }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [sessionStats, setSessionStats] = useState({ correct: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    loadCards();
    return () => stopSpeaking();
  }, []);

  async function loadCards() {
    const dueStates = await getDueCards('vocab', settings.maxReviewsPerDay);
    const allStates = await getAllSRSStates('vocab');
    const learnedIds = new Set(allStates.map((s) => s.cardId));

    const dueCards: CardItem[] = [];
    for (const srs of dueStates) {
      const word = VOCABULARY.find((w) => w.id === srs.cardId);
      if (word) dueCards.push({ word, srs, isNew: false });
    }

    const newCards: CardItem[] = [];
    const unlearned = VOCABULARY.filter((w) => !learnedIds.has(w.id));
    // Prioritize words with examples (rich entries), then band 1, 2, 3
    const sorted = unlearned.sort((a, b) => {
      const aRich = a.example ? 0 : 1;
      const bRich = b.example ? 0 : 1;
      if (aRich !== bRich) return aRich - bRich;
      return a.band - b.band;
    });
    const available = shuffleArray(sorted.slice(0, Math.max(50, settings.newCardsPerDay * 3)));
    const newCount = Math.max(0, settings.newCardsPerDay - dueCards.filter((c) => c.srs.totalReviews <= 1).length);

    for (const word of available.slice(0, newCount)) {
      const srs = createInitialSRSState(word.id, 'vocab');
      newCards.push({ word, srs, isNew: true });
    }

    const all = [...shuffleArray(dueCards), ...newCards];
    setCards(all);
    setLoading(false);

    if (all.length === 0) setFinished(true);
  }

  const current = cards[currentIndex];

  const handleReveal = useCallback(() => {
    setRevealed(true);
    if (settings.ttsEnabled && current) {
      speak(current.word.en, settings.ttsRate);
    }
  }, [current, settings]);

  const handleGrade = useCallback(async (grade: number) => {
    if (!current) return;

    if (grade >= 2) playCorrect(); else playIncorrect();

    const newSrs = processReview(current.srs, grade);
    await saveSRSState(newSrs);
    await addReviewLog({
      timestamp: Date.now(),
      cardId: current.word.id,
      deckId: 'vocab',
      grade,
      responseMs: 0,
    });

    setSessionStats((prev) => ({
      correct: prev.correct + (grade >= 2 ? 1 : 0),
      total: prev.total + 1,
    }));

    if (currentIndex + 1 >= cards.length) {
      await finishSession(grade);
    } else {
      setCurrentIndex((i) => i + 1);
      setRevealed(false);
    }
  }, [current, currentIndex, cards.length]);

  const keyMap = useMemo((): Record<string, () => void> => {
    if (!current) return {};
    if (!revealed) return { ' ': handleReveal, Enter: handleReveal };
    return {
      '1': () => handleGrade(3),
      '2': () => handleGrade(2),
      '3': () => handleGrade(1),
      '4': () => handleGrade(0),
    };
  }, [current, revealed, handleReveal, handleGrade]);
  useKeyboard(keyMap, !finished && !loading);

  async function finishSession(lastGrade: number) {
    const correct = sessionStats.correct + (lastGrade >= 2 ? 1 : 0);
    const total = sessionStats.total + 1;

    const stats = await getStats();
    stats.totalCardsLearned = (await getAllSRSStates('vocab')).length;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'vocab',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: total,
      correctItems: correct,
      tags: ['vocab', 'srs'],
    });

    setSessionStats({ correct, total });
    setFinished(true);
    playComplete();
  }

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center min-h-[60vh]">
        <p className="text-slate-400 animate-pulse">Připravuji kartičky...</p>
      </div>
    );
  }

  if (finished) {
    const pct = sessionStats.total > 0 ? Math.round((sessionStats.correct / sessionStats.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{sessionStats.total === 0 ? '✅' : pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          {sessionStats.total === 0 ? 'Žádná slovíčka k opakování!' : 'Hotovo!'}
        </h2>
        {sessionStats.total > 0 && (
          <>
            <p className="text-slate-600 dark:text-slate-300 mb-1">
              {sessionStats.correct} / {sessionStats.total} správně ({pct}%)
            </p>
            <p className="text-sm text-slate-400 mb-6">
              {pct >= 80 ? 'Výborně! Takhle dál!' : pct >= 50 ? 'Dobrá práce, příště to bude ještě lepší.' : 'Nevadí, opakování dělá mistra!'}
            </p>
          </>
        )}
        {sessionStats.total === 0 && (
          <p className="text-slate-500 text-sm mb-6">
            Všechna slovíčka jsou zopakovaná. Vrať se později nebo přidej nová.
          </p>
        )}
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>Domů</button>
          <button className="btn-primary" onClick={() => { setFinished(false); setCurrentIndex(0); setSessionStats({ correct: 0, total: 0 }); loadCards(); }}>
            Znovu
          </button>
        </div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => navigate('/')}>← Zpět</button>
        <span className="text-sm text-slate-500 font-medium">
          {currentIndex + 1} / {cards.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="card !p-6 sm:!p-8 text-center mb-6 min-h-[280px] flex flex-col justify-center">
        {current.isNew && (
          <div className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 mx-auto mb-3">Nové slovo</div>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{current.word.en}</h2>
          <button
            className="text-primary-500 hover:text-primary-700 p-1"
            onClick={() => speak(current.word.en, settings.ttsRate)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
            </svg>
          </button>
          <button
            className={`p-1 transition-colors ${isFavorite(`vocab_${current.word.id}`) ? 'text-red-500' : 'text-slate-300 dark:text-slate-600 hover:text-red-400'}`}
            onClick={() => { toggleFavorite({ id: `vocab_${current.word.id}`, type: 'vocab', text: current.word.en, translation: current.word.cs }); }}
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-400 dark:text-slate-500 mb-4 capitalize">{current.word.partOfSpeech}</p>

        {revealed ? (
          <div className="animate-in fade-in duration-300">
            <div className="text-xl text-primary-500 dark:text-primary-400 font-semibold mb-3">{current.word.cs}</div>
            <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 text-left">
              <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-1">"{current.word.example}"</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{current.word.exampleCs}</p>
            </div>
          </div>
        ) : (
          <button className="btn-primary btn-lg mx-auto mt-4" onClick={handleReveal}>
            Ukázat překlad
          </button>
        )}
      </div>

      {/* Grade buttons */}
      {revealed && (
        <div className="space-y-2">
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mb-2">
            Jak dobře jsi to věděl/a? <span className="hidden sm:inline text-xs text-slate-400">(klávesy 1-4)</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {[3, 2, 1, 0].map((grade) => {
              const { label, emoji } = getGradeLabel(grade);
              return (
                <button
                  key={grade}
                  className={`py-3 rounded-xl text-center transition-all active:scale-95 ${
                    grade === 3
                      ? 'bg-green-100 hover:bg-green-200 text-green-800 dark:bg-green-900/50 dark:hover:bg-green-900/70 dark:text-green-300'
                      : grade === 2
                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-900/50 dark:hover:bg-amber-900/70 dark:text-amber-300'
                      : grade === 1
                      ? 'bg-orange-100 hover:bg-orange-200 text-orange-800 dark:bg-orange-900/50 dark:hover:bg-orange-900/70 dark:text-orange-300'
                      : 'bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-900/50 dark:hover:bg-red-900/70 dark:text-red-300'
                  }`}
                  onClick={() => handleGrade(grade)}
                >
                  <div className="text-lg">{emoji}</div>
                  <div className="text-xs font-medium mt-0.5">{label}</div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
