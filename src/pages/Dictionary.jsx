import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { WORDS, TOPICS, CEFR_LEVELS } from '../data/words/index.js';
import WordCard from '../components/WordCard.jsx';
import Button from '../components/Button.jsx';
import { SectionTitle } from '../components/Card.jsx';
import { CEFR_STYLE } from '../lib/words.js';

const PAGE = 60;

function Chip({ active, onClick, children, className = '' }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-9 shrink-0 rounded-xl px-3 text-sm font-bold transition ${
        active
          ? 'bg-brand text-white shadow-[0_3px_0_#1F3BB8]'
          : 'bg-white text-ink-soft ring-1 ring-slate-200 hover:ring-brand/40 dark:bg-night-card dark:text-night-soft dark:ring-night-line'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export default function Dictionary() {
  const [topic, setTopic] = useState('all');
  const [levels, setLevels] = useState(['B2', 'C1', 'C2']);
  const [query, setQuery] = useState('');
  const [shown, setShown] = useState(PAGE);
  const q = useDeferredValue(query.trim().toLowerCase());

  const filtered = useMemo(
    () =>
      WORDS.filter(
        (w) =>
          (topic === 'all' || w.topic === topic) &&
          (levels.length === 0 || levels.includes(w.cefr)) &&
          (!q || w.en.toLowerCase().includes(q) || w.uz.toLowerCase().includes(q)),
      ),
    [topic, levels, q],
  );

  useEffect(() => setShown(PAGE), [topic, levels, q]);

  const toggleLevel = (l) => setLevels((ls) => (ls.includes(l) ? ls.filter((x) => x !== l) : [...ls, l]));
  const rest = filtered.length - shown;

  return (
    <div>
      <SectionTitle title="Lug'at" subtitle={`${WORDS.length} ta so'z · 8 ta mavzu · A1–C2`} />

      <div className="relative mb-3">
        <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-mute" aria-hidden />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Inglizcha yoki o'zbekcha qidir..."
          aria-label="So'z qidirish"
          className="h-12 w-full rounded-2xl border-2 border-slate-200 bg-white pl-11 pr-11 font-semibold outline-none placeholder:font-normal placeholder:text-slate-400 focus:border-brand dark:border-night-line dark:bg-night-card"
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-ink-mute hover:bg-slate-100 dark:hover:bg-white/5"
            aria-label="Qidiruvni tozalash"
          >
            <X size={17} />
          </button>
        )}
      </div>

      <div className="no-scrollbar -mx-3 mb-2 flex gap-1.5 overflow-x-auto px-3 pb-1" role="group" aria-label="Mavzu">
        <Chip active={topic === 'all'} onClick={() => setTopic('all')}>
          Hammasi
        </Chip>
        {Object.entries(TOPICS).map(([k, name]) => (
          <Chip key={k} active={topic === k} onClick={() => setTopic(k)}>
            {name}
          </Chip>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-1.5" role="group" aria-label="CEFR darajasi">
        {CEFR_LEVELS.map((l) => {
          const on = levels.includes(l);
          return (
            <button
              key={l}
              type="button"
              aria-pressed={on}
              onClick={() => toggleLevel(l)}
              className={`h-8 rounded-lg px-3 text-xs font-extrabold ring-1 transition ${on ? CEFR_STYLE[l] + ' ring-2' : 'bg-white text-ink-mute ring-slate-200 dark:bg-night-card dark:ring-night-line dark:text-night-soft'}`}
            >
              {l}
            </button>
          );
        })}
        <span className="ml-auto text-sm font-semibold text-ink-mute dark:text-night-soft" aria-live="polite">
          {filtered.length} ta so'z
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 p-10 text-center text-ink-mute dark:border-night-line dark:text-night-soft">
          Hech narsa topilmadi. Boshqa so'z yoki filtrni sinab ko'r 🔍
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.slice(0, shown).map((w) => (
            <WordCard key={w.id} word={w} />
          ))}
        </div>
      )}

      {rest > 0 && (
        <div className="mt-6 flex justify-center">
          <Button variant="soft" onClick={() => setShown((s) => s + PAGE)}>
            Yana ko'rsatish ({rest} ta qoldi)
          </Button>
        </div>
      )}
    </div>
  );
}
