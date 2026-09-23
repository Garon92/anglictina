import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSettings } from '../App';
import { VOCABULARY } from '../data/vocabulary';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { IDIOMS, COLLOCATIONS } from '../data/idioms';
import { PHRASAL_VERBS } from '../data/phrases';
import { GRAMMAR_EXERCISES, CATEGORY_NAMES } from '../data/grammar';
import { GRAMMAR_REFERENCE } from '../data/grammarReference';
import { speak } from '../tts';
import { toggleFavorite, useFavorites, type FavoriteItem } from '../favorites';
import { countLabel, plural } from '../kit';
import { EmptyState, PageHeader, SpeakButton } from '../components/ui';

/* ─── Search index ─────────────────────────────────────────────────── */

type Kind = 'vocab' | 'phrasal' | 'irregular' | 'idiom' | 'collocation' | 'grammarRef' | 'grammar';

const KINDS: { kind: Kind; title: string; icon: string; practice?: string }[] = [
  { kind: 'vocab', title: 'Slovíčka', icon: '🗂️', practice: '/vocab' },
  { kind: 'phrasal', title: 'Frázová slovesa', icon: '🧩', practice: '/phrasal-verbs' },
  { kind: 'irregular', title: 'Nepravidelná slovesa', icon: '🔁', practice: '/irregular-verbs' },
  { kind: 'idiom', title: 'Idiomy', icon: '💎', practice: '/idioms' },
  { kind: 'collocation', title: 'Kolokace', icon: '🔗', practice: '/idioms' },
  { kind: 'grammarRef', title: 'Gramatická pravidla', icon: '📋' },
  { kind: 'grammar', title: 'Gramatická cvičení', icon: '✏️', practice: '/grammar' },
];

interface Entry {
  kind: Kind;
  key: string;
  /** Main line (usually English). */
  primary: string;
  primaryLang: 'en' | 'cs';
  /** Translation / meaning (Czech). */
  secondary: string;
  /** Extra lines shown when the result is expanded. */
  details: { label?: string; text: string; lang?: 'en' | 'cs' }[];
  level?: string;
  speakText?: string;
  fav?: Omit<FavoriteItem, 'addedAt'>;
  link?: string;
  /* folded fields for matching */
  fPrimary: string;
  fAlts: string[];
  fHay: string;
}

