import { useEffect, useMemo, useRef, useState } from 'react';
import { ARTICLE_EXERCISES, ARTICLE_RULES } from '../data/articles';
import type { ArticleExercise } from '../data/articles';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { Kbd, PageHeader } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'rules' | 'drill' | 'result';
type Art = 'a' | 'an' | 'the' | '-';

const ARTS: Art[] = ['a', 'an', 'the', '-'];
const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
type Level = (typeof LEVELS)[number];
const RULE_KEYS = Object.keys(ARTICLE_RULES);
const ZERO_HINT = '„–“ = bez členu';

/** Display form of an article ("-" = zero article). */
const label = (a: Art) => (a === '-' ? '–' : a);
const spoken = (a: Art) => (a === '-' ? 'bez členu' : a);
const comboText = (c: Art[]) => c.map(label).join(' … ');
const ruleTitle = (rule: string) => ARTICLE_RULES[rule]?.titleCs ?? rule;
/** Sentence split at the gaps — the order of the "___" is what matters (gap.position is not used). */
const splitGaps = (ex: ArticleExercise) => ex.sentence.split(/_{3,}/);
const gapCount = (ex: ArticleExercise) => Math.min(ex.gaps.length, Math.max(1, splitGaps(ex).length - 1));

/**
 * Answer options for the mistakes queue (MCQ, so the item can be asked again as it was):
 * one gap → a / an / the / –; several gaps → the right combination, the learner's wrong one
 * and combinations that differ in one gap.
 */
function mistakeOptions(answer: Art[], user: Art[]): string[] {
  if (answer.length === 1) return ARTS.map(label);
  const correct = comboText(answer);
  const out = [correct];
  const mine = comboText(user);
  if (mine !== correct) out.push(mine);
  const variants = shuffleArray(
    answer.flatMap((_, i) => ARTS.filter((a) => a !== answer[i]).map((a) => comboText(answer.map((x, j) => (j === i ? a : x))))),
  );
  for (const v of variants) {
    if (out.length >= 4) break;
    if (!out.includes(v)) out.push(v);
  }
  return shuffleArray(out);
}

