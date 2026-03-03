import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VOCAB_TOPICS, type TopicVocab } from '../data/vocabTopics';
import { speak } from '../tts';
import { toggleFavorite, isFavorite } from '../favorites';

export default function VocabTopics() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<TopicVocab | null>(null);
  const [tab, setTab] = useState<'words' | 'phrases'>('words');
  const [favStamp, setFavStamp] = useState(0);
  void favStamp;

  if (selected) {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => setSelected(null)}>
          ← Zpět na témata
        </button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{selected.icon}</span>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">{selected.topicCs}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{selected.topic}</p>
          </div>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'words' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            onClick={() => setTab('words')}
          >
            Slovíčka ({selected.words.length})
          </button>
          <button
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'phrases' ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}
            onClick={() => setTab('phrases')}
          >
            Fráze ({selected.usefulPhrases.length})
          </button>
        </div>

        {tab === 'words' && (
          <div className="space-y-2">
            {selected.words.map((w, i) => {
              const favId = `topic_${selected.id}_${i}`;
              const fav = isFavorite(favId);
              return (
                <div key={i} className="card !p-3 flex items-start gap-3">
                  <button
                    className="text-primary-500 hover:text-primary-700 mt-0.5 shrink-0"
                    onClick={() => speak(w.en, 0.9)}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
                    </svg>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{w.en}</span>
                      <span className="text-slate-400">—</span>
                      <span className="text-slate-600 dark:text-slate-300">{w.cs}</span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-slate-500 italic mt-0.5">{w.example}</p>
                  </div>
                  <button
                    className={`shrink-0 mt-1 transition-colors ${fav ? 'text-red-500' : 'text-slate-300 dark:text-slate-600 hover:text-red-400'}`}
                    onClick={() => { toggleFavorite({ id: favId, type: 'vocab', text: w.en, translation: w.cs }); setFavStamp(Date.now()); }}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {tab === 'phrases' && (
          <div className="space-y-2">
            {selected.usefulPhrases.map((p, i) => (
              <div key={i} className="card !p-3 flex items-start gap-3">
                <button
                  className="text-primary-500 hover:text-primary-700 mt-0.5 shrink-0"
                  onClick={() => speak(p.en, 0.85)}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07z" />
                  </svg>
                </button>
                <div className="flex-1">
                  <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{p.en}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{p.cs}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <h1 className="page-title">Slovíčka podle témat</h1>
      <p className="page-subtitle">20 maturitních témat s klíčovou slovní zásobou a frázemi</p>

      <div className="space-y-2">
        {VOCAB_TOPICS.map((topic) => (
          <button
            key={topic.id}
            className="card w-full text-left !p-4 hover:shadow-md transition-shadow flex items-center gap-3"
            onClick={() => { setSelected(topic); setTab('words'); }}
          >
            <span className="text-2xl">{topic.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 dark:text-slate-200">{topic.topicCs}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{topic.topic}</div>
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500 shrink-0">
              {topic.words.length} slov
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
