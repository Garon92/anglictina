import { Routes, Route } from 'react-router-dom';
import { useEffect, useState, lazy, Suspense } from 'react';
import Layout from './components/Layout';
import { getSettings } from './db';
import { initTTS } from './tts';
import type { UserSettings } from './types';
import { DEFAULT_SETTINGS } from './types';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const VocabDrill = lazy(() => import('./pages/VocabDrill'));
const GrammarDrill = lazy(() => import('./pages/GrammarDrill'));
const ReadingPractice = lazy(() => import('./pages/ReadingPractice'));
const ListeningPractice = lazy(() => import('./pages/ListeningPractice'));
const PhrasalVerbsDrill = lazy(() => import('./pages/PhrasalVerbsDrill'));
const WritingTips = lazy(() => import('./pages/WritingTips'));
const IrregularVerbsDrill = lazy(() => import('./pages/IrregularVerbsDrill'));
const WordOrderDrill = lazy(() => import('./pages/WordOrderDrill'));
const DiagnosticTest = lazy(() => import('./pages/DiagnosticTest'));
const Review = lazy(() => import('./pages/Review'));
const Settings = lazy(() => import('./pages/Settings'));
const GrammarRef = lazy(() => import('./pages/GrammarRef'));
const ExamSim = lazy(() => import('./pages/ExamSim'));
const ConfusablesDrill = lazy(() => import('./pages/ConfusablesDrill'));
const PrepositionsDrill = lazy(() => import('./pages/PrepositionsDrill'));
const ConversationTopics = lazy(() => import('./pages/ConversationTopics'));
const MatchingGame = lazy(() => import('./pages/MatchingGame'));
const ArticlesDrill = lazy(() => import('./pages/ArticlesDrill'));
const TranslationDrill = lazy(() => import('./pages/TranslationDrill'));
const IdiomsDrill = lazy(() => import('./pages/IdiomsDrill'));
const TenseOverview = lazy(() => import('./pages/TenseOverview'));
const StudyPlan = lazy(() => import('./pages/StudyPlan'));
const MistakeDrill = lazy(() => import('./pages/MistakeDrill'));
const SpeedChallenge = lazy(() => import('./pages/SpeedChallenge'));
const GlobalSearch = lazy(() => import('./pages/GlobalSearch'));
const Favorites = lazy(() => import('./pages/Favorites'));
const ConditionalsDrill = lazy(() => import('./pages/ConditionalsDrill'));
const ReportedSpeechDrill = lazy(() => import('./pages/ReportedSpeechDrill'));
const SentenceTransformDrill = lazy(() => import('./pages/SentenceTransformDrill'));
const GrammarCheatsheet = lazy(() => import('./pages/GrammarCheatsheet'));
const WordFormationDrill = lazy(() => import('./pages/WordFormationDrill'));
const VocabTopics = lazy(() => import('./pages/VocabTopics'));
const MixedQuiz = lazy(() => import('./pages/MixedQuiz'));
const FavoritesQuiz = lazy(() => import('./pages/FavoritesQuiz'));
const ErrorCorrectionDrill = lazy(() => import('./pages/ErrorCorrectionDrill'));
const PassiveVoiceDrill = lazy(() => import('./pages/PassiveVoiceDrill'));
const CustomWords = lazy(() => import('./pages/CustomWords'));
const Onboarding = lazy(() => import('./pages/Onboarding'));

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
    getSettings().then((s) => {
      setSettings(s);
      applyTheme(s.theme);
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

  const fallback = (
    <div className="page-container flex items-center justify-center min-h-[40vh]">
      <p className="text-slate-400 dark:text-slate-500 text-sm animate-pulse">Načítám...</p>
    </div>
  );

  if (!settings.onboardingDone) {
    return (
      <Suspense fallback={fallback}>
        <Onboarding onComplete={(s) => { setSettings(s); }} />
      </Suspense>
    );
  }

  return (
    <Layout>
      <Suspense fallback={fallback}>
        <Routes>
          <Route path="/" element={<Dashboard settings={settings} />} />
          <Route path="/vocab" element={<VocabDrill settings={settings} />} />
          <Route path="/grammar" element={<GrammarDrill />} />
          <Route path="/reading" element={<ReadingPractice />} />
          <Route path="/listening" element={<ListeningPractice />} />
          <Route path="/phrasal-verbs" element={<PhrasalVerbsDrill />} />
          <Route path="/writing" element={<WritingTips />} />
          <Route path="/irregular-verbs" element={<IrregularVerbsDrill />} />
          <Route path="/word-order" element={<WordOrderDrill />} />
          <Route path="/diagnostic" element={<DiagnosticTest />} />
          <Route path="/confusables" element={<ConfusablesDrill />} />
          <Route path="/prepositions" element={<PrepositionsDrill />} />
          <Route path="/conversation" element={<ConversationTopics />} />
          <Route path="/matching" element={<MatchingGame />} />
          <Route path="/articles" element={<ArticlesDrill />} />
          <Route path="/translation" element={<TranslationDrill />} />
          <Route path="/idioms" element={<IdiomsDrill />} />
          <Route path="/tenses" element={<TenseOverview />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/mistakes" element={<MistakeDrill />} />
          <Route path="/speed" element={<SpeedChallenge />} />
          <Route path="/search" element={<GlobalSearch />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/conditionals" element={<ConditionalsDrill />} />
          <Route path="/reported-speech" element={<ReportedSpeechDrill />} />
          <Route path="/sentence-transform" element={<SentenceTransformDrill />} />
          <Route path="/cheatsheet" element={<GrammarCheatsheet />} />
          <Route path="/vocab-topics" element={<VocabTopics />} />
          <Route path="/mixed-quiz" element={<MixedQuiz />} />
          <Route path="/favorites-quiz" element={<FavoritesQuiz />} />
          <Route path="/error-correction" element={<ErrorCorrectionDrill />} />
          <Route path="/passive" element={<PassiveVoiceDrill />} />
          <Route path="/custom-words" element={<CustomWords />} />
          <Route path="/review" element={<Review />} />
          <Route path="/settings" element={<Settings settings={settings} onUpdate={setSettings} />} />
          <Route path="/grammar-ref" element={<GrammarRef />} />
          <Route path="/word-formation" element={<WordFormationDrill />} />
          <Route path="/exam" element={<ExamSim />} />
        </Routes>
      </Suspense>
    </Layout>
  );
}
