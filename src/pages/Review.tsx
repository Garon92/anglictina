import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllSRSStates, getDrillSessions, getExamSessions } from '../db';
import { formatMinutes, percentOf, getScoreColor } from '../utils';
import { VOCABULARY } from '../data/vocabulary';
import { getErrorAnalysis, getModuleLabel, clearErrors, type ErrorAnalysis } from '../errorTracker';
import type { UserStats, SRSState, DrillSession, ExamSession } from '../types';
import { DEFAULT_STATS } from '../types';

type TabKey = 'overview' | 'activity' | 'skills' | 'achievements' | 'vocab' | 'errors';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'overview', label: 'Přehled' },
  { key: 'activity', label: 'Aktivita' },
  { key: 'skills', label: 'Dovednosti' },
  { key: 'errors', label: 'Chyby' },
  { key: 'achievements', label: 'Úspěchy' },
  { key: 'vocab', label: 'Slovíčka' },
];

const SKILL_TYPES = ['vocab', 'grammar', 'reading', 'listening', 'phrasal_verbs'] as const;
type SkillType = (typeof SKILL_TYPES)[number];

const SKILL_LABELS: Record<SkillType, string> = {
  vocab: 'Slovíčka',
  grammar: 'Gramatika',
  reading: 'Čtení',
  listening: 'Poslech',
  phrasal_verbs: 'Frázová slovesa',
};

const SKILL_ICONS: Record<SkillType, string> = {
  vocab: '📝',
  grammar: '✏️',
  reading: '📖',
  listening: '🎧',
  phrasal_verbs: '🔗',
};

const MONTHS_CS = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čvn', 'Čvc', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];

function dateToKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/* ══════════════════════════════════════════════════════════ */

