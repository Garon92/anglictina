import { confirmDialog } from '../kit';

export interface SafeConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * Confirmation dialog with the SAFE action (cancel / stay) focused — the kit's confirmDialog does
 * that since v0.7 (C-03). On top of it: after cancelling, focus is released from the button that
 * opened the dialog (e.g. the drill's ✕), so the next Space doesn't re-open it (ANG-02).
 */
export async function safeConfirm(o: SafeConfirmOptions): Promise<boolean> {
  const opener = document.activeElement as HTMLElement | null;
  const ok = await confirmDialog({ ...o, cancelLabel: o.cancelLabel ?? 'Zrušit' });
  if (!ok) {
    requestAnimationFrame(() => {
      if (document.activeElement === opener || document.activeElement === document.body) opener?.blur();
    });
  }
  return ok;
}
