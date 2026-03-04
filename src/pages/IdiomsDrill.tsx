import { useState, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';
import { IDIOMS, COLLOCATIONS, IDIOM_CATEGORIES } from '../data/idioms';
import type { Idiom, Collocation } from '../data/idioms';
import { shuffleArray } from '../utils';
import { speak } from '../tts';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { trackError } from '../errorTracker';

type Phase = 'select' | 'quiz' | 'result';
type Tab = 'idioms' | 'collocations' | 'quiz';

const CATEGORY_BORDER_COLORS: Record<string, string> = {
  emotions: 'border-l-rose-400',
  effort: 'border-l-amber-400',
  communication: 'border-l-sky-400',
  money: 'border-l-emerald-400',
  relationships: 'border-l-violet-400',
  general: 'border-l-slate-400',
};

const CATEGORY_BADGE_COLORS: Record<string, string> = {
  emotions: 'bg-rose-100 text-rose-700',
  effort: 'bg-amber-100 text-amber-700',
  communication: 'bg-sky-100 text-sky-700',
  money: 'bg-emerald-100 text-emerald-700',
  relationships: 'bg-violet-100 text-violet-700',
  general: 'bg-slate-100 text-slate-600',
};

const VERB_FILTERS = ['make', 'do', 'have', 'take', 'get', 'pay', 'other'] as const;

interface QuizQuestion {
  type: 'idiom' | 'collocation';
  idiom?: Idiom;
  collocation?: Collocation;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  explanationDetail: string;
}

function buildQuizQuestions(): QuizQuestion[] {
  const questions: QuizQuestion[] = [];

  const idiomPool = shuffleArray(IDIOMS).slice(0, 10);
  for (const idiom of idiomPool) {
    const distractors = shuffleArray(
      IDIOMS.filter((i) => i.id !== idiom.id),
    ).slice(0, 3);

    const options = shuffleArray([
      idiom.meaningCs,
      ...distractors.map((d) => d.meaningCs),
    ]);

    questions.push({
      type: 'idiom',
      idiom,
      prompt: idiom.idiom,
      options,
      correctIndex: options.indexOf(idiom.meaningCs),
      explanation: `${idiom.idiom} = ${idiom.meaningCs}`,
      explanationDetail: idiom.example,
    });
  }

  const colPool = shuffleArray(COLLOCATIONS).slice(0, 10);
  for (const col of colPool) {
    const verbSet = new Set([col.verb, col.wrongVerb]);
    const allVerbs = [...new Set(COLLOCATIONS.map((c) => c.verb))];
    const extraVerbs = shuffleArray(
      allVerbs.filter((v) => !verbSet.has(v)),
    ).slice(0, 4 - verbSet.size);

    const options = shuffleArray([...verbSet, ...extraVerbs].slice(0, 4));
    const correctIndex = options.indexOf(col.verb);

    questions.push({
      type: 'collocation',
      collocation: col,
      prompt: `_____ ${col.collocate}`,
      options,
      correctIndex,
      explanation: `${col.full} = ${col.meaningCs}`,
      explanationDetail: col.example,
    });
  }

  return shuffleArray(questions).slice(0, 20);
}

export default function IdiomsDrill() {
  const navigate = useNavigate();
  const [, startTransition] = useTransition();

  const [phase, setPhase] = useState<Phase>('select');
  const [tab, setTab] = useState<Tab>('idioms');

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedVerb, setSelectedVerb] = useState<string>('all');

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime, setStartTime] = useState(0);

  function toggleCategory(cat: string) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  }

  const filteredIdioms =
    selectedCategories.length === 0
      ? IDIOMS
      : IDIOMS.filter((i) => selectedCategories.includes(i.category));

  const filteredCollocations =
    selectedVerb === 'all'
      ? COLLOCATIONS
      : selectedVerb === 'other'
        ? COLLOCATIONS.filter(
            (c) => !['make', 'do', 'have', 'take', 'get', 'pay'].includes(c.verb),
          )
        : COLLOCATIONS.filter((c) => c.verb === selectedVerb);

  const collocationGroups = filteredCollocations.reduce<Record<string, Collocation[]>>(
    (acc, col) => {
      (acc[col.verb] ??= []).push(col);
      return acc;
    },
    {},
  );

  function startQuiz() {
    const qs = buildQuizQuestions();
    startTransition(() => {
      setQuestions(qs);
      setCurrentIndex(0);
      setSelectedOption(null);
      setAnswered(false);
      setCorrectCount(0);
      setStartTime(Date.now());
      setPhase('quiz');
    });
  }

  function handleAnswer() {
    if (selectedOption === null) return;
    const q = questions[currentIndex];
    const isCorrect = selectedOption === q.correctIndex;

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
      playCorrect();
    } else {
      playIncorrect();
      trackError(
        'idioms',
        q.type === 'idiom' ? 'idiom_meaning' : 'collocation_verb',
        q.prompt,
        q.options[selectedOption],
        q.options[q.correctIndex],
      );
    }
    setAnswered(true);
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      finishQuiz();
    } else {
      setCurrentIndex((i) => i + 1);
      setSelectedOption(null);
      setAnswered(false);
    }
  }

  async function finishQuiz() {
    playComplete();

    const userStats = await getStats();
    userStats.totalExercisesDone += questions.length;
    userStats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(userStats);
    await updateStreak();

    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'grammar',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: questions.length,
      correctItems: correctCount,
      tags: ['idioms'],
    });

    setPhase('result');
  }

  // ──── RESULT PHASE ────

  if (phase === 'result') {
    const total = questions.length;
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">
          {pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Kvíz hotový!</h2>
        <p className="text-slate-600 mb-1">
          {correctCount} / {total} správně ({pct} %)
        </p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80
            ? 'Výborně! Idiomy a kolokace ti jdou skvěle!'
            : pct >= 50
              ? 'Dobrý základ, procvičuj dál!'
              : 'Nevadí, opakování dělá mistra!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/')}>
            Domů
          </button>
          <button
            className="btn-primary"
            onClick={() => {
              setPhase('select');
              setTab('quiz');
            }}
          >
            Další cvičení
          </button>
        </div>
      </div>
    );
  }

  // ──── QUIZ PHASE ────

  if (phase === 'quiz') {
    const q = questions[currentIndex];
    if (!q) return null;

    const progress = currentIndex / questions.length;
    const isCorrect = selectedOption !== null && selectedOption === q.correctIndex;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-4">
          <button className="btn-ghost text-sm" onClick={() => setPhase('select')}>
            ← Zpět
          </button>
          <span className="text-sm text-slate-500 font-medium">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-1.5 mb-6">
          <div
            className="bg-primary-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        <div className="card !p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="badge bg-primary-100 text-primary-700">
              {q.type === 'idiom' ? 'Idiom' : 'Kolokace'}
            </span>
            {q.type === 'idiom' && q.idiom && (
              <span
                className={`badge ${CATEGORY_BADGE_COLORS[q.idiom.category] || 'bg-slate-100 text-slate-600'}`}
              >
                {IDIOM_CATEGORIES[q.idiom.category] || q.idiom.category}
              </span>
            )}
          </div>

          <p className="text-sm text-slate-500 mb-1">
            {q.type === 'idiom'
              ? 'Co znamená tento idiom?'
              : 'Doplň správné sloveso:'}
          </p>

          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-xl font-semibold text-slate-900">{q.prompt}</h3>
            {q.type === 'idiom' && q.idiom && (
              <button
                className="text-primary-500 hover:text-primary-700 p-1"
                onClick={() => speak(q.idiom!.idiom)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
                </svg>
              </button>
            )}
          </div>

          {!answered && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedOption === i
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-100 hover:border-slate-200'
                  }`}
                  onClick={() => setSelectedOption(i)}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {answered && (
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <div
                  key={i}
                  className={`px-4 py-3 rounded-xl border-2 ${
                    i === q.correctIndex
                      ? 'border-green-500 bg-green-50'
                      : selectedOption === i
                        ? 'border-red-500 bg-red-50'
                        : 'border-slate-100'
                  }`}
                >
                  {opt}
                  {i === q.correctIndex && ' ✓'}
                </div>
              ))}
            </div>
          )}

          {answered && (
            <div
              className={`mt-4 p-3 rounded-xl ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}
            >
              <p className={`text-sm ${isCorrect ? 'text-green-800' : 'text-blue-800'}`}>
                {isCorrect ? '✅ ' : '💡 '}
                <strong>{q.explanation}</strong>
              </p>
              <p
                className={`text-xs mt-1 italic ${isCorrect ? 'text-green-600' : 'text-blue-600'}`}
              >
                &ldquo;{q.explanationDetail}&rdquo;
              </p>
              {q.type === 'collocation' && q.collocation && (
                <p className="text-xs text-red-500 mt-1">
                  Pozor: NE *{q.collocation.wrongVerb} {q.collocation.collocate}*
                </p>
              )}
            </div>
          )}
        </div>

        {!answered ? (
          <button
            className="btn-primary btn-lg w-full"
            disabled={selectedOption === null}
            onClick={handleAnswer}
          >
            Zkontrolovat
          </button>
        ) : (
          <button className="btn-primary btn-lg w-full" onClick={nextQuestion}>
            {currentIndex + 1 >= questions.length ? 'Zobrazit výsledky' : 'Další otázka →'}
          </button>
        )}
      </div>
    );
  }

  // ──── SELECT PHASE ────

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
        ← Zpět
      </button>

      <h1 className="page-title">Idiomy &amp; kolokace</h1>
      <p className="page-subtitle">Ustálené fráze, co tě posunou na B1</p>

      {/* Tab toggle */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6">
        {(
          [
            ['idioms', 'Idiomy'],
            ['collocations', 'Kolokace'],
            ['quiz', 'Kvíz'],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === key
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Idioms Tab ── */}
      {tab === 'idioms' && (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">
              Kategorie {selectedCategories.length > 0 && `(${selectedCategories.length})`}
            </h3>
            <div className="flex flex-wrap gap-2">
              {Object.entries(IDIOM_CATEGORIES).map(([key, label]) => (
                <button
                  key={key}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedCategories.includes(key)
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => toggleCategory(key)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {filteredIdioms.length} idiomů
          </p>

          <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
            {filteredIdioms.map((idiom) => (
              <div
                key={idiom.id}
                className={`card !p-4 border-l-4 ${CATEGORY_BORDER_COLORS[idiom.category] || 'border-l-slate-300'}`}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-bold text-slate-900">{idiom.idiom}</h4>
                    <button
                      className="text-primary-500 hover:text-primary-700 p-0.5 shrink-0"
                      onClick={() => speak(idiom.idiom)}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <span
                      className={`badge text-xs ${CATEGORY_BADGE_COLORS[idiom.category] || 'bg-slate-100 text-slate-600'}`}
                    >
                      {IDIOM_CATEGORIES[idiom.category] || idiom.category}
                    </span>
                    <span className="badge text-xs bg-primary-100 text-primary-700">
                      {idiom.level}
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 mb-0.5">{idiom.meaningCs}</p>
                <p className="text-xs text-slate-400 mb-2">{idiom.meaningEn}</p>
                <p className="text-sm text-slate-600 italic mb-1">
                  &ldquo;{idiom.example}&rdquo;
                </p>

                {idiom.czechEquivalent && (
                  <span className="inline-block mt-1 px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                    🇨🇿 {idiom.czechEquivalent}
                  </span>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Collocations Tab ── */}
      {tab === 'collocations' && (
        <>
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-600 mb-2">Sloveso</h3>
            <div className="flex flex-wrap gap-2">
              <button
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedVerb === 'all'
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                onClick={() => setSelectedVerb('all')}
              >
                Vše
              </button>
              {VERB_FILTERS.map((v) => (
                <button
                  key={v}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    selectedVerb === v
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => setSelectedVerb(v)}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-3">
            {filteredCollocations.length} kolokací
          </p>

          <div className="space-y-5 max-h-[65vh] overflow-y-auto pr-1">
            {Object.entries(collocationGroups).map(([verb, cols]) => (
              <div key={verb}>
                <h3 className="text-sm font-bold text-primary-600 uppercase tracking-wider mb-2">
                  {verb}
                </h3>
                <div className="space-y-2">
                  {cols.map((col) => (
                    <div key={col.id} className="card !p-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">
                            {col.verb}{' '}
                            <span className="text-primary-600">+ {col.collocate}</span>
                          </span>
                          <button
                            className="text-primary-500 hover:text-primary-700 p-0.5 shrink-0"
                            onClick={() => speak(col.full)}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
                            </svg>
                          </button>
                        </div>
                        <span className="badge text-xs bg-primary-100 text-primary-700 shrink-0">
                          {col.level}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">{col.meaningCs}</p>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        &ldquo;{col.example}&rdquo;
                      </p>
                      <p className="text-xs text-red-500 mt-1">
                        Pozor: NE <span className="line-through">*{col.wrongVerb} {col.collocate}*</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── Quiz Tab ── */}
      {tab === 'quiz' && (
        <div className="text-center py-8">
          <div className="text-5xl mb-4">🧠</div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Smíšený kvíz
          </h3>
          <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
            20 otázek náhodně z idiomů i kolokací. U idiomů hádáš český význam, u
            kolokací doplňuješ správné sloveso.
          </p>
          <button className="btn-primary btn-lg" onClick={startQuiz}>
            Spustit kvíz
          </button>
        </div>
      )}
    </div>
  );
}
