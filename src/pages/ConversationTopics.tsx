import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSettings } from '../App';
import { CONVERSATION_TOPICS } from '../data/conversation';
import type { ConversationTopic } from '../data/conversation';
import { speak, stopSpeaking } from '../tts';
import { plural } from '../kit';
import { useKeyboard } from '../hooks/useKeyboard';
import { PageHeader, ProgressBar, Ring, Segmented, SpeakButton } from '../components/ui';

const LEVEL_CLASS: Record<string, string> = {
  A1: 'bg-success-soft text-success',
  A2: 'bg-info-soft text-info',
  B1: 'bg-accent-soft text-accent-text',
};

const LEVELS = [...new Set(CONVERSATION_TOPICS.map((t) => t.level as string))].sort();

type Tab = 'vocab' | 'phrases' | 'questions' | 'answer';

/** Seconds to think about and answer one question. */
const ANSWER_SECONDS = 60;

function LevelBadge({ level }: { level: string }) {
  return <span className={`badge ${LEVEL_CLASS[level] ?? ''}`}>{level}</span>;
}

function highlightVocabulary(text: string, vocabulary: { en: string }[]) {
  if (vocabulary.length === 0) return text;
  const words = vocabulary.map((v) => v.en.toLowerCase()).sort((a, b) => b.length - a.length);
  const escaped = words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = text.split(new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi'));
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <mark key={i} className="rounded bg-warning-soft px-0.5 text-inherit">{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

/**
 * Every view (list / topic / practice) opens at the top; coming back to the list
 * scrolls to and focuses the topic you opened last.
 */
function useViewScroll(view: string, topicId: string | null) {
  const lastTopic = useRef<string | null>(null);
  useEffect(() => {
    if (topicId) {
      lastTopic.current = topicId;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const el = lastTopic.current ? document.getElementById(`topic-${lastTopic.current}`) : null;
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      el.focus({ preventScroll: true });
    }
  }, [view, topicId]);
}

export default function ConversationTopics() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('t');
  const practice = params.get('mode') === 'practice';
  const selected = selectedId ? CONVERSATION_TOPICS.find((t) => t.id === selectedId) ?? null : null;
  const [filterLevel, setFilterLevel] = useState('all');

  useViewScroll(selected && practice ? 'practice' : selected ? 'detail' : 'list', selected?.id ?? null);

  if (selected && practice) return <PracticeMode key={selected.id} topic={selected} />;
  if (selected) return <TopicDetail key={selected.id} topic={selected} />;

  const filtered = CONVERSATION_TOPICS.filter((t) => filterLevel === 'all' || t.level === filterLevel);
  const total = CONVERSATION_TOPICS.length;

  return (
    <div className="page-container page-container--wide">
      <PageHeader
        back="/practice"
        icon="🎙️"
        title="Konverzační témata"
        subtitle={`${total} ${plural(total, 'téma', 'témata', 'témat')} pro ústní maturitu — slovíčka, fráze, otázky a vzorové odpovědi. U každého tématu si můžeš vyzkoušet odpovídat nahlas na čas.`}
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Úroveň"
          value={filterLevel}
          onChange={setFilterLevel}
          options={[{ value: 'all', label: 'Všechny úrovně' }, ...LEVELS.map((l) => ({ value: l, label: l }))]}
        />
        <span className="text-sm text-muted" aria-live="polite">
          {filtered.length} {plural(filtered.length, 'téma', 'témata', 'témat')}
        </span>
      </div>

      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((topic) => (
          <li key={topic.id}>
            <button
              id={`topic-${topic.id}`}
              type="button"
              className="card card-link flex h-full w-full items-center gap-3 !p-4 text-left"
              onClick={() => setParams({ t: topic.id })}
            >
              <span className="tile-icon" aria-hidden="true">{topic.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-fg">{topic.titleCs}</span>
                <span className="block text-sm text-muted" lang="en">{topic.titleEn}</span>
              </span>
              <LevelBadge level={topic.level} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Topic detail ────────────────────────────────────────────────── */

function TopicDetail({ topic }: { topic: ConversationTopic }) {
  const { settings } = useSettings();
  const [tab, setTab] = useState<Tab>('vocab');
  const say = (text: string, rate = settings.ttsRate) => void speak(text, rate);

  return (
    <div className="page-container">
      <PageHeader back="/conversation" backLabel="Všechna témata" icon={topic.icon} title={topic.titleCs} subtitle={<span lang="en">{topic.titleEn}</span>} />

      <div className="card mb-5 !p-5">
        <div className="mb-2 flex items-center gap-2">
          <LevelBadge level={topic.level} />
          <span className="eyebrow">O tématu</span>
        </div>
        <p className="leading-relaxed text-fg">{topic.introduction}</p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link to={`/conversation?t=${topic.id}&mode=practice`} className="btn-primary">
            🎙️ Procvičit nahlas
          </Link>
          <span className="text-sm text-muted">
            {topic.sampleQuestions.length} {plural(topic.sampleQuestions.length, 'otázka', 'otázky', 'otázek')} · {ANSWER_SECONDS} s na odpověď
          </span>
        </div>
      </div>

      <div className="mb-4">
        <Segmented
          label="Část tématu"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'vocab', label: `Slovíčka (${topic.keyVocabulary.length})` },
            { value: 'phrases', label: `Fráze (${topic.usefulPhrases.length})` },
            { value: 'questions', label: `Otázky (${topic.sampleQuestions.length})` },
            { value: 'answer', label: 'Vzorová odpověď' },
          ]}
        />
      </div>

      <div className="card !p-5">
        {tab === 'vocab' && (
          <ul className="grid gap-x-6 sm:grid-cols-2">
            {topic.keyVocabulary.map((item, i) => (
              <li key={`${i}-${item.en}`} className="flex items-center gap-3 border-b border-border py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="font-bold break-words text-fg" lang="en">{item.en}</p>
                  <p className="text-sm text-muted">{item.cs}</p>
                </div>
                <SpeakButton onClick={() => say(item.en)} label={`Přehrát: ${item.en}`} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'phrases' && (
          <ul className="divide-y divide-border">
            {topic.usefulPhrases.map((phrase, i) => (
              <li key={`${i}-${phrase.en}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-fg" lang="en">{phrase.en}</p>
                  <p className="text-sm text-muted">{phrase.cs}</p>
                </div>
                <SpeakButton onClick={() => say(phrase.en)} label={`Přehrát: ${phrase.en}`} />
              </li>
            ))}
          </ul>
        )}

        {tab === 'questions' && (
          <>
            <ol className="divide-y divide-border">
              {topic.sampleQuestions.map((q, i) => (
                <li key={`${i}-${q}`} className="flex items-center gap-3 py-2.5 first:pt-0">
                  <span className="exam-task-no" aria-hidden="true">{i + 1}</span>
                  <p className="min-w-0 flex-1 font-bold text-fg" lang="en">{q}</p>
                  <SpeakButton onClick={() => say(q)} label={`Přehrát otázku ${i + 1}`} />
                </li>
              ))}
            </ol>
            <div className="feedback feedback--info mt-4 flex flex-wrap items-center gap-3">
              <p className="min-w-0 flex-1 text-sm text-fg">💡 Zkus si odpovědět nahlas! V režimu procvičování dostaneš na každou otázku {ANSWER_SECONDS} sekund.</p>
              <Link to={`/conversation?t=${topic.id}&mode=practice`} className="btn-soft btn-sm !min-h-[44px]">Spustit</Link>
            </div>
          </>
        )}

        {tab === 'answer' && <SampleAnswer topic={topic} />}
      </div>
    </div>
  );
}

function SampleAnswer({ topic }: { topic: ConversationTopic }) {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(false);

  useEffect(() => () => stopSpeaking(), []);

  const toggle = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    void speak(topic.sampleAnswer, settings.ttsRate * 0.95).then(() => setPlaying(false));
  };

  return (
    <div className="space-y-4">
      <p className="feedback feedback--info text-sm leading-relaxed text-fg">
        <strong>💡 Tip: </strong>
        {topic.structureHintCs}
      </p>
      <div>
        <div className="mb-2 flex items-center justify-between gap-3">
          <h3 className="font-bold text-fg">Vzorová odpověď</h3>
          <button type="button" className="btn-soft btn-sm !min-h-[44px]" onClick={toggle} aria-pressed={playing}>
            {playing ? '⏹ Zastavit' : '🔊 Přehrát vše'}
          </button>
        </div>
        <p className="reading-text rounded-md bg-surface-2 p-4" lang="en">
          {highlightVocabulary(topic.sampleAnswer, topic.keyVocabulary)}
        </p>
        <p className="mt-2 text-xs text-subtle">Zvýrazněná jsou slovíčka z tohoto tématu.</p>
      </div>
    </div>
  );
}

/* ─── Practice: questions one by one, 60 s to answer aloud ───────────── */

function formatSeconds(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function PracticeMode({ topic }: { topic: ConversationTopic }) {
  const { settings } = useSettings();
  const questions = topic.sampleQuestions;
  const [idx, setIdx] = useState(0);
  const [deadline, setDeadline] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [done, setDone] = useState(false);

  // Deadline-based countdown: the interval only re-renders, the time comes from the clock.
  useEffect(() => {
    if (deadline === null) return;
    let timer = 0;
    const tick = () => {
      const t = Date.now();
      setNow(t);
      if (t >= deadline) window.clearInterval(timer);
    };
    timer = window.setInterval(tick, 250);
    return () => window.clearInterval(timer);
  }, [deadline]);

  useEffect(() => () => stopSpeaking(), []);

  const remaining = deadline === null ? ANSWER_SECONDS : Math.max(0, Math.ceil((deadline - now) / 1000));
  const running = deadline !== null && remaining > 0;
  const expired = deadline !== null && remaining === 0;

  function startTimer() {
    const t = Date.now();
    setNow(t);
    setDeadline(t + ANSWER_SECONDS * 1000);
  }

  function goTo(i: number) {
    stopSpeaking();
    setDeadline(null);
    setShowAnswer(false);
    if (i >= questions.length) {
      setDone(true);
      return;
    }
    setIdx(Math.max(0, i));
  }

  function restart() {
    setDone(false);
    goTo(0);
  }

  useKeyboard({ ArrowRight: () => goTo(idx + 1), ArrowLeft: () => idx > 0 && goTo(idx - 1) }, !done);

  const topicIdx = CONVERSATION_TOPICS.findIndex((t) => t.id === topic.id);
  const nextTopic = CONVERSATION_TOPICS[topicIdx + 1];

  if (done) {
    return (
      <div className="page-container">
        <PageHeader back={`/conversation?t=${topic.id}`} backLabel="Zpět na téma" title="Procvičování nahlas" subtitle={topic.titleCs} />
        <div className="card g92-card--accent !p-6 text-center">
          <div className="text-5xl" aria-hidden="true">🎉</div>
          <h2 className="mt-3 text-2xl font-black text-fg">Hotovo!</h2>
          <p className="mx-auto mt-2 max-w-sm text-fg">
            {questions.length} {plural(questions.length, 'otázku', 'otázky', 'otázek')} máš za sebou. Čím víc mluvíš nahlas, tím jistěji to u maturity půjde.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <button type="button" className="btn-primary btn-lg" onClick={restart} autoFocus>Znovu od začátku</button>
            <Link to={`/conversation?t=${topic.id}`} className="btn-secondary btn-lg">Zpět na téma</Link>
          </div>
          {nextTopic && (
            <p className="mt-4 text-sm text-muted">
              Další téma: <Link to={`/conversation?t=${nextTopic.id}&mode=practice`}>{nextTopic.icon} {nextTopic.titleCs}</Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const last = idx + 1 >= questions.length;
  const tone = expired ? 'danger' : running && remaining <= 10 ? 'warning' : 'accent';

  return (
    <div className="page-container">
      <PageHeader back={`/conversation?t=${topic.id}`} backLabel="Zpět na téma" icon={topic.icon} title="Procvičování nahlas" subtitle={topic.titleCs} />

      <div className="mb-4">
        <div className="mb-2 flex items-center justify-between text-sm font-bold text-muted">
          <span>Otázka</span>
          <span className="tabular-nums" aria-live="polite">{idx + 1} / {questions.length}</span>
        </div>
        <ProgressBar value={idx} max={questions.length} label="Průběh procvičování" />
      </div>

      <section className="card !p-5" aria-labelledby="practice-q">
        <div className="flex items-start gap-3">
          <h2 id="practice-q" className="min-w-0 flex-1 text-xl leading-snug font-black text-fg sm:text-2xl" lang="en">{q}</h2>
          <SpeakButton onClick={() => void speak(q, settings.ttsRate)} label="Přehrát otázku" />
        </div>

        <div className="mt-5 flex flex-col items-center gap-4 rounded-lg bg-surface-2 p-5 sm:flex-row sm:items-center">
          <Ring value={remaining / ANSWER_SECONDS} size={112} stroke={10} tone={tone} label={`Zbývá ${remaining} sekund`}>
            <span className="text-2xl font-black tabular-nums text-fg">{formatSeconds(remaining)}</span>
          </Ring>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="font-bold text-fg" aria-live="polite">
              {expired ? 'Čas vypršel.' : running ? 'Mluv nahlas…' : 'Rozmysli si odpověď a mluv nahlas.'}
            </p>
            <p className="mt-0.5 text-sm text-muted">
              {expired
                ? 'Zkus odpověď uzavřít jednou větou — a pak přejdi na další otázku.'
                : running
                  ? 'Odpovídej celými větami a přidej důvod nebo příklad.'
                  : `Na odpověď máš ${ANSWER_SECONDS} sekund. Odpovídej celými větami, přidej důvod a příklad.`}
            </p>
            <div className="mt-3 flex flex-wrap justify-center gap-2 sm:justify-start">
              {!running ? (
                <button type="button" className="btn-primary" onClick={startTimer}>
                  {expired ? '↻ Znovu 60 s' : `▶ Spustit ${ANSWER_SECONDS} s`}
                </button>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => setDeadline(null)}>Zastavit</button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4">
          <button
            type="button"
            className="btn-ghost -ml-2"
            aria-expanded={showAnswer}
            aria-controls="practice-answer"
            onClick={() => setShowAnswer((v) => !v)}
          >
            {showAnswer ? 'Skrýt vzorovou odpověď' : 'Zobrazit vzorovou odpověď'}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={showAnswer ? 'rotate-180' : ''}>
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {showAnswer && (
            <div id="practice-answer" className="mt-2 space-y-3">
              <p className="feedback feedback--info text-sm leading-relaxed text-fg">
                <strong>💡 Tip: </strong>
                {topic.structureHintCs}
              </p>
              <p className="reading-text rounded-md bg-surface-2 p-4" lang="en">
                {highlightVocabulary(topic.sampleAnswer, topic.keyVocabulary)}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-4 flex items-center justify-between gap-3">
        <button type="button" className="btn-ghost" onClick={() => goTo(idx - 1)} disabled={idx === 0}>
          ← Předchozí
        </button>
        <button type="button" className="btn-primary btn-lg" onClick={() => goTo(idx + 1)}>
          {last ? 'Dokončit' : 'Další otázka'}
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>
      </div>
    </div>
  );
}
