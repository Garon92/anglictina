import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSettings } from '../App';
import { speak } from '../tts';
import { GRAMMAR_REFERENCE } from '../data/grammarReference';
import { PageHeader, Segmented, SpeakButton } from '../components/ui';

type Frame = 'present' | 'past' | 'future' | 'conditional';

interface TenseInfo {
  id: string;
  nameEn: string;
  nameCs: string;
  level: 'A1' | 'A2' | 'B1';
  /** Time frame — drives the colour of the timeline dot. */
  frame: Frame;
  /** Matching topic in the grammar reference (/grammar-ref?t=…). */
  refId?: string;
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
    frame: 'present',
    refId: 'present_simple',
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
    frame: 'present',
    refId: 'present_continuous',
    formula: 'S + am/is/are + V-ing',
    negativeFormula: 'S + am/is/are + not + V-ing',
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
    frame: 'past',
    refId: 'past_simple',
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
    frame: 'past',
    refId: 'past_continuous',
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
    frame: 'present',
    refId: 'present_perfect',
    formula: 'S + have/has + V-ed / 3rd form',
    negativeFormula: "S + haven't/hasn't + V-ed / 3rd form",
    questionFormula: 'Have/Has + S + V-ed / 3rd form?',
    usage: ['Zkušenosti (někdy v životě)', 'Děj začal v minulosti a trvá', 'Čerstvé novinky'],
    signalWords: ['ever', 'never', 'already', 'yet', 'just', 'since', 'for', 'recently'],
    examples: [
      { en: 'I have visited Paris twice.', cs: 'Navštívil jsem Paříž dvakrát.' },
      { en: 'She has lived here since 2015.', cs: 'Bydlí tady od roku 2015.' },
      { en: "I've just finished my homework.", cs: 'Právě jsem dodělal úkoly.' },
    ],
  },
  {
    id: 'present_perfect_cont',
    nameEn: 'Present Perfect Continuous',
    nameCs: 'Předpřítomný průběhový',
    level: 'B1',
    frame: 'present',
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
    frame: 'future',
    refId: 'future',
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
    frame: 'future',
    refId: 'future',
    formula: 'S + am/is/are + going to + V',
    negativeFormula: 'S + am/is/are + not + going to + V',
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
    frame: 'past',
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
    frame: 'conditional',
    refId: 'conditionals',
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

const FRAMES: Record<Frame, { label: string; color: string }> = {
  present: { label: 'Přítomnost', color: 'var(--g92-success)' },
  past: { label: 'Minulost', color: 'var(--g92-info)' },
  future: { label: 'Budoucnost', color: 'var(--g92-warning)' },
  conditional: { label: 'Podmínka', color: 'var(--g92-danger)' },
};

const LEVEL_CLASS: Record<TenseInfo['level'], string> = {
  A1: 'bg-success-soft text-success',
  A2: 'bg-info-soft text-info',
  B1: 'bg-accent-soft text-accent-text',
};

const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
type LevelFilter = (typeof LEVELS)[number];

const REF_IDS = new Set(GRAMMAR_REFERENCE.map((t) => t.id));

function LevelBadge({ level }: { level: TenseInfo['level'] }) {
  return <span className={`badge ${LEVEL_CLASS[level]}`}>{level}</span>;
}

function FrameDot({ frame, size = 12 }: { frame: Frame; size?: number }) {
  return (
    <span
      className="inline-block shrink-0 rounded-full"
      style={{ width: size, height: size, background: FRAMES[frame].color }}
      aria-hidden="true"
    />
  );
}

export default function TenseOverview() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('t');
  const active = selectedId ? TENSES.find((t) => t.id === selectedId) ?? null : null;
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const lastOpened = useRef<string | null>(null);

  // Detail views open at the top; coming back to the list returns to the tense you opened.
  useEffect(() => {
    if (active) {
      lastOpened.current = active.id;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const id = lastOpened.current;
    if (!id) return;
    const el = document.getElementById(`tense-${id}`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      el.focus({ preventScroll: true });
    }
  }, [active]);

  if (active) return <TenseDetail tense={active} />;

  const filtered = levelFilter === 'all' ? TENSES : TENSES.filter((t) => t.level === levelFilter);

  return (
    <div className="page-container">
      <PageHeader
        back="/practice"
        icon="⏱️"
        title="Přehled časů"
        subtitle="Anglické časy přehledně — jak se tvoří, kdy se používají a podle čeho je poznáš. Klepni na čas pro detail."
      />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmented
          label="Úroveň"
          value={levelFilter}
          onChange={setLevelFilter}
          options={LEVELS.map((l) => ({ value: l, label: l === 'all' ? 'Vše' : l }))}
        />
        <Link to="/grammar" className="btn-soft">
          ✏️ Otestuj se
        </Link>
      </div>

      <ul className="mb-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted" aria-label="Legenda barev">
        {(Object.keys(FRAMES) as Frame[]).map((f) => (
          <li key={f} className="flex items-center gap-1.5">
            <FrameDot frame={f} size={10} />
            {FRAMES[f].label}
          </li>
        ))}
      </ul>

      {/* Timeline */}
      <div className="relative">
        <div className="absolute top-3 bottom-3 left-[1.3rem] w-0.5 rounded-full bg-border" aria-hidden="true" />
        <ul className="relative space-y-2.5">
          {filtered.map((t) => (
            <li key={t.id}>
              <button
                id={`tense-${t.id}`}
                type="button"
                onClick={() => setParams({ t: t.id })}
                className="card card-link flex w-full items-center gap-3 !py-3 !pr-3 !pl-3 text-left"
              >
                <span className="grid w-5 shrink-0 place-items-center" aria-hidden="true">
                  <span
                    className="block h-4 w-4 rounded-full"
                    style={{ background: FRAMES[t.frame].color, boxShadow: '0 0 0 4px var(--g92-surface)' }}
                  />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-bold text-fg" lang="en">{t.nameEn}</span>
                  <span className="block text-sm text-muted">{t.nameCs}</span>
                  <span className="mt-1 block truncate font-mono text-xs text-subtle" lang="en">{t.formula.split('\n')[0]}</span>
                </span>
                <LevelBadge level={t.level} />
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Podrobná pravidla najdeš v <Link to="/grammar-ref">přehledu gramatiky</Link>, vše na jedné stránce v <Link to="/cheatsheet">taháku</Link>.
      </p>
    </div>
  );
}

/* ─── Detail ──────────────────────────────────────────────────────── */

function TenseDetail({ tense }: { tense: TenseInfo }) {
  const { settings } = useSettings();
  const idx = TENSES.findIndex((t) => t.id === tense.id);
  const prev = idx > 0 ? TENSES[idx - 1] : null;
  const next = idx < TENSES.length - 1 ? TENSES[idx + 1] : null;
  const refId = tense.refId && REF_IDS.has(tense.refId) ? tense.refId : null;

  const formulas = [
    { label: 'Kladná věta', text: tense.formula, cls: 'bg-success-soft', labelCls: 'text-success' },
    { label: 'Záporná věta', text: tense.negativeFormula, cls: 'bg-danger-soft', labelCls: 'text-danger' },
    { label: 'Otázka', text: tense.questionFormula, cls: 'bg-info-soft', labelCls: 'text-info' },
  ];

  return (
    <div className="page-container">
      <PageHeader back="/tenses" backLabel="Všechny časy" title={<span lang="en">{tense.nameEn}</span>} subtitle={tense.nameCs} />

      <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2">
        <LevelBadge level={tense.level} />
        <span className="badge">
          <FrameDot frame={tense.frame} size={9} />
          {FRAMES[tense.frame].label}
        </span>
      </div>

      <div className="space-y-4">
        <section className="card !p-5" aria-labelledby="t-form">
          <h2 id="t-form" className="section-title">Tvorba</h2>
          <div className="grid gap-2">
            {formulas.map((f) => (
              <div key={f.label} className={`rounded-md px-4 py-3 ${f.cls}`}>
                <div className={`mb-1 text-xs font-bold ${f.labelCls}`}>{f.label}</div>
                <div className="font-mono text-sm break-words whitespace-pre-wrap text-fg" lang="en">{f.text}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          <section className="card !p-5" aria-labelledby="t-use">
            <h2 id="t-use" className="section-title">Použití</h2>
            <ul className="space-y-2">
              {tense.usage.map((u, i) => (
                <li key={`${i}-${u}`} className="flex items-start gap-2 text-sm leading-relaxed text-fg">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {u}
                </li>
              ))}
            </ul>
          </section>

          <section className="card !p-5" aria-labelledby="t-signal">
            <h2 id="t-signal" className="section-title">Signální slova</h2>
            <ul className="flex flex-wrap gap-2">
              {tense.signalWords.map((sw, i) => (
                <li key={`${i}-${sw}`} className="rounded-full bg-warning-soft px-3 py-1 text-sm font-bold text-warning" lang="en">
                  {sw}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="card !p-5" aria-labelledby="t-ex">
          <h2 id="t-ex" className="section-title">Příklady</h2>
          <ul className="divide-y divide-border">
            {tense.examples.map((ex, i) => (
              <li key={`${i}-${ex.en}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <SpeakButton onClick={() => void speak(ex.en, settings.ttsRate)} label={`Přehrát: ${ex.en}`} />
                <div className="min-w-0">
                  <p className="font-bold text-fg" lang="en">{ex.en}</p>
                  <p className="text-sm text-muted">{ex.cs}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card g92-card--accent flex flex-wrap items-center gap-3 !p-5">
          <span className="text-3xl" aria-hidden="true">✏️</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-fg">Otestuj se</h2>
            <p className="text-sm text-muted">Procvič si časy v gramatickém mixu — vyber si témata a úroveň.</p>
          </div>
          <Link to="/grammar" className="btn-primary">Procvičit</Link>
        </section>

        {refId && (
          <p className="text-center text-sm text-muted">
            Chceš podrobnější vysvětlení? <Link to={`/grammar-ref?t=${refId}`}>Otevřít v přehledu gramatiky</Link>
          </p>
        )}

        <nav className="grid grid-cols-2 gap-3 pt-1" aria-label="Další časy">
          {prev ? (
            <Link to={`/tenses?t=${prev.id}`} className="card card-link flex min-h-[44px] flex-col !p-3 no-underline">
              <span className="text-xs text-muted">← Předchozí</span>
              <span className="truncate font-bold text-fg" lang="en">{prev.nameEn}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/tenses?t=${next.id}`} className="card card-link flex min-h-[44px] flex-col !p-3 text-right no-underline">
              <span className="text-xs text-muted">Další →</span>
              <span className="truncate font-bold text-fg" lang="en">{next.nameEn}</span>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </div>
  );
}
