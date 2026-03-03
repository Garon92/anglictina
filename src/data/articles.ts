export interface ArticleExercise {
  id: string;
  sentence: string;
  gaps: ArticleGap[];
  explanationCs: string;
  rule: string;
  level: 'A1' | 'A2' | 'B1';
}

export interface ArticleGap {
  answer: 'a' | 'an' | 'the' | '-';
  position: number;
}

export const ARTICLE_EXERCISES: ArticleExercise[] = [
  // ===== first_mention (art_01 – art_10) =====
  {
    id: 'art_01',
    sentence: 'I have ___ cat at home.',
    gaps: [{ answer: 'a', position: 0 }],
    explanationCs: 'Kočku zmiňujeme poprvé a posluchač o ní neví – použijeme neurčitý člen „a".',
    rule: 'first_mention',
    level: 'A1',
  },
  {
    id: 'art_02',
    sentence: 'There is ___ apple on the table.',
    gaps: [{ answer: 'an', position: 0 }],
    explanationCs: 'Jablko zmiňujeme poprvé a začíná na samohlásku – použijeme „an".',
    rule: 'first_mention',
    level: 'A1',
  },
  {
    id: 'art_03',
    sentence: 'I have ___ dog. ___ dog is brown.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Psa zmiňujeme poprvé → „a". Ve druhé větě už o něm víme → „the".',
    rule: 'first_mention',
    level: 'A1',
  },
  {
    id: 'art_04',
    sentence: 'She found ___ key in ___ garden.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Klíč je zmíněn poprvé → „a". Zahrada je známá z kontextu (její zahrada) → „the".',
    rule: 'first_mention',
    level: 'A2',
  },
  {
    id: 'art_05',
    sentence: 'I saw ___ interesting film yesterday. ___ film was about robots.',
    gaps: [
      { answer: 'an', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Film zmiňujeme poprvé (a „interesting" začíná na samohlásku) → „an". Ve druhé větě je známý → „the".',
    rule: 'first_mention',
    level: 'A2',
  },
  {
    id: 'art_06',
    sentence: 'There was ___ strange noise outside. ___ noise woke everyone up.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Zvuk zmiňujeme poprvé → „a". Vzápětí už je známý → „the".',
    rule: 'first_mention',
    level: 'A2',
  },
  {
    id: 'art_07',
    sentence: 'He bought ___ new car. ___ car is very fast.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Auto zmiňujeme poprvé → „a". Ve druhé větě o něm už víme → „the".',
    rule: 'first_mention',
    level: 'A2',
  },
  {
    id: 'art_08',
    sentence: 'I spoke to ___ woman at ___ reception. ___ woman told me to wait.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'the', position: 1 },
      { answer: 'the', position: 2 },
    ],
    explanationCs: 'Ženu zmiňujeme poprvé → „a". Recepce je známá z kontextu → „the". Ve třetí mezeře ženu již známe → „the".',
    rule: 'first_mention',
    level: 'B1',
  },
  {
    id: 'art_09',
    sentence: 'She adopted ___ dog from ___ shelter. ___ dog is very friendly.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'a', position: 1 },
      { answer: 'the', position: 2 },
    ],
    explanationCs: 'Pes i útulek jsou zmíněny poprvé → „a", „a". Ve třetí mezeře psa již známe → „the".',
    rule: 'first_mention',
    level: 'B1',
  },
  {
    id: 'art_10',
    sentence: 'There is ___ problem with ___ plan you suggested.',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Problém zmiňujeme poprvé → „a". Plán je známý (ten, co jsi navrhl) → „the".',
    rule: 'first_mention',
    level: 'B1',
  },

  // ===== unique (art_11 – art_20) =====
  {
    id: 'art_11',
    sentence: '___ sun is shining today.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Slunce je jedinečné – existuje jen jedno. Proto vždy „the sun".',
    rule: 'unique',
    level: 'A1',
  },
  {
    id: 'art_12',
    sentence: '___ moon is beautiful tonight.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Měsíc je jedinečný – máme jen jeden. Proto „the moon".',
    rule: 'unique',
    level: 'A1',
  },
  {
    id: 'art_13',
    sentence: '___ sky is blue and clear.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Obloha je jedinečná – všichni vidíme tu samou. Proto „the sky".',
    rule: 'unique',
    level: 'A1',
  },
  {
    id: 'art_14',
    sentence: 'She is ___ tallest girl in ___ class.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Superlativ „tallest" označuje jedinečnou osobu → „the". Třída je známá z kontextu → „the".',
    rule: 'unique',
    level: 'A2',
  },
  {
    id: 'art_15',
    sentence: 'This is ___ best restaurant in ___ city.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Superlativ „best" označuje jedinečný podnik → „the". Město je známé → „the".',
    rule: 'unique',
    level: 'A2',
  },
  {
    id: 'art_16',
    sentence: '___ president will give ___ speech tonight.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'a', position: 1 },
    ],
    explanationCs: 'Prezident je v daném kontextu jedinečný → „the". Projev je zmíněn poprvé → „a".',
    rule: 'unique',
    level: 'A2',
  },
  {
    id: 'art_17',
    sentence: 'Where is ___ nearest bus stop?',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Superlativ „nearest" určuje jedinou zastávku → „the".',
    rule: 'unique',
    level: 'A2',
  },
  {
    id: 'art_18',
    sentence: '___ Internet has changed ___ way we communicate.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Internet je jedinečný pojem → „the". „Way" je upřesněn vedlejší větou → „the".',
    rule: 'unique',
    level: 'B1',
  },
  {
    id: 'art_19',
    sentence: 'He is ___ only person who knows ___ truth.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: '„Only" označuje jedinou osobu → „the". Pravda je z kontextu známá → „the".',
    rule: 'unique',
    level: 'B1',
  },
  {
    id: 'art_20',
    sentence: '___ government announced ___ new policy on ___ environment.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'a', position: 1 },
      { answer: 'the', position: 2 },
    ],
    explanationCs: 'Vláda je v dané zemi jedinečná → „the". Politika je nová, poprvé zmíněná → „a". Životní prostředí je jedinečný pojem → „the".',
    rule: 'unique',
    level: 'B1',
  },

  // ===== zero_general (art_21 – art_30) =====
  {
    id: 'art_21',
    sentence: 'I like ___ music.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Mluvíme o hudbě obecně, ne o konkrétní skladbě → nulový člen.',
    rule: 'zero_general',
    level: 'A1',
  },
  {
    id: 'art_22',
    sentence: '___ dogs are friendly animals.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Mluvíme o psech obecně (celá kategorie) → nulový člen.',
    rule: 'zero_general',
    level: 'A1',
  },
  {
    id: 'art_23',
    sentence: '___ water is important for life.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Voda jako obecný pojem (nepočitatelné podstatné jméno) → nulový člen.',
    rule: 'zero_general',
    level: 'A1',
  },
  {
    id: 'art_24',
    sentence: '___ love is ___ beautiful thing.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'a', position: 1 },
    ],
    explanationCs: 'Láska obecně → nulový člen. „Beautiful thing" je počitatelné a poprvé zmíněné → „a".',
    rule: 'zero_general',
    level: 'A2',
  },
  {
    id: 'art_25',
    sentence: 'I enjoy ___ swimming and ___ reading.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: 'Plavání a čtení jsou obecné činnosti → nulový člen u obou.',
    rule: 'zero_general',
    level: 'A2',
  },
  {
    id: 'art_26',
    sentence: '___ children need ___ education.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: 'Děti obecně a vzdělání jako obecný pojem → nulový člen u obou.',
    rule: 'zero_general',
    level: 'A2',
  },
  {
    id: 'art_27',
    sentence: '___ history is my favourite subject.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Dějepis jako školní předmět / obecný obor → nulový člen.',
    rule: 'zero_general',
    level: 'A2',
  },
  {
    id: 'art_28',
    sentence: '___ patience is ___ virtue.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'a', position: 1 },
    ],
    explanationCs: 'Trpělivost obecně → nulový člen. Ctnost je počitatelná a poprvé zmíněná → „a".',
    rule: 'zero_general',
    level: 'B1',
  },
  {
    id: 'art_29',
    sentence: '___ life without ___ friends would be boring.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: 'Život obecně → nulový člen. Přátelé obecně (množné číslo) → nulový člen.',
    rule: 'zero_general',
    level: 'B1',
  },
  {
    id: 'art_30',
    sentence: 'In general, ___ people prefer ___ peace to ___ war.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
      { answer: '-', position: 2 },
    ],
    explanationCs: 'Lidé, mír i válka jsou zde obecné pojmy → nulový člen u všech tří.',
    rule: 'zero_general',
    level: 'B1',
  },

  // ===== zero_meals (art_31 – art_40) =====
  {
    id: 'art_31',
    sentence: 'I have ___ breakfast at seven o\'clock.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Názvy jídel se používají bez členu: „have breakfast".',
    rule: 'zero_meals',
    level: 'A1',
  },
  {
    id: 'art_32',
    sentence: 'She plays ___ tennis every Saturday.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Sporty se používají bez členu: „play tennis".',
    rule: 'zero_meals',
    level: 'A1',
  },
  {
    id: 'art_33',
    sentence: 'We go to ___ bed at ten o\'clock.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Ustálené spojení „go to bed" se používá bez členu.',
    rule: 'zero_meals',
    level: 'A1',
  },
  {
    id: 'art_34',
    sentence: 'He plays ___ football after ___ school.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: 'Sport bez členu: „play football". Škola jako běžná činnost: „after school" bez členu.',
    rule: 'zero_meals',
    level: 'A2',
  },
  {
    id: 'art_35',
    sentence: 'What did you have for ___ lunch?',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Jídlo v ustáleném spojení „for lunch" → nulový člen.',
    rule: 'zero_meals',
    level: 'A2',
  },
  {
    id: 'art_36',
    sentence: 'He goes jogging at ___ night.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„At night" je ustálené spojení bez členu (ale pozor: „in the morning").',
    rule: 'zero_meals',
    level: 'A2',
  },
  {
    id: 'art_37',
    sentence: 'She plays ___ basketball and ___ volleyball.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: 'Sporty se používají bez členu: „play basketball", „play volleyball".',
    rule: 'zero_meals',
    level: 'A2',
  },
  {
    id: 'art_38',
    sentence: 'I usually skip ___ breakfast, but today I had ___ big meal.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'a', position: 1 },
    ],
    explanationCs: 'Jídlo obecně → nulový člen. Ale „big meal" je počitatelné, poprvé zmíněné → „a".',
    rule: 'zero_meals',
    level: 'B1',
  },
  {
    id: 'art_39',
    sentence: 'We had ___ dinner at ___ expensive restaurant.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'an', position: 1 },
    ],
    explanationCs: '„Have dinner" → nulový člen. Restaurace je poprvé zmíněná a „expensive" začíná na samohlásku → „an".',
    rule: 'zero_meals',
    level: 'B1',
  },
  {
    id: 'art_40',
    sentence: 'She goes to ___ work by ___ bus.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: '„Go to work" a „by bus" jsou ustálená spojení bez členu.',
    rule: 'zero_meals',
    level: 'B1',
  },

  // ===== countable (art_41 – art_50) =====
  {
    id: 'art_41',
    sentence: 'Can I have ___ glass of water, please?',
    gaps: [{ answer: 'a', position: 0 }],
    explanationCs: '„Glass" je počitatelné podstatné jméno → potřebuje člen „a".',
    rule: 'countable',
    level: 'A1',
  },
  {
    id: 'art_42',
    sentence: 'She gave me ___ good advice.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Advice" je nepočitatelné – NELZE říct „an advice". Bez členu.',
    rule: 'countable',
    level: 'A1',
  },
  {
    id: 'art_43',
    sentence: 'I bought ___ new furniture for my room.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Furniture" je nepočitatelné – NELZE říct „a furniture". Bez členu.',
    rule: 'countable',
    level: 'A1',
  },
  {
    id: 'art_44',
    sentence: 'He has ___ luggage in ___ car.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: '„Luggage" je nepočitatelné → nulový člen. Auto je známé z kontextu → „the".',
    rule: 'countable',
    level: 'A2',
  },
  {
    id: 'art_45',
    sentence: 'I would like ___ piece of cake, please.',
    gaps: [{ answer: 'a', position: 0 }],
    explanationCs: '„Piece" je počitatelné → „a piece of". Takto se počítají nepočitatelná podstatná jména.',
    rule: 'countable',
    level: 'A2',
  },
  {
    id: 'art_46',
    sentence: 'She has ___ long hair.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Hair" (vlasy obecně) je nepočitatelné → nulový člen. Pozor: „a hair" = jeden vlas.',
    rule: 'countable',
    level: 'A2',
  },
  {
    id: 'art_47',
    sentence: 'We need ___ new equipment for ___ lab.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: '„Equipment" je nepočitatelné → nulový člen. Laboratoř je známá → „the".',
    rule: 'countable',
    level: 'A2',
  },
  {
    id: 'art_48',
    sentence: 'He made ___ progress on ___ project.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: '„Progress" je nepočitatelné → nulový člen. Projekt je z kontextu známý → „the".',
    rule: 'countable',
    level: 'B1',
  },
  {
    id: 'art_49',
    sentence: 'Can you give me ___ piece of ___ information?',
    gaps: [
      { answer: 'a', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: '„Piece" je počitatelné → „a". „Information" je nepočitatelné → nulový člen.',
    rule: 'countable',
    level: 'B1',
  },
  {
    id: 'art_50',
    sentence: 'I have ___ homework to do and ___ research to finish.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: '„Homework" i „research" jsou nepočitatelná → nulový člen u obou.',
    rule: 'countable',
    level: 'B1',
  },

  // ===== geographic (art_51 – art_60) =====
  {
    id: 'art_51',
    sentence: 'I live in ___ Prague.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Města se používají bez členu: „Prague", „London", „Paris".',
    rule: 'geographic',
    level: 'A1',
  },
  {
    id: 'art_52',
    sentence: 'She is from ___ Czech Republic.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Státy s obecným slovem v názvu (Republic, Kingdom, States) mají „the".',
    rule: 'geographic',
    level: 'A1',
  },
  {
    id: 'art_53',
    sentence: 'We visited ___ London last year.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Města se používají bez členu.',
    rule: 'geographic',
    level: 'A1',
  },
  {
    id: 'art_54',
    sentence: '___ Alps are beautiful in winter.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Pohoří (skupiny hor) mají člen „the": the Alps, the Himalayas.',
    rule: 'geographic',
    level: 'A2',
  },
  {
    id: 'art_55',
    sentence: 'He swam across ___ English Channel.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Průlivy a průplavy mají člen „the": the English Channel.',
    rule: 'geographic',
    level: 'A2',
  },
  {
    id: 'art_56',
    sentence: 'They live near ___ Lake Garda.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: 'Jezera s „Lake" v názvu se používají bez členu: Lake Garda, Lake Baikal.',
    rule: 'geographic',
    level: 'A2',
  },
  {
    id: 'art_57',
    sentence: '___ Thames flows through ___ London.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: 'Řeky mají člen „the": the Thames. Města jsou bez členu: London.',
    rule: 'geographic',
    level: 'A2',
  },
  {
    id: 'art_58',
    sentence: 'We travelled across ___ Sahara Desert.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Pouště mají člen „the": the Sahara, the Gobi Desert.',
    rule: 'geographic',
    level: 'B1',
  },
  {
    id: 'art_59',
    sentence: '___ Mount Everest is in ___ Himalayas.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Jednotlivé hory s „Mount" jsou bez členu. Pohoří (skupina) mají „the".',
    rule: 'geographic',
    level: 'B1',
  },
  {
    id: 'art_60',
    sentence: 'She visited ___ United States and ___ Canada last summer.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: '-', position: 1 },
    ],
    explanationCs: '„United States" má obecné slovo v názvu → „the". Kanada je jednoslovný název státu → bez členu.',
    rule: 'geographic',
    level: 'B1',
  },

  // ===== institutions (art_61 – art_70) =====
  {
    id: 'art_61',
    sentence: 'My children go to ___ school every day.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Go to school" = chodit do školy jako žák → bez členu.',
    rule: 'institutions',
    level: 'A1',
  },
  {
    id: 'art_62',
    sentence: 'He is in ___ hospital.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Be in hospital" = být hospitalizován → bez členu (účel instituce).',
    rule: 'institutions',
    level: 'A1',
  },
  {
    id: 'art_63',
    sentence: 'We go to ___ church on Sundays.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Go to church" = chodit na bohoslužby → bez členu (účel instituce).',
    rule: 'institutions',
    level: 'A1',
  },
  {
    id: 'art_64',
    sentence: 'She is at ___ home right now.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„At home" je ustálené spojení bez členu.',
    rule: 'institutions',
    level: 'A1',
  },
  {
    id: 'art_65',
    sentence: 'I will meet you at ___ school on ___ corner.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
    ],
    explanationCs: 'Tady mluvíme o konkrétní budově školy (ta na rohu) → „the" u obou.',
    rule: 'institutions',
    level: 'A2',
  },
  {
    id: 'art_66',
    sentence: 'He went to ___ prison for stealing.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Go to prison" = být uvězněn → bez členu (účel instituce).',
    rule: 'institutions',
    level: 'A2',
  },
  {
    id: 'art_67',
    sentence: 'She went to ___ university to study medicine.',
    gaps: [{ answer: '-', position: 0 }],
    explanationCs: '„Go to university" = studovat na univerzitě → bez členu (účel instituce).',
    rule: 'institutions',
    level: 'A2',
  },
  {
    id: 'art_68',
    sentence: 'I visited my friend in ___ hospital on Oak Street.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Navštěvuji kamaráda – nejdu tam jako pacient, mluvím o konkrétní budově → „the".',
    rule: 'institutions',
    level: 'B1',
  },
  {
    id: 'art_69',
    sentence: '___ school near our house was built in 1990.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Mluvíme o konkrétní budově školy (ta u našeho domu) → „the".',
    rule: 'institutions',
    level: 'B1',
  },
  {
    id: 'art_70',
    sentence: 'He was sent to ___ prison. ___ prison is in ___ north of the country.',
    gaps: [
      { answer: '-', position: 0 },
      { answer: 'the', position: 1 },
      { answer: 'the', position: 2 },
    ],
    explanationCs: 'Byl uvězněn (účel) → nulový člen. Ve druhé větě mluvíme o konkrétní budově → „the". Světové strany mají „the".',
    rule: 'institutions',
    level: 'B1',
  },

  // ===== superlatives (art_71 – art_80) =====
  {
    id: 'art_71',
    sentence: 'She is ___ best student in the class.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před superlativem „best" je vždy „the".',
    rule: 'superlatives',
    level: 'A1',
  },
  {
    id: 'art_72',
    sentence: 'This is ___ first time I am here.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před řadovou číslovkou „first" je vždy „the".',
    rule: 'superlatives',
    level: 'A1',
  },
  {
    id: 'art_73',
    sentence: 'It is ___ biggest city in the country.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před superlativem „biggest" je vždy „the".',
    rule: 'superlatives',
    level: 'A1',
  },
  {
    id: 'art_74',
    sentence: 'He is ___ most intelligent boy I know.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před superlativem „most intelligent" je vždy „the".',
    rule: 'superlatives',
    level: 'A2',
  },
  {
    id: 'art_75',
    sentence: 'This is ___ second time you have been late.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před řadovou číslovkou „second" je vždy „the".',
    rule: 'superlatives',
    level: 'A2',
  },
  {
    id: 'art_76',
    sentence: 'She is ___ only one who understands me.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před „only" ve smyslu „jediný" je vždy „the".',
    rule: 'superlatives',
    level: 'A2',
  },
  {
    id: 'art_77',
    sentence: 'It was ___ worst experience of my life.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před superlativem „worst" je vždy „the".',
    rule: 'superlatives',
    level: 'B1',
  },
  {
    id: 'art_78',
    sentence: 'This is ___ most beautiful place I have ever seen.',
    gaps: [{ answer: 'the', position: 0 }],
    explanationCs: 'Před superlativem „most beautiful" je vždy „the".',
    rule: 'superlatives',
    level: 'B1',
  },
  {
    id: 'art_79',
    sentence: '___ last time we met, you were ___ happiest person in ___ room.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
      { answer: 'the', position: 2 },
    ],
    explanationCs: '„Last" jako řadové → „the". Superlativ „happiest" → „the". Místnost z kontextu → „the".',
    rule: 'superlatives',
    level: 'B1',
  },
  {
    id: 'art_80',
    sentence: 'He was ___ first person to climb ___ highest peak in ___ region.',
    gaps: [
      { answer: 'the', position: 0 },
      { answer: 'the', position: 1 },
      { answer: 'the', position: 2 },
    ],
    explanationCs: 'Řadová číslovka „first" → „the". Superlativ „highest" → „the". Region je z kontextu známý → „the".',
    rule: 'superlatives',
    level: 'B1',
  },
];

