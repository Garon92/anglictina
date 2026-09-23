import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router';
import { LISTENING_EXERCISES } from '../data/listening';
import { MATURITA_TOPICS, type ListeningExercise, type ListeningQuestion } from '../types';
import { kvGet, kvSet } from '../db';
import { speak, speakScript, stopSpeaking, parseScript, scriptToText } from '../tts';
import { useEnglishVoice } from '../hooks/useEnglishVoice';
import { shuffleArray } from '../utils';
import { isAnswerCorrect } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { useSettings } from '../App';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
type Level = 'all' | ListeningExercise['level'];
type ExType = 'all' | ListeningExercise['type'];
type BestMap = Record<string, { correct: number; total: number }>;

const LEVELS: Level[] = ['all', 'A1', 'A2', 'B1'];
const TYPES: ExType[] = ['all', 'dictation', 'comprehension', 'gapfill'];
const BEST_KEY = 'listening:best';

const TYPE_LABELS: Record<ListeningExercise['type'], string> = {
  dictation: 'Diktát',
  comprehension: 'Porozumění',
  gapfill: 'Doplňování',
};

const TYPE_ICONS: Record<ListeningExercise['type'], string> = {
  dictation: '✍️',
  comprehension: '🎧',
  gapfill: '📝',
};

const TYPE_HINTS: Record<ListeningExercise['type'], string> = {
  dictation: 'Poslechni si větu a vyber, co přesně zaznělo.',
  comprehension: 'Poslechni si nahrávku a odpověz na otázky.',
  gapfill: 'Poslechni si větu a doplň chybějící slovo.',
};

const TOPIC_LABELS: Record<string, string> = Object.fromEntries(MATURITA_TOPICS.map((t) => [t.id, t.cs]));
const topicLabel = (id: string) => TOPIC_LABELS[id] ?? id;

const LEVEL_BADGE: Record<string, string> = {
  A1: '!bg-success-soft !text-success',
  A2: '!bg-info-soft !text-info',
  B1: '!bg-accent-soft !text-accent-text',
};

function LevelBadge({ level }: { level: string }) {
  return <span className={`badge ${LEVEL_BADGE[level] ?? ''}`}>{level}</span>;
}

function plural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

/** Scripts with "M:" / "W:" speaker lines are read with two voices. */
const hasSpeakers = (script: string) => /^\s*[MW]:/m.test(script);

function exerciseTitle(ex: ListeningExercise) {
  return `${TYPE_LABELS[ex.type]} — ${topicLabel(ex.topic)}`;
}

function correctAnswerOf(q: ListeningQuestion): string {
  if (q.type === 'fill') return q.answer ?? '';
  return q.options?.[q.answerIndex ?? -1] ?? '';
}

