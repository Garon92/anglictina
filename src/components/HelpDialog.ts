import { setHelp } from '../kit';

/**
 * Help shown by the app bar's "?" (kit v0.7): the title comes from the kit ("Jak na to" for learning
 * apps) and the text uses the list layout (`sections`) — readable at 360 px (ANG-23, C-09).
 */
export function registerHelp() {
  return setHelp({
    intro: 'Stačí 15–25 minut denně. Aplikace sama hlídá, co je potřeba zopakovat.',
    sections: [
      { icon: '🏠', title: 'Dnes', text: 'Plán na dnešek: opakování slovíček, nová slovíčka, oprava chyb a jedno doporučené cvičení.' },
      { icon: '🗂️', title: 'Slovíčka', text: 'Opakují se chytře: co umíš, uvidíš za pár dní, co ne, hned znovu. Hodnoť poctivě.' },
      { icon: '🔁', title: 'Chyby', text: 'Chyby ze cvičení se ukládají a vracejí, dokud je 2× po sobě nezvládneš.' },
      { icon: '🎓', title: 'Maturita', text: 'Cvičné didaktické testy ve formátu CERMAT: 110 minut, 100 bodů, hranice 44 %. Rozpracovaný test můžeš přerušit a dokončit později.' },
      { icon: '📈', title: 'Pokrok', text: 'Série dní, statistiky, výsledky testů a úspěchy.' },
      { icon: '💾', title: 'Data', text: 'Vše se ukládá jen v tomto zařízení. Zálohu najdeš v ⚙ → Další nastavení.' },
    ],
    keys: [
      { keys: ['1', '2', '3', '4'], text: 'volba odpovědi (nebo A–D) / hodnocení kartičky' },
      { keys: ['Enter'], text: 'potvrdit, další úloha' },
      { keys: ['Mezerník'], text: 'otočit kartičku' },
      { keys: ['M'], text: 'zvuk zapnout / vypnout' },
      { keys: ['?'], text: 'nápověda' },
    ],
  });
}
