export interface PassiveRule {
  id: string;
  tense: string;
  tenseCs: string;
  activeFormula: string;
  passiveFormula: string;
  activeExample: string;
  passiveExample: string;
  explanationCs: string;
}

export interface PassiveExercise {
  id: string;
  type: 'transform' | 'mcq' | 'fill';
  tense: string;
  level: 'A2' | 'B1';
  activeSentence?: string;
  prompt: string;
  answer: string;
  options?: string[];
  explanationCs: string;
}

export const PASSIVE_RULES: PassiveRule[] = [
  {
    id: 'pv_rule_01',
    tense: 'Present Simple',
    tenseCs: 'Přítomný prostý',
    activeFormula: 'Subject + V(s/es) + Object',
    passiveFormula: 'Object + am/is/are + past participle (+ by Subject)',
    activeExample: 'They clean the office every day.',
    passiveExample: 'The office is cleaned every day.',
    explanationCs:
      'V trpném rodě přítomného prostého času používáme „am/is/are" + příčestí minulé. Podmět činného rodu se přesouvá za „by" (často se vynechává, pokud není důležitý). Čeština obvykle použije zvratné „se" nebo opisný trpný rod.',
  },
  {
    id: 'pv_rule_02',
    tense: 'Past Simple',
    tenseCs: 'Minulý prostý',
    activeFormula: 'Subject + V-ed/V2 + Object',
    passiveFormula: 'Object + was/were + past participle (+ by Subject)',
    activeExample: 'Shakespeare wrote Hamlet.',
    passiveExample: 'Hamlet was written by Shakespeare.',
    explanationCs:
      'V trpném rodě minulého prostého času používáme „was/were" + příčestí minulé. U nepravidelných sloves si pamatujte třetí tvar (write → written). V češtině: „Hamlet byl napsán Shakespearem."',
  },
  {
    id: 'pv_rule_03',
    tense: 'Present Perfect',
    tenseCs: 'Předpřítomný',
    activeFormula: 'Subject + have/has + past participle + Object',
    passiveFormula: 'Object + have/has + been + past participle (+ by Subject)',
    activeExample: 'Someone has stolen my bike.',
    passiveExample: 'My bike has been stolen.',
    explanationCs:
      'Trpný rod předpřítomného času: „have/has been" + příčestí minulé. Důraz se přesouvá na předmět (oběť děje). V češtině: „Moje kolo bylo ukradeno."',
  },
  {
    id: 'pv_rule_04',
    tense: 'Future Simple',
    tenseCs: 'Budoucí prostý',
    activeFormula: 'Subject + will + V + Object',
    passiveFormula: 'Object + will be + past participle (+ by Subject)',
    activeExample: 'They will repair the road next month.',
    passiveExample: 'The road will be repaired next month.',
    explanationCs:
      'V trpném rodě budoucího prostého času: „will be" + příčestí minulé. V češtině: „Cesta bude opravena příští měsíc."',
  },
  {
    id: 'pv_rule_05',
    tense: 'Present Continuous',
    tenseCs: 'Přítomný průběhový',
    activeFormula: 'Subject + am/is/are + V-ing + Object',
    passiveFormula: 'Object + am/is/are + being + past participle (+ by Subject)',
    activeExample: 'They are building a new hospital.',
    passiveExample: 'A new hospital is being built.',
    explanationCs:
      'Trpný rod přítomného průběhového času: „am/is/are being" + příčestí minulé. Vyjadřuje, že děj probíhá právě teď. V češtině: „Nová nemocnice se právě staví."',
  },
  {
    id: 'pv_rule_06',
    tense: 'Past Continuous',
    tenseCs: 'Minulý průběhový',
    activeFormula: 'Subject + was/were + V-ing + Object',
    passiveFormula: 'Object + was/were + being + past participle (+ by Subject)',
    activeExample: 'They were painting the house when I arrived.',
    passiveExample: 'The house was being painted when I arrived.',
    explanationCs:
      'Trpný rod minulého průběhového času: „was/were being" + příčestí minulé. Popisuje děj, který právě probíhal v minulosti. V češtině: „Dům se zrovna maloval, když jsem přišel."',
  },
  {
    id: 'pv_rule_07',
    tense: 'Modals',
    tenseCs: 'Modální slovesa',
    activeFormula: 'Subject + modal + V + Object',
    passiveFormula: 'Object + modal + be + past participle (+ by Subject)',
    activeExample: 'You must finish the report today.',
    passiveExample: 'The report must be finished today.',
    explanationCs:
      'Po modálních slovesech (can, could, must, should, may, might, will, would) tvoříme trpný rod: „modal + be + příčestí minulé". V češtině: „Zpráva musí být dokončena dnes." Platí pro všechna modální slovesa stejně.',
  },
  {
    id: 'pv_rule_08',
    tense: 'General',
    tenseCs: 'Obecná pravidla',
    activeFormula: 'Subject (činitel) + sloveso + Object (příjemce děje)',
    passiveFormula: 'Object → podmět + be (v příslušném čase) + past participle (+ by činitel)',
    activeExample: 'People speak English all over the world.',
    passiveExample: 'English is spoken all over the world.',
    explanationCs:
      'Trpný rod používáme, když: 1) neznáme činitele, 2) činitel není důležitý, 3) chceme zdůraznit příjemce děje. Přeměna: předmět → podmět, sloveso → be + příčestí minulé, původní podmět → „by…" (nepovinné). Pozor: nepřechodná slovesa (happen, arrive, sleep) trpný rod netvoří.',
  },
];

