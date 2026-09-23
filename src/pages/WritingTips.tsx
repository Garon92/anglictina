import { useEffect, useId, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSettings } from '../App';
import { WRITING_TEMPLATES } from '../data/writing';
import { speak, stopSpeaking } from '../tts';
import { plural } from '../kit';
import { safeConfirm } from '../lib/confirm';
import { PageHeader, ProgressBar, Segmented, SpeakButton } from '../components/ui';
import type { WritingTemplate } from '../types';

/** Labels for every template type, including ones added to the data later (e.g. article). */
const TYPE_META: Record<string, { icon: string; label: string }> = {
  email: { icon: '📧', label: 'E-mail' },
  letter: { icon: '✉️', label: 'Dopis' },
  essay: { icon: '📝', label: 'Esej' },
  article: { icon: '📰', label: 'Článek' },
  description: { icon: '🖼️', label: 'Popis' },
  story: { icon: '📖', label: 'Vyprávění' },
  review: { icon: '⭐', label: 'Recenze' },
  report: { icon: '📊', label: 'Zpráva' },
  blog: { icon: '💻', label: 'Blog' },
};
const TYPE_ORDER = Object.keys(TYPE_META);

function typeMeta(type: string) {
  return TYPE_META[type] ?? { icon: '📄', label: type.charAt(0).toUpperCase() + type.slice(1) };
}

const LEVEL_CLASS: Record<string, string> = {
  A1: 'bg-success-soft text-success',
  A2: 'bg-info-soft text-info',
  B1: 'bg-accent-soft text-accent-text',
  B2: 'bg-warning-soft text-warning',
};

type Tpl = WritingTemplate & { wordRange?: [number, number]; minWords?: number; maxWords?: number };

/** Recommended length: an explicit field if the data has one, otherwise "cca 100–150 slov" in the structure text. */
function wordRange(t: Tpl): [number, number] | null {
  if (t.wordRange) return t.wordRange;
  if (t.minWords && t.maxWords) return [t.minWords, t.maxWords];
  const m = /(\d+)\s*[–—-]\s*(\d+)\s*slov/.exec(t.structureCs);
  return m ? [Number(m[1]), Number(m[2])] : null;
}

/** Text for speech: no "[name]" placeholders, no "…", and "a / b" read as "a or b". */
function speakable(s: string): string {
  return s
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/…|\.{3,}/g, ' ')
    .replace(/([A-Za-z)])\s*\/\s*(?=[A-Za-z(])/g, '$1 or ')
    .replace(/\s+([,.!?;:])/g, '$1')
    .replace(/([,;:])(\s*[,;:.!?])+/g, '$2')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
}

const words = (n: number) => plural(n, 'slovo', 'slova', 'slov');

const TEMPLATES = WRITING_TEMPLATES as Tpl[];
const TYPES = [...new Set(TEMPLATES.map((t) => t.type as string))].sort(
  (a, b) => (TYPE_ORDER.indexOf(a) + 1 || 99) - (TYPE_ORDER.indexOf(b) + 1 || 99),
);
const LEVELS = [...new Set(TEMPLATES.map((t) => t.level as string))].sort();

function LevelBadge({ level }: { level: string }) {
  return <span className={`badge ${LEVEL_CLASS[level] ?? ''}`}>{level}</span>;
}

