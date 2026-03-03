import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { speak } from '../tts';

interface TenseInfo {
  id: string;
  nameEn: string;
  nameCs: string;
  level: 'A1' | 'A2' | 'B1';
  color: string;
  formula: string;
  negativeFormula: string;
  questionFormula: string;
  usage: string[];
  signalWords: string[];
  examples: { en: string; cs: string }[];
}

const TENSES: TenseInfo[] = [
  {
    id: 'present_simple',
    nameEn: 'Present Simple',
    nameCs: 'Přítomný prostý',
    level: 'A1',
    color: 'bg-green-500',
    formula: 'S + V(s/es)',
    negativeFormula: "S + don't/doesn't + V",
    questionFormula: 'Do/Does + S + V?',
    usage: ['Pravidelné/opakované děje', 'Fakta a obecné pravdy', 'Rozvrhy a jízdní řády'],
    signalWords: ['always', 'usually', 'often', 'sometimes', 'never', 'every day/week'],
    examples: [
      { en: 'She works in a hospital.', cs: 'Pracuje v nemocnici.' },
      { en: 'Water boils at 100°C.', cs: 'Voda se vaří při 100 °C.' },
      { en: 'The train leaves at 8 am.', cs: 'Vlak odjíždí v 8 ráno.' },
    ],
  },
  {
    id: 'present_continuous',
    nameEn: 'Present Continuous',
    nameCs: 'Přítomný průběhový',
    level: 'A1',
    color: 'bg-lime-500',
    formula: 'S + am/is/are + V-ing',
    negativeFormula: "S + am/is/are + not + V-ing",
    questionFormula: 'Am/Is/Are + S + V-ing?',
    usage: ['Právě probíhající děj', 'Dočasné situace', 'Plány v blízké budoucnosti'],
    signalWords: ['now', 'right now', 'at the moment', 'currently', 'today', 'this week'],
    examples: [
      { en: 'I am studying English now.', cs: 'Teď se učím angličtinu.' },
      { en: "She's living in Prague this month.", cs: 'Tento měsíc bydlí v Praze.' },
      { en: "We're meeting at 5 tomorrow.", cs: 'Zítra se potkáme v 5.' },
    ],
  },
  {
    id: 'past_simple',
    nameEn: 'Past Simple',
    nameCs: 'Minulý prostý',
    level: 'A1',
    color: 'bg-blue-500',
    formula: 'S + V-ed / 2nd form',
    negativeFormula: "S + didn't + V",
    questionFormula: 'Did + S + V?',
    usage: ['Dokončený děj v minulosti', 'Sled událostí', 'Minulé zvyky'],
    signalWords: ['yesterday', 'last week/month/year', 'ago', 'in 2020', 'when I was...'],
    examples: [
      { en: 'I visited London last summer.', cs: 'Minulé léto jsem navštívil Londýn.' },
      { en: 'She woke up, had breakfast and left.', cs: 'Vstala, nasnídala se a odešla.' },
      { en: 'Did you enjoy the party?', cs: 'Bavil ses na párty?' },
    ],
  },
  {
    id: 'past_continuous',
    nameEn: 'Past Continuous',
    nameCs: 'Minulý průběhový',
    level: 'A2',
    color: 'bg-sky-500',
    formula: 'S + was/were + V-ing',
    negativeFormula: 'S + was/were + not + V-ing',
    questionFormula: 'Was/Were + S + V-ing?',
    usage: ['Probíhající děj v minulosti', 'Pozadí příběhu', 'Dva souběžné děje'],
    signalWords: ['while', 'when', 'as', 'at that time', 'all day yesterday'],
    examples: [
      { en: 'I was sleeping when you called.', cs: 'Spal jsem, když jsi volal.' },
      { en: 'It was raining and the wind was blowing.', cs: 'Pršelo a foukal vítr.' },
      { en: 'While she was cooking, he was cleaning.', cs: 'Zatímco ona vařila, on uklízel.' },
    ],
  },
  {
    id: 'present_perfect',
    nameEn: 'Present Perfect',
    nameCs: 'Předpřítomný',
    level: 'A2',
    color: 'bg-purple-500',
    formula: 'S + have/has + V-ed / 3rd form',
    negativeFormula: "S + haven't/hasn't + V-ed / 3rd form",
    questionFormula: 'Have/Has + S + V-ed / 3rd form?',
    usage: ['Zkušenosti (někdy v životě)', 'Děj začal v minulosti a trvá', 'Čerstvé novinky'],
    signalWords: ['ever', 'never', 'already', 'yet', 'just', 'since', 'for', 'recently'],
    examples: [
      { en: 'I have visited Paris twice.', cs: 'Navštívil jsem Paříž dvakrát.' },
      { en: "She has lived here since 2015.", cs: 'Bydlí tady od roku 2015.' },
      { en: "I've just finished my homework.", cs: 'Právě jsem dodělal úkoly.' },
    ],
  },
  {
    id: 'present_perfect_cont',
    nameEn: 'Present Perfect Continuous',
    nameCs: 'Předpřítomný průběhový',
    level: 'B1',
    color: 'bg-violet-500',
    formula: 'S + have/has + been + V-ing',
    negativeFormula: "S + haven't/hasn't + been + V-ing",
    questionFormula: 'Have/Has + S + been + V-ing?',
    usage: ['Děj začal v minulosti a stále trvá (důraz na trvání)', 'Nedávno ukončený děj s viditelným výsledkem'],
    signalWords: ['for', 'since', 'how long', 'all day', 'lately', 'recently'],
    examples: [
      { en: 'I have been waiting for 2 hours.', cs: 'Čekám už 2 hodiny.' },
      { en: "She's been studying all morning.", cs: 'Celé dopoledne se učí.' },
      { en: "It's been raining since yesterday.", cs: 'Od včerejška prší.' },
    ],
  },
  {
    id: 'future_will',
    nameEn: 'Future Simple (will)',
    nameCs: 'Budoucí s will',
    level: 'A2',
    color: 'bg-amber-500',
    formula: 'S + will + V',
    negativeFormula: "S + won't + V",
    questionFormula: 'Will + S + V?',
    usage: ['Spontánní rozhodnutí', 'Předpovědi a domněnky', 'Nabídky a sliby'],
    signalWords: ['I think', 'probably', 'perhaps', 'tomorrow', 'next week', 'in the future'],
    examples: [
      { en: "I'll help you with that.", cs: 'Pomůžu ti s tím.' },
      { en: 'It will probably rain tomorrow.', cs: 'Zítra bude asi pršet.' },
      { en: "I won't forget your birthday.", cs: 'Nezapomenu na tvé narozeniny.' },
    ],
  },
  {
    id: 'future_going_to',
    nameEn: 'Going to',
    nameCs: 'Budoucí s going to',
    level: 'A2',
    color: 'bg-orange-500',
    formula: 'S + am/is/are + going to + V',
    negativeFormula: "S + am/is/are + not + going to + V",
    questionFormula: 'Am/Is/Are + S + going to + V?',
    usage: ['Plány a záměry', 'Předpovědi na základě důkazů'],
    signalWords: ['tonight', 'tomorrow', 'next week', 'I plan to', 'I intend to'],
    examples: [
      { en: "I'm going to study medicine.", cs: 'Chystám se studovat medicínu.' },
      { en: "Look at those clouds! It's going to rain.", cs: 'Podívej na ty mraky! Bude pršet.' },
      { en: "We're going to visit grandma on Sunday.", cs: 'V neděli navštívíme babičku.' },
    ],
  },
  {
    id: 'past_perfect',
    nameEn: 'Past Perfect',
    nameCs: 'Předminulý',
    level: 'B1',
    color: 'bg-indigo-500',
    formula: 'S + had + V-ed / 3rd form',
    negativeFormula: "S + hadn't + V-ed / 3rd form",
    questionFormula: 'Had + S + V-ed / 3rd form?',
    usage: ['Děj ukončený před jiným minulým dějem', 'Nepřímá řeč v minulosti'],
    signalWords: ['before', 'after', 'by the time', 'already', 'just', 'never... before'],
    examples: [
      { en: 'When I arrived, she had already left.', cs: 'Když jsem přišel, už odešla.' },
      { en: 'I had never seen snow before that trip.', cs: 'Před tím výletem jsem nikdy neviděl sníh.' },
      { en: 'He said he had finished the work.', cs: 'Řekl, že práci dokončil.' },
    ],
  },
  {
    id: 'conditionals',
    nameEn: 'Conditionals (0, 1, 2)',
    nameCs: 'Podmínkové věty',
    level: 'B1',
    color: 'bg-rose-500',
    formula: '0: If + present, present\n1: If + present, will + V\n2: If + past, would + V',
    negativeFormula: "1: If + don't, won't\n2: If + didn't, wouldn't",
    questionFormula: 'What will/would you do if...?',
    usage: [
      '0. kondicionál: obecné pravdy (If you heat water, it boils.)',
      '1. kondicionál: reálná podmínka (If it rains, I will stay home.)',
      '2. kondicionál: nereálná podmínka (If I were rich, I would travel.)',
    ],
    signalWords: ['if', 'when', 'unless', 'in case', 'provided that'],
    examples: [
      { en: 'If you study hard, you will pass.', cs: 'Když se budeš učit, složíš to.' },
      { en: 'If I had more time, I would learn Spanish.', cs: 'Kdybych měl více času, učil bych se španělsky.' },
      { en: 'If I were you, I would accept the offer.', cs: 'Kdybych byl tebou, přijal bych tu nabídku.' },
    ],
  },
];

