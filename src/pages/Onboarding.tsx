import { useState } from 'react';
import { useNavigate } from 'react-router';
import { saveSettings } from '../db';
import type { UserSettings } from '../types';
import { DEFAULT_SETTINGS } from '../types';
import { setAppName } from '../lib/name';
import { daysUntil, czechPlural } from '../lib/dates';

interface Props {
  onComplete: (s: UserSettings) => void;
}

/** Early May of the next maturita season (didaktické testy are usually in the first week of May). */
export function defaultExamDate(now = new Date()): string {
  const year = now.getMonth() >= 5 ? now.getFullYear() + 1 : now.getFullYear();
  return `${year}-05-04`;
}

const STEPS = 3;

export default function Onboarding({ onComplete }: Props) {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [settings, setSettings] = useState<UserSettings>(() => ({
    ...DEFAULT_SETTINGS,
    examDate: DEFAULT_SETTINGS.examDate === '2028-05-05' ? defaultExamDate() : DEFAULT_SETTINGS.examDate,
  }));
  const update = (patch: Partial<UserSettings>) => setSettings((s) => ({ ...s, ...patch }));
  const days = daysUntil(settings.examDate);

  async function finish(goTo?: string) {
    const final = { ...settings, onboardingDone: true };
    if (name.trim()) setAppName(name);
    await saveSettings(final);
    onComplete(final);
    if (goTo) navigate(goTo);
  }

  return (
    <div className="g92-app">
      <g92-appbar app="anglictina" no-settings />
      <main className="m-auto w-full max-w-lg p-4 py-10">
        <div className="card !p-6 shadow-3 sm:!p-8">
          {step === 0 && (
            <div className="text-center">
              <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-3xl bg-accent text-3xl font-black text-accent-contrast shadow-3" aria-hidden="true">EN</div>
              <h1 className="text-3xl font-black text-fg">Ahoj! 👋</h1>
              <p className="mt-2 text-lg text-fg">Pomůžu ti připravit se na maturitu z angličtiny.</p>
              <ul className="mx-auto mt-5 max-w-sm space-y-2 text-left text-sm text-muted">
                <li>🗂️ slovíčka s chytrým opakováním</li>
                <li>✏️ gramatika, čtení a poslech po malých dávkách</li>
                <li>🎓 cvičné didaktické testy jako u opravdové maturity</li>
                <li>📈 přehled pokroku a chyb, které se vracejí, dokud je nezvládneš</li>
              </ul>
              <label className="mx-auto mt-6 block max-w-sm text-left">
                <span className="g92-label">Jak ti mám říkat? (nepovinné)</span>
                <input
                  className="input mt-1"
                  value={name}
                  maxLength={40}
                  autoComplete="given-name"
                  enterKeyHint="next"
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setStep(1);
                    }
                  }}
                  placeholder="Tvoje jméno"
                />
                <span className="g92-hint mt-1 block">Jméno uvidíš jen v Angličtině.</span>
              </label>
              <button type="button" className="btn-primary btn-lg mt-6 w-full" onClick={() => setStep(1)}>Pojďme na to</button>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-2xl font-black text-fg">Kdy maturuješ?</h2>
              <p className="mt-1 text-sm text-muted">Podle data naplánujeme přípravu a ukážeme odpočet.</p>
              <input type="date" className="input mt-4" value={settings.examDate} onChange={(e) => e.target.value && update({ examDate: e.target.value })} aria-label="Datum didaktického testu" />
              {days > 0 && <p className="mt-2 text-sm font-bold text-accent-text">To je za {days} {czechPlural(days, 'den', 'dny', 'dní')}.</p>}

              <h2 className="mt-7 text-2xl font-black text-fg">Kolik bodů chceš mít?</h2>
              <p className="mt-1 text-sm text-muted">K úspěchu stačí 44 ze 100. Cíl kolem 60 dává bezpečnou rezervu.</p>
              <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Cílové skóre">
                {[44, 50, 60, 70].map((s) => (
                  <button key={s} type="button" className="g92-chip justify-center !text-base" aria-pressed={settings.goalScore === s} onClick={() => update({ goalScore: s })}>{s}</button>
                ))}
              </div>
              <Nav onBack={() => setStep(0)} onNext={() => setStep(2)} />
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-2xl font-black text-fg">Kolik času denně?</h2>
              <p className="mt-1 text-sm text-muted">Pravidelnost je důležitější než délka. I 15 minut denně udělá velký rozdíl.</p>
              <div className="mt-4 grid grid-cols-2 gap-2" role="group" aria-label="Minut denně">
                {[
                  { min: 10, desc: 'Rychlá dávka' },
                  { min: 15, desc: 'Lehký trénink' },
                  { min: 25, desc: 'Doporučeno' },
                  { min: 40, desc: 'Intenzivně' },
                ].map(({ min, desc }) => (
                  <button key={min} type="button" className={`exam-setcard text-center ${settings.minutesPerDay === min ? 'is-selected' : ''}`} aria-pressed={settings.minutesPerDay === min} onClick={() => update({ minutesPerDay: min })}>
                    <span className="block text-xl font-black text-fg">{min} min</span>
                    <span className="block text-xs text-muted">{desc}</span>
                  </button>
                ))}
              </div>

              <h2 className="mt-7 text-2xl font-black text-fg">Nová slovíčka denně</h2>
              <p className="mt-1 text-sm text-muted">Méně nových = lépe se zapamatují. Změníš kdykoli v nastavení.</p>
              <div className="mt-3 grid grid-cols-4 gap-2" role="group" aria-label="Nová slovíčka denně">
                {[5, 8, 12, 15].map((n) => (
                  <button key={n} type="button" className="g92-chip justify-center !text-base" aria-pressed={settings.newCardsPerDay === n} onClick={() => update({ newCardsPerDay: n })}>{n}</button>
                ))}
              </div>
              <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} />
            </div>
          )}

          {step === 3 && (
            <div className="text-center">
              <div className="mb-3 text-5xl" aria-hidden="true">🩺</div>
              <h2 className="text-2xl font-black text-fg">Zjistíme, kde začít?</h2>
              <p className="mt-2 text-sm text-muted">Krátký rozřazovací test (asi 10 minut) ukáže tvou úroveň a co procvičovat nejdřív. Můžeš ho udělat i později.</p>
              <button type="button" className="btn-primary btn-lg mt-6 w-full" onClick={() => void finish('/diagnostic')}>Udělat rozřazovací test</button>
              <button type="button" className="btn-secondary btn-lg mt-3 w-full" onClick={() => void finish()}>Přeskočit a začít se učit</button>
              <button type="button" className="btn-ghost mt-3" onClick={() => setStep(2)}>‹ Zpět</button>
            </div>
          )}

          <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
            {Array.from({ length: STEPS + 1 }, (_, i) => (
              <span key={i} className={`h-2 rounded-full transition-all ${i === step ? 'w-6 bg-accent' : 'w-2 bg-surface-3'}`} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

function Nav({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div className="mt-8 flex gap-3">
      <button type="button" className="btn-secondary btn-lg flex-1" onClick={onBack}>Zpět</button>
      <button type="button" className="btn-primary btn-lg flex-1" onClick={onNext}>Dál</button>
    </div>
  );
}
