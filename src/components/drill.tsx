/**
 * Shared building blocks for all practice drills, so every drill looks and behaves the same:
 *   useDrillSession  — counting, mistakes, idempotent saving of the session
 *   DrillSetup       — start screen with filters and a "Začít" button
 *   DrillTopBar      — progress + counter + exit
 *   OptionList       — multiple-choice answers with 1–4 keyboard shortcuts
 *   TextAnswer       — typed answer input (Enter submits)
 *   Feedback         — correct / wrong box with explanation
 *   NextButton       — autofocused "Další" (Enter)
 *   ResultScreen     — stars, score, list of mistakes, restart
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { recordAnswer, recordSession, forgiveMistake, type AnswerInput } from '../progress';
import { playComplete, playCorrect, playIncorrect } from '../sounds';
import { useKeyboard } from '../hooks/useKeyboard';
import { confirmDialog } from '../kit';
import { displayAnswer } from '../lib/answer';
import { PageHeader, ProgressBar, Stars, starsFor } from './ui';

/* ─── Session hook ────────────────────────────────────────────────── */

export interface AnswerRecord {
  itemId?: string;
  prompt: string;
  answer: string;
  userAnswer?: string;
  correct: boolean;
  explanation?: string;
}

export interface DrillSession {
  total: number;
  correct: number;
  answers: AnswerRecord[];
  mistakes: AnswerRecord[];
  finished: boolean;
  /** Reset counters and start the clock. */
  start: () => void;
  /**
   * Register one answer: plays a sound, updates counters, remembers mistakes for the
   * mistakes queue. Returns `correct` for convenience.
   */
  answer: (a: Omit<AnswerInput, 'module'> & { silent?: boolean; noTrack?: boolean }) => boolean;
  /** Save the session once (idempotent). Returns the correct ratio. */
  finish: () => Promise<number>;
  /** The learner claims the last automatically-rejected answer was right (e.g. free translation). */
  markLastCorrect: () => void;
}

export function useDrillSession(module: string, opts: { type?: string; tags?: string[] } = {}): DrillSession {
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const finishing = useRef(false);
  const answersRef = useRef<AnswerRecord[]>([]);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const start = useCallback(() => {
    startedAt.current = Date.now();
    finishing.current = false;
    answersRef.current = [];
    setAnswers([]);
    setFinished(false);
  }, []);

  const answer = useCallback<DrillSession['answer']>((a) => {
    const rec: AnswerRecord = {
      itemId: a.itemId,
      prompt: a.prompt,
      answer: a.answer,
      userAnswer: a.userAnswer,
      correct: a.correct,
      explanation: a.explanation,
    };
    answersRef.current = [...answersRef.current, rec];
    setAnswers(answersRef.current);
    if (!a.silent) {
      if (a.correct) playCorrect();
      else playIncorrect();
    }
    const { silent: _silent, noTrack, ...input } = a;
    if (!noTrack) void recordAnswer({ ...input, module });
    return a.correct;
  }, [module]);

  const finish = useCallback(async () => {
    const list = answersRef.current;
    const correct = list.filter((x) => x.correct).length;
    const ratio = list.length ? correct / list.length : 0;
    if (finishing.current) return ratio;
    finishing.current = true;
    setFinished(true);
    if (list.length > 0) {
      playComplete(ratio);
      try {
        await recordSession({
          module,
          type: optsRef.current.type,
          startedAt: startedAt.current,
          total: list.length,
          correct,
          tags: optsRef.current.tags,
        });
      } catch (e) {
        console.warn('recordSession failed', e);
      }
    }
    return ratio;
  }, [module]);

  const markLastCorrect = useCallback(() => {
    const list = answersRef.current;
    const last = list[list.length - 1];
    if (!last || last.correct) return;
    answersRef.current = [...list.slice(0, -1), { ...last, correct: true }];
    setAnswers(answersRef.current);
    void forgiveMistake(module, last.itemId ?? last.prompt);
  }, [module]);

  const correct = answers.filter((x) => x.correct).length;
  return {
    markLastCorrect,
    total: answers.length,
    correct,
    answers,
    mistakes: answers.filter((x) => !x.correct),
    finished,
    start,
    answer,
    finish,
  };
}

/* ─── Setup screen ────────────────────────────────────────────────── */

