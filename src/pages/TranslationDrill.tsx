import { useEffect, useMemo, useRef, useState } from 'react';
import { TRANSLATION_EXERCISES, GRAMMAR_FOCUS_LABELS } from '../data/translations';
import type { TranslationExercise } from '../data/translations';
import { shuffleArray } from '../utils';
import { isAnswerCorrect, canonicalForms } from '../lib/answer';
import { useKeyboard } from '../hooks/useKeyboard';
import { speak, stopSpeaking } from '../tts';
import { useSettings } from '../App';
import {
  useDrillSession, DrillSetup, FilterGroup, Chip, DrillTopBar, TextAnswer, Feedback, NextButton, ResultScreen,
} from '../components/drill';
import { SpeakButton } from '../components/ui';

type Phase = 'setup' | 'drill' | 'result';
type MatchType = 'exact' | 'alternative' | 'partial' | 'wrong';

const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
const GRAMMAR_KEYS = Object.keys(GRAMMAR_FOCUS_LABELS);

/** Ignore "next" for a moment after answering, so a double Enter doesn't skip the feedback. */
const NEXT_GUARD_MS = 350;
const now = () => Date.now();

/** Lower-case words only (contractions expanded), padded with spaces for whole-word search. */
function wordForms(s: string): string[] {
  return canonicalForms(s).map((f) => ` ${f.replace(/[^\p{L}\p{N}' ]+/gu, ' ').replace(/\s+/g, ' ').trim()} `);
}

/** Does the answer contain every keyword as a whole word / phrase ("go" does not match "ago")? */
function hasAllKeywords(user: string, keyWords: string[]): boolean {
  if (!keyWords.length) return false;
  const forms = wordForms(user);
  return keyWords.every((k) => {
    const key = wordForms(k)[0];
    return key.trim() !== '' && forms.some((f) => f.includes(key));
  });
}

function checkAnswer(user: string, ex: TranslationExercise): MatchType {
  if (isAnswerCorrect(user, ex.english)) return 'exact';
  if (isAnswerCorrect(user, ex.english, ex.alternatives)) return 'alternative';
  if (hasAllKeywords(user, ex.keyWords)) return 'partial';
  return 'wrong';
}