export default function WritingTips() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('t');
  const selected = selectedId ? TEMPLATES.find((t) => t.id === selectedId) ?? null : null;
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');
  const lastOpened = useRef<string | null>(null);

  // Detail opens at the top; the list returns to the template you came from.
  useEffect(() => {
    if (selected) {
      lastOpened.current = selected.id;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const id = lastOpened.current;
    if (!id) return;
    const el = document.getElementById(`tpl-${id}`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      el.focus({ preventScroll: true });
    }
  }, [selected]);

  if (selected) return <TemplateDetail key={selected.id} tpl={selected} />;

  const filtered = TEMPLATES.filter((t) => (filterType === 'all' || t.type === filterType) && (filterLevel === 'all' || t.level === filterLevel));

  return (
    <div className="page-container page-container--wide">
      <PageHeader back="/practice" icon="✉️" title="Psaní — tipy a šablony" subtitle="Nauč se strukturovat různé typy textů: struktura, užitečné fráze a vzorový text." />

      <div className="card mb-5 space-y-4 !p-4">
        <Segmented
          label="Typ textu"
          value={filterType}
          onChange={setFilterType}
          options={[
            { value: 'all', label: 'Vše' },
            ...TYPES.map((t) => ({ value: t, label: `${typeMeta(t).icon} ${typeMeta(t).label}` })),
          ]}
        />
        <Segmented
          label="Úroveň"
          size="sm"
          value={filterLevel}
          onChange={setFilterLevel}
          options={[{ value: 'all', label: 'Všechny úrovně' }, ...LEVELS.map((l) => ({ value: l, label: l }))]}
        />
      </div>

      <p className="mb-3 text-sm text-muted" aria-live="polite">
        {filtered.length} {plural(filtered.length, 'šablona', 'šablony', 'šablon')}
      </p>

      {filtered.length === 0 ? (
        <p className="card text-center text-muted">Pro tuto kombinaci filtrů tu zatím nic není.</p>
      ) : (
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {filtered.map((tpl) => {
            const meta = typeMeta(tpl.type);
            const range = wordRange(tpl);
            return (
              <li key={tpl.id}>
                <button
                  id={`tpl-${tpl.id}`}
                  type="button"
                  className="card card-link flex h-full w-full items-center gap-3 !p-4 text-left"
                  onClick={() => setParams({ t: tpl.id })}
                >
                  <span className="tile-icon" aria-hidden="true">{meta.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold text-fg">{tpl.titleCs}</span>
                    <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                      <LevelBadge level={tpl.level} />
                      <span>{meta.label}</span>
                      {range && <span>· {range[0]}–{range[1]} slov</span>}
                    </span>
                  </span>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle" aria-hidden="true">
                    <path d="m9 6 6 6-6 6" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ─── Detail ──────────────────────────────────────────────────────── */

function StructureBlock({ text }: { text: string }) {
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const intro = lines[0]?.endsWith(':') ? lines[0] : null;
  const rest = intro ? lines.slice(1) : lines;
  const steps = rest.filter((l) => /^\d+[.)]\s/.test(l));
  const notes = rest.filter((l) => !/^\d+[.)]\s/.test(l));
  return (
    <>
      {intro && <p className="mb-3 text-sm text-muted">{intro}</p>}
      {steps.length > 0 && (
        <ol className="space-y-2.5">
          {steps.map((l, i) => {
            const m = /^(\d+)[.)]\s+(.*)$/.exec(l)!;
            const [head, ...tail] = m[2].split(/\s+[–—-]\s+/);
            return (
              <li key={`${i}-${l}`} className="flex items-start gap-3">
                <span className="exam-task-no !h-7 !min-w-7 !text-xs" aria-hidden="true">{m[1]}</span>
                <span className="leading-relaxed text-fg">
                  {tail.length ? (
                    <>
                      <strong>{head}</strong> – {tail.join(' – ')}
                    </>
                  ) : (
                    m[2]
                  )}
                </span>
              </li>
            );
          })}
        </ol>
      )}
      {notes.map((l, i) => (
        <p key={`${i}-${l}`} className="feedback feedback--info mt-4 text-sm leading-relaxed text-fg">
          <span aria-hidden="true">💡 </span>
          {l}
        </p>
      ))}
    </>
  );
}

function TemplateDetail({ tpl }: { tpl: Tpl }) {
  const { settings } = useSettings();
  const [playing, setPlaying] = useState(false);
  const meta = typeMeta(tpl.type);
  const range = wordRange(tpl);
  const idx = TEMPLATES.findIndex((t) => t.id === tpl.id);
  const prev = idx > 0 ? TEMPLATES[idx - 1] : null;
  const next = idx < TEMPLATES.length - 1 ? TEMPLATES[idx + 1] : null;

  useEffect(() => () => stopSpeaking(), []);

  const toggleModel = () => {
    if (playing) {
      stopSpeaking();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    void speak(speakable(tpl.example), settings.ttsRate * 0.95).then(() => setPlaying(false));
  };

  return (
    <div className="page-container page-container--wide">
      <PageHeader back="/writing" backLabel="Všechny šablony" icon={meta.icon} title={tpl.titleCs} subtitle={meta.label} />

      <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2 text-sm text-muted">
        <LevelBadge level={tpl.level} />
        {range && <span>Doporučená délka {range[0]}–{range[1]} slov</span>}
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <section className="card !p-5" aria-labelledby="w-structure">
            <h2 id="w-structure" className="section-title">Struktura</h2>
            <StructureBlock text={tpl.structureCs} />
          </section>

          <section className="card !p-5" aria-labelledby="w-phrases">
            <h2 id="w-phrases" className="section-title">Užitečné fráze</h2>
            <ul className="divide-y divide-border">
              {tpl.usefulPhrases.map((phrase, i) => (
                <li key={`${i}-${phrase.en}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold break-words text-fg" lang="en">{phrase.en}</p>
                    <p className="text-sm text-muted">{phrase.cs}</p>
                  </div>
                  <SpeakButton onClick={() => void speak(speakable(phrase.en), settings.ttsRate)} label={`Přehrát: ${phrase.en}`} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="space-y-4">
          <section className="card !p-5" aria-labelledby="w-model">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="w-model" className="section-title !mb-0">Ukázkový text</h2>
              <button type="button" className="btn-soft btn-sm !min-h-[44px]" onClick={toggleModel} aria-pressed={playing}>
                {playing ? '⏹ Zastavit' : '🔊 Přehrát celý'}
              </button>
            </div>
            <div className="rounded-md bg-surface-2 p-4">
              <p className="reading-text whitespace-pre-line" lang="en">{tpl.example}</p>
            </div>
            <p className="mt-2 text-xs text-subtle">Vzorový text má {countWords(tpl.example)} {words(countWords(tpl.example))}.</p>
          </section>

          <WritingPractice key={tpl.id} tpl={tpl} range={range} />
        </div>
      </div>

      <nav className="mt-5 grid grid-cols-2 gap-3" aria-label="Další šablony">
        {prev ? (
          <Link to={`/writing?t=${prev.id}`} className="card card-link flex min-h-[44px] flex-col !p-3 no-underline">
            <span className="text-xs text-muted">← Předchozí</span>
            <span className="truncate font-bold text-fg">{prev.titleCs}</span>
          </Link>
        ) : <span />}
        {next ? (
          <Link to={`/writing?t=${next.id}`} className="card card-link flex min-h-[44px] flex-col !p-3 text-right no-underline">
            <span className="text-xs text-muted">Další →</span>
            <span className="truncate font-bold text-fg">{next.titleCs}</span>
          </Link>
        ) : <span />}
      </nav>
    </div>
  );
}

/* ─── Word counter ────────────────────────────────────────────────── */

const DRAFT_KEY = (id: string) => `anglictina_writing_draft_${id}`;

function readDraft(id: string): string {
  try {
    return localStorage.getItem(DRAFT_KEY(id)) ?? '';
  } catch {
    return '';
  }
}

function writeDraft(id: string, text: string) {
  try {
    if (text) localStorage.setItem(DRAFT_KEY(id), text);
    else localStorage.removeItem(DRAFT_KEY(id));
  } catch {
    /* storage blocked — the draft just isn't kept */
  }
}

function WritingPractice({ tpl, range }: { tpl: Tpl; range: [number, number] | null }) {
  const [text, setText] = useState(() => readDraft(tpl.id));
  const inputId = useId();
  const count = countWords(text);

  const change = (v: string) => {
    setText(v);
    writeDraft(tpl.id, v);
  };

  const clear = async () => {
    if (count > 5) {
      const ok = await safeConfirm({ title: 'Smazat text?', message: 'Tvůj rozepsaný text se smaže.', confirmLabel: 'Smazat', cancelLabel: 'Ponechat', danger: true });
      if (!ok) return;
    }
    change('');
  };

  let tone: 'accent' | 'success' | 'warning' | 'danger' = 'accent';
  let status = range ? `Doporučený rozsah je ${range[0]}–${range[1]} slov.` : 'Piš podle struktury vlevo a použij pár frází.';
  let statusCls = 'text-muted';
  if (range && count > 0) {
    if (count < range[0]) {
      tone = 'warning';
      status = `Ještě aspoň ${range[0] - count} ${words(range[0] - count)} do doporučeného rozsahu.`;
      statusCls = 'text-warning';
    } else if (count <= range[1]) {
      tone = 'success';
      status = 'Jsi v doporučeném rozsahu. 👍';
      statusCls = 'text-success';
    } else {
      tone = 'danger';
      status = `O ${count - range[1]} ${words(count - range[1])} víc, než je doporučeno — zkus text zkrátit.`;
      statusCls = 'text-danger';
    }
  }

  return (
    <section className="card !p-5" aria-labelledby={`${inputId}-h`}>
      <h2 id={`${inputId}-h`} className="section-title !mb-1">Vyzkoušej si psaní</h2>
      <p className="mb-3 text-sm text-muted">Napiš vlastní text podle šablony. Rozepsaný text se ti tu uloží.</p>
      <label htmlFor={inputId} className="sr-only">Tvůj text</label>
      <textarea
        id={inputId}
        className="input min-h-[12rem] resize-y leading-relaxed"
        lang="en"
        spellCheck={false}
        autoCapitalize="sentences"
        placeholder={`Začni psát anglicky… (${typeMeta(tpl.type).label.toLowerCase()})`}
        value={text}
        onChange={(e) => change(e.target.value)}
      />
      <div className="mt-3 flex items-center gap-3">
        {range ? (
          <ProgressBar className="flex-1" value={count} max={range[1]} tone={tone} label="Počet slov vzhledem k doporučenému rozsahu" />
        ) : (
          <span className="flex-1" />
        )}
        <span className="shrink-0 text-sm font-bold text-fg tabular-nums" aria-live="polite">
          {count} {words(count)}
          {range && <span className="font-medium text-muted"> / {range[0]}–{range[1]}</span>}
        </span>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <p className={`text-sm ${statusCls}`}>{status}</p>
        {text && (
          <button type="button" className="btn-ghost btn-sm" onClick={() => void clear()}>
            Smazat text
          </button>
        )}
      </div>
    </section>
  );
}
