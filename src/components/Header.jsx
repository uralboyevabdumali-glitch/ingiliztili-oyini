import { Flame, Moon, Sun, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import useProgress from '../hooks/useProgress.js';

export default function Header({ onTitleClick }) {
  const { progress, streak, title, settings, setSettings } = useProgress();
  const dark = !!settings.dark;

  return (
    <div className="mx-auto flex max-w-6xl items-center gap-2 px-3 py-2.5 sm:px-5">
      <div className="flex min-w-0 items-center gap-2">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-brand font-display text-lg font-extrabold text-white shadow-[0_3px_0_#1F3BB8]">
          S
        </div>
        <span className="hidden font-display text-lg font-extrabold tracking-tight text-ink dark:text-white min-[420px]:inline">
          So'zlik
        </span>
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <button
          type="button"
          onClick={onTitleClick}
          className="flex h-9 items-center gap-1.5 rounded-xl bg-brand-light px-2.5 text-sm font-bold text-brand-dark transition hover:bg-brand-soft dark:bg-brand/20 dark:text-blue-100"
          title="Unvoning"
        >
          <span aria-hidden>{title.icon}</span>
          <span className="max-w-[86px] truncate">{title.name}</span>
        </button>
        <motion.div
          key={progress.points}
          initial={{ scale: 1.15 }}
          animate={{ scale: 1 }}
          className="flex h-9 items-center gap-1 rounded-xl bg-gold-light px-2.5 text-sm font-extrabold text-[#8A6400] dark:bg-gold/15 dark:text-gold"
          title="Ochko"
          aria-label={`${progress.points} ochko`}
        >
          <Zap size={16} className="fill-gold text-gold-dark" aria-hidden />
          {progress.points}
        </motion.div>
        <div
          className={`flex h-9 items-center gap-1 rounded-xl px-2.5 text-sm font-extrabold ${
            streak > 0 ? 'bg-rose-light text-rose-dark dark:bg-rose/15 dark:text-red-300' : 'bg-slate-100 text-ink-mute dark:bg-white/5 dark:text-night-soft'
          }`}
          title="Kunlik seriya"
          aria-label={`${streak} kunlik seriya`}
        >
          <Flame size={16} className={streak > 0 ? 'fill-orange-400 text-rose' : ''} aria-hidden />
          {streak}
        </div>
        <button
          type="button"
          onClick={() => setSettings((s) => ({ ...s, dark: !s.dark }))}
          className="grid h-9 w-9 place-items-center rounded-xl text-ink-soft transition hover:bg-slate-200/70 dark:text-night-soft dark:hover:bg-white/10"
          aria-label={dark ? "Yorug' rejim" : "Qorong'i rejim"}
        >
          {dark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </div>
  );
}
