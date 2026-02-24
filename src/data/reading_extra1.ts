import type { ReadingText } from '../types';

export const READING_TEXTS_EXTRA1: ReadingText[] = [
  // ─── 1. My Grandparents (A1) ──────────────────────────────────────────
  {
    id: 'read_extra1_01',
    title: 'My Grandparents',
    level: 'A1',
    topic: 'family',
    text:
      'My grandparents live in a small village near Brno. My grandfather is seventy years old. ' +
      'He likes gardening and he grows tomatoes and strawberries. My grandmother is sixty-eight. ' +
      'She makes the best cakes in our family. Every Sunday, we visit them. We have lunch together ' +
      'and then we play cards. In summer, I sometimes stay with them for a whole week. I help my ' +
      'grandfather in the garden and my grandmother teaches me how to bake. I love spending time ' +
      'with them because they always tell me funny stories about my parents when they were young.',
    questions: [
      {
        id: 'read_extra1_01_q1',
        type: 'mcq',
        question: 'Where do the grandparents live?',
        options: ['In Prague', 'In a village near Brno', 'In Brno', 'In a big city'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_01_q2',
        type: 'truefalse',
        question: 'The grandmother grows tomatoes in the garden.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_01_q3',
        type: 'tfns',
        question: 'The family visits the grandparents every Sunday.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_01_q4',
        type: 'mcq',
        question: 'What does the narrator do with the grandmother?',
        options: ['Play cards', 'Watch TV', 'Learn to bake', 'Go shopping'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 2. School Lunch (A1) ─────────────────────────────────────────────
  {
    id: 'read_extra1_02',
    title: 'School Lunch',
    level: 'A1',
    topic: 'food',
    text:
      'Every day at twelve o\'clock, I go to the school canteen for lunch. Today the menu has two ' +
      'choices. The first is chicken with rice and a salad. The second is pasta with cheese sauce. ' +
      'I choose the pasta because I love cheese. My friend Tomáš takes the chicken. We sit at our ' +
      'favourite table near the window. We also get soup before the main course. Today it is tomato ' +
      'soup. After lunch, we get a piece of fruit. I take an apple and Tomáš takes a banana. The ' +
      'lunch costs thirty-five crowns. I think that is very cheap.',
    questions: [
      {
        id: 'read_extra1_02_q1',
        type: 'mcq',
        question: 'Why does the narrator choose pasta?',
        options: ['It is cheaper', 'He loves cheese', 'He does not like chicken', 'His friend chooses it too'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_02_q2',
        type: 'truefalse',
        question: 'Tomáš chooses the pasta with cheese sauce.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_02_q3',
        type: 'tfns',
        question: 'The narrator eats at the school canteen every day.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_02_q4',
        type: 'mcq',
        question: 'What do they get after the main course?',
        options: ['A dessert', 'A drink', 'A piece of fruit', 'A cake'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 3. Our New Flat (A1) ─────────────────────────────────────────────
  {
    id: 'read_extra1_03',
    title: 'Our New Flat',
    level: 'A1',
    topic: 'housing',
    text:
      'Last month, my family moved to a new flat. It is on the third floor of a big building. We have ' +
      'three bedrooms, a living room, a kitchen and a bathroom. My room is small but I like it. ' +
      'The walls are blue and I have a desk near the window. My sister\'s room is next to mine. ' +
      'The kitchen is the biggest room. We eat breakfast and dinner there. There is a balcony in ' +
      'the living room. My mum puts flowers on the balcony. From the balcony, we can see a park. ' +
      'I like the new flat because it is closer to my school.',
    questions: [
      {
        id: 'read_extra1_03_q1',
        type: 'mcq',
        question: 'On which floor is the new flat?',
        options: ['First floor', 'Second floor', 'Third floor', 'Fourth floor'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_03_q2',
        type: 'truefalse',
        question: 'The narrator\'s room has green walls.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_03_q3',
        type: 'mcq',
        question: 'What is the biggest room in the flat?',
        options: ['The living room', 'The narrator\'s room', 'The kitchen', 'The bathroom'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_03_q4',
        type: 'tfns',
        question: 'The flat has a garden.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 4. My Favourite Subject (A1) ─────────────────────────────────────
  {
    id: 'read_extra1_04',
    title: 'My Favourite Subject',
    level: 'A1',
    topic: 'education',
    text:
      'My name is Klára and I go to a secondary school in Olomouc. I am in the second year. My ' +
      'favourite subject is English. I have English lessons three times a week. Our teacher is ' +
      'Mrs Nováková. She is very nice and her lessons are fun. We read stories, listen to songs ' +
      'and sometimes watch short films in English. I also like biology because I want to be a ' +
      'doctor one day. I do not like maths very much because it is difficult for me. After school, ' +
      'I sometimes study English with my friend Petra. We practise speaking together.',
    questions: [
      {
        id: 'read_extra1_04_q1',
        type: 'mcq',
        question: 'How often does Klára have English lessons?',
        options: ['Once a week', 'Twice a week', 'Three times a week', 'Every day'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_04_q2',
        type: 'truefalse',
        question: 'Klára wants to be a teacher.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_04_q3',
        type: 'tfns',
        question: 'Klára is good at maths.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_04_q4',
        type: 'mcq',
        question: 'What does Klára do with her friend Petra after school?',
        options: ['They play sports', 'They practise speaking English', 'They watch films', 'They do maths homework'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 5. My Weekend (A1) ───────────────────────────────────────────────
  {
    id: 'read_extra1_05',
    title: 'My Weekend',
    level: 'A1',
    topic: 'freetime',
    text:
      'I love weekends because I do not have school. On Saturday morning, I usually sleep until ' +
      'nine o\'clock. After breakfast, I play computer games or read a book. In the afternoon, ' +
      'I meet my friends. We often go to the cinema or to a café. Sometimes we ride our bikes in ' +
      'the park. On Sunday, I spend time with my family. We sometimes go for a walk or visit our ' +
      'relatives. In the evening, I prepare my bag for school and check my homework. I wish every ' +
      'day was a weekend!',
    questions: [
      {
        id: 'read_extra1_05_q1',
        type: 'mcq',
        question: 'What time does the narrator wake up on Saturday?',
        options: ['At seven', 'At eight', 'At nine', 'At ten'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_05_q2',
        type: 'truefalse',
        question: 'The narrator meets friends on Saturday afternoon.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_05_q3',
        type: 'tfns',
        question: 'The narrator plays football with friends in the park.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_05_q4',
        type: 'mcq',
        question: 'What does the narrator do on Sunday evening?',
        options: ['Watches TV', 'Plays games', 'Prepares for school', 'Goes to a café'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 6. At the Shopping Centre (A1) ───────────────────────────────────
  {
    id: 'read_extra1_06',
    title: 'At the Shopping Centre',
    level: 'A1',
    topic: 'shopping',
    text:
      'Yesterday I went to the shopping centre with my mum. We needed new shoes for me because my ' +
      'old ones are too small. We looked at three shops. In the first shop, the shoes were too ' +
      'expensive. In the second shop, they did not have my size. In the third shop, I found nice ' +
      'white trainers. They cost eight hundred crowns. My mum said that was a good price. I was ' +
      'very happy. Then we went to a bookshop. I bought a new English book for sixty crowns. After ' +
      'shopping, we had ice cream in the food court. It was a great day.',
    questions: [
      {
        id: 'read_extra1_06_q1',
        type: 'mcq',
        question: 'Why did they go to the shopping centre?',
        options: ['To buy clothes', 'To buy new shoes', 'To buy a bag', 'To eat lunch'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_06_q2',
        type: 'truefalse',
        question: 'They found shoes in the first shop.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_06_q3',
        type: 'mcq',
        question: 'How much did the trainers cost?',
        options: ['Six hundred crowns', 'Seven hundred crowns', 'Eight hundred crowns', 'Nine hundred crowns'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_06_q4',
        type: 'tfns',
        question: 'The narrator bought a Czech book at the bookshop.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 7. A Trip to Vienna (A2) ─────────────────────────────────────────
  {
    id: 'read_extra1_07',
    title: 'A Trip to Vienna',
    level: 'A2',
    topic: 'travel',
    text:
      'Last weekend, our class went on a trip to Vienna. We left from Brno at seven in the morning ' +
      'by coach. The journey took about two hours. When we arrived, we first visited Schönbrunn ' +
      'Palace. It was beautiful and very big. Our guide told us about the history of the Habsburg ' +
      'family. After the palace, we walked through the city centre and saw St. Stephen\'s Cathedral. ' +
      'We had lunch at a small restaurant near the cathedral. I tried Wiener Schnitzel, which is a ' +
      'famous Austrian dish. In the afternoon, we went to Prater amusement park and I went on the ' +
      'big Ferris wheel. The view from the top was amazing. We got back to Brno at about nine in ' +
      'the evening. Everyone was tired but happy.',
    questions: [
      {
        id: 'read_extra1_07_q1',
        type: 'mcq',
        question: 'How long did the journey from Brno to Vienna take?',
        options: ['About one hour', 'About two hours', 'About three hours', 'About four hours'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_07_q2',
        type: 'truefalse',
        question: 'The class visited Schönbrunn Palace first.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_07_q3',
        type: 'tfns',
        question: 'The narrator enjoyed the Wiener Schnitzel.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_07_q4',
        type: 'mcq',
        question: 'What did the narrator do at Prater?',
        options: ['Ate lunch', 'Visited a museum', 'Went on the Ferris wheel', 'Bought souvenirs'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 8. A Visit to the Doctor (A2) ────────────────────────────────────
  {
    id: 'read_extra1_08',
    title: 'A Visit to the Doctor',
    level: 'A2',
    topic: 'health',
    text:
      'On Tuesday, I did not feel well. I had a sore throat and a headache. My temperature was ' +
      '38.2 degrees. My mum said I should stay at home and she called the doctor. We went to see ' +
      'Dr Dvořák in the afternoon. He examined my throat and listened to my chest. He said I had ' +
      'a throat infection and gave me a prescription for antibiotics. He also told me to drink lots ' +
      'of tea with honey and stay in bed for at least three days. I was sad because I had to miss ' +
      'a basketball match on Wednesday. By Friday, I felt much better and I could go back to school ' +
      'on Monday. My classmates told me they lost the basketball match, so I did not miss much!',
    questions: [
      {
        id: 'read_extra1_08_q1',
        type: 'mcq',
        question: 'What symptoms did the narrator have?',
        options: [
          'A stomach ache and a fever',
          'A sore throat and a headache',
          'A cough and a runny nose',
          'A broken arm and a headache',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_08_q2',
        type: 'truefalse',
        question: 'The doctor prescribed antibiotics.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_08_q3',
        type: 'tfns',
        question: 'The narrator\'s basketball team won the match on Wednesday.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_08_q4',
        type: 'mcq',
        question: 'When did the narrator go back to school?',
        options: ['On Thursday', 'On Friday', 'On Saturday', 'On Monday'],
        answerIndex: 3,
      },
    ],
  },

  // ─── 9. Our School Garden (A2) ────────────────────────────────────────
  {
    id: 'read_extra1_09',
    title: 'Our School Garden',
    level: 'A2',
    topic: 'nature',
    text:
      'This year, our school started a new project — a school garden. The garden is behind the gym. ' +
      'Each class has its own section where students plant vegetables and flowers. Our class is ' +
      'growing tomatoes, peppers and sunflowers. We water the plants every morning before the first ' +
      'lesson. Our biology teacher, Mr Černý, helps us take care of the garden. He taught us about ' +
      'different types of soil and how much sunlight each plant needs. In June, we had our first ' +
      'tomatoes and they tasted amazing. Some students also planted herbs like basil and mint. The ' +
      'school plans to use the vegetables in the canteen. I think it is a great project because we ' +
      'learn about nature and eat healthy food at the same time.',
    questions: [
      {
        id: 'read_extra1_09_q1',
        type: 'mcq',
        question: 'Where is the school garden?',
        options: ['In front of the school', 'Behind the gym', 'Next to the canteen', 'On the roof'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_09_q2',
        type: 'truefalse',
        question: 'The students water the plants after the last lesson.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_09_q3',
        type: 'tfns',
        question: 'Mr Černý teaches chemistry at the school.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_09_q4',
        type: 'mcq',
        question: 'What does the school plan to do with the vegetables?',
        options: ['Sell them at a market', 'Use them in the canteen', 'Give them to parents', 'Donate them to charity'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 10. My Part-Time Job (A2) ────────────────────────────────────────
  {
    id: 'read_extra1_10',
    title: 'My Part-Time Job',
    level: 'A2',
    topic: 'work',
    text:
      'My name is Matěj and I am seventeen. Since September, I have had a part-time job at a ' +
      'supermarket near my house. I work there on Saturdays from eight in the morning until two in ' +
      'the afternoon. My job is to put products on the shelves and help customers find what they ' +
      'need. The work is not difficult, but sometimes it is tiring because I have to stand all day. ' +
      'I earn ninety crowns per hour. I save most of my money because I want to buy a new laptop ' +
      'for school. My colleagues are friendly, especially Jana, who works at the cash desk. She ' +
      'always brings homemade cookies on Saturday mornings. I think having a job teaches me to be ' +
      'responsible and manage my time better.',
    questions: [
      {
        id: 'read_extra1_10_q1',
        type: 'mcq',
        question: 'When does Matěj work at the supermarket?',
        options: ['Every day after school', 'On Saturdays', 'On weekends', 'On Sundays'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_10_q2',
        type: 'truefalse',
        question: 'Matěj earns one hundred crowns per hour.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_10_q3',
        type: 'tfns',
        question: 'Matěj wants to buy a new phone with his savings.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_10_q4',
        type: 'mcq',
        question: 'What does Jana do at the supermarket?',
        options: ['She puts products on shelves', 'She cleans the floor', 'She works at the cash desk', 'She is the manager'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 11. Family Dinner (A2) ───────────────────────────────────────────
  {
    id: 'read_extra1_11',
    title: 'Family Dinner',
    level: 'A2',
    topic: 'family',
    text:
      'Every Friday evening, our whole family has dinner together. It is a tradition in our house. ' +
      'My dad usually cooks because he is the best cook in the family. Last Friday, he made roast ' +
      'chicken with potatoes and a big salad. My older brother Martin set the table and my mum ' +
      'made a chocolate cake for dessert. During dinner, we talk about our week. My dad told us a ' +
      'funny story about his colleague at work. My brother said he got a good mark in his physics ' +
      'test. I told them about the school garden project. After dinner, we sometimes play board ' +
      'games or watch a film together. These Friday dinners are my favourite time of the week ' +
      'because the whole family is together and we have fun.',
    questions: [
      {
        id: 'read_extra1_11_q1',
        type: 'mcq',
        question: 'Who usually cooks the Friday dinner?',
        options: ['The narrator', 'The mum', 'The dad', 'Martin'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_11_q2',
        type: 'truefalse',
        question: 'Martin set the table last Friday.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_11_q3',
        type: 'tfns',
        question: 'The family always plays board games after dinner.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_11_q4',
        type: 'mcq',
        question: 'What good news did Martin share during dinner?',
        options: [
          'He won a sports competition',
          'He got a good mark in physics',
          'He found a part-time job',
          'He passed his driving test',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── 12. Cooking with Grandma (A2) ────────────────────────────────────
  {
    id: 'read_extra1_12',
    title: 'Cooking with Grandma',
    level: 'A2',
    topic: 'food',
    text:
      'Last Saturday, I spent the whole day at my grandma\'s house. She promised to teach me how to ' +
      'make svíčková, which is a traditional Czech dish. First, we went to the local market to buy ' +
      'fresh vegetables — carrots, celery and onions. We already had beef at home. Grandma showed ' +
      'me how to prepare the sauce. It takes a long time because you have to cook the vegetables ' +
      'slowly and then blend them. While the meat was in the oven, we made dumplings from scratch. ' +
      'That was the hardest part because the dough has to be the right consistency. The whole flat ' +
      'smelled wonderful. When everything was ready, we sat down and ate together. It was delicious! ' +
      'Grandma said my dumplings were almost as good as hers. I felt really proud.',
    questions: [
      {
        id: 'read_extra1_12_q1',
        type: 'mcq',
        question: 'Where did they buy the vegetables?',
        options: ['At a supermarket', 'At the local market', 'At a small shop', 'Online'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_12_q2',
        type: 'truefalse',
        question: 'They bought beef at the market.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_12_q3',
        type: 'mcq',
        question: 'What was the hardest part of cooking?',
        options: ['Making the sauce', 'Cutting the vegetables', 'Making the dumplings', 'Cooking the meat'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_12_q4',
        type: 'tfns',
        question: 'The narrator\'s grandma was disappointed with the dumplings.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 13. Moving to a New Town (A2) ────────────────────────────────────
  {
    id: 'read_extra1_13',
    title: 'Moving to a New Town',
    level: 'A2',
    topic: 'housing',
    text:
      'My family moved from Prague to Hradec Králové six months ago because of my dad\'s new job. ' +
      'At first, I was really sad because I had to leave my friends and my old school. Our new ' +
      'house is bigger than our Prague flat. It has a small garden with an apple tree. My room is ' +
      'on the second floor and it has a nice view of the river. I started at a new school in ' +
      'September. The first week was difficult, but then I met Lukáš in my class. He invited me ' +
      'to play football with his friends after school. Now I have a group of friends and I feel at ' +
      'home here. I still talk to my Prague friends online almost every day. Sometimes I miss the ' +
      'big city, but Hradec Králové is quieter and the air is cleaner.',
    questions: [
      {
        id: 'read_extra1_13_q1',
        type: 'mcq',
        question: 'Why did the family move to Hradec Králové?',
        options: [
          'The flat in Prague was too small',
          'Because of the dad\'s new job',
          'They wanted to be near nature',
          'The narrator changed schools',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_13_q2',
        type: 'truefalse',
        question: 'The new house is smaller than the Prague flat.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_13_q3',
        type: 'tfns',
        question: 'Lukáš is in the same year as the narrator.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_13_q4',
        type: 'mcq',
        question: 'How does the narrator stay in contact with Prague friends?',
        options: ['He visits them every weekend', 'He calls them on the phone', 'He talks to them online', 'He writes them letters'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 14. Exchange Student (A2) ────────────────────────────────────────
  {
    id: 'read_extra1_14',
    title: 'An Exchange Student in Our Class',
    level: 'A2',
    topic: 'education',
    text:
      'This semester, there is an exchange student in our class. Her name is Sophie and she comes ' +
      'from France. She is staying with a host family in our town for five months. Sophie speaks ' +
      'French and English, and she is learning Czech. She says Czech is very difficult, especially ' +
      'the pronunciation. We try to help her by speaking slowly and explaining words she doesn\'t ' +
      'know. Sophie helps us with our French homework in return. During the break, she told us ' +
      'about her life in Lyon. She said French schools are different — they have longer school days ' +
      'but more holidays. Last week, we took Sophie to see the local castle and she was very ' +
      'impressed. She took many photos. I think having an exchange student in class is a great ' +
      'experience because we learn about a different culture every day.',
    questions: [
      {
        id: 'read_extra1_14_q1',
        type: 'mcq',
        question: 'How long is Sophie staying?',
        options: ['Three months', 'Four months', 'Five months', 'Six months'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_14_q2',
        type: 'truefalse',
        question: 'Sophie finds Czech pronunciation easy.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_14_q3',
        type: 'tfns',
        question: 'Sophie\'s host family lives near the school.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_14_q4',
        type: 'mcq',
        question: 'According to Sophie, how are French schools different?',
        options: [
          'They have fewer students',
          'They have longer days but more holidays',
          'They start later in the morning',
          'They do not have a canteen',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── 15. The Rise of E-Sports (B1) ────────────────────────────────────
  {
    id: 'read_extra1_15',
    title: 'The Rise of E-Sports',
    level: 'B1',
    topic: 'freetime',
    text:
      'E-sports, or competitive video gaming, has become one of the fastest-growing forms of ' +
      'entertainment worldwide. Professional players train for eight to twelve hours a day, ' +
      'developing strategies and improving their reaction times. Major tournaments offer prize ' +
      'pools worth millions of dollars, and some events fill entire stadiums with fans. In the ' +
      'Czech Republic, e-sports are becoming increasingly popular. Several Czech teams compete ' +
      'at international level, particularly in games like Counter-Strike and League of Legends. ' +
      'Some secondary schools have even started e-sports clubs where students can practise and ' +
      'compete against other schools. Critics argue that spending too much time gaming can be ' +
      'unhealthy and affect academic performance. However, supporters point out that e-sports ' +
      'develop teamwork, quick decision-making and communication skills. Like traditional sports, ' +
      'the key is finding a healthy balance between gaming and other responsibilities.',
    questions: [
      {
        id: 'read_extra1_15_q1',
        type: 'mcq',
        question: 'How many hours a day do professional e-sports players typically train?',
        options: ['Four to six hours', 'Six to eight hours', 'Eight to twelve hours', 'Twelve to sixteen hours'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_15_q2',
        type: 'tfns',
        question: 'All Czech secondary schools have e-sports clubs.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_15_q3',
        type: 'truefalse',
        question: 'Critics believe that too much gaming can be harmful to students\' studies.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_15_q4',
        type: 'mcq',
        question: 'According to the text, what skills can e-sports help develop?',
        options: [
          'Physical fitness and endurance',
          'Teamwork and communication',
          'Creative writing and reading',
          'Cooking and time management',
        ],
        answerIndex: 1,
      },
    ],
  },

  // ─── 16. Interrail Through Europe (B1) ────────────────────────────────
  {
    id: 'read_extra1_16',
    title: 'Interrail Through Europe',
    level: 'B1',
    topic: 'travel',
    text:
      'After finishing their final exams, many European young people decide to travel by Interrail, ' +
      'a train pass that allows unlimited travel across most European countries. My cousin David did ' +
      'his Interrail trip last summer. He travelled for three weeks with two friends and they visited ' +
      'seven countries: Germany, Austria, Italy, Slovenia, Croatia, Hungary and Slovakia. They slept ' +
      'in hostels and sometimes even on night trains to save money. David said the most memorable ' +
      'part was watching the sunset over the Adriatic Sea in Split. However, it was not all perfect. ' +
      'They missed a train connection in Munich and had to wait six hours at the station. David also ' +
      'lost his phone in Budapest, which was stressful. Despite these problems, he says the trip was ' +
      'the best experience of his life. He met people from all over the world and learned to solve ' +
      'problems independently. He strongly recommends Interrail to anyone who wants to explore ' +
      'Europe on a budget.',
    questions: [
      {
        id: 'read_extra1_16_q1',
        type: 'mcq',
        question: 'How long was David\'s Interrail trip?',
        options: ['Two weeks', 'Three weeks', 'Four weeks', 'One month'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_16_q2',
        type: 'truefalse',
        question: 'David travelled alone on his Interrail trip.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_16_q3',
        type: 'tfns',
        question: 'David bought a new phone while in Budapest.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_16_q4',
        type: 'mcq',
        question: 'What problem did they have in Munich?',
        options: [
          'Their hostel was fully booked',
          'They could not find a restaurant',
          'They missed a train connection',
          'They lost their luggage',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── 17. Mental Health Awareness at School (B1) ───────────────────────
  {
    id: 'read_extra1_17',
    title: 'Mental Health Awareness at School',
    level: 'B1',
    topic: 'health',
    text:
      'More and more Czech schools are starting to pay attention to students\' mental health. ' +
      'According to a recent survey, about one in four secondary school students in the Czech ' +
      'Republic experiences significant stress or anxiety during the school year. The main causes ' +
      'include exam pressure, worries about the future and problems with social media. In response, ' +
      'some schools have hired school psychologists and organised workshops on stress management. ' +
      'At our school, we had a special Mental Health Week last November. There were talks from ' +
      'psychologists, relaxation exercises during breaks and an anonymous box where students could ' +
      'submit questions. Many students said they found the workshops helpful and wished the school ' +
      'would organise them more often. Experts agree that talking openly about mental health reduces ' +
      'stigma and helps young people seek support earlier. While there is still a long way to go, ' +
      'these first steps are encouraging.',
    questions: [
      {
        id: 'read_extra1_17_q1',
        type: 'mcq',
        question: 'According to the survey, how many secondary school students experience significant stress?',
        options: ['About one in ten', 'About one in four', 'About one in two', 'About one in three'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_17_q2',
        type: 'truefalse',
        question: 'Social media is mentioned as one of the causes of student stress.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_17_q3',
        type: 'tfns',
        question: 'The Mental Health Week at the narrator\'s school was organised in January.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_17_q4',
        type: 'mcq',
        question: 'What could students do with the anonymous box?',
        options: [
          'Submit homework late',
          'Report bullying',
          'Submit questions about mental health',
          'Suggest new school rules',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── 18. Online Shopping vs High Street (B1) ──────────────────────────
  {
    id: 'read_extra1_18',
    title: 'Online Shopping vs High Street',
    level: 'B1',
    topic: 'shopping',
    text:
      'The way people shop has changed dramatically in recent years. More and more Czech consumers, ' +
      'especially young people, prefer to buy things online rather than in traditional shops. Online ' +
      'shopping offers several advantages: you can compare prices easily, shop at any time of day ' +
      'and have products delivered to your door. Popular Czech e-shops like Alza and Mall.cz offer ' +
      'a huge selection of electronics, clothes and household goods. However, online shopping also ' +
      'has disadvantages. You cannot try on clothes or test products before buying them. Returns can ' +
      'be complicated and delivery sometimes takes longer than expected. Meanwhile, many small shops ' +
      'in town centres are struggling to survive because they cannot compete with online prices. Some ' +
      'local shop owners have responded by creating their own websites and offering click-and-collect ' +
      'services. Finding the right balance between the convenience of online shopping and supporting ' +
      'local businesses is a challenge that many communities are currently facing.',
    questions: [
      {
        id: 'read_extra1_18_q1',
        type: 'mcq',
        question: 'According to the text, which group especially prefers online shopping?',
        options: ['Elderly people', 'Young people', 'Parents with small children', 'Business owners'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_18_q2',
        type: 'truefalse',
        question: 'The text mentions that you can try on clothes when shopping online.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_18_q3',
        type: 'tfns',
        question: 'Alza and Mall.cz offer free delivery on all orders.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_18_q4',
        type: 'mcq',
        question: 'How have some local shop owners responded to online competition?',
        options: [
          'By lowering all their prices',
          'By closing their shops permanently',
          'By creating websites and click-and-collect services',
          'By moving to bigger cities',
        ],
        answerIndex: 2,
      },
    ],
  },

  // ─── 19. Plastic Pollution in Czech Rivers (B1) ───────────────────────
  {
    id: 'read_extra1_19',
    title: 'Plastic Pollution in Czech Rivers',
    level: 'B1',
    topic: 'nature',
    text:
      'Although the Czech Republic has no coastline, plastic pollution is still a serious problem. ' +
      'Scientists from Charles University recently studied several Czech rivers and found alarming ' +
      'amounts of microplastics — tiny plastic fragments smaller than five millimetres. These ' +
      'particles come from various sources: plastic bags that break down, synthetic clothing fibres ' +
      'released during washing and microbeads from cosmetic products. The plastics eventually travel ' +
      'through rivers to the sea, contributing to ocean pollution. Some Czech municipalities have ' +
      'started campaigns to reduce single-use plastics. For example, several towns now ban plastic ' +
      'bags at local markets and encourage people to use reusable bottles. Schools are also playing ' +
      'a role. At our gymnasium, we organised a river clean-up event last spring and collected over ' +
      'two hundred kilograms of rubbish along a three-kilometre stretch of the Vltava. Experts say ' +
      'that individual actions, such as refusing unnecessary plastic packaging, can make a real ' +
      'difference if enough people participate.',
    questions: [
      {
        id: 'read_extra1_19_q1',
        type: 'mcq',
        question: 'What are microplastics?',
        options: [
          'Large pieces of plastic in rivers',
          'Tiny plastic fragments smaller than five millimetres',
          'Plastic bags floating in water',
          'Chemicals released by factories',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_19_q2',
        type: 'truefalse',
        question: 'Synthetic clothing fibres are one source of microplastics in rivers.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_extra1_19_q3',
        type: 'tfns',
        question: 'The Czech government has passed a national law banning all single-use plastics.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_19_q4',
        type: 'mcq',
        question: 'How much rubbish did the school collect during the river clean-up?',
        options: ['Over fifty kilograms', 'Over one hundred kilograms', 'Over two hundred kilograms', 'Over three hundred kilograms'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 20. Choosing a Career Path (B1) ──────────────────────────────────
  {
    id: 'read_extra1_20',
    title: 'Choosing a Career Path',
    level: 'B1',
    topic: 'work',
    text:
      'One of the biggest decisions Czech teenagers face is choosing what to do after secondary ' +
      'school. Some students plan to go to university, while others prefer to start working or ' +
      'do a vocational course. At our school, we had a career guidance day where professionals ' +
      'from different fields came to talk about their jobs. A software developer explained how ' +
      'he builds mobile applications and earns a good salary even without a university degree. ' +
      'A nurse described the challenges and rewards of working in a hospital. A marketing manager ' +
      'talked about the importance of communication skills and creativity in her job. After the ' +
      'talks, many students said they felt less anxious about the future because they realised ' +
      'there are many possible paths to a successful career. Guidance counsellors recommend that ' +
      'students try different activities, do internships during holidays and talk to people already ' +
      'working in fields that interest them. The most important thing, they say, is to choose a ' +
      'career that matches your strengths and interests, not just one that pays well.',
    questions: [
      {
        id: 'read_extra1_20_q1',
        type: 'mcq',
        question: 'What event did the school organise?',
        options: ['A sports day', 'A science fair', 'A career guidance day', 'A cultural festival'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_20_q2',
        type: 'truefalse',
        question: 'The software developer mentioned that he has a university degree.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_extra1_20_q3',
        type: 'tfns',
        question: 'Most students at the school want to become software developers.',
        options: ['True', 'False', 'Not stated'],
        answerIndex: 2,
      },
      {
        id: 'read_extra1_20_q4',
        type: 'mcq',
        question: 'According to guidance counsellors, what is the most important factor when choosing a career?',
        options: [
          'A high salary',
          'Matching your strengths and interests',
          'Following your parents\' advice',
          'Choosing a popular field',
        ],
        answerIndex: 1,
      },
    ],
  },
];
