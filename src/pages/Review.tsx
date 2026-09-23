import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { getStats, getAllSRSStates, getDrillSessions, getExamSessions, currentStreak } from '../db';
import { formatMinutes } from '../utils';
import { VOCABULARY } from '../data/vocabulary';
import { getMistakeSummary, type MistakeSummary } from '../progress';
import { MODULES, GROUPS, moduleTitle, moduleIcon, sessionModule } from '../modules';
import { moduleStats } from '../recommend';
import { cardStage } from '../srs';
import { dayKey, addDays, parseDayKey, startOfDay, czechPlural } from '../lib/dates';
import type { UserStats, SRSState, DrillSession, ExamSession } from '../types';
import { DEFAULT_STATS } from '../types';
import { PageHeader, ProgressBar, StatTile } from '../components/ui';
import { skillSummary } from '../exam/history';
import { Segmented } from '../components/ui';

type TabKey = 'overview' | 'skills' | 'vocab' | 'exams' | 'achievements';

const TABS: { value: TabKey; label: string }[] = [
  { value: 'overview', label: 'Přehled' },
  { value: 'skills', label: 'Dovednosti' },
  { value: 'vocab', label: 'Slovíčka' },
  { value: 'exams', label: 'Testy' },
  { value: 'achievements', label: 'Úspěchy' },
];

const MONTHS_CS = ['led', 'úno', 'bře', 'dub', 'kvě', 'čvn', 'čvc', 'srp', 'zář', 'říj', 'lis', 'pro'];

interface ReviewData {
  stats: UserStats;
  srs: SRSState[];
  sessions: DrillSession[];
  exams: ExamSession[];
  mistakes: MistakeSummary;
}

