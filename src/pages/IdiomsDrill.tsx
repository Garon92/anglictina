import { useEffect, useMemo, useRef, useState } from 'react';
import { IDIOMS, COLLOCATIONS, IDIOM_CATEGORIES } from '../data/idioms';
import type { Idiom, Collocation } from '../data/idioms';
import { shuffleArray, buildOptions, uniqueBy } from '../utils';
import { speak, stopSpeaking } from '../tts';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';
import { Segmented, SpeakButton } from '../components/ui';

type Phase = 'setup' | 'quiz' | 'result';
type Content = 'mix' | 'idioms' | 'collocations';
type BrowseTab = 'idioms' | 'collocations';

const CATEGORY_KEYS = Object.keys(IDIOM_CATEGORIES);
const MAIN_VERBS = ['make', 'do', 'have', 'take', 'get', 'pay'];
const VERB_FILTERS = ['all', ...MAIN_VERBS, 'other'] as const;
type VerbFilter = (typeof VERB_FILTERS)[number];
const CONTENTS: { id: Content; label: string }[] = [
  { id: 'mix', label: 'Idiomy i kolokace' },
  { id: 'idioms', label: 'Jen idiomy' },
  { id: 'collocations', label: 'Jen kolokace' },
];

/** Every verb that appears in the collocation data (correct or typical wrong one). */
const ALL_VERBS = uniqueBy(COLLOCATIONS.flatMap((c) => [c.verb, c.wrongVerb]), (v) => v);

/**
 * Verbs that would also make a valid English phrase with the collocate (often with another
 * meaning) — never offered as distractors so that the correct answer stays unambiguous.
 */
const ALSO_VALID: Record<string, string[]> = {
  'make a decision': ['take'],
  'make money': ['have', 'get'],
  'make friends': ['have'],
  'make a complaint': ['have'],
  'make arrangements': ['have'],
  'do homework': ['have', 'get'],
  'do damage': ['take'],
  'take a risk': ['run'],
  'take responsibility': ['have'],
  'take a deep breath': ['have', 'catch'],
  'pay a visit': ['make'],
  'catch a cold': ['have', 'get'],
  'keep a promise': ['make'],
  'come to a conclusion': ['get'],
  'run a business': ['have'],
};

/** Idioms with a close meaning — never used as distractors for each other. */
const SIMILAR_IDIOMS: string[][] = [
  ['a piece of cake', "it's not rocket science"],
  ['see eye to eye', 'be on the same page'],
  ['hit the books', 'burn the midnight oil', 'work your fingers to the bone'],
  ['get along with', 'hit it off', 'have a lot in common'],
  ['cost an arm and a leg', 'a rip-off'],
  ['give it your best shot', 'go the extra mile'],
  ['keep a stiff upper lip', 'pull yourself together', 'keep your chin up'],
  ['save for a rainy day', 'tighten your belt', "money doesn't grow on trees"],
  ['make ends meet', 'live from hand to mouth'],
  ['butterflies in your stomach', 'get cold feet', 'be scared stiff'],
  ['speak your mind', 'get something off your chest'],
];

function similarTo(idiom: string): string[] {
  return SIMILAR_IDIOMS.find((g) => g.includes(idiom)) ?? [];
}

function matchesVerb(c: Collocation, verb: VerbFilter): boolean {
  if (verb === 'all') return true;
  if (verb === 'other') return !MAIN_VERBS.includes(c.verb);
  return c.verb === verb;
}

interface Question {
  id: string;
  type: 'idiom' | 'collocation';
  idiom?: Idiom;
  collocation?: Collocation;
  options: string[];
  correctIndex: number;
}

function idiomQuestion(idiom: Idiom): Question {
  const similar = similarTo(idiom.idiom);
  const pool = IDIOMS.filter((i) => i.id !== idiom.id && !similar.includes(i.idiom)).map((i) => i.meaningCs);
  const { options, correctIndex } = buildOptions(idiom.meaningCs, pool, 3);
  return { id: idiom.id, type: 'idiom', idiom, options, correctIndex };
}

