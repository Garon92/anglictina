import type { WritingTemplate } from '../types';

export const WRITING_TEMPLATES: WritingTemplate[] = [
  // ─── EMAILS (5) ───────────────────────────────────────────────────────
  {
    id: 'wrt_01',
    type: 'email',
    titleCs: 'Neformální email kamarádovi',
    level: 'A2',
    structureCs:
      'Struktura neformálního emailu:\n' +
      '1. Oslovení – neformální pozdrav (Hi, Hey, Dear + jméno)\n' +
      '2. Úvod – důvod psaní, reagování na předchozí zprávu\n' +
      '3. Hlavní část – 1–2 odstavce s informacemi, otázkami\n' +
      '4. Závěr – rozloučení, přání, plány na další kontakt\n' +
      '5. Podpis – jen křestní jméno\n' +
      'Délka: 100–150 slov. Používej zkrácené tvary (I\'m, don\'t) a neformální jazyk.',
    usefulPhrases: [
      { en: 'Hi / Hey [name],', cs: 'Ahoj [jméno],' },
      { en: 'Thanks for your email.', cs: 'Díky za tvůj email.' },
      { en: 'How are you doing?', cs: 'Jak se máš?' },
      { en: 'I\'m writing to tell you about…', cs: 'Píšu ti, abych ti řekl/a o…' },
      { en: 'Guess what!', cs: 'Hádej co!' },
      { en: 'By the way,…', cs: 'Mimochodem,…' },
      { en: 'Let me know what you think.', cs: 'Dej mi vědět, co si myslíš.' },
      { en: 'I can\'t wait to hear from you.', cs: 'Nemůžu se dočkat tvé odpovědi.' },
      { en: 'Write back soon!', cs: 'Brzy napiš!' },
      { en: 'Take care,', cs: 'Opatruj se,' },
    ],
    example:
      'Hi Tom,\n\n' +
      'Thanks for your last email! I\'m so happy to hear you passed your exams.\n\n' +
      'I wanted to tell you about my weekend. On Saturday, I went to a music festival with my friends. ' +
      'The weather was amazing and we danced all day. My favourite band played in the evening and it was incredible! ' +
      'On Sunday, I was really tired so I just stayed home and watched Netflix.\n\n' +
      'What about you? Did you do anything fun? By the way, do you want to come to my birthday party next month? ' +
      'It\'s going to be on March 15th at my place. Let me know!\n\n' +
      'Write back soon!\n' +
      'Anna',
  },
  {
    id: 'wrt_02',
    type: 'email',
    titleCs: 'Formální email škole',
    level: 'B1',
    structureCs:
      'Struktura formálního emailu:\n' +
      '1. Oslovení – formální (Dear Mr/Mrs/Ms + příjmení, nebo Dear Sir/Madam)\n' +
      '2. Úvod – jasně uveď důvod psaní (I am writing to…)\n' +
      '3. Hlavní část – 1–2 odstavce s podrobnostmi, žádostí nebo dotazem\n' +
      '4. Závěr – zdvořilá žádost o odpověď, poděkování\n' +
      '5. Podpis – celé jméno, formální rozloučení\n' +
      'Délka: 120–180 slov. Nepoužívej zkrácené tvary (piš I am, do not místo I\'m, don\'t).',
    usefulPhrases: [
      { en: 'Dear Mr/Mrs [surname],', cs: 'Vážený pane / Vážená paní [příjmení],' },
      { en: 'I am writing to enquire about…', cs: 'Píšu, abych se informoval/a o…' },
      { en: 'I would like to ask for information regarding…', cs: 'Rád/a bych požádal/a o informace ohledně…' },
      { en: 'I am a student at… and I am interested in…', cs: 'Jsem student/ka na… a zajímá mě…' },
      { en: 'Could you please let me know…', cs: 'Mohl/a byste mi prosím sdělit…' },
      { en: 'I would be grateful if you could…', cs: 'Byl/a bych vděčný/á, kdybyste mohl/a…' },
      { en: 'I am looking forward to your reply.', cs: 'Těším se na vaši odpověď.' },
      { en: 'Thank you in advance for your help.', cs: 'Předem děkuji za vaši pomoc.' },
      { en: 'Yours sincerely,', cs: 'S pozdravem,' },
      { en: 'Yours faithfully,', cs: 'S úctou,' },
    ],
    example:
      'Dear Mrs Johnson,\n\n' +
      'I am writing to enquire about the summer language courses that your school offers in July and August. ' +
      'I am a seventeen-year-old student from the Czech Republic and I am very interested in improving my English.\n\n' +
      'I would like to ask for information regarding the following: What levels are available? How many hours of ' +
      'lessons are there per week? Is accommodation included in the price, or do I need to arrange it separately? ' +
      'I would also be grateful if you could send me a brochure or a link to your website with more details.\n\n' +
      'Could you please let me know the registration deadline as well? I am looking forward to your reply.\n\n' +
      'Thank you in advance for your help.\n\n' +
      'Yours sincerely,\n' +
      'Jan Novák',
  },
  {
    id: 'wrt_03',
    type: 'email',
    titleCs: 'Email se stížností',
    level: 'B1',
    structureCs:
      'Struktura emailu se stížností:\n' +
      '1. Oslovení – formální (Dear Sir/Madam nebo Dear + jméno)\n' +
      '2. Úvod – uveď důvod stížnosti a kdy/kde se problém stal\n' +
      '3. Hlavní část – popiš problém podrobně, uveď konkrétní fakta\n' +
      '4. Požadavek – jasně řekni, co očekáváš (vrácení peněz, výměna, omluva)\n' +
      '5. Závěr – zdvořilý, ale důrazný tón\n' +
      'Délka: 120–180 slov. Buď zdvořilý, ale jasný. Nepoužívej zkrácené tvary.',
    usefulPhrases: [
      { en: 'I am writing to complain about…', cs: 'Píšu, abych si stěžoval/a na…' },
      { en: 'I am writing to express my dissatisfaction with…', cs: 'Píšu, abych vyjádřil/a svou nespokojenost s…' },
      { en: 'I purchased/ordered… on [date].', cs: 'Zakoupil/a / Objednal/a jsem… dne [datum].' },
      { en: 'Unfortunately, the product was…', cs: 'Bohužel, produkt byl…' },
      { en: 'This is not what I expected.', cs: 'Toto jsem neočekával/a.' },
      { en: 'I would like to request a full refund.', cs: 'Rád/a bych požádal/a o plné vrácení peněz.' },
      { en: 'I would appreciate it if you could resolve this matter.', cs: 'Ocenil/a bych, kdybyste tuto záležitost vyřešili.' },
      { en: 'I expect to hear from you within…', cs: 'Očekávám vaši odpověď do…' },
      { en: 'If the problem is not resolved, I will…', cs: 'Pokud nebude problém vyřešen, budu…' },
      { en: 'I look forward to your prompt response.', cs: 'Těším se na vaši brzkou odpověď.' },
    ],
    example:
      'Dear Sir or Madam,\n\n' +
      'I am writing to complain about a pair of headphones I ordered from your online shop on 5th January. ' +
      'The order number is #4821.\n\n' +
      'When I received the package, I noticed that the headphones were damaged. The left earpiece does not ' +
      'work at all, and there is a visible crack on the headband. Furthermore, the colour I received was black, ' +
      'but I ordered white ones. This is not what I expected from your company.\n\n' +
      'I would like to request either a replacement or a full refund. I have attached photos of the damaged ' +
      'product for your reference. I would appreciate it if you could resolve this matter as soon as possible.\n\n' +
      'I look forward to your prompt response.\n\n' +
      'Yours faithfully,\n' +
      'Petra Svobodová',
  },
  {
    id: 'wrt_04',
    type: 'email',
    titleCs: 'Email s pozvánkou',
    level: 'A2',
    structureCs:
      'Struktura emailu s pozvánkou:\n' +
      '1. Oslovení – neformální (Hi, Hey)\n' +
      '2. Úvod – řekni, proč píšeš a na co zveš\n' +
      '3. Hlavní část – uveď podrobnosti: datum, čas, místo, co dělat, co vzít s sebou\n' +
      '4. Závěr – požádej o odpověď, vyjádři nadšení\n' +
      '5. Podpis – křestní jméno\n' +
      'Délka: 100–150 slov. Piš přátelsky a nadšeně.',
    usefulPhrases: [
      { en: 'I\'m writing to invite you to…', cs: 'Píšu ti, abych tě pozval/a na…' },
      { en: 'Would you like to come to…?', cs: 'Chtěl/a bys přijít na…?' },
      { en: 'We\'re having a party / get-together…', cs: 'Pořádáme párty / sraz…' },
      { en: 'It\'s going to be on [date] at [time].', cs: 'Bude to [datum] v [čas].' },
      { en: 'The party will be at my place / at…', cs: 'Párty bude u mě / v…' },
      { en: 'There will be music, food, and games.', cs: 'Bude tam hudba, jídlo a hry.' },
      { en: 'You don\'t need to bring anything.', cs: 'Nemusíš nic nosit.' },
      { en: 'It would be great if you could come!', cs: 'Bylo by super, kdybys mohl/a přijít!' },
      { en: 'Let me know if you can make it.', cs: 'Dej mi vědět, jestli můžeš.' },
      { en: 'Hope to see you there!', cs: 'Doufám, že se tam uvidíme!' },
    ],
    example:
      'Hey Sarah,\n\n' +
      'How are you? I\'m writing to invite you to my birthday party! I\'m turning 17 and I want to celebrate ' +
      'with all my closest friends.\n\n' +
      'The party is going to be on Saturday, April 10th at 6 PM. It will be at my house. We\'re going to have ' +
      'a barbecue in the garden, and my brother is going to be the DJ. There will be lots of food, drinks, and ' +
      'games. You don\'t need to bring anything, just yourself!\n\n' +
      'My address is 15 Oak Street – you can take bus number 7 and get off at the park. It\'s a five-minute walk ' +
      'from there.\n\n' +
      'It would be amazing if you could come! Let me know as soon as possible.\n\n' +
      'Hope to see you there!\n' +
      'Marek',
  },
  {
    id: 'wrt_05',
    type: 'email',
    titleCs: 'Děkovný email',
    level: 'A2',
    structureCs:
      'Struktura děkovného emailu:\n' +
      '1. Oslovení – formální nebo neformální podle příjemce\n' +
      '2. Úvod – okamžitě poděkuj a řekni za co\n' +
      '3. Hlavní část – vysvětli, proč si toho vážíš, jak ti to pomohlo\n' +
      '4. Závěr – znovu poděkuj, nabídni pomoc do budoucna\n' +
      '5. Podpis\n' +
      'Délka: 100–150 slov. Buď upřímný/á a konkrétní.',
    usefulPhrases: [
      { en: 'I\'m writing to thank you for…', cs: 'Píšu, abych ti/vám poděkoval/a za…' },
      { en: 'Thank you so much for…', cs: 'Moc děkuji za…' },
      { en: 'I really appreciate your help with…', cs: 'Opravdu si vážím tvé/vaší pomoci s…' },
      { en: 'It was very kind of you to…', cs: 'Bylo od tebe/vás velmi milé, že…' },
      { en: 'I couldn\'t have done it without you.', cs: 'Bez tebe/vás bych to nezvládl/a.' },
      { en: 'It meant a lot to me.', cs: 'Moc to pro mě znamenalo.' },
      { en: 'I had a wonderful time.', cs: 'Skvěle jsem si to užil/a.' },
      { en: 'If there\'s anything I can do for you…', cs: 'Pokud pro tebe/vás mohu něco udělat…' },
      { en: 'Thanks again!', cs: 'Ještě jednou díky!' },
      { en: 'You\'re the best!', cs: 'Jsi nejlepší!' },
    ],
    example:
      'Hi Mrs Taylor,\n\n' +
      'I\'m writing to thank you for helping me with my university application. I really appreciate all the time ' +
      'you spent reading my personal statement and giving me feedback.\n\n' +
      'Your suggestions were incredibly helpful. You helped me make my essay much stronger, and I feel much more ' +
      'confident about my application now. I also want to thank you for the recommendation letter you wrote for ' +
      'me. It was very kind of you.\n\n' +
      'I just found out that I got accepted to my first-choice university! I couldn\'t have done it without your ' +
      'support. It really meant a lot to me.\n\n' +
      'Thank you again for everything. I hope I can make you proud!\n\n' +
      'Best wishes,\n' +
      'Klára',
  },

  // ─── LETTERS (3) ──────────────────────────────────────────────────────
  {
    id: 'wrt_06',
    type: 'letter',
    titleCs: 'Formální dopis',
    level: 'B1',
    structureCs:
      'Struktura formálního dopisu:\n' +
      '1. Adresa odesílatele – vpravo nahoře\n' +
      '2. Adresa příjemce – vlevo pod adresou odesílatele\n' +
      '3. Datum – pod adresou příjemce\n' +
      '4. Oslovení – Dear Mr/Mrs/Ms [příjmení] nebo Dear Sir/Madam\n' +
      '5. Úvod – důvod psaní\n' +
      '6. Hlavní část – 2–3 odstavce s podrobnostmi\n' +
      '7. Závěr – shrnutí, zdvořilá žádost\n' +
      '8. Podpis – Yours sincerely/faithfully + celé jméno\n' +
      'Délka: 150–200 slov. Formální jazyk, žádné zkrácené tvary.',
    usefulPhrases: [
      { en: 'I am writing with regard to…', cs: 'Píšu ohledně…' },
      { en: 'I am writing to apply for the position of…', cs: 'Píšu, abych se přihlásil/a na pozici…' },
      { en: 'I would like to bring to your attention…', cs: 'Rád/a bych upozornil/a na…' },
      { en: 'As you may be aware,…', cs: 'Jak možná víte,…' },
      { en: 'I have experience in…', cs: 'Mám zkušenosti s…' },
      { en: 'I believe I am a suitable candidate because…', cs: 'Věřím, že jsem vhodný/á kandidát/ka, protože…' },
      { en: 'I would be available for an interview at your convenience.', cs: 'Jsem k dispozici na pohovor dle vašich možností.' },
      { en: 'Please do not hesitate to contact me.', cs: 'Neváhejte mě kontaktovat.' },
      { en: 'I enclose my CV for your consideration.', cs: 'Přikládám svůj životopis k posouzení.' },
      { en: 'Yours sincerely,', cs: 'S pozdravem,' },
    ],
    example:
      'Jan Novák\n' +
      '23 Lipová Street\n' +
      'Prague, 110 00\n\n' +
      'Mr David Brown\n' +
      'Camp Director\n' +
      'Green Valley Summer Camp\n' +
      'Oxford, OX1 2AB\n\n' +
      '15 March 2026\n\n' +
      'Dear Mr Brown,\n\n' +
      'I am writing to apply for the position of junior camp assistant, which I saw advertised on your website.\n\n' +
      'I am a seventeen-year-old student from the Czech Republic. I am currently in my final year of secondary ' +
      'school and I have a B1 level of English. I have experience working with children as I volunteer at a local ' +
      'youth club every weekend. I am also a keen sportsman and can help organise outdoor activities.\n\n' +
      'I believe I would be a suitable candidate because I am responsible, enthusiastic, and I work well in a team. ' +
      'I would be available from 1st July to 31st August.\n\n' +
      'I enclose my CV for your consideration. Please do not hesitate to contact me if you require any further ' +
      'information. I would be available for an online interview at your convenience.\n\n' +
      'Yours sincerely,\n' +
      'Jan Novák',
  },
  {
    id: 'wrt_07',
    type: 'letter',
    titleCs: 'Pohlednice z dovolené',
    level: 'A2',
    structureCs:
      'Struktura pohlednice:\n' +
      '1. Oslovení – neformální (Dear/Hi + jméno)\n' +
      '2. Úvod – kde jsi, jak se máš\n' +
      '3. Hlavní část – co děláš, co jsi viděl/a, jaké je počasí, jídlo\n' +
      '4. Závěr – pozdravy, přání, kdy se vrátíš\n' +
      '5. Podpis – křestní jméno\n' +
      'Délka: 80–120 slov. Krátké věty, přítomný a minulý čas, neformální jazyk.',
    usefulPhrases: [
      { en: 'Greetings from [place]!', cs: 'Pozdravy z [místo]!' },
      { en: 'I\'m having a great time here!', cs: 'Skvěle si to tu užívám!' },
      { en: 'The weather is beautiful / hot / sunny.', cs: 'Počasí je krásné / horké / slunečné.' },
      { en: 'Yesterday we visited…', cs: 'Včera jsme navštívili…' },
      { en: 'The food here is delicious!', cs: 'Jídlo tady je výborné!' },
      { en: 'I wish you were here!', cs: 'Kéž bys tu byl/a!' },
      { en: 'We\'re staying at a lovely hotel near the beach.', cs: 'Bydlíme v krásném hotelu u pláže.' },
      { en: 'Tomorrow we\'re going to…', cs: 'Zítra se chystáme na…' },
      { en: 'See you when I get back!', cs: 'Uvidíme se, až se vrátím!' },
      { en: 'Lots of love,', cs: 'S láskou,' },
    ],
    example:
      'Dear Grandma,\n\n' +
      'Greetings from Barcelona! I\'m having an amazing time here with Mum and Dad. The weather is really hot ' +
      'and sunny – about 35 degrees every day!\n\n' +
      'Yesterday we visited the Sagrada Familia church. It was absolutely beautiful! We also walked along ' +
      'Las Ramblas and tried some delicious Spanish tapas. Today we\'re relaxing on the beach. The sea is so ' +
      'warm and blue.\n\n' +
      'Tomorrow we\'re going to visit a big aquarium and then have dinner at a restaurant by the harbour. ' +
      'The food here is amazing – I love paella!\n\n' +
      'I wish you were here! I\'ll bring you a nice souvenir. See you on Sunday!\n\n' +
      'Lots of love,\n' +
      'Tereza',
  },
  {
    id: 'wrt_08',
    type: 'letter',
    titleCs: 'Dopis zahraničnímu kamarádovi (pen pal)',
    level: 'A2',
    structureCs:
      'Struktura dopisu pen palovi:\n' +
      '1. Oslovení – přátelské (Dear/Hi + jméno)\n' +
      '2. Úvod – představ se nebo reaguj na předchozí dopis\n' +
      '3. Hlavní část – 2–3 odstavce: napiš o sobě, své rodině, škole, koníčcích, městě\n' +
      '4. Otázky – polož 2–3 otázky kamarádovi\n' +
      '5. Závěr – rozluč se, vyjádři přání psát si dál\n' +
      '6. Podpis – křestní jméno\n' +
      'Délka: 120–160 slov. Neformální, přátelský tón.',
    usefulPhrases: [
      { en: 'I\'d like to tell you a bit about myself.', cs: 'Rád/a bych ti o sobě něco řekl/a.' },
      { en: 'I live in… with my family.', cs: 'Bydlím v… s rodinou.' },
      { en: 'In my free time, I enjoy…', cs: 'Ve volném čase mě baví…' },
      { en: 'My favourite subject at school is…', cs: 'Můj oblíbený předmět ve škole je…' },
      { en: 'What about you?', cs: 'A co ty?' },
      { en: 'Do you have any hobbies?', cs: 'Máš nějaké koníčky?' },
      { en: 'What\'s your school like?', cs: 'Jaká je tvoje škola?' },
      { en: 'I\'d love to hear more about your country.', cs: 'Rád/a bych se dozvěděl/a víc o tvé zemi.' },
      { en: 'I hope we can meet one day!', cs: 'Doufám, že se jednou setkáme!' },
      { en: 'Write back soon!', cs: 'Brzy napiš!' },
    ],
    example:
      'Dear Alex,\n\n' +
      'Thank you for your letter! I was really happy to hear from you. I\'d like to tell you more about myself.\n\n' +
      'My name is Lukáš and I\'m 16 years old. I live in Brno, which is the second biggest city in the Czech ' +
      'Republic. I live with my parents and my younger sister, who is 12. I go to a grammar school and my ' +
      'favourite subjects are English and PE.\n\n' +
      'In my free time, I love playing football and video games. I also play the guitar in a small band with ' +
      'my friends. We practise every weekend in my garage. I also like reading comic books and watching sci-fi ' +
      'movies.\n\n' +
      'What about you? What do you like doing after school? What\'s your town like? I\'d love to hear more about ' +
      'life in Canada!\n\n' +
      'I hope we can meet one day. Write back soon!\n\n' +
      'Your friend,\n' +
      'Lukáš',
  },

  // ─── ESSAYS (5) ───────────────────────────────────────────────────────
  {
    id: 'wrt_09',
    type: 'essay',
    titleCs: 'Názorová esej (Opinion essay)',
    level: 'B1',
    structureCs:
      'Struktura názorové eseje:\n' +
      '1. Úvod – představ téma a jasně vyjádři svůj názor\n' +
      '2. Odstavec 2 – první argument podporující tvůj názor + příklad\n' +
      '3. Odstavec 3 – druhý argument + příklad\n' +
      '4. Odstavec 4 – protiargument a tvá reakce na něj\n' +
      '5. Závěr – shrň svůj názor jinými slovy\n' +
      'Délka: 150–200 slov. Používej spojovací výrazy (firstly, moreover, however, in conclusion).',
    usefulPhrases: [
      { en: 'In my opinion,…', cs: 'Podle mého názoru,…' },
      { en: 'I strongly believe that…', cs: 'Pevně věřím, že…' },
      { en: 'Firstly, / Secondly, / Finally,', cs: 'Za prvé, / Za druhé, / Nakonec,' },
      { en: 'For example, / For instance,', cs: 'Například,' },
      { en: 'Moreover, / Furthermore,', cs: 'Navíc, / Kromě toho,' },
      { en: 'On the other hand,', cs: 'Na druhou stranu,' },
      { en: 'Some people may argue that…', cs: 'Někteří lidé mohou namítat, že…' },
      { en: 'However, I disagree because…', cs: 'Nicméně nesouhlasím, protože…' },
      { en: 'All things considered,', cs: 'Když zvážíme všechny okolnosti,' },
      { en: 'In conclusion, I believe that…', cs: 'Závěrem věřím, že…' },
      { en: 'To sum up,', cs: 'Abych to shrnul/a,' },
    ],
    example:
      'Some people think that teenagers spend too much time on social media. In my opinion, this is true, and ' +
      'it can have negative effects on young people.\n\n' +
      'Firstly, spending too much time on platforms like Instagram or TikTok can affect mental health. Many ' +
      'teenagers compare themselves to others online and feel worse about themselves. For example, studies show ' +
      'that social media use is linked to anxiety and low self-esteem.\n\n' +
      'Secondly, social media can be a distraction from schoolwork. Instead of studying, many students scroll ' +
      'through their phones for hours. This can lead to worse grades and poor time management.\n\n' +
      'On the other hand, some people argue that social media helps teenagers stay connected with friends. ' +
      'While this is true, I believe face-to-face communication is much more valuable.\n\n' +
      'In conclusion, I think teenagers should limit their social media use and spend more time on activities ' +
      'that are better for their well-being.',
  },
  {
    id: 'wrt_10',
    type: 'essay',
    titleCs: 'Esej – výhody a nevýhody',
    level: 'B1',
    structureCs:
      'Struktura eseje o výhodách a nevýhodách:\n' +
      '1. Úvod – představ téma obecně, neříkej svůj názor\n' +
      '2. Odstavec 2 – výhody (2–3 body s příklady)\n' +
      '3. Odstavec 3 – nevýhody (2–3 body s příklady)\n' +
      '4. Závěr – shrň obě strany a můžeš vyjádřit svůj názor\n' +
      'Délka: 150–200 slov. Objektivní tón v hlavní části, používej spojovací výrazy.',
    usefulPhrases: [
      { en: 'There are both advantages and disadvantages of…', cs: 'Existují výhody i nevýhody…' },
      { en: 'One of the main advantages is that…', cs: 'Jednou z hlavních výhod je, že…' },
      { en: 'Another benefit is…', cs: 'Další výhodou je…' },
      { en: 'On the positive side,', cs: 'Z pozitivní stránky,' },
      { en: 'However, there are also drawbacks.', cs: 'Nicméně existují i nevýhody.' },
      { en: 'One of the main disadvantages is…', cs: 'Jednou z hlavních nevýhod je…' },
      { en: 'Another downside is that…', cs: 'Další nevýhodou je, že…' },
      { en: 'In addition,', cs: 'Navíc,' },
      { en: 'Taking everything into account,', cs: 'Když vezmeme vše v úvahu,' },
      { en: 'On balance, I think…', cs: 'Celkově si myslím, že…' },
    ],
    example:
      'Nowadays, more and more students are studying online instead of going to a traditional school. There are ' +
      'both advantages and disadvantages of this approach.\n\n' +
      'One of the main advantages of online learning is flexibility. Students can study at their own pace and ' +
      'choose when to watch lectures. Another benefit is that it saves time because there is no need to commute ' +
      'to school. In addition, students can access materials from anywhere in the world.\n\n' +
      'However, there are also some drawbacks. One of the main disadvantages is the lack of social interaction. ' +
      'Students may feel isolated and miss spending time with classmates. Another downside is that it requires ' +
      'strong self-discipline. Without a teacher physically present, some students find it hard to stay focused.\n\n' +
      'Taking everything into account, online learning can be very useful, but it is not ideal for everyone. ' +
      'On balance, I think a combination of online and traditional learning works best.',
  },
  {
    id: 'wrt_11',
    type: 'essay',
    titleCs: 'Popis místa (Description of a place)',
    level: 'B1',
    structureCs:
      'Struktura eseje – popis místa:\n' +
      '1. Úvod – řekni, jaké místo popisuješ a proč je důležité/zajímavé\n' +
      '2. Odstavec 2 – obecný popis (poloha, velikost, charakter)\n' +
      '3. Odstavec 3 – podrobnosti (co tam můžeš vidět/dělat, atmosféra)\n' +
      '4. Závěr – tvůj osobní vztah k místu, doporučení\n' +
      'Délka: 150–200 slov. Používej přídavná jména a příslovce pro živý popis.',
    usefulPhrases: [
      { en: 'I would like to describe…', cs: 'Rád/a bych popsal/a…' },
      { en: 'It is located in / near…', cs: 'Nachází se v / blízko…' },
      { en: 'It is a small / large / modern / historic…', cs: 'Je to malé / velké / moderní / historické…' },
      { en: 'The atmosphere is…', cs: 'Atmosféra je…' },
      { en: 'What I like most about this place is…', cs: 'Co se mi na tomto místě líbí nejvíc, je…' },
      { en: 'You can see / visit / enjoy…', cs: 'Můžete vidět / navštívit / užít si…' },
      { en: 'It is famous for…', cs: 'Je známé pro…' },
      { en: 'The best time to visit is…', cs: 'Nejlepší čas k návštěvě je…' },
      { en: 'I would highly recommend visiting…', cs: 'Vřele bych doporučil/a navštívit…' },
      { en: 'It is a place I will never forget.', cs: 'Je to místo, na které nikdy nezapomenu.' },
    ],
    example:
      'One of my favourite places in the Czech Republic is the old town of Český Krumlov. It is a small, ' +
      'beautiful town in South Bohemia, located on the banks of the Vltava River.\n\n' +
      'The town is famous for its stunning medieval architecture. The most impressive sight is the large castle ' +
      'which overlooks the entire town. The narrow cobblestone streets are full of colourful houses, cosy cafés, ' +
      'and little souvenir shops. In summer, you can see tourists from all over the world walking around and ' +
      'taking photos.\n\n' +
      'What I like most about Český Krumlov is its magical atmosphere. When you walk through the old streets in ' +
      'the evening, it feels like travelling back in time. You can also enjoy rafting on the river, which is ' +
      'really fun in the summer months.\n\n' +
      'I would highly recommend visiting Český Krumlov, especially in spring or autumn when it is less crowded. ' +
      'It is truly a place I will never forget.',
  },
  {
    id: 'wrt_12',
    type: 'essay',
    titleCs: 'Vyprávění / příběh (Narration)',
    level: 'B1',
    structureCs:
      'Struktura vyprávění:\n' +
      '1. Úvod – uveď postavy, místo a čas (kdo, kde, kdy)\n' +
      '2. Rozvinutí – popiš, co se stalo (události v chronologickém pořadí)\n' +
      '3. Vyvrcholení – nejnapínavější / nejdůležitější moment\n' +
      '4. Závěr – jak příběh skončil, co ses naučil/a, jaký to mělo dopad\n' +
      'Délka: 150–200 slov. Používej minulé časy (past simple, past continuous). Přidej přímou řeč a detaily.',
    usefulPhrases: [
      { en: 'It all started when…', cs: 'Všechno to začalo, když…' },
      { en: 'One day, / Last summer, / A few years ago,', cs: 'Jednoho dne, / Minulé léto, / Před pár lety,' },
      { en: 'I was walking / sitting / studying when…', cs: 'Šel/šla jsem / Seděl/a jsem / Studoval/a jsem, když…' },
      { en: 'Suddenly, / All of a sudden,', cs: 'Najednou,' },
      { en: 'At first, / Then, / After that,', cs: 'Nejdříve, / Potom, / Poté,' },
      { en: 'I couldn\'t believe my eyes!', cs: 'Nemohl/a jsem uvěřit svým očím!' },
      { en: 'I felt nervous / excited / scared.', cs: 'Cítil/a jsem se nervózně / nadšeně / vyděšeně.' },
      { en: 'In the end,', cs: 'Nakonec,' },
      { en: 'It was an experience I will never forget.', cs: 'Byl to zážitek, na který nikdy nezapomenu.' },
      { en: 'I learned that…', cs: 'Naučil/a jsem se, že…' },
    ],
    example:
      'Last summer, I went on a school trip to London with my classmates. It was my first time in England and ' +
      'I was really excited.\n\n' +
      'On the second day, we were visiting the British Museum when I got separated from the group. At first, ' +
      'I wasn\'t worried – I thought I would find them easily. But after twenty minutes of walking around, I ' +
      'realized I was completely lost. I felt nervous because my phone battery was dead and I couldn\'t call anyone.\n\n' +
      'Suddenly, I heard someone calling my name. It was my classmate Tomáš! He had noticed I was missing and ' +
      'came to look for me. "There you are!" he said. "Everyone is waiting outside." I was so relieved!\n\n' +
      'In the end, everything turned out fine. Our teacher wasn\'t angry, and we even laughed about it later. ' +
      'I learned that I should always keep my phone charged and stay close to the group. It was an experience ' +
      'I will never forget.',
  },
  {
    id: 'wrt_13',
    type: 'essay',
    titleCs: 'Esej – pro a proti (For and Against)',
    level: 'B1',
    structureCs:
      'Struktura eseje pro a proti:\n' +
      '1. Úvod – představ téma neutrálně, naznač, že existují oba pohledy\n' +
      '2. Odstavec 2 – argumenty PRO (2–3 argumenty s vysvětlením)\n' +
      '3. Odstavec 3 – argumenty PROTI (2–3 argumenty s vysvětlením)\n' +
      '4. Závěr – shrň oba pohledy, vyjádři svůj závěrečný názor\n' +
      'Délka: 150–200 slov. Podobné jako výhody/nevýhody, ale zaměř se na konkrétní argumenty a protiargumenty.',
    usefulPhrases: [
      { en: 'This is a topic that many people feel strongly about.', cs: 'Toto je téma, ke kterému mají mnozí silný názor.' },
      { en: 'There are strong arguments on both sides.', cs: 'Na obou stranách existují silné argumenty.' },
      { en: 'Those in favour of… argue that…', cs: 'Ti, kteří jsou pro…, tvrdí, že…' },
      { en: 'Supporters claim that…', cs: 'Zastánci tvrdí, že…' },
      { en: 'On the other hand, opponents believe that…', cs: 'Na druhou stranu, odpůrci věří, že…' },
      { en: 'Critics point out that…', cs: 'Kritici poukazují na to, že…' },
      { en: 'While it is true that…, we must also consider…', cs: 'I když je pravda, že…, musíme také zvážit…' },
      { en: 'Having considered both sides,', cs: 'Po zvážení obou stran,' },
      { en: 'It seems to me that…', cs: 'Zdá se mi, že…' },
      { en: 'Weighing up the pros and cons,', cs: 'Po zvážení pro a proti,' },
    ],
    example:
      'School uniforms are a topic that many students and parents feel strongly about. There are strong arguments ' +
      'on both sides of this debate.\n\n' +
      'Those in favour of school uniforms argue that they create a sense of equality among students. When everyone ' +
      'wears the same clothes, there is less pressure to wear expensive brands. Supporters also claim that ' +
      'uniforms help students focus on learning rather than fashion. Furthermore, they make it easier to identify ' +
      'students and improve school safety.\n\n' +
      'On the other hand, opponents believe that uniforms limit personal expression. Teenagers want to show their ' +
      'individuality through their clothes. Critics also point out that uniforms can be expensive for some families, ' +
      'especially when they need to buy specific items from certain shops.\n\n' +
      'Having considered both sides, it seems to me that while uniforms have some practical benefits, students ' +
      'should have the freedom to express themselves. Perhaps a compromise, such as a simple dress code, would ' +
      'be the best solution.',
  },

  // ─── DESCRIPTIONS (3) ─────────────────────────────────────────────────
  {
    id: 'wrt_14',
    type: 'description',
    titleCs: 'Popis osoby',
    level: 'A2',
    structureCs:
      'Struktura popisu osoby:\n' +
      '1. Úvod – řekni, koho popisuješ a jaký je tvůj vztah k této osobě\n' +
      '2. Vzhled – věk, výška, postava, vlasy, oči, typické oblečení\n' +
      '3. Povaha – vlastnosti, chování, co tě na něm/ní baví\n' +
      '4. Závěr – proč je tato osoba pro tebe důležitá\n' +
      'Délka: 100–150 slov. Používej přídavná jména, přítomný čas.',
    usefulPhrases: [
      { en: 'I would like to describe…', cs: 'Rád/a bych popsal/a…' },
      { en: 'He/She is … years old.', cs: 'Je mu/jí … let.' },
      { en: 'He/She is tall / short / medium height.', cs: 'Je vysoký/á / malý/á / střední postavy.' },
      { en: 'He/She has long / short / curly hair.', cs: 'Má dlouhé / krátké / kudrnaté vlasy.' },
      { en: 'He/She usually wears…', cs: 'Obvykle nosí…' },
      { en: 'He/She is friendly / kind / funny / creative.', cs: 'Je přátelský/á / milý/á / vtipný/á / kreativní.' },
      { en: 'What I like most about him/her is…', cs: 'Co se mi na něm/ní líbí nejvíc, je…' },
      { en: 'He/She always makes me laugh.', cs: 'Vždycky mě rozesměje.' },
      { en: 'We have been friends for… years.', cs: 'Jsme kamarádi už… let.' },
      { en: 'He/She is one of the most important people in my life.', cs: 'Je jedním z nejdůležitějších lidí v mém životě.' },
    ],
    example:
      'I would like to describe my best friend, Markéta. We have been friends since primary school, so we ' +
      'have known each other for about ten years.\n\n' +
      'Markéta is sixteen years old and she is quite tall with long, straight brown hair and green eyes. ' +
      'She usually wears jeans, a T-shirt, and white trainers. She loves wearing colourful scarves, even in summer.\n\n' +
      'Markéta is one of the kindest people I know. She is always smiling and she makes everyone feel welcome. ' +
      'She is also very creative – she loves painting and she is really good at it. What I like most about her is ' +
      'her sense of humour. She always makes me laugh, even when I\'m having a bad day.\n\n' +
      'Markéta is definitely one of the most important people in my life, and I\'m lucky to have her as a friend.',
  },
  {
    id: 'wrt_15',
    type: 'description',
    titleCs: 'Popis místa',
    level: 'B1',
    structureCs:
      'Struktura popisu místa:\n' +
      '1. Úvod – jaké místo popisuješ, kde se nachází\n' +
      '2. Obecný popis – velikost, typ, první dojem\n' +
      '3. Podrobnosti – co tam najdeš, co tam můžeš dělat, atmosféra, smysly (co vidíš, slyšíš, cítíš)\n' +
      '4. Závěr – tvůj vztah k místu, proč ho doporučuješ\n' +
      'Délka: 120–180 slov. Používej přídavná jména, příslovce, smyslové detaily.',
    usefulPhrases: [
      { en: 'The place I want to describe is…', cs: 'Místo, které chci popsat, je…' },
      { en: 'It is situated in the centre / on the outskirts of…', cs: 'Nachází se v centru / na okraji…' },
      { en: 'When you first arrive, you notice…', cs: 'Když poprvé přijdete, všimnete si…' },
      { en: 'The streets are lined with…', cs: 'Ulice jsou lemované…' },
      { en: 'You can hear the sound of…', cs: 'Můžete slyšet zvuk…' },
      { en: 'There is a wonderful view of…', cs: 'Je tam nádherný výhled na…' },
      { en: 'It has a cosy / lively / peaceful atmosphere.', cs: 'Má útulnou / živou / klidnou atmosféru.' },
      { en: 'What makes this place special is…', cs: 'Co dělá toto místo výjimečným, je…' },
      { en: 'It is the perfect place to relax / have fun / explore.', cs: 'Je to ideální místo k odpočinku / zábavě / prozkoumání.' },
      { en: 'I always feel happy when I am there.', cs: 'Vždycky se tam cítím šťastně.' },
    ],
    example:
      'The place I want to describe is my grandparents\' cottage in the Šumava mountains. It is situated in ' +
      'a small village surrounded by thick forests and green hills.\n\n' +
      'When you first arrive, you notice how quiet and peaceful everything is. The cottage is old but cosy, ' +
      'with a red roof and a beautiful garden full of flowers. Inside, there is a large kitchen with a wooden ' +
      'table where the whole family sits together for meals. You can hear the sound of birds singing outside ' +
      'and smell the fresh pine trees.\n\n' +
      'What makes this place special is the nature all around. There are wonderful hiking trails nearby, and ' +
      'in winter you can go cross-country skiing. In the evening, we often sit by the fireplace and play board ' +
      'games together.\n\n' +
      'I always feel completely relaxed when I am there. It is the perfect place to escape from the busy city ' +
      'and enjoy some quality time with my family.',
  },
  {
    id: 'wrt_16',
    type: 'description',
    titleCs: 'Popis události / zážitku',
    level: 'B1',
    structureCs:
      'Struktura popisu události:\n' +
      '1. Úvod – řekni, o jakou událost jde, kdy a kde se konala\n' +
      '2. Popis – co se dělo, kdo tam byl, jak to vypadalo\n' +
      '3. Tvé pocity – jak ses cítil/a, co se ti líbilo nejvíc\n' +
      '4. Závěr – celkový dojem, doporučení\n' +
      'Délka: 100–150 slov. Používej minulý čas, přídavná jména pro pocity a dojmy.',
    usefulPhrases: [
      { en: 'I want to tell you about…', cs: 'Chci ti říct o…' },
      { en: 'It took place on [date] at [place].', cs: 'Konalo se to [datum] v [místo].' },
      { en: 'I went there with my friends / family.', cs: 'Šel/šla jsem tam s kamarády / rodinou.' },
      { en: 'There were lots of people.', cs: 'Bylo tam hodně lidí.' },
      { en: 'The best part was…', cs: 'Nejlepší část byla…' },
      { en: 'I really enjoyed…', cs: 'Opravdu se mi líbilo…' },
      { en: 'The atmosphere was amazing / fantastic.', cs: 'Atmosféra byla úžasná / fantastická.' },
      { en: 'I felt really happy / excited.', cs: 'Cítil/a jsem se opravdu šťastně / nadšeně.' },
      { en: 'It was one of the best days of my life.', cs: 'Byl to jeden z nejlepších dnů mého života.' },
      { en: 'I would definitely go again!', cs: 'Určitě bych šel/šla znovu!' },
    ],
    example:
      'I want to tell you about a music festival I went to last July. It was called "Summer Beats" and it ' +
      'took place in a big park near Prague.\n\n' +
      'I went there with my three best friends. We arrived in the morning and the park was already full of ' +
      'people. There were several stages with different bands playing all day long. We listened to rock, pop, ' +
      'and electronic music. There were also food stalls where we tried burgers, pizza, and amazing ice cream.\n\n' +
      'The best part was the evening concert. Our favourite Czech band played for two hours and everyone was ' +
      'singing and dancing. The atmosphere was absolutely fantastic! I felt so happy and free.\n\n' +
      'We didn\'t get home until midnight, but it was totally worth it. It was one of the best days of my life, ' +
      'and I would definitely go again next year!',
  },
];
