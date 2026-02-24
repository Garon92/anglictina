import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WRITING_TEMPLATES } from '../data/writing';
import { speak } from '../tts';
import type { WritingTemplate } from '../types';

const TYPE_ICONS: Record<WritingTemplate['type'], string> = {
  email: '📧',
  letter: '✉️',
  essay: '📝',
  description: '🖼️',
};

const TYPE_LABELS: Record<string, string> = {
  all: 'Vše',
  email: 'Email',
  letter: 'Dopis',
  essay: 'Esej',
  description: 'Popis',
};

const LEVEL_BADGE: Record<string, string> = {
  A2: 'bg-blue-100 text-blue-700',
  B1: 'bg-purple-100 text-purple-700',
};

function SpeakerBtn({ text, rate }: { text: string; rate?: number }) {
  return (
    <button
      className="text-primary-500 hover:text-primary-700 p-0.5 shrink-0"
      onClick={() => speak(text, rate)}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
      </svg>
    </button>
  );
}

export default function WritingTips() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<WritingTemplate | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterLevel, setFilterLevel] = useState('all');

  const filtered = WRITING_TEMPLATES.filter((t) => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (filterLevel !== 'all' && t.level !== filterLevel) return false;
    return true;
  });

  if (selected) {
    return (
      <div className="page-container">
        <button className="btn-ghost text-sm mb-4" onClick={() => setSelected(null)}>
          ← Zpět na přehled
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">{TYPE_ICONS[selected.type]}</span>
          <span className={`badge ${LEVEL_BADGE[selected.level]}`}>{selected.level}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">{selected.titleCs}</h1>

        {/* Struktura */}
        <div className="card mb-4">
          <h3 className="section-title">Struktura</h3>
          <div className="space-y-2">
            {selected.structureCs.split('\n').map((line, i) => (
              <p key={i} className="text-sm text-slate-700 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        {/* Užitečné fráze */}
        <div className="card mb-4">
          <h3 className="section-title">Užitečné fráze</h3>
          <div className="space-y-2">
            {selected.usefulPhrases.map((phrase, i) => (
              <div key={i} className="flex items-start gap-2 bg-slate-50 rounded-xl p-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800">{phrase.en}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{phrase.cs}</p>
                </div>
                <SpeakerBtn text={phrase.en} />
              </div>
            ))}
          </div>
        </div>

        {/* Ukázkový text */}
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="section-title !mb-0">Ukázkový text</h3>
            <SpeakerBtn text={selected.example} rate={0.85} />
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {selected.example}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
        ← Zpět
      </button>
      <h1 className="page-title">Psaní — tipy a šablony</h1>
      <p className="page-subtitle">Nauč se strukturovat různé typy textů</p>

      {/* Type filter */}
      <div className="mb-3 flex gap-2 flex-wrap">
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              filterType === key ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setFilterType(key)}
          >
            {key !== 'all' && `${TYPE_ICONS[key as WritingTemplate['type']]} `}
            {label}
          </button>
        ))}
      </div>

      {/* Level filter */}
      <div className="mb-4 flex gap-2 flex-wrap">
        {['all', 'A2', 'B1'].map((lvl) => (
          <button
            key={lvl}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterLevel === lvl ? 'bg-primary-500 text-white' : 'bg-slate-100 text-slate-600'
            }`}
            onClick={() => setFilterLevel(lvl)}
          >
            {lvl === 'all' ? 'Všechny úrovně' : lvl}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 mb-3">{filtered.length} šablon</p>

      <div className="space-y-3">
        {filtered.map((tpl) => (
          <button
            key={tpl.id}
            className="card-hover w-full text-left"
            onClick={() => setSelected(tpl)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{TYPE_ICONS[tpl.type]}</span>
                <div>
                  <h3 className="font-semibold text-slate-800">{tpl.titleCs}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge ${LEVEL_BADGE[tpl.level]}`}>{tpl.level}</span>
                    <span className="text-xs text-slate-400">
                      {TYPE_LABELS[tpl.type]}
                    </span>
                  </div>
                </div>
              </div>
              <span className="text-slate-300 text-xl">→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
