import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Check, RotateCcw, Volume2 } from 'lucide-react';
import { CEFR_LEVELS } from '../data/words/index.js';
import useProgress from '../hooks/useProgress.js';
import { speak } from '../hooks/useSpeech.js';
import { BY_CEFR, CEFR_HEX, shuffle } from '../lib/words.js';
import { Example } from '../components/WordCard.jsx';
import Button from '../components/Button.jsx';
import Card, { SectionTitle } from '../components/Card.jsx';
import CefrBadge from '../components/CefrBadge.jsx';

const DECK = 20;

function LevelPicker({ onPick }) {
  const { progress } = useProgress();
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {CEFR_LEVELS.map((l) => {
        const total = BY_CEFR[l].length;
        const known = BY_CEFR[l].filter((w) => progress.known[w.id]).length;
        const pct = Math.round((known / total) * 100);
        return (
          <Card as="button" type="button" hover key={l} onClick={() => onPick(l)} className="p-4 text-left">
            <div className="flex items-center justify-between">
              <span className="font-display text-2xl font-extrabold" style={{ color: CEFR_HEX[l] }}>
                {l}
              </span>
              <CefrBadge level={l} />
            </div>
            <p className="mt-2 text-sm font-semibold text-ink-soft dark:text-night-soft">
              {known}/{total} bilaman
            </p>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: CEFR_HEX[l] }} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Deck({ level, onBack }) {
  const { progress, markKnown, markReview } = useProgress();
  const deck = useMemo(() => {
    const all = BY_CEFR[level];
    const unknown = shuffle(all.filter((w) => !progress.known[w.id]));
    const known = shuffle(all.filter((w) => progress.known[w.id]));
    return [...unknown, ...known].slice(0, DECK);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level]);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [tally, setTally] = useState({ known: 0, review: 0 });
  const word = deck[i];
  const done = i >= deck.length;

  const next = (knows) => {
    if (!word) return;
    if (knows) markKnown(word);
    else markReview(word);
    setTally((t) => ({ known: t.known + (knows ? 1 : 0), review: t.review + (knows ? 0 : 1) }));
    setFlipped(false);
    setI((n) => n + 1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (done || e.target.closest?.('input, textarea')) return;
      if (e.key === ' ' || e.key === 'Enter') {
        if (e.target.tagName === 'BUTTON' && e.target.dataset.flip !== '1') return;
        e.preventDefault();
        setFlipped((f) => !f);
      } else if (e.key === '1' || e.key === 'ArrowRight') next(true);
      else if (e.key === '2' || e.key === 'ArrowLeft') next(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  if (done) {
    return (
      <Card className="mx-auto max-w-md p-6 text-center">
        <div className="text-5xl">🎉</div>
        <h2 className="mt-2 font-display text-xl font-extrabold">To'plam tugadi!</h2>
        <p className="mt-2 text-ink-soft dark:text-night-soft">
          Bilaman: <b className="text-leaf">{tally.known}</b> · Takrorlayman: <b className="text-rose">{tally.review}</b>
        </p>
        {tally.review > 0 && (
          <p className="mt-1 text-sm text-ink-mute dark:text-night-soft">Takrorlanadigan so'zlar "Natijalarim" dagi xatolar ro'yxatiga qo'shildi.</p>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="soft" onClick={onBack}>
            Darajalar
          </Button>
          <Button onClick={() => onBack(level)}>
            <RotateCcw size={17} /> Yana
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-3 flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => onBack()}>
          <ArrowLeft size={17} /> Orqaga
        </Button>
        <span className="text-sm font-bold text-ink-mute dark:text-night-soft">
          {i + 1} / {deck.length}
        </span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
        <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(i / deck.length) * 100}%` }} />
      </div>

      <div className="perspective">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative h-72 w-full sm:h-80"
        >
          <button
            type="button"
            data-flip="1"
            onClick={() => setFlipped((f) => !f)}
            aria-label={flipped ? 'Kartani qaytarish' : "Kartani aylantirib tarjimani ko'rish"}
            className="preserve-3d relative h-full w-full rounded-3xl transition-transform duration-500 motion-reduce:duration-0"
            style={{ transform: flipped ? 'rotateY(180deg)' : 'none' }}
          >
            <div className="backface-hidden absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-brand-soft bg-white p-6 shadow-lift dark:border-night-line dark:bg-night-card">
              <CefrBadge level={word.cefr} className="absolute left-4 top-4" />
              <span className="break-words text-center font-display text-3xl font-extrabold">{word.en}</span>
              <span className="mt-4 text-sm font-semibold text-ink-mute dark:text-night-soft">Bos — tarjimasi orqada</span>
            </div>
            <div className="backface-hidden rotate-y-180 absolute inset-0 flex flex-col items-center justify-center rounded-3xl border-2 border-brand bg-brand-light p-6 shadow-lift dark:border-brand dark:bg-[#22325A]">
              <span className="text-center font-display text-2xl font-extrabold text-brand-dark dark:text-white">{word.uz}</span>
              <Example word={word} className="mt-4 text-center leading-relaxed text-ink-soft dark:text-slate-200" />
            </div>
          </button>
        </motion.div>
      </div>

      <div className="mt-3 flex justify-center">
        <Button variant="soft" size="sm" onClick={() => speak(word.en)} aria-label="Tinglash">
          <Volume2 size={17} /> Tinglash
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="red" size="lg" onClick={() => next(false)}>
          <RotateCcw size={18} /> Takrorlayman
        </Button>
        <Button variant="green" size="lg" onClick={() => next(true)}>
          <Check size={18} strokeWidth={3} /> Bilaman
        </Button>
      </div>
      <p className="mt-3 text-center text-xs text-ink-mute dark:text-night-soft">Klaviatura: Probel — aylantirish, 1 — bilaman, 2 — takrorlayman</p>
    </div>
  );
}

export default function Flashcards() {
  const [level, setLevel] = useState(null);
  const [round, setRound] = useState(0);
  const back = (again) => {
    if (again) {
      setLevel(again);
      setRound((r) => r + 1);
    } else setLevel(null);
  };
  return (
    <div>
      <SectionTitle title="Kartochkalar" subtitle={level ? `${level} darajasidagi so'zlar` : 'Darajani tanla va kartalarni aylantir'} />
      {level ? <Deck key={`${level}-${round}`} level={level} onBack={back} /> : <LevelPicker onPick={setLevel} />}
    </div>
  );
}
