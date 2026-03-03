import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { VOCABULARY } from '../data/vocabulary';
import { IRREGULAR_VERBS } from '../data/irregularVerbs';
import { IDIOMS, COLLOCATIONS } from '../data/idioms';
import { GRAMMAR_EXERCISES } from '../data/grammar';
import { speak } from '../tts';

interface SearchResult {
  type: 'vocab' | 'irregular' | 'idiom' | 'collocation' | 'grammar';
  primary: string;
  secondary: string;
  detail?: string;
  link?: string;
}

const TYPE_BADGES: Record<string, { label: string; color: string }> = {
  vocab: { label: 'Slovíčko', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  irregular: { label: 'Neprav. sloveso', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
  idiom: { label: 'Idiom', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
  collocation: { label: 'Kolokace', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  grammar: { label: 'Gramatika', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
};

function search(query: string): SearchResult[] {
  if (query.length < 2) return [];
  const q = query.toLowerCase();
  const results: SearchResult[] = [];
  const limit = 50;

  for (const w of VOCABULARY) {
    if (results.length >= limit) break;
    if (w.en.toLowerCase().includes(q) || w.cs.toLowerCase().includes(q)) {
      results.push({
        type: 'vocab',
        primary: w.en,
        secondary: w.cs,
        detail: w.example || undefined,
      });
    }
  }

  for (const v of IRREGULAR_VERBS) {
    if (results.length >= limit) break;
    if (v.base.toLowerCase().includes(q) || v.past.toLowerCase().includes(q) ||
        v.pastParticiple.toLowerCase().includes(q) || v.meaningCs.toLowerCase().includes(q)) {
      results.push({
        type: 'irregular',
        primary: `${v.base} — ${v.past} — ${v.pastParticiple}`,
        secondary: v.meaningCs,
        detail: v.example,
      });
    }
  }

  for (const id of IDIOMS) {
    if (results.length >= limit) break;
    if (id.idiom.toLowerCase().includes(q) || id.meaningCs.toLowerCase().includes(q)) {
      results.push({
        type: 'idiom',
        primary: id.idiom,
        secondary: id.meaningCs,
        detail: id.example,
      });
    }
  }

  for (const col of COLLOCATIONS) {
    if (results.length >= limit) break;
    if (col.full.toLowerCase().includes(q) || col.meaningCs.toLowerCase().includes(q)) {
      results.push({
        type: 'collocation',
        primary: col.full,
        secondary: col.meaningCs,
        detail: col.example,
      });
    }
  }

  for (const ex of GRAMMAR_EXERCISES) {
    if (results.length >= limit) break;
    if (ex.prompt.toLowerCase().includes(q) || ex.answer.toLowerCase().includes(q)) {
      results.push({
        type: 'grammar',
        primary: ex.prompt,
        secondary: `Odpověď: ${ex.answer}`,
        detail: ex.explanationCs,
      });
    }
  }

  return results;
}

export default function GlobalSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const results = useMemo(() => search(query), [query]);

  const handleSpeak = useCallback((text: string) => {
    speak(text, 0.9);
  }, []);

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <h1 className="page-title">Hledání</h1>
      <p className="page-subtitle">Prohledej slovíčka, slovesa, idiomy i gramatiku</p>

      <div className="relative mb-6">
        <input
          type="text"
          className="input text-lg pl-10"
          placeholder="Hledej anglicky nebo česky..."
          value={query}
          onChange={(e) => { setQuery(e.target.value); setExpanded(null); }}
          autoFocus
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {query && (
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            onClick={() => setQuery('')}
          >
            ✕
          </button>
        )}
      </div>

      {query.length >= 2 && (
        <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
          {results.length} výsledk{results.length === 1 ? 'ek' : results.length < 5 ? 'y' : 'ů'}
        </p>
      )}

      <div className="space-y-2">
        {results.map((r, i) => {
          const badge = TYPE_BADGES[r.type];
          const isExpanded = expanded === i;
          return (
            <button
              key={i}
              className="card w-full text-left !p-3 hover:shadow-md transition-shadow"
              onClick={() => setExpanded(isExpanded ? null : i)}
            >
              <div className="flex items-start gap-2">
                <span className={`badge text-[10px] shrink-0 mt-0.5 ${badge.color}`}>{badge.label}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{r.primary}</span>
                    {r.type === 'vocab' && (
                      <button
                        className="text-primary-500 hover:text-primary-700 shrink-0"
                        onClick={(e) => { e.stopPropagation(); handleSpeak(r.primary); }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.secondary}</div>
                  {isExpanded && r.detail && (
                    <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-600 dark:text-slate-300 italic">
                      {r.detail}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {query.length >= 2 && results.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-slate-500 dark:text-slate-400">Nic nenalezeno pro "{query}"</p>
        </div>
      )}

      {query.length < 2 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-slate-500 dark:text-slate-400">Napiš alespoň 2 znaky pro vyhledávání</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2">
            Prohledává: ~2800 slov, 100 neprav. sloves, 60 idiomů, 50 kolokací, 400+ gram. cvičení
          </p>
        </div>
      )}
    </div>
  );
}
