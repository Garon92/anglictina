import { useState, useEffect } from 'react';
import { getDrillSessions } from '../db';

const DAY_LABELS = ['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];

function getLast7Days(): string[] {
  const days: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

export default function WeeklyMiniGraph() {
  const [data, setData] = useState<{ date: string; minutes: number }[]>([]);

  useEffect(() => {
    (async () => {
      const days = getLast7Days();
      const result: { date: string; minutes: number }[] = [];
      for (const day of days) {
        const sessions = await getDrillSessions(day);
        const mins = sessions.reduce((sum, s) => {
          if (!s.endedAt) return sum;
          return sum + (s.endedAt - s.startedAt) / 60000;
        }, 0);
        result.push({ date: day, minutes: Math.round(mins * 10) / 10 });
      }
      setData(result);
    })();
  }, []);

  if (data.length === 0) return null;

  const maxMin = Math.max(...data.map((d) => d.minutes), 1);

  return (
    <div className="card !p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Aktivita za týden</span>
        <span className="text-[10px] text-slate-400">
          {Math.round(data.reduce((s, d) => s + d.minutes, 0))} min celkem
        </span>
      </div>
      <div className="flex items-end gap-1 h-16">
        {data.map((d, i) => {
          const pct = (d.minutes / maxMin) * 100;
          const dayOfWeek = new Date(d.date + 'T12:00:00').getDay();
          const label = DAY_LABELS[dayOfWeek === 0 ? 6 : dayOfWeek - 1];
          return (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5">
              <div className="w-full relative" style={{ height: '48px' }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t transition-all ${
                    d.minutes > 0
                      ? 'bg-primary-400 dark:bg-primary-500'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                  style={{ height: `${Math.max(d.minutes > 0 ? 8 : 4, pct)}%` }}
                />
              </div>
              <span className="text-[9px] text-slate-400">{label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
