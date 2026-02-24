import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import VocabDrill from './pages/VocabDrill';
import GrammarDrill from './pages/GrammarDrill';
import ReadingPractice from './pages/ReadingPractice';
import ListeningPractice from './pages/ListeningPractice';
import PhrasalVerbsDrill from './pages/PhrasalVerbsDrill';
import WritingTips from './pages/WritingTips';
import Review from './pages/Review';
import Settings from './pages/Settings';
import GrammarRef from './pages/GrammarRef';
import ExamSim from './pages/ExamSim';
import Onboarding from './pages/Onboarding';
import { getSettings } from './db';
import { initTTS } from './tts';
import type { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

function applyTheme(theme: 'light' | 'dark' | 'auto') {
  const isDark =
    theme === 'dark' ||
    (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.classList.toggle('dark', isDark);
}

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getSettings(), initTTS()]).then(([s]) => {
      setSettings(s);
      applyTheme(s.theme);
      setLoading(false);
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
    return <Onboarding onComplete={(s) => { setSettings(s); }} />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard settings={settings} />} />
        <Route path="/vocab" element={<VocabDrill settings={settings} />} />
        <Route path="/grammar" element={<GrammarDrill />} />
        <Route path="/reading" element={<ReadingPractice />} />
        <Route path="/listening" element={<ListeningPractice />} />
        <Route path="/phrasal-verbs" element={<PhrasalVerbsDrill />} />
        <Route path="/writing" element={<WritingTips />} />
        <Route path="/review" element={<Review />} />
        <Route path="/settings" element={<Settings settings={settings} onUpdate={setSettings} />} />
        <Route path="/grammar-ref" element={<GrammarRef />} />
        <Route path="/exam" element={<ExamSim />} />
      </Routes>
    </Layout>
  );
}
