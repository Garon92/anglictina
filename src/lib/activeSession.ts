/**
 * The practice session / exam that is currently running (at most one).
 * - Layout hides the tab bar while one is active (focus mode) and asks before leaving it:
 *   in-app navigation and browser Back within the app (react-router blocker), and the app bar's
 *   "Menu" (kit v0.7 leave guard → the family "Odejít do menu?" dialog).
 * - `finalize` is called when the learner confirms leaving (saves the partial session).
 */
import { confirmLeave as kitConfirmLeave } from '../kit';
import { safeConfirm } from './confirm';

export interface ActiveSession {
  id: string;
  /** Ask before leaving (false = leave silently, finalize still runs). */
  confirm: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Text of the "Odejít do menu?" dialog (leaving the app via the app bar). */
  menuMessage?: string;
  /** Save what has been done so far. */
  finalize: () => Promise<void> | void;
}

let current: ActiveSession | null = null;
let focusDepth = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const fn of [...listeners]) fn();
}

export function subscribeActiveSession(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getActiveSession(): ActiveSession | null {
  return current;
}

/** Register / replace the running session. Returns an unregister function. */
export function setActiveSession(s: ActiveSession): () => void {
  current = s;
  emit();
  return () => {
    if (current?.id === s.id) {
      current = null;
      emit();
    }
  };
}

/** Focus mode (no tab bar / side nav) — ref-counted, set by DrillTopBar and full-screen runners. */
export function enterFocusMode(): () => void {
  focusDepth++;
  emit();
  let done = false;
  return () => {
    if (done) return;
    done = true;
    focusDepth = Math.max(0, focusDepth - 1);
    emit();
  };
}

export function isFocusMode(): boolean {
  return focusDepth > 0;
}

/**
 * Ask whether it's OK to leave the running session. Resolves true when there is nothing to
 * protect or the learner confirmed (the partial session is saved first).
 * `to: 'menu'` = leaving the app via the app bar (family wording: Zůstat / Odejít).
 */
export async function confirmLeave(to: 'app' | 'menu' = 'app'): Promise<boolean> {
  const s = current;
  if (!s) return true;
  if (s.confirm) {
    const ok =
      to === 'menu'
        ? await kitConfirmLeave({ message: s.menuMessage ?? s.message ?? 'Dosavadní odpovědi se uloží do statistik.' })
        : await safeConfirm({
            title: s.title ?? 'Ukončit cvičení?',
            message: s.message ?? 'Dosavadní odpovědi se uloží do statistik.',
            confirmLabel: s.confirmLabel ?? 'Ukončit',
            cancelLabel: s.cancelLabel ?? 'Pokračovat',
          });
    if (!ok) return false;
  }
  try {
    await s.finalize();
  } catch {
    /* saving is best-effort */
  }
  if (current?.id === s.id) {
    current = null;
    emit();
  }
  return true;
}
