import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Map, RotateCcw, Star, Unlock, Volume2, X, Zap } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { speak } from '../hooks/useSpeech.js';
import { BY_CEFR, levelCefr, starsFor } from '../lib/words.js';
import { sfx } from '../lib/sound.js';
import { GAME_INFO } from '../data/badges.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import CefrBadge from '../components/CefrBadge.jsx';
import Confetti from '../components/Confetti.jsx';
import Quiz from './Quiz.jsx';
import Match from './Match.jsx';
import Scramble from './Scramble.jsx';
import FillBlank from './FillBlank.jsx';

const COMPONENTS = { quiz: Quiz, match: Match, scramble: Scramble, fill: FillBlank };

export function ReviewList({ words, title = 'Takrorlash kerak bo\'lgan so\'zlar' }) {
  if (!words.length) return null;
  return (
    <div className="mt-5 text-left">
      <h3 className="mb-2 text-sm font-extrabold uppercase tracking-wide text-ink-mute dark:text-night-soft">{title}</h3>
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 dark:divide-night-line dark:border-night-line">
        {words.map((w) => (
          <li key={w.id} className="flex items-center gap-2 bg-white px-3 py-2 dark:bg-night-card">
            <button
              type="button"
              onClick={() => speak(w.en)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand hover:bg-brand-light dark:text-blue-300 dark:hover:bg-brand/20"
              aria-label={`${w.en} — tinglash`}
            >
              <Volume2 size={16} />
            </button>
            <span className="min-w-0 flex-1">
              <b lang="en">{w.en}</b> <span className="text-ink-mute dark:text-night-soft">— {w.uz}</span>
            </span>
            <CefrBadge level={w.cefr} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function Result({ game, level, practice, result, onExit, onReplay, onLevel }) {
  const pct = Math.round((result.correct / Math.max(1, result.total)) * 100);
  const passed = result.stars > 0;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <Confetti fire={passed ? 'result' : null} />
      <Card className="mx-auto max-w-xl p-6 text-center">
        <div className="text-5xl" aria-hidden>
          {practice ? '🩹' : result.stars === 3 ? '🏆' : passed ? '🎉' : '💪'}
        </div>
        <h2 className="mt-2 font-display text-2xl font-extrabold">
          {practice ? 'Mashq tugadi!' : passed ? (level === 10 ? 'FINAL o\'tildi!' : 'Barakalla!') : 'Yana bir urinish!'}
        </h2>
        {!practice && (
          <div className="mt-3 flex justify-center">
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                initial={{ scale: 0, rotate: -40 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2 + i * 0.18, type: 'spring', stiffness: 300, damping: 12 }}
              >
                <Star size={44} className={i < result.stars ? 'fill-gold text-gold-dark' : 'fill-slate-200 text-slate-300 dark:fill-white/10 dark:text-white/20'} />
              </motion.span>
            ))}
          </div>
        )}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-2xl bg-brand-light p-3 dark:bg-brand/15">
            <div className="font-display text-xl font-extrabold text-brand-dark dark:text-white">{pct}%</div>
            <div className="text-xs font-semibold text-ink-mute dark:text-night-soft">aniqlik</div>
          </div>
          <div className="rounded-2xl bg-leaf-light p-3 dark:bg-leaf/15">
            <div className="font-display text-xl font-extrabold text-leaf-dark dark:text-green-200">
              {result.correct}/{result.total}
            </div>
            <div className="text-xs font-semibold text-ink-mute dark:text-night-soft">to'g'ri</div>
          </div>
          <div className="rounded-2xl bg-gold-light p-3 dark:bg-gold/15">
            <div className="font-display text-xl font-extrabold text-[#8A6400] dark:text-gold">+{result.points}</div>
            <div className="text-xs font-semibold text-ink-mute dark:text-night-soft">ochko</div>
          </div>
        </div>
        {!practice && !passed && <p className="mt-3 text-sm font-semibold text-ink-soft dark:text-night-soft">Keyingi darajani ochish uchun kamida 70% kerak.</p>}
        {result.newlyUnlocked && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-gold-light px-4 py-2 font-bold text-[#8A6400] dark:bg-gold/15 dark:text-gold">
            <Unlock size={17} /> {result.newlyUnlocked === 10 ? 'FINAL' : `${result.newlyUnlocked}-daraja`} ochildi!
          </p>
        )}
        <ReviewList words={result.wrong} />
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Button variant="soft" onClick={onExit}>
            <Map size={17} /> {practice ? 'Chiqish' : 'Darajalar'}
          </Button>
          <Button variant={passed && !practice ? 'soft' : 'primary'} onClick={onReplay}>
            <RotateCcw size={17} /> Qayta
          </Button>
          {!practice && passed && level < 10 && (
            <Button onClick={() => onLevel(level + 1)}>
              Keyingi <ArrowRight size={17} />
            </Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

/** Klassik o'yin qobig'i: so'zlarni tanlaydi, ochko/seriyani hisoblaydi va natijani ko'rsatadi */
export default function ClassicGame({ game, level, practiceWords, onExit, onReplay, onLevel }) {
  const { answer, finishClassic, finishPractice, setInGame } = useProgress();
  const practice = !!practiceWords;
  const cefr = practice ? null : levelCefr(level);
  const words = useMemo(() => practiceWords || BY_CEFR[cefr], [practiceWords, cefr]);
  const [stats, setStats] = useState({ correct: 0, total: 0, points: 0, combo: 0 });
  const wrong = useRef([]);
  const statsRef = useRef(stats);
  statsRef.current = stats;
  const [result, setResult] = useState(null);

  useEffect(() => {
    setInGame(!result);
    return () => setInGame(false);
  }, [result, setInGame]);

  const onAnswer = useCallback(
    (word, ok) => {
      const s = statsRef.current;
      const combo = ok ? s.combo + 1 : 0;
      const pts = ok ? 4 + (practice ? 1 : level) + (combo > 3 ? 3 : 0) : 0;
      if (ok) sfx.correct();
      else {
        sfx.wrong();
        if (!wrong.current.includes(word)) wrong.current.push(word);
      }
      answer(word, ok, { points: pts, combo });
      const next = { correct: s.correct + (ok ? 1 : 0), total: s.total + 1, points: s.points + pts, combo };
      statsRef.current = next;
      setStats(next);
    },
    [answer, level, practice],
  );

  const onDone = useCallback(
    (extra = {}) => {
      const s = statsRef.current;
      let r;
      if (practice) {
        finishPractice();
        r = { stars: starsFor(s.correct, s.total), newlyUnlocked: null };
      } else {
        r = finishClassic({ game, level, correct: s.correct, total: s.total, flawless: extra.flawless });
      }
      if (r.stars > 0) sfx.levelUp();
      setResult({ ...r, correct: s.correct, total: s.total, points: s.points, wrong: wrong.current.slice() });
    },
    [practice, finishPractice, finishClassic, game, level],
  );

  if (result) return <Result game={game} level={level} practice={practice} result={result} onExit={onExit} onReplay={onReplay} onLevel={onLevel} />;

  const Game = COMPONENTS[game];
  const pairs = level <= 3 ? 6 : level <= 7 ? 7 : 8;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="O'yindan chiqish">
          <X size={22} />
        </Button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-sm font-bold">
            <span className="truncate">{practice ? 'Xatolar ustida ishlash' : GAME_INFO[game].name}</span>
            {!practice && (
              <span className="shrink-0 text-ink-mute dark:text-night-soft">· {level === 10 ? 'FINAL' : `${level}-daraja`}</span>
            )}
            {cefr && <CefrBadge level={cefr} />}
          </div>
        </div>
        <div
          className={`flex h-9 items-center gap-1 rounded-xl px-2.5 text-sm font-extrabold transition ${
            stats.combo >= 3 ? 'bg-rose-light text-rose-dark dark:bg-rose/20 dark:text-red-200' : 'bg-slate-100 text-ink-mute dark:bg-white/5 dark:text-night-soft'
          }`}
          aria-label={`Ketma-ket ${stats.combo} ta to'g'ri`}
        >
          <Flame size={15} className={stats.combo >= 3 ? 'fill-orange-400' : ''} /> {stats.combo}
        </div>
        <div className="flex h-9 items-center gap-1 rounded-xl bg-gold-light px-2.5 text-sm font-extrabold text-[#8A6400] dark:bg-gold/15 dark:text-gold">
          <Zap size={15} className="fill-gold" /> {stats.points}
        </div>
      </div>
      {stats.combo > 3 && (
        <p className="-mt-2 mb-2 text-center text-xs font-bold text-rose" aria-live="polite">
          🔥 Seriya bonusi: har bir to'g'ri javobga +3!
        </p>
      )}
      <Game
        words={words}
        level={level}
        pairs={pairs}
        count={game === 'scramble' ? 8 : 10}
        showHint={practice || level < 7}
        onAnswer={onAnswer}
        onDone={onDone}
      />
    </div>
  );
}
