import type { ExamSet } from '../../exam/types';

/**
 * Cvičný test B — original practice test in the format of the CERMAT
 * didaktický test (anglický jazyk). All texts and recordings were written for this app.
 */
export const SET_B: ExamSet = {
  id: 'set-b',
  title: 'Cvičný test B',
  descriptionCs:
    'Sport, počasí, domácí mazlíček a kavárna, kurz vaření, městský půlmaraton, hostel u jezera, mladý vynálezce, prázdninové chaty, historie jízdního kola a ztracený pes.',

  // ── POSLECH ────────────────────────────────────────────────────────
  part1: {
    items: [
      {
        question: 'Which sport did Jake try for the first time at the weekend?',
        script: [
          'W: Hi Jake! How was your weekend? Did you play tennis at the club again?',
          'M: Not this time. My cousin wanted to take me horse riding, but the stables were closed because of the rain.',
          'W: Oh no. So what did you do in the end?',
          "M: We went to the new indoor climbing centre instead. I'd never tried it before, and it was brilliant. My arms still hurt!",
          "W: Sounds fun. The only sport I've done this month is swimming.",
          'M: Come with us next time, then!',
        ].join('\n'),
        options: [
          { emoji: '🎾', caption: 'Playing tennis' },
          { emoji: '🏇', caption: 'Horse riding' },
          { emoji: '🧗', caption: 'Indoor climbing' },
          { emoji: '🏊', caption: 'Going swimming' },
        ],
        answer: 2,
        explanationCs:
          'Jake poprvé zkusil lezení: „We went to the new indoor climbing centre instead. I\'d never tried it before.“ Na koně nešel, protože stáje byly zavřené, a tenis tentokrát nehrál.',
      },
      {
        question: 'What will the weather be like on Saturday afternoon?',
        script: [
          'M: Are we still having the picnic in the park on Saturday?',
          "W: Yes, I think so. I checked the forecast this morning. It'll be quite windy on Saturday morning, but the wind should stop by lunchtime.",
          'M: What about rain? It rained all day yesterday.',
          "W: Don't worry, there's no rain this weekend. In the afternoon it'll be sunny and warm, about twenty-two degrees.",
          'M: Perfect. And what about Sunday?',
          'W: Cloudy and much colder, so Saturday is definitely better.',
        ].join('\n'),
        options: [
          { emoji: '☀️😎', caption: 'Sunny and warm' },
          { emoji: '🌧️☂️', caption: 'Rainy all day' },
          { emoji: '💨🌳', caption: 'Very windy' },
          { emoji: '☁️🧣', caption: 'Cloudy and cold' },
        ],
        answer: 0,
        explanationCs:
          'Odpoledne bude „sunny and warm, about twenty-two degrees“. Vítr bude jen dopoledne, déšť o víkendu nebude a zataženo a chladno bude až v neděli.',
      },
      {
        question: "What new pet has Tom's family got?",
        script: [
          "W: Hi Tom. I heard you've got a new pet. Is it a dog? You always wanted one.",
          'M: I did, but Dad says a dog needs too much time. And my sister is allergic to cats.',
          'W: So what did you get? A rabbit?',
          'M: We nearly took a rabbit from the animal shelter, but in the end we chose a tortoise. She\'s fifteen years old and her name is Rocket.',
          "W: Rocket? That's a funny name for a tortoise!",
          "M: I know. She's the slowest animal I've ever seen.",
        ].join('\n'),
        options: [
          { emoji: '🐕', caption: 'A dog' },
          { emoji: '🐈', caption: 'A cat' },
          { emoji: '🐇', caption: 'A rabbit' },
          { emoji: '🐢', caption: 'A tortoise' },
        ],
        answer: 3,
        explanationCs:
          'Rodina si nakonec vybrala želvu: „in the end we chose a tortoise“. Pes by vyžadoval moc času, sestra je alergická na kočky a králíka si nakonec nevzali.',
      },
      {
        question: 'What does the woman order in the end?',
        script: [
          'M: Good morning. What can I get you?',
          "W: Hi. I'd like a hot chocolate, please, and a piece of apple cake.",
          "M: I'm sorry, there's no apple cake left. We've got cheesecake or chocolate muffins.",
          "W: I don't really like cheesecake, so I'll have a muffin. But then can I change my drink to a cup of tea? A muffin and a hot chocolate is too much chocolate for me.",
          "M: No problem. So that's one tea and one chocolate muffin.",
          "W: That's right, thanks.",
        ].join('\n'),
        options: [
          { emoji: '🍫☕ 🍎🍰', caption: 'Hot chocolate and apple cake' },
          { emoji: '🫖 🧁', caption: 'Tea and a muffin' },
          { emoji: '🫖 🍰', caption: 'Tea and cheesecake' },
          { emoji: '🍫☕ 🧁', caption: 'Hot chocolate and a muffin' },
        ],
        answer: 1,
        explanationCs:
          'Jablečný koláč došel, a tak si vzala muffin a pití změnila na čaj: „So that\'s one tea and one chocolate muffin.“',
      },
    ],
  },

  part2: {
    introCs:
      'Uslyšíte rozhovor dvou kamarádů o večerním kurzu vaření. Na základě vyslechnuté nahrávky rozhodněte, zda jsou tvrzení 5–12 pravdivá (P), nebo nepravdivá (N).',
    script: [
      'W: Hi Adam! So, what did you think of our first cooking lesson last night?',
      "M: I loved it, Lucy. To be honest, I didn't expect much. I thought it would be boring, like a school lesson, but it was really good fun.",
      'W: I know! And Rosa is a great teacher. She explains everything so clearly, and she never gets angry when we make mistakes.',
      'M: Which is lucky for me. Did you see my rice? I left it on the cooker for too long and it burnt at the bottom.',
      "W: Don't worry, it happens to everyone. My sauce was far too salty, remember? Rosa had to add some cream to save it.",
      'M: Yes, but in the end the chicken curry tasted fantastic. And the flatbread was much easier to make than I thought.',
      'W: Did you take your food home?',
      'M: I did, in one of those little boxes. I wanted to have it for breakfast, but my brother found it in the fridge and ate the whole thing before I got up.',
      'W: Oh no! I had mine for lunch today. It was even better the next day.',
      'M: By the way, how much did you pay for the course? I paid seventy pounds for eight lessons.',
      "W: It's the same for everyone, but I didn't pay it myself. It was a birthday present from my aunt. She knows I can only make pasta and toast.",
      "M: Lucky you. Who were you cooking with last night? I was with that older man, Peter. He used to be a bus driver, and he says he's never cooked anything in his life.",
      "W: I was with Hannah, the girl who works at the bank. She's really nice, but she's very slow at cutting vegetables.",
      "M: Do you know what we're making next week?",
      "W: Rosa said we're going to make fish soup, and then something sweet. A chocolate cake, I think.",
      "M: Fish? I'm not sure about that. I don't really eat fish.",
      "W: Oh, come on, you should try it. Anyway, I want to learn as much as I can. In December it's my parents' twenty-fifth wedding anniversary, and I'd like to cook them a special dinner.",
      "M: That's a lovely idea. Maybe I can help you with the dessert.",
      'W: Only if you promise not to burn it!',
    ].join('\n'),
    statements: [
      {
        text: 'Before the first lesson, Adam expected to enjoy the course.',
        answer: false,
        explanationCs:
          'Adam čekal, že kurz bude nudný: „I didn\'t expect much. I thought it would be boring, like a school lesson.“',
      },
      {
        text: 'Rosa is patient with her students.',
        answer: true,
        explanationCs:
          'Rosa se nezlobí, když studenti dělají chyby: „she never gets angry when we make mistakes“.',
      },
      {
        text: 'Lucy put too much salt in her sauce.',
        answer: true,
        explanationCs: 'Lucy říká: „My sauce was far too salty.“ Rosa pak musela omáčku zachránit smetanou.',
      },
      {
        text: 'Adam had his curry for breakfast this morning.',
        answer: false,
        explanationCs:
          'Adam to sice chtěl, ale jídlo snědl jeho bratr: „my brother found it in the fridge and ate the whole thing“.',
      },
      {
        text: "Lucy's course was paid for by a relative.",
        answer: true,
        explanationCs: 'Kurz Lucy zaplatila teta: „It was a birthday present from my aunt.“',
      },
      {
        text: 'Peter has a lot of cooking experience.',
        answer: false,
        explanationCs: 'Peter nikdy nevařil: „he says he\'s never cooked anything in his life“.',
      },
      {
        text: 'The students are going to cook fish in the next lesson.',
        answer: true,
        explanationCs: 'Příští týden budou vařit rybí polévku: „we\'re going to make fish soup“.',
      },
      {
        text: 'Lucy wants to cook a birthday dinner for her parents.',
        answer: false,
        explanationCs:
          'Lucy chce vařit k výročí svatby rodičů, ne k narozeninám: „my parents\' twenty-fifth wedding anniversary“.',
      },
    ],
  },

  part3: {
    introCs:
      'Uslyšíte rozhlasovou zprávu o půlmaratonu, který se bude konat příští měsíc. Na základě vyslechnuté nahrávky odpovězte na otázky 13–20. Odpovídejte nejvýše třemi slovy; čísla můžete psát číslicemi.',
    script: [
      "M: Good morning, and welcome back to Riverton Radio. If you enjoy running, or you just like watching, here's some exciting news for you. The Riverton Half-Marathon is coming back next month, on Sunday the eighteenth of October.",
      "M: This year the race starts at nine o'clock in front of the cathedral, not at the railway station like last year. The runners will go along the river, then through Victoria Park, and they'll finish at the football stadium. The route is twenty-one kilometres long, and it's quite flat, so it's a good race for beginners too.",
      "M: If you'd like to take part, you need to register on the race website. There's space for three thousand runners, and more than half of the places have already gone, so don't wait too long. Registration costs twenty-five pounds, but students pay only fifteen pounds. Please remember that all runners must be at least sixteen years old. For younger children, there's a family fun run of three kilometres on the Saturday afternoon.",
      'M: So, what can you win? Every runner who finishes will get a medal and a T-shirt. And the fastest man and the fastest woman will each win a mountain bike from Hill\'s Bikes on King Street.',
      "M: The race is also helping a good cause this year. Five pounds from every registration goes to Riverton Children's Hospital. The hospital wants to build a garden where young patients and their families can relax outside. Last year the runners raised twelve thousand pounds, and this year the organisers hope to raise even more.",
      "M: Finally, some important information for drivers. On the day of the race, Bridge Street will be closed from seven in the morning until two in the afternoon. Market Square will be closed too, but only until eleven. Buses will use different routes, so please check the timetable before you travel. If you're coming to watch by car, you can park for free at the shopping centre, and a special bus will take you into the town centre every ten minutes.",
      "M: The organisers are also looking for volunteers to give out water to the runners, so if you'd like to help, please visit the website. That's all from me for now. Here's some music.",
    ].join('\n'),
    questions: [
      {
        question: 'Where does the race start?',
        prefix: 'in front of',
        accept: ['the cathedral', 'cathedral'],
        explanationCs:
          '„This year the race starts at nine o\'clock in front of the cathedral, not at the railway station like last year.“ U nádraží se startovalo loni.',
      },
      {
        question: 'Which park will the runners go through?',
        accept: ['Victoria Park', 'Victoria'],
        explanationCs: '„The runners will go along the river, then through Victoria Park.“',
      },
      {
        question: 'How much do students pay for registration?',
        prefix: '£',
        accept: ['15', 'fifteen', '£15', '15 pounds', 'fifteen pounds'],
        explanationCs:
          '„Registration costs twenty-five pounds, but students pay only fifteen pounds.“ Částku 25 liber platí ostatní běžci.',
      },
      {
        question: 'How old must the runners be at least?',
        suffix: 'years old',
        accept: ['16', 'sixteen', '16 years', 'sixteen years', '16 years old'],
        explanationCs: '„All runners must be at least sixteen years old.“',
      },
      {
        question: 'What will the fastest man and the fastest woman each win?',
        accept: [
          'a mountain bike',
          'mountain bike',
          'mountain bikes',
          'a bike',
          'bike',
        ],
        explanationCs:
          '„The fastest man and the fastest woman will each win a mountain bike.“ Medaili a tričko dostane každý, kdo doběhne.',
      },
      {
        question: 'What does the hospital want to build?',
        accept: ['a garden', 'garden', 'a new garden'],
        explanationCs:
          '„The hospital wants to build a garden where young patients and their families can relax outside.“',
      },
      {
        question: 'Which street will be closed until 2 p.m.?',
        accept: ['Bridge Street', 'Bridge St', 'Bridge St.'],
        explanationCs:
          '„Bridge Street will be closed from seven in the morning until two in the afternoon.“ Market Square bude uzavřené jen do 11 hodin.',
      },
      {
        question: 'Where can people who come by car park for free?',
        accept: [
          'the shopping centre',
          'shopping centre',
          'the shopping center',
          'shopping center',
        ],
        explanationCs: '„If you\'re coming to watch by car, you can park for free at the shopping centre.“',
      },
    ],
  },

  part4: {
    items: [
      {
        question: 'Why is the flight to Dublin delayed?',
        script: [
          'W: Good afternoon. This is an announcement for passengers travelling to Dublin on flight number four seven two. We are sorry, but this flight is delayed. The weather in Dublin is fine, but there is a small technical problem with the plane, and our engineers are checking it now. The new departure time is a quarter to five. Please note that the flight will now leave from gate twelve, not gate twenty-one. Passengers can collect a free sandwich and a drink at the information desk. Thank you.',
        ].join('\n'),
        options: [
          'The weather in Dublin is bad.',
          'There is a problem with the plane.',
          'The pilots have not arrived yet.',
          'The gate has been changed.',
        ],
        answer: 1,
        explanationCs:
          'Let má zpoždění kvůli technické závadě: „there is a small technical problem with the plane“. Počasí v Dublinu je dobré a změna brány důvodem zpoždění není.',
      },
      {
        question: 'What will the weather be like on Saturday?',
        script: [
          "M: And now the weather for the weekend. Friday will be grey and wet everywhere, with heavy rain in the afternoon. On Saturday the rain will move away to the east, and most of us will have a dry and sunny day. It will be quite cold in the morning, only about five degrees, but it will feel much warmer by the afternoon. On Sunday, strong winds will arrive from the west, so if you're planning a trip to the coast, Saturday is the better day.",
        ].join('\n'),
        options: [
          'Wet in the afternoon.',
          'Very windy near the coast.',
          'Warm all day.',
          'Cold at first, but warmer later.',
        ],
        answer: 3,
        explanationCs:
          'V sobotu bude ráno chladno (asi 5 stupňů), ale odpoledne tepleji: „it will feel much warmer by the afternoon“. Déšť bude v pátek a silný vítr v neděli.',
      },
      {
        question: "If Mr Grant doesn't call back, when will he see the dentist?",
        script: [
          "W: Hello, this is a message for Mr Oliver Grant from Parkside Dental Practice. You have an appointment with Doctor Evans on Thursday at half past ten. Unfortunately, Doctor Evans is ill this week, so we need to move your appointment. We can offer you the same time next Monday, or Thursday at four o'clock with Doctor Brown. Please call us back before Wednesday to tell us which you prefer. If we don't hear from you, we'll book the Monday appointment for you. Thank you, goodbye.",
        ].join('\n'),
        options: ['On Monday at 10.30.', 'On Thursday at 10.30.', 'On Thursday at 4.00.', 'On Wednesday at 4.00.'],
        answer: 0,
        explanationCs:
          '„If we don\'t hear from you, we\'ll book the Monday appointment for you.“ Pondělní termín je „the same time“, tedy v 10.30.',
      },
      {
        question: 'How much will the man pay for both tickets?',
        script: [
          'M: Hello. Two return tickets to Oxford, please.',
          'W: Are you coming back today?',
          'M: No, on Sunday evening.',
          "W: OK, then it's forty-two pounds each. But if you've got a railcard, it's a third cheaper.",
          "M: I've got a student railcard, but my friend hasn't.",
          "W: Right, so that's twenty-eight pounds for you and forty-two for your friend.",
          'M: Great. Can I pay by card?',
          'W: Of course. The next train leaves at ten past eleven from platform three.',
        ].join('\n'),
        options: ['£28', '£42', '£70', '£84'],
        answer: 2,
        explanationCs:
          'Muž platí se slevou 28 liber a jeho kamarád plnou cenu 42 liber: „twenty-eight pounds for you and forty-two for your friend“, tedy celkem 70 liber.',
      },
    ],
  },

  // ── ČTENÍ ──────────────────────────────────────────────────────────
  part5: {
    items: [
      {
        kind: 'Notice',
        text: [
          'FOUND IN THE LIBRARY',
          'A pair of glasses in a blue case was found on a table on the second floor of Greenhill Library on Tuesday afternoon. If they are yours, please come to the front desk and describe the case to a member of staff. We will keep the glasses until the end of the month. After that, they will go to a charity shop. Please note that the front desk is closed on Sundays.',
        ].join('\n'),
        question: 'What should the owner of the glasses do?',
        options: [
          'Go to the second floor on Tuesday.',
          'Phone the library before Sunday.',
          'Look for them in a charity shop.',
          'Say what the case looks like.',
        ],
        answer: 3,
        explanationCs:
          'Majitel má přijít k pultu a popsat pouzdro: „please come to the front desk and describe the case“.',
      },
      {
        kind: 'Social media post',
        text: [
          'Ella Morgan · 2 hours ago',
          "I finally did it! After three months of practising every weekend, I passed my driving test this morning. I failed the first time in June because I was so nervous that I forgot to look in the mirror. A big thank you to my dad, who sat next to me for hours and never shouted once, and to my instructor, Jo. Tonight I'm driving my little brother to football training. He doesn't know yet that he's paying for the petrol!",
        ].join('\n'),
        question: 'What do we learn about Ella?',
        options: [
          'She passed her test the first time.',
          'Her father helped her to practise.',
          'She failed in June because of bad weather.',
          'Her brother is paying for her driving lessons.',
        ],
        answer: 1,
        explanationCs:
          'Ella děkuje tátovi, který s ní trávil hodiny v autě: „my dad, who sat next to me for hours and never shouted once“. Poprvé neuspěla kvůli nervozitě.',
      },
      {
        kind: 'Menu',
        text: [
          "THE BLUE KETTLE CAFÉ – TODAY'S NOTES",
          'Next week we are changing to a new menu, so until Sunday all our pizzas are 20% cheaper. Sorry, our popular tomato soup is not available today, but why not try our new pumpkin soup instead? All our desserts are homemade. Please tell our staff if you have any food allergies. On Sundays, children under ten eat free with every adult meal.',
        ].join('\n'),
        question: 'What is true about the café today?',
        options: [
          'Pizzas cost less than usual.',
          'You can order tomato soup.',
          'Children always eat for free.',
          'The new menu has already started.',
        ],
        answer: 0,
        explanationCs:
          '„Until Sunday all our pizzas are 20% cheaper.“ Rajčatová polévka dnes není, nové menu začne až příští týden a děti jedí zdarma jen v neděli.',
      },
      {
        kind: 'Text message',
        text: "Hi Mia, I'm really sorry, but I can't meet you at the cinema at 7. My boss wants me to stay at work until 8. Could we go to the 8.45 show instead? I've already bought tickets for 7 online, but I'll call the cinema and ask them to change them. If they can't, let's just get a pizza and see the film another day. Let me know! Kate",
        question: 'Why is Kate writing to Mia?',
        options: [
          'To invite her to a pizza restaurant.',
          'To ask her to buy the cinema tickets.',
          'To suggest meeting later.',
          'To tell her the film has been cancelled.',
        ],
        answer: 2,
        explanationCs:
          'Kate navrhuje pozdější představení: „Could we go to the 8.45 show instead?“ Pizza je jen náhradní plán.',
      },
      {
        kind: 'Club announcement',
        text: [
          'GREENFIELD SWIMMING CLUB',
          'From Monday 3rd November, training for juniors (ages 8–12) will start at 5.30 p.m. instead of 5 p.m., because a local school is using the pool until then. Training times for seniors will stay the same. All members must pay the winter fee of £30 by the end of October. New members are always welcome – come and try a free session on any Wednesday.',
        ].join('\n'),
        question: 'What is changing at the swimming club?',
        options: [
          'The price of the winter fee.',
          'The day of the free session.',
          'The training times for seniors.',
          'The start time for younger swimmers.',
        ],
        answer: 3,
        explanationCs:
          'Mění se začátek tréninku juniorů (8–12 let): „will start at 5.30 p.m. instead of 5 p.m.“ Tréninky seniorů zůstávají stejné.',
      },
    ],
  },

  part6: {
    introCs:
      'Přečtěte si informace o hostelu u jezera. Na základě textu rozhodněte, zda jsou tvrzení 30–39 pravdivá (P), nebo nepravdivá (N).',
    title: 'Lake Carrow Youth Hostel',
    text: [
      'Welcome to Lake Carrow Youth Hostel, a friendly place to stay right on the shore of one of the most beautiful lakes in the north of England. The hostel is a ten-minute walk from the Carrow Bridge bus stop, and there is free parking for guests who arrive by car.',
      'Rooms\nWe have 18 rooms with space for 72 guests. Most rooms have four beds, but there are also two larger rooms with eight beds, which are popular with school groups. Every room has its own shower and toilet. Towels are not included, but you can rent one at reception for £2.',
      'Prices\nA bed in a four-bed room costs £24 per night. If you want a private room, you can book a whole four-bed room for £80 per night. Guests under 18 get a 10% discount, and members of the Youth Hostel Association pay £3 less per night.',
      'Breakfast and meals\nBreakfast is served from 7.30 to 9.30 a.m. in our dining room, which has a wonderful view of the lake. It is not included in the price and costs £6. Guests can also cook their own meals in the guest kitchen, which is open from 7 a.m. to 10 p.m. If you want a packed lunch for a day out, please order it at reception the evening before.',
      'Activities\nFrom May to September you can rent kayaks and bikes at the hostel. Kayaks can be used from 9 a.m. to 6 p.m., and everyone on the water must wear a life jacket, which we lend you free of charge. Swimming is allowed only near our small beach, because the water in the middle of the lake is very deep and cold. Every Friday evening, a local guide takes guests on a free night walk to look for owls.',
      'House rules\nPlease be quiet after 11 p.m. Smoking is not allowed anywhere in the building. Dogs are welcome, but only in the two rooms on the ground floor, and they may not enter the dining room.',
      'Check-in and check-out\nYou can check in between 3 p.m. and 9 p.m. If you are going to arrive later, please phone us in advance. Guests who arrive early can leave their luggage at reception. On the day you leave, please empty your room by 10 a.m.',
    ].join('\n\n'),
    statements: [
      {
        text: 'Guests who come by car have to pay for parking.',
        answer: false,
        explanationCs: 'Parkování je zdarma: „there is free parking for guests who arrive by car“.',
      },
      {
        text: 'Every room has its own bathroom.',
        answer: true,
        explanationCs: 'Každý pokoj má vlastní sprchu a toaletu: „Every room has its own shower and toilet.“',
      },
      {
        text: 'Guests under 18 pay less than adults.',
        answer: true,
        explanationCs: '„Guests under 18 get a 10% discount.“',
      },
      {
        text: 'Guests can use the kitchen at any time of the day or night.',
        answer: false,
        explanationCs: 'Kuchyňka je otevřená jen v určitou dobu: „open from 7 a.m. to 10 p.m.“',
      },
      {
        text: 'Packed lunches have to be ordered one day in advance.',
        answer: true,
        explanationCs: 'Balíček s obědem je třeba objednat „the evening before“, tedy den předem.',
      },
      {
        text: 'Guests have to pay extra for a life jacket.',
        answer: false,
        explanationCs: 'Záchrannou vestu hostel půjčuje zdarma: „which we lend you free of charge“.',
      },
      {
        text: 'Guests are allowed to swim anywhere in the lake.',
        answer: false,
        explanationCs: 'Koupat se smí jen u malé pláže: „Swimming is allowed only near our small beach.“',
      },
      {
        text: 'Guests do not have to pay for the Friday night walk.',
        answer: true,
        explanationCs: 'Páteční noční procházka je zdarma: „a local guide takes guests on a free night walk“.',
      },
      {
        text: 'Dogs can stay in any room in the hostel.',
        answer: false,
        explanationCs: 'Psi smějí jen do dvou pokojů v přízemí: „only in the two rooms on the ground floor“.',
      },
      {
        text: 'Guests who arrive before 3 p.m. can leave their bags at the hostel.',
        answer: true,
        explanationCs:
          'Ubytování začíná v 15 hodin, ale zavazadla lze nechat dříve: „Guests who arrive early can leave their luggage at reception.“',
      },
    ],
  },

  part7: {
    introCs:
      'Přečtěte si článek z časopisu. Na základě informací v textu vyberte k úlohám 40–44 jednu správnou odpověď A–D.',
    title: 'The Kettle That Keeps Grandma Safe',
    text: [
      'When sixteen-year-old Daniel Price visited his grandmother one cold morning last winter, he found her sitting on the kitchen floor. She had fallen early that morning and could not get up. “She was there for almost five hours,” Daniel remembers. “Her phone was in the bedroom and she couldn\'t reach it. I felt terrible that nobody knew.”',
      'Luckily, his grandmother, Rose, was not badly hurt, but the experience made Daniel think. Many older people wear a special alarm button around their neck, but Rose never liked hers. “It made her feel old and ill, so she kept it in a drawer,” he explains. Daniel wanted to find a solution that his grandmother would not even notice.',
      'Then he had an idea. “Every morning of her life, Grandma has made a cup of tea. So I thought: what if the kettle could tell us that she\'s OK?” Daniel designed a small plastic box that sits under the kettle and notices when someone lifts it. If nobody uses the kettle by ten o\'clock in the morning, the box automatically sends a text message to three members of the family.',
      'Building it was not easy. Daniel had learned some basic programming at an after-school club, but he had never made anything electronic before. He watched online videos, asked his physics teacher for advice and failed many times. “The first version sent my mum twenty messages in one minute,” he laughs. After four months of work, the box finally worked properly. All the parts together cost less than fifteen pounds.',
      'In the spring, Daniel\'s teacher encouraged him to enter a national competition for young inventors. Out of more than six hundred projects, his ‘Kettle Friend’ won first prize. Since then, over fifty families have asked him to build one for them, and a large electronics company has offered to produce it. Daniel hasn\'t said yes yet. “I want it to stay cheap,” he says. “It should be for everyone, not only for people with lots of money.”',
      'And what does Rose think? “At first I told him it was a silly idea,” she admits. “Now I\'m really proud of it. I show it to all my friends at the café.”',
      'Daniel hopes to study engineering at university one day. But first, he has another job to do: Rose\'s neighbour wants a Kettle Friend too.',
    ].join('\n\n'),
    questions: [
      {
        question: "Why didn't Rose wear her alarm button?",
        options: [
          'It made her feel old.',
          'It was too expensive.',
          'She could not reach it.',
          'It did not work properly.',
        ],
        answer: 0,
        explanationCs:
          '„It made her feel old and ill, so she kept it in a drawer.“ Že na něco nemohla dosáhnout, se v textu říká o telefonu.',
      },
      {
        question: 'How does the Kettle Friend work?',
        options: [
          'It sends a message every time Rose makes tea.',
          'It makes a loud noise if Rose falls.',
          'It sends a text if the kettle is not used by 10 a.m.',
          'It reminds Rose to make tea every morning.',
        ],
        answer: 2,
        explanationCs:
          '„If nobody uses the kettle by ten o\'clock in the morning, the box automatically sends a text message to three members of the family.“',
      },
      {
        question: 'What do we learn about how Daniel made the box?',
        options: [
          'His physics teacher built most of it.',
          'It took him several months to finish it.',
          'He had made electronic things before.',
          'It cost more than he had expected.',
        ],
        answer: 1,
        explanationCs:
          '„After four months of work, the box finally worked properly.“ Učitel fyziky mu jen radil a nic elektronického Daniel předtím nevyrobil.',
      },
      {
        question: "Why hasn't Daniel accepted the company's offer yet?",
        options: [
          'He wants to sell the idea to a different company.',
          'The company offered him too little money.',
          'He is too busy with his school work.',
          'He is worried that the device would become expensive.',
        ],
        answer: 3,
        explanationCs:
          'Daniel chce, aby zařízení zůstalo levné a dostupné pro všechny: „I want it to stay cheap. It should be for everyone.“',
      },
      {
        question: 'How does Rose feel about the Kettle Friend now?',
        options: [
          'She still thinks it is a silly idea.',
          'She is proud of it.',
          'She is embarrassed to show it to people.',
          'She prefers her old alarm button.',
        ],
        answer: 1,
        explanationCs:
          '„Now I\'m really proud of it.“ Za hloupý nápad ho Rose považovala jen zpočátku („At first“).',
      },
    ],
  },

  part8: {
    introCs:
      'Přečtěte si, co hledá pět rodin (45–49), a nabídky prázdninových chat (A–G). Ke každé rodině přiřaďte chatu, která splňuje všechny její požadavky. Dvě nabídky nebudou použity.',
    people: [
      {
        name: 'The Wilsons',
        text: 'Mark and Julie Wilson have three children aged four, seven and ten. They want to spend a week close to the sea, so that the children can walk to the beach every morning. The kids also need a safe outdoor space where they can play in the evenings. The family can spend up to £900.',
        answer: 3,
        explanationCs:
          'Seagull Cottage je dvě minuty od pláže, má oplocenou zahradu pro děti, vejde se do ní šest lidí a stojí 850 liber. Harbour View Apartment je sice u moře, ale nemá zahradu.',
      },
      {
        name: 'The Hughes family',
        text: "Anna and Chris Hughes are taking Chris's mother on holiday with them. She is eighty-two and finds stairs very difficult, so she needs a bedroom on the ground floor. Anna and Chris love walking in the hills, and they never go anywhere without their dog, Biscuit.",
        answer: 6,
        explanationCs:
          'Hillside Barn nemá žádné schody, stezky do kopců začínají přímo u dveří a psi jsou vítáni. Mountain Lodge má všechny ložnice v patře.',
      },
      {
        name: 'The Browns',
        text: "Helen Brown and her two teenage sons don't have a car, so they need a cottage they can easily reach by train. They plan to go cycling every day, but they can't take their own bikes with them. They don't want to pay more than £600 for the week.",
        answer: 0,
        explanationCs:
          'Station Cottage je pět minut od nádraží, majitelé půjčují kola zdarma a stojí 550 liber. Ostatní nabídky jsou dražší nebo je k nim potřeba auto.',
      },
      {
        name: 'The Patels',
        text: 'Nine members of the Patel family, from the grandparents to the grandchildren, are meeting for a week together. The children want to swim every day, but not in a busy public pool. The adults would like to cook big dinners and eat together at one table.',
        answer: 4,
        explanationCs:
          'Oak Farmhouse má místo pro deset lidí, vyhřívaný bazén jen pro hosty a jídelní stůl pro dvanáct osob. Mountain Lodge má místo jen pro osm lidí a ostatní chaty jsou ještě menší.',
      },
      {
        name: 'The Greens',
        text: 'Sophie and Tom Green are going on holiday with their baby daughter. They are looking for a quiet place with no neighbours nearby. Tom loves fishing and wants to go every morning. He also has to work online for an hour or two each day.',
        answer: 2,
        explanationCs:
          'Willow Lodge stojí osamoceně u jezera, nabízí loďku a vybavení na rybaření i rychlé Wi-Fi. Mountain Lodge je také klidná a u řeky, ale nemá internet, a Hillside Barn nemá Wi-Fi ani možnost rybaření.',
      },
    ],
    offers: [
      {
        title: 'Station Cottage',
        text: 'This pretty cottage sleeps four and is only five minutes\' walk from Ashby railway station, with direct trains from London. The owners leave four bikes and helmets in the garden shed for guests to use free of charge, and there are quiet cycle paths all around the flat valley. There are shops and a pub in the village. No pets, please. £550 per week.',
      },
      {
        title: 'Mountain Lodge',
        text: 'High in the mountains, this large wooden lodge sleeps up to eight people. All four bedrooms are upstairs. It is a wonderful base for walking, and dogs are welcome. There is a river nearby for fishing, and there are no neighbours for miles. Please note: there is no internet or mobile signal here, and you will need a car for the steep road. £1,200 per week.',
      },
      {
        title: 'Willow Lodge',
        text: 'Willow Lodge stands alone on the edge of Lake Elmwater, with no other houses within two kilometres. It has one double bedroom and a baby\'s cot, and a small boat and fishing equipment are included. There is fast Wi-Fi, and the living room has a desk with a view of the water. A car is essential. Sorry, no pets. £620 per week.',
      },
      {
        title: 'Seagull Cottage',
        text: 'This bright cottage in the lively seaside village of Porthmoor sleeps six in three bedrooms. A sandy beach is just two minutes\' walk down the lane. Behind the house there is a large garden with a fence all around it, a swing and a small football goal – perfect for young children. Sorry, no pets. £850 per week.',
      },
      {
        title: 'Oak Farmhouse',
        text: 'Bring the whole family to this large farmhouse, which sleeps ten in five bedrooms. The children will love the heated outdoor swimming pool, which is only for our guests, and the animals on the farm next door. The big kitchen has two ovens and a dining table for twelve people. The farmhouse is in flat countryside, forty kilometres from the coast. £1,800 per week.',
      },
      {
        title: 'Harbour View Apartment',
        text: 'Enjoy lovely views of the boats from the balcony of this modern second-floor apartment in the busy centre of Kingsport. It sleeps five, and there are lots of cafés, shops and restaurants right outside the door. The beach is a ten-minute walk away, and a bus to the railway station stops outside. There is no garden, and pets are not allowed. £780 per week.',
      },
      {
        title: 'Hillside Barn',
        text: 'This old stone barn has been turned into a comfortable home for four people. Everything is on one level, so there are no stairs at all. Walking paths into the hills start right from the front door, and there are maps in the kitchen. Well-behaved dogs are welcome. There is no Wi-Fi, so it is the perfect place for a real break. You will need a car, as the nearest shop is eight kilometres away. £650 per week.',
      },
    ],
  },

  // ── JAZYKOVÁ KOMPETENCE ────────────────────────────────────────────
  part9: {
    introCs:
      'Přečtěte si text o historii jízdního kola. Do každé mezery (50–59) vyberte jednu správnou možnost A–C.',
    title: 'Two Wheels and Two Hundred Years',
    text: [
      'Today there are more than a billion bicycles in the world, but bikes have not always looked the way they do now. The first two-wheeled machine {{1}} built in Germany in 1817 by Karl Drais, an inventor {{2}} wanted to find a way to travel without a horse. His ‘running machine’ was made of wood and had no pedals, so riders had to push it along {{3}} their feet.',
      'About fifty years later, a French family business added pedals to the front wheel. Soon after that, a strange new bicycle became popular in Britain. It had {{4}} enormous front wheel and a very small back one. It was fast, but it was also dangerous, and many riders fell {{5}} their bikes and were badly hurt.',
      'The ‘safety bicycle’, which appeared in the 1880s, was much {{6}} to ride. Its two wheels were the same size, and a chain turned the back wheel. A few years later, rubber tyres filled with air made cycling more comfortable too. Suddenly, ordinary people could afford to travel further, and for many women the bicycle {{7}} a symbol of freedom.',
      'Since then, bikes {{8}} changed in many ways. They are lighter and stronger, and some even have electric motors. In many cities, more and more people {{9}} to cycle to work, and new cycle lanes are being built every year. Two hundred years after Drais\'s invention, the bicycle is still one of the cleanest and healthiest ways to {{10}} around.',
    ].join('\n\n'),
    gaps: [
      {
        options: ['is', 'was', 'has'],
        answer: 1,
        explanationCs: 'Trpný rod v minulém čase (rok 1817): the machine was built = stroj byl sestrojen.',
      },
      {
        options: ['who', 'which', 'whose'],
        answer: 0,
        explanationCs: 'Vztažné zájmeno pro osobu je who: an inventor who wanted…',
      },
      {
        options: ['by', 'on', 'with'],
        answer: 2,
        explanationCs: 'Nástroj, kterým něco děláme, vyjadřuje with: push it along with their feet = odrážet se nohama.',
      },
      {
        options: ['a', 'an', 'the'],
        answer: 1,
        explanationCs: 'Kolo se zmiňuje poprvé a následuje samohláska, proto neurčitý člen an: an enormous front wheel.',
      },
      {
        options: ['off', 'out', 'away'],
        answer: 0,
        explanationCs: 'Fall off a bike = spadnout z kola.',
      },
      {
        options: ['easy', 'easiest', 'easier'],
        answer: 2,
        explanationCs: 'Po much následuje 2. stupeň přídavného jména: much easier = mnohem snazší.',
      },
      {
        options: ['got', 'made', 'became'],
        answer: 2,
        explanationCs: 'Become a symbol = stát se symbolem; v minulém čase became.',
      },
      {
        options: ['had', 'have', 'are'],
        answer: 1,
        explanationCs: 'Since then (od té doby až dodnes) vyžaduje předpřítomný čas: bikes have changed.',
      },
      {
        options: ['choose', 'enjoy', 'avoid'],
        answer: 0,
        explanationCs:
          'Po choose následuje infinitiv s to: choose to cycle. Slovesa enjoy a avoid by vyžadovala tvar -ing (enjoy cycling).',
      },
      {
        options: ['take', 'get', 'make'],
        answer: 1,
        explanationCs: 'Frázové sloveso get around = pohybovat se, dopravovat se (např. po městě).',
      },
    ],
  },

  part10: {
    introCs:
      'Přečtěte si text. Do každé mezery (60–64) doplňte jedno slovo, které tam gramaticky i významově patří. Mezera 0 je příklad.',
    title: 'Max Is Home!',
    text: [
      'Last Saturday was one of the worst days of my life. I {{0}} walking our dog Max in the park when a loud firework {{1}} off. Max got scared, pulled the lead out of my hand and ran away. I blamed {{2}} for not holding it tightly enough. We searched the whole park {{3}} him until it got dark, but then we had to go home without him.',
      'The next morning we put up posters all over town and shared Max\'s photo online. On Monday evening, a woman phoned. ‘{{4}} you lost a brown dog?’ she asked. ‘There\'s one sleeping in my garden shed.’ We drove there immediately. When Max saw us, he jumped into my arms. It was {{5}} best feeling in the world!',
      'A big thank you to everyone who shared our post. From now on, Max will wear a collar with our phone number on it.',
    ].join('\n\n'),
    example: 'was',
    gaps: [
      {
        accept: ['went'],
        explanationCs: 'Go off (o ohňostroji, budíku) = vybuchnout, spustit se; děj v minulosti, proto went.',
      },
      {
        accept: ['myself'],
        explanationCs: 'Zvratné zájmeno: I blamed myself = dával(a) jsem vinu sám (sama) sobě.',
      },
      {
        accept: ['for'],
        explanationCs: 'Search (a place) for somebody = hledat někoho (někde); hledanou osobu uvádí předložka for.',
      },
      {
        accept: ['Have'],
        explanationCs:
          'Otázka v předpřítomném čase: Have you lost…? Tvar lost je příčestí minulé, s did by muselo být lose.',
      },
      {
        accept: ['the'],
        explanationCs: 'Před 3. stupněm přídavného jména stojí určitý člen: the best feeling in the world.',
      },
    ],
  },
};
