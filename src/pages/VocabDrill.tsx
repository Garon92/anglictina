import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDueCards, getSRSState, saveSRSState, addReviewLog, getStats, saveStats, getAllSRSStates, addDrillSession, updateStreak } from '../db';
import { processReview, createInitialSRSState, getGradeLabel } from '../srs';
import { speak, stopSpeaking } from '../tts';
import { VOCABULARY } from '../data/vocabulary';
import { shuffleArray } from '../utils';
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
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          {sessionStats.total === 0 ? 'Žádná slovíčka k opakování!' : 'Hotovo!'}
        </h2>
        {sessionStats.total > 0 && (
          <>
            <p className="text-slate-600 mb-1">
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
      <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${((currentIndex) / cards.length) * 100}%` }}
        />
      </div>

      {/* Card */}
      <div className="card !p-6 sm:!p-8 text-center mb-6 min-h-[280px] flex flex-col justify-center">
        {current.isNew && (
          <div className="badge bg-primary-100 text-primary-700 mx-auto mb-3">Nové slovo</div>
        )}

        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="text-3xl font-bold text-slate-900">{current.word.en}</h2>
          <button
            className="text-primary-500 hover:text-primary-700 p-1"
            onClick={() => speak(current.word.en, settings.ttsRate)}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-slate-400 mb-4 capitalize">{current.word.partOfSpeech}</p>

        {revealed ? (
          <div className="animate-in fade-in duration-300">
            <div className="text-xl text-primary-600 font-semibold mb-3">{current.word.cs}</div>
            <div className="bg-slate-50 rounded-xl p-3 text-left">
              <p className="text-sm text-slate-700 italic mb-1">"{current.word.example}"</p>
              <p className="text-xs text-slate-500">{current.word.exampleCs}</p>
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
          <p className="text-center text-sm text-slate-500 mb-2">Jak dobře jsi to věděl/a?</p>
          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3].map((grade) => {
              const { label, emoji } = getGradeLabel(grade);
              return (
                <button
                  key={grade}
                  className={`py-3 rounded-xl text-center transition-all active:scale-95 ${
                    grade < 2
                      ? 'bg-red-50 hover:bg-red-100 text-red-700'
                      : grade === 2
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      : 'bg-green-50 hover:bg-green-100 text-green-700'
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
