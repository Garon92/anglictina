import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { ERROR_CORRECTIONS, EC_CATEGORIES } from '../data/errorCorrection';
import type { ErrorCorrectionExercise } from '../data/errorCorrection';
import { shuffleArray } from '../utils';
import { isAnswerCorrect, displayAnswer } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { playIncorrect } from '../sounds';
import { useSettings } from '../App';
import { speak } from '../tts';
import { SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
type Step = 'pick' | 'type' | 'done';

const LEVELS = ['all', 'A2', 'B1'] as const;
type Level = (typeof LEVELS)[number];
const CATEGORY_KEYS = Object.keys(EC_CATEGORIES);
/** Wrong taps allowed before the error is revealed. */
const MAX_WRONG_TAPS = 2;

/* ─── Tokens and locating the error ───────────────────────────────── */

interface Token {
  text: string;
  start: number;
  end: number;
  /** A word (clickable) — punctuation is not. */
  word: boolean;
  spaceBefore: boolean;
}

const TOKEN_RE = /[\p{L}\p{N}_'’]+(?:-[\p{L}\p{N}_'’]+)*|[^\s\p{L}\p{N}_]/gu;

function tokenize(s: string): Token[] {
  const out: Token[] = [];
  for (const m of s.matchAll(TOKEN_RE)) {
    const start = m.index ?? 0;
    out.push({
      text: m[0],
      start,
      end: start + m[0].length,
      word: /[\p{L}\p{N}]/u.test(m[0]),
      spaceBefore: start > 0 && /\s/.test(s[start - 1]),
    });
  }
  return out;
}

const same = (a: string, b: string) => a.toLowerCase().replace(/’/g, "'") === b.toLowerCase().replace(/’/g, "'");
const seqEqual = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => same(x, b[i]));
const texts = (s: string) => tokenize(s).map((t) => t.text);

interface Analysis {
  tokens: Token[];
  /** Token indices that belong to the error (a tap on any of them counts). */
  span: Set<number>;
  /** The erroneous part as written in the sentence. */
  spanText: string;
}

/**
 * Find the error span by comparing the sentence with the corrected sentence token by token:
 * the occurrence of `errorWord` whose replacement by `correctedWord` gives `correctedSentence`
 * (so an earlier "a", "the", "in"… with the same spelling is not mistaken for the error).
 * Fallbacks: the differing tokens, then the first occurrence of `errorWord`.
 */
function analyse(ex: ErrorCorrectionExercise): Analysis {
  const tokens = tokenize(ex.sentence);
  const s = tokens.map((t) => t.text);
  const c = texts(ex.correctedSentence);
  const e = texts(ex.errorWord);
  const alternatives = ex.correctedWord.split('|').map((a) => texts(a.trim()));

  let from = -1;
  let to = -1;
  let first = -1;
  if (e.length) {
    for (let i = 0; i + e.length <= s.length; i++) {
      if (!e.every((t, j) => same(t, s[i + j]))) continue;
      if (first < 0) first = i;
      const before = s.slice(0, i);
      const after = s.slice(i + e.length);
      if (alternatives.some((alt) => seqEqual([...before, ...alt, ...after], c))) {
        from = i;
        to = i + e.length;
        break;
      }
    }
  }
  if (from < 0) {
    let p = 0;
    while (p < s.length && p < c.length && same(s[p], c[p])) p++;
    let q = 0;
    while (q < s.length - p && q < c.length - p && same(s[s.length - 1 - q], c[c.length - 1 - q])) q++;
    if (p < s.length - q) {
      from = p;
      to = s.length - q;
    } else if (first >= 0) {
      from = first;
      to = first + e.length;
    }
  }
  const span = new Set<number>();
  for (let i = Math.max(0, from); i < to; i++) span.add(i);
  const spanText = from >= 0 && to > from ? ex.sentence.slice(tokens[from].start, tokens[to - 1].end) : ex.errorWord;
  return { tokens, span, spanText };
}

