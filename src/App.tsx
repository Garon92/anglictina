import { useEffect, useState, Suspense, createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSkeleton from './components/LoadingSkeleton';
import { getSettings } from './db';
import { initTTS } from './tts';
import { setSoundEnabled } from './sounds';
import type { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (s: UserSettings) => void;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
});

export function useSettings() {
  return useContext(SettingsContext);
}

function applyTheme(theme: 'light' | 'dark' | 'auto') {
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

function applyFontSize(size: 'small' | 'medium' | 'large') {
  const root = document.documentElement;
  root.classList.remove('text-sm', 'text-base', 'text-lg');
  if (size === 'small') root.style.fontSize = '14px';
  else if (size === 'large') root.style.fontSize = '18px';
  else root.style.fontSize = '16px';
}

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSettings().then((s) => {
      setSettings(s);
      applyTheme(s.theme);
      applyFontSize(s.fontSize);
      setSoundEnabled(s.soundEnabled);
      initTTS(s.ttsVoice).then(() => setLoading(false));
    });
  }, []);

  useEffect(() => {
    applyTheme(settings.theme);
    if (settings.theme === 'auto') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const handler = () => applyTheme('auto');
      mq.addEventListener('change', handler);
      return () => mq.removeEventListener('change', handler);
    }
  }, [settings.theme]);

  useEffect(() => {
    applyFontSize(settings.fontSize);
  }, [settings.fontSize]);

  useEffect(() => {
    setSoundEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            EN
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Načítám...</p>
        </div>
      </div>
    );
  }

  if (!settings.onboardingDone) {
    const OnboardingLazy = () => {
      const [Onboarding, setOnboarding] = useState<React.ComponentType<any> | null>(null);
      useEffect(() => {
        import('./pages/Onboarding').then((m) => setOnboarding(() => m.default));
      }, []);
      if (!Onboarding) return <LoadingSkeleton />;
      return <Onboarding onComplete={(s: UserSettings) => setSettings(s)} />;
    };
    return <OnboardingLazy />;
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings: setSettings }}>
      <Layout>
        <Suspense fallback={<LoadingSkeleton />}>
          <Outlet />
        </Suspense>
      </Layout>
    </SettingsContext.Provider>
  );
}
