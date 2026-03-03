import type { VocabWord } from '../types';
import { NGSL_CHUNK1 } from './ngsl_chunk1';
import { NGSL_CHUNK2 } from './ngsl_chunk2';
import { NGSL_CHUNK3 } from './ngsl_chunk3';
import { NGSL_CHUNK4 } from './ngsl_chunk4';
import { VOCAB_EXAMPLES } from './vocabExamples';

type Pos = VocabWord['partOfSpeech'];

const w = (
  en: string, cs: string, pos: Pos, band: VocabWord['band'],
  topics: string[], example: string, exampleCs: string,
): VocabWord => ({
  id: `v-${en.toLowerCase().replace(/[\s/]+/g, '-')}`,
  en, cs, example, exampleCs, band, topics, partOfSpeech: pos,
});

// ──────────────────────────────────────────────────────────────────────
// RICH ENTRIES - curated words with examples (subset with full data)
// ──────────────────────────────────────────────────────────────────────
const RICH_ENTRIES: VocabWord[] = [
  // ─── Core Verbs ────────────────────────────────────────────────────
  w('be', 'být', 'verb', 1, ['daily'], 'I am happy today.', 'Dnes jsem šťastný.'),
  w('have', 'mít', 'verb', 1, ['daily'], 'I have two sisters.', 'Mám dvě sestry.'),
  w('do', 'dělat', 'verb', 1, ['daily', 'work'], 'What do you do?', 'Co děláš?'),
  w('go', 'jít / jet', 'verb', 1, ['travel', 'daily'], 'We go to school every day.', 'Chodíme do školy každý den.'),
  w('come', 'přijít', 'verb', 1, ['daily'], 'Come here, please.', 'Pojď sem, prosím.'),
  w('take', 'vzít', 'verb', 1, ['daily'], 'Take your bag.', 'Vezmi si tašku.'),
  w('make', 'udělat / vyrobit', 'verb', 1, ['daily', 'work'], 'She makes breakfast every morning.', 'Každé ráno připravuje snídani.'),
  w('see', 'vidět', 'verb', 1, ['daily'], 'I can see the mountains.', 'Vidím hory.'),
  w('know', 'vědět / znát', 'verb', 1, ['daily'], 'I know the answer.', 'Znám odpověď.'),
  w('think', 'myslet', 'verb', 1, ['daily'], 'I think it is a good idea.', 'Myslím, že je to dobrý nápad.'),
  w('get', 'dostat / získat', 'verb', 1, ['daily'], 'I get up at seven.', 'Vstávám v sedm.'),
  w('want', 'chtít', 'verb', 1, ['daily', 'shopping'], 'I want a glass of water.', 'Chci sklenici vody.'),
  w('say', 'říct', 'verb', 1, ['daily'], 'What did you say?', 'Co jsi řekl?'),
  w('use', 'používat', 'verb', 1, ['daily', 'media'], 'I use my phone every day.', 'Používám telefon každý den.'),
  w('give', 'dát', 'verb', 1, ['daily'], 'Give me the book, please.', 'Dej mi tu knihu, prosím.'),
  w('find', 'najít', 'verb', 1, ['daily'], 'I cannot find my keys.', 'Nemůžu najít klíče.'),
  w('tell', 'říct / vyprávět', 'verb', 1, ['daily'], 'Tell me about your day.', 'Řekni mi o svém dni.'),
  w('ask', 'zeptat se', 'verb', 1, ['daily', 'education'], 'Can I ask a question?', 'Mohu položit otázku?'),
  w('work', 'pracovat', 'verb', 1, ['work', 'daily'], 'I work in an office.', 'Pracuji v kanceláři.'),
  w('try', 'zkusit', 'verb', 1, ['daily'], 'Try this cake!', 'Zkus tento dort!'),
  w('need', 'potřebovat', 'verb', 1, ['daily'], 'I need your help.', 'Potřebuji tvoji pomoc.'),
  w('feel', 'cítit (se)', 'verb', 1, ['health', 'daily'], 'I feel tired today.', 'Dnes se cítím unavený.'),
  w('leave', 'odejít / opustit', 'verb', 1, ['travel', 'daily'], 'I leave home at eight.', 'Odcházím z domu v osm.'),
  w('put', 'položit / dát', 'verb', 1, ['daily'], 'Put it on the table.', 'Polož to na stůl.'),
  w('mean', 'znamenat', 'verb', 1, ['daily'], 'What does this word mean?', 'Co znamená toto slovo?'),
  w('keep', 'nechat si / udržovat', 'verb', 1, ['daily'], 'Keep the change.', 'Nechte si drobné.'),
  w('let', 'nechat / dovolit', 'verb', 1, ['daily'], 'Let me help you.', 'Nech mě ti pomoct.'),
  w('begin', 'začít', 'verb', 1, ['daily'], 'The movie begins at eight.', 'Film začíná v osm.'),
  w('show', 'ukázat', 'verb', 1, ['daily'], 'Can you show me the way?', 'Můžeš mi ukázat cestu?'),
  w('hear', 'slyšet', 'verb', 1, ['daily'], 'I can hear music.', 'Slyším hudbu.'),
  w('play', 'hrát', 'verb', 1, ['freetime', 'sports'], 'Do you play any instrument?', 'Hraješ na nějaký nástroj?'),
  w('run', 'běžet', 'verb', 1, ['sports', 'daily'], 'She runs every morning.', 'Každé ráno běhá.'),
  w('move', 'pohnout se / přestěhovat se', 'verb', 1, ['housing', 'daily'], 'We moved to a new house.', 'Přestěhovali jsme se do nového domu.'),
  w('live', 'žít / bydlet', 'verb', 1, ['housing', 'daily'], 'I live in Prague.', 'Bydlím v Praze.'),
  w('believe', 'věřit', 'verb', 1, ['daily'], 'I believe you.', 'Věřím ti.'),
  w('bring', 'přinést', 'verb', 1, ['daily'], 'Bring your friends!', 'Přiveď kamarády!'),
  w('happen', 'stát se', 'verb', 1, ['daily'], 'What happened yesterday?', 'Co se stalo včera?'),
  w('write', 'psát', 'verb', 1, ['education', 'daily'], 'Write your name here.', 'Napiš sem své jméno.'),
  w('learn', 'učit se', 'verb', 1, ['education'], 'I am learning English.', 'Učím se anglicky.'),
  w('read', 'číst', 'verb', 1, ['education', 'freetime'], 'I read books every day.', 'Každý den čtu knihy.'),
  w('buy', 'koupit', 'verb', 1, ['shopping'], 'I want to buy a new phone.', 'Chci si koupit nový telefon.'),
  w('eat', 'jíst', 'verb', 1, ['food'], 'We eat dinner at six.', 'Večeříme v šest.'),
  w('drink', 'pít', 'verb', 2, ['food'], 'I drink coffee in the morning.', 'Ráno piji kávu.'),
  w('cook', 'vařit', 'verb', 2, ['food'], 'My mother cooks very well.', 'Moje máma výborně vaří.'),
  w('sleep', 'spát', 'verb', 2, ['health', 'daily'], 'I sleep eight hours a night.', 'Spím osm hodin denně.'),
  w('speak', 'mluvit', 'verb', 1, ['education', 'daily'], 'Do you speak English?', 'Mluvíš anglicky?'),
  w('walk', 'chodit / procházet se', 'verb', 1, ['travel', 'sports'], 'I walk to school.', 'Chodím pěšky do školy.'),
  w('drive', 'řídit', 'verb', 1, ['travel'], 'Can you drive a car?', 'Umíš řídit auto?'),
  w('pay', 'platit', 'verb', 1, ['shopping'], 'Can I pay by card?', 'Mohu platit kartou?'),
  w('send', 'poslat', 'verb', 1, ['media', 'daily'], 'Send me a message.', 'Pošli mi zprávu.'),
  w('open', 'otevřít', 'verb', 1, ['daily'], 'Open the window, please.', 'Otevři okno, prosím.'),
  w('close', 'zavřít', 'verb', 1, ['daily'], 'Close the door.', 'Zavři dveře.'),
  w('watch', 'sledovat / dívat se', 'verb', 1, ['freetime', 'media'], 'I watch TV in the evening.', 'Večer se dívám na televizi.'),
  w('wait', 'čekat', 'verb', 1, ['daily'], 'Wait for me!', 'Počkej na mě!'),
  w('help', 'pomáhat', 'verb', 1, ['daily'], 'Can you help me?', 'Můžeš mi pomoci?'),
  w('love', 'milovat', 'verb', 1, ['family'], 'I love my family.', 'Miluji svou rodinu.'),
  w('like', 'mít rád', 'verb', 1, ['daily'], 'I like chocolate.', 'Mám rád čokoládu.'),

  // ─── Core Nouns ────────────────────────────────────────────────────
  w('time', 'čas', 'noun', 1, ['daily'], 'What time is it?', 'Kolik je hodin?'),
  w('year', 'rok', 'noun', 1, ['daily'], 'I am eighteen years old.', 'Je mi osmnáct let.'),
  w('people', 'lidé', 'noun', 1, ['culture'], 'Many people live here.', 'Bydlí tu hodně lidí.'),
  w('day', 'den', 'noun', 1, ['daily'], 'Have a nice day!', 'Měj hezký den!'),
  w('man', 'muž', 'noun', 1, ['family'], 'The man is tall.', 'Ten muž je vysoký.'),
  w('woman', 'žena', 'noun', 1, ['family'], 'The woman is a doctor.', 'Ta žena je doktorka.'),
  w('child', 'dítě', 'noun', 1, ['family'], 'The child is playing.', 'Dítě si hraje.'),
  w('world', 'svět', 'noun', 1, ['nature', 'culture'], 'It is the biggest city in the world.', 'Je to největší město na světě.'),
  w('life', 'život', 'noun', 1, ['daily'], 'Life is beautiful.', 'Život je krásný.'),
  w('hand', 'ruka', 'noun', 1, ['health'], 'Wash your hands.', 'Umyj si ruce.'),
  w('place', 'místo', 'noun', 1, ['travel'], 'This is a nice place.', 'Tohle je hezké místo.'),
  w('week', 'týden', 'noun', 1, ['daily'], 'See you next week.', 'Uvidíme se příští týden.'),
  w('home', 'domov', 'noun', 1, ['housing'], 'I am going home.', 'Jdu domů.'),
  w('house', 'dům', 'noun', 1, ['housing'], 'They live in a big house.', 'Bydlí ve velkém domě.'),
  w('school', 'škola', 'noun', 1, ['education'], 'I go to school by bus.', 'Do školy jezdím autobusem.'),
  w('country', 'země / stát', 'noun', 1, ['travel', 'culture'], 'Czech Republic is a small country.', 'Česká republika je malá země.'),
  w('book', 'kniha', 'noun', 1, ['education', 'freetime'], 'I am reading a good book.', 'Čtu dobrou knihu.'),
  w('family', 'rodina', 'noun', 1, ['family'], 'My family is not very big.', 'Moje rodina není moc velká.'),
  w('friend', 'přítel / kamarád', 'noun', 1, ['family', 'freetime'], 'She is my best friend.', 'Je to moje nejlepší kamarádka.'),
  w('money', 'peníze', 'noun', 1, ['shopping', 'work'], 'I do not have enough money.', 'Nemám dost peněz.'),
  w('head', 'hlava', 'noun', 1, ['health'], 'My head hurts.', 'Bolí mě hlava.'),
  w('car', 'auto', 'noun', 1, ['travel'], 'He drives a red car.', 'Řídí červené auto.'),
  w('room', 'pokoj / místnost', 'noun', 1, ['housing'], 'My room is small but cozy.', 'Můj pokoj je malý, ale útulný.'),
  w('water', 'voda', 'noun', 1, ['food', 'nature'], 'Can I have some water?', 'Mohu dostat vodu?'),
  w('mother', 'matka / máma', 'noun', 1, ['family'], 'My mother works at a hospital.', 'Moje máma pracuje v nemocnici.'),
  w('father', 'otec / táta', 'noun', 1, ['family'], 'My father likes fishing.', 'Můj táta rád rybaří.'),
  w('food', 'jídlo', 'noun', 1, ['food'], 'The food is delicious.', 'Jídlo je výborné.'),
  w('eye', 'oko', 'noun', 1, ['health'], 'She has blue eyes.', 'Má modré oči.'),
  w('city', 'město', 'noun', 1, ['housing', 'travel'], 'Prague is a beautiful city.', 'Praha je krásné město.'),
  w('night', 'noc', 'noun', 1, ['daily'], 'Good night!', 'Dobrou noc!'),
  w('morning', 'ráno', 'noun', 1, ['daily'], 'I wake up early in the morning.', 'Ráno vstávám brzy.'),
  w('student', 'student', 'noun', 1, ['education'], 'She is a good student.', 'Je to dobrá studentka.'),
  w('job', 'práce / zaměstnání', 'noun', 1, ['work'], 'I am looking for a new job.', 'Hledám novou práci.'),
  w('hour', 'hodina', 'noun', 1, ['daily'], 'The lesson lasts one hour.', 'Lekce trvá jednu hodinu.'),
  w('door', 'dveře', 'noun', 2, ['housing'], 'Please close the door.', 'Prosím, zavřete dveře.'),
  w('street', 'ulice', 'noun', 2, ['travel', 'housing'], 'I live on Main Street.', 'Bydlím na Hlavní ulici.'),
  w('story', 'příběh', 'noun', 1, ['culture', 'freetime'], 'Tell me a story.', 'Vyprávěj mi příběh.'),

  // ─── Education & School ────────────────────────────────────────────
  w('teacher', 'učitel', 'noun', 2, ['education'], 'Our teacher is very nice.', 'Náš učitel je velmi milý.'),
  w('lesson', 'lekce / hodina', 'noun', 2, ['education'], 'We have six lessons a day.', 'Máme šest hodin denně.'),
  w('homework', 'domácí úkol', 'noun', 2, ['education'], 'I forgot to do my homework.', 'Zapomněl jsem udělat domácí úkol.'),
  w('exam', 'zkouška', 'noun', 2, ['education'], 'The exam was very difficult.', 'Zkouška byla velmi těžká.'),
  w('subject', 'předmět', 'noun', 1, ['education'], 'What is your favourite subject?', 'Jaký je tvůj oblíbený předmět?'),
  w('classroom', 'učebna / třída', 'noun', 2, ['education'], 'Our classroom is on the second floor.', 'Naše učebna je ve druhém patře.'),
  w('university', 'univerzita', 'noun', 2, ['education'], 'She studies at university.', 'Studuje na univerzitě.'),
  w('grade', 'známka / ročník', 'noun', 2, ['education'], 'I got a good grade in English.', 'Dostal jsem dobrou známku z angličtiny.'),

  // ─── Travel & Transport ────────────────────────────────────────────
  w('airport', 'letiště', 'noun', 2, ['travel'], 'The airport is far from the city.', 'Letiště je daleko od města.'),
  w('ticket', 'lístek / jízdenka', 'noun', 2, ['travel'], 'I bought a train ticket.', 'Koupil jsem jízdenku na vlak.'),
  w('luggage', 'zavazadla', 'noun', 2, ['travel'], 'My luggage is very heavy.', 'Moje zavazadla jsou velmi těžká.'),
  w('passport', 'cestovní pas', 'noun', 2, ['travel'], 'Do not forget your passport.', 'Nezapomeň cestovní pas.'),
  w('hotel', 'hotel', 'noun', 2, ['travel'], 'We stayed at a nice hotel.', 'Bydleli jsme v pěkném hotelu.'),
  w('bus', 'autobus', 'noun', 2, ['travel'], 'The bus leaves at nine.', 'Autobus odjíždí v devět.'),
  w('train', 'vlak', 'noun', 1, ['travel'], 'I take the train to work.', 'Do práce jezdím vlakem.'),
  w('flight', 'let', 'noun', 2, ['travel'], 'The flight takes two hours.', 'Let trvá dvě hodiny.'),
  w('map', 'mapa', 'noun', 2, ['travel'], 'Can you show me on the map?', 'Můžeš mi ukázat na mapě?'),

  // ─── Health ────────────────────────────────────────────────────────
  w('doctor', 'doktor / lékař', 'noun', 2, ['health'], 'I need to see a doctor.', 'Potřebuji jít k doktorovi.'),
  w('medicine', 'lék / medicína', 'noun', 2, ['health'], 'Take this medicine three times a day.', 'Berte tento lék třikrát denně.'),
  w('hospital', 'nemocnice', 'noun', 2, ['health'], 'He was taken to hospital.', 'Odvezli ho do nemocnice.'),
  w('headache', 'bolest hlavy', 'noun', 2, ['health'], 'I have a terrible headache.', 'Strašně mě bolí hlava.'),
  w('temperature', 'teplota', 'noun', 2, ['health', 'weather'], 'I have a high temperature.', 'Mám vysokou teplotu.'),

  // ─── Food & Drink ─────────────────────────────────────────────────
  w('breakfast', 'snídaně', 'noun', 2, ['food', 'daily'], 'I have breakfast at seven.', 'Snídám v sedm.'),
  w('lunch', 'oběd', 'noun', 2, ['food', 'daily'], 'What did you have for lunch?', 'Co jsi měl k obědu?'),
  w('dinner', 'večeře', 'noun', 2, ['food', 'daily'], 'Dinner is ready!', 'Večeře je hotová!'),
  w('restaurant', 'restaurace', 'noun', 2, ['food', 'travel'], 'Let us go to a restaurant.', 'Pojďme do restaurace.'),
  w('meal', 'jídlo / pokrm', 'noun', 2, ['food'], 'This was a delicious meal.', 'To bylo výborné jídlo.'),

  // ─── Weather ──────────────────────────────────────────────────────
  w('weather', 'počasí', 'noun', 2, ['weather'], 'What is the weather like today?', 'Jaké je dnes počasí?'),
  w('rain', 'déšť', 'noun', 2, ['weather', 'nature'], 'It is raining outside.', 'Venku prší.'),
  w('snow', 'sníh', 'noun', 2, ['weather', 'nature'], 'Children love playing in the snow.', 'Děti si rády hrají ve sněhu.'),
  w('sun', 'slunce', 'noun', 2, ['weather', 'nature'], 'The sun is shining.', 'Slunce svítí.'),

  // ─── Core Adjectives ──────────────────────────────────────────────
  w('good', 'dobrý', 'adjective', 1, ['daily'], 'That is a good idea.', 'To je dobrý nápad.'),
  w('new', 'nový', 'adjective', 1, ['daily'], 'I bought a new phone.', 'Koupil jsem si nový telefon.'),
  w('old', 'starý', 'adjective', 1, ['daily'], 'My grandmother is very old.', 'Moje babička je velmi stará.'),
  w('big', 'velký', 'adjective', 1, ['daily'], 'We have a big garden.', 'Máme velkou zahradu.'),
  w('small', 'malý', 'adjective', 1, ['daily'], 'I live in a small town.', 'Bydlím v malém městě.'),
  w('long', 'dlouhý', 'adjective', 1, ['daily'], 'It was a long day.', 'Byl to dlouhý den.'),
  w('great', 'skvělý / velký', 'adjective', 1, ['daily'], 'That is great news!', 'To je skvělá zpráva!'),
  w('different', 'jiný / odlišný', 'adjective', 1, ['daily'], 'We have different opinions.', 'Máme odlišné názory.'),
  w('important', 'důležitý', 'adjective', 1, ['daily', 'work'], 'This is very important.', 'To je velmi důležité.'),
  w('young', 'mladý', 'adjective', 1, ['daily'], 'She is too young to drive.', 'Je příliš mladá na řízení.'),
  w('bad', 'špatný', 'adjective', 1, ['daily'], 'I had a bad dream.', 'Měl jsem špatný sen.'),
  w('high', 'vysoký', 'adjective', 1, ['daily'], 'The mountain is very high.', 'Hora je velmi vysoká.'),
  w('happy', 'šťastný', 'adjective', 2, ['daily'], 'I am very happy today.', 'Dnes jsem velmi šťastný.'),
  w('beautiful', 'krásný', 'adjective', 2, ['daily'], 'What a beautiful day!', 'Jaký krásný den!'),
  w('difficult', 'obtížný / těžký', 'adjective', 2, ['education'], 'The test was very difficult.', 'Test byl velmi obtížný.'),
  w('easy', 'snadný / lehký', 'adjective', 1, ['daily'], 'This exercise is easy.', 'Toto cvičení je snadné.'),
  w('cheap', 'levný', 'adjective', 2, ['shopping'], 'This shop is very cheap.', 'Tento obchod je velmi levný.'),
  w('expensive', 'drahý', 'adjective', 2, ['shopping'], 'The hotel was too expensive.', 'Hotel byl příliš drahý.'),
  w('healthy', 'zdravý', 'adjective', 2, ['health', 'food'], 'Fruit and vegetables are healthy.', 'Ovoce a zelenina jsou zdravé.'),
  w('dangerous', 'nebezpečný', 'adjective', 2, ['daily'], 'Swimming here is dangerous.', 'Koupání tady je nebezpečné.'),
  w('interesting', 'zajímavý', 'adjective', 2, ['education', 'freetime'], 'The book was very interesting.', 'Kniha byla velmi zajímavá.'),
  w('possible', 'možný', 'adjective', 1, ['daily'], 'Is it possible to change the date?', 'Je možné změnit datum?'),

  // ─── Key Adverbs & Connectors ─────────────────────────────────────
  w('always', 'vždy', 'adverb', 1, ['daily'], 'I always wake up early.', 'Vždy vstávám brzy.'),
  w('never', 'nikdy', 'adverb', 1, ['daily'], 'I have never been to London.', 'Nikdy jsem nebyl v Londýně.'),
  w('sometimes', 'někdy', 'adverb', 1, ['daily'], 'I sometimes go to the cinema.', 'Někdy chodím do kina.'),
  w('often', 'často', 'adverb', 1, ['daily'], 'I often read before bed.', 'Často čtu před spaním.'),
  w('usually', 'obvykle', 'adverb', 2, ['daily'], 'I usually have tea for breakfast.', 'Obvykle snídám čaj.'),
  w('already', 'už / již', 'adverb', 1, ['daily'], 'I have already finished.', 'Už jsem dokončil.'),
  w('still', 'stále / pořád', 'adverb', 1, ['daily'], 'Are you still here?', 'Jsi tu pořád?'),
  w('again', 'znovu / opět', 'adverb', 1, ['daily'], 'Say it again, please.', 'Řekni to znovu, prosím.'),
  w('together', 'spolu / dohromady', 'adverb', 1, ['family', 'daily'], 'Let us go together.', 'Pojďme spolu.'),
  w('because', 'protože', 'conjunction', 1, ['daily'], 'I stayed home because I was sick.', 'Zůstal jsem doma, protože jsem byl nemocný.'),
  w('however', 'nicméně / ovšem', 'adverb', 1, ['education'], 'It was raining. However, we went out.', 'Pršelo. Nicméně jsme šli ven.'),
  w('although', 'ačkoliv / i když', 'conjunction', 1, ['education'], 'Although it was late, I was not tired.', 'Ačkoliv bylo pozdě, nebyl jsem unavený.'),
  w('therefore', 'proto / tudíž', 'adverb', 2, ['education'], 'He studied hard, therefore he passed.', 'Pilně se učil, proto prošel.'),
  w('especially', 'zvláště / obzvlášť', 'adverb', 2, ['daily'], 'I love animals, especially dogs.', 'Miluji zvířata, obzvlášť psy.'),
  w('actually', 'vlastně / ve skutečnosti', 'adverb', 1, ['daily'], 'Actually, I changed my mind.', 'Vlastně jsem si to rozmyslel.'),
  w('probably', 'pravděpodobně / asi', 'adverb', 1, ['daily'], 'It will probably rain tomorrow.', 'Zítra asi bude pršet.'),
  w('perhaps', 'možná / snad', 'adverb', 1, ['daily'], 'Perhaps we should go home.', 'Možná bychom měli jít domů.'),

  // ─── B1 abstract / academic ───────────────────────────────────────
  w('advantage', 'výhoda', 'noun', 3, ['education', 'work'], 'The main advantage is the price.', 'Hlavní výhodou je cena.'),
  w('disadvantage', 'nevýhoda', 'noun', 3, ['education', 'work'], 'One disadvantage is the distance.', 'Jednou nevýhodou je vzdálenost.'),
  w('environment', 'životní prostředí', 'noun', 3, ['nature'], 'We must protect the environment.', 'Musíme chránit životní prostředí.'),
  w('pollution', 'znečištění', 'noun', 3, ['nature'], 'Air pollution is a big problem.', 'Znečištění ovzduší je velký problém.'),
  w('technology', 'technologie', 'noun', 2, ['media'], 'Technology changes very fast.', 'Technologie se mění velmi rychle.'),
  w('experience', 'zkušenost / zážitek', 'noun', 1, ['work', 'education'], 'It was an amazing experience.', 'Byl to úžasný zážitek.'),
  w('opportunity', 'příležitost', 'noun', 2, ['work'], 'This is a great opportunity.', 'Toto je skvělá příležitost.'),
  w('decision', 'rozhodnutí', 'noun', 1, ['daily'], 'It was a difficult decision.', 'Bylo to těžké rozhodnutí.'),
  w('suggestion', 'návrh / doporučení', 'noun', 3, ['daily'], 'Do you have any suggestions?', 'Máte nějaké návrhy?'),
  w('improvement', 'zlepšení', 'noun', 3, ['education'], 'There is room for improvement.', 'Je prostor pro zlepšení.'),
  w('immediately', 'okamžitě / ihned', 'adverb', 2, ['daily'], 'Call the doctor immediately.', 'Zavolejte lékaře okamžitě.'),
  w('unfortunately', 'bohužel', 'adverb', 3, ['daily'], 'Unfortunately, the shop is closed.', 'Bohužel, obchod je zavřený.'),
  w('recently', 'nedávno', 'adverb', 2, ['daily'], 'I recently started a new job.', 'Nedávno jsem začal novou práci.'),
  w('definitely', 'určitě / rozhodně', 'adverb', 2, ['daily'], 'I will definitely come.', 'Určitě přijdu.'),
  w('despite', 'navzdory / i přes', 'preposition', 2, ['education'], 'Despite the rain, we had fun.', 'Navzdory dešti jsme se bavili.'),
  w('furthermore', 'navíc / kromě toho', 'adverb', 3, ['education'], 'The hotel is cheap. Furthermore, it is near the beach.', 'Hotel je levný. Navíc je blízko pláže.'),
  w('meanwhile', 'mezitím', 'adverb', 3, ['daily'], 'Meanwhile, I will prepare dinner.', 'Mezitím připravím večeři.'),
  w('nevertheless', 'přesto / nicméně', 'adverb', 3, ['education'], 'It was difficult. Nevertheless, she did not give up.', 'Bylo to obtížné. Přesto se nevzdala.'),
];

