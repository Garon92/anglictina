/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { g92Pwa } from './src/kit/pwa.ts';

/** A maturita app is for teenagers, not kids: manifest categories = education only. */
function withCategories<T extends { manifest?: Record<string, unknown> }>(o: T): T {
  return { ...o, manifest: { ...o.manifest, categories: ['education'] } };
}

export default defineConfig({
  base: '/anglictina/',
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA(
      withCategories(g92Pwa('anglictina', {
        name: 'Angličtina — příprava na maturitu',
        description: 'Slovíčka s chytrým opakováním, gramatika, čtení, poslech a cvičné didaktické testy k maturitě z angličtiny.',
        // Registered manually (src/pwa.ts) with an "update available" prompt, so an exam is never reloaded mid-way.
        // The service worker keeps its historic URL /anglictina/sw.js, so older installs update in place.
        extra: { registerType: 'prompt', injectRegister: false, filename: 'sw.js' },
      })),
    ),
  ],
  build: {
    outDir: 'dist',
    target: 'es2022',
    chunkSizeWarningLimit: 1200,
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
