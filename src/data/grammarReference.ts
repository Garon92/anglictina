import type { GrammarTopic } from '../types';

export const GRAMMAR_REFERENCE: GrammarTopic[] = [
  // ─── 1. Present Simple (A1) ──────────────────────────────────────────
  {
    id: 'present_simple',
    titleCs: 'Přítomný čas prostý',
    titleEn: 'Present Simple',
    level: 'A1',
    explanationCs:
      'Přítomný čas prostý (Present Simple) je jeden z nejzákladnějších časů v angličtině. ' +
      'Používá se pro vyjádření pravidelných, opakujících se činností, zvyků, obecných pravd a faktů. ' +
      'Například: „I go to school every day" (Chodím do školy každý den) nebo „Water boils at 100 degrees" ' +
      '(Voda se vaří při 100 stupních).\n\n' +
      'Tvoření kladné věty je jednoduché: podmět + základní tvar slovesa. Pozor ale na 3. osobu jednotného čísla ' +
      '(he, she, it), kde přidáváme koncovku -s nebo -es. Například: „He plays football" (On hraje fotbal), ' +
      '„She watches TV" (Ona se dívá na televizi).\n\n' +
      'Pro záporné věty používáme pomocné sloveso do/does + not + základní tvar slovesa: ' +
      '„I do not (don\'t) like spiders" nebo „She does not (doesn\'t) eat meat". ' +
      'V otázkách se pomocné sloveso staví před podmět: „Do you speak English?" nebo „Does he live in Prague?".\n\n' +
      'Signální slova pro Present Simple zahrnují: always, usually, often, sometimes, never, every day/week/year.',
    examples: [
      { en: 'I go to school every day.', cs: 'Chodím do školy každý den.' },
      { en: 'She speaks three languages.', cs: 'Ona mluví třemi jazyky.' },
      { en: 'We don\'t eat meat.', cs: 'My nejíme maso.' },
      { en: 'Does he play the guitar?', cs: 'Hraje na kytaru?' },
      { en: 'The sun rises in the east.', cs: 'Slunce vychází na východě.' },
      { en: 'They usually get up at seven.', cs: 'Obvykle vstávají v sedm.' },
    ],
    keyRules: [
      'Ve 3. osobě jednotného čísla (he/she/it) přidáváme k slovesu -s nebo -es.',
      'Zápor tvoříme pomocí do not (don\'t) / does not (doesn\'t) + základní tvar slovesa.',
      'Otázku tvoříme pomocí Do/Does + podmět + základní tvar slovesa.',
      'Používáme pro opakující se činnosti, zvyky a obecné pravdy.',
      'Signální slova: always, usually, often, sometimes, never, every day.',
    ],
  },

  // ─── 2. Present Continuous (A1) ──────────────────────────────────────
  {
    id: 'present_continuous',
    titleCs: 'Přítomný čas průběhový',
    titleEn: 'Present Continuous',
    level: 'A1',
    explanationCs:
      'Přítomný čas průběhový (Present Continuous) se používá pro děje, které probíhají právě teď, ' +
      'v okamžiku mluvení. Například: „I am reading a book" (Právě čtu knihu). Také se používá pro ' +
      'dočasné situace a pro plánované činnosti v blízké budoucnosti.\n\n' +
      'Tvoří se pomocí: podmět + am/is/are + sloveso s koncovkou -ing. Například: „She is cooking dinner" ' +
      '(Ona právě vaří večeři), „They are playing outside" (Oni si právě hrají venku).\n\n' +
      'Zápor tvoříme přidáním not za am/is/are: „I am not sleeping", „He is not (isn\'t) working". ' +
      'Otázku tvoříme přehozením podmětu a am/is/are: „Are you listening?", „Is she coming?".\n\n' +
      'Pozor: některá slovesa se v průběhovém čase nepoužívají (tzv. stative verbs), např. know, like, ' +
      'want, need, believe, understand. Neříkáme „I am knowing" ale „I know".\n\n' +
      'Signální slova: now, right now, at the moment, currently, today, this week.',
    examples: [
      { en: 'I am studying English right now.', cs: 'Právě teď studuji angličtinu.' },
      { en: 'She is talking on the phone.', cs: 'Ona právě mluví po telefonu.' },
      { en: 'They are not watching TV.', cs: 'Oni se právě nedívají na televizi.' },
      { en: 'Are you coming to the party?', cs: 'Přijdeš na párty?' },
      { en: 'He is working in London this month.', cs: 'Tento měsíc pracuje v Londýně.' },
      { en: 'We are having lunch at the moment.', cs: 'Právě teď obědváme.' },
    ],
    keyRules: [
      'Tvoříme: podmět + am/is/are + sloveso-ing.',
      'Používáme pro děje probíhající právě teď nebo dočasné situace.',
      'Stavová slovesa (know, like, want, need) se v průběhovém čase nepoužívají.',
      'Signální slova: now, right now, at the moment, currently.',
      'Lze použít i pro plánované činnosti v blízké budoucnosti (I am meeting her tomorrow).',
    ],
  },

  // ─── 3. Past Simple (A1) ────────────────────────────────────────────
  {
    id: 'past_simple',
    titleCs: 'Minulý čas prostý',
    titleEn: 'Past Simple',
    level: 'A1',
    explanationCs:
      'Minulý čas prostý (Past Simple) se používá pro děje, které se odehrály v minulosti a jsou již ukončené. ' +
      'Často je doprovázen časovým určením, které říká, kdy se děj stal, např. yesterday, last week, in 2020, ' +
      'two days ago.\n\n' +
      'U pravidelných sloves tvoříme minulý čas přidáním koncovky -ed k základnímu tvaru: work → worked, ' +
      'play → played, study → studied. U nepravidelných sloves musíme znát jejich tvary zpaměti: go → went, ' +
      'see → saw, eat → ate, have → had.\n\n' +
      'Zápor tvoříme pomocí did not (didn\'t) + základní tvar slovesa: „I didn\'t go to school yesterday". ' +
      'Otázku tvoříme pomocí Did + podmět + základní tvar: „Did you see the film?". Pozor: po did/didn\'t ' +
      'vždy následuje základní tvar slovesa, nikoli minulý.\n\n' +
      'Sloveso „to be" má v minulém čase speciální tvary: I/he/she/it was, you/we/they were.',
    examples: [
      { en: 'I visited my grandparents last weekend.', cs: 'Minulý víkend jsem navštívil prarodiče.' },
      { en: 'She didn\'t go to the party.', cs: 'Nešla na párty.' },
      { en: 'Did you watch the match yesterday?', cs: 'Díval ses včera na ten zápas?' },
      { en: 'We went to Prague two weeks ago.', cs: 'Před dvěma týdny jsme jeli do Prahy.' },
      { en: 'He was tired after the exam.', cs: 'Po zkoušce byl unavený.' },
      { en: 'They bought a new car last month.', cs: 'Minulý měsíc si koupili nové auto.' },
    ],
    keyRules: [
      'Pravidelná slovesa: přidáváme -ed (worked, played, studied).',
      'Nepravidelná slovesa mají vlastní tvary, které je nutné se naučit (go → went, see → saw).',
      'Zápor: did not (didn\'t) + základní tvar slovesa.',
      'Otázka: Did + podmět + základní tvar slovesa?',
      'Sloveso be: I/he/she/it was, you/we/they were.',
    ],
  },

  // ─── 4. Past Continuous (A2) ─────────────────────────────────────────
  {
    id: 'past_continuous',
    titleCs: 'Minulý čas průběhový',
    titleEn: 'Past Continuous',
    level: 'A2',
    explanationCs:
      'Minulý čas průběhový (Past Continuous) popisuje děj, který probíhal v určitém okamžiku v minulosti. ' +
      'Často se používá v kombinaci s Past Simple, kdy průběhový děj byl přerušen jednorázovou událostí: ' +
      '„I was watching TV when the phone rang" (Díval jsem se na televizi, když zazvonil telefon).\n\n' +
      'Tvoří se pomocí: podmět + was/were + sloveso s koncovkou -ing. Například: „She was reading a book" ' +
      '(Četla knihu), „They were playing football" (Hráli fotbal).\n\n' +
      'Zápor: podmět + was/were + not + sloveso-ing: „He was not (wasn\'t) sleeping". ' +
      'Otázka: Was/Were + podmět + sloveso-ing: „Were you studying at eight o\'clock?".\n\n' +
      'Past Continuous se také používá pro popis pozadí příběhu nebo situace: „The sun was shining and the ' +
      'birds were singing" (Slunce svítilo a ptáci zpívali). Spojky „when" a „while" se často používají ' +
      'společně s tímto časem.',
    examples: [
      { en: 'I was sleeping when you called.', cs: 'Spal jsem, když jsi zavolal.' },
      { en: 'She was cooking dinner at six.', cs: 'V šest hodin vařila večeři.' },
      { en: 'Were they playing outside?', cs: 'Hráli si venku?' },
      { en: 'He wasn\'t listening to the teacher.', cs: 'Neposlouchal učitele.' },
      { en: 'While I was reading, my brother was watching TV.', cs: 'Zatímco jsem četl, můj bratr se díval na televizi.' },
      { en: 'It was raining all morning.', cs: 'Celé dopoledne pršelo.' },
    ],
    keyRules: [
      'Tvoříme: podmět + was/were + sloveso-ing.',
      'Používáme pro děj probíhající v určitém okamžiku v minulosti.',
      'Často se kombinuje s Past Simple: průběhový děj přerušený jednorázovou událostí.',
      'Spojky when a while jsou typickými signálními slovy.',
    ],
  },

  // ─── 5. Present Perfect (A2) ─────────────────────────────────────────
  {
    id: 'present_perfect',
    titleCs: 'Předpřítomný čas',
    titleEn: 'Present Perfect',
    level: 'A2',
    explanationCs:
      'Předpřítomný čas (Present Perfect) propojuje minulost s přítomností. Používá se, když mluvíme ' +
      'o zkušenostech bez přesného časového určení, o dějích, které začaly v minulosti a stále trvají, ' +
      'nebo o nedávných událostech s dopadem na přítomnost.\n\n' +
      'Tvoří se pomocí: podmět + have/has + příčestí minulé (past participle). U pravidelných sloves je ' +
      'příčestí stejné jako minulý čas (worked, played), u nepravidelných se jedná o třetí tvar (gone, seen, eaten).\n\n' +
      'Zápor: podmět + have/has + not + příčestí: „I haven\'t seen this film". ' +
      'Otázka: Have/Has + podmět + příčestí: „Have you ever been to London?".\n\n' +
      'Typická signální slova: ever, never, already, yet, just, since, for, so far, recently. ' +
      'Důležité: „since" používáme s konkrétním bodem v čase (since 2020, since Monday), „for" používáme ' +
      's dobou trvání (for two years, for a long time).\n\n' +
      'Rozdíl oproti Past Simple: Past Simple říká, co se stalo v konkrétním čase v minulosti. ' +
      'Present Perfect říká, co se stalo bez uvedení konkrétního času, nebo co trvá od minulosti do teď.',
    examples: [
      { en: 'I have visited Paris twice.', cs: 'Navštívil jsem Paříž dvakrát.' },
      { en: 'She has just finished her homework.', cs: 'Právě dodělala domácí úkol.' },
      { en: 'Have you ever eaten sushi?', cs: 'Jedl jsi někdy sushi?' },
      { en: 'They haven\'t arrived yet.', cs: 'Ještě nedorazili.' },
      { en: 'He has lived here since 2018.', cs: 'Žije tady od roku 2018.' },
      { en: 'We have known each other for five years.', cs: 'Známe se pět let.' },
      { en: 'I have already read this book.', cs: 'Tuto knihu jsem již četl.' },
    ],
    keyRules: [
      'Tvoříme: podmět + have/has + příčestí minulé (3. tvar slovesa).',
      'Používáme pro zkušenosti, nedávné události nebo děje trvající od minulosti do přítomnosti.',
      'Since = od konkrétního bodu v čase; For = po dobu trvání.',
      'Nepoužíváme s konkrétním časovým určením v minulosti (ne „I have seen it yesterday").',
      'Signální slova: ever, never, already, yet, just, since, for.',
    ],
  },

  // ─── 6. Future (A2) ──────────────────────────────────────────────────
  {
    id: 'future',
    titleCs: 'Budoucí čas (will / going to)',
    titleEn: 'Future (will / going to)',
    level: 'A2',
    explanationCs:
      'V angličtině existuje několik způsobů, jak vyjádřit budoucnost. Dva nejčastější jsou „will" a „going to".\n\n' +
      '„Will" používáme pro: spontánní rozhodnutí učiněná v okamžiku mluvení („I\'ll help you with that"), ' +
      'předpovědi založené na názoru („I think it will rain tomorrow"), sliby a nabídky („I will call you later").\n\n' +
      '„Going to" používáme pro: plány a záměry, o kterých jsme se již rozhodli („I\'m going to study medicine"), ' +
      'předpovědi založené na současných důkazech („Look at those clouds — it\'s going to rain").\n\n' +
      'Tvoření s will: podmět + will + základní tvar slovesa. Zápor: will not (won\'t). ' +
      'Otázka: Will + podmět + základní tvar?\n\n' +
      'Tvoření s going to: podmět + am/is/are + going to + základní tvar slovesa. ' +
      'Zápor: am/is/are + not + going to. Otázka: Am/Is/Are + podmět + going to + sloveso?\n\n' +
      'Pro budoucnost lze také použít Present Continuous (pro domluvené schůzky a plány): ' +
      '„I am meeting her at five" (Sejdu se s ní v pět).',
    examples: [
      { en: 'I will help you with your homework.', cs: 'Pomůžu ti s domácím úkolem.' },
      { en: 'She is going to travel to Spain next summer.', cs: 'Příští léto pojede do Španělska.' },
      { en: 'It won\'t be easy.', cs: 'Nebude to snadné.' },
      { en: 'Are you going to buy a new phone?', cs: 'Chystáš se koupit nový telefon?' },
      { en: 'I think he will pass the exam.', cs: 'Myslím, že tu zkoušku složí.' },
      { en: 'Look! The bus is going to leave!', cs: 'Podívej! Ten autobus odjíždí!' },
    ],
    keyRules: [
      'Will: spontánní rozhodnutí, předpovědi založené na názoru, sliby a nabídky.',
      'Going to: plány a záměry, předpovědi založené na důkazech.',
      'Will: podmět + will + základní tvar; zápor: won\'t.',
      'Going to: podmět + am/is/are + going to + základní tvar.',
    ],
  },

  // ─── 7. Modal Verbs (A2) ─────────────────────────────────────────────
  {
    id: 'modals',
    titleCs: 'Způsobová slovesa',
    titleEn: 'Modal Verbs',
    level: 'A2',
    explanationCs:
      'Způsobová (modální) slovesa jsou speciální pomocná slovesa, která vyjadřují schopnost, povinnost, ' +
      'možnost, povolení nebo radu. Mezi nejdůležitější patří: can, could, must, should, may, might.\n\n' +
      '„Can" vyjadřuje schopnost nebo povolení: „I can swim" (Umím plavat), „Can I go home?" (Můžu jít domů?). ' +
      '„Could" je minulý tvar od can nebo zdvořilejší žádost: „I could read at five" (Uměl jsem číst v pěti), ' +
      '„Could you help me?" (Mohl byste mi pomoci?).\n\n' +
      '„Must" vyjadřuje silnou povinnost: „You must wear a seatbelt" (Musíte mít zapnutý pás). ' +
      '„Should" vyjadřuje radu: „You should study more" (Měl bys víc studovat). ' +
      '„May/Might" vyjadřují možnost: „It may rain" (Možná bude pršet).\n\n' +
      'Po způsobových slovesech vždy následuje základní tvar slovesa (infinitiv bez to). ' +
      'Způsobová slovesa nemají koncovku -s ve 3. osobě: „She can dance" (nikoli „She cans dance"). ' +
      'Nemají tvar -ing ani příčestí.',
    examples: [
      { en: 'I can play the piano.', cs: 'Umím hrát na klavír.' },
      { en: 'You must not use your phone in class.', cs: 'V hodině nesmíš používat telefon.' },
      { en: 'She should see a doctor.', cs: 'Měla by jít k doktorovi.' },
      { en: 'Could you open the window, please?', cs: 'Mohl byste otevřít okno, prosím?' },
      { en: 'It might snow tomorrow.', cs: 'Zítra možná bude sněžit.' },
      { en: 'May I borrow your pen?', cs: 'Mohu si půjčit vaše pero?' },
      { en: 'You shouldn\'t eat so much sugar.', cs: 'Neměl bys jíst tolik cukru.' },
    ],
    keyRules: [
      'Po modálním slovesu vždy následuje základní tvar slovesa (bez to).',
      'Modální slovesa nemají koncovku -s ve 3. osobě (She can, nikoli She cans).',
      'Can = schopnost/povolení, Must = povinnost, Should = rada.',
      'May/Might = možnost nebo zdvořilá žádost.',
      'Zápor: can\'t, mustn\'t, shouldn\'t atd.',
    ],
  },

  // ─── 8. Articles (A1) ────────────────────────────────────────────────
  {
    id: 'articles',
    titleCs: 'Členy (a/an/the)',
    titleEn: 'Articles (a/an/the)',
    level: 'A1',
    explanationCs:
      'Angličtina má dva druhy členů: neurčitý (a/an) a určitý (the). Čeština členy nemá, proto je to ' +
      'pro české studenty jedna z nejtěžších oblastí.\n\n' +
      'Neurčitý člen „a" nebo „an" používáme, když mluvíme o něčem poprvé nebo o jednom z mnoha: „I have a dog" ' +
      '(Mám psa — jednoho, nespecifikovaného). „An" používáme před slovy začínajícími samohláskovou hláskou: ' +
      '„an apple", „an hour" (pozor: záleží na výslovnosti, ne na písmenu — „a university", ale „an umbrella").\n\n' +
      'Určitý člen „the" používáme, když je jasné, o čem mluvíme, nebo když už jsme danou věc zmínili: ' +
      '„I have a dog. The dog is brown" (Mám psa. Ten pes je hnědý). Také se používá pro unikátní věci: ' +
      '„the sun", „the moon", „the Czech Republic".\n\n' +
      'Člen nepoužíváme před: vlastními jmény (David, Prague), jazyky (English, Czech), jídly (breakfast, lunch), ' +
      'sporty (football, tennis) a obecnými nepočitatelnými podstatnými jmény (water, music, love).',
    examples: [
      { en: 'I need a new phone.', cs: 'Potřebuji nový telefon.' },
      { en: 'She is an excellent student.', cs: 'Je to výborná studentka.' },
      { en: 'The book on the table is mine.', cs: 'Ta kniha na stole je moje.' },
      { en: 'I like music.', cs: 'Mám rád hudbu. (bez členu)' },
      { en: 'He plays the guitar.', cs: 'Hraje na kytaru. (the u nástrojů)' },
      { en: 'Can you close the door?', cs: 'Můžeš zavřít dveře? (víme, které dveře)' },
    ],
    keyRules: [
      'A/An = neurčitý člen, používáme poprvé nebo pro „jeden z mnoha".',
      'An před samohláskovou hláskou (an apple, an hour), a před souhláskovou (a dog, a university).',
      'The = určitý člen, když oba vědí, o čem je řeč, nebo pro unikátní věci.',
      'Bez členu: vlastní jména, jazyky, sporty, jídla, obecná nepočitatelná podstatná jména.',
    ],
  },

  // ─── 9. Prepositions (A1) ────────────────────────────────────────────
  {
    id: 'prepositions',
    titleCs: 'Předložky (in/on/at)',
    titleEn: 'Prepositions (in/on/at)',
    level: 'A1',
    explanationCs:
      'Předložky in, on a at patří mezi nejpoužívanější v angličtině. Používají se jak pro čas, tak pro místo, ' +
      'a jejich správné použití je pro české studenty často obtížné, protože se nepřekládají vždy stejně.\n\n' +
      'Předložky času: „At" se používá pro přesný čas a svátky (at 5 o\'clock, at Christmas, at night). ' +
      '„On" se používá pro dny a data (on Monday, on 15th March, on my birthday). „In" se používá pro delší ' +
      'časová období (in January, in 2024, in the morning, in summer).\n\n' +
      'Předložky místa: „At" se používá pro konkrétní místo nebo bod (at the bus stop, at school, at home). ' +
      '„On" se používá pro povrchy a ulice (on the table, on the wall, on Oak Street). ' +
      '„In" se používá pro uzavřené prostory a oblasti (in the room, in Prague, in the Czech Republic).\n\n' +
      'Existují také ustálená spojení, která je potřeba se naučit zpaměti, např. at home, at work, ' +
      'in bed, on holiday, by car, on foot.',
    examples: [
      { en: 'The meeting is at 3 o\'clock.', cs: 'Schůzka je ve 3 hodiny.' },
      { en: 'I was born on 5th May.', cs: 'Narodil jsem se 5. května.' },
      { en: 'We go skiing in winter.', cs: 'V zimě jezdíme lyžovat.' },
      { en: 'She is waiting at the bus stop.', cs: 'Čeká na autobusové zastávce.' },
      { en: 'The picture is on the wall.', cs: 'Obrázek je na stěně.' },
      { en: 'He lives in a small village.', cs: 'Žije v malé vesnici.' },
      { en: 'I always study in the evening.', cs: 'Vždycky se učím večer.' },
    ],
    keyRules: [
      'Čas: at = přesný čas (at 5 o\'clock), on = dny/data (on Monday), in = období (in January, in the morning).',
      'Místo: at = konkrétní bod (at school), on = povrch (on the table), in = uzavřený prostor (in the room).',
      'Ustálená spojení: at home, at work, in bed, on holiday, by car, on foot.',
    ],
  },

  // ─── 10. Comparatives & Superlatives (A2) ────────────────────────────
  {
    id: 'comparatives',
    titleCs: 'Stupňování přídavných jmen',
    titleEn: 'Comparatives & Superlatives',
    level: 'A2',
    explanationCs:
      'Přídavná jména v angličtině můžeme stupňovat ve třech stupních: základní (big), druhý stupeň — komparativ ' +
      '(bigger), a třetí stupeň — superlativ (the biggest).\n\n' +
      'Krátká přídavná jména (1–2 slabiky): přidáváme -er pro komparativ a -est pro superlativ: ' +
      'tall → taller → the tallest, nice → nicer → the nicest. Pokud přídavné jméno končí na souhlásku po ' +
      'krátké samohlásce, zdvojujeme koncovou souhlásku: big → bigger → the biggest, hot → hotter → the hottest.\n\n' +
      'Dlouhá přídavná jména (3+ slabiky a většina dvouslabičných): používáme more/most: ' +
      'beautiful → more beautiful → the most beautiful, interesting → more interesting → the most interesting.\n\n' +
      'Existují nepravidelné tvary, které je nutné se naučit: good → better → the best, ' +
      'bad → worse → the worst, far → further/farther → the furthest/farthest.\n\n' +
      'Pro srovnání dvou věcí: „than" (She is taller than me). Pro superlativ: „the" + superlativ + „in/of" ' +
      '(He is the best student in the class).',
    examples: [
      { en: 'Prague is bigger than Brno.', cs: 'Praha je větší než Brno.' },
      { en: 'This book is more interesting than that one.', cs: 'Tato kniha je zajímavější než tamta.' },
      { en: 'She is the tallest girl in our class.', cs: 'Je nejvyšší dívka v naší třídě.' },
      { en: 'My English is better than last year.', cs: 'Moje angličtina je lepší než loni.' },
      { en: 'This is the worst film I have ever seen.', cs: 'To je nejhorší film, jaký jsem kdy viděl.' },
      { en: 'Summer is hotter than spring.', cs: 'Léto je teplejší než jaro.' },
    ],
    keyRules: [
      'Krátká přídavná jména: -er (komparativ), -est (superlativ).',
      'Dlouhá přídavná jména: more (komparativ), the most (superlativ).',
      'Nepravidelné tvary: good → better → best, bad → worse → worst.',
      'Srovnání: přídavné jméno + than (She is older than me).',
      'Superlativ: the + superlativ + in/of (the best in the class).',
    ],
  },

  // ─── 11. Conditionals (B1) ───────────────────────────────────────────
  {
    id: 'conditionals',
    titleCs: 'Podmínkové věty',
    titleEn: 'Conditionals',
    level: 'B1',
    explanationCs:
      'Podmínkové věty (Conditionals) vyjadřují, co se stane (nebo by se stalo), pokud je splněna určitá podmínka. ' +
      'Skládají se ze dvou částí: vedlejší věty s „if" (podmínka) a hlavní věty (důsledek).\n\n' +
      'Nultý kondicionál (Zero Conditional) se používá pro obecné pravdy a pravidla: ' +
      'If + Present Simple, Present Simple. „If you heat water to 100°C, it boils." ' +
      '(Pokud zahřeješ vodu na 100 °C, vaří se.)\n\n' +
      'První kondicionál (First Conditional) se používá pro reálné, pravděpodobné situace v budoucnosti: ' +
      'If + Present Simple, will + základní tvar. „If it rains, I will stay at home." ' +
      '(Jestli bude pršet, zůstanu doma.) V české škole se tento typ učí nejčastěji.\n\n' +
      'Druhý kondicionál (Second Conditional) se používá pro nereálné nebo nepravděpodobné situace v přítomnosti ' +
      'nebo budoucnosti: If + Past Simple, would + základní tvar. „If I won the lottery, I would travel around the world." ' +
      '(Kdybych vyhrál v loterii, cestoval bych po světě.) Pozor: u slovesa „be" se v podmínce používá „were" pro ' +
      'všechny osoby: „If I were you, I would study harder."\n\n' +
      'Důležité pravidlo: po „if" nikdy nepoužíváme „will" v podmínkové větě (ne „If it will rain").',
    examples: [
      { en: 'If you mix red and blue, you get purple.', cs: 'Když smícháš červenou a modrou, dostaneš fialovou.' },
      { en: 'If I pass the exam, I will celebrate.', cs: 'Jestli složím tu zkoušku, budu slavit.' },
      { en: 'If it rains tomorrow, we won\'t go hiking.', cs: 'Jestli zítra bude pršet, nepůjdeme na výlet.' },
      { en: 'If I had more money, I would buy a car.', cs: 'Kdybych měl víc peněz, koupil bych si auto.' },
      { en: 'If I were you, I would apologise.', cs: 'Kdybych byl tebou, omluvil bych se.' },
      { en: 'If she studied harder, she would get better marks.', cs: 'Kdyby se víc učila, měla by lepší známky.' },
    ],
    keyRules: [
      'Zero Conditional: If + Present Simple, Present Simple (obecné pravdy).',
      'First Conditional: If + Present Simple, will + sloveso (reálné budoucí situace).',
      'Second Conditional: If + Past Simple, would + sloveso (nereálné situace).',
      'Po „if" nikdy nepoužíváme „will".',
      'U 2. kondicionálu: If I were (ne „was") you — pro všechny osoby.',
    ],
  },

  // ─── 12. Passive Voice (B1) ──────────────────────────────────────────
  {
    id: 'passive',
    titleCs: 'Trpný rod',
    titleEn: 'Passive Voice',
    level: 'B1',
    explanationCs:
      'Trpný rod (Passive Voice) se používá, když je důležitější, co se stalo nebo komu se to stalo, než kdo to udělal. ' +
      'Také se používá, když nevíme, kdo danou činnost vykonal, nebo to není podstatné.\n\n' +
      'Tvoření: podmět + tvar slovesa „to be" + příčestí minulé (past participle). Čas se mění formou slovesa „be": ' +
      'Present Simple Passive: „The room is cleaned every day" (Pokoj je uklízen každý den). ' +
      'Past Simple Passive: „The bridge was built in 1920" (Most byl postaven v roce 1920). ' +
      'Present Perfect Passive: „The letter has been sent" (Dopis byl odeslán). ' +
      'Future Passive: „The project will be finished next week" (Projekt bude dokončen příští týden).\n\n' +
      'Pokud chceme zmínit, kdo činnost vykonal, použijeme předložku „by": ' +
      '„The book was written by J.K. Rowling" (Knihu napsala J.K. Rowlingová).\n\n' +
      'Porovnání: Činný rod (Active): „Someone stole my bike." → Trpný rod (Passive): „My bike was stolen." ' +
      'V češtině se trpný rod také používá, ale méně často než v angličtině.',
    examples: [
      { en: 'English is spoken all over the world.', cs: 'Anglicky se mluví po celém světě.' },
      { en: 'The school was built in 1965.', cs: 'Škola byla postavena v roce 1965.' },
      { en: 'The homework has been done.', cs: 'Domácí úkol byl udělaný.' },
      { en: 'The match will be played on Saturday.', cs: 'Zápas se bude hrát v sobotu.' },
      { en: 'The window was broken by the ball.', cs: 'Okno bylo rozbito míčem.' },
      { en: 'These cars are made in Germany.', cs: 'Tato auta se vyrábějí v Německu.' },
    ],
    keyRules: [
      'Tvoříme: podmět + tvar „to be" + příčestí minulé (past participle).',
      'Čas se mění formou slovesa „be" (is cleaned, was cleaned, has been cleaned, will be cleaned).',
      'Původce děje uvádíme pomocí „by" (The book was written by Tolkien).',
      'Používáme, když je důležitější, co se stalo, než kdo to udělal.',
    ],
  },

  // ─── 13. Forming Questions (A1) ──────────────────────────────────────
  {
    id: 'questions',
    titleCs: 'Tvorba otázek',
    titleEn: 'Forming Questions',
    level: 'A1',
    explanationCs:
      'V angličtině existují dva hlavní typy otázek: zjišťovací (Yes/No questions) a doplňovací (Wh- questions).\n\n' +
      'Zjišťovací otázky začínají pomocným slovesem a odpovídáme na ně „yes" nebo „no": ' +
      '„Do you like coffee?" — „Yes, I do." / „No, I don\'t." ' +
      '„Is she a student?" — „Yes, she is." / „No, she isn\'t." ' +
      '„Can you swim?" — „Yes, I can." / „No, I can\'t."\n\n' +
      'Doplňovací otázky začínají tázacím slovem (question word) + pomocné sloveso + podmět + sloveso: ' +
      'What (co/jaký), Where (kde/kam), When (kdy), Who (kdo), Why (proč), How (jak), Which (který), ' +
      'Whose (čí). Například: „Where do you live?", „What time does the train leave?", ' +
      '„How old are you?".\n\n' +
      'Pozor: pokud se tázací slovo ptá na podmět, nepoužíváme pomocné sloveso: ' +
      '„Who lives here?" (Kdo tady žije?) — ne „Who does live here?". ' +
      'Srovnejte: „Who did you call?" (Komu jsi volal? — ptáme se na předmět) vs. ' +
      '„Who called you?" (Kdo ti volal? — ptáme se na podmět).\n\n' +
      'Pozor na slovosled: v otázce je vždy nejdříve pomocné sloveso, pak podmět, pak hlavní sloveso.',
    examples: [
      { en: 'Do you speak English?', cs: 'Mluvíš anglicky?' },
      { en: 'Where does she work?', cs: 'Kde pracuje?' },
      { en: 'What time is it?', cs: 'Kolik je hodin?' },
      { en: 'Why are you crying?', cs: 'Proč pláčeš?' },
      { en: 'Who wrote this book?', cs: 'Kdo napsal tuto knihu?' },
      { en: 'How much does it cost?', cs: 'Kolik to stojí?' },
      { en: 'Is there a supermarket near here?', cs: 'Je tady někde poblíž supermarket?' },
      { en: 'Can I help you?', cs: 'Mohu vám pomoci?' },
    ],
    keyRules: [
      'Zjišťovací otázky (Yes/No): pomocné sloveso + podmět + hlavní sloveso.',
      'Doplňovací otázky (Wh-): tázací slovo + pomocné sloveso + podmět + sloveso.',
      'Tázací slova: What, Where, When, Who, Why, How, Which, Whose.',
      'Ptáme-li se na podmět, nepoužíváme pomocné sloveso (Who lives here?).',
      'Slovosled: pomocné sloveso vždy před podmětem.',
    ],
  },
];

export const GRAMMAR_REF_BY_LEVEL = (level: string) =>
  GRAMMAR_REFERENCE.filter(t => t.level === level);
