import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFavorites, type FavoriteItem } from '../favorites';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';
import { speak } from '../tts';
import { addDrillSession, getStats, saveStats, updateStreak } from '../db';

type Mode = 'en_to_cs' | 'cs_to_en' | 'listen';

interface QuizItem {
  fav: FavoriteItem;
  options: string[];
  correctIndex: number;
}

function buildQuiz(favs: FavoriteItem[], mode: Mode): QuizItem[] {
  const items = shuffleArray([...favs]);
  return items.map((fav) => {
    const isReverse = mode === 'cs_to_en';
    const correct = isReverse ? fav.text : fav.translation;
    const pool = shuffleArray(favs.filter((f) => f.id !== fav.id));
    const wrongs = pool.slice(0, 3).map((f) => isReverse ? f.text : f.translation);
    while (wrongs.length < 3) wrongs.push(`---`);
    const opts = shuffleArray([correct, ...wrongs]);
    return { fav, options: opts, correctIndex: opts.indexOf(correct) };
  });
}

export default function FavoritesQuiz() {
  const navigate = useNavigate();
  const [favs, setFavs] = useState<FavoriteItem[]>([]);
  const [mode, setMode] = useState<Mode>('en_to_cs');
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [startTime, setStartTime] = useState(0);

  useEffect(() => {
    setFavs(getFavorites());
  }, []);

  function start() {
    const q = buildQuiz(favs, mode);
    setQuiz(q);
    setStarted(true);
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setDone(false);
    setStartTime(Date.now());
    if (mode === 'listen' && q.length > 0) {
      speak(q[0].fav.text, 0.9);
    }
  }

  async function finish(finalScore: number) {
    setDone(true);
    playComplete();
    const stats = await getStats();
    stats.totalExercisesDone += quiz.length;
    stats.totalStudyMinutes += (Date.now() - startTime) / 60000;
    await saveStats(stats);
    await updateStreak();
    await addDrillSession({
      date: new Date().toISOString().slice(0, 10),
      type: 'vocab',
      startedAt: startTime,
      endedAt: Date.now(),
      totalItems: quiz.length,
      correctItems: finalScore,
      tags: ['favorites_quiz'],
    });
  }

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === quiz[current].correctIndex;
    if (correct) { setScore((s) => s + 1); playCorrect(); }
    else playIncorrect();

    setTimeout(() => {
      const next = current + 1;
      if (next >= quiz.length) {
        finish(score + (correct ? 1 : 0));
      } else {
        setCurrent(next);
        setSelected(null);
        if (mode === 'listen') speak(quiz[next].fav.text, 0.9);
      }
    }, 1200);
  }

  if (favs.length < 4) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Málo oblíbených</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          Pro kvíz potřebuješ alespoň 4 uložené položky. Přidej si slova z vyhledávání nebo ze slovníku.
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/favorites')}>Oblíbené</button>
          <button className="btn-primary" onClick={() => navigate('/search')}>Hledat slova</button>
        </div>
      </div>
    );
  }

  if (!started) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">⭐</div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Kvíz z oblíbených</h1>
        <p className="text-slate-500 dark:text-slate-400 mb-4">
          {favs.length} položek k procvičení
        </p>

        <div className="space-y-2 mb-6 w-full max-w-xs">
          {([
            { id: 'en_to_cs', label: '🇬🇧 → 🇨🇿  Angličtina → Čeština', desc: 'Přeložte anglické slovo' },
            { id: 'cs_to_en', label: '🇨🇿 → 🇬🇧  Čeština → Angličtina', desc: 'Přeložte české slovo' },
            { id: 'listen', label: '🎧 Poslech → Čeština', desc: 'Přeložte vyslovené slovo' },
          ] as { id: Mode; label: string; desc: string }[]).map((m) => (
            <button
              key={m.id}
              className={`card w-full text-left !p-3 transition-all ${mode === m.id ? 'ring-2 ring-primary-500' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{m.label}</div>
              <div className="text-xs text-slate-400">{m.desc}</div>
            </button>
          ))}
        </div>

        <button className="btn-primary btn-lg" onClick={start}>Začít kvíz</button>
        <button className="btn-ghost text-sm mt-4" onClick={() => navigate('/favorites')}>← Zpět na oblíbené</button>
      </div>
    );
  }

  if (done) {
    const pct = quiz.length > 0 ? Math.round((score / quiz.length) * 100) : 0;
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hotovo!</h2>
        <p className="text-slate-600 dark:text-slate-300 mb-1">{score} / {quiz.length} ({pct}%)</p>
        <p className="text-sm text-slate-400 mb-6">
          {pct >= 80 ? 'Výborně, tvoje oblíbené slova umíš!' : pct >= 50 ? 'Dobrá práce, pokračuj!' : 'Opakování dělá mistra!'}
        </p>
        <div className="flex gap-3">
          <button className="btn-secondary" onClick={() => navigate('/favorites')}>Oblíbené</button>
          <button className="btn-primary" onClick={start}>Znovu</button>
        </div>
      </div>
    );
  }

  const item = quiz[current];
  const isListen = mode === 'listen';
  const isCsToEn = mode === 'cs_to_en';

  return (
    <div className="page-container">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-bold text-slate-500 dark:text-slate-400">{current + 1}/{quiz.length}</span>
        <span className="text-sm text-slate-400">Skóre: {score}</span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
        <div className="bg-yellow-500 h-full rounded-full transition-all duration-300" style={{ width: `${((current + 1) / quiz.length) * 100}%` }} />
      </div>

      <div className="card !p-6 mb-4 text-center">
        <span className="badge bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 text-xs mb-3 inline-block">
          {isListen ? 'Poslech' : isCsToEn ? 'CZ → EN' : 'EN → CZ'}
        </span>

        {isListen ? (
          <div className="mb-4">
            <button
              className="text-primary-500 hover:text-primary-700 p-3 rounded-full bg-primary-50 dark:bg-primary-900/20"
              onClick={() => speak(item.fav.text, 0.9)}
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
              </svg>
            </button>
            <p className="text-xs text-slate-400 mt-2">Klikni pro přehrání</p>
          </div>
        ) : (
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            {isCsToEn ? item.fav.translation : item.fav.text}
          </h3>
        )}

        <div className="space-y-2">
          {item.options.map((opt, idx) => {
            let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ';
            if (selected === null) {
              cls += 'border-slate-200 dark:border-slate-600 hover:border-yellow-400 text-slate-700 dark:text-slate-200';
            } else if (idx === item.correctIndex) {
              cls += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200 font-medium';
            } else if (idx === selected) {
              cls += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
            } else {
              cls += 'border-slate-200 dark:border-slate-600 text-slate-400 opacity-60';
            }
            return (
              <button key={idx} className={cls} onClick={() => handleSelect(idx)} disabled={selected !== null}>
                {opt}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {item.fav.text} — {item.fav.translation}
          </p>
        )}
      </div>
    </div>
  );
}