/** Lower-case and strip diacritics, so "dum" finds "dům". */
function fold(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function makeEntry(e: Omit<Entry, 'fPrimary' | 'fAlts' | 'fHay'>, extra: string[] = []): Entry {
  const alts = [e.primary, ...e.secondary.split(/[,;/]|\s[–—-]\s/)].map((s) => fold(s.replace(/\(.*?\)/g, '')).trim()).filter(Boolean);
  return { ...e, fPrimary: fold(e.primary), fAlts: alts, fHay: ` ${fold([e.primary, e.secondary, ...extra].join(' '))}` };
}

let INDEX: Entry[] | null = null;

function buildIndex(): Entry[] {
  if (INDEX) return INDEX;
  const out: Entry[] = [];
  for (const w of VOCABULARY) {
    out.push(makeEntry({
      kind: 'vocab', key: `v-${w.id}`, primary: w.en, primaryLang: 'en', secondary: w.cs,
      details: [
        ...(w.phonetic ? [{ text: w.phonetic, lang: 'en' as const }] : []),
        ...(w.example ? [{ text: w.example, lang: 'en' as const }] : []),
        ...(w.exampleCs ? [{ text: w.exampleCs }] : []),
      ],
      speakText: w.en,
      fav: { id: `vocab_${w.id}`, type: 'vocab', text: w.en, translation: w.cs },
    }));
  }
  for (const p of PHRASAL_VERBS) {
    out.push(makeEntry({
      kind: 'phrasal', key: `p-${p.id}`, primary: p.verb, primaryLang: 'en', secondary: p.meaningCs, level: p.level,
      details: [{ text: p.example, lang: 'en' }, { text: p.exampleCs }],
      speakText: p.verb,
      fav: { id: `phrase_${p.id}`, type: 'phrase', text: p.verb, translation: p.meaningCs },
    }));
  }
  for (const v of IRREGULAR_VERBS) {
    const forms = `${v.base} — ${v.past} — ${v.pastParticiple}`;
    out.push(makeEntry({
      kind: 'irregular', key: `i-${v.id}`, primary: forms, primaryLang: 'en', secondary: v.meaningCs, level: v.level,
      details: v.example ? [{ text: v.example, lang: 'en' }] : [],
      speakText: `${v.base}, ${v.past}, ${v.pastParticiple}`,
      fav: { id: `irregular_${v.id}`, type: 'irregular', text: forms, translation: v.meaningCs },
    }, [v.base, v.past, v.pastParticiple]));
  }
  for (const i of IDIOMS) {
    out.push(makeEntry({
      kind: 'idiom', key: `d-${i.id}`, primary: i.idiom, primaryLang: 'en', secondary: i.meaningCs, level: i.level,
      details: [
        ...(i.meaningEn ? [{ label: 'Význam', text: i.meaningEn, lang: 'en' as const }] : []),
        ...(i.czechEquivalent ? [{ label: 'Česky se řekne', text: i.czechEquivalent }] : []),
        { text: i.example, lang: 'en' as const },
        ...(i.exampleCs ? [{ text: i.exampleCs }] : []),
      ],
      speakText: i.idiom,
      fav: { id: `idiom_${i.id}`, type: 'idiom', text: i.idiom, translation: i.meaningCs },
    }, [i.czechEquivalent ?? '']));
  }
  for (const c of COLLOCATIONS) {
    out.push(makeEntry({
      kind: 'collocation', key: `c-${c.id}`, primary: c.full, primaryLang: 'en', secondary: c.meaningCs, level: c.level,
      details: [
        { text: c.example, lang: 'en' },
        ...(c.wrongVerb ? [{ label: 'Pozor', text: `ne „${c.wrongVerb} ${c.collocate}“` }] : []),
      ],
      speakText: c.full,
      fav: { id: `collocation_${c.id}`, type: 'collocation', text: c.full, translation: c.meaningCs },
    }));
  }
  for (const g of GRAMMAR_REFERENCE) {
    out.push(makeEntry({
      kind: 'grammarRef', key: `r-${g.id}`, primary: g.titleCs, primaryLang: 'cs', secondary: g.titleEn, level: g.level,
      details: [], link: `/grammar-ref?t=${g.id}`,
    }));
  }
  for (const ex of GRAMMAR_EXERCISES) {
    out.push(makeEntry({
      kind: 'grammar', key: `g-${ex.id}`, primary: ex.prompt, primaryLang: ex.type === 'translate' ? 'cs' : 'en',
      secondary: `Odpověď: ${ex.answer.split('|')[0]}`, level: ex.level,
      details: [
        { label: 'Téma', text: CATEGORY_NAMES[ex.category] || ex.category },
        ...(ex.options ? [{ label: 'Možnosti', text: ex.options.join(' · '), lang: 'en' as const }] : []),
        ...(ex.explanationCs ? [{ text: ex.explanationCs }] : []),
      ],
    }, [ex.answer]));
  }
  INDEX = out;
  return out;
}

/** 0 = exact, 1 = starts with, 2 = whole word, 3 = anywhere; -1 = no match. */
function score(e: Entry, q: string): number {
  if (!e.fHay.includes(q)) return -1;
  if (e.fAlts.includes(q)) return 0;
  if (e.fPrimary.startsWith(q) || e.fAlts.some((a) => a.startsWith(q))) return 1;
  if (e.fHay.includes(` ${q}`)) return 2;
  return 3;
}

function search(query: string): Map<Kind, Entry[]> {
  const q = fold(query.trim());
  const groups = new Map<Kind, Entry[]>();
  if (q.length < 2) return groups;
  const scored = new Map<Kind, { e: Entry; s: number }[]>();
  for (const e of buildIndex()) {
    const s = score(e, q);
    if (s < 0) continue;
    const list = scored.get(e.kind) ?? [];
    list.push({ e, s });
    scored.set(e.kind, list);
  }
  for (const { kind } of KINDS) {
    const list = scored.get(kind);
    if (!list) continue;
    list.sort((a, b) => a.s - b.s || a.e.primary.length - b.e.primary.length);
    groups.set(kind, list.map((x) => x.e));
  }
  return groups;
}

/* ─── Small pieces ─────────────────────────────────────────────────── */

/** Highlights the (diacritics-insensitive) match of `q` in `text`. */
function Highlight({ text, q }: { text: string; q: string }) {
  if (!q) return <>{text}</>;
  const chars = Array.from(text);
  let folded = '';
  const map: number[] = [];
  chars.forEach((c, i) => {
    for (const f of fold(c)) {
      folded += f;
      map.push(i);
    }
  });
  const at = folded.indexOf(q);
  if (at < 0) return <>{text}</>;
  const start = map[at];
  const end = (map[at + q.length - 1] ?? chars.length - 1) + 1;
  return (
    <>
      {chars.slice(0, start).join('')}
      <mark className="rounded-sm bg-warning-soft text-inherit">{chars.slice(start, end).join('')}</mark>
      {chars.slice(end).join('')}
    </>
  );
}

function HeartButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      className={`grid h-11 w-11 shrink-0 place-items-center rounded-full transition-colors hover:bg-surface-2 ${active ? 'text-danger' : 'text-subtle hover:text-danger'}`}
      aria-pressed={active}
      aria-label={active ? `Odebrat z oblíbených: ${label}` : `Přidat do oblíbených: ${label}`}
      title={active ? 'Odebrat z oblíbených' : 'Přidat do oblíbených'}
      onClick={onClick}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
        <path d="M12 20.5 10.6 19.2C5.6 14.7 2.5 11.9 2.5 8.4 2.5 5.6 4.7 3.5 7.4 3.5c1.6 0 3.1.7 4.1 1.9 1-1.2 2.5-1.9 4.1-1.9 2.7 0 4.9 2.1 4.9 4.9 0 3.5-3.1 6.3-8.1 10.8z" />
      </svg>
    </button>
  );
}

