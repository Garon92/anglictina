/**
 * Text-to-speech helpers (Web Speech API).
 * - speak(): one utterance, resolves when finished (also when interrupted/cancelled)
 * - speakScript(): multi-line listening scripts with speaker tags "M:" / "W:" / "N:",
 *   using different voices (or pitch) for men and women.
 */

let selectedVoice: SpeechSynthesisVoice | null = null;
let preferredName = '';

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

/** macOS/iOS novelty voices (sound effects, singing…) — useless for learning English. */
const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|junior|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|ralph|fred|grandma|grandpa|rocko|shelley|flo|sandy|eddy|reed)\b/i;

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!ttsSupported()) return [];
  const rank = (v: SpeechSynthesisVoice) => (/en[-_]gb/i.test(v.lang) ? 0 : /en[-_](us|au|ie|ca|nz)/i.test(v.lang) ? 1 : 2);
  return speechSynthesis
    .getVoices()
    .filter((v) => v.lang.toLowerCase().startsWith('en') && !NOVELTY.test(v.name.replace(/\s*\(.*$/, '')))
    .sort((a, b) => rank(a) - rank(b) || a.name.localeCompare(b.name));
}

export function initTTS(preferredVoiceName?: string): Promise<SpeechSynthesisVoice[]> {
  preferredName = preferredVoiceName ?? '';
  return new Promise((resolve) => {
    if (!ttsSupported()) {
      resolve([]);
      return;
    }
    const done = () => {
      const v = getAvailableVoices();
      selectVoice(v, preferredName);
      resolve(v);
    };
    if (getAvailableVoices().length > 0) {
      done();
      return;
    }
    speechSynthesis.addEventListener?.('voiceschanged', done, { once: true });
    setTimeout(done, 1200);
  });
}

export function setVoiceByName(name: string) {
  preferredName = name;
  const match = getAvailableVoices().find((v) => v.name === name);
  if (match) selectedVoice = match;
}

const PREFERRED = ['Google UK English Female', 'Google UK English Male', 'Serena', 'Daniel', 'Kate', 'Arthur', 'Samantha', 'Karen'];

function selectVoice(voices: SpeechSynthesisVoice[], name?: string) {
  if (name) {
    const m = voices.find((v) => v.name === name);
    if (m) {
      selectedVoice = m;
      return;
    }
  }
  for (const n of PREFERRED) {
    const v = voices.find((voice) => voice.name.includes(n));
    if (v) {
      selectedVoice = v;
      return;
    }
  }
  selectedVoice = voices.find((v) => v.lang === 'en-GB') ?? voices[0] ?? null;
}

export function getCurrentVoiceName(): string {
  return selectedVoice?.name ?? '';
}

function currentVoice(): SpeechSynthesisVoice | null {
  if (!selectedVoice) selectVoice(getAvailableVoices(), preferredName);
  return selectedVoice;
}

export function speak(text: string, rate = 0.9, lang = 'en-GB'): Promise<void> {
  return new Promise((resolve) => {
    if (!ttsSupported()) {
      resolve();
      return;
    }
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    u.rate = rate;
    u.pitch = 1;
    const v = currentVoice();
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    speechSynthesis.speak(u);
  });
}

export function stopSpeaking() {
  if (ttsSupported()) speechSynthesis.cancel();
  activeScript?.stop();
}

/* ─── Scripts with speakers ──────────────────────────────────────── */

export type Speaker = 'M' | 'W' | 'N';

export interface ScriptLine {
  speaker: Speaker;
  text: string;
}

export function parseScript(script: string): ScriptLine[] {
  return script
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const m = /^([MWN]):\s*(.*)$/.exec(l);
      return m ? { speaker: m[1] as Speaker, text: m[2] } : { speaker: 'N' as Speaker, text: l };
    })
    .filter((l) => l.text);
}

const FEMALE_HINTS = /female|woman|samantha|karen|serena|kate|moira|fiona|tessa|victoria|susan|zira|hazel|libby|sonia|martha|stephanie|emma|amy|olivia|jenny|aria|natasha|catherine|allison|ava|nicky|shelley|flo|sandy/i;
const MALE_HINTS = /\bmale\b|daniel|alex|fred|arthur|oliver|rishi|george|david|mark|ryan|thomas|guy|james|brian|aaron|gordon|lee|rocko|eddy|reed|ralph|junior|grandpa/i;

export interface VoicePair {
  male: SpeechSynthesisVoice | null;
  female: SpeechSynthesisVoice | null;
  narrator: SpeechSynthesisVoice | null;
}

export function pickVoices(voices = getAvailableVoices()): VoicePair {
  const gb = voices.filter((v) => /en[-_]gb/i.test(v.lang));
  const pool = gb.length >= 2 ? gb : voices;
  const female = pool.find((v) => FEMALE_HINTS.test(v.name) && !/\bmale\b/i.test(v.name.replace(/female/i, ''))) ?? null;
  const male = pool.find((v) => MALE_HINTS.test(v.name) && v !== female) ?? null;
  const narrator = currentVoice() ?? female ?? male ?? pool[0] ?? null;
  return { male, female, narrator };
}

export interface ScriptPlayback {
  done: Promise<void>;
  stop: () => void;
}

let activeScript: ScriptPlayback | null = null;

/**
 * Read a listening script line by line with speaker-specific voices.
 * `onLine` reports the index of the line being spoken (for transcript highlighting).
 */
export function speakScript(
  script: string,
  opts: { rate?: number; pauseMs?: number; onLine?: (i: number) => void; intro?: string } = {},
): ScriptPlayback {
  activeScript?.stop();
  const lines = parseScript(script);
  let stopped = false;
  let timer = 0;
  const { male, female, narrator } = pickVoices();
  const rate = opts.rate ?? 0.92;

  const say = (line: ScriptLine) =>
    new Promise<void>((resolve) => {
      if (stopped || !ttsSupported()) return resolve();
      const u = new SpeechSynthesisUtterance(line.text);
      u.lang = 'en-GB';
      u.rate = rate;
      if (line.speaker === 'W') {
        if (female) u.voice = female;
        else if (narrator) u.voice = narrator;
        u.pitch = female ? 1 : 1.2;
      } else if (line.speaker === 'M') {
        if (male) u.voice = male;
        else if (narrator) u.voice = narrator;
        u.pitch = male ? 1 : 0.78;
      } else {
        if (narrator) u.voice = narrator;
        u.pitch = 1;
      }
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });

  const done = (async () => {
    if (!ttsSupported()) return;
    speechSynthesis.cancel();
    const all: ScriptLine[] = opts.intro ? [{ speaker: 'N', text: opts.intro }, ...lines] : lines;
    for (let i = 0; i < all.length; i++) {
      if (stopped) break;
      opts.onLine?.(opts.intro ? i - 1 : i);
      await say(all[i]);
      if (stopped) break;
      await new Promise<void>((r) => {
        timer = window.setTimeout(r, opts.pauseMs ?? 350);
      });
    }
    opts.onLine?.(-1);
  })();

  const playback: ScriptPlayback = {
    done,
    stop: () => {
      stopped = true;
      window.clearTimeout(timer);
      if (ttsSupported()) speechSynthesis.cancel();
      opts.onLine?.(-1);
    },
  };
  activeScript = playback;
  void done.finally(() => {
    if (activeScript === playback) activeScript = null;
  });
  return playback;
}

/** Plain text of a script (without speaker tags) for transcripts. */
export function scriptToText(script: string): string {
  return parseScript(script).map((l) => l.text).join(' ');
}
