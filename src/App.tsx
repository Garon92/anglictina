import { useEffect, useState, Suspense, createContext, useContext, lazy, useCallback, useMemo } from 'react';
import { Outlet } from 'react-router';
import Layout from './components/Layout';
import LoadingSkeleton from './components/LoadingSkeleton';
import { getSettings, saveSettings } from './db';
import { initTTS } from './tts';
import type { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';
import { getSettings as getKitSettings, setSettings as setKitSettings, SETTINGS_KEY } from './kit';
import { appStore } from './lib/appStore';
import { reportActivity } from './lib/activity';
import { setDailyGoalMinutes } from './progress';

const Onboarding = lazy(() => import('./pages/Onboarding'));

interface SettingsContextType {
  settings: UserSettings;
  /** Update settings in memory and persist them. */
  updateSettings: (s: UserSettings) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

function applyFontSize(size: UserSettings['fontSize']) {
  const px = size === 'small' ? '15px' : size === 'large' ? '18px' : '16px';
  document.documentElement.style.fontSize = px;
}

/**
 * Before v2 the app kept its own theme + sound switches. They now live in the shared g92
 * settings; copy the old choice over once (only if the global settings were never touched).
 */
function migrateAppearance(s: UserSettings) {
  if (appStore.get('appearanceMigrated')) return;
  appStore.set('appearanceMigrated', true);
  let hasGlobal = false;
  try {
    hasGlobal = localStorage.getItem(SETTINGS_KEY) !== null;
  } catch { /* ignore */ }
  if (hasGlobal) return;
  const patch: Parameters<typeof setKitSettings>[0] = {};
  if (s.theme === 'light' || s.theme === 'dark') patch.theme = s.theme;
  if (s.soundEnabled === false && getKitSettings().sound) patch.sound = false;
  if (Object.keys(patch).length > 0) setKitSettings(patch);
}

export default function App() {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    let alive = true;
    getSettings()
      .then((s) => {
        if (!alive) return;
        migrateAppearance(s);
        applyFontSize(s.fontSize);
        setSettings(s);
        void initTTS(s.ttsVoice);
      })
      .catch(() => {
        // IndexedDB unavailable (e.g. very old private mode) — run with defaults in memory.
        if (alive) setSettings({ ...DEFAULT_SETTINGS, onboardingDone: true });
      });
    void reportActivity();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (settings) applyFontSize(settings.fontSize);
  }, [settings?.fontSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // One daily goal (minutes) everywhere: ring on "Dnes", celebration toast, menu chip.
  useEffect(() => {
    if (settings) setDailyGoalMinutes(settings.minutesPerDay);
  }, [settings?.minutesPerDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateSettings = useCallback((s: UserSettings) => {
    setSettings(s);
    void saveSettings(s);
  }, []);

  const ctx = useMemo(
    () => ({ settings: settings ?? DEFAULT_SETTINGS, updateSettings }),
    [settings, updateSettings],
  );

  if (!settings) return <SplashScreen />;

  if (!settings.onboardingDone) {
    return (
      <Suspense fallback={<SplashScreen />}>
        <Onboarding onComplete={(s: UserSettings) => setSettings(s)} />
      </Suspense>
    );
  }

  return (
    <SettingsContext.Provider value={ctx}>
      <Layout>
        <Suspense fallback={<LoadingSkeleton />}>
          <Outlet />
        </Suspense>
      </Layout>
    </SettingsContext.Provider>
  );
}

export function SplashScreen() {
  return (
    <div className="g92-app items-center justify-center" role="status" aria-live="polite">
      <div className="m-auto text-center">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-2xl font-black text-accent-contrast shadow-3">
          EN
        </div>
        <p className="animate-pulse text-sm text-muted">Načítám…</p>
      </div>
    </div>
  );
}
