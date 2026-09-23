import { useEffect, useMemo, useRef, useState } from 'react';
import { PHRASAL_VERBS, PHRASE_CATEGORIES } from '../data/phrases';
import { speak, stopSpeaking } from '../tts';
import { shuffleArray, buildOptions, uniqueBy } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playFlip } from '../sounds';
import { useSettings } from '../App';
import type { PhrasalVerbEntry } from '../types';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';
import { SpeakButton } from '../components/ui';

type Phase = 'setup' | 'flashcard' | 'quiz' | 'result';
type Mode = 'flashcard' | 'quiz';
type Level = 'all' | 'A2' | 'B1';
type Direction = 'mix' | 'en-cs' | 'cs-en';

const LEVELS: Level[] = ['all', 'A2', 'B1'];
const CATEGORY_KEYS = Object.keys(PHRASE_CATEGORIES);
const DIRECTIONS: { id: Direction; label: string }[] = [
  { id: 'mix', label: 'Mix' },
  { id: 'en-cs', label: 'Angličtina → čeština' },
  { id: 'cs-en', label: 'Čeština → angličtina' },
];

interface Question {
  entry: PhrasalVerbEntry;
  /** true: English verb shown, pick the Czech meaning. */
  showEnglish: boolean;
  options: string[];
  correctIndex: number;
}

const norm = (s: string) => s.trim().toLowerCase();

/**
 * Four unique options. Distractors never come from an entry with the same verb
 * ("pick up" has two meanings — the other one would also be correct).
 */
function buildQuestion(entry: PhrasalVerbEntry, showEnglish: boolean): Question {
  const others = PHRASAL_VERBS.filter((p) => norm(p.verb) !== norm(entry.verb));
  const sameCat = others.filter((p) => p.category === entry.category);
  const field = (p: PhrasalVerbEntry) => (showEnglish ? p.meaningCs : p.verb);
  const candidates = uniqueBy(sameCat.map(field), norm).length >= 3 ? sameCat : others;
  const { options, correctIndex } = buildOptions(field(entry), candidates.map(field), 3);
  return { entry, showEnglish, options, correctIndex };
}

