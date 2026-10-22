import { memo } from 'react';
import { Volume2 } from 'lucide-react';
import CefrBadge from './CefrBadge.jsx';
import { speak } from '../hooks/useSpeech.js';
import { splitExample } from '../lib/words.js';
import { TOPICS } from '../data/words/index.js';

export function Example({ word, className = '' }) {
  const [a, b, c] = splitExample(word);
  return (
    <p className={className}>
      {a}
      <strong className="font-bold text-brand dark:text-blue-300">{b}</strong>
      {c}
    </p>
  );
}

function WordCard({ word }) {
  return (
    <article className="group flex flex-col rounded-3xl border border-slate-200/80 bg-white p-4 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-lift motion-reduce:hover:translate-y-0 dark:border-night-line dark:bg-night-card">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="break-words font-display text-[17px] font-bold leading-snug">{word.en}</h3>
          <p className="mt-0.5 font-semibold text-ink-soft dark:text-night-soft">{word.uz}</p>
        </div>
        <button
          type="button"
          onClick={() => speak(word.en)}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand-light text-brand transition hover:bg-brand hover:text-white dark:bg-brand/20 dark:text-blue-200"
          aria-label={`${word.en} — tinglash`}
        >
          <Volume2 size={18} />
        </button>
      </div>
      <Example word={word} className="mt-3 flex-1 text-sm leading-relaxed text-ink-soft dark:text-slate-300" />
      <div className="mt-3 flex items-center justify-between">
        <CefrBadge level={word.cefr} />
        <span className="text-xs font-semibold text-ink-mute dark:text-night-soft">{TOPICS[word.topic]}</span>
      </div>
    </article>
  );
}

export default memo(WordCard);
