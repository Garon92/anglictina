import { useEffect, useRef, useState } from 'react';
import { VOCABULARY } from '../data/vocabulary';
import type { VocabWord } from '../types';
import { shuffleArray } from '../utils';
import { speak, stopSpeaking } from '../tts';
import { playCorrect, playIncorrect } from '../sounds';
import { safeConfirm } from '../lib/confirm';
import { useSettings } from '../App';
import { useDrillSession, DrillSetup, FilterGroup, Chip, ResultScreen } from '../components/drill';
import { ProgressBar, StatTile } from '../components/ui';

type Phase = 'setup' | 'game' | 'result';
type Pairs = 6 | 8 | 10;
type Band = 0 | 1 | 2 | 3;

interface GameCard {
  id: string;
  pairId: string;
  text: string;
  type: 'en' | 'cs';
}

const DIFFICULTIES: { pairs: Pairs; label: string }[] = [
  { pairs: 6, label: 'Lehké' },
  { pairs: 8, label: 'Střední' },
  { pairs: 10, label: 'Těžké' },
];
const BANDS: { value: Band; label: string }[] = [
  { value: 0, label: 'Vše' },
  { value: 1, label: 'Běžná (band 1)' },
  { value: 2, label: 'Středně pokročilá (band 2)' },
  { value: 3, label: 'Pokročilá (band 3)' },
];
const FLIP_BACK_MS = 1100;