export const ARTICLE_RULES: Record<
  string,
  { titleCs: string; explanationCs: string; examples: string[] }
> = {
  first_mention: {
    titleCs: 'První zmínka vs. známý kontext',
    explanationCs:
      'Když něco zmiňujeme poprvé, použijeme neurčitý člen „a" (nebo „an" před samohláskou). ' +
      'Když se k témuž vrátíme nebo je z kontextu jasné, o čem mluvíme, použijeme určitý člen „the". ' +
      'Čeština členy nemá, proto je to pro české mluvčí nejtěžší pravidlo. ' +
      'Představte si „a/an" jako „nějaký" a „the" jako „ten konkrétní". ' +
      'Pokud o osobě nebo věci mluvíte poprvé a posluchač ji nezná, vždy „a/an".',
    examples: [
      'I saw a dog in the park. The dog was very big.',
      'She bought a book. The book was interesting.',
      'There is a park near my house. The park has many trees.',
    ],
  },
  unique: {
    titleCs: 'Jedinečné věci',
    explanationCs:
      'U věcí, které jsou jedinečné nebo existují jen jednou, používáme „the". ' +
      'Patří sem nebeská tělesa (the sun, the moon), instituce známé všem (the government, the president) ' +
      'a situace, kdy je z kontextu jasné, že jde o jedinou věc svého druhu. ' +
      'Také „the" používáme u superlativů (the best, the tallest), protože superlativ označuje jedinou věc. ' +
      'Vždy se ptejte: „Je to jedinečné? Může toho být víc?" Pokud je to unikát, dejte „the".',
    examples: [
      'The sun rises in the east.',
      'The president gave a speech.',
      'The Internet changed our lives.',
      'She is the best player on the team.',
    ],
  },
  zero_general: {
    titleCs: 'Nulový člen u obecných pojmů',
    explanationCs:
      'Když mluvíme obecně o celé kategorii věcí, nepoužíváme žádný člen. ' +
      'Platí to pro nepočitatelná podstatná jména (music, water, love) ' +
      'a pro počitatelná podstatná jména v množném čísle (dogs, cars, people), pokud jsou míněna obecně. ' +
      'Pozor: jakmile mluvíme o konkrétní věci, člen se vrací. ' +
      'Srovnejte: „I like music" (obecně) vs. „I like the music in this film" (konkrétní).',
    examples: [
      'Music makes me happy.',
      'Dogs are loyal animals.',
      'Water is essential for life.',
      'Love is all you need.',
    ],
  },
  zero_meals: {
    titleCs: 'Nulový člen u jídel, denních dob a sportů',
    explanationCs:
      'Názvy jídel (breakfast, lunch, dinner), sporty (football, tennis, chess) ' +
      'a některé denní doby (at night, at noon) se používají bez členu. ' +
      'Říkáme „have breakfast", nikoliv „have a breakfast". ' +
      'Pozor na výjimky: „in the morning" a „in the evening" člen mají. ' +
      'Také pokud je jídlo blíže popsáno přídavným jménem, člen se může vrátit: „The breakfast was delicious."',
    examples: [
      'I always have breakfast at seven.',
      'She plays tennis every Sunday.',
      'We go to bed at night.',
      'He never eats lunch at work.',
    ],
  },
  countable: {
    titleCs: 'Počitatelná vs. nepočitatelná podstatná jména',
    explanationCs:
      'Počitatelná podstatná jména v jednotném čísle vyžadují člen: „a book", „an apple". ' +
      'Nepočitatelná podstatná jména člen nemají: „advice" (nikoliv „an advice"), ' +
      '„information", „furniture", „luggage", „equipment", „homework", „research". ' +
      'Pokud chcete vyjádřit množství u nepočitatelných, použijte „a piece of": „a piece of advice". ' +
      'Mnoho chyb českých studentů pochází z toho, že v češtině se tyto rozdíly neprojevují.',
    examples: [
      'Can I give you a piece of advice?',
      'We bought new furniture for the office.',
      'I need some information about the course.',
    ],
  },
  geographic: {
    titleCs: 'Zeměpisné názvy',
    explanationCs:
      'BEZ členu: města (Prague, London), jednotlivé hory (Mount Everest), ' +
      'jezera s „Lake" (Lake Garda), ostrovy (Cyprus), kontinenty (Europe). ' +
      'S členem „the": státy s obecným slovem v názvu (the Czech Republic, the United States), ' +
      'pohoří (the Alps), řeky (the Thames), oceány (the Atlantic), pouště (the Sahara). ' +
      'Hlavní pomůcka: skupiny (pohoří, souostroví) mají „the", jednotliviny ne.',
    examples: [
      'Prague is the capital of the Czech Republic.',
      'The Alps are in Europe.',
      'The Thames flows through London.',
      'Mount Everest is the highest mountain in the world.',
    ],
  },
  institutions: {
    titleCs: 'Instituce (škola, nemocnice, kostel…)',
    explanationCs:
      'Když mluvíme o účelu instituce, nepoužíváme člen: „go to school" (= chodit do školy jako žák), ' +
      '„go to hospital" (= být hospitalizován), „go to church" (= jít na bohoslužbu). ' +
      'Pokud ale mluvíme o konkrétní budově, člen použijeme: „The school on the corner is old." ' +
      'Srovnejte: „He is in prison" (= je ve vězení jako vězeň) vs. „I visited the prison" (= budova). ' +
      'Toto rozlišení je pro Čechy obtížné, protože v češtině vždy říkáme „jít do školy".',
    examples: [
      'Children go to school at eight.',
      'He was taken to hospital after the accident.',
      'The school near my house is very modern.',
      'She goes to church every Sunday.',
    ],
  },
  superlatives: {
    titleCs: 'Superlativy a řadové číslovky',
    explanationCs:
      'Před superlativy (the best, the most beautiful, the worst) a řadovými číslovkami ' +
      '(the first, the second, the last) vždy používáme „the". ' +
      'Je to proto, že superlativ i řadová číslovka označují něco jedinečného – to nejlepší, první, poslední. ' +
      'Totéž platí pro „the only" (jediný) a „the same" (stejný). ' +
      'V češtině se člen v těchto případech nepoužívá, proto na něj Češi často zapomínají.',
    examples: [
      'She is the best singer I know.',
      'This is the first day of school.',
      'He is the only one who came.',
      'It was the most interesting book I have ever read.',
    ],
  },
};
