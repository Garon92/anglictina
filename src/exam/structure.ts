/** Structure of the CERMAT didaktický test (anglický jazyk) since spring 2024. */

export type PartNo = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type Subtest = 'listening' | 'reading' | 'language';

export interface PartInfo {
  no: PartNo;
  subtest: Subtest;
  /** First task number in the booklet (1–64). */
  firstTask: number;
  items: number;
  pointsPerItem: number;
  title: string;
  /** Short Czech description of the task type. */
  kind: string;
  icon: string;
  /** Rough time guidance in minutes. */
  minutes: number;
}

export const PARTS: PartInfo[] = [
  { no: 1, subtest: 'listening', firstTask: 1, items: 4, pointsPerItem: 2, title: 'Krátké nahrávky – obrázky', kind: 'Ke každé nahrávce vyber správný obrázek A–D.', icon: '🖼️', minutes: 8 },
  { no: 2, subtest: 'listening', firstTask: 5, items: 8, pointsPerItem: 1, title: 'Rozhovor – pravda/nepravda', kind: 'Rozhodni, zda jsou tvrzení pravdivá, nebo nepravdivá.', icon: '⚖️', minutes: 8 },
  { no: 3, subtest: 'listening', firstTask: 13, items: 8, pointsPerItem: 2, title: 'Monolog – krátké odpovědi', kind: 'Odpověz anglicky, nejvýše 3 slovy.', icon: '✍️', minutes: 12 },
  { no: 4, subtest: 'listening', firstTask: 21, items: 4, pointsPerItem: 2, title: 'Krátké nahrávky – výběr odpovědi', kind: 'Ke každé nahrávce vyber odpověď A–D.', icon: '🎧', minutes: 8 },
  { no: 5, subtest: 'reading', firstTask: 25, items: 5, pointsPerItem: 2, title: 'Krátké texty', kind: 'Ke každému textu vyber odpověď A–D.', icon: '🗒️', minutes: 10 },
  { no: 6, subtest: 'reading', firstTask: 30, items: 10, pointsPerItem: 1, title: 'Informační text – pravda/nepravda', kind: 'Rozhodni podle textu, zda tvrzení platí.', icon: '📰', minutes: 12 },
  { no: 7, subtest: 'reading', firstTask: 40, items: 5, pointsPerItem: 2, title: 'Článek – výběr odpovědi', kind: 'Vyber odpověď A–D podle článku.', icon: '📖', minutes: 13 },
  { no: 8, subtest: 'reading', firstTask: 45, items: 5, pointsPerItem: 2, title: 'Přiřazování', kind: 'Přiřaď k lidem nabídky A–G (dvě jsou navíc).', icon: '🧩', minutes: 13 },
  { no: 9, subtest: 'language', firstTask: 50, items: 10, pointsPerItem: 1, title: 'Text s mezerami – výběr', kind: 'Do mezer vyber správnou možnost A–C.', icon: '🔤', minutes: 12 },
  { no: 10, subtest: 'language', firstTask: 60, items: 5, pointsPerItem: 2, title: 'Text s mezerami – doplň slovo', kind: 'Doplň jedno slovo ve správném tvaru.', icon: '✏️', minutes: 10 },
];

export const SUBTESTS: Record<Subtest, { title: string; icon: string; parts: PartNo[] }> = {
  listening: { title: 'Poslech', icon: '🎧', parts: [1, 2, 3, 4] },
  reading: { title: 'Čtení', icon: '📖', parts: [5, 6, 7, 8] },
  language: { title: 'Jazyková kompetence', icon: '✏️', parts: [9, 10] },
};

export const PASS_RATIO = 0.44;
export const FULL_MINUTES = 110;
export const LISTENING_MINUTES = 40;
export const READING_MINUTES = 70;

export function partInfo(no: number): PartInfo {
  return PARTS[no - 1];
}

export function partMax(no: number): number {
  const p = partInfo(no);
  return p.items * p.pointsPerItem;
}

export type ExamMode = 'full' | 'listening' | 'reading' | 'part';

export function partsForMode(mode: ExamMode, part?: number): PartNo[] {
  if (mode === 'full') return PARTS.map((p) => p.no);
  if (mode === 'listening') return SUBTESTS.listening.parts;
  if (mode === 'reading') return [...SUBTESTS.reading.parts, ...SUBTESTS.language.parts];
  return part ? [part as PartNo] : [1];
}

export function minutesForMode(mode: ExamMode, part?: number): number {
  if (mode === 'full') return FULL_MINUTES;
  if (mode === 'listening') return LISTENING_MINUTES;
  if (mode === 'reading') return READING_MINUTES;
  return part ? partInfo(part).minutes : 10;
}

export const MODE_LABELS: Record<ExamMode, string> = {
  full: 'Celý didaktický test',
  listening: 'Poslech',
  reading: 'Čtení a jazyková kompetence',
  part: 'Trénink části',
};

export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
