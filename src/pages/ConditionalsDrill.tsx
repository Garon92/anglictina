import { Fragment, useMemo, useRef, useState } from 'react';
import { CONDITIONAL_TYPES, CONDITIONAL_EXERCISES, type ConditionalExercise } from '../data/conditionals';
import { shuffleArray, uniqueBy } from '../utils';
import { isAnswerCorrect, isGapAnswerCorrect, isMultiGap, gapVariants, primaryAnswer } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import { speak } from '../tts';
import { Kbd, SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, TextAnswer, MultiGapAnswer,
  Feedback, NextButton, ResultScreen, countGaps,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
type CondType = ConditionalExercise['conditionalType'];

const LEVELS = ['all', 'A2', 'B1'] as const;
const TYPE_FILTERS = ['all', '0', '1', '2', '3', 'mixed'] as const;
const TYPE_LABEL: Record<CondType, string> = { '0': 'Typ 0', '1': 'Typ 1', '2': 'Typ 2', '3': 'Typ 3', mixed: 'Smíšený' };
/** Fixed order for "which type is it?" questions (keys 1–5). */
const MATCH_OPTIONS = (['0', '1', '2', '3', 'mixed'] as CondType[]).map((t) => TYPE_LABEL[t]);
const KIND_LABEL: Record<ConditionalExercise['type'], string> = { fill: 'Doplň', mcq: 'Výběr', match_type: 'Urči typ' };

/** One exercise prepared for a round (options shuffled once, answer normalised). */
interface Item {
  ex: ConditionalExercise;
  prompt: string;
  answer: string;
  options?: string[];
  correctIndex: number;
  /** Number of separate inputs for fill exercises (1 = single box). */
  inputs: number;
}

function buildItem(ex: ConditionalExercise): Item {
  // Older data told the learner to separate answers with commas — the page now has one box per gap.
  const prompt = ex.prompt.replace(/\s*\(Odpovědi odděl čárkou\.?\)/i, '').trim();
  const nGaps = countGaps(prompt);

  if (ex.type === 'match_type') {
    const answer = TYPE_LABEL[ex.answer as CondType] ?? ex.answer;
    return { ex, prompt, answer, options: MATCH_OPTIONS, correctIndex: MATCH_OPTIONS.indexOf(answer), inputs: 0 };
  }
  if (ex.type === 'mcq' && ex.options?.length) {
    const unique = uniqueBy([ex.answer, ...ex.options.filter((o) => o !== ex.answer)], (o) => o.trim().toLowerCase());
    const options = shuffleArray(unique);
    return { ex, prompt, answer: ex.answer, options, correctIndex: options.indexOf(ex.answer), inputs: 0 };
  }

  let answer = ex.answer;
  if (nGaps > 1 && !isMultiGap(answer)) {
    const parts = answer.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length === nGaps) answer = parts.join(' ... ');
  }
  const parts = isMultiGap(answer) ? gapVariants(answer)[0]?.length ?? 1 : 1;
  return { ex, prompt, answer, correctIndex: -1, inputs: parts > 1 && parts === nGaps ? parts : 1 };
}

/** The (first) correct answer split into one part per gap. */
function answerParts(answer: string, gaps: number): string[] {
  const primary = primaryAnswer(answer);
  const parts = primary.split(/\s*(?:\.\.\.|…)\s*/).filter(Boolean);
  if (parts.length === gaps) return parts;
  const words = primary.split(/\s+/);
  if (parts.length === 1 && gaps > 1 && words.length === gaps) return words;
  return [primary];
}

