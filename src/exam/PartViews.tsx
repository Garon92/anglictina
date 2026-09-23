import { Fragment, type ReactNode } from 'react';
import type { ExamSet, PictureOption } from './types';
import type { ExamAnswers } from './scoring';
import { itemResults, isOpenAnswerCorrect } from './scoring';
import { LETTERS, partInfo, type PartNo } from './structure';
import ListeningPlayer from './ListeningPlayer';
import { wordCount, displayAnswer } from '../lib/answer';

export interface PartViewProps {
  part: PartNo;
  set: ExamSet;
  answers: ExamAnswers;
  onChange: (next: ExamAnswers) => void;
  /** Show correct/incorrect marks and explanations (read-only). */
  review: boolean;
  /** Training mode — unlimited replays. */
  practice: boolean;
  plays: Record<string, number>;
  onPlay: (key: string) => void;
}

export default function PartView(props: PartViewProps) {
  switch (props.part) {
    case 1: return <Part1 {...props} />;
    case 2: return <Part2 {...props} />;
    case 3: return <Part3 {...props} />;
    case 4: return <Part4 {...props} />;
    case 5: return <Part5 {...props} />;
    case 6: return <Part6 {...props} />;
    case 7: return <Part7 {...props} />;
    case 8: return <Part8 {...props} />;
    case 9: return <Part9 {...props} />;
    case 10: return <Part10 {...props} />;
  }
}

/* ─── helpers ──────────────────────────────────────────────────────── */

function taskNo(part: PartNo, i: number) {
  return partInfo(part).firstTask + i;
}

function set<K extends keyof ExamAnswers>(a: ExamAnswers, key: K, i: number, v: ExamAnswers[K][number]): ExamAnswers {
  const arr = [...(a[key] as unknown[])] as ExamAnswers[K];
  (arr as unknown[])[i] = v;
  return { ...a, [key]: arr };
}

function Player({ p, k, script, intro, label }: { p: PartViewProps; k: string; script: string; intro?: string; label?: string }) {
  return (
    <ListeningPlayer
      script={script}
      intro={intro}
      maxPlays={p.practice || p.review ? Infinity : 2}
      used={p.plays[k] ?? 0}
      onPlay={() => p.onPlay(k)}
      showTranscript={p.review}
      label={label}
    />
  );
}

function TaskHeader({ no, children, result }: { no: number; children: ReactNode; result?: boolean }) {
  return (
    <div className="mb-2 flex items-start gap-2.5">
      <span className={`exam-task-no ${result === true ? 'is-ok' : result === false ? 'is-bad' : ''}`}>{no}</span>
      <div className="min-w-0 flex-1 pt-0.5 font-bold text-fg" lang="en">{children}</div>
    </div>
  );
}

function Explain({ show, ok, children, answer }: { show: boolean; ok: boolean; children: ReactNode; answer?: ReactNode }) {
  if (!show) return null;
  return (
    <div className={`feedback mt-2 !py-2 text-sm ${ok ? 'feedback--ok' : 'feedback--bad'}`}>
      {!ok && answer && <div className="font-bold text-fg">Správně: <span lang="en">{answer}</span></div>}
      <div className="text-muted">{children}</div>
    </div>
  );
}

function Choice({
  letter, label, selected, onClick, disabled, state, lang = 'en',
}: {
  letter: string;
  label: ReactNode;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
  state?: 'correct' | 'wrong' | 'dim';
  lang?: string;
}) {
  const cls = `opt ${state === 'correct' ? 'is-correct' : state === 'wrong' ? 'is-wrong' : state === 'dim' ? 'is-dim' : selected ? 'is-selected' : ''}`;
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-pressed={selected} lang={lang}>
      <span className="opt__key" aria-hidden="true">{letter}</span>
      <span className="flex-1">{label}</span>
    </button>
  );
}

