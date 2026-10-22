import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { options, sample, splitExample } from '../lib/words.js';
import { speak } from '../hooks/useSpeech.js';
import { NEXT_DELAY, OptionButton, optionState, useNumberKeys } from './shared.jsx';

/** Gapni to'ldir: misol gapdagi bo'sh joyga mos so'zni qo'yish. showHint=false bo'lsa o'zbekcha yordam yo'q */
export default function FillBlank({ words, count = 10, showHint = true, onAnswer, onDone }) {
  const questions = useMemo(
    () => sample(words, Math.min(count, words.length)).map((w) => ({ word: w, parts: splitExample(w), opts: options(w) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(null);
  const timer = useRef(null);
  const q = questions[i];

  useEffect(() => () => clearTimeout(timer.current), []);

  const choose = useCallback(
    (idx) => {
      if (chosen || !q) return;
      const opt = q.opts[idx];
      setChosen(opt);
      const ok = opt === q.word;
      onAnswer(q.word, ok);
      if (ok) speak(q.word.example);
      timer.current = setTimeout(
        () => {
          if (i + 1 >= questions.length) onDone();
          else {
            setChosen(null);
            setI(i + 1);
          }
        },
        ok ? NEXT_DELAY.correct + 600 : NEXT_DELAY.wrong,
      );
    },
    [chosen, q, i, questions.length, onAnswer, onDone],
  );

  useNumberKeys(4, choose, !chosen);
  if (!q) return null;
  const [before, , after] = q.parts;
  const filled = chosen ? q.parts[1] : null;

  return (
    <div>
      <p className="mb-4 text-center text-xs font-semibold text-ink-mute dark:text-night-soft">
        Gap {i + 1} / {questions.length}
      </p>
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-5 rounded-3xl bg-white p-5 shadow-card dark:bg-night-card">
        <p lang="en" className="text-center text-xl font-semibold leading-relaxed sm:text-2xl">
          {before}
          <span
            className={`mx-1 inline-block min-w-[90px] rounded-lg border-b-4 px-2 text-center font-extrabold ${
              filled
                ? chosen === q.word
                  ? 'animate-pop border-leaf bg-leaf-light text-leaf-dark dark:bg-leaf/20 dark:text-green-200'
                  : 'border-rose bg-rose-light text-rose-dark dark:bg-rose/20 dark:text-red-200'
                : 'border-brand bg-brand-light/60 text-transparent dark:bg-brand/15'
            }`}
          >
            {filled || '____'}
          </span>
          {after}
        </p>
        {showHint ? (
          <p className="mt-3 text-center text-sm font-semibold text-ink-mute dark:text-night-soft">
            Yordam: <span className="text-brand dark:text-blue-300">{q.word.uz}</span>
          </p>
        ) : (
          <p className="mt-3 text-center text-xs font-semibold text-ink-mute dark:text-night-soft">7-darajadan boshlab yordamsiz!</p>
        )}
      </motion.div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {q.opts.map((o, idx) => (
          <OptionButton key={o.id} index={idx + 1} lang="en" state={optionState(o, chosen, q.word)} onClick={() => choose(idx)} disabled={!!chosen}>
            {o.en}
          </OptionButton>
        ))}
      </div>
    </div>
  );
}
