import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, removeFavorite, type FavoriteItem } from '../favorites';
import { speak } from '../tts';

function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  vocab: { label: 'Slovíčko', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  idiom: { label: 'Idiom', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  collocation: { label: 'Kolokace', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  irregular: { label: 'Neprav. sloveso', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  phrase: { label: 'Fráze', color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
};

export default function Favorites() {
  const navigate = useNavigate();
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setItems(getFavorites().sort((a, b) => b.addedAt - a.addedAt));
  }, []);

  const types = [...new Set(items.map((i) => i.type))];
  const filtered = filter === 'all' ? items : items.filter((i) => i.type === filter);

  function handleRemove(id: string) {
    removeFavorite(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <div className="flex items-center justify-between mb-1">
        <h1 className="page-title !mb-0">Oblíbené</h1>
        {items.length > 0 && (
          <button
            className="btn-ghost text-xs flex items-center gap-1"
            onClick={async () => {
              const text = filtered.map((i) => `${i.text} — ${i.translation}`).join('\n');
              await copyToClipboard(text);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
          >
            {copied ? '✓ Zkopírováno' : '📋 Kopírovat'}
          </button>
        )}
      </div>
      <p className="page-subtitle">Tvoje uložené slova a fráze ({items.length})</p>

      {types.length > 1 && (
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          <button
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === 'all' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            onClick={() => setFilter('all')}
          >
            Vše ({items.length})
          </button>
          {types.map((t) => {
            const tl = TYPE_LABELS[t];
            const count = items.filter((i) => i.type === t).length;
            return (
              <button
                key={t}
                className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${filter === t ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
                onClick={() => setFilter(t)}
              >
                {tl?.label || t} ({count})
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">⭐</div>
          <p className="text-slate-500 dark:text-slate-400">
            {items.length === 0
              ? 'Zatím nemáš žádné oblíbené. Přidej si slova ze slovníku nebo z vyhledávání.'
              : 'V tomto filtru nic není.'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => {
            const tl = TYPE_LABELS[item.type];
            return (
              <div key={item.id} className="card !p-3 flex items-start gap-3">
                <button
                  className="text-primary-500 hover:text-primary-700 mt-0.5 shrink-0"
                  onClick={() => speak(item.text, 0.9)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`badge text-[10px] ${tl?.color || ''}`}>{tl?.label || item.type}</span>
                  </div>
                  <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{item.text}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{item.translation}</div>
                </div>
                <button
                  className="text-red-400 hover:text-red-600 shrink-0 mt-1"
                  onClick={() => handleRemove(item.id)}
                  title="Odebrat z oblíbených"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
