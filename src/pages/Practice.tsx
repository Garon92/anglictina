import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { GROUPS, MODULES, type ModuleDef } from '../modules';
import { getDrillSessions } from '../db';
import { moduleStats, type ModuleStat } from '../recommend';
import { getMistakeSummary } from '../progress';
import { ModuleCard } from '../components/ui';

function fold(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export default function Practice() {
  const [stats, setStats] = useState<Record<string, ModuleStat>>({});
  const [mistakesDue, setMistakesDue] = useState(0);
  const [query, setQuery] = useState('');

  useEffect(() => {
    getDrillSessions().then((s) => setStats(moduleStats(s))).catch(() => {});
    getMistakeSummary().then((m) => setMistakesDue(m.due)).catch(() => {});
  }, []);

  const q = fold(query.trim());
  const filtered = useMemo(
    () => (q ? MODULES.filter((m) => fold(`${m.title} ${m.desc} ${m.keywords ?? ''}`).includes(q)) : MODULES),
    [q],
  );

  return (
    <div className="page-container page-container--wide">
      <header className="mb-5">
        <h1 className="page-title">Procvičování</h1>
        <p className="text-sm text-muted">Vyber si oblast. Tečka u cvičení ukazuje tvou úspěšnost.</p>
      </header>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Hledat cvičení</span>
          <svg className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" strokeLinecap="round" />
          </svg>
          <input
            className="input !pl-10"
            type="search"
            placeholder="Hledat cvičení… (např. členy, podmínky, poslech)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <Link to="/mistakes" className={`btn-secondary ${mistakesDue > 0 ? '!border-warning' : ''}`}>
          🔁 Opakovat chyby{mistakesDue > 0 ? ` (${mistakesDue})` : ''}
        </Link>
      </div>

      {filtered.length === 0 && <p className="card text-center text-muted">Nic takového nemáme. Zkus jiné slovo.</p>}

      <div className="space-y-7">
        {GROUPS.map((g) => {
          const items = filtered.filter((m) => m.group === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} aria-labelledby={`g-${g.id}`}>
              <div className="mb-2.5 flex items-baseline gap-2">
                <h2 id={`g-${g.id}`} className="text-lg font-black text-fg">
                  <span aria-hidden="true">{g.icon}</span> {g.title}
                </h2>
                <span className="text-sm text-muted">{g.desc}</span>
              </div>
              <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((m) => (
                  <ModuleTile key={m.id} m={m} st={stats[m.id]} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <section className="card g92-card--accent mt-8 flex flex-wrap items-center gap-4 !p-5">
        <span className="text-4xl" aria-hidden="true">🎯</span>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-black text-fg">Připraven/a na opravdový test?</h2>
          <p className="text-sm text-muted">Cvičné didaktické testy ve formátu CERMAT, s časomírou a bodováním.</p>
        </div>
        <Link to="/exam" className="btn-primary">Maturita nanečisto</Link>
      </section>
    </div>
  );
}

function ModuleTile({ m, st }: { m: ModuleDef; st?: ModuleStat }) {
  const acc = st && st.total > 0 ? st.correct / st.total : undefined;
  const meta = st ? `${st.sessions}×` : undefined;
  return <ModuleCard to={m.path} icon={m.icon} title={m.title} desc={m.desc} meta={meta} accuracy={acc} />;
}
