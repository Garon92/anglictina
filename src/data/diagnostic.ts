export interface DiagnosticQuestion {
  id: string;
  level: 'A1' | 'A2' | 'B1';
  type: 'mcq' | 'fill';
  skill: 'vocab' | 'grammar' | 'reading';
  question: string;
  options?: string[];
  answerIndex?: number;
  answer?: string;
  explanationCs: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  // ─── A1 (questions 1-10): 1 point each ───

  {
    id: 'diag_01',
    level: 'A1',
    type: 'mcq',
    skill: 'vocab',
    question: 'What is the colour of the sky on a clear day?',
    options: ['red', 'blue', 'green', 'yellow'],
    answerIndex: 1,
    explanationCs: 'Nebe za jasného dne je modré – „blue".',
  },
  {
    id: 'diag_02',
    level: 'A1',
    type: 'mcq',
    skill: 'vocab',
    question: 'Which word means a place where you sleep?',
    options: ['kitchen', 'bedroom', 'garden', 'office'],
    answerIndex: 1,
    explanationCs: '„Bedroom" znamená ložnice – místnost, kde spíte.',
  },
  {
    id: 'diag_03',
    level: 'A1',
    type: 'fill',
    skill: 'vocab',
    question: 'The opposite of "hot" is ___.',
    answer: 'cold',
    explanationCs: 'Opak slova „hot" (horký) je „cold" (studený).',
  },
  {
    id: 'diag_04',
    level: 'A1',
    type: 'mcq',
    skill: 'grammar',
    question: 'She ___ a student.',
    options: ['am', 'is', 'are', 'be'],
    answerIndex: 1,
    explanationCs: 'Se zájmenem „she" používáme tvar „is".',
  },
  {
    id: 'diag_05',
    level: 'A1',
    type: 'mcq',
    skill: 'grammar',
    question: 'I ___ two brothers.',
    options: ['has', 'have', 'having', 'am have'],
    answerIndex: 1,
    explanationCs: 'S „I" se pojí tvar „have" (mám).',
  },
  {
    id: 'diag_06',
    level: 'A1',
    type: 'fill',
    skill: 'grammar',
    question: 'They ___ from Prague. (to be)',
    answer: 'are',
    explanationCs: 'S „they" se pojí tvar „are".',
  },
  {
    id: 'diag_07',
    level: 'A1',
    type: 'mcq',
    skill: 'grammar',
    question: 'He ___ to school every day.',
    options: ['go', 'goes', 'going', 'gone'],
    answerIndex: 1,
    explanationCs: 'Ve třetí osobě jednotného čísla přidáváme „-es": he goes.',
  },
  {
    id: 'diag_08',
    level: 'A1',
    type: 'mcq',
    skill: 'grammar',
    question: '___ you like coffee?',
    options: ['Are', 'Do', 'Is', 'Has'],
    answerIndex: 1,
    explanationCs: 'Otázky s „you" v přítomném čase tvoříme pomocí „Do".',
  },
  {
    id: 'diag_09',
    level: 'A1',
    type: 'mcq',
    skill: 'reading',
    question:
      'Read: "My name is Tom. I am 10 years old. I have a dog called Max." How old is Tom?',
    options: ['8', '9', '10', '11'],
    answerIndex: 2,
    explanationCs: 'V textu se píše „I am 10 years old", takže Tomovi je 10.',
  },
  {
    id: 'diag_10',
    level: 'A1',
    type: 'fill',
    skill: 'vocab',
    question: 'Monday, Tuesday, ___. What day comes next?',
    answer: 'Wednesday',
    explanationCs: 'Po úterý (Tuesday) následuje středa – „Wednesday".',
  },

  // ─── A2 (questions 11-20): 2 points each ───

  {
    id: 'diag_11',
    level: 'A2',
    type: 'mcq',
    skill: 'vocab',
    question: 'If you feel "exhausted", you feel very ___.',
    options: ['happy', 'tired', 'hungry', 'angry'],
    answerIndex: 1,
    explanationCs: '„Exhausted" znamená velmi unavený – „tired".',
  },
  {
    id: 'diag_12',
    level: 'A2',
    type: 'fill',
    skill: 'vocab',
    question: 'A person who flies an aeroplane is called a ___.',
    answer: 'pilot',
    explanationCs: 'Osoba, která řídí letadlo, je pilot – „pilot".',
  },
  {
    id: 'diag_13',
    level: 'A2',
    type: 'mcq',
    skill: 'vocab',
    question: 'Which word means "to get to a place"?',
    options: ['leave', 'arrive', 'escape', 'return'],
    answerIndex: 1,
    explanationCs: '„Arrive" znamená dorazit, přijet na místo.',
  },
  {
    id: 'diag_14',
    level: 'A2',
    type: 'mcq',
    skill: 'grammar',
    question: 'I ___ to London last summer.',
    options: ['travel', 'travelled', 'will travel', 'am travelling'],
    answerIndex: 1,
    explanationCs: '„Last summer" označuje minulost, proto použijeme minulý čas: „travelled".',
  },
  {
    id: 'diag_15',
    level: 'A2',
    type: 'mcq',
    skill: 'grammar',
    question: 'She ___ dinner when I called her.',
    options: ['cooks', 'cooked', 'was cooking', 'has cooked'],
    answerIndex: 2,
    explanationCs:
      'Probíhající děj v minulosti přerušený jinou událostí = past continuous: „was cooking".',
  },
  {
    id: 'diag_16',
    level: 'A2',
    type: 'fill',
    skill: 'grammar',
    question: 'We arrived ___ the airport at 6 a.m. (preposition)',
    answer: 'at',
    explanationCs: 'S „airport" se pojí předložka „at" – arrive at the airport.',
  },
  {
    id: 'diag_17',
    level: 'A2',
    type: 'mcq',
    skill: 'grammar',
    question: 'There ___ many people at the party yesterday.',
    options: ['was', 'were', 'is', 'are'],
    answerIndex: 1,
    explanationCs: '„Many people" je množné číslo + minulý čas → „were".',
  },
  {
    id: 'diag_18',
    level: 'A2',
    type: 'mcq',
    skill: 'grammar',
    question: 'He is ___ than his brother.',
    options: ['tall', 'taller', 'tallest', 'more tall'],
    answerIndex: 1,
    explanationCs: 'Porovnáváme dvě osoby → 2. stupeň přídavného jména: „taller".',
  },
  {
    id: 'diag_19',
    level: 'A2',
    type: 'mcq',
    skill: 'reading',
    question:
      'Read: "Anna usually takes the bus to work, but today she is walking because the weather is nice." Why is Anna walking today?',
    options: [
      'The bus is late.',
      'She likes exercise.',
      'The weather is nice.',
      'Her car is broken.',
    ],
    answerIndex: 2,
    explanationCs: 'Text říká „because the weather is nice" – proto jde pěšky.',
  },
  {
    id: 'diag_20',
    level: 'A2',
    type: 'fill',
    skill: 'reading',
    question:
      'Read: "The shop opens at 9 a.m. and closes at 7 p.m." How many hours is the shop open?',
    answer: '10',
    explanationCs: 'Od 9:00 do 19:00 je 10 hodin.',
  },

  // ─── B1 (questions 21-30): 3 points each ───

  {
    id: 'diag_21',
    level: 'B1',
    type: 'mcq',
    skill: 'vocab',
    question: 'The company decided to ___ several employees due to budget cuts.',
    options: ['promote', 'hire', 'lay off', 'train'],
    answerIndex: 2,
    explanationCs: '„Lay off" znamená propustit zaměstnance kvůli úsporám.',
  },
  {
    id: 'diag_22',
    level: 'B1',
    type: 'fill',
    skill: 'vocab',
    question:
      'Despite all the difficulties, she managed to ___ her goal. (synonym of "achieve")',
    answer: 'accomplish',
    explanationCs: '„Accomplish" je synonymum pro „achieve" – dosáhnout cíle.',
  },
  {
    id: 'diag_23',
    level: 'B1',
    type: 'mcq',
    skill: 'vocab',
    question: 'A "thorough" investigation is one that is ___.',
    options: ['quick', 'careless', 'complete and careful', 'illegal'],
    answerIndex: 2,
    explanationCs: '„Thorough" znamená důkladný, pečlivý – „complete and careful".',
  },
  {
    id: 'diag_24',
    level: 'B1',
    type: 'mcq',
    skill: 'grammar',
    question: 'If I ___ more time, I would learn another language.',
    options: ['have', 'had', 'will have', 'would have'],
    answerIndex: 1,
    explanationCs:
      'Druhý kondicionál (nereálná podmínka v přítomnosti): If + past simple → „had".',
  },
  {
    id: 'diag_25',
    level: 'B1',
    type: 'mcq',
    skill: 'grammar',
    question: 'The letter ___ yesterday.',
    options: ['sent', 'was sent', 'is sent', 'has sent'],
    answerIndex: 1,
    explanationCs: 'Trpný rod v minulém čase: „was sent" (dopis byl odeslán).',
  },
  {
    id: 'diag_26',
    level: 'B1',
    type: 'fill',
    skill: 'grammar',
    question: 'She asked me where I ___ the previous day. (to go – reported speech)',
    answer: 'had gone',
    explanationCs:
      'V nepřímé řeči se minulý čas mění na předminulý: went → „had gone".',
  },
  {
    id: 'diag_27',
    level: 'B1',
    type: 'mcq',
    skill: 'grammar',
    question: 'By the time we arrived, the film ___.',
    options: ['already started', 'had already started', 'has already started', 'already starts'],
    answerIndex: 1,
    explanationCs:
      'Děj dokončený před jiným minulým dějem = předminulý čas: „had already started".',
  },
  {
    id: 'diag_28',
    level: 'B1',
    type: 'mcq',
    skill: 'grammar',
    question: 'I wish I ___ speak French fluently.',
    options: ['can', 'could', 'will', 'would'],
    answerIndex: 1,
    explanationCs: '„I wish" + minulý tvar vyjadřuje přání: „could" (kéž bych uměl).',
  },
  {
    id: 'diag_29',
    level: 'B1',
    type: 'mcq',
    skill: 'reading',
    question:
      'Read: "Recent studies suggest that regular exercise not only improves physical health but also has a significant positive effect on mental well-being. People who exercise at least three times a week report lower levels of stress and anxiety." According to the text, what is one benefit of regular exercise?',
    options: [
      'It guarantees happiness.',
      'It reduces stress and anxiety.',
      'It replaces the need for sleep.',
      'It has no effect on the mind.',
    ],
    answerIndex: 1,
    explanationCs:
      'Text uvádí, že cvičení snižuje stres a úzkost – „lower levels of stress and anxiety".',
  },
  {
    id: 'diag_30',
    level: 'B1',
    type: 'fill',
    skill: 'reading',
    question:
      'Read: "Although the restaurant had received mixed reviews online, we decided to try it anyway. The food turned out to be excellent and the service was outstanding." The word "outstanding" in this context means ___.',
    answer: 'excellent',
    explanationCs:
      '„Outstanding" zde znamená vynikající, výborný – synonymum k „excellent".',
  },
];

export const DIAGNOSTIC_SCORING = {
  pointsPerLevel: { A1: 1, A2: 2, B1: 3 } as const,
  maxPoints: 60,
  thresholds: [
    { maxScore: 15, level: 'A1' as const },
    { maxScore: 35, level: 'A2' as const },
    { maxScore: 60, level: 'B1' as const },
  ],
  getLevel(score: number): 'A1' | 'A2' | 'B1' {
    if (score <= 15) return 'A1';
    if (score <= 35) return 'A2';
    return 'B1';
  },
};
