import { useEffect, type ReactNode } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';
import OfflineBanner from './OfflineBanner';
import { stopSpeaking } from '../tts';

export default function Layout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  useEffect(() => {
    stopSpeaking();
  }, [pathname]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <OfflineBanner />
      <main className="flex-1 animate-fadeIn">{children ?? <Outlet />}</main>
      <BottomNav />
    </div>
  );
}
