import { useCallback, useEffect, useRef, useState } from 'react';

export function readStorage(key, fallback) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* saqlash imkoni yo'q (private rejim yoki to'lgan) — jim o'tamiz */
  }
}

/** localStorage bilan sinxronlanadigan state. Barcha o'qish/yozish try/catch ichida. */
export default function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    const init = typeof initial === 'function' ? initial() : initial;
    const stored = readStorage(key, undefined);
    if (stored === undefined) return init;
    // Obyektlarda yangi maydonlar qo'shilgan bo'lsa, standart qiymatlar bilan to'ldiramiz
    if (init && typeof init === 'object' && !Array.isArray(init) && stored && typeof stored === 'object') {
      return { ...init, ...stored };
    }
    return stored;
  });
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    writeStorage(key, value);
  }, [key, value]);

  const set = useCallback((v) => setValue(v), []);
  return [value, set];
}
