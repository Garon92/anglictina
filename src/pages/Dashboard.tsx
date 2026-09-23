import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSettings } from '../App';
import { getDrillSessions, getExamSessions, kvGet } from '../db';
import { getMistakeSummary, getTodaySummary, type MistakeSummary, type TodaySummary } from '../progress';
import { getDeckOverview, type DeckOverview } from '../vocabDeck';
import { recommendModule, type Recommendation } from '../recommend';
import { VOCAB_TOTAL } from '../data/vocabMeta';
import { dayKey, daysUntil, lastDays, czechPlural, parseDayKey, DAY_NAMES_SHORT } from '../lib/dates';

import type { DrillSession, ExamSession } from '../types';
import { Ring, ProgressBar } from '../components/ui';
import { useAppName } from '../lib/name';
import { getModule, sessionModule, type ModuleDef } from '../modules';
import { greeting } from '../kit/cz';
import { attemptLabel, skillPct } from '../exam/history';

const DailyChallenge = lazy(() => import('../components/DailyChallenge'));
const WordOfTheDay = lazy(() => import('../components/WordOfTheDay'));

interface DashData {
  today: TodaySummary;
  deck: DeckOverview;
  mistakes: MistakeSummary;
  recommendation: Recommendation;
  week: { day: string; minutes: number }[];
  lastExam?: ExamSession;
  dailyDone: boolean;
  recent: ModuleDef[];
  pendingRun: { id: string } | null;
}

const DEFAULT_QUICK = ['vocab', 'grammar', 'reading', 'listening'].map((id) => getModule(id)!).filter(Boolean);

/** Last 4 distinct practised modules (newest first). */
function recentModules(sessions: DrillSession[]): ModuleDef[] {
  const out: ModuleDef[] = [];
  for (const s of [...sessions].sort((a, b) => b.startedAt - a.startedAt)) {
    const m = getModule(sessionModule(s));
    if (m && !out.includes(m)) out.push(m);
    if (out.length === 4) break;
  }
  return out.length >= 2 ? out : [];
}


function weekMinutes(sessions: DrillSession[]): { day: string; minutes: number }[] {
  const days = lastDays(7);
  return days.map((day) => ({
    day,
    minutes: sessions
      .filter((s) => s.date === day && s.endedAt)
      .reduce((sum, s) => sum + Math.max(0, (s.endedAt! - s.startedAt) / 60000), 0),
  }));
}

