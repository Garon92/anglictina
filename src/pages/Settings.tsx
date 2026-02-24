import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { saveSettings, exportAllData, importData, clearAllData } from '../db';
import { downloadFile } from '../utils';
import { getAvailableVoices, setVoiceByName, speak, getCurrentVoiceName } from '../tts';
import type { UserSettings } from '../types';

interface Props {
  settings: UserSettings;
  onUpdate: (s: UserSettings) => void;
}

export default function Settings({ settings, onUpdate }: Props) {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [showConfirmReset, setShowConfirmReset] = useState(false);
  const [importMsg, setImportMsg] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const v = getAvailableVoices();
    setVoices(v);
    if (v.length === 0) {
      const timer = setTimeout(() => setVoices(getAvailableVoices()), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const update = (patch: Partial<UserSettings>) => {
    const next = { ...settings, ...patch };
    onUpdate(next);
    saveSettings(next);
  };

  async function handleExport() {
    const json = await exportAllData();
    downloadFile(json, `anglictina-backup-${new Date().toISOString().slice(0, 10)}.json`);
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      await importData(text);
      setImportMsg('Import proběhl úspěšně! Obnov stránku.');
    } catch {
      setImportMsg('Chyba při importu. Zkontroluj soubor.');
    }
  }

  async function handleReset() {
    await clearAllData();
    window.location.reload();
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Nastavení</h1>
      <p className="page-subtitle">Přizpůsob si aplikaci podle sebe.</p>

      {/* Study settings */}
      <div className="card mb-4">
        <h3 className="section-title">Učení</h3>

        <label className="block mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">Datum maturity</span>
          <input
            type="date"
            className="input mt-1"
            value={settings.examDate}
            onChange={(e) => update({ examDate: e.target.value })}
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">Cílové skóre ({settings.goalScore} bodů)</span>
          <input
            type="range"
            className="w-full mt-1"
            min={44}
            max={100}
            value={settings.goalScore}
            onChange={(e) => update({ goalScore: +e.target.value })}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>44 (min.)</span>
            <span>100</span>
          </div>
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">Minut denně ({settings.minutesPerDay})</span>
          <input
            type="range"
            className="w-full mt-1"
            min={5}
            max={60}
            step={5}
            value={settings.minutesPerDay}
            onChange={(e) => update({ minutesPerDay: +e.target.value })}
          />
        </label>

        <label className="block mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">Nová slovíčka denně ({settings.newCardsPerDay})</span>
          <input
            type="range"
            className="w-full mt-1"
            min={1}
            max={25}
            value={settings.newCardsPerDay}
            onChange={(e) => update({ newCardsPerDay: +e.target.value })}
          />
        </label>

        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Max opakování denně ({settings.maxReviewsPerDay})</span>
          <input
            type="range"
            className="w-full mt-1"
            min={10}
            max={100}
            step={5}
            value={settings.maxReviewsPerDay}
            onChange={(e) => update({ maxReviewsPerDay: +e.target.value })}
          />
        </label>
      </div>

      {/* Theme */}
      <div className="card mb-4">
        <h3 className="section-title">Vzhled</h3>
        <div className="flex gap-2">
          {([['light', 'Světlý'], ['dark', 'Tmavý'], ['auto', 'Automatický']] as const).map(([val, label]) => (
            <button
              key={val}
              className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                settings.theme === val
                  ? 'bg-primary-500 text-white'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              onClick={() => update({ theme: val })}
            >
              {val === 'light' ? '☀️' : val === 'dark' ? '🌙' : '🔄'} {label}
            </button>
          ))}
        </div>
      </div>

      {/* TTS */}
      <div className="card mb-4">
        <h3 className="section-title">Výslovnost (TTS)</h3>

        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-slate-600 dark:text-slate-300">Automatické přehrávání</span>
          <button
            className={`w-12 h-7 rounded-full transition-colors ${
              settings.ttsEnabled ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            onClick={() => update({ ttsEnabled: !settings.ttsEnabled })}
          >
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform mx-1 ${
              settings.ttsEnabled ? 'translate-x-5' : ''
            }`} />
          </button>
        </div>

        {voices.length > 0 && (
          <label className="block mb-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">Hlas</span>
            <select
              className="input mt-1"
              value={settings.ttsVoice || getCurrentVoiceName()}
              onChange={(e) => {
                setVoiceByName(e.target.value);
                update({ ttsVoice: e.target.value });
              }}
            >
              {voices.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name} ({v.lang})
                </option>
              ))}
            </select>
            <button
              className="btn-ghost text-sm mt-2"
              onClick={() => speak('Hello! This is how I sound. Nice to meet you.', settings.ttsRate)}
            >
              ▶ Vyzkoušet hlas
            </button>
          </label>
        )}

        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Rychlost řeči ({settings.ttsRate}x)</span>
          <input
            type="range"
            className="w-full mt-1"
            min={0.5}
            max={1.5}
            step={0.1}
            value={settings.ttsRate}
            onChange={(e) => update({ ttsRate: +e.target.value })}
          />
          <div className="flex justify-between text-xs text-slate-400">
            <span>Pomalá</span>
            <span>Normální</span>
            <span>Rychlá</span>
          </div>
        </label>
      </div>

      {/* Quick links */}
      <div className="card mb-4">
        <h3 className="section-title">Zdroje</h3>
        <div className="space-y-2">
          <Link to="/grammar-ref" className="flex items-center justify-between py-2 text-sm text-slate-700 hover:text-primary-600">
            <span>📋 Gramatický přehled</span>
            <span className="text-slate-300">→</span>
          </Link>
          <a
            href="https://maturita.cermat.cz/menu/testy-a-zadani-z-predchozich-obdobi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2 text-sm text-slate-700 hover:text-primary-600"
          >
            <span>🎯 Oficiální CERMAT testy</span>
            <span className="text-slate-300">↗</span>
          </a>
          <a
            href="https://www.newgeneralservicelist.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between py-2 text-sm text-slate-700 hover:text-primary-600"
          >
            <span>📚 NGSL Wordlist</span>
            <span className="text-slate-300">↗</span>
          </a>
        </div>
      </div>

      {/* Data */}
      <div className="card mb-4">
        <h3 className="section-title">Data a záloha</h3>

        <div className="space-y-3">
          <button className="btn-secondary w-full" onClick={handleExport}>
            📥 Exportovat data (JSON)
          </button>

          <button className="btn-secondary w-full" onClick={() => fileRef.current?.click()}>
            📤 Importovat data
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={handleImport}
          />
          {importMsg && (
            <p className={`text-sm ${importMsg.includes('úspěšně') ? 'text-green-600' : 'text-red-600'}`}>
              {importMsg}
            </p>
          )}

          {!showConfirmReset ? (
            <button className="btn-ghost text-red-500 w-full" onClick={() => setShowConfirmReset(true)}>
              🗑 Smazat všechna data
            </button>
          ) : (
            <div className="p-3 bg-red-50 rounded-xl">
              <p className="text-sm text-red-700 mb-3">
                Opravdu chceš smazat všechna data? Tuto akci nelze vrátit.
              </p>
              <div className="flex gap-2">
                <button className="btn-secondary flex-1" onClick={() => setShowConfirmReset(false)}>
                  Zrušit
                </button>
                <button className="btn-danger flex-1" onClick={handleReset}>
                  Smazat vše
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="card mb-4">
        <h3 className="section-title">O aplikaci</h3>
        <p className="text-sm text-slate-500 mb-2">
          Angličtina v1.0 — Příprava na maturitu z angličtiny.
        </p>
        <p className="text-xs text-slate-400">
          Slovní zásoba založena na NGSL (New General Service List) pod licencí CC BY-SA 4.0.
          Všechna data jsou uložena lokálně ve tvém prohlížeči.
        </p>
      </div>
    </div>
  );
}
