import { useState, useMemo, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { ARTICLE_EXERCISES, ARTICLE_RULES } from '../data/articles';
import type { ArticleExercise } from '../data/articles';
import { shuffleArray } from '../utils';
import { useKeyboard } from '../hooks/useKeyboard';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'rules' | 'drill' | 'result';
type Tab = 'rules' | 'drill';
type ArticleOption = 'a' | 'an' | 'the' | '-';

const ARTICLE_OPTIONS: { value: ArticleOption; label: string }[] = [
  { value: 'a', label: 'a' },
  { value: 'an', label: 'an' },
  { value: 'the', label: 'the' },
  { value: '-', label: '—' },
];

const LEVELS = ['all', 'A1', 'A2', 'B1'] as const;
const RULE_KEYS = Object.keys(ARTICLE_RULES);
const DRILL_COUNT = 20;

export default function ArticlesDrill() {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<Phase>('select');
  const [tab, setTab] = useState<Tab>('drill');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedRules, setSelectedRules] = useState<string[]>([]);

  const [exercises, setExercises] = useState<ArticleExercise[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [gapAnswers, setGapAnswers] = useState<(ArticleOption | null)[]>([]);
  const [checked, setChecked] = useState(false);
  const [stats, setStats] = useState({ correct: 0, total: 0 });
  const [startTime, setStartTime] = useState(0);

  function toggleRule(rule: string) {
    setSelectedRules((prev) =>
      prev.includes(rule) ? prev.filter((r) => r !== rule) : [...prev, rule],
    );
  }

  function filteredPool() {
    let pool = ARTICLE_EXERCISES;
    if (selectedRules.length > 0) {
      pool = pool.filter((e) => selectedRules.includes(e.rule));
    }
    if (selectedLevel !== 'all') {
      pool = pool.filter((e) => e.level === selectedLevel);
    }
    return pool;
  }

  function startDrill() {
    const pool = filteredPool();
    const selected = shuffleArray(pool).slice(0, DRILL_COUNT);
    setExercises(selected);
    setCurrentIndex(0);
    setGapAnswers(new Array(selected[0]?.gaps.length ?? 0).fill(null));
    setChecked(false);
    setStats({ correct: 0, total: 0 });
    setStartTime(Date.now());
    setPhase('drill');
  }

  function setGapAnswer(gapIndex: number, value: ArticleOption) {
    setGapAnswers((prev) => {
      const next = [...prev];
      next[gapIndex] = value;
      return next;
    });
  }

  function checkAnswer() {
    const ex = exercises[currentIndex];
    let correctCount = 0;
    for (let i = 0; i < ex.gaps.length; i++) {
      const isGapCorrect = gapAnswers[i] === ex.gaps[i].answer;
      if (isGapCorrect) correctCount++;
      if (!isGapCorrect) {
        trackError(
          'grammar',
          'articles_' + ex.rule,
          ex.sentence,
          gapAnswers[i] ?? '(prázdné)',
          ex.gaps[i].answer === '-' ? '— (nic)' : ex.gaps[i].answer,
        );
      }
    }

    const allCorrect = correctCount === ex.gaps.length;
    if (allCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }

    setStats((prev) => ({
      correct: prev.correct + (allCorrect ? 1 : 0),
      total: prev.total + 1,
    }));
    setChecked(true);
  }

  function nextExercise() {
    if (currentIndex + 1 >= exercises.length) {
      finishDrill();
    } else {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setGapAnswers(new Array(exercises[nextIdx].gaps.length).fill(null));
      setChecked(false);
    }
  }

  async function finishDrill() {
    const userStats = await getStats();
    userStats.totalExercisesDone += stats.total;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'grammar',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: stats.total,
      correctItems: stats.correct,
      tags: ['articles', ...(selectedRules.length > 0 ? selectedRules : [])],
    });

    setPhase('result');
    playComplete();
  }

  // Keyboard shortcuts for single-gap exercises
  const ex = phase === 'drill' ? exercises[currentIndex] : null;

  const keyMap = useMemo(() => {
    if (!ex || phase !== 'drill') return {};
    if (checked) return { Enter: nextExercise, ' ': nextExercise };

    const map: Record<string, () => void> = {};

    if (ex.gaps.length === 1) {
      map['1'] = () => setGapAnswer(0, 'a');
      map['2'] = () => setGapAnswer(0, 'an');
      map['3'] = () => setGapAnswer(0, 'the');
      map['4'] = () => setGapAnswer(0, '-');
    }

    map['Enter'] = () => {
      if (gapAnswers.every((a) => a !== null)) checkAnswer();
    };

    return map;
  }, [ex, phase, checked, gapAnswers]);
  useKeyboard(keyMap, phase === 'drill');

  // ─── SELECT PHASE ───
  if (phase === 'select') {
    const poolSize = filteredPool().length;

    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
          ← Zpět
        </button>
        <h1 className="page-title">Členy (Articles)</h1>
        <p className="page-subtitle">a, an, the nebo nic? Největší past pro Čechy.</p>

        {/* Tab switch */}
        <div className="flex gap-2 mb-6">
          <button
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'rules'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setTab('rules')}
          >
            Pravidla
          </button>
          <button
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              tab === 'drill'
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
            onClick={() => setTab('drill')}
          >
            Cvičení
          </button>
        </div>

        {tab === 'rules' && (
          <button
            className="btn-primary btn-lg w-full"
            onClick={() => setPhase('rules')}
          >
            Zobrazit přehled pravidel
          </button>
        )}

        {tab === 'drill' && (
          <>
            {/* Level filter */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">Úroveň</h3>
              <div className="flex gap-2">
                {LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedLevel === lvl
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    onClick={() => setSelectedLevel(lvl)}
                  >
                    {lvl === 'all' ? 'Vše' : lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Rule filter chips */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                Pravidla {selectedRules.length > 0 && `(${selectedRules.length})`}
              </h3>
              <div className="flex flex-wrap gap-2">
                {RULE_KEYS.map((key) => (
                  <button
                    key={key}
                    className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                      selectedRules.includes(key)
                        ? 'bg-primary-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                    onClick={() => toggleRule(key)}
                  >
                    {ARTICLE_RULES[key].titleCs}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary btn-lg w-full"
              onClick={startDrill}
              disabled={poolSize === 0}
            >
              {poolSize > 0
                ? `Začít (${Math.min(poolSize, DRILL_COUNT)} úloh)`
                : 'Žádná cvičení pro tento filtr'}
            </button>
          </>
        )}
      </div>
    );
  }

  // ─── RULES PHASE ───
  if (phase === 'rules') {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => setPhase('select')}>
          ← Zpět
        </button>
        <h1 className="page-title">Přehled pravidel</h1>
        <p className="page-subtitle mb-6">Kdy použít a, an, the a kdy nic.</p>

        <div className="space-y-4">
          {RULE_KEYS.map((key) => {
            const rule = ARTICLE_RULES[key];
            return (
              <div key={key} className="card !p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                  {rule.titleCs}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                  {rule.explanationCs}
                </p>
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-1.5">
                  {rule.examples.map((ex, i) => (
                    <p
                      key={i}
                      className="text-sm text-slate-700 dark:text-slate-300 font-mono leading-relaxed"
                    >
                      {ex}
                    </p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── RESULT PHASE ───
  if (phase === 'result') {
    const pct = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
          Členy hotové!
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mb-1">
          {stats.correct} / {stats.total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">
          {pct >= 80
            ? 'Skvělé, členy ti jdou!'
            : pct >= 50
              ? 'Dobrý základ, zkus si projít pravidla.'
              : 'Projdi si přehled pravidel a zkus znovu.'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setSelectedRules([]);
            }}
          >
            Znovu
          </button>
        </div>
      </div>
    );
  }

  // ─── DRILL PHASE ───
  if (!ex) return null;

  const allFilled = gapAnswers.every((a) => a !== null);
  const sentenceParts = ex.sentence.split('___');

  const gapResults = checked
    ? ex.gaps.map((gap, i) => ({
        correct: gapAnswers[i] === gap.answer,
        expected: gap.answer,
        given: gapAnswers[i],
      }))
    : null;

  const allCorrect = gapResults?.every((r) => r.correct) ?? false;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
          ← Zpět
        </button>
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          {currentIndex + 1} / {exercises.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div
          className="bg-primary-500 h-full rounded-full transition-all duration-300"
          style={{ width: `${(currentIndex / exercises.length) * 100}%` }}
        />
      </div>

      {/* Exercise card */}
      <div className="card !p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="badge bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            {ARTICLE_RULES[ex.rule]?.titleCs ?? ex.rule}
          </span>
          <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300">
            {ex.level}
          </span>
        </div>

        {/* Sentence with inline gap selectors */}
        <div className="text-lg leading-loose text-slate-900 dark:text-slate-100 mb-4">
          {sentenceParts.map((part, i) => (
            <Fragment key={i}>
              <span>{part}</span>
              {i < ex.gaps.length && (
                <GapSelector
                  index={i}
                  selected={gapAnswers[i]}
                  result={gapResults?.[i] ?? null}
                  checked={checked}
                  onSelect={(val) => setGapAnswer(i, val)}
                />
              )}
            </Fragment>
          ))}
        </div>

        {/* Keyboard hint for single-gap */}
        {!checked && ex.gaps.length === 1 && (
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
            Klávesy: 1 = a · 2 = an · 3 = the · 4 = —
          </p>
        )}

        {/* Feedback */}
        {checked && (
          <>
            <div
              className={`px-4 py-3 rounded-xl border-2 mb-3 ${
                allCorrect
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/30'
                  : 'border-red-500 bg-red-50 dark:bg-red-900/30'
              }`}
            >
              <span className="font-medium dark:text-slate-100">
                {allCorrect ? '✅ Správně!' : '❌ Některé mezery jsou špatně'}
              </span>
              {!allCorrect && gapResults && (
                <div className="mt-2 space-y-1">
                  {gapResults.map((r, i) =>
                    r.correct ? null : (
                      <p key={i} className="text-sm text-red-600 dark:text-red-400">
                        Mezera {i + 1}: tvoje „{r.given === '-' ? '—' : r.given}" →
                        správně „{r.expected === '-' ? '— (nic)' : r.expected}"
                      </p>
                    ),
                  )}
                </div>
              )}
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                💡 {ex.explanationCs}
              </p>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 opacity-75">
                Pravidlo: {ARTICLE_RULES[ex.rule]?.titleCs ?? ex.rule}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Action button */}
      {!checked ? (
        <button
          className="btn-primary btn-lg w-full"
          disabled={!allFilled}
          onClick={checkAnswer}
        >
          Zkontrolovat
        </button>
      ) : (
        <button className="btn-primary btn-lg w-full" onClick={nextExercise}>
          {currentIndex + 1 >= exercises.length ? 'Zobrazit výsledky' : 'Další úloha →'}
        </button>
      )}
    </div>
  );
}

// ─── Gap Selector (inline pill buttons) ───

interface GapSelectorProps {
  index: number;
  selected: ArticleOption | null;
  result: { correct: boolean; expected: string; given: string | null } | null;
  checked: boolean;
  onSelect: (value: ArticleOption) => void;
}

function GapSelector({ index, selected, result, checked, onSelect }: GapSelectorProps) {
  return (
    <span className="inline-flex items-center gap-1 mx-1 align-baseline">
      {ARTICLE_OPTIONS.map((opt) => {
        let classes =
          'px-2.5 py-0.5 rounded-full text-sm font-medium cursor-pointer transition-all border ';

        if (checked && result) {
          if (opt.value === result.expected) {
            classes += 'bg-green-100 dark:bg-green-900/40 border-green-500 text-green-800 dark:text-green-300';
          } else if (opt.value === selected && !result.correct) {
            classes += 'bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-300';
          } else {
            classes += 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-400 dark:text-slate-500';
          }
        } else if (selected === opt.value) {
          classes += 'bg-primary-500 border-primary-500 text-white';
        } else {
          classes +=
            'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20';
        }

        return (
          <button
            key={`${index}-${opt.value}`}
            className={classes}
            onClick={() => !checked && onSelect(opt.value)}
            disabled={checked}
            aria-label={`Gap ${index + 1}: ${opt.label}`}
          >
            {opt.label}
          </button>
        );
      })}
    </span>
  );
}