export const PASSIVE_EXERCISES: PassiveExercise[] = [
  // ═══════════════════════════════════════════════════════════════════
  // TRANSFORM exercises (25) — rewrite active → passive
  // ═══════════════════════════════════════════════════════════════════

  // --- Present Simple (4) ---
  {
    id: 'pv_tr_01',
    type: 'transform',
    tense: 'present_simple',
    level: 'A2',
    activeSentence: 'They clean the classrooms every day.',
    prompt: 'Přepiš do trpného rodu: They clean the classrooms every day.',
    answer: 'The classrooms are cleaned every day.',
    explanationCs: 'Podmět „they" se vynechá (není důležitý). „Clean" → „are cleaned" (am/is/are + příčestí minulé).',
  },
  {
    id: 'pv_tr_02',
    type: 'transform',
    tense: 'present_simple',
    level: 'A2',
    activeSentence: 'She teaches English at the school.',
    prompt: 'Přepiš do trpného rodu: She teaches English at the school.',
    answer: 'English is taught at the school.',
    explanationCs: '„Teaches" → „is taught" (teach–taught–taught). Podmět „she" se může vynechat nebo přidat „by her".',
  },
  {
    id: 'pv_tr_03',
    type: 'transform',
    tense: 'present_simple',
    level: 'A2',
    activeSentence: 'Millions of people watch this show.',
    prompt: 'Přepiš do trpného rodu: Millions of people watch this show.',
    answer: 'This show is watched by millions of people.',
    explanationCs: '„Watch" → „is watched". Činitel „millions of people" je důležitý, proto „by millions of people".',
  },
  {
    id: 'pv_tr_04',
    type: 'transform',
    tense: 'present_simple',
    level: 'B1',
    activeSentence: 'The company produces cars in Germany.',
    prompt: 'Přepiš do trpného rodu: The company produces cars in Germany.',
    answer: 'Cars are produced in Germany.',
    explanationCs: '„Produces" → „are produced". Předmět „cars" je množné číslo → „are". Činitel se může vynechat.',
  },

  // --- Past Simple (4) ---
  {
    id: 'pv_tr_05',
    type: 'transform',
    tense: 'past_simple',
    level: 'A2',
    activeSentence: 'They built this bridge in 1990.',
    prompt: 'Přepiš do trpného rodu: They built this bridge in 1990.',
    answer: 'This bridge was built in 1990.',
    explanationCs: '„Built" → „was built" (build–built–built). „They" se vynechá.',
  },
  {
    id: 'pv_tr_06',
    type: 'transform',
    tense: 'past_simple',
    level: 'A2',
    activeSentence: 'Someone broke the window last night.',
    prompt: 'Přepiš do trpného rodu: Someone broke the window last night.',
    answer: 'The window was broken last night.',
    explanationCs: '„Broke" → „was broken" (break–broke–broken). Neznámý činitel „someone" se vynechá.',
  },
  {
    id: 'pv_tr_07',
    type: 'transform',
    tense: 'past_simple',
    level: 'B1',
    activeSentence: 'Alexander Fleming discovered penicillin in 1928.',
    prompt: 'Přepiš do trpného rodu: Alexander Fleming discovered penicillin in 1928.',
    answer: 'Penicillin was discovered by Alexander Fleming in 1928.',
    explanationCs: '„Discovered" → „was discovered". Činitel je důležitý → „by Alexander Fleming".',
  },
  {
    id: 'pv_tr_08',
    type: 'transform',
    tense: 'past_simple',
    level: 'B1',
    activeSentence: 'The police arrested the thief yesterday.',
    prompt: 'Přepiš do trpného rodu: The police arrested the thief yesterday.',
    answer: 'The thief was arrested yesterday.',
    explanationCs: '„Arrested" → „was arrested". „The police" se může vynechat (je zřejmý z kontextu).',
  },

  // --- Present Perfect (4) ---
  {
    id: 'pv_tr_09',
    type: 'transform',
    tense: 'present_perfect',
    level: 'B1',
    activeSentence: 'They have cancelled the flight.',
    prompt: 'Přepiš do trpného rodu: They have cancelled the flight.',
    answer: 'The flight has been cancelled.',
    explanationCs: '„Have cancelled" → „has been cancelled". Předmět „the flight" je jednotné číslo → „has".',
  },
  {
    id: 'pv_tr_10',
    type: 'transform',
    tense: 'present_perfect',
    level: 'B1',
    activeSentence: 'Someone has eaten my sandwich.',
    prompt: 'Přepiš do trpného rodu: Someone has eaten my sandwich.',
    answer: 'My sandwich has been eaten.',
    explanationCs: '„Has eaten" → „has been eaten" (eat–ate–eaten). „Someone" se vynechá.',
  },
  {
    id: 'pv_tr_11',
    type: 'transform',
    tense: 'present_perfect',
    level: 'B1',
    activeSentence: 'The government has raised taxes.',
    prompt: 'Přepiš do trpného rodu: The government has raised taxes.',
    answer: 'Taxes have been raised.',
    explanationCs: '„Has raised" → „have been raised". „Taxes" je množné číslo → „have".',
  },

  // --- Future Simple (3) ---
  {
    id: 'pv_tr_12',
    type: 'transform',
    tense: 'future_simple',
    level: 'A2',
    activeSentence: 'They will open a new shop next week.',
    prompt: 'Přepiš do trpného rodu: They will open a new shop next week.',
    answer: 'A new shop will be opened next week.',
    explanationCs: '„Will open" → „will be opened". Struktura: will + be + příčestí minulé.',
  },
  {
    id: 'pv_tr_13',
    type: 'transform',
    tense: 'future_simple',
    level: 'B1',
    activeSentence: 'The teacher will announce the results tomorrow.',
    prompt: 'Přepiš do trpného rodu: The teacher will announce the results tomorrow.',
    answer: 'The results will be announced tomorrow.',
    explanationCs: '„Will announce" → „will be announced". Činitel se může vynechat.',
  },

  // --- Present Continuous (3) ---
  {
    id: 'pv_tr_14',
    type: 'transform',
    tense: 'present_continuous',
    level: 'B1',
    activeSentence: 'They are renovating the museum right now.',
    prompt: 'Přepiš do trpného rodu: They are renovating the museum right now.',
    answer: 'The museum is being renovated right now.',
    explanationCs: '„Are renovating" → „is being renovated". Přítomný průběhový trpný rod: am/is/are + being + příčestí minulé.',
  },
  {
    id: 'pv_tr_15',
    type: 'transform',
    tense: 'present_continuous',
    level: 'B1',
    activeSentence: 'Workers are repairing the road.',
    prompt: 'Přepiš do trpného rodu: Workers are repairing the road.',
    answer: 'The road is being repaired.',
    explanationCs: '„Are repairing" → „is being repaired". „Workers" se vynechá.',
  },

  // --- Past Continuous (2) ---
  {
    id: 'pv_tr_16',
    type: 'transform',
    tense: 'past_continuous',
    level: 'B1',
    activeSentence: 'They were interviewing the candidates all morning.',
    prompt: 'Přepiš do trpného rodu: They were interviewing the candidates all morning.',
    answer: 'The candidates were being interviewed all morning.',
    explanationCs: '„Were interviewing" → „were being interviewed". Minulý průběhový trpný rod: was/were + being + příčestí minulé.',
  },
  {
    id: 'pv_tr_17',
    type: 'transform',
    tense: 'past_continuous',
    level: 'B1',
    activeSentence: 'Someone was following us.',
    prompt: 'Přepiš do trpného rodu: Someone was following us.',
    answer: 'We were being followed.',
    explanationCs: '„Was following" → „were being followed". „Us" se mění na „we" (podmět). „Someone" se vynechá.',
  },

  // --- Modals (3) ---
  {
    id: 'pv_tr_18',
    type: 'transform',
    tense: 'modals',
    level: 'A2',
    activeSentence: 'You must wear a helmet.',
    prompt: 'Přepiš do trpného rodu: You must wear a helmet.',
    answer: 'A helmet must be worn.',
    explanationCs: '„Must wear" → „must be worn" (wear–wore–worn). Modal + be + příčestí minulé.',
  },
  {
    id: 'pv_tr_19',
    type: 'transform',
    tense: 'modals',
    level: 'B1',
    activeSentence: 'They should inform all the students.',
    prompt: 'Přepiš do trpného rodu: They should inform all the students.',
    answer: 'All the students should be informed.',
    explanationCs: '„Should inform" → „should be informed". Modal + be + příčestí minulé.',
  },
  {
    id: 'pv_tr_20',
    type: 'transform',
    tense: 'modals',
    level: 'B1',
    activeSentence: 'You can buy tickets online.',
    prompt: 'Přepiš do trpného rodu: You can buy tickets online.',
    answer: 'Tickets can be bought online.',
    explanationCs: '„Can buy" → „can be bought" (buy–bought–bought). „You" se vynechá.',
  },

  // --- Mixed (2) ---
  {
    id: 'pv_tr_21',
    type: 'transform',
    tense: 'mixed',
    level: 'B1',
    activeSentence: 'People grow coffee in Brazil.',
    prompt: 'Přepiš do trpného rodu: People grow coffee in Brazil.',
    answer: 'Coffee is grown in Brazil.',
    explanationCs: 'Present simple: „grow" → „is grown" (grow–grew–grown). „People" se vynechá (obecný činitel).',
  },
  {
    id: 'pv_tr_22',
    type: 'transform',
    tense: 'mixed',
    level: 'B1',
    activeSentence: 'They had already sold all the tickets when we arrived.',
    prompt: 'Přepiš do trpného rodu: They had already sold all the tickets when we arrived.',
    answer: 'All the tickets had already been sold when we arrived.',
    explanationCs: 'Past perfect trpný rod: „had sold" → „had been sold". Méně běžný, ale důležité ho znát.',
  },
  {
    id: 'pv_tr_23',
    type: 'transform',
    tense: 'mixed',
    level: 'A2',
    activeSentence: 'My mum makes the best cake.',
    prompt: 'Přepiš do trpného rodu: My mum makes the best cake.',
    answer: 'The best cake is made by my mum.',
    explanationCs: '„Makes" → „is made". Činitel je důležitý → „by my mum".',
  },
  {
    id: 'pv_tr_24',
    type: 'transform',
    tense: 'mixed',
    level: 'B1',
    activeSentence: 'Nobody has watered the plants.',
    prompt: 'Přepiš do trpného rodu: Nobody has watered the plants.',
    answer: 'The plants haven\'t been watered.',
    explanationCs: '„Nobody has watered" → záporný trpný rod „haven\'t been watered". „Nobody" mění větu na zápornou.',
  },
  {
    id: 'pv_tr_25',
    type: 'transform',
    tense: 'mixed',
    level: 'B1',
    activeSentence: 'A famous architect designed this building.',
    prompt: 'Přepiš do trpného rodu: A famous architect designed this building.',
    answer: 'This building was designed by a famous architect.',
    explanationCs: 'Past simple: „designed" → „was designed". Činitel je důležitý → „by a famous architect".',
  },

  // ═══════════════════════════════════════════════════════════════════
  // MCQ exercises (25) — choose the correct passive form
  // ═══════════════════════════════════════════════════════════════════

  // --- Present Simple (4) ---
  {
    id: 'pv_mcq_01',
    type: 'mcq',
    tense: 'present_simple',
    level: 'A2',
    prompt: 'English ___ all over the world.',
    answer: 'is spoken',
    options: ['speaks', 'is spoken', 'is speaking', 'was spoken'],
    explanationCs: 'Trpný rod přítomného prostého: „is spoken". Angličtina se mluví po celém světě.',
  },
  {
    id: 'pv_mcq_02',
    type: 'mcq',
    tense: 'present_simple',
    level: 'A2',
    prompt: 'These cars ___ in Japan.',
    answer: 'are made',
    options: ['are made', 'is made', 'are making', 'were made'],
    explanationCs: '„Cars" je množné číslo → „are made". Present simple passive.',
  },
  {
    id: 'pv_mcq_03',
    type: 'mcq',
    tense: 'present_simple',
    level: 'A2',
    prompt: 'The museum ___ at 9 a.m. every day.',
    answer: 'is opened',
    options: ['opens', 'is opened', 'is opening', 'was opened'],
    explanationCs: 'V trpném rodě: „is opened" (muzeum je otevíráno). Pozor: „opens" by bylo v činném rodě.',
  },
  {
    id: 'pv_mcq_04',
    type: 'mcq',
    tense: 'present_simple',
    level: 'B1',
    prompt: 'Breakfast ___ between 7 and 10 a.m.',
    answer: 'is served',
    options: ['serves', 'is served', 'is serving', 'has served'],
    explanationCs: '„Snídaně je podávána" → „is served". Present simple passive.',
  },

  // --- Past Simple (4) ---
  {
    id: 'pv_mcq_05',
    type: 'mcq',
    tense: 'past_simple',
    level: 'A2',
    prompt: 'America ___ by Columbus in 1492.',
    answer: 'was discovered',
    options: ['discovered', 'was discovered', 'is discovered', 'has been discovered'],
    explanationCs: 'Minulost → „was discovered". „Discovered" samotné by bylo činný rod.',
  },
  {
    id: 'pv_mcq_06',
    type: 'mcq',
    tense: 'past_simple',
    level: 'A2',
    prompt: 'The homework ___ by the students yesterday.',
    answer: 'was done',
    options: ['did', 'was done', 'were done', 'is done'],
    explanationCs: '„Homework" je nepočitatelné/jednotné → „was done". Past simple passive.',
  },
  {
    id: 'pv_mcq_07',
    type: 'mcq',
    tense: 'past_simple',
    level: 'B1',
    prompt: 'Two suspects ___ by the police last night.',
    answer: 'were arrested',
    options: ['arrested', 'was arrested', 'were arrested', 'are arrested'],
    explanationCs: '„Two suspects" je množné číslo + minulost → „were arrested".',
  },
  {
    id: 'pv_mcq_08',
    type: 'mcq',
    tense: 'past_simple',
    level: 'B1',
    prompt: 'The letter ___ to the wrong address.',
    answer: 'was sent',
    options: ['sent', 'was sent', 'is sent', 'has been sent'],
    explanationCs: 'Kontext naznačuje minulost → „was sent" (send–sent–sent).',
  },

  // --- Present Perfect (3) ---
  {
    id: 'pv_mcq_09',
    type: 'mcq',
    tense: 'present_perfect',
    level: 'B1',
    prompt: 'The project ___ already ___.',
    answer: 'has … been finished',
    options: ['has … been finished', 'was … finished', 'is … finished', 'has … finished'],
    explanationCs: 'Present perfect passive: „has been finished". „Already" signalizuje předpřítomný čas.',
  },
  {
    id: 'pv_mcq_10',
    type: 'mcq',
    tense: 'present_perfect',
    level: 'B1',
    prompt: 'Three new hospitals ___ this year.',
    answer: 'have been built',
    options: ['were built', 'have been built', 'are built', 'had been built'],
    explanationCs: '„This year" signalizuje present perfect → „have been built". Množné číslo → „have".',
  },
  {
    id: 'pv_mcq_11',
    type: 'mcq',
    tense: 'present_perfect',
    level: 'B1',
    prompt: 'My car ___ . I need to call the police.',
    answer: 'has been stolen',
    options: ['was stolen', 'has been stolen', 'is stolen', 'stole'],
    explanationCs: 'Výsledek v přítomnosti → present perfect passive „has been stolen".',
  },

  // --- Future Simple (3) ---
  {
    id: 'pv_mcq_12',
    type: 'mcq',
    tense: 'future_simple',
    level: 'A2',
    prompt: 'The new school ___ next year.',
    answer: 'will be built',
    options: ['will build', 'will be built', 'is built', 'was built'],
    explanationCs: 'Budoucí trpný rod: „will be built". „Next year" signalizuje budoucnost.',
  },
  {
    id: 'pv_mcq_13',
    type: 'mcq',
    tense: 'future_simple',
    level: 'B1',
    prompt: 'All passengers ___ before boarding.',
    answer: 'will be checked',
    options: ['will check', 'will be checked', 'are checked', 'were checked'],
    explanationCs: '„Cestující budou zkontrolováni" → „will be checked". Future simple passive.',
  },
  {
    id: 'pv_mcq_14',
    type: 'mcq',
    tense: 'future_simple',
    level: 'A2',
    prompt: 'The winners ___ on Friday.',
    answer: 'will be announced',
    options: ['will announce', 'will be announced', 'are announced', 'announced'],
    explanationCs: '„Vítězové budou oznámeni" → „will be announced".',
  },

  // --- Present Continuous (3) ---
  {
    id: 'pv_mcq_15',
    type: 'mcq',
    tense: 'present_continuous',
    level: 'B1',
    prompt: 'A new bridge ___ at the moment.',
    answer: 'is being built',
    options: ['is built', 'is being built', 'was being built', 'has been built'],
    explanationCs: '„At the moment" → průběhový čas → „is being built".',
  },
  {
    id: 'pv_mcq_16',
    type: 'mcq',
    tense: 'present_continuous',
    level: 'B1',
    prompt: 'The rooms ___ right now.',
    answer: 'are being cleaned',
    options: ['are cleaned', 'are being cleaned', 'were being cleaned', 'have been cleaned'],
    explanationCs: '„Right now" → právě probíhající děj → „are being cleaned".',
  },
  {
    id: 'pv_mcq_17',
    type: 'mcq',
    tense: 'present_continuous',
    level: 'B1',
    prompt: 'Dinner ___ . It will be ready soon.',
    answer: 'is being prepared',
    options: ['is prepared', 'is being prepared', 'was prepared', 'prepares'],
    explanationCs: '„It will be ready soon" naznačuje, že příprava právě probíhá → „is being prepared".',
  },

  // --- Past Continuous (2) ---
  {
    id: 'pv_mcq_18',
    type: 'mcq',
    tense: 'past_continuous',
    level: 'B1',
    prompt: 'When I arrived, the car ___.',
    answer: 'was being repaired',
    options: ['was repaired', 'was being repaired', 'is being repaired', 'had been repaired'],
    explanationCs: '„When I arrived" + probíhající děj v minulosti → „was being repaired".',
  },
  {
    id: 'pv_mcq_19',
    type: 'mcq',
    tense: 'past_continuous',
    level: 'B1',
    prompt: 'The road ___ when the accident happened.',
    answer: 'was being repaired',
    options: ['repaired', 'was repaired', 'was being repaired', 'has been repaired'],
    explanationCs: 'Dva současné děje v minulosti → průběhový trpný rod „was being repaired".',
  },

  // --- Modals (3) ---
  {
    id: 'pv_mcq_20',
    type: 'mcq',
    tense: 'modals',
    level: 'A2',
    prompt: 'This form ___ in black ink.',
    answer: 'must be filled in',
    options: ['must fill in', 'must be filled in', 'must be filling in', 'must have filled in'],
    explanationCs: 'Modal + be + příčestí minulé: „must be filled in".',
  },
  {
    id: 'pv_mcq_21',
    type: 'mcq',
    tense: 'modals',
    level: 'B1',
    prompt: 'The window ___ . It\'s really hot in here.',
    answer: 'should be opened',
    options: ['should open', 'should be opened', 'should be opening', 'should have opened'],
    explanationCs: '„Okno by mělo být otevřeno" → „should be opened". Modal + be + past participle.',
  },
  {
    id: 'pv_mcq_22',
    type: 'mcq',
    tense: 'modals',
    level: 'A2',
    prompt: 'Smoking ___ here.',
    answer: 'can\'t be allowed',
    options: ['can\'t allow', 'can\'t be allowed', 'can\'t be allowing', 'couldn\'t allow'],
    explanationCs: '„Kouření nemůže být povoleno" → „can\'t be allowed".',
  },

  // --- Mixed (3) ---
  {
    id: 'pv_mcq_23',
    type: 'mcq',
    tense: 'mixed',
    level: 'B1',
    prompt: 'The Mona Lisa ___ by Leonardo da Vinci.',
    answer: 'was painted',
    options: ['painted', 'was painted', 'is painted', 'has been painted'],
    explanationCs: 'Historický fakt → past simple passive „was painted".',
  },
  {
    id: 'pv_mcq_24',
    type: 'mcq',
    tense: 'mixed',
    level: 'A2',
    prompt: 'This song ___ by many people.',
    answer: 'is loved',
    options: ['loves', 'is loved', 'was loved', 'loving'],
    explanationCs: 'Obecný fakt v přítomnosti → present simple passive „is loved".',
  },
  {
    id: 'pv_mcq_25',
    type: 'mcq',
    tense: 'mixed',
    level: 'B1',
    prompt: 'The report ___ by Friday. It\'s very important.',
    answer: 'must be completed',
    options: ['must complete', 'must be completed', 'must have completed', 'must be completing'],
    explanationCs: 'Povinnost v trpném rodě → „must be completed".',
  },

  // ═══════════════════════════════════════════════════════════════════
  // FILL exercises (20) — fill the gap with correct passive form
  // ═══════════════════════════════════════════════════════════════════

  // --- Present Simple (3) ---
  {
    id: 'pv_fill_01',
    type: 'fill',
    tense: 'present_simple',
    level: 'A2',
    prompt: 'Rice _____ in many Asian countries. (grow)',
    answer: 'is grown',
    explanationCs: 'Present simple passive: „is grown" (grow–grew–grown). Rýže se pěstuje → trpný rod.',
  },
  {
    id: 'pv_fill_02',
    type: 'fill',
    tense: 'present_simple',
    level: 'A2',
    prompt: 'The letters _____ every morning. (deliver)',
    answer: 'are delivered',
    explanationCs: '„Letters" je množné číslo → „are delivered". Present simple passive.',
  },
  {
    id: 'pv_fill_03',
    type: 'fill',
    tense: 'present_simple',
    level: 'A2',
    prompt: 'The park _____ at 8 p.m. (close)',
    answer: 'is closed',
    explanationCs: '„Park" je jednotné číslo → „is closed". Present simple passive.',
  },

  // --- Past Simple (3) ---
  {
    id: 'pv_fill_04',
    type: 'fill',
    tense: 'past_simple',
    level: 'A2',
    prompt: 'The movie _____ in 2019. (release)',
    answer: 'was released',
    explanationCs: '„Movie" je jednotné číslo + minulost → „was released". Past simple passive.',
  },
  {
    id: 'pv_fill_05',
    type: 'fill',
    tense: 'past_simple',
    level: 'A2',
    prompt: 'These photos _____ in Prague. (take)',
    answer: 'were taken',
    explanationCs: '„Photos" je množné číslo + minulost → „were taken" (take–took–taken).',
  },
  {
    id: 'pv_fill_06',
    type: 'fill',
    tense: 'past_simple',
    level: 'B1',
    prompt: 'The documents _____ by the secretary yesterday. (prepare)',
    answer: 'were prepared',
    explanationCs: '„Documents" je množné číslo → „were prepared". Past simple passive.',
  },

  // --- Present Perfect (3) ---
  {
    id: 'pv_fill_07',
    type: 'fill',
    tense: 'present_perfect',
    level: 'B1',
    prompt: 'The email _____ already _____. (send)',
    answer: 'has … been sent',
    explanationCs: 'Present perfect passive: „has been sent" (send–sent–sent). „Already" signalizuje předpřítomný čas.',
  },
  {
    id: 'pv_fill_08',
    type: 'fill',
    tense: 'present_perfect',
    level: 'B1',
    prompt: 'All the cookies _____. There are none left. (eat)',
    answer: 'have been eaten',
    explanationCs: '„Cookies" je množné číslo → „have been eaten" (eat–ate–eaten). Výsledek je vidět teď.',
  },
  {
    id: 'pv_fill_09',
    type: 'fill',
    tense: 'present_perfect',
    level: 'B1',
    prompt: 'The roof _____ recently. It looks great. (repair)',
    answer: 'has been repaired',
    explanationCs: '„Recently" + výsledek v přítomnosti → present perfect passive „has been repaired".',
  },

  // --- Future Simple (2) ---
  {
    id: 'pv_fill_10',
    type: 'fill',
    tense: 'future_simple',
    level: 'A2',
    prompt: 'The homework _____ tomorrow. (check)',
    answer: 'will be checked',
    explanationCs: 'Future simple passive: „will be checked". „Tomorrow" = budoucnost.',
  },
  {
    id: 'pv_fill_11',
    type: 'fill',
    tense: 'future_simple',
    level: 'B1',
    prompt: 'All guests _____ to the party. (invite)',
    answer: 'will be invited',
    explanationCs: '„Will be invited" — budoucí trpný rod. Hosté budou pozváni.',
  },

  // --- Present Continuous (2) ---
  {
    id: 'pv_fill_12',
    type: 'fill',
    tense: 'present_continuous',
    level: 'B1',
    prompt: 'The house _____ at the moment. (paint)',
    answer: 'is being painted',
    explanationCs: '„At the moment" → právě teď probíhá → „is being painted".',
  },
  {
    id: 'pv_fill_13',
    type: 'fill',
    tense: 'present_continuous',
    level: 'B1',
    prompt: 'New software _____ right now by the team. (develop)',
    answer: 'is being developed',
    explanationCs: '„Right now" → přítomný průběhový trpný rod → „is being developed".',
  },

  // --- Past Continuous (2) ---
  {
    id: 'pv_fill_14',
    type: 'fill',
    tense: 'past_continuous',
    level: 'B1',
    prompt: 'The building _____ when the earthquake struck. (demolish)',
    answer: 'was being demolished',
    explanationCs: 'Probíhající děj v minulosti přerušený jinou událostí → „was being demolished".',
  },
  {
    id: 'pv_fill_15',
    type: 'fill',
    tense: 'past_continuous',
    level: 'B1',
    prompt: 'The patients _____ when the doctor arrived. (examine)',
    answer: 'were being examined',
    explanationCs: '„Patients" je množné číslo + probíhající děj v minulosti → „were being examined".',
  },

  // --- Modals (3) ---
  {
    id: 'pv_fill_16',
    type: 'fill',
    tense: 'modals',
    level: 'A2',
    prompt: 'This door _____ not _____. (must / open)',
    answer: 'must not be opened',
    explanationCs: 'Záporný modální trpný rod: „must not be opened". Tyto dveře se nesmějí otevírat.',
  },
  {
    id: 'pv_fill_17',
    type: 'fill',
    tense: 'modals',
    level: 'B1',
    prompt: 'The work _____ by Monday. (should / finish)',
    answer: 'should be finished',
    explanationCs: '„Práce by měla být dokončena" → „should be finished". Modal + be + past participle.',
  },
  {
    id: 'pv_fill_18',
    type: 'fill',
    tense: 'modals',
    level: 'B1',
    prompt: 'Dogs _____ in this area. (can / not / walk)',
    answer: 'cannot be walked',
    explanationCs: '„Se psy se tady nesmí chodit" → „cannot be walked". Záporný modální trpný rod.',
  },

  // --- Mixed (2) ---
  {
    id: 'pv_fill_19',
    type: 'fill',
    tense: 'mixed',
    level: 'B1',
    prompt: 'The pyramids _____ thousands of years ago. (build)',
    answer: 'were built',
    explanationCs: '„Thousands of years ago" → minulost → „were built" (build–built–built).',
  },
  {
    id: 'pv_fill_20',
    type: 'fill',
    tense: 'mixed',
    level: 'A2',
    prompt: 'Coffee _____ in Brazil. (grow)',
    answer: 'is grown',
    explanationCs: 'Obecný fakt → present simple passive → „is grown" (grow–grew–grown).',
  },
];

export const PASSIVE_TENSES: Record<string, string> = {
  present_simple: 'Present Simple',
  past_simple: 'Past Simple',
  present_perfect: 'Present Perfect',
  future_simple: 'Future Simple',
  present_continuous: 'Present Continuous',
  past_continuous: 'Past Continuous',
  modals: 'Modální slovesa',
  mixed: 'Mix',
};