function Transcript({ script }: { script: string }) {
  const lines = parseScript(script);
  const dialogue = hasSpeakers(script);
  return (
    <details className="group mt-4 rounded-xl border border-border bg-surface-2 px-4">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-1.5 text-sm font-bold text-accent-text [&::-webkit-details-marker]:hidden">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-open:rotate-90" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
        Přepis nahrávky
      </summary>
      <div className="reading-text pb-4 break-words" lang="en">
        {dialogue ? (
          lines.map((l, i) => (
            <p key={i}>
              {l.speaker !== 'N' && (
                <span className="mr-1.5 font-bold text-muted" lang="cs">
                  {l.speaker === 'M' ? 'Muž:' : 'Žena:'}
                </span>
              )}
              {l.text}
            </p>
          ))
        ) : (
          <p>{scriptToText(script)}</p>
        )}
      </div>
    </details>
  );
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true">
      <path d="M7 4.5v15a1 1 0 0 0 1.52.85l12-7.5a1 1 0 0 0 0-1.7l-12-7.5A1 1 0 0 0 7 4.5z" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

export default function ListeningPractice() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [level, setLevel] = useState<Level>('all');
  const [type, setType] = useState<ExType>('all');
  const [exercise, setExercise] = useState<ListeningExercise | null>(null);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [result, setResult] = useState<boolean | null>(null);
  const [played, setPlayed] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [slow, setSlow] = useState(false);
  const [best, setBest] = useState<BestMap>({});
  const [completed, setCompleted] = useState(false);
  const playId = useRef(0);
  const correctRef = useRef(0);
  const session = useDrillSession('listening', { tags: exercise ? [exercise.type, exercise.topic] : [] });
  const voice = useEnglishVoice();
  const canSpeak = voice !== 'no';

  const normalRate = settings.ttsRate || 0.9;
  const slowRate = Math.max(0.5, Math.round(normalRate * 0.7 * 100) / 100);

  // Stop any speech when leaving the page.
  useEffect(() => () => stopSpeaking(), []);

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
    () => LISTENING_EXERCISES.filter((ex) => (level === 'all' || ex.level === level) && (type === 'all' || ex.type === type)),
    [level, type],
  );

  const q = questions[idx];

  function stopAudio() {
    playId.current += 1;
    stopSpeaking();
    setPlaying(false);
  }

  function play() {
    if (!exercise) return;
    if (playing) {
      stopAudio();
      return;
    }
    const id = ++playId.current;
    const rate = slow ? slowRate : normalRate;
    setPlayed(true);
    setPlaying(true);
    const done = hasSpeakers(exercise.script) ? speakScript(exercise.script, { rate }).done : speak(exercise.script, rate);
    void done.then(() => {
      if (playId.current === id) setPlaying(false);
    });
  }

  function resetItem() {
    setSelected(null);
    setText('');
    setResult(null);
  }

  function startExercise(ex: ListeningExercise) {
    stopAudio();
    setExercise(ex);
    setQuestions(shuffleArray(ex.questions));
    setIdx(0);
    resetItem();
    setPlayed(!canSpeak);
    setCompleted(false);
    correctRef.current = 0;
    session.start();
    setPhase('drill');
    window.scrollTo({ top: 0 });
  }

  function startRandom() {
    if (!pool.length) return;
    const fresh = pool.filter((ex) => !best[ex.id]);
    startExercise(shuffleArray(fresh.length ? fresh : pool)[0]);
  }

  function submit(opt?: number) {
    if (!exercise || !q || result !== null) return;
    let correct: boolean;
    let user: string;
    if (q.type === 'fill') {
      user = text.trim();
      if (!user) return;
      correct = isAnswerCorrect(user, q.answer ?? '');
    } else {
      if (opt === undefined || !q.options) return;
      setSelected(opt);
      user = q.options[opt];
      correct = opt === q.answerIndex;
    }
    setResult(correct);
    if (correct) correctRef.current += 1;
    session.answer({
      itemId: q.id,
      category: exercise.topic,
      prompt: q.question,
      options: q.type === 'fill' ? undefined : q.options,
      kind: q.type === 'fill' ? 'text' : 'mcq',
      answer: correctAnswerOf(q),
      userAnswer: user,
      // Comprehension questions can be re-asked later with the transcript as context; dictation
      // ("Which sentence did you hear?") makes no sense without the audio, so it isn't queued.
      context: exercise.type === 'comprehension' ? `Nahrávka: „${scriptToText(exercise.script)}“` : undefined,
      noTrack: exercise.type === 'dictation',
      correct,
    });
  }

  async function saveBest(ex: ListeningExercise) {
    const total = questions.length;
    const correct = correctRef.current;
    const prev = best[ex.id];
    if (prev && prev.correct / prev.total >= correct / total) return;
    const next = { ...best, [ex.id]: { correct, total } };
    setBest(next);
    try {
      await kvSet(BEST_KEY, next);
    } catch {
      /* best-effort */
    }
  }

  async function finish(full: boolean) {
    stopAudio();
    await session.finish();
    if (full && exercise) {
      setCompleted(true);
      await saveBest(exercise);
    }
    setPhase('result');
    window.scrollTo({ top: 0 });
  }

  async function next() {
    if (idx + 1 >= questions.length) {
      await finish(true);
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'drill');

  /* ─── Setup ──────────────────────────────────────────────────────── */
  if (phase === 'setup' || !exercise) {
    return (
      <DrillSetup
        title="Poslech"
        subtitle={`${LISTENING_EXERCISES.length} cvičení — poslouchej a odpovídej. Nahrávku si můžeš pustit, kolikrát chceš.`}
        icon="🎧"
        poolSize={pool.length}
        poolNoun={["cvičení", "cvičení", "cvičení"]}
        onStart={startRandom}
        startLabel="Náhodné cvičení"
        footer={
          <section aria-labelledby="listening-list-title">
            <h2 id="listening-list-title" className="section-title">
              Cvičení <span className="text-muted">({pool.length})</span>
            </h2>
            {pool.length === 0 ? (
              <p className="card text-sm text-muted">Pro tento výběr tu zatím žádné cvičení není.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2">
                {pool.map((ex) => {
                  const b = best[ex.id];
                  return (
                    <li key={ex.id} className="min-w-0">
                      <button type="button" className="card card-link flex h-full w-full items-center gap-3 !p-3 text-left" onClick={() => startExercise(ex)}>
                        <span className="tile-icon" aria-hidden="true">{TYPE_ICONS[ex.type]}</span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-bold leading-snug break-words text-fg">{exerciseTitle(ex)}</span>
                          <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                            <LevelBadge level={ex.level} />
                            <span>
                              {ex.questions.length} {plural(ex.questions.length, 'otázka', 'otázky', 'otázek')}
                            </span>
                          </span>
                        </span>
                        {b ? (
                          <span className={`badge shrink-0 ${b.correct === b.total ? '!bg-success-soft !text-success' : ''}`} title="Tvůj nejlepší výsledek">
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
            <p className="mt-4 text-center text-sm text-muted">
              Rychlost předčítání si nastavíš v <Link to="/settings">Nastavení</Link>.
            </p>
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
        <FilterGroup label="Typ cvičení">
          {TYPES.map((t) => (
            <Chip key={t} active={type === t} onClick={() => setType(t)}>
              {t === 'all' ? 'Vše' : `${TYPE_ICONS[t]} ${TYPE_LABELS[t]}`}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  /* ─── Result ─────────────────────────────────────────────────────── */
  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={() => {
          resetItem();
          setPhase('setup');
        }}
        restartLabel="Vybrat další cvičení"
      >
        <div className="card mt-5 !p-4">
          <div className="flex flex-wrap items-center gap-2">
            <LevelBadge level={exercise.level} />
            <span className="font-bold text-fg">{exerciseTitle(exercise)}</span>
          </div>
          {completed && best[exercise.id] && (
            <p className="mt-1 text-sm text-muted">
              Tvůj nejlepší výsledek u tohoto cvičení: {best[exercise.id].correct}/{best[exercise.id].total}.
            </p>
          )}
          <Transcript script={exercise.script} />
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => startExercise(exercise)}>
              Zkusit znovu
            </button>
            {pool.length > 1 && (
              <button type="button" className="btn-ghost" onClick={startRandom}>
                Náhodné další cvičení
              </button>
            )}
          </div>
        </div>
      </ResultScreen>
    );
  }

  /* ─── Drill ──────────────────────────────────────────────────────── */
  if (!q) return null;
  const last = idx + 1 >= questions.length;
  const fillStatus = result === null ? null : result ? 'correct' : 'wrong';

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={questions.length}
        correct={session.correct}
        onExit={() => void finish(false)}
        title={exerciseTitle(exercise)}
      />

      {/* Player */}
      <section className="card mb-4 !p-5" aria-label="Nahrávka">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <LevelBadge level={exercise.level} />
          <span className="badge">
            {TYPE_ICONS[exercise.type]} {TYPE_LABELS[exercise.type]}
          </span>
        </div>
        <p className="mb-4 text-sm text-muted">{TYPE_HINTS[exercise.type]}</p>

        {canSpeak ? (
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className={`btn-lg min-w-[11rem] ${playing ? 'btn-secondary' : 'btn-primary'}`}
              onClick={play}
              aria-label={playing ? 'Zastavit nahrávku' : played ? 'Přehrát nahrávku znovu' : 'Přehrát nahrávku'}
            >
              {playing ? <StopIcon /> : <PlayIcon />}
              {playing ? 'Zastavit' : played ? 'Přehrát znovu' : 'Přehrát'}
              {playing && (
                <span className="exam-wave ml-1" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                  <span />
                </span>
              )}
            </button>
            <button
              type="button"
              className="g92-chip"
              aria-pressed={slow}
              onClick={() => setSlow((s) => !s)}
              title={`Pomalé přehrávání (${slowRate}×)`}
            >
              <span aria-hidden="true">🐢</span> Pomalu
            </button>
          </div>
        ) : (
          <div className="feedback feedback--info text-sm text-fg">
            Tvůj prohlížeč neumí text přečíst nahlas. Otevři si přepis a procvič si aspoň porozumění textu.
            <Transcript script={exercise.script} />
          </div>
        )}
        {!played && <p className="mt-3 text-sm text-muted">Nejdřív si pusť nahrávku — otázka se ukáže hned potom.</p>}
      </section>

      {/* Question */}
      {played && (
        <section className="card !p-5" aria-labelledby="listening-question">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <span className="eyebrow">
              Otázka {idx + 1} z {questions.length}
            </span>
            {q.type === 'truefalse' && <span className="badge !bg-warning-soft !text-warning">Pravda / nepravda</span>}
            {q.type === 'fill' && <span className="badge">Doplň slovo</span>}
          </div>
          <p id="listening-question" className="mb-4 text-lg leading-snug font-bold break-words text-fg" lang="en">
            {q.question}
          </p>

          {q.type === 'fill' ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <TextAnswer
                  key={q.id}
                  value={text}
                  onChange={setText}
                  onSubmit={() => submit()}
                  disabled={result !== null}
                  status={fillStatus}
                  placeholder="Napiš chybějící slovo…"
                  label="Chybějící slovo"
                />
              </div>
              {result === null && (
                <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={() => submit()}>
                  Ověřit
                </button>
              )}
            </div>
          ) : (
            q.options && (
              <OptionList
                key={q.id}
                options={q.options}
                selected={selected}
                correctIndex={q.answerIndex ?? -1}
                revealed={result !== null}
                onSelect={(i) => submit(i)}
              />
            )
          )}

          {result !== null && (
            <Feedback correct={result} answer={correctAnswerOf(q)} userAnswer={q.type === 'fill' ? text.trim() : undefined} />
          )}
          {result !== null && canSpeak && <Transcript script={exercise.script} />}
          {result !== null && <NextButton onClick={() => void next()} last={last} />}
        </section>
      )}
    </div>
  );
}
