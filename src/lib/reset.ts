import { resetApp } from '../kit';

/**
 * Remove everything this app keeps outside IndexedDB: all `g92:anglictina:*` keys (daily counter
 * for the menu, preferences, own name) and the menu's activity entry via the kit's `resetApp`, so
 * after "Smazat všechna data" the menu no longer shows "Pokračovat · Angličtina" — plus the
 * pre-kit localStorage lists (`anglictina_*`, `g92:anglictina-*`).
 * Shared g92 settings (theme, sound, family name) are left alone.
 */
export function resetAppLocalData() {
  try {
    resetApp('anglictina');
  } catch {
    /* storage blocked */
  }
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('g92:anglictina-') || k.startsWith('anglictina_'))) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    /* storage blocked */
  }
}
