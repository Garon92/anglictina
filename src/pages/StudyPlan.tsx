import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useSettings } from '../App';
import { getStats, getDrillSessions, getExamSessions } from '../db';
import { getMistakeSummary } from '../progress';
import { recommendModule, moduleStats } from '../recommend';
import { MODULES, moduleTitle, moduleIcon } from '../modules';
import { daysUntil, czechPlural, dayKey, addDays } from '../lib/dates';
import type { DrillSession, ExamSession, UserStats } from '../types';
import { PageHeader } from '../components/ui';

interface Tip {
  icon: string;
  title: string;
  desc: string;
  link: string;
  priority: 'high' | 'medium' | 'low';
}

const WEEKLY_PLAN: { day: string; icon: string; focus: string; items: { label: string; to: string }[] }[] = [
  { day: 'Pondělí', icon: '✏️', focus: 'Gramatika', items: [{ label: 'Slovíčka', to: '/vocab' }, { label: 'Gramatika – mix', to: '/grammar' }, { label: 'Členy', to: '/articles' }] },
  { day: 'Úterý', icon: '📖', focus: 'Čtení', items: [{ label: 'Slovíčka', to: '/vocab' }, { label: 'Čtení s porozuměním', to: '/reading' }, { label: 'Předložky', to: '/prepositions' }] },
  { day: 'Středa', icon: '🎧', focus: 'Poslech', items: [{ label: 'Slovíčka', to: '/vocab' }, { label: 'Poslech', to: '/listening' }, { label: 'Nepravidelná slovesa', to: '/irregular-verbs' }] },
  { day: 'Čtvrtek', icon: '🧩', focus: 'Slovní zásoba', items: [{ label: 'Slovíčka', to: '/vocab' }, { label: 'Frázová slovesa', to: '/phrasal-verbs' }, { label: 'Záměnná slova', to: '/confusables' }] },
  { day: 'Pátek', icon: '🔁', focus: 'Opakování', items: [{ label: 'Oprava chyb', to: '/mistakes' }, { label: 'Tvoření slov', to: '/word-formation' }, { label: 'Slovosled', to: '/word-order' }] },
  { day: 'Sobota', icon: '🎯', focus: 'Test', items: [{ label: 'Jedna část testu', to: '/exam' }, { label: 'Ústní zkouška – téma', to: '/conversation' }] },
  { day: 'Neděle', icon: '🌿', focus: 'Lehký den', items: [{ label: 'Slovíčka', to: '/vocab' }, { label: 'Pexeso', to: '/matching' }] },
];

const DAY_INDEX = [6, 0, 1, 2, 3, 4, 5]; // JS getDay() → index in WEEKLY_PLAN

