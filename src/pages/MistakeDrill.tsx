import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { recordMistakeReview, CLEAR_AFTER } from '../progress';
import { getAllMistakes, deleteMistakes } from '../db';
import { moduleTitle, moduleIcon } from '../modules';
import { isAnswerCorrect, displayAnswer, isGapAnswerCorrect, isMultiGap, gapVariants } from '../lib/answer';
import { shuffleArray, guessLang } from '../utils';
import type { MistakeItem } from '../types';
import { toast } from '../kit';
import { safeConfirm } from '../lib/confirm';
import { DrillTopBar, Feedback, NextButton, OptionList, ResultScreen, TextAnswer, MultiGapAnswer, countGaps, useDrillSession } from '../components/drill';
import { EmptyState, PageHeader } from '../components/ui';
import { useKeyboard } from '../hooks/useKeyboard';
import { czechPlural } from '../lib/dates';

type Phase = 'overview' | 'drill' | 'result';
const SESSION_SIZE = 15;

export default function MistakeDrill() {
  const [phase, setPhase] = useState<Phase>('overview');
  const [all, setAll] = useState<MistakeItem[] | null>(null);
  const [queue, setQueue] = useState<MistakeItem[]>([]);
  const [idx, setIdx] = useState(0);
  const session = useDrillSession('mistakes');

  const reload = () => getAllMistakes().then(setAll).catch(() => setAll([]));
  useEffect(() => {
    void reload();
  }, []);

  const now = Date.now();
  const active = (all ?? []).filter((m) => !m.resolvedAt);
  const due = active.filter((m) => m.dueAt <= now);
  const resolved = (all ?? []).filter((m) => m.resolvedAt);

  async function start(onlyDue = true) {
    const pool = onlyDue ? due : active;
    const picked = shuffleArray(pool.length ? pool : active).slice(0, SESSION_SIZE);
    if (!picked.length) return;
    // Shuffle MCQ options again so the position isn't memorised.
    setQueue(picked.map((m) => (m.kind === 'mcq' && m.options ? { ...m, options: shuffleArray(m.options) } : m)));
    setIdx(0);
    session.start();
    setPhase('drill');
  }

  async function finish() {
    await session.finish();
    setPhase('result');
    void reload();
  }

  if (all === null) return <div className="page-container"><div className="skeleton h-40 w-full" /></div>;

  if (phase === 'result') {
    return (
      <ResultScreen
        correct={session.correct}
        total={session.total}
        mistakes={session.mistakes}
        back="/"
        backLabel="Zpět na dnešní plán"
        onRestart={due.length || active.length ? () => void start(due.length > 0) : undefined}
        restartLabel="Další kolo"
        title="Kolo oprav hotovo"
        hideMistakesLink
      >
        <p className="mt-3 text-center text-sm text-muted">
          Chyba zmizí z fronty, když ji {CLEAR_AFTER}× po sobě odpovíš správně (mezi pokusy je den pauza).
        </p>
      </ResultScreen>
    );
  }

  if (phase === 'drill') {
    const item = queue[idx];
    return (
      <div className="page-container">
        <DrillTopBar current={idx} total={queue.length} correct={session.correct} onExit={() => void finish()} title="Oprava chyb" />
        <MistakeCard
          key={item.key + idx}
          item={item}
          onAnswered={(correct, userAnswer) => {
            session.answer({ prompt: item.prompt, answer: item.answer, userAnswer, correct, explanation: item.explanation, noTrack: true });
            void recordMistakeReview(item.key, correct, userAnswer);
          }}
          onNext={() => (idx + 1 >= queue.length ? void finish() : setIdx(idx + 1))}
          last={idx + 1 >= queue.length}
        />
      </div>
    );
  }

  // Overview
  const byModule = new Map<string, MistakeItem[]>();
  for (const m of active) byModule.set(m.module, [...(byModule.get(m.module) ?? []), m]);

  return (
    <div className="page-container">
      <PageHeader
        title="Opakování chyb"
        subtitle="Úlohy, ve kterých ses spletl/a, se sem ukládají a vracejí, dokud je dvakrát po sobě nezvládneš."
        back="/"
        icon="🔁"
      />

      {active.length === 0 ? (
        <EmptyState
          icon={resolved.length ? '🏆' : '🌱'}
          title={resolved.length ? 'Všechny chyby opraveny!' : 'Zatím tu nic není'}
          action={<Link to="/practice" className="btn-primary">Jít procvičovat</Link>}
        >
          {resolved.length
            ? `Už jsi opravil/a ${resolved.length} ${czechPlural(resolved.length, 'chybu', 'chyby', 'chyb')}. Nové chyby se tu objeví samy.`
            : 'Jakmile v nějakém cvičení odpovíš špatně, úloha se sem uloží k opakování.'}
        </EmptyState>
      ) : (
        <>
          <div className="card g92-card--accent mb-5 !p-5">
            <div className="flex flex-wrap items-center gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-3xl font-black tabular-nums text-fg">{due.length}</div>
                <div className="text-sm text-muted">
                  {czechPlural(due.length, 'chyba čeká', 'chyby čekají', 'chyb čeká')} na opakování
                  {active.length > due.length && ` · ${active.length - due.length} naplánováno na další dny`}
                  {resolved.length > 0 && ` · ${resolved.length} opraveno`}
                </div>
              </div>
              {due.length > 0 ? (
                <button type="button" className="btn-primary btn-lg" onClick={() => void start(true)}>
                  Opakovat {Math.min(SESSION_SIZE, due.length)}
                </button>
              ) : (
                <button type="button" className="btn-secondary" onClick={() => void start(false)}>
                  Procvičit i naplánované
                </button>
              )}
            </div>
          </div>

          <h2 className="section-title">Podle oblastí</h2>
          <ul className="space-y-2">
            {[...byModule.entries()]
              .sort((a, b) => b[1].length - a[1].length)
              .map(([mod, items]) => (
                <li key={mod}>
                  <details className="card !p-0">
                    <summary className="flex cursor-pointer list-none items-center gap-3 p-3">
                      <span className="tile-icon" aria-hidden="true">{moduleIcon(mod)}</span>
                      <span className="flex-1 font-bold text-fg">{moduleTitle(mod)}</span>
                      <span className="badge">{items.length}</span>
                    </summary>
                    <ul className="divide-y divide-border border-t border-border">
                      {items.slice(0, 50).map((m) => (
                        <li key={m.key} className="flex items-start gap-3 px-3 py-2 text-sm">
                          <div className="min-w-0 flex-1">
                            <div className="text-fg" lang="en">{m.prompt}</div>
                            <div className="text-xs">
                              <span className="font-bold text-success" lang="en">{displayAnswer(m.answer)}</span>
                              {m.wrongCount > 1 && <span className="ml-2 text-muted">{m.wrongCount}× chybně</span>}
                            </div>
                          </div>
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            aria-label="Odebrat z opakování"
                            title="Odebrat z opakování"
                            onClick={async () => {
                              await deleteMistakes([m.key]);
                              toast('Odebráno z opakování');
                              void reload();
                            }}
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                </li>
              ))}
          </ul>

          <div className="mt-6 text-center">
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={async () => {
                const ok = await safeConfirm({
                  title: 'Vymazat všechny chyby?',
                  message: 'Seznam chyb k opakování se smaže. Statistiky cvičení zůstanou.',
                  confirmLabel: 'Vymazat',
                  danger: true,
                });
                if (ok) {
                  await deleteMistakes((all ?? []).map((m) => m.key));
                  void reload();
                }
              }}
            >
              Vymazat seznam chyb
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MistakeCard({
  item,
  onAnswered,
  onNext,
  last,
}: {
  item: MistakeItem;
  onAnswered: (correct: boolean, userAnswer: string) => void;
  onNext: () => void;
  last: boolean;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [gaps, setGaps] = useState<string[]>([]);
  // Several gaps in the prompt and a matching "x ... y" answer → one input per gap (as in the drill).
  const gapCount = (() => {
    if (item.kind !== 'text' || !isMultiGap(item.answer)) return 1;
    const parts = gapVariants(item.answer)[0]?.length ?? 1;
    return countGaps(item.prompt) === parts ? parts : 1;
  })();
  const [result, setResult] = useState<boolean | null>(null);
  const [revealed, setRevealed] = useState(false);

  const correctIndex = item.options ? item.options.findIndex((o) => o === item.answer) : -1;
  const mcq = item.kind === 'mcq' && item.options && correctIndex >= 0;

  function submit(correct: boolean, user: string) {
    if (result !== null) return;
    setResult(correct);
    onAnswered(correct, user);
  }

  useKeyboard(
    item.kind === 'reveal' && !revealed ? { ' ': () => setRevealed(true), Enter: () => setRevealed(true) } : {},
    item.kind === 'reveal' && result === null,
  );

  return (
    <div className="card !p-5">
      <div className="mb-2 flex items-center gap-2 text-xs font-bold text-muted">
        <span aria-hidden="true">{moduleIcon(item.module)}</span> {moduleTitle(item.module)}
        {item.wrongCount > 1 && <span className="badge !bg-warning-soft !text-warning">{item.wrongCount}× chybně</span>}
      </div>
      <p className="mb-4 text-lg font-bold text-fg" lang={guessLang(item.prompt)}>{item.prompt}</p>
      {item.context && <p className="-mt-2 mb-4 text-sm text-muted">{item.context}</p>}

      {mcq ? (
        <OptionList
          options={item.options!}
          selected={selected}
          correctIndex={correctIndex}
          revealed={result !== null}
          lang={guessLang(item.options!.join(' '))}
          onSelect={(i) => {
            setSelected(i);
            submit(i === correctIndex, item.options![i]);
          }}
        />
      ) : item.kind === 'text' && gapCount > 1 ? (
        <>
          <p className="-mt-2 mb-3 text-xs text-muted">Doplň všechna slova v pořadí mezer.</p>
          <MultiGapAnswer
            count={gapCount}
            values={gaps}
            onChange={setGaps}
            onSubmit={() => submit(isGapAnswerCorrect(gaps, item.answer), gaps.join(' … '))}
            disabled={result !== null}
            status={result === null ? null : result ? 'correct' : 'wrong'}
          />
          {result === null && (
            <button type="button" className="btn-primary btn-lg mt-3" disabled={gaps.filter((g) => g?.trim()).length < gapCount} onClick={() => submit(isGapAnswerCorrect(gaps, item.answer), gaps.join(' … '))}>
              Ověřit
            </button>
          )}
        </>
      ) : item.kind === 'text' ? (
        <div className="flex gap-2">
          <div className="flex-1">
            <TextAnswer
              value={text}
              onChange={setText}
              onSubmit={() => submit(isAnswerCorrect(text, item.answer, item.accept), text.trim())}
              disabled={result !== null}
              status={result === null ? null : result ? 'correct' : 'wrong'}
            />
          </div>
          {result === null && (
            <button type="button" className="btn-primary" disabled={!text.trim()} onClick={() => submit(isAnswerCorrect(text, item.answer, item.accept), text.trim())}>
              Ověřit
            </button>
          )}
        </div>
      ) : !revealed ? (
        <button type="button" className="btn-secondary btn-lg w-full" onClick={() => setRevealed(true)}>
          Zobrazit správnou odpověď
        </button>
      ) : (
        <div>
          <div className="feedback feedback--info">
            <div className="text-sm text-muted">Správně je:</div>
            <div className="text-lg font-black text-fg" lang="en">{displayAnswer(item.answer)}</div>
            {item.lastWrong && <div className="mt-1 text-sm text-muted">Minule jsi odpověděl/a: <span className="line-through">{item.lastWrong}</span></div>}
          </div>
          {result === null && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" className="btn-secondary btn-lg" onClick={() => submit(false, '')}>Nevěděl/a jsem</button>
              <button type="button" className="btn-primary btn-lg" onClick={() => submit(true, item.answer)}>Věděl/a jsem ✓</button>
            </div>
          )}
        </div>
      )}

      {result !== null && item.kind !== 'reveal' && (
        <Feedback correct={result} answer={item.answer} explanation={item.explanation} />
      )}
      {result !== null && item.kind === 'reveal' && item.explanation && <p className="mt-3 text-sm text-muted">{item.explanation}</p>}
      {result !== null && <NextButton onClick={onNext} last={last} />}
    </div>
  );
}
