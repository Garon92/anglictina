import { useRef, useState } from 'react';
import { VOCABULARY } from '../data/vocabulary';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { IDIOMS } from '../data/idioms';
import { CONDITIONAL_EXERCISES } from '../data/conditionals';
import { buildOptions, shuffleArray, uniqueBy } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import {
  useDrillSession, DrillSetup, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';
import { ProgressBar } from '../components/ui';

type Phase = 'setup' | 'drill' | 'result';
type QModule = 'vocab' | 'vocab_rev' | 'grammar' | 'irregular' | 'idioms' | 'conditionals';

interface QuizQ {
  id: string;
  module: QModule;
  /** Short Czech instruction shown above the prompt. */
  instruction?: string;
  /** The word / sentence being asked about. */
  prompt: string;
  promptLang: 'cs' | 'en';
  /** Full question text (stored with mistakes). */
  question: string;
  optionsLang: 'cs' | 'en';
  options: string[];
  correctIndex: number;
  explanation?: string;
}

const MODULE_LABELS: Record<QModule, string> = {
  vocab: 'Slovíčka (EN → CZ)',
  vocab_rev: 'Slovíčka (CZ → EN)',
  grammar: 'Gramatika',
  irregular: 'Nepravidelná slovesa',
  idioms: 'Idiomy',
  conditionals: 'Podmínkové věty',
};

const MODULE_BADGE: Record<QModule, string> = {
  vocab: '!bg-info-soft !text-info',
  vocab_rev: '!bg-info-soft !text-info',
  grammar: '!bg-accent-soft !text-accent-text',
  irregular: '!bg-warning-soft !text-warning',
  idioms: '!bg-success-soft !text-success',
  conditionals: '!bg-danger-soft !text-danger',
};

/** Share of each question type in a round (the rest is padded with vocabulary). */
const MIX: [QModule, number][] = [
  ['vocab', 0.25],
  ['grammar', 0.2],
  ['irregular', 0.15],
  ['idioms', 0.15],
  ['conditionals', 0.15],
  ['vocab_rev', 0.1],
];

const norm = (s: string) => s.trim().toLowerCase();

/** A multiple-choice exercise from the data with unique options that contain the answer. */
function mcqFromData(e: { options?: string[]; answer: string }): { options: string[]; correctIndex: number } | null {
  if (!e.options) return null;
  const options = uniqueBy(e.options, norm);
  const correctIndex = options.indexOf(e.answer);
  if (options.length < 3 || correctIndex < 0) return null;
  return { options, correctIndex };
}

function generateMixedQuiz(count: number): QuizQ[] {
  const out: QuizQ[] = [];
  const n = (m: QModule) => Math.ceil(count * (MIX.find(([k]) => k === m)?.[1] ?? 0));

  // Vocabulary: EN→CZ and CZ→EN use separate words, so one question never gives away another.
  const vocab = uniqueBy(shuffleArray(VOCABULARY.filter((w) => w.cs && w.en && w.example)), (w) => norm(w.en));
  const allCs = VOCABULARY.map((w) => w.cs);
  const allEn = VOCABULARY.map((w) => w.en);
  let vi = 0;
  const takeWord = () => vocab[vi++];
  const pushEnCz = (w: (typeof vocab)[number]) => {
    // Distractors must not be other meanings of the same English word.
    const same = new Set(VOCABULARY.filter((v) => norm(v.en) === norm(w.en)).map((v) => norm(v.cs)));
    const { options, correctIndex } = buildOptions(w.cs, allCs.filter((c) => !same.has(norm(c))));
    out.push({
      id: `vocab:${w.id}`,
      module: 'vocab',
      instruction: 'Co znamená:',
      prompt: w.en,
      promptLang: 'en',
      question: `Co znamená „${w.en}“?`,
      optionsLang: 'cs',
      options,
      correctIndex,
    });
  };

  for (let i = 0; i < n('vocab'); i++) {
    const w = takeWord();
    if (w) pushEnCz(w);
  }
  for (let i = 0; i < n('vocab_rev'); i++) {
    const w = takeWord();
    if (!w) break;
    const same = new Set(VOCABULARY.filter((v) => norm(v.cs) === norm(w.cs)).map((v) => norm(v.en)));
    const { options, correctIndex } = buildOptions(w.en, allEn.filter((e) => !same.has(norm(e))));
    out.push({
      id: `vocab_rev:${w.id}`,
      module: 'vocab_rev',
      instruction: 'Jak se anglicky řekne:',
      prompt: w.cs,
      promptLang: 'cs',
      question: `Jak se anglicky řekne „${w.cs}“?`,
      optionsLang: 'en',
      options,
      correctIndex,
    });
  }

  const grammar = shuffleArray(GRAMMAR_EXERCISES.filter((e) => e.type === 'mcq'));
  let added = 0;
  for (const e of grammar) {
    if (added >= n('grammar')) break;
    const mcq = mcqFromData(e);
    if (!mcq) continue;
    out.push({ id: `grammar:${e.id}`, module: 'grammar', prompt: e.prompt, promptLang: 'en', question: e.prompt, optionsLang: 'en', ...mcq, explanation: e.explanationCs });
    added++;
  }

  const forms = IRREGULAR_VERBS.map((v) => `${v.past} / ${v.pastParticiple}`);
  for (const v of shuffleArray(IRREGULAR_VERBS).slice(0, n('irregular'))) {
    const correct = `${v.past} / ${v.pastParticiple}`;
    const { options, correctIndex } = buildOptions(correct, forms);
    out.push({
      id: `irregular:${v.id}`,
      module: 'irregular',
      instruction: 'Tvary slovesa (past / past participle):',
      prompt: v.base,
      promptLang: 'en',
      question: `Jaké jsou tvary slovesa „${v.base}“? (past / past participle)`,
      optionsLang: 'en',
      options,
      correctIndex,
      explanation: `${v.base} – ${correct} = ${v.meaningCs}`,
    });
  }

  const idiomMeanings = IDIOMS.map((i) => i.meaningCs);
  for (const idiom of shuffleArray(IDIOMS).slice(0, n('idioms'))) {
    const { options, correctIndex } = buildOptions(idiom.meaningCs, idiomMeanings);
    out.push({
      id: `idioms:${idiom.id}`,
      module: 'idioms',
      instruction: 'Co znamená idiom:',
      prompt: idiom.idiom,
      promptLang: 'en',
      question: `Co znamená „${idiom.idiom}“?`,
      optionsLang: 'cs',
      options,
      correctIndex,
      explanation: `${idiom.example} — ${idiom.exampleCs}`,
    });
  }

  added = 0;
  for (const e of shuffleArray(CONDITIONAL_EXERCISES.filter((x) => x.type === 'mcq'))) {
    if (added >= n('conditionals')) break;
    const mcq = mcqFromData(e);
    if (!mcq) continue;
    out.push({ id: `conditionals:${e.id}`, module: 'conditionals', prompt: e.prompt, promptLang: 'en', question: e.prompt, optionsLang: 'en', ...mcq, explanation: e.explanationCs });
    added++;
  }

  // Pad with further (still unused) words.
  while (out.length < count) {
    const w = takeWord();
    if (!w) break;
    pushEnCz(w);
  }

  return shuffleArray(out).slice(0, count);
}

export default function MixedQuiz() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [count, setCount] = useState(30);
  const [questions, setQuestions] = useState<QuizQ[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const [results, setResults] = useState<{ module: QModule; correct: boolean }[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const startedAt = useRef(0);
  const session = useDrillSession('mixed');

  const q = questions[idx];

  function start() {
    setQuestions(generateMixedQuiz(count));
    setIdx(0);
    setSelected(null);
    setResult(null);
    setResults([]);
    startedAt.current = Date.now();
    session.start();
    setPhase('drill');
  }

  function submit(opt: number) {
    if (!q || result !== null) return;
    const correct = opt === q.correctIndex;
    setSelected(opt);
    setResult(correct);
    setResults((r) => [...r, { module: q.module, correct }]);
    session.answer({
      itemId: q.id,
      category: q.module,
      prompt: q.question,
      options: q.options,
      kind: 'mcq',
      answer: q.options[q.correctIndex],
      userAnswer: q.options[opt],
      explanation: q.explanation,
      correct,
    });
  }

  async function finish() {
    setElapsed(Math.round((Date.now() - startedAt.current) / 1000));
    await session.finish();
    setPhase('result');
  }

  async function next() {
    if (idx + 1 >= questions.length) await finish();
    else {
      setIdx(idx + 1);
      setSelected(null);
      setResult(null);
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'drill');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Mix kvíz"
        subtitle="Náhodné otázky ze slovíček, gramatiky, nepravidelných sloves, idiomů i podmínkových vět. Jak moc toho umíš?"
        icon="🎲"
        onStart={start}
        count={count}
        onCountChange={setCount}
        countOptions={[15, 30, 50]}
      >
        <FilterSummary />
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    const byModule = new Map<QModule, { total: number; correct: number }>();
    for (const r of results) {
      const s = byModule.get(r.module) ?? { total: 0, correct: 0 };
      s.total += 1;
      if (r.correct) s.correct += 1;
      byModule.set(r.module, s);
    }
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    return (
      <ResultScreen correct={session.correct} total={session.total} mistakes={session.mistakes} onRestart={start} restartLabel="Nový kvíz">
        {results.length > 0 && (
          <section className="card mt-5 !p-5" aria-labelledby="mix-by-module">
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h2 id="mix-by-module" className="section-title !mb-0">
                Podle oblastí
              </h2>
              <span className="text-sm text-muted">
                Čas: {mins > 0 ? `${mins} min ` : ''}
                {secs} s
              </span>
            </div>
            <ul className="space-y-3">
              {MIX.map(([m]) => m)
                .filter((m) => byModule.has(m))
                .map((m) => {
                  const s = byModule.get(m)!;
                  const ratio = s.correct / s.total;
                  return (
                    <li key={m}>
                      <div className="mb-1 flex items-center justify-between gap-2 text-sm">
                        <span className="font-bold text-fg">{MODULE_LABELS[m]}</span>
                        <span className="tabular-nums text-muted">
                          {s.correct}/{s.total}
                        </span>
                      </div>
                      <ProgressBar
                        value={s.correct}
                        max={s.total}
                        tone={ratio >= 0.8 ? 'success' : ratio >= 0.5 ? 'warning' : 'danger'}
                        label={`${MODULE_LABELS[m]}: ${s.correct} z ${s.total}`}
                      />
                    </li>
                  );
                })}
            </ul>
          </section>
        )}
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost" onClick={() => setPhase('setup')}>
            Změnit počet otázek
          </button>
        </div>
      </ResultScreen>
    );
  }

  if (!q) return null;
  const last = idx + 1 >= questions.length;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={questions.length} correct={session.correct} onExit={() => void finish()} title="Mix kvíz" />
      <div className="card !p-5">
        <div className="mb-3">
          <span className={`badge ${MODULE_BADGE[q.module]}`}>{MODULE_LABELS[q.module]}</span>
        </div>
        {q.instruction && <p className="mb-1 text-sm font-bold text-muted">{q.instruction}</p>}
        <p className="mb-4 text-xl leading-relaxed font-bold break-words text-fg" lang={q.promptLang}>
          {q.prompt}
        </p>
        <OptionList
          key={q.id}
          options={q.options}
          selected={selected}
          correctIndex={q.correctIndex}
          revealed={result !== null}
          onSelect={submit}
          lang={q.optionsLang}
        />
        {result !== null && <Feedback correct={result} answer={q.options[q.correctIndex]} explanation={q.explanation} />}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}

function FilterSummary() {
  return (
    <div>
      <p className="eyebrow mb-2">Co tě čeká</p>
      <ul className="flex flex-wrap gap-2">
        {MIX.map(([m, share]) => (
          <li key={m} className={`badge ${MODULE_BADGE[m]}`}>
            {MODULE_LABELS[m]} · {Math.round(share * 100)} %
          </li>
        ))}
      </ul>
    </div>
  );
}
