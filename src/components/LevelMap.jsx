import { Crown, Lock, Star } from 'lucide-react';
import { LEVEL_CEFR, CEFR_HEX } from '../lib/words.js';

export function Stars({ n, size = 14, className = '' }) {
  return (
    <span className={`inline-flex gap-0.5 ${className}`} aria-label={`${n} yulduz`}>
      {[0, 1, 2].map((i) => (
        <Star key={i} size={size} className={i < n ? 'fill-gold text-gold-dark' : 'fill-slate-200 text-slate-300 dark:fill-white/10 dark:text-white/20'} />
      ))}
    </span>
  );
}

/** 10 ta daraja kataki. stars: {level: count}, unlocked: eng yuqori ochiq daraja */
export default function LevelMap({ stars = {}, unlocked = 1, onPick }) {
  return (
    <ol className="grid grid-cols-5 gap-2 sm:gap-3">
      {LEVEL_CEFR.map((cefr, i) => {
        const level = i + 1;
        const locked = level > unlocked;
        const isFinal = level === 10;
        const s = stars[level] || 0;
        return (
          <li key={level}>
            <button
              type="button"
              disabled={locked}
              onClick={() => onPick(level)}
              aria-label={locked ? `${level}-daraja, yopiq` : `${level}-daraja, ${cefr}, ${s} yulduz`}
              className={`relative flex aspect-square w-full flex-col items-center justify-center rounded-2xl border-2 font-display transition ${
                locked
                  ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-night-line dark:bg-white/5 dark:text-night-soft'
                  : isFinal
                    ? 'border-gold-dark bg-gold text-ink shadow-[0_4px_0_#B98A00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none'
                    : 'border-brand-soft bg-white text-ink shadow-[0_4px_0_#C7D3FF] hover:-translate-y-0.5 hover:border-brand active:translate-y-1 active:shadow-none dark:border-night-line dark:bg-night-card dark:text-white dark:shadow-[0_4px_0_#16202F]'
              }`}
            >
              {locked ? (
                <Lock size={20} aria-hidden />
              ) : (
                <>
                  {isFinal && <Crown size={14} className="absolute top-1.5" aria-hidden />}
                  <span className="text-lg font-extrabold leading-none sm:text-xl">{isFinal ? 'F' : level}</span>
                  <span
                    className="mt-0.5 text-[10px] font-bold"
                    style={{ color: isFinal ? '#7A5A00' : CEFR_HEX[cefr] }}
                  >
                    {cefr}
                  </span>
                  <Stars n={s} size={10} className="mt-0.5" />
                </>
              )}
            </button>
          </li>
        );
      })}
    </ol>
  );
}
