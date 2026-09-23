import { useEffect, useMemo, useRef, useState } from 'react';
import { IRREGULAR_VERBS, type IrregularVerb } from '../data/irregularVerbs';
import { speak, stopSpeaking } from '../tts';
import { shuffleArray } from '../utils';
import { isAnswerCorrect } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { playFlip } from '../sounds';
import { useSettings } from '../App';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';
import { PageHeader, SpeakButton } from '../components/ui';

type Phase = 'setup' | 'table' | 'flashcard' | 'quiz' | 'result';
type Mode = 'table' | 'flashcard' | 'quiz';
type Level = 'all' | 'A1' | 'A2' | 'B1';
type QKind = 'base_to_past' | 'base_to_pp' | 'cs_to_base';

const LEVELS: Level[] = ['all', 'A1', 'A2', 'B1'];
const MODES: { id: Mode; label: string }[] = [
  { id: 'flashcard', label: 'Kartičky' },
  { id: 'quiz', label: 'Kvíz (psaní)' },
  { id: 'table', label: 'Tabulka' },
];
const Q_KINDS: { id: QKind; label: string; badge: string; task: string }[] = [
  { id: 'base_to_past', label: 'Past simple', badge: 'Past simple', task: 'Napiš tvar past simple:' },
  { id: 'base_to_pp', label: 'Past participle', badge: 'Past participle', task: 'Napiš tvar past participle (3. tvar):' },
  { id: 'cs_to_base', label: 'Z češtiny (infinitiv)', badge: 'Infinitiv', task: 'Napiš anglický infinitiv:' },
];

/* ─── Helpers ─────────────────────────────────────────────────────── */

/** Ignore "next" for a moment after answering, so a double Enter doesn't skip the feedback. */
const NEXT_GUARD_MS = 350;
const now = () => Date.now();

/** "burnt/burned" (data) or "burnt|burned" → ["burnt", "burned"] */
function variants(form: string): string[] {
  return form.split(/[/|]/).map((s) => s.trim()).filter(Boolean);
}
/** Display form: "burnt / burned". */
function show(form: string): string {
  return variants(form).join(' / ');
}
/** Text for TTS: "burn, burnt or burned, burnt or burned". */
function spokenForms(v: IrregularVerb): string {
  return [v.base, v.past, v.pastParticiple].map((f) => variants(f).join(' or ')).join(', ');
}

const normCs = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
const senses = (m: string) => m.split(/[,;]/).map(normCs).filter(Boolean);
const coreSense = (s: string) => s.replace(/\s*\([^)]*\)/g, '').trim();

/**
 * Other verbs that are also a correct answer to the Czech prompt of `v`:
 * the same Czech meaning, or a verb whose sense matches an unqualified sense of the prompt
 * ("udeřit, trefit" → hit, but also strike = "udeřit (o blesku)"; "říct (něco)" stays say only).
 */
const SYNONYMS: Map<string, string[]> = new Map(
  IRREGULAR_VERBS.map((v) => {
    const bare = senses(v.meaningCs).filter((s) => !s.includes('('));
    const others = IRREGULAR_VERBS.filter(
      (w) => w.id !== v.id && (normCs(w.meaningCs) === normCs(v.meaningCs) || senses(w.meaningCs).some((s) => bare.includes(coreSense(s)))),
    ).map((w) => w.base);
    return [v.id, others];
  }),
);

interface Question {
  verb: IrregularVerb;
  kind: QKind;
  /** Accepted answer, alternatives separated by "|". */
  answer: string;
  accept: string[];
}

function buildQuestion(verb: IrregularVerb, kind: QKind): Question {
  if (kind === 'cs_to_base') return { verb, kind, answer: verb.base, accept: SYNONYMS.get(verb.id) ?? [] };
  const form = kind === 'base_to_past' ? verb.past : verb.pastParticiple;
  // Accept one variant, or both written together ("burnt/burned").
  return { verb, kind, answer: variants(form).join('|'), accept: form.includes('/') ? [form] : [] };
}