function McqOptions({
  options, value, onPick, review, answer,
}: {
  options: string[];
  value: number | null;
  onPick: (i: number) => void;
  review: boolean;
  answer: number;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2" role="radiogroup">
      {options.map((o, i) => (
        <Choice
          key={i}
          letter={LETTERS[i]}
          label={o}
          selected={value === i}
          onClick={() => onPick(i)}
          disabled={review}
          state={review ? (i === answer ? 'correct' : i === value ? 'wrong' : 'dim') : undefined}
        />
      ))}
    </div>
  );
}

function TrueFalse({ value, onPick, review, answer }: { value: boolean | null; onPick: (v: boolean) => void; review: boolean; answer: boolean }) {
  const st = (v: boolean) => (review ? (v === answer ? 'correct' : v === value ? 'wrong' : 'dim') : undefined);
  return (
    <div className="flex shrink-0 gap-2" role="radiogroup" aria-label="Pravda, nebo nepravda">
      {([true, false] as const).map((v) => (
        <button
          key={String(v)}
          type="button"
          className={`exam-tf opt !min-h-[44px] !w-auto !px-3 ${st(v) === 'correct' ? 'is-correct' : st(v) === 'wrong' ? 'is-wrong' : st(v) === 'dim' ? 'is-dim' : value === v ? 'is-selected' : ''}`}
          aria-pressed={value === v}
          disabled={review}
          onClick={() => onPick(v)}
          title={v ? 'Pravda' : 'Nepravda'}
        >
          <span className="font-black">{v ? 'P' : 'N'}</span>
          <span className="hidden text-xs sm:inline">{v ? 'pravda' : 'nepravda'}</span>
        </button>
      ))}
    </div>
  );
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="reading-text" lang="en">
      {text.split(/\n+/).map((para, i) => <p key={i}>{para}</p>)}
    </div>
  );
}

/* ─── Part 1: pictures ─────────────────────────────────────────────── */

function Part1(p: PartViewProps) {
  const res = p.review ? itemResults(1, p.set, p.answers) : [];
  return (
    <div className="space-y-6">
      {p.set.part1.items.map((it, i) => (
        <section key={i} className="card !p-4">
          <TaskHeader no={taskNo(1, i)} result={p.review ? res[i] : undefined}>{it.question}</TaskHeader>
          <Player p={p} k={`p1-${i}`} script={it.script} intro={it.question} />
          <div className="mt-3 grid grid-cols-2 gap-2 lg:grid-cols-4" role="radiogroup">
            {it.options.map((o, j) => (
              <PictureChoice
                key={j}
                letter={LETTERS[j]}
                option={o}
                selected={p.answers.p1[i] === j}
                disabled={p.review}
                state={p.review ? (j === it.answer ? 'correct' : j === p.answers.p1[i] ? 'wrong' : 'dim') : undefined}
                onClick={() => p.onChange(set(p.answers, 'p1', i, j))}
              />
            ))}
          </div>
          <Explain show={p.review} ok={!!res[i]} answer={`${LETTERS[it.answer]} – ${it.options[it.answer].caption}`}>{it.explanationCs}</Explain>
        </section>
      ))}
    </div>
  );
}

function PictureChoice({ letter, option, selected, disabled, state, onClick }: {
  letter: string; option: PictureOption; selected: boolean; disabled: boolean; state?: 'correct' | 'wrong' | 'dim'; onClick: () => void;
}) {
  const cls = `exam-pic ${state === 'correct' ? 'is-correct' : state === 'wrong' ? 'is-wrong' : state === 'dim' ? 'is-dim' : selected ? 'is-selected' : ''}`;
  return (
    <button type="button" className={cls} onClick={onClick} disabled={disabled} aria-pressed={selected} aria-label={`${letter}: ${option.caption}`}>
      <span className="exam-pic__letter" aria-hidden="true">{letter}</span>
      <span className="exam-pic__emoji" aria-hidden="true">{option.emoji}</span>
      <span className="exam-pic__caption" lang="en">{option.caption}</span>
    </button>
  );
}