export default function Dashboard() {
  const { settings } = useSettings();
  const [appName] = useAppName();
  const [data, setData] = useState<DashData | null>(null);

  const load = useCallback(async () => {
    const weekStart = lastDays(7)[0];
    const [today, deck, mistakes, sessions, exams, daily, pendingRun] = await Promise.all([
      getTodaySummary(),
      getDeckOverview(settings, 'vocab', VOCAB_TOTAL),
      getMistakeSummary(),
      getDrillSessions(),
      getExamSessions(),
      kvGet(`daily:${dayKey()}`),
      kvGet<{ id: string }>('exam:current'),
    ]);
    const sorted = exams.sort((a, b) => b.startedAt - a.startedAt);
    const lastExam = sorted.find((e) => e.mode === 'full') ?? sorted.find((e) => e.mode === 'listening' || e.mode === 'reading');
    setData({
      today,
      deck,
      mistakes,
      recommendation: recommendModule(sessions, mistakes.byModule),
      week: weekMinutes(sessions.filter((s) => s.date >= weekStart)),
      lastExam,
      dailyDone: !!daily,
      recent: recentModules(sessions),
      pendingRun: pendingRun ?? null,
    });
  }, [settings]);

  useEffect(() => {
    void load();
  }, [load]);

  const examDays = daysUntil(settings.examDate);


  if (!data) return <DashboardSkeleton />;

  const { today, deck, mistakes, recommendation } = data;
  const goal = Math.max(5, settings.minutesPerDay || 20);
  const minutes = Math.round(today.minutes);
  const recDone = today.modules.has(recommendation.module.id);

  const tasks: PlanTask[] = [
    {
      id: 'review',
      icon: '🗂️',
      title: 'Opakování slovíček',
      detail: deck.due > 0 ? `${deck.due} ${czechPlural(deck.due, 'kartička čeká', 'kartičky čekají', 'kartiček čeká')}` : 'Na dnešek zopakováno',
      done: deck.due === 0 && deck.oldReviewedToday > 0,
      to: '/vocab',
      cta: 'Opakovat',
      // Only when there is (or was) something to repeat today — new words alone aren't "repetition".
      hidden: deck.due === 0 && deck.oldReviewedToday === 0,
    },
    {
      id: 'new',
      icon: '✨',
      title: 'Nová slovíčka',
      detail: `${Math.min(deck.newToday, deck.newLimit)} / ${deck.newLimit} dnes`,
      done: deck.newToday >= deck.newLimit,
      to: '/vocab?new=1',
      cta: 'Naučit',
      progress: deck.newLimit ? Math.min(1, deck.newToday / deck.newLimit) : 1,
    },
    {
      id: 'mistakes',
      icon: '🔁',
      title: 'Oprava chyb',
      detail: mistakes.due > 0 ? `${mistakes.due} ${czechPlural(mistakes.due, 'chyba', 'chyby', 'chyb')} k opakování` : mistakes.active > 0 ? 'Další opakování zítra' : 'Žádné chyby k opravě',
      done: mistakes.due === 0,
      to: '/mistakes',
      cta: 'Opravit',
      hidden: mistakes.active === 0 && mistakes.resolved === 0,
    },
    {
      id: 'recommended',
      icon: recommendation.module.icon,
      title: recommendation.module.title,
      detail: recommendation.reason,
      done: recDone,
      to: recommendation.module.path,
      cta: 'Procvičit',
      badge: 'Doporučeno',
    },
  ];
  const visibleTasks = tasks.filter((t) => !t.hidden);
  const doneCount = visibleTasks.filter((t) => t.done).length + (data.dailyDone ? 1 : 0);
  const totalCount = visibleTasks.length + 1;

  return (
    <div className="page-container page-container--wide">
      {/* Greeting */}
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-muted">{formatToday()}</p>
          <h1 className="text-3xl font-black tracking-tight text-fg">
            {greeting(appName)}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="badge !px-3 !py-1.5 !text-sm" title="Dny v řadě, kdy ses učil/a">
            <span className={today.streak >= 3 ? 'animate-fire-pulse inline-block' : ''} aria-hidden="true">🔥</span>
            {today.streak > 0 ? `${today.streak} ${czechPlural(today.streak, 'den', 'dny', 'dní')} v řadě` : 'Začni sérii dnes'}
          </span>
          {settings.showCountdown && examDays >= 0 && (
            <Link to="/exam" className="badge !bg-accent-soft !px-3 !py-1.5 !text-sm !text-accent-text no-underline">
              🎓 {examDays === 0 ? 'Maturita je dnes!' : `${examDays} ${czechPlural(examDays, 'den', 'dny', 'dní')} do maturity`}
            </Link>
          )}
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        {/* Plan */}
        <section className="card !p-5" aria-labelledby="plan-title">
          <div className="mb-4 flex items-center gap-4">
            <Ring value={minutes / goal} size={84} tone={minutes >= goal ? 'success' : 'accent'} label={`${minutes} z ${goal} minut`}>
              <div>
                <div className="text-xl font-black tabular-nums text-fg">{minutes}</div>
                <div className="-mt-1 text-[0.65rem] font-bold text-muted">/ {goal} min</div>
              </div>
            </Ring>
            <div className="min-w-0">
              <h2 id="plan-title" className="text-xl font-black text-fg">Plán na dnešek</h2>
              <p className="text-sm text-muted">
                {doneCount >= totalCount
                  ? 'Všechno splněno — skvělá práce! 🎉'
                  : `Splněno ${doneCount} z ${totalCount} úkolů`}
              </p>
            </div>
          </div>
          <ul className="space-y-2">
            {data.pendingRun && (
              <li>
                <Link to="/exam/run" className="card-link flex items-center gap-3 rounded-2xl border-2 border-warning bg-warning-soft p-3 no-underline">
                  <span className="tile-icon !bg-surface" aria-hidden="true">⏸️</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-fg">Pokračovat v testu</span>
                    <span className="block text-xs text-muted">Rozpracovaný test čeká — čas je zastavený</span>
                  </span>
                  <svg className="shrink-0 text-muted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                </Link>
              </li>
            )}
            {visibleTasks.map((t) => (
              <PlanRow key={t.id} task={t} />
            ))}
            <li className={`rounded-2xl border border-border p-3 ${data.dailyDone ? 'bg-surface-2' : ''}`}>
              <Suspense fallback={<div className="skeleton h-11 w-full" />}>
                <DailyChallenge onDone={() => void load()} />
              </Suspense>
            </li>
          </ul>
        </section>

        <div className="grid content-start gap-4">
          {/* Exam readiness */}
          <ExamCard lastExam={data.lastExam} goal={settings.goalScore} />

          {/* Word of the day (lazy: needs the word list) */}
          <Suspense fallback={<div className="card !p-5"><div className="skeleton h-20 w-full" /></div>}>
            <WordOfTheDay />
          </Suspense>

          {/* Week */}
          <WeekCard week={data.week} goal={goal} />
        </div>
      </div>

      {/* Quick links */}
      <section className="mt-6" aria-labelledby="quick-title">
        <h2 id="quick-title" className="section-title">{data.recent.length ? 'Naposledy procvičováno' : 'Rychlý start'}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(data.recent.length ? data.recent : DEFAULT_QUICK).map((m) => (
            <QuickLink key={m.path} to={m.path} icon={m.icon} title={m.title} />
          ))}
        </div>
        <p className="mt-3 text-center text-sm">
          <Link to="/practice" className="inline-flex min-h-[44px] items-center px-2 font-bold">Všechna cvičení →</Link>
        </p>
      </section>
    </div>
  );
}

