import type { ExamSet } from '../../exam/types';

/**
 * Cvičný test C — original content modelled on the structure of the CERMAT
 * didaktický test (anglický jazyk). All texts and recordings are original.
 */
export const SET_C: ExamSet = {
  id: 'set-c',
  title: 'Cvičný test C',
  descriptionCs:
    'Svatba, oprava bytu, kino a vaření, narozeninové překvapení pro mámu, výměnný pobyt ve Skotsku, městská knihovna, útulek pro zvířata, sportovní kluby, historie olympijských her a první letní brigáda.',

  // ── POSLECH ─────────────────────────────────────────────────────
  part1: {
    items: [
      {
        question: "What will Katie wear to her cousin's wedding?",
        script: [
          "M: Katie, have you decided what to wear to your cousin's wedding on Saturday?",
          "W: Not yet. I wanted to wear my red dress, but the bride's sisters are all wearing red, so that's out.",
          'M: What about your green skirt and a nice top?',
          "W: It's too short for a church. And my black trousers are too simple for a wedding. I think I'll wear the long blue dress Grandma bought me last summer.",
          "M: Good choice. You'll look lovely in it.",
        ].join('\n'),
        options: [
          { emoji: '👗🔴', caption: 'a red dress' },
          { emoji: '👚🟢', caption: 'a green skirt and top' },
          { emoji: '👖⚫', caption: 'black trousers' },
          { emoji: '👗🔵', caption: 'a long blue dress' },
        ],
        answer: 3,
        explanationCs:
          "Katie říká: „I think I'll wear the long blue dress Grandma bought me.“ Červené šaty, zelenou sukni i černé kalhoty zmíní, ale odmítne je.",
      },
      {
        question: "Which room in Emma's flat needs repairing?",
        script: [
          "W: Good morning, Mr Harris. It's Emma from flat six. I'm afraid something in the flat needs repairing again.",
          'M: Oh no. Is it the kitchen tap?',
          "W: No, the tap's fine now, and the heating in the living room works well too. It's the shower in the bathroom. It's leaking, and there's water all over the floor.",
          "M: I'm sorry to hear that. I'll come round this afternoon.",
          "W: Thanks. Your son fixed the bedroom window last week, so that's the only problem.",
        ].join('\n'),
        options: [
          { emoji: '🍳🚰', caption: 'the kitchen' },
          { emoji: '🛁🚿', caption: 'the bathroom' },
          { emoji: '🛋️📺', caption: 'the living room' },
          { emoji: '🛏️🪟', caption: 'the bedroom' },
        ],
        answer: 1,
        explanationCs:
          "Emma říká: „It's the shower in the bathroom. It's leaking.“ Kohoutek v kuchyni i topení v obývacím pokoji fungují a okno v ložnici už bylo opraveno.",
      },
      {
        question: 'What time does the film they choose start?',
        script: [
          "M: Would you like to see the new space film tonight? There's a show at seven o'clock.",
          "W: That's too early. I don't finish work until half past six.",
          'M: OK. The next show starts at half past eight.',
          "W: That finishes very late. Isn't there one at eight?",
          'M: No, on Fridays there are only two shows.',
          "W: Fine, let's go to the later one, then. I'll meet you there.",
        ].join('\n'),
        options: [
          { emoji: '🎬🕣', caption: 'half past eight' },
          { emoji: '🎬🕖', caption: "seven o'clock" },
          { emoji: '🎬🕗', caption: "eight o'clock" },
          { emoji: '🎬🕡', caption: 'half past six' },
        ],
        answer: 0,
        explanationCs:
          'Představení v sedm je pro ženu moc brzy a v osm se nehraje, proto zvolí „the later one“, tedy film „at half past eight“.',
      },
      {
        question: 'What is the man going to cook for his parents?',
        script: [
          'W: Something smells nice. Are you making spaghetti again?',
          'M: Not tonight. My parents are coming for dinner, so I wanted to make fish, but the shop had sold out.',
          'W: So what are you going to make? Pizza?',
          "M: Dad doesn't like pizza. I'm making chicken curry with rice. What you can smell is just the onions. I've started frying them.",
          'W: Lovely. Your mum loves curry.',
        ].join('\n'),
        options: [
          { emoji: '🍝', caption: 'a plate of spaghetti' },
          { emoji: '🐟🥔', caption: 'fish and potatoes' },
          { emoji: '🍗🍛', caption: 'chicken curry and rice' },
          { emoji: '🍕', caption: 'a cheese pizza' },
        ],
        answer: 2,
        explanationCs:
          "Muž říká: „I'm making chicken curry with rice.“ Rybu chtěl, ale byla vyprodaná, a pizzu jeho táta nemá rád.",
      },
    ],
  },

  part2: {
    introCs:
      'Uslyšíte rozhovor sourozenců, kteří plánují překvapení k narozeninám své maminky. Na základě vyslechnuté nahrávky rozhodněte, zda jsou tvrzení 5–12 pravdivá (P), nebo nepravdivá (N).',
    script: [
      "M: Ellie, have you got a minute? Mum's fiftieth birthday is next Friday, and I think we should do something special for her.",
      "W: I was thinking the same, Sam. What about a surprise party?",
      "M: Great idea. But not on Friday. She works until seven on Fridays, and she's always tired afterwards.",
      "W: True. So let's have it on Saturday evening. I've already talked to Dad. He'll take her out for lunch and a long walk by the lake, and we'll get everything ready at home.",
      'M: At home? I thought we could book a table at that Italian restaurant she likes.',
      "W: I checked their prices last week. For twenty people it would be far too expensive. We can use the garden, and if it rains, we'll move everything into the living room.",
      "M: OK, you're right. So who are we going to invite?",
      "W: Aunt Carol and Uncle Pete, Grandma, the neighbours and Mum's friends from work. I've got the number of her best friend, Sarah, so I'll ask her to tell the others.",
      'M: And what about food? I could order some pizzas.',
      "W: Mum doesn't really like pizza. Let's make sandwiches and a few salads ourselves. Grandma has already promised to bake a lemon cake. It's Mum's favourite.",
      "M: Perfect. And I'll take care of the music. I'll make a playlist of all those old songs she loves.",
      "W: Good. Now, the present. I wanted to buy her a nice scarf, but I've got a better idea. What about a photo book with pictures of the whole family?",
      "M: I love it. I'll look through Grandma's old boxes for photos and scan them. You're better at design than me, so you can make the book on the computer.",
      "W: Deal. But it has to be ready by Thursday. Oh, and one more thing. We mustn't say anything to Harry.",
      'M: Why not?',
      "W: Because he's eight and he can't keep a secret! Remember Dad's birthday last year? Harry told him everything the day before.",
      "M: Ha, yes. OK, we'll tell Harry on Saturday morning, when Mum has already left.",
    ].join('\n'),
    statements: [
      {
        text: "The party will take place on Mum's birthday.",
        answer: false,
        explanationCs:
          'Maminka má narozeniny v pátek („next Friday“), ale oslava bude až „on Saturday evening“, protože v pátek pracuje do sedmi.',
      },
      {
        text: 'Dad is going to take Mum out while Sam and Ellie get the party ready.',
        answer: true,
        explanationCs:
          "Ellie říká: „I've already talked to Dad. He'll take her out for lunch and a long walk by the lake, and we'll get everything ready at home.“",
      },
      {
        text: 'Ellie thinks the Italian restaurant would be too expensive.',
        answer: true,
        explanationCs: 'Ellie o restauraci říká: „For twenty people it would be far too expensive.“',
      },
      {
        text: "Ellie is going to phone all of Mum's friends from work.",
        answer: false,
        explanationCs:
          "Ellie zavolá jen maminčině nejlepší kamarádce Sarah: „I'll ask her to tell the others.“",
      },
      {
        text: 'Grandma is going to bake a chocolate cake.',
        answer: false,
        explanationCs: 'Babička upeče citronový dort: „Grandma has already promised to bake a lemon cake.“',
      },
      {
        text: 'Sam is going to prepare the music for the party.',
        answer: true,
        explanationCs: "Sam říká: „I'll take care of the music. I'll make a playlist…“",
      },
      {
        text: 'Sam and Ellie are going to buy Mum a scarf.',
        answer: false,
        explanationCs:
          'Ellie původně chtěla koupit šálu, ale má lepší nápad – dají mamince „a photo book with pictures of the whole family“.',
      },
      {
        text: 'Harry will learn about the party on the day it takes place.',
        answer: true,
        explanationCs:
          "Sam říká: „we'll tell Harry on Saturday morning“ – tedy v den oslavy. „The day before“ se týká loňských tátových narozenin.",
      },
    ],
  },

  part3: {
    introCs:
      'Uslyšíte učitelku, která třídě představuje výměnný pobyt se školou ve Skotsku. Na základě vyslechnuté nahrávky odpovězte na otázky 13–20. Odpovídejte maximálně třemi slovy, čísla můžete psát číslicemi.',
    script: [
      "W: Good morning, everyone. This is our English lesson, so I'm going to tell you about our new exchange programme in English. This year our school is starting a partnership with Kelburn Academy, a secondary school in Stirling, in the middle of Scotland.",
      "W: The first part of the exchange will be in May. We're leaving on Sunday the twelfth of May and coming back ten days later. We'll fly from Prague to Edinburgh, and a coach from the Scottish school will take us from the airport to Stirling. It's about an hour's drive.",
      "W: There is space for sixteen students on this trip. If more of you are interested, we'll choose students by their English marks and by a short letter about why you want to go.",
      "W: You'll stay with host families. Each of you will have a Scottish partner of about your age, and you'll live in his or her home. In the mornings you'll go to lessons with your partner, and in the afternoons we'll do activities together. Then in October your partners will come here and stay with your families, so please ask your parents first if they're happy to have a guest.",
      "W: We've planned some great trips. On the first Saturday we're going to take a boat trip on Loch Lomond, which is one of the most beautiful lakes in Scotland. We'll also visit Stirling Castle, and on our last day we're spending the whole day in Edinburgh.",
      "W: Now, what to bring. The weather in Scotland can change very quickly, even in May, so pack a waterproof jacket and some warm jumpers. Please also bring walking boots, not just trainers, because we'll walk in the hills. And it's a nice idea to give your host family a small present, something typical from the Czech Republic.",
      "W: The price of the exchange is nine thousand eight hundred crowns. That includes the flights, the coach and all the trips. Your host family will give you breakfast and dinner, but you'll need some pocket money for lunch.",
      "W: You can find the application form on the school website. Please give it to me by the end of next week. And there'll be a meeting for parents next Tuesday at six o'clock in the school library. If you have any questions, email me or come and see me in the staff room.",
    ].join('\n'),
    questions: [
      {
        question: 'Which city will the group fly to?',
        accept: ['Edinburgh', 'to Edinburgh'],
        explanationCs:
          "Učitelka říká: „We'll fly from Prague to Edinburgh.“ Do Stirlingu pak skupina pojede autobusem z letiště.",
      },
      {
        question: 'How many students can go on the trip?',
        accept: ['16', 'sixteen', '16 students', 'sixteen students'],
        explanationCs: 'Zazní: „There is space for sixteen students on this trip.“ Deset dní je délka pobytu.',
      },
      {
        question: 'When will the Scottish students come to the Czech school?',
        prefix: 'in',
        accept: ['October', 'in October'],
        explanationCs: 'Zazní: „Then in October your partners will come here and stay with your families.“',
      },
      {
        question: 'What will the students do on the first Saturday?',
        prefix: 'take a',
        suffix: 'trip',
        accept: ['boat', 'boat trip', 'a boat trip'],
        explanationCs:
          "Zazní: „On the first Saturday we're going to take a boat trip on Loch Lomond.“",
      },
      {
        question: 'What kind of shoes should the students bring?',
        accept: ['walking boots', 'boots', 'some walking boots'],
        explanationCs:
          'Učitelka říká: „Please also bring walking boots, not just trainers.“ Tenisky nestačí, protože budou chodit po kopcích.',
      },
      {
        question: 'What should the students give their host family?',
        accept: ['a small present', 'small present', 'a present', 'present', 'a small gift', 'small gift', 'a gift', 'gift'],
        explanationCs:
          "Zazní: „it's a nice idea to give your host family a small present, something typical from the Czech Republic.“",
      },
      {
        question: 'Which meal do the students need pocket money for?',
        accept: ['lunch', 'for lunch', 'lunches'],
        explanationCs:
          "Snídani a večeři zajistí hostitelská rodina, ale „you'll need some pocket money for lunch“.",
      },
      {
        question: "Where will the parents' meeting take place?",
        prefix: 'in the',
        accept: ['school library', 'library', 'the school library', 'the library', 'in the library'],
        explanationCs:
          "Zazní: „there'll be a meeting for parents next Tuesday at six o'clock in the school library.“",
      },
    ],
  },

  part4: {
    items: [
      {
        question: 'Where can customers find shoes now?',
        script: [
          "W: Good afternoon, shoppers, and welcome to Harper's department store. This weekend only, all winter coats on the second floor are half price. If you're looking for shoes, please note that our shoe department has moved from the ground floor to the third floor, next to the café. And don't forget that the store closes early today, at five o'clock, because of our staff Christmas party. Thank you for shopping at Harper's.",
        ].join('\n'),
        options: ['on the ground floor', 'on the second floor', 'on the third floor', 'in the café'],
        answer: 2,
        explanationCs:
          'Oddělení obuvi se přestěhovalo „from the ground floor to the third floor, next to the café“. Ve druhém patře jsou zimní kabáty.',
      },
      {
        question: 'What will visitors get on the day the pool opens again?',
        script: [
          'M: And now some local news. The Park Road swimming pool, which closed in January for repairs, will open again next Monday, two weeks later than planned. The pool now has a new roof and a bigger area for children, and swimming lessons for beginners will start again in March. To celebrate, entry will be free for everyone on Monday. From Tuesday, tickets will cost four pounds for adults and two pounds for children.',
        ].join('\n'),
        options: ['a free swimming lesson', 'free entry', 'a cheaper ticket for children', 'a tour of the building'],
        answer: 1,
        explanationCs:
          'Bazén otevře v pondělí a „entry will be free for everyone on Monday“. Lekce plavání začnou až v březnu a ceny vstupenek platí od úterý.',
      },
      {
        question: "When will Lisa's family eat at the restaurant?",
        script: [
          "M: Good evening, Rosie's Kitchen. How can I help you?",
          "W: Hello. I'd like to book a table for six people on Saturday evening, please.",
          "M: I'm afraid Saturday is very busy. We've only got a table at half past six or at nine. Or you could come on Sunday. It's much quieter.",
          "W: No, it has to be Saturday. It's my husband's birthday. Nine is too late for the children, so half past six, please.",
          'M: Fine. And can I have your name?',
          'W: Brown. Lisa Brown.',
        ].join('\n'),
        options: [
          "on Saturday at six o'clock",
          "on Saturday at nine o'clock",
          'on Sunday at half past six',
          'on Saturday at half past six',
        ],
        answer: 3,
        explanationCs:
          'Lisa chce sobotu kvůli manželovým narozeninám a devátá je pro děti pozdě: „so half past six, please“. Číslo šest se týká počtu osob.',
      },
      {
        question: 'How long will the tourists have at the cathedral?',
        script: [
          "W: Welcome aboard, everyone. My name's Kate and I'll be your guide today. On the left you can see the old town hall, which is now a museum. In about ten minutes we'll stop at the cathedral, where you'll have forty-five minutes to look around. Please be back on the bus by eleven o'clock. We'll have lunch at the harbour at one, and after that you'll have free time until four. Enjoy the trip!",
        ].join('\n'),
        options: ['45 minutes', '10 minutes', 'one hour', 'three hours'],
        answer: 0,
        explanationCs:
          "Průvodkyně říká: „you'll have forty-five minutes to look around“. Deset minut je cesta ke katedrále.",
      },
    ],
  },

  // ── ČTENÍ ───────────────────────────────────────────────────────
  part5: {
    items: [
      {
        kind: 'Notice',
        text: [
          'CITY LIBRARY – SUMMER OPENING HOURS',
          "In July and August the library will be open from 10 a.m. to 4 p.m., Monday to Friday, and closed on Saturdays. The computer room is closed for repairs until 15 August, but free Wi-Fi is still available in the reading room. Books borrowed in June do not have to be returned until 1 September. The children's reading club will continue to meet on Wednesday afternoons.",
        ].join('\n'),
        question: 'What can library users do in July?',
        options: [
          'use the computers in the computer room',
          'visit the library on Saturday mornings',
          'keep books borrowed in June until September',
          'join the reading club on Fridays',
        ],
        answer: 2,
        explanationCs:
          'Knihy půjčené v červnu „do not have to be returned until 1 September“. Počítačovna je do 15. srpna zavřená a v sobotu má knihovna zavřeno.',
      },
      {
        kind: 'Text message',
        text: "Hi Mia, I'm really sorry, but I can't meet you at the station at 3 as we planned. My bus has broken down and we're waiting for another one, so I'll be about 40 minutes late. Don't wait on the platform, it's freezing! Go to the café opposite the ticket office and order a hot chocolate for me too. I'll pay when I get there. Ben",
        question: 'What does Ben want Mia to do?',
        options: [
          'wait for him in a café',
          'get on a bus to meet him',
          'buy him a train ticket',
          'stay on the platform until he arrives',
        ],
        answer: 0,
        explanationCs:
          "Ben píše: „Go to the café opposite the ticket office“ a výslovně ji žádá, ať nečeká na nástupišti („Don't wait on the platform“).",
      },
      {
        kind: 'Advert',
        text: [
          'FOR SALE',
          "Girl's bike, blue, for ages 8–12. Only two years old and in very good condition – new tyres last month. The bell is missing, but both lights work perfectly. Comes with a helmet (size S). £60, or £50 without the helmet. Collection only – I'm afraid I can't deliver. Call Sandra after 6 p.m. on 07700 900482.",
        ].join('\n'),
        question: 'What is true about the bike?',
        options: [
          'It has never been used.',
          'Its lights need repairing.',
          'The seller can bring it to your house.',
          "It costs less if you don't take the helmet.",
        ],
        answer: 3,
        explanationCs:
          'Kolo stojí „£60, or £50 without the helmet“, takže bez helmy je levnější. Chybí jen zvonek, světla fungují a prodávající kolo nedoveze.',
      },
      {
        kind: 'School newsletter',
        text: [
          'SPRING CONCERT',
          "This year's spring concert will take place on Thursday 24 April at 7 p.m. in the school hall – not in the town theatre like last year. The school orchestra, the choir and the Year 9 rock band will all perform. Tickets are free, but there are only 200 seats, so please collect your tickets from the school office by Tuesday. Performers should arrive at 6 p.m.",
        ].join('\n'),
        question: 'What should people who want to watch the concert do?',
        options: [
          'buy tickets at the town theatre',
          'get their tickets before the day of the concert',
          'arrive at the school at 6 p.m.',
          'pay for their tickets at the door',
        ],
        answer: 1,
        explanationCs:
          'Vstupenky jsou zdarma, ale je třeba si je vyzvednout „from the school office by Tuesday“, tedy před čtvrtečním koncertem. V 18:00 mají přijít jen účinkující.',
      },
      {
        kind: 'Sign',
        text: [
          'WARNING – GREEN LAKE',
          'The ice on the lake is thin and dangerous. Walking, skating and playing on the ice are strictly forbidden. Please keep dogs on a lead near the water. If you want to go ice skating, use the free ice rink next to the park café (open daily 9 a.m.–8 p.m.). In an emergency, call 999 or ask the park staff in the blue hut by the main gate.',
        ].join('\n'),
        question: 'Where can visitors go ice skating?',
        options: ['next to the park café', 'on Green Lake', 'in the blue hut', 'by the main gate'],
        answer: 0,
        explanationCs:
          'Cedule radí: „use the free ice rink next to the park café“. Bruslení na jezeře je zakázáno a v modré boudě u brány je jen personál parku.',
      },
    ],
  },

  part6: {
    introCs:
      'Přečtěte si informační text o službách městské knihovny pro mladé lidi. Na základě textu rozhodněte, zda jsou tvrzení 30–39 pravdivá (P), nebo nepravdivá (N).',
    title: 'Youth Zone at Riverside City Library',
    text: [
      'Riverside City Library is not just a place to borrow books. Our Youth Zone on the first floor was created especially for young people aged 12 to 19, and it offers much more than you might think.',
      'Membership is free for everyone who lives or studies in Riverside. To join, bring a photo ID and something that shows your address, for example a letter from your school. If you are under 15, a parent must also sign the form. With your card you can borrow up to ten books and three DVDs at a time. You can also use our online library of e-books and audiobooks from home.',
      'The Youth Zone is open from 2 p.m. to 8 p.m. on weekdays and from 10 a.m. to 5 p.m. on Saturdays. On Sundays the whole library is closed. During the exam period in May and June, the Youth Zone opens at 9 a.m. every weekday.',
      'We have four quiet study rooms for groups of two to six people. Each room has a large screen and a whiteboard. You can book a room online or at the information desk for a maximum of three hours a day. Booking is free, but if you do not arrive within 15 minutes of the start of your booking, the room may be given to someone else.',
      'Every month we organise events for young people. There is a book club on the first Tuesday of the month, a film evening every Friday and free workshops on photography, creative writing and making videos. Places at the workshops are limited, so you have to sign up in advance on our website.',
      'We want the Youth Zone to be a friendly place for everyone. You may bring drinks in bottles with a lid, but food can only be eaten in the café on the ground floor. Please keep your phone on silent and make calls only in the corridor.',
      'Books can be borrowed for three weeks, and you can renew them twice if nobody else has reserved them. If you return a book late, you will pay 20p for each day. DVDs can be borrowed for one week, and the fine is 50p a day. Lost or damaged items must be paid for. If you have any problems, just talk to our staff – we are here to help!',
    ].join('\n\n'),
    statements: [
      {
        text: 'Only people who live in Riverside can become members.',
        answer: false,
        explanationCs: 'Členem může být každý, „who lives or studies in Riverside“ – stačí tam tedy i studovat.',
      },
      {
        text: "A 14-year-old needs a parent's signature to become a member.",
        answer: true,
        explanationCs: 'V textu stojí: „If you are under 15, a parent must also sign the form.“',
      },
      {
        text: 'Members can read e-books without going to the library.',
        answer: true,
        explanationCs: 'V textu stojí: „You can also use our online library of e-books and audiobooks from home.“',
      },
      {
        text: 'In May and June, the Youth Zone opens earlier on weekdays.',
        answer: true,
        explanationCs:
          'Běžně se ve všední dny otevírá ve 14:00, ale v květnu a červnu „the Youth Zone opens at 9 a.m. every weekday“.',
      },
      {
        text: 'Young people can use the Youth Zone on Sunday afternoons.',
        answer: false,
        explanationCs: 'V textu stojí: „On Sundays the whole library is closed.“',
      },
      {
        text: 'Students have to pay to use a study room.',
        answer: false,
        explanationCs: 'Rezervace studovny je zdarma: „Booking is free.“',
      },
      {
        text: 'A group that arrives 20 minutes late may lose its study room.',
        answer: true,
        explanationCs:
          'Pokud skupina nepřijde „within 15 minutes of the start of your booking, the room may be given to someone else“.',
      },
      {
        text: 'Anyone can come to a workshop without booking.',
        answer: false,
        explanationCs: 'Míst je málo, proto „you have to sign up in advance on our website“.',
      },
      {
        text: 'Young people are allowed to eat in the Youth Zone.',
        answer: false,
        explanationCs:
          'Pít se smí, ale „food can only be eaten in the café on the ground floor“ – Youth Zone je v prvním patře.',
      },
      {
        text: 'Returning a DVD late costs more per day than returning a book late.',
        answer: true,
        explanationCs: 'Pokuta za knihu je „20p for each day“, za DVD „50p a day“.',
      },
    ],
  },

  part7: {
    introCs:
      'Přečtěte si článek o mladé ženě, která ve své vesnici založila útulek pro zvířata. Na základě textu vyberte k úlohám 40–44 vždy jednu správnou odpověď (A–D).',
    title: 'The Girl Who Gave Up Numbers for Animals',
    text: [
      "When Hannah Price was a little girl, she wanted to be a vet. Instead, after university she got a job in a bank in Manchester. 'The money was good, but I spent all day looking at numbers on a screen,' she says. 'I felt something was missing.'",
      "Everything changed three years ago, on a cold winter evening. Hannah was visiting her parents in the small village of Little Ashby when she found a young dog tied to a tree near the road. He was hungry and shaking. The nearest animal shelter was fifty kilometres away and it was full, so Hannah took the dog home. She called him Biscuit. 'That night I couldn't sleep,' she remembers. 'I kept thinking about all the other animals that nobody helps.'",
      'A few months later, Hannah left her job and moved back to the village. Her grandfather had an old farm there that nobody had used for years, and he agreed to let her use it. The buildings were in a terrible state. The roof of the barn had holes in it and there was no heating. Hannah spent all her savings on repairs, but it was not enough. Then something surprising happened. When people in the village heard about her plan, they started to help. A local builder repaired the roof for free, teenagers from the school painted the walls, and the owner of the village shop collected food for the animals.',
      'Today, the Little Ashby Animal Shelter looks after about forty animals – mostly dogs and cats, but also rabbits, two goats and a very old horse called Duke. Hannah has two part-time employees and more than thirty volunteers, who walk the dogs, clean and play with the animals. The shelter is paid for by donations and by a small café that Hannah opened last spring, where visitors can have tea and cake while cats walk around them.',
      "Running the shelter is not easy. Hannah works seven days a week and has not had a holiday since she opened it. 'Sometimes I'm so tired that I fall asleep on the sofa in my clothes,' she laughs. 'But when an animal goes to a new family, I know it was worth it.' So far, more than 250 animals have found new homes.",
      "And Biscuit? He never left. He is now the shelter's unofficial manager and follows Hannah everywhere. 'He was the first,' Hannah says, 'and he started all this.'",
    ].join('\n\n'),
    questions: [
      {
        question: "What does the article say about Hannah's job at the bank?",
        options: [
          'It had been her dream since she was a child.',
          "It paid well, but she didn't feel happy.",
          'She did it for three years in Little Ashby.',
          'She worked with animals there.',
        ],
        answer: 1,
        explanationCs:
          "Hannah říká: „The money was good, but I spent all day looking at numbers… I felt something was missing.“ Jako dítě chtěla být veterinářkou, ne bankéřkou.",
      },
      {
        question: 'Why did Hannah take Biscuit home?',
        options: [
          'Her parents asked her to look after him.',
          'She had always wanted her own dog.',
          'His owner could not keep him any more.',
          'The nearest shelter had no space for him.',
        ],
        answer: 3,
        explanationCs:
          'V článku stojí: „The nearest animal shelter was fifty kilometres away and it was full, so Hannah took the dog home.“',
      },
      {
        question: 'How did people in Little Ashby help Hannah?',
        options: [
          'A local builder repaired the barn roof without charging her.',
          'They gave her money for the repairs.',
          'Teenagers from the school built new animal houses.',
          'The shop owner gave her food for her café.',
        ],
        answer: 0,
        explanationCs:
          'V článku stojí: „A local builder repaired the roof for free.“ Teenageři stěny jen natírali a majitel obchodu sbíral jídlo pro zvířata.',
      },
      {
        question: 'Where does the money for the shelter come from?',
        options: [
          "from Hannah's grandfather",
          'from the village shop',
          'from donations and a café',
          'from selling animals to new families',
        ],
        answer: 2,
        explanationCs: 'V článku stojí: „The shelter is paid for by donations and by a small café that Hannah opened last spring.“',
      },
      {
        question: 'What is true about Hannah now?',
        options: [
          'She goes on holiday once a year.',
          'She has very little free time.',
          'She employs more than thirty people.',
          'She is looking for a new home for Biscuit.',
        ],
        answer: 1,
        explanationCs:
          'Hannah „works seven days a week and has not had a holiday“. Zaměstnává jen dva lidi na částečný úvazek, dalších přes třicet pomáhá jako dobrovolníci, a Biscuit u ní zůstal („He never left“).',
      },
    ],
  },

  part8: {
    introCs:
      'Přečtěte si, co hledá pět lidí (45–49), a nabídky sedmi sportovních klubů (A–G). Ke každé osobě přiřaďte nabídku, která splňuje všechny její požadavky. Dvě nabídky nebudou použity.',
    people: [
      {
        name: 'Oliver',
        text: "I'm 16. I've done swimming and football for years, so now I'd like to try something completely new and exciting – not just a gym. I can only train on weekday evenings because I work in my uncle's shop at weekends. I can't buy my own equipment, and my parents will pay £20 a month at most.",
        answer: 3,
        explanationCs:
          'Lezecké centrum (D) má kurzy „on Tuesday and Thursday evenings“, vybavení je „included in the price“ a mladší 18 let platí „£18 a month“. Box (F) nevyhovuje, protože „you need to bring your own gloves“, a tenisový klub (G) stojí pro mladší 18 let 24 £ měsíčně.',
      },
      {
        name: 'Margaret',
        text: "I've just retired and my doctor says I should exercise, but my knees are bad, so something in the water would be best. I'd like to exercise with people of my own age. I often visit my grandchildren abroad, so I don't want to pay a monthly fee. I drive everywhere, so I need somewhere to park.",
        answer: 4,
        explanationCs:
          'Centrum Aqua Park (E) nabízí „aqua aerobics classes for the over-60s“, platí se „each time you come“ a má „large free car park“. Balance Studio (C) sice nabízí platbu za lekci, ale necvičí se ve vodě a nemá parkoviště.',
      },
      {
        name: 'Priya',
        text: "I've got a two-year-old son and I'm at home with him during the day. I'd love to do yoga or dance in the mornings, but only if someone can look after him while I exercise. I'd also feel more comfortable in a place just for women.",
        answer: 2,
        explanationCs:
          'Balance Studio (C) je „for women only“, nabízí jógu a tanec dopoledne a „our trained staff will look after your children“ zdarma.',
      },
      {
        name: 'Jake',
        text: "I'm a nurse and I work shifts, so sometimes I finish work at three in the morning. I need a gym that I can use at any time of the day or night, with plenty of machines and weights. I'd also like to get advice from a trainer now and then. I always come by car.",
        answer: 0,
        explanationCs:
          'City Fitness 24 (A) je otevřené „24 hours a day“, má „over 100 modern machines and a large free weights area“, trenéry a „free underground car park“. Aqua Park (E) zavírá ve 22:00.',
      },
      {
        name: 'Sophie',
        text: "I'm 15 and I want a sport I can do outdoors, ideally on or near water. I'm a good swimmer, but I'd like to try something new where I can be part of a team and make new friends. During the week I'm busy with school, so I can only do it at weekends.",
        answer: 1,
        explanationCs:
          'Veslařský klub (B) trénuje venku na řece „on Saturday and Sunday mornings“, vesluje se „in teams of four or eight“ a začátečníci jsou vítáni. Tenisové ligy (G) jsou sice o víkendu a v týmech, ale hraje se uvnitř („Six indoor courts“).',
      },
    ],
    offers: [
      {
        title: 'City Fitness 24',
        text: "Train whenever you want! Our gym is open 24 hours a day, seven days a week, so it's perfect for people with busy lives. Choose from over 100 modern machines and a large free weights area. Our personal trainers are always happy to give you tips, or you can book a full session for £25. Membership costs £29 a month. Free underground car park. Members must be 18 or over.",
      },
      {
        title: 'Riverside Rowing Club',
        text: 'Discover rowing on our beautiful river! We row in teams of four or eight, and beginners are always welcome – your first session is free. Training takes place outdoors on Saturday and Sunday mornings, and after training we often have a barbecue by the water. We provide all the boats and equipment. Open to anyone aged 14 or over who can swim 200 metres. Membership is £22 a month.',
      },
      {
        title: 'Balance Studio',
        text: 'A friendly studio for women only. We offer yoga, pilates and dance fitness classes for all levels. Morning classes run from 9 a.m. to 12 p.m. on weekdays, and while you exercise, our trained staff will look after your children (aged 1 to 5) in our playroom for free. Evening classes are also available. £25 a month or £6 per class. There is no car park, but the number 12 bus stops right outside.',
      },
      {
        title: 'The Wall Climbing Centre',
        text: "Fancy something different? Try indoor climbing on our 15-metre walls! We run beginners' courses on Tuesday and Thursday evenings from 6 to 8 p.m. for anyone aged 12 and over. You don't need any equipment – climbing shoes and harnesses are included in the price. Under-18s pay £18 a month, adults £30. After climbing, relax in our café with a view of the walls.",
      },
      {
        title: 'Aqua Park Leisure Centre',
        text: "Our leisure centre has a 25-metre indoor swimming pool, a small gym and a sauna, and it's open every day from 6 a.m. to 10 p.m. Every weekday morning there are aqua aerobics classes for the over-60s – gentle exercise in warm water. There's no membership fee: just pay £5 each time you come, or £3 if you're over 60. Large free car park and full wheelchair access.",
      },
      {
        title: 'Iron Fist Boxing Club',
        text: 'Get fit, strong and confident with boxing and kickboxing! Our experienced coaches train young people aged 13 and over on Monday, Wednesday and Friday evenings from 5 to 7 p.m. If you get really good, you can take part in competitions all over the country. It costs just £15 a month. Please note that you need to bring your own gloves and sports shoes.',
      },
      {
        title: 'Park Lane Tennis & Badminton Club',
        text: 'Six indoor courts, open every day from 7 a.m. to 11 p.m. We offer coaching for all levels, from complete beginners to advanced players, and our weekend team leagues are a great way to meet new people. Rackets can be hired at reception. Membership: adults £35 a month, under-18s £24 a month. Book your court online in seconds!',
      },
    ],
  },

  // ── JAZYKOVÁ KOMPETENCE ─────────────────────────────────────────
  part9: {
    introCs:
      'Přečtěte si text o historii olympijských her. Do každé mezery (50–59) vyberte jednu z nabízených možností (A–C) tak, aby text byl gramaticky i významově správný.',
    title: 'The Story of the Olympic Games',
    text: [
      'The Olympic Games are one of the {{1}} famous sporting events in the world, but their history goes back almost 3,000 years. The first recorded Games {{2}} in 776 BC in Olympia, in ancient Greece. They were held every four years in honour of Zeus, {{3}} was the king of the Greek gods. At first, there was only one event, a short running race, but later other sports such as wrestling and chariot racing were added. Only men could {{4}} part, and married women were not even allowed to watch.',
      'The ancient Games ended in AD 393, and for about 1,500 years there were no Olympics at all. Then a Frenchman called Pierre de Coubertin decided to bring {{5}} the Games as a modern international event. He believed that sport could help young people from different countries understand each other. {{6}} first modern Olympic Games were held in Athens {{7}} 1896, with around 240 athletes from 14 countries.',
      'Since then, the Games have become much {{8}} than Coubertin ever imagined. Women competed for the first time in 1900, and the first Winter Olympics followed in 1924. Today, more than 10,000 athletes compete in the Summer Games, and billions of people around the world watch them on TV. Hosting the Olympics is a great honour, but it is also very expensive. Some cities spent so much money on new stadiums that they {{9}} still paying for them many years {{10}}.',
    ].join('\n\n'),
    gaps: [
      {
        options: ['more', 'most', 'much'],
        answer: 1,
        explanationCs: 'Spojení „one of the + 3. stupeň“ vyžaduje superlativ: „one of the most famous“.',
      },
      {
        options: ['were organised', 'organised', 'have been organised'],
        answer: 0,
        explanationCs:
          'Hry někdo pořádal, proto trpný rod v minulém čase: „were organised in 776 BC“. Předpřítomný čas nelze použít s určitým údajem v minulosti.',
      },
      {
        options: ['whose', 'which', 'who'],
        answer: 2,
        explanationCs: 'Zeus je osoba, proto vztažné zájmeno „who“. „Which“ se užívá pro věci, „whose“ znamená „jehož“.',
      },
      {
        options: ['make', 'do', 'take'],
        answer: 2,
        explanationCs: 'Ustálené spojení „take part“ znamená „zúčastnit se“.',
      },
      {
        options: ['back', 'up', 'out'],
        answer: 0,
        explanationCs:
          'Frázové sloveso „bring back“ znamená „obnovit, vrátit zpět“. „Bring up“ znamená „vychovat“ nebo „zmínit“, „bring out“ „vydat“.',
      },
      {
        options: ['A', 'The', 'An'],
        answer: 1,
        explanationCs: 'Před řadovou číslovkou „first“ stojí určitý člen: „The first modern Olympic Games“.',
      },
      {
        options: ['in', 'at', 'on'],
        answer: 0,
        explanationCs: 'S letopočtem se používá předložka „in“: „in 1896“.',
      },
      {
        options: ['more big', 'biggest', 'bigger'],
        answer: 2,
        explanationCs: 'Po „much“ a před „than“ následuje 2. stupeň: „much bigger than“. Tvar „more big“ je chybný.',
      },
      {
        options: ['had', 'were', 'did'],
        answer: 1,
        explanationCs: 'Průběhový čas minulý se tvoří „were + -ing“: „they were still paying“.',
      },
      {
        options: ['later', 'ago', 'before'],
        answer: 0,
        explanationCs:
          '„Many years later“ znamená „o mnoho let později“ – města splácela stadiony ještě dlouho po hrách. „Ago“ ani „before“ sem významově nesedí.',
      },
    ],
  },

  part10: {
    introCs:
      'Přečtěte si blogový příspěvek o první letní brigádě. Do každé mezery (60–64) doplňte vždy jedno slovo tak, aby text dával smysl a byl gramaticky správný. Mezera 0 je příklad.',
    title: 'My First Summer Job',
    text: "Last summer I got my first job {{0}} a waitress in a small café by the sea. Before that summer, I {{1}} never had a real job, so I was really nervous. On my first day I dropped a tray with six cups of coffee! Luckily, Mrs Green, {{2}} owner of the café, just laughed and told me not to worry. I soon learned to carry three plates at once and to remember orders without writing them down. The work was hard – I was on my feet {{3}} morning till night – but I met lots of friendly people. Some tourists were so happy with my service that {{4}} left me really good tips. On my last day, the staff gave me a card that {{5}} signed by all our regular customers. And the best news? Mrs Green has already offered me the job again next summer!",
    example: 'as',
    gaps: [
      {
        accept: ['had'],
        explanationCs:
          'Děj proběhl před jiným dějem v minulosti („Before that summer“), proto předminulý čas: „I had never had a real job“.',
      },
      {
        accept: ['the'],
        explanationCs: 'Paní Green je jediná majitelka kavárny, proto určitý člen: „the owner of the café“.',
      },
      {
        accept: ['from'],
        explanationCs: 'Ustálené spojení „from morning till night“ znamená „od rána do večera“.',
      },
      {
        accept: ['they'],
        explanationCs: 'Podmětem vedlejší věty jsou turisté („some tourists“), proto osobní zájmeno „they“.',
      },
      {
        accept: ['was'],
        explanationCs:
          'Přání podepsali zákazníci – trpný rod v minulém čase: „a card that was signed by all our regular customers“.',
      },
    ],
  },
};