/** Typed answer check: any variant, several variants separated by "/", "," or "or" are fine too. */
function checkTyped(input: string, q: Question): boolean {
  let s = input.trim();
  if (q.kind === 'cs_to_base') s = s.replace(/^to\s+/i, '');
  const parts = s.split(/\s*(?:\/|\||,|\bor\b)\s*/i).filter(Boolean);
  return parts.length > 0 && parts.every((p) => isAnswerCorrect(p, q.answer, q.accept));
}

function questionPrompt(q: Question): string {
  if (q.kind === 'cs_to_base') return `${q.verb.meaningCs} → infinitiv`;
  return `${q.verb.base} → ${q.kind === 'base_to_past' ? 'past simple' : 'past participle'}`;
}

function formsLine(v: IrregularVerb): string {
  return `${v.base} – ${show(v.past)} – ${show(v.pastParticiple)}`;
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function IrregularVerbsDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<Mode>('flashcard');
  const [level, setLevel] = useState<Level>('all');
  const [kinds, setKinds] = useState<QKind[]>([]);
  const [count, setCount] = useState(20);

  const [cards, setCards] = useState<IrregularVerb[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const answeredRef = useRef(-1);
  const answeredAt = useRef(0);

  const session = useDrillSession('irregular_verbs', { tags: [mode, level] });

  const pool = useMemo(() => (level === 'all' ? IRREGULAR_VERBS : IRREGULAR_VERBS.filter((v) => v.level === level)), [level]);

  useEffect(() => () => stopSpeaking(), []);

  const say = (t: string) => void speak(t, settings.ttsRate);

  function resetItem() {
    setRevealed(false);
    setText('');
    setResult(null);
    answeredRef.current = -1;
  }

  function start() {
    if (mode === 'table') {
      setPhase('table');
      return;
    }
    const picked = shuffleArray(pool).slice(0, count);
    if (!picked.length) return;
    if (mode === 'quiz') {
      const active = kinds.length ? Q_KINDS.filter((k) => kinds.includes(k.id)).map((k) => k.id) : Q_KINDS.map((k) => k.id);
      setQuestions(shuffleArray(picked.map((v, i) => buildQuestion(v, active[i % active.length]))));
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
    if (settings.ttsEnabled) say(spokenForms(card));
  }

  function grade(known: boolean) {
    if (!card || !revealed || answeredRef.current === idx) return;
    answeredRef.current = idx;
    session.answer({
      itemId: card.id,
      category: card.level,
      prompt: `Tvary slovesa ${card.base} (${card.meaningCs})`,
      kind: 'reveal',
      answer: `${card.base} – ${show(card.past)} – ${show(card.pastParticiple)}`,
      userAnswer: known ? undefined : '',
      explanation: card.example,
      correct: known,
      silent: true,
    });
    void advance(cards.length);
  }

  /* ── Quiz ── */
  const q = phase === 'quiz' ? questions[idx] : undefined;

  function submit() {
    if (!q || result !== null || answeredRef.current === idx) return;
    const user = text.trim();
    if (!user) return;
    answeredRef.current = idx;
    answeredAt.current = now();
    const correct = checkTyped(user, q);
    setResult(correct);
    session.answer({
      itemId: `${q.verb.id}:${q.kind}`,
      category: q.kind,
      prompt: questionPrompt(q),
      kind: 'text',
      answer: q.answer,
      accept: q.accept,
      userAnswer: user,
      explanation: `${formsLine(q.verb)} (${q.verb.meaningCs})`,
      correct,
    });
  }

  function quizNext() {
    if (now() - answeredAt.current < NEXT_GUARD_MS) return;
    void advance(questions.length);
  }

  useKeyboard(
    phase === 'flashcard'
      ? revealed
        ? { '1': () => grade(false), '2': () => grade(true), ArrowLeft: () => grade(false), ArrowRight: () => grade(true) }
        : { ' ': reveal, Enter: reveal }
      : phase === 'quiz' && result !== null
        ? { Enter: quizNext }
        : {},
    phase === 'flashcard' || phase === 'quiz',
  );

  /* ── Setup ── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Nepravidelná slovesa"
        subtitle="Procvič si tři tvary: go – went – gone. Kartičky, psaní tvarů nebo přehledná tabulka."
        icon="🔁"
        poolSize={pool.length}
        onStart={start}
        startLabel={mode === 'table' ? 'Zobrazit tabulku' : 'Začít'}
        count={mode === 'table' ? undefined : count}
        onCountChange={mode === 'table' ? undefined : setCount}
        countOptions={[10, 20, 30]}
      >
        <FilterGroup label="Režim">
          {MODES.map((m) => (
            <Chip key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>{m.label}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        {mode === 'quiz' && (
          <FilterGroup label={`Co psát${kinds.length ? ` (${kinds.length})` : ' (mix)'}`} hint="Tvary s variantami (burnt / burned) uznáme v kterékoli podobě.">
            {Q_KINDS.map((k) => (
              <Chip key={k.id} active={kinds.includes(k.id)} onClick={() => setKinds((p) => (p.includes(k.id) ? p.filter((x) => x !== k.id) : [...p, k.id]))}>
                {k.label}
              </Chip>
            ))}
          </FilterGroup>
        )}
      </DrillSetup>
    );
  }

  /* ── Table ── */
  if (phase === 'table') {
    return <VerbTable verbs={pool} level={level} onBack={() => setPhase('setup')} onSpeak={say} />;
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
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit nastavení</button>
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
          <span className="badge !bg-accent-soft !text-accent-text">{card.level}</span>
          <div className="mt-3 flex items-center justify-center gap-3">
            <h2 className="text-4xl font-black break-words text-fg" lang="en">{card.base}</h2>
            <SpeakButton onClick={() => say(revealed ? spokenForms(card) : card.base)} label={`Přehrát: ${card.base}`} />
          </div>
          <p className="mt-1 text-sm text-muted">infinitiv</p>

          {!revealed ? (
            <>
              <p className="mt-6 text-sm text-muted">Vybav si past simple a past participle, pak si kartičku otoč.</p>
              <button type="button" className="btn-primary btn-lg mt-4" onClick={reveal}>Ukázat tvary</button>
              <p className="mt-2 hidden text-xs text-subtle sm:block">nebo mezerník</p>
            </>
          ) : (
            <div className="mt-5 w-full animate-fadeIn space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-accent-soft p-3">
                  <div className="text-xs font-bold text-accent-text">Past simple</div>
                  <div className="text-xl font-black break-words text-fg" lang="en">{show(card.past)}</div>
                </div>
                <div className="rounded-2xl bg-info-soft p-3">
                  <div className="text-xs font-bold text-info">Past participle</div>
                  <div className="text-xl font-black break-words text-fg" lang="en">{show(card.pastParticiple)}</div>
                </div>
              </div>
              <div className="text-lg font-bold text-accent-text">{card.meaningCs}</div>
              <div className="flex items-start gap-2 rounded-2xl bg-surface-2 p-3 text-left">
                <p className="flex-1 text-fg italic" lang="en">„{card.example}“</p>
                <SpeakButton size="sm" onClick={() => say(card.example)} label="Přehrát příklad" />
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
  const kindInfo = Q_KINDS.find((k) => k.id === q.kind)!;
  const last = idx + 1 >= questions.length;
  const synonyms = q.kind === 'cs_to_base' ? q.accept : [];

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={questions.length} correct={session.correct} onExit={() => void finishNow()} title="Tvary sloves" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{kindInfo.badge}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{q.verb.level}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">{kindInfo.task}</p>
        <div className="mb-4 flex items-center gap-3">
          {q.kind === 'cs_to_base' ? (
            <p className="text-2xl font-black break-words text-fg" lang="cs">{q.verb.meaningCs}</p>
          ) : (
            <>
              <p className="text-2xl font-black break-words text-fg" lang="en">{q.verb.base}</p>
              <SpeakButton size="sm" onClick={() => say(q.verb.base)} label={`Přehrát: ${q.verb.base}`} />
            </>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1">
            <TextAnswer
              value={text}
              onChange={setText}
              onSubmit={submit}
              disabled={result !== null}
              status={result === null ? null : result ? 'correct' : 'wrong'}
              label={kindInfo.task}
            />
          </div>
          {result === null && (
            <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={submit}>Ověřit</button>
          )}
        </div>

        {result !== null && (
          <Feedback
            correct={result}
            answer={q.answer}
            userAnswer={text.trim()}
            explanation={
              <>
                <span className="flex items-center gap-2">
                  <strong className="min-w-0 break-words text-fg" lang="en">{formsLine(q.verb)}</strong>
                  <SpeakButton size="sm" onClick={() => say(spokenForms(q.verb))} label="Přehrát všechny tvary" />
                </span>
                <span className="block">{q.verb.meaningCs}</span>
                {synonyms.length > 0 && <span className="mt-1 block">Uznáváme i: <span lang="en">{synonyms.join(', ')}</span></span>}
                <span className="mt-1 block italic" lang="en">„{q.verb.example}“</span>
              </>
            }
          />
        )}
        {result !== null && <NextButton onClick={quizNext} last={last} />}
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

function VerbTable({ verbs, level, onBack, onSpeak }: { verbs: IrregularVerb[]; level: Level; onBack: () => void; onSpeak: (t: string) => void }) {
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const shown = q
    ? verbs.filter((v) => [v.base, v.past, v.pastParticiple, v.meaningCs].some((f) => f.toLowerCase().includes(q)))
    : verbs;

  return (
    <div className="page-container page-container--wide">
      <button type="button" className="btn-ghost btn-sm -ml-2 mb-2" onClick={onBack}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Zpět na výběr
      </button>
      <PageHeader
        back={null}
        icon="📋"
        title="Přehled nepravidelných sloves"
        subtitle={`${verbs.length} sloves${level === 'all' ? '' : ` úrovně ${level}`} · infinitiv – past simple – past participle`}
      />

      <label className="mb-4 block">
        <span className="eyebrow mb-1 block">Hledat</span>
        <input
          type="search"
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="např. go, went, psát…"
          autoComplete="off"
          autoCapitalize="off"
          spellCheck={false}
        />
      </label>

      <div className="card !p-0 overflow-hidden">
        <div className="hidden grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)_2.25rem_2.25rem] gap-3 border-b border-border bg-surface-2 px-4 py-2 text-xs font-bold text-muted sm:grid" aria-hidden="true">
          <span>Infinitiv</span>
          <span>Past simple</span>
          <span>Past participle</span>
          <span>Význam</span>
          <span />
          <span />
        </div>
        {shown.length === 0 ? (
          <p className="p-5 text-center text-sm text-muted">
            Nic jsme nenašli{level === 'all' ? '' : ` mezi slovesy úrovně ${level}`}. Zkus jiné slovo.
          </p>
        ) : (
          <ul>
            {shown.map((v) => (
              <li key={v.id} className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-b-0 sm:grid sm:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)_2.25rem_2.25rem]">
                <div className="min-w-0 flex-1 sm:contents">
                  <div className="font-bold break-words text-fg" lang="en">
                    {v.base}
                    <span className="font-medium text-muted sm:hidden"> – {show(v.past)} – {show(v.pastParticiple)}</span>
                  </div>
                  <div className="hidden break-words text-fg sm:block" lang="en">{show(v.past)}</div>
                  <div className="hidden break-words text-fg sm:block" lang="en">{show(v.pastParticiple)}</div>
                  <div className="text-sm break-words text-muted">{v.meaningCs}</div>
                </div>
                <span className="badge shrink-0 justify-self-center">{v.level}</span>
                <SpeakButton size="sm" onClick={() => onSpeak(spokenForms(v))} label={`Přehrát: ${formsLine(v)}`} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
