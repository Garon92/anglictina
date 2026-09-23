import { useEffect, useState } from 'react';
import { getAvailableVoices, ttsSupported } from '../tts';

/**
 * Is there an English text-to-speech voice? Voices load asynchronously, so the answer starts as
 * 'pending' and settles within a few seconds. Without an English voice, listening falls back to
 * the transcript (the browser would otherwise read English with e.g. a Czech voice).
 */
export function useEnglishVoice(): 'yes' | 'no' | 'pending' {
  const [status, setStatus] = useState<'yes' | 'no' | 'pending'>(() =>
    !ttsSupported() ? 'no' : getAvailableVoices().length > 0 ? 'yes' : 'pending',
  );
  useEffect(() => {
    if (status !== 'pending') return;
    const t = window.setInterval(() => {
      if (getAvailableVoices().length > 0) setStatus('yes');
    }, 300);
    const stop = window.setTimeout(() => setStatus((s) => (s === 'pending' ? 'no' : s)), 3000);
    return () => {
      window.clearInterval(t);
      window.clearTimeout(stop);
    };
  }, [status]);
  return status;
}
