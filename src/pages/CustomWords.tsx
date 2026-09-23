import { useEffect, useId, useMemo, useRef, useState, type FormEvent } from 'react';
import { speak, stopSpeaking } from '../tts';
import { shuffleArray } from '../utils';
import { VOCABULARY } from '../data/vocabulary';
import { useSettings } from '../App';
import { toast } from '../kit';
import { safeConfirm } from '../lib/confirm';
import { useKeyboard } from '../hooks/useKeyboard';
import { PageHeader, Segmented, SpeakButton } from '../components/ui';
import {
  useDrillSession, DrillTopBar, OptionList, Feedback, NextButton, ResultScreen,
} from '../components/drill';

/** Storage key and format are shared with backups (db.ts) and Settings — keep them unchanged. */
const STORAGE_KEY = 'anglictina_custom_words';
const MIN_QUIZ = 4;

interface CustomWord {
  id: string;
  en: string;
  cs: string;
  addedAt: number;
}

type Phase = 'list' | 'drill' | 'result';
type Dir = 'en_cs' | 'cs_en';

interface QuizItem {
  word: CustomWord;
  options: string[];
  correctIndex: number;
}

const norm = (s: string) => s.trim().toLowerCase();

function loadWords(): CustomWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (w): w is CustomWord => !!w && typeof w === 'object' && typeof (w as CustomWord).en === 'string' && typeof (w as CustomWord).cs === 'string',
    ).map((w, i) => ({ ...w, id: String(w.id ?? `cw_legacy_${i}`), addedAt: Number(w.addedAt) || 0 }));
  } catch {
    return [];
  }
}

function saveWords(words: CustomWord[]): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    return true;
  } catch {
    toast('Uložení se nepovedlo — úložiště prohlížeče je plné nebo zablokované.', { variant: 'danger' });
    return false;
  }
}

