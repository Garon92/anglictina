import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { speak } from '../tts';
import { shuffleArray } from '../utils';
import { playCorrect, playIncorrect, playComplete } from '../sounds';

const STORAGE_KEY = 'anglictina_custom_words';

interface CustomWord {
  id: string;
  en: string;
  cs: string;
  addedAt: number;
}

function loadWords(): CustomWord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveWords(words: CustomWord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
}

export default function CustomWords() {
  const navigate = useNavigate();
  const [words, setWords] = useState<CustomWord[]>([]);
  const [tab, setTab] = useState<'list' | 'quiz'>('list');
  const [newEn, setNewEn] = useState('');
  const [newCs, setNewCs] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  // Quiz state
  const [quizItems, setQuizItems] = useState<{ word: CustomWord; options: string[]; correctIdx: number }[]>([]);
  const [qIdx, setQIdx] = useState(0);
  const [qSelected, setQSelected] = useState<number | null>(null);
  const [qScore, setQScore] = useState(0);
  const [qDone, setQDone] = useState(false);

  useEffect(() => { setWords(loadWords()); }, []);

  function addWord() {
    if (!newEn.trim() || !newCs.trim()) return;
    const word: CustomWord = {
      id: `cw_${Date.now()}`,
      en: newEn.trim(),
      cs: newCs.trim(),
      addedAt: Date.now(),
    };
    const updated = [...words, word];
    setWords(updated);
    saveWords(updated);
    setNewEn('');
    setNewCs('');
  }

  function removeWord(id: string) {
    const updated = words.filter((w) => w.id !== id);
    setWords(updated);
    saveWords(updated);
  }

  function updateWord(id: string, en: string, cs: string) {
    const updated = words.map((w) => w.id === id ? { ...w, en, cs } : w);
    setWords(updated);
    saveWords(updated);
    setEditId(null);
  }

  function startQuiz() {
    const items = shuffleArray([...words]).map((word) => {
      const wrongs = shuffleArray(words.filter((w) => w.id !== word.id)).slice(0, 3).map((w) => w.cs);
      while (wrongs.length < 3) wrongs.push('---');
      const opts = shuffleArray([word.cs, ...wrongs]);
      return { word, options: opts, correctIdx: opts.indexOf(word.cs) };
    });
    setQuizItems(items);
    setQIdx(0);
    setQSelected(null);
    setQScore(0);
    setQDone(false);
    setTab('quiz');
  }

  function handleQuizSelect(idx: number) {
    if (qSelected !== null) return;
    setQSelected(idx);
    const correct = idx === quizItems[qIdx].correctIdx;
    if (correct) { setQScore((s) => s + 1); playCorrect(); }
    else playIncorrect();
    setTimeout(() => {
      if (qIdx + 1 >= quizItems.length) { setQDone(true); playComplete(); }
      else { setQIdx((i) => i + 1); setQSelected(null); }
    }, 1000);
  }

  if (tab === 'quiz') {
    if (qDone) {
      const pct = quizItems.length > 0 ? Math.round((qScore / quizItems.length) * 100) : 0;
      return (
        <div className="page-container flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '🏆' : '👍'}</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Hotovo!</h2>
          <p className="text-slate-600 dark:text-slate-300 mb-6">{qScore}/{quizItems.length} ({pct}%)</p>
          <div className="flex gap-3">
            <button className="btn-secondary" onClick={() => setTab('list')}>Seznam</button>
            <button className="btn-primary" onClick={startQuiz}>Znovu</button>
          </div>
        </div>
      );
    }

    const qi = quizItems[qIdx];
    if (!qi) return null;

    return (
      <div className="page-container">
        <div className="flex items-center justify-between mb-2">
          <button className="btn-ghost text-sm" onClick={() => setTab('list')}>← Zpět</button>
          <span className="text-sm text-slate-500">{qIdx + 1}/{quizItems.length}</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 mb-6">
          <div className="bg-primary-500 h-full rounded-full transition-all" style={{ width: `${((qIdx + 1) / quizItems.length) * 100}%` }} />
        </div>
        <div className="card !p-6 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{qi.word.en}</h3>
            <button className="text-primary-500" onClick={() => speak(qi.word.en, 0.9)}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {qi.options.map((opt, idx) => {
              let cls = 'w-full text-left px-4 py-3 rounded-xl border-2 transition-all text-sm ';
              if (qSelected === null) cls += 'border-slate-200 dark:border-slate-600 hover:border-primary-400 text-slate-700 dark:text-slate-200';
              else if (idx === qi.correctIdx) cls += 'border-green-500 bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-200';
              else if (idx === qSelected) cls += 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200';
              else cls += 'border-slate-200 dark:border-slate-600 text-slate-400 opacity-60';
              return <button key={idx} className={cls} onClick={() => handleQuizSelect(idx)} disabled={qSelected !== null}>{opt}</button>;
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <h1 className="page-title">Vlastní slovníček</h1>
      <p className="page-subtitle">Přidej si vlastní slova k procvičení ({words.length})</p>

      <div className="card mb-4 !p-4">
        <div className="flex gap-2 mb-2">
          <input
            className="input flex-1"
            placeholder="Anglicky"
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') document.getElementById('cs-input')?.focus(); }}
          />
          <input
            id="cs-input"
            className="input flex-1"
            placeholder="Česky"
            value={newCs}
            onChange={(e) => setNewCs(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') addWord(); }}
          />
        </div>
        <button className="btn-primary w-full text-sm" onClick={addWord} disabled={!newEn.trim() || !newCs.trim()}>
          + Přidat slovo
        </button>
      </div>

      {words.length >= 4 && (
        <button className="btn-secondary w-full mb-4" onClick={startQuiz}>
          🎯 Spustit kvíz ({words.length} slov)
        </button>
      )}
      {words.length > 0 && words.length < 4 && (
        <p className="text-xs text-slate-400 text-center mb-4">Přidej alespoň 4 slova pro kvíz</p>
      )}

      <div className="space-y-2">
        {words.sort((a, b) => b.addedAt - a.addedAt).map((w) => (
          <div key={w.id} className="card !p-3 flex items-center gap-3">
            <button className="text-primary-500 shrink-0" onClick={() => speak(w.en, 0.9)}>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
              </svg>
            </button>
            {editId === w.id ? (
              <EditWord word={w} onSave={(en, cs) => updateWord(w.id, en, cs)} onCancel={() => setEditId(null)} />
            ) : (
              <>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{w.en}</span>
                  <span className="text-slate-400 mx-1">—</span>
                  <span className="text-slate-600 dark:text-slate-300 text-sm">{w.cs}</span>
                </div>
                <button className="text-slate-400 hover:text-primary-500 shrink-0" onClick={() => setEditId(w.id)}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button className="text-red-400 hover:text-red-600 shrink-0" onClick={() => removeWord(w.id)}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {words.length === 0 && (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-slate-500 dark:text-slate-400">Zatím tu nic není. Přidej své první slovo!</p>
        </div>
      )}
    </div>
  );
}

function EditWord({ word, onSave, onCancel }: { word: CustomWord; onSave: (en: string, cs: string) => void; onCancel: () => void }) {
  const [en, setEn] = useState(word.en);
  const [cs, setCs] = useState(word.cs);
  return (
    <div className="flex-1 flex gap-2">
      <input className="input flex-1 text-sm" value={en} onChange={(e) => setEn(e.target.value)} />
      <input className="input flex-1 text-sm" value={cs} onChange={(e) => setCs(e.target.value)} />
      <button className="text-green-500 shrink-0" onClick={() => onSave(en, cs)}>✓</button>
      <button className="text-slate-400 shrink-0" onClick={onCancel}>✕</button>
    </div>
  );
}
