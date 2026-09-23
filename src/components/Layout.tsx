import { useEffect, useState, type ReactNode } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router';
import { TabBar, SideNav } from './AppNav';
import OfflineBanner from './OfflineBanner';
import { stopSpeaking } from '../tts';
import { registerHelp } from './HelpDialog';
import { getDueMistakes, onSessionRecorded } from '../progress';
import { reportActivity } from '../lib/activity';

/** Routes that take over the whole screen (no tab bar / side nav). */
function isFocusRoute(pathname: string) {
  return pathname.startsWith('/exam/run');
}

export default function Layout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mistakesDue, setMistakesDue] = useState(0);
  const focus = isFocusRoute(pathname);

  useEffect(() => registerHelp(), []);

  useEffect(() => {
    stopSpeaking();
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);

  useEffect(() => {
    let alive = true;
    const refresh = () => getDueMistakes().then((m) => alive && setMistakesDue(m.length)).catch(() => {});
    refresh();
    const off = onSessionRecorded(() => {
      refresh();
      void reportActivity();
    });
    return () => {
      alive = false;
      off();
    };
  }, [pathname]);

  return (
    <div className={`g92-app app-shell${focus ? ' app-shell--focus' : ''}`}>
      <g92-appbar
        app="anglictina"
        ong92-settings={(e: CustomEvent) => {
          e.preventDefault();
          navigate('/settings');
        }}
      >
        {!focus && (
          <button
            slot="actions"
            type="button"
            className="appbar-action"
            aria-label="Hledat ve slovníku"
            title="Hledat ve slovníku"
            onClick={() => navigate('/search')}
          >
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="6.5" />
              <path d="m20 20-4.2-4.2" />
            </svg>
          </button>
        )}
      </g92-appbar>
      <OfflineBanner />
      <div className="app-body">
        {!focus && <SideNav mistakesDue={mistakesDue} />}
        <main className="app-main" id="main">
          {children ?? <Outlet />}
        </main>
      </div>
      {!focus && <TabBar />}
    </div>
  );
}
