import { openDialog } from '../kit';
import { h } from '../kit/dom';

export interface SafeConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

/**
 * Confirmation dialog that focuses the SAFE action (cancel / stay), so a stray Enter or Space
 * never deletes data or ends a session. (The kit's confirmDialog focuses the confirm button.)
 * After cancelling, focus is released so the next Space doesn't re-open the dialog via the
 * button that opened it.
 */
export async function safeConfirm(o: SafeConfirmOptions): Promise<boolean> {
  const opener = document.activeElement as HTMLElement | null;
  const d = openDialog({
    title: o.title,
    content: o.message ? h('p', { class: 'g92-muted' }, o.message) : undefined,
    dismissValue: 'cancel',
    actions: [
      { label: o.cancelLabel ?? 'Zrušit', value: 'cancel', variant: 'secondary', autofocus: true },
      { label: o.confirmLabel ?? 'Ano', value: 'ok', variant: o.danger ? 'danger' : 'primary' },
    ],
  });
  const ok = (await d.closed) === 'ok';
  if (!ok) {
    // Don't leave focus on the opener (e.g. the drill's ✕), where Space would re-open the dialog.
    requestAnimationFrame(() => {
      if (document.activeElement === opener || document.activeElement === document.body) opener?.blur();
    });
  }
  return ok;
}
