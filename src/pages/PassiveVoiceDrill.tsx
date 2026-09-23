import { Fragment, useMemo, useRef, useState } from 'react';
import { PASSIVE_RULES, PASSIVE_EXERCISES, PASSIVE_TENSES, type PassiveExercise } from '../data/passiveVoice';
import { shuffleArray, uniqueBy } from '../utils';
import { isAnswerCorrect, displayAnswer, primaryAnswer } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import { speak } from '../tts';
import { Kbd, SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, TextAnswer,
  Feedback, NextButton, ResultScreen, countGaps,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';

const LEVELS = ['all', 'A2', 'B1'] as const;
/** Tense filters in a stable order (known tenses first, then anything new in the data). */
const TENSES = [
  ...Object.keys(PASSIVE_TENSES),
  ...[...new Set(PASSIVE_EXERCISES.map((e) => e.tense))].filter((t) => !(t in PASSIVE_TENSES)),
].filter((t) => PASSIVE_EXERCISES.some((e) => e.tense === t));
const KIND_LABEL: Record<PassiveExercise['type'], string> = { transform: 'Přepiš', fill: 'Doplň', mcq: 'Výběr' };

interface Item {
  ex: PassiveExercise;
  options?: string[];
  correctIndex: number;
}

function buildItem(ex: PassiveExercise): Item {
  if (ex.type === 'mcq' && ex.options?.length) {
    const unique = uniqueBy([ex.answer, ...ex.options.filter((o) => o !== ex.answer)], (o) => o.trim().toLowerCase());
    const options = shuffleArray(unique);
    return { ex, options, correctIndex: options.indexOf(ex.answer) };
  }
  return { ex, correctIndex: -1 };
}

/** The sentence to transform — the data prompt repeats it after "Přepiš do trpného rodu:". */
function activeSentence(ex: PassiveExercise): string {
  return ex.activeSentence ?? ex.prompt.replace(/^[^:]*:\s*/, '');
}

function answerParts(answer: string, gaps: number): string[] {
  const primary = primaryAnswer(answer);
  const parts = primary.split(/\s*(?:\.\.\.|…)\s*/).filter(Boolean);
  if (parts.length === gaps) return parts;
  return [primary];
}

/** Whole sentence with the answer filled in (the verb hint in brackets removed) — for listening. */
function fullSentence(ex: PassiveExercise): string {
  if (ex.type === 'transform') return primaryAnswer(ex.answer);
  const gaps = countGaps(ex.prompt);
  const parts = answerParts(ex.answer, gaps);
  let i = 0;
  return ex.prompt
    .replace(/_{3,}/g, () => parts[i++] ?? '')
    .replace(/\s*\([^)]*\)\s*$/, '')
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

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

export default function PassiveVoiceDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [tense, setTense] = useState<string>('all');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [count, setCount] = useState(20);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [overridden, setOverridden] = useState(false);
  const answered = useRef(false);
  const session = useDrillSession('passive_voice', {
    tags: [tense === 'all' ? 'all' : `pv_${tense}`, ...(level !== 'all' ? [level] : [])],
  });

  const pool = useMemo(
    () => PASSIVE_EXERCISES.filter((e) => (tense === 'all' || e.tense === tense) && (level === 'all' || e.level === level)),
    [tense, level],
  );

  const item = items[idx];

  function resetItem() {
    answered.current = false;
    setSelected(null);
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
    } else {
      user = text.trim();
      if (!user) return;
      // Strict: a different tense (is / was / has been…) or word order is a mistake.
      correct = isAnswerCorrect(user, ex.answer);
    }
    answered.current = true;
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.tense,
      prompt: ex.type === 'transform' ? `Přepiš do trpného rodu: ${activeSentence(ex)}` : ex.prompt,
      options: item.options,
      kind: item.options ? 'mcq' : 'text',
      answer: ex.answer,
      userAnswer: user,
      explanation: ex.explanationCs,
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
        title="Trpný rod"
        subtitle="Passive voice – tvoření a použití trpného rodu ve všech běžných časech. Pro české mluvčí zrádné téma."
        icon="🔄"
        back="/practice"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={<PassiveRules />}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Čas">
          <Chip active={tense === 'all'} onClick={() => setTense('all')}>Vše</Chip>
          {TENSES.map((t) => (
            <Chip key={t} active={tense === t} onClick={() => setTense(t)}>{PASSIVE_TENSES[t] ?? t}</Chip>
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
  const nGaps = countGaps(ex.prompt);
  const status = result === null ? null : result || overridden ? 'correct' : 'wrong';
  const isTransform = ex.type === 'transform';

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={items.length}
        correct={session.correct}
        onExit={() => void session.finish().then(() => setPhase('result'))}
        title="Trpný rod"
      />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{PASSIVE_TENSES[ex.tense] ?? ex.tense}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
          <span className="badge">{KIND_LABEL[ex.type]}</span>
        </div>

        {isTransform ? (
          <>
            <p className="mb-1 text-sm font-bold text-muted">Přepiš celou větu do trpného rodu:</p>
            <div className="mb-4 rounded-xl bg-surface-2 px-4 py-3">
              <p className="eyebrow mb-1">Činný rod</p>
              <p className="text-xl leading-relaxed font-bold break-words text-fg" lang="en">{activeSentence(ex)}</p>
            </div>
          </>
        ) : (
          <>
            <p className="mb-1 text-sm font-bold text-muted">
              {ex.type === 'mcq' ? 'Vyber správný tvar:' : 'Doplň sloveso ze závorky ve správném tvaru trpného rodu:'}
            </p>
            <div className="mb-4 flex items-start gap-3">
              <p className="min-w-0 flex-1 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
                <GapSentence text={ex.prompt} fills={revealed && nGaps ? answerParts(ex.answer, nGaps) : undefined} />
              </p>
              {revealed && <SpeakButton size="sm" label="Přehrát celou větu" onClick={() => void speak(fullSentence(ex), settings.ttsRate)} />}
            </div>
          </>
        )}

        {item.options ? (
          <>
            <OptionList options={item.options} selected={selected} correctIndex={item.correctIndex} revealed={revealed} onSelect={(i) => submit(i)} columns={2} />
            {!revealed && (
              <p className="mt-3 hidden text-xs text-subtle sm:block">
                Tip: odpověď vybereš i klávesou <Kbd>1</Kbd>–<Kbd>{item.options.length}</Kbd>.
              </p>
            )}
          </>
        ) : (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="flex-1">
              <TextAnswer
                value={text}
                onChange={setText}
                onSubmit={() => submit()}
                disabled={revealed}
                status={status}
                label={isTransform ? 'Věta v trpném rodě' : 'Tvar slovesa'}
                placeholder={isTransform ? 'Napiš celou větu v trpném rodě…' : 'Napiš tvar slovesa…'}
                multiline={isTransform}
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
            answer={isTransform ? undefined : ex.answer}
            userAnswer={item.options || isTransform ? undefined : text.trim()}
            explanation={isTransform ? undefined : ex.explanationCs}
            title={overridden ? 'Uznáno' : undefined}
          >
            {isTransform && (
              <>
                <div className="mt-1 flex items-center gap-2">
                  <SpeakButton size="sm" label="Přehrát správnou větu" onClick={() => void speak(fullSentence(ex), settings.ttsRate)} />
                  <span className="min-w-0 flex-1 text-sm text-fg">
                    {result || overridden ? 'Vzorová odpověď' : 'Správně'}: <strong lang="en">{displayAnswer(ex.answer)}</strong>
                  </span>
                </div>
                <div className="mt-1.5 text-sm leading-relaxed text-muted">{ex.explanationCs}</div>
                {!result && !overridden && (
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
              </>
            )}
          </Feedback>
        )}
        {revealed && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}

/* ─── Rules reference ─────────────────────────────────────────────── */

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

function PassiveRules() {
  const { settings } = useSettings();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section aria-labelledby="pv-rules-title">
      <h2 id="pv-rules-title" className="section-title">Pravidla trpného rodu</h2>
      <p className="-mt-2 mb-3 text-sm text-muted">Rozklikni čas a uvidíš vzorec, příklad a vysvětlení.</p>
      <div className="space-y-2">
        {PASSIVE_RULES.map((rule) => {
          const isOpen = open === rule.id;
          return (
            <div key={rule.id} className="card overflow-hidden !p-0">
              <button
                type="button"
                className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2"
                aria-expanded={isOpen}
                aria-controls={`${rule.id}-panel`}
                onClick={() => setOpen(isOpen ? null : rule.id)}
              >
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-fg">{rule.tenseCs}</span>
                  <span className="block text-sm text-muted" lang="en">{rule.tense}</span>
                </span>
                <Chevron open={isOpen} />
              </button>
              {isOpen && (
                <div id={`${rule.id}-panel`} className="space-y-3 border-t border-border px-4 pt-4 pb-5">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="rounded-xl bg-surface-2 px-4 py-3">
                      <p className="eyebrow mb-1">Činný rod</p>
                      <p className="font-mono text-sm break-words text-fg" lang="en">{rule.activeFormula}</p>
                    </div>
                    <div className="rounded-xl bg-accent-soft px-4 py-3">
                      <p className="eyebrow mb-1">Trpný rod</p>
                      <p className="font-mono text-sm break-words text-accent-text" lang="en">{rule.passiveFormula}</p>
                    </div>
                  </div>
                  <div className="space-y-2 rounded-xl bg-surface-2 p-3">
                    <div className="flex items-start gap-3">
                      <SpeakButton size="sm" label="Přehrát větu v činném rodě" onClick={() => void speak(rule.activeExample, settings.ttsRate)} />
                      <span className="min-w-0 flex-1">
                        <span className="eyebrow block">Činný rod – příklad</span>
                        <span className="block text-sm font-bold text-fg" lang="en">{rule.activeExample}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <SpeakButton size="sm" label="Přehrát větu v trpném rodě" onClick={() => void speak(rule.passiveExample, settings.ttsRate)} />
                      <span className="min-w-0 flex-1">
                        <span className="eyebrow block">Trpný rod – příklad</span>
                        <span className="block text-sm font-bold text-accent-text" lang="en">{rule.passiveExample}</span>
                      </span>
                    </div>
                  </div>
                  <div className="feedback feedback--info">
                    <p className="eyebrow mb-1">Vysvětlení</p>
                    <p className="text-sm leading-relaxed text-fg">{rule.explanationCs}</p>
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
