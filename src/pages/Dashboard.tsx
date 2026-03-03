import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStats, getDueCards, updateStreak, getDrillSessions } from '../db';
import { speak } from '../tts';
import { WORD_OF_THE_DAY } from '../data/vocabulary';
import { daysUntil, getMotivationalMessage, formatMinutes, todayKey } from '../utils';
import { getErrorAnalysis } from '../errorTracker';
import type { UserSettings, UserStats } from '../types';
import { DEFAULT_STATS } from '../types';
import DailyChallenge from '../components/DailyChallenge';
import { computeLevel } from './Review';

interface ActionItem {
  to: string; icon: string; title: string; desc: string; color: string;
}

const CATEGORIES: { id: string; label: string; icon: string; items: ActionItem[] }[] = [
  {
    id: 'core', label: 'Základ', icon: '📚',
    items: [
      { to: '/vocab', icon: '📝', title: 'Slovíčka', desc: 'SRS kartičky', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      { to: '/grammar', icon: '✏️', title: 'Gramatika', desc: 'Cvičení', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
      { to: '/reading', icon: '📖', title: 'Čtení', desc: 'Texty s otázkami', color: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      { to: '/listening', icon: '🎧', title: 'Poslech', desc: 'Poslechová cvičení', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    ],
  },
  {
    id: 'grammar', label: 'Gramatická cvičení', icon: '✏️',
    items: [
      { to: '/conditionals', icon: '🔀', title: 'Podmínky', desc: 'If clauses 0–3', color: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
      { to: '/reported-speech', icon: '💬', title: 'Nepřímá řeč', desc: 'He said that...', color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
      { to: '/passive', icon: '🔄', title: 'Trpný rod', desc: 'Active → Passive', color: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
      { to: '/articles', icon: '📐', title: 'Členy', desc: 'a/an/the', color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
      { to: '/prepositions', icon: '📌', title: 'Předložky', desc: 'in/on/at', color: 'bg-sky-50 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
      { to: '/word-order', icon: '🧱', title: 'Slovosled', desc: 'Pořadí slov', color: 'bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' },
      { to: '/error-correction', icon: '❌', title: 'Oprav chybu', desc: 'Najdi a oprav', color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
      { to: '/sentence-transform', icon: '🔧', title: 'Přeformulace', desc: 'Key word transform', color: 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
      { to: '/word-formation', icon: '🧩', title: 'Tvoření slov', desc: 'Předpony / přípony', color: 'bg-lime-50 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300' },
    ],
  },
  {
    id: 'vocab', label: 'Slovní zásoba', icon: '📝',
    items: [
      { to: '/irregular-verbs', icon: '🔄', title: 'Neprav. slovesa', desc: '100 nejčastějších', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
      { to: '/confusables', icon: '🔀', title: 'Záměnná slova', desc: 'False friends', color: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
      { to: '/phrasal-verbs', icon: '🧩', title: 'Phrasal verbs', desc: 'Frázová slovesa', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
      { to: '/idioms', icon: '💎', title: 'Idiomy', desc: 'Ustálené fráze', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      { to: '/translation', icon: '🔤', title: 'Překlad', desc: 'CZ → EN věty', color: 'bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-300' },
      { to: '/vocab-topics', icon: '📂', title: 'Témata', desc: '20 maturitních témat', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
      { to: '/custom-words', icon: '📝', title: 'Vlastní slova', desc: 'Tvůj slovníček', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    ],
  },
  {
    id: 'maturita', label: 'Příprava na maturitu', icon: '🎯',
    items: [
      { to: '/exam', icon: '🎯', title: 'Zkouška', desc: 'Simulace testu', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
      { to: '/conversation', icon: '💬', title: 'Konverzace', desc: '25 témat na ústní', color: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
      { to: '/writing', icon: '✍️', title: 'Psaní', desc: 'Šablony a tipy', color: 'bg-pink-50 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300' },
      { to: '/tenses', icon: '⏱️', title: 'Časy', desc: 'Přehled 10 časů', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
      { to: '/grammar-ref', icon: '📋', title: 'Gram. tabulky', desc: 'Pravidla a vzory', color: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
      { to: '/cheatsheet', icon: '🖨️', title: 'Tahák', desc: 'Tisknutelný přehled', color: 'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' },
    ],
  },
  {
    id: 'games', label: 'Hry a výzvy', icon: '⚡',
    items: [
      { to: '/mixed-quiz', icon: '🎲', title: 'Mix kvíz', desc: 'Ze všech modulů', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
      { to: '/speed', icon: '⚡', title: 'Rychlovka', desc: '20 otázek na čas', color: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
      { to: '/mistakes', icon: '🔁', title: 'Opakuj chyby', desc: 'Drill z tvých chyb', color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
      { to: '/matching', icon: '🃏', title: 'Pexeso', desc: 'Spojuj slova', color: 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' },
      { to: '/favorites-quiz', icon: '💛', title: 'Kvíz oblíbených', desc: 'Procvič uložená', color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
    ],
  },
  {
    id: 'tools', label: 'Nástroje', icon: '🔧',
    items: [
      { to: '/search', icon: '🔍', title: 'Hledání', desc: 'Slovník', color: 'bg-slate-50 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
      { to: '/favorites', icon: '⭐', title: 'Oblíbené', desc: 'Uložená slova', color: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
      { to: '/study-plan', icon: '📅', title: 'Studijní plán', desc: 'Tvůj rozvrh', color: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
      { to: '/diagnostic', icon: '🩺', title: 'Diagnostika', desc: 'Zjisti svou úroveň', color: 'bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' },
      { to: '/review', icon: '📊', title: 'Statistiky', desc: 'Tvůj pokrok', color: 'bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
      { to: '/settings', icon: '⚙️', title: 'Nastavení', desc: 'Přizpůsobení', color: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300' },
    ],
  },
];

function getSmartSuggestions(stats: UserStats, dueCount: number): ActionItem[] {
  const suggestions: ActionItem[] = [];
  const errors = getErrorAnalysis();

  if (dueCount > 0) {
    suggestions.push({ to: '/vocab', icon: '📝', title: 'Opakuj slovíčka', desc: `${dueCount} čeká`, color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' });
  }

  if (errors.totalErrors > 5) {
    suggestions.push({ to: '/mistakes', icon: '🔁', title: 'Procvič chyby', desc: `${errors.totalErrors} chyb`, color: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' });
  }

  if (stats.totalCardsLearned < 50) {
    suggestions.push({ to: '/vocab', icon: '📚', title: 'Nauč se slovíčka', desc: 'Základ je slovní zásoba', color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' });
  } else if (stats.totalExercisesDone < 20) {
    suggestions.push({ to: '/grammar', icon: '✏️', title: 'Zkus gramatiku', desc: 'Procvič si pravidla', color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' });
  }

  if (suggestions.length < 3) {
    suggestions.push({ to: '/mixed-quiz', icon: '🎲', title: 'Mix kvíz', desc: 'Otestuj se ze všeho', color: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' });
  }

  return suggestions.slice(0, 3);
}

export default function Dashboard({ settings }: { settings: UserSettings }) {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [dueCount, setDueCount] = useState(0);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [openCats, setOpenCats] = useState<Set<string>>(new Set(['core']));
  const [searchQ, setSearchQ] = useState('');
  const wotd = WORD_OF_THE_DAY();

  useEffect(() => { loadData(); }, []);

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

  const toggleCat = (id: string) => {
    setOpenCats((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const examDays = daysUntil(settings.examDate);
  const lv = computeLevel(stats);
  const suggestions = getSmartSuggestions(stats, dueCount);

  const filteredCats = searchQ.trim()
    ? CATEGORIES.map((cat) => ({
        ...cat,
        items: cat.items.filter((it) =>
          it.title.toLowerCase().includes(searchQ.toLowerCase()) ||
          it.desc.toLowerCase().includes(searchQ.toLowerCase())
        ),
      })).filter((cat) => cat.items.length > 0)
    : CATEGORIES;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white">Angličtina</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">{getMotivationalMessage(stats.streakDays)}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <Link to="/review" className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1">
            {lv.level.icon} {lv.xp}
          </Link>
          {stats.streakDays > 0 && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full text-xs font-bold">
              🔥 {stats.streakDays}
            </div>
          )}
        </div>
      </div>

      {/* Exam countdown */}
      {examDays > 0 && (
        <div className="card mb-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white border-0 !p-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-primary-100 text-[10px] font-medium">Do maturity</div>
              <div className="text-2xl font-bold">{examDays} dní</div>
            </div>
            <div className="text-right">
              <div className="text-primary-100 text-[10px] font-medium">Cíl</div>
              <div className="text-xl font-bold">{settings.goalScore}b</div>
            </div>
          </div>
        </div>
      )}

      {/* Today's progress — compact */}
      <div className="card mb-3 !p-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dnes</span>
          <span className="text-xs text-slate-500">{formatMinutes(todayMinutes)} / {settings.minutesPerDay} min</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (todayMinutes / settings.minutesPerDay) * 100)}%` }}
          />
        </div>
        {dueCount > 0 && (
          <Link to="/vocab" className="text-xs text-amber-600 dark:text-amber-400 mt-1.5 font-medium block">
            📚 {dueCount} slovíček k opakování →
          </Link>
        )}
      </div>

      {/* Smart suggestions */}
      {suggestions.length > 0 && (
        <div className="mb-3">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Doporučeno pro tebe</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {suggestions.map((s) => (
              <Link
                key={s.to}
                to={s.to}
                className="card shrink-0 !p-3 flex items-center gap-2.5 min-w-[160px] hover:shadow-md transition-shadow"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${s.color}`}>{s.icon}</div>
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{s.title}</div>
                  <div className="text-[10px] text-slate-400">{s.desc}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Word of the day — compact */}
      <div className="card mb-3 !p-3">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold text-primary-500 uppercase tracking-wide">Slovo dne</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-base font-bold text-slate-900 dark:text-white">{wotd.en}</span>
              <span className="text-slate-400 text-xs">—</span>
              <span className="text-sm text-slate-600 dark:text-slate-300">{wotd.cs}</span>
            </div>
            <p className="text-xs text-slate-400 italic mt-0.5 truncate">{wotd.example}</p>
          </div>
          <button className="text-primary-500 hover:text-primary-700 p-1.5 shrink-0" onClick={() => speak(wotd.en, settings.ttsRate)}>
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Daily challenge */}
      <DailyChallenge />

      {/* Search modules */}
      <div className="relative mb-3">
        <input
          type="text"
          className="input text-sm pl-9 !py-2"
          placeholder="Hledej modul..."
          value={searchQ}
          onChange={(e) => setSearchQ(e.target.value)}
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {searchQ && (
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs" onClick={() => setSearchQ('')}>✕</button>
        )}
      </div>

      {/* Categorized modules */}
      <div className="space-y-2 mb-4">
        {filteredCats.map((cat) => {
          const isOpen = openCats.has(cat.id) || searchQ.trim() !== '';
          return (
            <div key={cat.id} className="card overflow-hidden !p-0">
              <button
                className="w-full flex items-center justify-between px-4 py-3 text-left"
                onClick={() => toggleCat(cat.id)}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cat.icon}</span>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">{cat.label}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-full">{cat.items.length}</span>
                </div>
                <svg className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-3 pb-3 grid grid-cols-2 gap-2">
                  {cat.items.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base shrink-0 ${item.color}`}>
                        {item.icon}
                      </div>
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 dark:text-slate-200 text-xs">{item.title}</div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-3 gap-2">
        <StatCard label="Naučeno slov" value={stats.totalCardsLearned} />
        <StatCard label="Cvičení" value={stats.totalExercisesDone} />
        <StatCard label="Minut" value={Math.round(stats.totalStudyMinutes)} />
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="card text-center !p-2.5">
      <div className="text-lg font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-[10px] text-slate-400 dark:text-slate-500">{label}</div>
    </div>
  );
}
