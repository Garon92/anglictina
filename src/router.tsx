import { createBrowserRouter, redirect, type RouteObject } from 'react-router';
import App, { SplashScreen } from './App';
import RouteError from './components/RouteError';

type PageModule = { default: React.ComponentType };

function page(path: string | undefined, importFn: () => Promise<PageModule>): RouteObject {
  const lazy = async () => {
    const mod = await importFn();
    return { Component: mod.default };
  };
  return path === undefined ? { index: true, lazy } : { path, lazy };
}

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: App,
    HydrateFallback: SplashScreen,
    ErrorBoundary: RouteError,
    children: [
      page(undefined, () => import('./pages/Dashboard')),
      page('practice', () => import('./pages/Practice')),
      page('vocab', () => import('./pages/VocabDrill')),
      page('grammar', () => import('./pages/GrammarDrill')),
      page('reading', () => import('./pages/ReadingPractice')),
      page('listening', () => import('./pages/ListeningPractice')),
      page('phrasal-verbs', () => import('./pages/PhrasalVerbsDrill')),
      page('writing', () => import('./pages/WritingTips')),
      page('irregular-verbs', () => import('./pages/IrregularVerbsDrill')),
      page('word-order', () => import('./pages/WordOrderDrill')),
      page('diagnostic', () => import('./pages/DiagnosticTest')),
      page('confusables', () => import('./pages/ConfusablesDrill')),
      page('prepositions', () => import('./pages/PrepositionsDrill')),
      page('conversation', () => import('./pages/ConversationTopics')),
      page('matching', () => import('./pages/MatchingGame')),
      page('articles', () => import('./pages/ArticlesDrill')),
      page('translation', () => import('./pages/TranslationDrill')),
      page('idioms', () => import('./pages/IdiomsDrill')),
      page('tenses', () => import('./pages/TenseOverview')),
      page('study-plan', () => import('./pages/StudyPlan')),
      page('mistakes', () => import('./pages/MistakeDrill')),
      page('speed', () => import('./pages/SpeedChallenge')),
      page('search', () => import('./pages/GlobalSearch')),
      page('favorites', () => import('./pages/Favorites')),
      page('conditionals', () => import('./pages/ConditionalsDrill')),
      page('reported-speech', () => import('./pages/ReportedSpeechDrill')),
      page('sentence-transform', () => import('./pages/SentenceTransformDrill')),
      page('cheatsheet', () => import('./pages/GrammarCheatsheet')),
      page('vocab-topics', () => import('./pages/VocabTopics')),
      page('mixed-quiz', () => import('./pages/MixedQuiz')),
      page('favorites-quiz', () => import('./pages/FavoritesQuiz')),
      page('error-correction', () => import('./pages/ErrorCorrectionDrill')),
      page('passive', () => import('./pages/PassiveVoiceDrill')),
      page('custom-words', () => import('./pages/CustomWords')),
      page('czech-errors', () => import('./pages/CzechErrorsDrill')),
      page('review', () => import('./pages/Review')),
      page('settings', () => import('./pages/Settings')),
      page('grammar-ref', () => import('./pages/GrammarRef')),
      page('word-formation', () => import('./pages/WordFormationDrill')),
      page('exam', () => import('./exam/ExamHome')),
      page('exam/run', () => import('./exam/ExamRunner')),
      page('exam/history/:id', () => import('./exam/ExamHistoryDetail')),
      page('exam/timer', () => import('./exam/ExamTimer')),
      // Old bookmarks / shortcuts to …/index.html
      { path: 'index.html', loader: () => redirect('/') },
      page('*', () => import('./pages/NotFound')),
    ],
  },
];

export const router = createBrowserRouter(routes, { basename: '/anglictina' });
