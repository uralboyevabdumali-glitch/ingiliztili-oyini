import { useEffect, useMemo, useRef, useState } from 'react';
import { sample, shuffle } from '../lib/words.js';
import { speak } from '../hooks/useSpeech.js';

/** Juftlikni top: inglizcha so'zni o'zbekcha tarjimasi bilan juftlash */
export default function Match({ words, pairs = 6, onAnswer, onDone }) {
  const set = useMemo(() => {
    // O'zbekcha tarjimalari bir xil bo'lgan so'zlar bitta to'plamga tushmasin
    const out = [];
    const seen = new Set();
    for (const w of sample(words, words.length)) {
      const k = w.uz.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(w);
      if (out.length >= pairs) break;
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const left = useMemo(() => shuffle(set), [set]);
  const right = useMemo(() => shuffle(set), [set]);
  const [selL, setSelL] = useState(null);
  const [selR, setSelR] = useState(null);
  const [matched, setMatched] = useState({});
  const [bad, setBad] = useState(null);
  const errors = useRef(0);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const matchedCount = Object.keys(matched).length;
  useEffect(() => {
    if (matchedCount !== set.length || !set.length) return;
    const t = setTimeout(() => onDone({ flawless: errors.current === 0 }), 700);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchedCount]);

  useEffect(() => {
    if (!selL || !selR) return;
    if (selL === selR) {
      speak(selL.en);
      onAnswer(selL, true);
      setMatched((m) => ({ ...m, [selL.id]: true }));
      setSelL(null);
      setSelR(null);
    } else {
      errors.current += 1;
      onAnswer(selL, false);
      setBad({ l: selL.id, r: selR.id });
      timer.current = setTimeout(() => {
        setBad(null);
        setSelL(null);
        setSelR(null);
      }, 600);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selL, selR]);

  const tile = (w, side) => {
    const isMatched = matched[w.id];
    const selected = side === 'l' ? selL === w : selR === w;
    const isBad = bad && bad[side] === w.id;
    let cls =
      'border-slate-200 bg-white shadow-[0_4px_0_#CBD5E1] hover:border-brand dark:border-night-line dark:bg-night-card dark:shadow-[0_4px_0_#16202F]';
    if (isMatched) cls = 'animate-pop border-leaf bg-leaf-light text-leaf-dark opacity-70 shadow-none dark:bg-leaf/20 dark:text-green-200';
    else if (isBad) cls = 'animate-shake border-rose bg-rose-light text-rose-dark shadow-[0_4px_0_#FCA5A5] dark:bg-rose/20 dark:text-red-200';
    else if (selected) cls = 'border-brand bg-brand text-white shadow-[0_4px_0_#1F3BB8]';
    return (
      <button
        key={w.id}
        type="button"
        disabled={isMatched || !!bad}
        aria-pressed={selected}
        lang={side === 'l' ? 'en' : 'uz'}
        onClick={() => (side === 'l' ? setSelL(selected ? null : w) : setSelR(selected ? null : w))}
        className={`flex min-h-[54px] w-full items-center justify-center rounded-2xl border-2 px-2 py-2 text-center text-sm font-bold leading-tight transition active:translate-y-[3px] active:shadow-none sm:text-[15px] ${cls}`}
      >
        <span className="break-words">{side === 'l' ? w.en : w.uz}</span>
      </button>
    );
  };

  return (
    <div>
      <p className="mb-4 text-center text-sm font-semibold text-ink-mute dark:text-night-soft">
        Chapdan inglizcha, o'ngdan tarjimasini tanla · {Object.keys(matched).length}/{set.length} juft
      </p>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        <div className="space-y-2.5">{left.map((w) => tile(w, 'l'))}</div>
        <div className="space-y-2.5">{right.map((w) => tile(w, 'r'))}</div>
      </div>
    </div>
  );
}