/** Whole sentence with the answer filled in (hints in brackets removed) — for listening. */
function fullSentence(prompt: string, answer: string): string {
  const gaps = countGaps(prompt);
  if (!gaps) return prompt;
  const parts = answerParts(answer, gaps);
  let i = 0;
  return prompt
    .replace(/_{3,}(\s*\([^)]*\))?/g, () => parts[i++] ?? '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Prompt with visible blanks; after answering the blanks show the correct parts. */
function GapSentence({ text, fills }: { text: string; fills?: string[] }) {
  const chunks = text.split(/_{3,}/);
  return (
    <>
      {chunks.map((chunk, i) => (
        <Fragment key={i}>
          {chunk}
          {i < chunks.length - 1 &&
            (fills?.[i] ? (
              <span className="rounded-md bg-success-soft px-1.5 text-success">{fills[i]}</span>
            ) : (
              <span className="mx-0.5 inline-block min-w-[3.5rem] border-b-2 border-accent align-baseline">
                <span className="sr-only">mezera</span>&nbsp;
              </span>
            ))}
        </Fragment>
      ))}
    </>
  );
}

export default function ConditionalsDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [type, setType] = useState<(typeof TYPE_FILTERS)[number]>('all');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [count, setCount] = useState(20);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [gaps, setGaps] = useState<string[]>([]);
  const [result, setResult] = useState<boolean | null>(null);
  const [overridden, setOverridden] = useState(false);
  const answered = useRef(false);
  const session = useDrillSession('conditionals', {
    tags: [type === 'all' ? 'all' : `cond_${type}`, ...(level !== 'all' ? [level] : [])],
  });

  const pool = useMemo(
    () => CONDITIONAL_EXERCISES.filter((e) => (type === 'all' || e.conditionalType === type) && (level === 'all' || e.level === level)),
    [type, level],
  );

  const item = items[idx];

  function resetItem() {
    answered.current = false;
    setSelected(null);
    setText('');
    setGaps([]);
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

  function submit(opt?: number) {
    if (!item || result !== null || answered.current) return;
    const { ex } = item;
    let correct: boolean;
    let user: string;
    if (item.options) {
      if (opt === undefined) return;
      setSelected(opt);
      user = item.options[opt];
      correct = opt === item.correctIndex;
    } else if (item.inputs > 1) {
      if (gaps.filter((g) => g?.trim()).length < item.inputs) return;
      user = gaps.map((g) => g.trim()).join(' … ');
      correct = isGapAnswerCorrect(gaps, item.answer);
    } else {
      user = text.trim();
      if (!user) return;
      correct = isAnswerCorrect(user, item.answer);
    }
    answered.current = true;
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: `type_${ex.conditionalType}`,
      prompt: item.prompt,
      options: item.options,
      kind: item.options ? 'mcq' : 'text',
      answer: item.answer,
      userAnswer: user,
      explanation: ex.explanationCs,
      context: ex.type === 'match_type' ? 'Urči typ podmínkové věty.' : undefined,
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
        title="Podmínkové věty"
        subtitle="If + podmínka → výsledek. Typy 0–3 a smíšené kondicionály – klíčová gramatika k maturitě."
        icon="🔀"
        back="/practice"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={<ConditionalsReference />}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Typ kondicionálu">
          {TYPE_FILTERS.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>{t === 'all' ? 'Vše' : t === 'mixed' ? 'Smíšený' : TYPE_LABEL[t]}</Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    return (
      <ResultScreen correct={session.correct} total={session.total} mistakes={session.mistakes} onRestart={start} restartLabel="Nové kolo">
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr nebo zopakovat pravidla</button>
        </div>
      </ResultScreen>
    );
  }

  if (!item) return null;
  const { ex } = item;
  const revealed = result !== null;
  const last = idx + 1 >= items.length;
  const nGaps = countGaps(item.prompt);
  const status = result === null ? null : result || overridden ? 'correct' : 'wrong';
  const sentence = ex.type === 'match_type' ? item.prompt : fullSentence(item.prompt, item.answer);
  const instruction =
    ex.type === 'match_type'
      ? 'O jaký typ podmínkové věty jde?'
      : ex.type === 'mcq'
        ? 'Vyber správnou možnost:'
        : item.inputs > 1
          ? 'Doplň správné tvary do všech mezer:'
          : nGaps > 1
            ? 'Doplň všechny mezery (napiš je za sebou):'
            : 'Doplň správný tvar:';

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={items.length}
        correct={session.correct}
        onExit={() => void session.finish().then(() => setPhase('result'))}
        title="Podmínkové věty"
      />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          {/* The type badge would give the answer away in "which type?" questions. */}
          {(ex.type !== 'match_type' || revealed) && <span className="badge">{TYPE_LABEL[ex.conditionalType]}</span>}
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
          <span className="badge">{KIND_LABEL[ex.type]}</span>
        </div>

        <p className="mb-1 text-sm font-bold text-muted">{instruction}</p>
        <div className="mb-4 flex items-start gap-3">
          <p className="min-w-0 flex-1 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
            <GapSentence text={item.prompt} fills={revealed && nGaps ? answerParts(item.answer, nGaps) : undefined} />
          </p>
          {revealed && <SpeakButton size="sm" label="Přehrát celou větu" onClick={() => void speak(sentence, settings.ttsRate)} />}
        </div>

        {item.options ? (
          <>
            <OptionList
              options={item.options}
              selected={selected}
              correctIndex={item.correctIndex}
              revealed={revealed}
              onSelect={(i) => submit(i)}
              lang={ex.type === 'match_type' ? 'cs' : 'en'}
              columns={ex.type === 'mcq' ? 2 : 1}
            />
            {!revealed && (
              <p className="mt-3 hidden text-xs text-subtle sm:block">
                Tip: odpověď vybereš i klávesou <Kbd>1</Kbd>–<Kbd>{item.options.length}</Kbd>.
              </p>
            )}
          </>
        ) : item.inputs > 1 ? (
          <>
            <MultiGapAnswer count={item.inputs} values={gaps} onChange={setGaps} onSubmit={() => submit()} disabled={revealed} status={status} />
            {!revealed && (
              <button
                type="button"
                className="btn-primary btn-lg mt-3 w-full sm:w-auto"
                disabled={gaps.filter((g) => g?.trim()).length < item.inputs}
                onClick={() => submit()}
              >
                Ověřit
              </button>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <TextAnswer
                value={text}
                onChange={setText}
                onSubmit={() => submit()}
                disabled={revealed}
                status={status}
                placeholder={nGaps > 1 ? 'Napiš tvary do mezer za sebou…' : 'Napiš správný tvar…'}
              />
            </div>
            {!revealed && (
              <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={() => submit()}>Ověřit</button>
            )}
          </div>
        )}

        {revealed && (
          <Feedback
            correct={!!result || overridden}
            answer={item.answer}
            userAnswer={item.options ? undefined : item.inputs > 1 ? gaps.map((g) => g.trim()).join(' … ') : text.trim()}
            explanation={ex.explanationCs}
            title={overridden ? 'Uznáno' : undefined}
          />
        )}
        {revealed && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}

/* ─── Reference of the conditional types ──────────────────────────── */

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

function ConditionalsReference() {
  const { settings } = useSettings();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section aria-labelledby="cond-ref-title">
      <h2 id="cond-ref-title" className="section-title">Přehled typů</h2>
      <p className="-mt-2 mb-3 text-sm text-muted">Rozklikni typ a uvidíš vzorec, použití, příklady a signální slova.</p>
      <div className="space-y-2">
        {CONDITIONAL_TYPES.map((ct) => {
          const isOpen = open === ct.id;
          return (
            <div key={ct.id} className="card overflow-hidden !p-0">
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
                aria-expanded={isOpen}
                aria-controls={`${ct.id}-panel`}
                onClick={() => setOpen(isOpen ? null : ct.id)}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-fg">{ct.nameCs}</span>
                  <span className="block text-sm text-muted" lang="en">{ct.name}</span>
                </span>
                <Chevron open={isOpen} />
              </button>
              {isOpen && (
                <div id={`${ct.id}-panel`} className="space-y-4 border-t border-border px-4 pt-4 pb-5">
                  <div className="rounded-xl bg-accent-soft px-4 py-3">
                    <p className="eyebrow mb-1">Vzorec</p>
                    <p className="font-mono text-sm break-words text-accent-text" lang="en">{ct.formula}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-1">Kdy používáme</p>
                    <p className="text-sm leading-relaxed text-fg">{ct.usageCs}</p>
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Příklady</p>
                    <ul className="space-y-2 rounded-xl bg-surface-2 p-3">
                      {ct.examples.map((e) => (
                        <li key={e.en} className="flex items-start gap-3">
                          <SpeakButton size="sm" label={`Přehrát: ${e.en}`} onClick={() => void speak(e.en, settings.ttsRate)} />
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-bold text-fg" lang="en">{e.en}</span>
                            <span className="block text-xs text-muted italic">{e.cs}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="eyebrow mb-2">Signální slova</p>
                    <div className="flex flex-wrap gap-1.5">
                      {ct.signalWords.map((w) => (
                        <span key={w} className="badge" lang="en">{w}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
