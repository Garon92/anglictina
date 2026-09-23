/**
 * App sound effects — thin wrapper over the g92 kit (sound on/off + volume live in the
 * shared g92 settings, toggled from the app bar).
 */
import { sfx, getSettings, setSettings } from './kit';
import { confetti } from './kit/confetti';

function vibrate(pattern: number | number[]) {
  if (!getSettings().sound) return;
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}

export function playCorrect() {
  sfx.success();
  vibrate(18);
}

export function playIncorrect() {
  sfx.error();
  vibrate([25, 40, 25]);
}

export function playClick() {
  sfx.tap();
}

export function playFlip() {
  sfx.flip();
}

/**
 * End of a session. `ratio` (0–1) decides how much to celebrate:
 * ≥ 0.8 fanfare + confetti, ≥ 0.5 fanfare, otherwise a soft sound.
 */
export function playComplete(ratio = 1) {
  if (ratio >= 0.8) {
    sfx.win();
    confetti({ particleCount: 140 });
  } else if (ratio >= 0.5) {
    sfx.levelUp();
  } else {
    sfx.pop();
  }
}

export function celebrate() {
  confetti({ particleCount: 180, cannons: true });
}

/** @deprecated sound is a global g92 setting now */
export function setSoundEnabled(enabled: boolean) {
  if (getSettings().sound !== enabled) setSettings({ sound: enabled });
}

export function isSoundEnabled(): boolean {
  return getSettings().sound;
}
