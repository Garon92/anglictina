import { getModuleByPath } from '../modules';

const APP = 'Angličtina';

const STATIC: Record<string, string> = {
  '/': 'Dnes',
  '/practice': 'Procvičování',
  '/exam': 'Maturita nanečisto',
  '/exam/run': 'Test',
  '/exam/timer': 'Časovač k testu',
  '/review': 'Pokrok',
  '/settings': 'Nastavení',
  '/mistakes': 'Opakování chyb',
};

/** Document title for a route, e.g. "Členy · Angličtina". */
export function routeTitle(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return `${APP} — příprava na maturitu`;
  const name = STATIC[p] ?? getModuleByPath(p)?.title ?? (p.startsWith('/exam/history') ? 'Výsledek testu' : null);
  return name ? `${name} · ${APP}` : APP;
}
