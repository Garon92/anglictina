export interface ConfusableExercise {
  sentence: string;
  answer: string;
  wrongOption: string;
}

export interface ConfusablePair {
  id: string;
  wordA: string;
  wordB: string;
  meaningA_cs: string;
  meaningB_cs: string;
  explanationCs: string;
  exampleA: string;
  exampleB: string;
  level: 'A1' | 'A2' | 'B1';
  category: 'similar_meaning' | 'similar_form' | 'false_friend' | 'czech_interference';
  exercises: ConfusableExercise[];
}

export const CONFUSABLE_CATEGORIES: Record<string, string> = {
  similar_meaning: 'Podobný význam',
  similar_form: 'Podobná forma',
  false_friend: 'False friends',
  czech_interference: 'Český vliv',
};

export const CONFUSABLE_PAIRS: ConfusablePair[] = [
  // ── SIMILAR MEANING (12) ──────────────────────────────────────────────

  {
    id: 'conf_01',
    wordA: 'borrow',
    wordB: 'lend',
    meaningA_cs: 'půjčit si (od někoho)',
    meaningB_cs: 'půjčit (někomu)',
    explanationCs:
      'Borrow = vzít si něco od někoho na čas. Lend = dát někomu něco na čas. Česky obojí „půjčit", ale směr je opačný.',
    exampleA: 'Can I borrow your pen?',
    exampleB: 'Could you lend me your pen?',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'I need to ___ some money from the bank.',
        answer: 'borrow',
        wrongOption: 'lend',
      },
      {
        sentence: 'Can you ___ me your umbrella? It\'s raining.',
        answer: 'lend',
        wrongOption: 'borrow',
      },
      {
        sentence: 'She ___ my book and never returned it.',
        answer: 'borrowed',
        wrongOption: 'lent',
      },
    ],
  },

  {
    id: 'conf_02',
    wordA: 'make',
    wordB: 'do',
    meaningA_cs: 'vytvořit, vyrobit',
    meaningB_cs: 'dělat, provádět',
    explanationCs:
      'Make = vytvořit něco nového (make a cake, make a decision). Do = provádět činnost (do homework, do the dishes). Česky je obojí často „dělat".',
    exampleA: 'She made a beautiful cake for the party.',
    exampleB: 'Have you done your homework yet?',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'I always ___ my bed in the morning.',
        answer: 'make',
        wrongOption: 'do',
      },
      {
        sentence: 'Could you ___ me a favour?',
        answer: 'do',
        wrongOption: 'make',
      },
      {
        sentence: 'Don\'t ___ so much noise, the baby is sleeping.',
        answer: 'make',
        wrongOption: 'do',
      },
    ],
  },

  {
    id: 'conf_03',
    wordA: 'say',
    wordB: 'tell',
    meaningA_cs: 'říci (slova)',
    meaningB_cs: 'říci (někomu), sdělit',
    explanationCs:
      'Say = vyslovit slova (say hello, say that…). Tell = sdělit informaci někomu – vždy s osobou (tell me, tell a story). Česky obojí „říci".',
    exampleA: 'She said she was tired.',
    exampleB: 'She told me she was tired.',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'He ___ that he would come later.',
        answer: 'said',
        wrongOption: 'told',
      },
      {
        sentence: 'Can you ___ me the truth?',
        answer: 'tell',
        wrongOption: 'say',
      },
      {
        sentence: 'What did she ___ to you?',
        answer: 'say',
        wrongOption: 'tell',
      },
    ],
  },

  {
    id: 'conf_04',
    wordA: 'speak',
    wordB: 'talk',
    meaningA_cs: 'mluvit (formálně), hovořit jazykem',
    meaningB_cs: 'mluvit, povídat si (neformálně)',
    explanationCs:
      'Speak = formálnější, používá se s jazyky (speak English). Talk = neformální konverzace (talk to a friend). Česky obojí „mluvit".',
    exampleA: 'Do you speak French?',
    exampleB: 'We talked for hours about our trip.',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'She can ___ three languages fluently.',
        answer: 'speak',
        wrongOption: 'talk',
      },
      {
        sentence: 'I need to ___ to you about something important.',
        answer: 'talk',
        wrongOption: 'speak',
      },
      {
        sentence: 'Could I ___ to the manager, please?',
        answer: 'speak',
        wrongOption: 'talk',
      },
    ],
  },

  {
    id: 'conf_05',
    wordA: 'hear',
    wordB: 'listen',
    meaningA_cs: 'slyšet (vnímat zvuk)',
    meaningB_cs: 'poslouchat (záměrně)',
    explanationCs:
      'Hear = vnímat zvuk pasivně, bez úmyslu. Listen = záměrně se soustředit na zvuk. Česky: slyšet × poslouchat.',
    exampleA: 'Did you hear that noise?',
    exampleB: 'I love listening to music.',
    level: 'A1',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'Can you ___ to this song and tell me what you think?',
        answer: 'listen',
        wrongOption: 'hear',
      },
      {
        sentence: 'I can ___ someone knocking on the door.',
        answer: 'hear',
        wrongOption: 'listen',
      },
      {
        sentence: 'She wasn\'t ___ — she was looking at her phone.',
        answer: 'listening',
        wrongOption: 'hearing',
      },
    ],
  },

  {
    id: 'conf_06',
    wordA: 'see',
    wordB: 'watch',
    meaningA_cs: 'vidět (vnímat zrakem)',
    meaningB_cs: 'dívat se, sledovat (pohyblivý obraz)',
    explanationCs:
      'See = pasivně vnímat zrakem. Watch = záměrně sledovat něco v pohybu (film, TV). Look = záměrně se podívat na něco statického. Česky: vidět × sledovat × dívat se.',
    exampleA: 'I can see the mountains from here.',
    exampleB: 'We watched a great film last night.',
    level: 'A1',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'Let\'s ___ a movie tonight.',
        answer: 'watch',
        wrongOption: 'see',
      },
      {
        sentence: 'Can you ___ that sign over there?',
        answer: 'see',
        wrongOption: 'watch',
      },
      {
        sentence: 'She spends too much time ___ TV.',
        answer: 'watching',
        wrongOption: 'seeing',
      },
    ],
  },

  {
    id: 'conf_07',
    wordA: 'bring',
    wordB: 'take',
    meaningA_cs: 'přinést (směrem k mluvčímu)',
    meaningB_cs: 'vzít, odnést (směrem od mluvčího)',
    explanationCs:
      'Bring = přinést sem, k mluvčímu. Take = vzít a odnést pryč od mluvčího. Česky: přinést × odnést/vzít.',
    exampleA: 'Can you bring me a glass of water?',
    exampleB: 'Don\'t forget to take your umbrella.',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'Please ___ your homework to school tomorrow.',
        answer: 'bring',
        wrongOption: 'take',
      },
      {
        sentence: 'I\'ll ___ the kids to school on my way to work.',
        answer: 'take',
        wrongOption: 'bring',
      },
      {
        sentence: 'She ___ some flowers when she came to visit.',
        answer: 'brought',
        wrongOption: 'took',
      },
    ],
  },

  {
    id: 'conf_08',
    wordA: 'learn',
    wordB: 'teach',
    meaningA_cs: 'učit se',
    meaningB_cs: 'učit (někoho)',
    explanationCs:
      'Learn = získávat znalosti (žák). Teach = předávat znalosti (učitel). Study = studovat, věnovat se učení. Česky „učit" může být obojí.',
    exampleA: 'I\'m learning to play the guitar.',
    exampleB: 'She teaches maths at a secondary school.',
    level: 'A1',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'My mother ___ me how to cook when I was young.',
        answer: 'taught',
        wrongOption: 'learned',
      },
      {
        sentence: 'I want to ___ how to drive.',
        answer: 'learn',
        wrongOption: 'teach',
      },
      {
        sentence: 'He ___ English at the university.',
        answer: 'teaches',
        wrongOption: 'learns',
      },
    ],
  },

  {
    id: 'conf_09',
    wordA: 'remember',
    wordB: 'remind',
    meaningA_cs: 'pamatovat si, vzpomenout si',
    meaningB_cs: 'připomenout (někomu)',
    explanationCs:
      'Remember = mít v paměti. Remind = způsobit, že si někdo vzpomene. Česky: pamatovat si × připomenout.',
    exampleA: 'I remember my first day at school.',
    exampleB: 'Remind me to buy milk, please.',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'Can you ___ me to call the dentist?',
        answer: 'remind',
        wrongOption: 'remember',
      },
      {
        sentence: 'I don\'t ___ where I put my keys.',
        answer: 'remember',
        wrongOption: 'remind',
      },
      {
        sentence: 'This song ___ me of my childhood.',
        answer: 'reminds',
        wrongOption: 'remembers',
      },
    ],
  },

  {
    id: 'conf_10',
    wordA: 'rob',
    wordB: 'steal',
    meaningA_cs: 'oloupit (osobu/místo)',
    meaningB_cs: 'ukrást (věc)',
    explanationCs:
      'Rob = oloupit osobu nebo místo (rob a bank). Steal = ukrást konkrétní věc (steal money). Česky obojí „krást/loupit".',
    exampleA: 'Two men robbed the bank yesterday.',
    exampleB: 'Someone stole my bicycle.',
    level: 'B1',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'Somebody ___ my wallet on the bus.',
        answer: 'stole',
        wrongOption: 'robbed',
      },
      {
        sentence: 'The masked men ___ the jewellery shop.',
        answer: 'robbed',
        wrongOption: 'stole',
      },
    ],
  },

  {
    id: 'conf_11',
    wordA: 'hope',
    wordB: 'wish',
    meaningA_cs: 'doufat (reálná možnost)',
    meaningB_cs: 'přát si (nereálné/minulost)',
    explanationCs:
      'Hope = doufat v něco reálného (I hope it\'s sunny). Wish = přát si něco nereálného nebo litovat (I wish I were taller). Česky obojí „doufat/přát si".',
    exampleA: 'I hope you pass the exam.',
    exampleB: 'I wish I could fly.',
    level: 'B1',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'I ___ I had more free time, but I\'m always busy.',
        answer: 'wish',
        wrongOption: 'hope',
      },
      {
        sentence: 'I ___ the weather will be nice for our picnic.',
        answer: 'hope',
        wrongOption: 'wish',
      },
      {
        sentence: 'She ___ she hadn\'t said those hurtful words.',
        answer: 'wished',
        wrongOption: 'hoped',
      },
    ],
  },

  {
    id: 'conf_12',
    wordA: 'trip',
    wordB: 'travel',
    meaningA_cs: 'výlet, cesta (konkrétní)',
    meaningB_cs: 'cestování (obecně)',
    explanationCs:
      'Trip = konkrétní cesta/výlet (a business trip). Travel = cestování obecně, nepočitatelné (travel broadens the mind). Journey = delší cesta z bodu A do bodu B.',
    exampleA: 'We went on a school trip to London.',
    exampleB: 'She loves to travel around the world.',
    level: 'A2',
    category: 'similar_meaning',
    exercises: [
      {
        sentence: 'How was your ___ to Paris?',
        answer: 'trip',
        wrongOption: 'travel',
      },
      {
        sentence: 'I enjoy ___ by train.',
        answer: 'travelling',
        wrongOption: 'tripping',
      },
      {
        sentence: 'It was a long ___ from Prague to Madrid.',
        answer: 'journey',
        wrongOption: 'travel',
      },
    ],
  },

  // ── SIMILAR FORM (8) ──────────────────────────────────────────────────

  {
    id: 'conf_13',
    wordA: 'beside',
    wordB: 'besides',
    meaningA_cs: 'vedle, u',
    meaningB_cs: 'kromě, navíc',
    explanationCs:
      'Beside = vedle (místně). Besides = kromě toho, navíc. Jedno písmeno „s" mění celý význam.',
    exampleA: 'Come and sit beside me.',
    exampleB: 'Besides English, she also speaks German.',
    level: 'B1',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'The hotel is right ___ the beach.',
        answer: 'beside',
        wrongOption: 'besides',
      },
      {
        sentence: '___ being a teacher, he is also a writer.',
        answer: 'Besides',
        wrongOption: 'Beside',
      },
    ],
  },

  {
    id: 'conf_14',
    wordA: 'accept',
    wordB: 'except',
    meaningA_cs: 'přijmout',
    meaningB_cs: 'kromě',
    explanationCs:
      'Accept = přijmout (nabídku, pozvání). Except = kromě, s výjimkou. Znějí podobně, ale mají zcela odlišný význam.',
    exampleA: 'She accepted the job offer.',
    exampleB: 'Everyone came except Tom.',
    level: 'B1',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'I\'d like to ___ your invitation to dinner.',
        answer: 'accept',
        wrongOption: 'except',
      },
      {
        sentence: 'All students passed the test ___ one.',
        answer: 'except',
        wrongOption: 'accept',
      },
      {
        sentence: 'The shop is open every day ___ Sunday.',
        answer: 'except',
        wrongOption: 'accept',
      },
    ],
  },

  {
    id: 'conf_15',
    wordA: 'affect',
    wordB: 'effect',
    meaningA_cs: 'ovlivnit (sloveso)',
    meaningB_cs: 'účinek, efekt (podstatné jméno)',
    explanationCs:
      'Affect = sloveso, ovlivnit. Effect = podstatné jméno, účinek/následek. Česky: ovlivnit × účinek.',
    exampleA: 'The weather can affect your mood.',
    exampleB: 'The medicine had a positive effect.',
    level: 'B1',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'Smoking can seriously ___ your health.',
        answer: 'affect',
        wrongOption: 'effect',
      },
      {
        sentence: 'The new law will have a big ___ on small businesses.',
        answer: 'effect',
        wrongOption: 'affect',
      },
      {
        sentence: 'How did the news ___ her?',
        answer: 'affect',
        wrongOption: 'effect',
      },
    ],
  },

  {
    id: 'conf_16',
    wordA: 'advice',
    wordB: 'advise',
    meaningA_cs: 'rada (podstatné jméno)',
    meaningB_cs: 'radit (sloveso)',
    explanationCs:
      'Advice (s „c") = podstatné jméno, rada. Advise (s „s") = sloveso, radit. Česky: rada × radit.',
    exampleA: 'She gave me some good advice.',
    exampleB: 'I would advise you to study harder.',
    level: 'B1',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'Can you give me some ___ about my CV?',
        answer: 'advice',
        wrongOption: 'advise',
      },
      {
        sentence: 'I would ___ you to see a doctor.',
        answer: 'advise',
        wrongOption: 'advice',
      },
      {
        sentence: 'That was very useful ___.',
        answer: 'advice',
        wrongOption: 'advise',
      },
    ],
  },

  {
    id: 'conf_17',
    wordA: 'lay',
    wordB: 'lie',
    meaningA_cs: 'položit (něco)',
    meaningB_cs: 'ležet, lehnout si',
    explanationCs:
      'Lay = položit něco (lay the book on the table) — potřebuje předmět. Lie = ležet (lie on the bed) — bez předmětu. Pozor: minulý čas lie = lay!',
    exampleA: 'Lay the books on the table, please.',
    exampleB: 'I like to lie on the grass and look at the sky.',
    level: 'B1',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'She ___ down on the sofa and fell asleep.',
        answer: 'lay',
        wrongOption: 'laid',
      },
      {
        sentence: 'Could you ___ the plates on the table?',
        answer: 'lay',
        wrongOption: 'lie',
      },
      {
        sentence: 'I usually ___ in bed until 9 on Sundays.',
        answer: 'lie',
        wrongOption: 'lay',
      },
    ],
  },

  {
    id: 'conf_18',
    wordA: 'raise',
    wordB: 'rise',
    meaningA_cs: 'zvednout (něco), zvýšit',
    meaningB_cs: 'stoupat, vstávat (samo)',
    explanationCs:
      'Raise = zvednout něco (raise your hand) — potřebuje předmět. Rise = stoupat samo (the sun rises) — bez předmětu. Česky: zvednout × stoupat.',
    exampleA: 'Please raise your hand if you have a question.',
    exampleB: 'The sun rises in the east.',
    level: 'B1',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'They decided to ___ the price of tickets.',
        answer: 'raise',
        wrongOption: 'rise',
      },
      {
        sentence: 'Temperatures will ___ tomorrow.',
        answer: 'rise',
        wrongOption: 'raise',
      },
      {
        sentence: '___ your hand if you know the answer.',
        answer: 'Raise',
        wrongOption: 'Rise',
      },
    ],
  },

  {
    id: 'conf_19',
    wordA: 'who',
    wordB: 'which',
    meaningA_cs: 'kdo, který (pro osoby)',
    meaningB_cs: 'který (pro věci/zvířata)',
    explanationCs:
      'Who = pro osoby. Which = pro věci a zvířata. That = pro obojí (méně formální). Česky je „který" univerzální.',
    exampleA: 'The man who lives next door is a teacher.',
    exampleB: 'The book which I bought was really good.',
    level: 'A2',
    category: 'similar_form',
    exercises: [
      {
        sentence: 'She is the girl ___ won the competition.',
        answer: 'who',
        wrongOption: 'which',
      },
      {
        sentence: 'This is the car ___ I want to buy.',
        answer: 'which',
        wrongOption: 'who',
      },
      {
        sentence: 'The teacher ___ taught us last year has retired.',
        answer: 'who',
        wrongOption: 'which',
      },
    ],
  },

  {
    id: 'conf_20',
    wordA: 'its',
    wordB: "it's",
    meaningA_cs: 'jeho (přivlastňovací)',
    meaningB_cs: 'to je / ono je (stažený tvar)',
    explanationCs:
      'Its = přivlastňovací zájmeno (its colour). It\'s = zkrácené it is / it has. Česky: jeho × to je.',
    exampleA: 'The dog wagged its tail.',
    exampleB: "It's raining outside.",
    level: 'A2',
    category: 'similar_form',
    exercises: [
      {
        sentence: '___ a beautiful day today.',
        answer: "It's",
        wrongOption: 'Its',
      },
      {
        sentence: 'The cat cleaned ___ paws.',
        answer: 'its',
        wrongOption: "it's",
      },
      {
        sentence: '___ been a long time since we met.',
        answer: "It's",
        wrongOption: 'Its',
      },
    ],
  },

  // ── FALSE FRIENDS (12) ────────────────────────────────────────────────

  {
    id: 'conf_21',
    wordA: 'actually',
    wordB: 'currently',
    meaningA_cs: 've skutečnosti, vlastně',
    meaningB_cs: 'v současnosti, aktuálně',
    explanationCs:
      'Actually = ve skutečnosti (NE aktuálně!). Currently = v současné době. Čeští studenti říkají „actually" místo „currently" podle českého „aktuálně".',
    exampleA: 'Actually, I don\'t agree with you.',
    exampleB: 'She is currently working on a new project.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'I ___ live in Brno, but I\'m planning to move.',
        answer: 'currently',
        wrongOption: 'actually',
      },
      {
        sentence: 'He looks young, but he\'s ___ 45 years old.',
        answer: 'actually',
        wrongOption: 'currently',
      },
      {
        sentence: 'The shop is ___ closed for renovation.',
        answer: 'currently',
        wrongOption: 'actually',
      },
    ],
  },

  {
    id: 'conf_22',
    wordA: 'eventually',
    wordB: 'possibly',
    meaningA_cs: 'nakonec, nakonec přece jen',
    meaningB_cs: 'možná, eventuálně',
    explanationCs:
      'Eventually = nakonec, po nějaké době (NE eventuálně!). Possibly = možná. Český „eventuálně" ≠ anglické „eventually".',
    exampleA: 'He eventually found his keys under the sofa.',
    exampleB: 'Could you possibly help me with this?',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'After many attempts, she ___ passed the exam.',
        answer: 'eventually',
        wrongOption: 'possibly',
      },
      {
        sentence: 'We could ___ go to the cinema tomorrow.',
        answer: 'possibly',
        wrongOption: 'eventually',
      },
    ],
  },

  {
    id: 'conf_23',
    wordA: 'sympathetic',
    wordB: 'likeable',
    meaningA_cs: 'soucitný, chápavý',
    meaningB_cs: 'sympatický, milý',
    explanationCs:
      'Sympathetic = soucitný, chápavý (NE sympatický!). Český „sympatický" = likeable, nice, pleasant. Jeden z nejčastějších false friends.',
    exampleA: 'She was very sympathetic when I told her my problems.',
    exampleB: 'He\'s a very likeable person — everyone enjoys his company.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'The teacher was ___ and listened to all my worries.',
        answer: 'sympathetic',
        wrongOption: 'likeable',
      },
      {
        sentence: 'Tom is a really ___ guy — you\'ll like him immediately.',
        answer: 'likeable',
        wrongOption: 'sympathetic',
      },
      {
        sentence: 'Nobody was ___ towards her after the accident.',
        answer: 'sympathetic',
        wrongOption: 'likeable',
      },
    ],
  },

  {
    id: 'conf_24',
    wordA: 'chef',
    wordB: 'boss',
    meaningA_cs: 'šéfkuchař',
    meaningB_cs: 'šéf, vedoucí',
    explanationCs:
      'Chef = šéfkuchař (NE šéf!). Český „šéf" = boss, manager. Chef je jen v kuchyni.',
    exampleA: 'The chef prepared a wonderful dinner.',
    exampleB: 'I need to ask my boss for a day off.',
    level: 'A2',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'My ___ said I could leave work early today.',
        answer: 'boss',
        wrongOption: 'chef',
      },
      {
        sentence: 'The ___ at this restaurant is from Italy.',
        answer: 'chef',
        wrongOption: 'boss',
      },
      {
        sentence: 'She works as a ___ in a five-star hotel kitchen.',
        answer: 'chef',
        wrongOption: 'boss',
      },
    ],
  },

  {
    id: 'conf_25',
    wordA: 'gymnasium',
    wordB: 'grammar school',
    meaningA_cs: 'tělocvična',
    meaningB_cs: 'gymnázium',
    explanationCs:
      'Gymnasium = tělocvična (NE gymnázium!). České „gymnázium" = grammar school. V americké angličtině se tělocvičně říká „gym".',
    exampleA: 'The students are playing basketball in the gymnasium.',
    exampleB: 'He studied at a grammar school in Prague.',
    level: 'A2',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'We have PE lessons in the ___.',
        answer: 'gymnasium',
        wrongOption: 'grammar school',
      },
      {
        sentence: 'After primary school, she went to a ___.',
        answer: 'grammar school',
        wrongOption: 'gymnasium',
      },
    ],
  },

  {
    id: 'conf_26',
    wordA: 'fabric',
    wordB: 'factory',
    meaningA_cs: 'látka, textilie',
    meaningB_cs: 'továrna',
    explanationCs:
      'Fabric = látka, textilie (NE fabrika!). Český „fabrika" = factory. Typický false friend.',
    exampleA: 'This dress is made from a beautiful fabric.',
    exampleB: 'He works in a car factory.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'The ___ produces over a thousand cars a day.',
        answer: 'factory',
        wrongOption: 'fabric',
      },
      {
        sentence: 'I bought some cotton ___ to make curtains.',
        answer: 'fabric',
        wrongOption: 'factory',
      },
    ],
  },

  {
    id: 'conf_27',
    wordA: 'magazine',
    wordB: 'warehouse',
    meaningA_cs: 'časopis',
    meaningB_cs: 'sklad, skladiště',
    explanationCs:
      'Magazine = časopis (NE magazín ve smyslu sklad!). Český „magazín" (sklad) = warehouse. V češtině se „magazín" používá i pro časopis, ale pozor na kontext.',
    exampleA: 'She reads fashion magazines every month.',
    exampleB: 'The goods are stored in a large warehouse.',
    level: 'A2',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'I read an interesting article in a ___.',
        answer: 'magazine',
        wrongOption: 'warehouse',
      },
      {
        sentence: 'All the products are kept in the ___ before shipping.',
        answer: 'warehouse',
        wrongOption: 'magazine',
      },
    ],
  },

  {
    id: 'conf_28',
    wordA: 'prospect',
    wordB: 'brochure',
    meaningA_cs: 'vyhlídka, perspektiva',
    meaningB_cs: 'brožura, prospekt',
    explanationCs:
      'Prospect = vyhlídka, perspektiva (NE prospekt!). Český „prospekt" (leták) = brochure, leaflet.',
    exampleA: 'The prospect of a promotion motivated her.',
    exampleB: 'Pick up a brochure about the hotel at reception.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'There\'s a good ___ of finding a job in this field.',
        answer: 'prospect',
        wrongOption: 'brochure',
      },
      {
        sentence: 'I picked up a ___ about holiday destinations at the travel agency.',
        answer: 'brochure',
        wrongOption: 'prospect',
      },
    ],
  },

  {
    id: 'conf_29',
    wordA: 'preservative',
    wordB: 'condom',
    meaningA_cs: 'konzervant (v jídle)',
    meaningB_cs: 'prezervativ',
    explanationCs:
      'Preservative = konzervant v potravinách (NE prezervativ!). Český „prezervativ" = condom. Velmi trapný false friend!',
    exampleA: 'This juice contains no artificial preservatives.',
    exampleB: 'Condoms are available at any pharmacy.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'This food is free from artificial ___.',
        answer: 'preservatives',
        wrongOption: 'condoms',
      },
      {
        sentence: 'I prefer organic food without any ___.',
        answer: 'preservatives',
        wrongOption: 'condoms',
      },
    ],
  },

  {
    id: 'conf_30',
    wordA: 'concurrence',
    wordB: 'competition',
    meaningA_cs: 'shoda, souběh',
    meaningB_cs: 'konkurence, soutěž',
    explanationCs:
      'Concurrence = shoda, souběh událostí (NE konkurence!). Český „konkurence" = competition. V obchodním kontextu také „competitors".',
    exampleA: 'The concurrence of these events was surprising.',
    exampleB: 'There is a lot of competition in this market.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'Our company faces strong ___ from abroad.',
        answer: 'competition',
        wrongOption: 'concurrence',
      },
      {
        sentence: 'The ___ of the two holidays made planning difficult.',
        answer: 'concurrence',
        wrongOption: 'competition',
      },
    ],
  },

  {
    id: 'conf_31',
    wordA: 'receipt',
    wordB: 'recipe',
    meaningA_cs: 'účtenka, stvrzenka',
    meaningB_cs: 'recept (kuchařský)',
    explanationCs:
      'Receipt = účtenka (NE recept!). Český „recept" (kuchařský) = recipe. Lékařský recept = prescription.',
    exampleA: 'Keep the receipt in case you want to return it.',
    exampleB: 'Can you give me the recipe for this cake?',
    level: 'A2',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'I found a great ___ for chocolate brownies online.',
        answer: 'recipe',
        wrongOption: 'receipt',
      },
      {
        sentence: 'You\'ll need the ___ if you want a refund.',
        answer: 'receipt',
        wrongOption: 'recipe',
      },
      {
        sentence: 'My grandmother\'s ___ for apple pie is the best.',
        answer: 'recipe',
        wrongOption: 'receipt',
      },
    ],
  },

  {
    id: 'conf_32',
    wordA: 'billion',
    wordB: 'trillion',
    meaningA_cs: 'miliarda (10⁹)',
    meaningB_cs: 'bilion (10¹²)',
    explanationCs:
      'Anglické billion = miliarda (NE bilion!). Český „bilion" = anglické trillion. Často matoucí při čtení zpráv.',
    exampleA: 'The company is worth 5 billion dollars.',
    exampleB: 'The national debt has reached 2 trillion dollars.',
    level: 'B1',
    category: 'false_friend',
    exercises: [
      {
        sentence: 'The world population is about 8 ___.',
        answer: 'billion',
        wrongOption: 'trillion',
      },
      {
        sentence: 'The country\'s GDP is over 20 ___ dollars.',
        answer: 'trillion',
        wrongOption: 'billion',
      },
    ],
  },

  // ── CZECH INTERFERENCE (8) ────────────────────────────────────────────

  {
    id: 'conf_33',
    wordA: 'fun',
    wordB: 'funny',
    meaningA_cs: 'zábava, zábavný',
    meaningB_cs: 'vtipný, směšný',
    explanationCs:
      'Fun = zábava, zábavný (it was fun). Funny = vtipný, legrační (a funny joke). Čeští studenti je často zaměňují, protože česky je obojí „zábavný/vtipný".',
    exampleA: 'The party was really fun.',
    exampleB: 'He told a really funny joke.',
    level: 'A2',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'The film was so ___ that I laughed the whole time.',
        answer: 'funny',
        wrongOption: 'fun',
      },
      {
        sentence: 'We had a lot of ___ at the beach yesterday.',
        answer: 'fun',
        wrongOption: 'funny',
      },
      {
        sentence: 'It\'s not ___ to make fun of people.',
        answer: 'funny',
        wrongOption: 'fun',
      },
    ],
  },

  {
    id: 'conf_34',
    wordA: 'know',
    wordB: 'can',
    meaningA_cs: 'znát, vědět',
    meaningB_cs: 'umět, moci',
    explanationCs:
      'V češtině říkáme „umím anglicky", ale anglicky se říká „I can speak English" nebo „I know English" — NE „I know to speak". Čeští studenti často používají „know" místo „can".',
    exampleA: 'I know the answer to this question.',
    exampleB: 'She can swim very well.',
    level: 'A1',
    category: 'czech_interference',
    exercises: [
      {
        sentence: '___ you play the piano?',
        answer: 'Can',
        wrongOption: 'Do you know',
      },
      {
        sentence: 'I ___ speak three languages.',
        answer: 'can',
        wrongOption: 'know to',
      },
      {
        sentence: 'Do you ___ where the station is?',
        answer: 'know',
        wrongOption: 'can',
      },
    ],
  },

  {
    id: 'conf_35',
    wordA: 'other',
    wordB: 'another',
    meaningA_cs: 'jiný, ostatní',
    meaningB_cs: 'další, jiný (jeden)',
    explanationCs:
      'Other = jiný/ostatní (množné: other people). Another = ještě jeden, an + other (another cup of tea). Česky obojí „jiný/další".',
    exampleA: 'The other students are in the library.',
    exampleB: 'Would you like another cup of coffee?',
    level: 'A2',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'Can I have ___ piece of cake, please?',
        answer: 'another',
        wrongOption: 'other',
      },
      {
        sentence: 'Some people like tea, ___ people prefer coffee.',
        answer: 'other',
        wrongOption: 'another',
      },
      {
        sentence: 'I don\'t like this one. Show me the ___ one.',
        answer: 'other',
        wrongOption: 'another',
      },
    ],
  },

  {
    id: 'conf_36',
    wordA: 'since',
    wordB: 'for',
    meaningA_cs: 'od (konkrétní čas)',
    meaningB_cs: 'po dobu (délka času)',
    explanationCs:
      'Since = od konkrétního bodu v čase (since 2020). For = po dobu (for three years). Čeští studenti to zaměňují, protože česky se časový bod i trvání někdy řekne stejně.',
    exampleA: 'I have lived here since 2015.',
    exampleB: 'I have lived here for ten years.',
    level: 'A2',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'She has worked there ___ five years.',
        answer: 'for',
        wrongOption: 'since',
      },
      {
        sentence: 'He has been ill ___ Monday.',
        answer: 'since',
        wrongOption: 'for',
      },
      {
        sentence: 'We have known each other ___ childhood.',
        answer: 'since',
        wrongOption: 'for',
      },
    ],
  },

  {
    id: 'conf_37',
    wordA: 'used to',
    wordB: 'be used to',
    meaningA_cs: 'dříve jsem (zvyk v minulosti)',
    meaningB_cs: 'být zvyklý na',
    explanationCs:
      'Used to = dříve jsem dělával (I used to smoke). Be used to = být zvyklý na (I\'m used to getting up early). Čeští studenti to zaměňují kvůli slovu „zvyklý".',
    exampleA: 'I used to play football when I was young.',
    exampleB: 'She is used to working long hours.',
    level: 'B1',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'He ___ live in London, but now he lives in Prague.',
        answer: 'used to',
        wrongOption: 'is used to',
      },
      {
        sentence: 'I\'m ___ waking up early — I\'ve done it for years.',
        answer: 'used to',
        wrongOption: 'used to be',
      },
      {
        sentence: 'She ___ have long hair, but she cut it last year.',
        answer: 'used to',
        wrongOption: 'is used to',
      },
    ],
  },

  {
    id: 'conf_38',
    wordA: 'so',
    wordB: 'such',
    meaningA_cs: 'tak (+ přídavné jméno)',
    meaningB_cs: 'tak, takový (+ podstatné jméno)',
    explanationCs:
      'So + adjective (so beautiful). Such + a/an + noun (such a beautiful day). Česky obojí „tak/takový", ale anglická gramatika rozlišuje.',
    exampleA: 'The movie was so boring.',
    exampleB: 'It was such a boring movie.',
    level: 'A2',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'She is ___ a nice person!',
        answer: 'such',
        wrongOption: 'so',
      },
      {
        sentence: 'The test was ___ difficult that nobody passed.',
        answer: 'so',
        wrongOption: 'such',
      },
      {
        sentence: 'It was ___ a long journey that we all fell asleep.',
        answer: 'such',
        wrongOption: 'so',
      },
    ],
  },

  {
    id: 'conf_39',
    wordA: 'too',
    wordB: 'enough',
    meaningA_cs: 'příliš (negativní)',
    meaningB_cs: 'dost, dostatečně',
    explanationCs:
      'Too = příliš (too hot = příliš horké). Enough = dostatečně (warm enough = dostatečně teplé). Pozor na pozici: too + adj, ale adj + enough.',
    exampleA: 'This coffee is too hot to drink.',
    exampleB: 'Is the soup warm enough?',
    level: 'A2',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'This bag is ___ heavy — I can\'t carry it.',
        answer: 'too',
        wrongOption: 'enough',
      },
      {
        sentence: 'Are you old ___ to drive a car?',
        answer: 'enough',
        wrongOption: 'too',
      },
      {
        sentence: 'The room isn\'t big ___ for all of us.',
        answer: 'enough',
        wrongOption: 'too',
      },
    ],
  },

  {
    id: 'conf_40',
    wordA: 'still',
    wordB: 'yet',
    meaningA_cs: 'stále, ještě (kladné věty)',
    meaningB_cs: 'ještě (záporné věty a otázky)',
    explanationCs:
      'Still = stále, pořád (v kladných větách, uprostřed). Yet = ještě (v záporných větách a otázkách, na konci). Česky obojí „ještě/stále".',
    exampleA: 'She still lives with her parents.',
    exampleB: 'He hasn\'t finished yet.',
    level: 'A2',
    category: 'czech_interference',
    exercises: [
      {
        sentence: 'Have you done your homework ___?',
        answer: 'yet',
        wrongOption: 'still',
      },
      {
        sentence: 'He is ___ sleeping — don\'t wake him up.',
        answer: 'still',
        wrongOption: 'yet',
      },
      {
        sentence: 'I haven\'t received the package ___.',
        answer: 'yet',
        wrongOption: 'still',
      },
    ],
  },
];
