import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, children, dismissable = true, wide = false, labelledBy }) {
  const panel = useRef(null);
  const lastFocus = useRef(null);

  useEffect(() => {
    if (!open) return;
    lastFocus.current = document.activeElement;
    const t = setTimeout(() => {
      const el = panel.current?.querySelector('[data-autofocus]') || panel.current?.querySelector('button, [href], input, select, textarea');
      el?.focus();
    }, 30);
    const onKey = (e) => {
      if (e.key === 'Escape' && dismissable) onClose?.();
      if (e.key === 'Tab' && panel.current) {
        const f = panel.current.querySelectorAll('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      lastFocus.current?.focus?.();
    };
  }, [open, dismissable, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-[#1E293B]/45 p-3 backdrop-blur-[2px] sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && dismissable) onClose?.();
          }}
        >
          <motion.div
            ref={panel}
            role="dialog"
            aria-modal="true"
            aria-label={labelledBy ? undefined : title}
            aria-labelledby={labelledBy}
            className={`relative max-h-[92vh] w-full overflow-y-auto rounded-3xl border border-slate-200 bg-white p-5 shadow-lift dark:border-night-line dark:bg-night-card sm:p-6 ${wide ? 'max-w-2xl' : 'max-w-md'}`}
            initial={{ y: 40, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          >
            {dismissable && (
              <button
                type="button"
                onClick={onClose}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-xl text-ink-mute hover:bg-slate-100 dark:text-night-soft dark:hover:bg-white/5"
                aria-label="Yopish"
              >
                <X size={20} />
              </button>
            )}
            {title && <h2 className="mb-3 pr-10 font-display text-lg font-extrabold">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