export function DrillSetup({
  title,
  subtitle,
  icon,
  back = '/practice',
  poolSize,
  onStart,
  startLabel = 'Začít',
  children,
  footer,
  count,
  onCountChange,
  countOptions = [10, 15, 20],
}: {
  title: string;
  subtitle?: ReactNode;
  icon?: string;
  back?: string;
  /** Number of available items after filters (0 disables the start button). */
  poolSize?: number;
  onStart: () => void;
  startLabel?: string;
  children?: ReactNode;
  footer?: ReactNode;
  count?: number;
  onCountChange?: (n: number) => void;
  countOptions?: number[];
}) {
  const empty = poolSize !== undefined && poolSize === 0;
  return (
    <div className="page-container">
      <PageHeader title={title} subtitle={subtitle} icon={icon} back={back} />
      <div className="card space-y-5 !p-5">
        {children}
        {onCountChange && count !== undefined && (
          <FilterGroup label="Počet úloh">
            {countOptions.map((n) => (
              <button key={n} type="button" className="g92-chip" aria-pressed={count === n} onClick={() => onCountChange(n)}>
                {n}
              </button>
            ))}
          </FilterGroup>
        )}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button type="button" className="btn-primary btn-lg min-w-[10rem]" onClick={onStart} disabled={empty}>
            {startLabel}
          </button>
          {poolSize !== undefined && (
            <span className="text-sm text-muted">
              {empty ? 'Pro tento výběr nejsou žádné úlohy — uprav filtry.' : `K dispozici ${poolSize} ${poolSize === 1 ? 'úloha' : poolSize < 5 ? 'úlohy' : 'úloh'}`}
            </span>
          )}
        </div>
      </div>
      {footer && <div className="mt-5">{footer}</div>}
    </div>
  );
}

export function FilterGroup({ label, children, hint }: { label: string; children: ReactNode; hint?: ReactNode }) {
  return (
    <fieldset>
      <legend className="eyebrow mb-2">{label}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
      {hint && <p className="mt-2 text-xs text-muted">{hint}</p>}
    </fieldset>
  );
}

export function Chip({ active, onClick, children, title, className = '' }: { active: boolean; onClick: () => void; children: ReactNode; title?: string; className?: string }) {
  return (
    <button type="button" className={`g92-chip ${className}`} aria-pressed={active} onClick={onClick} title={title}>
      {children}
    </button>
  );
}

/* ─── Top bar during a drill ──────────────────────────────────────── */

export function DrillTopBar({
  current,
  total,
  correct,
  onExit,
  title,
  extra,
}: {
  /** 0-based index of the current item */
  current: number;
  total: number;
  correct?: number;
  /** Called after the user confirms leaving (only asked when something was answered). */
  onExit: () => void;
  title?: string;
  extra?: ReactNode;
}) {
  const askExit = async () => {
    if (current === 0) return onExit();
    const ok = await confirmDialog({
      title: 'Ukončit cvičení?',
      message: 'Dosavadní odpovědi se uloží a uvidíš výsledek.',
      confirmLabel: 'Ukončit',
      cancelLabel: 'Pokračovat',
    });
    if (ok) onExit();
  };
  return (
    <div className="mb-5">
      <div className="mb-2 flex items-center gap-2">
        <button type="button" className="btn-ghost btn-sm -ml-2" onClick={askExit} aria-label="Ukončit cvičení">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
          <span className="hidden sm:inline">Ukončit</span>
        </button>
        {title && <span className="min-w-0 flex-1 truncate text-sm font-bold text-muted">{title}</span>}
        {!title && <span className="flex-1" />}
        {extra}
        {correct !== undefined && (
          <span className="badge !bg-success-soft !text-success" title="Správně">
            ✓ {correct}
          </span>
        )}
        <span className="text-sm font-bold tabular-nums text-muted" aria-live="polite">
          {Math.min(current + 1, total)} / {total}
        </span>
      </div>
      <ProgressBar value={current} max={total} label="Průběh cvičení" />
    </div>
  );
}

/* ─── Multiple choice ─────────────────────────────────────────────── */

