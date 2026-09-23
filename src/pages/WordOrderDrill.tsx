import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import { WORD_ORDER_EXERCISES, WORD_ORDER_CATEGORIES } from '../data/wordOrder';
import type { WordOrderExercise } from '../data/wordOrder';
import { shuffleArray } from '../utils';
import { isAnswerCorrect } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
const CATEGORIES = Object.keys(WORD_ORDER_CATEGORIES);
/** Short chip labels (the full names from the data are too long for a phone screen). */
const SHORT_LABELS: Record<string, string> = {
  basic_svo: 'Základní pořadí (SVO)',
  questions: 'Otázky',
  negatives: 'Zápory',
  adverbs: 'Příslovce',
  time_place: 'Čas a místo',
  adjective_order: 'Pořadí přídavných jmen',
  complex: 'Složité věty',
  indirect: 'Nepřímá řeč a otázky',
};

/** Short rule reminders shown after answering (and saved with mistakes). */
const TIPS: Record<string, string> = {
  basic_svo: 'Základní pořadí: podmět – sloveso – předmět (– místo – čas).',
  questions: 'Otázka: (tázací slovo) – pomocné sloveso – podmět – sloveso. V nepřímé otázce („Could you tell me where… is?“) je na konci oznamovací pořadí.',
  negatives: 'Zápor: podmět – pomocné sloveso + not – sloveso. „Never“ stojí před plnovýznamovým slovesem.',
  adverbs: 'Příslovce četnosti (always, often, never…) stojí před plnovýznamovým slovesem, ale za „be“ a za prvním pomocným slovesem.',
  time_place: 'Nejdřív místo, potom čas (…to school every day). Časový údaj může stát i na začátku věty.',
  adjective_order: 'Pořadí přídavných jmen: názor – velikost – stáří – barva – původ – materiál – účel (a beautiful old wooden house).',
  complex: 'Ve vedlejší větě zůstává oznamovací pořadí: podmět – sloveso.',
  indirect: 'V nepřímé řeči a nepřímé otázce není inverze: She asked me where I lived.',
};

/* ─── Helpers ─────────────────────────────────────────────────────── */

/** Ignore "next" for a moment after answering, so a double Enter doesn't skip the feedback. */
const NEXT_GUARD_MS = 350;
const now = () => Date.now();

const stripCommas = (s: string) => s.replace(/,/g, '');
const tokens = (s: string) => s.replace(/[.!?]+$/, '').replace(/,/g, '').split(/\s+/).filter(Boolean);

const DAY = '(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)';
const UNIT = `(?:day|week|month|year|morning|afternoon|evening|night|weekend|summer|winter|spring|autumn|${DAY})`;
const TIME_PHRASE = new RegExp(
  '^(?:' +
    [
      `(?:every|each|last|next) ${UNIT}(?: (?:morning|afternoon|evening|night))?`,
      `on ${DAY}(?: (?:morning|afternoon|evening))?`,
      '(?:a|an|one|two|three|four|five|six|seven|eight|nine|ten|\\d+|a few|many) (?:days?|weeks?|months?|years?) ago',
      'yesterday|today|tomorrow|tonight|now',
      'at the weekend|in the (?:morning|afternoon|evening)',
    ].join('|') +
    ')$',
);
/** Sentences with a subordinate clause keep their order (moving the time phrase could change the meaning). */
const CLAUSE_WORDS = /\b(?:that|who|which|where|when|if|whether|because|since|so|but|and|or|what|how|why|while|until)\b/i;

/**
 * Alternative correct orders: a time phrase at the end of a simple statement may also stand
 * at the beginning ("I go to school every day." = "Every day I go to school.") and vice versa.
 */
function orderVariants(answer: string): string[] {
  if (!answer.trim().endsWith('.') || answer.includes(',') || CLAUSE_WORDS.test(answer)) return [];
  const t = tokens(answer);
  const out: string[] = [];
  for (let k = Math.min(4, t.length - 2); k >= 1; k--) {
    const tail = t.slice(-k).join(' ');
    if (TIME_PHRASE.test(tail.toLowerCase())) {
      out.push([tail, ...t.slice(0, -k)].join(' '));
      break;
    }
  }
  for (let k = Math.min(4, t.length - 2); k >= 1; k--) {
    const head = t.slice(0, k).join(' ');
    if (TIME_PHRASE.test(head.toLowerCase())) {
      out.push([...t.slice(k), head].join(' '));
      break;
    }
  }
  return out;
}

/** Display casing of each word taken from the answer ("i" → "I", "london" → "London"). */
function casingMap(answer: string): Map<string, string> {
  const map = new Map<string, string>();
  tokens(answer).forEach((tok, i) => {
    const lower = tok.toLowerCase();
    const shown = i === 0 && tok !== 'I' && !tok.startsWith("I'") ? lower : tok;
    if (!map.has(lower) || i > 0) map.set(lower, shown);
  });
  return map;
}

