import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getStats, getDrillSessions } from '../db';
import { getErrorAnalysis, getModuleLabel } from '../errorTracker';
import type { UserStats, DrillSession } from '../types';
import { DEFAULT_STATS } from '../types';

interface Recommendation {
  icon: string;
  title: string;
  desc: string;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

const DAY_NAMES = ['Neděle', 'Pondělí', 'Úterý', 'Středa', 'Čtvrtek', 'Pátek', 'Sobota'];

const WEEKLY_PLAN = [
  { day: 'Pondělí', icon: '📝', activities: ['Slovíčka (SRS)', 'Gramatika (10 úloh)'] },
  { day: 'Úterý', icon: '📖', activities: ['Čtení (1 text)', 'Předložky (10 úloh)'] },
  { day: 'Středa', icon: '🔄', activities: ['Nepravidelná slovesa', 'Členy (10 úloh)'] },
  { day: 'Čtvrtek', icon: '🎧', activities: ['Poslech (1 cvičení)', 'Kolokace kvíz'] },
  { day: 'Pátek', icon: '✍️', activities: ['Překlad vět (15)', 'Skládání vět (10)'] },
  { day: 'Sobota', icon: '💬', activities: ['Konverzační téma', 'Záměnná slova'] },
  { day: 'Neděle', icon: '🎯', activities: ['Mini-test simulace', 'Opakování slovíček'] },
];

export default function StudyPlan() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [sessions, setSessions] = useState<DrillSession[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  useEffect(() => {
    (async () => {
      const [s, sess] = await Promise.all([getStats(), getDrillSessions()]);
      setStats(s);
      setSessions(sess);
      setRecommendations(buildRecommendations(s, sess));
    })();
  }, []);

  const today = DAY_NAMES[new Date().getDay()];
  const todayPlan = WEEKLY_PLAN.find((p) => p.day === today) || WEEKLY_PLAN[0];

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <h1 className="page-title">Studijní plán</h1>
      <p className="page-subtitle">Tvůj doporučený rozvrh a priority</p>

      {/* Today's focus */}
      <div className="card mb-4 border-2 border-primary-200 dark:border-primary-700">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">{todayPlan.icon}</span>
          <div>
            <div className="font-bold text-slate-900 dark:text-white">Dnes — {today}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">Doporučené aktivity</div>
          </div>
        </div>
        <div className="space-y-2">
          {todayPlan.activities.map((act, i) => (
            <div key={i} className="flex items-center gap-2 p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <span className="text-primary-500">→</span>
              <span className="text-sm text-slate-700 dark:text-slate-300">{act}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Personalized recommendations */}
      {recommendations.length > 0 && (
        <>
          <h2 className="section-title">Doporučení pro tebe</h2>
          <div className="space-y-2 mb-6">
            {recommendations.map((rec, i) => (
              <Link
                key={i}
                to={rec.link}
                className={`card-hover flex items-center gap-3 !p-3 border-l-4 ${
                  rec.priority === 'high'
                    ? 'border-l-red-500'
                    : rec.priority === 'medium'
                    ? 'border-l-amber-500'
                    : 'border-l-green-500'
                }`}
              >
                <span className="text-2xl">{rec.icon}</span>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{rec.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{rec.desc}</div>
                </div>
                <span className="text-slate-400 text-sm">→</span>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* Weekly schedule */}
      <h2 className="section-title">Týdenní rozvrh</h2>
      <div className="space-y-2">
        {WEEKLY_PLAN.map((day) => (
          <div
            key={day.day}
            className={`card !p-3 ${day.day === today ? 'ring-2 ring-primary-500' : ''}`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span>{day.icon}</span>
              <span className={`font-semibold text-sm ${day.day === today ? 'text-primary-600 dark:text-primary-400' : 'text-slate-700 dark:text-slate-300'}`}>
                {day.day}
                {day.day === today && <span className="text-xs ml-1 text-primary-400">(dnes)</span>}
              </span>
            </div>
            <div className="pl-7 space-y-0.5">
              {day.activities.map((act, i) => (
                <div key={i} className="text-xs text-slate-500 dark:text-slate-400">• {act}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function buildRecommendations(stats: UserStats, sessions: DrillSession[]): Recommendation[] {
  const recs: Recommendation[] = [];
  const errors = getErrorAnalysis();
  const last7 = sessions.filter((s) => s.startedAt > Date.now() - 7 * 86400000);
  const typeCounts: Record<string, number> = {};
  for (const s of last7) typeCounts[s.type] = (typeCounts[s.type] || 0) + 1;

  if (stats.diagnosticScores.length === 0) {
    recs.push({ icon: '🩺', title: 'Udělej diagnostický test', desc: 'Zjistíš svou úroveň a my ti doporučíme, kde začít.', link: '/diagnostic', priority: 'high' });
  }

  if (stats.totalCardsLearned < 50) {
    recs.push({ icon: '📝', title: 'Nauč se víc slovíček', desc: `Zatím znáš ${stats.totalCardsLearned} slov. Cíl: alespoň 500 pro B1.`, link: '/vocab', priority: 'high' });
  }

  if (errors.totalErrors > 10 && errors.weakestModule) {
    const modLabel = getModuleLabel(errors.weakestModule);
    const modLinks: Record<string, string> = {
      grammar: '/grammar', prepositions: '/prepositions', vocab: '/vocab',
      confusables: '/confusables', irregular_verbs: '/irregular-verbs',
    };
    recs.push({
      icon: '⚠️',
      title: `Zaměř se na: ${modLabel}`,
      desc: `Máš ${errors.byModule[errors.weakestModule]} chyb v této oblasti.`,
      link: modLinks[errors.weakestModule] || '/grammar',
      priority: 'high',
    });
  }

  if (!typeCounts['grammar'] || typeCounts['grammar'] < 2) {
    recs.push({ icon: '✏️', title: 'Procvič gramatiku', desc: 'Tento týden málo gramatických cvičení.', link: '/grammar', priority: 'medium' });
  }

  if (!typeCounts['reading']) {
    recs.push({ icon: '📖', title: 'Přečti si text', desc: 'Čtení je klíč k rozšíření slovní zásoby.', link: '/reading', priority: 'medium' });
  }

  if (!typeCounts['listening']) {
    recs.push({ icon: '🎧', title: 'Vyzkoušej poslech', desc: 'Poslech je důležitá část maturity.', link: '/listening', priority: 'medium' });
  }

  if (stats.streakDays === 0) {
    recs.push({ icon: '🔥', title: 'Začni streak', desc: 'Pravidelnost je nejdůležitější. I 10 minut denně stačí!', link: '/vocab', priority: 'medium' });
  }

  recs.push({ icon: '🃏', title: 'Zahraj si pexeso', desc: 'Zábavný způsob jak si zopakovat slovíčka.', link: '/matching', priority: 'low' });

  return recs.slice(0, 6);
}
