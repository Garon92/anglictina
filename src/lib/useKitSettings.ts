import { useSyncExternalStore } from 'react';
import { subscribeSettings, getSettingsSnapshot, type G92Settings } from '../kit';

/** Reactive global g92 settings (sound, theme, name…). */
export function useSettings(): Readonly<G92Settings> {
  return useSyncExternalStore(
    (cb) => subscribeSettings(() => cb()),
    getSettingsSnapshot,
    getSettingsSnapshot,
  );
}
