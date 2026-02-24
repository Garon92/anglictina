let selectedVoice: SpeechSynthesisVoice | null = null;

export function getAvailableVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) return [];
  return speechSynthesis.getVoices().filter((v) => v.lang.startsWith('en'));
}

export function initTTS(preferredVoiceName?: string): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = getAvailableVoices();
    if (voices.length > 0) {
      selectVoice(voices, preferredVoiceName);
      resolve(voices);
      return;
    }

    speechSynthesis.onvoiceschanged = () => {
      const v = getAvailableVoices();
      selectVoice(v, preferredVoiceName);
      resolve(v);
    };

    setTimeout(() => resolve(getAvailableVoices()), 1000);
  });
}

export function setVoiceByName(name: string) {
  const voices = getAvailableVoices();
  const match = voices.find((v) => v.name === name);
  if (match) selectedVoice = match;
}

function selectVoice(voices: SpeechSynthesisVoice[], preferredName?: string) {
  if (preferredName) {
    const match = voices.find((v) => v.name === preferredName);
    if (match) {
      selectedVoice = match;
      return;
    }
  }

  const preferred = [
    'Google UK English Female',
    'Google UK English Male',
    'Samantha',
    'Daniel',
    'Karen',
  ];

  for (const name of preferred) {
    const v = voices.find((voice) => voice.name.includes(name));
    if (v) {
      selectedVoice = v;
      return;
    }
  }

  const gbVoice = voices.find((v) => v.lang === 'en-GB');
  if (gbVoice) {
    selectedVoice = gbVoice;
    return;
  }

  selectedVoice = voices[0] ?? null;
}

export function getCurrentVoiceName(): string {
  return selectedVoice?.name ?? '';
}

export function speak(text: string, rate = 0.9, lang = 'en-GB'): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = (e) => {
      if (e.error === 'canceled') resolve();
      else reject(e);
    };

    speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}
