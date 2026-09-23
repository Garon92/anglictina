import { useEffect, useRef, useState } from 'react';
import { parseScript, speakScript, ttsSupported, getAvailableVoices, type ScriptPlayback } from '../tts';

/**
 * Plays a listening script with TTS. In exam mode the number of plays is limited (2×, as in the
 * real test). Shows the transcript when allowed (review / practice after checking) or when the
 * browser has no English voice.
 */
export default function ListeningPlayer({
  script,
  intro,
  maxPlays,
  used,
  onPlay,
  showTranscript,
  rate = 0.92,
  label = 'nahrávku',
}: {
  script: string;
  /** Read before the recording (e.g. the question in parts 1 and 4). */
  intro?: string;
  maxPlays: number;
  used: number;
  onPlay: () => void;
  showTranscript: boolean;
  rate?: number;
  label?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [line, setLine] = useState(-1);
  const [voicesReady, setVoicesReady] = useState(() => getAvailableVoices().length > 0);
  const [forceTranscript, setForceTranscript] = useState(false);
  const playback = useRef<ScriptPlayback | null>(null);
  const lines = parseScript(script);
  const left = Number.isFinite(maxPlays) ? Math.max(0, maxPlays - used) : Infinity;
  const supported = ttsSupported();

  useEffect(() => {
    if (voicesReady || !supported) return;
    const t = window.setInterval(() => {
      if (getAvailableVoices().length > 0) {
        setVoicesReady(true);
        window.clearInterval(t);
      }
    }, 500);
    const stopT = window.setTimeout(() => window.clearInterval(t), 5000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(stopT);
    };
  }, [voicesReady, supported]);

  useEffect(() => () => playback.current?.stop(), []);

  function play(twice = false) {
    if (playing || left <= 0) return;
    onPlay();
    setPlaying(true);
    const pb = speakScript(script, { rate, intro, onLine: setLine });
    playback.current = pb;
    void pb.done.then(async () => {
      if (playback.current !== pb) return;
      if (twice) {
        // As in the exam: a short pause, then the recording once more.
        await new Promise((r) => window.setTimeout(r, 3500));
        if (playback.current !== pb) return;
        onPlay();
        const second = speakScript(script, { rate, intro, onLine: setLine });
        playback.current = second;
        await second.done;
        if (playback.current !== second) return;
      }
      setPlaying(false);
      setLine(-1);
    });
  }

  function stop() {
    playback.current?.stop();
    playback.current = null;
    setPlaying(false);
    setLine(-1);
  }

  const noVoice = !supported || !voicesReady;
  const transcriptVisible = showTranscript || forceTranscript;

  return (
    <div className="rounded-2xl border border-border bg-surface-2 p-3">
      <div className="flex flex-wrap items-center gap-3">
        {playing ? (
          <button type="button" className="exam-play is-playing" onClick={stop} aria-label="Zastavit nahrávku">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="2" /></svg>
          </button>
        ) : (
          <button type="button" className="exam-play" onClick={() => play()} disabled={left <= 0} aria-label={`Přehrát ${label}`}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" /></svg>
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold text-fg">
            {playing ? 'Přehrávám…' : used === 0 ? `Přehrát ${label}` : left > 0 ? 'Přehrát znovu' : 'Nahrávka už zazněla'}
          </div>
          <div className="text-xs text-muted">
            {Number.isFinite(maxPlays)
              ? left > 0
                ? `Zbývá ${left}× (u maturity zazní každá nahrávka dvakrát)`
                : 'Obě přehrání vyčerpána'
              : 'Neomezený počet přehrání'}
          </div>
        </div>
        {playing && <Wave />}
        {!playing && used === 0 && maxPlays === 2 && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => play(true)} title="Nahrávka zazní dvakrát s krátkou pauzou, jako u maturity">
            Přehrát 2× za sebou
          </button>
        )}
      </div>
      {noVoice && !transcriptVisible && (
        <div className="mt-2 rounded-xl bg-warning-soft p-2.5 text-xs text-fg">
          Prohlížeč nemá anglický hlas pro čtení nahrávek.{' '}
          <button type="button" className="font-bold text-accent-text underline" onClick={() => { setForceTranscript(true); if (used === 0) onPlay(); }}>
            Zobrazit přepis místo poslechu
          </button>
        </div>
      )}
      {transcriptVisible && (
        <details className="mt-2" open={forceTranscript}>
          <summary className="cursor-pointer text-xs font-bold text-accent-text">Přepis nahrávky</summary>
          <div className="mt-2 space-y-1 text-sm leading-relaxed" lang="en">
            {intro && <p className="italic text-muted">{intro}</p>}
            {lines.map((l, i) => (
              <p key={i} className={i === line ? 'rounded bg-accent-soft px-1' : ''}>
                {l.speaker !== 'N' && <span className="mr-1 text-xs font-black text-muted">{l.speaker === 'M' ? 'Muž:' : 'Žena:'}</span>}
                {l.text}
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

function Wave() {
  return (
    <span className="exam-wave" aria-hidden="true">
      <span /><span /><span /><span />
    </span>
  );
}