export default function StudyPlan() {
  const { settings } = useSettings();
  const [tips, setTips] = useState<Tip[]>([]);
  const today = WEEKLY_PLAN[DAY_INDEX[new Date().getDay()]];
  const days = daysUntil(settings.examDate);
  const weeks = Math.max(0, Math.floor(days / 7));

  useEffect(() => {
    (async () => {
      const [stats, sessions, exams, mistakes] = await Promise.all([getStats(), getDrillSessions(), getExamSessions(), getMistakeSummary()]);
      setTips(buildTips(stats, sessions, exams, mistakes.byModule, mistakes.due));
    })().catch(() => {});
  }, []);

  const phase =
    days < 0 ? null
      : days <= 21 ? { name: 'Finiš', desc: 'Celé testy nanečisto 2× týdně, rozbor chyb, krátké opakování slovíček. Žádné nové učivo.' }
        : days <= 90 ? { name: 'Trénink formátu', desc: 'Každý týden aspoň jeden celý test, mezi tím jednotlivé části testu a oprava chyb.' }
          : days <= 240 ? { name: 'Budování základů', desc: 'Pravidelná slovíčka, gramatika podle slabin, čtení a poslech. Jednou za 2–3 týdny test na zkoušku.' }
            : { name: 'Rozjezd', desc: 'Buduj návyk: každý den slovíčka a jedno krátké cvičení. Zkus diagnostický test a jeden cvičný test pro představu.' };

  return (
    <div className="page-container page-container--wide">
      <PageHeader title="Studijní plán" subtitle="Rozvrh na týden a priority podle tvých výsledků." back="/practice" icon="📅" />

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card g92-card--accent !p-5">
          <div className="eyebrow">Do maturity</div>
          {days >= 0 ? (
            <>
              <div className="mt-1 text-3xl font-black text-fg">
                {days} {czechPlural(days, 'den', 'dny', 'dní')}
                <span className="ml-2 text-base font-bold text-muted">({weeks} {czechPlural(weeks, 'týden', 'týdny', 'týdnů')})</span>
              </div>
              {phase && (
                <p className="mt-2 text-sm text-fg">
                  <strong>Fáze: {phase.name}.</strong> <span className="text-muted">{phase.desc}</span>
                </p>
              )}
            </>
          ) : (
            <p className="mt-1 text-fg">Datum maturity je v minulosti — nastav si nové v <Link to="/settings">nastavení</Link>.</p>
          )}
          <p className="mt-3 text-xs text-muted">
            Denní cíl: {settings.minutesPerDay} min · {settings.newCardsPerDay} nových slovíček · cílové skóre {settings.goalScore} b
          </p>
        </section>

        <section className="card !p-5">
          <div className="flex items-center gap-3">
            <span className="tile-icon" aria-hidden="true">{today.icon}</span>
            <div>
              <div className="font-black text-fg">Dnes — {today.day}</div>
              <div className="text-sm text-muted">Zaměření: {today.focus}</div>
            </div>
          </div>
          <ul className="mt-3 space-y-1.5">
            {today.items.map((it) => (
              <li key={it.label}>
                <Link to={it.to} className="card-link flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm font-bold text-fg no-underline">
                  {it.label} <span aria-hidden="true" className="text-muted">›</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {tips.length > 0 && (
        <section className="mt-6">
          <h2 className="section-title">Doporučení pro tebe</h2>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {tips.map((t) => (
              <Link key={t.title} to={t.link} className={`card card-link flex items-start gap-3 !p-4 no-underline ${t.priority === 'high' ? '!border-warning' : ''}`}>
                <span className="text-2xl" aria-hidden="true">{t.icon}</span>
                <span className="min-w-0">
                  <span className="block font-bold text-fg">{t.title}</span>
                  <span className="block text-sm text-muted">{t.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mt-6">
        <h2 className="section-title">Týdenní rozvrh</h2>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {WEEKLY_PLAN.map((p) => (
            <div key={p.day} className={`card !p-4 ${p === today ? '!border-accent ring-2 ring-accent/20' : ''}`}>
              <div className="mb-1.5 flex items-center gap-2">
                <span aria-hidden="true">{p.icon}</span>
                <span className="font-bold text-fg">{p.day}</span>
                <span className="ml-auto text-xs text-muted">{p.focus}</span>
              </div>
              <ul className="space-y-0.5 text-sm text-muted">
                {p.items.map((it) => <li key={it.label}>• {it.label}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function buildTips(stats: UserStats, sessions: DrillSession[], exams: ExamSession[], mistakesByModule: Record<string, number>, mistakesDue: number): Tip[] {
  const tips: Tip[] = [];
  const weekStart = addDays(dayKey(), -6);
  const recent = moduleStats(sessions.filter((s) => s.date >= weekStart));

  if (stats.diagnosticScores.length === 0) {
    tips.push({ icon: '🩺', title: 'Udělej rozřazovací test', desc: 'Za 10 minut zjistíš, na jaké úrovni jsi.', link: '/diagnostic', priority: 'high' });
  }
  if (!exams.some((e) => e.mode === 'full')) {
    tips.push({ icon: '🎯', title: 'Zkus cvičný test nanečisto', desc: 'Uvidíš formát maturity a kolik bodů by ti chybělo.', link: '/exam', priority: 'high' });
  }
  if (mistakesDue > 0) {
    tips.push({ icon: '🔁', title: `Oprav ${mistakesDue} ${czechPlural(mistakesDue, 'chybu', 'chyby', 'chyb')}`, desc: 'Chyby, které se vrací, jsou nejrychlejší cesta k bodům.', link: '/mistakes', priority: 'high' });
  }
  const rec = recommendModule(sessions, mistakesByModule);
  tips.push({ icon: rec.module.icon, title: `Procvič: ${rec.module.title}`, desc: rec.reason, link: rec.module.path, priority: 'medium' });

  for (const skill of ['reading', 'listening'] as const) {
    const mod = MODULES.find((m) => m.id === skill)!;
    if (!recent[skill]) {
      tips.push({ icon: moduleIcon(skill), title: `${moduleTitle(skill)} tento týden chybí`, desc: skill === 'reading' ? 'Čtení je 40 % bodů u maturity.' : 'Poslech je 40 % bodů u maturity.', link: mod.path, priority: 'medium' });
    }
  }
  if (stats.totalCardsLearned < 300) {
    tips.push({ icon: '🗂️', title: 'Slovíčka každý den', desc: 'Pro B1 je potřeba aspoň 1 500–2 000 slov. Denní dávka nových slovíček to zvládne.', link: '/vocab', priority: 'low' });
  }
  return tips.slice(0, 6);
}
