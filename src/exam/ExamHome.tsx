import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { safeConfirm } from '../lib/confirm';
import { getExamSessions } from '../db';
import type { ExamSession } from '../types';
import { EXAM_SETS } from './sets';
import { PARTS, SUBTESTS, partMax, FULL_MINUTES, LISTENING_MINUTES, READING_MINUTES, MODE_LABELS, type PartNo, type ExamMode } from './structure';
import { loadRun, clearRun, partHistory, pickSetForPart, setTitle, runParts, remainingTime, partLabel, type ExamRun } from './run';
import { answeredCount } from './scoring';
import { attemptLabel, passedAttempt, scoreText, skillSummary } from './history';
import { PageHeader, ProgressBar } from '../components/ui';
import { useSettings } from '../App';
import { daysUntil, czechPlural } from '../lib/dates';

const CERMAT_URL = 'https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi';

export default function ExamHome() {
  const navigate = useNavigate();
  const { settings } = useSettings();
  const [current, setCurrent] = useState<ExamRun | null>(null);
  const [history, setHistory] = useState<ExamSession[]>([]);
  const [parts, setParts] = useState<Record<number, { best: number; sets: Set<string> }>>({});
  const [setId, setSetId] = useState<string>(EXAM_SETS[0].id);
  const [mode, setMode] = useState<ExamMode>('full');

  useEffect(() => {
    loadRun().then((r) => setCurrent(r ?? null)).catch(() => {});
    getExamSessions().then((s) => {
      const sorted = s.sort((a, b) => b.startedAt - a.startedAt);
      setHistory(sorted);
      // Suggest the first set that hasn't been done as a full test yet.
      const done = new Set(sorted.filter((x) => x.mode === 'full').map((x) => x.setId));
      const next = EXAM_SETS.find((x) => !done.has(x.id));
      if (next) setSetId(next.id);
    }).catch(() => {});
    partHistory().then(setParts).catch(() => {});
  }, []);

  async function start(url: string) {
    if (current) {
      const ok = await safeConfirm({
        title: 'Zahodit rozpracovaný test?',
        message: 'Máš rozpracovaný test. Když začneš nový, rozpracované odpovědi se smažou.',
        confirmLabel: 'Začít nový',
        cancelLabel: 'Zpět',
        danger: true,
      });
      if (!ok) return;
      await clearRun();
    }
    navigate(url);
  }

  const bestBySet = new Map<string, number>();
  for (const h of history) {
    if (h.mode !== 'full' || !h.setId) continue;
    bestBySet.set(h.setId, Math.max(bestBySet.get(h.setId) ?? 0, h.scoreTotal));
  }
  // All v2 attempts (full, listening-only, reading-only, part training) with details.
  const recentAttempts = history.filter((h) => h.partPoints && h.id !== undefined);
  const days = daysUntil(settings.examDate);

  return (
    <div className="page-container page-container--wide">
      <PageHeader
        title="Maturita nanečisto"
        subtitle="Cvičné didaktické testy ve stejném formátu jako u maturity: poslech, čtení a jazyková kompetence."
        back={null}
        actions={days >= 0 ? <span className="badge !px-3 !py-1.5 !text-sm">🎓 {days} {czechPlural(days, 'den', 'dny', 'dní')}</span> : undefined}
      />

      {current && <ResumeCard run={current} onDiscard={async () => { await clearRun(); setCurrent(null); }} />}

      {/* Full test */}
      <section className="card g92-card--accent !p-5" aria-labelledby="full-title">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <h2 id="full-title" className="text-xl font-black text-fg">Cvičný didaktický test</h2>
            <p className="text-sm text-muted">
              10 částí · 64 úloh · 100 bodů · {FULL_MINUTES} minut · hranice úspěšnosti 44 %. Nahrávky zazní nejvýše dvakrát,
              odpovědi uvidíš až po odevzdání.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <div className="eyebrow mb-2">Rozsah</div>
          <div className="flex flex-wrap gap-2">
            <ModeChip value="full" current={mode} onPick={setMode} label={`Celý test · ${FULL_MINUTES} min`} />
            <ModeChip value="listening" current={mode} onPick={setMode} label={`Jen poslech · ${LISTENING_MINUTES} min`} />
            <ModeChip value="reading" current={mode} onPick={setMode} label={`Čtení + jazyk · ${READING_MINUTES} min`} />
          </div>
        </div>

        <div className="mt-4">
          <div className="eyebrow mb-2">Sada</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {EXAM_SETS.map((s) => {
              const best = bestBySet.get(s.id);
              return (
                <button key={s.id} type="button" className={`exam-setcard ${setId === s.id ? 'is-selected' : ''}`} aria-pressed={setId === s.id} onClick={() => setSetId(s.id)}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-black text-fg">{s.title}</span>
                    {best !== undefined && (
                      <span className={`badge ${best >= 44 ? '!bg-success-soft !text-success' : '!bg-danger-soft !text-danger'}`}>{best} b</span>
                    )}
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted">{s.descriptionCs}</span>
                </button>
              );
            })}
            <button type="button" className={`exam-setcard ${setId === 'mix' ? 'is-selected' : ''}`} aria-pressed={setId === 'mix'} onClick={() => setSetId('mix')}>
              <span className="font-black text-fg">🎲 Náhodný mix</span>
              <span className="mt-0.5 block text-xs leading-snug text-muted">Každá část z jiné sady — pokaždé jiná kombinace.</span>
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button type="button" className="btn-primary btn-lg" onClick={() => void start(`/exam/run?mode=${mode}&set=${setId}`)}>
            Spustit test
          </button>
          <span className="text-xs text-muted">Test se průběžně ukládá — můžeš ho přerušit a pokračovat později.</span>
        </div>
      </section>

      {/* Parts */}
      <section className="mt-7" aria-labelledby="parts-title">
        <h2 id="parts-title" className="section-title">Trénink po částech</h2>
        <p className="-mt-2 mb-3 text-sm text-muted">Bez časového limitu, nahrávky můžeš pouštět opakovaně a po kontrole uvidíš přepis i vysvětlení.</p>
        {(['listening', 'reading', 'language'] as const).map((sub) => (
          <div key={sub} className="mb-4">
            <div className="mb-2 text-sm font-black text-muted">{SUBTESTS[sub].icon} {SUBTESTS[sub].title} · {SUBTESTS[sub].parts.reduce((s, p) => s + partMax(p), 0)} bodů</div>
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {PARTS.filter((p) => p.subtest === sub).map((p) => {
                const h = parts[p.no];
                return (
                  <button
                    key={p.no}
                    type="button"
                    className="card card-link flex flex-col gap-1 !p-4 text-left"
                    onClick={() => void start(`/exam/run?mode=part&part=${p.no}&set=${pickSetForPart(h?.sets)}&practice=1&timed=0`)}
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl" aria-hidden="true">{p.icon}</span>
                      <span className="text-xs font-black text-muted">Část {p.no} · {partMax(p.no)} b</span>
                      {h && <span className="ml-auto text-xs font-black tabular-nums text-success">{Math.round(h.best * 100)} %</span>}
                    </span>
                    <span className="font-bold leading-snug text-fg">{p.title}</span>
                    <span className="text-xs text-muted">{p.kind}</span>
                    {h && <ProgressBar value={h.best} className="mt-1 !h-1.5" tone={h.best >= 0.7 ? 'success' : h.best >= 0.44 ? 'warning' : 'danger'} label={`Nejlepší výsledek části ${p.no}`} />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </section>

      {/* History */}
      {recentAttempts.length > 0 && (
        <section className="mt-3" aria-labelledby="hist-title">
          <div className="mb-2 flex items-center justify-between">
            <h2 id="hist-title" className="section-title !mb-0">Poslední pokusy</h2>
            <Link to="/review?tab=exams" className="text-sm font-bold">Všechny výsledky →</Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2">
            {recentAttempts.slice(0, 6).map((h) => {
              const ok = passedAttempt(h);
              const set = h.setId === 'mix' ? 'Mix' : EXAM_SETS.find((s) => s.id === h.setId)?.title ?? 'Test';
              const partNo = h.mode === 'part' && h.parts?.length === 1 ? h.parts[0] : null;
              return (
                <li key={h.id} className="min-w-0">
                  <Link to={`/exam/history/${h.id}`} className="card card-link flex items-center gap-3 !p-3 no-underline">
                    <span className={`grid h-12 min-w-12 place-items-center rounded-xl px-1 text-base font-black tabular-nums ${ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger'}`}>{scoreText(h)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="truncate font-bold text-fg">{partNo ? `Část ${partNo} · ${set}` : set}</span>
                        <span className="badge shrink-0 !text-[0.65rem]">{attemptLabel(h)}</span>
                      </span>
                      <span className="block truncate text-xs text-muted">
                        {new Date(h.startedAt).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'long' })}
                        {!partNo && ` · ${skillSummary(h)}`}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-muted">›</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Official tests */}
      <section className="card mt-7 !p-5" aria-labelledby="official-title">
        <div className="flex flex-wrap items-start gap-4">
          <span className="text-4xl" aria-hidden="true">📄</span>
          <div className="min-w-0 flex-1">
            <h2 id="official-title" className="text-lg font-black text-fg">Oficiální testy CERMAT</h2>
            <p className="text-sm text-muted">
              Zadání, nahrávky a klíče z minulých let najdeš na webu CERMAT. Vytiskni si test a spusť časovač — hlídá
              110 minut a rozdělení na poslech a čtení.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={CERMAT_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary">Testy na maturita.cermat.cz ↗</a>
              <Link to="/exam/timer" className="btn-soft">⏱ Časovač k testu</Link>
            </div>
          </div>
        </div>
      </section>

      <details className="card mt-4 !p-5">
        <summary className="cursor-pointer font-black text-fg">Jak vypadá didaktický test z angličtiny?</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="text-xs text-muted">
                <th className="py-1 pr-2">Část</th>
                <th className="py-1 pr-2">Úlohy</th>
                <th className="py-1 pr-2">Typ</th>
                <th className="py-1 text-right">Body</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {PARTS.map((p) => (
                <tr key={p.no}>
                  <td className="py-1.5 pr-2 font-bold text-fg">{p.no}. {SUBTESTS[p.subtest].title}</td>
                  <td className="py-1.5 pr-2 tabular-nums text-muted">{p.firstTask}–{p.firstTask + p.items - 1}</td>
                  <td className="py-1.5 pr-2 text-muted">{p.kind}</td>
                  <td className="py-1.5 text-right tabular-nums text-fg">{partMax(p.no)} ({p.pointsPerItem}/úloha)</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs text-muted">
            Celkem 64 úloh a 100 bodů (poslech 40, čtení 40, jazyková kompetence 20), 110 minut, hranice úspěšnosti 44 %.
            Za chybnou nebo chybějící odpověď se body neodečítají. Každá nahrávka zazní dvakrát. Texty v aplikaci jsou
            původní cvičné materiály, formát odpovídá testům CERMAT.
          </p>
        </div>
      </details>
    </div>
  );
}

function ModeChip({ value, current, onPick, label }: { value: ExamMode; current: ExamMode; onPick: (m: ExamMode) => void; label: string }) {
  return (
    <button type="button" className="g92-chip" aria-pressed={value === current} onClick={() => onPick(value)}>
      {label}
    </button>
  );
}

function ResumeCard({ run, onDiscard }: { run: ExamRun; onDiscard: () => void }) {
  const parts = runParts(run);
  const total = parts.reduce((s, p) => s + PARTS[p - 1].items, 0);
  const done = parts.reduce((s, p) => s + answeredCount(p as PartNo, run.answers), 0);
  const ms = remainingTime(run);
  const left = ms === null ? null : Math.max(0, Math.round(ms / 60000));
  const title = run.mode === 'part' && run.part ? `Trénink · ${partLabel(run.part)}` : `${setTitle(run)} · ${MODE_LABELS[run.mode]}`;
  return (
    <section className="card mb-5 !border-warning !p-4" aria-label="Rozpracovaný test">
      <div className="flex items-start gap-3">
        <span className="text-3xl" aria-hidden="true">⏸️</span>
        <div className="min-w-0 flex-1">
          <div className="eyebrow">Rozpracovaný test</div>
          <div className="font-black text-fg">{title}</div>
          <div className="text-sm text-muted">
            Vyplněno {done} z {total}
            {left !== null && ` · ${left > 0 ? `zbývá ${left} min (čas stojí)` : 'čas vypršel'}`}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          className="btn-ghost"
          onClick={async () => {
            const ok = await safeConfirm({
              title: 'Zahodit rozpracovaný test?',
              message: 'Vyplněné odpovědi se smažou a test se nezapočítá.',
              confirmLabel: 'Zahodit',
              cancelLabel: 'Ponechat',
              danger: true,
            });
            if (ok) onDiscard();
          }}
        >
          Zahodit
        </button>
        <Link to="/exam/run" className="btn-primary">Pokračovat v testu</Link>
      </div>
    </section>
  );
}
