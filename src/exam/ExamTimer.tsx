import { useEffect, useRef, useState } from 'react';
import { PageHeader, Ring } from '../components/ui';
import { kvGet, kvSet, kvDelete } from '../db';
import { sfx } from '../kit';
import { FULL_MINUTES, LISTENING_MINUTES } from './structure';

interface TimerState {
  totalMs: number;
  deadline: number | null;
  /** Remaining ms while paused. */
  pausedMs: number | null;
  withListening: boolean;
}

const KEY = 'exam:timer';
const PRESETS = [
  { label: 'Celý test', minutes: FULL_MINUTES, withListening: true },
  { label: 'Jen čtení + jazyk', minutes: 70, withListening: false },
  { label: 'Jen poslech', minutes: LISTENING_MINUTES, withListening: false },
];

function fmt(ms: number) {
  const sec = Math.max(0, Math.ceil(ms / 1000));
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h > 0 ? `${h}:` : ''}${String(m).padStart(h > 0 ? 2 : 1, '0')}:${String(s).padStart(2, '0')}`;
}

/** Countdown for printed official CERMAT tests — deadline-based, survives reloads, keeps the screen on. */
export default function ExamTimer() {
  const [state, setState] = useState<TimerState | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [custom, setCustom] = useState(FULL_MINUTES);
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null);
  const announced = useRef<Set<string>>(new Set());

  useEffect(() => {
    kvGet<TimerState>(KEY).then((s) => s && setState(s)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 500);
    const vis = () => setNow(Date.now());
    document.addEventListener('visibilitychange', vis);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', vis);
    };
  }, []);

  const running = !!state?.deadline;
  const remaining = state ? (state.deadline ? state.deadline - now : state.pausedMs ?? state.totalMs) : 0;

  // Keep the screen awake while running.
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    if (running && nav.wakeLock && !wakeLock.current) {
      nav.wakeLock.request('screen').then((l) => (wakeLock.current = l)).catch(() => {});
    }
    if (!running && wakeLock.current) {
      void wakeLock.current.release().catch(() => {});
      wakeLock.current = null;
    }
  }, [running]);

  // Sounds at milestones.
  useEffect(() => {
    if (!state || !running) return;
    const elapsed = state.totalMs - remaining;
    const marks: [string, boolean][] = [
      ['listening', state.withListening && elapsed >= LISTENING_MINUTES * 60_000],
      ['10min', remaining <= 10 * 60_000],
      ['end', remaining <= 0],
    ];
    for (const [k, hit] of marks) {
      if (hit && !announced.current.has(k)) {
        announced.current.add(k);
        if (k === 'end') sfx.win();
        else sfx.countdown();
      }
    }
    if (remaining <= 0) {
      const done = { ...state, deadline: null, pausedMs: 0 };
      setState(done);
      void kvSet(KEY, done);
    }
  }, [remaining, running, state]);

  function start(minutes: number, withListening: boolean) {
    announced.current = new Set();
    const s: TimerState = { totalMs: minutes * 60_000, deadline: Date.now() + minutes * 60_000, pausedMs: null, withListening };
    setState(s);
    void kvSet(KEY, s);
  }
  function pause() {
    if (!state?.deadline) return;
    const s = { ...state, deadline: null, pausedMs: Math.max(0, state.deadline - Date.now()) };
    setState(s);
    void kvSet(KEY, s);
  }
  function resume() {
    if (!state || state.pausedMs === null) return;
    const s = { ...state, deadline: Date.now() + state.pausedMs, pausedMs: null };
    setState(s);
    void kvSet(KEY, s);
  }
  function reset() {
    setState(null);
    void kvDelete(KEY);
  }

  const ratio = state ? Math.max(0, remaining) / state.totalMs : 1;
  const elapsedMin = state ? (state.totalMs - remaining) / 60_000 : 0;
  const phase = state?.withListening ? (elapsedMin < LISTENING_MINUTES ? 'Poslech (prvních ~40 min)' : 'Čtení a jazyková kompetence') : null;

  return (
    <div className="page-container">
      <PageHeader title="Časovač k testu" subtitle="Pro vytištěné oficiální testy CERMAT. Běží i po zamčení obrazovky nebo obnovení stránky." back="/exam" icon="⏱️" />
      {!state ? (
        <div className="card space-y-4 !p-5">
          <div className="grid gap-2 sm:grid-cols-3">
            {PRESETS.map((p) => (
              <button key={p.label} type="button" className="card card-link !p-4 text-left" onClick={() => start(p.minutes, p.withListening)}>
                <div className="text-2xl font-black text-fg">{p.minutes} min</div>
                <div className="text-sm text-muted">{p.label}</div>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-end gap-3">
            <label className="block">
              <span className="eyebrow mb-1 block">Vlastní čas (min)</span>
              <input type="number" min={1} max={240} className="input !w-32" value={custom} onChange={(e) => setCustom(Math.max(1, Math.min(240, Number(e.target.value) || 1)))} />
            </label>
            <button type="button" className="btn-primary" onClick={() => start(custom, false)}>Spustit</button>
          </div>
        </div>
      ) : (
        <div className="card flex flex-col items-center gap-4 !p-6 text-center">
          <Ring value={ratio} size={220} stroke={14} tone={remaining < 5 * 60_000 ? 'danger' : remaining < 10 * 60_000 ? 'warning' : 'accent'} label="Zbývající čas">
            <div>
              <div className="text-5xl font-black tabular-nums text-fg">{fmt(remaining)}</div>
              <div className="text-sm text-muted">{remaining <= 0 ? 'Konec!' : running ? 'zbývá' : 'pozastaveno'}</div>
            </div>
          </Ring>
          {phase && remaining > 0 && <div className="badge !px-3 !py-1.5 !text-sm">{phase}</div>}
          <div className="flex flex-wrap justify-center gap-3">
            {running ? (
              <button type="button" className="btn-secondary btn-lg" onClick={pause}>Pozastavit</button>
            ) : remaining > 0 ? (
              <button type="button" className="btn-primary btn-lg" onClick={resume}>Pokračovat</button>
            ) : null}
            <button type="button" className="btn-ghost btn-lg" onClick={reset}>Nový časovač</button>
          </div>
          <p className="max-w-md text-xs text-muted">Tip: u maturity se nejdřív píše poslech (nahrávky pouští zadavatel), pak čtení a jazyková kompetence. Na konci si nech pár minut na kontrolu záznamového archu.</p>
        </div>
      )}
    </div>
  );
}