export default function Review() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [srsStates, setSrsStates] = useState<SRSState[]>([]);
  const [sessions, setSessions] = useState<DrillSession[]>([]);
  const [examSessions, setExamSessions] = useState<ExamSession[]>([]);
  const [errorAnalysis, setErrorAnalysis] = useState<ErrorAnalysis | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    (async () => {
      const [s, srs, sess, exams] = await Promise.all([
        getStats(),
        getAllSRSStates(),
        getDrillSessions(),
        getExamSessions(),
      ]);
      setStats(s);
      setSrsStates(srs);
      setSessions(sess.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)));
      setExamSessions(exams.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)));
      setErrorAnalysis(getErrorAnalysis());
    })();
  }, []);

  /* ── Vocabulary SRS ── */
  const totalWords = srsStates.filter((s) => s.deckId === 'vocab').length;
  const masteredWords = srsStates.filter((s) => s.deckId === 'vocab' && s.intervalDays >= 21).length;
  const learningWords = totalWords - masteredWords;
  const dueNow = srsStates.filter((s) => s.dueAt <= Date.now()).length;

  /* ── Last 7 days ── */
  const last7 = sessions.filter((s) => s.startedAt > Date.now() - 7 * 86400000);
  const last7correct = last7.reduce((n, s) => n + s.correctItems, 0);
  const last7total = last7.reduce((n, s) => n + s.totalItems, 0);
  const weekAcc = percentOf(last7correct, last7total);

  /* ── Per-type count ── */
  const countByType = (t: string) => sessions.filter((s) => s.type === t).length;

  /* ── Skill stats ── */
  const skillStats = SKILL_TYPES.map((type) => {
    const ts = sessions.filter((s) => s.type === type);
    const cor = ts.reduce((n, s) => n + s.correctItems, 0);
    const tot = ts.reduce((n, s) => n + s.totalItems, 0);
    return { type, label: SKILL_LABELS[type], icon: SKILL_ICONS[type], count: ts.length, accuracy: percentOf(cor, tot) };
  });

  const practiced = skillStats.filter((s) => s.count > 0);
  const weakest = practiced.length > 0 ? practiced.reduce((a, b) => (a.accuracy < b.accuracy ? a : b)) : null;
  const unpracticed = skillStats.filter((s) => s.count === 0);

  /* ── Heatmap ── */
  const heatWeeks = buildHeatmap(sessions);
  const heatFlat = heatWeeks.flat().filter((d) => !d.future);
  const activeDays = heatFlat.filter((d) => d.mins > 0).length;
  const avgDaily = heatFlat.length > 0 ? Math.round(heatFlat.reduce((s, d) => s + d.mins, 0) / heatFlat.length) : 0;

  /* ── Achievements ── */
  const achievements = buildAchievements(stats, sessions, examSessions);

  return (
    <div className="page-container">
      <h1 className="page-title">Tvůj pokrok</h1>
      <p className="page-subtitle">Přehled tvého učení a statistik.</p>

      {/* ── Streak & time cards ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{stats.streakDays}</div>
          <div className="text-xs text-slate-400">dní v řadě</div>
          <div className="text-xs text-slate-300 dark:text-slate-600 mt-1">Rekord: {stats.bestStreak}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-1">⏱️</div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            {formatMinutes(stats.totalStudyMinutes)}
          </div>
          <div className="text-xs text-slate-400">celkový čas</div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div className="flex overflow-x-auto bg-slate-100 dark:bg-slate-800 rounded-xl p-1 mb-4 gap-0.5">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`flex-1 min-w-0 py-2 px-1 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400'
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════ TAB 1 — Přehled ════════════ */}
      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="section-title">Posledních 7 dní</h3>
            <div className="grid grid-cols-3 gap-3">
              <StatCell value={last7.length} label="lekcí" />
              <StatCell value={last7total} label="úloh" />
              <StatCell value={`${weekAcc}%`} label="úspěšnost" color={getScoreColor(weekAcc)} />
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Celkem podle typu</h3>
            <div className="space-y-2">
              <StatRow label="Naučených slov" value={stats.totalCardsLearned} />
              <StatRow label="Dokončených cvičení" value={stats.totalExercisesDone} />
              <StatRow label="Slovíčkových lekcí" value={countByType('vocab')} />
              <StatRow label="Gramatických lekcí" value={countByType('grammar')} />
              <StatRow label="Čtení" value={countByType('reading')} />
              <StatRow label="Poslechů" value={countByType('listening')} />
              <StatRow label="Frázových sloves" value={countByType('phrasal_verbs')} />
              <StatRow label="Zkoušek" value={examSessions.length} />
            </div>
          </div>

          {examSessions.length > 0 && (
            <div className="card">
              <h3 className="section-title">Historie zkoušek</h3>
              <div className="space-y-2">
                {examSessions.slice(0, 5).map((e, i) => {
                  const pct = percentOf(e.scoreTotal, e.maxScore);
                  return (
                    <div
                      key={e.id ?? i}
                      className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-700 last:border-0"
                    >
                      <div>
                        <div className="text-sm font-medium text-slate-800 dark:text-slate-200">
                          {new Date(e.startedAt).toLocaleDateString('cs-CZ')}
                        </div>
                        <div className="text-xs text-slate-400">
                          {e.scoreTotal}/{e.maxScore} bodů
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold" style={{ color: getScoreColor(pct) }}>
                          {pct}%
                        </div>
                        <div className="text-xs text-slate-400">
                          L:{e.scoreBySkill.listening} R:{e.scoreBySkill.reading} G:{e.scoreBySkill.language}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB 2 — Aktivita ════════════ */}
      {activeTab === 'activity' && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="section-title">Kalendář aktivity (90 dní)</h3>
            <HeatmapGrid weeks={heatWeeks} />
            <div className="flex items-center justify-center gap-1.5 mt-3 text-xs text-slate-400">
              <span>Méně</span>
              <span className="inline-block w-3 h-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
              <span className="inline-block w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <span className="inline-block w-3 h-3 rounded-sm bg-green-400 dark:bg-green-600" />
              <span className="inline-block w-3 h-3 rounded-sm bg-green-600 dark:bg-green-400" />
              <span>Více</span>
            </div>
          </div>

          <div className="card">
            <div className="grid grid-cols-3 gap-3">
              <StatCell value={activeDays} label="aktivních dní" />
              <StatCell value={stats.bestStreak} label="nejdelší streak" />
              <StatCell value={`${avgDaily} min`} label="průměr / den" />
            </div>
          </div>
        </div>
      )}

      {/* ════════════ TAB 3 — Dovednosti ════════════ */}
      {activeTab === 'skills' && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="section-title">Přehled dovedností</h3>
            <div className="space-y-4">
              {skillStats.map((sk) => (
                <div key={sk.type}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span>{sk.icon}</span>
                      <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{sk.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">{sk.count} lekcí</span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: sk.count > 0 ? getScoreColor(sk.accuracy) : '#94a3b8' }}
                      >
                        {sk.count > 0 ? `${sk.accuracy}%` : '—'}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${sk.count > 0 ? sk.accuracy : 0}%`,
                        backgroundColor: sk.count > 0 ? getScoreColor(sk.accuracy) : '#cbd5e1',
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Porovnání silných stránek</h3>
            {practiced.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Zatím nemáš žádná data. Začni cvičit!</p>
            ) : (
              <div className="space-y-3">
                {practiced
                  .slice()
                  .sort((a, b) => b.accuracy - a.accuracy)
                  .map((sk) => {
                    const maxAcc = Math.max(...practiced.map((p) => p.accuracy), 1);
                    const rel = (sk.accuracy / maxAcc) * 100;
                    return (
                      <div key={sk.type} className="flex items-center gap-3">
                        <span className="w-20 text-xs text-slate-500 dark:text-slate-400 text-right shrink-0">
                          {sk.label}
                        </span>
                        <div className="flex-1 bg-slate-100 dark:bg-slate-700 rounded-full h-4 overflow-hidden">
                          <div
                            className="h-full rounded-full flex items-center justify-end pr-1.5"
                            style={{
                              width: `${Math.max(rel, 12)}%`,
                              backgroundColor: getScoreColor(sk.accuracy),
                            }}
                          >
                            <span className="text-[10px] font-bold text-white leading-none">{sk.accuracy}%</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {(weakest || unpracticed.length > 0) && (
            <div className="card bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">💡</span>
                <div>
                  <div className="font-semibold text-blue-800 dark:text-blue-200 text-sm">Doporučení</div>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {unpracticed.length > 0
                      ? `Ještě jsi nezkoušel/a: ${unpracticed.map((s) => s.label.toLowerCase()).join(', ')}. Vyzkoušej nové typy cvičení pro vyrovnaný pokrok!`
                      : weakest
                        ? `Tvá nejslabší oblast je ${weakest.label.toLowerCase()} (${weakest.accuracy}%). Zaměř se na ni pro lepší výsledky u maturity.`
                        : ''}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ════════════ TAB 4 — Úspěchy ════════════ */}
      {activeTab === 'achievements' && (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900 dark:text-white">
              {achievements.filter((a) => a.earned).length} / {achievements.length}
            </div>
            <div className="text-xs text-slate-400">splněných úspěchů</div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {achievements.map((a) => (
              <div
                key={a.id}
                className={`card !p-3 transition-all ${
                  a.earned ? 'ring-2 ring-green-400 dark:ring-green-600' : 'opacity-50 grayscale'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl">{a.icon}</span>
                  {a.earned && <span className="text-green-500 font-bold text-sm">✓</span>}
                </div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{a.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{a.desc}</div>
                {!a.earned && a.target > 1 && (
                  <div className="mt-2">
                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-blue-400 dark:bg-blue-500 h-full rounded-full"
                        style={{ width: `${percentOf(a.current, a.target)}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {a.current} / {a.target}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ════════════ TAB — Chyby ════════════ */}
      {activeTab === 'errors' && errorAnalysis && (
        <div className="space-y-3">
          {errorAnalysis.totalErrors === 0 ? (
            <div className="card text-center py-8">
              <div className="text-4xl mb-3">✅</div>
              <p className="text-slate-500 dark:text-slate-400">Zatím žádné zaznamenané chyby. Pokračuj v procvičování!</p>
            </div>
          ) : (
            <>
              <div className="card">
                <h3 className="section-title">Přehled chyb</h3>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">{errorAnalysis.totalErrors}</div>
                    <div className="text-xs text-slate-500">celkem chyb</div>
                  </div>
                  <div className="text-center p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl">
                    <div className="text-lg font-bold text-amber-600 dark:text-amber-400">{getModuleLabel(errorAnalysis.weakestModule)}</div>
                    <div className="text-xs text-slate-500">nejslabší oblast</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="section-title">Chyby podle modulu</h3>
                <div className="space-y-2">
                  {Object.entries(errorAnalysis.byModule)
                    .sort((a, b) => b[1] - a[1])
                    .map(([mod, count]) => {
                      const pct = Math.round((count / errorAnalysis.totalErrors) * 100);
                      return (
                        <div key={mod}>
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-slate-700 dark:text-slate-300">{getModuleLabel(mod)}</span>
                            <span className="text-slate-500">{count}x ({pct}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-red-400 h-full rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              <div className="card">
                <h3 className="section-title">Poslední chyby</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {errorAnalysis.recentErrors.map((e, i) => (
                    <div key={i} className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-sm">
                      <div className="text-slate-700 dark:text-slate-200 mb-1">{e.question}</div>
                      <div className="flex gap-3 text-xs">
                        <span className="text-red-500">✗ {e.userAnswer}</span>
                        <span className="text-green-500">✓ {e.correctAnswer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="btn-ghost text-sm text-red-500 w-full"
                onClick={() => { clearErrors(); setErrorAnalysis(getErrorAnalysis()); }}
              >
                Vymazat historii chyb
              </button>
            </>
          )}
        </div>
      )}

      {/* ════════════ TAB 5 — Slovíčka ════════════ */}
      {activeTab === 'vocab' && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="section-title">Stav slovíček</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{totalWords}</div>
                <div className="text-xs text-slate-400">celkem</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-600">{learningWords}</div>
                <div className="text-xs text-slate-400">učí se</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{masteredWords}</div>
                <div className="text-xs text-slate-400">zvládnuto</div>
              </div>
            </div>
            {totalWords > 0 && (
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden flex">
                <div className="bg-green-500 h-full" style={{ width: `${percentOf(masteredWords, totalWords)}%` }} />
                <div className="bg-amber-400 h-full" style={{ width: `${percentOf(learningWords, totalWords)}%` }} />
              </div>
            )}
          </div>

          {dueNow > 0 && (
            <div className="card bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-800 dark:text-amber-200">{dueNow} slov k opakování</div>
                  <div className="text-sm text-amber-600 dark:text-amber-400">Opakuj teď pro lepší zapamatování</div>
                </div>
                <button className="btn bg-amber-500 text-white hover:bg-amber-600" onClick={() => navigate('/vocab')}>
                  Opakovat
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="section-title">Dostupná slovíčka</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              V databázi je celkem {VOCABULARY.length} slov z NGSL wordlistu. Každý den se přidávají nová podle tvého
              nastavení.
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 mt-3">
              <div
                className="bg-primary-500 h-full rounded-full"
                style={{ width: `${percentOf(totalWords, VOCABULARY.length)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {totalWords} / {VOCABULARY.length} odhaleno
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Helper components
   ══════════════════════════════════════════════════════════ */

function StatCell({ value, label, color }: { value: number | string; label: string; color?: string }) {
  return (
    <div className="text-center">
      <div className="text-xl font-bold text-slate-900 dark:text-white" style={color ? { color } : undefined}>
        {value}
      </div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-slate-50 dark:border-slate-800 last:border-0">
      <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

/* ── Heatmap SVG ── */

interface HeatDay {
  dateKey: string;
  mins: number;
  future: boolean;
}

function HeatmapGrid({ weeks }: { weeks: HeatDay[][] }) {
  const CELL = 14;
  const GAP = 2;
  const S = CELL + GAP;
  const TOP = 18;

  const monthLabels: { col: number; label: string }[] = [];
  let prevMonth = -1;
  weeks.forEach((week, wi) => {
    const m = new Date(week[0].dateKey + 'T12:00:00').getMonth();
    if (m !== prevMonth) {
      monthLabels.push({ col: wi, label: MONTHS_CS[m] });
      prevMonth = m;
    }
  });

  return (
    <div className="overflow-x-auto pb-1">
      <svg
        width={weeks.length * S}
        height={TOP + 7 * S}
        className="mx-auto block"
        role="img"
        aria-label="Kalendář aktivity za posledních 90 dní"
      >
        {monthLabels.map((ml, i) => (
          <text
            key={i}
            x={ml.col * S}
            y={12}
            fontSize={10}
            className="fill-slate-400 dark:fill-slate-500"
            fontFamily="system-ui, sans-serif"
          >
            {ml.label}
          </text>
        ))}

        {weeks.map((week, wi) =>
          week.map((day, di) => (
            <rect
              key={`${wi}-${di}`}
              x={wi * S}
              y={TOP + di * S}
              width={CELL}
              height={CELL}
              rx={2}
              className={
                day.future
                  ? 'fill-transparent'
                  : day.mins <= 0
                    ? 'fill-slate-200 dark:fill-slate-700'
                    : day.mins < 10
                      ? 'fill-green-200 dark:fill-green-900'
                      : day.mins < 20
                        ? 'fill-green-400 dark:fill-green-600'
                        : 'fill-green-600 dark:fill-green-400'
              }
            >
              <title>
                {day.dateKey}: {day.future ? '—' : `${Math.round(day.mins)} min`}
              </title>
            </rect>
          )),
        )}
      </svg>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Data builders
   ══════════════════════════════════════════════════════════ */

function buildHeatmap(sessions: DrillSession[]): HeatDay[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activityMap = new Map<string, number>();
  for (const s of sessions) {
    if (!s.endedAt) continue;
    const mins = (s.endedAt - s.startedAt) / 60000;
    if (mins > 0) activityMap.set(s.date, (activityMap.get(s.date) || 0) + mins);
  }

  const todayDow = (today.getDay() + 6) % 7; // Mon=0 … Sun=6
  const start = new Date(today);
  start.setDate(today.getDate() - todayDow - 12 * 7);

  const weeks: HeatDay[][] = [];
  const cur = new Date(start);
  for (let w = 0; w < 13; w++) {
    const week: HeatDay[] = [];
    for (let d = 0; d < 7; d++) {
      const key = dateToKey(cur);
      const isFuture = cur > today;
      week.push({ dateKey: key, mins: isFuture ? 0 : (activityMap.get(key) || 0), future: isFuture });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

interface AchievementDef {
  id: string;
  name: string;
  desc: string;
  icon: string;
  earned: boolean;
  current: number;
  target: number;
}

function buildAchievements(stats: UserStats, sessions: DrillSession[], exams: ExamSession[]): AchievementDef[] {
  const gram = sessions.filter((s) => s.type === 'grammar').length;
  const read = sessions.filter((s) => s.type === 'reading').length;
  const listen = sessions.filter((s) => s.type === 'listening').length;
  const uniqSkills = new Set(
    sessions.map((s) => s.type).filter((t) => (['vocab', 'grammar', 'reading', 'listening', 'phrasal_verbs'] as string[]).includes(t)),
  );
  const passed = exams.some((e) => e.maxScore > 0 && percentOf(e.scoreTotal, e.maxScore) >= 44);
  const excellent = exams.some((e) => e.maxScore > 0 && percentOf(e.scoreTotal, e.maxScore) >= 80);

  return [
    { id: 'first', name: 'První kroky', desc: 'Dokonči první cvičení', icon: '👣', earned: sessions.length >= 1, current: Math.min(1, sessions.length), target: 1 },
    { id: 'vocab100', name: 'Slovíčkář', desc: 'Nauč se 100 slovíček', icon: '📚', earned: stats.totalCardsLearned >= 100, current: Math.min(100, stats.totalCardsLearned), target: 100 },
    { id: 'gram50', name: 'Gramatik', desc: 'Dokonči 50 gramatických cvičení', icon: '✏️', earned: gram >= 50, current: Math.min(50, gram), target: 50 },
    { id: 'read10', name: 'Čtenář', desc: 'Dokonči 10 čtecích textů', icon: '📖', earned: read >= 10, current: Math.min(10, read), target: 10 },
    { id: 'listen10', name: 'Posluchač', desc: 'Dokonči 10 poslechových cvičení', icon: '🎧', earned: listen >= 10, current: Math.min(10, listen), target: 10 },
    { id: 'streak7', name: 'Týdenní streak', desc: '7 dní učení v řadě', icon: '🔥', earned: stats.bestStreak >= 7, current: Math.min(7, stats.bestStreak), target: 7 },
    { id: 'streak30', name: 'Měsíční streak', desc: '30 dní učení v řadě', icon: '🏅', earned: stats.bestStreak >= 30, current: Math.min(30, stats.bestStreak), target: 30 },
    { id: 'vocab500', name: 'Polyglot', desc: 'Nauč se 500 slovíček', icon: '🌍', earned: stats.totalCardsLearned >= 500, current: Math.min(500, stats.totalCardsLearned), target: 500 },
    { id: 'gram200', name: 'Mistr gramatiky', desc: 'Dokonči 200 gram. cvičení', icon: '🎓', earned: gram >= 200, current: Math.min(200, gram), target: 200 },
    { id: 'maturant', name: 'Maturant', desc: 'Složi zkoušku na 44%+', icon: '🎯', earned: passed, current: passed ? 1 : 0, target: 1 },
    { id: 'vyborny', name: 'Výborný', desc: 'Získej 80%+ u zkoušky', icon: '⭐', earned: excellent, current: excellent ? 1 : 0, target: 1 },
    { id: 'persistent', name: 'Vytrvalec', desc: 'Studuj celkem 1000+ minut', icon: '⏱️', earned: stats.totalStudyMinutes >= 1000, current: Math.min(1000, Math.round(stats.totalStudyMinutes)), target: 1000 },
    { id: 'decathlon', name: 'Desetibojař', desc: 'Procvič všech 5 typů dovedností', icon: '🏆', earned: uniqSkills.size >= 5, current: uniqSkills.size, target: 5 },
    { id: 'vocab1000', name: 'Expert', desc: 'Nauč se 1000 slovíček', icon: '👑', earned: stats.totalCardsLearned >= 1000, current: Math.min(1000, stats.totalCardsLearned), target: 1000 },
  ];
}
