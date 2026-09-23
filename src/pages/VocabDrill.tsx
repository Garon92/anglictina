import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getAllSRSStates, saveSRSState, addReviewLog, getStats, saveStats } from '../db';
import {
  processReview, createInitialSRSState, nextIntervalDays, intervalLabel, isPass, requeue,
  GRADE_AGAIN, GRADE_HARD, GRADE_GOOD, GRADE_EASY, type Grade,
} from '../srs';
import { speak, stopSpeaking } from '../tts';
import { VOCABULARY } from '../data/vocabulary';
import { MATURITA_TOPICS, type SRSState, type VocabWord } from '../types';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSwipe } from '../hooks/useSwipe';
import { playFlip, playCorrect, playIncorrect } from '../sounds';
import { toggleFavorite, useFavorites } from '../favorites';
import { useSettings } from '../App';
import { getDeckOverview, newWordQueue, type DeckOverview } from '../vocabDeck';
import { recordSession } from '../progress';
import { appStore } from '../lib/appStore';
import { startOfDay, czechPlural } from '../lib/dates';
import { DrillTopBar, FilterGroup, Chip, ResultScreen } from '../components/drill';
import { PageHeader, SpeakButton, ProgressBar } from '../components/ui';

interface CardItem {
  word: VocabWord;
  srs: SRSState;
  isNew: boolean;
  /** How many times the card was failed in this session. */
  fails: number;
}

type Direction = 'en-cs' | 'cs-en' | 'mix';
type Phase = 'overview' | 'session' | 'done';

const WORD_BY_ID = new Map(VOCABULARY.map((w) => [w.id, w]));
const POS_CS: Record<string, string> = {
  noun: 'podstatné jméno', verb: 'sloveso', adjective: 'přídavné jméno', adverb: 'příslovce', preposition: 'předložka',
  conjunction: 'spojka', pronoun: 'zájmeno', determiner: 'determinátor', interjection: 'citoslovce', phrase: 'fráze',
};