export default function PhrasalVerbsDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<Mode>('flashcard');
  const [level, setLevel] = useState<Level>('all');
  const [cats, setCats] = useState<string[]>([]);
  const [direction, setDirection] = useState<Direction>('mix');
  const [count, setCount] = useState(15);

  const [cards, setCards] = useState<PhrasalVerbEntry[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const answeredRef = useRef(-1);

  const session = useDrillSession('phrasal_verbs', { tags: cats.length ? cats : ['all'] });

  const pool = useMemo(
    () => PHRASAL_VERBS.filter((e) => (level === 'all' || e.level === level) && (!cats.length || cats.includes(e.category))),
    [level, cats],
  );

  useEffect(() => () => stopSpeaking(), []);

  const say = (t: string) => void speak(t, settings.ttsRate);

  function resetItem() {
    setRevealed(false);
    setSelected(null);
    answeredRef.current = -1;
  }

  function start() {
    const picked = shuffleArray(pool).slice(0, count);
    if (!picked.length) return;
    if (mode === 'quiz') {
      setQuestions(picked.map((e, i) => buildQuestion(e, direction === 'mix' ? i % 2 === 0 : direction === 'en-cs')));
    } else {
      setCards(picked);
    }
    setIdx(0);
    resetItem();
    session.start();
    setPhase(mode);
  }

  async function finishNow() {
    await session.finish();
    setPhase('result');
  }

  async function advance(total: number) {
    if (idx + 1 >= total) {
      await finishNow();
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  /* ── Flashcards ── */
  const card = phase === 'flashcard' ? cards[idx] : undefined;

  function reveal() {
    if (!card || revealed) return;
    setRevealed(true);
    playFlip();
    if (settings.ttsEnabled) say(card.verb);
  }

  function grade(known: boolean) {
    if (!card || !revealed || answeredRef.current === idx) return;
    answeredRef.current = idx;
    session.answer({
      itemId: card.id,
      category: card.category,
      prompt: `Co znamená „${card.verb}“?`,
      kind: 'reveal',
      answer: card.meaningCs,
      userAnswer: known ? undefined : '',
      explanation: `${card.example} — ${card.exampleCs}`,
      correct: known,
      silent: true,
    });
    void advance(cards.length);
  }

  /* ── Quiz ── */
  const q = phase === 'quiz' ? questions[idx] : undefined;
  const result = q && selected !== null ? selected === q.correctIndex : null;

  function choose(i: number) {
    if (!q || selected !== null || answeredRef.current === idx) return;
    answeredRef.current = idx;
    setSelected(i);
    session.answer({
      itemId: `${q.entry.id}:${q.showEnglish ? 'en' : 'cs'}`,
      category: q.entry.category,
      prompt: q.showEnglish ? `Co znamená „${q.entry.verb}“?` : `Které frázové sloveso znamená „${q.entry.meaningCs}“?`,
      options: q.options,
      kind: 'mcq',
      answer: q.options[q.correctIndex],
      userAnswer: q.options[i],
      explanation: `${q.entry.verb} = ${q.entry.meaningCs}. ${q.entry.example}`,
      correct: i === q.correctIndex,
    });
  }

  useKeyboard(
    phase === 'flashcard'
      ? revealed
        ? { '1': () => grade(false), '2': () => grade(true), ArrowLeft: () => grade(false), ArrowRight: () => grade(true) }
        : { ' ': reveal, Enter: reveal }
      : phase === 'quiz' && selected !== null
        ? { Enter: () => void advance(questions.length), ' ': () => void advance(questions.length) }
        : {},
    phase === 'flashcard' || phase === 'quiz',
  );

  /* ── Setup ── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Frázová slovesa"
        subtitle="get up, look after, give up… Kartičky na zapamatování nebo kvíz se čtyřmi možnostmi."
        icon="🧩"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        countOptions={[10, 15, 20]}
      >
        <FilterGroup label="Režim">
          <Chip active={mode === 'flashcard'} onClick={() => setMode('flashcard')}>Kartičky</Chip>
          <Chip active={mode === 'quiz'} onClick={() => setMode('quiz')}>Kvíz</Chip>
        </FilterGroup>
        {mode === 'quiz' && (
          <FilterGroup label="Směr">
            {DIRECTIONS.map((d) => (
              <Chip key={d.id} active={direction === d.id} onClick={() => setDirection(d.id)}>{d.label}</Chip>
            ))}
          </FilterGroup>
        )}
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Témata${cats.length ? ` (${cats.length})` : ' (vše)'}`}>
          {CATEGORY_KEYS.map((c) => (
            <Chip key={c} active={cats.includes(c)} onClick={() => setCats((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))}>
              {PHRASE_CATEGORIES[c]}
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
        title={mode === 'flashcard' && session.total > 0 ? 'Kartičky hotové!' : undefined}
      >
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit výběr</button>
        </div>
      </ResultScreen>
    );
  }

  /* ── Flashcard ── */
  if (phase === 'flashcard') {
    if (!card) return null;
    return (
      <div className="page-container">
        <DrillTopBar current={idx} total={cards.length} correct={session.correct} onExit={() => void finishNow()} title="Kartičky" />

        <div className="card flex min-h-[18rem] flex-col items-center justify-center !p-6 text-center">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="badge">{PHRASE_CATEGORIES[card.category] || card.category}</span>
            <span className="badge !bg-accent-soft !text-accent-text">{card.level}</span>
          </div>
          <div className="mt-4 flex items-center justify-center gap-3">
            <h2 className="text-4xl font-black break-words text-fg" lang="en">{card.verb}</h2>
            <SpeakButton onClick={() => say(card.verb)} label={`Přehrát: ${card.verb}`} />
          </div>

          {!revealed ? (
            <>
              <p className="mt-6 text-sm text-muted">Víš, co to znamená? Pak si kartičku otoč.</p>
              <button type="button" className="btn-primary btn-lg mt-4" onClick={reveal}>Ukázat význam</button>
              <p className="mt-2 hidden text-xs text-subtle sm:block">nebo mezerník</p>
            </>
          ) : (
            <div className="mt-4 w-full animate-fadeIn">
              <div className="text-2xl font-black text-accent-text">{card.meaningCs}</div>
              <div className="mx-auto mt-4 max-w-md rounded-2xl bg-surface-2 p-3 text-left">
                <div className="flex items-start gap-2">
                  <p className="flex-1 text-fg italic" lang="en">„{card.example}“</p>
                  <SpeakButton size="sm" onClick={() => say(card.example)} label="Přehrát příklad" />
                </div>
                <p className="mt-1 text-sm text-muted">{card.exampleCs}</p>
              </div>
            </div>
          )}
        </div>

        {revealed && <GradeButtons onGrade={grade} />}
      </div>
    );
  }

  /* ── Quiz ── */
  if (!q) return null;
  const last = idx + 1 >= questions.length;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={questions.length} correct={session.correct} onExit={() => void finishNow()} title="Frázová slovesa" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{PHRASE_CATEGORIES[q.entry.category] || q.entry.category}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{q.entry.level}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">
          {q.showEnglish ? 'Vyber správný český význam:' : 'Vyber správné frázové sloveso:'}
        </p>
        <div className="mb-4 flex items-center gap-3">
          {q.showEnglish ? (
            <>
              <p className="text-2xl font-black break-words text-fg" lang="en">{q.entry.verb}</p>
              <SpeakButton size="sm" onClick={() => say(q.entry.verb)} label={`Přehrát: ${q.entry.verb}`} />
            </>
          ) : (
            <p className="text-2xl font-black break-words text-fg" lang="cs">{q.entry.meaningCs}</p>
          )}
        </div>

        <OptionList
          options={q.options}
          selected={selected}
          correctIndex={q.correctIndex}
          revealed={selected !== null}
          onSelect={choose}
          lang={q.showEnglish ? 'cs' : 'en'}
        />

        {result !== null && (
          <Feedback
            correct={result}
            explanation={
              <>
                <span className="flex flex-wrap items-center gap-2">
                  <strong className="text-fg" lang="en">{q.entry.verb}</strong>
                  <span>= {q.entry.meaningCs}</span>
                </span>
                <span className="mt-1 flex items-start gap-2">
                  <span className="flex-1">
                    <span className="block italic text-fg" lang="en">„{q.entry.example}“</span>
                    <span className="block">{q.entry.exampleCs}</span>
                  </span>
                  <SpeakButton size="sm" onClick={() => say(q.entry.example)} label="Přehrát příklad" />
                </span>
              </>
            }
          />
        )}
        {result !== null && <NextButton onClick={() => void advance(questions.length)} last={last} />}
      </div>
    </div>
  );
}

/* ─── Page-local components ───────────────────────────────────────── */

function GradeButtons({ onGrade }: { onGrade: (known: boolean) => void }) {
  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3">
        <button type="button" className="vocab-grade vocab-grade--again" onClick={() => onGrade(false)}>
          <span className="font-black">Neznám</span>
          <span className="text-[0.7rem] opacity-80">klávesa 1 / ←</span>
        </button>
        <button type="button" className="vocab-grade vocab-grade--good" onClick={() => onGrade(true)}>
          <span className="font-black">Znám ✓</span>
          <span className="text-[0.7rem] opacity-80">klávesa 2 / →</span>
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">Hodnoť poctivě — co neumíš, zařadíme do opakování chyb.</p>
    </div>
  );
}