function terminal(answer: string): string {
  const m = /[.!?]$/.exec(answer.trim());
  return m ? m[0] : '.';
}

function capitalize(s: string): string {
  return s ? s[0].toUpperCase() + s.slice(1) : s;
}

interface Item {
  ex: WordOrderExercise;
  /** Order of word indices in the word bank (shuffled once per round). */
  bank: number[];
  display: string[];
  variants: string[];
}

function buildItem(ex: WordOrderExercise): Item {
  const map = casingMap(ex.answer);
  // Shuffle until the bank isn't already the solution (for sentences longer than 2 words).
  let bank = shuffleArray(ex.words.map((_, i) => i));
  for (let guard = 0; guard < 5 && ex.words.length > 2 && isAnswerCorrect(bank.map((i) => ex.words[i]).join(' '), stripCommas(ex.answer)); guard++) {
    bank = shuffleArray(bank);
  }
  return {
    ex,
    bank,
    display: ex.words.map((w) => map.get(w.toLowerCase()) ?? w),
    variants: orderVariants(ex.answer),
  };
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function WordOrderDrill() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(15);

  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [placed, setPlaced] = useState<number[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const answeredRef = useRef(-1);
  const answeredAt = useRef(0);
  const bankRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const checkRef = useRef<HTMLButtonElement>(null);

  const session = useDrillSession('word_order', { tags: cats.length ? cats : ['all'] });

  const pool = useMemo(
    () => WORD_ORDER_EXERCISES.filter((e) => (!cats.length || cats.includes(e.category)) && (level === 'all' || e.level === level)),
    [cats, level],
  );

  const item = phase === 'drill' ? items[idx] : undefined;
  const available = item ? item.bank.filter((i) => !placed.includes(i)) : [];
  const allPlaced = !!item && available.length === 0;
  const sentence = item ? placed.map((i) => item.ex.words[i]).join(' ') : '';
  const shownSentence = item ? capitalize(placed.map((i) => item.display[i]).join(' ')) + terminal(item.ex.answer) : '';

  function resetItem() {
    setPlaced([]);
    setResult(null);
    answeredRef.current = -1;
  }

  function start() {
    const picked = shuffleArray(pool).slice(0, count).map(buildItem);
    if (!picked.length) return;
    setItems(picked);
    setIdx(0);
    resetItem();
    session.start();
    setPhase('drill');
  }

  /** Keep keyboard users in the flow: after a move, focus the chip that took the place of the moved one. */
  const pendingFocus = useRef<{ where: 'bank' | 'line'; pos: number } | null>(null);
  useLayoutEffect(() => {
    const p = pendingFocus.current;
    if (!p) return;
    pendingFocus.current = null;
    const buttons = (p.where === 'bank' ? bankRef.current : lineRef.current)?.querySelectorAll<HTMLButtonElement>('button');
    if (buttons && buttons.length) buttons[Math.min(p.pos, buttons.length - 1)].focus({ preventScroll: true });
    else if (p.where === 'bank') checkRef.current?.focus({ preventScroll: true });
  });

  function place(wordIdx: number, fromKeyboard = false) {
    if (result !== null || placed.includes(wordIdx)) return;
    if (fromKeyboard) pendingFocus.current = { where: 'bank', pos: available.indexOf(wordIdx) };
    setPlaced((p) => (p.includes(wordIdx) ? p : [...p, wordIdx]));
  }

  function unplace(wordIdx: number, fromKeyboard = false) {
    if (result !== null) return;
    if (fromKeyboard) pendingFocus.current = { where: 'line', pos: placed.indexOf(wordIdx) };
    setPlaced((p) => p.filter((x) => x !== wordIdx));
  }

  function undoLast() {
    if (result !== null || !placed.length) return;
    setPlaced((p) => p.slice(0, -1));
  }

  function check() {
    if (!item || result !== null || !allPlaced || answeredRef.current === idx) return;
    answeredRef.current = idx;
    answeredAt.current = now();
    const { ex } = item;
    const accept = [stripCommas(ex.answer), ...item.variants];
    const correct = isAnswerCorrect(sentence, stripCommas(ex.answer), item.variants);
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: `Slož větu: ${ex.hintCs} (${item.bank.map((i) => item.display[i]).join(' / ')})`,
      kind: 'text',
      answer: ex.answer,
      accept,
      userAnswer: shownSentence,
      explanation: TIPS[ex.category],
      correct,
    });
  }

  async function finishNow() {
    await session.finish();
    setPhase('result');
  }

  async function next() {
    if (now() - answeredAt.current < NEXT_GUARD_MS) return;
    if (idx + 1 >= items.length) {
      await finishNow();
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(
    result === null
      ? { Backspace: undoLast, ...(allPlaced ? { Enter: check } : {}) }
      : { Enter: () => void next() },
    phase === 'drill',
  );

  /* ── Setup ── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Slovosled"
        subtitle="Skládej anglické věty ze slov ve správném pořadí. Český překlad ti napoví, co má věta říct."
        icon="🧱"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Témata${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c}
              active={cats.includes(c)}
              title={WORD_ORDER_CATEGORIES[c]}
              onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}
            >
              {SHORT_LABELS[c] ?? WORD_ORDER_CATEGORIES[c]}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ── Result ── */
  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Nové kolo"
      >
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr témat</button>
        </div>
      </ResultScreen>
    );
  }

  /* ── Drill ── */
  if (!item) return null;
  const { ex } = item;
  const last = idx + 1 >= items.length;
  const endMark = terminal(ex.answer);
  const usedVariant = result === true && !isAnswerCorrect(sentence, stripCommas(ex.answer));
  const lineTone =
    result === null ? 'border-border-strong bg-surface' : result ? 'border-success bg-success-soft' : 'border-danger bg-danger-soft';

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={items.length} correct={session.correct} onExit={() => void finishNow()} title="Slovosled" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{WORD_ORDER_CATEGORIES[ex.category] ?? ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
          <span className="badge !bg-info-soft !text-info">{endMark === '?' ? 'Otázka' : endMark === '!' ? 'Zvolání' : 'Oznamovací věta'}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">Slož anglickou větu:</p>
        <p className="mb-4 text-xl leading-relaxed font-bold text-fg" lang="cs">{ex.hintCs}</p>

        {/* Answer line */}
        <p id="wo-line-label" className="eyebrow mb-2">Tvoje věta</p>
        <div
          ref={lineRef}
          role="group"
          aria-labelledby="wo-line-label"
          className={`flex min-h-[64px] flex-wrap items-center gap-2 rounded-2xl border-2 border-dashed p-3 transition-colors ${lineTone}`}
        >
          {placed.length === 0 && <span className="text-sm text-subtle">Klepni na slova níže ve správném pořadí…</span>}
          {placed.map((wi, pos) => (
            <button
              key={wi}
              type="button"
              lang="en"
              className="g92-chip is-active !text-base"
              disabled={result !== null}
              onClick={(e) => unplace(wi, e.detail === 0)}
              aria-label={`${item.display[wi]} — vrátit zpět`}
            >
              {pos === 0 ? capitalize(item.display[wi]) : item.display[wi]}
            </button>
          ))}
          {placed.length > 0 && (
            <span className="text-xl font-black text-muted" aria-hidden="true">{endMark}</span>
          )}
        </div>

        {/* Word bank */}
        {result === null && (
          <>
            <p id="wo-bank-label" className="eyebrow mt-4 mb-2">Slova</p>
            <div ref={bankRef} role="group" aria-labelledby="wo-bank-label" className="flex min-h-[48px] flex-wrap gap-2">
              {available.map((wi) => (
                <button key={wi} type="button" lang="en" className="g92-chip !text-base" onClick={(e) => place(wi, e.detail === 0)}>
                  {item.display[wi]}
                </button>
              ))}
              {available.length === 0 && <span className="self-center text-sm text-muted">Všechna slova jsou na místě — zkontroluj větu.</span>}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button ref={checkRef} type="button" className="btn-primary btn-lg" disabled={!allPlaced} onClick={check}>Ověřit</button>
              <button type="button" className="btn-secondary" disabled={!placed.length} onClick={undoLast}>Vrátit poslední</button>
              <button type="button" className="btn-ghost" disabled={!placed.length} onClick={() => setPlaced([])}>Začít znovu</button>
            </div>
            <p className="mt-2 hidden text-xs text-muted sm:block">
              Tip: slova vybíráš i klávesnicí (Tab a Enter), Backspace vrátí poslední slovo, Enter větu zkontroluje.
            </p>
          </>
        )}

        {result !== null && (
          <Feedback
            correct={result}
            answer={ex.answer}
            userAnswer={shownSentence}
            explanation={
              <>
                {usedVariant && <span className="mb-1 block">Tvoje pořadí je správně. Nejčastěji se říká: <strong className="text-fg" lang="en">{ex.answer}</strong></span>}
                {!usedVariant && result && item.variants.length > 0 && (
                  <span className="mb-1 block">Správně je i: <span lang="en">{capitalize(item.variants[0])}{endMark}</span></span>
                )}
                {TIPS[ex.category]}
              </>
            }
          />
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
