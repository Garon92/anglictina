const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;

let ctx: AudioContext | null = null;
let pendingTimeouts: ReturnType<typeof setTimeout>[] = [];

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function clearPendingSounds() {
  for (const id of pendingTimeouts) clearTimeout(id);
  pendingTimeouts = [];
}

function playTone(freq: number, duration: number, type: OscillatorType = 'sine', gain = 0.15) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.value = gain;
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    osc.connect(g);
    g.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch {
    // AudioContext not supported
  }
}

function vibrate(pattern: number | number[]) {
  try { navigator?.vibrate?.(pattern); } catch { /* unsupported */ }
}

export function playCorrect() {
  clearPendingSounds();
  playTone(523.25, 0.1, 'sine', 0.12);
  pendingTimeouts.push(setTimeout(() => playTone(659.25, 0.1, 'sine', 0.12), 100));
  pendingTimeouts.push(setTimeout(() => playTone(783.99, 0.15, 'sine', 0.12), 200));
  vibrate(30);
}

export function playIncorrect() {
  clearPendingSounds();
  playTone(311.13, 0.15, 'square', 0.08);
  pendingTimeouts.push(setTimeout(() => playTone(277.18, 0.25, 'square', 0.08), 150));
  vibrate([30, 50, 30]);
}

export function playClick() {
  clearPendingSounds();
  playTone(880, 0.05, 'sine', 0.06);
}

export function playComplete() {
  clearPendingSounds();
  playTone(523.25, 0.1, 'sine', 0.1);
  pendingTimeouts.push(setTimeout(() => playTone(659.25, 0.1, 'sine', 0.1), 120));
  pendingTimeouts.push(setTimeout(() => playTone(783.99, 0.1, 'sine', 0.1), 240));
  pendingTimeouts.push(setTimeout(() => playTone(1046.50, 0.2, 'sine', 0.1), 360));
  import('./confetti').then((m) => m.launchConfetti()).catch(() => {});
}
