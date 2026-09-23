import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { onDialogChange, toast } from '../kit';
import { safeConfirm } from '../lib/confirm';
import { setActiveSession, enterFocusMode } from '../lib/activeSession';
import { stopSpeaking } from '../tts';
import { playComplete } from '../sounds';
import PartView from './PartViews';
import ExamResults from './ExamResults';
import { answeredCount, type ExamScore } from './scoring';
import { partInfo, MODE_LABELS, type ExamMode, type PartNo } from './structure';
import { createRun, loadRun, saveRun, submitRun, runParts, runSource, setTitle, partLabel, pauseRun, resumeRun, type ExamRun } from './run';
import { EXAM_SETS } from './sets';

type View = { kind: 'loading' } | { kind: 'run'; run: ExamRun } | { kind: 'done'; run: ExamRun; score: ExamScore } | { kind: 'missing' };

/** Seconds left; frozen while the run is paused (`frozenMs`, e.g. a dialog is open). */
function useRemaining(deadline: number | null, frozenMs?: number): number | null {
  const [now, setNow] = useState(() => Date.now());
  const frozen = frozenMs !== undefined;
  useEffect(() => {
    if (!deadline || frozen) return;
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const t = window.setInterval(tick, 1000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [deadline, frozen]);
  if (!deadline) return null;
  if (frozenMs !== undefined) return Math.max(0, Math.round(frozenMs / 1000));
  return Math.max(0, Math.round((deadline - now) / 1000));
}

function fmt(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function ExamRunner() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [view, setView] = useState<View>({ kind: 'loading' });
  const submitting = useRef(false);

  // Create or resume a run from the URL.
  useEffect(() => {
    let alive = true;
    (async () => {
      const mode = params.get('mode') as ExamMode | null;
      const existing = await loadRun();
      if (!alive) return;
      if (mode) {
        const run = createRun({
          mode,
          setId: params.get('set') ?? EXAM_SETS[0].id,
          part: params.get('part') ? (Number(params.get('part')) as PartNo) : undefined,
          practice: params.get('practice') === '1',
          timed: params.get('timed') === '0' ? false : undefined,
        });
        await saveRun(run);
        // Replace the URL so a reload resumes instead of starting over.
        navigate('/exam/run', { replace: true });
        setView({ kind: 'run', run });
      } else if (existing) {
        setView({ kind: 'run', run: resumeRun(existing) });
      } else {
        setView({ kind: 'missing' });
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  // Persist progress (debounced); pause the clock when the page is left.
  const run = view.kind === 'run' ? view.run : null;
  const runRef = useRef<ExamRun | null>(null);
  runRef.current = run;
  useEffect(() => {
    const onHide = () => {
      if (runRef.current && !submitting.current) void saveRun(pauseRun(runRef.current));
    };
    window.addEventListener('pagehide', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      onHide();
    };
  }, []);
  const running = view.kind === 'run';
  const runId = view.kind === 'run' ? view.run.id : '';
  useEffect(() => {
    if (!running) return;
    const exitFocus = enterFocusMode();
    const off = setActiveSession({
      id: runId,
      confirm: true,
      title: 'Přerušit test?',
      message: 'Rozpracovaný test zůstane uložený (i se zbývajícím časem) a dokončíš ho později v sekci Maturita.',
      confirmLabel: 'Přerušit',
      cancelLabel: 'Pokračovat v testu',
      finalize: async () => {
        stopSpeaking();
        if (runRef.current && !submitting.current) await saveRun(pauseRun(runRef.current));
      },
    });
    return () => {
      off();
      exitFocus();
    };
  }, [running, runId]);

  useEffect(() => {
    if (!run) return;
    const t = window.setTimeout(() => {
      if (!submitting.current) void saveRun(run);
    }, 400);
    return () => window.clearTimeout(t);
  }, [run]);

  const update = useCallback((fn: (r: ExamRun) => ExamRun) => {
    setView((v) => (v.kind === 'run' ? { kind: 'run', run: fn(v.run) } : v));
  }, []);

  // The clock stops while a dialog (help, settings, confirmations) covers the test (C-05).
  useEffect(() => {
    if (!running) return;
    return onDialogChange((open) => {
      if (submitting.current) return;
      update((r) => (open ? pauseRun(r) : resumeRun(r)));
    });
  }, [running, update]);

  const submit = useCallback(async (r: ExamRun, reason?: 'timeout') => {
    if (submitting.current) return;
    submitting.current = true;
    stopSpeaking();
    try {
      const { score } = await submitRun(r);
      if (reason === 'timeout') toast('Čas vypršel — test byl automaticky odevzdán.', { variant: 'accent', duration: 5000 });
      playComplete(score.ratio);
      setView({ kind: 'done', run: r, score });
      window.scrollTo({ top: 0 });
    } catch (e) {
      console.error(e);
      submitting.current = false;
      toast('Test se nepodařilo uložit. Zkus to prosím znovu.', { variant: 'danger' });
    }
  }, []);

  const remaining = useRemaining(run?.timed ? run.deadline : null, run?.remainingMs);
  useEffect(() => {
    if (run && remaining === 0) void submit(run, 'timeout');
  }, [remaining, run, submit]);

  if (view.kind === 'loading') return <div className="page-container"><div className="skeleton h-48 w-full" /></div>;

  if (view.kind === 'missing') {
    return (
      <div className="page-container py-10 text-center">
        <div className="mb-3 text-5xl" aria-hidden="true">🗂️</div>
        <h1 className="page-title">Žádný rozpracovaný test</h1>
        <p className="page-subtitle">Vyber si test v přehledu maturity.</p>
        <button type="button" className="btn-primary" onClick={() => navigate('/exam')}>Přehled testů</button>
      </div>
    );
  }

  if (view.kind === 'done') {
    const r = view.run;
    const parts = runParts(r);
    return (
      <ExamResults
        score={view.score}
        parts={parts}
        source={runSource(r)}
        answers={r.answers}
        title={r.mode === 'part' ? partInfo(r.part ?? 1).title : setTitle(r)}
        subtitle={r.mode === 'part' ? `Trénink · ${partLabel(r.part ?? 1)}` : MODE_LABELS[r.mode]}
        practice={r.practice}
        onRetry={() => navigate('/exam')}
      />
    );
  }

  // Leaving (✕, tab bar, Back, "‹ Menu") asks first; the run stays saved and paused.
  return <RunScreen run={view.run} update={update} remaining={remaining} onSubmit={(r) => void submit(r)} onQuit={() => navigate('/exam')} />;
}

const SHORT_MODE: Record<ExamMode, string> = { full: 'Celý test', listening: 'Poslech', reading: 'Čtení + jazyk', part: 'Trénink' };

function RunScreen({
  run,
  update,
  remaining,
  onSubmit,
  onQuit,
}: {
  run: ExamRun;
  update: (fn: (r: ExamRun) => ExamRun) => void;
  remaining: number | null;
  onSubmit: (r: ExamRun) => void;
  onQuit: () => void;
}) {
  const parts = runParts(run);
  const src = useMemo(() => runSource(run), [run]);
  const current = parts.includes(run.current) ? run.current : parts[0];
  const idx = parts.indexOf(current);
  const info = partInfo(current);
  const set = src(current);
  const goto = (p: PartNo) => {
    stopSpeaking();
    update((r) => ({ ...r, current: p }));
    // The top bar is sticky (always "in view"), so scroll the page itself to the part heading.
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const totalItems = parts.reduce((s, p) => s + partInfo(p).items, 0);
  const answered = parts.reduce((s, p) => s + answeredCount(p, run.answers), 0);

  async function askSubmit() {
    const missing = totalItems - answered;
    const ok = await safeConfirm({
      title: run.mode === 'part' ? 'Zkontrolovat odpovědi?' : 'Odevzdat test?',
      message: missing > 0
        ? `Nevyplněno: ${missing} z ${totalItems} úloh. Za prázdnou odpověď se body neodečítají, ale ani nepřičítají.`
        : 'Všechny úlohy jsou vyplněné. Po odevzdání uvidíš výsledek a rozbor chyb.',
      confirmLabel: run.mode === 'part' ? 'Zkontrolovat' : 'Odevzdat',
      cancelLabel: 'Ještě ne',
    });
    if (ok) onSubmit(run);
  }

  const intro = introFor(current, set);
  const low = remaining !== null && remaining < 300;
  const warn = remaining !== null && remaining < 600;

  return (
    <div className="page-container page-container--wide">
      <div className="exam-topbar">
        <button type="button" className="btn-ghost !px-2.5" onClick={onQuit} aria-label="Přerušit test">✕ <span className="hidden sm:inline">Přerušit</span></button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-black text-fg">{setTitle(run)}</div>
          <div className="truncate text-xs text-muted">
            {SHORT_MODE[run.mode]} · {answered}/{totalItems} vyplněno
          </div>
        </div>
        {remaining !== null && (
          <div className={`exam-timer ${low ? 'is-low' : warn ? 'is-warn' : ''}`} role="timer" aria-live="off" aria-label={`Zbývá ${Math.ceil(remaining / 60)} minut`}>
            ⏱ {fmt(remaining)}
          </div>
        )}
        <button type="button" className="btn-primary !px-3" onClick={askSubmit}>
          {run.mode === 'part' ? 'Zkontrolovat' : 'Odevzdat'}
        </button>
      </div>

      {parts.length > 1 && (
        <nav className="exam-partnav" aria-label="Části testu">
          {parts.map((p) => {
            const done = answeredCount(p, run.answers);
            const full = done === partInfo(p).items;
            const sub = partInfo(p).subtest;
            return (
              <button
                key={p}
                type="button"
                className={`exam-partnav__item exam-partnav__item--${sub} ${p === current ? 'is-current' : ''} ${full ? 'is-done' : done > 0 ? 'is-partial' : ''}`}
                aria-current={p === current ? 'step' : undefined}
                onClick={() => goto(p)}
                title={`${partInfo(p).title} (${done}/${partInfo(p).items})`}
              >
                {p}
              </button>
            );
          })}
        </nav>
      )}

      <header className="mb-4 mt-4">
        <div className="eyebrow">
          {partLabel(current)} · {info.items * info.pointsPerItem} bodů ({info.pointsPerItem} {info.pointsPerItem === 1 ? 'bod' : 'body'} za úlohu)
        </div>
        <h1 className="mt-0.5 text-2xl font-black text-fg">{info.icon} {info.title}</h1>
        <p className="mt-1 max-w-3xl text-sm text-muted">{intro}</p>
      </header>

      <PartView
        part={current}
        set={set}
        answers={run.answers}
        onChange={(a) => update((r) => ({ ...r, answers: a }))}
        review={false}
        practice={run.practice}
        plays={run.plays}
        onPlay={(k) => update((r) => ({ ...r, plays: { ...r.plays, [k]: (r.plays[k] ?? 0) + 1 } }))}
      />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn-secondary" disabled={idx <= 0} onClick={() => goto(parts[idx - 1])}>‹ Předchozí část</button>
        <span className="text-sm text-muted">Vyplněno {answeredCount(current, run.answers)} / {info.items}</span>
        {idx < parts.length - 1 ? (
          <button type="button" className="btn-primary" onClick={() => goto(parts[idx + 1])}>Další část ›</button>
        ) : (
          <button type="button" className="btn-primary" onClick={askSubmit}>{run.mode === 'part' ? 'Zkontrolovat' : 'Odevzdat test'}</button>
        )}
      </div>
    </div>
  );
}

function introFor(p: PartNo, set: ReturnType<ReturnType<typeof runSource>>): string {
  switch (p) {
    case 1: return 'Uslyšíte čtyři krátké nahrávky. Nejprve uslyšíte otázku a poté nahrávku. Ke každé úloze vyberte jeden správný obrázek A–D.';
    case 2: return set.part2.introCs;
    case 3: return set.part3.introCs;
    case 4: return 'Uslyšíte čtyři krátké nahrávky. Nejprve uslyšíte otázku a poté nahrávku. Ke každé úloze vyberte jednu správnou odpověď A–D.';
    case 5: return 'Přečtěte si pět krátkých textů. Ke každému vyberte jednu správnou odpověď A–D.';
    case 6: return set.part6.introCs;
    case 7: return set.part7.introCs;
    case 8: return set.part8.introCs;
    case 9: return set.part9.introCs;
    case 10: return set.part10.introCs;
  }
}