/* ─── Part 2: dialogue true/false ──────────────────────────────────── */

function StatementList({ part, items, values, onPick, review, results }: {
  part: PartNo;
  items: { text: string; answer: boolean; explanationCs: string }[];
  values: (boolean | null)[];
  onPick: (i: number, v: boolean) => void;
  review: boolean;
  results: boolean[];
}) {
  return (
    <ol className="space-y-2">
      {items.map((st, i) => (
        <li key={i} className="rounded-2xl border border-border bg-surface p-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className={`exam-task-no ${review ? (results[i] ? 'is-ok' : 'is-bad') : ''}`}>{taskNo(part, i)}</span>
            <span className="min-w-[12rem] flex-1 text-fg" lang="en">{st.text}</span>
            <TrueFalse value={values[i]} onPick={(v) => onPick(i, v)} review={review} answer={st.answer} />
          </div>
          <Explain show={review} ok={results[i]} answer={st.answer ? 'P (pravda)' : 'N (nepravda)'}>{st.explanationCs}</Explain>
        </li>
      ))}
    </ol>
  );
}

function Part2(p: PartViewProps) {
  const res = p.review ? itemResults(2, p.set, p.answers) : [];
  return (
    <div className="space-y-4">
      <Player p={p} k="p2" script={p.set.part2.script} label="rozhovor" />
      <StatementList
        part={2}
        items={p.set.part2.statements}
        values={p.answers.p2}
        onPick={(i, v) => p.onChange(set(p.answers, 'p2', i, v))}
        review={p.review}
        results={res}
      />
    </div>
  );
}

/* ─── Part 3: open answers ─────────────────────────────────────────── */

