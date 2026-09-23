import { NavLink, useLocation } from 'react-router';
import { getModuleByPath } from '../modules';

type Section = 'home' | 'practice' | 'exam' | 'progress';

interface NavItem {
  id: Section;
  to: string;
  label: string;
  icon: (active: boolean) => React.ReactNode;
}

const stroke = (active: boolean) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: active ? 2.2 : 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'home',
    to: '/',
    label: 'Dnes',
    icon: (a) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke(a)}>
        <path d="M3.5 10.5 12 4l8.5 6.5" />
        <path d="M5.5 9.5V19a1 1 0 0 0 1 1H10v-5h4v5h3.5a1 1 0 0 0 1-1V9.5" fill={a ? 'currentColor' : 'none'} fillOpacity={a ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    id: 'practice',
    to: '/practice',
    label: 'Procvičování',
    icon: (a) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke(a)}>
        <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 1 4 17.5z" fill={a ? 'currentColor' : 'none'} fillOpacity={a ? 0.15 : 0} />
        <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 0 1.5-1.5z" fill={a ? 'currentColor' : 'none'} fillOpacity={a ? 0.15 : 0} />
      </svg>
    ),
  },
  {
    id: 'exam',
    to: '/exam',
    label: 'Maturita',
    icon: (a) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke(a)}>
        <path d="M12 4 2.5 8.5 12 13l9.5-4.5z" fill={a ? 'currentColor' : 'none'} fillOpacity={a ? 0.15 : 0} />
        <path d="M6.5 10.8V15c0 1.4 2.5 3 5.5 3s5.5-1.6 5.5-3v-4.2" />
        <path d="M21.5 8.5V14" />
      </svg>
    ),
  },
  {
    id: 'progress',
    to: '/review',
    label: 'Pokrok',
    icon: (a) => (
      <svg viewBox="0 0 24 24" aria-hidden="true" {...stroke(a)}>
        <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
        {a && <path d="M4 20V10M10 20V4M16 20v-7" strokeWidth={4} opacity={0.18} />}
      </svg>
    ),
  },
];

const PRACTICE_EXTRA = new Set(['/practice', '/search', '/favorites', '/custom-words', '/grammar-ref', '/cheatsheet', '/study-plan']);

export function sectionOf(pathname: string): Section | null {
  if (pathname === '/' || pathname === '/mistakes') return 'home';
  if (pathname.startsWith('/exam')) return 'exam';
  if (pathname.startsWith('/review')) return 'progress';
  if (PRACTICE_EXTRA.has(pathname) || getModuleByPath(pathname)) return 'practice';
  return null;
}

/** Bottom tab bar (phones/tablets). */
export function TabBar() {
  const { pathname } = useLocation();
  const section = sectionOf(pathname);
  return (
    <nav className="app-nav app-tabbar" aria-label="Hlavní navigace">
      {NAV_ITEMS.map((item) => {
        const active = section === item.id;
        return (
          <NavLink key={item.id} to={item.to} className="app-tabbar__item" aria-current={active ? 'page' : undefined}>
            <span className="app-tabbar__icon">{item.icon(active)}</span>
            <span className="app-tabbar__label">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}

/** Side navigation (desktop). */
export function SideNav({ mistakesDue }: { mistakesDue: number }) {
  const { pathname } = useLocation();
  const section = sectionOf(pathname);
  return (
    <nav className="app-nav app-sidenav" aria-label="Hlavní navigace">
      <ul>
        {NAV_ITEMS.map((item) => {
          const active = section === item.id;
          return (
            <li key={item.id}>
              <NavLink to={item.to} className="app-sidenav__item" aria-current={active ? 'page' : undefined}>
                <span className="app-sidenav__icon">{item.icon(active)}</span>
                <span>{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
      <div className="app-sidenav__sep" />
      <ul>
        <li>
          <NavLink to="/mistakes" className="app-sidenav__item app-sidenav__item--small" aria-current={pathname === '/mistakes' ? 'page' : undefined}>
            <span className="app-sidenav__emoji" aria-hidden="true">🔁</span>
            <span className="flex-1">Chyby k opakování</span>
            {mistakesDue > 0 && <span className="app-sidenav__count">{mistakesDue}</span>}
          </NavLink>
        </li>
        <li>
          <NavLink to="/search" className="app-sidenav__item app-sidenav__item--small" aria-current={pathname === '/search' ? 'page' : undefined}>
            <span className="app-sidenav__emoji" aria-hidden="true">🔍</span>
            <span>Hledání ve slovníku</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/favorites" className="app-sidenav__item app-sidenav__item--small" aria-current={pathname === '/favorites' ? 'page' : undefined}>
            <span className="app-sidenav__emoji" aria-hidden="true">⭐</span>
            <span>Oblíbené</span>
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className="app-sidenav__item app-sidenav__item--small" aria-current={pathname === '/settings' ? 'page' : undefined}>
            <span className="app-sidenav__emoji" aria-hidden="true">⚙️</span>
            <span>Nastavení</span>
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
