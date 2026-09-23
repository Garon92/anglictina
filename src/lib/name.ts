import { useSyncExternalStore } from 'react';
import { getAppPlayerName, getPlayerName, getSettingsSnapshot, setAppPlayerName, subscribeSettings } from '../kit';

export const APP_ID = 'anglictina';

/**
 * Names (kit v0.7, C-08): the family default `g92:settings.playerName` belongs to the menu; this app
 * only ever writes its own override `g92:anglictina:name` (a teenager using the family tablet).
 * The greeting reads `getPlayerName(APP_ID)` = own name, else the family name.
 */
export function getAppName(): string {
  return getAppPlayerName(APP_ID) ?? '';
}

export function setAppName(name: string) {
  setAppPlayerName(APP_ID, name);
}

const subscribe = (fn: () => void) => subscribeSettings(() => fn());

/** Name to greet with (own override or the family default). */
export function useGreetingName(): string {
  return useSyncExternalStore(subscribe, () => getPlayerName(APP_ID), () => '');
}

/** This app's own name override ('' = none) + setter. */
export function useAppName(): [string, (v: string) => void] {
  const name = useSyncExternalStore(subscribe, getAppName, () => '');
  return [name, setAppName];
}

/** The family default name (read-only here). */
export function useFamilyName(): string {
  return useSyncExternalStore(subscribe, () => getSettingsSnapshot().playerName, () => '');
}
