import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { useSettings } from '../App';
import { addFavorite, removeFavorite, useFavorites, type FavoriteItem } from '../favorites';
import { speak } from '../tts';
import { plural, toast } from '../kit';
import { EmptyState, PageHeader, SpeakButton } from '../components/ui';

const TYPE_META: Record<FavoriteItem['type'], { label: string; cls: string }> = {
  vocab: { label: 'Slovíčko', cls: 'bg-info-soft text-info' },
  phrase: { label: 'Fráze', cls: 'bg-accent-soft text-accent-text' },
  irregular: { label: 'Neprav. sloveso', cls: 'bg-warning-soft text-warning' },
  idiom: { label: 'Idiom', cls: 'bg-success-soft text-success' },
  collocation: { label: 'Kolokace', cls: 'bg-danger-soft text-danger' },
};
const TYPE_ORDER = Object.keys(TYPE_META);

/** The favourites quiz needs at least this many items. */
const QUIZ_MIN = 4;

function typeMeta(type: string) {
  return TYPE_META[type as FavoriteItem['type']] ?? { label: type, cls: '' };
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy way */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export default function Favorites() {
  const { settings } = useSettings();
  const favorites = useFavorites();
  const [filter, setFilter] = useState<string>('all');

  // Newest first (copy — never sort the shared cached array in place).
  const items = useMemo(() => [...favorites].sort((a, b) => b.addedAt - a.addedAt), [favorites]);
  const types = useMemo(
    () => [...new Set(items.map((i) => i.type))].sort((a, b) => (TYPE_ORDER.indexOf(a) + 1 || 99) - (TYPE_ORDER.indexOf(b) + 1 || 99)),
    [items],
  );
  // A filter whose last item was removed falls back to "Vše".
  const activeFilter = filter !== 'all' && !types.includes(filter as FavoriteItem['type']) ? 'all' : filter;
  const filtered = activeFilter === 'all' ? items : items.filter((i) => i.type === activeFilter);

  function handleRemove(item: FavoriteItem) {
    removeFavorite(item.id);
    if (item.type === activeFilter && !items.some((i) => i.id !== item.id && i.type === item.type)) setFilter('all');
    toast(`Odebráno: ${item.text}`, {
      action: {
        label: 'Vrátit',
        onClick: () => addFavorite({ id: item.id, type: item.type, text: item.text, translation: item.translation }),
      },
    });
  }

  async function handleCopy() {
    const text = filtered.map((i) => `${i.text} — ${i.translation}`).join('\n');
    const ok = await copyText(text);
    if (ok) toast(`Zkopírováno do schránky (${filtered.length})`, { variant: 'success' });
    else toast('Kopírování se nepovedlo — prohlížeč nepovolil přístup ke schránce.', { variant: 'danger' });
  }

  return (
    <div className="page-container">
      <PageHeader
        back="/practice"
        icon="⭐"
        title="Oblíbené"
        subtitle={items.length ? `Tvoje uložená slova a fráze (${items.length})` : 'Tvoje uložená slova a fráze'}
        actions={
          items.length > 0 ? (
            <button type="button" className="btn-secondary btn-sm !min-h-[44px]" onClick={() => void handleCopy()}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="11" height="11" rx="2" />
                <path d="M5 15V6a2 2 0 0 1 2-2h9" />
              </svg>
              Kopírovat
            </button>
          ) : undefined
        }
      />

      {items.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="Zatím nemáš žádné oblíbené"
          action={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/search" className="btn-primary">🔍 Hledat slova</Link>
              <Link to="/vocab-topics" className="btn-secondary">🧭 Slovíčka podle témat</Link>
            </div>
          }
        >
          Klepni na srdíčko u slovíčka ve slovníku, v tématech nebo ve vyhledávání — uložená slova se ti objeví tady a můžeš si je procvičit v kvízu.
        </EmptyState>
      ) : (
        <>
          <section className="card g92-card--accent mb-5 flex flex-wrap items-center gap-3 !p-4">
            <span className="text-3xl" aria-hidden="true">💛</span>
            <div className="min-w-0 flex-1">
              <h2 className="font-black text-fg">Kvíz z oblíbených</h2>
              <p className="text-sm text-muted">
                {items.length >= QUIZ_MIN
                  ? 'Procvič si uložená slova v krátkém kvízu.'
                  : `Kvíz se odemkne od ${QUIZ_MIN} uložených položek — chybí ${QUIZ_MIN - items.length}.`}
              </p>
            </div>
            {items.length >= QUIZ_MIN && (
              <Link to="/favorites-quiz" className="btn-primary">Spustit kvíz</Link>
            )}
          </section>

          {types.length > 1 && (
            <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filtr podle typu">
              <button type="button" className="g92-chip" aria-pressed={activeFilter === 'all'} onClick={() => setFilter('all')}>
                Vše ({items.length})
              </button>
              {types.map((t) => (
                <button key={t} type="button" className="g92-chip" aria-pressed={activeFilter === t} onClick={() => setFilter(t)}>
                  {typeMeta(t).label} ({items.filter((i) => i.type === t).length})
                </button>
              ))}
            </div>
          )}

          <ul className="card divide-y divide-border !py-1" aria-label={`${filtered.length} ${plural(filtered.length, 'položka', 'položky', 'položek')}`}>
            {filtered.map((item) => {
              const meta = typeMeta(item.type);
              return (
                <li key={item.id} className="flex items-center gap-3 py-3">
                  <SpeakButton onClick={() => void speak(item.text, settings.ttsRate)} label={`Přehrát: ${item.text}`} />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold break-words text-fg" lang="en">{item.text}</p>
                    <p className="text-sm break-words text-muted">{item.translation}</p>
                    <span className={`badge mt-1 sm:hidden ${meta.cls}`}>{meta.label}</span>
                  </div>
                  <span className={`badge hidden shrink-0 sm:inline-flex ${meta.cls}`}>{meta.label}</span>
                  <button
                    type="button"
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-subtle transition-colors hover:bg-danger-soft hover:text-danger"
                    onClick={() => handleRemove(item)}
                    aria-label={`Odebrat z oblíbených: ${item.text}`}
                    title="Odebrat z oblíbených"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
                    </svg>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
