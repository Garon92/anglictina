import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const DRILL_ROUTES = [
  { to: '/vocab', icon: '📝', label: 'Slovíčka' },
  { to: '/grammar', icon: '✏️', label: 'Gramatika' },
  { to: '/reading', icon: '📖', label: 'Čtení' },
  { to: '/listening', icon: '🎧', label: 'Poslech' },
  { to: '/irregular-verbs', icon: '🔄', label: 'Neprav. slovesa' },
  { to: '/word-order', icon: '🧱', label: 'Skládání vět' },
  { to: '/prepositions', icon: '📌', label: 'Předložky' },
  { to: '/articles', icon: '📐', label: 'Členy' },
  { to: '/confusables', icon: '🔀', label: 'Záměnná slova' },
  { to: '/phrasal-verbs', icon: '🧩', label: 'Fráze' },
  { to: '/conditionals', icon: '🔀', label: 'Podmínky' },
  { to: '/reported-speech', icon: '💬', label: 'Nepř. řeč' },
  { to: '/sentence-transform', icon: '🔄', label: 'Přeformulace' },
  { to: '/translation', icon: '🔤', label: 'Překlad' },
  { to: '/idioms', icon: '💎', label: 'Idiomy' },
  { to: '/matching', icon: '🃏', label: 'Pexeso' },
  { to: '/passive', icon: '🔄', label: 'Trpný rod' },
  { to: '/error-correction', icon: '❌', label: 'Oprav chybu' },
  { to: '/word-formation', icon: '🔧', label: 'Tvoření slov' },
  { to: '/mixed-quiz', icon: '🎲', label: 'Mix kvíz' },
  { to: '/speed', icon: '⚡', label: 'Rychlovka' },
  { to: '/mistakes', icon: '🔁', label: 'Opakuj chyby' },
];

const MORE_ROUTES = [
  { to: '/conversation', icon: '💬', label: 'Konverzace' },
  { to: '/writing', icon: '✍️', label: 'Psaní' },
  { to: '/tenses', icon: '⏱️', label: 'Časy' },
  { to: '/grammar-ref', icon: '📋', label: 'Přehled gram.' },
  { to: '/cheatsheet', icon: '🖨️', label: 'Tahák' },
  { to: '/exam', icon: '🎯', label: 'Zkouška' },
  { to: '/diagnostic', icon: '🩺', label: 'Diagnostika' },
  { to: '/study-plan', icon: '📅', label: 'Studijní plán' },
  { to: '/vocab-topics', icon: '📂', label: 'Témata' },
  { to: '/search', icon: '🔍', label: 'Hledání' },
  { to: '/favorites', icon: '⭐', label: 'Oblíbené' },
  { to: '/favorites-quiz', icon: '💛', label: 'Kvíz oblíbených' },
  { to: '/custom-words', icon: '📝', label: 'Vlastní slova' },
  { to: '/review', icon: '📊', label: 'Statistiky' },
  { to: '/settings', icon: '⚙️', label: 'Nastavení' },
];

const drillPaths = new Set(DRILL_ROUTES.map((r) => r.to));
const morePaths = new Set(MORE_ROUTES.map((r) => r.to));

export default function BottomNav() {
  const [menuOpen, setMenuOpen] = useState<'drill' | 'more' | null>(null);
  const location = useLocation();
  const path = location.pathname;

  const isDrillActive = drillPaths.has(path);
  const isMoreActive = morePaths.has(path);

  return (
    <>
      {/* Overlay menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <div
            className="absolute bottom-16 left-0 right-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 rounded-t-2xl shadow-xl max-h-[60vh] overflow-y-auto safe-bottom animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">
                {menuOpen === 'drill' ? 'Procvičování' : 'Nástroje & nastavení'}
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {(menuOpen === 'drill' ? DRILL_ROUTES : MORE_ROUTES).map((route) => (
                  <NavLink
                    key={route.to}
                    to={route.to}
                    onClick={() => setMenuOpen(null)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-1 p-3 rounded-xl transition-all ${
                        isActive
                          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`
                    }
                  >
                    <span className="text-xl">{route.icon}</span>
                    <span className="text-[10px] font-medium text-center leading-tight">{route.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 safe-bottom z-50">
        <div className="max-w-2xl mx-auto flex">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <HomeIcon active={isActive} />
                <span>Domů</span>
              </>
            )}
          </NavLink>

          <button
            onClick={() => setMenuOpen(menuOpen === 'drill' ? null : 'drill')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 text-xs font-medium transition-colors ${
              isDrillActive || menuOpen === 'drill' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <BookIcon active={isDrillActive || menuOpen === 'drill'} />
            <span>Učení</span>
          </button>

          <NavLink
            to="/review"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 text-xs font-medium transition-colors ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <ChartIcon active={isActive} />
                <span>Pokrok</span>
              </>
            )}
          </NavLink>

          <button
            onClick={() => setMenuOpen(menuOpen === 'more' ? null : 'more')}
            className={`flex-1 flex flex-col items-center gap-0.5 py-2 pt-2.5 text-xs font-medium transition-colors ${
              isMoreActive || menuOpen === 'more' ? 'text-primary-600 dark:text-primary-400' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <MenuIcon active={isMoreActive || menuOpen === 'more'} />
            <span>Více</span>
          </button>
        </div>
      </nav>
    </>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function BookIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function ChartIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function MenuIcon({ active }: { active: boolean }) {
  return (
    <svg className="w-6 h-6" fill={active ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={active ? 0 : 1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}
