import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Volume2 } from 'lucide-react';
import { options, pick, sample } from '../lib/words.js';
import { speak } from '../hooks/useSpeech.js';
import { NEXT_DELAY, OptionButton, optionState, useNumberKeys } from './shared.jsx';

const MODES = {
  en2uz: "Tarjimasini top",
  uz2en: 'Inglizchasini top',
  listen: 'Tinglab top',
};

/** Viktorina: tarjimani topish, inglizchasini topish, tinglab topish */
export default function Quiz({ words, count = 10, onAnswer, onDone }) {
  const canSpeak = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const questions = useMemo(
    () =>
      sample(words, Math.min(count, words.length)).map((w) => ({
        word: w,
        mode: pick(canSpeak ? ['en2uz', 'uz2en', 'listen'] : ['en2uz', 'uz2en']),
        opts: options(w),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  const [i, setI] = useState(0);
  const [chosen, setChosen] = useState(null);
  const timer = useRef(null);
  const q = questions[i];

  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (q?.mode === 'listen') {
      const t = setTimeout(() => speak(q.word.en), 250);
      return () => clearTimeout(t);
    }
  }, [q]);

  const choose = useCallback(
    (idx) => {
      if (chosen || !q) return;
      const opt = q.opts[idx];
      setChosen(opt);
      const ok = opt === q.word;
      onAnswer(q.word, ok);
      if (q.mode !== 'listen' && ok) speak(q.word.en);
      timer.current = setTimeout(() => {
        if (i + 1 >= questions.length) onDone();
        else {
          setChosen(null);
          setI(i + 1);
        }
      }, ok ? NEXT_DELAY.correct : NEXT_DELAY.wrong);
    },
    [chosen, q, i, questions.length, onAnswer, onDone],
  );

  useNumberKeys(4, choose, !chosen);

  if (!q) return null;
  const showEn = q.mode === 'uz2en';

  return (
    <div>
      <p className="mb-1 text-center text-xs font-bold uppercase tracking-wider text-brand dark:text-blue-300">{MODES[q.mode]}</p>
      <p className="mb-4 text-center text-xs font-semibold text-ink-mute dark:text-night-soft">
        Savol {i + 1} / {questions.length}
      </p>
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex min-h-[150px] sm:min-h-[190px] flex-col items-center justify-center rounded-3xl bg-white p-5 text-center shadow-card dark:bg-night-card"
      >
        {q.mode === 'listen' ? (
          <button
            type="button"
            onClick={() => speak(q.word.en)}
            className="grid h-20 w-20 place-items-center rounded-full bg-brand text-white shadow-[0_5px_0_#1F3BB8] transition active:translate-y-1 active:shadow-none"
            aria-label="So'zni qayta tinglash"
          >
            <Volume2 size={36} />
          </button>
        ) : (
          <span lang={q.mode === 'en2uz' ? 'en' : 'uz'} className="break-words font-display text-3xl font-extrabold sm:text-5xl">
            {q.mode === 'en2uz' ? q.word.en : q.word.uz}
          </span>
        )}
        {chosen && q.mode === 'listen' && <span className="mt-3 font-display text-lg font-bold text-brand dark:text-blue-300">{q.word.en}</span>}
      </motion.div>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {q.opts.map((o, idx) => (
          <OptionButton key={o.id} index={idx + 1} state={optionState(o, chosen, q.word)} onClick={() => choose(idx)} disabled={!!chosen} lang={showEn ? 'en' : 'uz'}>
            {showEn ? o.en : o.uz}
          </OptionButton>
        ))}
      </div>
    </div>
  );
}