export default function TranslationDrill() {
  const { settings } = useSettings();
  const [phase, setPhase] = useState<Phase>('setup');
  const [foci, setFoci] = useState<string[]>([]);
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('all');
  const [count, setCount] = useState(15);

  const [items, setItems] = useState<TranslationExercise[]>([]);
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState('');
  const [match, setMatch] = useState<MatchType | null>(null);
  const [hintVisible, setHintVisible] = useState(false);
  const [overridden, setOverridden] = useState(false);
  const answeredRef = useRef(-1);
  const answeredAt = useRef(0);

  const session = useDrillSession('translation', { tags: foci.length ? foci : ['all'] });

  const pool = useMemo(
    () => TRANSLATION_EXERCISES.filter((e) => (!foci.length || foci.includes(e.grammarFocus)) && (level === 'all' || e.level === level)),
    [foci, level],
  );

  useEffect(() => () => stopSpeaking(), []);

  const ex = phase === 'drill' ? items[idx] : undefined;
  const answered = match !== null;
  const correct = match === 'exact' || match === 'alternative';

  function resetItem() {
    setText('');
    setMatch(null);
    setHintVisible(false);
    setOverridden(false);
    answeredRef.current = -1;
  }

  function start() {
    const picked = shuffleArray(pool).slice(0, count);
    if (!picked.length) return;
    setItems(picked);
    setIdx(0);
    resetItem();
    session.start();
    setPhase('drill');
  }

  function submit() {
    if (!ex || match !== null || answeredRef.current === idx) return;
    const user = text.trim();
    if (!user) return;
    answeredRef.current = idx;
    answeredAt.current = now();
    const m = checkAnswer(user, ex);
    setMatch(m);
    session.answer({
      itemId: ex.id,
      category: ex.grammarFocus,
      prompt: ex.czech,
      kind: 'text',
      answer: ex.english,
      accept: ex.alternatives,
      userAnswer: user,
      explanation: ex.hint,
      correct: m === 'exact' || m === 'alternative',
    });
  }

  async function finishNow() {
    await session.finish();
    setPhase('result');
  }

  async function next() {
    if (now() - answeredAt.current < NEXT_GUARD_MS) return;
    if (idx + 1 >= items.length) {
      await finishNow();
    } else {
      setIdx(idx + 1);
      resetItem();
    }
  }

  useKeyboard(answered ? { Enter: () => void next() } : {}, phase === 'drill');

  /* ── Setup ── */
  if (phase === 'setup') {
    return (
      <DrillSetup
        title="Překlad vět"
        subtitle="Překládej české věty do angličtiny. Uznáme i běžné varianty a stažené tvary (don't = do not)."
        icon="🔤"
        poolSize={pool.length}
        onStart={start}
        count={count}
        onCountChange={setCount}
      >
        <FilterGroup label="Úroveň">
          {LEVELS.map((l) => (
            <Chip key={l} active={level === l} onClick={() => setLevel(l)}>{l === 'all' ? 'Vše' : l}</Chip>
          ))}
        </FilterGroup>
        <FilterGroup label={`Gramatika${foci.length ? ` (${foci.length})` : ' (vše)'}`}>
          {GRAMMAR_KEYS.map((k) => (
            <Chip key={k} active={foci.includes(k)} onClick={() => setFoci((p) => (p.includes(k) ? p.filter((x) => x !== k) : [...p, k]))}>
              {GRAMMAR_FOCUS_LABELS[k]}
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

  /* ── Drill ── */
  if (!ex) return null;
  const last = idx + 1 >= items.length;
  const shownOk = correct || overridden;
  const title = overridden
    ? 'Uznáno'
    : match === 'alternative'
      ? 'Správně! (jiný možný překlad)'
      : match === 'partial'
        ? 'Skoro!'
        : undefined;
  // Show the other accepted translations (without the one the learner already wrote).
  const alsoList = shownOk ? [ex.english, ...ex.alternatives].filter((a) => !isAnswerCorrect(text, a)) : ex.alternatives;

  return (
    <div className="page-container">
      <DrillTopBar current={idx} total={items.length} correct={session.correct} onExit={() => void finishNow()} title="Překlad vět" />

      <div className="card !p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="badge">{GRAMMAR_FOCUS_LABELS[ex.grammarFocus] || ex.grammarFocus}</span>
          <span className="badge !bg-accent-soft !text-accent-text">{ex.level}</span>
        </div>
        <p className="mb-1 text-sm font-bold text-muted">Přelož do angličtiny:</p>
        <p className="mb-4 text-xl leading-relaxed font-bold text-fg" lang="cs">{ex.czech}</p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1">
            <TextAnswer
              value={text}
              onChange={setText}
              onSubmit={submit}
              disabled={answered}
              status={!answered ? null : shownOk ? 'correct' : 'wrong'}
              placeholder="Napiš anglickou větu…"
              label="Anglický překlad"
              multiline
            />
          </div>
          {!answered && (
            <button type="button" className="btn-primary btn-lg" disabled={!text.trim()} onClick={submit}>Ověřit</button>
          )}
        </div>

        {!answered && ex.hint && (
          hintVisible ? (
            <div className="feedback feedback--info mt-3 text-sm text-fg" role="note">💡 {ex.hint}</div>
          ) : (
            <button type="button" className="btn-ghost btn-sm mt-2 !px-2" onClick={() => setHintVisible(true)}>
              💡 Nápověda
            </button>
          )
        )}

        {answered && (
          <Feedback
            correct={shownOk}
            answer={ex.english}
            userAnswer={text.trim()}
            title={title}
            explanation={
              <>
                {match === 'partial' && !overridden && (
                  <span className="mb-1 block">Klíčová slova máš, ale věta není úplně přesná — porovnej ji se správným překladem.</span>
                )}
                {alsoList.length > 0 && (
                  <span className="block">
                    {shownOk ? 'Můžeš říct i: ' : 'Také správně: '}
                    {alsoList.slice(0, 2).map((a, i) => (
                      <span key={a} lang="en">{i > 0 ? ' · ' : ''}{a}</span>
                    ))}
                  </span>
                )}
                {alsoList.length > 2 && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-xs font-bold text-accent-text">Další varianty ({alsoList.length - 2})</summary>
                    <ul className="mt-1 list-disc space-y-0.5 pl-5">
                      {alsoList.slice(2).map((a) => (
                        <li key={a} lang="en">{a}</li>
                      ))}
                    </ul>
                  </details>
                )}
                {ex.hint && <span className="mt-1 block">💡 {ex.hint}</span>}
              </>
            }
          >
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <SpeakButton size="sm" onClick={() => void speak(ex.english, settings.ttsRate)} label="Přehrát správný překlad" />
              {!correct && !overridden && (
                <button
                  type="button"
                  className="btn-ghost btn-sm !px-2"
                  onClick={() => {
                    setOverridden(true);
                    session.markLastCorrect();
                  }}
                >
                  Moje odpověď je taky správně
                </button>
              )}
            </div>
          </Feedback>
        )}
        {answered && <NextButton onClick={() => void next()} last={last} />}
      </div>
    </div>
  );
}
