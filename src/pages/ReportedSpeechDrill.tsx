import { Fragment, useMemo, useRef, useState } from 'react';
import {
  REPORTED_SPEECH_RULES, REPORTED_SPEECH_EXERCISES, RS_CATEGORIES, type ReportedSpeechExercise,
} from '../data/reportedSpeech';
import { shuffleArray, uniqueBy } from '../utils';
import { isAnswerCorrect, answerVariants, displayAnswer, primaryAnswer } from '../lib/answer';
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
const CATEGORIES = Object.keys(RS_CATEGORIES);
const KIND_LABEL: Record<ReportedSpeechExercise['type'], string> = { transform: 'Přepiš', fill: 'Doplň', mcq: 'Výběr' };

interface Item {
  ex: ReportedSpeechExercise;
  /** Direct speech part shown in the quote box (e.g. 'He said: "I like football."'). */
  direct: string;
  /** Reported-speech frame with gaps ("She said she ___ happy.") or the lead-in ("He said …"). */
  frame: string;
  /** Lead-in of a transform ("He said") — the learner may type only what follows. */
  lead: string;
  options?: string[];
  correctIndex: number;
  /** Extra accepted full answers (optional "that", "whether", only the part after the lead-in). */
  accept: string[];
}

const PRONOUN = '(?:i|you|he|she|it|we|they|her|his|their|my|our|your|its)';
const THAT_RE = new RegExp(`^(.*?\\b(?:said|told \\w+))\\s+(?!that\\b)(${PRONOUN}\\b.*)$`, 'i');

function transformAccept(answer: string, lead: string): string[] {
  const variants = answerVariants(answer);
  const full = new Set<string>();
  for (const v of variants) {
    full.add(v);
    const m = v.match(THAT_RE);
    if (m) full.add(`${m[1]} that ${m[2]}`); // "He said (that) he liked football."
  }
  const whether = [...full].filter((f) => /\basked\b/i.test(f) && /\bif\b/i.test(f)).map((f) => f.replace(/\bif\b/i, 'whether'));
  for (const f of whether) full.add(f);
  const out = new Set(full);
  if (lead) {
    const l = lead.toLowerCase();
    for (const f of full) if (f.toLowerCase().startsWith(`${l} `)) out.add(f.slice(lead.length).trim());
  }
  return [...out].filter((x) => !variants.includes(x));
}

function buildItem(ex: ReportedSpeechExercise): Item {
  const arrow = ex.prompt.indexOf('→');
  const direct = arrow >= 0 ? ex.prompt.slice(0, arrow).trim() : ex.directSpeech;
  const frame = arrow >= 0 ? ex.prompt.slice(arrow + 1).trim() : ex.prompt;
  const lead = ex.type === 'transform' ? frame.replace(/\s*(?:…|\.\.\.)\s*$/, '').trim() : '';
  if (ex.type === 'mcq' && ex.options?.length) {
    const unique = uniqueBy([ex.answer, ...ex.options.filter((o) => o !== ex.answer)], (o) => o.trim().toLowerCase());
    const options = shuffleArray(unique);
    return { ex, direct, frame, lead, options, correctIndex: options.indexOf(ex.answer), accept: [] };
  }
  return { ex, direct, frame, lead, correctIndex: -1, accept: ex.type === 'transform' ? transformAccept(ex.answer, lead) : [] };
}

function answerParts(answer: string, gaps: number): string[] {
  const primary = primaryAnswer(answer);
  const parts = primary.split(/\s*(?:\.\.\.|…)\s*/).filter(Boolean);
  if (parts.length === gaps) return parts;
  const words = primary.split(/\s+/);
  if (parts.length === 1 && gaps > 1 && words.length === gaps) return words;
  return [primary];
}

