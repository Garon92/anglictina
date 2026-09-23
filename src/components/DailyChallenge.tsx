import { useEffect, useMemo, useState } from 'react';
import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { buildOptions, seededRandom, shuffleSeeded } from '../utils';
import { dayKey } from '../lib/dates';
import { kvGet, kvSet } from '../db';
import { OptionList, Feedback, useDrillSession } from './drill';
import { Stars, starsFor } from './ui';

interface ChallengeQuestion {
  id: string;
  kind: 'vocab' | 'grammar';
  prompt: string;
  hint?: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

/** Five questions that are the same for the whole day. */
export function generateDailyQuestions(day = dayKey()): ChallengeQuestion[] {
  const rand = seededRandom(`daily:${day}`);
  const rich = VOCABULARY.filter((w) => w.example);
  const words = shuffleSeeded(rich, rand).slice(0, 3);
  const pool = rich.map((w) => w.cs);
  const qs: ChallengeQuestion[] = words.map((w) => {
    const { options, correctIndex } = buildOptions(w.cs, pool, 3, rand);
    return { id: w.id, kind: 'vocab', prompt: `Co znamená „${w.en}“?`, hint: w.example, options, correctIndex };
  });
  const grammar = shuffleSeeded(
    GRAMMAR_EXERCISES.filter((e) => e.type === 'mcq' && e.options && e.options.includes(e.answer)),
    rand,
  ).slice(0, 2);
  for (const g of grammar) {
    qs.push({
      id: g.id,
      kind: 'grammar',
      prompt: g.prompt,
      options: g.options!,
      correctIndex: g.options!.indexOf(g.answer),
      explanation: g.explanationCs,
    });
  }
  return qs;
}

interface DailyResult {
  correct: number;
  total: number;
}

export default function DailyChallenge({ onDone }: { onDone?: () => void }) {
  const day = dayKey();
  const questions = useMemo(() => generateDailyQuestions(day), [day]);
  const [result, setResult] = useState<DailyResult | null | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const session = useDrillSession('daily', { guard: false });

  useEffect(() => {
    kvGet<DailyResult>(`daily:${day}`).then((r) => setResult(r ?? null)).catch(() => setResult(null));
  }, [day]);

  if (result === undefined) return null;

  const q = questions[idx];
  const revealed = selected !== null;

  function choose(i: number) {
    if (selected !== null) return;
    setSelected(i);
    session.answer({
      itemId: q.id,
      prompt: q.prompt,
      options: q.options,
      answer: q.options[q.correctIndex],
      userAnswer: q.options[i],
      correct: i === q.correctIndex,
      explanation: q.explanation,
      category: q.kind,
    });
  }

  async function next() {
    if (idx + 1 < questions.length) {
      setIdx(idx + 1);
      setSelected(null);
      return;
    }
    await session.finish();
    const r = { correct: session.correct, total: session.total };
    await kvSet(`daily:${day}`, r);
    setResult(r);
    onDone?.();
  }

  if (result) {
    return (
      <div className="flex items-center gap-3">
        <span className="tile-icon" aria-hidden="true">☀️</span>
        <div className="min-w-0 flex-1">
          <div className="font-bold text-fg">Denní výzva splněna</div>
          <div className="text-xs text-muted">{result.correct} z {result.total} správně · zítra přibudou nové otázky</div>
        </div>
        <Stars count={starsFor(result.correct / result.total)} />
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" className="flex w-full items-center gap-3 text-left" onClick={() => { session.start(); setOpen(true); }}>
        <span className="tile-icon" aria-hidden="true">☀️</span>
        <span className="min-w-0 flex-1">
          <span className="block font-bold text-fg">Denní výzva</span>
          <span className="block text-xs text-muted">5 rychlých otázek — každý den jiné</span>
        </span>
        <span className="btn-soft btn-sm hidden sm:inline-flex">Začít</span>
        <svg className="shrink-0 text-subtle sm:hidden" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    );
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-bold text-fg">☀️ Denní výzva</span>
        <span className="text-sm font-bold tabular-nums text-muted">{idx + 1} / {questions.length}</span>
      </div>
      <p className="mb-1 font-bold text-fg" lang={q.kind === 'grammar' ? 'en' : undefined}>{q.prompt}</p>
      {q.hint && <p className="mb-3 text-sm italic text-muted" lang="en">„{q.hint}“</p>}
      <OptionList
        options={q.options}
        selected={selected}
        correctIndex={q.correctIndex}
        revealed={revealed}
        onSelect={choose}
        lang={q.kind === 'grammar' ? 'en' : 'cs'}
      />
      {revealed && (
        <>
          <Feedback correct={selected === q.correctIndex} answer={q.options[q.correctIndex]} explanation={q.explanation} />
          <button type="button" className="btn-primary mt-3 w-full" onClick={next} autoFocus>
            {idx + 1 < questions.length ? 'Další' : 'Dokončit výzvu'}
          </button>
        </>
      )}
    </div>
  );
}
