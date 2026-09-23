import { Link } from 'react-router';
import { PageHeader } from '../components/ui';

interface Section {
  id: string;
  title: string;
  headers: string[];
  rows: string[][];
  /** Columns with English text (for pronunciation / hyphenation via lang="en"). */
  en: number[];
  /** Minimum table width on small screens (the table scrolls inside its card). */
  minWidth?: string;
}

const SECTIONS: Section[] = [
  {
    id: 'tenses',
    title: 'Časy (Tenses)',
    rows: [
      ['Present Simple', 'I work / He works', 'Do I work? / Does he work?', 'I don\'t work / He doesn\'t work', 'every day, always, usually, often, sometimes, never'],
      ['Present Continuous', 'I am working', 'Am I working?', 'I am not working', 'now, at the moment, right now, currently'],
      ['Past Simple', 'I worked / He went', 'Did I work?', 'I didn\'t work', 'yesterday, last week, ago, in 2020'],
      ['Past Continuous', 'I was working', 'Was I working?', 'I wasn\'t working', 'while, when, at 5 o\'clock yesterday'],
      ['Present Perfect', 'I have worked / He has gone', 'Have I worked?', 'I haven\'t worked', 'just, already, yet, since, for, ever, never'],
      ['Present Perfect Cont.', 'I have been working', 'Have I been working?', 'I haven\'t been working', 'for, since, all day, how long'],
      ['Past Perfect', 'I had worked', 'Had I worked?', 'I hadn\'t worked', 'before, after, by the time, already'],
      ['Future Simple', 'I will work', 'Will I work?', 'I won\'t work', 'tomorrow, next week, in 2030, I think'],
      ['Going to', 'I am going to work', 'Am I going to work?', 'I\'m not going to work', 'intention, plan, evidence'],
      ['Future Continuous', 'I will be working', 'Will I be working?', 'I won\'t be working', 'at this time tomorrow'],
    ],
    headers: ['Čas', 'Kladná věta', 'Otázka', 'Zápor', 'Signální slova'],
    en: [0, 1, 2, 3, 4],
    minWidth: '46rem',
  },
  {
    id: 'conditionals',
    title: 'Podmínkové věty (Conditionals)',
    rows: [
      ['Type 0', 'If + present, present', 'If you heat water, it boils.', 'Obecná pravda, fakta'],
      ['Type 1', 'If + present, will + inf.', 'If it rains, I will stay home.', 'Reálná podmínka (budoucnost)'],
      ['Type 2', 'If + past, would + inf.', 'If I were rich, I would travel.', 'Nereálná podmínka (přítomnost)'],
      ['Type 3', 'If + past perfect, would have + pp', 'If I had studied, I would have passed.', 'Nereálná podmínka (minulost)'],
    ],
    headers: ['Typ', 'Struktura', 'Příklad', 'Použití'],
    en: [0, 1, 2],
    minWidth: '38rem',
  },
  {
    id: 'passive',
    title: 'Trpný rod (Passive Voice)',
    rows: [
      ['Present Simple', 'am/is/are + pp', 'English is spoken here.'],
      ['Past Simple', 'was/were + pp', 'The book was written in 1990.'],
      ['Present Perfect', 'have/has been + pp', 'The car has been repaired.'],
      ['Future Simple', 'will be + pp', 'The letter will be sent tomorrow.'],
      ['Modal', 'modal + be + pp', 'It can be done easily.'],
    ],
    headers: ['Čas', 'Struktura', 'Příklad'],
    en: [0, 1, 2],
    minWidth: '30rem',
  },
  {
    id: 'reported',
    title: 'Nepřímá řeč (Reported Speech)',
    rows: [
      ['Present Simple → Past Simple', '"I like it." → He said he liked it.'],
      ['Present Cont. → Past Cont.', '"I am working." → She said she was working.'],
      ['Past Simple → Past Perfect', '"I went." → He said he had gone.'],
      ['will → would', '"I will help." → She said she would help.'],
      ['can → could', '"I can swim." → He said he could swim.'],
      ['today → that day', '"I\'ll do it today." → She said she would do it that day.'],
      ['here → there', '"Come here." → He told me to go there.'],
      ['Otázky yes/no → if/whether', '"Do you like it?" → He asked if I liked it.'],
      ['Otázky wh- → wh- + ozn. slovosled', '"Where do you live?" → She asked where I lived.'],
      ['Rozkazy → told/asked + to + inf.', '"Sit down." → He told me to sit down.'],
    ],
    headers: ['Pravidlo', 'Příklad'],
    en: [1],
    minWidth: '30rem',
  },
  {
    id: 'modals',
    title: 'Modální slovesa',
    rows: [
      ['can', 'schopnost, dovolení', 'I can swim. Can I go?'],
      ['could', 'minulá schopnost, zdvořilá žádost', 'I could run fast. Could you help me?'],
      ['may', 'dovolení, možnost', 'May I come in? It may rain.'],
      ['might', 'menší možnost', 'He might be late.'],
      ['must', 'povinnost, jistota', 'You must study. She must be tired.'],
      ['mustn\'t', 'zákaz', 'You mustn\'t smoke here.'],
      ['have to', 'vnější povinnost', 'I have to work on Saturday.'],
      ['don\'t have to', 'nemusíš (není nutné)', 'You don\'t have to come.'],
      ['should', 'rada, doporučení', 'You should see a doctor.'],
      ['would', 'zdvořilá žádost, podmínka', 'Would you like tea? I would go.'],
    ],
    headers: ['Sloveso', 'Použití', 'Příklad'],
    en: [0, 2],
    minWidth: '30rem',
  },
  {
    id: 'articles',
    title: 'Členy (Articles)',
    rows: [
      ['a/an', 'Neurčitý', 'poprvé, obecně, jeden z mnoha', 'I saw a dog. She is an artist.'],
      ['the', 'Určitý', 'známý, jedinečný, upřesnění', 'The dog was big. The sun is bright.'],
      ['–', 'Bez členu', 'obecné mn.č./nepočit., vlastní jména', 'Dogs are loyal. I like music.'],
    ],
    headers: ['Člen', 'Typ', 'Kdy', 'Příklad'],
    en: [0, 3],
    minWidth: '36rem',
  },
  {
    id: 'prepositions',
    title: 'Předložky času a místa',
    rows: [
      ['in', 'Čas: měsíce, roky, roční období, denní doby', 'in January, in 2020, in summer, in the morning'],
      ['on', 'Čas: dny, data', 'on Monday, on 5th May, on Christmas Day'],
      ['at', 'Čas: hodiny, svátky, specifické časy', 'at 5 o\'clock, at night, at Christmas, at the weekend'],
      ['in', 'Místo: uvnitř', 'in the room, in Prague, in the car'],
      ['on', 'Místo: na povrchu', 'on the table, on the wall, on the bus'],
      ['at', 'Místo: u, při', 'at school, at home, at the bus stop, at the door'],
    ],
    headers: ['Předložka', 'Použití', 'Příklady'],
    en: [0, 2],
    minWidth: '32rem',
  },
  {
    id: 'comparison',
    title: 'Stupňování přídavných jmen',
    rows: [
      ['Krátká (1-2 sl.)', 'tall → taller → the tallest', 'big → bigger → the biggest'],
      ['Dlouhá (3+ sl.)', 'beautiful → more beautiful → the most beautiful', 'interesting → more interesting → the most interesting'],
      ['Nepravidelná', 'good → better → the best', 'bad → worse → the worst / far → further → the furthest'],
      ['as...as', 'She is as tall as me.', 'not as...as: He is not as fast as her.'],
    ],
    headers: ['Typ', 'Příklad 1', 'Příklad 2'],
    en: [1, 2],
    minWidth: '34rem',
  },
];

