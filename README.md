# Angličtina — příprava na maturitu

Webová aplikace (PWA) pro přípravu na státní maturitu z angličtiny — didaktický test CERMAT, úroveň B1.
Běží na <https://garon92.github.io/anglictina/>, funguje offline a všechna data ukládá jen v zařízení.

Součást rodiny aplikací [garon92.github.io](https://garon92.github.io/menu/) — sdílí design systém „g92 kit“
(horní lišta, motiv světlý/tmavý, zvuky, nastavení, statistiky pro menu).

## Co umí

- **Dnes** — plán na den: opakování slovíček, nová slovíčka, oprava chyb, doporučené cvičení podle slabin,
  denní výzva, kruh denního cíle v minutách, série dní, odpočet do maturity, poslední výsledek testu.
- **Slovíčka** — 2 811 nejčastějších slov (NGSL) s příklady a překlady, chytré opakování (spaced repetition)
  s hodnocením Znovu / Těžké / Dobře / Snadné, denní limit nových slov, směr EN→CZ / CZ→EN, výběr podle
  tématu nebo úrovně, vrácení posledního hodnocení, výslovnost (TTS).
- **Procvičování** — 30+ modulů: gramatika (časy, členy, předložky, podmínky, trpný rod, nepřímá řeč,
  slovosled, přeformulace, oprava chyb, typické chyby Čechů, překlad), slovní zásoba (frázová slovesa,
  idiomy a kolokace, nepravidelná slovesa, záměnná slova, tvoření slov, pexeso, vlastní slovíčka),
  čtení (50 textů), poslech (TTS), psaní, ústní zkouška, kvízy a příručka.
- **Oprava chyb** — každá chybná odpověď se uloží a vrací se v původní podobě, dokud ji 2× po sobě nezvládneš.
- **Maturita nanečisto** — simulace didaktického testu ve formátu CERMAT: 10 částí, 64 úloh, 100 bodů,
  110 minut, hranice úspěšnosti 44 %. Pět původních cvičných sad (A–E) + náhodný mix, jen poslech / jen čtení
  a jazyková kompetence, trénink jednotlivých částí, nahrávky přes TTS se dvěma hlasy (max. 2 přehrání jako
  u maturity), průběžné ukládání a pokračování, rozbor odpovědí s vysvětlením, historie. Časovač pro
  vytištěné oficiální testy.
- **Pokrok** — úroveň a XP, série, kalendář aktivity, dovednosti podle částí maturity, stav slovíček
  a předpověď opakování, vývoj skóre v testech, úspěchy.
- **Nastavení** — cíle, datum maturity, motiv (sdílený pro všechny aplikace), velikost písma, hlas a rychlost
  výslovnosti, záloha a obnova dat (JSON), export slovíček pro Anki.

## Vývoj

Požadavky: Node.js 22.12+ (CI používá Node 24).

```bash
npm install
npm run dev        # http://localhost:5173/anglictina/
npm run build      # typecheck + produkční build do dist/ (včetně service workeru)
npm run preview    # náhled buildu na http://localhost:4173/anglictina/
npm test           # Vitest: SRS, porovnávání odpovědí, data, migrace IndexedDB, bodování testů
npm run check:data # jen validace datových sad
npm run lint       # oxlint (vč. rules-of-hooks)
```

Stack: Vite 8, React 19, react-router 8, Tailwind CSS 4 (napojený na tokeny g92 kitu), TypeScript 7,
vite-plugin-pwa (Workbox), idb (IndexedDB), Vitest.

## Struktura

```
src/
  kit/            sdílený g92 kit (vendorovaná kopie z menu/kit — needitovat, aktualizace: menu/kit/sync.sh)
  components/     Layout (lišta + navigace), drill.tsx (společné stavební bloky cvičení), ui.tsx
  pages/          obrazovky jednotlivých modulů
  exam/           simulátor didaktického testu (struktura, bodování, přehrávač poslechu, výsledky)
  data/           slovní zásoba, cvičení, texty; data/exam/set*.ts = cvičné testy A–E
  lib/            dny v místním čase, tolerantní porovnání odpovědí, kit most
  db.ts           IndexedDB (verze 2, migrace), srs.ts, progress.ts (sezení, chyby), modules.ts (registr modulů)
data/cermat/      oficiální testy CERMAT (PDF) — jen jako podklad pro formát, nejsou součástí aplikace
```

## Data a soukromí

Vše se ukládá lokálně: IndexedDB `anglictina-db` (nastavení, statistiky, stav kartiček, historie, chyby,
výsledky testů) a localStorage (`anglictina_favorites`, `anglictina_custom_words`, sdílené `g92:*`).
Při aktualizaci z verze 1 se starý log chyb automaticky převede do fronty „Opakování chyb“; žádná data se
nemažou. ID slovíček jsou stabilní — při úpravách `data/ngsl_chunk*.ts` nikdy nemazat ani nepřeřazovat řádky.

## Nasazení

Push do `main` spustí `.github/workflows/deploy.yml` (Node 24 → testy → build → GitHub Pages přes
`actions/deploy-pages`). `404.html` = kopie `index.html`, aby fungovaly přímé odkazy na podstránky.

## Licence obsahu

Slovní zásoba vychází z New General Service List (CC BY-SA 4.0). Cvičné testy, texty a úlohy v aplikaci
jsou původní materiály; formát odpovídá didaktickému testu CERMAT, oficiální zadání se v aplikaci nešíří
(odkaz vede na web CERMAT).
