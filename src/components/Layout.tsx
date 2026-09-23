import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react';
import { useLocation, useNavigate, useBlocker, Outlet } from 'react-router';
import { TabBar, SideNav } from './AppNav';
import OfflineBanner from './OfflineBanner';
import { stopSpeaking } from '../tts';
import { registerHelp } from './HelpDialog';
import { getDueMistakes, onSessionRecorded, onMilestone, recoverPendingSessions } from '../progress';
import { setLeaveGuard, sfx, toast, UI_ICONS } from '../kit';
import { reportActivity } from '../lib/activity';
import { confirmLeave, getActiveSession, isFocusMode, subscribeActiveSession } from '../lib/activeSession';
import { routeTitle } from '../lib/titles';
import { registerSettingsSection } from '../lib/settingsSection';
import { useSettings } from '../App';

/** Routes that take over the whole screen (no tab bar / side nav). */
function isFocusRoute(pathname: string) {
  return pathname.startsWith('/exam/run');
}

export default function Layout({ children }: { children?: ReactNode }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [mistakesDue, setMistakesDue] = useState(0);
  const focusMode = useSyncExternalStore(subscribeActiveSession, isFocusMode, () => false);
  const focus = focusMode || isFocusRoute(pathname);

  useEffect(() => registerHelp(), []);

  // Work left behind by a closed tab becomes a normal session.
  useEffect(() => {
    void recoverPendingSessions();
  }, [pathname]);

  // Per-route document title (history, tabs, screen readers).
  useEffect(() => {
    document.title = routeTitle(pathname);
  }, [pathname]);

  // ── Leaving a running session: in-app navigation and browser Back ──
  const blocker = useBlocker(({ currentLocation, nextLocation }) => !!getActiveSession() && currentLocation.pathname !== nextLocation.pathname);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    let alive = true;
    void confirmLeave().then((ok) => {
      if (!alive) return;
      if (ok) blocker.proceed();
      else blocker.reset();
    });
    return () => {
      alive = false;
    };
  }, [blocker]);

  // ── …and the app bar's "Menu" (leaves the app): kit v0.7 leave guard ──
  useEffect(() => setLeaveGuard(() => confirmLeave('menu')), []);

  // ── ⚙ opens the kit settings dialog with this app's part + "Další nastavení…" (C-11) ──
  const { settings, updateSettings } = useSettings();
  const latest = useRef({ settings, updateSettings });
  useEffect(() => {
    latest.current = { settings, updateSettings };
  }, [settings, updateSettings]);
  useEffect(
    () =>
      registerSettingsSection({
        getFontSize: () => latest.current.settings.fontSize,
        setFontSize: (fontSize) => latest.current.updateSettings({ ...latest.current.settings, fontSize }),
        openMore: () => navigate('/settings'),
      }),
    [navigate],
  );

  // Small celebrations: daily goal reached, streak milestones.
  useEffect(
    () =>
      onMilestone((m) => {
        window.setTimeout(() => {
          if (m.kind === 'daily-goal') {
            sfx.levelUp();
            toast(`Denní cíl splněn — ${m.value} minut procvičování! 🎯`, { variant: 'success', icon: UI_ICONS.trophy, duration: 4000 });
          } else {
            toast(`${m.value} dní v řadě! Jen tak dál 🔥`, { variant: 'accent', icon: UI_ICONS.flame, duration: 4500 });
          }
        }, 900);
      }),
    [],
  );

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
      <g92-appbar app="anglictina" keys>
        {!focus && pathname !== '/search' && (
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