export default function VocabDrill() {
  const { settings } = useSettings();
  const [params] = useSearchParams();
  const [phase, setPhase] = useState<Phase>('overview');
  const [overview, setOverview] = useState<DeckOverview | null>(null);
  const [direction, setDirection] = useState<Direction>(() => appStore.get('vocabDirection'));
  const [band, setBand] = useState<0 | 1 | 2 | 3>(0);
  const [topic, setTopic] = useState('');
  const [queue, setQueue] = useState<CardItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [history, setHistory] = useState<{ idx: number; prev: SRSState; card: CardItem; queue: CardItem[]; summary: { graded: number; passed: number; newLearned: number } }[]>([]);
  const [summary, setSummary] = useState({ graded: 0, passed: 0, newLearned: 0 });
  const busy = useRef(false);
  const startedAt = useRef(Date.now());
  const favorites = useFavorites();

  const refresh = useCallback(async () => {
    setOverview(await getDeckOverview(settings, 'vocab', VOCABULARY.length));
  }, [settings]);

  useEffect(() => {
    void refresh();
    return () => stopSpeaking();
  }, [refresh]);

  useEffect(() => appStore.set('vocabDirection', direction), [direction]);

  async function buildQueue(extraNew = 0): Promise<CardItem[]> {
    const states = await getAllSRSStates('vocab');
    const now = Date.now();
    const seen = new Set(states.filter((s) => s.totalReviews > 0).map((s) => s.cardId));
    const reviewedToday = states.filter((s) => s.lastReviewAt >= startOfDay(now)).length;
    const reviewBudget = Math.max(0, settings.maxReviewsPerDay - reviewedToday);
    const due = states
      .filter((s) => s.totalReviews > 0 && s.dueAt <= now && WORD_BY_ID.has(s.cardId))
      .sort((a, b) => a.dueAt - b.dueAt)
      .slice(0, Math.max(reviewBudget, states.filter((s) => s.intervalDays < 1 && s.totalReviews > 0 && s.dueAt <= now).length))
      .map((srs) => ({ word: WORD_BY_ID.get(srs.cardId)!, srs, isNew: false, fails: 0 }));
    const ov = overview ?? (await getDeckOverview(settings, 'vocab', VOCABULARY.length));
    const newCount = Math.max(0, ov.newLimit - ov.newToday) + extraNew;
    const fresh = newWordQueue(VOCABULARY, seen, { band: band || undefined, topic: topic || undefined })
      .slice(0, newCount)
      .map((word) => ({ word, srs: createInitialSRSState(word.id, 'vocab'), isNew: true, fails: 0 }));
    // Interleave: roughly one new card after every two reviews.
    const out: CardItem[] = [];
    let n = 0;
    for (const c of due) {
      out.push(c);
      if (out.length % 3 === 2 && n < fresh.length) out.push(fresh[n++]);
    }
    while (n < fresh.length) out.push(fresh[n++]);
    return out;
  }

  async function start(extraNew = 0) {
    const q = await buildQueue(extraNew);
    if (!q.length) return;
    setQueue(q);
    setIdx(0);
    setRevealed(false);
    setHistory([]);
    setSummary({ graded: 0, passed: 0, newLearned: 0 });
    startedAt.current = Date.now();
    setPhase('session');
  }

  // Deep link from the dashboard ("/vocab?new=1") starts right away.
  const autoStarted = useRef(false);
  useEffect(() => {
    if (autoStarted.current || !overview || phase !== 'overview') return;
    if (params.get('new') === '1' || params.get('start') === '1') {
      autoStarted.current = true;
      if (overview.due > 0 || overview.newAvailable > 0) void start();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overview]);

  const card = queue[idx];
  const reverse = useMemo(() => {
    if (!card) return false;
    if (direction === 'mix') return (card.word.id.charCodeAt(card.word.id.length - 1) + idx) % 2 === 1;
    return direction === 'cs-en';
  }, [card, direction, idx]);

  const reveal = useCallback(() => {
    if (!card || revealed) return;
    setRevealed(true);
    playFlip();
    if (settings.ttsEnabled) void speak(card.word.en, settings.ttsRate);
  }, [card, revealed, settings.ttsEnabled, settings.ttsRate]);

  async function finish(final: typeof summary) {
    setPhase('done');
    const endedAt = Date.now();
    await recordSession({ module: 'vocab', type: 'vocab', startedAt: startedAt.current, endedAt, total: final.graded, correct: final.passed, tags: ['srs'] });
    const states = await getAllSRSStates('vocab');
    const stats = await getStats();
    stats.totalCardsLearned = states.filter((s) => s.totalReviews > 0).length;
    await saveStats(stats);
    void refresh();
  }

  const grade = useCallback(async (g: Grade) => {
    if (!card || !revealed || busy.current) return;
    busy.current = true;
    try {
      const prev = card.srs;
      const next = processReview(prev, g);
      await saveSRSState(next);
      await addReviewLog({ timestamp: Date.now(), cardId: card.word.id, deckId: 'vocab', grade: g, responseMs: 0 });
      if (isPass(g)) playCorrect();
      else playIncorrect();

      let nextQueue = queue.map((c, i) => (i === idx ? { ...c, srs: next } : c));
      if (!isPass(g) && card.fails < 3) {
        nextQueue = requeue(nextQueue, idx, { ...card, srs: next, fails: card.fails + 1, isNew: false }, 4);
      }
      setHistory((h) => [...h.slice(-19), { idx, prev, card, queue, summary }]);
      const s = {
        graded: summary.graded + 1,
        passed: summary.passed + (isPass(g) ? 1 : 0),
        newLearned: summary.newLearned + (card.isNew ? 1 : 0),
      };
      setSummary(s);
      setQueue(nextQueue);
      if (idx + 1 >= nextQueue.length) {
        await finish(s);
      } else {
        setIdx(idx + 1);
        setRevealed(false);
      }
    } finally {
      busy.current = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [card, revealed, queue, idx, summary]);

  async function undo() {
    const last = history[history.length - 1];
    if (!last || busy.current) return;
    busy.current = true;
    try {
      await saveSRSState(last.prev);
      setQueue(last.queue);
      setIdx(last.idx);
      setRevealed(true);
      setHistory((h) => h.slice(0, -1));
      setSummary(last.summary);
    } finally {
      busy.current = false;
    }
  }

  useKeyboard(
    phase !== 'session' || !card
      ? {}
      : !revealed
        ? { ' ': reveal, Enter: reveal }
        : { '1': () => void grade(GRADE_AGAIN), '2': () => void grade(GRADE_HARD), '3': () => void grade(GRADE_GOOD), '4': () => void grade(GRADE_EASY), ' ': () => void grade(GRADE_GOOD), Enter: () => void grade(GRADE_GOOD) },
    phase === 'session',
  );

  const swipe = useSwipe({
    onSwipeLeft: revealed ? () => void grade(GRADE_AGAIN) : undefined,
    onSwipeRight: revealed ? () => void grade(GRADE_GOOD) : undefined,
    onSwipeUp: !revealed ? reveal : undefined,
  });

  /* ── Overview ───────────────────────────────────────────── */
  if (phase === 'overview') {
    const ov = overview;
    const canStart = !!ov && (ov.due > 0 || ov.newAvailable > 0);
    return (
      <div className="page-container">
        <PageHeader title="Slovíčka" subtitle="Kartičky s chytrým opakováním — co umíš, uvidíš až za pár dní, co ne, hned znovu." icon="🗂️" />
        {!ov ? (
          <div className="skeleton h-48 w-full" />
        ) : (
          <>
            <div className="card g92-card--accent !p-5">
              <div className="grid grid-cols-3 gap-3 text-center">
                <Big value={ov.due} label={czechPlural(ov.due, 'k opakování', 'k opakování', 'k opakování')} tone={ov.due > 0 ? 'warning' : undefined} />
                <Big value={`${Math.min(ov.newToday, ov.newLimit)}/${ov.newLimit}`} label="nových dnes" />
                <Big value={ov.seen} label="celkem se učíš" />
              </div>
              <ProgressBar value={ov.seen} max={VOCABULARY.length} className="mt-4" label="Podíl naučených slovíček" />
              <p className="mt-1 text-xs text-muted">{ov.seen} z {VOCABULARY.length} nejčastějších anglických slov (NGSL) · {ov.mature} už máš zažitých</p>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                {canStart ? (
                  <button type="button" className="btn-primary btn-lg" onClick={() => void start()} autoFocus>
                    {ov.due > 0 ? `Začít (${ov.due + ov.newAvailable} ${czechPlural(ov.due + ov.newAvailable, 'kartička', 'kartičky', 'kartiček')})` : `Naučit ${ov.newAvailable} nových`}
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-bold text-success">✓ Na dnešek máš hotovo!</span>
                    <button type="button" className="btn-secondary" onClick={() => void start(5)}>Přidat 5 nových navíc</button>
                  </div>
                )}
              </div>
            </div>

            <div className="card mt-4 space-y-4 !p-5">
              <FilterGroup label="Směr kartiček">
                <Chip active={direction === 'en-cs'} onClick={() => setDirection('en-cs')}>🇬🇧 → 🇨🇿</Chip>
                <Chip active={direction === 'cs-en'} onClick={() => setDirection('cs-en')}>🇨🇿 → 🇬🇧</Chip>
                <Chip active={direction === 'mix'} onClick={() => setDirection('mix')}>Náhodně</Chip>
              </FilterGroup>
              <FilterGroup label="Odkud brát nová slovíčka" hint="Opakování se týká všech slovíček, filtr mění jen výběr nových.">
                <Chip active={band === 0 && !topic} onClick={() => { setBand(0); setTopic(''); }}>Podle četnosti</Chip>
                <Chip active={band === 1} onClick={() => { setBand(1); setTopic(''); }}>Základní</Chip>
                <Chip active={band === 2} onClick={() => { setBand(2); setTopic(''); }}>Středně pokročilá</Chip>
                <Chip active={band === 3} onClick={() => { setBand(3); setTopic(''); }}>Pokročilá</Chip>
              </FilterGroup>
              <FilterGroup label="Nebo podle tématu">
                {MATURITA_TOPICS.filter((t) => VOCABULARY.some((w) => w.topics.includes(t.id))).map((t) => (
                  <Chip key={t.id} active={topic === t.id} onClick={() => { setTopic(topic === t.id ? '' : t.id); setBand(0); }}>{t.cs}</Chip>
                ))}
              </FilterGroup>
              <p className="text-xs text-muted">
                Denní limit nových slovíček ({settings.newCardsPerDay}) a opakování ({settings.maxReviewsPerDay}) změníš v <Link to="/settings">nastavení</Link>.
              </p>
            </div>
          </>
        )}
      </div>
    );
  }

  /* ── Done ───────────────────────────────────────────────── */
  if (phase === 'done') {
    return (
      <ResultScreen
        correct={summary.passed}
        total={summary.graded}
        title="Opakování hotovo"
        onRestart={overview && (overview.due > 0 || overview.newAvailable > 0) ? () => void start() : () => void start(5)}
        restartLabel={overview && (overview.due > 0 || overview.newAvailable > 0) ? 'Pokračovat' : '5 nových navíc'}
        back="/"
        backLabel="Zpět na dnešní plán"
      >
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="card !p-3"><div className="text-xl font-black text-fg">{summary.graded}</div><div className="text-xs text-muted">hodnocení</div></div>
          <div className="card !p-3"><div className="text-xl font-black text-fg">{summary.newLearned}</div><div className="text-xs text-muted">nových slov</div></div>
          <div className="card !p-3"><div className="text-xl font-black text-fg">{overview?.due ?? 0}</div><div className="text-xs text-muted">ještě čeká</div></div>
        </div>
      </ResultScreen>
    );
  }

  /* ── Session ────────────────────────────────────────────── */
  if (!card) return null;
  const w = card.word;
  const fav = favorites.some((f) => f.id === `vocab_${w.id}` || (f.type === 'vocab' && f.text.toLowerCase() === w.en.toLowerCase()));
  const grades: { g: Grade; label: string; cls: string; key: string }[] = [
    { g: GRADE_AGAIN, label: 'Znovu', cls: 'vocab-grade--again', key: '1' },
    { g: GRADE_HARD, label: 'Těžké', cls: 'vocab-grade--hard', key: '2' },
    { g: GRADE_GOOD, label: 'Dobře', cls: 'vocab-grade--good', key: '3' },
    { g: GRADE_EASY, label: 'Snadné', cls: 'vocab-grade--easy', key: '4' },
  ];

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={queue.length}
        onExit={() => void finish(summary)}
        title={card.isNew ? 'Nové slovo' : card.fails > 0 ? 'Znovu' : 'Opakování'}
        extra={history.length > 0 ? (
          <button type="button" className="btn-ghost btn-sm" onClick={() => void undo()} title="Vrátit poslední hodnocení">↩ Zpět</button>
        ) : undefined}
      />

      <div
        className={`vocab-card card ${revealed ? 'is-revealed' : ''}`}
        {...swipe}
        onClick={() => !revealed && reveal()}
        role={!revealed ? 'button' : undefined}
        tabIndex={!revealed ? 0 : undefined}
        aria-label={!revealed ? 'Otočit kartičku' : undefined}
      >
        <div className="absolute top-3 right-3 flex items-center gap-1">
          {card.isNew && <span className="badge !bg-accent-soft !text-accent-text">Nové</span>}
          <button
            type="button"
            className={`grid h-10 w-10 place-items-center rounded-full text-xl ${fav ? 'text-danger' : 'text-subtle hover:text-danger'}`}
            aria-label={fav ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
            aria-pressed={fav}
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite({ id: `vocab_${w.id}`, type: 'vocab', text: w.en, translation: w.cs });
            }}
          >
            {fav ? '♥' : '♡'}
          </button>
        </div>

        <div className="text-xs font-bold tracking-wide text-muted uppercase">{POS_CS[w.partOfSpeech] ?? w.partOfSpeech}</div>
        {!reverse || revealed ? (
          <div className="mt-2 flex items-center justify-center gap-3">
            <h2 className="text-4xl font-black break-words text-fg" lang="en">{w.en}</h2>
            <SpeakButton onClick={() => void speak(w.en, settings.ttsRate)} label={`Přehrát: ${w.en}`} />
          </div>
        ) : null}
        {reverse && !revealed && <h2 className="mt-2 text-3xl font-black text-fg">{w.cs}</h2>}

        {!revealed ? (
          <p className="mt-8 text-sm text-muted">
            {reverse ? 'Jak se to řekne anglicky?' : 'Víš, co to znamená?'} <span className="hidden sm:inline">· klepni nebo stiskni mezerník</span>
          </p>
        ) : (
          <div className="mt-3 animate-fadeIn">
            {!reverse && <div className="text-2xl font-black text-accent-text">{w.cs}</div>}
            {reverse && <div className="text-lg text-muted">{w.cs}</div>}
            {w.example && (
              <div className="mx-auto mt-4 max-w-md rounded-2xl bg-surface-2 p-3 text-left">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-fg italic" lang="en">„{w.example}“</p>
                  <SpeakButton size="sm" onClick={() => void speak(w.example, settings.ttsRate)} label="Přehrát příklad" />
                </div>
                {w.exampleCs && <p className="mt-1 text-sm text-muted">{w.exampleCs}</p>}
              </div>
            )}
          </div>
        )}
      </div>

      {!revealed ? (
        <button type="button" className="btn-primary btn-lg mt-4 w-full" onClick={reveal}>Otočit kartičku</button>
      ) : (
        <div className="mt-4">
          <div className="grid grid-cols-4 gap-2">
            {grades.map((gr) => (
              <button key={gr.g} type="button" className={`vocab-grade ${gr.cls}`} onClick={() => void grade(gr.g)}>
                <span className="font-black">{gr.label}</span>
                <span className="text-[0.7rem] opacity-80">{intervalLabel(nextIntervalDays(card.srs, gr.g))}</span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-center text-xs text-muted">
            Klávesy 1–4 · na mobilu swipe ← znovu / → dobře · hodnoť poctivě, podle toho se plánuje další opakování
          </p>
        </div>
      )}
    </div>
  );
}

function Big({ value, label, tone }: { value: number | string; label: string; tone?: 'warning' }) {
  return (
    <div>
      <div className={`text-3xl font-black tabular-nums ${tone === 'warning' ? 'text-warning' : 'text-fg'}`}>{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}
