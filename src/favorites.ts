const STORAGE_KEY = 'anglictina_favorites';

export interface FavoriteItem {
  id: string;
  type: 'vocab' | 'idiom' | 'collocation' | 'irregular' | 'phrase';
  text: string;
  translation: string;
  addedAt: number;
}

function load(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function getFavorites(): FavoriteItem[] {
  return load();
}

export function addFavorite(item: Omit<FavoriteItem, 'addedAt'>): void {
  const items = load();
  if (items.some((f) => f.id === item.id)) return;
  items.push({ ...item, addedAt: Date.now() });
  save(items);
}

export function removeFavorite(id: string): void {
  const items = load().filter((f) => f.id !== id);
  save(items);
}

export function isFavorite(id: string): boolean {
  return load().some((f) => f.id === id);
}

export function toggleFavorite(item: Omit<FavoriteItem, 'addedAt'>): boolean {
  if (isFavorite(item.id)) {
    removeFavorite(item.id);
    return false;
  }
  addFavorite(item);
  return true;
}