function Part3(p: PartViewProps) {
  return (
    <div className="space-y-4">
      <Player p={p} k="p3" script={p.set.part3.script} label="nahrávku" />
      <p className="text-sm text-muted">Odpovídej anglicky, <strong>nejvýše 3 slovy</strong>. Čísla můžeš psát číslicemi.</p>
      <ol className="space-y-3">
        {p.set.part3.questions.map((q, i) => {
          const val = p.answers.p3[i] ?? '';
          const ok = p.review ? isOpenAnswerCorrect(val, q.accept, q.prefix, q.suffix) : undefined;
          const tooLong = !p.review && wordCount(val) > 3;
          return (
            <li key={i} className="rounded-2xl border border-border bg-surface p-3">
              <TaskHeader no={taskNo(3, i)} result={ok}>{q.question}</TaskHeader>
              <div className="flex flex-wrap items-center gap-2 pl-10" lang="en">
                {q.prefix && <span className="font-bold text-muted">{q.prefix}</span>}
                <input
                  className={`input !w-auto min-w-0 flex-1 ${ok === true ? '!border-success !bg-success-soft' : ok === false ? '!border-danger !bg-danger-soft' : ''}`}
                  value={val}
                  disabled={p.review}
                  onChange={(e) => p.onChange(set(p.answers, 'p3', i, e.target.value))}
                  aria-label={`Odpověď na úlohu ${taskNo(3, i)}`}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={60}
                />
                {q.suffix && <span className="font-bold text-muted">{q.suffix}</span>}
              </div>
              {tooLong && <p className="mt-1 pl-10 text-xs font-bold text-warning">Pozor: víc než 3 slova se u maturity počítá jako chyba.</p>}
              <Explain show={p.review} ok={!!ok} answer={q.accept.join(' / ')}>{q.explanationCs}</Explain>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/* ─── Part 4: short recordings MCQ ─────────────────────────────────── */

function Part4(p: PartViewProps) {
  const res = p.review ? itemResults(4, p.set, p.answers) : [];
  return (
    <div className="space-y-6">
      {p.set.part4.items.map((it, i) => (
        <section key={i} className="card !p-4">
          <TaskHeader no={taskNo(4, i)} result={p.review ? res[i] : undefined}>{it.question}</TaskHeader>
          <Player p={p} k={`p4-${i}`} script={it.script} intro={it.question} />
          <div className="mt-3">
            <McqOptions options={it.options} value={p.answers.p4[i]} onPick={(j) => p.onChange(set(p.answers, 'p4', i, j))} review={p.review} answer={it.answer} />
          </div>
          <Explain show={p.review} ok={!!res[i]} answer={`${LETTERS[it.answer]} – ${it.options[it.answer]}`}>{it.explanationCs}</Explain>
        </section>
      ))}
    </div>
  );
}

/* ─── Part 5: short texts ──────────────────────────────────────────── */

function Part5(p: PartViewProps) {
  const res = p.review ? itemResults(5, p.set, p.answers) : [];
  return (
    <div className="space-y-6">
      {p.set.part5.items.map((it, i) => (
        <section key={i} className="card !p-4">
          <div className="exam-notice mb-3" lang="en">
            {it.kind && <div className="exam-notice__kind">{it.kind}</div>}
            <Paragraphs text={it.text} />
          </div>
          <TaskHeader no={taskNo(5, i)} result={p.review ? res[i] : undefined}>{it.question}</TaskHeader>
          <McqOptions options={it.options} value={p.answers.p5[i]} onPick={(j) => p.onChange(set(p.answers, 'p5', i, j))} review={p.review} answer={it.answer} />
          <Explain show={p.review} ok={!!res[i]} answer={`${LETTERS[it.answer]} – ${it.options[it.answer]}`}>{it.explanationCs}</Explain>
        </section>
      ))}
    </div>
  );
}

/* ─── Part 6: info text true/false ─────────────────────────────────── */

function TwoColumn({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <div className="card !p-5 xl:sticky xl:top-[calc(var(--g92-appbar-total)+8.5rem)] xl:max-h-[calc(100dvh-var(--g92-appbar-total)-10rem)] xl:overflow-y-auto">{left}</div>
      <div>{right}</div>
    </div>
  );
}

function Part6(p: PartViewProps) {
  const res = p.review ? itemResults(6, p.set, p.answers) : [];
  return (
    <TwoColumn
      left={
        <>
          <h3 className="mb-2 text-xl font-black text-fg" lang="en">{p.set.part6.title}</h3>
          <Paragraphs text={p.set.part6.text} />
        </>
      }
      right={
        <StatementList
          part={6}
          items={p.set.part6.statements}
          values={p.answers.p6}
          onPick={(i, v) => p.onChange(set(p.answers, 'p6', i, v))}
          review={p.review}
          results={res}
        />
      }
    />
  );
}

/* ─── Part 7: article MCQ ──────────────────────────────────────────── */

function Part7(p: PartViewProps) {
  const res = p.review ? itemResults(7, p.set, p.answers) : [];
  return (
    <TwoColumn
      left={
        <>
          <h3 className="mb-2 text-xl font-black text-fg" lang="en">{p.set.part7.title}</h3>
          <Paragraphs text={p.set.part7.text} />
        </>
      }
      right={
        <div className="space-y-4">
          {p.set.part7.questions.map((q, i) => (
            <section key={i} className="card !p-4">
              <TaskHeader no={taskNo(7, i)} result={p.review ? res[i] : undefined}>{q.question}</TaskHeader>
              <div className="grid gap-2">
                {q.options.map((o, j) => (
                  <Choice
                    key={j}
                    letter={LETTERS[j]}
                    label={o}
                    selected={p.answers.p7[i] === j}
                    onClick={() => p.onChange(set(p.answers, 'p7', i, j))}
                    disabled={p.review}
                    state={p.review ? (j === q.answer ? 'correct' : j === p.answers.p7[i] ? 'wrong' : 'dim') : undefined}
                  />
                ))}
              </div>
              <Explain show={p.review} ok={!!res[i]} answer={`${LETTERS[q.answer]} – ${q.options[q.answer]}`}>{q.explanationCs}</Explain>
            </section>
          ))}
        </div>
      }
    />
  );
}

/* ─── Part 8: matching ─────────────────────────────────────────────── */

function Part8(p: PartViewProps) {
  const res = p.review ? itemResults(8, p.set, p.answers) : [];
  const usedBy = new Map<number, number>();
  p.answers.p8.forEach((v, i) => v !== null && usedBy.set(v, i));
  return (
    <div className="grid items-start gap-4 xl:grid-cols-2">
      <div className="space-y-3">
        {p.set.part8.people.map((person, i) => (
          <section key={i} className="card !p-4">
            <TaskHeader no={taskNo(8, i)} result={p.review ? res[i] : undefined}>{person.name}</TaskHeader>
            <p className="mb-3 text-sm leading-relaxed text-fg" lang="en">{person.text}</p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={`Nabídka pro: ${person.name}`}>
              {p.set.part8.offers.map((_, j) => {
                const selected = p.answers.p8[i] === j;
                const takenByOther = usedBy.has(j) && usedBy.get(j) !== i;
                const state = p.review ? (j === person.answer ? 'is-correct' : selected ? 'is-wrong' : 'is-dim') : selected ? 'is-selected' : '';
                return (
                  <button
                    key={j}
                    type="button"
                    className={`exam-letter ${state} ${takenByOther && !p.review ? 'is-taken' : ''}`}
                    aria-pressed={selected}
                    disabled={p.review}
                    onClick={() => p.onChange(set(p.answers, 'p8', i, selected ? null : j))}
                    title={takenByOther ? `Nabídka ${LETTERS[j]} je už přiřazená jinde` : `Nabídka ${LETTERS[j]}`}
                  >
                    {LETTERS[j]}
                  </button>
                );
              })}
            </div>
            <Explain show={p.review} ok={!!res[i]} answer={`${LETTERS[person.answer]} – ${p.set.part8.offers[person.answer].title}`}>{person.explanationCs}</Explain>
          </section>
        ))}
      </div>
      <div className="space-y-3 xl:sticky xl:top-[calc(var(--g92-appbar-total)+8.5rem)] xl:max-h-[calc(100dvh-var(--g92-appbar-total)-10rem)] xl:overflow-y-auto xl:pr-1">
        {p.set.part8.offers.map((o, j) => (
          <article key={j} className={`card !p-4 ${usedBy.has(j) ? '!border-accent-border' : ''}`}>
            <div className="mb-1 flex items-center gap-2">
              <span className="exam-letter is-static">{LETTERS[j]}</span>
              <h4 className="font-black text-fg" lang="en">{o.title}</h4>
            </div>
            <p className="text-sm leading-relaxed text-fg" lang="en">{o.text}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

/* ─── Gap texts (parts 9 and 10) ───────────────────────────────────── */

function GapText({ text, renderGap }: { text: string; renderGap: (n: number) => ReactNode }) {
  return (
    <div className="reading-text" lang="en">
      {text.split(/\n+/).map((para, pi) => (
        <p key={pi}>
          {para.split(/(\{\{\d+\}\})/).map((chunk, ci) => {
            const m = /^\{\{(\d+)\}\}$/.exec(chunk);
            return m ? <Fragment key={ci}>{renderGap(Number(m[1]))}</Fragment> : <Fragment key={ci}>{chunk}</Fragment>;
          })}
        </p>
      ))}
    </div>
  );
}

function Part9(p: PartViewProps) {
  const res = p.review ? itemResults(9, p.set, p.answers) : [];
  const gaps = p.set.part9.gaps;
  return (
    <TwoColumn
      left={
        <>
          <h3 className="mb-2 text-xl font-black text-fg" lang="en">{p.set.part9.title}</h3>
          <GapText
            text={p.set.part9.text}
            renderGap={(n) => {
              const i = n - 1;
              const v = p.answers.p9[i];
              const state = p.review ? (res[i] ? 'is-ok' : 'is-bad') : v !== null ? 'is-filled' : '';
              return (
                <a href={`#gap9-${n}`} className={`exam-gap ${state}`} onClick={(e) => { e.preventDefault(); document.getElementById(`gap9-${n}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>
                  <span className="exam-gap__no">{taskNo(9, i)}</span>
                  {v !== null && v !== undefined ? gaps[i].options[v] : '______'}
                </a>
              );
            }}
          />
        </>
      }
      right={
        <ol className="space-y-2">
          {gaps.map((g, i) => (
            <li key={i} id={`gap9-${i + 1}`} className="rounded-2xl border border-border bg-surface p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`exam-task-no ${p.review ? (res[i] ? 'is-ok' : 'is-bad') : ''}`}>{taskNo(9, i)}</span>
                <div className="flex flex-1 flex-wrap gap-1.5">
                  {g.options.map((o, j) => (
                    <Choice
                      key={j}
                      letter={LETTERS[j]}
                      label={o}
                      selected={p.answers.p9[i] === j}
                      onClick={() => p.onChange(set(p.answers, 'p9', i, j))}
                      disabled={p.review}
                      state={p.review ? (j === g.answer ? 'correct' : j === p.answers.p9[i] ? 'wrong' : 'dim') : undefined}
                    />
                  ))}
                </div>
              </div>
              <Explain show={p.review} ok={!!res[i]} answer={`${LETTERS[g.answer]} – ${g.options[g.answer]}`}>{g.explanationCs}</Explain>
            </li>
          ))}
        </ol>
      }
    />
  );
}

function Part10(p: PartViewProps) {
  const res = p.review ? itemResults(10, p.set, p.answers) : [];
  const gaps = p.set.part10.gaps;
  return (
    <div className="space-y-4">
      <div className="card !p-5">
        <h3 className="mb-2 text-xl font-black text-fg" lang="en">{p.set.part10.title}</h3>
        <GapText
          text={p.set.part10.text}
          renderGap={(n) => {
            if (n === 0) {
              return (
                <span className="exam-gap is-example" title="Vzor">
                  <span className="exam-gap__no">0</span>
                  {p.set.part10.example}
                </span>
              );
            }
            const i = n - 1;
            const v = p.answers.p10[i] ?? '';
            const state = p.review ? (res[i] ? '!border-success !bg-success-soft' : '!border-danger !bg-danger-soft') : '';
            return (
              <span className="exam-gap-input">
                <span className="exam-gap__no">{taskNo(10, i)}</span>
                <input
                  className={`exam-inline-input ${state}`}
                  value={v}
                  disabled={p.review}
                  onChange={(e) => p.onChange(set(p.answers, 'p10', i, e.target.value.replace(/\s+/g, ' ')))}
                  aria-label={`Úloha ${taskNo(10, i)}`}
                  autoCapitalize="off"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={24}
                  size={Math.max(6, v.length + 1)}
                />
              </span>
            );
          }}
        />
      </div>
      {!p.review && <p className="text-sm text-muted">Do každé mezery napiš <strong>jedno slovo</strong> ve správném tvaru. Úloha 0 je vzor.</p>}
      {p.review && (
        <ol className="space-y-2">
          {gaps.map((g, i) => (
            <li key={i} className="rounded-2xl border border-border bg-surface p-3">
              <div className="flex items-center gap-2">
                <span className={`exam-task-no ${res[i] ? 'is-ok' : 'is-bad'}`}>{taskNo(10, i)}</span>
                <span className="text-sm text-fg" lang="en">
                  Tvoje odpověď: <strong>{p.answers.p10[i] || '—'}</strong>
                </span>
              </div>
              <Explain show ok={res[i]} answer={displayAnswer(g.accept.join('|'))}>{g.explanationCs}</Explain>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
