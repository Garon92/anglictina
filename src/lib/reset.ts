import { clearActivity } from '../kit';

/**
 * Remove everything this app keeps outside IndexedDB: the lists in localStorage and all
 * `g92:anglictina:*` keys (daily counter for the menu, preferences), plus the menu's activity
 * entry — so after "Smazat všechna data" the menu no longer shows "Pokračovat · Angličtina".
 * Shared g92 settings (theme, sound) are left alone.
 */
export function resetAppLocalData() {
  try {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith('g92:anglictina:') || k.startsWith('g92:anglictina-') || k.startsWith('anglictina_'))) keys.push(k);
    }
    for (const k of keys) localStorage.removeItem(k);
  } catch {
    /* storage blocked */
  }
  try {
    clearActivity('anglictina');
  } catch {
    /* ignore */
  }
}
