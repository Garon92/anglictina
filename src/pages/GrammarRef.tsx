import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useSettings } from '../App';
import { GRAMMAR_REFERENCE } from '../data/grammarReference';
import { speak } from '../tts';
import { PageHeader, SpeakButton } from '../components/ui';
import type { GrammarTopic } from '../types';

const LEVELS = ['A1', 'A2', 'B1'] as const;

const LEVEL_INFO: Record<GrammarTopic['level'], { name: string; cls: string }> = {
  A1: { name: 'Základy', cls: 'bg-success-soft text-success' },
  A2: { name: 'Mírně pokročilí', cls: 'bg-info-soft text-info' },
  B1: { name: 'Maturitní úroveň', cls: 'bg-accent-soft text-accent-text' },
};

/** Grammar-reference topics that have their own page in the tense overview. */
const TENSE_LINKS: Record<string, string> = {
  present_simple: 'present_simple',
  present_continuous: 'present_continuous',
  past_simple: 'past_simple',
  past_continuous: 'past_continuous',
  present_perfect: 'present_perfect',
  future: 'future_will',
  conditionals: 'conditionals',
};

function fold(s: string) {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function LevelBadge({ level }: { level: GrammarTopic['level'] }) {
  return <span className={`badge ${LEVEL_INFO[level].cls}`}>{level}</span>;
}

function Chevron() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle" aria-hidden="true">
      <path d="m9 6 6 6-6 6" />
    </svg>
  );
}

