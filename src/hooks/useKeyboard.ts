import { useEffect } from 'react';

type KeyMap = Record<string, () => void>;

export function useKeyboard(keyMap: KeyMap, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const action = keyMap[e.key] || keyMap[e.code];
      if (action) {
        e.preventDefault();
        action();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [keyMap, enabled]);
}