function collocationQuestion(col: Collocation): Question {
  const banned = new Set([col.verb, ...(ALSO_VALID[col.full] ?? [])]);
  const others = shuffleArray(ALL_VERBS.filter((v) => !banned.has(v) && v !== col.wrongVerb));
  // The typical Czech mistake is always one of the options.
  const distractors = [...(banned.has(col.wrongVerb) ? [] : [col.wrongVerb]), ...others].slice(0, 3);
  const options = shuffleArray([col.verb, ...distractors]);
  return { id: col.id, type: 'collocation', collocation: col, options, correctIndex: options.indexOf(col.verb) };
}

export default function IdiomsDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [content, setContent] = useState<Content>('mix');
  const [cats, setCats] = useState<string[]>([]);
  const [verb, setVerb] = useState<VerbFilter>('all');
  const [count, setCount] = useState(20);
  const [browse, setBrowse] = useState<BrowseTab>('idioms');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const answeredRef = useRef(-1);

  const session = useDrillSession('idioms', { tags: [content, ...(cats.length ? cats : [])] });

  const idioms = useMemo(() => (cats.length ? IDIOMS.filter((i) => cats.includes(i.category)) : IDIOMS), [cats]);
  const collocations = useMemo(() => COLLOCATIONS.filter((c) => matchesVerb(c, verb)), [verb]);
  const poolSize = (content !== 'collocations' ? idioms.length : 0) + (content !== 'idioms' ? collocations.length : 0);

  useEffect(() => () => stopSpeaking(), []);

  const say = (t: string) => void speak(t, settings.ttsRate);

  function start() {
    const idiomQs = content === 'collocations' ? [] : shuffleArray(idioms).map(idiomQuestion);
    const colQs = content === 'idioms' ? [] : shuffleArray(collocations).map(collocationQuestion);
    let picked: Question[];
    if (content === 'mix') {
      // Half and half when possible, the rest from whichever pool is bigger.
      const half = Math.ceil(count / 2);
      const a = idiomQs.slice(0, Math.max(half, count - colQs.length));
      const b = colQs.slice(0, count - a.length);
      picked = shuffleArray([...a, ...b]);
    } else {
      picked = [...idiomQs, ...colQs].slice(0, count);
    }
    if (!picked.length) return;
    setQuestions(picked);
    setIdx(0);
    setSelected(null);
    answeredRef.current = -1;
    session.start();
    setPhase('quiz');
  }

  async function finishNow() {
    await session.finish();
    setPhase('result');
  }

  async function next() {
    if (idx + 1 >= questions.length) {
      await finishNow();
    } else {
      setIdx(idx + 1);
      setSelected(null);
      answeredRef.current = -1;
    }
  }

  const q = phase === 'quiz' ? questions[idx] : undefined;
  const result = q && selected !== null ? selected === q.correctIndex : null;

  function choose(i: number) {
    if (!q || selected !== null || answeredRef.current === idx) return;
    answeredRef.current = idx;
    setSelected(i);
    const isIdiom = q.type === 'idiom';
    session.answer({
      itemId: q.id,
      category: isIdiom ? q.idiom!.category : 'collocation',
      prompt: isIdiom ? `Co znamená „${q.idiom!.idiom}“?` : `_____ ${q.collocation!.collocate} (${q.collocation!.meaningCs})`,
      options: q.options,
      kind: 'mcq',
      answer: q.options[q.correctIndex],
      userAnswer: q.options[i],
      explanation: isIdiom
        ? `${q.idiom!.idiom} = ${q.idiom!.meaningCs}. ${q.idiom!.example}`
        : `${q.collocation!.full} = ${q.collocation!.meaningCs} (ne *${q.collocation!.wrongVerb} ${q.collocation!.collocate}). ${q.collocation!.example}`,
      correct: i === q.correctIndex,
    });
  }

  useKeyboard(phase === 'quiz' && selected !== null ? { Enter: () => void next() } : {}, phase === 'quiz');

  /* ── Setup + browsing ── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Idiomy a kolokace"
        subtitle="Ustálená spojení, díky kterým zníš přirozeně. Projdi si přehled a pak se otestuj."
        icon="💎"
        poolSize={poolSize}
        onStart={start}
        startLabel="Spustit kvíz"
        count={count}
        onCountChange={setCount}
        countOptions={[10, 20, 30]}
        footer={
          <BrowseSection
            tab={browse}
            onTab={setBrowse}
            idioms={idioms}
            collocations={collocations}
            onSpeak={say}
          />
        }
      >
        <FilterGroup label="Kvíz z">
          {CONTENTS.map((c) => (
            <Chip key={c.id} active={content === c.id} onClick={() => setContent(c.id)}>{c.label}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Témata idiomů${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORY_KEYS.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {IDIOM_CATEGORIES[c]}
            </Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Sloveso v kolokacích" hint="Výběr platí pro kvíz i pro přehled níže.">
          {VERB_FILTERS.map((v) => (
            <Chip key={v} active={verb === v} onClick={() => setVerb(v)}>
              {v === 'all' ? 'Vše' : v === 'other' ? 'ostatní' : <span lang="en">{v}</span>}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ── Result ── */
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

  /* ── Quiz ── */
  if (!q) return null;
  const last = idx + 1 >= questions.length;
  const col = q.collocation;
  const idiom = q.idiom;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={questions.length} correct={session.correct} onExit={() => void finishNow()} title="Idiomy a kolokace" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge !bg-accent-soft !text-accent-text">{idiom ? 'Idiom' : 'Kolokace'}</span>
          {idiom && <span className="badge">{IDIOM_CATEGORIES[idiom.category] || idiom.category}</span>}
          <span className="badge">{(idiom ?? col)!.level}</span>
        </div>

        {idiom ? (
          <>
            <p className="mb-1 text-sm font-bold text-muted">Co znamená tento idiom?</p>
            <div className="mb-4 flex items-center gap-3">
              <p className="text-2xl font-black break-words text-fg" lang="en">{idiom.idiom}</p>
              <SpeakButton size="sm" onClick={() => say(idiom.idiom)} label={`Přehrát: ${idiom.idiom}`} />
            </div>
          </>
        ) : col ? (
          <>
            <p className="mb-1 text-sm font-bold text-muted">Doplň správné sloveso:</p>
            <p className="text-2xl font-black break-words text-fg" lang="en">
              <span className="text-accent-text">{result !== null ? col.verb : '_____'}</span> {col.collocate}
            </p>
            <p className="mb-4 mt-1 text-muted">= {col.meaningCs}</p>
          </>
        ) : null}

        <OptionList
          options={q.options}
          selected={selected}
          correctIndex={q.correctIndex}
          revealed={selected !== null}
          onSelect={choose}
          lang={idiom ? 'cs' : 'en'}
          columns={idiom ? 1 : 2}
        />

        {result !== null && (
          <Feedback
            correct={result}
            explanation={
              idiom ? (
                <>
                  <span className="block"><strong className="text-fg" lang="en">{idiom.idiom}</strong> = {idiom.meaningCs}</span>
                  <span className="block" lang="en">{idiom.meaningEn}</span>
                  <ExampleLine en={idiom.example} cs={idiom.exampleCs} onSpeak={say} />
                  {idiom.czechEquivalent && <span className="mt-1 block">Česky: {idiom.czechEquivalent}</span>}
                </>
              ) : col ? (
                <>
                  <span className="block"><strong className="text-fg" lang="en">{col.full}</strong> = {col.meaningCs}</span>
                  <span className="block text-danger">Pozor: ne <span className="line-through" lang="en">{col.wrongVerb} {col.collocate}</span></span>
                  <ExampleLine en={col.example} onSpeak={say} />
                </>
              ) : null
            }
          />
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}

/* ─── Page-local components ───────────────────────────────────────── */

function ExampleLine({ en, cs, onSpeak }: { en: string; cs?: string; onSpeak: (t: string) => void }) {
  return (
    <span className="mt-1 flex items-start gap-2">
      <span className="flex-1">
        <span className="block italic text-fg" lang="en">„{en}“</span>
        {cs && <span className="block">{cs}</span>}
      </span>
      <SpeakButton size="sm" onClick={() => onSpeak(en)} label="Přehrát příklad" />
    </span>
  );
}

function BrowseSection({
  tab,
  onTab,
  idioms,
  collocations,
  onSpeak,
}: {
  tab: BrowseTab;
  onTab: (t: BrowseTab) => void;
  idioms: Idiom[];
  collocations: Collocation[];
  onSpeak: (t: string) => void;
}) {
  const groups = useMemo(() => {
    const out = new Map<string, Collocation[]>();
    for (const c of collocations) out.set(c.verb, [...(out.get(c.verb) ?? []), c]);
    return [...out.entries()];
  }, [collocations]);

  return (
    <section aria-labelledby="idioms-browse">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 id="idioms-browse" className="section-title !mb-0">Přehled</h2>
        <Segmented<BrowseTab>
          label="Co zobrazit"
          value={tab}
          onChange={onTab}
          options={[
            { value: 'idioms', label: `Idiomy (${idioms.length})` },
            { value: 'collocations', label: `Kolokace (${collocations.length})` },
          ]}
        />
      </div>

      {tab === 'idioms' ? (
        idioms.length === 0 ? (
          <p className="card text-center text-sm text-muted">Pro tento výběr tu nic není.</p>
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {idioms.map((i) => (
              <li key={i.id} className="card !p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-black break-words text-fg" lang="en">{i.idiom}</h3>
                    <p className="text-fg">{i.meaningCs}</p>
                    <p className="text-xs text-muted" lang="en">{i.meaningEn}</p>
                  </div>
                  <SpeakButton size="sm" onClick={() => onSpeak(i.idiom)} label={`Přehrát: ${i.idiom}`} />
                </div>
                <p className="mt-2 text-sm text-fg italic" lang="en">„{i.example}“</p>
                <p className="text-sm text-muted">{i.exampleCs}</p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="badge">{IDIOM_CATEGORIES[i.category] || i.category}</span>
                  <span className="badge">{i.level}</span>
                  {i.czechEquivalent && <span className="badge !bg-info-soft !text-info">Česky: {i.czechEquivalent}</span>}
                </div>
              </li>
            ))}
          </ul>
        )
      ) : groups.length === 0 ? (
        <p className="card text-center text-sm text-muted">Pro tento výběr tu nic není.</p>
      ) : (
        <div className="space-y-5">
          {groups.map(([v, cols]) => (
            <div key={v}>
              <h3 className="eyebrow mb-2" lang="en">{v}</h3>
              <ul className="grid gap-2 sm:grid-cols-2">
                {cols.map((c) => (
                  <li key={c.id} className="card !p-3">
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold break-words text-fg" lang="en">
                          {c.verb} <span className="text-accent-text">{c.collocate}</span>
                        </p>
                        <p className="text-sm text-fg">{c.meaningCs}</p>
                      </div>
                      <span className="badge shrink-0">{c.level}</span>
                      <SpeakButton size="sm" onClick={() => onSpeak(c.full)} label={`Přehrát: ${c.full}`} />
                    </div>
                    <p className="mt-1 text-xs text-muted italic" lang="en">„{c.example}“</p>
                    <p className="mt-1 text-xs text-danger">
                      Pozor: ne <span className="line-through" lang="en">{c.wrongVerb} {c.collocate}</span>
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