export default function GrammarRef() {
  const [params, setParams] = useSearchParams();
  const selectedId = params.get('t');
  const topic = selectedId ? GRAMMAR_REFERENCE.find((t) => t.id === selectedId) ?? null : null;
  const [query, setQuery] = useState('');
  const lastOpened = useRef<string | null>(null);

  // Detail opens at the top; the list returns to the topic you came from.
  useEffect(() => {
    if (topic) {
      lastOpened.current = topic.id;
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      return;
    }
    const id = lastOpened.current;
    if (!id) return;
    const el = document.getElementById(`topic-${id}`);
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' as ScrollBehavior });
      el.focus({ preventScroll: true });
    }
  }, [topic]);

  const q = fold(query.trim());
  const filtered = useMemo(
    () => (q ? GRAMMAR_REFERENCE.filter((t) => fold(`${t.titleCs} ${t.titleEn} ${t.keyRules.join(' ')}`).includes(q)) : GRAMMAR_REFERENCE),
    [q],
  );

  if (topic) return <TopicDetail topic={topic} />;

  return (
    <div className="page-container page-container--wide">
      <PageHeader
        back="/practice"
        icon="📋"
        title="Přehled gramatiky"
        subtitle="Stručná pravidla anglické gramatiky v češtině — s příklady, které si můžeš poslechnout."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="relative block">
          <span className="sr-only">Hledat téma</span>
          <svg className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-subtle" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" strokeLinecap="round" />
          </svg>
          <input
            className="input !pl-10"
            type="search"
            placeholder="Hledat téma… (např. členy, trpný rod, will)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <Link to="/tenses" className="btn-secondary">⏱️ Přehled časů</Link>
          <Link to="/cheatsheet" className="btn-secondary">🖨️ Tahák</Link>
        </div>
      </div>

      {filtered.length === 0 && (
        <p className="card text-center text-muted">Takové téma tu nemáme. Zkus jiné slovo.</p>
      )}

      <div className="space-y-7">
        {LEVELS.map((level) => {
          const topics = filtered.filter((t) => t.level === level);
          if (topics.length === 0) return null;
          return (
            <section key={level} aria-labelledby={`lvl-${level}`}>
              <h2 id={`lvl-${level}`} className="mb-2.5 flex items-center gap-2">
                <LevelBadge level={level} />
                <span className="text-lg font-black text-fg">{LEVEL_INFO[level].name}</span>
                <span className="text-sm text-muted">· {topics.length}</span>
              </h2>
              <ul className="grid gap-2.5 sm:grid-cols-2">
                {topics.map((t) => (
                  <li key={t.id}>
                    <button
                      id={`topic-${t.id}`}
                      type="button"
                      className="card card-link flex h-full w-full items-center gap-3 !p-4 text-left"
                      onClick={() => setParams({ t: t.id })}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-bold text-fg">{t.titleCs}</span>
                        <span className="block text-sm text-muted" lang="en">{t.titleEn}</span>
                      </span>
                      <Chevron />
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <section className="card g92-card--accent mt-8 flex flex-wrap items-center gap-4 !p-5">
        <span className="text-3xl" aria-hidden="true">✏️</span>
        <div className="min-w-0 flex-1">
          <h2 className="font-black text-fg">Pravidla máš projitá?</h2>
          <p className="text-sm text-muted">Ověř si je v gramatickém mixu — časy, modální slovesa, členy a další.</p>
        </div>
        <Link to="/grammar" className="btn-primary">Otestuj se</Link>
      </section>
    </div>
  );
}

/* ─── Detail ──────────────────────────────────────────────────────── */

function TopicDetail({ topic }: { topic: GrammarTopic }) {
  const { settings } = useSettings();
  const idx = GRAMMAR_REFERENCE.findIndex((t) => t.id === topic.id);
  const prev = idx > 0 ? GRAMMAR_REFERENCE[idx - 1] : null;
  const next = idx < GRAMMAR_REFERENCE.length - 1 ? GRAMMAR_REFERENCE[idx + 1] : null;
  const tenseId = TENSE_LINKS[topic.id];
  const paragraphs = topic.explanationCs.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);

  return (
    <div className="page-container">
      <PageHeader back="/grammar-ref" backLabel="Přehled gramatiky" title={topic.titleCs} subtitle={<span lang="en">{topic.titleEn}</span>} />

      <div className="-mt-2 mb-5 flex flex-wrap items-center gap-2">
        <LevelBadge level={topic.level} />
        <span className="text-sm text-muted">{LEVEL_INFO[topic.level].name}</span>
      </div>

      <div className="space-y-4">
        <section className="card !p-5" aria-labelledby="g-rules">
          <h2 id="g-rules" className="section-title">Klíčová pravidla</h2>
          <ol className="space-y-2.5">
            {topic.keyRules.map((rule, i) => (
              <li key={`${i}-${rule}`} className="flex items-start gap-3 text-fg">
                <span className="exam-task-no !h-7 !min-w-7 !text-xs" aria-hidden="true">{i + 1}</span>
                <span className="leading-relaxed">{rule}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className="card !p-5" aria-labelledby="g-expl">
          <h2 id="g-expl" className="section-title">Vysvětlení</h2>
          <div className="reading-text max-w-prose">
            {paragraphs.map((p, i) => (
              <p key={`${i}-${p.slice(0, 24)}`} className="whitespace-pre-line">{p}</p>
            ))}
          </div>
        </section>

        <section className="card !p-5" aria-labelledby="g-ex">
          <h2 id="g-ex" className="section-title">Příklady</h2>
          <ul className="divide-y divide-border">
            {topic.examples.map((ex, i) => (
              <li key={`${i}-${ex.en}`} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
                <SpeakButton onClick={() => void speak(ex.en, settings.ttsRate)} label={`Přehrát: ${ex.en}`} />
                <div className="min-w-0">
                  <p className="font-bold text-fg" lang="en">{ex.en}</p>
                  <p className="text-sm text-muted">{ex.cs}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card g92-card--accent flex flex-wrap items-center gap-3 !p-5">
          <span className="text-3xl" aria-hidden="true">✏️</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-fg">Otestuj se</h2>
            <p className="text-sm text-muted">Vyzkoušej si pravidla v praxi v gramatickém mixu.</p>
          </div>
          <Link to="/grammar" className="btn-primary">Procvičit</Link>
        </section>

        {tenseId && (
          <p className="text-center text-sm text-muted">
            Tvorbu a signální slova přehledně najdeš v <Link to={`/tenses?t=${tenseId}`}>přehledu časů</Link>.
          </p>
        )}

        <nav className="grid grid-cols-2 gap-3 pt-1" aria-label="Další témata">
          {prev ? (
            <Link to={`/grammar-ref?t=${prev.id}`} className="card card-link flex min-h-[44px] flex-col !p-3 no-underline">
              <span className="text-xs text-muted">← Předchozí</span>
              <span className="truncate font-bold text-fg">{prev.titleCs}</span>
            </Link>
          ) : <span />}
          {next ? (
            <Link to={`/grammar-ref?t=${next.id}`} className="card card-link flex min-h-[44px] flex-col !p-3 text-right no-underline">
              <span className="text-xs text-muted">Další →</span>
              <span className="truncate font-bold text-fg">{next.titleCs}</span>
            </Link>
          ) : <span />}
        </nav>
      </div>
    </div>
  );
}
