import type { ReactNode } from 'react';
import BottomNav from './BottomNav';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col transition-colors duration-300">
      <main className="flex-1 animate-fadeIn">{children}</main>
      <BottomNav />
    </div>
  );
}
