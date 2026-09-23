import { useEffect, useRef } from 'react';

type KeyMap = Record<string, () => void>;

/**
 * Global keyboard shortcuts. The latest `keyMap` is always used (no stale closures),
 * auto-repeat and modifier combinations are ignored, and typing in form fields is left alone
 * (except for keys listed in `allowInInputs`, e.g. Enter).
 */
export function useKeyboard(keyMap: KeyMap, enabled = true, allowInInputs: string[] = []) {
  const mapRef = useRef(keyMap);
  mapRef.current = keyMap;
  const allowRef = useRef(allowInInputs);
  allowRef.current = allowInInputs;

  useEffect(() => {
    if (!enabled) return;
    function handler(e: KeyboardEvent) {
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      const inField = !!t && (t instanceof HTMLInputElement || t instanceof HTMLTextAreaElement || t instanceof HTMLSelectElement || t.isContentEditable);
      if (inField && !allowRef.current.includes(e.key)) return;
      // Let buttons/links handle their own Enter/Space activation.
      if (!inField && (e.key === 'Enter' || e.key === ' ') && t && (t.tagName === 'BUTTON' || t.tagName === 'A')) return;
      const action = mapRef.current[e.key] || mapRef.current[e.code];
      if (action) {
        e.preventDefault();
        action();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enabled]);
}
