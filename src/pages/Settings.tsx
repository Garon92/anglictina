import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { exportAllData, importData, clearAllData, getSettings } from '../db';
import { downloadFile } from '../utils';
import { getAvailableVoices, setVoiceByName, speak, getCurrentVoiceName } from '../tts';
import { VOCABULARY } from '../data/vocabulary';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useSettings } from '../App';
import { useSettings as useKitSettings } from '../lib/useKitSettings';
import { setSettings as setKitSettings, confirmDialog, toast, KIT_VERSION } from '../kit';
import { dayKey } from '../lib/dates';
import type { UserSettings } from '../types';
import { PageHeader } from '../components/ui';

export default function Settings() {
  const { settings, updateSettings } = useSettings();
  const kit = useKitSettings();
  const fileRef = useRef<HTMLInputElement>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => getAvailableVoices());
  const { canInstall, install } = usePwaInstall();

  useEffect(() => {
    if (voices.length) return;
    const t = window.setTimeout(() => setVoices(getAvailableVoices()), 800);
    return () => window.clearTimeout(t);
  }, [voices.length]);

  const update = (patch: Partial<UserSettings>) => updateSettings({ ...settings, ...patch });

  async function handleExport() {
    const json = await exportAllData();
    downloadFile(json, `anglictina-zaloha-${dayKey()}.json`);
    toast('Záloha stažena', { variant: 'success' });
  }

  function handleAnkiExport() {
    const lines = VOCABULARY.map((w) => `${w.en}\t${w.cs}${w.example ? `<br><i>${w.example}</i>` : ''}`);
    downloadFile(lines.join('\n'), `anglictina-anki-${dayKey()}.txt`, 'text/tab-separated-values');
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data || typeof data !== 'object' || !('stats' in data || 'srsStates' in data || 'settings' in data)) {
        throw new Error('not a backup');
      }
      const ok = await confirmDialog({
        title: 'Obnovit ze zálohy?',
        message: `Záloha z ${data.exportedAt ? new Date(data.exportedAt).toLocaleString('cs-CZ') : 'neznámého data'} se sloučí s daty v tomto zařízení (stejné záznamy se přepíšou).`,
        confirmLabel: 'Obnovit',
      });
      if (!ok) return;
      await importData(text);
      updateSettings(await getSettings());
      toast('Záloha obnovena', { variant: 'success' });
    } catch {
      toast('Soubor se nepodařilo načíst — je to záloha z této aplikace?', { variant: 'danger' });
    }
  }

  async function handleReset() {
    const ok = await confirmDialog({
      title: 'Smazat všechna data?',
      message: 'Smaže se veškerý pokrok, slovíčka, chyby, výsledky testů, oblíbené i vlastní slovíčka. Tuto akci nejde vrátit. Doporučujeme nejdřív stáhnout zálohu.',
      confirmLabel: 'Smazat vše',
      danger: true,
    });
    if (!ok) return;
    await clearAllData();
    try {
      localStorage.removeItem('anglictina_favorites');
      localStorage.removeItem('anglictina_custom_words');
    } catch { /* ignore */ }
    location.reload();
  }

  return (
    <div className="page-container">
      <PageHeader title="Nastavení" subtitle="Cíle učení, vzhled, výslovnost a záloha dat." back="/" backLabel="Dnes" icon="⚙️" />

      <Section title="Cíle">
        <Row label="Zobrazovat odpočet do maturity">
          <input type="checkbox" role="switch" className="g92-toggle" checked={settings.showCountdown} onChange={(e) => update({ showCountdown: e.target.checked })} aria-label="Zobrazovat odpočet do maturity" />
        </Row>
        <label className="block">
          <span className="g92-label">Datum písemné maturity (didaktický test)</span>
          <input type="date" className="input mt-1" value={settings.examDate} onChange={(e) => e.target.value && update({ examDate: e.target.value })} />
          <span className="mt-1 block text-xs text-muted">Přesné termíny zveřejňuje CERMAT, didaktické testy bývají začátkem května.</span>
        </label>
        <Slider label="Cílové skóre v testu" value={settings.goalScore} min={44} max={100} step={1} suffix=" b" onChange={(v) => update({ goalScore: v })} hint="Hranice úspěšnosti je 44 bodů. Cíl kolem 60 dává bezpečnou rezervu." />
        <Slider label="Denní cíl" value={settings.minutesPerDay} min={5} max={60} step={5} suffix=" min" onChange={(v) => update({ minutesPerDay: v })} />
        <Slider label="Nová slovíčka denně" value={settings.newCardsPerDay} min={0} max={30} step={1} onChange={(v) => update({ newCardsPerDay: v })} hint="Méně je víc — 5–10 nových slov denně se dobře drží v paměti." />
        <Slider label="Nejvíc opakování denně" value={settings.maxReviewsPerDay} min={20} max={300} step={10} onChange={(v) => update({ maxReviewsPerDay: v })} />
      </Section>

      <Section title="Vzhled a zvuk" note="Platí pro všechny aplikace v menu garon92.">
        <div>
          <span className="g92-label">Motiv</span>
          <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Motiv">
            {([['auto', '🔄 Podle systému'], ['light', '☀️ Světlý'], ['dark', '🌙 Tmavý']] as const).map(([v, l]) => (
              <button key={v} type="button" className="g92-chip" aria-pressed={kit.theme === v} onClick={() => setKitSettings({ theme: v })}>{l}</button>
            ))}
          </div>
        </div>
        <div>
          <span className="g92-label">Velikost písma</span>
          <div className="mt-1.5 flex flex-wrap gap-2" role="radiogroup" aria-label="Velikost písma">
            {([['small', 'Menší'], ['medium', 'Střední'], ['large', 'Větší']] as const).map(([v, l]) => (
              <button key={v} type="button" className="g92-chip" aria-pressed={settings.fontSize === v} onClick={() => update({ fontSize: v })}>{l}</button>
            ))}
          </div>
        </div>
        <Row label="Zvukové efekty">
          <input type="checkbox" role="switch" className="g92-toggle" checked={kit.sound} onChange={(e) => setKitSettings({ sound: e.target.checked })} aria-label="Zvukové efekty" />
        </Row>
        <Row label="Omezit animace">
          <input type="checkbox" role="switch" className="g92-toggle" checked={kit.reducedMotion === 'on'} onChange={(e) => setKitSettings({ reducedMotion: e.target.checked ? 'on' : 'auto' })} aria-label="Omezit animace" />
        </Row>
        <label className="block">
          <span className="g92-label">Jak ti máme říkat? (nepovinné)</span>
          <input className="input mt-1" value={kit.playerName} maxLength={40} placeholder="Tvoje jméno" onChange={(e) => setKitSettings({ playerName: e.target.value })} />
        </label>
      </Section>

      <Section title="Výslovnost">
        <Row label="Po otočení kartičky přečíst slovo">
          <input type="checkbox" role="switch" className="g92-toggle" checked={settings.ttsEnabled} onChange={(e) => update({ ttsEnabled: e.target.checked })} aria-label="Automaticky číst slovíčka" />
        </Row>
        {voices.length > 0 ? (
          <label className="block">
            <span className="g92-label">Hlas</span>
            <div className="mt-1 flex gap-2">
              <select
                className="g92-select input flex-1"
                value={settings.ttsVoice || getCurrentVoiceName()}
                onChange={(e) => {
                  setVoiceByName(e.target.value);
                  update({ ttsVoice: e.target.value });
                }}
              >
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>{v.name} ({v.lang})</option>
                ))}
              </select>
              <button type="button" className="btn-secondary" onClick={() => void speak('Hello! How are you today?', settings.ttsRate)}>Vyzkoušet</button>
            </div>
          </label>
        ) : (
          <p className="text-sm text-muted">Prohlížeč zatím nenabízí žádný anglický hlas. Na telefonu ho lze doinstalovat v nastavení systému (Převod textu na řeč).</p>
        )}
        <Slider label="Rychlost řeči" value={settings.ttsRate} min={0.6} max={1.2} step={0.05} format={(v) => `${Math.round(v * 100)} %`} onChange={(v) => update({ ttsRate: v })} />
      </Section>

      <Section title="Záloha a data" note="Vše se ukládá jen v tomto zařízení. Záloha se hodí při přechodu na jiný telefon nebo počítač.">
        <div className="grid gap-2 sm:grid-cols-2">
          <button type="button" className="btn-secondary" onClick={() => void handleExport()}>⬇️ Stáhnout zálohu</button>
          <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>⬆️ Obnovit ze zálohy</button>
          <button type="button" className="btn-secondary sm:col-span-2" onClick={handleAnkiExport}>📑 Exportovat slovíčka pro Anki</button>
        </div>
        <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={(e) => void handleImport(e)} aria-label="Soubor se zálohou" />
        <button type="button" className="btn-ghost btn-sm !text-danger" onClick={() => void handleReset()}>Smazat všechna data…</button>
      </Section>

      {canInstall && (
        <section className="card g92-card--accent mb-4 flex items-center gap-4 !p-5">
          <span className="text-3xl" aria-hidden="true">📲</span>
          <div className="min-w-0 flex-1">
            <h2 className="font-black text-fg">Nainstalovat aplikaci</h2>
            <p className="text-sm text-muted">Spustíš ji z plochy a funguje i bez internetu.</p>
          </div>
          <button type="button" className="btn-primary" onClick={() => void install()}>Instalovat</button>
        </section>
      )}

      <Section title="Zdroje">
        <ul className="divide-y divide-border text-sm">
          <li><Link to="/grammar-ref" className="flex justify-between py-2.5 font-bold">📋 Přehled gramatiky <span aria-hidden="true">›</span></Link></li>
          <li><Link to="/study-plan" className="flex justify-between py-2.5 font-bold">📅 Studijní plán <span aria-hidden="true">›</span></Link></li>
          <li><a href="https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi" target="_blank" rel="noopener noreferrer" className="flex justify-between py-2.5 font-bold">🎯 Oficiální testy CERMAT <span aria-hidden="true">↗</span></a></li>
          <li><a href="https://www.newgeneralservicelist.com/" target="_blank" rel="noopener noreferrer" className="flex justify-between py-2.5 font-bold">📚 New General Service List <span aria-hidden="true">↗</span></a></li>
        </ul>
      </Section>

      <p className="mt-6 text-center text-xs text-muted">
        Angličtina 2.0 · g92 kit {KIT_VERSION} · slovní zásoba z NGSL (CC BY-SA 4.0) · cvičné testy jsou původní materiály ve formátu CERMAT
      </p>
    </div>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: ReactNode }) {
  return (
    <section className="card mb-4 !p-5">
      <h2 className="section-title !mb-1">{title}</h2>
      {note && <p className="mb-3 text-xs text-muted">{note}</p>}
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm font-bold text-fg">{label}</span>
      {children}
    </div>
  );
}

function Slider({ label, value, min, max, step, onChange, suffix = '', hint, format }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  suffix?: string;
  hint?: string;
  format?: (v: number) => string;
}) {
  return (
    <label className="block">
      <span className="flex justify-between gap-2">
        <span className="g92-label">{label}</span>
        <span className="text-sm font-black tabular-nums text-accent-text">{format ? format(value) : `${value}${suffix}`}</span>
      </span>
      <input type="range" className="g92-range mt-2 w-full" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}