export default function Review() {
  const [data, setData] = useState<ReviewData | null>(null);
  const [params, setParams] = useSearchParams();
  const tabParam = params.get('tab') as TabKey | null;
  const tab: TabKey = tabParam && TABS.some((t) => t.value === tabParam) ? tabParam : 'overview';
  const setTab = (t: TabKey) => setParams(t === 'overview' ? {} : { tab: t }, { replace: true });

  useEffect(() => {
    (async () => {
      const [stats, srs, sessions, exams, mistakes] = await Promise.all([
        getStats(),
        getAllSRSStates(),
        getDrillSessions(),
        getExamSessions(),
        getMistakeSummary(),
      ]);
      setData({
        stats,
        srs,
        sessions: sessions.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)),
        exams: exams.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)),
        mistakes,
      });
    })().catch(() => setData({ stats: DEFAULT_STATS, srs: [], sessions: [], exams: [], mistakes: { active: 0, due: 0, resolved: 0, byModule: {}, byCategory: {}, weakestModule: '' } }));
  }, []);

  if (!data) {
    return (
      <div className="page-container page-container--wide">
        <div className="skeleton mb-4 h-8 w-48" />
        <div className="skeleton h-40 w-full" />
      </div>
    );
  }

  const { stats, srs, sessions, exams, mistakes } = data;
  const vocabSeen = srs.filter((s) => s.deckId === 'vocab' && s.totalReviews > 0).length;
  const lv = computeLevel({ ...stats, totalCardsLearned: Math.max(stats.totalCardsLearned, vocabSeen) });

  return (
    <div className="page-container page-container--wide">
      <PageHeader title="Tvůj pokrok" subtitle="Statistiky učení, slovíček a cvičných testů." back={null} />

      {/* Level */}
      <div className="card g92-card--accent mb-4 flex items-center gap-4 !p-5">
        <span className="text-4xl" aria-hidden="true">{lv.level.icon}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="text-lg font-black text-fg">{lv.level.name}</span>
            <span className="text-sm font-bold tabular-nums text-muted">{lv.xp.toLocaleString('cs-CZ')} XP</span>
          </div>
          <ProgressBar value={lv.progress} className="my-1.5" label="Postup na další úroveň" />
          {lv.nextLevel && (
            <div className="text-xs text-muted">
              Další úroveň: {lv.nextLevel.icon} {lv.nextLevel.name} ({lv.nextLevel.minXP.toLocaleString('cs-CZ')} XP)
            </div>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile icon="🔥" value={currentStreak(stats)} label={`dní v řadě · rekord ${stats.bestStreak}`} />
        <StatTile icon="⏱️" value={formatMinutes(stats.totalStudyMinutes)} label="celkový čas" />
        <StatTile icon="🗂️" value={vocabSeen} label="slovíček v opakování" />
        <StatTile icon="✅" value={stats.totalExercisesDone.toLocaleString('cs-CZ')} label="zodpovězených úloh" />
      </div>

      <div className="mb-5 overflow-x-auto pb-1">
        <Segmented value={tab} options={TABS} onChange={setTab} label="Zobrazení statistik" />
      </div>

      {tab === 'overview' && <OverviewTab sessions={sessions} mistakes={mistakes} />}
      {tab === 'skills' && <SkillsTab sessions={sessions} />}
      {tab === 'vocab' && <VocabTab srs={srs} />}
      {tab === 'exams' && <ExamsTab exams={exams} />}
      {tab === 'achievements' && <AchievementsTab stats={{ ...stats, totalCardsLearned: Math.max(stats.totalCardsLearned, vocabSeen) }} sessions={sessions} exams={exams} />}
    </div>
  );
}

/* ─── Overview ─────────────────────────────────────────────────────── */

function OverviewTab({ sessions, mistakes }: { sessions: DrillSession[]; mistakes: MistakeSummary }) {
  const weekStart = addDays(dayKey(), -6);
  const last7 = sessions.filter((s) => s.date >= weekStart);
  const items = last7.reduce((n, s) => n + s.totalItems, 0);
  const correct = last7.reduce((n, s) => n + s.correctItems, 0);
  const heat = useMemo(() => buildHeatmap(sessions), [sessions]);
  const activeDays = heat.flat().filter((d) => !d.future && d.mins > 0).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card !p-5">
        <h2 className="section-title">Posledních 7 dní</h2>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini value={last7.length} label={czechPlural(last7.length, 'cvičení', 'cvičení', 'cvičení')} />
          <Mini value={items} label="úloh" />
          <Mini value={items ? `${Math.round((correct / items) * 100)} %` : '—'} label="úspěšnost" />
        </div>
      </section>

      <section className="card !p-5">
        <div className="flex items-center justify-between">
          <h2 className="section-title">Chyby k opravě</h2>
          <Link to="/mistakes" className="text-sm font-bold">Otevřít →</Link>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Mini value={mistakes.due} label="čeká dnes" />
          <Mini value={mistakes.active} label="aktivních" />
          <Mini value={mistakes.resolved} label="opraveno" />
        </div>
        {mistakes.weakestModule && (
          <p className="mt-3 text-sm text-muted">
            Nejvíc chyb: <strong className="text-fg">{moduleIcon(mistakes.weakestModule)} {moduleTitle(mistakes.weakestModule)}</strong>
          </p>
        )}
      </section>

      <section className="card !p-5 lg:col-span-2">
        <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="section-title !mb-0">Kalendář aktivity</h2>
          <span className="text-sm text-muted">{activeDays} {czechPlural(activeDays, 'aktivní den', 'aktivní dny', 'aktivních dní')} za 13 týdnů</span>
        </div>
        <HeatmapGrid weeks={heat} />
      </section>

      <section className="card !p-5 lg:col-span-2">
        <h2 className="section-title">Poslední cvičení</h2>
        {sessions.length === 0 ? (
          <p className="text-sm text-muted">Zatím žádná cvičení. <Link to="/practice">Začni procvičovat →</Link></p>
        ) : (
          <ul className="divide-y divide-border">
            {sessions.slice(0, 8).map((s, i) => {
              const id = sessionModule(s);
              const pct = s.totalItems ? Math.round((s.correctItems / s.totalItems) * 100) : 0;
              return (
                <li key={s.id ?? i} className="flex items-center gap-3 py-2">
                  <span aria-hidden="true" className="w-7 text-center text-lg">{moduleIcon(id)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-fg">{moduleTitle(id)}</span>
                    <span className="block text-xs text-muted">{formatWhen(s.startedAt)}</span>
                  </span>
                  <span className="text-sm tabular-nums text-muted">{s.correctItems}/{s.totalItems}</span>
                  <span className={`w-12 text-right text-sm font-black tabular-nums ${pct >= 80 ? 'text-success' : pct >= 60 ? 'text-warning' : 'text-danger'}`}>{pct} %</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function formatWhen(ts: number): string {
  const d = new Date(ts);
  const key = dayKey(d);
  const time = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  if (key === dayKey()) return `dnes ${time}`;
  if (key === addDays(dayKey(), -1)) return `včera ${time}`;
  return d.toLocaleDateString('cs-CZ', { day: 'numeric', month: 'numeric' }) + ` ${time}`;
}

function Mini({ value, label }: { value: number | string; label: string }) {
  return (
    <div className="rounded-xl bg-surface-2 p-2.5">
      <div className="text-xl font-black tabular-nums text-fg">{value}</div>
      <div className="text-xs text-muted">{label}</div>
    </div>
  );
}

/* ─── Skills ───────────────────────────────────────────────────────── */

function SkillsTab({ sessions }: { sessions: DrillSession[] }) {
  const stats = moduleStats(sessions);
  const skill = (k: 'listening' | 'reading' | 'language') => {
    let t = 0, c = 0;
    for (const m of MODULES.filter((x) => x.examSkill === k)) {
      t += stats[m.id]?.total ?? 0;
      c += stats[m.id]?.correct ?? 0;
    }
    return { t, c };
  };
  const skills = [
    { label: 'Poslech', icon: '🎧', ...skill('listening') },
    { label: 'Čtení', icon: '📖', ...skill('reading') },
    { label: 'Jazyková kompetence', icon: '✏️', ...skill('language') },
  ];
  return (
    <div className="space-y-4">
      <section className="card !p-5">
        <h2 className="section-title">Dovednosti jako u maturity</h2>
        <div className="space-y-3">
          {skills.map((s) => {
            const pct = s.t ? Math.round((s.c / s.t) * 100) : null;
            return (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-bold text-fg">{s.icon} {s.label}</span>
                  <span className="tabular-nums text-muted">{pct === null ? 'zatím bez dat' : `${pct} % · ${s.t} úloh`}</span>
                </div>
                <ProgressBar value={pct ?? 0} max={100} tone={pct === null ? 'accent' : pct >= 70 ? 'success' : pct >= 44 ? 'warning' : 'danger'} label={s.label} />
              </div>
            );
          })}
        </div>
      </section>

      {GROUPS.filter((g) => ['vocab', 'grammar', 'reading', 'listening', 'quiz'].includes(g.id)).map((g) => {
        const mods = MODULES.filter((m) => m.group === g.id && m.tracked);
        return (
          <section key={g.id} className="card !p-5">
            <h2 className="section-title">{g.icon} {g.title}</h2>
            <ul className="space-y-2.5">
              {mods.map((m) => {
                const st = stats[m.id];
                const pct = st && st.total ? Math.round((st.correct / st.total) * 100) : null;
                return (
                  <li key={m.id}>
                    <Link to={m.path} className="flex items-center gap-3 no-underline">
                      <span className="w-6 text-center" aria-hidden="true">{m.icon}</span>
                      <span className="w-40 shrink-0 truncate text-sm font-bold text-fg sm:w-52">{m.title}</span>
                      <span className="flex-1">
                        <ProgressBar value={pct ?? 0} max={100} tone={pct === null ? 'accent' : pct >= 80 ? 'success' : pct >= 60 ? 'warning' : 'danger'} label={m.title} />
                      </span>
                      <span className="w-20 text-right text-xs tabular-nums text-muted">{pct === null ? '—' : `${pct} % · ${st!.sessions}×`}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

/* ─── Vocabulary ───────────────────────────────────────────────────── */

function VocabTab({ srs }: { srs: SRSState[] }) {
  const vocab = srs.filter((s) => s.deckId === 'vocab' && s.totalReviews > 0);
  const counts = { learning: 0, young: 0, mature: 0 };
  for (const s of vocab) {
    const st = cardStage(s);
    if (st !== 'new') counts[st]++;
  }
  const total = VOCABULARY.length;
  const unseen = total - vocab.length;
  // Forecast: cards due per day for the next 7 days.
  const sod = startOfDay();
  const forecast = Array.from({ length: 7 }, (_, i) => {
    const from = i === 0 ? -Infinity : sod + i * 86400000;
    const to = sod + (i + 1) * 86400000;
    return { day: addDays(dayKey(), i), count: vocab.filter((s) => s.dueAt >= from && s.dueAt < to).length };
  });
  const maxF = Math.max(1, ...forecast.map((f) => f.count));
  const other = srs.filter((s) => s.deckId !== 'vocab' && s.totalReviews > 0).length;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="card !p-5">
        <h2 className="section-title">Stav slovíček</h2>
        <div className="mb-3 flex h-4 overflow-hidden rounded-full bg-surface-3" aria-hidden="true">
          <div style={{ width: `${(counts.mature / total) * 100}%`, background: 'var(--g92-success)' }} />
          <div style={{ width: `${(counts.young / total) * 100}%`, background: 'var(--accent)' }} />
          <div style={{ width: `${(counts.learning / total) * 100}%`, background: 'var(--g92-warning)' }} />
        </div>
        <ul className="space-y-1.5 text-sm">
          <Legend color="var(--g92-success)" label="Zažitá (interval 3+ týdny)" value={counts.mature} />
          <Legend color="var(--accent)" label="Opakovaná" value={counts.young} />
          <Legend color="var(--g92-warning)" label="Právě se učíš" value={counts.learning} />
          <Legend color="var(--g92-surface-3)" label="Ještě neviděná" value={unseen} />
        </ul>
        {other > 0 && <p className="mt-3 text-xs text-muted">+ {other} vlastních kartiček.</p>}
        <Link to="/vocab" className="btn-primary mt-4">Opakovat slovíčka</Link>
      </section>

      <section className="card !p-5">
        <h2 className="section-title">Kolik tě čeká v příštích dnech</h2>
        <div className="flex h-32 items-end gap-2">
          {forecast.map((f, i) => (
            <div key={f.day} className="flex flex-1 flex-col items-center justify-end gap-1" style={{ height: '100%' }}>
              <span className="text-xs font-bold tabular-nums text-muted">{f.count || ''}</span>
              <div className="w-full max-w-10 rounded-md" style={{ height: `${Math.max(4, (f.count / maxF) * 80)}%`, background: i === 0 ? 'var(--g92-warning)' : 'var(--accent)' }} />
              <span className="text-[0.65rem] font-bold text-muted">{i === 0 ? 'dnes' : ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So'][parseDayKey(f.day).getDay()]}</span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">Předpověď počítá jen se slovíčky, která už opakuješ. Nová slovíčka přibývají podle denního limitu v nastavení.</p>
      </section>
    </div>
  );
}

function Legend({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <li className="flex items-center gap-2">
      <span className="h-3 w-3 rounded-sm" style={{ background: color }} aria-hidden="true" />
      <span className="flex-1 text-fg">{label}</span>
      <span className="font-bold tabular-nums text-fg">{value}</span>
    </li>
  );
}

/* ─── Exams ────────────────────────────────────────────────────────── */

function ExamsTab({ exams }: { exams: ExamSession[] }) {
  const full = exams.filter((e) => e.mode === 'full' || (!e.mode && e.notes !== 'mini-test'));
  if (exams.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-3 !py-10 text-center">
        <div className="text-5xl" aria-hidden="true">🎓</div>
        <p className="font-bold text-fg">Zatím žádný cvičný test</p>
        <Link to="/exam" className="btn-primary">Vyzkoušet test nanečisto</Link>
      </div>
    );
  }
  const chart = full.slice(0, 12).reverse();
  return (
    <div className="space-y-4">
      {chart.length > 0 && (
        <section className="card !p-5">
          <h2 className="section-title">Vývoj skóre (celé testy)</h2>
          <div className="relative flex h-40 items-end gap-2 border-b border-border">
            <div className="absolute inset-x-0 border-t-2 border-dashed border-danger/60" style={{ bottom: '44%' }}>
              <span className="absolute -top-5 right-0 text-[0.65rem] font-bold text-danger">hranice 44</span>
            </div>
            {chart.map((e, i) => {
              const pct = e.maxScore ? (e.scoreTotal / e.maxScore) * 100 : 0;
              return (
                <div key={e.id ?? i} className="flex flex-1 flex-col items-center justify-end" style={{ height: '100%' }}>
                  <span className="text-xs font-bold tabular-nums text-fg">{Math.round(e.scoreTotal)}</span>
                  <div className="w-full max-w-10 rounded-t-md" style={{ height: `${pct}%`, background: pct >= 44 ? 'var(--g92-success)' : 'var(--g92-danger)' }} />
                </div>
              );
            })}
          </div>
        </section>
      )}
      <section className="card !p-5">
        <h2 className="section-title">Historie</h2>
        <ul className="divide-y divide-border">
          {exams.map((e, i) => {
            const pct = e.maxScore ? Math.round((e.scoreTotal / e.maxScore) * 100) : 0;
            const inner = (
              <>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold text-fg">{examLabel(e)}</span>
                  <span className="block text-xs text-muted">
                    {new Date(e.startedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {' · '}{skillSummary(e)}
                  </span>
                </span>
                <span className={`text-lg font-black tabular-nums ${pct >= 44 ? 'text-success' : 'text-danger'}`}>
                  {e.mode === 'full' ? `${Math.round(e.scoreTotal)} b` : `${pct} %`}
                </span>
              </>
            );
            return (
              <li key={e.id ?? i}>
                {e.id !== undefined && e.partPoints ? (
                  <Link to={`/exam/history/${e.id}`} className="flex items-center gap-3 py-2.5 no-underline">{inner}<span aria-hidden="true" className="text-muted">›</span></Link>
                ) : (
                  <div className="flex items-center gap-3 py-2.5">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

function examLabel(e: ExamSession): string {
  if (e.mode === 'full') return 'Celý didaktický test';
  if (e.mode === 'listening') return 'Poslech (části 1–4)';
  if (e.mode === 'reading') return 'Čtení a jazyková kompetence (části 5–10)';
  if (e.mode === 'part') return 'Trénink části testu';
  if (e.notes === 'mini-test' || e.mode === 'mini') return 'Mini-test';
  return 'Simulace (starší verze)';
}

/* ─── Achievements ─────────────────────────────────────────────────── */

function AchievementsTab({ stats, sessions, exams }: { stats: UserStats; sessions: DrillSession[]; exams: ExamSession[] }) {
  const list = buildAchievements(stats, sessions, exams);
  const earned = list.filter((a) => a.earned).length;
  return (
    <div>
      <p className="mb-3 text-sm text-muted">Splněno <strong className="text-fg">{earned}</strong> z {list.length} úspěchů.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((a) => (
          <div key={a.id} className={`card !p-3 ${a.earned ? '!border-success' : 'opacity-70'}`}>
            <div className="flex items-start justify-between">
              <span className={`text-3xl ${a.earned ? '' : 'grayscale'}`} aria-hidden="true">{a.icon}</span>
              {a.earned && <span className="font-black text-success" aria-label="splněno">✓</span>}
            </div>
            <div className="mt-1 text-sm font-bold text-fg">{a.name}</div>
            <div className="text-xs text-muted">{a.desc}</div>
            {!a.earned && a.target > 1 && (
              <div className="mt-2">
                <ProgressBar value={a.current} max={a.target} className="!h-1.5" label={a.name} />
                <div className="mt-0.5 text-[0.65rem] tabular-nums text-muted">{a.current} / {a.target}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Heatmap ──────────────────────────────────────────────────────── */

interface HeatDay {
  dateKey: string;
  mins: number;
  future: boolean;
}

function HeatmapGrid({ weeks }: { weeks: HeatDay[][] }) {
  const CELL = 14;
  const GAP = 3;
  const S = CELL + GAP;
  const TOP = 16;
  const monthLabels: { col: number; label: string }[] = [];
  let prevMonth = -1;
  weeks.forEach((week, wi) => {
    const m = parseDayKey(week[0].dateKey).getMonth();
    if (m !== prevMonth) {
      monthLabels.push({ col: wi, label: MONTHS_CS[m] });
      prevMonth = m;
    }
  });
  const level = (m: number) => (m <= 0 ? 0 : m < 10 ? 1 : m < 20 ? 2 : 3);
  const fills = ['var(--g92-surface-3)', 'color-mix(in srgb, var(--g92-success) 35%, var(--g92-surface))', 'color-mix(in srgb, var(--g92-success) 65%, var(--g92-surface))', 'var(--g92-success)'];
  return (
    <div className="overflow-x-auto pb-1">
      <svg width={weeks.length * S} height={TOP + 7 * S} className="mx-auto block" role="img" aria-label="Kalendář aktivity za posledních 13 týdnů">
        {monthLabels.map((ml, i) => (
          <text key={i} x={ml.col * S} y={11} fontSize={10} fill="var(--g92-text-muted)" fontFamily="inherit">{ml.label}</text>
        ))}
        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <rect key={`${wi}-${di}`} x={wi * S} y={TOP + di * S} width={CELL} height={CELL} rx={3} fill={day.future ? 'transparent' : fills[level(day.mins)]}>
              <title>{parseDayKey(day.dateKey).toLocaleDateString('cs-CZ')}: {day.future ? '—' : `${Math.round(day.mins)} min`}</title>
            </rect>
          )),
        )}
      </svg>
      <div className="mt-2 flex items-center justify-center gap-1.5 text-xs text-muted">
        <span>méně</span>
        {fills.map((f) => <span key={f} className="inline-block h-3 w-3 rounded-sm" style={{ background: f }} />)}
        <span>více</span>
      </div>
    </div>
  );
}

function buildHeatmap(sessions: DrillSession[]): HeatDay[][] {
  const activity = new Map<string, number>();
  for (const s of sessions) {
    if (!s.endedAt) continue;
    const mins = (s.endedAt - s.startedAt) / 60000;
    if (mins > 0) activity.set(s.date, (activity.get(s.date) || 0) + mins);
  }
  const today = dayKey();
  const dow = (parseDayKey(today).getDay() + 6) % 7; // Mon=0
  const start = addDays(today, -dow - 12 * 7);
  const weeks: HeatDay[][] = [];
  for (let w = 0; w < 13; w++) {
    const week: HeatDay[] = [];
    for (let d = 0; d < 7; d++) {
      const key = addDays(start, w * 7 + d);
      const future = key > today;
      week.push({ dateKey: key, mins: future ? 0 : activity.get(key) || 0, future });
    }
    weeks.push(week);
  }
  return weeks;
}

/* ─── Achievements & level ─────────────────────────────────────────── */

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  earned: boolean;
  current: number;
  target: number;
}

const GRAMMAR_MODULES = new Set(MODULES.filter((m) => m.group === 'grammar').map((m) => m.id));

function buildAchievements(stats: UserStats, sessions: DrillSession[], exams: ExamSession[]): AchievementDef[] {
  const byModule = (id: string) => sessions.filter((s) => sessionModule(s) === id).length;
  const gram = sessions.filter((s) => GRAMMAR_MODULES.has(sessionModule(s))).length;
  const read = byModule('reading');
  const listen = byModule('listening');
  const wordOrder = byModule('word_order');
  const speed = byModule('speed');
  const mistakeDrills = byModule('mistakes');
  const modules = new Set(sessions.map((s) => sessionModule(s)));
  const skills = new Set(
    [...modules].map((id) => MODULES.find((m) => m.id === id)?.group).filter((g): g is NonNullable<typeof g> => !!g && ['vocab', 'grammar', 'reading', 'listening', 'quiz'].includes(g)),
  );
  const fullExams = exams.filter((e) => e.mode === 'full');
  const passed = fullExams.some((e) => e.scoreTotal >= 44);
  const excellent = fullExams.some((e) => e.scoreTotal >= 80);
  const totalDrills = sessions.length;
  const totalEx = stats.totalExercisesDone;
  const a = (id: string, name: string, desc: string, icon: string, current: number, target: number): AchievementDef => ({
    id, name, desc, icon, earned: current >= target, current: Math.min(target, Math.round(current)), target,
  });

  return [
    a('first', 'První kroky', 'Dokonči první cvičení', '👣', totalDrills, 1),
    a('vocab100', 'Slovíčkář', 'Nauč se 100 slovíček', '📚', stats.totalCardsLearned, 100),
    a('gram50', 'Gramatik', 'Dokonči 50 gramatických cvičení', '✏️', gram, 50),
    a('read10', 'Čtenář', 'Dokonči 10 čtení', '📖', read, 10),
    a('listen10', 'Posluchač', 'Dokonči 10 poslechů', '🎧', listen, 10),
    a('streak7', 'Týden v kuse', '7 dní učení v řadě', '🔥', stats.bestStreak, 7),
    a('streak30', 'Měsíc v kuse', '30 dní učení v řadě', '🏅', stats.bestStreak, 30),
    a('exam1', 'Nanečisto', 'Dokonči celý cvičný test', '📝', fullExams.length, 1),
    a('maturant', 'Maturant', 'Získej v testu 44+ bodů', '🎯', passed ? 1 : 0, 1),
    a('vyborny', 'Výborně', 'Získej v testu 80+ bodů', '⭐', excellent ? 1 : 0, 1),
    a('vocab500', 'Polyglot', 'Nauč se 500 slovíček', '🌍', stats.totalCardsLearned, 500),
    a('gram200', 'Mistr gramatiky', 'Dokonči 200 gramatických cvičení', '🎓', gram, 200),
    a('persistent', 'Vytrvalec', 'Studuj celkem 1000 minut', '⏱️', stats.totalStudyMinutes, 1000),
    a('skills', 'Všestranný', 'Procvič všech 5 oblastí', '🏆', skills.size, 5),
    a('vocab1000', 'Expert', 'Nauč se 1000 slovíček', '👑', stats.totalCardsLearned, 1000),
    a('wordOrder20', 'Stavitel vět', 'Dokonči 20× slovosled', '🧱', wordOrder, 20),
    a('speed5', 'Blesk', 'Dokonči 5 rychlovek', '⚡', speed, 5),
    a('mistake10', 'Poučený', 'Dokonči 10 kol oprav chyb', '🔁', mistakeDrills, 10),
    a('exercises500', 'Maratonec', 'Zodpověz 500 úloh', '🏃', totalEx, 500),
    a('exercises2000', 'Ultra', 'Zodpověz 2000 úloh', '💎', totalEx, 2000),
    a('allModules', 'Zvídavý', 'Zkus 10 různých cvičení', '🎪', modules.size, 10),
    a('streak100', 'Stodenní', '100 dní učení v řadě', '🛡️', stats.bestStreak, 100),
  ];
}

const LEVELS = [
  { name: 'Začátečník', minXP: 0, icon: '🌱' },
  { name: 'Učeň', minXP: 100, icon: '📗' },
  { name: 'Student', minXP: 300, icon: '📘' },
  { name: 'Pokročilý', minXP: 600, icon: '📙' },
  { name: 'Zdatný', minXP: 1000, icon: '🔵' },
  { name: 'Zkušený', minXP: 1500, icon: '🟣' },
  { name: 'Mistr', minXP: 2500, icon: '🟡' },
  { name: 'Expert', minXP: 4000, icon: '🟠' },
  { name: 'Guru', minXP: 6000, icon: '🔴' },
  { name: 'Legenda', minXP: 10000, icon: '👑' },
];

export function computeLevel(stats: UserStats) {
  const xp = Math.round(stats.totalExercisesDone * 5 + stats.totalCardsLearned * 10 + stats.totalStudyMinutes * 2 + stats.bestStreak * 20);
  let idx = 0;
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXP) {
      idx = i;
      break;
    }
  }
  const level = LEVELS[idx];
  const nextLevel = LEVELS[idx + 1] ?? null;
  const progress = nextLevel ? (xp - level.minXP) / (nextLevel.minXP - level.minXP) : 1;
  return { xp, level, nextLevel, progress: Math.min(1, Math.max(0, progress)) };
}
