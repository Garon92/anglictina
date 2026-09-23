import { useMemo, useRef, useState } from 'react';
import { SENTENCE_TRANSFORMS, TRANSFORM_CATEGORIES, type SentenceTransformExercise } from '../data/sentenceTransform';
import { shuffleArray } from '../utils';
import { isAnswerCorrect, canonicalForms, normalizeAnswer, wordCount } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import { speak } from '../tts';
import { SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';

const LEVELS = ['all', 'A2', 'B1'] as const;
const CATEGORIES = Object.keys(TRANSFORM_CATEGORIES);
const GAP_RE = /_{3,}/;

/** Put a text into the gap of the prompt ("This house _____ in 1990." → "This house was built in 1990."). */
function fillGap(prompt: string, text: string): string {
  return prompt.replace(GAP_RE, text.trim()).replace(/\s+([.,!?;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
}

interface Item {
  ex: SentenceTransformExercise;
  /** Accepted gap texts besides gapAnswer. */
  gapAlts: string[];
  /** Accepted complete sentences besides `answer` (full-sentence alternatives + every gap variant filled in). */
  fulls: string[];
}

/**
 * `alternatives` may contain gap texts ("is going to be repaired") or complete sentences.
 * A complete sentence starts with the text before the gap (or ends with the text after it).
 */
function buildItem(ex: SentenceTransformExercise): Item {
  const [before = '', after = ''] = ex.prompt.split(GAP_RE);
  const b = normalizeAnswer(before);
  const a = normalizeAnswer(after);
  const isFull = (alt: string) => {
    const n = normalizeAnswer(alt);
    return b ? n.startsWith(`${b} `) : a ? n.endsWith(` ${a}`) : false;
  };
  const alts = ex.alternatives ?? [];
  const gapAlts = alts.filter((x) => !isFull(x));
  const fulls = [...alts.filter(isFull), ...[ex.gapAnswer, ...gapAlts].map((g) => fillGap(ex.prompt, g))];
  return { ex, gapAlts, fulls: [...new Set(fulls)].filter((f) => f !== ex.answer) };
}

/** Did the learner type the whole sentence instead of just the gap? */
function typedWholeSentence(user: string, it: Item): boolean {
  return isAnswerCorrect(user, it.ex.answer, it.fulls);
}

function isTransformCorrect(user: string, it: Item): boolean {
  if (isAnswerCorrect(user, it.ex.gapAnswer, it.gapAlts)) return true;
  if (typedWholeSentence(user, it)) return true;
  return isAnswerCorrect(fillGap(it.ex.prompt, user), it.ex.answer, it.fulls);
}

function usesKeyWord(user: string, keyWord: string): boolean {
  const kw = keyWord.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(^|[^a-z'])${kw}($|[^a-z'])`);
  return canonicalForms(user).some((f) => re.test(f)) || re.test(normalizeAnswer(user));
}

export default function SentenceTransformDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(15);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [overridden, setOverridden] = useState(false);
  const answered = useRef(false);
  const session = useDrillSession('sentence_transform', {
    tags: [...(cats.length ? cats : ['all']), ...(level !== 'all' ? [level] : [])],
  });

  const pool = useMemo(
    () => SENTENCE_TRANSFORMS.filter((e) => (!cats.length || cats.includes(e.category)) && (level === 'all' || e.level === level)),
    [cats, level],
  );

  const item = items[idx];

  function resetItem() {
    answered.current = false;
    setText('');
    setResult(null);
    setOverridden(false);
  }

  function start() {
    setItems(shuffleArray(pool).slice(0, count).map(buildItem));
    setIdx(0);
    resetItem();
    session.start();
    setPhase('drill');
  }

  function submit() {
    if (!item || result !== null || answered.current) return;
    const user = text.trim();
    if (!user) return;
    const { ex } = item;
    const correct = isTransformCorrect(user, item);
    answered.current = true;
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: `${ex.original} → ${ex.prompt} (${ex.keyWord})`,
      kind: 'text',
      answer: ex.gapAnswer,
      accept: [...item.gapAlts, ex.answer, ...item.fulls],
      userAnswer: user,
      explanation: ex.hintCs,
      correct,
    });
  }

  async function next() {
    if (idx + 1 >= items.length) {
      await session.finish();
      setPhase('result');
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next(), ' ': () => void next() } : {}, phase === 'drill');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Přeformulace vět"
        subtitle="Přepiš větu pomocí klíčového slova tak, aby význam zůstal stejný – klasická maturitní úloha."
        icon="🔁"
        back="/practice"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={
          <div className="feedback feedback--info text-sm text-fg">
            <p className="font-bold">Jak na to</p>
            <p className="mt-1 text-muted">
              Klíčové slovo použij beze změny a doplň celkem 2–5 slov. Stačí napsat jen chybějící část – ale uznáme i celou větu.
            </p>
          </div>
        }
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Kategorie${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {TRANSFORM_CATEGORIES[c]}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    return (
      <ResultScreen correct={session.correct} total={session.total} mistakes={session.mistakes} onRestart={start} restartLabel="Nové kolo">
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr kategorií</button>
        </div>
      </ResultScreen>
    );
  }

  if (!item) return null;
  const { ex } = item;
  const revealed = result !== null;
  const ok = !!result || overridden;
  const last = idx + 1 >= items.length;
  const user = text.trim();
  const [before = '', after = ''] = ex.prompt.split(GAP_RE);
  const wholeTyped = revealed && typedWholeSentence(user, item);
  const gapShown = revealed ? (ok && !wholeTyped ? user : ex.gapAnswer) : user;
  const missingKeyWord = revealed && !ok && !usesKeyWord(user, ex.keyWord);
  const tooLong = revealed && !ok && !wholeTyped && wordCount(user) > 5;

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={items.length}
        correct={session.correct}
        onExit={() => void session.finish().then(() => setPhase('result'))}
        title="Přeformulace vět"
      />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{TRANSFORM_CATEGORIES[ex.category] ?? ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>

        <div className="flex items-start gap-3 rounded-xl bg-surface-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1">Původní věta</p>
            <p className="text-lg leading-relaxed font-bold break-words text-fg" lang="en">{ex.original}</p>
          </div>
          <SpeakButton size="sm" label="Přehrát původní větu" onClick={() => void speak(ex.original, settings.ttsRate)} />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="eyebrow">Klíčové slovo</span>
          <span className="rounded-lg bg-accent px-3 py-1 text-lg font-black tracking-widest break-all text-accent-contrast" lang="en">
            {ex.keyWord}
          </span>
          <span className="text-xs text-muted">použij ho beze změny · 2–5 slov</span>
        </div>

        <p className="mt-4 mb-1 text-sm font-bold text-muted">Doplň větu, aby měla stejný význam:</p>
        <p className="mb-4 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
          {before}
          {gapShown ? (
            <span className={`rounded-md px-1.5 ${revealed ? 'bg-success-soft text-success' : 'bg-accent-soft text-accent-text'}`}>{gapShown}</span>
          ) : (
            <span className="mx-0.5 inline-block min-w-[5rem] border-b-2 border-accent align-baseline">
              <span className="sr-only">mezera</span>&nbsp;
            </span>
          )}
          {after}
        </p>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <TextAnswer
              value={text}
              onChange={setText}
              onSubmit={submit}
              disabled={revealed}
              status={result === null ? null : ok ? 'correct' : 'wrong'}
              label="Chybějící část věty"
              placeholder={`Doplň 2–5 slov včetně ${ex.keyWord}…`}
            />
          </div>
          {!revealed && (
            <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={submit}>Ověřit</button>
          )}
        </div>

        {revealed && (
          <Feedback
            correct={ok}
            answer={[ex.gapAnswer, ...item.gapAlts].join('|')}
            userAnswer={user}
            explanation={ex.hintCs}
            title={overridden ? 'Uznáno' : undefined}
          >
            {missingKeyWord && (
              <p className="mt-1.5 text-sm text-fg">
                V odpovědi chybí klíčové slovo <strong lang="en">{ex.keyWord}</strong> – musí v ní být beze změny.
              </p>
            )}
            {tooLong && <p className="mt-1.5 text-sm text-fg">Pozor, doplnit se má nejvýš 5 slov.</p>}
            <div className="mt-2 flex items-center gap-2">
              <SpeakButton size="sm" label="Přehrát celou větu" onClick={() => void speak(ex.answer, settings.ttsRate)} />
              <span className="min-w-0 flex-1 text-sm text-fg">
                Celá věta: <strong lang="en">{ex.answer}</strong>
              </span>
            </div>
            {!ok && (
              <button
                type="button"
                className="btn-ghost btn-sm mt-2 !px-2"
                onClick={() => {
                  setOverridden(true);
                  session.markLastCorrect();
                }}
              >
                Moje odpověď je taky správně
              </button>
            )}
          </Feedback>
        )}
        {revealed && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
