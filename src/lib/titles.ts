import { appTitle } from '../kit';
import { getModuleByPath } from '../modules';

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

/** Document title for a route (kit family format), e.g. "Členy · Angličtina – Příprava na maturitu". */
export function routeTitle(pathname: string): string {
  const p = pathname.replace(/\/+$/, '') || '/';
  if (p === '/') return appTitle('anglictina');
  const name = STATIC[p] ?? getModuleByPath(p)?.title ?? (p.startsWith('/exam/history') ? 'Výsledek testu' : null);
  return appTitle('anglictina', name ?? undefined);
}
