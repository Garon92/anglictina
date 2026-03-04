import { useState } from 'react';
import { saveSettings } from '../db';
import type { UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';

interface Props {
  onComplete: (s: UserSettings) => void;
}

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<UserSettings>({ ...DEFAULT_SETTINGS });

  const update = (patch: Partial<UserSettings>) =>
    setSettings((s) => ({ ...s, ...patch }));

  const finish = async () => {
    const final = { ...settings, onboardingDone: true };
    await saveSettings(final);
    onComplete(final);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8">
        {step === 0 && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              EN
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Ahoj! 👋
            </h1>
            <p className="text-slate-600 mb-2">
              Tahle appka ti pomůže se připravit na maturitu z angličtiny.
            </p>
            <p className="text-slate-500 text-sm mb-8">
              Každý den kousek — slovíčka, gramatika, čtení.
              Žádný stres, žádný spěch.
            </p>
            <button className="btn-primary btn-lg w-full" onClick={() => setStep(1)}>
              Pojďme na to!
            </button>
          </div>
        )}

        {step === 1 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Kdy maturuješ?</h2>
            <p className="text-slate-500 text-sm mb-6">Nastavíme odpočet a naplánujeme přípravu.</p>
            <input
              type="date"
              className="input mb-6"
              value={settings.examDate}
              onChange={(e) => update({ examDate: e.target.value })}
            />
            <h2 className="text-xl font-bold text-slate-900 mb-1">Cílové skóre</h2>
            <p className="text-slate-500 text-sm mb-4">
              Minimum je 44 bodů ze 100. Doporučujeme cílit na 60+.
            </p>
            <div className="flex gap-3 mb-6">
              {[44, 50, 60, 70].map((score) => (
                <button
                  key={score}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    settings.goalScore === score
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => update({ goalScore: score })}
                >
                  {score}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(0)}>Zpět</button>
              <button className="btn-primary flex-1" onClick={() => setStep(2)}>Dál</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-1">Kolik minut denně?</h2>
            <p className="text-slate-500 text-sm mb-6">I 10 minut denně dělá obrovský rozdíl.</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { min: 10, label: '10 min', desc: 'Rychlý drill' },
                { min: 15, label: '15 min', desc: 'Lehký trénink' },
                { min: 25, label: '25 min', desc: 'Doporučeno' },
                { min: 40, label: '40 min', desc: 'Intenzivní' },
              ].map(({ min, label, desc }) => (
                <button
                  key={min}
                  className={`py-4 rounded-xl text-center transition-all ${
                    settings.minutesPerDay === min
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => update({ minutesPerDay: min })}
                >
                  <div className="font-bold text-lg">{label}</div>
                  <div className={`text-xs ${settings.minutesPerDay === min ? 'text-primary-100' : 'text-slate-400'}`}>
                    {desc}
                  </div>
                </button>
              ))}
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-1">Nová slovíčka denně</h2>
            <p className="text-slate-500 text-sm mb-4">Méně = lépe se zapamatují. Můžeš změnit kdykoliv.</p>
            <div className="flex gap-3 mb-6">
              {[5, 8, 12, 15].map((n) => (
                <button
                  key={n}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                    settings.newCardsPerDay === n
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  onClick={() => update({ newCardsPerDay: n })}
                >
                  {n}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setStep(1)}>Zpět</button>
              <button className="btn-primary flex-1" onClick={() => setStep(3)}>Dál</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="text-center">
            <div className="text-5xl mb-4">🩺</div>
            <h2 className="text-xl font-bold text-slate-900 mb-2">Diagnostický test</h2>
            <p className="text-slate-500 text-sm mb-6">
              Chceš si nejdřív zjistit svou aktuální úroveň? Krátký test (30 otázek) ti ukáže, kde začít.
              Můžeš ho udělat i později.
            </p>
            <button className="btn-primary btn-lg w-full mb-3" onClick={() => {
              finish().then(() => {
                window.location.hash = '#/diagnostic';
              });
            }}>
              Chci udělat test
            </button>
            <button className="btn-secondary w-full" onClick={finish}>
              Přeskočit — rovnou se učit 🚀
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 mt-6">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-primary-500 w-6' : 'bg-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
