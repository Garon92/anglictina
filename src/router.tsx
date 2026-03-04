import { createBrowserRouter } from 'react-router-dom';
import App from './App';

function lazyPage(importFn: () => Promise<{ default: React.ComponentType<any> }>) {
  return {
    lazy: async () => {
      const mod = await importFn();
      return { Component: mod.default };
    },
  };
}

export const router = createBrowserRouter(
  [
    {
      path: '/',
      Component: App,
      children: [
        { index: true, ...lazyPage(() => import('./pages/Dashboard')) },
        { path: 'vocab', ...lazyPage(() => import('./pages/VocabDrill')) },
        { path: 'grammar', ...lazyPage(() => import('./pages/GrammarDrill')) },
        { path: 'reading', ...lazyPage(() => import('./pages/ReadingPractice')) },
        { path: 'listening', ...lazyPage(() => import('./pages/ListeningPractice')) },
        { path: 'phrasal-verbs', ...lazyPage(() => import('./pages/PhrasalVerbsDrill')) },
        { path: 'writing', ...lazyPage(() => import('./pages/WritingTips')) },
        { path: 'irregular-verbs', ...lazyPage(() => import('./pages/IrregularVerbsDrill')) },
        { path: 'word-order', ...lazyPage(() => import('./pages/WordOrderDrill')) },
        { path: 'diagnostic', ...lazyPage(() => import('./pages/DiagnosticTest')) },
        { path: 'confusables', ...lazyPage(() => import('./pages/ConfusablesDrill')) },
        { path: 'prepositions', ...lazyPage(() => import('./pages/PrepositionsDrill')) },
        { path: 'conversation', ...lazyPage(() => import('./pages/ConversationTopics')) },
        { path: 'matching', ...lazyPage(() => import('./pages/MatchingGame')) },
        { path: 'articles', ...lazyPage(() => import('./pages/ArticlesDrill')) },
        { path: 'translation', ...lazyPage(() => import('./pages/TranslationDrill')) },
        { path: 'idioms', ...lazyPage(() => import('./pages/IdiomsDrill')) },
        { path: 'tenses', ...lazyPage(() => import('./pages/TenseOverview')) },
        { path: 'study-plan', ...lazyPage(() => import('./pages/StudyPlan')) },
        { path: 'mistakes', ...lazyPage(() => import('./pages/MistakeDrill')) },
        { path: 'speed', ...lazyPage(() => import('./pages/SpeedChallenge')) },
        { path: 'search', ...lazyPage(() => import('./pages/GlobalSearch')) },
        { path: 'favorites', ...lazyPage(() => import('./pages/Favorites')) },
        { path: 'conditionals', ...lazyPage(() => import('./pages/ConditionalsDrill')) },
        { path: 'reported-speech', ...lazyPage(() => import('./pages/ReportedSpeechDrill')) },
        { path: 'sentence-transform', ...lazyPage(() => import('./pages/SentenceTransformDrill')) },
        { path: 'cheatsheet', ...lazyPage(() => import('./pages/GrammarCheatsheet')) },
        { path: 'vocab-topics', ...lazyPage(() => import('./pages/VocabTopics')) },
        { path: 'mixed-quiz', ...lazyPage(() => import('./pages/MixedQuiz')) },
        { path: 'favorites-quiz', ...lazyPage(() => import('./pages/FavoritesQuiz')) },
        { path: 'error-correction', ...lazyPage(() => import('./pages/ErrorCorrectionDrill')) },
        { path: 'passive', ...lazyPage(() => import('./pages/PassiveVoiceDrill')) },
        { path: 'custom-words', ...lazyPage(() => import('./pages/CustomWords')) },
        { path: 'czech-errors', ...lazyPage(() => import('./pages/CzechErrorsDrill')) },
        { path: 'review', ...lazyPage(() => import('./pages/Review')) },
        { path: 'settings', ...lazyPage(() => import('./pages/Settings')) },
        { path: 'grammar-ref', ...lazyPage(() => import('./pages/GrammarRef')) },
        { path: 'word-formation', ...lazyPage(() => import('./pages/WordFormationDrill')) },
        { path: 'exam', ...lazyPage(() => import('./pages/ExamSim')) },
      ],
    },
  ],
  {
    basename: '/anglictina',
  }
);
