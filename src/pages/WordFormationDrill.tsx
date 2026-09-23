import { Fragment, useMemo, useRef, useState } from 'react';
import { WORD_FORMATION_EXERCISES, WORD_FAMILIES, WF_CATEGORIES, type WordFormationExercise } from '../data/wordFormation';
import { shuffleArray } from '../utils';
import { isAnswerCorrect, normalizeAnswer, primaryAnswer } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import { speak } from '../tts';
import { SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';

const LEVELS = ['all', 'A2', 'B1'] as const;
const CATEGORIES = Object.keys(WF_CATEGORIES);

/** Split "It was a _____ day. (BEAUTY)" into the sentence and the base word. */
function splitSentence(ex: WordFormationExercise): { text: string; base: string } {
  const m = ex.sentence.match(/\s*\(([^)]+)\)\s*$/);
  return m && m.index !== undefined
    ? { text: ex.sentence.slice(0, m.index).trim(), base: m[1].trim() }
    : { text: ex.sentence, base: ex.baseWord };
}

function GapSentence({ text, fill }: { text: string; fill?: string }) {
  const chunks = text.split(/_{3,}/);
  return (
    <>
      {chunks.map((chunk, i) => (
        <Fragment key={i}>
          {chunk}
          {i < chunks.length - 1 &&
            (fill ? (
              <span className="rounded-md bg-success-soft px-1.5 text-success">{fill}</span>
            ) : (
              <span className="mx-0.5 inline-block min-w-[4rem] border-b-2 border-accent align-baseline">
                <span className="sr-only">mezera</span>&nbsp;
              </span>
            ))}
        </Fragment>
      ))}
    </>
  );
}

export default function WordFormationDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [count, setCount] = useState(15);
  const [items, setItems] = useState<WordFormationExercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const answered = useRef(false);
  const session = useDrillSession('word_formation', {
    tags: [...(cats.length ? cats : ['all']), ...(level !== 'all' ? [level] : [])],
  });

  const pool = useMemo(
    () => WORD_FORMATION_EXERCISES.filter((e) => (!cats.length || cats.includes(e.category)) && (level === 'all' || e.level === level)),
    [cats, level],
  );

  const ex = items[idx];

  function resetItem() {
    answered.current = false;
    setText('');
    setResult(null);
  }

  function start() {
    setItems(shuffleArray(pool).slice(0, count));
    setIdx(0);
    resetItem();
    session.start();
    setPhase('drill');
  }

  function submit() {
    if (!ex || result !== null || answered.current) return;
    const user = text.trim();
    if (!user) return;
    const correct = isAnswerCorrect(user, ex.answer);
    answered.current = true;
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.category,
      prompt: ex.sentence,
      kind: 'text',
      answer: ex.answer,
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
        title="Tvoření slov"
        subtitle="Utvoř ze slova psaného VELKÝMI písmeny správný tvar – přípony, předpony a záporné tvary jako u maturity."
        icon="🔧"
        back="/practice"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={<WordFamilies />}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Kategorie${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORIES.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {WF_CATEGORIES[c] || c}
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
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr nebo projít slovní rodiny</button>
        </div>
      </ResultScreen>
    );
  }

  if (!ex) return null;
  const revealed = result !== null;
  const last = idx + 1 >= items.length;
  const { text: sentence, base } = splitSentence(ex);
  const answer = primaryAnswer(ex.answer);
  const full = sentence.replace(/_{3,}/, answer);
  const family = ex.wordFamily ?? [];

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={items.length}
        correct={session.correct}
        onExit={() => void session.finish().then(() => setPhase('result'))}
        title="Tvoření slov"
      />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{WF_CATEGORIES[ex.category] || ex.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>

        <p className="mb-2 text-sm font-bold text-muted">Utvoř ze slova vpravo správný tvar a doplň ho:</p>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start">
          <p className="min-w-0 flex-1 text-xl leading-relaxed font-bold break-words text-fg" lang="en">
            <GapSentence text={sentence} fill={revealed ? answer : undefined} />
          </p>
          <div className="flex items-center gap-2 self-start sm:flex-col sm:items-end">
            <span
              className="rounded-lg border-2 border-accent bg-accent-soft px-3 py-1 text-lg font-black tracking-widest break-all text-accent-text"
              lang="en"
            >
              <span className="sr-only" lang="cs">Základní slovo: </span>
              {base.toUpperCase()}
            </span>
            {revealed && <SpeakButton size="sm" label="Přehrát celou větu" onClick={() => void speak(full, settings.ttsRate)} />}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <TextAnswer
              value={text}
              onChange={setText}
              onSubmit={submit}
              disabled={revealed}
              status={result === null ? null : result ? 'correct' : 'wrong'}
              label={`Tvar slova ${base.toUpperCase()}`}
              placeholder="Napiš správný tvar slova…"
            />
          </div>
          {!revealed && (
            <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={submit}>Ověřit</button>
          )}
        </div>

        {revealed && (
          <Feedback correct={!!result} answer={ex.answer} userAnswer={text.trim()} explanation={ex.hintCs}>
            {family.length > 0 && (
              <div className="mt-2">
                <p className="eyebrow mb-1">Slovní rodina</p>
                <div className="flex flex-wrap gap-1.5">
                  {family.map((w) => (
                    <span
                      key={w}
                      lang="en"
                      className={`badge ${normalizeAnswer(w) === normalizeAnswer(answer) ? '!bg-success-soft !text-success' : ''}`}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Feedback>
        )}
        {revealed && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}

/* ─── Word families reference ─────────────────────────────────────── */

function WordFamilies() {
  const { settings } = useSettings();
  const [selected, setSelected] = useState<string | null>(null);
  const family = WORD_FAMILIES.find((f) => f.base === selected);
  return (
    <section aria-labelledby="wf-ref-title">
      <h2 id="wf-ref-title" className="section-title">Slovní rodiny</h2>
      <p className="-mt-2 mb-3 text-sm text-muted">Vyber základní slovo a uvidíš, jaká slova se od něj tvoří ({WORD_FAMILIES.length} rodin).</p>
      <div className="card !p-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Základní slova">
          {WORD_FAMILIES.map((f) => (
            <Chip key={f.base} active={selected === f.base} onClick={() => setSelected(selected === f.base ? null : f.base)}>
              <span lang="en">{f.base}</span>
            </Chip>
          ))}
        </div>
        {family ? (
          <ul className="mt-4 divide-y divide-border border-t border-border" aria-live="polite">
            {family.forms.map((f) => (
              <li key={f.word} className="flex items-center gap-3 py-2">
                <SpeakButton size="sm" label={`Přehrát: ${f.word}`} onClick={() => void speak(f.word, settings.ttsRate)} />
                <span className="min-w-0 flex-1 font-bold break-words text-fg" lang="en">{f.word}</span>
                <span className="shrink-0 text-right text-sm text-muted">{f.posCs}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-muted">Klepni na slovo výše.</p>
        )}
      </div>
    </section>
  );
}