export function OptionList({
  options,
  selected,
  correctIndex,
  revealed,
  onSelect,
  keys = true,
  lang = 'en',
  columns = 1,
}: {
  options: string[];
  selected: number | null;
  /** Index of the correct option (used when revealed). */
  correctIndex: number;
  revealed: boolean;
  onSelect: (i: number) => void;
  keys?: boolean;
  lang?: string;
  columns?: 1 | 2;
}) {
  const map: Record<string, () => void> = {};
  if (!revealed && keys) {
    options.forEach((_, i) => {
      map[String(i + 1)] = () => onSelect(i);
      // Letters match the A–D badges (as in the maturita answer sheet).
      map[String.fromCharCode(97 + i)] = () => onSelect(i);
    });
  }
  useKeyboard(map, !revealed && keys);
  return (
    <div className={`grid gap-2 ${columns === 2 ? 'sm:grid-cols-2' : ''}`} role="group" aria-label="Možnosti odpovědi">
      {options.map((opt, i) => {
        let cls = 'opt';
        if (revealed) {
          if (i === correctIndex) cls += ' is-correct';
          else if (i === selected) cls += ' is-wrong';
          else cls += ' is-dim';
        } else if (i === selected) cls += ' is-selected';
        return (
          <button key={`${i}-${opt}`} type="button" className={cls} onClick={() => onSelect(i)} disabled={revealed} lang={lang}>
            <span className="opt__key" aria-hidden="true">{String.fromCharCode(65 + i)}</span>
            <span className="flex-1">{opt}</span>
            {revealed && i === correctIndex && <span aria-label="správná odpověď">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

/* ─── Typed answer ────────────────────────────────────────────────── */

export function TextAnswer({
  value,
  onChange,
  onSubmit,
  disabled,
  status,
  placeholder = 'Napiš odpověď…',
  label = 'Tvoje odpověď',
  autoFocus = true,
  multiline = false,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  status?: 'correct' | 'wrong' | null;
  placeholder?: string;
  label?: string;
  autoFocus?: boolean;
  multiline?: boolean;
}) {
  const ref = useRef<HTMLInputElement & HTMLTextAreaElement>(null);
  useEffect(() => {
    if (autoFocus && !disabled) ref.current?.focus({ preventScroll: true });
  }, [autoFocus, disabled]);
  const cls = `input text-lg ${status === 'correct' ? '!border-success !bg-success-soft' : status === 'wrong' ? '!border-danger !bg-danger-soft' : ''}`;
  const common = {
    ref,
    value,
    disabled,
    placeholder,
    'aria-label': label,
    autoCapitalize: 'off',
    autoCorrect: 'off',
    autoComplete: 'off',
    spellCheck: false,
    lang: 'en',
    className: cls,
  } as const;
  return multiline ? (
    <textarea
      {...common}
      rows={3}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey && !e.repeat) {
          e.preventDefault();
          if (value.trim() && !disabled) onSubmit();
        }
      }}
    />
  ) : (
    <input
      {...common}
      type="text"
      enterKeyHint="done"
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.repeat) {
          e.preventDefault();
          if (value.trim() && !disabled) onSubmit();
        }
      }}
    />
  );
}

/* ─── Several gaps in one sentence ─────────────────────────────────── */

/** Count "___" gaps in a prompt. */
export function countGaps(prompt: string): number {
  return (prompt.match(/_{3,}/g) ?? []).length;
}

/**
 * One input per gap for prompts like "She ___ (not/go) … she ___ (be) ill".
 * `values` has one entry per gap; Enter in the last field submits.
 */
export function MultiGapAnswer({
  count,
  values,
  onChange,
  onSubmit,
  disabled,
  status,
}: {
  count: number;
  values: string[];
  onChange: (v: string[]) => void;
  onSubmit: () => void;
  disabled?: boolean;
  status?: 'correct' | 'wrong' | null;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  useEffect(() => {
    if (!disabled) refs.current[0]?.focus({ preventScroll: true });
  }, [disabled]);
  const cls = `input text-lg ${status === 'correct' ? '!border-success !bg-success-soft' : status === 'wrong' ? '!border-danger !bg-danger-soft' : ''}`;
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <label key={i} className="flex items-center gap-2">
          <span className="exam-task-no" aria-hidden="true">{i + 1}</span>
          <input
            ref={(el) => {
              refs.current[i] = el;
            }}
            className={cls}
            value={values[i] ?? ''}
            disabled={disabled}
            aria-label={`Mezera ${i + 1}`}
            autoCapitalize="off"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            lang="en"
            enterKeyHint={i === count - 1 ? 'done' : 'next'}
            onChange={(e) => {
              const next = [...values];
              next[i] = e.target.value;
              onChange(next);
            }}
            onKeyDown={(e) => {
              if (e.key !== 'Enter' || e.repeat) return;
              e.preventDefault();
              if (i < count - 1) refs.current[i + 1]?.focus();
              else if (values.slice(0, count).every((v) => v?.trim()) && !disabled) onSubmit();
            }}
          />
        </label>
      ))}
    </div>
  );
}

/* ─── Feedback ────────────────────────────────────────────────────── */

