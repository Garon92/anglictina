import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useFavorites, type FavoriteItem } from '../favorites';
import { VOCABULARY } from '../data/vocabulary';
import { shuffleArray, uniqueBy } from '../utils';
import { speak, stopSpeaking } from '../tts';
import { useSettings } from '../App';
import { useKeyboard } from '../hooks/useKeyboard';
import { EmptyState, PageHeader, SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

type Phase = 'setup' | 'drill' | 'result';
type Mode = 'en_to_cs' | 'cs_to_en' | 'listen';

interface QuizItem {
  fav: FavoriteItem;
  options: string[];
  correctIndex: number;
}

const MODES: { id: Mode; label: string; desc: string }[] = [
  { id: 'en_to_cs', label: '🇬🇧 → 🇨🇿 Angličtina → čeština', desc: 'Vyber český překlad anglického slova.' },
  { id: 'cs_to_en', label: '🇨🇿 → 🇬🇧 Čeština → angličtina', desc: 'Vyber anglický výraz k českému slovu.' },
  { id: 'listen', label: '🎧 Poslech → čeština', desc: 'Poslechni si slovo a vyber jeho překlad.' },
];

const MIN_FAVS = 4;
const norm = (s: string) => s.trim().toLowerCase();

/** What is shown / asked in a mode. */
const promptOf = (f: { text: string; translation: string }, mode: Mode) => (mode === 'cs_to_en' ? f.translation : f.text);
const answerOf = (f: { text: string; translation: string }, mode: Mode) => (mode === 'cs_to_en' ? f.text : f.translation);

/**
 * Build the quiz once per round: one question per distinct prompt, 4 options unique by text.
 * Distractors come from other favourites first; when there aren't enough, from the vocabulary.
 */
function buildQuiz(favs: FavoriteItem[], mode: Mode, count: number): QuizItem[] {
  const usable = uniqueBy(
    favs.filter((f) => f.text.trim() && f.translation.trim()),
    (f) => norm(promptOf(f, mode)),
  );
  const vocabPool = VOCABULARY.map((w) => ({ text: w.en, translation: w.cs }));
  return shuffleArray(usable)
    .slice(0, count)
    .map((fav) => {
      const correct = answerOf(fav, mode);
      const prompt = norm(promptOf(fav, mode));
      const taken = new Set([norm(correct)]);
      const distractors: string[] = [];
      // A candidate is only a fair distractor if it answers a *different* prompt.
      const add = (cands: { text: string; translation: string }[]) => {
        for (const c of cands) {
          if (distractors.length >= 3) return;
          const a = answerOf(c, mode);
          if (!a.trim() || taken.has(norm(a)) || norm(promptOf(c, mode)) === prompt) continue;
          taken.add(norm(a));
          distractors.push(a);
        }
      };
      add(shuffleArray(favs));
      if (distractors.length < 3) add(shuffleArray(vocabPool).slice(0, 200));
      const options = shuffleArray([correct, ...distractors]);
      return { fav, options, correctIndex: options.indexOf(correct) };
    });
}

export default function FavoritesQuiz() {
  const favs = useFavorites();
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [mode, setMode] = useState<Mode>('en_to_cs');
  const [count, setCount] = useState(20);
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const session = useDrillSession('favorites_quiz', { tags: [mode] });

  const rate = settings.ttsRate || 0.9;
  const item = quiz[idx];

  const distinct = useMemo(() => uniqueBy(favs, (f) => norm(promptOf(f, mode))).length, [favs, mode]);
  const countOptions = useMemo(() => {
    const opts = [10, 20].filter((n) => n < distinct);
    return [...opts, distinct];
  }, [distinct]);
  const effectiveCount = Math.min(count, distinct);

  // Listening mode: read each new word aloud.
  useEffect(() => {
    if (phase === 'drill' && mode === 'listen' && item) void speak(item.fav.text, rate);
  }, [phase, mode, item, rate]);

  useEffect(() => () => stopSpeaking(), []);

  function start() {
    setQuiz(buildQuiz(favs, mode, effectiveCount));
    setIdx(0);
    setSelected(null);
    setResult(null);
    session.start();
    setPhase('drill');
  }

  function submit(opt: number) {
    if (!item || result !== null) return;
    const correct = opt === item.correctIndex;
    setSelected(opt);
    setResult(correct);
    session.answer({
      itemId: `${item.fav.id}:${mode}`,
      category: item.fav.type,
      prompt: mode === 'cs_to_en' ? item.fav.translation : item.fav.text,
      options: item.options,
      kind: 'mcq',
      answer: item.options[item.correctIndex],
      userAnswer: item.options[opt],
      context: mode === 'listen' ? 'Poslech z oblíbených' : undefined,
      correct,
    });
  }

  async function finish() {
    stopSpeaking();
    await session.finish();
    setPhase('result');
  }

  async function next() {
    if (idx + 1 >= quiz.length) await finish();
    else {
      setIdx(idx + 1);
      setSelected(null);
      setResult(null);
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'drill');

  if (phase === 'setup' && favs.length < MIN_FAVS) {
    return (
      <div className="page-container">
        <PageHeader title="Kvíz z oblíbených" icon="💛" subtitle="Procvič si slova, která sis uložil/a." />
        <EmptyState
          icon="⭐"
          title="Zatím málo oblíbených"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/vocab" className="btn-primary no-underline">Jít na slovíčka</Link>
              <Link to="/favorites" className="btn-secondary no-underline">Moje oblíbené</Link>
            </div>
          }
        >
          Pro kvíz potřebuješ alespoň {MIN_FAVS} uložené položky (teď máš {favs.length}). Slova si přidáš hvězdičkou ⭐ u slovíček, idiomů nebo ve{' '}
          <Link to="/search">vyhledávání</Link>.
        </EmptyState>
      </div>
    );
  }

  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Kvíz z oblíbených"
        subtitle={`${favs.length} ${favs.length < 5 ? 'uložené položky' : 'uložených položek'} k procvičení.`}
        icon="💛"
        onStart={start}
        poolSize={distinct}
        count={effectiveCount}
        onCountChange={setCount}
        countOptions={countOptions}
        footer={
          <p className="text-center text-sm text-muted">
            Seznam si upravíš v <Link to="/favorites">Oblíbených</Link>.
          </p>
        }
      >
        <FilterGroup label="Směr" hint={MODES.find((m) => m.id === mode)?.desc}>
          {MODES.map((m) => (
            <Chip key={m.id} active={mode === m.id} onClick={() => setMode(m.id)}>
              {m.label}
            </Chip>
          ))}
        </FilterGroup>
      </DrillSetup>
    );
  }

  if (phase === 'result') {
    return (
      <ResultScreen correct={session.correct} total={session.total} mistakes={session.mistakes} onRestart={start} restartLabel="Nové kolo">
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <button type="button" className="btn-ghost" onClick={() => setPhase('setup')}>
            Změnit směr
          </button>
          <Link to="/favorites" className="btn-ghost no-underline">
            Moje oblíbené
          </Link>
        </div>
      </ResultScreen>
    );
  }

  if (!item) return null;
  const last = idx + 1 >= quiz.length;
  const isListen = mode === 'listen';
  const isCsToEn = mode === 'cs_to_en';

  return (
    <div className="page-container">
      <DrillTopBar
        current={idx}
        total={quiz.length}
        correct={session.correct}
        onExit={() => void finish()}
        title="Kvíz z oblíbených"
        extra={<span className="badge !bg-warning-soft !text-warning">{isListen ? 'Poslech' : isCsToEn ? 'CZ → EN' : 'EN → CZ'}</span>}
      />

      <div className="card !p-5">
        {isListen ? (
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <SpeakButton onClick={() => void speak(item.fav.text, rate)} size="lg" label="Přehrát slovo znovu" />
            <p className="text-sm text-muted">Co znamená slovo, které slyšíš?</p>
            {result !== null && (
              <p className="text-xl font-black break-words text-fg" lang="en">
                {item.fav.text}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="mb-1 text-sm font-bold text-muted">{isCsToEn ? 'Jak se to řekne anglicky?' : 'Co to znamená?'}</p>
            <div className="mb-4 flex items-center gap-3">
              <p className="min-w-0 flex-1 text-2xl font-black break-words text-fg" lang={isCsToEn ? 'cs' : 'en'}>
                {isCsToEn ? item.fav.translation : item.fav.text}
              </p>
              {!isCsToEn && <SpeakButton onClick={() => void speak(item.fav.text, rate)} label={`Přehrát „${item.fav.text}“`} />}
            </div>
          </>
        )}

        <OptionList
          key={`${idx}-${item.fav.id}`}
          options={item.options}
          selected={selected}
          correctIndex={item.correctIndex}
          revealed={result !== null}
          onSelect={submit}
          lang={isCsToEn ? 'en' : 'cs'}
        />

        {result !== null && (
          <Feedback
            correct={result}
            answer={item.options[item.correctIndex]}
            explanation={
              <span>
                <span lang="en" className="font-bold text-fg">
                  {item.fav.text}
                </span>{' '}
                — {item.fav.translation}
              </span>
            }
          />
        )}
        {result !== null && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
