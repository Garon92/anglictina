import { useSyncExternalStore } from 'react';

const STORAGE_KEY = 'anglictina_favorites';
const EVENT = 'anglictina:favorites';

export interface FavoriteItem {
  id: string;
  type: 'vocab' | 'idiom' | 'collocation' | 'irregular' | 'phrase';
  text: string;
  translation: string;
  addedAt: number;
}

let cache: FavoriteItem[] | null = null;

function load(): FavoriteItem[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? parsed.filter((x) => x && typeof x.text === 'string') : [];
  } catch {
    cache = [];
  }
  return cache!;
}

function save(items: FavoriteItem[]) {
  cache = items;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* storage full / blocked */
  }
  window.dispatchEvent(new Event(EVENT));
}

/** The same word saved from different screens used different ids — match by type + text too. */
function same(a: Pick<FavoriteItem, 'id' | 'type' | 'text'>, b: Pick<FavoriteItem, 'id' | 'type' | 'text'>) {
  return a.id === b.id || (a.type === b.type && a.text.trim().toLowerCase() === b.text.trim().toLowerCase());
}

export function getFavorites(): FavoriteItem[] {
  return load();
}

export function addFavorite(item: Omit<FavoriteItem, 'addedAt'>): void {
  const items = load();
  if (items.some((f) => same(f, item))) return;
  save([...items, { ...item, addedAt: Date.now() }]);
}

export function removeFavorite(id: string): void {
  const target = load().find((f) => f.id === id);
  save(load().filter((f) => f.id !== id && !(target && same(f, target))));
}

export function isFavorite(id: string, match?: Pick<FavoriteItem, 'type' | 'text'>): boolean {
  return load().some((f) => f.id === id || (match && same(f, { id, ...match })));
}

export function toggleFavorite(item: Omit<FavoriteItem, 'addedAt'>): boolean {
  const items = load();
  if (items.some((f) => same(f, item))) {
    save(items.filter((f) => !same(f, item)));
    return false;
  }
  save([...items, { ...item, addedAt: Date.now() }]);
  return true;
}

function subscribe(cb: () => void) {
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener('storage', onStorage);
  };
}

/** Reactive list of favorites. */
export function useFavorites(): FavoriteItem[] {
  return useSyncExternalStore(subscribe, load, load);
}