function formatToday(): string {
  const s = new Date().toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toUpperCase() + s.slice(1);
}

interface PlanTask {
  id: string;
  icon: string;
  title: string;
  detail: string;
  done: boolean;
  to: string;
  cta: string;
  hidden?: boolean;
  badge?: string;
  progress?: number;
}

function PlanRow({ task }: { task: PlanTask }) {
  return (
    <li>
      <Link
        to={task.to}
        className={`card-link flex items-center gap-3 rounded-2xl border border-border p-3 no-underline ${task.done ? 'bg-surface-2' : 'bg-surface'}`}
      >
        <span className={`tile-icon ${task.done ? '!bg-success-soft' : ''}`} aria-hidden="true">
          {task.done ? '✓' : task.icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-x-2">
            <span className={`font-bold leading-tight ${task.done ? 'text-muted line-through decoration-2' : 'text-fg'}`}>{task.title}</span>
            {task.badge && !task.done && <span className="badge hidden !bg-accent-soft !text-accent-text !text-[0.65rem] sm:inline-flex">{task.badge}</span>}
          </span>
          <span className="line-clamp-2 block text-xs text-muted">
            {task.badge && !task.done && <span className="font-bold text-accent-text sm:hidden">{task.badge} · </span>}
            {task.detail}
          </span>
          {task.progress !== undefined && !task.done && <ProgressBar value={task.progress} className="mt-1.5 !h-1.5" label={task.title} />}
        </span>
        {!task.done && <span className="btn-soft btn-sm hidden shrink-0 sm:inline-flex">{task.cta}</span>}
        {!task.done && (
          <svg className="shrink-0 text-subtle sm:hidden" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m9 6 6 6-6 6" />
          </svg>
        )}
      </Link>
    </li>
  );
}

function ExamCard({ lastExam, goal }: { lastExam?: ExamSession; goal: number }) {
  const full = lastExam?.mode === 'full';
  const score = lastExam ? (full ? lastExam.scoreTotal : Math.round((lastExam.scoreTotal / (lastExam.maxScore || 1)) * 100)) : null;
  return (
    <section className="card g92-card--accent !p-5" aria-label="Připravenost na maturitu">
      <div className="flex items-center justify-between gap-2">
        <div className="eyebrow">Maturita nanečisto</div>
        <Link to="/exam" className="-my-2 inline-flex min-h-[44px] items-center px-1 text-sm font-bold">Testy →</Link>
      </div>
      {score === null ? (
        <>
          <p className="mt-2 font-bold text-fg">Vyzkoušej si cvičný didaktický test</p>
          <p className="text-sm text-muted">Poslech, čtení a jazyková kompetence jako u opravdové maturity. Hranice úspěchu je 44 bodů.</p>
          <Link to="/exam" className="btn-primary mt-3">Vybrat test</Link>
        </>
      ) : (
        <>
          {!full && <p className="mt-1 text-xs font-bold text-muted">Poslední pokus: {attemptLabel(lastExam!)}</p>}
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-4xl font-black tabular-nums ${score >= 44 ? 'text-success' : 'text-danger'}`}>{score}</span>
            <span className="text-muted">{full ? '/ 100 bodů' : '%'}</span>
            <span className={`badge ml-auto ${score >= 44 ? '!bg-success-soft !text-success' : '!bg-danger-soft !text-danger'}`}>
              {score >= 44 ? 'Prospěl/a' : 'Pod hranicí'}
            </span>
          </div>
          <ScoreScale score={score} goal={goal} />
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <SkillPct label="Poslech" value={skillPct(lastExam!, 'listening')} />
            <SkillPct label="Čtení" value={skillPct(lastExam!, 'reading')} />
            <SkillPct label="Jazyk" value={skillPct(lastExam!, 'language')} />
          </div>
        </>
      )}
    </section>
  );
}

export function ScoreScale({ score, goal }: { score: number; goal?: number }) {
  return (
    <div className="relative mt-3 h-3 rounded-full bg-surface-3" aria-hidden="true">
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${score}%`, background: score >= 44 ? 'var(--g92-success)' : 'var(--g92-danger)' }} />
      <div className="absolute -top-1 h-5 w-0.5 bg-fg" style={{ left: '44%' }} title="Hranice úspěšnosti 44 %" />
      {goal && goal !== 44 && <div className="absolute -top-1 h-5 w-0.5 bg-accent" style={{ left: `${goal}%` }} title={`Tvůj cíl ${goal} bodů`} />}
      <div className="absolute top-4 -translate-x-1/2 text-[0.6rem] font-bold text-muted" style={{ left: '44%' }}>44</div>
    </div>
  );
}

function SkillPct({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface p-2">
      <div className="font-black tabular-nums text-fg">{value}</div>
      <div className="text-muted">{label}</div>
    </div>
  );
}

function WeekCard({ week, goal }: { week: { day: string; minutes: number }[]; goal: number }) {
  const max = Math.max(goal, ...week.map((d) => d.minutes), 1);
  const total = Math.round(week.reduce((s, d) => s + d.minutes, 0));
  const today = dayKey();
  return (
    <section className="card !p-5" aria-label="Aktivita za posledních 7 dní">
      <div className="mb-3 flex items-baseline justify-between">
        <div className="eyebrow">Posledních 7 dní</div>
        <div className="text-sm font-bold text-muted">{total} min</div>
      </div>
      <div className="relative flex h-24 items-end gap-2">
        <div className="pointer-events-none absolute inset-x-0 border-t border-dashed border-border-strong" style={{ bottom: `${(goal / max) * 100}%` }} title={`Denní cíl ${goal} min`} />
        {week.map((d) => {
          const h = d.minutes > 0 ? Math.max(8, (d.minutes / max) * 100) : 4;
          const dow = DAY_NAMES_SHORT[parseDayKey(d.day).getDay()];
          return (
            <div key={d.day} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: '100%' }}>
              <div
                className="w-full max-w-9 rounded-md"
                style={{
                  height: `${h}%`,
                  background: d.minutes >= goal ? 'var(--g92-success)' : d.minutes > 0 ? 'var(--accent)' : 'var(--g92-surface-3)',
                }}
                title={`${dow}: ${Math.round(d.minutes)} min`}
              />
              <span className={`text-[0.65rem] font-bold ${d.day === today ? 'text-accent-text' : 'text-muted'}`}>{dow}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function QuickLink({ to, icon, title }: { to: string; icon: string; title: string }) {
  return (
    <Link to={to} className="card card-link flex flex-col items-center gap-1.5 !py-4 text-center no-underline">
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-sm font-bold text-fg">{title}</span>
    </Link>
  );
}

function DashboardSkeleton() {
  return (
    <div className="page-container page-container--wide" aria-busy="true">
      <div className="skeleton mb-2 h-4 w-40" />
      <div className="skeleton mb-6 h-9 w-64" />
      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="card space-y-3 !p-5">
          {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton h-14 w-full" />)}
        </div>
        <div className="space-y-4">
          <div className="card !p-5"><div className="skeleton h-24 w-full" /></div>
          <div className="card !p-5"><div className="skeleton h-20 w-full" /></div>
        </div>
      </div>
    </div>
  );
}

