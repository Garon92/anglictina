import { toast } from './kit';

/** Remove caches created by the hand-written service worker used before v2. */
async function cleanupLegacyCaches() {
  if (!('caches' in window)) return;
  try {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => /^anglictina-v\d+$/.test(k)).map((k) => caches.delete(k)));
  } catch {
    /* ignore */
  }
}

export function setupPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  void cleanupLegacyCaches();
  void import('virtual:pwa-register').then(({ registerSW }) => {
    const updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        const offer = () =>
          toast('Je k dispozici nová verze aplikace.', {
            variant: 'accent',
            duration: 0,
            action: { label: 'Obnovit', onClick: () => void updateSW(true) },
          });
        // Never interrupt a running exam — offer the update after leaving it.
        if (location.pathname.includes('/exam/run')) {
          const wait = window.setInterval(() => {
            if (!location.pathname.includes('/exam/run')) {
              window.clearInterval(wait);
              offer();
            }
          }, 5000);
        } else offer();
      },
      onOfflineReady() {
        toast('Aplikace je připravená i pro offline použití.', { variant: 'success', duration: 4000 });
      },
    });
  });
}
