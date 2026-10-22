import { useEffect, useRef } from 'react';
import { BarChart3, BookOpen, Gamepad2, Languages, Layers, PawPrint, Trophy } from 'lucide-react';

export const TABS = [
  { id: 'games', label: "O'yinlar", icon: Gamepad2 },
  { id: 'dictionary', label: "Lug'at", icon: BookOpen },
  { id: 'flashcards', label: 'Kartochkalar', icon: Layers },
  { id: 'translator', label: 'Tarjimon', icon: Languages },
  { id: 'pet', label: 'Hamroh', icon: PawPrint },
  { id: 'achievements', label: 'Yutuqlar', icon: Trophy },
  { id: 'stats', label: 'Natijalarim', icon: BarChart3 },
];

export default function TabNav({ tab, onChange }) {
  const refs = useRef({});

  useEffect(() => {
    refs.current[tab]?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [tab]);

  const onKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    let n = null;
    if (e.key === 'ArrowRight') n = (i + 1) % TABS.length;
    if (e.key === 'ArrowLeft') n = (i - 1 + TABS.length) % TABS.length;
    if (n != null) {
      e.preventDefault();
      onChange(TABS[n].id);
      refs.current[TABS[n].id]?.focus();
    }
  };

  return (
    <nav aria-label="Bo'limlar" className="mx-auto max-w-6xl">
      <div role="tablist" onKeyDown={onKey} className="no-scrollbar flex gap-1.5 overflow-x-auto px-3 pb-2.5 sm:px-5">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = id === tab;
          return (
            <button
              key={id}
              ref={(el) => (refs.current[id] = el)}
              role="tab"
              type="button"
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(id)}
              className={`flex h-10 shrink-0 items-center gap-1.5 rounded-2xl px-3.5 text-sm font-bold transition ${
                active
                  ? 'bg-brand text-white shadow-[0_3px_0_#1F3BB8]'
                  : 'bg-white/70 text-ink-soft hover:bg-white hover:text-ink dark:bg-white/5 dark:text-night-soft dark:hover:bg-white/10 dark:hover:text-white'
              }`}
            >
              <Icon size={17} aria-hidden />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
