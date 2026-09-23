import { useEffect, useMemo, useRef, useState } from 'react';
import { READING_TEXTS } from '../data/reading';
import { MATURITA_TOPICS, type ReadingText } from '../types';
import { kvGet, kvSet } from '../db';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
type Level = 'all' | ReadingText['level'];
type BestMap = Record<string, { correct: number; total: number }>;

const LEVELS: Level[] = ['all', 'A1', 'A2', 'B1'];
const BEST_KEY = 'reading:best';

const TOPIC_LABELS: Record<string, string> = Object.fromEntries(MATURITA_TOPICS.map((t) => [t.id, t.cs]));
const topicLabel = (id: string) => TOPIC_LABELS[id] ?? id;

/** Topics that have at least one text, in the order of the maturita topic list. */
const TOPICS = MATURITA_TOPICS.map((t) => t.id as string).filter((id) => READING_TEXTS.some((t) => t.topic === id));
for (const t of READING_TEXTS) if (!TOPICS.includes(t.topic)) TOPICS.push(t.topic);

const LEVEL_BADGE: Record<string, string> = {
  A1: '!bg-success-soft !text-success',
  A2: '!bg-info-soft !text-info',
  B1: '!bg-accent-soft !text-accent-text',
};

const TYPE_LABEL: Record<string, string> = {
  truefalse: 'True / False',
  tfns: 'True / False / Not stated',
};

function LevelBadge({ level }: { level: string }) {
  return <span className={`badge ${LEVEL_BADGE[level] ?? ''}`}>{level}</span>;
}

function plural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

function wordCount(text: string) {
  return text.trim().split(/\s+/).length;
}

