import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Delete, Lightbulb, SkipForward } from 'lucide-react';
import { isPlainWord, sample, shuffle } from '../lib/words.js';
import { speak } from '../hooks/useSpeech.js';
import Button from '../components/Button.jsx';

function scramble(word) {
  const letters = word.toLowerCase().split('');
  if (new Set(letters).size < 2) return letters.map((ch, i) => ({ ch, key: i }));
  let s;
  do s = shuffle(letters.map((ch, i) => ({ ch, key: i })));
  while (s.map((x) => x.ch).join('') === letters.join(''));
  return s;
}

/** So'z yig'ish: aralashgan harflardan so'zni yig'ish, "birinchi harf" yordami bilan */
export default function Scramble({ words, count = 8, onAnswer, onDone }) {
  const list = useMemo(() => {
    const plain = words.filter(isPlainWord);
    return sample(plain.length ? plain : words, count);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [i, setI] = useState(0);
  const word = list[i];
  const tiles = useMemo(() => (word ? scramble(word.en) : []), [word]);
  const [placed, setPlaced] = useState([]); // tile keys
  const [status, setStatus] = useState(null); // 'correct' | 'wrong'
  const [hinted, setHinted] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const target = word?.en.toLowerCase() || '';
  const guess = placed.map((k) => tiles.find((t) => t.key === k).ch).join('');

  const finish = useCallback(
    (ok) => {
      setStatus(ok ? 'correct' : 'wrong');
      onAnswer(word, ok);
      if (ok) speak(word.en);
      timer.current = setTimeout(
        () => {
          if (i + 1 >= list.length) onDone();
          else {
            setI(i + 1);
            setPlaced([]);
            setStatus(null);
            setHinted(false);
          }
        },
        ok ? 900 : 1900,
      );
    },
    [word, i, list.length, onAnswer, onDone],
  );

  useEffect(() => {
    if (!status && word && placed.length === tiles.length && tiles.length) finish(guess === target);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placed]);

  const add = (key) => !status && setPlaced((p) => (p.includes(key) ? p : [...p, key]));
  const removeAt = (idx) => {
    if (status) return;
    if (hinted && idx === 0) return;
    setPlaced((p) => p.filter((_, j) => j !== idx));
  };
  const backspace = () => !status && setPlaced((p) => (p.length > (hinted ? 1 : 0) ? p.slice(0, -1) : p));

  const hint = () => {
    if (status || hinted) return;
    const first = tiles.find((t) => t.ch === target[0]);
    setPlaced([first.key]);
    setHinted(true);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (status || e.metaKey || e.ctrlKey || e.altKey || e.target.closest?.('input, textarea')) return;
      if (e.key === 'Backspace') {
        e.preventDefault();
        backspace();
        return;
      }
      if (/^[a-z]$/i.test(e.key)) {
        const t = tiles.find((x) => x.ch === e.key.toLowerCase() && !placed.includes(x.key));
        if (t) add(t.key);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (!word) return null;

  return (
    <div>
      <p className="mb-4 text-center text-xs font-semibold text-ink-mute dark:text-night-soft">
        So'z {i + 1} / {list.length}
      </p>
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-3xl bg-white p-5 text-center shadow-card dark:bg-night-card">
        <p className="text-xs font-bold uppercase tracking-wider text-brand dark:text-blue-300">Inglizchasini yig'</p>
        <p className="mt-1 font-display text-3xl font-extrabold sm:text-4xl">{word.uz}</p>
      </motion.div>

      <div
        className={`mb-5 flex min-h-[60px] flex-wrap justify-center gap-1.5 ${status === 'wrong' ? 'animate-shake' : status === 'correct' ? 'animate-pop' : ''}`}
        aria-label={`Javob: ${guess || "bo'sh"}`}
        aria-live="polite"
      >
        {tiles.map((_, idx) => {
          const key = placed[idx];
          const ch = key != null ? tiles.find((t) => t.key === key).ch : '';
          const color =
            status === 'correct'
              ? 'border-leaf bg-leaf text-white'
              : status === 'wrong'
                ? 'border-rose bg-rose-light text-rose-dark'
                : ch
                  ? 'border-brand bg-brand-light text-brand-dark dark:bg-brand/20 dark:text-white'
                  : 'border-dashed border-slate-300 bg-transparent dark:border-night-line';
          return (
            <button
              key={idx}
              type="button"
              onClick={() => ch && removeAt(idx)}
              tabIndex={ch ? 0 : -1}
              aria-label={ch ? `${ch} harfini olib tashlash` : "Bo'sh joy"}
              className={`grid h-11 w-9 place-items-center rounded-xl border-2 font-display text-lg font-extrabold uppercase sm:h-12 sm:w-10 ${color}`}
            >
              {ch}
            </button>
          );
        })}
      </div>

      {status === 'wrong' && (
        <p className="mb-3 text-center font-bold text-rose">
          To'g'ri javob: <span className="font-display uppercase tracking-wide">{word.en}</span>
        </p>
      )}

      <div className="mb-5 flex flex-wrap justify-center gap-2">
        {tiles.map((t) => {
          const used = placed.includes(t.key);
          return (
            <button
              key={t.key}
              type="button"
              disabled={used || !!status}
              onClick={() => add(t.key)}
              className={`grid h-12 w-11 place-items-center rounded-xl border-2 font-display text-xl font-extrabold uppercase transition active:translate-y-[3px] active:shadow-none ${
                used
                  ? 'border-slate-200 bg-slate-100 text-transparent shadow-none dark:border-night-line dark:bg-white/5'
                  : 'border-slate-200 bg-white text-ink shadow-[0_4px_0_#CBD5E1] hover:border-brand dark:border-night-line dark:bg-night-card dark:text-white dark:shadow-[0_4px_0_#16202F]'
              }`}
              aria-label={`${t.ch} harfi`}
            >
              {t.ch}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap justify-center gap-2">
        <Button variant="gold" size="sm" onClick={hint} disabled={hinted || !!status}>
          <Lightbulb size={16} /> Birinchi harf
        </Button>
        <Button variant="soft" size="sm" onClick={backspace} disabled={!!status || placed.length === 0}>
          <Delete size={16} /> O'chirish
        </Button>
        <Button variant="soft" size="sm" onClick={() => !status && finish(false)} disabled={!!status}>
          <SkipForward size={16} /> Bilmayman
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-mute dark:text-night-soft">Klaviaturadan harflarni yozsang ham bo'ladi</p>
    </div>
  );
}