const LEVEL_COLORS: Record<string, string> = {
  A1: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  A2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  B1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

export default function TenseOverview() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('all');

  const filtered = levelFilter === 'all' ? TENSES : TENSES.filter((t) => t.level === levelFilter);
  const active = selected ? TENSES.find((t) => t.id === selected) : null;

  if (active) {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => setSelected(null)}>← Zpět na přehled</button>

        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-12 rounded-full ${active.color}`} />
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{active.nameEn}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{active.nameCs}</p>
          </div>
          <span className={`badge ml-auto ${LEVEL_COLORS[active.level]}`}>{active.level}</span>
        </div>

        {/* Formulas */}
        <div className="card mb-4">
          <h3 className="section-title">Tvorba</h3>
          <div className="space-y-2">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-xs text-green-600 dark:text-green-400 font-medium mb-1">Kladná věta</div>
              <div className="font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{active.formula}</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div className="text-xs text-red-600 dark:text-red-400 font-medium mb-1">Záporná věta</div>
              <div className="font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{active.negativeFormula}</div>
            </div>
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">Otázka</div>
              <div className="font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">{active.questionFormula}</div>
            </div>
          </div>
        </div>

        {/* Usage */}
        <div className="card mb-4">
          <h3 className="section-title">Použití</h3>
          <ul className="space-y-1">
            {active.usage.map((u, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                <span className="text-primary-500 mt-0.5">•</span> {u}
              </li>
            ))}
          </ul>
        </div>

        {/* Signal words */}
        <div className="card mb-4">
          <h3 className="section-title">Signální slova</h3>
          <div className="flex flex-wrap gap-2">
            {active.signalWords.map((sw) => (
              <span key={sw} className="px-3 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full text-sm font-medium">
                {sw}
              </span>
            ))}
          </div>
        </div>

        {/* Examples */}
        <div className="card">
          <h3 className="section-title">Příklady</h3>
          <div className="space-y-3">
            {active.examples.map((ex, i) => (
              <div key={i} className="flex items-start gap-3">
                <button
                  className="text-primary-500 hover:text-primary-700 mt-0.5 shrink-0"
                  onClick={() => speak(ex.en, 0.9)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
                  </svg>
                </button>
                <div>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{ex.en}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{ex.cs}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <h1 className="page-title">Anglické časy</h1>
      <p className="page-subtitle">Kompletní přehled — klikni pro detail</p>

      <div className="flex gap-2 mb-6">
        {['all', 'A1', 'A2', 'B1'].map((lvl) => (
          <button
            key={lvl}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              levelFilter === lvl
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
            }`}
            onClick={() => setLevelFilter(lvl)}
          >
            {lvl === 'all' ? 'Vše' : lvl}
          </button>
        ))}
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
        <div className="space-y-3">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelected(t.id)}
              className="relative w-full text-left pl-12 pr-4 py-3 card-hover"
            >
              <div className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full ${t.color} ring-4 ring-white dark:ring-slate-900`} />
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200 text-sm">{t.nameEn}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{t.nameCs}</div>
                </div>
                <span className={`badge text-xs ${LEVEL_COLORS[t.level]}`}>{t.level}</span>
              </div>
              <div className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-mono">{t.formula.split('\n')[0]}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