// ──────────────────────────────────────────────────────────────────────
// NGSL COMPACT ENTRIES — auto-generated from NGSL-GR wordlist
// Band assignment: chunk1 (ranks 1-~700) = band 1,
//                  chunk2 (ranks ~701-1500) = band 2,
//                  chunk3+4 (ranks ~1501-2800) = band 3
// ──────────────────────────────────────────────────────────────────────

function compactToVocab(
  entries: [string, string, string][],
  band: VocabWord['band'],
  startRank: number,
): VocabWord[] {
  return entries.map(([en, cs, pos], i) => ({
    id: `ngsl-${startRank + i}`,
    en,
    cs,
    example: '',
    exampleCs: '',
    band,
    topics: [],
    partOfSpeech: pos as Pos,
  }));
}

const richSet = new Set(RICH_ENTRIES.map((w) => w.en.toLowerCase()));

const ngslCompact = [
  ...compactToVocab(NGSL_CHUNK1, 1, 1),
  ...compactToVocab(NGSL_CHUNK2, 2, 701),
  ...compactToVocab(NGSL_CHUNK3, 3, 1501),
  ...compactToVocab(NGSL_CHUNK4, 3, 2101),
].filter((w) => !richSet.has(w.en.toLowerCase())).map((w) => {
  const ex = VOCAB_EXAMPLES[w.en.toLowerCase()];
  if (ex) return { ...w, example: ex.example, exampleCs: ex.exampleCs };
  return w;
});

export const VOCABULARY: VocabWord[] = [...RICH_ENTRIES, ...ngslCompact];

export const VOCAB_BY_BAND = {
  1: VOCABULARY.filter((w) => w.band === 1),
  2: VOCABULARY.filter((w) => w.band === 2),
  3: VOCABULARY.filter((w) => w.band === 3),
};

export const VOCAB_BY_TOPIC = (topicId: string) =>
  VOCABULARY.filter((w) => w.topics.includes(topicId));

export const WORD_OF_THE_DAY = (): VocabWord => {
  const rich = VOCABULARY.filter((w) => w.example !== '');
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return rich[dayOfYear % rich.length];
};
