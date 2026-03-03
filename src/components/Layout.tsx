import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import BottomNav from './BottomNav';
import { stopSpeaking } from '../tts';

export default function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => {
    stopSpeaking();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <main className="flex-1 animate-fadeIn">{children}</main>
      <BottomNav />
    </div>
  );
}
