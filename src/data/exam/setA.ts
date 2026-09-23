import type { ExamSet } from '../../exam/types';

/**
 * Cvičný test A — original content modelled on the structure of the CERMAT
 * didaktický test (anglický jazyk). All texts and recordings are original.
 */
export const SET_A: ExamSet = {
  id: 'set-a',
  title: 'Cvičný test A',
  descriptionCs:
    'Školní výlet na hory, botanická zahrada, hudební festival, cesta na kole k moři, jazykové kurzy v zahraničí a historie čokolády.',

  // ── POSLECH ─────────────────────────────────────────────────────
  part1: {
    items: [
      {
        question: 'What did Jack forget to pack?',
        script: [
          'W: Have you got everything for the weekend, Jack? Your toothbrush, your swimming shorts?',
          'M: Yes, Mum. I packed my toothbrush last night, and the shorts are in the big bag.',
          "W: What about your sunglasses? The weather forecast says it's going to be sunny.",
          "M: They're on my head, look. Oh no, wait! My phone charger is still in the kitchen, next to the kettle.",
          'W: Well, run and get it. The taxi will be here in five minutes.',
        ].join('\n'),
        options: [
          { emoji: '🪥', caption: 'a toothbrush' },
          { emoji: '🩳🌊', caption: 'swimming shorts' },
          { emoji: '📱🔌', caption: 'a phone charger' },
          { emoji: '🕶️☀️', caption: 'sunglasses' },
        ],
        answer: 2,
        explanationCs:
          'Jack říká: „My phone charger is still in the kitchen“ – nabíječku zapomněl v kuchyni. Kartáček i plavky už sbalil a sluneční brýle má na hlavě.',
      },
      {
        question: 'What present did Lucy buy for her brother?',
        script: [
          'M: Hi Lucy. Did you find a birthday present for your brother in the end?',
          'W: Yes, finally. I wanted to get him a football shirt, but they were really expensive.',
          "M: What about a book? He loves reading, doesn't he?",
          'W: He does, but Grandma always gives him books. So I bought him a board game. We can all play it together at the weekend.',
          "M: Great idea. I think I'll get him some chocolate.",
        ].join('\n'),
        options: [
          { emoji: '🎲♟️', caption: 'a board game' },
          { emoji: '⚽👕', caption: 'a football shirt' },
          { emoji: '📚', caption: 'a book' },
          { emoji: '🍫', caption: 'some chocolate' },
        ],
        answer: 0,
        explanationCs:
          'Lucy říká: „So I bought him a board game.“ Dres byl moc drahý, knihy mu dává babička a čokoládu mu koupí kamarád.',
      },
      {
        question: 'How is Tom getting to school today?',
        script: [
          "W: Tom, aren't you going to cycle to school today? It's a lovely morning.",
          "M: I'd love to, but my bike's got a flat tyre. I'll fix it at the weekend.",
          'W: Then take the bus. It stops right outside the house.',
          "M: I can't. The bus drivers are on strike today.",
          "W: Oh, right. And I'm afraid I can't drive you. I've got to be at work by seven.",
          "M: Don't worry, Mum. It's only half an hour on foot. I'll leave now.",
        ].join('\n'),
        options: [
          { emoji: '🚲', caption: 'by bike' },
          { emoji: '🚌', caption: 'by bus' },
          { emoji: '🚗', caption: 'by car' },
          { emoji: '🚶🎒', caption: 'on foot' },
        ],
        answer: 3,
        explanationCs:
          'Kolo má píchlé, autobusy kvůli stávce nejezdí a maminka ho nemůže odvézt. Tom říká: „It\'s only half an hour on foot. I\'ll leave now.“ – půjde pěšky.',
      },
      {
        question: 'Where does the man find his keys?',
        script: [
          "M: Emma, have you seen my car keys? I'm going to be late for work.",
          'W: Have you looked on the little table by the door? You usually leave them there.',
          'M: Yes, and in my jacket pocket too. Nothing.',
          'W: What about the bathroom? Yesterday you left your glasses next to the sink.',
          "M: I've just checked there. Oh, here they are! Under the newspaper on the sofa.",
          'W: Of course. You were reading it before breakfast.',
        ].join('\n'),
        options: [
          { emoji: '🔑🚪', caption: 'on the table' },
          { emoji: '🔑📰🛋️', caption: 'under the newspaper' },
          { emoji: '🔑🧥', caption: 'in his jacket' },
          { emoji: '🔑🛁', caption: 'in the bathroom' },
        ],
        answer: 1,
        explanationCs:
          'Muž klíče najde: „Here they are! Under the newspaper on the sofa.“ Na stolku u dveří, v kapse bundy ani v koupelně nebyly.',
      },
    ],
  },

  part2: {
    introCs:
      'Uslyšíte rozhovor dvou spolužáků o školním výletě na hory. Na základě vyslechnuté nahrávky rozhodněte, zda jsou tvrzení 5–12 pravdivá (P), nebo nepravdivá (N).',
    script: [
      "M: Hi Katie. So how was the trip to the mountains? I'm still sad I missed it.",
      'W: Hi Ben! Are you feeling better? Mrs Palmer said you had a high temperature all last week.',
      "M: Yes, I'm fine now, thanks. It was flu, but it's over. So come on, tell me everything.",
      'W: Well, nothing really went as planned. First, our bus broke down on the motorway, about an hour after we left school.',
      'M: Oh no. What did you do?',
      'W: We waited at a petrol station for nearly three hours until another bus came. So we got to the hostel at nine in the evening, not at lunchtime.',
      'M: So you missed the first walk?',
      'W: Yes, and our dinner was cold because the cook had made it hours before. But the owner of the hostel made us all hot chocolate, which was really nice of her.',
      "M: And did you climb the big mountain on Saturday? That was the main plan, wasn't it?",
      "W: No, we didn't. It rained all day and there was thick fog, so Mr Hill said it was too dangerous. We went to a glass museum in the town instead.",
      'M: That sounds boring.',
      'W: I thought it would be boring too, but it was great. We watched a man make a glass bird, and then we each tried to make a small bowl. Mine looks terrible, but I brought it home anyway.',
      'M: And what about Sunday?',
      "W: Sunday was perfect, sunny and warm. There wasn't enough time for the big mountain, so we went up a smaller one by cable car and then walked back down to the hostel. It took about three hours.",
      "M: Did anyone get hurt? Last year somebody broke an arm, didn't they?",
      'W: Nobody got hurt this time, but Tom lost his phone on the way down. Luckily, a family found it and brought it back to him at the hostel.',
      'M: Lucky Tom! Would you go again?',
      'W: Definitely. Mr Hill says we might go back in February to go skiing. You must come with us this time.',
      "M: I will, if I don't get flu again!",
    ].join('\n'),
    statements: [
      {
        text: 'Ben is still ill.',
        answer: false,
        explanationCs:
          'Ben říká: „Yes, I\'m fine now, thanks. It was flu, but it\'s over.“ Už je zdravý.',
      },
      {
        text: 'The students waited for another bus for almost three hours.',
        answer: true,
        explanationCs:
          'Katie říká: „We waited at a petrol station for nearly three hours until another bus came.“',
      },
      {
        text: 'The students had a hot dinner when they arrived at the hostel.',
        answer: false,
        explanationCs:
          'Večeře byla studená: „our dinner was cold because the cook had made it hours before.“',
      },
      {
        text: 'The owner of the hostel made the students a hot drink.',
        answer: true,
        explanationCs:
          'Majitelka jim připravila horkou čokoládu: „the owner of the hostel made us all hot chocolate“.',
      },
      {
        text: 'The teacher cancelled the climb because of the weather.',
        answer: true,
        explanationCs:
          'Pan Hill výstup zrušil kvůli dešti a mlze: „It rained all day and there was thick fog, so Mr Hill said it was too dangerous.“',
      },
      {
        text: 'Katie expected the glass museum to be interesting.',
        answer: false,
        explanationCs:
          'Katie čekala nudu: „I thought it would be boring too, but it was great.“ Zajímavé to bylo až nakonec.',
      },
      {
        text: 'On Sunday, the students walked up a smaller mountain.',
        answer: false,
        explanationCs:
          'Nahoru jeli lanovkou a pěšky šli jen dolů: „we went up a smaller one by cable car and then walked back down“.',
      },
      {
        text: 'Tom got his lost phone back.',
        answer: true,
        explanationCs:
          'Telefon se našel: „a family found it and brought it back to him at the hostel.“',
      },
    ],
  },

  part3: {
    introCs:
      'Uslyšíte průvodkyni, která mluví k návštěvníkům botanické zahrady. Na základě vyslechnuté nahrávky odpovězte v angličtině na otázky 13–20. Odpovídejte nejvýše třemi slovy; čísla můžete psát číslicemi.',
    script: [
      "W: Good morning, everyone, and welcome to Riverside Botanical Garden. My name is Helen, and before you start exploring, I'd like to tell you a few useful things.",
      'W: First, our opening hours. From April to September, the garden is open every day from nine in the morning until seven in the evening. From October to March, we close earlier, at four o\'clock. Please remember that the last entry is always one hour before closing time.',
      "W: Now, tickets. You have already paid at the gate today, but if you want to come back, an adult ticket costs eight pounds and a student ticket is five pounds. Children under six get in free. And if you think you'll visit often, a year pass is great value at thirty pounds.",
      'W: The garden is quite big, so please take a map from the box next to me. The main path goes all the way round the lake, and the walk takes about forty minutes.',
      "W: Our most popular attraction is the Butterfly House. It's a warm greenhouse in the glass building behind the lake, and more than two hundred butterflies fly freely there among tropical plants. Please don't touch them. And before you leave, check your clothes, because sometimes our butterflies like to travel home with visitors!",
      "W: If you get hungry, the Orange Tree Café is next to the rose garden. It serves hot meals until three o'clock, and after that you can still get cakes and drinks. And please don't feed the ducks on the lake with bread. It makes them ill.",
      "W: At eleven o'clock and at two o'clock, one of our gardeners leads a free guided tour. It lasts about an hour and starts at the big fountain near the main entrance. Today's tour is about plants that people use as medicine, so it should be really interesting.",
      'W: Finally, a few rules. Dogs are welcome, but they must stay on a lead. Please keep to the paths and don\'t pick any flowers. If you have a question or you lose something, come to the information centre next to the gift shop.',
      'W: Thank you, and enjoy your visit!',
    ].join('\n'),
    questions: [
      {
        question: 'What time does the garden close from October to March?',
        accept: [
          "four o'clock",
          "4 o'clock",
          'four',
          '4',
          '4 pm',
          '4 p.m.',
          '4:00',
          '4.00',
          '16:00',
          '16.00',
          'at four',
          'at 4',
          "at four o'clock",
          "at 4 o'clock",
        ],
        explanationCs:
          'Průvodkyně říká: „From October to March, we close earlier, at four o\'clock.“ Sedm hodin večer platí pro období od dubna do září.',
      },
      {
        question: 'How much does a student ticket cost?',
        prefix: '£',
        accept: ['5', 'five', '5 pounds', 'five pounds', '£5'],
        explanationCs:
          '„A student ticket is five pounds.“ Osm liber stojí vstupenka pro dospělé a třicet liber roční permanentka.',
      },
      {
        question: 'Who can get into the garden for free?',
        accept: [
          'children under six',
          'children under 6',
          'kids under six',
          'kids under 6',
          'under six',
          'under 6',
          'under-sixes',
        ],
        explanationCs: 'V nahrávce zazní: „Children under six get in free.“',
      },
      {
        question: 'How long does the walk round the lake take?',
        accept: [
          '40 minutes',
          'forty minutes',
          'about 40 minutes',
          'about forty minutes',
          '40 mins',
          '40 min',
          '40',
          'forty',
        ],
        explanationCs:
          '„The main path goes all the way round the lake, and the walk takes about forty minutes.“',
      },
      {
        question: 'What should visitors check before they leave the Butterfly House?',
        accept: ['clothes', 'their clothes', 'your clothes', 'the clothes', 'their clothing'],
        explanationCs:
          'Průvodkyně říká: „before you leave, check your clothes“ – motýli se totiž rádi „svezou“ s návštěvníky domů.',
      },
      {
        question: 'Where is the Orange Tree Café?',
        prefix: 'next to the',
        accept: ['rose garden', 'the rose garden', 'roses'],
        explanationCs:
          '„The Orange Tree Café is next to the rose garden.“ Vedle obchodu se suvenýry (gift shop) je informační centrum, ne kavárna.',
      },
      {
        question: 'Where does the free guided tour start?',
        accept: [
          'the big fountain',
          'big fountain',
          'the fountain',
          'fountain',
          'at the fountain',
          'by the fountain',
        ],
        explanationCs:
          'Prohlídka „starts at the big fountain near the main entrance“. Začíná v 11 a ve 14 hodin.',
      },
      {
        question: 'Dogs are welcome in the garden. What must they stay on?',
        accept: ['a lead', 'lead', 'on a lead', 'a leash', 'leash', 'on a leash', 'the lead'],
        explanationCs:
          '„Dogs are welcome, but they must stay on a lead.“ Na cestách (paths) mají zůstat návštěvníci.',
      },
    ],
  },

  part4: {
    items: [
      {
        question: 'Where should passengers for Bristol go now?',
        script: [
          'W: Good afternoon. This is an announcement for passengers waiting for the two twenty-five train to Bristol. Because of a problem with the signals near Reading, this train will leave about twenty minutes late. Please note that it will now depart from platform six, not platform two. The café on platform two is open if you would like a hot drink while you wait. Passengers travelling with bicycles should speak to a member of staff. We are sorry for the delay.',
        ].join('\n'),
        options: ['to platform two', 'to the café', 'to a member of staff', 'to platform six'],
        answer: 3,
        explanationCs:
          'Hlášení říká: „it will now depart from platform six, not platform two.“ Se zaměstnancem mají mluvit jen cestující s koly.',
      },
      {
        question: 'What do customers get if they buy an adult bike?',
        script: [
          "M: Are you looking for a new bike this summer? Then come to Wheels and More on Station Road! This week, all children's bikes are twenty percent cheaper, and if you buy any adult bike, you'll get a helmet completely free. Our friendly mechanics can also repair your old bike while you wait. We're open Monday to Saturday from nine till six. Wheels and More, the friendliest bike shop in town!",
        ].join('\n'),
        options: [
          'twenty percent off',
          'a free helmet',
          'a free repair of their old bike',
          'a free bike lock',
        ],
        answer: 1,
        explanationCs:
          '„If you buy any adult bike, you\'ll get a helmet completely free.“ Sleva 20 % platí jen pro dětská kola a o opravě zdarma se nemluví.',
      },
      {
        question: 'What does Sophie ask Dan to do?',
        script: [
          "W: Hi Dan, it's Sophie. I'm calling about Saturday. I'm afraid I can't meet you at the cinema at six, because I have to look after my little sister until seven. Could we go to the later film at half past eight instead? We could have a pizza at Marco's before it. Don't worry about the tickets, I've already bought them online. Please text me back, because my phone battery is almost dead and I can't talk for long. Bye!",
        ].join('\n'),
        options: [
          'send her a message',
          'phone her back',
          'buy the cinema tickets',
          'meet her at six o\'clock',
        ],
        answer: 0,
        explanationCs:
          'Sophie prosí: „Please text me back“ – má jí napsat zprávu. Volat nemá, protože jí dochází baterie, a lístky už koupila.',
      },
      {
        question: 'What does the man get in the end?',
        script: [
          'M: Excuse me, I bought this jumper here last week, but it\'s too small. Can I change it for a bigger size?',
          "W: Let me check. I'm sorry, we haven't got it in large any more. But we've got the same jumper in green in your size.",
          "M: Hmm, I don't really like green. Could I have my money back, please?",
          'W: Have you got the receipt?',
          'M: Yes, here it is.',
          "W: Then that's no problem. I'll put the money back on your card.",
        ].join('\n'),
        options: ['a bigger jumper', 'a green jumper', 'his money back', 'a shop voucher'],
        answer: 2,
        explanationCs:
          'Větší velikost už nemají a zelenou barvu muž nechce. Prodavačka nakonec říká: „I\'ll put the money back on your card.“',
      },
    ],
  },

  // ── ČTENÍ ──────────────────────────────────────────────────────
  part5: {
    items: [
      {
        kind: 'Notice',
        text: [
          'SCHOOL LIBRARY – NEWS FOR THE NEW SCHOOL YEAR',
          'The library will be closed next Monday and Tuesday because the walls are being painted. From Wednesday, it will be open from 7.30 to 16.00, so it will close half an hour later than last year. Please return all books you borrowed before the holidays by the end of September. You can leave them in the box outside the staff room. New this year: you can reserve books online on the school website.',
          'Ms Harper, librarian',
        ].join('\n'),
        question: 'What does the notice say about the library?',
        options: [
          'It will be closed all next week.',
          'Students can now return books online.',
          'It will close later than last year.',
          'Students must give their books to Ms Harper.',
        ],
        answer: 2,
        explanationCs:
          'V oznámení stojí: „it will close half an hour later than last year.“ Online se knihy jen rezervují a vracejí se do krabice u sborovny.',
      },
      {
        kind: 'Text message',
        text: [
          "Hi Mia! Sorry, I won't be at the bus stop at 8 tomorrow – Dad's taking me to the dentist first. I'll get to school at about 10. Could you tell Mr Clark that I'll miss the maths test? And please bring my blue folder – I left it in your bag after art on Tuesday. See you at lunch!",
          'Zoe x',
        ].join('\n'),
        question: 'Why is Zoe writing to Mia?',
        options: [
          'to ask her for help',
          'to invite her to lunch',
          'to offer her a lift to school',
          'to say sorry for losing her folder',
        ],
        answer: 0,
        explanationCs:
          'Zoe Miu o něco prosí: „Could you tell Mr Clark…?“ a „please bring my blue folder“. Desky neztratila, jen je nechala v Miině tašce.',
      },
      {
        kind: 'Online advert',
        text: [
          'FOR SALE: ACOUSTIC GUITAR',
          "I'm selling my guitar because I've started playing the piano instead. It's three years old but in very good condition – there's just a small scratch on the back. It comes with a soft bag and a book of easy songs for beginners. I paid £150 for it and I'm asking £60. Sorry, I can't deliver – you'll need to collect it from my flat in Mill Street. Message me here if you're interested.",
          'Sam',
        ].join('\n'),
        question: 'What do we learn about the guitar?',
        options: [
          'It is brand new.',
          'The price includes delivery.',
          'It has no marks on it.',
          'The buyer will get some extra things with it.',
        ],
        answer: 3,
        explanationCs:
          'Ke kytaře patří obal a zpěvník: „It comes with a soft bag and a book of easy songs.“ Kytara je tři roky stará, má škrábanec a doručení není možné.',
      },
      {
        kind: 'Email',
        text: [
          'Hi Jake,',
          "Thanks for your email – I'm glad you want to join our football camp this summer! Unfortunately, the first week (1–7 July) is already full, but there are still places in the second week (8–14 July). The price is the same, £120, and it includes lunch every day. Please bring your own football boots; we'll give you a camp T-shirt. Let me know by Friday if the second week is OK for you.",
          'Best wishes,',
          'Carl Evans, Camp Manager',
        ].join('\n'),
        question: 'What does Carl tell Jake?',
        options: [
          'Lunch costs extra.',
          'He can only come in the second week.',
          'He needs to bring a T-shirt.',
          'The second week is more expensive.',
        ],
        answer: 1,
        explanationCs:
          '„The first week (1–7 July) is already full, but there are still places in the second week.“ Cena je stejná, oběd je v ceně a tričko dostane.',
      },
      {
        kind: 'Sign',
        text: [
          'CITY SWIMMING POOL – PLEASE READ',
          '• Children under 8 must be with an adult in the water.',
          '• Please have a shower before you swim.',
          '• No food or drinks by the pool – you can use the café upstairs.',
          '• Lockers need a £1 coin – you get it back when you open the locker.',
          '• The big slide is closed for repairs until 15 August.',
          'Thank you and enjoy your swim!',
        ].join('\n'),
        question: 'What does the sign say?',
        options: [
          'Children under 8 cannot use the pool.',
          'Swimmers can have snacks by the pool.',
          'The slide will be closed for the whole summer.',
          'Using a locker costs nothing in the end.',
        ],
        answer: 3,
        explanationCs:
          'Mince do skříňky se vrací: „you get it back when you open the locker.“ Děti do 8 let smějí plavat s dospělým a skluzavka je zavřená jen do 15. srpna.',
      },
    ],
  },

  part6: {
    introCs:
      'Přečtěte si informace pro dobrovolníky letního hudebního festivalu. Na základě informací v textu rozhodněte, zda jsou tvrzení 30–39 pravdivá (P), nebo nepravdivá (N).',
    title: 'Green Valley Festival – Information for Volunteers',
    text: [
      'Thank you for joining our volunteer team this summer! Green Valley Festival takes place from 18 to 21 July, and we could not do it without you. Please read this information carefully before you arrive.',
      "YOUR TASKS\nVolunteers help in many different areas: at the entrance gates, in the information tents, in the recycling team and in the children's area. We will try to give you the job you chose on your application form, but we cannot promise this. You will find out your task at the welcome meeting on 17 July at 6 pm. All volunteers must attend this meeting.",
      'SHIFTS\nEvery volunteer works three six-hour shifts during the festival. Shifts start at 8 am, 2 pm or 8 pm. Night shifts are only for volunteers aged 21 or over. If you want to swap a shift with another volunteer, you must tell your team leader at least one day before.',
      "FOOD AND DRINK\nYou will get a free hot meal before or after each shift in the volunteers' kitchen behind the main stage. Vegetarian and vegan meals are always available. If you have a food allergy, please email us before 1 July. Bring your own bottle – there are free water points all over the festival site.",
      "ACCOMMODATION\nVolunteers can stay free of charge at the volunteers' campsite, which is quieter than the main campsite and has hot showers. You need to bring your own tent and sleeping bag. Cars are not allowed on the campsite, but there is a free car park a ten-minute walk away.",
      'WHAT YOU GET\nIn return for your work, you get a free ticket for the whole festival, so when you are not working, you can enjoy the concerts like everyone else. You will also get a volunteer T-shirt, which you must wear during your shifts. You can keep it after the festival.',
      'RULES\nVolunteers must not drink alcohol before or during their shifts. If you are late for a shift twice, you will have to pay for your festival ticket (£180). If you feel ill, call your team leader as soon as possible.',
      'We hope you have a fantastic time with us!',
    ].join('\n\n'),
    statements: [
      {
        text: 'Volunteers will always get the job they chose on their application form.',
        answer: false,
        explanationCs:
          'Organizátoři to nezaručují: „We will try to give you the job you chose… but we cannot promise this.“',
      },
      {
        text: 'Volunteers find out what their job is before the festival begins.',
        answer: true,
        explanationCs:
          'Úkol se dozvědí na schůzce 17. července („at the welcome meeting on 17 July“), festival začíná až 18. července.',
      },
      {
        text: 'Each volunteer works eighteen hours in total during the festival.',
        answer: true,
        explanationCs:
          '„Every volunteer works three six-hour shifts“ – tři směny po šesti hodinách jsou dohromady 18 hodin.',
      },
      {
        text: 'Volunteers who are eighteen can work night shifts.',
        answer: false,
        explanationCs: 'Noční směny jsou jen pro starší: „Night shifts are only for volunteers aged 21 or over.“',
      },
      {
        text: 'Volunteers who want to swap a shift can tell their team leader on the day of the shift.',
        answer: false,
        explanationCs:
          'Výměnu je třeba nahlásit předem: „you must tell your team leader at least one day before.“',
      },
      {
        text: "Volunteers can get vegan food in the volunteers' kitchen.",
        answer: true,
        explanationCs: 'V textu stojí: „Vegetarian and vegan meals are always available.“',
      },
      {
        text: 'Volunteers with a food allergy should contact the organisers in advance.',
        answer: true,
        explanationCs: '„If you have a food allergy, please email us before 1 July.“ – tedy s předstihem.',
      },
      {
        text: 'The festival gives volunteers a tent to sleep in.',
        answer: false,
        explanationCs: 'Stan si musí přivézt sami: „You need to bring your own tent and sleeping bag.“',
      },
      {
        text: "Volunteers can park their cars at the volunteers' campsite.",
        answer: false,
        explanationCs:
          '„Cars are not allowed on the campsite“ – parkoviště je deset minut chůze od kempu.',
      },
      {
        text: 'Volunteers can go to concerts when they are not working.',
        answer: true,
        explanationCs:
          'Dostanou vstupenku na celý festival, „so when you are not working, you can enjoy the concerts“.',
      },
    ],
  },

  part7: {
    introCs:
      'Přečtěte si blog mladé ženy, která se rozhodla dojet na kole z Prahy k moři. Na základě informací v textu vyberte ke každé úloze 40–44 jednu správnou odpověď (A–D).',
    title: 'From Prague to the Sea – by Bike!',
    text: [
      "Last summer, I did something my friends still can't believe: I cycled from Prague all the way to the sea. Here's how it happened.",
      "It all started with an argument. One evening in March, my brother Petr laughed at me because I took the tram just two stops to the shop. 'You're so lazy,' he said. 'You couldn't even cycle to the next town.' I was so angry that I told him I would cycle to the sea that summer. He didn't believe me. To be honest, I didn't really believe it either.",
      "I wasn't a sporty person at all. I didn't even have a proper bike, only an old one that used to belong to my grandma. So I spent my savings on a second-hand touring bike and started training. At first, I rode to work twice a week, which is about fifteen kilometres. By June, I was doing sixty kilometres every Saturday.",
      'My plan was simple: follow the rivers. From Prague, I would ride north along the Vltava to Mělník, where it joins the Elbe, and then follow the Elbe through Germany to the North Sea. The route is about a thousand kilometres long, but it is almost completely flat, which was great news for my legs.',
      'I left on the first of July with two bags, a small tent and far too many clothes. After three days, I posted half of them back home. Most nights I slept at campsites, but when it rained, I stayed in cheap guesthouses. My worst day was near Magdeburg in Germany, when I got two flat tyres in one afternoon and had to push my bike for the last five kilometres. I sat down by the road and cried. Then an old man stopped his car, gave me a bottle of cold lemonade and showed me the way to a bike shop. I will never forget his kindness.',
      "The best part of the trip wasn't the landscape, although it was beautiful. It was the people. I met cyclists from all over Europe, and I spoke more German in less than three weeks than in six years at school. A Dutch couple in their seventies rode with me for four days – and they were much faster than me!",
      "After nineteen days, I finally saw the sea at Cuxhaven. It was grey, windy and cold, but I ran into the water in all my clothes. Then I sent a photo to Petr. He replied with just one word: 'Respect.'",
      "Now I cycle everywhere, and I'm already planning my next trip – to the Adriatic this time. Does anyone want to join me?",
    ].join('\n\n'),
    questions: [
      {
        question: 'Why did the writer decide to cycle to the sea?',
        options: [
          'She had always wanted to see the North Sea.',
          'Her brother wanted to go with her.',
          'She was angry about what her brother said.',
          'She needed to get fit for a race.',
        ],
        answer: 2,
        explanationCs:
          'Bratr jí řekl, že je líná, a ona se naštvala: „I was so angry that I told him I would cycle to the sea that summer.“',
      },
      {
        question: 'Before the trip, the writer…',
        options: [
          'trained by cycling to work every day.',
          'bought a used bike.',
          "borrowed her grandmother's bike.",
          'cycled sixty kilometres every Saturday from March.',
        ],
        answer: 1,
        explanationCs:
          '„I spent my savings on a second-hand touring bike“ – koupila si ojeté kolo. Do práce jezdila dvakrát týdně a 60 km zvládala až v červnu.',
      },
      {
        question: 'What did the writer like about the route?',
        options: [
          'There were hardly any hills.',
          'It was shorter than she expected.',
          'There were campsites everywhere.',
          'It went through the biggest cities in Germany.',
        ],
        answer: 0,
        explanationCs:
          'Trasa je „almost completely flat, which was great news for my legs“ – skoro žádné kopce.',
      },
      {
        question: "What happened on the writer's worst day?",
        options: [
          'She got lost and arrived at the campsite late.',
          'She had an accident with a car.',
          'Heavy rain made her stay in a guesthouse.',
          'She had problems with her bike, and a stranger helped her.',
        ],
        answer: 3,
        explanationCs:
          'Dvakrát píchla kolo („two flat tyres in one afternoon“) a cizí starý pán jí dal limonádu a ukázal cestu do servisu. Auto ji nesrazilo, jen u ní zastavilo.',
      },
      {
        question: 'What does the writer say about the people she met?',
        options: [
          'The Dutch couple could not keep up with her.',
          'She got a lot of practice in German.',
          'She liked the landscape more than the people.',
          'She travelled with a Dutch couple for most of the trip.',
        ],
        answer: 1,
        explanationCs:
          '„I spoke more German in less than three weeks than in six years at school.“ Nizozemci s ní jeli jen čtyři dny a byli rychlejší než ona.',
      },
    ],
  },

  part8: {
    introCs:
      'Přečtěte si, co hledá pět mladých lidí (45–49), a nabídky letních jazykových kurzů v zahraničí (A–G). Ke každé osobě přiřaďte kurz, který splňuje všechny její požadavky. Dvě nabídky nebudou použity.',
    people: [
      {
        name: 'Anna',
        text: "I'm sixteen and my English grammar is quite good, but I need more practice speaking. I'd love to stay with a local family so that I can speak English at home too. I really enjoy being on the water, so some water sports would be great. I'm working in July, so the course must be in August.",
        answer: 3,
        explanationCs:
          'Kurz D: angličtina se zaměřením na mluvení, bydlení v rodinách, plachtění a kajak a termíny až do konce srpna. Kurz F se surfováním se koná jen v červenci.',
      },
      {
        name: 'Marek',
        text: "Next spring I'm taking the B2 First exam, so I want a course that prepares students for it. I learn best when the teacher has time for everyone, so the groups must be really small. I don't want to live with a family – I'd prefer my own room. I can only go for two weeks.",
        answer: 1,
        explanationCs:
          'Kurz B: příprava na B2 First, nejvýše šest studentů ve třídě, jednolůžkové pokoje na koleji a dvoutýdenní kurz. Kurz D nabízí přípravu na zkoušku, ale třídy mají až 12 studentů a bydlí se v rodinách.',
      },
      {
        name: 'Lucie',
        text: "I've never studied Spanish, but I'd like to start this summer, so I need a course for complete beginners. I'm fifteen, and my parents say I can't spend more than €700, including accommodation. I also want to see more than just the classroom, so trips to interesting places would be great.",
        answer: 6,
        explanationCs:
          'Kurz G: španělština pro všechny úrovně včetně úplných začátečníků, věk 14–17, výlety každou sobotu a cena 650 € včetně ubytování. Kurz A je jen pro pokročilé a stojí 890 €.',
      },
      {
        name: 'Tomáš',
        text: "I'm eighteen and I've studied German for four years. After school I'd like to work for an international company, so I want to improve my German and get some work experience abroad at the same time. I've got a whole month free. I grew up in a village, so this time I want to live in a big city.",
        answer: 2,
        explanationCs:
          'Kurz C: němčina a praxe v místní firmě, čtyři týdny, Mnichov (velké město), účastníci od 18 let se středně pokročilou němčinou.',
      },
      {
        name: 'Eva',
        text: "I'm fourteen and I'm going abroad on my own for the first time, so my parents want adults to look after me day and night. I want to improve my English, of course, but I also love acting and would like to perform on stage. A course of about three weeks would be perfect.",
        answer: 4,
        explanationCs:
          'Kurz E: pro věk 12–15, angličtina a divadelní dílny s představením na konci, tři týdny a dozor „24 hours a day“. Ostatní anglické kurzy jsou až od 15 nebo 16 let.',
      },
    ],
    offers: [
      {
        title: 'Madrid Spanish Intensive',
        text: 'Take your Spanish to the next level in the heart of Madrid! Our intensive courses are for intermediate and advanced students aged 15–18, and everyone takes a short level test on the first day. Lessons are every morning, and in the afternoons we visit museums, markets and the Royal Palace. At weekends there are trips to Toledo and Segovia. Two weeks, including a room in a shared student flat: €890.',
      },
      {
        title: 'Exam Focus Edinburgh',
        text: "Are you preparing for B2 First or IELTS? Our two-week courses in Scotland's capital focus completely on exam skills. With a maximum of six students in each class, our teachers can give you lots of personal attention. You'll practise with real exam papers and take a full practice test at the end. Students aged 16–19 stay in single rooms in a modern student residence, just five minutes from the school.",
      },
      {
        title: 'Work & Learn Munich',
        text: "Improve your German and your CV at the same time! Spend four weeks in Munich, one of Germany's largest cities. From Monday to Wednesday you'll have German lessons, and on Thursdays and Fridays you'll work in a local company – in an office, a hotel or a shop, depending on your interests. Participants must be at least 18 and have an intermediate level of German. Accommodation is in shared student flats.",
      },
      {
        title: 'Sun, Sea and English – Brighton',
        text: "Spend two unforgettable weeks on the south coast of England! Courses run from mid-July to the end of August for students aged 15–18. Every morning there are four lessons of general English with a strong focus on speaking. In the afternoons, choose from sailing, kayaking or beach volleyball. All students live with carefully chosen local families. Classes have up to 12 students. Exam preparation is available for an extra fee.",
      },
      {
        title: 'Stage & Speak Summer School',
        text: 'A three-week summer school for young people aged 12–15 who love the theatre. Mornings are for English lessons. In the afternoons, professional actors lead drama workshops, and at the end of the course the students perform a play for their parents. Everyone lives on our school campus in the countryside near Cambridge, and our staff are with the students 24 hours a day. Mobile phones can only be used in the evenings.',
      },
      {
        title: 'Cornwall Surf & English',
        text: 'Learn English and learn to surf! Our courses take place in Newquay, one of the best places for surfing in Britain. Lessons are in the morning, and every afternoon there is a surfing lesson with a qualified instructor. Students aged 16–19 stay with friendly local families. Please note that courses are only available in July. Price: £1,150 for two weeks, including all meals and surfboard hire.',
      },
      {
        title: 'Hola Valencia',
        text: 'Would you like to learn Spanish by the sea? Our courses in Valencia are for teenagers aged 14–17 at all levels, from complete beginners to advanced. Classes have a maximum of ten students. Every Saturday we go on a trip to a nearby town, a castle or a beautiful nature park. Two weeks, including lessons, trips and accommodation with a Spanish family: only €650.',
      },
    ],
  },

  // ── JAZYKOVÁ KOMPETENCE ────────────────────────────────────────
  part9: {
    introCs:
      'Přečtěte si text o historii čokolády. Ke každé mezeře (50–59) vyberte jednu možnost (A–C), která do textu gramaticky i významově patří.',
    title: 'A Short History of Chocolate',
    text: [
      'Today, chocolate is one of {{1}} most popular sweets in the world, but for most of its history, people did not eat it – they drank it. More than 3,000 years ago, people in Central America {{2}} to grow cacao trees. The Maya, and later the Aztecs, made a bitter drink from cacao beans, water and chilli peppers. Cacao beans were so valuable that the Aztecs even {{3}} them as money.',
      "In the 16th century, Spanish explorers brought cacao beans back to Europe. The Spanish, {{4}} did not like the bitter taste, added sugar and honey to the drink. For almost a hundred years, the recipe {{5}} secret in Spain, but slowly hot chocolate became fashionable in rich homes across Europe. In the 1650s, the first chocolate houses, similar {{6}} today's cafés, opened in London.",
      'For a long time, chocolate was a drink only for the rich because it was very expensive. Everything changed in the 19th century, when new machines {{7}} it possible to produce chocolate cheaply. In 1847, a British company made the first chocolate bar, and in 1875 a Swiss man called Daniel Peter {{8}} up with the idea of adding milk.',
      'Nowadays, the average person in Switzerland eats about ten kilos of chocolate a year – {{9}} than in any other country. However, some experts are worried. Cacao trees need a lot of rain and warm weather, and if the climate continues to change, farmers may soon {{10}} out of good land to grow them.',
    ].join('\n\n'),
    gaps: [
      {
        options: ['a', 'the', '–'],
        answer: 1,
        explanationCs:
          'Ve spojení „one of the most popular“ stojí před 3. stupněm přídavného jména vždy určitý člen „the“.',
      },
      {
        options: ['started', 'have started', 'were starting'],
        answer: 0,
        explanationCs:
          'Časový údaj „more than 3,000 years ago“ vyžaduje minulý čas prostý: „started“. Předpřítomný čas se s „ago“ nepoužívá.',
      },
      {
        options: ['made', 'paid', 'used'],
        answer: 2,
        explanationCs:
          'Správná kolokace je „use something as money“ (používat něco jako peníze).',
      },
      {
        options: ['which', 'who', 'what'],
        answer: 1,
        explanationCs:
          'Vztažná věta se vztahuje k lidem („The Spanish“), proto „who“. „Which“ se používá pro věci a „what“ nelze použít po podstatném jménu.',
      },
      {
        options: ['was kept', 'was keeping', 'has kept'],
        answer: 0,
        explanationCs:
          'Recept někdo držel v tajnosti – je potřeba trpný rod v minulém čase: „the recipe was kept secret“.',
      },
      {
        options: ['with', 'as', 'to'],
        answer: 2,
        explanationCs: 'Přídavné jméno „similar“ se pojí s předložkou „to“: „similar to today\'s cafés“.',
      },
      {
        options: ['did', 'made', 'let'],
        answer: 1,
        explanationCs:
          'Ustálená vazba „make it possible to do something“ = umožnit něco. S „do“ ani „let“ se takto nepoužívá.',
      },
      {
        options: ['got', 'made', 'came'],
        answer: 2,
        explanationCs: 'Frázové sloveso „come up with an idea“ znamená přijít s nápadem.',
      },
      {
        options: ['more', 'most', 'much'],
        answer: 0,
        explanationCs:
          'Za mezerou následuje „than“, jde tedy o 2. stupeň: „more than in any other country“.',
      },
      {
        options: ['go', 'run', 'get'],
        answer: 1,
        explanationCs:
          'Frázové sloveso „run out of something“ znamená, že něco dojde (už nezbude): farmářům může dojít vhodná půda.',
      },
    ],
  },

  part10: {
    introCs:
      'Přečtěte si e-mail. Do každé mezery (60–64) doplňte jedno slovo tak, aby text byl gramaticky správný a dával smysl. Odpověď 0 je uvedena jako příklad.',
    title: 'A New Home',
    text: [
      'Hi Olivia,',
      "Sorry I haven't written {{0}} ages! As you know, we moved to Brno last month because Mum got a new job here. Before we came, I was really afraid {{1}} starting at a new school where I didn't know anyone. But it's been fine. A girl called Tereza sits next to me in maths, and I like {{2}} a lot. She lives in {{3}} same street as me, so we walk to school together every morning. Last weekend she showed me the old town, and we went to a great concert. {{4}} you ever been to Brno? You'd love it! Our new flat is bigger than the old one, so you can come and stay in the summer. Write soon – I'm looking forward to {{5}} from you!",
      'Love,',
      'Jana',
    ].join('\n'),
    example: 'for',
    gaps: [
      {
        accept: ['of'],
        explanationCs:
          'Přídavné jméno „afraid“ se pojí s předložkou „of“: „afraid of starting at a new school“.',
      },
      {
        accept: ['her'],
        explanationCs:
          'Mluví se o Tereze, proto zájmeno v předmětu „her“: „I like her a lot.“',
      },
      {
        accept: ['the'],
        explanationCs: 'Ve spojení „the same“ je vždy určitý člen: „in the same street as me“.',
      },
      {
        accept: ['have'],
        explanationCs:
          'Otázka v předpřítomném čase se tvoří pomocným slovesem „have“: „Have you ever been to Brno?“',
      },
      {
        accept: ['hearing'],
        explanationCs:
          'Po „look forward to“ následuje tvar -ing: „I\'m looking forward to hearing from you.“',
      },
    ],
  },
};
