import { useEffect } from 'react';

/** Javob varianti tugmasi: holatlar — idle | correct | wrong | reveal | dim */
export function OptionButton({ state = 'idle', index, children, onClick, disabled, lang }) {
  const styles = {
    idle: 'border-slate-200 bg-white text-ink shadow-[0_4px_0_#CBD5E1] hover:border-brand hover:bg-brand-light/60 dark:border-night-line dark:bg-night-card dark:text-white dark:shadow-[0_4px_0_#16202F] dark:hover:bg-brand/10',
    correct: 'animate-pop border-leaf bg-leaf text-white shadow-[0_4px_0_#0F7A36]',
    wrong: 'animate-shake border-rose bg-rose text-white shadow-[0_4px_0_#B91C1C]',
    reveal: 'border-leaf bg-leaf-light text-leaf-dark shadow-[0_4px_0_#86EFAC] dark:bg-leaf/20 dark:text-green-200',
    dim: 'border-slate-200 bg-white text-ink-mute opacity-60 shadow-[0_4px_0_#E2E8F0] dark:border-night-line dark:bg-night-card dark:text-night-soft dark:shadow-none',
  };
  return (
    <button
      type="button"
      lang={lang}
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-[64px] w-full items-center gap-3 rounded-2xl border-2 px-4 py-3 text-left text-base sm:min-h-[72px] sm:text-lg font-bold transition active:translate-y-[3px] active:shadow-none disabled:cursor-default ${styles[state]}`}
    >
      {index != null && (
        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-extrabold ${state === 'idle' ? 'bg-slate-100 text-ink-mute dark:bg-white/10 dark:text-night-soft' : 'bg-white/25'}`}>
          {index}
        </span>
      )}
      <span className="min-w-0 break-words">{children}</span>
    </button>
  );
}

/** 1–4 raqam tugmalari bilan variant tanlash */
export function useNumberKeys(count, onPick, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e) => {
      if (e.target.closest?.('input, textarea') || e.metaKey || e.ctrlKey || e.altKey) return;
      const n = Number(e.key);
      if (n >= 1 && n <= count) {
        e.preventDefault();
        onPick(n - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count, onPick, enabled]);
}

export function optionState(opt, chosen, correct) {
  if (!chosen) return 'idle';
  if (opt === correct) return chosen === correct ? 'correct' : 'reveal';
  if (opt === chosen) return 'wrong';
  return 'dim';
}

export const NEXT_DELAY = { correct: 850, wrong: 1700 };
