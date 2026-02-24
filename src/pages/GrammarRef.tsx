import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GRAMMAR_REFERENCE } from '../data/grammarReference';
import { speak } from '../tts';
import type { GrammarTopic } from '../types';

export default function GrammarRef() {
  const navigate = useNavigate();
  const [selectedTopic, setSelectedTopic] = useState<GrammarTopic | null>(null);

  if (selectedTopic) {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => setSelectedTopic(null)}>← Zpět na přehled</button>

        <div className="flex items-center gap-2 mb-2">
          <span className={`badge ${
            selectedTopic.level === 'A1' ? 'bg-green-100 text-green-700' :
            selectedTopic.level === 'A2' ? 'bg-blue-100 text-blue-700' :
            'bg-purple-100 text-purple-700'
          }`}>{selectedTopic.level}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">{selectedTopic.titleCs}</h1>
        <p className="text-sm text-slate-400 mb-6">{selectedTopic.titleEn}</p>

        {/* Explanation */}
        <div className="card mb-4">
          <h3 className="section-title">Vysvětlení</h3>
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {selectedTopic.explanationCs}
          </div>
        </div>

        {/* Key rules */}
        <div className="card mb-4">
          <h3 className="section-title">Klíčová pravidla</h3>
          <ul className="space-y-2">
            {selectedTopic.keyRules.map((rule, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-primary-500 font-bold mt-0.5">•</span>
                <span className="text-slate-700">{rule}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Examples */}
        <div className="card mb-4">
          <h3 className="section-title">Příklady</h3>
          <div className="space-y-3">
            {selectedTopic.examples.map((ex, i) => (
              <div key={i} className="bg-slate-50 rounded-xl p-3">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-slate-800">{ex.en}</p>
                  <button
                    className="text-primary-500 hover:text-primary-700 p-0.5 shrink-0"
                    onClick={() => speak(ex.en)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">{ex.cs}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const levels = ['A1', 'A2', 'B1'] as const;

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>← Zpět</button>
      <h1 className="page-title">Gramatický přehled</h1>
      <p className="page-subtitle">Stručná pravidla anglické gramatiky v češtině.</p>

      {levels.map((level) => {
        const topics = GRAMMAR_REFERENCE.filter((t) => t.level === level);
        if (topics.length === 0) return null;
        return (
          <div key={level} className="mb-6">
            <h2 className="flex items-center gap-2 mb-3">
              <span className={`badge ${
                level === 'A1' ? 'bg-green-100 text-green-700' :
                level === 'A2' ? 'bg-blue-100 text-blue-700' :
                'bg-purple-100 text-purple-700'
              }`}>{level}</span>
            </h2>
            <div className="space-y-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className="card-hover w-full text-left"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-800">{topic.titleCs}</h3>
                      <p className="text-xs text-slate-400">{topic.titleEn}</p>
                    </div>
                    <span className="text-slate-300 text-xl">→</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