function newId(): string {
  return `cw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function plural(n: number, one: string, few: string, many: string) {
  return n === 1 ? one : n >= 2 && n <= 4 ? few : many;
}

const HEADER_EN = new Set(['english', 'anglicky', 'angličtina', 'en']);
const HEADER_CS = new Set(['czech', 'česky', 'cesky', 'čeština', 'cs', 'cz']);

/** Parse pasted lines "english;czech" (also tab, " - " or a single comma as separator). */
function parseImport(raw: string): { en: string; cs: string }[] {
  const strip = (s: string) => s.trim().replace(/^"(.*)"$/, '$1').trim();
  const out: { en: string; cs: string }[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    let parts: [string, string] | null = null;
    for (const sep of ['\t', ';']) {
      const i = t.indexOf(sep);
      if (i > 0) {
        parts = [t.slice(0, i), t.slice(i + 1)];
        break;
      }
    }
    if (!parts) {
      const m = /^(.+?)\s+[-–—=]\s+(.+)$/.exec(t);
      if (m) parts = [m[1], m[2]];
    }
    if (!parts) {
      const i = t.indexOf(',');
      if (i > 0 && t.indexOf(',', i + 1) === -1) parts = [t.slice(0, i), t.slice(i + 1)];
    }
    if (!parts) continue;
    const en = strip(parts[0]);
    const cs = strip(parts[1].replace(/[;\t]+$/, ''));
    if (!en || !cs) continue;
    if (out.length === 0 && HEADER_EN.has(norm(en)) && HEADER_CS.has(norm(cs))) continue;
    out.push({ en, cs });
  }
  return out;
}

function buildQuiz(words: CustomWord[], dir: Dir): QuizItem[] {
  const promptOf = (w: { en: string; cs: string }) => (dir === 'en_cs' ? w.en : w.cs);
  const answerOf = (w: { en: string; cs: string }) => (dir === 'en_cs' ? w.cs : w.en);
  const seen = new Set<string>();
  const unique = words.filter((w) => {
    const k = norm(promptOf(w));
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
  const vocab = VOCABULARY.map((v) => ({ en: v.en, cs: v.cs }));
  return shuffleArray(unique).map((word) => {
    const correct = answerOf(word);
    const prompt = norm(promptOf(word));
    const taken = new Set([norm(correct)]);
    const distractors: string[] = [];
    const add = (cands: { en: string; cs: string }[]) => {
      for (const c of cands) {
        if (distractors.length >= 3) return;
        const a = answerOf(c);
        if (!a.trim() || taken.has(norm(a)) || norm(promptOf(c)) === prompt) continue;
        taken.add(norm(a));
        distractors.push(a);
      }
    };
    add(shuffleArray(words));
    if (distractors.length < 3) add(shuffleArray(vocab).slice(0, 200));
    const options = shuffleArray([correct, ...distractors]);
    return { word, options, correctIndex: options.indexOf(correct) };
  });
}

/* ─── Icons ───────────────────────────────────────────────────────── */

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
    </svg>
  );
}

/* ─── Page ────────────────────────────────────────────────────────── */

export default function CustomWords() {
  const { settings } = useSettings();
  const rate = settings.ttsRate || 0.9;
  const [words, setWords] = useState<CustomWord[]>(loadWords);
  const [phase, setPhase] = useState<Phase>('list');
  const [newEn, setNewEn] = useState('');
  const [newCs, setNewCs] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [filter, setFilter] = useState('');
  const [showImport, setShowImport] = useState(false);
  const [importText, setImportText] = useState('');
  const [dir, setDir] = useState<Dir>('en_cs');
  const csRef = useRef<HTMLInputElement>(null);
  const enRef = useRef<HTMLInputElement>(null);
  const ids = useId();

  // Quiz state
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<boolean | null>(null);
  const session = useDrillSession('custom_words', { tags: [dir] });

  // Keep in sync with other tabs.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === null) setWords(loadWords());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => () => stopSpeaking(), []);

  const sorted = useMemo(() => [...words].sort((a, b) => b.addedAt - a.addedAt), [words]);
  const visible = useMemo(() => {
    const f = norm(filter);
    return f ? sorted.filter((w) => norm(w.en).includes(f) || norm(w.cs).includes(f)) : sorted;
  }, [sorted, filter]);
  const parsedImport = useMemo(() => parseImport(importText), [importText]);

  function commit(next: CustomWord[]) {
    if (saveWords(next)) setWords(next);
  }

  function addWord(e?: FormEvent) {
    e?.preventDefault();
    const en = newEn.trim();
    const cs = newCs.trim();
    if (!en || !cs) return;
    if (words.some((w) => norm(w.en) === norm(en) && norm(w.cs) === norm(cs))) {
      toast('Tohle slovíčko už ve slovníčku máš.');
      return;
    }
    commit([...words, { id: newId(), en, cs, addedAt: Date.now() }]);
    setNewEn('');
    setNewCs('');
    enRef.current?.focus();
  }

  async function removeWord(w: CustomWord) {
    const ok = await safeConfirm({
      title: 'Smazat slovíčko?',
      message: `„${w.en} — ${w.cs}“ zmizí z tvého slovníčku.`,
      confirmLabel: 'Smazat',
      cancelLabel: 'Ponechat',
      danger: true,
    });
    if (!ok) return;
    const current = loadWords();
    commit(current.filter((x) => x.id !== w.id));
    if (editId === w.id) setEditId(null);
  }

  function updateWord(id: string, en: string, cs: string) {
    const e = en.trim();
    const c = cs.trim();
    if (!e || !c) return;
    commit(words.map((w) => (w.id === id ? { ...w, en: e, cs: c } : w)));
    setEditId(null);
  }

  function importWords() {
    if (!parsedImport.length) return;
    const keys = new Set(words.map((w) => `${norm(w.en)}|${norm(w.cs)}`));
    const now = Date.now();
    const added: CustomWord[] = [];
    for (const p of parsedImport) {
      const k = `${norm(p.en)}|${norm(p.cs)}`;
      if (keys.has(k)) continue;
      keys.add(k);
      // Keep the pasted order when listing newest first.
      added.push({ id: newId(), en: p.en, cs: p.cs, addedAt: now - added.length });
    }
    const skipped = parsedImport.length - added.length;
    if (added.length) commit([...words, ...added]);
    toast(
      added.length
        ? `Přidáno ${added.length} ${plural(added.length, 'slovíčko', 'slovíčka', 'slovíček')}${skipped ? `, ${skipped} už ve slovníčku bylo` : ''}.`
        : 'Všechna slovíčka už ve slovníčku máš.',
      { variant: added.length ? 'success' : 'default' },
    );
    if (added.length) {
      setImportText('');
      setShowImport(false);
    }
  }

  async function exportWords() {
    const text = sorted.map((w) => `${w.en};${w.cs}`).join('\n');
    try {
      await navigator.clipboard.writeText(text);
      toast(`Zkopírováno ${sorted.length} ${plural(sorted.length, 'slovíčko', 'slovíčka', 'slovíček')} do schránky (formát english;česky).`, { variant: 'success' });
    } catch {
      toast('Kopírování do schránky se nepovedlo. Zkus to prosím znovu.', { variant: 'danger' });
    }
  }

  /* ─── Quiz ─────────────────────────────────────────────────────── */

  const item = quiz[idx];

  function startQuiz() {
    if (words.length < MIN_QUIZ) return;
    setQuiz(buildQuiz(words, dir));
    setIdx(0);
    setSelected(null);
    setResult(null);
    session.start();
    setPhase('drill');
    window.scrollTo({ top: 0 });
  }

  function submit(opt: number) {
    if (!item || result !== null) return;
    const correct = opt === item.correctIndex;
    setSelected(opt);
    setResult(correct);
    session.answer({
      itemId: `${item.word.id}:${dir}`,
      category: 'custom',
      prompt: dir === 'en_cs' ? item.word.en : item.word.cs,
      options: item.options,
      kind: 'mcq',
      answer: item.options[item.correctIndex],
      userAnswer: item.options[opt],
      correct,
    });
  }

  async function finishQuiz() {
    await session.finish();
    setPhase('result');
  }

  async function next() {
    if (idx + 1 >= quiz.length) await finishQuiz();
    else {
      setIdx(idx + 1);
      setSelected(null);
      setResult(null);
    }
  }

  useKeyboard(result !== null ? { Enter: () => void next() } : {}, phase === 'drill');

  if (phase === 'result') {
    return (
      <ResultScreen correct={session.correct} total={session.total} mistakes={session.mistakes} onRestart={startQuiz} restartLabel="Znovu">
        <div className="mt-3 text-center">
          <button type="button" className="btn-ghost" onClick={() => setPhase('list')}>
            Zpět na seznam slovíček
          </button>
        </div>
      </ResultScreen>
    );
  }

  if (phase === 'drill' && item) {
    const last = idx + 1 >= quiz.length;
    const enPrompt = dir === 'en_cs';
    return (
      <div className="page-container">
        <DrillTopBar current={idx} total={quiz.length} correct={session.correct} onExit={() => void finishQuiz()} title="Vlastní slovíčka" />
        <div className="card !p-5">
          <p className="mb-1 text-sm font-bold text-muted">{enPrompt ? 'Co to znamená?' : 'Jak se to řekne anglicky?'}</p>
          <div className="mb-4 flex items-center gap-3">
            <p className="min-w-0 flex-1 text-2xl font-black break-words text-fg" lang={enPrompt ? 'en' : 'cs'}>
              {enPrompt ? item.word.en : item.word.cs}
            </p>
            {(enPrompt || result !== null) && (
              <SpeakButton onClick={() => void speak(item.word.en, rate)} label={`Přehrát „${item.word.en}“`} />
            )}
          </div>
          <OptionList
            key={`${idx}-${item.word.id}`}
            options={item.options}
            selected={selected}
            correctIndex={item.correctIndex}
            revealed={result !== null}
            onSelect={submit}
            lang={enPrompt ? 'cs' : 'en'}
          />
          {result !== null && (
            <Feedback
              correct={result}
              answer={item.options[item.correctIndex]}
              explanation={
                <span>
                  <span lang="en" className="font-bold text-fg">
                    {item.word.en}
                  </span>{' '}
                  — {item.word.cs}
                </span>
              }
            />
          )}
          {result !== null && <NextButton onClick={() => void next()} last={last} />}
        </div>
      </div>
    );
  }

  /* ─── List ─────────────────────────────────────────────────────── */

  return (
    <div className="page-container">
      <PageHeader
        title="Vlastní slovíčka"
        subtitle={`Tvůj osobní slovníček — ${words.length} ${plural(words.length, 'slovíčko', 'slovíčka', 'slovíček')}.`}
        icon="✍️"
      />

      <form className="card mb-4 !p-4" onSubmit={addWord} aria-labelledby={`${ids}-add`}>
        <h2 id={`${ids}-add`} className="section-title">
          Přidat slovíčko
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor={`${ids}-en`} className="mb-1 block text-sm font-bold text-fg">
              Anglicky
            </label>
            <input
              id={`${ids}-en`}
              ref={enRef}
              className="input"
              lang="en"
              placeholder="např. to look forward to"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck={false}
              enterKeyHint="next"
              value={newEn}
              onChange={(e) => setNewEn(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !newCs.trim()) {
                  e.preventDefault();
                  csRef.current?.focus();
                }
              }}
            />
          </div>
          <div>
            <label htmlFor={`${ids}-cs`} className="mb-1 block text-sm font-bold text-fg">
              Česky
            </label>
            <input
              id={`${ids}-cs`}
              ref={csRef}
              className="input"
              lang="cs"
              placeholder="např. těšit se na"
              autoComplete="off"
              enterKeyHint="done"
              value={newCs}
              onChange={(e) => setNewCs(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button type="submit" className="btn-primary" disabled={!newEn.trim() || !newCs.trim()}>
            + Přidat slovo
          </button>
          <button type="button" className="btn-ghost" aria-expanded={showImport} onClick={() => setShowImport((s) => !s)}>
            Hromadný import
          </button>
          {words.length > 0 && (
            <button type="button" className="btn-ghost" onClick={() => void exportWords()}>
              Kopírovat seznam
            </button>
          )}
        </div>

        {showImport && (
          <div className="mt-4 rounded-xl border border-border bg-surface-2 p-3">
            <label htmlFor={`${ids}-import`} className="mb-1 block text-sm font-bold text-fg">
              Vlož seznam slovíček
            </label>
            <p className="mb-2 text-xs text-muted">
              Každé slovíčko na nový řádek ve tvaru <code lang="en">english;česky</code>. Oddělovač může být i tabulátor (vložení z tabulky) nebo pomlčka.
            </p>
            <textarea
              id={`${ids}-import`}
              className="input font-mono text-sm"
              rows={5}
              spellCheck={false}
              placeholder={'apple;jablko\nto give up;vzdát se'}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-secondary" disabled={!parsedImport.length} onClick={importWords}>
                Importovat {parsedImport.length > 0 ? `(${parsedImport.length})` : ''}
              </button>
              {importText.trim() && (
                <span className="text-sm text-muted" aria-live="polite">
                  {parsedImport.length
                    ? `Rozpoznáno ${parsedImport.length} ${plural(parsedImport.length, 'dvojice', 'dvojice', 'dvojic')}.`
                    : 'Zatím žádná dvojice — zkontroluj oddělovač.'}
                </span>
              )}
            </div>
          </div>
        )}
      </form>

      {words.length >= MIN_QUIZ ? (
        <section className="card mb-4 flex flex-col gap-3 !p-4 sm:flex-row sm:items-center" aria-label="Kvíz">
          <div className="min-w-0 flex-1">
            <p className="eyebrow mb-2">Kvíz — směr</p>
            <Segmented
              value={dir}
              onChange={setDir}
              label="Směr kvízu"
              options={[
                { value: 'en_cs', label: 'EN → CZ' },
                { value: 'cs_en', label: 'CZ → EN' },
              ]}
            />
          </div>
          <button type="button" className="btn-primary btn-lg" onClick={startQuiz}>
            🎯 Spustit kvíz ({words.length})
          </button>
        </section>
      ) : (
        words.length > 0 && (
          <p className="mb-4 text-center text-sm text-muted">
            Přidej ještě {MIN_QUIZ - words.length} {plural(MIN_QUIZ - words.length, 'slovíčko', 'slovíčka', 'slovíček')} a můžeš spustit kvíz.
          </p>
        )
      )}

      {words.length > 8 && (
        <div className="mb-3">
          <label htmlFor={`${ids}-filter`} className="sr-only">
            Hledat ve slovníčku
          </label>
          <input
            id={`${ids}-filter`}
            className="input"
            type="search"
            placeholder="Hledat ve slovníčku…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>
      )}

      {words.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 !py-10 text-center">
          <div className="text-5xl" aria-hidden="true">
            📝
          </div>
          <h2 className="text-lg font-black text-fg">Zatím tu nic není</h2>
          <p className="max-w-sm text-sm text-muted">Přidej své první slovíčko nahoře, nebo vlož celý seznam přes hromadný import.</p>
        </div>
      ) : visible.length === 0 ? (
        <p className="card text-center text-sm text-muted">Nic neodpovídá hledání „{filter}“.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((w) => (
            <li key={w.id} className="card flex items-center gap-2 !p-2 !pl-3">
              {editId === w.id ? (
                <EditWord word={w} onSave={(en, cs) => updateWord(w.id, en, cs)} onCancel={() => setEditId(null)} />
              ) : (
                <>
                  <SpeakButton size="sm" onClick={() => void speak(w.en, rate)} label={`Přehrát „${w.en}“`} />
                  <div className="min-w-0 flex-1 py-1 break-words">
                    <span className="font-bold text-fg" lang="en">
                      {w.en}
                    </span>
                    <span className="mx-1.5 text-subtle" aria-hidden="true">
                      —
                    </span>
                    <span className="text-muted">{w.cs}</span>
                  </div>
                  <button type="button" className="btn-ghost btn-icon shrink-0" onClick={() => setEditId(w.id)} aria-label={`Upravit „${w.en}“`} title="Upravit">
                    <EditIcon />
                  </button>
                  <button
                    type="button"
                    className="btn-ghost btn-icon shrink-0 hover:!text-danger"
                    onClick={() => void removeWord(w)}
                    aria-label={`Smazat „${w.en}“`}
                    title="Smazat"
                  >
                    <TrashIcon />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function EditWord({ word, onSave, onCancel }: { word: CustomWord; onSave: (en: string, cs: string) => void; onCancel: () => void }) {
  const [en, setEn] = useState(word.en);
  const [cs, setCs] = useState(word.cs);
  const valid = en.trim().length > 0 && cs.trim().length > 0;
  return (
    <form
      className="flex min-w-0 flex-1 flex-col gap-2 py-1 sm:flex-row sm:items-center"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSave(en, cs);
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onCancel();
        }
      }}
    >
      <input
        className="input min-w-0 flex-1"
        lang="en"
        aria-label="Anglicky"
        autoCapitalize="off"
        autoComplete="off"
        spellCheck={false}
        value={en}
        onChange={(e) => setEn(e.target.value)}
        autoFocus
      />
      <input className="input min-w-0 flex-1" lang="cs" aria-label="Česky" autoComplete="off" value={cs} onChange={(e) => setCs(e.target.value)} />
      <div className="flex shrink-0 gap-2">
        <button type="submit" className="btn-primary" disabled={!valid}>
          Uložit
        </button>
        <button type="button" className="btn-ghost" onClick={onCancel}>
          Zrušit
        </button>
      </div>
    </form>
  );
}
