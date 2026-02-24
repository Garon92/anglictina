import type { ReadingText } from '../types';

export const READING_TEXTS_EXTRA2: ReadingText[] = [
  // ─── 1. My School Morning (A1) ──────────────────────────────────────
  {
    id: 'read_extra2_01',
    title: 'My School Morning',
    level: 'A1',
    topic: 'daily',
    text:
      'I get up at half past six every day. I wash my face and get dressed. ' +
      'I always wear my favourite jeans and a T-shirt. For breakfast, I have cereal with milk. ' +
      'My mum drives me to school because the bus stop is far from our house. ' +
      'I arrive at school at quarter to eight. My first lesson is usually maths or Czech. ' +
      'I sit next to my best friend Jakub. We always talk before the teacher comes in.',
    questions: [
      {
        id: 'read_extra2_01_q1',
        type: 'mcq',
        question: 'What time does the narrator get up?',
        options: ['At six o\'clock', 'At half past six', 'At seven o\'clock', 'At quarter to seven'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_01_q2',
        type: 'truefalse',
        question: 'The narrator goes to school by bus.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_01_q3',
        type: 'mcq',
        question: 'What does the narrator eat for breakfast?',
        options: ['Toast and jam', 'Cereal with milk', 'Bread with butter', 'Pancakes'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_01_q4',
        type: 'tfns',
        question: 'Jakub is in a different class.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 2. Lunch at the School Canteen (A1) ─────────────────────────────
  {
    id: 'read_extra2_02',
    title: 'Lunch at the School Canteen',
    level: 'A1',
    topic: 'food',
    text:
      'Every day I eat lunch at school. The school canteen is on the first floor. ' +
      'We can choose from two meals. Today there is chicken with rice or fish with potatoes. ' +
      'I choose chicken because I don\'t like fish. My friend Anna has the fish. ' +
      'After lunch, we have fruit or yoghurt. I always take an apple. ' +
      'The lunch costs thirty crowns. I think the food is quite good.',
    questions: [
      {
        id: 'read_extra2_02_q1',
        type: 'mcq',
        question: 'Where is the school canteen?',
        options: ['On the ground floor', 'On the first floor', 'On the second floor', 'In another building'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_02_q2',
        type: 'truefalse',
        question: 'The narrator chooses the fish.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_02_q3',
        type: 'mcq',
        question: 'What fruit does the narrator take?',
        options: ['A banana', 'An orange', 'An apple', 'A pear'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_02_q4',
        type: 'tfns',
        question: 'Anna enjoys the fish.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 3. My Favourite Sport (A1) ──────────────────────────────────────
  {
    id: 'read_extra2_03',
    title: 'My Favourite Sport',
    level: 'A1',
    topic: 'sports',
    text:
      'My name is Marek and I love football. I play football three times a week. ' +
      'On Monday and Wednesday, I train with my team after school. On Saturday, we have a match. ' +
      'My position is goalkeeper. I like it because I am tall and fast. ' +
      'My coach is Mr Novák. He is very nice but also strict. ' +
      'Last week, we won our match two to one. I was very happy. My dream is to play for Sparta Praha one day.',
    questions: [
      {
        id: 'read_extra2_03_q1',
        type: 'mcq',
        question: 'How often does Marek play football?',
        options: ['Once a week', 'Twice a week', 'Three times a week', 'Every day'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_03_q2',
        type: 'truefalse',
        question: 'Marek plays as a striker.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_03_q3',
        type: 'tfns',
        question: 'Mr Novák has been coaching the team for five years.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_03_q4',
        type: 'mcq',
        question: 'What was the score of last week\'s match?',
        options: ['One to nil', 'Two to one', 'Three to two', 'Two to nil'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 4. The Weather Today (A1) ───────────────────────────────────────
  {
    id: 'read_extra2_04',
    title: 'The Weather Today',
    level: 'A1',
    topic: 'weather',
    text:
      'Today is Monday and the weather is bad. It is raining and the sky is grey. ' +
      'The temperature is only eight degrees. I need my jacket and an umbrella. ' +
      'Yesterday was much better. It was sunny and warm. We played outside after school. ' +
      'The weather forecast says tomorrow will be cloudy but dry. ' +
      'I hope the weekend will be nice because I want to go cycling with my friends.',
    questions: [
      {
        id: 'read_extra2_04_q1',
        type: 'mcq',
        question: 'What is the weather like today?',
        options: ['Sunny and warm', 'Rainy and grey', 'Snowy and cold', 'Cloudy but dry'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_04_q2',
        type: 'truefalse',
        question: 'The temperature today is eight degrees.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra2_04_q3',
        type: 'mcq',
        question: 'What does the narrator want to do at the weekend?',
        options: ['Play football', 'Go swimming', 'Go cycling', 'Stay at home'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_04_q4',
        type: 'tfns',
        question: 'The narrator went cycling yesterday.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 5. My Phone (A1) ───────────────────────────────────────────────
  {
    id: 'read_extra2_05',
    title: 'My Phone',
    level: 'A1',
    topic: 'media',
    text:
      'I got a new phone for my birthday. It is a Samsung and the colour is black. ' +
      'I use my phone every day. I send messages to my friends and take photos. ' +
      'I also listen to music on my phone. My favourite app is YouTube. ' +
      'I watch funny videos after school. My parents say I use my phone too much. ' +
      'At school, we must keep our phones in our bags. I think that is a good rule.',
    questions: [
      {
        id: 'read_extra2_05_q1',
        type: 'mcq',
        question: 'When did the narrator get the phone?',
        options: ['At Christmas', 'For a birthday', 'As a school prize', 'For no reason'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_05_q2',
        type: 'truefalse',
        question: 'The narrator\'s favourite app is Instagram.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_05_q3',
        type: 'tfns',
        question: 'The phone was expensive.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_05_q4',
        type: 'truefalse',
        question: 'Students must keep their phones in their bags at school.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
    ],
  },

  // ─── 6. Social Media and Me (A2) ────────────────────────────────────
  {
    id: 'read_extra2_06',
    title: 'Social Media and Me',
    level: 'A2',
    topic: 'media',
    text:
      'My name is Tereza and I am fifteen years old. I use social media every day, mostly Instagram and TikTok. ' +
      'I follow accounts about fashion, travel, and funny animals. Sometimes I post my own photos too. ' +
      'My parents are worried that I spend too much time online. They made a rule that I cannot use my phone after nine in the evening. ' +
      'I think they are right because when I used my phone late at night, I could not fall asleep easily. ' +
      'At school, we had a lesson about internet safety. Our teacher told us never to share personal information with strangers. ' +
      'I learned that not everything on the internet is true. Now I am more careful about what I read and share online.',
    questions: [
      {
        id: 'read_extra2_06_q1',
        type: 'mcq',
        question: 'Which social media does Tereza use the most?',
        options: ['Facebook and Twitter', 'Instagram and TikTok', 'YouTube and Snapchat', 'WhatsApp and Telegram'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_06_q2',
        type: 'truefalse',
        question: 'Tereza can use her phone whenever she wants.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_06_q3',
        type: 'tfns',
        question: 'Tereza has more than 500 followers on Instagram.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_06_q4',
        type: 'mcq',
        question: 'What did the teacher tell them about internet safety?',
        options: [
          'To delete all social media',
          'To never share personal information with strangers',
          'To only use the internet for homework',
          'To ask parents before going online',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── 7. Our School Trip to Prague (A2) ──────────────────────────────
  {
    id: 'read_extra2_07',
    title: 'Our School Trip to Prague',
    level: 'A2',
    topic: 'travel',
    text:
      'Last month, our class went on a school trip to Prague. We travelled by train from Olomouc. ' +
      'The journey took about two hours. When we arrived, we walked across Charles Bridge and took many photos. ' +
      'Then we visited Prague Castle. Our guide told us about the history of the castle. It was interesting but also very long. ' +
      'For lunch, we ate at a restaurant near the Old Town Square. I had a hamburger and chips. ' +
      'In the afternoon, we went to the National Technical Museum. I liked the old cars and aeroplanes the best. ' +
      'We came back to Olomouc in the evening. I was tired but happy. It was one of the best school trips ever.',
    questions: [
      {
        id: 'read_extra2_07_q1',
        type: 'mcq',
        question: 'How did the class travel to Prague?',
        options: ['By bus', 'By train', 'By car', 'By plane'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_07_q2',
        type: 'truefalse',
        question: 'The journey from Olomouc to Prague took about three hours.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_07_q3',
        type: 'mcq',
        question: 'What did the narrator like the most at the museum?',
        options: ['Old trains', 'Old cars and aeroplanes', 'Computers', 'Space rockets'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_07_q4',
        type: 'tfns',
        question: 'The narrator bought a souvenir in Prague.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 8. Learning English Online (A2) ────────────────────────────────
  {
    id: 'read_extra2_08',
    title: 'Learning English Online',
    level: 'A2',
    topic: 'education',
    text:
      'My name is David and I want to improve my English. Besides school lessons, I use several apps and websites to practise. ' +
      'Every morning, I spend ten minutes on a vocabulary app. It shows me English words and I have to remember the Czech translation. ' +
      'I also watch English videos on YouTube with subtitles. This helps me understand spoken English better. ' +
      'On weekends, I read short articles in English about topics I like, such as gaming and technology. ' +
      'My English teacher says that reading is very important for learning new words. ' +
      'Since I started practising online, my marks at school have improved. I got an A on my last English test.',
    questions: [
      {
        id: 'read_extra2_08_q1',
        type: 'mcq',
        question: 'How long does David spend on the vocabulary app each morning?',
        options: ['Five minutes', 'Ten minutes', 'Fifteen minutes', 'Twenty minutes'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_08_q2',
        type: 'truefalse',
        question: 'David watches English videos without subtitles.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_08_q3',
        type: 'tfns',
        question: 'David\'s favourite vocabulary app is Duolingo.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_08_q4',
        type: 'mcq',
        question: 'What grade did David get on his last English test?',
        options: ['A B', 'A C', 'An A', 'A D'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 9. Christmas Markets in Brno (A2) ──────────────────────────────
  {
    id: 'read_extra2_09',
    title: 'Christmas Markets in Brno',
    level: 'A2',
    topic: 'culture',
    text:
      'Every December, there are beautiful Christmas markets in Brno. The biggest market is on Náměstí Svobody. ' +
      'There are wooden stalls that sell handmade decorations, candles, and traditional Czech sweets. ' +
      'You can also buy hot drinks like mulled wine and hot chocolate. My favourite thing is trdelník, a sweet pastry cooked over a fire. ' +
      'In the evening, the square is full of lights and there is a big Christmas tree in the middle. ' +
      'Last year, I went to the market with my friends. We listened to a choir singing Christmas carols. ' +
      'The atmosphere was magical. Many tourists visit the markets too, so it can be very crowded at weekends.',
    questions: [
      {
        id: 'read_extra2_09_q1',
        type: 'mcq',
        question: 'Where is the biggest Christmas market in Brno?',
        options: ['Zelný trh', 'Náměstí Svobody', 'Moravské náměstí', 'Šilingrovo náměstí'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_09_q2',
        type: 'truefalse',
        question: 'Trdelník is a type of hot drink.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_09_q3',
        type: 'mcq',
        question: 'What did the narrator listen to at the market last year?',
        options: ['A rock band', 'A choir singing Christmas carols', 'A jazz concert', 'A DJ playing music'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_09_q4',
        type: 'tfns',
        question: 'The narrator bought a present for someone at the market.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 10. Cooking with My Grandmother (A2) ───────────────────────────
  {
    id: 'read_extra2_10',
    title: 'Cooking with My Grandmother',
    level: 'A2',
    topic: 'food',
    text:
      'Every Sunday, I visit my grandmother and we cook together. She lives in a small town near Ostrava. ' +
      'Last Sunday, we made svíčková, which is a traditional Czech dish. It is beef with a creamy vegetable sauce and dumplings. ' +
      'First, we prepared the vegetables: carrots, celery, and onions. Then we cooked the meat slowly for two hours. ' +
      'While we waited, my grandmother told me stories about her childhood. ' +
      'When the svíčková was ready, the whole house smelled amazing. We ate together with my grandfather. ' +
      'He said it was the best meal of the week. I want to learn all my grandmother\'s recipes before I go to university.',
    questions: [
      {
        id: 'read_extra2_10_q1',
        type: 'mcq',
        question: 'Where does the narrator\'s grandmother live?',
        options: ['In Brno', 'In Prague', 'Near Ostrava', 'In Olomouc'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_10_q2',
        type: 'truefalse',
        question: 'Svíčková is a type of soup.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_10_q3',
        type: 'tfns',
        question: 'The narrator\'s grandmother has written a cookbook.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_10_q4',
        type: 'mcq',
        question: 'How long did the meat cook?',
        options: ['One hour', 'Ninety minutes', 'Two hours', 'Three hours'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 11. Staying Healthy at School (A2) ─────────────────────────────
  {
    id: 'read_extra2_11',
    title: 'Staying Healthy at School',
    level: 'A2',
    topic: 'health',
    text:
      'Our school started a new programme called "Healthy Week" last month. Every day, we had different activities about health. ' +
      'On Monday, a doctor came to school and talked about the importance of sleep. She said teenagers need eight to ten hours of sleep every night. ' +
      'On Tuesday, we had a healthy cooking workshop. We made fruit salads and smoothies. ' +
      'Wednesday was a sports day. We could try yoga, basketball, and even rock climbing. ' +
      'On Thursday, the school nurse explained how to wash our hands properly and why it is important. ' +
      'On Friday, we wrote essays about what we learned during the week. I wrote about sleep because I often stay up too late playing games.',
    questions: [
      {
        id: 'read_extra2_11_q1',
        type: 'mcq',
        question: 'What was Monday\'s activity about?',
        options: ['Healthy food', 'The importance of sleep', 'Sports', 'Washing hands'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_11_q2',
        type: 'truefalse',
        question: 'On Wednesday, students could try rock climbing.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra2_11_q3',
        type: 'mcq',
        question: 'What did the narrator write about on Friday?',
        options: ['Healthy food', 'Exercise', 'Sleep', 'Washing hands'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_11_q4',
        type: 'tfns',
        question: 'The programme will happen again next year.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 12. A Walk in the Šumava Forest (A2) ──────────────────────────
  {
    id: 'read_extra2_12',
    title: 'A Walk in the Šumava Forest',
    level: 'A2',
    topic: 'nature',
    text:
      'Last autumn, my family went on a trip to the Šumava mountains in South Bohemia. We stayed in a small cottage near Železná Ruda. ' +
      'On Saturday morning, we went for a long walk through the forest. The trees were red, orange, and yellow. It was very beautiful. ' +
      'We walked along a path next to a small river. My dad showed me different types of trees and mushrooms. ' +
      'We saw a deer in the distance. I tried to take a photo, but it ran away too quickly. ' +
      'After the walk, we stopped at a restaurant and had hot soup. It was the perfect way to warm up. ' +
      'I love spending time in nature. It is so different from the city where I live.',
    questions: [
      {
        id: 'read_extra2_12_q1',
        type: 'mcq',
        question: 'Where did the family stay?',
        options: ['In a hotel', 'In a cottage near Železná Ruda', 'In a campsite', 'At a friend\'s house'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_12_q2',
        type: 'truefalse',
        question: 'The narrator took a photo of the deer.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_12_q3',
        type: 'mcq',
        question: 'What season did the family visit Šumava?',
        options: ['Spring', 'Summer', 'Autumn', 'Winter'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_12_q4',
        type: 'tfns',
        question: 'The narrator picked mushrooms during the walk.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 13. The School Football Tournament (A2) ───────────────────────
  {
    id: 'read_extra2_13',
    title: 'The School Football Tournament',
    level: 'A2',
    topic: 'sports',
    text:
      'Every spring, our school organises a football tournament for all classes. This year, there were twelve teams. ' +
      'Our class team practised every lunchtime for two weeks before the tournament. ' +
      'On the day of the tournament, the weather was perfect — sunny and warm. Each match lasted twenty minutes. ' +
      'We won our first two matches easily, but the semi-final was very difficult. ' +
      'The other team scored first, and we were losing one to nil at half time. Then our captain, Filip, scored two goals in the second half. ' +
      'We won two to one and went to the final. Unfortunately, we lost the final three to two. ' +
      'We were disappointed, but second place is still a great result. Our teacher gave everyone on the team a certificate.',
    questions: [
      {
        id: 'read_extra2_13_q1',
        type: 'mcq',
        question: 'How many teams were in the tournament?',
        options: ['Eight', 'Ten', 'Twelve', 'Sixteen'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_13_q2',
        type: 'truefalse',
        question: 'The narrator\'s team won the final.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_13_q3',
        type: 'mcq',
        question: 'Who scored two goals in the semi-final?',
        options: ['The narrator', 'The goalkeeper', 'Filip', 'The coach'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_13_q4',
        type: 'tfns',
        question: 'The team will get new football shirts next year.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 14. Online Shopping: Is It Always a Good Deal? (B1) ────────────
  {
    id: 'read_extra2_14',
    title: 'Online Shopping: Is It Always a Good Deal?',
    level: 'B1',
    topic: 'media',
    text:
      'Online shopping has become incredibly popular among Czech teenagers in recent years. According to a recent survey, over seventy percent of young people aged thirteen to eighteen have bought something online in the past six months. ' +
      'The advantages are obvious: you can compare prices from different shops, read customer reviews, and have products delivered straight to your door. Many online shops also offer discounts that you cannot find in regular stores. ' +
      'However, there are also some disadvantages. When you buy clothes online, you cannot try them on, and the size or colour might be different from what you expected. ' +
      'Returning products can be complicated and time-consuming. There is also the risk of scams, especially on unknown websites. ' +
      'Experts recommend that teenagers should always check whether a website is trustworthy before making a purchase. It is also wise to use a prepaid card rather than a regular bank card for extra security. ' +
      'Online shopping can be a great convenience, but only if you shop carefully and responsibly.',
    questions: [
      {
        id: 'read_extra2_14_q1',
        type: 'mcq',
        question: 'According to the survey, what percentage of young people have shopped online recently?',
        options: ['About fifty percent', 'Over sixty percent', 'Over seventy percent', 'Nearly ninety percent'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_14_q2',
        type: 'tfns',
        question: 'Most Czech teenagers prefer shopping online to shopping in stores.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_14_q3',
        type: 'truefalse',
        question: 'Experts suggest using a prepaid card for online purchases.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra2_14_q4',
        type: 'mcq',
        question: 'Which of these is mentioned as a disadvantage of online shopping?',
        options: [
          'Products are always more expensive',
          'You cannot read reviews',
          'Clothes might not fit properly',
          'Delivery is always slow',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── 15. Music Festivals in the Czech Republic (B1) ─────────────────
  {
    id: 'read_extra2_15',
    title: 'Music Festivals in the Czech Republic',
    level: 'B1',
    topic: 'culture',
    text:
      'The Czech Republic has a vibrant music festival scene that attracts thousands of young people every summer. One of the most popular events is Colours of Ostrava, which takes place in the former industrial area of Dolní Vítkovice. ' +
      'The festival features artists from around the world and offers not only music but also theatre, film screenings, and workshops. ' +
      'Another well-known festival is Rock for People, held in Hradec Králové. It focuses mainly on rock and alternative music and has been running for over twenty-five years. ' +
      'For teenagers, attending a music festival is often their first experience of independence. They camp with friends, manage their own money, and make decisions without their parents. ' +
      'Of course, festivals also have challenges. The weather can be unpredictable, and living in a tent for several days is not always comfortable. ' +
      'Nevertheless, most young people say that the atmosphere, the sense of community, and the live music make it an unforgettable experience that they look forward to every year.',
    questions: [
      {
        id: 'read_extra2_15_q1',
        type: 'mcq',
        question: 'Where does Colours of Ostrava take place?',
        options: ['In a city park', 'In a concert hall', 'In a former industrial area', 'On a football field'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_15_q2',
        type: 'truefalse',
        question: 'Rock for People has been running for over twenty-five years.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra2_15_q3',
        type: 'tfns',
        question: 'Tickets to Colours of Ostrava cost less than tickets to Rock for People.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_15_q4',
        type: 'mcq',
        question: 'Why is attending a festival described as a first experience of independence for teenagers?',
        options: [
          'Because they travel abroad alone',
          'Because they camp with friends and manage their own money',
          'Because they perform on stage',
          'Because they organise the events themselves',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── 16. Travelling Abroad for the First Time (B1) ──────────────────
  {
    id: 'read_extra2_16',
    title: 'Travelling Abroad for the First Time',
    level: 'B1',
    topic: 'travel',
    text:
      'When I was sixteen, I travelled abroad without my parents for the first time. My friend Ondra and I went to Vienna by bus. The journey took about four hours from Brno. ' +
      'We had planned our trip carefully. We booked a cheap hostel near the city centre and made a list of places we wanted to see. ' +
      'Vienna is a stunning city with beautiful architecture and impressive museums. We visited the Schönbrunn Palace, walked through the historic centre, and ate Wiener Schnitzel at a traditional restaurant. ' +
      'The most challenging part was communicating in English. Although many Austrians speak excellent English, ordering food and asking for directions still made us nervous. ' +
      'On the second day, we got lost trying to find the Natural History Museum. A friendly local helped us and even walked part of the way with us. ' +
      'The trip taught me that travelling independently builds confidence and problem-solving skills. I came home feeling more mature and already started planning my next trip.',
    questions: [
      {
        id: 'read_extra2_16_q1',
        type: 'mcq',
        question: 'How did the narrator and Ondra travel to Vienna?',
        options: ['By train', 'By bus', 'By plane', 'By car'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_16_q2',
        type: 'truefalse',
        question: 'The narrator found communicating in English easy and natural.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_16_q3',
        type: 'tfns',
        question: 'The hostel was expensive.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_16_q4',
        type: 'mcq',
        question: 'What happened on the second day?',
        options: [
          'They missed their bus home',
          'They met a famous person',
          'They got lost looking for a museum',
          'They ran out of money',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── 17. Balancing School and a Part-Time Job (B1) ──────────────────
  {
    id: 'read_extra2_17',
    title: 'Balancing School and a Part-Time Job',
    level: 'B1',
    topic: 'education',
    text:
      'Many Czech teenagers start looking for part-time jobs when they are about sixteen. The most common jobs include working in cafés, shops, or tutoring younger students. ' +
      'Earning your own money gives you a sense of independence and teaches you the value of hard work. However, balancing a job with school can be quite challenging. ' +
      'My classmate Petra works as a waitress in a café every Saturday and Sunday. She earns enough to pay for her hobbies and save a little each month. ' +
      'On the other hand, she admits that she sometimes feels tired on Monday mornings and has less time for homework and friends. ' +
      'School counsellors advise that students should not work more than ten hours a week during the school year. Working too many hours can lead to stress, poor grades, and even health problems. ' +
      'The key is to find the right balance. A part-time job can be a valuable experience, but education should always remain the top priority for teenagers.',
    questions: [
      {
        id: 'read_extra2_17_q1',
        type: 'mcq',
        question: 'When do many Czech teenagers start looking for part-time jobs?',
        options: ['At fourteen', 'At fifteen', 'At sixteen', 'At eighteen'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_17_q2',
        type: 'truefalse',
        question: 'Petra works at the café only on Saturdays.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_17_q3',
        type: 'tfns',
        question: 'Petra plans to quit her job before the school exams.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_17_q4',
        type: 'mcq',
        question: 'How many hours per week do school counsellors recommend as a maximum?',
        options: ['Five hours', 'Eight hours', 'Ten hours', 'Fifteen hours'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 18. Climate Change and Our Future (B1) ─────────────────────────
  {
    id: 'read_extra2_18',
    title: 'Climate Change and Our Future',
    level: 'B1',
    topic: 'weather',
    text:
      'Climate change is one of the most serious issues facing our generation. In the Czech Republic, the effects are already visible. Summers are becoming hotter and drier, and extreme weather events like floods and heatwaves are more frequent than they were twenty years ago. ' +
      'Scientists explain that burning fossil fuels such as coal and oil releases greenhouse gases into the atmosphere. These gases trap heat and cause the planet to warm up. ' +
      'Many Czech schools have started to include environmental education in their curriculum. Students learn about recycling, energy saving, and sustainable living. ' +
      'Some teenagers have taken action themselves. There are student groups that organise tree-planting events and clean-up days in local parks and rivers. ' +
      'Experts say that individual actions, like using public transport instead of cars, reducing plastic waste, and saving water, can make a real difference when millions of people do them together. ' +
      'The future depends on the choices we make today, and young people have a crucial role to play.',
    questions: [
      {
        id: 'read_extra2_18_q1',
        type: 'mcq',
        question: 'What weather changes are mentioned as visible in the Czech Republic?',
        options: [
          'Colder winters and more snow',
          'Hotter and drier summers',
          'More rain throughout the year',
          'Shorter autumn seasons',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_18_q2',
        type: 'truefalse',
        question: 'Greenhouse gases trap heat in the atmosphere.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra2_18_q3',
        type: 'tfns',
        question: 'The Czech government has banned the use of coal completely.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_18_q4',
        type: 'mcq',
        question: 'What do student groups organise to help the environment?',
        options: [
          'Protests outside government buildings',
          'Tree-planting events and clean-up days',
          'Online petitions only',
          'Fundraising concerts',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── 19. Mental Health and Teenagers (B1) ───────────────────────────
  {
    id: 'read_extra2_19',
    title: 'Mental Health and Teenagers',
    level: 'B1',
    topic: 'health',
    text:
      'Mental health is just as important as physical health, yet many teenagers feel uncomfortable talking about it. A recent study showed that nearly one in four Czech secondary school students has experienced symptoms of anxiety or depression. ' +
      'The most common causes of stress among teenagers include school pressure, social media comparisons, and conflicts with friends or family. The transition from základní škola to střední škola can also be a particularly stressful period. ' +
      'Psychologists recommend several strategies for maintaining good mental health. Regular physical activity, such as walking, cycling, or team sports, can significantly reduce stress. ' +
      'It is also important to have hobbies that allow you to relax and express yourself, whether that is drawing, playing music, or writing. ' +
      'Most importantly, teenagers should not be afraid to ask for help. Every school in the Czech Republic has a school psychologist or counsellor who students can talk to confidentially. ' +
      'Talking to a trusted adult — a parent, a teacher, or a coach — is often the first step towards feeling better.',
    questions: [
      {
        id: 'read_extra2_19_q1',
        type: 'mcq',
        question: 'According to the study, how many Czech secondary school students have experienced anxiety or depression?',
        options: ['One in ten', 'One in six', 'Nearly one in four', 'Nearly one in two'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_19_q2',
        type: 'truefalse',
        question: 'Regular physical activity can help reduce stress.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra2_19_q3',
        type: 'tfns',
        question: 'Czech schools are required by law to have a school psychologist.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_19_q4',
        type: 'mcq',
        question: 'Which of these is NOT mentioned as a cause of stress for teenagers?',
        options: [
          'School pressure',
          'Social media comparisons',
          'Financial problems',
          'Conflicts with friends or family',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── 20. Protecting Wildlife in Central Europe (B1) ─────────────────
  {
    id: 'read_extra2_20',
    title: 'Protecting Wildlife in Central Europe',
    level: 'B1',
    topic: 'nature',
    text:
      'Central Europe is home to a wide variety of wildlife, but many species are under threat due to habitat loss, pollution, and climate change. In the Czech Republic, animals such as the European lynx, the grey wolf, and the European otter are considered endangered or vulnerable. ' +
      'Conservation organisations work to protect these animals and their habitats. For example, the Šumava National Park has a successful programme to monitor and protect the lynx population. Thanks to camera traps and tracking technology, researchers can count individual lynx and study their behaviour. ' +
      'Wolves have recently returned to parts of the Czech Republic after being absent for over a century. While some farmers are concerned about the safety of their livestock, environmentalists argue that wolves play a vital role in maintaining the balance of ecosystems. ' +
      'Young people can contribute to wildlife conservation in many ways. Volunteering at a nature reserve, reducing waste, and learning about local species are all meaningful actions. ' +
      'Understanding and respecting the natural world is essential if we want future generations to enjoy the same biodiversity that we have today.',
    questions: [
      {
        id: 'read_extra2_20_q1',
        type: 'mcq',
        question: 'Which animal has recently returned to the Czech Republic?',
        options: ['The European lynx', 'The brown bear', 'The grey wolf', 'The golden eagle'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_20_q2',
        type: 'truefalse',
        question: 'Farmers are fully supportive of wolves returning to the countryside.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra2_20_q3',
        type: 'tfns',
        question: 'The Šumava lynx programme has been running for more than ten years.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra2_20_q4',
        type: 'mcq',
        question: 'What technology is used to monitor lynx in Šumava?',
        options: [
          'Satellite images only',
          'Drones with thermal cameras',
          'Camera traps and tracking technology',
          'Radio collars only',
        ],
        answerIndex: 2,
      },
    ],
  },
];