/** The complete reported sentence (model answer). */
function modelSentence(item: Item): string {
  if (item.ex.type === 'transform') return primaryAnswer(item.ex.answer);
  const gaps = countGaps(item.frame);
  const parts = answerParts(item.ex.answer, gaps);
  let i = 0;
  return item.frame
    .replace(/_{3,}/g, () => parts[i++] ?? '')
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

export default function ReportedSpeechDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [category, setCategory] = useState<string>('all');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [count, setCount] = useState(20);
  const [items, setItems] = useState<Item[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [overridden, setOverridden] = useState(false);
  const answered = useRef(false);
  const session = useDrillSession('reported_speech', {
    tags: [category === 'all' ? 'all' : `rs_${category}`, ...(level !== 'all' ? [level] : [])],
  });

  const pool = useMemo(
    () => REPORTED_SPEECH_EXERCISES.filter((e) => (category === 'all' || e.category === category) && (level === 'all' || e.level === level)),
    [category, level],
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
      // Strict comparison: wrong backshift, pronouns or word order are mistakes.
      correct = isAnswerCorrect(user, ex.answer, item.accept);
    }
    answered.current = true;
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: ex.prompt,
      options: item.options,
      kind: item.options ? 'mcq' : 'text',
      answer: ex.answer,
      accept: item.accept.length ? item.accept : undefined,
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
        title="Nepřímá řeč"
        subtitle="Reported speech – převod přímé řeči na nepřímou: posun časů, zájmena, otázky i rozkazy."
        icon="🗨️"
        back="/practice"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={<ReportedRules />}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Kategorie">
          <Chip active={category === 'all'} onClick={() => setCategory('all')}>Vše</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={category === c} onClick={() => setCategory(c)}>{RS_CATEGORIES[c]}</Chip>
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
  const isTransform = ex.type === 'transform';
  const nGaps = countGaps(item.frame);
  const status = result === null ? null : result || overridden ? 'correct' : 'wrong';
  const model = modelSentence(item);

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={items.length}
        correct={session.correct}
        onExit={() => void session.finish().then(() => setPhase('result'))}
        title="Nepřímá řeč"
      />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{RS_CATEGORIES[ex.category] ?? ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
          <span className="badge">{KIND_LABEL[ex.type]}</span>
        </div>

        <p className="mb-2 text-sm font-bold text-muted">
          {isTransform
            ? 'Převeď větu do nepřímé řeči:'
            : ex.type === 'mcq'
              ? 'Vyber správný tvar v nepřímé řeči:'
              : 'Doplň chybějící slovo v nepřímé řeči:'}
        </p>

        <div className="flex items-start gap-3 rounded-xl bg-surface-2 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-1">Přímá řeč</p>
            <p className="text-lg leading-relaxed font-bold break-words text-fg" lang="en">{item.direct}</p>
          </div>
          <SpeakButton size="sm" label="Přehrát přímou řeč" onClick={() => void speak(item.direct, settings.ttsRate)} />
        </div>

        <div className="my-2 text-center text-muted" aria-hidden="true">↓</div>

        <div className="mb-4">
          <p className="eyebrow mb-1">Nepřímá řeč</p>
          <p className="text-xl leading-relaxed font-bold break-words text-fg" lang="en">
            {isTransform ? item.frame : <GapSentence text={item.frame} fills={revealed && nGaps ? answerParts(ex.answer, nGaps) : undefined} />}
          </p>
        </div>

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
                label={isTransform ? 'Věta v nepřímé řeči' : 'Chybějící slovo'}
                placeholder={isTransform ? `${item.lead || 'He said'} …` : 'Napiš chybějící slovo…'}
                multiline={isTransform}
              />
              {isTransform && !revealed && (
                <p className="mt-1.5 text-xs text-muted">Napiš celou větu, nebo jen to, co následuje po „<span lang="en">{item.lead}</span>“.</p>
              )}
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
            title={overridden ? 'Uznáno' : undefined}
          >
            <div className="mt-1 flex items-center gap-2">
              <SpeakButton size="sm" label="Přehrát celou větu" onClick={() => void speak(model, settings.ttsRate)} />
              <span className="min-w-0 flex-1 text-sm text-fg">
                {isTransform ? (result || overridden ? 'Vzorová odpověď' : 'Správně') : 'Celá věta'}:{' '}
                <strong lang="en">{isTransform ? displayAnswer(ex.answer) : model}</strong>
              </span>
            </div>
            <div className="mt-1.5 text-sm leading-relaxed text-muted">{ex.explanationCs}</div>
            {isTransform && !result && !overridden && (
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

function ReportedRules() {
  const { settings } = useSettings();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <section aria-labelledby="rs-rules-title">
      <h2 id="rs-rules-title" className="section-title">Pravidla nepřímé řeči</h2>
      <p className="-mt-2 mb-3 text-sm text-muted">Rozklikni pravidlo a uvidíš příklad a vysvětlení.</p>
      <div className="space-y-2">
        {REPORTED_SPEECH_RULES.map((rule) => {
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
                  <span className="block font-bold break-words text-fg">{rule.titleCs}</span>
                  <span className="block text-sm break-words text-muted" lang="en">{rule.title}</span>
                </span>
                <Chevron open={isOpen} />
              </button>
              {isOpen && (
                <div id={`${rule.id}-panel`} className="space-y-3 border-t border-border px-4 pt-4 pb-5">
                  <div className="space-y-2 rounded-xl bg-surface-2 p-3">
                    <div className="flex items-start gap-3">
                      <SpeakButton size="sm" label="Přehrát přímou řeč" onClick={() => void speak(rule.directExample, settings.ttsRate)} />
                      <span className="min-w-0 flex-1">
                        <span className="eyebrow block">Přímá řeč</span>
                        <span className="block text-sm font-bold break-words text-fg" lang="en">{rule.directExample}</span>
                      </span>
                    </div>
                    <div className="flex items-start gap-3">
                      <SpeakButton size="sm" label="Přehrát nepřímou řeč" onClick={() => void speak(rule.reportedExample, settings.ttsRate)} />
                      <span className="min-w-0 flex-1">
                        <span className="eyebrow block">Nepřímá řeč</span>
                        <span className="block text-sm font-bold break-words text-accent-text" lang="en">{rule.reportedExample}</span>
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
