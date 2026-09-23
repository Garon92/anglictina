import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSettings } from '../App';
import { VOCAB_TOPICS, type TopicVocab } from '../data/vocabTopics';
import { speak } from '../tts';
import { toggleFavorite, useFavorites } from '../favorites';
import { plural } from '../kit';
import { buildOptions, shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { PageHeader, Segmented, SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Word = TopicVocab['words'][number];

/** Stable favourite id (was the array index before, which broke when the data changed). */
const favId = (topicId: string, w: Word) => `topic_${topicId}_${w.en}`;

const norm = (s: string) => s.trim().toLowerCase();

/** Is a word saved — by id, or the same English text saved from another screen. */
function useFavoriteLookup() {
  const favorites = useFavorites();
  return useMemo(() => {
    const ids = new Set(favorites.map((f) => f.id));
    const texts = new Set(favorites.filter((f) => f.type === 'vocab').map((f) => norm(f.text)));
    return (id: string, text: string) => ids.has(id) || texts.has(norm(text));
  }, [favorites]);
}

function HeartButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-surface-2 ${active ? 'text-danger' : 'text-subtle hover:text-danger'}`}
      aria-pressed={active}
      aria-label={active ? `Odebrat z oblíbených: ${label}` : `Přidat do oblíbených: ${label}`}
      title={active ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 20.5 10.6 19.2C5.6 14.7 2.5 11.9 2.5 8.4 2.5 5.6 4.7 3.5 7.4 3.5c1.6 0 3.1.7 4.1 1.9 1-1.2 2.5-1.9 4.1-1.9 2.7 0 4.9 2.1 4.9 4.9 0 3.5-3.1 6.3-8.1 10.8z" />
      </svg>
    </button>
  );
}

export default function VocabTopics() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('t');
  const quiz = params.get('mode') === 'quiz';
  const selected = selectedId ? VOCAB_TOPICS.find((t) => t.id === selectedId) ?? null : null;
  const isFav = useFavoriteLookup();
  const lastTopic = useRef<string | null>(null);
  const view = selected && quiz ? 'quiz' : selected ? 'detail' : 'list';

  // Each view opens at the top; the list returns to the topic you opened.
  useEffect(() => {
    if (selected) {
      lastTopic.current = selected.id;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const el = lastTopic.current ? document.getElementById(`vt-${lastTopic.current}`) : null;
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      el.focus({ preventScroll: true });
    }
  }, [view, selected]);

  if (selected && quiz) return <TopicQuiz key={selected.id} topic={selected} />;
  if (selected) return <TopicDetail key={selected.id} topic={selected} />;

  const total = VOCAB_TOPICS.length;
  const wordCount = VOCAB_TOPICS.reduce((n, t) => n + t.words.length, 0);

  return (
    <div className="page-container page-container--wide">
      <PageHeader
        back="/practice"
        icon="🧭"
        title="Slovíčka podle témat"
        subtitle={`${total} ${plural(total, 'maturitní téma', 'maturitní témata', 'maturitních témat')} s klíčovou slovní zásobou a frázemi — celkem ${wordCount} slov. Slovíčka si můžeš poslechnout, uložit do oblíbených a procvičit v rychlém kvízu.`}
      />

      <ul className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
        {VOCAB_TOPICS.map((topic) => {
          const saved = topic.words.filter((w) => isFav(favId(topic.id, w), w.en)).length;
          return (
            <li key={topic.id}>
              <button
                id={`vt-${topic.id}`}
                type="button"
                className="card card-link flex h-full w-full items-center gap-3 !p-4 text-left"
                onClick={() => setParams({ t: topic.id })}
              >
                <span className="tile-icon" aria-hidden="true">{topic.icon}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-fg">{topic.topicCs}</span>
                  <span className="block text-sm text-muted" lang="en">{topic.topic}</span>
                  <span className="mt-1 block text-xs text-subtle">
                    {topic.words.length} slov · {topic.usefulPhrases.length} {plural(topic.usefulPhrases.length, 'fráze', 'fráze', 'frází')}
                    {saved > 0 && <span className="text-danger"> · ♥ {saved}</span>}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-6 text-center text-sm text-muted">
        Hledáš konkrétní slovo? Zkus <Link to="/search">hledání</Link>. Uložená slova najdeš v <Link to="/favorites">oblíbených</Link>.
      </p>
    </div>
  );
}

/* ─── Topic detail ────────────────────────────────────────────────── */

function TopicDetail({ topic }: { topic: TopicVocab }) {
  const { settings } = useSettings();
  const isFav = useFavoriteLookup();
  const [tab, setTab] = useState<'words' | 'phrases'>('words');

  return (
    <div className="page-container">
      <PageHeader
        back="/vocab-topics"
        backLabel="Všechna témata"
        icon={topic.icon}
        title={topic.topicCs}
        subtitle={<span lang="en">{topic.topic}</span>}
      />

      <div className="card g92-card--accent mb-5 flex flex-wrap items-center gap-3 !p-4">
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-fg">Procvičit téma</h2>
          <p className="text-sm text-muted">Rychlý kvíz z {topic.words.length} slovíček tohoto tématu.</p>
        </div>
        <Link to={`/vocab-topics?t=${topic.id}&mode=quiz`} className="btn-primary">
          Spustit kvíz
        </Link>
      </div>

      <div className="mb-4">
        <Segmented
          label="Zobrazit"
          value={tab}
          onChange={setTab}
          options={[
            { value: 'words', label: `Slovíčka (${topic.words.length})` },
            { value: 'phrases', label: `Fráze (${topic.usefulPhrases.length})` },
          ]}
        />
      </div>

      {tab === 'words' && (
        <ul className="card divide-y divide-border !py-1">
          {topic.words.map((w, i) => {
            const id = favId(topic.id, w);
            const fav = isFav(id, w.en);
            return (
              <li key={`${i}-${w.en}`} className="flex items-start gap-3 py-3">
                <SpeakButton onClick={() => void speak(w.en, settings.ttsRate)} label={`Přehrát: ${w.en}`} />
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="break-words">
                    <span className="font-bold text-fg" lang="en">{w.en}</span>
                    <span className="text-subtle"> — </span>
                    <span className="text-fg">{w.cs}</span>
                  </p>
                  <p className="mt-0.5 text-sm text-muted italic" lang="en">{w.example}</p>
                </div>
                <HeartButton
                  active={fav}
                  label={w.en}
                  onClick={() => toggleFavorite({ id, type: 'vocab', text: w.en, translation: w.cs })}
                />
              </li>
            );
          })}
        </ul>
      )}

      {tab === 'phrases' && (
        <ul className="card divide-y divide-border !py-1">
          {topic.usefulPhrases.map((p, i) => (
            <li key={`${i}-${p.en}`} className="flex items-center gap-3 py-3">
              <SpeakButton onClick={() => void speak(p.en, settings.ttsRate)} label={`Přehrát: ${p.en}`} />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-fg" lang="en">{p.en}</p>
                <p className="text-sm text-muted">{p.cs}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ─── Quick quiz on the topic words ───────────────────────────────── */

type Direction = 'en-cs' | 'cs-en' | 'mix';

interface QuizItem {
  word: Word;
  dir: 'en-cs' | 'cs-en';
  options: string[];
  correctIndex: number;
}

function buildRound(topic: TopicVocab, count: number, direction: Direction): QuizItem[] {
  // Distractors come from the topic first; other topics fill in when a topic is small.
  const others = VOCAB_TOPICS.filter((t) => t.id !== topic.id).flatMap((t) => t.words);
  return shuffleArray(topic.words)
    .slice(0, count)
    .map((word, i) => {
      const dir = direction === 'mix' ? (i % 2 === 0 ? 'en-cs' : 'cs-en') : direction;
      const key = (w: Word) => (dir === 'en-cs' ? w.cs : w.en);
      const own = topic.words.filter((w) => w !== word).map(key);
      const pool = own.length >= 3 ? own : [...own, ...others.map(key)];
      const { options, correctIndex } = buildOptions(key(word), pool);
      return { word, dir, options, correctIndex };
    });
}

type Phase = 'setup' | 'drill' | 'result';

function TopicQuiz({ topic }: { topic: TopicVocab }) {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [direction, setDirection] = useState<Direction>('en-cs');
  const [count, setCount] = useState(10);
  const [items, setItems] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const session = useDrillSession('vocab_topics', { tags: [topic.id] });
  const back = `/vocab-topics?t=${topic.id}`;

  const countOptions = [10, 15, 20].filter((n, i) => i === 0 || n <= topic.words.length);

  function start() {
    setItems(buildRound(topic, Math.min(count, topic.words.length), direction));
    setIdx(0);
    setSelected(null);
    setResult(null);
    session.start();
    setPhase('drill');
  }

  const item = items[idx];

  function choose(i: number) {
    if (!item || result !== null) return;
    const correct = i === item.correctIndex;
    setSelected(i);
    setResult(correct);
    const enCs = item.dir === 'en-cs';
    session.answer({
      itemId: `${favId(topic.id, item.word)}:${item.dir}`,
      category: topic.id,
      prompt: enCs ? item.word.en : item.word.cs,
      context: enCs ? 'Vyber český význam.' : 'Vyber anglický překlad.',
      options: item.options,
      kind: 'mcq',
      answer: item.options[item.correctIndex],
      userAnswer: item.options[i],
      explanation: item.word.example,
      correct,
    });
    if (settings.ttsEnabled) void speak(item.word.en, settings.ttsRate);
  }

  async function next() {
    if (idx + 1 >= items.length) {
      await session.finish();
      setPhase('result');
      return;
    }
    setIdx(idx + 1);
    setSelected(null);
    setResult(null);
  }

  useKeyboard(result !== null ? { Enter: () => void next(), ' ': () => void next() } : {}, phase === 'drill');

  if (phase === 'setup') {
    return (
      <DrillSetup
        title={`Kvíz: ${topic.topicCs}`}
        subtitle={`Vyber správný překlad. Slovíčka z tématu ${topic.topic}.`}
        icon={topic.icon}
        back={back}
        poolSize={topic.words.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
        countOptions={countOptions}
      >
        <FilterGroup label="Směr">
          <Chip active={direction === 'en-cs'} onClick={() => setDirection('en-cs')}>Angličtina → čeština</Chip>
          <Chip active={direction === 'cs-en'} onClick={() => setDirection('cs-en')}>Čeština → angličtina</Chip>
          <Chip active={direction === 'mix'} onClick={() => setDirection('mix')}>Mix</Chip>
        </FilterGroup>
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        onRestart={start}
        restartLabel="Nové kolo"
        back={back}
        backLabel="Zpět na téma"
      >
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost btn-sm" onClick={() => setPhase('setup')}>Změnit nastavení</button>
        </div>
      </ResultScreen>
    );
  }

  if (!item) return null;
  const enCs = item.dir === 'en-cs';
  const last = idx + 1 >= items.length;

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={items.length}
        correct={session.correct}
        title={topic.topicCs}
        onExit={() => void session.finish().then(() => setPhase('result'))}
      />

      <div className="card !p-5">
        <p className="mb-1 text-sm font-bold text-muted">{enCs ? 'Co znamená:' : 'Jak se řekne anglicky:'}</p>
        <div className="mb-4 flex items-center gap-3">
          <p className="min-w-0 flex-1 text-2xl font-black break-words text-fg" lang={enCs ? 'en' : 'cs'}>
            {enCs ? item.word.en : item.word.cs}
          </p>
          {enCs && <SpeakButton onClick={() => void speak(item.word.en, settings.ttsRate)} label={`Přehrát: ${item.word.en}`} />}
        </div>

        <OptionList
          options={item.options}
          selected={selected}
          correctIndex={item.correctIndex}
          revealed={result !== null}
          onSelect={choose}
          lang={enCs ? 'cs' : 'en'}
        />

        {result !== null && (
          <Feedback
            correct={result}
            answer={result ? undefined : item.options[item.correctIndex]}
            explanation={
              <>
                {result && (
                  <>
                    <span lang="en" className="font-bold text-fg">{item.word.en}</span> — {item.word.cs}
                    <br />
                  </>
                )}
                <span lang="en" className="italic">{item.word.example}</span>
              </>
            }
          />
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
