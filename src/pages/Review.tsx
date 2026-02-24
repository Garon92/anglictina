import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStats, getAllSRSStates, getDrillSessions, getReviewLogs } from '../db';
import { formatMinutes, percentOf, getScoreColor } from '../utils';
import type { UserStats, SRSState, DrillSession } from '../types';
import { DEFAULT_STATS } from '../types';

export default function Review() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [srsStates, setSrsStates] = useState<SRSState[]>([]);
  const [sessions, setSessions] = useState<DrillSession[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'vocab'>('overview');

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [s, srs, sess] = await Promise.all([
      getStats(),
      getAllSRSStates(),
      getDrillSessions(),
    ]);
    setStats(s);
    setSrsStates(srs);
    setSessions(sess.sort((a, b) => (b.startedAt || 0) - (a.startedAt || 0)));
  }

  const totalWords = srsStates.filter((s) => s.deckId === 'vocab').length;
  const masteredWords = srsStates.filter(
    (s) => s.deckId === 'vocab' && s.intervalDays >= 21
  ).length;
  const learningWords = totalWords - masteredWords;
  const dueNow = srsStates.filter((s) => s.dueAt <= Date.now()).length;

  const last7days = sessions.filter(
    (s) => s.startedAt > Date.now() - 7 * 86400000
  );
  const last7correct = last7days.reduce((sum, s) => sum + s.correctItems, 0);
  const last7total = last7days.reduce((sum, s) => sum + s.totalItems, 0);
  const weekAccuracy = percentOf(last7correct, last7total);

  const sessionsByType = {
    vocab: sessions.filter((s) => s.type === 'vocab').length,
    grammar: sessions.filter((s) => s.type === 'grammar').length,
    reading: sessions.filter((s) => s.type === 'reading').length,
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Tvůj pokrok</h1>
      <p className="page-subtitle">Přehled tvého učení a statistik.</p>

      {/* Streak & time */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="card text-center">
          <div className="text-3xl mb-1">🔥</div>
          <div className="text-2xl font-bold text-slate-900">{stats.streakDays}</div>
          <div className="text-xs text-slate-400">dní v řadě</div>
          <div className="text-xs text-slate-300 mt-1">Rekord: {stats.bestStreak}</div>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-1">⏱️</div>
          <div className="text-2xl font-bold text-slate-900">{formatMinutes(stats.totalStudyMinutes)}</div>
          <div className="text-xs text-slate-400">celkový čas</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
        {(['overview', 'sessions', 'vocab'] as const).map((tab) => (
          <button
            key={tab}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'overview' ? 'Přehled' : tab === 'sessions' ? 'Lekce' : 'Slovíčka'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="section-title">Posledních 7 dní</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{last7days.length}</div>
                <div className="text-xs text-slate-400">lekcí</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-slate-900">{last7total}</div>
                <div className="text-xs text-slate-400">úloh</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold" style={{ color: getScoreColor(weekAccuracy) }}>
                  {weekAccuracy}%
                </div>
                <div className="text-xs text-slate-400">úspěšnost</div>
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="section-title">Celkem</h3>
            <div className="space-y-2">
              <StatRow label="Naučených slov" value={String(stats.totalCardsLearned)} />
              <StatRow label="Dokončených cvičení" value={String(stats.totalExercisesDone)} />
              <StatRow label="Slovíčkových lekcí" value={String(sessionsByType.vocab)} />
              <StatRow label="Gramatických lekcí" value={String(sessionsByType.grammar)} />
              <StatRow label="Čtení" value={String(sessionsByType.reading)} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'sessions' && (
        <div className="space-y-2">
          {sessions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <div className="text-4xl mb-2">📝</div>
              <p>Zatím žádné lekce. Začni se učit!</p>
            </div>
          ) : (
            sessions.slice(0, 30).map((s, i) => (
              <div key={i} className="card !p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${
                    s.type === 'vocab' ? 'bg-blue-50' :
                    s.type === 'grammar' ? 'bg-purple-50' :
                    s.type === 'reading' ? 'bg-green-50' : 'bg-slate-50'
                  }`}>
                    {s.type === 'vocab' ? '📝' : s.type === 'grammar' ? '✏️' : s.type === 'reading' ? '📖' : '🎯'}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {s.type === 'vocab' ? 'Slovíčka' :
                       s.type === 'grammar' ? 'Gramatika' :
                       s.type === 'reading' ? 'Čtení' : 'Zkouška'}
                    </div>
                    <div className="text-xs text-slate-400">{s.date}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: getScoreColor(percentOf(s.correctItems, s.totalItems)) }}>
                    {s.correctItems}/{s.totalItems}
                  </div>
                  <div className="text-xs text-slate-400">
                    {percentOf(s.correctItems, s.totalItems)}%
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'vocab' && (
        <div className="space-y-3">
          <div className="card">
            <h3 className="section-title">Stav slovíček</h3>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold text-blue-600">{totalWords}</div>
                <div className="text-xs text-slate-400">celkem</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-amber-600">{learningWords}</div>
                <div className="text-xs text-slate-400">učí se</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">{masteredWords}</div>
                <div className="text-xs text-slate-400">zvládnuto</div>
              </div>
            </div>
            {totalWords > 0 && (
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                <div
                  className="bg-green-500 h-full"
                  style={{ width: `${percentOf(masteredWords, totalWords)}%` }}
                />
                <div
                  className="bg-amber-400 h-full"
                  style={{ width: `${percentOf(learningWords, totalWords)}%` }}
                />
              </div>
            )}
          </div>

          {dueNow > 0 && (
            <div className="card bg-amber-50 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-amber-800">{dueNow} slov k opakování</div>
                  <div className="text-sm text-amber-600">Opakuj teď pro lepší zapamatování</div>
                </div>
                <button
                  className="btn bg-amber-500 text-white hover:bg-amber-600"
                  onClick={() => navigate('/vocab')}
                >
                  Opakovat
                </button>
              </div>
            </div>
          )}

          <div className="card">
            <h3 className="section-title">Dostupná slovíčka</h3>
            <p className="text-sm text-slate-500">
              V databázi je celkem 402 slov. Každý den se přidávají nová podle tvého nastavení.
            </p>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3">
              <div
                className="bg-primary-500 h-full rounded-full"
                style={{ width: `${percentOf(totalWords, 402)}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">{totalWords} / 402 odhaleno</p>
          </div>
        </div>
      )}
    </div>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
