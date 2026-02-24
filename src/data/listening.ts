import type { ListeningExercise } from '../types';

export const LISTENING_EXERCISES: ListeningExercise[] = [
  // ─── A1 DICTATION (listen_01–listen_04) ────────────────────────────
  {
    id: 'listen_01',
    type: 'dictation',
    level: 'A1',
    topic: 'daily',
    script: 'I wake up at seven every morning.',
    questions: [
      {
        id: 'listen_01_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'I wake up at seven every morning.',
          'I woke up at seven every morning.',
          'I wake up at eleven every morning.',
          'I wake up at seven every evening.',
        ],
        answerIndex: 0,
      },
    ],
  },
  {
    id: 'listen_02',
    type: 'dictation',
    level: 'A1',
    topic: 'family',
    script: 'My sister has two small children.',
    questions: [
      {
        id: 'listen_02_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'My brother has two small children.',
          'My sister has two small cats.',
          'My sister has two small children.',
          'My sister has three small children.',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_03',
    type: 'dictation',
    level: 'A1',
    topic: 'food',
    script: 'I would like a cup of tea, please.',
    questions: [
      {
        id: 'listen_03_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'I would like a cup of coffee, please.',
          'I would like a cup of tea, please.',
          'I would like a glass of tea, please.',
          'I would like a pot of tea, please.',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_04',
    type: 'dictation',
    level: 'A1',
    topic: 'shopping',
    script: 'How much does this bag cost?',
    questions: [
      {
        id: 'listen_04_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'How much does this book cost?',
          'How much did this bag cost?',
          'How much does this bag cost?',
          'How many bags do you have?',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── A1 COMPREHENSION (listen_05–listen_07) ────────────────────────
  {
    id: 'listen_05',
    type: 'comprehension',
    level: 'A1',
    topic: 'travel',
    script:
      'I am at the train station. I want to go to Prague. The next train leaves at ten. I need to buy a ticket.',
    questions: [
      {
        id: 'listen_05_q1',
        type: 'mcq',
        question: 'Where is the speaker?',
        options: ['At the airport', 'At the bus stop', 'At the train station', 'At home'],
        answerIndex: 2,
      },
      {
        id: 'listen_05_q2',
        type: 'truefalse',
        question: 'The speaker wants to go to Brno.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_06',
    type: 'comprehension',
    level: 'A1',
    topic: 'weather',
    script:
      'Today is sunny. It is warm outside. I don\'t need a jacket. I will go to the park.',
    questions: [
      {
        id: 'listen_06_q1',
        type: 'mcq',
        question: 'What is the weather like?',
        options: ['Rainy', 'Cloudy', 'Sunny', 'Snowy'],
        answerIndex: 2,
      },
      {
        id: 'listen_06_q2',
        type: 'truefalse',
        question: 'The speaker needs a jacket.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_07',
    type: 'comprehension',
    level: 'A1',
    topic: 'freetime',
    script:
      'I like to read books. My favourite book is about animals. I read every evening before bed.',
    questions: [
      {
        id: 'listen_07_q1',
        type: 'mcq',
        question: 'What does the speaker like to do?',
        options: ['Watch TV', 'Read books', 'Play games', 'Cook dinner'],
        answerIndex: 1,
      },
      {
        id: 'listen_07_q2',
        type: 'mcq',
        question: 'When does the speaker read?',
        options: ['In the morning', 'After lunch', 'Every evening', 'At weekends'],
        answerIndex: 2,
      },
    ],
  },

  // ─── A1 GAPFILL (listen_08–listen_10) ──────────────────────────────
  {
    id: 'listen_08',
    type: 'gapfill',
    level: 'A1',
    topic: 'health',
    script: 'I have a headache and I feel tired.',
    questions: [
      {
        id: 'listen_08_q1',
        type: 'fill',
        question: 'I have a ___ and I feel tired.',
        answer: 'headache',
      },
    ],
  },
  {
    id: 'listen_09',
    type: 'gapfill',
    level: 'A1',
    topic: 'work',
    script: 'She works in a hospital as a nurse.',
    questions: [
      {
        id: 'listen_09_q1',
        type: 'fill',
        question: 'She works in a ___ as a nurse.',
        answer: 'hospital',
      },
    ],
  },
  {
    id: 'listen_10',
    type: 'gapfill',
    level: 'A1',
    topic: 'education',
    script: 'The students are in the classroom.',
    questions: [
      {
        id: 'listen_10_q1',
        type: 'fill',
        question: 'The students are in the ___.',
        answer: 'classroom',
      },
    ],
  },

  // ─── A2 DICTATION (listen_11–listen_15) ────────────────────────────
  {
    id: 'listen_11',
    type: 'dictation',
    level: 'A2',
    topic: 'travel',
    script: 'We missed the bus so we took a taxi to the airport.',
    questions: [
      {
        id: 'listen_11_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'We missed the bus so we took a taxi to the airport.',
          'We missed the train so we took a taxi to the airport.',
          'We missed the bus so we walked to the airport.',
          'We caught the bus so we took a taxi to the airport.',
        ],
        answerIndex: 0,
      },
    ],
  },
  {
    id: 'listen_12',
    type: 'dictation',
    level: 'A2',
    topic: 'health',
    script: 'You should drink plenty of water when you have a cold.',
    questions: [
      {
        id: 'listen_12_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'You should drink plenty of juice when you have a cold.',
          'You should eat plenty of fruit when you have a cold.',
          'You should drink plenty of water when you have a cold.',
          'You should drink plenty of water when you have a fever.',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_13',
    type: 'dictation',
    level: 'A2',
    topic: 'sports',
    script: 'My brother plays football every Saturday afternoon.',
    questions: [
      {
        id: 'listen_13_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'My brother plays basketball every Saturday afternoon.',
          'My brother plays football every Sunday afternoon.',
          'My brother plays football every Saturday morning.',
          'My brother plays football every Saturday afternoon.',
        ],
        answerIndex: 3,
      },
    ],
  },
  {
    id: 'listen_14',
    type: 'dictation',
    level: 'A2',
    topic: 'media',
    script: 'She spends too much time watching videos on her phone.',
    questions: [
      {
        id: 'listen_14_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'She spends too much time playing games on her phone.',
          'She spends too much time watching videos on her phone.',
          'She spends too much money watching videos on her phone.',
          'He spends too much time watching videos on his phone.',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_15',
    type: 'dictation',
    level: 'A2',
    topic: 'weather',
    script: 'It has been raining all day and the streets are wet.',
    questions: [
      {
        id: 'listen_15_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'It has been snowing all day and the streets are wet.',
          'It has been raining all night and the streets are wet.',
          'It has been raining all day and the streets are wet.',
          'It has been raining all day and the parks are wet.',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── A2 COMPREHENSION (listen_16–listen_22) ────────────────────────
  {
    id: 'listen_16',
    type: 'comprehension',
    level: 'A2',
    topic: 'daily',
    script:
      'Tom usually gets up at half past six. He has a shower and then eats breakfast with his family. He leaves the house at quarter past seven and walks to work. It takes him about twenty minutes.',
    questions: [
      {
        id: 'listen_16_q1',
        type: 'mcq',
        question: 'What time does Tom get up?',
        options: ['At six', 'At half past six', 'At seven', 'At quarter past seven'],
        answerIndex: 1,
      },
      {
        id: 'listen_16_q2',
        type: 'truefalse',
        question: 'Tom drives to work.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_16_q3',
        type: 'mcq',
        question: 'How long does it take Tom to get to work?',
        options: ['Ten minutes', 'Fifteen minutes', 'Twenty minutes', 'Thirty minutes'],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_17',
    type: 'comprehension',
    level: 'A2',
    topic: 'family',
    script:
      'My name is Anna and I have a big family. I have two brothers and one sister. My older brother is married and has a baby daughter. We all meet at my parents\' house every Sunday for lunch.',
    questions: [
      {
        id: 'listen_17_q1',
        type: 'mcq',
        question: 'How many brothers does Anna have?',
        options: ['One', 'Two', 'Three', 'Four'],
        answerIndex: 1,
      },
      {
        id: 'listen_17_q2',
        type: 'truefalse',
        question: 'Anna\'s older brother has a son.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_17_q3',
        type: 'mcq',
        question: 'When does the family meet?',
        options: ['Every Saturday', 'Every Sunday', 'Every Friday', 'Once a month'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_18',
    type: 'comprehension',
    level: 'A2',
    topic: 'food',
    script:
      'Last night we went to an Italian restaurant. I had pasta with tomato sauce and my friend ordered a large pizza. The food was delicious but the service was a bit slow. We waited thirty minutes for our meal.',
    questions: [
      {
        id: 'listen_18_q1',
        type: 'mcq',
        question: 'What kind of restaurant did they go to?',
        options: ['Chinese', 'Mexican', 'Italian', 'French'],
        answerIndex: 2,
      },
      {
        id: 'listen_18_q2',
        type: 'truefalse',
        question: 'The service was fast.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_19',
    type: 'comprehension',
    level: 'A2',
    topic: 'shopping',
    script:
      'I went to the shopping centre yesterday to buy new shoes. I tried on three pairs but they were all too expensive. In the end, I found a nice pair in a small shop near my house. They were on sale for half price.',
    questions: [
      {
        id: 'listen_19_q1',
        type: 'mcq',
        question: 'What did the speaker want to buy?',
        options: ['A bag', 'A jacket', 'New shoes', 'A dress'],
        answerIndex: 2,
      },
      {
        id: 'listen_19_q2',
        type: 'truefalse',
        question: 'The speaker bought shoes at the shopping centre.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_19_q3',
        type: 'mcq',
        question: 'Where did the speaker finally buy the shoes?',
        options: [
          'At the shopping centre',
          'Online',
          'In a small shop near home',
          'At a market',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_20',
    type: 'comprehension',
    level: 'A2',
    topic: 'work',
    script:
      'Sarah works as a receptionist at a hotel. She starts work at eight in the morning and finishes at four. She answers the phone, welcomes guests and helps them with their questions. She really enjoys meeting people from different countries.',
    questions: [
      {
        id: 'listen_20_q1',
        type: 'mcq',
        question: 'Where does Sarah work?',
        options: ['At a school', 'At a hospital', 'At a hotel', 'At an office'],
        answerIndex: 2,
      },
      {
        id: 'listen_20_q2',
        type: 'mcq',
        question: 'What time does Sarah finish work?',
        options: ['At three', 'At four', 'At five', 'At six'],
        answerIndex: 1,
      },
      {
        id: 'listen_20_q3',
        type: 'truefalse',
        question: 'Sarah enjoys meeting people from different countries.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
    ],
  },
  {
    id: 'listen_21',
    type: 'comprehension',
    level: 'A2',
    topic: 'education',
    script:
      'Our English class is on Monday and Wednesday from nine to half past ten. The teacher gives us homework every week. We usually practise speaking in pairs and sometimes we watch short videos in English.',
    questions: [
      {
        id: 'listen_21_q1',
        type: 'mcq',
        question: 'How often is the English class?',
        options: ['Once a week', 'Twice a week', 'Three times a week', 'Every day'],
        answerIndex: 1,
      },
      {
        id: 'listen_21_q2',
        type: 'truefalse',
        question: 'The students never watch videos in class.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_22',
    type: 'comprehension',
    level: 'A2',
    topic: 'freetime',
    script:
      'On weekends I usually go cycling with my friend Mark. We ride along the river for about an hour. After that, we stop at a café and have coffee and cake. It is our favourite weekend activity.',
    questions: [
      {
        id: 'listen_22_q1',
        type: 'mcq',
        question: 'What do the speaker and Mark do on weekends?',
        options: ['Go swimming', 'Go running', 'Go cycling', 'Go hiking'],
        answerIndex: 2,
      },
      {
        id: 'listen_22_q2',
        type: 'truefalse',
        question: 'They ride for about two hours.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_22_q3',
        type: 'mcq',
        question: 'What do they do after cycling?',
        options: [
          'Go home',
          'Go shopping',
          'Have coffee and cake at a café',
          'Watch a film',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── A2 GAPFILL (listen_23–listen_26) ──────────────────────────────
  {
    id: 'listen_23',
    type: 'gapfill',
    level: 'A2',
    topic: 'travel',
    script: 'Please fasten your seatbelt. The plane is about to take off.',
    questions: [
      {
        id: 'listen_23_q1',
        type: 'fill',
        question: 'Please fasten your ___. The plane is about to take off.',
        answer: 'seatbelt',
      },
    ],
  },
  {
    id: 'listen_24',
    type: 'gapfill',
    level: 'A2',
    topic: 'sports',
    script: 'The match was cancelled because of the heavy rain.',
    questions: [
      {
        id: 'listen_24_q1',
        type: 'fill',
        question: 'The match was ___ because of the heavy rain.',
        answer: 'cancelled',
      },
    ],
  },
  {
    id: 'listen_25',
    type: 'gapfill',
    level: 'A2',
    topic: 'media',
    script: 'I read the news online every morning before I go to work.',
    questions: [
      {
        id: 'listen_25_q1',
        type: 'fill',
        question: 'I read the news ___ every morning before I go to work.',
        answer: 'online',
      },
    ],
  },
  {
    id: 'listen_26',
    type: 'gapfill',
    level: 'A2',
    topic: 'weather',
    script: 'The forecast says it will be cloudy with a chance of showers.',
    questions: [
      {
        id: 'listen_26_q1',
        type: 'fill',
        question: 'The ___ says it will be cloudy with a chance of showers.',
        answer: 'forecast',
      },
    ],
  },

  // ─── B1 DICTATION (listen_27–listen_29) ────────────────────────────
  {
    id: 'listen_27',
    type: 'dictation',
    level: 'B1',
    topic: 'daily',
    script:
      'Even though I set three alarms, I still managed to oversleep this morning.',
    questions: [
      {
        id: 'listen_27_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'Even though I set three alarms, I still managed to oversleep this morning.',
          'Even though I set two alarms, I still managed to oversleep this morning.',
          'Even though I set three alarms, I still managed to be late this morning.',
          'Although I set three alarms, I never oversleep in the morning.',
        ],
        answerIndex: 0,
      },
    ],
  },
  {
    id: 'listen_28',
    type: 'dictation',
    level: 'B1',
    topic: 'family',
    script:
      'My grandparents celebrated their fiftieth wedding anniversary last weekend.',
    questions: [
      {
        id: 'listen_28_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'My parents celebrated their fiftieth wedding anniversary last weekend.',
          'My grandparents celebrated their fortieth wedding anniversary last weekend.',
          'My grandparents celebrated their fiftieth wedding anniversary last weekend.',
          'My grandparents celebrated their fiftieth birthday last weekend.',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_29',
    type: 'dictation',
    level: 'B1',
    topic: 'food',
    script:
      'The restaurant was fully booked, so we decided to order takeaway instead.',
    questions: [
      {
        id: 'listen_29_q1',
        type: 'mcq',
        question: 'Which sentence did you hear?',
        options: [
          'The restaurant was fully booked, so we decided to cook at home instead.',
          'The restaurant was fully booked, so we decided to order takeaway instead.',
          'The restaurant was nearly empty, so we decided to order takeaway instead.',
          'The café was fully booked, so we decided to order takeaway instead.',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── B1 COMPREHENSION (listen_30–listen_35) ────────────────────────
  {
    id: 'listen_30',
    type: 'comprehension',
    level: 'B1',
    topic: 'shopping',
    script:
      'More and more people prefer shopping online these days. You can compare prices easily, read customer reviews and have items delivered to your door. However, some people still enjoy going to real shops because they like to try things on before they buy them. Another disadvantage of online shopping is that you sometimes have to wait several days for delivery.',
    questions: [
      {
        id: 'listen_30_q1',
        type: 'mcq',
        question: 'What is one advantage of online shopping mentioned in the text?',
        options: [
          'You can talk to shop assistants',
          'You can compare prices easily',
          'Items are always cheaper',
          'Delivery is always free',
        ],
        answerIndex: 1,
      },
      {
        id: 'listen_30_q2',
        type: 'truefalse',
        question: 'Everyone prefers online shopping according to the speaker.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_30_q3',
        type: 'mcq',
        question: 'What is one disadvantage of online shopping?',
        options: [
          'The websites are difficult to use',
          'You cannot return items',
          'You sometimes have to wait for delivery',
          'It is more expensive',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_31',
    type: 'comprehension',
    level: 'B1',
    topic: 'work',
    script:
      'Since the pandemic, many companies have allowed their employees to work from home. Some people find it easier to concentrate without the noise of an open office. On the other hand, others miss the social contact with their colleagues. Many firms now offer a hybrid model where employees work from home two or three days a week and come to the office for the rest.',
    questions: [
      {
        id: 'listen_31_q1',
        type: 'mcq',
        question: 'Why do some people prefer working from home?',
        options: [
          'They can sleep longer',
          'They can concentrate better',
          'They earn more money',
          'They don\'t need a computer',
        ],
        answerIndex: 1,
      },
      {
        id: 'listen_31_q2',
        type: 'truefalse',
        question: 'Nobody misses the social contact of working in an office.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_31_q3',
        type: 'mcq',
        question: 'What is the hybrid model?',
        options: [
          'Working from home every day',
          'Working in the office every day',
          'A mix of home and office work',
          'Working in two different offices',
        ],
        answerIndex: 2,
      },
    ],
  },
  {
    id: 'listen_32',
    type: 'comprehension',
    level: 'B1',
    topic: 'education',
    script:
      'Learning a foreign language takes time and patience. Experts say the best way to improve is to practise every day, even if it is only for fifteen minutes. Reading books, listening to podcasts and watching films in the target language can all help. It is also very useful to speak with native speakers whenever you get the chance.',
    questions: [
      {
        id: 'listen_32_q1',
        type: 'mcq',
        question: 'According to the text, what is the best way to improve?',
        options: [
          'Study for many hours once a week',
          'Practise every day',
          'Only read grammar books',
          'Take expensive courses',
        ],
        answerIndex: 1,
      },
      {
        id: 'listen_32_q2',
        type: 'truefalse',
        question: 'Watching films in the target language can help you learn.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'listen_32_q3',
        type: 'mcq',
        question: 'What is described as very useful?',
        options: [
          'Using a dictionary',
          'Speaking with native speakers',
          'Writing essays every day',
          'Memorising word lists',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_33',
    type: 'comprehension',
    level: 'B1',
    topic: 'health',
    script:
      'Getting enough sleep is essential for good health. Most adults need between seven and nine hours of sleep each night. If you don\'t sleep well, you may feel tired and find it hard to concentrate during the day. Doctors recommend avoiding screens for at least an hour before bed and keeping your bedroom cool and dark.',
    questions: [
      {
        id: 'listen_33_q1',
        type: 'mcq',
        question: 'How many hours of sleep do most adults need?',
        options: [
          'Five to six hours',
          'Six to seven hours',
          'Seven to nine hours',
          'Nine to eleven hours',
        ],
        answerIndex: 2,
      },
      {
        id: 'listen_33_q2',
        type: 'truefalse',
        question: 'Doctors recommend using your phone before going to sleep.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_34',
    type: 'comprehension',
    level: 'B1',
    topic: 'travel',
    script:
      'Last summer, we went on a road trip through southern France. We rented a car in Nice and drove along the coast towards Marseille. The scenery was absolutely beautiful, with the blue sea on one side and hills on the other. We stopped in several small villages to try local food and visit markets. The whole trip took about ten days and it was one of the best holidays we have ever had.',
    questions: [
      {
        id: 'listen_34_q1',
        type: 'mcq',
        question: 'Where did they rent a car?',
        options: ['In Paris', 'In Marseille', 'In Nice', 'In Lyon'],
        answerIndex: 2,
      },
      {
        id: 'listen_34_q2',
        type: 'truefalse',
        question: 'The trip lasted about two weeks.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_34_q3',
        type: 'mcq',
        question: 'What did they do in the small villages?',
        options: [
          'They stayed in expensive hotels',
          'They tried local food and visited markets',
          'They went swimming in the sea',
          'They took cooking lessons',
        ],
        answerIndex: 1,
      },
    ],
  },
  {
    id: 'listen_35',
    type: 'comprehension',
    level: 'B1',
    topic: 'sports',
    script:
      'Running has become one of the most popular forms of exercise worldwide. You don\'t need any special equipment, just a good pair of shoes. Many cities now organise free weekly runs in local parks. Beginners should start slowly and gradually increase their distance. It is important to warm up before you run and stretch afterwards to prevent injuries.',
    questions: [
      {
        id: 'listen_35_q1',
        type: 'mcq',
        question: 'What equipment do you need for running?',
        options: [
          'Special clothes',
          'A good pair of shoes',
          'A fitness tracker',
          'A gym membership',
        ],
        answerIndex: 1,
      },
      {
        id: 'listen_35_q2',
        type: 'truefalse',
        question: 'Beginners should run fast from the start.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'listen_35_q3',
        type: 'mcq',
        question: 'Why should you stretch after running?',
        options: [
          'To run faster next time',
          'To burn more calories',
          'To prevent injuries',
          'To cool down the shoes',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── B1 GAPFILL (listen_36–listen_40) ──────────────────────────────
  {
    id: 'listen_36',
    type: 'gapfill',
    level: 'B1',
    topic: 'media',
    script:
      'Social media can be a great way to stay connected, but it can also be quite addictive.',
    questions: [
      {
        id: 'listen_36_q1',
        type: 'fill',
        question:
          'Social media can be a great way to stay connected, but it can also be quite ___.',
        answer: 'addictive',
      },
    ],
  },
  {
    id: 'listen_37',
    type: 'gapfill',
    level: 'B1',
    topic: 'weather',
    script:
      'Due to the severe weather warning, all flights from the airport have been delayed.',
    questions: [
      {
        id: 'listen_37_q1',
        type: 'fill',
        question:
          'Due to the severe weather warning, all flights from the airport have been ___.',
        answer: 'delayed',
      },
    ],
  },
  {
    id: 'listen_38',
    type: 'gapfill',
    level: 'B1',
    topic: 'freetime',
    script:
      'She has been learning to play the guitar for about two years. Her teacher says she is making excellent progress.',
    questions: [
      {
        id: 'listen_38_q1',
        type: 'fill',
        question:
          'She has been learning to play the guitar for about two years. Her teacher says she is making excellent ___.',
        answer: 'progress',
      },
    ],
  },
  {
    id: 'listen_39',
    type: 'gapfill',
    level: 'B1',
    topic: 'daily',
    script:
      'I always set my alarm for six thirty, but I have a bad habit of hitting the snooze button.',
    questions: [
      {
        id: 'listen_39_q1',
        type: 'fill',
        question:
          'I always set my alarm for six thirty, but I have a bad ___ of hitting the snooze button.',
        answer: 'habit',
      },
    ],
  },
  {
    id: 'listen_40',
    type: 'gapfill',
    level: 'B1',
    topic: 'family',
    script:
      'My cousin is getting married next month and the whole family has been invited to the ceremony.',
    questions: [
      {
        id: 'listen_40_q1',
        type: 'fill',
        question:
          'My cousin is getting married next month and the whole family has been invited to the ___.',
        answer: 'ceremony',
      },
    ],
  },
];
