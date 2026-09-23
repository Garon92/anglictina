import { WORD_OF_THE_DAY } from '../data/vocabulary';
import { speak } from '../tts';
import { useSettings } from '../App';
import { SpeakButton } from './ui';

export default function WordOfTheDay() {
  const { settings } = useSettings();
  const wotd = WORD_OF_THE_DAY();
  return (
    <section className="card !p-5" aria-label="Slovo dne">
      <div className="eyebrow mb-1">Slovo dne</div>
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-2xl font-black break-words text-fg" lang="en">{wotd.en}</div>
          <div className="font-bold text-accent-text">{wotd.cs}</div>
          {wotd.example && (
            <p className="mt-2 text-sm text-muted">
              <span lang="en" className="italic">„{wotd.example}“</span>
              {wotd.exampleCs && <span className="block text-xs">{wotd.exampleCs}</span>}
            </p>
          )}
        </div>
        <SpeakButton onClick={() => void speak(wotd.en, settings.ttsRate)} label={`Přehrát: ${wotd.en}`} />
      </div>
    </section>
  );
}
