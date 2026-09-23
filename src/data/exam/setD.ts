import type { ExamSet } from '../../exam/types';

/**
 * Cvičný test D — original content modelled on the structure of the CERMAT
 * didaktický test (anglický jazyk). All texts and recordings are original.
 */
export const SET_D: ExamSet = {
  id: 'set-d',
  title: 'Cvičný test D',
  descriptionCs:
    'Brigáda v kině, nové lezecké centrum, letní tábor na farmě, měsíc bez sociálních sítí, výběr restaurace na oslavu a historie londýnského metra.',

  // ── POSLECH ─────────────────────────────────────────────────────
  part1: {
    items: [
      {
        question: 'Which bus or tram should the boy take to the football stadium?',
        script: [
          'M: Excuse me, which bus goes to the football stadium? Is it the number twelve?',
          'W: It used to be, but they changed the route last year. Now the twelve only goes as far as the hospital.',
          'M: Oh. And what about tram number nine? My friend said it stops near there.',
          "W: It does, but the trams aren't running this week because they're repairing the lines. You need the thirty-seven. Not the twenty-seven, that one goes to the airport.",
          'M: The thirty-seven. Thanks a lot!',
        ].join('\n'),
        options: [
          { emoji: '🚌1️⃣2️⃣', caption: 'bus number 12' },
          { emoji: '🚌3️⃣7️⃣', caption: 'bus number 37' },
          { emoji: '🚌2️⃣7️⃣', caption: 'bus number 27' },
          { emoji: '🚋9️⃣', caption: 'tram number 9' },
        ],
        answer: 1,
        explanationCs:
          'Žena radí: „You need the thirty-seven.“ Dvanáctka už ke stadionu nejezdí, tramvaje tento týden kvůli opravě nejezdí a sedmadvacítka jede na letiště.',
      },
      {
        question: 'What did the girl lose at the swimming pool?',
        script: [
          'W: Excuse me, I swam here this morning, and I think I left something in the changing room.',
          "M: Let's have a look in the lost property box. Are these your goggles?",
          "W: No, mine are in my bag. It's a watch, a silver one. My grandad gave it to me for my birthday.",
          "M: Hmm. There's a gold ring here and a locker key, but no watch. Oh, wait. Someone brought this to reception an hour ago.",
          "W: Yes, that's my watch! Thank you so much!",
        ].join('\n'),
        options: [
          { emoji: '🥽', caption: 'goggles' },
          { emoji: '💍', caption: 'a ring' },
          { emoji: '🔑', caption: 'a locker key' },
          { emoji: '⌚', caption: 'a watch' },
        ],
        answer: 3,
        explanationCs:
          'Dívka hledá hodinky: „It\'s a watch, a silver one.“ Brýle na plavání má v tašce a prsten ani klíč od skříňky nejsou její.',
      },
      {
        question: 'What will the family do if it rains on Saturday?',
        script: [
          "M: So what's the plan for Saturday? Are we still going to the zoo?",
          "W: If it's sunny, yes. But the forecast says it might rain all day.",
          "M: Then let's go bowling. The kids love it.",
          "W: We went bowling last weekend, remember? What about the new aquarium in the city centre? It's all indoors.",
          "M: Good idea. And it's cheaper than the cinema for four people.",
          "W: Right. The zoo if it's dry, the aquarium if it rains.",
        ].join('\n'),
        options: [
          { emoji: '🐠🐙', caption: 'go to the aquarium' },
          { emoji: '🦒🐘', caption: 'go to the zoo' },
          { emoji: '🎳', caption: 'go bowling' },
          { emoji: '🎬🍿', caption: 'go to the cinema' },
        ],
        answer: 0,
        explanationCs:
          'Rodiče se dohodnou: „The zoo if it\'s dry, the aquarium if it rains.“ Na bowlingu byli minulý víkend a kino je pro čtyři lidi dražší.',
      },
      {
        question: 'Which dessert did the grandmother make?',
        script: [
          'M: Mmm, something smells good. Has Grandma baked her famous apple pie again?',
          "W: No, she didn't have enough apples this time. Guess again.",
          'M: Chocolate cake?',
          "W: She wanted to make one, but the doctor says Grandpa mustn't eat chocolate. So she made pancakes with strawberries instead.",
          'M: Lovely. Is there any ice cream to go with them?',
          "W: Yes, there's some vanilla ice cream in the freezer. I bought it this morning.",
        ].join('\n'),
        options: [
          { emoji: '🥧🍎', caption: 'apple pie' },
          { emoji: '🍫🎂', caption: 'chocolate cake' },
          { emoji: '🥞🍓', caption: 'pancakes with strawberries' },
          { emoji: '🍨', caption: 'vanilla ice cream' },
        ],
        answer: 2,
        explanationCs:
          'Babička udělala palačinky: „So she made pancakes with strawberries instead.“ Na jablečný koláč neměla dost jablek, čokoládu dědeček nesmí a zmrzlinu ráno koupila žena.',
      },
    ],
  },

  part2: {
    introCs:
      'Uslyšíte rozhovor dvou kolegů, kteří mají brigádu v kině, o náročné víkendové směně. Na základě vyslechnuté nahrávky rozhodněte, zda jsou tvrzení 5–12 pravdivá (P), nebo nepravdivá (N).',
    script: [
      'W: Hi Ryan. You look tired. Were you working all weekend?',
      "M: Hi Hannah. Yes, I did Saturday and Sunday. And Saturday was the worst shift I've ever had here.",
      'W: Why? What happened?',
      'M: Well, first of all, two people called in sick, so there were only three of us instead of five. And it was the first weekend of the new superhero film, so every show was sold out.',
      'W: Oh no. Were you on the ticket desk?',
      'M: At the beginning, yes. But at about four o\'clock the popcorn machine broke, and the manager sent me to the snack bar to deal with the customers. I had to tell about fifty people that they could only buy crisps and sweets.',
      'W: Poor you. Did anyone shout at you?',
      'M: One man did. He said he always has popcorn at the cinema, and he wanted his money back for the tickets. But most people were fine about it. A lot of them just bought extra ice cream.',
      'W: Did they fix the machine?',
      'M: Not until Sunday morning. A technician came at nine, before we opened.',
      'W: So was that the end of the problems?',
      'M: No! During the eight o\'clock show in screen three, the fire alarm went off.',
      'W: Was there a fire?',
      'M: No, luckily. Somebody was smoking in the toilets. But we had to take everyone outside, about two hundred people, and wait for twenty minutes in the rain.',
      'W: That must have been awful.',
      "M: It was. After that, the film started again from the beginning, so it finished really late. I didn't get home until after midnight, and I had to be back here at ten on Sunday morning.",
      'W: Did the manager say anything to you?',
      'M: Yes, she was really nice about it. She thanked us all and gave everyone two free cinema tickets.',
      "W: Well, that's something. Are you working next weekend too?",
      "M: No, thank goodness. I've asked for the weekend off. I've got a big exam on Monday, so I need to study.",
      "W: Good luck. I'm working on Saturday, so I'll tell you how it goes.",
    ].join('\n'),
    statements: [
      {
        text: 'Ryan only worked on Saturday last weekend.',
        answer: false,
        explanationCs:
          'Ryan pracoval oba dny: „Yes, I did Saturday and Sunday.“',
      },
      {
        text: 'On Saturday, fewer people worked at the cinema than usual.',
        answer: true,
        explanationCs:
          'Dva kolegové byli nemocní: „there were only three of us instead of five.“',
      },
      {
        text: 'Ryan spent the whole shift at the ticket desk.',
        answer: false,
        explanationCs:
          'U pokladny byl jen na začátku („At the beginning, yes“), pak ho vedoucí poslala do bufetu („sent me to the snack bar“).',
      },
      {
        text: 'Most customers were angry that there was no popcorn.',
        answer: false,
        explanationCs:
          'Rozčílil se jen jeden muž, ostatní to vzali v klidu: „But most people were fine about it.“',
      },
      {
        text: 'The popcorn machine was repaired before the cinema opened on Sunday.',
        answer: true,
        explanationCs:
          'Technik přišel v neděli ráno: „A technician came at nine, before we opened.“',
      },
      {
        text: 'The customers had to wait outside in bad weather.',
        answer: true,
        explanationCs:
          'Kvůli požárnímu poplachu čekali venku: „wait for twenty minutes in the rain.“',
      },
      {
        text: 'The manager gave the staff some free tickets.',
        answer: true,
        explanationCs:
          'Vedoucí jim poděkovala: „gave everyone two free cinema tickets.“',
      },
      {
        text: 'Ryan is going to work next Saturday.',
        answer: false,
        explanationCs:
          'Ryan má příští víkend volno („I\'ve asked for the weekend off“), protože se učí na zkoušku. V sobotu pracuje Hannah.',
      },
    ],
  },

  part3: {
    introCs:
      'Uslyšíte moderátora místního rádia, který představuje nové lezecké a zážitkové centrum. Na základě vyslechnuté nahrávky odpovězte v angličtině na otázky 13–20. Odpovídejte nejvýše třemi slovy; čísla můžete psát číslicemi.',
    script: [
      "M: Good morning, and welcome back to Weekend Guide on Millbridge Radio. I'm Robert Hayes, and today I've got some exciting news for anyone who loves adventure. The new High Point Adventure Centre opens on Saturday the fourteenth of May in the old paper factory by the river.",
      "M: I went there on Tuesday for a special preview, and I have to say, it's really impressive. The main climbing wall is eighteen metres high, which makes it the tallest in the county. There's also a bouldering room with soft mats, which is perfect for beginners, and a rope course high up under the roof.",
      "M: So, how much does it cost? A two-hour session is twelve pounds for adults and nine pounds for anyone under sixteen. And here's some good news. On the opening day, the first hundred visitors can climb for free, so get there early. The doors open at ten.",
      'M: Now, age limits. Children from the age of five can use the bouldering room, but for the main wall and the rope course, you have to be at least eight. And anyone under fourteen must come with an adult.',
      "M: What about equipment? You don't need to buy anything special, because climbing shoes and a harness are included in the price. The only thing you should bring is a water bottle. And please wear comfortable sports clothes. Jeans are not a good idea!",
      "M: If you've never climbed before, I recommend the one-hour introduction lesson with the head instructor, Megan Price. Ten years ago, Megan was the British junior champion, and she's a really patient teacher. She told me her oldest student so far was seventy-three years old!",
      'M: When you get tired, there\'s a café on the first floor called The Top. It has huge windows, so you can watch the climbers while you eat. They make great homemade soup, and on the opening day every visitor gets a free hot chocolate.',
      "M: Getting there is easy. There's a car park with sixty spaces, but it will probably be full at weekends, so the organisers recommend the number five bus, which stops right outside the entrance. You can also come by bike. There are plenty of bike racks by the door.",
      "M: The centre will be open every day from ten in the morning until ten at night. So, see you on the wall! And now, here's the weather.",
    ].join('\n'),
    questions: [
      {
        question: 'How high is the main climbing wall?',
        accept: [
          '18 metres',
          'eighteen metres',
          '18 meters',
          'eighteen meters',
          '18 m',
          '18m',
          '18',
          'eighteen',
          '18 metres high',
          'eighteen metres high',
        ],
        explanationCs:
          'Moderátor říká: „The main climbing wall is eighteen metres high.“',
      },
      {
        question: 'How much does a session cost for people under sixteen?',
        prefix: '£',
        accept: ['9', 'nine', '9 pounds', 'nine pounds', '£9'],
        explanationCs:
          '„Twelve pounds for adults and nine pounds for anyone under sixteen.“ Dvanáct liber platí dospělí.',
      },
      {
        question: 'How many visitors can climb for free on the opening day?',
        prefix: 'the first',
        accept: [
          '100',
          'hundred',
          'a hundred',
          'one hundred',
          '100 visitors',
          'hundred visitors',
          'first hundred',
          'first 100',
          'the first hundred',
          'the first 100',
        ],
        explanationCs:
          '„On the opening day, the first hundred visitors can climb for free.“ Horkou čokoládu zdarma dostane v den otevření každý návštěvník.',
      },
      {
        question: 'How old must children be to use the main wall?',
        prefix: 'at least',
        accept: [
          '8',
          'eight',
          '8 years old',
          'eight years old',
          '8 years',
          'eight years',
          'at least 8',
          'at least eight',
        ],
        explanationCs:
          '„For the main wall and the rope course, you have to be at least eight.“ Od pěti let smějí děti jen do boulderingové místnosti.',
      },
      {
        question: 'What should visitors bring with them?',
        accept: [
          'a water bottle',
          'water bottle',
          'water',
          'bottle of water',
          'a bottle',
          'their water bottle',
          'water bottles',
        ],
        explanationCs:
          '„The only thing you should bring is a water bottle.“ Lezecké boty a úvazek jsou v ceně.',
      },
      {
        question: 'What was Megan Price ten years ago?',
        accept: [
          'British junior champion',
          'junior champion',
          'a junior champion',
          'the junior champion',
          'champion',
          'a champion',
        ],
        explanationCs:
          '„Ten years ago, Megan was the British junior champion.“ Dnes je hlavní instruktorkou centra.',
      },
      {
        question: 'What can visitors watch from the café?',
        accept: [
          'the climbers',
          'climbers',
          'people climbing',
          'climbing',
          'the climbing',
          'other climbers',
        ],
        explanationCs:
          'Kavárna má velká okna, „so you can watch the climbers while you eat.“',
      },
      {
        question: 'Which bus stops outside the centre?',
        prefix: 'number',
        accept: [
          '5',
          'five',
          'number 5',
          'number five',
          'the number 5',
          'the number five',
          'bus 5',
          'bus five',
          'bus number 5',
          'the 5',
          'the five',
        ],
        explanationCs:
          'Organizátoři doporučují „the number five bus, which stops right outside the entrance.“ Parkoviště má 60 míst, ale o víkendu bude nejspíš plné.',
      },
    ],
  },

  part4: {
    items: [
      {
        question: 'Which place will still be open after half past five?',
        script: [
          'W: Good afternoon, visitors. The museum will close in fifteen minutes, at half past five. Please start making your way to the main exit on the ground floor. The café on the first floor is already closed, but the gift shop by the exit will stay open until six, so you still have time to buy a souvenir. If you left a bag or a coat in the cloakroom, please collect it now, because the cloakroom closes at the same time as the museum. Thank you for your visit.',
        ].join('\n'),
        options: ['the gift shop', 'the cloakroom', 'the café', 'the exhibition on the first floor'],
        answer: 0,
        explanationCs:
          'Obchod se suvenýry „will stay open until six“. Šatna se zavírá spolu s muzeem v půl šesté a kavárna už je zavřená.',
      },
      {
        question: 'What should students who want to go on the trip do by Wednesday?',
        script: [
          'M: Good morning, everyone, and welcome to School Radio. First, some news about the trip to the Science Museum next Friday. There are only forty places, so if you want to go, please give your name to our science teacher, Mr Carter, in room twelve by Wednesday. The trip costs ten pounds, and you can pay on the day. And don\'t forget, the school photographer is coming tomorrow, so remember to wear your school uniform. Now, here\'s some music.',
        ].join('\n'),
        options: [
          'pay ten pounds',
          'wear their school uniform',
          'give their name to a teacher',
          'visit the museum website',
        ],
        answer: 2,
        explanationCs:
          'Zájemci mají do středy nahlásit své jméno učiteli: „give your name to our science teacher, Mr Carter… by Wednesday“. Zaplatit mohou až v den výletu a uniformu si mají vzít kvůli fotografovi.',
      },
      {
        question: "Why can't Grace play tennis in the morning?",
        script: [
          "W: Hi Kevin, it's Grace. It's about our tennis match tomorrow. I know we said ten o'clock, but my mum needs the car in the morning, so I can't get to the courts. Could we play at three in the afternoon instead? I've already checked online, and there's a free court then. Oh, and could you bring some balls? I lost mine last week. Please call me back tonight and tell me if three is OK. Bye!",
        ].join('\n'),
        options: [
          'She has lost her tennis balls.',
          'All the courts are booked.',
          'She has to help her mum.',
          'She has no way of getting to the courts.',
        ],
        answer: 3,
        explanationCs:
          'Grace říká: „my mum needs the car in the morning, so I can\'t get to the courts.“ Míčky ztratila, ale to není důvod, proč nemůže ráno hrát.',
      },
      {
        question: 'When should the man take the medicine?',
        script: [
          "M: Hello. I've got a bad cough, and I can't sleep at night. Have you got anything for it?",
          'W: Have you got a temperature?',
          'M: No, just the cough.',
          "W: Then try this syrup. Normally you take a spoonful three times a day, after meals. But it can make you sleepy, so don't drive after taking it.",
          'M: Oh. I drive to work every morning.',
          "W: Then take it only in the evening, before bed. And if your cough isn't better in a week, see a doctor.",
        ].join('\n'),
        options: ['three times a day', 'only in the evening', 'before every meal', 'only in the morning'],
        answer: 1,
        explanationCs:
          'Muž ráno řídí, proto mu lékárnice radí: „Then take it only in the evening, before bed.“ Třikrát denně po jídle je běžné dávkování, které pro něj neplatí.',
      },
    ],
  },

  // ── ČTENÍ ──────────────────────────────────────────────────────
  part5: {
    items: [
      {
        kind: 'Notice',
        text: [
          'THE HARBOUR HOTEL – INFORMATION FOR GUESTS',
          'Breakfast is served in the Garden Room from 7.00 to 10.00 on weekdays and until 10.30 at weekends. Our swimming pool is closed this week for repairs. During this time, guests can use the pool at the Riverside Sports Centre, five minutes away, free of charge – just ask at reception for a ticket. Please leave your room by 11.00 on the day you depart. Late check-out until 14.00 is possible for £15.',
        ].join('\n'),
        question: 'What does the notice say?',
        options: [
          'Breakfast finishes at the same time every day.',
          'Guests cannot go swimming this week.',
          'Guests can swim in another place without paying.',
          'Guests can stay in their room until 14.00 for free.',
        ],
        answer: 2,
        explanationCs:
          'Hosté mohou chodit do bazénu ve sportovním centru „free of charge“. Snídaně končí o víkendu později a pozdní uvolnění pokoje stojí 15 £.',
      },
      {
        kind: 'Text message',
        text: [
          "Hi Nina! My train's running 40 minutes late because of a problem on the line, so I won't be there for the start of the concert at 7.30. Please don't wait for me outside – go in and I'll find you in the break. I've got both tickets on my phone, so I'm sending yours to you now. Sorry!",
          'Beth x',
        ].join('\n'),
        question: 'What does Beth want Nina to do?',
        options: [
          'go into the concert without her',
          'wait for her outside the concert hall',
          'buy a new ticket',
          'meet her at the station',
        ],
        answer: 0,
        explanationCs:
          'Beth píše: „Please don\'t wait for me outside – go in“. Vstupenku jí pošle do telefonu, takže novou kupovat nemusí.',
      },
      {
        kind: 'App notification',
        text: [
          'CityBike',
          "Your ride started at 14:05. Remember: as a member, you ride free for the first 30 minutes. After that, it's 50p for every 15 minutes. Please note that the docking station at Park Square is full at the moment, so please leave your bike at Library Street (300 m away). You've ridden 12 km this week – only 3 km more to reach your weekly goal!",
        ].join('\n'),
        question: 'What does the app tell the user?',
        options: [
          'Every ride costs 50p.',
          'The user has already reached the weekly goal.',
          'The user must return the bike by 14:35.',
          'The user cannot leave the bike at Park Square now.',
        ],
        answer: 3,
        explanationCs:
          'Stanice na Park Square je plná („is full at the moment“), kolo je třeba vrátit na Library Street. Prvních 30 minut je zdarma, ale vrátit ho do té doby nemusí.',
      },
      {
        kind: 'Recipe tip',
        text: [
          "COOK'S TIP: CRISPY ROAST POTATOES",
          "Boil the potatoes for ten minutes – not longer, or they will fall apart. Then shake them in the pan so that the edges become rough. Meanwhile, heat the oil in the oven tray until it is very hot. Put the potatoes into the hot oil, but don't put too many in one tray: if they are too close together, they will be soft, not crispy. Add salt just before serving.",
        ].join('\n'),
        question: 'What does the tip say?',
        options: [
          'Put the potatoes into cold oil.',
          'The potatoes need space in the tray to become crispy.',
          'Add salt before the potatoes go into the oven.',
          'Boil the potatoes for as long as possible.',
        ],
        answer: 1,
        explanationCs:
          'Brambory nesmějí být moc blízko sebe: „if they are too close together, they will be soft, not crispy.“ Olej má být horký, sůl až na konec a vařit se mají jen deset minut.',
      },
      {
        kind: 'Poster',
        text: [
          'JOIN THE GREENWAY CHESS CLUB!',
          "Do you enjoy chess, or would you like to learn? We meet every Thursday from 6 to 8 pm at the community centre on Hill Road. Beginners are very welcome – our members will teach you the rules. Each evening costs £2, but your first two visits are free. We have plenty of boards, so you don't need to bring your own. In March we are holding a tournament for players of all levels. Everyone aged 10 and over welcome!",
        ].join('\n'),
        question: 'What does the poster say?',
        options: [
          'New members do not pay for their first two evenings.',
          'Members must bring their own chess boards.',
          'Only experienced players can take part in the tournament.',
          'The club meets twice a week.',
        ],
        answer: 0,
        explanationCs:
          'Na plakátu stojí: „your first two visits are free.“ Šachovnice klub má, turnaj je pro všechny úrovně a schůzky jsou jen ve čtvrtek.',
      },
    ],
  },

  part6: {
    introCs:
      'Přečtěte si informace o letním táboře pro teenagery na farmě. Na základě informací v textu rozhodněte, zda jsou tvrzení 30–39 pravdivá (P), nebo nepravdivá (N).',
    title: 'Willow Brook Farm Camp – Summer on the Farm',
    text: [
      'Would you like to spend a week of your summer holidays outdoors, far from screens and city noise? Willow Brook Farm Camp welcomes young people aged 13 to 17 to a working farm in the hills of North Wales. Camps run every week in July and August. Each camp starts on Sunday afternoon and finishes on Saturday morning.',
      'ACTIVITIES\nEvery morning, campers help with real farm work: feeding the animals, collecting eggs, milking the goats and working in the vegetable garden. Don\'t worry if you have never done this before – our farmers will show you everything. In the afternoons, you can choose from horse riding, canoeing on the lake, rock climbing or art workshops. Horse riding costs £25 extra per week; all the other activities are included in the price. In the evenings there are campfires, film nights and games.',
      'ACCOMMODATION\nCampers sleep in wooden cabins for six people, with separate cabins for boys and girls. Each cabin has its own toilet, but the showers are in a separate building a short walk away. Sheets and pillows are provided, but you need to bring your own towel.',
      'FOOD\nMost of our food comes from the farm itself. Campers take turns to help in the kitchen, and everyone helps to cook dinner once during the week. We are happy to prepare vegetarian meals, but please tell us about any food allergies when you book.',
      'WHAT TO BRING\nOld clothes and strong boots that can get dirty, a raincoat (it rains a lot in Wales, even in summer!), a torch and a water bottle. The mobile phone signal on the farm is poor, and phones must stay in the office during the day. Campers can use them every evening between 7 and 8 pm.',
      'RULES\nCampers must not leave the farm without a member of staff. Please do not give the animals any food of your own, because some human food can make them ill. Lights out is at 10.30 pm.',
      'PRICES\nOne week costs £390, including all meals and activities (except horse riding). Brothers and sisters get 10% off. If you book before 31 March, you save another £30. Places are limited, so book early!',
    ].join('\n\n'),
    statements: [
      {
        text: 'Campers need some experience of farm work before they come.',
        answer: false,
        explanationCs:
          'Zkušenosti nejsou potřeba: „Don\'t worry if you have never done this before – our farmers will show you everything.“',
      },
      {
        text: 'All afternoon activities are included in the price of the camp.',
        answer: false,
        explanationCs:
          'Jízda na koni se platí zvlášť: „Horse riding costs £25 extra per week.“',
      },
      {
        text: 'Boys and girls sleep in different cabins.',
        answer: true,
        explanationCs: 'V textu stojí: „with separate cabins for boys and girls.“',
      },
      {
        text: 'Campers have to go to another building to have a shower.',
        answer: true,
        explanationCs:
          '„The showers are in a separate building a short walk away.“ V chatce je jen toaleta.',
      },
      {
        text: 'Campers must bring their own sheets.',
        answer: false,
        explanationCs:
          'Povlečení zajistí tábor: „Sheets and pillows are provided“. Vlastní si musí přivézt jen ručník.',
      },
      {
        text: 'Every camper will help to cook a meal during the week.',
        answer: true,
        explanationCs: '„Everyone helps to cook dinner once during the week.“',
      },
      {
        text: 'Campers with a food allergy should tell the camp about it when they book.',
        answer: true,
        explanationCs: '„Please tell us about any food allergies when you book.“',
      },
      {
        text: 'Campers can use their phones at any time of the day.',
        answer: false,
        explanationCs:
          'Přes den zůstávají telefony v kanceláři („phones must stay in the office during the day“), používat je lze jen večer mezi 19. a 20. hodinou.',
      },
      {
        text: 'Campers are allowed to leave the farm on their own.',
        answer: false,
        explanationCs:
          'Bez vedoucího farmu opustit nesmějí: „Campers must not leave the farm without a member of staff.“',
      },
      {
        text: 'Brothers and sisters can get a lower price.',
        answer: true,
        explanationCs: 'Sourozenci mají slevu: „Brothers and sisters get 10% off.“',
      },
    ],
  },

  part7: {
    introCs:
      'Přečtěte si blog mladého muže, který na měsíc přestal používat sociální sítě. Na základě informací v textu vyberte ke každé úloze 40–44 jednu správnou odpověď (A–D).',
    title: 'Thirty Days Offline',
    text: [
      "My name is Marcus, I'm nineteen, and until last October I spent about five hours a day on social media. I know that because my phone told me. One Sunday evening, a message appeared on the screen: 'Your weekly screen time: 35 hours.' I did the maths. That's more than a whole day every week! I was shocked. That same night, I deleted every social media app from my phone and told my friends I would be offline for thirty days.",
      "The first week was much harder than I expected. I kept picking up my phone without thinking, and my thumb went to the place where the apps used to be. I felt nervous all the time, as if I was missing something important. At parties, when everybody else was looking at their screens, I didn't know where to look. My best friend Josh bet me twenty pounds that I wouldn't last ten days.",
      "By the second week, though, things started to change. Without all those videos, I suddenly had hours of free time, and at first I was bored. So I took out my old guitar, which had been under my bed for three years, and started practising again. I also joined the town library for the first time since primary school. I read four books that month – more than in the whole previous year.",
      "The biggest surprise was my sleep. I used to look at my phone in bed until one or two in the morning. Now I was asleep by eleven, and I woke up feeling much less tired. My marks at college got better too, although my teacher thinks that's because I finally started handing in my homework on time!",
      "Of course, there were problems. I missed a friend's birthday party because the invitation was only sent in a group chat, and I didn't find out about it until a week later. I felt terrible. It showed me that social media isn't only a waste of time – it's also how a lot of people organise their lives.",
      "So what happened when the thirty days were over? I didn't go back to my old life, but I didn't stay completely offline either. I put one app back on my phone, the one I use to send messages to my friends, and I switched off all the notifications. I check it twice a day, at lunchtime and in the evening. My screen time is now about an hour a day.",
      'And Josh? He paid me the twenty pounds. I spent it on new guitar strings.',
    ].join('\n\n'),
    questions: [
      {
        question: 'Why did Marcus decide to stop using social media?',
        options: [
          'His friends told him he used his phone too much.',
          'He was shocked by how much time he spent on it.',
          'His phone stopped working properly.',
          'He wanted to win a bet with his friend.',
        ],
        answer: 1,
        explanationCs:
          'Telefon mu ukázal 35 hodin týdně: „That\'s more than a whole day every week! I was shocked.“ Sázku s Joshem uzavřel až potom.',
      },
      {
        question: 'How did Marcus feel during the first week?',
        options: [
          'relaxed and happy',
          'bored with his guitar',
          'angry with his friends',
          'worried that he was missing things',
        ],
        answer: 3,
        explanationCs:
          '„I felt nervous all the time, as if I was missing something important.“ Kytaru vytáhl až ve druhém týdnu.',
      },
      {
        question: 'What happened in the second week?',
        options: [
          'Marcus started learning to play the guitar.',
          'Marcus went to the library with friends from primary school.',
          'Marcus found other things to do in his free time.',
          'Marcus was never bored.',
        ],
        answer: 2,
        explanationCs:
          'Místo sociálních sítí začal znovu hrát na kytaru a chodit do knihovny. Na kytaru už hrát uměl („started practising again“) a zpočátku se nudil („at first I was bored“).',
      },
      {
        question: 'What surprised Marcus most?',
        options: [
          'He slept better.',
          'His teacher liked his homework.',
          'He went to bed later than before.',
          'He got better marks in every subject.',
        ],
        answer: 0,
        explanationCs:
          '„The biggest surprise was my sleep.“ Usínal už kolem jedenácté a ráno byl méně unavený.',
      },
      {
        question: 'How does Marcus use his phone now?',
        options: [
          'He uses all his old apps again, but less often.',
          'He does not use any social media at all.',
          'He uses one app to stay in touch with his friends.',
          'He checks his messages every hour.',
        ],
        answer: 2,
        explanationCs:
          'Vrátil si jen jednu aplikaci: „the one I use to send messages to my friends“. Kontroluje ji dvakrát denně.',
      },
    ],
  },

  part8: {
    introCs:
      'Přečtěte si, jakou restauraci hledá pět lidí pro zvláštní příležitost (45–49), a nabídky restaurací (A–G). Ke každé osobě přiřaďte restauraci, která splňuje všechny její požadavky. Dvě nabídky nebudou použity.',
    people: [
      {
        name: 'Ruth',
        text: "My grandparents have been married for fifty years, and we want to celebrate with a big family lunch on Sunday. There will be about twenty-five of us, so we need a room just for our group. Grandad uses a wheelchair, so we can't have any stairs. They both love good old-fashioned British food.",
        answer: 5,
        explanationCs:
          'Nabídka F: tradiční britská kuchyně, nedělní oběd („every Sunday from 12 to 4 pm“) a soukromý sál v přízemí „with step-free access“. Restaurace B má soukromý sál v prvním patře bez výtahu.',
      },
      {
        name: 'Kieran',
        text: "It's my girlfriend's birthday on Saturday. First we're going to the theatre, so we won't be ready to eat until about ten o'clock. She doesn't eat any animal products, so I'd like a place where she can choose anything on the menu. She loves live music too.",
        answer: 3,
        explanationCs:
          'Nabídka D: celé menu je rostlinné („100% plant-based“), v sobotu večer hraje živá hudba a kuchyně je otevřená do 23.30. V restauraci B je veganská jen polovina jídel a poslední objednávky jsou ve 21 hodin.',
      },
      {
        name: 'Amelia',
        text: "Our exams finished last week, and eight of us from my class want to celebrate on Friday night. We don't want just a meal – we'd like to do something fun together too, like singing or playing games. We're students, so we can't spend more than about fifteen pounds each.",
        answer: 6,
        explanationCs:
          'Nabídka G: karaoke pro skupiny 4–12 lidí, jídla do 8 £ a pronájem místnosti 5 £ za osobu, v pátek otevřeno do jedné v noci. V restauraci E je karaoke také, ale hlavní jídla stojí kolem 20 £.',
      },
      {
        name: 'George',
        text: "My son Leo is turning seven, and we'd like to take him and five of his friends out for lunch on Saturday. The children will need their own menu and somewhere to run around outside after the meal. My wife has already made a birthday cake, so we'd like to bring it with us.",
        answer: 0,
        explanationCs:
          'Nabídka A: dětské menu, hřiště na zahradě, vlastní dort lze přinést „at no extra charge“ a otevřeno je denně od 11 hodin. Restaurace E má také hřiště, ale jídlo zvenku nepovoluje („no food from outside“).',
      },
      {
        name: 'Natalie',
        text: "My mum has just got a new job, and I want to take her out for dinner to celebrate. She loves fish and seafood, but she hates noisy places where you can't hear each other. Neither of us drives, so we'll come by train. I'd like to book a table online.",
        answer: 2,
        explanationCs:
          'Nabídka C: ryby a mořské plody, klidné prostředí bez hudby, dvě minuty od nádraží a rezervace přes web. Restaurace E je hlučná a F přijímá rezervace jen telefonicky.',
      },
    ],
    offers: [
      {
        title: 'The Treehouse',
        text: 'A family restaurant where children are always welcome! Kids can choose from their own menu of healthy meals, and our large garden has a playground with swings, a climbing frame and a sandpit. Having a party? Bring your own birthday cake and we will light the candles and bring it to the table with a song – at no extra charge. Tables for groups of up to twelve people. Open every day from 11 am to 7 pm.',
      },
      {
        title: 'The Fig Tree',
        text: 'A stylish restaurant in the heart of the old town. Our menu is completely vegetarian, and about half of the dishes are also vegan. Every Saturday evening, a pianist plays for our guests from 7 until 10 pm. Planning a party? Our beautiful private room on the first floor holds up to thirty guests (please note that there is no lift). Sunday lunch is served from 12 to 3 pm, and last orders for dinner are at 9 pm.',
      },
      {
        title: 'The Harbour Light',
        text: "Enjoy the freshest fish and seafood in town, caught every morning by local fishermen. Our small dining room has only twelve tables and no background music, so it is the perfect place for a quiet conversation. We are just two minutes' walk from the railway station. Please book your table on our website – we do not take bookings by phone. Open Tuesday to Sunday, from 6 pm to 10 pm.",
      },
      {
        title: 'Green Garden Kitchen',
        text: 'Everything on our menu is 100% plant-based, from our creamy mushroom pie to our famous chocolate cake – no meat, fish, eggs or milk, and nobody misses them! On Friday and Saturday nights, local musicians play jazz and soul from 9 pm, and our kitchen stays open until 11.30 pm. Tables for two by the fireplace can be booked on our website. We are closed on Sundays and Mondays.',
      },
      {
        title: "Captain Jack's Beach Shack",
        text: "Fish and chips, seafood platters and burgers right on the beach! Children love our kids' menu and the pirate-ship playground outside. On Friday nights there are live rock bands and a karaoke competition, so it gets loud and lively! Most main dishes cost around £20. We are a 25-minute bus ride from the town centre. Birthday cakes can be ordered from our kitchen – sorry, no food from outside.",
      },
      {
        title: 'The Old Oak Inn',
        text: 'A traditional country pub with a warm welcome for everyone. Our kitchen serves classic British dishes such as steak and ale pie, fish and chips and our famous Sunday roast, served every Sunday from 12 to 4 pm. For birthdays, anniversaries and family parties, book the Garden Room – a private room for up to forty guests on the ground floor, with step-free access from the car park. Bookings by phone only.',
      },
      {
        title: 'Star Karaoke & Noodle Bar',
        text: 'Sing your heart out with your friends! Book one of our private karaoke rooms for groups of four to twelve people and choose from over 10,000 songs in fifteen languages. While you sing, order from our menu of Asian noodle and rice dishes – all under £8. Room hire is just £5 per person for two hours. Open Wednesday to Saturday, from 5 pm until 1 am.',
      },
    ],
  },

  // ── JAZYKOVÁ KOMPETENCE ────────────────────────────────────────
  part9: {
    introCs:
      'Přečtěte si text o historii londýnského metra. Ke každé mezeře (50–59) vyberte jednu možnost (A–C), která do textu gramaticky i významově patří.',
    title: 'The Story of the Tube',
    text: [
      "The London Underground, or 'the Tube', as Londoners {{1}} it, is the oldest underground railway in the world. In the middle of the 19th century, London's streets were {{2}} full of horses, carts and people that it often took hours to cross the city. A lawyer named Charles Pearson had the idea of building a railway under the ground, and after years of planning, the first line {{3}} between Paddington and Farringdon. It opened in January 1863, and on the first day more than 30,000 people travelled on it.",
      "The first trains were pulled by steam engines, so the tunnels were always full {{4}} smoke. Passengers had to {{5}} with the dirty air, but they kept using the new railway because it was much {{6}} than travelling by road. In 1890, the first deep 'tube' line opened. It was one of the first railways in the world {{7}} used electric trains.",
      'During the Second World War, the Underground played a very different role. Every night, thousands of Londoners slept on the platforms {{8}} bombs were falling on the city above.',
      'Today, the network has eleven lines and 272 stations, and around four million journeys are made on it {{9}} day. Since the first line opened, the Tube {{10}} London in many ways, and it is hard to imagine the city without it.',
    ].join('\n\n'),
    gaps: [
      {
        options: ['call', 'tell', 'speak'],
        answer: 0,
        explanationCs:
          'Vazba „call something something“ znamená nazývat: „as Londoners call it“. Slovesa „tell“ a „speak“ takto použít nelze.',
      },
      {
        options: ['such', 'too', 'so'],
        answer: 2,
        explanationCs:
          'Před přídavným jménem ve vazbě „so … that“ stojí „so“: „so full of horses… that it often took hours“. „Such“ se pojí s podstatným jménem.',
      },
      {
        options: ['built', 'was built', 'has built'],
        answer: 1,
        explanationCs:
          'Trať někdo postavil, proto trpný rod v minulém čase: „the first line was built“.',
      },
      {
        options: ['with', 'of', 'from'],
        answer: 1,
        explanationCs: 'Přídavné jméno „full“ se pojí s předložkou „of“: „full of smoke“.',
      },
      {
        options: ['put up', 'get on', 'take up'],
        answer: 0,
        explanationCs:
          'Frázové sloveso „put up with something“ znamená snášet, smířit se s něčím nepříjemným.',
      },
      {
        options: ['fast', 'fastest', 'faster'],
        answer: 2,
        explanationCs:
          'Za mezerou následuje „than“, jde tedy o 2. stupeň: „much faster than travelling by road“.',
      },
      {
        options: ['who', 'which', 'where'],
        answer: 1,
        explanationCs:
          'Vztažná věta se vztahuje k věci („railways“), proto „which“. „Who“ se používá pro lidi a „where“ pro místo, kde se něco děje.',
      },
      {
        options: ['while', 'during', 'meanwhile'],
        answer: 0,
        explanationCs:
          'Před celou větou („bombs were falling“) je potřeba spojka „while“ (zatímco). „During“ je předložka a pojí se jen s podstatným jménem.',
      },
      {
        options: ['the', 'an', 'a'],
        answer: 2,
        explanationCs:
          'Ve významu „za den, denně“ se používá neurčitý člen „a“: „four million journeys… a day“.',
      },
      {
        options: ['changed', 'was changing', 'has changed'],
        answer: 2,
        explanationCs:
          'Se „since“ (od té doby, co) a dějem, který trvá dodnes, se používá předpřítomný čas: „the Tube has changed London“.',
      },
    ],
  },

  part10: {
    introCs:
      'Přečtěte si e-mail. Do každé mezery (60–64) doplňte jedno slovo tak, aby text byl gramaticky správný a dával smysl. Odpověď 0 je uvedena jako příklad.',
    title: 'Our Film Project',
    text: [
      'Hi Laura,',
      "Thanks {{0}} your last email, and sorry for my late reply. For the last three weeks I've been working {{1}} a big school project with two friends from my class. Our geography teacher asked us to make a short film about a problem in our town, so we chose the river, which is really dirty. Last Saturday, my friend Adam's dad took us out in his boat to {{2}} middle of the river, and we filmed all the plastic bottles in the water. We also talked to some people who live near the river, and most of {{3}} were happy to answer our questions. Our film is going to {{4}} shown to the whole school next month, and I'm already nervous! {{5}} you ever made a film? If you have, please send me some tips.",
      'Write soon!',
      'Love,',
      'Klára',
    ].join('\n'),
    example: 'for',
    gaps: [
      {
        accept: ['on'],
        explanationCs:
          'Pracovat na něčem se řekne „work on something“: „I\'ve been working on a big school project.“',
      },
      {
        accept: ['the'],
        explanationCs:
          'Ve spojení „the middle of“ je vždy určitý člen: „to the middle of the river“.',
      },
      {
        accept: ['them'],
        explanationCs:
          'Zájmeno zastupuje „some people“, po „most of“ je tvar „them“: „most of them were happy“.',
      },
      {
        accept: ['be'],
        explanationCs:
          'Trpný rod po „going to“: „is going to be shown“ – film bude promítnut.',
      },
      {
        accept: ['have'],
        explanationCs:
          'Otázka v předpřítomném čase se tvoří pomocným slovesem „have“: „Have you ever made a film?“',
      },
    ],
  },
};