/** Group tokens into visual chunks (a word with the punctuation glued to it). */
function chunk(tokens: Token[]): number[][] {
  const out: number[][] = [];
  tokens.forEach((t, i) => {
    if (i === 0 || t.spaceBefore || !out.length) out.push([i]);
    else out[out.length - 1].push(i);
  });
  return out;
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function ErrorCorrectionDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<Level>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(15);
  const [items, setItems] = useState<ErrorCorrectionExercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [step, setStep] = useState<Step>('pick');
  const [wrongTaps, setWrongTaps] = useState<number[]>([]);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [missed, setMissed] = useState(false);
  const leaving = useRef(false);
  const session = useDrillSession('error_correction', { tags: cats.length ? cats : ['all'] });

  const pool = useMemo(
    () => ERROR_CORRECTIONS.filter((e) => (!cats.length || cats.includes(e.category)) && (level === 'all' || e.level === level)),
    [cats, level],
  );

  const ex = items[idx];
  const info = useMemo(() => (ex ? analyse(ex) : null), [ex]);

  /** Without a clickable error word (should not happen with the audited data) go straight to typing. */
  function firstStep(item: ErrorCorrectionExercise | undefined): Step {
    if (!item) return 'pick';
    const a = analyse(item);
    return [...a.span].some((i) => a.tokens[i]?.word) ? 'pick' : 'type';
  }

  function resetItem(item: ErrorCorrectionExercise | undefined) {
    setStep(firstStep(item));
    setWrongTaps([]);
    setText('');
    setResult(null);
    setMissed(false);
  }

  function start() {
    if (!pool.length) return;
    const picked = shuffleArray(pool).slice(0, count);
    setItems(picked);
    setIdx(0);
    resetItem(picked[0]);
    leaving.current = false;
    session.start();
    setPhase('drill');
  }

  function record(correct: boolean, userAnswer: string) {
    if (!ex || !info) return;
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: `${ex.sentence} (${info.spanText} → ?)`,
      context: `Oprav chybu: čím nahradit „${info.spanText}“?`,
      kind: 'text',
      answer: ex.correctedWord,
      accept: [ex.correctedSentence],
      userAnswer,
      explanation: ex.explanationCs,
      correct,
    });
  }

  function tap(i: number) {
    if (!info || result !== null || step !== 'pick') return;
    if (info.span.has(i)) {
      setStep('type');
      return;
    }
    if (wrongTaps.includes(i)) return;
    const taps = [...wrongTaps, i];
    setWrongTaps(taps);
    if (taps.length >= MAX_WRONG_TAPS) {
      setMissed(true);
      setResult(false);
      setStep('done');
      record(false, `(označeno: ${taps.map((k) => info.tokens[k].text).join(', ')})`);
    } else {
      playIncorrect();
    }
  }

  function submit() {
    if (!ex || result !== null || step !== 'type') return;
    const user = text.trim();
    if (!user) return;
    const correct = isAnswerCorrect(user, ex.correctedWord, [ex.correctedSentence]);
    setResult(correct);
    setStep('done');
    record(correct, user);
  }

  async function showResult() {
    if (leaving.current) return;
    leaving.current = true;
    await session.finish();
    setPhase('result');
  }

  function next() {
    if (result === null || leaving.current) return;
    if (idx + 1 >= items.length) {
      void showResult();
    } else {
      setIdx(idx + 1);
      resetItem(items[idx + 1]);
    }
  }

  useKeyboard(result !== null ? { Enter: next, ' ': next } : {}, phase === 'drill');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Oprav chybu"
        subtitle="V každé větě je jedna chyba. Klepni na chybné slovo a napiš, jak má být správně."
        icon="🩹"
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
        <FilterGroup label={`Kategorie${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORY_KEYS.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {EC_CATEGORIES[c]}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

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
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr</button>
        </div>
      </ResultScreen>
    );
  }

  if (!ex || !info) return null;
  const last = idx + 1 >= items.length;
  const left = MAX_WRONG_TAPS - wrongTaps.length;
  const typed = text.trim();

  /** ← / → move between the word buttons. */
  function onWordsKey(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    const buttons = [...e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (at < 0) return;
    e.preventDefault();
    buttons[Math.max(0, Math.min(buttons.length - 1, at + (e.key === 'ArrowRight' ? 1 : -1)))]?.focus();
  }

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={items.length} correct={session.correct} onExit={() => void showResult()} title="Oprav chybu" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{EC_CATEGORIES[ex.category] ?? ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>
        <p className="mb-3 text-sm font-bold text-muted" aria-live="polite">
          {step === 'pick' ? 'Klepni na chybné slovo:' : step === 'type' ? 'Napiš správný tvar:' : 'Chyba ve větě:'}
        </p>

        <div className="mb-4 flex flex-wrap items-center gap-x-1.5 gap-y-2" lang="en" role="group" aria-label="Slova ve větě" onKeyDown={onWordsKey}>
          {chunk(info.tokens).map((group) => (
            <span key={group[0]} className="inline-flex min-w-0 items-center">
              {group.map((i) => {
                const t = info.tokens[i];
                if (!t.word) {
                  return <span key={i} className="px-0.5 text-lg font-bold text-fg">{t.text}</span>;
                }
                const inSpan = info.span.has(i);
                const tried = wrongTaps.includes(i);
                let tone = 'border-border bg-surface-2 text-fg';
                if (step === 'pick') {
                  tone = tried ? 'border-danger bg-danger-soft text-danger line-through' : 'border-border-strong bg-surface text-fg hover:border-accent hover:bg-accent-soft';
                } else if (step === 'type') {
                  tone = inSpan ? 'border-accent bg-accent-soft text-accent-text' : 'border-transparent bg-transparent text-muted';
                } else if (inSpan) {
                  tone = 'border-danger bg-danger-soft text-danger line-through decoration-2';
                } else {
                  tone = tried ? 'border-transparent bg-transparent text-danger' : 'border-transparent bg-transparent text-fg';
                }
                return (
                  <button
                    key={i}
                    type="button"
                    className={`min-h-[44px] rounded-lg border-[1.5px] px-2.5 text-lg font-bold break-all transition-colors ${tone}`}
                    disabled={step !== 'pick' || tried}
                    onClick={() => tap(i)}
                  >
                    {t.text}
                  </button>
                );
              })}
            </span>
          ))}
        </div>

        {step === 'pick' && wrongTaps.length > 0 && (
          <p className="mb-2 text-sm font-bold text-warning" role="status">
            To není ono — zkus to ještě jednou ({left === 1 ? 'zbývá 1 pokus' : `zbývají ${left} pokusy`}).
          </p>
        )}
        {step === 'pick' && wrongTaps.length === 0 && (
          <p className="hidden text-xs text-muted sm:block">Slova můžeš procházet i klávesnicí (Tab nebo šipky) a vybrat Enterem.</p>
        )}

        {step === 'type' && (
          <div>
            <p className="mb-2 text-sm text-fg">
              Čím nahradit <strong className="text-accent-text" lang="en">„{info.spanText}“</strong>?
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <TextAnswer
                  value={text}
                  onChange={setText}
                  onSubmit={submit}
                  disabled={result !== null}
                  placeholder="Napiš opravu…"
                  label={`Oprava místo „${info.spanText}“`}
                />
              </div>
              <button type="button" className="btn-primary btn-lg" disabled={!typed} onClick={submit}>Ověřit</button>
            </div>
          </div>
        )}

        {step === 'done' && result !== null && (
          <Feedback correct={result} title={missed ? 'Chybné slovo se nepodařilo najít' : undefined}>
            <p className="mt-1 text-sm text-fg">
              <span className="text-danger line-through decoration-2" lang="en">{info.spanText}</span>
              {' → '}
              <strong className="text-success" lang="en">{displayAnswer(ex.correctedWord)}</strong>
              {!result && !missed && typed && (
                <span className="text-muted"> (tvoje oprava: <span lang="en">{typed}</span>)</span>
              )}
            </p>
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-surface p-2.5">
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-muted">Správná věta</div>
                <div className="font-bold break-words text-fg" lang="en">{ex.correctedSentence}</div>
              </div>
              <SpeakButton onClick={() => void speak(ex.correctedSentence, settings.ttsRate)} label={`Přehrát: ${ex.correctedSentence}`} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-muted">{ex.explanationCs}</p>
          </Feedback>
        )}
        {result !== null && <NextButton onClick={next} last={last} />}
      </div>
    </div>
  );
}