export default function ArticlesDrill() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<Level>('all');
  const [rules, setRules] = useState<string[]>([]);
  const [count, setCount] = useState(20);
  const [items, setItems] = useState<ArticleExercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [picks, setPicks] = useState<(Art | null)[]>([]);
  const [active, setActive] = useState(0);
  const [result, setResult] = useState<boolean | null>(null);
  const leaving = useRef(false);
  const checkRef = useRef<HTMLButtonElement>(null);
  const session = useDrillSession('articles', { tags: rules.length ? rules : ['all'] });

  const pool = useMemo(
    () => ARTICLE_EXERCISES.filter((e) => (!rules.length || rules.includes(e.rule)) && (level === 'all' || e.level === level)),
    [rules, level],
  );

  const ex = items[idx];
  const parts = ex ? splitGaps(ex) : [];
  const nGaps = ex ? gapCount(ex) : 0;
  const answers: Art[] = ex ? ex.gaps.slice(0, nGaps).map((g) => g.answer) : [];
  const allFilled = nGaps > 0 && picks.length === nGaps && picks.every((p) => p !== null);

  function resetItem(n: number) {
    setPicks(Array.from({ length: n }, () => null));
    setActive(0);
    setResult(null);
  }

  function start() {
    if (!pool.length) return;
    const picked = shuffleArray(pool).slice(0, count);
    setItems(picked);
    setIdx(0);
    resetItem(picked[0] ? gapCount(picked[0]) : 0);
    leaving.current = false;
    session.start();
    setPhase('drill');
  }

  function submit(final: (Art | null)[]) {
    if (!ex || result !== null) return;
    if (final.length !== nGaps || final.some((p) => p === null)) return;
    const user = final as Art[];
    const correct = user.every((p, i) => p === answers[i]);
    setPicks(user);
    setResult(correct);
    session.answer({
      itemId: ex.id,
      category: ex.rule,
      prompt: ex.sentence,
      context: `Doplň členy (${ZERO_HINT}).`,
      options: mistakeOptions(answers, user),
      kind: 'mcq',
      answer: comboText(answers),
      userAnswer: comboText(user),
      explanation: ex.explanationCs,
      correct,
    });
  }

  /** Fill gap `i` and move on to the next empty gap. */
  function pick(i: number, a: Art) {
    if (result !== null || i < 0 || i >= nGaps) return;
    const nextPicks = picks.slice(0, nGaps);
    nextPicks[i] = a;
    setPicks(nextPicks);
    const after = Array.from({ length: nGaps }, (_, k) => (i + 1 + k) % nGaps).find((k) => nextPicks[k] === null);
    if (after !== undefined) setActive(after);
  }

  // When every gap is filled, focus "Ověřit" so that Enter checks the answer.
  useEffect(() => {
    if (phase === 'drill' && nGaps > 1 && allFilled && result === null) checkRef.current?.focus({ preventScroll: true });
  }, [phase, nGaps, allFilled, result]);

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
      resetItem(gapCount(items[idx + 1]));
    }
  }

  const drillKeys: Record<string, () => void> = {};
  if (phase === 'drill' && ex) {
    if (result !== null) {
      drillKeys.Enter = next;
      drillKeys[' '] = next;
    } else if (nGaps > 1) {
      ARTS.forEach((a, i) => (drillKeys[String(i + 1)] = () => pick(active, a)));
      drillKeys.ArrowLeft = () => setActive((k) => Math.max(0, k - 1));
      drillKeys.ArrowRight = () => setActive((k) => Math.min(nGaps - 1, k + 1));
      drillKeys.Enter = () => submit(picks);
    }
  }
  useKeyboard(drillKeys, phase === 'drill');

  /* ─── Setup ─── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Členy"
        subtitle="a, an, the, nebo nic? Čeština členy nemá, proto jsou pro nás největší pastí."
        icon="📐"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        footer={
          <button type="button" className="card card-link flex w-full items-center gap-3 !p-3 text-left" onClick={() => setPhase('rules')}>
            <span className="tile-icon" aria-hidden="true">📖</span>
            <span className="min-w-0 flex-1">
              <span className="block font-bold text-fg">Přehled pravidel</span>
              <span className="block text-sm text-muted">Kdy použít a / an, kdy the a kdy žádný člen</span>
            </span>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-muted" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </button>
        }
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Pravidla${rules.length ? ` (${rules.length})` : ' (vše)'}`}>
          {RULE_KEYS.map((k) => (
            <Chip key={k} active={rules.includes(k)} onClick={() => setRules((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>
              <span className="whitespace-normal text-left">{ruleTitle(k)}</span>
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ─── Rules overview ─── */
  if (phase === 'rules') {
    return (
      <div className="page-container page-container--wide">
        <button
          type="button"
          className="-ml-2 mb-2 inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-bold text-muted hover:bg-surface-2 hover:text-fg"
          onClick={() => setPhase('setup')}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Členy
        </button>
        <PageHeader title="Přehled pravidel" subtitle="Kdy použít a, an, the a kdy žádný člen." icon="📖" back={null} />
        <div className="grid items-start gap-4 md:grid-cols-2">
          {RULE_KEYS.map((key) => {
            const rule = ARTICLE_RULES[key];
            const n = ARTICLE_EXERCISES.filter((e) => e.rule === key).length;
            return (
              <section key={key} className="card !p-5">
                <h2 className="section-title !mb-2">{rule.titleCs}</h2>
                <p className="mb-3 text-sm leading-relaxed text-muted">{rule.explanationCs}</p>
                <ul className="space-y-1.5 rounded-xl bg-surface-2 p-3">
                  {rule.examples.map((example, i) => (
                    <li key={i} className="text-sm leading-relaxed break-words text-fg" lang="en">{example}</li>
                  ))}
                </ul>
                {n > 0 && (
                  <button
                    type="button"
                    className="btn-soft mt-3"
                    onClick={() => {
                      setRules([key]);
                      setPhase('setup');
                    }}
                  >
                    Procvičit toto pravidlo ({n})
                  </button>
                )}
              </section>
            );
          })}
        </div>
        <div className="mt-6 text-center">
          <button type="button" className="btn-primary btn-lg" onClick={() => setPhase('setup')}>Jít procvičovat</button>
        </div>
      </div>
    );
  }

  /* ─── Result ─── */
  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Nové kolo"
      >
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr</button>
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('rules')}>Přehled pravidel</button>
        </div>
      </ResultScreen>
    );
  }

  /* ─── Drill ─── */
  if (!ex) return null;
  const last = idx + 1 >= items.length;
  const revealed = result !== null;
  const wrongGaps = revealed ? answers.map((a, i) => ({ i, a, mine: picks[i] })).filter((g) => g.mine !== g.a) : [];

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={items.length} correct={session.correct} onExit={() => void showResult()} title="Členy" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{ruleTitle(ex.rule)}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">
          {nGaps > 1 ? `Doplň členy do všech ${nGaps} mezer` : 'Doplň člen'} ({ZERO_HINT}):
        </p>
        <p className="mb-5 text-xl leading-loose font-bold break-words text-fg" lang="en">
          {parts.map((part, i) => (
            <span key={i}>
              {part}
              {i < nGaps && (
                <GapSlot
                  n={i + 1}
                  numbered={nGaps > 1}
                  pick={picks[i] ?? null}
                  answer={answers[i]}
                  revealed={revealed}
                  active={!revealed && nGaps > 1 && active === i}
                />
              )}
            </span>
          ))}
        </p>

        {nGaps === 1 ? (
          <OptionList
            options={ARTS.map(label)}
            selected={picks[0] ? ARTS.indexOf(picks[0]) : null}
            correctIndex={ARTS.indexOf(answers[0])}
            revealed={revealed}
            onSelect={(i) => submit([ARTS[i]])}
            columns={2}
          />
        ) : (
          <>
            <div className="space-y-2">
              {answers.map((answer, i) => (
                <GapRow
                  key={i}
                  n={i + 1}
                  pick={picks[i] ?? null}
                  answer={answer}
                  revealed={revealed}
                  active={!revealed && active === i}
                  onPick={(a) => pick(i, a)}
                  onFocus={() => setActive(i)}
                />
              ))}
            </div>
            {!revealed && (
              <>
                <button ref={checkRef} type="button" className="btn-primary btn-lg mt-4 w-full sm:w-auto" disabled={!allFilled} onClick={() => submit(picks)}>
                  Ověřit
                </button>
                <p className="mt-3 hidden text-xs text-muted sm:block">
                  Klávesy: <Kbd>1</Kbd>–<Kbd>4</Kbd> vyplní označenou mezeru (a / an / the / –), <Kbd>←</Kbd> <Kbd>→</Kbd> přepínají mezery,{' '}
                  <Kbd>Enter</Kbd> ověří.
                </p>
              </>
            )}
          </>
        )}

        {revealed && (
          <Feedback correct={result} title={result ? undefined : nGaps > 1 ? 'Některé mezery nejsou správně' : undefined}>
            {wrongGaps.length > 0 && (
              <ul className="mt-1 space-y-0.5 text-sm text-fg">
                {wrongGaps.map((g) => (
                  <li key={g.i}>
                    {nGaps > 1 && <>Mezera {g.i + 1}: </>}
                    správně <strong lang="en">{label(g.a)}</strong>
                    {g.a === '-' && <span className="text-muted"> (bez členu)</span>}
                    {g.mine && (
                      <span className="text-muted">
                        {' '}(tvoje odpověď: <span lang="en">{label(g.mine)}</span>)
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-1.5 text-sm leading-relaxed text-muted">{ex.explanationCs}</div>
            <div className="mt-1 text-xs text-muted">Pravidlo: {ruleTitle(ex.rule)}</div>
          </Feedback>
        )}
        {revealed && <NextButton onClick={next} last={last} />}
      </div>
    </div>
  );
}

/* ─── Gap in the sentence (display only; the choices are the rows below / the option list) ─── */

function GapSlot({ n, numbered, pick, answer, revealed, active }: {
  n: number;
  numbered: boolean;
  pick: Art | null;
  answer: Art;
  revealed: boolean;
  active: boolean;
}) {
  if (revealed) {
    const ok = pick === answer;
    return (
      <span className="mx-1 inline-flex flex-wrap items-baseline gap-1">
        {!ok && pick && <span className="text-danger line-through decoration-2">{label(pick)}</span>}
        <span className="rounded-md bg-success-soft px-1.5 text-success">{label(answer)}</span>
      </span>
    );
  }
  return (
    <span
      className={`mx-1 inline-flex min-w-[3.25rem] items-baseline justify-center gap-1 rounded-md border-b-2 px-1.5 ${
        active ? 'border-accent bg-accent-soft text-accent-text' : 'border-border-strong text-accent-text'
      }`}
    >
      {numbered && <sup className="text-xs font-black text-muted">{n}</sup>}
      {pick ? label(pick) : <span aria-hidden="true">…</span>}
      {!pick && <span className="sr-only">(mezera {n})</span>}
    </span>
  );
}

/* ─── Chips for one gap (a / an / the / –) ─── */

function GapRow({ n, pick, answer, revealed, active, onPick, onFocus }: {
  n: number;
  pick: Art | null;
  answer: Art;
  revealed: boolean;
  active: boolean;
  onPick: (a: Art) => void;
  onFocus: () => void;
}) {
  return (
    <div
      className={`grid grid-cols-[auto_repeat(4,minmax(0,1fr))] items-center gap-1.5 rounded-xl border p-1.5 sm:gap-2 sm:p-2 ${active ? 'border-accent bg-accent-softer' : 'border-transparent'}`}
      role="group"
      aria-label={`Mezera ${n}`}
      onFocus={onFocus}
    >
      <span className={`exam-task-no ${revealed ? (pick === answer ? 'is-ok' : 'is-bad') : ''}`} aria-hidden="true">{n}</span>
      {ARTS.map((a) => {
        let tone = '';
        if (revealed) {
          if (a === answer) tone = '!border-success !bg-success-soft !text-success font-bold';
          else if (a === pick) tone = '!border-danger !bg-danger-soft !text-danger line-through';
          else tone = 'opacity-50';
        }
        return (
          <button
            key={a}
            type="button"
            className={`g92-chip w-full justify-center !px-2 !text-base ${tone}`}
            aria-pressed={pick === a}
            aria-label={`Mezera ${n}: ${spoken(a)}`}
            disabled={revealed}
            onClick={() => onPick(a)}
          >
            {label(a)}
          </button>
        );
      })}
    </div>
  );
}