export function Feedback({
  correct,
  answer,
  userAnswer,
  explanation,
  children,
  title,
}: {
  correct: boolean;
  /** Correct answer to show when wrong ("a|b" alternatives are displayed nicely). */
  answer?: string;
  userAnswer?: string;
  explanation?: ReactNode;
  children?: ReactNode;
  title?: string;
}) {
  return (
    <div className={`feedback mt-4 ${correct ? 'feedback--ok' : 'feedback--bad'}`} role="status" aria-live="polite">
      <div className={`font-black ${correct ? 'text-success' : 'text-danger'}`}>
        {title ?? (correct ? pickPraise() : 'Tentokrát ne')}
      </div>
      {!correct && answer && (
        <div className="mt-1 text-sm text-fg">
          Správně: <strong lang="en">{displayAnswer(answer)}</strong>
          {userAnswer ? <span className="text-muted"> (tvoje odpověď: <span lang="en">{userAnswer}</span>)</span> : null}
        </div>
      )}
      {explanation && <div className="mt-1.5 text-sm leading-relaxed text-muted">{explanation}</div>}
      {children}
    </div>
  );
}

const PRAISE = ['Správně!', 'Výborně!', 'Přesně tak!', 'Super!', 'Skvěle!'];
let praiseIdx = 0;
function pickPraise() {
  praiseIdx = (praiseIdx + 1) % PRAISE.length;
  return PRAISE[praiseIdx];
}

/* ─── Next button ─────────────────────────────────────────────────── */

export function NextButton({ onClick, last = false, label }: { onClick: () => void; last?: boolean; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    // Focus so that Enter/Space continue, without scrolling the page.
    const t = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 30);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <button ref={ref} type="button" className="btn-primary btn-lg mt-4 w-full sm:w-auto" onClick={onClick}>
      {label ?? (last ? 'Zobrazit výsledek' : 'Další')}
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}

/* ─── Results ─────────────────────────────────────────────────────── */

export function resultMessage(ratio: number): string {
  if (ratio >= 0.95) return 'Bezchybně! Tohle už máš v malíčku.';
  if (ratio >= 0.8) return 'Výborná práce, jen tak dál!';
  if (ratio >= 0.6) return 'Dobrá práce. Chyby si projdi a zkus to znovu.';
  if (ratio >= 0.4) return 'Pěkný základ. Opakování dělá mistra.';
  return 'Nevadí — každá chyba je krok k lepšímu. Projdi si vysvětlení.';
}

export function ResultScreen({
  correct,
  total,
  mistakes = [],
  onRestart,
  restartLabel = 'Znovu',
  back = '/practice',
  backLabel = 'Zpět na přehled',
  title,
  children,
}: {
  correct: number;
  total: number;
  mistakes?: AnswerRecord[];
  onRestart?: () => void;
  restartLabel?: string;
  back?: string;
  backLabel?: string;
  title?: string;
  children?: ReactNode;
}) {
  const navigate = useNavigate();
  const ratio = total > 0 ? correct / total : 0;
  const stars = starsFor(ratio);
  const pct = Math.round(ratio * 100);
  return (
    <div className="page-container">
      <div className="card g92-card--accent !p-6 text-center">
        <Stars count={stars} size="lg" animate />
        <h1 className="mt-3 text-2xl font-black text-fg">{title ?? (total === 0 ? 'Cvičení ukončeno' : 'Hotovo!')}</h1>
        {total > 0 ? (
          <>
            <p className="mt-1 text-4xl font-black tabular-nums text-accent-text">
              {correct}<span className="text-2xl text-muted"> / {total}</span>
            </p>
            <p className="text-sm text-muted">{pct} % správně</p>
            <p className="mx-auto mt-3 max-w-sm text-fg">{resultMessage(ratio)}</p>
          </>
        ) : (
          <p className="mt-2 text-muted">Žádná úloha nebyla zodpovězena, takže se nic neuložilo.</p>
        )}
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          {onRestart && (
            <button type="button" className="btn-primary btn-lg" onClick={onRestart} autoFocus>
              {restartLabel}
            </button>
          )}
          <button type="button" className="btn-secondary btn-lg" onClick={() => navigate(back)}>
            {backLabel}
          </button>
        </div>
      </div>

      {children}

      {mistakes.length > 0 && (
        <section className="mt-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2 className="section-title !mb-0">Chyby k zapamatování ({mistakes.length})</h2>
            <Link to="/mistakes" className="text-sm font-bold">Procvičit chyby →</Link>
          </div>
          <ul className="space-y-2">
            {mistakes.map((m, i) => (
              <li key={i} className="card !p-3">
                <div className="text-sm text-fg" lang="en">{m.prompt}</div>
                <div className="mt-1 text-sm">
                  <span className="font-bold text-success" lang="en">✓ {displayAnswer(m.answer)}</span>
                  {m.userAnswer && <span className="ml-2 text-danger line-through decoration-2" lang="en">{m.userAnswer}</span>}
                </div>
                {m.explanation && <div className="mt-1 text-xs leading-relaxed text-muted">{m.explanation}</div>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
