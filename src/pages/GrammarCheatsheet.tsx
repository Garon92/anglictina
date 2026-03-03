import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  {
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
  },
  {
    title: 'Podmínkové věty (Conditionals)',
    rows: [
      ['Type 0', 'If + present, present', 'If you heat water, it boils.', 'Obecná pravda, fakta'],
      ['Type 1', 'If + present, will + inf.', 'If it rains, I will stay home.', 'Reálná podmínka (budoucnost)'],
      ['Type 2', 'If + past, would + inf.', 'If I were rich, I would travel.', 'Nereálná podmínka (přítomnost)'],
      ['Type 3', 'If + past perfect, would have + pp', 'If I had studied, I would have passed.', 'Nereálná podmínka (minulost)'],
    ],
    headers: ['Typ', 'Struktura', 'Příklad', 'Použití'],
  },
  {
    title: 'Trpný rod (Passive Voice)',
    rows: [
      ['Present Simple', 'am/is/are + pp', 'English is spoken here.'],
      ['Past Simple', 'was/were + pp', 'The book was written in 1990.'],
      ['Present Perfect', 'have/has been + pp', 'The car has been repaired.'],
      ['Future Simple', 'will be + pp', 'The letter will be sent tomorrow.'],
      ['Modal', 'modal + be + pp', 'It can be done easily.'],
    ],
    headers: ['Čas', 'Struktura', 'Příklad'],
  },
  {
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
  },
  {
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
  },
  {
    title: 'Členy (Articles)',
    rows: [
      ['a/an', 'Neurčitý', 'poprvé, obecně, jeden z mnoha', 'I saw a dog. She is an artist.'],
      ['the', 'Určitý', 'známý, jedinečný, upřesnění', 'The dog was big. The sun is bright.'],
      ['–', 'Bez členu', 'obecné mn.č./nepočit., vlastní jména', 'Dogs are loyal. I like music.'],
    ],
    headers: ['Člen', 'Typ', 'Kdy', 'Příklad'],
  },
  {
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
  },
  {
    title: 'Stupňování přídavných jmen',
    rows: [
      ['Krátká (1-2 sl.)', 'tall → taller → the tallest', 'big → bigger → the biggest'],
      ['Dlouhá (3+ sl.)', 'beautiful → more beautiful → the most beautiful', 'interesting → more interesting → the most interesting'],
      ['Nepravidelná', 'good → better → the best', 'bad → worse → the worst / far → further → the furthest'],
      ['as...as', 'She is as tall as me.', 'not as...as: He is not as fast as her.'],
    ],
    headers: ['Typ', 'Příklad 1', 'Příklad 2'],
  },
];

export default function GrammarCheatsheet() {
  const navigate = useNavigate();

  function handlePrint() {
    window.print();
  }

  return (
    <div className="page-container print:p-2 print:max-w-none">
      <div className="flex items-center justify-between mb-4 print:hidden">
        <button className="btn-ghost text-sm" onClick={() => navigate('/')}>← Zpět</button>
        <button className="btn-primary text-sm" onClick={handlePrint}>
          🖨️ Vytisknout
        </button>
      </div>

      <h1 className="page-title print:text-xl print:mb-2">Přehled gramatiky</h1>
      <p className="page-subtitle print:text-xs print:mb-4">Tisknutelný tahák — všechna klíčová pravidla na jednom místě</p>

      <div className="space-y-6 print:space-y-3">
        {SECTIONS.map((section) => (
          <div key={section.title} className="print:break-inside-avoid">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 print:text-sm print:mb-1">
              {section.title}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse print:text-[9px]">
                <thead>
                  <tr className="bg-primary-50 dark:bg-primary-900/20 print:bg-gray-100">
                    {section.headers.map((h) => (
                      <th key={h} className="text-left px-3 py-2 font-semibold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 print:px-1 print:py-0.5 print:border-gray-400">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.rows.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-800/50'}>
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 print:px-1 print:py-0.5 print:border-gray-400 print:text-black">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-slate-400 print:mt-2">
        Angličtina — Příprava na maturitu • {new Date().getFullYear()}
      </div>
    </div>
  );
}