/**
 * In print the page is always black on white, whatever the app theme: the kit colour
 * variables are overridden for the whole sheet, so headings never come out white.
 */
const PRINT_THEME = [
  'print:[--g92-text:#000]',
  'print:[--g92-text-muted:#333]',
  'print:[--g92-text-subtle:#555]',
  'print:[--g92-surface:#fff]',
  'print:[--g92-surface-2:#f1f1f1]',
  'print:[--g92-surface-3:#e4e4e4]',
  'print:[--g92-border:#bbb]',
  'print:[--g92-border-strong:#999]',
  'print:[--accent-soft:#eee]',
  'print:[--accent-text:#000]',
].join(' ');

function PrintButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" className={`btn-primary ${className}`} onClick={() => window.print()}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" />
        <path d="M6 14h12v7H6z" />
      </svg>
      Vytisknout
    </button>
  );
}

export default function GrammarCheatsheet() {
  const year = new Date().getFullYear();

  return (
    <div className={`page-container page-container--wide print:!max-w-none print:text-black ${PRINT_THEME}`}>
      <div className="print:hidden">
        <PageHeader
          back="/practice"
          icon="🖨️"
          title="Gramatický tahák"
          subtitle="Tisknutelný tahák — všechna klíčová pravidla na jednom místě."
          actions={<PrintButton className="hidden sm:inline-flex" />}
        />

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <PrintButton className="w-full sm:hidden" />
          <nav aria-label="Obsah taháku" className="flex flex-wrap gap-2">
            {SECTIONS.map((s) => (
              <a key={s.id} href={`#sec-${s.id}`} className="g92-chip no-underline">
                {s.title.replace(/\s*\(.*\)$/, '')}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Print-only title (the app bar, navigation and buttons are hidden in print) */}
      <header className="mb-3 hidden print:block">
        <h1 className="text-xl font-black">Přehled gramatiky — tahák</h1>
        <p className="text-xs">Všechna klíčová pravidla na jednom místě</p>
      </header>

      <div className="space-y-5 print:space-y-3">
        {SECTIONS.map((section) => (
          <section
            key={section.id}
            id={`sec-${section.id}`}
            aria-labelledby={`h-${section.id}`}
            className="card scroll-mt-24 !p-0 print:break-inside-avoid print:!rounded-none print:!border-0 print:!shadow-none"
          >
            <h2 id={`h-${section.id}`} className="px-5 pt-4 pb-3 text-lg font-black text-fg print:px-0 print:pt-0 print:pb-1 print:text-sm">
              {section.title}
            </h2>
            <div className="overflow-x-auto px-5 pb-5 print:overflow-visible print:px-0 print:pb-0">
              <table
                className="w-full border-collapse text-sm print:!min-w-0 print:text-[9.5px] print:leading-snug"
                style={{ minWidth: section.minWidth }}
              >
                <thead>
                  <tr>
                    {section.headers.map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="border-b-2 border-border-strong bg-surface-2 px-3 py-2 text-left text-xs font-bold tracking-wide text-muted uppercase first:rounded-tl-md last:rounded-tr-md print:rounded-none print:border print:border-border-strong print:px-1.5 print:py-0.5 print:text-[9px] print:text-fg"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr key={i} className="border-b border-border last:border-b-0">
                      {row.map((cell, j) => (
                        <td
                          key={j}
                          lang={section.en.includes(j) ? 'en' : undefined}
                          className={`px-3 py-2 align-top leading-relaxed print:border print:border-border print:px-1.5 print:py-0.5 ${
                            j === 0 ? 'min-w-[7.5rem] font-bold text-fg print:min-w-0' : 'text-fg'
                          }`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      <p className="mt-6 text-center text-sm text-muted print:hidden">
        Podrobnosti a příklady najdeš v <Link to="/grammar-ref">přehledu gramatiky</Link> a v <Link to="/tenses">přehledu časů</Link>.
      </p>
      <div className="mt-4 text-center text-xs text-subtle print:mt-2 print:text-[9px]">
        Angličtina — Příprava na maturitu • {year}
      </div>
    </div>
  );
}
