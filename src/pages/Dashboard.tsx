import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getDueCards, updateStreak, getDrillSessions } from '../db';
import { speak } from '../tts';
import { WORD_OF_THE_DAY } from '../data/vocabulary';
import { daysUntil, getMotivationalMessage, formatMinutes, todayKey } from '../utils';
import type { UserSettings, UserStats } from '../types';
import { DEFAULT_STATS } from '../types';
import DailyChallenge from '../components/DailyChallenge';
import { computeLevel } from './Review';

export default function Dashboard({ settings }: { settings: UserSettings }) {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [dueCount, setDueCount] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const wotd = WORD_OF_THE_DAY();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [s, due, sessions] = await Promise.all([
      updateStreak(),
      getDueCards(),
      getDrillSessions(todayKey()),
    ]);
    setStats(s);
    setDueCount(due.length);
    const mins = sessions.reduce((sum, ses) => {
      if (!ses.endedAt) return sum;
      return sum + (ses.endedAt - ses.startedAt) / 60000;
    }, 0);
    setTodayMinutes(mins);
  }

  const examDays = daysUntil(settings.examDate);

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Angličtina</h1>
          <p className="text-sm text-slate-500">
            {getMotivationalMessage(stats.streakDays)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(() => {
            const lv = computeLevel(stats);
            return (
              <Link to="/review" className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1">
                {lv.level.icon} {lv.level.name}
              </Link>
            );
          })()}
          {stats.streakDays > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1">
              🔥 {stats.streakDays}
            </div>
          )}
        </div>
      </div>

      {/* Exam countdown */}
      {examDays > 0 && (
        <div className="card mb-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-primary-100 text-xs font-medium">Do maturity zbývá</div>
              <div className="text-3xl font-bold">{examDays} dní</div>
            </div>
            <div className="text-right">
              <div className="text-primary-100 text-xs font-medium">Cíl</div>
              <div className="text-2xl font-bold">{settings.goalScore} bodů</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's progress */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="section-title !mb-0">Dnešní pokrok</span>
          <span className="text-sm text-slate-500">{formatMinutes(todayMinutes)} / {settings.minutesPerDay} min</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (todayMinutes / settings.minutesPerDay) * 100)}%` }}
          />
        </div>
        {dueCount > 0 && (
          <p className="text-sm text-amber-600 mt-2 font-medium">
            📚 {dueCount} slovíček čeká na opakování
          </p>
        )}
      </div>

      {/* Word of the day */}
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-primary-500 uppercase tracking-wide">Slovo dne</span>
          <button
            className="text-primary-500 hover:text-primary-700 p-1"
            onClick={() => speak(wotd.en, settings.ttsRate)}
            title="Přehrát výslovnost"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
            </svg>
          </button>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xl font-bold text-slate-900 dark:text-white">{wotd.en}</span>
          <span className="text-slate-400">—</span>
          <span className="text-slate-600 dark:text-slate-300">{wotd.cs}</span>
        </div>
        <p className="text-sm text-slate-500 italic">"{wotd.example}"</p>
        <p className="text-xs text-slate-400 mt-1">{wotd.exampleCs}</p>
      </div>

      {/* Daily challenge */}
      <DailyChallenge />

      {/* Quick actions */}
      <h2 className="section-title">Procvičování</h2>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <QuickAction to="/vocab" icon="📝" title="Slovíčka" desc="SRS kartičky" color="bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" />
        <QuickAction to="/grammar" icon="✏️" title="Gramatika" desc="Cvičení" color="bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" />
        <QuickAction to="/reading" icon="📖" title="Čtení" desc="Texty s otázkami" color="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300" />
        <QuickAction to="/listening" icon="🎧" title="Poslech" desc="Poslechová cvičení" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <QuickAction to="/irregular-verbs" icon="🔄" title="Neprav. slovesa" desc="100 nejčastějších" color="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" />
        <QuickAction to="/word-order" icon="🧱" title="Skládání vět" desc="Pořadí slov" color="bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300" />
        <QuickAction to="/prepositions" icon="📌" title="Předložky" desc="in/on/at a další" color="bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300" />
        <QuickAction to="/confusables" icon="🔀" title="Záměnná slova" desc="False friends a pletky" color="bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <QuickAction to="/articles" icon="📐" title="Členy" desc="a/an/the — trap pro Čechy" color="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" />
        <QuickAction to="/translation" icon="🔤" title="Překlad" desc="CZ→EN věty" color="bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300" />
        <QuickAction to="/phrasal-verbs" icon="🧩" title="Fráze" desc="Phrasal verbs" color="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" />
        <QuickAction to="/idioms" icon="💎" title="Idiomy" desc="Ustálené fráze" color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <QuickAction to="/conditionals" icon="🔀" title="Podmínky" desc="If clauses 0-3" color="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" />
        <QuickAction to="/reported-speech" icon="💬" title="Nepřímá řeč" desc="He said that..." color="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" />
        <QuickAction to="/sentence-transform" icon="🔄" title="Přeformulace" desc="Key word transform" color="bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" />
        <QuickAction to="/word-formation" icon="🔧" title="Tvoření slov" desc="Předpony a přípony" color="bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300" />
        <QuickAction to="/matching" icon="🃏" title="Pexeso" desc="Spojuj slova" color="bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300" />
      </div>

      <h2 className="section-title">Příprava na maturitu</h2>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <QuickAction to="/vocab-topics" icon="📂" title="Témata" desc="Slovíčka podle 20 témat" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" />
        <QuickAction to="/conversation" icon="💬" title="Konverzace" desc="25 témat na ústní" color="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300" />
        <QuickAction to="/writing" icon="✍️" title="Psaní" desc="Šablony a tipy" color="bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300" />
        <QuickAction to="/exam" icon="🎯" title="Zkouška" desc="Simulace testu" color="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" />
        <QuickAction to="/tenses" icon="⏱️" title="Časy" desc="Přehled všech časů" color="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
        <QuickAction to="/grammar-ref" icon="📋" title="Gram. tabulky" desc="Pravidla a vzory" color="bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" />
        <QuickAction to="/cheatsheet" icon="🖨️" title="Tahák" desc="Tisknutelný přehled" color="bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300" />
      </div>

      <h2 className="section-title">Výzvy</h2>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <QuickAction to="/mixed-quiz" icon="🎲" title="Mix kvíz" desc="Ze všech modulů" color="bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300" />
        <QuickAction to="/speed" icon="⚡" title="Rychlovka" desc="20 otázek na čas" color="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300" />
        <QuickAction to="/mistakes" icon="🔁" title="Opakuj chyby" desc="Drill z tvých chyb" color="bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300" />
      </div>

      <h2 className="section-title">Nástroje</h2>
      <div className="grid grid-cols-2 gap-3">
        <QuickAction to="/search" icon="🔍" title="Hledání" desc="Slovník a vyhledávání" color="bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-300" />
        <QuickAction to="/favorites" icon="⭐" title="Oblíbené" desc="Uložená slova" color="bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300" />
        <QuickAction to="/study-plan" icon="📅" title="Studijní plán" desc="Tvůj rozvrh" color="bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300" />
        <QuickAction to="/diagnostic" icon="🩺" title="Diagnostika" desc="Zjisti svou úroveň" color="bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" />
        <QuickAction to="/review" icon="📊" title="Statistiky" desc="Tvůj pokrok" color="bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300" />
        <QuickAction to="/settings" icon="⚙️" title="Nastavení" desc="Přizpůsobení" color="bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300" />
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <StatCard label="Naučeno slov" value={stats.totalCardsLearned} />
        <StatCard label="Cvičení" value={stats.totalExercisesDone} />
        <StatCard label="Celkem minut" value={Math.round(stats.totalStudyMinutes)} />
      </div>
    </div>
  );
}

function QuickAction({ to, icon, title, desc, color }: {
  to: string; icon: string; title: string; desc: string; color: string;
}) {
  return (
    <Link to={to} className="card-hover flex items-center gap-3 !p-3.5">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${color}`}>
        {icon}
      </div>
      <div>
        <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{title}</div>
        <div className="text-xs text-slate-400 dark:text-slate-500">{desc}</div>
      </div>
    </Link>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center !p-3">
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{label}</div>
    </div>
  );
}
