import { setHelp } from '../kit';

/** Help shown by the app bar's "?" button (kit pictogram dialog). */
export function registerHelp() {
  return setHelp({
    title: 'Jak na to',
    intro: 'Stačí 15–25 minut denně. Aplikace sama hlídá, co je potřeba zopakovat.',
    howTo: [
      { icon: '🏠', text: 'Dnes — plán na dnešek: opakování slovíček, nová slovíčka, oprava chyb a jedno doporučené cvičení.' },
      { icon: '🗂️', text: 'Slovíčka se opakují chytře: co umíš, uvidíš za pár dní, co ne, hned znovu. Hodnoť poctivě.' },
      { icon: '🔁', text: 'Chyby ze cvičení se ukládají a vracejí, dokud je 2× po sobě nezvládneš.' },
      { icon: '🎓', text: 'Maturita — cvičné didaktické testy ve formátu CERMAT: 110 minut, 100 bodů, hranice 44 %.' },
      { icon: '📈', text: 'Pokrok — série dní, statistiky, výsledky testů a úspěchy.' },
    ],
    keys: [
      { keys: ['1', '2', '3', '4'], text: 'volba odpovědi (nebo A–D) / hodnocení kartičky' },
      { keys: ['Enter'], text: 'potvrdit, další úloha' },
      { keys: ['Mezerník'], text: 'otočit kartičku' },
    ],
    extra: '<p class="g92-muted">Vše se ukládá jen v tomto zařízení. Zálohu (export) najdeš v Nastavení.</p>',
  });
}
