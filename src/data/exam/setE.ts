import type { ExamSet } from '../../exam/types';

/**
 * Cvičný test E — original practice test in the format of the CERMAT
 * didaktický test (anglický jazyk). All texts and recordings were written for this app.
 */
export const SET_E: ExamSet = {
  id: 'set-e',
  title: 'Cvičný test E',
  descriptionCs:
    'Dárek pro sestru, první hodiny v autoškole, výlet lodí po řece, sdílená kola ve městě, mladá šachová šampionka, víkendové brigády, historie pizzy a omyl na narozeninové oslavě.',

  // ── POSLECH ────────────────────────────────────────────────────────
  part1: {
    items: [
      {
        question: 'What will the boy buy his sister for her birthday?',
        script: [
          'W: Have you got a birthday present for your sister yet?',
          'M: Not yet. I wanted to get Emily a watch, but the one she likes is far too expensive.',
          'W: What about a phone case? Or a book? She reads all the time.',
          "M: Mum has already bought her a phone case, and Grandma always gives her books. I think I'll get her some headphones. Hers broke last week, and she listens to music on the bus every day.",
          'W: Good idea. I saw some nice ones at the market.',
        ].join('\n'),
        options: [
          { emoji: '⌚', caption: 'A watch' },
          { emoji: '🎧', caption: 'Headphones' },
          { emoji: '📱', caption: 'A phone case' },
          { emoji: '📚', caption: 'A book' },
        ],
        answer: 1,
        explanationCs:
          "Chlapec sestře koupí sluchátka: „I think I'll get her some headphones.“ Hodinky jsou moc drahé, obal na telefon už koupila máma a knihy jí dává babička.",
      },
      {
        question: "What was the weather like for most of Peter's holiday?",
        script: [
          'W: Welcome back, Peter! How was Scotland? Did it rain all the time?',
          'M: Everyone said it would, but it only rained on the day we arrived.',
          'W: Lucky you! So was it hot and sunny?',
          'M: Hot? Not at all. For the rest of the week it was cold and really windy. We had to wear our winter jackets on the beach!',
          'W: Oh dear. Was there any snow in the mountains?',
          "M: No, it wasn't that cold. And on the last afternoon the sun finally came out.",
        ].join('\n'),
        options: [
          { emoji: '🌧️☂️', caption: 'Rainy' },
          { emoji: '☀️😎', caption: 'Hot and sunny' },
          { emoji: '🏔️❄️', caption: 'Snowy' },
          { emoji: '💨🧥', caption: 'Cold and windy' },
        ],
        answer: 3,
        explanationCs:
          'Většinu týdne bylo chladno a větrno: „For the rest of the week it was cold and really windy.“ Pršelo jen v den příjezdu, sníh nebyl a slunce vyšlo až poslední odpoledne.',
      },
      {
        question: 'Which job has Clare applied for?',
        script: [
          'M: Hi Clare. Are you still working at the supermarket?',
          "W: Yes, but I've just applied for a new job.",
          "M: Really? As a teacher? You've always wanted to work with children.",
          "W: I'd need a university degree for that. No, the Grand Hotel is looking for a receptionist, and I can use my German and Spanish there.",
          'M: A hotel? But you hated working as a waitress in a hotel restaurant last summer.',
          'W: That was hard work. Reception is different. The interview is on Tuesday.',
        ].join('\n'),
        options: [
          { emoji: '🛎️🏨', caption: 'Hotel receptionist' },
          { emoji: '👩‍🏫📚', caption: 'Teacher' },
          { emoji: '🛒🧾', caption: 'Supermarket assistant' },
          { emoji: '🍽️👩', caption: 'Waitress' },
        ],
        answer: 0,
        explanationCs:
          'Clare se hlásí na místo recepční: „the Grand Hotel is looking for a receptionist“. V supermarketu pracuje teď, na učitelku by potřebovala vysokou školu a servírkou byla loni v létě.',
      },
      {
        question: 'Where will the friends meet on Saturday?',
        script: [
          'M: Are we still going to the concert on Saturday? Shall we meet at the bus station at six?',
          "W: It's always so crowded there on Saturdays. Why don't we meet at the café near the park and have something to eat first?",
          "M: I'd like that, but it closes at five at the weekend.",
          "W: Oh, right. Then let's meet in front of the library. It's only two minutes from the concert hall.",
          "M: Fine. I'll wait by the main door at half past six.",
          "W: Great. And don't forget the tickets!",
        ].join('\n'),
        options: [
          { emoji: '🚌🚏', caption: 'At the bus station' },
          { emoji: '☕🌳', caption: 'At the café' },
          { emoji: '📚🏛️', caption: 'In front of the library' },
          { emoji: '🎵🎤', caption: 'At the concert hall' },
        ],
        answer: 2,
        explanationCs:
          "Kamarádi se sejdou před knihovnou: „let's meet in front of the library“. Na nádraží je v sobotu plno a kavárna o víkendu zavírá už v pět.",
      },
    ],
  },

  part2: {
    introCs:
      'Uslyšíte rozhovor dvou kamarádů o jejich prvních hodinách v autoškole. Na základě vyslechnuté nahrávky rozhodněte, zda jsou tvrzení 5–12 pravdivá (P), nebo nepravdivá (N).',
    script: [
      'W: Hi Josh! I heard you had your first driving lesson yesterday. How did it go?',
      'M: Hi Katie. Better than I expected, actually. I was really nervous before it, because my brother told me his first lesson was a disaster.',
      "W: Mine was last Saturday. My instructor is called Mr Hall. He's very calm, but he talks all the time, so it's hard to concentrate.",
      'M: My instructor is a woman called Sandra. She hardly says anything, which is fine for me. She only speaks when I do something wrong.',
      'W: Did you drive in town straight away?',
      'M: No, we started in an empty car park behind the sports centre. I practised starting and stopping for about half an hour. Then we drove along some quiet streets near the hospital.',
      'W: Lucky you. Mr Hall took me straight onto the main road. There was a bus behind me the whole time, and I was so scared that I drove at fifteen miles an hour.',
      'M: Poor you! Did you make any big mistakes?',
      'W: Only one. I started driving without checking behind me, so Mr Hall had to stop the car with his own brake. What about you?',
      'M: Nothing serious. I just forgot to turn off the indicator, so it was flashing for about five minutes.',
      'W: How many lessons are you going to take?',
      "M: My parents are paying for ten lessons. After that I'll have to pay for them myself, so I'm looking for a weekend job.",
      "W: I'm paying for mine with the money I got for my eighteenth birthday. Each lesson costs thirty-five pounds, so it's quite expensive.",
      'M: Mine are only thirty. Maybe you should change your driving school!',
      "W: Maybe. But my dad says he'll take me out in his car every Sunday, so I won't need so many lessons.",
      "M: Lucky you. My dad won't let me touch his car. He says it's too new.",
      'W: So when do you want to take your test?',
      "M: Sandra thinks I could be ready by the summer. I'd love to drive to the seaside with my friends in August.",
      'W: Well, if you pass, you can take me too.',
      'M: OK, but only if you bring the snacks!',
    ].join('\n'),
    statements: [
      {
        text: 'Josh felt relaxed before his first lesson.',
        answer: false,
        explanationCs:
          'Josh byl před první hodinou nervózní: „I was really nervous before it, because my brother told me his first lesson was a disaster.“',
      },
      {
        text: 'Katie finds it hard to concentrate because her instructor talks a lot.',
        answer: true,
        explanationCs: "Katie o instruktorovi říká: „he talks all the time, so it's hard to concentrate“.",
      },
      {
        text: "Josh's first lesson began in a car park.",
        answer: true,
        explanationCs: 'Josh začal na parkovišti: „we started in an empty car park behind the sports centre“.',
      },
      {
        text: 'In her first lesson, Katie drove only on quiet streets.',
        answer: false,
        explanationCs:
          'Instruktor ji vzal rovnou na hlavní silnici: „Mr Hall took me straight onto the main road.“ Klidnými ulicemi jezdil Josh.',
      },
      {
        text: 'Josh made a serious mistake during his lesson.',
        answer: false,
        explanationCs:
          'Josh neudělal nic vážného: „Nothing serious. I just forgot to turn off the indicator.“ Vážnou chybu udělala Katie.',
      },
      {
        text: 'Josh will have to pay for some of his lessons himself.',
        answer: true,
        explanationCs:
          "Rodiče zaplatí jen deset hodin: „After that I'll have to pay for them myself.“",
      },
      {
        text: "Katie's lessons are cheaper than Josh's.",
        answer: false,
        explanationCs:
          'Katie platí 35 liber za hodinu, Josh jen 30: „Mine are only thirty.“ Její hodiny jsou tedy dražší.',
      },
      {
        text: "Katie's father is going to help her practise driving.",
        answer: true,
        explanationCs:
          "Táta s ní bude jezdit každou neděli: „my dad says he'll take me out in his car every Sunday“.",
      },
    ],
  },

  part3: {
    introCs:
      'Uslyšíte průvodce na výletní lodi, který cestujícím představuje plavbu po řece. Na základě vyslechnuté nahrávky odpovězte na otázky 13–20. Odpovídejte nejvýše třemi slovy; čísla můžete psát číslicemi.',
    script: [
      "M: Good morning, ladies and gentlemen, and welcome aboard the Silver Swan. My name is Ben, and I'm your guide on today's trip along the River Avel.",
      "M: Before we start, some important safety information. Please stay in your seat while the boat is moving, and never lean over the side. You'll find life jackets under your seats, and all children under twelve must wear one during the whole trip. If you feel unwell at any time, please tell me or our captain, Sarah.",
      'M: Now, a little history. Our town, Millford, is almost nine hundred years old. It started as a small fishing village, but in the fifteenth century it became rich from the wool trade. The big stone houses you can see on your left were built by wool merchants, and many of them are hotels and restaurants today.',
      "M: In a moment, we'll go under King's Bridge. It was built in thirteen forty, so it's the oldest bridge in Millford, and it's also the lowest. Tall passengers on the top deck, please sit down! About ten minutes later, we'll pass the Green Bridge. It was built for the railway in eighteen seventy-eight, but trains stopped using it fifty years ago. Today it's open only to cyclists and walkers.",
      "M: After that, the river goes through open countryside. In about forty minutes, you'll see Redstone Castle on the hill to your right. It was built in the twelfth century to protect the river, and today it's a museum. It's open every day except Mondays, so you can come back and visit it another time.",
      "M: At half past twelve, we'll stop for lunch in the village of Hamford. Lunch isn't included in your ticket, but I can recommend the Old Mill restaurant next to the river. It's famous for its fish pie. If you prefer a picnic, there's a lovely park behind the church. We'll stay in Hamford for an hour and three quarters, so please be back on the boat by quarter past two. We can't wait for anyone who's late. We'll arrive back here in Millford at about four o'clock.",
      "M: Finally, if you'd like a souvenir of your trip, our little shop at the back of the boat sells postcards and maps. We also sell jars of honey from the captain's own bees, and they're very popular. And for photos, the best views are from the top deck, especially when we pass the castle. Enjoy the trip!",
    ].join('\n'),
    questions: [
      {
        question: 'Where can passengers find life jackets?',
        accept: ['under the seats', 'under your seats', 'under their seats', 'under the seat', 'under seats'],
        explanationCs:
          "„You'll find life jackets under your seats.“ Děti do dvanácti let je musí mít na sobě po celou plavbu.",
      },
      {
        question: 'What made Millford rich in the fifteenth century?',
        accept: ['the wool trade', 'wool trade', 'wool', 'trading wool'],
        explanationCs:
          '„In the fifteenth century it became rich from the wool trade.“ Původně to byla malá rybářská vesnice.',
      },
      {
        question: "When was King's Bridge built?",
        prefix: 'in',
        accept: ['1340', 'thirteen forty', 'in 1340'],
        explanationCs:
          "„It was built in thirteen forty, so it's the oldest bridge in Millford.“ Rok 1878 se týká železničního mostu Green Bridge.",
      },
      {
        question: 'Who can use the Green Bridge today?',
        accept: [
          'cyclists and walkers',
          'walkers and cyclists',
          'cyclists, walkers',
          'cyclists and pedestrians',
        ],
        explanationCs:
          "„Today it's open only to cyclists and walkers.“ Vlaky po mostě přestaly jezdit před padesáti lety.",
      },
      {
        question: 'On which day of the week is the castle closed?',
        accept: ['Monday', 'Mondays', 'on Mondays', 'on Monday'],
        explanationCs: "Hrad je otevřený „every day except Mondays“, tedy v pondělí je zavřený.",
      },
      {
        question: 'What is the Old Mill restaurant famous for?',
        accept: ['fish pie', 'its fish pie', 'the fish pie', 'fish pies'],
        explanationCs: "„I can recommend the Old Mill restaurant next to the river. It's famous for its fish pie.“",
      },
      {
        question: 'By what time must passengers be back on the boat?',
        accept: ['2.15', '2:15', '14.15', '14:15', 'quarter past two', 'quarter past 2', 'two fifteen', '2.15 p.m.', '2.15 pm', '2.15pm', '2:15 pm', '2:15pm', '2:15 p.m.'],
        explanationCs:
          '„Please be back on the boat by quarter past two.“ Loď připlouvá do Hamfordu ve 12.30 a stojí tam hodinu a tři čtvrtě. Ve čtyři se vrací do Millfordu.',
      },
      {
        question: 'Apart from postcards and maps, what does the boat shop sell?',
        accept: ['honey', 'jars of honey', 'jar of honey'],
        explanationCs:
          "„We also sell jars of honey from the captain's own bees.“ Pohlednice a mapy jsou v otázce již uvedeny.",
      },
    ],
  },

  part4: {
    items: [
      {
        question: 'Why will the match start late?',
        script: [
          "M: Good evening, ladies and gentlemen, and welcome to Riverside Stadium for tonight's match between Westford United and Carlton City. Please note that the match will start fifteen minutes late, at a quarter to eight, because many fans are still stuck in heavy traffic on the motorway. Fans with tickets for the North Stand should use gate C, as gate A is closed for repairs. After the match, trains to the city centre will run every ten minutes until midnight. Thank you, and enjoy the game.",
        ].join('\n'),
        options: [
          'The weather is very bad.',
          'Gate A is closed for repairs.',
          'A lot of fans are late because of traffic.',
          'The trains are not running.',
        ],
        answer: 2,
        explanationCs:
          'Zápas začne o 15 minut později, protože fanoušci stojí v zácpě: „many fans are still stuck in heavy traffic on the motorway“. Zavřená brána A se začátkem zápasu nesouvisí.',
      },
      {
        question: 'What should drivers going to the airport do?',
        script: [
          "W: And now the traffic news. There's been an accident on the A forty near Oakley, and the road is closed in both directions. The police say it will stay closed until at least lunchtime. If you're driving to the airport this morning, please use the Kingston road instead, and leave thirty minutes earlier than usual. In the city centre, Park Street is closed all weekend because of road repairs, and the Ring Road is very busy because of the Saturday market.",
        ].join('\n'),
        options: [
          'Take a different road.',
          'Wait until lunchtime.',
          'Drive through the city centre.',
          'Use the Ring Road.',
        ],
        answer: 0,
        explanationCs:
          'Řidiči na letiště mají jet jinudy: „please use the Kingston road instead“ a vyrazit o 30 minut dřív. Silnice A40 („A forty“) bude zavřená nejméně do oběda.',
      },
      {
        question: 'When can Emma have her hair cut by Jess?',
        script: [
          "W: Hello, this is Anna from Style Corner hair salon with a message for Emma Clarke. It's about your appointment with Jess tomorrow morning at eleven. I'm sorry, but Jess is ill and she won't be at work for the rest of this week. Our other hairdresser, Paul, can see you at the same time tomorrow, or at three in the afternoon if that's better for you. If you'd rather wait for Jess, she can see you next Thursday afternoon. Please call us back before six today. Thank you!",
        ].join('\n'),
        options: ['Tomorrow at 11 a.m.', 'Tomorrow at 3 p.m.', 'On Thursday this week.', 'Next Thursday afternoon.'],
        answer: 3,
        explanationCs:
          'Jess je nemocná do konce týdne, ale Emmu může ostříhat „next Thursday afternoon“. Zítra v 11 nebo ve 3 odpoledne by ji stříhal Paul.',
      },
      {
        question: 'What is the man going to do?',
        script: [
          "M: Excuse me. I like this jacket, but it's a bit too small. Have you got it in a larger size?",
          "W: Let me check. Sorry, not in green. We've got a large one in black, though.",
          'M: Black? No, thanks. Most of my clothes are black already.',
          "W: I can order a green one for you. It'll be here on Friday.",
          'M: Great. How much is it?',
          "W: Sixty pounds, but it's twenty percent off this week.",
          "M: Perfect. Then I'll come back on Friday.",
        ].join('\n'),
        options: [
          'Buy the black jacket today.',
          'Collect a green jacket on Friday.',
          'Look for a jacket in another shop.',
          'Try on a smaller size.',
        ],
        answer: 1,
        explanationCs:
          "Prodavačka objedná zelenou bundu ve větší velikosti, která přijde v pátek: „Then I'll come back on Friday.“ Černou bundu muž nechce.",
      },
    ],
  },

  // ── ČTENÍ ──────────────────────────────────────────────────────────
  part5: {
    items: [
      {
        kind: 'Notice',
        text: [
          'NORTHLINE RAILWAYS – ENGINEERING WORK',
          'On Saturday 12th and Sunday 13th October, there will be no trains between Holbrook and Castleton because of work on the line. Buses will replace the trains on this part of the route. They will leave from the car park in front of the railway station, not from the bus station. Journeys will take about 40 minutes longer than usual. Please note that bicycles cannot be taken on the buses. Your normal train ticket is valid on the buses.',
        ].join('\n'),
        question: 'What is true for passengers travelling between Holbrook and Castleton that weekend?',
        options: [
          'They need to buy a bus ticket.',
          'They should wait at the bus station.',
          'Their journey will be faster than usual.',
          'They cannot take their bikes with them.',
        ],
        answer: 3,
        explanationCs:
          '„Please note that bicycles cannot be taken on the buses.“ Jízdenka na vlak platí i v autobusu, autobusy jedou z parkoviště před nádražím a cesta bude delší.',
      },
      {
        kind: 'Note on the fridge',
        text: [
          'Dan,',
          "I've gone to visit Grandma and I won't be back until about nine. There's some lasagne in the fridge for your dinner – just heat it up for three minutes. Please DON'T eat the chocolate cake – it's for Lily's party tomorrow! Could you take the dog for a walk before it gets dark? And if a man from the internet company phones, tell him we're at home all day on Saturday.",
          'Love, Mum',
        ].join('\n'),
        question: 'What does Mum ask Dan to do?',
        options: [
          'Cook dinner for the family.',
          'Take the dog out while it is still light.',
          "Bring the cake to Lily's party.",
          'Phone the internet company.',
        ],
        answer: 1,
        explanationCs:
          'Máma prosí: „Could you take the dog for a walk before it gets dark?“ Večeře je už hotová a Dan nemá nikam volat – jen vyřídit vzkaz, pokud zavolá někdo z internetové společnosti.',
      },
      {
        kind: 'Advert',
        text: [
          'MATHS HELP BEFORE YOUR EXAMS',
          "Is maths a problem for you? I'm a second-year engineering student, and I've been giving private lessons for three years. I can help students aged 12–18 with homework and exam preparation. Lessons take place at Easton City Library or online – sorry, I can't come to your home. £15 for 60 minutes, and your first lesson is half price. Weekday evenings and Saturday mornings only. Call or text Tom on 07700 900312.",
        ].join('\n'),
        question: 'What do we learn about the lessons?',
        options: [
          'The first one is cheaper.',
          "They can take place at the student's home.",
          'They are for university students.',
          'They are available on Sunday mornings.',
        ],
        answer: 0,
        explanationCs:
          '„Your first lesson is half price“ – první hodina stojí jen polovinu. Doma lekce neprobíhají, jsou pro žáky od 12 do 18 let a jen ve všední večery a v sobotu dopoledne.',
      },
      {
        kind: 'Website pop-up',
        text: [
          'Before you continue…',
          "Our online shop is moving to a new system. From midnight to 6 a.m. on Tuesday, you will not be able to log in or place orders. Orders placed before midnight on Monday will be delivered as usual. We're sorry for any problems this may cause. To say thank you for your patience, everyone who signs up for our newsletter this week will get free delivery on their next order.",
          'Sign up now or close this window to continue shopping.',
        ].join('\n'),
        question: 'How can customers get free delivery?',
        options: [
          'By ordering before midnight on Monday.',
          'By shopping early on Tuesday morning.',
          'By joining the newsletter this week.',
          'By logging in to their account.',
        ],
        answer: 2,
        explanationCs:
          'Doprava zdarma je pro ty, kdo se tento týden přihlásí k odběru novinek: „everyone who signs up for our newsletter this week will get free delivery“.',
      },
      {
        kind: 'Note from a teacher',
        text: [
          'Dear Class 10B,',
          "Tomorrow's history lesson will not be in our usual classroom. We will meet in the computer room on the first floor, because you are going to start your projects on the Second World War. You won't need your textbooks, but please bring headphones. Remember that you must hand in your projects by Friday 22nd November. If you are ill tomorrow, email me and I will send you the instructions.",
          'Mrs Parker',
        ].join('\n'),
        question: 'What should the students do tomorrow?',
        options: [
          'Bring their history textbooks.',
          'Go to a different room.',
          'Hand in their projects.',
          'Send Mrs Parker an email.',
        ],
        answer: 1,
        explanationCs:
          'Hodina bude v počítačové učebně, ne v obvyklé třídě: „We will meet in the computer room on the first floor.“ Učebnice nepotřebují a projekty mají odevzdat do 22. listopadu.',
      },
    ],
  },

  part6: {
    introCs:
      'Přečtěte si informace o městském systému sdílených kol. Na základě textu rozhodněte, zda jsou tvrzení 30–39 pravdivá (P), nebo nepravdivá (N).',
    title: 'GoBike Easton – Bikes for Everyone',
    text: [
      "GoBike Easton is our city's bike-sharing scheme. There are over 1,200 bikes at 150 docking stations around the city, so there is almost always a bike near you. You can use our bikes 24 hours a day, 365 days a year.",
      'Registration\nTo use GoBike, download our free app and create an account. You will need a mobile phone number and a bank card. You must be at least 16 years old to register. Children aged 12 to 15 can ride a GoBike only if they are with an adult who rents the bike for them.',
      'Prices\nEach ride costs £1 to unlock the bike, plus 10p for every minute you ride. If you use GoBike often, a monthly pass is better value. It costs £12 and includes as many rides as you like, but each ride can only be up to 45 minutes long. After that, you pay 10p per minute again. Students with a valid student card get 30% off the monthly pass.',
      'Taking and returning a bike\nFind a bike in the app, scan the code on the handlebars and the lock will open. At the end of your ride, you must return the bike to a GoBike docking station. The app shows how many free spaces there are at each station. Never leave a bike outside a station, even for a few minutes, or you will have to pay a £20 fine. If the station you arrive at is full, the app will give you 15 extra minutes free to find another one.',
      'Rules\nAlways ride on the road or in cycle lanes. Cycling on the pavement is not allowed, even where there is no cycle lane. We do not provide helmets, but we strongly recommend that you wear one. Only one person may ride each bike. The lights come on automatically when you start riding.',
      'If something goes wrong\nIf your bike is damaged, press the red ‘Report’ button in the app and you will not pay for that ride. If you have an accident, first make sure that you and any other people are safe. If anyone is hurt, call 999. Then phone our 24-hour helpline on 0800 555 0199 as soon as possible, even if the bike does not look damaged. Please do not try to repair a GoBike yourself.',
    ].join('\n\n'),
    statements: [
      {
        text: 'GoBike bikes can be used at night.',
        answer: true,
        explanationCs: 'Kola jsou k dispozici nepřetržitě: „You can use our bikes 24 hours a day, 365 days a year.“',
      },
      {
        text: 'You need a bank card to register.',
        answer: true,
        explanationCs: 'K registraci je potřeba telefonní číslo a platební karta: „You will need a mobile phone number and a bank card.“',
      },
      {
        text: 'A 15-year-old can register for a GoBike account.',
        answer: false,
        explanationCs:
          'Zaregistrovat se lze až od 16 let: „You must be at least 16 years old to register.“ Děti od 12 do 15 let mohou jezdit jen s dospělým.',
      },
      {
        text: 'With a monthly pass, riders never pay for the minutes they ride.',
        answer: false,
        explanationCs:
          'Jízda s měsíční permanentkou je zdarma jen do 45 minut: „After that, you pay 10p per minute again.“',
      },
      {
        text: 'Students pay less for the monthly pass.',
        answer: true,
        explanationCs: '„Students with a valid student card get 30% off the monthly pass.“',
      },
      {
        text: 'Riders get extra time if a docking station has no free spaces.',
        answer: true,
        explanationCs:
          'Když je stanice plná, aplikace dá 15 minut navíc: „the app will give you 15 extra minutes free to find another one“.',
      },
      {
        text: 'Riders may use the pavement if there is no cycle lane.',
        answer: false,
        explanationCs:
          'Po chodníku se jezdit nesmí nikdy: „Cycling on the pavement is not allowed, even where there is no cycle lane.“',
      },
      {
        text: 'Riders must wear a helmet.',
        answer: false,
        explanationCs:
          'Helma není povinná, jen se doporučuje: „we strongly recommend that you wear one“.',
      },
      {
        text: 'Riders do not pay for a ride on a damaged bike if they report it.',
        answer: true,
        explanationCs:
          "Po stisknutí tlačítka Report v aplikaci se jízda neplatí: „press the red ‘Report’ button in the app and you will not pay for that ride“.",
      },
      {
        text: 'After an accident, riders only need to call the helpline if the bike is damaged.',
        answer: false,
        explanationCs:
          'Linku je třeba volat vždy: „as soon as possible, even if the bike does not look damaged“.',
      },
    ],
  },

  part7: {
    introCs:
      'Přečtěte si článek z časopisu. Na základě informací v textu vyberte k úlohám 40–44 jednu správnou odpověď A–D.',
    title: 'Checkmate at Fifteen',
    text: [
      'When Nina Hartley sat down for the last game of the National Junior Chess Championship in March, most people in the room had never heard of her. Five hours later, the fifteen-year-old from a small town in Yorkshire was the new champion – and the first girl to win the under-18 title for twelve years.',
      "Nina's story began in an unusual way. When she was eleven, she broke her leg in a cycling accident and had to stay in bed for six weeks. “I was so bored,” she laughs. “My grandad came to see me every afternoon with his old wooden chess set. At first I played only because there was nothing else to do, and he beat me in every game for a month.” Then one day she won. “He says he let me win, but I still don't believe him.”",
      "When she could walk again, Nina joined the chess club at the local library. She was the youngest player there and the only girl. “Some of the older boys refused to play against me. They thought it was a waste of their time,” she says. “That changed when I started beating them.” The club's coach, Mr Evans, noticed her talent very quickly. “She isn't afraid of losing,” he says. “That's unusual. Most young players are.”",
      "Today Nina practises for about two hours every day after school. She studies famous games, solves chess puzzles and plays online against people from all over the world. But twice a week she also plays football for her school team. “People are surprised, but chess is really tiring,” she explains. “An important game can last five or six hours. If you aren't fit, you can't concentrate at the end, and that's when you make mistakes.”",
      'Her biggest problem used to be nerves. “Before big games, my hands were shaking,” she remembers. Now she goes for a short walk and breathes slowly before every game, and it really helps.',
      "The championship came with a prize of £500. Her friends told her to buy a new laptop, but Nina had a different plan. She is using the money to travel to an international junior tournament in Spain next summer. “My parents can't afford trips like that, so this is my big chance,” she says. “My laptop is old and slow, but it still works.”",
      "So will she become a professional player? Nina shakes her head. “I'll never stop playing, but I don't want chess to be my job. I've wanted to be a vet since I was six.” And her advice for other young players? “Don't be scared of losing. I've lost hundreds of games, and every one of them taught me something.”",
    ].join('\n\n'),
    questions: [
      {
        question: 'How did Nina start playing chess?',
        options: [
          'Her grandfather taught her while she was recovering from an accident.',
          'She joined a chess club at the local library.',
          'She played online against children from other countries.',
          'She had lessons at school when she was six.',
        ],
        answer: 0,
        explanationCs:
          'Šachy ji naučil dědeček, když po nehodě na kole ležela šest týdnů v posteli: „My grandad came to see me every afternoon with his old wooden chess set.“ Do klubu v knihovně se přihlásila až potom.',
      },
      {
        question: 'What happened when Nina first joined the chess club?',
        options: [
          'She was the oldest player in the club.',
          'The coach did not notice her talent.',
          'Some players did not want to play against her.',
          'She lost all her games against the boys.',
        ],
        answer: 2,
        explanationCs:
          '„Some of the older boys refused to play against me.“ Nina byla nejmladší hráčka a trenér si jejího talentu všiml velmi rychle.',
      },
      {
        question: 'Why does Nina play football?',
        options: [
          'Her school friends asked her to join the team.',
          'She needs a break from studying chess.',
          'It helps her feel less nervous before games.',
          'Being fit helps her to concentrate in long games.',
        ],
        answer: 3,
        explanationCs:
          "Dlouhá partie je náročná: „If you aren't fit, you can't concentrate at the end.“ Proti nervozitě jí pomáhá krátká procházka, ne fotbal.",
      },
      {
        question: 'What is Nina doing with her prize money?',
        options: [
          'Buying a new laptop.',
          'Paying for a trip to a tournament abroad.',
          'Giving it to her parents.',
          'Paying for a new chess coach.',
        ],
        answer: 1,
        explanationCs:
          'Peníze použije na cestu na turnaj do Španělska: „She is using the money to travel to an international junior tournament in Spain.“ Nový notebook si koupit nechce.',
      },
      {
        question: 'What does Nina say about her future?',
        options: [
          'She would like to work with animals.',
          'She wants to become a professional chess player.',
          'She is going to stop playing chess.',
          'She hopes to become a chess coach.',
        ],
        answer: 0,
        explanationCs:
          "Nina chce být veterinářkou: „I've wanted to be a vet since I was six.“ Šachy hrát nepřestane, ale nechce, aby byly jejím povoláním.",
      },
    ],
  },

  part8: {
    introCs:
      'Přečtěte si, jakou víkendovou brigádu hledá pět studentů (45–49), a pracovní nabídky (A–G). Ke každému studentovi přiřaďte nabídku, která splňuje všechny jeho požadavky. Dvě nabídky nebudou použity.',
    people: [
      {
        name: 'Poppy',
        text: "Poppy is 17 and wants to become a primary school teacher, so she would like a job working with young children. She plays hockey every Saturday morning, so she is only free on Saturday afternoons and Sundays. She hasn't got a driving licence, so she needs a job she can get to by bus.",
        answer: 3,
        explanationCs:
          'Knihovna nabízí práci s dětmi v neděli odpoledne v centru hned u autobusové zastávky. FunTime Parties vyžaduje řidičský průkaz a věk 18 let a na farmu o víkendu nejezdí autobus.',
      },
      {
        name: 'Ryan',
        text: 'Ryan is 16 and has never had a job before. He wants to work on both Saturday and Sunday to earn as much as he can, but only in the mornings, because he plays in a band in the afternoons. He is very friendly and would like a job where he meets lots of people.',
        answer: 2,
        explanationCs:
          'Kavárna nabízí práci v sobotu i v neděli dopoledne, nevyžaduje zkušenosti, stačí věk 16 let a Ryan bude obsluhovat zákazníky. Recepce i venčení psů vyžadují věk nejméně 17 let.',
      },
      {
        name: 'Chloe',
        text: "Chloe is 17 and loves animals. She is very fit and doesn't mind being outside, even when the weather is bad. She can work on Saturday and Sunday mornings, but she is busy in the afternoons because she looks after her little brother.",
        answer: 5,
        explanationCs:
          'Happy Paws nabízí venčení psů o víkendu dopoledne venku za každého počasí a stačí věk 17 let. Práce se zvířaty na farmě by ji bavila, ale směny jsou odpoledne.',
      },
      {
        name: 'Liam',
        text: "Liam is 19 and is saving money for a trip to Australia, so he wants a job that pays as well as possible. During the day at weekends he helps in his uncle's shop, so he can only work in the evenings. He is quite shy and would prefer not to work with customers.",
        answer: 0,
        explanationCs:
          'Hotelová kuchyně nabízí práci večer, nejlepší plat ve městě (11 liber za hodinu) a žádný kontakt se zákazníky. Všechny ostatní nabídky jsou přes den.',
      },
      {
        name: 'Sara',
        text: 'Sara is 18. She speaks Spanish and French and would love a job where she can use her languages. She is also good with computers. She can only work in the mornings because she goes to an art course in the afternoons. She loves swimming, so a job with sporty extras would be perfect.',
        answer: 4,
        explanationCs:
          'Recepce v Aqua Leisure Centre je dopoledne, vyžaduje cizí jazyk a práci s počítačem a zaměstnanci mohou zdarma do bazénu. V kavárně ani při venčení psů jazyky nevyužije.',
      },
    ],
    offers: [
      {
        title: 'Riverside Hotel – Kitchen Assistant',
        text: 'Our busy hotel restaurant needs a kitchen assistant on Friday, Saturday and Sunday evenings from 6 p.m. to midnight. You will wash dishes, clean the kitchen and help our chefs prepare vegetables. It is hard work, but at £11 an hour our pay is the best in town. You will not have any contact with customers. Applicants must be 18 or over. A free hot dinner every shift!',
      },
      {
        title: 'FunTime Parties – Party Helper',
        text: "Help us make children's birthday parties unforgettable! You will organise games, paint faces and serve food at parties in people's homes all around the region. Parties take place on Saturday afternoons from 2 to 6 p.m. You must be 18 or over and have a driving licence, because you will travel to the parties in our company van. £10 an hour.",
      },
      {
        title: 'The Corner Cup – Café Assistant',
        text: 'Our busy café in the town centre is looking for a friendly weekend assistant to serve customers at the counter and take orders at the tables. Hours: Saturday and Sunday, 7 a.m. to 12 noon. No experience is needed, because we will train you on your first day. Minimum age 16. £7.50 an hour plus tips and a free breakfast.',
      },
      {
        title: 'Easton Central Library – Reading Club Helper',
        text: 'We are looking for a helper for our Sunday reading club for children aged five to nine. You will read stories aloud, help the children choose books and prepare simple art activities. Sundays, 1 to 5 p.m. The library is in the town centre, right next to the main bus stop. Minimum age 16. You should be patient and enjoy working with young children. £8 an hour.',
      },
      {
        title: 'Aqua Leisure Centre – Receptionist',
        text: 'We need a friendly receptionist on Saturday and Sunday mornings, from 7 a.m. to 12 noon. You will welcome visitors, answer the phone and book classes on our computer system, so good computer skills are essential. Many of our visitors are tourists, so you must speak at least one foreign language well. Staff can use the swimming pool and gym free of charge. Minimum age 17. £8.50 an hour.',
      },
      {
        title: 'Happy Paws – Dog Walker',
        text: "Do you love dogs? We walk our customers' dogs while they are busy at the weekend. You will work on Saturday and Sunday mornings from 8 a.m. to 12 noon in the parks and woods around Easton, in sunshine or rain. Some of our dogs are big and strong, so you must be fit enough to walk up to 15 kilometres a day. Minimum age 17. £9 an hour.",
      },
      {
        title: 'Hillside Farm Park – Animal Care Helper',
        text: "Our farm park needs weekend helpers to feed the goats, sheep and chickens, clean the animal houses and answer visitors' questions. Shifts are on Saturday and Sunday afternoons from 1 to 6 p.m. Most of the work is outside, so warm, waterproof clothes are essential. The farm is 8 kilometres outside town and there are no buses at the weekend, so you will need your own transport. Minimum age 16. £7 an hour.",
      },
    ],
  },

  // ── JAZYKOVÁ KOMPETENCE ────────────────────────────────────────────
  part9: {
    introCs:
      'Přečtěte si text o historii pizzy. Do každé mezery (50–59) vyberte jednu správnou možnost A–C.',
    title: 'A Slice of History',
    text: [
      'Pizza is one of {{1}} most popular foods in the world, but its history is much longer than many people think. In ancient Greece and Rome, people already ate flat bread {{2}} oil, herbs and cheese on top. However, the pizza we know today comes from Naples, in the south of Italy. In the eighteenth century, Naples {{3}} a crowded city, and many of its people were poor. They needed cheap food that they could eat quickly, often while they were walking in the street, and pizza was perfect.',
      'Tomatoes had arrived in Europe from the Americas {{4}} the sixteenth century, but at first many Europeans {{5}} they were dangerous to eat. The poor people of Naples were among the first to put them on bread. According to a famous story, in 1889 a pizza maker {{6}} name was Raffaele Esposito cooked for Queen Margherita of Italy. He made a pizza in the colours of the Italian flag: red tomatoes, white mozzarella and green basil. The queen loved it, and the pizza {{7}} named after her.',
      'Pizza travelled to America with Italian families who moved there at the end of the nineteenth century. In 1905, a man called Gennaro Lombardi {{8}} up the first pizzeria in the United States, in New York. After the Second World War, American soldiers who had been to Italy came home hungry for pizza, and it became even {{9}} popular. Since then, pizza {{10}} one of the world\'s favourite foods, and today you can find it almost everywhere, from Tokyo to Prague.',
    ].join('\n\n'),
    gaps: [
      {
        options: ['a', 'the', 'an'],
        answer: 1,
        explanationCs:
          'Ve spojení one of + 3. stupeň přídavného jména používáme určitý člen: one of the most popular foods.',
      },
      {
        options: ['with', 'of', 'by'],
        answer: 0,
        explanationCs: 'Předložka with znamená „s (něčím)“: flat bread with oil … on top = placka s olejem navrchu.',
      },
      {
        options: ['is', 'has been', 'was'],
        answer: 2,
        explanationCs:
          'Jde o ukončený děj v minulosti (v 18. století), proto minulý čas prostý: Naples was a crowded city.',
      },
      {
        options: ['on', 'at', 'in'],
        answer: 2,
        explanationCs: 'Se stoletími, roky a měsíci používáme předložku in: in the sixteenth century.',
      },
      {
        options: ['hoped', 'believed', 'wondered'],
        answer: 1,
        explanationCs:
          'Believe = věřit, domnívat se: Evropané si mysleli, že rajčata jsou nebezpečná. Hope (doufat) nedává smysl a po wonder by muselo následovat if.',
      },
      {
        options: ['whose', 'who', 'which'],
        answer: 0,
        explanationCs:
          'Whose vyjadřuje přivlastnění (jehož, jejíž): a pizza maker whose name was… = pekař, který se jmenoval…',
      },
      {
        options: ['has', 'was', 'did'],
        answer: 1,
        explanationCs: 'Trpný rod v minulém čase: the pizza was named after her = pizza byla pojmenována po ní.',
      },
      {
        options: ['took', 'gave', 'set'],
        answer: 2,
        explanationCs:
          'Frázové sloveso set up = založit (firmu, podnik). Take up znamená „začít s koníčkem“ a give up „vzdát se“.',
      },
      {
        options: ['more', 'most', 'much'],
        answer: 0,
        explanationCs:
          'Popular je dlouhé přídavné jméno, 2. stupeň tvoří s more: even more popular = ještě oblíbenější.',
      },
      {
        options: ['became', 'becomes', 'has become'],
        answer: 2,
        explanationCs: 'Since then (od té doby až dodnes) vyžaduje předpřítomný čas: pizza has become…',
      },
    ],
  },

  part10: {
    introCs:
      'Přečtěte si text. Do každé mezery (60–64) doplňte jedno slovo, které tam gramaticky i významově patří. Mezera 0 je příklad.',
    title: 'The Wrong Address',
    text: [
      'Last Saturday my best friend Sam turned eighteen, and I {{0}} invited to his party. He told me the address was 14 Elm Road, so I went there {{1}} bus with a big chocolate cake. A smiling woman opened the door. “Come in,” she said. “Everyone is in the garden.” Outside there was {{2}} enormous table full of food. About thirty people were standing around it, but I didn\'t recognise any of {{3}}. I thought they were Sam\'s relatives, so I chatted to them and ate some sandwiches.',
      'Then an old lady came over to me. “Oh, {{4}} you brought that cake for me?” she asked. “It\'s my ninetieth birthday today!” Suddenly I realised my mistake: I was in Elm Street, not Elm Road! I gave her the cake and hurried to the right house. When I told Sam and his friends the story, they couldn\'t stop {{5}}.',
    ].join('\n\n'),
    example: 'was',
    gaps: [
      {
        accept: ['by'],
        explanationCs: 'By bus = autobusem; u dopravních prostředků bez členu používáme předložku by.',
      },
      {
        accept: ['an'],
        explanationCs: 'Neurčitý člen před slovem začínajícím samohláskou: an enormous table.',
      },
      {
        accept: ['them'],
        explanationCs: 'Předmětové zájmeno 3. osoby množného čísla: any of them = nikoho z nich.',
      },
      {
        accept: ['have'],
        explanationCs:
          'Otázka v předpřítomném čase: Have you brought…? Tvar brought je příčestí minulé, s did by muselo následovat bring.',
      },
      {
        accept: ['laughing', 'giggling'],
        explanationCs: "Po slovese stop následuje tvar -ing: they couldn't stop laughing = nemohli se přestat smát.",
      },
    ],
  },
};