export default function ReadingPractice() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<Level>('all');
  const [topic, setTopic] = useState<string>('all');
  const [text, setText] = useState<ReadingText | null>(null);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [best, setBest] = useState<BestMap>({});
  /** Best result before the current attempt (for the "new record" message). */
  const [prevBest, setPrevBest] = useState<{ correct: number; total: number } | null>(null);
  const [completed, setCompleted] = useState(false);
  const correctRef = useRef(0);
  const textRef = useRef<HTMLElement>(null);
  const questionsRef = useRef<HTMLElement>(null);
  const session = useDrillSession('reading', { tags: text ? [text.topic, text.id] : [] });

  useEffect(() => {
    let alive = true;
    kvGet<BestMap>(BEST_KEY)
      .then((b) => {
        if (alive && b && typeof b === 'object') setBest(b);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const pool = useMemo(
    () => READING_TEXTS.filter((t) => (level === 'all' || t.level === level) && (topic === 'all' || t.topic === topic)),
    [level, topic],
  );

  const q = text?.questions[idx];
  const paragraphs = useMemo(() => (text ? text.text.split(/\n+/).map((p) => p.trim()).filter(Boolean) : []), [text]);

  function resetItem() {
    setSelected(null);
    setResult(null);
  }

  function startText(t: ReadingText) {
    setText(t);
    setIdx(0);
    resetItem();
    setCompleted(false);
    setPrevBest(best[t.id] ?? null);
    correctRef.current = 0;
    session.start();
    setPhase('drill');
    window.scrollTo({ top: 0 });
  }

  function startRandom() {
    if (!pool.length) return;
    // Prefer texts that haven't been read yet.
    const fresh = pool.filter((t) => !best[t.id]);
    const pick = shuffleArray(fresh.length ? fresh : pool)[0];
    startText(pick);
  }

  function submit(opt: number) {
    if (!text || !q || result !== null) return;
    const correct = opt === q.answerIndex;
    setSelected(opt);
    setResult(correct);
    if (correct) correctRef.current += 1;
    session.answer({
      itemId: q.id,
      category: text.topic,
      prompt: q.question,
      options: q.options,
      kind: 'mcq',
      answer: q.options[q.answerIndex],
      userAnswer: q.options[opt],
      context: `Otázka k textu „${text.title}“ (${text.level})`,
      correct,
    });
  }

  async function saveBest(t: ReadingText) {
    const total = t.questions.length;
    const correct = correctRef.current;
    const prev = best[t.id];
    if (prev && prev.correct / prev.total >= correct / total) return;
    const next = { ...best, [t.id]: { correct, total } };
    setBest(next);
    try {
      await kvSet(BEST_KEY, next);
    } catch {
      /* best-effort */
    }
  }

  async function finish(full: boolean) {
    await session.finish();
    if (full && text) {
      setCompleted(true);
      await saveBest(text);
    }
    setPhase('result');
    window.scrollTo({ top: 0 });
  }

  async function next() {
    if (!text) return;
    if (idx + 1 >= text.questions.length) {
      await finish(true);
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  function scrollTo(el: HTMLElement | null) {
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'drill');

  /* ─── Setup: pick a text ─────────────────────────────────────────── */
  if (phase === 'setup' || !text) {
    return (
      <DrillSetup
        title="Čtení s porozuměním"
        subtitle={`${READING_TEXTS.length} textů s otázkami. Vyber si text ze seznamu, nebo začni náhodným.`}
        icon="📖"
        poolSize={pool.length}
        poolNoun={["text", "texty", "textů"]}
        onStart={startRandom}
        startLabel="Náhodný text"
        footer={
          <section aria-labelledby="reading-list-title">
            <h2 id="reading-list-title" className="section-title">
              Texty <span className="text-muted">({pool.length})</span>
            </h2>
            {pool.length === 0 ? (
              <p className="card text-sm text-muted">Pro tuto kombinaci úrovně a tématu tu zatím žádný text není.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {pool.map((t) => {
                  const b = best[t.id];
                  return (
                    <li key={t.id} className="min-w-0">
                      <button type="button" className="card card-link flex h-full w-full items-center gap-3 !p-3 text-left" onClick={() => startText(t)}>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold leading-snug break-words text-fg" lang="en">{t.title}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                            <LevelBadge level={t.level} />
                            <span>{topicLabel(t.topic)}</span>
                            <span aria-hidden="true">·</span>
                            <span>
                              {t.questions.length} {plural(t.questions.length, 'otázka', 'otázky', 'otázek')}
                            </span>
                          </span>
                        </span>
                        {b ? (
                          <span
                            className={`badge shrink-0 ${b.correct === b.total ? '!bg-success-soft !text-success' : ''}`}
                            title="Tvůj nejlepší výsledek"
                          >
                            {b.correct === b.total ? '✓ ' : ''}
                            {b.correct}/{b.total}
                          </span>
                        ) : (
                          <span className="shrink-0 text-muted" aria-hidden="true">›</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        }
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>
              {l === 'all' ? 'Vše' : l}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Téma">
          <Chip active={topic === 'all'} onClick={() => setTopic('all')}>Všechna témata</Chip>
          {TOPICS.map((t) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(t)}>
              {topicLabel(t)}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ─── Result ─────────────────────────────────────────────────────── */
  if (phase === 'result') {
    const total = text.questions.length;
    const correct = session.correct;
    const newRecord = completed && (!prevBest || correct / total > prevBest.correct / prevBest.total);
    const bestNow = best[text.id];
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={() => {
          resetItem();
          setPhase('setup');
        }}
        restartLabel="Vybrat další text"
      >
        <div className="card mt-5 !p-4">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={text.level} />
            <span className="text-xs text-muted">{topicLabel(text.topic)}</span>
          </div>
          <h2 className="mt-1 font-black text-fg" lang="en">{text.title}</h2>
          {completed ? (
            <p className="mt-1 text-sm text-muted">
              {newRecord && prevBest
                ? `Nový osobní rekord! Předtím ${prevBest.correct}/${prevBest.total}.`
                : newRecord
                  ? 'Tvůj první výsledek u tohoto textu je uložený.'
                  : bestNow
                    ? `Tvůj nejlepší výsledek u tohoto textu: ${bestNow.correct}/${bestNow.total}.`
                    : null}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted">Text jsi nedočetl/a do konce, takže se nejlepší výsledek neměnil.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => startText(text)}>
              Zkusit tento text znovu
            </button>
            {pool.length > 1 && (
              <button type="button" className="btn-ghost" onClick={startRandom}>
                Náhodný další text
              </button>
            )}
          </div>
        </div>
      </ResultScreen>
    );
  }

  /* ─── Drill: text + questions ────────────────────────────────────── */
  if (!q) return null;
  const last = idx + 1 >= text.questions.length;

  return (
    <div className="page-container page-container--wide">
      <DrillTopBar
        current={idx}
        total={text.questions.length}
        correct={session.correct}
        onExit={() => void finish(false)}
        title="Čtení s porozuměním"
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:items-start">
        <article
          ref={textRef}
          className="card scroll-mt-[calc(var(--g92-appbar-total,4rem)+1rem)] !p-5 sm:!p-6 lg:sticky lg:top-[calc(var(--g92-appbar-total,4rem)+1rem)] lg:max-h-[calc(100dvh-var(--g92-appbar-total,4rem)-2rem)] lg:overflow-y-auto"
          aria-labelledby="reading-title"
        >
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <LevelBadge level={text.level} />
            <span className="badge">{topicLabel(text.topic)}</span>
            <span className="text-xs text-muted">{wordCount(text.text)} slov</span>
          </div>
          <h1 id="reading-title" className="text-xl font-black leading-tight text-fg sm:text-2xl" lang="en">
            {text.title}
          </h1>
          <div className="reading-text mt-3 break-words" lang="en">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </div>
          <button type="button" className="btn-soft mt-4 lg:hidden" onClick={() => scrollTo(questionsRef.current)}>
            Přejít k otázkám ({text.questions.length})
            <span aria-hidden="true">↓</span>
          </button>
        </article>

        <section ref={questionsRef} className="card scroll-mt-[calc(var(--g92-appbar-total,4rem)+1rem)] !p-5" aria-labelledby="reading-question">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="eyebrow">
              Otázka {idx + 1} z {text.questions.length}
            </span>
            {TYPE_LABEL[q.type] && <span className="badge !bg-warning-soft !text-warning">{TYPE_LABEL[q.type]}</span>}
          </div>
          <p id="reading-question" className="mb-4 text-lg leading-snug font-bold break-words text-fg" lang="en">
            {q.question}
          </p>

          <OptionList
            key={q.id}
            options={q.options}
            selected={selected}
            correctIndex={q.answerIndex}
            revealed={result !== null}
            onSelect={submit}
          />

          {result !== null && (
            <Feedback
              correct={result}
              answer={q.options[q.answerIndex]}
              explanation={
                q.type === 'tfns' && !result
                  ? '„Not stated“ vybírej jen tehdy, když text o dané věci vůbec nemluví. Když ji text popírá, je to „False“.'
                  : undefined
              }
            />
          )}
          {result !== null && <NextButton onClick={() => void next()} last={last} />}

          <div className="mt-4 lg:hidden">
            <button type="button" className="btn-ghost !px-2" onClick={() => scrollTo(textRef.current)}>
              <span aria-hidden="true">↑</span> Zpět k textu
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
