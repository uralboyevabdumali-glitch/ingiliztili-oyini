import { useCallback, useEffect, useState } from 'react';

let cachedVoice = null;

function pickVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find((v) => v.lang === 'en-US' && /Google|Samantha|Microsoft (Aria|Jenny|Zira)/i.test(v.name)) ||
    voices.find((v) => v.lang === 'en-US') ||
    voices.find((v) => v.lang?.startsWith('en')) ||
    null
  );
}

/** Ingliz tilidagi matnni ovoz chiqarib o'qish (en-US, tezlik 0.85). */
export function speak(text) {
  try {
    const synth = window.speechSynthesis;
    if (!synth || !text) return;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 0.85;
    if (!cachedVoice) cachedVoice = pickVoice();
    if (cachedVoice) u.voice = cachedVoice;
    synth.speak(u);
  } catch {
    /* brauzer qo'llamasa — jim */
  }
}

export default function useSpeech() {
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window);

  useEffect(() => {
    if (!supported) return;
    const onVoices = () => {
      cachedVoice = pickVoice();
    };
    onVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', onVoices);
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', onVoices);
  }, [supported]);

  const say = useCallback((text) => speak(text), []);
  return { speak: say, supported };
}