const EXAMPLES = ['house', 'dům', 'went', 'give up', 'make', 'piece of cake', 'predlozky', 'present perfect'];

const PER_GROUP = 5;
const PER_GROUP_FILTERED = 30;
const MORE_STEP = 20;

/* ─── Page ─────────────────────────────────────────────────────────── */

export default function GlobalSearch() {
  const { settings } = useSettings();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState(() => params.get('q') ?? '');
  const [filter, setFilter] = useState<Kind | 'all'>('all');
  const [extra, setExtra] = useState<Partial<Record<Kind, number>>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const favorites = useFavorites();

  const deferred = useDeferredValue(query);
  const q = fold(deferred.trim());
  const groups = useMemo(() => search(deferred), [deferred]);
  const total = [...groups.values()].reduce((n, l) => n + l.length, 0);
  const activeFilter = filter !== 'all' && !groups.has(filter) ? 'all' : filter;

  const isFav = useMemo(() => {
    const ids = new Set(favorites.map((f) => f.id));
    const texts = new Set(favorites.map((f) => `${f.type}|${f.text.trim().toLowerCase()}`));
    return (f: Omit<FavoriteItem, 'addedAt'>) => ids.has(f.id) || texts.has(`${f.type}|${f.text.trim().toLowerCase()}`);
  }, [favorites]);

  useEffect(() => {
    inputRef.current?.focus({ preventScroll: true });
  }, []);

  // Keep the query in the URL (replace, not push) so coming back to the search restores it.
  const urlQuery = params.get('q') ?? '';
  useEffect(() => {
    const next = query.trim();
    if (next === urlQuery) return;
    const t = window.setTimeout(() => setParams(next ? { q: next } : {}, { replace: true }), 300);
    return () => window.clearTimeout(t);
  }, [query, urlQuery, setParams]);

  function changeQuery(v: string) {
    setQuery(v);
    setExpanded(null);
    setExtra({});
    setFilter('all');
  }

  const counts = useMemo(() => {
    const s = {
      vocab: VOCABULARY.length,
      irregular: IRREGULAR_VERBS.length,
      phrasal: PHRASAL_VERBS.length,
      idiom: IDIOMS.length,
      collocation: COLLOCATIONS.length,
      ref: GRAMMAR_REFERENCE.length,
      grammar: GRAMMAR_EXERCISES.length,
    };
    return [
      countLabel(s.vocab, 'slovíčko', 'slovíčka', 'slovíček'),
      countLabel(s.phrasal, 'frázové sloveso', 'frázová slovesa', 'frázových sloves'),
      countLabel(s.irregular, 'nepravidelné sloveso', 'nepravidelná slovesa', 'nepravidelných sloves'),
      countLabel(s.idiom, 'idiom', 'idiomy', 'idiomů'),
      countLabel(s.collocation, 'kolokace', 'kolokace', 'kolokací'),
      countLabel(s.ref, 'gramatické pravidlo', 'gramatická pravidla', 'gramatických pravidel'),
      countLabel(s.grammar, 'gramatické cvičení', 'gramatická cvičení', 'gramatických cvičení'),
    ];
  }, []);

  const tooShort = q.length < 2;

  return (
    <div className="page-container">
      <PageHeader back="/practice" icon="🔍" title="Hledání" subtitle="Prohledej slovíčka, frázová a nepravidelná slovesa, idiomy, kolokace i gramatiku." />

      <form role="search" className="relative mb-4" onSubmit={(e) => { e.preventDefault(); inputRef.current?.blur(); }}>
        <label htmlFor="global-search" className="sr-only">Hledat anglicky nebo česky</label>
        <svg className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-subtle" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m20 20-4.2-4.2" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id="global-search"
          type="search"
          enterKeyHint="search"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="input !min-h-[52px] !pr-12 !pl-12 text-lg [&::-webkit-search-cancel-button]:appearance-none"
          placeholder="Hledej anglicky nebo česky…"
          value={query}
          onChange={(e) => changeQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Escape' && query) {
              e.preventDefault();
              changeQuery('');
            }
          }}
        />
        {query && (
          <button
            type="button"
            className="absolute top-1/2 right-1 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-surface-2 hover:text-fg"
            aria-label="Vymazat hledání"
            onClick={() => {
              changeQuery('');
              inputRef.current?.focus();
            }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </form>

      {tooShort ? (
        <div className="card !p-6 text-center">
          <div className="text-4xl" aria-hidden="true">📚</div>
          <h2 className="mt-2 text-lg font-black text-fg">{q.length === 1 ? 'Ještě aspoň jedno písmeno' : 'Co hledáš?'}</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted">
            Piš anglicky nebo česky — diakritiku psát nemusíš („dum“ najde i „dům“). Hledá se i v minulých tvarech sloves a v gramatice.
          </p>
          <div className="mt-4">
            <p className="eyebrow mb-2">Zkus třeba</p>
            <div className="flex flex-wrap justify-center gap-2">
              {EXAMPLES.map((ex) => (
                <button key={ex} type="button" className="g92-chip" onClick={() => changeQuery(ex)}>
                  {ex}
                </button>
              ))}
            </div>
          </div>
          <p className="mx-auto mt-5 max-w-md text-xs leading-relaxed text-subtle">Prohledávám: {counts.join(', ')}.</p>
        </div>
      ) : total === 0 ? (
        <EmptyState icon="🔎" title={`Nic jsme nenašli pro „${deferred.trim()}“`}>
          Zkus kratší výraz, jiný tvar slova (třeba <em lang="en">go</em> místo <em lang="en">goes</em>) nebo hledej česky.
        </EmptyState>
      ) : (
        <>
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0" role="group" aria-label="Typ výsledků">
            <button type="button" className="g92-chip shrink-0 whitespace-nowrap" aria-pressed={activeFilter === 'all'} onClick={() => setFilter('all')}>
              Vše ({total})
            </button>
            {KINDS.filter((k) => groups.has(k.kind)).map((k) => (
              <button key={k.kind} type="button" className="g92-chip shrink-0 whitespace-nowrap" aria-pressed={activeFilter === k.kind} onClick={() => setFilter(k.kind)}>
                {k.title} ({groups.get(k.kind)!.length})
              </button>
            ))}
          </div>

          <p className="sr-only" aria-live="polite">
            {total} {plural(total, 'výsledek', 'výsledky', 'výsledků')}
          </p>

          <div className="space-y-6">
            {KINDS.filter((k) => groups.has(k.kind) && (activeFilter === 'all' || activeFilter === k.kind)).map((k) => {
              const list = groups.get(k.kind)!;
              const limit = (activeFilter === 'all' ? PER_GROUP : PER_GROUP_FILTERED) + (extra[k.kind] ?? 0);
              const shown = list.slice(0, limit);
              const rest = list.length - shown.length;
              return (
                <section key={k.kind} aria-labelledby={`grp-${k.kind}`}>
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <h2 id={`grp-${k.kind}`} className="text-base font-black text-fg">
                      <span aria-hidden="true">{k.icon}</span> {k.title}
                      <span className="ml-1.5 text-sm font-medium text-muted">{list.length}</span>
                    </h2>
                    {k.practice && (
                      <Link to={k.practice} className="shrink-0 text-sm font-bold">Procvičit →</Link>
                    )}
                  </div>
                  <ul className="space-y-2">
                    {shown.map((e) => (
                      <ResultRow
                        key={e.key}
                        entry={e}
                        q={q}
                        expanded={expanded === e.key}
                        onToggle={() => setExpanded(expanded === e.key ? null : e.key)}
                        fav={e.fav ? isFav(e.fav) : false}
                        onSpeak={e.speakText ? () => void speak(e.speakText!, settings.ttsRate) : undefined}
                      />
                    ))}
                  </ul>
                  {rest > 0 && (
                    <button
                      type="button"
                      className="btn-ghost btn-sm mt-2 w-full"
                      onClick={() => setExtra((p) => ({ ...p, [k.kind]: (p[k.kind] ?? 0) + MORE_STEP }))}
                    >
                      Zobrazit více ({rest})
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function ResultRow({ entry: e, q, expanded, onToggle, fav, onSpeak }: {
  entry: Entry;
  q: string;
  expanded: boolean;
  onToggle: () => void;
  fav: boolean;
  onSpeak?: () => void;
}) {
  const hasDetails = e.details.length > 0;
  const body: ReactNode = (
    <>
      <span className="block font-bold break-words text-fg" lang={e.primaryLang}>
        <Highlight text={e.primary} q={q} />
      </span>
      <span className="block text-sm break-words text-muted" lang={e.primaryLang === 'en' ? 'cs' : 'en'}>
        <Highlight text={e.secondary} q={q} />
      </span>
    </>
  );
  const badge = e.level ? <span className="badge hidden shrink-0 sm:inline-flex">{e.level}</span> : null;

  return (
    <li className="card !p-0">
      <div className="flex items-center gap-1 py-1 pr-1.5 pl-1">
        {e.link ? (
          <Link to={e.link} className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 no-underline hover:bg-surface-2">
            <span className="min-w-0 flex-1">{body}</span>
            {badge}
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle" aria-hidden="true">
              <path d="m9 6 6 6-6 6" />
            </svg>
          </Link>
        ) : hasDetails ? (
          <button
            type="button"
            className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 rounded-md px-3 py-2 text-left hover:bg-surface-2"
            aria-expanded={expanded}
            onClick={onToggle}
          >
            <span className="min-w-0 flex-1">{body}</span>
            {badge}
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 text-subtle transition-transform ${expanded ? 'rotate-180' : ''}`} aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        ) : (
          <div className="flex min-h-[48px] min-w-0 flex-1 items-center gap-2 px-3 py-2">
            <span className="min-w-0 flex-1">{body}</span>
            {badge}
          </div>
        )}
        {onSpeak && <SpeakButton onClick={onSpeak} label={`Přehrát: ${e.speakText}`} />}
        {e.fav && (
          <HeartButton
            active={fav}
            label={e.fav.text}
            onClick={() => toggleFavorite(e.fav!)}
          />
        )}
      </div>
      {expanded && hasDetails && (
        <div className="mx-4 mb-3 space-y-1 rounded-md bg-surface-2 px-3 py-2.5 text-sm">
          {e.details.map((d, i) => (
            <p key={i} className={d.lang === 'en' ? 'text-fg italic' : 'text-muted'} lang={d.lang}>
              {d.label && <span className="font-bold not-italic text-muted">{d.label}: </span>}
              {d.text}
            </p>
          ))}
        </div>
      )}
    </li>
  );
}
