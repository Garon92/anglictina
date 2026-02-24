import type { ReadingText } from '../types';
import { READING_TEXTS_EXTRA1 } from './reading_extra1';
import { READING_TEXTS_EXTRA2 } from './reading_extra2';

const READING_TEXTS_BASE: ReadingText[] = [
  // ─── 1. My Daily Routine (A1) ────────────────────────────────────────
  {
    id: 'read_daily_01',
    title: 'My Daily Routine',
    level: 'A1',
    topic: 'daily',
    text:
      'I wake up at seven o\'clock every morning. First, I brush my teeth and take a shower. ' +
      'Then I have breakfast. I usually eat bread with butter and drink tea. I go to school by bus. ' +
      'School starts at eight. I have lunch at school at twelve. After school, I do my homework and ' +
      'play computer games. In the evening, I watch TV with my family. I go to bed at ten o\'clock.',
    questions: [
      {
        id: 'read_daily_01_q1',
        type: 'mcq',
        question: 'What time does the narrator wake up?',
        options: ['At six o\'clock', 'At seven o\'clock', 'At eight o\'clock', 'At five o\'clock'],
        answerIndex: 1,
      },
      {
        id: 'read_daily_01_q2',
        type: 'mcq',
        question: 'How does the narrator get to school?',
        options: ['By car', 'On foot', 'By bus', 'By bike'],
        answerIndex: 2,
      },
      {
        id: 'read_daily_01_q3',
        type: 'truefalse',
        question: 'The narrator has breakfast at school.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_daily_01_q4',
        type: 'truefalse',
        question: 'The narrator goes to bed at ten o\'clock.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
    ],
  },

  // ─── 2. My Family (A1) ───────────────────────────────────────────────
  {
    id: 'read_family_01',
    title: 'My Family',
    level: 'A1',
    topic: 'family',
    text:
      'My name is Tomáš and I live in Brno with my family. There are four people in my family: ' +
      'my mum, my dad, my younger sister Klára, and me. My mum is a teacher and my dad is an engineer. ' +
      'Klára is ten years old and she likes drawing. We have a cat called Micka. Every Sunday, we visit ' +
      'my grandparents. They live in a small village near Brno. My grandmother makes the best cakes.',
    questions: [
      {
        id: 'read_family_01_q1',
        type: 'mcq',
        question: 'Where does Tomáš live?',
        options: ['In Prague', 'In Brno', 'In Olomouc', 'In a village'],
        answerIndex: 1,
      },
      {
        id: 'read_family_01_q2',
        type: 'mcq',
        question: 'What is Tomáš\'s father\'s job?',
        options: ['A teacher', 'A doctor', 'An engineer', 'A driver'],
        answerIndex: 2,
      },
      {
        id: 'read_family_01_q3',
        type: 'truefalse',
        question: 'Tomáš has a brother.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_family_01_q4',
        type: 'mcq',
        question: 'What pet does the family have?',
        options: ['A dog', 'A hamster', 'A cat', 'A rabbit'],
        answerIndex: 2,
      },
    ],
  },

  // ─── 3. A Trip to London (A2) ────────────────────────────────────────
  {
    id: 'read_travel_01',
    title: 'A Trip to London',
    level: 'A2',
    topic: 'travel',
    text:
      'Last summer, I went to London with my class. We flew from Prague and the flight took about two hours. ' +
      'We stayed in a small hotel near the centre. On the first day, we visited the Tower of London and saw the ' +
      'Crown Jewels. The next day, we took a boat trip on the River Thames and walked across Tower Bridge. ' +
      'I really enjoyed the London Eye because the view of the city was amazing. We also went to the British Museum, ' +
      'which was free. The food was quite expensive, so we often ate sandwiches from supermarkets. ' +
      'I bought some souvenirs for my family and a red phone box fridge magnet for myself. ' +
      'It was the best trip I have ever had!',
    questions: [
      {
        id: 'read_travel_01_q1',
        type: 'mcq',
        question: 'How did the class travel to London?',
        options: ['By train', 'By bus', 'By plane', 'By car'],
        answerIndex: 2,
      },
      {
        id: 'read_travel_01_q2',
        type: 'mcq',
        question: 'What did they see at the Tower of London?',
        options: ['Dinosaur bones', 'The Crown Jewels', 'Famous paintings', 'Wax figures'],
        answerIndex: 1,
      },
      {
        id: 'read_travel_01_q3',
        type: 'truefalse',
        question: 'They had to pay to enter the British Museum.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_travel_01_q4',
        type: 'mcq',
        question: 'Why did they eat sandwiches from supermarkets?',
        options: [
          'They didn\'t like British food',
          'The restaurants were closed',
          'The food in London was expensive',
          'Their teacher told them to',
        ],
        answerIndex: 2,
      },
      {
        id: 'read_travel_01_q5',
        type: 'truefalse',
        question: 'The narrator bought a fridge magnet as a souvenir.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
    ],
  },

  // ─── 4. Healthy Eating (A2) ──────────────────────────────────────────
  {
    id: 'read_food_01',
    title: 'Healthy Eating',
    level: 'A2',
    topic: 'food',
    text:
      'Eating healthy food is very important for teenagers. Your body needs energy to study, do sports, and grow. ' +
      'A good breakfast gives you energy for the morning. You should eat fruit and vegetables every day — doctors say ' +
      'at least five portions. It is also important to drink enough water. Many students drink too much cola or juice ' +
      'with a lot of sugar. Fast food like burgers and chips tastes good, but you should not eat it every day. ' +
      'Try to eat fish at least once a week because it is good for your brain. ' +
      'Also, do not skip meals. If you miss lunch, you will feel tired in the afternoon and you might eat ' +
      'too many sweets later. A balanced diet helps you feel better and do well at school.',
    questions: [
      {
        id: 'read_food_01_q1',
        type: 'mcq',
        question: 'How many portions of fruit and vegetables should you eat daily?',
        options: ['At least two', 'At least three', 'At least five', 'At least seven'],
        answerIndex: 2,
      },
      {
        id: 'read_food_01_q2',
        type: 'truefalse',
        question: 'The text says you should never eat fast food.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_food_01_q3',
        type: 'mcq',
        question: 'Why is fish recommended?',
        options: [
          'It is cheap',
          'It is good for your brain',
          'It tastes like chicken',
          'It has a lot of sugar',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_food_01_q4',
        type: 'mcq',
        question: 'What happens if you skip lunch?',
        options: [
          'You sleep better',
          'You feel tired and may eat too many sweets',
          'You lose weight quickly',
          'Nothing happens',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_food_01_q5',
        type: 'truefalse',
        question: 'Many students drink too much water according to the text.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 5. My Favourite Sport (A2) ──────────────────────────────────────
  {
    id: 'read_sports_01',
    title: 'My Favourite Sport',
    level: 'A2',
    topic: 'sports',
    text:
      'My favourite sport is basketball. I have played it since I was eight years old. I practise three times a week ' +
      'with my team at the local sports hall. Our coach, Mr Novotný, is strict but fair. He always says teamwork is ' +
      'more important than individual skill. Last year, we won the regional championship and it was an incredible feeling. ' +
      'I play as a point guard because I am fast and good at passing the ball. My dream is to play in a university team ' +
      'one day. Besides basketball, I also enjoy running and swimming to stay fit.',
    questions: [
      {
        id: 'read_sports_01_q1',
        type: 'mcq',
        question: 'How often does the narrator practise basketball?',
        options: ['Once a week', 'Twice a week', 'Three times a week', 'Every day'],
        answerIndex: 2,
      },
      {
        id: 'read_sports_01_q2',
        type: 'truefalse',
        question: 'The coach thinks individual skill is the most important thing.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_sports_01_q3',
        type: 'mcq',
        question: 'What position does the narrator play?',
        options: ['Centre', 'Shooting guard', 'Point guard', 'Power forward'],
        answerIndex: 2,
      },
      {
        id: 'read_sports_01_q4',
        type: 'truefalse',
        question: 'The narrator started playing basketball at the age of ten.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 6. The Weather in the Czech Republic (A2) ───────────────────────
  {
    id: 'read_weather_01',
    title: 'The Weather in the Czech Republic',
    level: 'A2',
    topic: 'weather',
    text:
      'The Czech Republic has four seasons: spring, summer, autumn, and winter. Spring usually begins in March. ' +
      'The snow melts, flowers start to bloom, and the days get longer. Summer is the warmest season. Temperatures ' +
      'can reach 35 degrees in July and August. Many Czech people go swimming or visit castles during their holidays. ' +
      'Autumn starts in September. The leaves on the trees change colour to yellow, orange, and red. It often rains ' +
      'in October and November. Winter can be very cold with temperatures below zero. It sometimes snows in December ' +
      'and January. Many people enjoy skiing in the mountains, for example in Krkonoše. ' +
      'Czech weather can be unpredictable — you might need sunglasses and an umbrella on the same day!',
    questions: [
      {
        id: 'read_weather_01_q1',
        type: 'mcq',
        question: 'When does spring usually begin?',
        options: ['In February', 'In March', 'In April', 'In May'],
        answerIndex: 1,
      },
      {
        id: 'read_weather_01_q2',
        type: 'mcq',
        question: 'What temperature can summer reach?',
        options: ['25 degrees', '30 degrees', '35 degrees', '40 degrees'],
        answerIndex: 2,
      },
      {
        id: 'read_weather_01_q3',
        type: 'truefalse',
        question: 'It often rains in October and November.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_weather_01_q4',
        type: 'mcq',
        question: 'Where do many people go skiing?',
        options: ['In Šumava', 'In Krkonoše', 'In Jeseníky', 'In Beskydy'],
        answerIndex: 1,
      },
      {
        id: 'read_weather_01_q5',
        type: 'truefalse',
        question: 'Czech weather is always predictable.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 7. Social Media and Young People (B1) ───────────────────────────
  {
    id: 'read_media_01',
    title: 'Social Media and Young People',
    level: 'B1',
    topic: 'media',
    text:
      'Social media platforms like Instagram, TikTok, and YouTube have become an everyday part of life for most ' +
      'teenagers. According to recent studies, young people spend an average of three hours a day on social media. ' +
      'There are many advantages. Social media makes it easy to stay in touch with friends and family, even those ' +
      'who live far away. It is also a great source of information and entertainment. Some teenagers use platforms ' +
      'like YouTube to learn new skills, such as cooking, programming, or playing musical instruments.\n\n' +
      'However, there are also serious disadvantages. Spending too much time online can lead to problems with sleep ' +
      'and concentration. Cyberbullying is another growing concern — some students receive hurtful messages or comments. ' +
      'Many experts warn that social media can make young people feel anxious or unhappy when they compare their lives ' +
      'to the perfect images they see online. It is important to take breaks, limit screen time, and remember that ' +
      'what people post online is not always the truth.',
    questions: [
      {
        id: 'read_media_01_q1',
        type: 'mcq',
        question: 'How much time do young people spend on social media daily on average?',
        options: ['One hour', 'Two hours', 'Three hours', 'Five hours'],
        answerIndex: 2,
      },
      {
        id: 'read_media_01_q2',
        type: 'mcq',
        question: 'Which skill is NOT mentioned as something teenagers learn on YouTube?',
        options: ['Cooking', 'Programming', 'Drawing', 'Playing musical instruments'],
        answerIndex: 2,
      },
      {
        id: 'read_media_01_q3',
        type: 'truefalse',
        question: 'Cyberbullying is described as a growing concern.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_media_01_q4',
        type: 'mcq',
        question: 'What can happen when young people compare themselves to others online?',
        options: [
          'They feel more confident',
          'They feel anxious or unhappy',
          'They study harder',
          'They make more friends',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_media_01_q5',
        type: 'truefalse',
        question: 'The text says everything people post on social media is true.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 8. Protecting the Environment (B1) ──────────────────────────────
  {
    id: 'read_nature_01',
    title: 'Protecting the Environment',
    level: 'B1',
    topic: 'nature',
    text:
      'Climate change is one of the biggest problems the world faces today. The average temperature of the Earth ' +
      'is rising because of greenhouse gases produced by factories, cars, and power plants. This causes glaciers to ' +
      'melt, sea levels to rise, and extreme weather events to become more frequent.\n\n' +
      'Many people believe that everyone can do something to help. Simple actions like recycling, using public ' +
      'transport instead of cars, and saving electricity make a difference. In the Czech Republic, most towns have ' +
      'containers for sorting plastic, paper, and glass. Some schools organise tree-planting events and ' +
      'clean-up days in local parks.\n\n' +
      'Governments also need to take action by investing in renewable energy sources such as solar and wind power. ' +
      'Young activists like Greta Thunberg have inspired millions of students around the world to demand change. ' +
      'Protecting the environment is not just the responsibility of scientists and politicians — it is something ' +
      'every person can contribute to through daily choices.',
    questions: [
      {
        id: 'read_nature_01_q1',
        type: 'mcq',
        question: 'What causes the Earth\'s temperature to rise?',
        options: [
          'Volcanic eruptions',
          'Greenhouse gases from human activities',
          'Changes in the sun',
          'Natural weather cycles',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_nature_01_q2',
        type: 'truefalse',
        question: 'In the Czech Republic, towns have containers for sorting waste.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_nature_01_q3',
        type: 'mcq',
        question: 'Which renewable energy sources are mentioned?',
        options: [
          'Nuclear and hydro',
          'Solar and wind',
          'Biomass and geothermal',
          'Tidal and wave',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_nature_01_q4',
        type: 'mcq',
        question: 'Who inspired millions of students to demand environmental change?',
        options: ['David Attenborough', 'Greta Thunberg', 'Elon Musk', 'Jane Goodall'],
        answerIndex: 1,
      },
      {
        id: 'read_nature_01_q5',
        type: 'truefalse',
        question: 'The text says only scientists and politicians are responsible for protecting the environment.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 9. Finding a Job (B1) ───────────────────────────────────────────
  {
    id: 'read_work_01',
    title: 'Finding a Job',
    level: 'B1',
    topic: 'work',
    text:
      'Finding your first job can be both exciting and stressful. Many Czech students start working part-time ' +
      'while they are still at secondary school, usually in shops, cafés, or as tutors. A part-time job teaches ' +
      'you important skills like responsibility, time management, and communication.\n\n' +
      'When you apply for a job, you need to write a CV and sometimes a cover letter. Your CV should include your ' +
      'personal details, education, skills, and any work experience you have. It is a good idea to mention ' +
      'languages you speak — knowing English is a big advantage in the Czech job market.\n\n' +
      'If the employer likes your CV, they will invite you for an interview. Prepare by researching the company ' +
      'and thinking about answers to common questions like "Why do you want this job?" and "What are your ' +
      'strengths?" Dress neatly, arrive on time, and be polite. Even if you do not get the first job you apply for, ' +
      'do not give up. Every interview is valuable experience that helps you improve.',
    questions: [
      {
        id: 'read_work_01_q1',
        type: 'mcq',
        question: 'Where do many Czech students work part-time?',
        options: [
          'In offices and banks',
          'In shops, cafés, or as tutors',
          'In hospitals',
          'In factories',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_work_01_q2',
        type: 'truefalse',
        question: 'Knowing English is described as a big advantage in the Czech job market.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_work_01_q3',
        type: 'mcq',
        question: 'What should a CV include?',
        options: [
          'Only your name and phone number',
          'Personal details, education, skills, and work experience',
          'A photo and your hobbies',
          'Your grades from school',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_work_01_q4',
        type: 'mcq',
        question: 'How should you prepare for a job interview?',
        options: [
          'Memorise your CV word by word',
          'Research the company and prepare answers to common questions',
          'Bring a friend for support',
          'Call the employer the day before to ask what they want',
        ],
        answerIndex: 1,
      },
      {
        id: 'read_work_01_q5',
        type: 'truefalse',
        question: 'The text suggests that if you fail the first interview you should stop trying.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
    ],
  },

  // ─── 10. Living in a City vs. the Countryside (B1) ───────────────────
  {
    id: 'read_housing_01',
    title: 'Living in a City vs. the Countryside',
    level: 'B1',
    topic: 'housing',
    text:
      'There is an ongoing debate about whether it is better to live in a city or in the countryside. Both options ' +
      'have their advantages and disadvantages, and the best choice depends on individual preferences.\n\n' +
      'Cities offer more job opportunities, better public transport, and a wider range of cultural events, shops, ' +
      'and restaurants. If you enjoy going to the cinema, visiting museums, or shopping, city life is more convenient. ' +
      'However, cities can be noisy, polluted, and expensive. The cost of renting a flat in Prague, for example, ' +
      'has increased dramatically in recent years.\n\n' +
      'On the other hand, the countryside is quieter and the air is cleaner. People often have larger houses with ' +
      'gardens, and there is more space for children to play safely. Life is generally cheaper, and many people enjoy ' +
      'being closer to nature. The main disadvantage is that there are fewer services and it can be difficult to ' +
      'commute to work or school without a car.\n\n' +
      'Many young Czech people move to cities for university or work, but some dream of returning to the countryside ' +
      'when they start a family.',
    questions: [
      {
        id: 'read_housing_01_q1',
        type: 'mcq',
        question: 'What is one advantage of city life mentioned in the text?',
        options: [
          'Cleaner air',
          'Larger houses',
          'More job opportunities',
          'Lower cost of living',
        ],
        answerIndex: 2,
      },
      {
        id: 'read_housing_01_q2',
        type: 'truefalse',
        question: 'Renting a flat in Prague has become cheaper in recent years.',
        options: ['True', 'False'],
        answerIndex: 1,
      },
      {
        id: 'read_housing_01_q3',
        type: 'mcq',
        question: 'What is a disadvantage of the countryside according to the text?',
        options: [
          'There is too much noise',
          'The air is polluted',
          'There are fewer services and commuting is harder',
          'Houses are too small',
        ],
        answerIndex: 2,
      },
      {
        id: 'read_housing_01_q4',
        type: 'truefalse',
        question: 'People in the countryside often have houses with gardens.',
        options: ['True', 'False'],
        answerIndex: 0,
      },
      {
        id: 'read_housing_01_q5',
        type: 'mcq',
        question: 'Why do many young Czech people move to cities?',
        options: [
          'Because they dislike nature',
          'For university or work',
          'Because their parents make them',
          'To escape cold winters',
        ],
        answerIndex: 1,
      },
    ],
  },
];

export const READING_TEXTS: ReadingText[] = [
  ...READING_TEXTS_BASE,
  ...READING_TEXTS_EXTRA1,
  ...READING_TEXTS_EXTRA2,
];

export const READING_BY_LEVEL = (level: string) =>
  READING_TEXTS.filter(t => t.level === level);

export const READING_BY_TOPIC = (topic: string) =>
  READING_TEXTS.filter(t => t.topic === topic);
