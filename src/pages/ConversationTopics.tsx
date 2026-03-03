import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CONVERSATION_TOPICS } from '../data/conversation';
import type { ConversationTopic } from '../data/conversation';
import { speak } from '../tts';

const LEVEL_BADGE: Record<string, string> = {
  A2: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  B1: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
};

const TABS = ['Slovíčka', 'Fráze', 'Otázky', 'Vzorová odpověď'] as const;
type Tab = (typeof TABS)[number];

function SpeakerBtn({ text, rate }: { text: string; rate?: number }) {
  return (
    <button
      className="text-primary-500 hover:text-primary-700 dark:hover:text-primary-300 p-0.5 shrink-0"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, rate);
      }}
      aria-label="Přehrát"
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
      </svg>
    </button>
  );
}

function highlightVocabulary(text: string, vocabulary: { en: string }[]) {
  if (vocabulary.length === 0) return <>{text}</>;

  const sortedWords = [...vocabulary]
    .map((v) => v.en.toLowerCase())
    .sort((a, b) => b.length - a.length);

  const escaped = sortedWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const pattern = new RegExp(`\\b(${escaped.join('|')})\\b`, 'gi');
  const parts = text.split(pattern);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = sortedWords.includes(part.toLowerCase());
        return isMatch ? (
          <mark
            key={i}
            className="bg-yellow-200 dark:bg-yellow-700/50 text-inherit rounded px-0.5"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}

function VocabularyTab({ topic }: { topic: ConversationTopic }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {topic.keyVocabulary.map((item, i) => (
        <div
          key={i}
          className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
        >
          <div className="flex-1 min-w-0 grid grid-cols-2 gap-2">
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
              {item.en}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400">{item.cs}</span>
          </div>
          <SpeakerBtn text={item.en} />
        </div>
      ))}
    </div>
  );
}

function PhrasesTab({ topic }: { topic: ConversationTopic }) {
  return (
    <div className="space-y-2">
      {topic.usefulPhrases.map((phrase, i) => (
        <div
          key={i}
          className="flex items-start gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{phrase.en}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{phrase.cs}</p>
          </div>
          <SpeakerBtn text={phrase.en} />
        </div>
      ))}
    </div>
  );
}

function QuestionsTab({ topic }: { topic: ConversationTopic }) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        {topic.sampleQuestions.map((q, i) => (
          <div
            key={i}
            className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 rounded-xl p-3"
          >
            <span className="text-sm font-medium text-slate-800 dark:text-slate-200 flex-1">
              {i + 1}. {q}
            </span>
            <SpeakerBtn text={q} />
          </div>
        ))}
      </div>
      <p className="text-sm text-amber-600 dark:text-amber-400 font-medium text-center mt-4">
        💡 Zkus si odpovědět nahlas!
      </p>
    </div>
  );
}

function SampleAnswerTab({ topic }: { topic: ConversationTopic }) {
  return (
    <div className="space-y-4">
      <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-700 rounded-xl p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed">
          <span className="font-semibold">💡 Tip: </span>
          {topic.structureHintCs}
        </p>
      </div>

      <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Vzorová odpověď
          </h4>
          <button
            className="flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 bg-primary-50 dark:bg-primary-900/30 rounded-full px-3 py-1.5 transition-colors"
            onClick={() => speak(topic.sampleAnswer, 0.85)}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.383 3.07A1 1 0 0112 4v16a1 1 0 01-1.617.784L5.131 16H2a1 1 0 01-1-1V9a1 1 0 011-1h3.131l5.252-4.784A1 1 0 0111.383 3.07zM14.657 5.929a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-2.343-5.657 1 1 0 010-1.414z" />
            </svg>
            Přehrát vše
          </button>
        </div>
        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {highlightVocabulary(topic.sampleAnswer, topic.keyVocabulary)}
        </p>
      </div>
    </div>
  );
}

function TopicDetail({
  topic,
  onBack,
}: {
  topic: ConversationTopic;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<Tab>('Slovíčka');

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={onBack}>
        ← Zpět na přehled
      </button>

      <div className="flex items-center gap-3 mb-1">
        <span className="text-3xl">{topic.icon}</span>
        <span className={`badge ${LEVEL_BADGE[topic.level]}`}>{topic.level}</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{topic.titleCs}</h1>
      <p className="text-base text-slate-500 dark:text-slate-400 mb-4">{topic.titleEn}</p>

      <div className="card mb-5">
        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {topic.introduction}
        </p>
      </div>

      <div className="flex gap-2 flex-wrap mb-5">
        {TABS.map((t) => (
          <button
            key={t}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
              tab === t
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="card">
        {tab === 'Slovíčka' && <VocabularyTab topic={topic} />}
        {tab === 'Fráze' && <PhrasesTab topic={topic} />}
        {tab === 'Otázky' && <QuestionsTab topic={topic} />}
        {tab === 'Vzorová odpověď' && <SampleAnswerTab topic={topic} />}
      </div>
    </div>
  );
}

export default function ConversationTopics() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<ConversationTopic | null>(null);
  const [filterLevel, setFilterLevel] = useState('all');

  if (selected) {
    return <TopicDetail topic={selected} onBack={() => setSelected(null)} />;
  }

  const filtered = CONVERSATION_TOPICS.filter((t) => {
    if (filterLevel !== 'all' && t.level !== filterLevel) return false;
    return true;
  });

  return (
    <div className="page-container">
      <button className="btn-ghost text-sm mb-4" onClick={() => navigate('/')}>
        ← Zpět
      </button>

      <h1 className="page-title">Konverzační témata</h1>
      <p className="page-subtitle">25 témat pro ústní maturitu</p>

      <div className="mb-4 flex gap-2 flex-wrap">
        {['all', 'A2', 'B1'].map((lvl) => (
          <button
            key={lvl}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterLevel === lvl
                ? 'bg-primary-500 text-white'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            onClick={() => setFilterLevel(lvl)}
          >
            {lvl === 'all' ? 'Všechny úrovně' : lvl}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400 dark:text-slate-500 mb-3">
        {filtered.length} témat
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((topic) => (
          <button
            key={topic.id}
            className="card-hover w-full text-left"
            onClick={() => setSelected(topic)}
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{topic.icon}</span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200">
                  {topic.titleCs}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {topic.titleEn}
                </p>
              </div>
              <span className={`badge text-xs ${LEVEL_BADGE[topic.level]}`}>{topic.level}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