/** Whole seconds elapsed since a timestamp. */
function secondsSince(t: number): number {
  return Math.floor((Date.now() - t) / 1000);
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Meanings without notes in brackets: "trávit (čas) / utrácet (peníze)" → ["trávit", "utrácet"]. */
function senseKeys(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .split(/[/,;]/)
    .map((x) => x.trim())
    .filter(Boolean);
}

const USABLE = VOCABULARY.filter((w) => w.cs && w.cs.trim() !== '' && w.en.trim() !== '');

/**
 * Pick `n` words so that no English and no Czech text (or meaning) appears twice on the board —
 * otherwise two cards could be a valid match for the same card.
 */
function pickWords(band: Band, n: number): VocabWord[] {
  let pool = band ? USABLE.filter((w) => w.band === band) : USABLE;
  const short = pool.filter((w) => w.cs.length <= 30);
  if (short.length >= n * 3) pool = short;
  if (pool.length < n) pool = USABLE;
  const out: VocabWord[] = [];
  const usedEn = new Set<string>();
  const usedCs = new Set<string>();
  for (const w of shuffleArray(pool)) {
    const en = [w.en.trim().toLowerCase(), ...senseKeys(w.en)];
    const cs = [w.cs.trim().toLowerCase(), ...senseKeys(w.cs)];
    if (en.some((k) => usedEn.has(k)) || cs.some((k) => usedCs.has(k))) continue;
    out.push(w);
    en.forEach((k) => usedEn.add(k));
    cs.forEach((k) => usedCs.add(k));
    if (out.length === n) break;
  }
  return out;
}

export default function MatchingGame() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [pairs, setPairs] = useState<Pairs>(6);
  const [band, setBand] = useState<Band>(0);

  const [words, setWords] = useState<VocabWord[]>([]);
  const [cards, setCards] = useState<GameCard[]>([]);
  const [faceUp, setFaceUp] = useState<number[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const startedAt = useRef(0);
  const timerRef = useRef<number | null>(null);
  const flipRef = useRef<number | null>(null);
  /** Card indices that have been face up at least once. */
  const seenRef = useRef<Set<number>>(new Set());
  /** Pairs the player mixed up although the translation had already been seen. */
  const dirtyRef = useRef<Set<string>>(new Set());
  const endingRef = useRef(false);

  const session = useDrillSession('matching', { tags: [`pairs_${pairs}`, band ? `band_${band}` : 'all'] });

  function stopTimers() {
    if (timerRef.current !== null) window.clearInterval(timerRef.current);
    if (flipRef.current !== null) window.clearTimeout(flipRef.current);
    timerRef.current = null;
    flipRef.current = null;
  }

  useEffect(
    () => () => {
      stopTimers();
      stopSpeaking();
    },
    [],
  );

  function start() {
    stopTimers();
    const picked = pickWords(band, pairs);
    if (!picked.length) return;
    const deck: GameCard[] = picked.flatMap((w) => [
      { id: `${w.id}-en`, pairId: w.id, text: w.en, type: 'en' as const },
      { id: `${w.id}-cs`, pairId: w.id, text: w.cs, type: 'cs' as const },
    ]);
    setWords(picked);
    setCards(shuffleArray(deck));
    setFaceUp([]);
    setMatched([]);
    setMoves(0);
    setElapsed(0);
    seenRef.current = new Set();
    dirtyRef.current = new Set();
    endingRef.current = false;
    session.start();
    startedAt.current = Date.now();
    timerRef.current = window.setInterval(() => setElapsed(secondsSince(startedAt.current)), 1000);
    setPhase('game');
  }

  async function endGame() {
    if (endingRef.current) return;
    endingRef.current = true;
    stopTimers();
    setElapsed(secondsSince(startedAt.current));
    await session.finish();
    setPhase('result');
  }

  function flip(i: number) {
    if (phase !== 'game' || endingRef.current) return;
    const card = cards[i];
    if (!card || matched.includes(card.pairId) || faceUp.includes(i)) return;

    // Two wrong cards still showing: turn them back right away and start a new move.
    let open = faceUp;
    if (open.length === 2) {
      if (flipRef.current !== null) window.clearTimeout(flipRef.current);
      flipRef.current = null;
      open = [];
    }

    if (card.type === 'en' && settings.ttsEnabled) void speak(card.text, settings.ttsRate);

    if (open.length === 0) {
      seenRef.current.add(i);
      setFaceUp([i]);
      return;
    }

    const a = open[0];
    const first = cards[a];
    setMoves((m) => m + 1);

    if (first.pairId === card.pairId) {
      seenRef.current.add(i);
      playCorrect();
      const nextMatched = [...matched, card.pairId];
      setMatched(nextMatched);
      setFaceUp([]);
      const word = words.find((w) => w.id === card.pairId);
      const clean = !dirtyRef.current.has(card.pairId);
      if (word) {
        session.answer({
          itemId: word.id,
          category: 'matching',
          prompt: `Co znamená „${word.en}“?`,
          kind: 'reveal',
          answer: word.cs,
          userAnswer: clean ? undefined : '',
          explanation: word.example || undefined,
          correct: clean,
          silent: true,
        });
      }
      if (nextMatched.length === cards.length / 2) void endGame();
      return;
    }

    // Mismatch. It counts as a mistake of the first card's pair only if its translation
    // had already been uncovered earlier (the player could have known where it was).
    const partner = cards.findIndex((c, j) => j !== a && c.pairId === first.pairId);
    if (seenRef.current.has(partner)) dirtyRef.current.add(first.pairId);
    seenRef.current.add(i);
    playIncorrect();
    setFaceUp([a, i]);
    flipRef.current = window.setTimeout(() => {
      flipRef.current = null;
      setFaceUp([]);
    }, FLIP_BACK_MS);
  }

  async function askExit() {
    if (matched.length === 0 && moves === 0) {
      stopTimers();
      setPhase('setup');
      return;
    }
    const ok = await safeConfirm({
      title: 'Ukončit hru?',
      message: 'Nalezené páry se uloží a uvidíš výsledek.',
      confirmLabel: 'Ukončit',
      cancelLabel: 'Hrát dál',
    });
    if (ok) void endGame();
  }

  /* ── Setup ── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Pexeso"
        subtitle="Otáčej kartičky a spojuj anglická slova s jejich českým překladem."
        icon="🃏"
        onStart={start}
        startLabel="Začít hru"
      >
        <FilterGroup label="Obtížnost">
          {DIFFICULTIES.map((d) => (
            <Chip key={d.pairs} active={pairs === d.pairs} onClick={() => setPairs(d.pairs)}>
              {d.label} · {d.pairs} párů
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Úroveň slovíček">
          {BANDS.map((b) => (
            <Chip key={b.value} active={band === b.value} onClick={() => setBand(b.value)}>{b.label}</Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ── Result ── */
  if (phase === 'result') {
    const all = session.total === pairs && session.total > 0;
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Nová hra"
        title={all ? 'Všechny páry nalezeny!' : session.total > 0 ? 'Hra ukončena' : undefined}
      >
        <div className="mt-4 grid grid-cols-3 gap-3">
          <StatTile icon="⏱️" value={formatTime(elapsed)} label="Čas" />
          <StatTile icon="🔄" value={moves} label="Tahy" />
          <StatTile icon="🃏" value={`${session.total} / ${pairs}`} label="Páry" />
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          Skóre = páry bez chyby. Chyba je, když otočíš špatnou kartu, přestože jsi správný překlad už viděl/a.
        </p>
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit nastavení</button>
        </div>
      </ResultScreen>
    );
  }

  /* ── Game ── */
  const total = cards.length / 2;
  const cols = total === 10 ? 'grid-cols-4 sm:grid-cols-5' : 'grid-cols-4';
  const wrongPair = faceUp.length === 2;

  return (
    <div className="page-container">
      <div className="mb-5">
        <div className="mb-2 flex items-center gap-2">
          <button type="button" className="btn-ghost btn-sm -ml-2" onClick={() => void askExit()} aria-label="Ukončit hru">
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
            <span className="hidden sm:inline">Ukončit</span>
          </button>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-muted">Pexeso</span>
          <span className="badge tabular-nums" title="Čas">⏱ {formatTime(elapsed)}</span>
          <span className="badge tabular-nums" title="Tahy">Tahy: {moves}</span>
          <span className="text-sm font-bold tabular-nums text-muted" aria-live="polite">
            {matched.length} / {total}
          </span>
        </div>
        <ProgressBar value={matched.length} max={total} tone="success" label="Nalezené páry" />
      </div>

      <p className="sr-only" aria-live="polite">
        {wrongPair ? 'Tyto karty k sobě nepatří.' : faceUp.length === 1 ? `Otočeno: ${cards[faceUp[0]]?.text}` : ''}
      </p>

      <div className={`mx-auto grid gap-2 sm:gap-3 ${cols}`} style={{ maxWidth: total === 10 ? 640 : 520 }}>
        {cards.map((card, i) => {
          const isMatched = matched.includes(card.pairId);
          const isUp = isMatched || faceUp.includes(i);
          const tone = isMatched
            ? 'border-success bg-success-soft opacity-70'
            : wrongPair && faceUp.includes(i)
              ? 'border-danger bg-danger-soft'
              : card.type === 'en'
                ? 'border-accent bg-surface'
                : 'border-border-strong bg-surface-2';
          return (
            <button
              key={card.id}
              type="button"
              className="relative aspect-[3/4] w-full rounded-xl [perspective:800px] focus-visible:outline-offset-2 disabled:cursor-default"
              onClick={() => flip(i)}
              disabled={isMatched}
              aria-label={isUp ? `${card.text}${isMatched ? ' – nalezený pár' : ''}` : `Karta ${i + 1}, zakrytá`}
              lang={isUp ? card.type : undefined}
            >
              <span
                className={`absolute inset-0 transition-transform duration-300 [transform-style:preserve-3d] motion-reduce:transition-none ${isUp ? '[transform:rotateY(180deg)]' : ''}`}
                aria-hidden="true"
              >
                <span className="absolute inset-0 grid place-items-center rounded-xl border-2 border-accent bg-accent text-2xl font-black text-accent-contrast shadow-1 [backface-visibility:hidden]">
                  ?
                </span>
                <span
                  className={`absolute inset-0 flex flex-col items-center justify-center rounded-xl border-2 p-1.5 shadow-1 [backface-visibility:hidden] [transform:rotateY(180deg)] ${tone}`}
                >
                  <span className="absolute top-1 left-1.5 text-[0.6rem] font-bold tracking-wide text-subtle uppercase">
                    {card.type === 'en' ? 'EN' : 'CZ'}
                  </span>
                  <span className="text-center text-xs leading-tight font-bold break-words hyphens-auto text-fg sm:text-sm" lang={card.type}>
                    {card.text}
                  </span>
                  {isMatched && <span className="absolute right-1.5 bottom-1 text-xs text-success">✓</span>}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Najdi ke každému anglickému slovu (EN) jeho český překlad (CZ). Karty ovládáš i klávesnicí (Tab a Enter).
      </p>
    </div>
  );
}
