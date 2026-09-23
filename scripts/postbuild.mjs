// After `vite build`: give every static route its own index.html so GitHub Pages answers deep links
// (e.g. /anglictina/practice) with HTTP 200 instead of the 404.html fallback. 404.html for unknown
// URLs comes from the kit's g92NotFoundPage (vite.config.ts). Routes are read from src/router.tsx.
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const router = readFileSync(join(root, 'src/router.tsx'), 'utf8');
const routes = [...router.matchAll(/page\('([^']+)'/g)].map((m) => m[1]).filter((p) => p !== '*' && !p.includes(':'));
const html = readFileSync(join(dist, 'index.html'));
for (const r of routes) {
  const dir = join(dist, r);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html);
}
if (!existsSync(join(dist, '404.html'))) throw new Error('postbuild: dist/404.html missing (g92NotFoundPage)');
console.log(`postbuild: ${routes.length} route pages (404.html from the kit)`);
