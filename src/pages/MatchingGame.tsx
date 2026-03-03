import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { VOCABULARY } from '../data/vocabulary';
import { shuffleArray } from '../utils';
import { speak } from '../tts';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

interface GameCard {
  id: string;
  pairId: string;
  text: string;
  type: 'en' | 'cs';
  matched: boolean;
  flipped: boolean;
}

type Difficulty = 6 | 8 | 10;
type Phase = 'select' | 'game' | 'result';

const GRID_LAYOUTS: Record<Difficulty, { cols: number; rows: number }> = {
  6: { cols: 4, rows: 3 },
  8: { cols: 4, rows: 4 },
  10: { cols: 5, rows: 4 },
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function getStarRating(moves: number, pairs: number): number {
  if (moves <= pairs) return 3;
  if (moves <= pairs * 1.5) return 2;
  return 1;
}

export default function MatchingGame() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('select');
  const [difficulty, setDifficulty] = useState<Difficulty>(6);
  const [bandFilter, setBandFilter] = useState<number>(0);

  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matchedCount, setMatchedCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  function startGame() {
    let pool = VOCABULARY.filter((w) => w.cs && w.cs.trim() !== '');
    if (bandFilter > 0) pool = pool.filter((w) => w.band === bandFilter);

    if (pool.length < difficulty) {
      pool = VOCABULARY.filter((w) => w.cs && w.cs.trim() !== '');
    }

    const selected = shuffleArray(pool).slice(0, difficulty);
    const gameCards: GameCard[] = [];

    for (const word of selected) {
      gameCards.push({
        id: `${word.id}-en`,
        pairId: word.id,
        text: word.en,
        type: 'en',
        matched: false,
        flipped: false,
      });
      gameCards.push({
        id: `${word.id}-cs`,
        pairId: word.id,
        text: word.cs,
        type: 'cs',
        matched: false,
        flipped: false,
      });
    }

    const shuffled = shuffleArray(gameCards);
    setCards(shuffled);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setLocked(false);

    const now = Date.now();
    setStartTime(now);
    startTimeRef.current = now;
    setElapsedSeconds(0);

    timerRef.current = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    setPhase('game');
  }

  function handleCardClick(index: number) {
    if (locked) return;
    const card = cards[index];
    if (card.matched || card.flipped) return;

    const newCards = [...cards];
    newCards[index] = { ...newCards[index], flipped: true };
    setCards(newCards);

    if (card.type === 'en') {
      speak(card.text, 0.9);
    }

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);
      setLocked(true);

      const first = newCards[newFlipped[0]];
      const second = newCards[newFlipped[1]];

      if (first.pairId === second.pairId && first.type !== second.type) {
        playCorrect();
        const matched = [...newCards];
        matched[newFlipped[0]] = { ...matched[newFlipped[0]], matched: true };
        matched[newFlipped[1]] = { ...matched[newFlipped[1]], matched: true };
        setCards(matched);
        setFlippedIndices([]);
        setLocked(false);

        const newMatchedCount = matchedCount + 1;
        setMatchedCount(newMatchedCount);

        if (newMatchedCount === difficulty) {
          endGame(newMoves);
        }
      } else {
        playIncorrect();
        setTimeout(() => {
          const reset = [...newCards];
          reset[newFlipped[0]] = { ...reset[newFlipped[0]], flipped: false };
          reset[newFlipped[1]] = { ...reset[newFlipped[1]], flipped: false };
          setCards(reset);
          setFlippedIndices([]);
          setLocked(false);
        }, 1000);
      }
    }
  }

  async function endGame(finalMoves: number) {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    playComplete();

    const endedAt = Date.now();
    const score = getStarRating(finalMoves, difficulty);

    try {
      await addDrillSession({
        date: new Date().toISOString().slice(0, 10),
        type: 'vocab',
        startedAt: startTime,
        endedAt,
        totalItems: difficulty,
        correctItems: Math.round((score / 3) * difficulty),
        tags: ['matching_game'],
      });

      const stats = await getStats();
      stats.totalExercisesDone = (stats.totalExercisesDone || 0) + difficulty;
      stats.totalStudyMinutes += (endedAt - startTime) / 60000;
      await saveStats(stats);
      await updateStreak();
    } catch {
      // DB errors non-critical
    }

    setPhase('result');
  }

  function getResultMessage(): string {
    const stars = getStarRating(moves, difficulty);
    if (stars === 3) return 'Výborně!';
    if (stars === 2) return 'Dobrá práce!';
    return 'Zkus to znovu!';
  }

  function resetGame() {
    setPhase('select');
    setCards([]);
    setFlippedIndices([]);
    setMoves(0);
    setMatchedCount(0);
    setElapsedSeconds(0);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  // ── Select Phase ──────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4">
        <div className="max-w-md mx-auto pt-8">
          <button
            onClick={() => navigate('/')}
            className="text-blue-500 hover:text-blue-600 mb-6 flex items-center gap-1"
          >
            ← Zpět
          </button>

          <h1 className="text-3xl font-bold mb-2">Pexeso</h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8">
            Spoj anglická slova s českými překlady
          </p>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                Obtížnost
              </label>
              <div className="grid grid-cols-3 gap-2">
                {([6, 8, 10] as Difficulty[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => setDifficulty(d)}
                    className={`py-3 px-2 rounded-xl text-sm font-medium transition-all ${
                      difficulty === d
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {d === 6 ? 'Lehké' : d === 8 ? 'Střední' : 'Těžké'}
                    <span className="block text-xs mt-0.5 opacity-75">
                      {d} párů
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-slate-600 dark:text-slate-300">
                Úroveň slovíček
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: 0, label: 'Vše' },
                  { value: 1, label: 'Běžná (band 1)' },
                  { value: 2, label: 'Středně pokročilá (band 2)' },
                  { value: 3, label: 'Pokročilá (band 3)' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setBandFilter(opt.value)}
                    className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                      bandFilter === opt.value
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startGame}
              className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98]"
            >
              Začít hru
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Result Phase ──────────────────────────────────────────────────────
  if (phase === 'result') {
    const stars = getStarRating(moves, difficulty);
    return (
      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-4 flex items-center justify-center">
        <div className="max-w-sm w-full text-center">
          <div className="text-5xl mb-4">
            {stars === 3 ? '🏆' : stars === 2 ? '👏' : '💪'}
          </div>
          <h2 className="text-3xl font-bold mb-2">{getResultMessage()}</h2>

          <div className="text-4xl mb-6 tracking-wider">
            {'★'.repeat(stars)}
            {'☆'.repeat(3 - stars)}
          </div>

          <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6 mb-8 space-y-3">
            <div className="flex justify-between text-lg">
              <span className="text-slate-500 dark:text-slate-400">Čas</span>
              <span className="font-semibold">{formatTime(elapsedSeconds)}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-slate-500 dark:text-slate-400">Tahy</span>
              <span className="font-semibold">{moves}</span>
            </div>
            <div className="flex justify-between text-lg">
              <span className="text-slate-500 dark:text-slate-400">Páry</span>
              <span className="font-semibold">{difficulty}</span>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex-1 py-3 rounded-xl font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Domů
            </button>
            <button
              onClick={resetGame}
              className="flex-1 py-3 rounded-xl font-medium bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/25 transition-all"
            >
              Nová hra
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Game Phase ────────────────────────────────────────────────────────
  const layout = GRID_LAYOUTS[difficulty];

  return (
    <>
      <style>{`
        .card-container {
          perspective: 600px;
        }
        .card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.4s ease;
          transform-style: preserve-3d;
        }
        .card-inner.flipped {
          transform: rotateY(180deg);
        }
        .card-face {
          position: absolute;
          inset: 0;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 0.75rem;
          padding: 0.25rem;
          overflow: hidden;
        }
        .card-back {
          transform: rotateY(180deg);
        }
        .card-matched {
          animation: matchPulse 0.4s ease;
        }
        @keyframes matchPulse {
          0% { transform: rotateY(180deg) scale(1); }
          50% { transform: rotateY(180deg) scale(1.08); }
          100% { transform: rotateY(180deg) scale(1); }
        }
      `}</style>

      <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 p-3 sm:p-4">
        <div className="max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => {
                if (timerRef.current) clearInterval(timerRef.current);
                resetGame();
              }}
              className="text-blue-500 hover:text-blue-600 text-sm font-medium"
            >
              ← Zpět
            </button>
            <div className="flex items-center gap-4 text-sm font-mono">
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                ⏱ {formatTime(elapsedSeconds)}
              </span>
              <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
                Tahy: {moves}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mb-4">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(matchedCount / difficulty) * 100}%` }}
            />
          </div>

          {/* Card grid */}
          <div
            className="grid gap-2 sm:gap-3 mx-auto"
            style={{
              gridTemplateColumns: `repeat(${layout.cols}, 1fr)`,
              maxWidth: layout.cols * 104,
            }}
          >
            {cards.map((card, i) => {
              const isFlipped = card.flipped || card.matched;
              const isEn = card.type === 'en';

              return (
                <div
                  key={card.id}
                  className="card-container aspect-square cursor-pointer"
                  onClick={() => handleCardClick(i)}
                >
                  <div className={`card-inner ${isFlipped ? 'flipped' : ''} ${card.matched ? 'card-matched' : ''}`}>
                    {/* Front (face-down) */}
                    <div className="card-face bg-slate-200 dark:bg-slate-600 border-2 border-slate-300 dark:border-slate-500 shadow-md hover:shadow-lg hover:border-slate-400 dark:hover:border-slate-400 transition-shadow">
                      <span className="text-2xl sm:text-3xl font-bold text-slate-400 dark:text-slate-400 select-none">
                        ?
                      </span>
                    </div>

                    {/* Back (face-up) */}
                    <div
                      className={`card-face card-back border-2 shadow-md ${
                        isEn
                          ? 'bg-blue-100 dark:bg-blue-900/50 border-blue-300 dark:border-blue-700'
                          : 'bg-green-100 dark:bg-green-900/50 border-green-300 dark:border-green-700'
                      } ${
                        card.matched
                          ? 'opacity-70 ring-2 ring-green-400'
                          : ''
                      }`}
                    >
                      <span
                        className={`text-xs sm:text-sm font-semibold text-center leading-tight px-1 ${
                          isEn
                            ? 'text-blue-800 dark:text-blue-200'
                            : 'text-green-800 dark:text-green-200'
                        }`}
                      >
                        {card.text}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
