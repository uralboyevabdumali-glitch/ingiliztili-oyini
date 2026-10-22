import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock, Pause, Play, RotateCcw, Trophy, Volume2, X } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { speak } from '../hooks/useSpeech.js';
import { sfx } from '../lib/sound.js';
import { BY_CEFR, LEVEL_CEFR, isPhrase, options } from '../lib/words.js';
import PetAvatar from '../components/PetAvatar.jsx';
import Button from '../components/Button.jsx';
import Card, { SectionTitle } from '../components/Card.jsx';
import CefrBadge from '../components/CefrBadge.jsx';
import Confetti from '../components/Confetti.jsx';
import { OptionButton, optionState, useNumberKeys } from './shared.jsx';
import { ReviewList } from './ClassicGame.jsx';

export const STAGES = [
  { name: 'Mahalla ligasi', icon: '🏘️' },
  { name: 'Mahalla ligasi', icon: '🏘️' },
  { name: 'Shahar kubogi', icon: '🏙️' },
  { name: 'Shahar kubogi', icon: '🏙️' },
  { name: 'Superliga', icon: '⭐' },
  { name: 'Superliga', icon: '⭐' },
  { name: 'Osiyo kubogi', icon: '🌏' },
  { name: 'Chempionlar ligasi', icon: '🏆' },
  { name: 'Chempionlar ligasi', icon: '🏆' },
  { name: 'Jahon chempionati FINALI', icon: '🌍' },
];

// Darvoza: x 90..310, y 62..170 (viewBox 400x300)
const GOAL = { x: 90, y: 62, w: 220, h: 108 };
const ZONES = [
  { x: 145, y: 90 },
  { x: 255, y: 90 },
  { x: 145, y: 143 },
  { x: 255, y: 143 },
];
const KEEPER_DIVE = [
  { x: -62, y: -44, rotate: -62 },
  { x: 62, y: -44, rotate: 62 },
  { x: -66, y: -4, rotate: -82 },
  { x: 66, y: -4, rotate: 82 },
];
const SPOT = { x: 200, y: 258 };
const KICKS = 5;
const TIMEOUT = { id: '__timeout__' };

const timeLimit = (stage) => 7 - ((stage - 1) * 3) / 9;

function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) / 2147483647);
}

function Stadium() {
  const crowd = useMemo(() => {
    const r = rng(42);
    const colors = ['#2D55F0', '#F5B700', '#EF4444', '#16A34A', '#7C3AED', '#F8FAFC', '#38BDF8', '#FB923C'];
    const dots = [];
    for (let row = 0; row < 6; row++) {
      for (let i = 0; i < 46; i++) {
        dots.push({ x: 4 + i * 8.7 + (row % 2) * 4, y: 40 + row * 13.5, c: colors[Math.floor(r() * colors.length)] });
      }
    }
    return dots;
  }, []);
  return (
    <g>
      <rect width="400" height="300" fill="#BFE3FF" />
      {/* tribunalar */}
      <rect y="26" width="400" height="106" fill="#3B5BDB" />
      {[0, 1, 2, 3, 4, 5].map((r) => (
        <rect key={r} y={33 + r * 13.5} width="400" height="13.5" fill={r % 2 ? '#3451C9' : '#4263EB'} />
      ))}
      {crowd.map((d, i) => (
        <g key={i}>
          <circle cx={d.x} cy={d.y} r="3.2" fill={d.c} />
          <rect x={d.x - 3.2} y={d.y + 3} width="6.4" height="4" rx="1.5" fill={d.c} opacity=".75" />
        </g>
      ))}
      <rect y="18" width="400" height="10" fill="#E2E8F0" />
      {[60, 200, 340].map((x) => (
        <g key={x}>
          <rect x={x - 1.5} y="2" width="3" height="18" fill="#94A3B8" />
          <rect x={x - 12} y="0" width="24" height="8" rx="2" fill="#FFF7D6" stroke="#F5B700" />
        </g>
      ))}
      {/* reklama taxtasi */}
      <rect y="124" width="400" height="16" fill="#F8FAFC" />
      {[0, 1, 2, 3].map((i) => (
        <text key={i} x={50 + i * 100} y="136" textAnchor="middle" fontFamily="Unbounded, sans-serif" fontWeight="800" fontSize="10" fill={i % 2 ? '#F5B700' : '#2D55F0'}>
          SO'ZLIK
        </text>
      ))}
      {/* maydon */}
      <rect y="140" width="400" height="160" fill="#4CAF50" />
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} y={140 + i * 32} width="400" height="16" fill="#47A54B" />
      ))}
      <g stroke="#F8FAFC" strokeWidth="2.2" fill="none" opacity=".9">
        <path d="M30 170 L370 170" />
        <path d="M60 170 L40 228 L360 228 L340 170" />
        <path d="M130 170 L124 192 L276 192 L270 170" />
        <path d="M150 228 Q200 250 250 228" />
      </g>
      <ellipse cx={SPOT.x} cy={SPOT.y + 6} rx="3" ry="1.5" fill="#F8FAFC" />
      {/* to'r */}
      <g stroke="#E2E8F0" strokeWidth=".8" opacity=".8">
        <rect x={GOAL.x + 8} y={GOAL.y + 6} width={GOAL.w - 16} height={GOAL.h - 6} fill="#DDEAF5" fillOpacity=".35" />
        {Array.from({ length: 21 }, (_, i) => (
          <line key={'v' + i} x1={GOAL.x + 8 + i * 10.2} y1={GOAL.y + 6} x2={GOAL.x + 8 + i * 10.2} y2={GOAL.y + GOAL.h} />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <line key={'h' + i} x1={GOAL.x + 8} y1={GOAL.y + 6 + i * 10.2} x2={GOAL.x + GOAL.w - 8} y2={GOAL.y + 6 + i * 10.2} />
        ))}
      </g>
      {/* ustunlar */}
      <g fill="#FFFFFF" stroke="#CBD5E1" strokeWidth=".8">
        <rect x={GOAL.x - 4} y={GOAL.y - 4} width="6" height={GOAL.h + 4} rx="2" />
        <rect x={GOAL.x + GOAL.w - 2} y={GOAL.y - 4} width="6" height={GOAL.h + 4} rx="2" />
        <rect x={GOAL.x - 4} y={GOAL.y - 4} width={GOAL.w + 8} height="6" rx="2" />
      </g>
    </g>
  );
}

function RivalKeeper() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="16" ry="3" fill="#1E293B" opacity=".2" />
      <rect x="-8" y="-20" width="6" height="20" rx="3" fill="#334155" />
      <rect x="2" y="-20" width="6" height="20" rx="3" fill="#334155" />
      <rect x="-13" y="-48" width="26" height="30" rx="9" fill="#EF4444" />
      <text x="0" y="-28" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="Unbounded, sans-serif">
        1
      </text>
      <rect x="-27" y="-50" width="15" height="7" rx="3.5" fill="#EF4444" transform="rotate(-35 -13 -46)" />
      <rect x="12" y="-50" width="15" height="7" rx="3.5" fill="#EF4444" transform="rotate(35 13 -46)" />
      <circle cx="-26" cy="-60" r="6" fill="#F5B700" stroke="#B98A00" />
      <circle cx="26" cy="-60" r="6" fill="#F5B700" stroke="#B98A00" />
      <circle cx="0" cy="-58" r="11" fill="#F2C9A0" />
      <path d="M-11 -61 Q0 -74 11 -61 Q6 -66 0 -66 Q-6 -66 -11 -61 Z" fill="#7C4A21" />
      <circle cx="-4" cy="-58" r="1.6" fill="#1E293B" />
      <circle cx="4" cy="-58" r="1.6" fill="#1E293B" />
      <path d="M-3 -53 Q0 -51 3 -53" stroke="#1E293B" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function RivalStriker() {
  return (
    <g>
      <ellipse cx="0" cy="0" rx="16" ry="3" fill="#1E293B" opacity=".2" />
      <rect x="-8" y="-22" width="6" height="22" rx="3" fill="#F2C9A0" />
      <rect x="2" y="-22" width="6" height="22" rx="3" fill="#F2C9A0" />
      <rect x="-10" y="-30" width="20" height="10" rx="3" fill="#F8FAFC" />
      <rect x="-13" y="-56" width="26" height="28" rx="9" fill="#EF4444" />
      <text x="0" y="-37" textAnchor="middle" fontSize="11" fontWeight="800" fill="#fff" fontFamily="Unbounded, sans-serif">
        9
      </text>
      <circle cx="0" cy="-66" r="11" fill="#F2C9A0" />
      <path d="M-11 -69 Q0 -82 11 -69 Q6 -74 0 -74 Q-6 -74 -11 -69 Z" fill="#1E293B" opacity=".7" />
    </g>
  );
}

function Ball() {
  return (
    <g>
      <circle r="8" fill="#FFFFFF" stroke="#94A3B8" strokeWidth="1" />
      <path d="M0 -3.5 L3.3 -1 L2 3 L-2 3 L-3.3 -1 Z" fill="#334155" />
      <path d="M0 -8 L0 -3.5 M3.3 -1 L7.5 -2.5 M2 3 L4.5 6.5 M-2 3 L-4.5 6.5 M-3.3 -1 L-7.5 -2.5" stroke="#334155" strokeWidth="1" />
    </g>
  );
}

function pickWord(stage, used) {
  const cefr = LEVEL_CEFR[stage - 1];
  const pool = BY_CEFR[cefr].filter((w) => !used.has(w.id));
  const phrases = pool.filter(isPhrase);
  const usePhrase = stage >= 7 && phrases.length && Math.random() < 0.4;
  const list = usePhrase ? phrases : pool.length ? pool : BY_CEFR[cefr];
  const w = list[Math.floor(Math.random() * list.length)];
  used.add(w.id);
  return w;
}

function Scoreboard({ kicks, user, opp, golden }) {
  const att = kicks.filter((k) => k.type === 'A');
  const def = kicks.filter((k) => k.type === 'D');
  const dots = (list, success) =>
    Array.from({ length: Math.max(KICKS, list.length) }, (_, i) => {
      const k = list[i];
      const cls = !k || k.result == null ? 'bg-white/25' : success(k) ? 'bg-leaf' : 'bg-rose';
      return <span key={i} className={`h-2.5 w-2.5 rounded-full ${cls}`} />;
    });
  return (
    <div className="rounded-2xl border-4 border-[#2A3B5C] bg-[#1F2D4A] px-3 py-2 text-white shadow-card">
      <div className="flex items-center justify-center gap-3 font-display">
        <span className="text-xs font-bold text-blue-200">SIZ</span>
        <span className="rounded-lg bg-[#13203A] px-3 py-0.5 text-2xl font-extrabold tabular-nums text-gold" aria-live="polite" aria-label={`Hisob: siz ${user}, raqib ${opp}`}>
          {user} : {opp}
        </span>
        <span className="text-xs font-bold text-red-200">RAQIB</span>
      </div>
      <div className="mt-1.5 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1">{dots(att, (k) => k.result)}</div>
        {golden && <span className="rounded-md bg-gold px-1.5 text-[10px] font-extrabold text-ink">OLTIN GOL</span>}
        <div className="flex flex-wrap justify-end gap-1">{dots(def, (k) => !k.result)}</div>
      </div>
    </div>
  );
}

function Match({ stage, onFinish, onExit }) {
  const { settings, petStage, answer } = useProgress();
  const pet = settings.pet || { type: 'owl', name: 'Ukki' };
  const used = useRef(new Set());
  const [kicks, setKicks] = useState([]);
  const kicksRef = useRef([]);
  const [cur, setCur] = useState(null); // {type, word, opts, choice, ballZone, keeperZone, phase}
  const [timeLeft, setTimeLeft] = useState(0);
  const [paused, setPaused] = useState(false);
  const [goalFx, setGoalFx] = useState(0);
  const [banner, setBanner] = useState(null);
  const combo = useRef(0);
  const wrong = useRef([]);
  const timers = useRef([]);
  const limit = timeLimit(stage);

  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const user = kicks.filter((k) => k.type === 'A' && k.result).length;
  const opp = kicks.filter((k) => k.type === 'D' && k.result === false).length;
  const golden = kicks.length >= KICKS * 2;

  const nextKick = useCallback(
    (done) => {
      // Natija aniqlanganmi?
      const u = done.filter((k) => k.type === 'A' && k.result).length;
      const o = done.filter((k) => k.type === 'D' && k.result === false).length;
      const n = done.length;
      if (n >= KICKS * 2 && n % 2 === 0 && u !== o) {
        onFinish({ won: u > o, goalsFor: u, goalsAgainst: o, wrong: wrong.current });
        return;
      }
      const type = n % 2 === 0 ? 'A' : 'D';
      const word = pickWord(stage, used.current);
      setCur({ type, word, opts: options(word), choice: null, ballZone: null, keeperZone: null, phase: 'aim' });
      if (type === 'D') {
        setTimeLeft(limit);
        later(() => speak(word.en), 350);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stage, limit, onFinish],
  );

  useEffect(() => {
    sfx.whistle();
    nextKick([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resolve = useCallback(
    (choiceIdx) => {
      if (!cur || cur.phase !== 'aim') return;
      const ok = choiceIdx != null && cur.opts[choiceIdx] === cur.word;
      combo.current = ok ? combo.current + 1 : 0;
      answer(cur.word, ok, { points: ok ? 4 + stage : 0, combo: combo.current });
      if (!ok && !wrong.current.includes(cur.word)) wrong.current.push(cur.word);
      sfx.kick();

      let ballZone;
      let keeperZone;
      if (cur.type === 'A') {
        ballZone = choiceIdx;
        const others = [0, 1, 2, 3].filter((z) => z !== ballZone);
        keeperZone = ok ? others[Math.floor(Math.random() * 3)] : ballZone;
      } else {
        ballZone = Math.floor(Math.random() * 4);
        const others = [0, 1, 2, 3].filter((z) => z !== ballZone);
        keeperZone = ok ? ballZone : others[Math.floor(Math.random() * 3)];
      }
      setCur((c) => ({ ...c, choice: choiceIdx == null ? -1 : choiceIdx, ballZone, keeperZone, phase: 'flight', ok }));

      const goal = cur.type === 'A' ? ok : !ok;
      later(() => {
        if (cur.type === 'A' && ok) {
          sfx.crowd(1.6);
          setGoalFx((n) => n + 1);
          setBanner({ text: 'GOL!', cls: 'text-gold' });
        } else if (cur.type === 'A') {
          sfx.wrong();
          setBanner({ text: 'Ushlab qoldi!', cls: 'text-white' });
        } else if (ok) {
          sfx.correct();
          setBanner({ text: 'Qaytarding!', cls: 'text-leaf-light' });
        } else {
          sfx.wrong();
          setBanner({ text: choiceIdx == null ? 'Vaqt tugadi!' : 'Raqib gol urdi', cls: 'text-red-200' });
        }
        later(() => setBanner(null), 900);
      }, 620);

      later(() => {
        const done = [...kicksRef.current, { type: cur.type, result: ok, goal }];
        kicksRef.current = done;
        setKicks(done);
        nextKick(done);
      }, 2100);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cur, answer, stage, nextKick],
  );

  // Himoya taymeri
  useEffect(() => {
    if (!cur || cur.type !== 'D' || cur.phase !== 'aim' || paused) return;
    const started = performance.now();
    const startLeft = timeLeft;
    const id = setInterval(() => {
      const left = Math.max(0, startLeft - (performance.now() - started) / 1000);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(id);
        resolve(null);
      }
    }, 100);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cur, paused]);

  // Sahifa yashirilsa — pauza
  useEffect(() => {
    const onVis = () => document.hidden && setPaused(true);
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useNumberKeys(4, (i) => !paused && resolve(i), !!cur && cur.phase === 'aim' && !paused);

  if (!cur) return null;
  const attack = cur.type === 'A';
  const flying = cur.phase === 'flight';
  const target = cur.ballZone != null ? ZONES[cur.ballZone] : null;
  const saved = flying && cur.keeperZone === cur.ballZone;
  const ballTo = target ? (saved ? { x: target.x * 0.85 + 200 * 0.15, y: target.y + 4 } : target) : SPOT;
  const dive = flying ? KEEPER_DIVE[cur.keeperZone] : { x: 0, y: 0, rotate: 0 };

  return (
    <div className="mx-auto max-w-3xl">
      <Confetti fire={goalFx || null} count={90} duration={1400} />
      <div className="mb-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="O'yindan chiqish">
          <X size={22} />
        </Button>
        <div className="min-w-0 flex-1 truncate text-sm font-bold">
          {STAGES[stage - 1].icon} {stage}-bosqich · {STAGES[stage - 1].name}
        </div>
        <Button variant="soft" size="icon" onClick={() => setPaused((p) => !p)} aria-label={paused ? 'Davom etish' : 'Pauza'}>
          {paused ? <Play size={18} /> : <Pause size={18} />}
        </Button>
      </div>

      <Scoreboard kicks={kicks} user={user} opp={opp} golden={golden} />

      <div className={`mt-3 rounded-2xl px-4 py-2.5 text-center shadow-card ${attack ? 'bg-brand text-white' : 'bg-white dark:bg-night-card'}`}>
        <p className={`text-[11px] font-bold uppercase tracking-wider ${attack ? 'text-blue-100' : 'text-rose'}`}>
          {attack ? 'Hujum: inglizchasi yozilgan burchakka tep!' : "Himoya: tarjimasini tanla va to'pni qaytar!"}
        </p>
        <div className="mt-0.5 flex items-center justify-center gap-2">
          <span lang={attack ? 'uz' : 'en'} className="break-words font-display text-xl font-extrabold sm:text-2xl">
            {attack ? cur.word.uz : cur.word.en}
          </span>
          {!attack && (
            <button
              type="button"
              onClick={() => speak(cur.word.en)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-light text-brand dark:bg-brand/20 dark:text-blue-200"
              aria-label="Qayta tinglash"
            >
              <Volume2 size={17} />
            </button>
          )}
          <CefrBadge level={cur.word.cefr} />
        </div>
        {!attack && (
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" role="progressbar" aria-label="Qolgan vaqt" aria-valuemin={0} aria-valuemax={limit} aria-valuenow={Math.ceil(timeLeft)}>
            <div
              className={`h-full rounded-full ${timeLeft < 2 ? 'bg-rose' : 'bg-gold'}`}
              style={{ width: `${(timeLeft / limit) * 100}%`, transition: 'width .1s linear' }}
            />
          </div>
        )}
      </div>

      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden rounded-3xl border border-slate-200 shadow-card dark:border-night-line">
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" role="img" aria-label="Stadion va darvoza">
          <Stadium />
          {/* darvozabon */}
          <motion.g
            initial={false}
            animate={{ x: 200 + dive.x, y: 170 + dive.y, rotate: dive.rotate }}
            transition={flying ? { duration: 0.45, delay: 0.12, ease: 'easeOut' } : { duration: 0.3 }}
          >
            {attack ? (
              <RivalKeeper />
            ) : (
              <g transform="translate(-38 -74)">
                <PetAvatar type={pet.type} stage={Math.max(1, petStage)} mood="happy" gloves shirt="#16A34A" size={76} />
              </g>
            )}
          </motion.g>
          {/* hujumchi */}
          <motion.g
            initial={false}
            animate={{ x: flying ? 168 : 150, y: 300, rotate: flying ? 8 : 0 }}
            transition={{ duration: 0.2 }}
          >
            {attack ? (
              <g transform="translate(-42 -84)">
                <PetAvatar type={pet.type} stage={Math.max(1, petStage)} mood="happy" shirt size={84} />
              </g>
            ) : (
              <g transform="scale(1.15)">
                <RivalStriker />
              </g>
            )}
          </motion.g>
          {/* to'p */}
          <motion.g
            initial={false}
            animate={{ x: flying ? ballTo.x : SPOT.x, y: flying ? ballTo.y : SPOT.y, scale: flying ? 0.62 : 1, rotate: flying ? 540 : 0 }}
            transition={flying ? { duration: 0.6, ease: [0.2, 0.7, 0.4, 1] } : { duration: 0 }}
          >
            <Ball />
          </motion.g>
        </svg>

        {/* Hujumda: 4 zona tugmalari */}
        {attack && (
          <div
            className="absolute grid grid-cols-2 grid-rows-2 gap-1 p-1"
            style={{ left: `${(GOAL.x / 400) * 100}%`, top: `${(GOAL.y / 300) * 100}%`, width: `${(GOAL.w / 400) * 100}%`, height: `${(GOAL.h / 300) * 100}%` }}
          >
            {cur.opts.map((o, i) => {
              const st = flying ? optionState(o, cur.opts[cur.choice], cur.word) : 'idle';
              const cls = {
                idle: 'bg-white/80 text-ink hover:bg-white hover:ring-4 hover:ring-gold',
                correct: 'bg-leaf/40 text-white ring-2 ring-leaf',
                wrong: 'bg-rose/40 text-white ring-2 ring-rose',
                reveal: 'bg-leaf/35 text-white ring-2 ring-leaf',
                dim: 'bg-white/10 text-transparent',
              }[st];
              return (
                <button
                  key={o.id}
                  type="button"
                  lang="en"
                  disabled={flying || paused}
                  onClick={() => resolve(i)}
                  className={`flex items-center justify-center rounded-lg px-1 text-center text-[11px] font-extrabold leading-tight shadow-sm transition sm:text-sm ${cls}`}
                  aria-label={`${i + 1}: ${o.en}`}
                >
                  <span className="line-clamp-2 break-words">{o.en}</span>
                </button>
              );
            })}
          </div>
        )}

        <AnimatePresence>
          {banner && (
            <motion.div
              key={banner.text + kicks.length}
              initial={{ scale: 0.4, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 400, damping: 16 }}
              className="pointer-events-none absolute inset-x-0 top-[6%] flex justify-center"
            >
              <span
                className={`font-display text-4xl font-extrabold sm:text-6xl ${banner.cls}`}
                style={{ WebkitTextStroke: '2px #1E293B', paintOrder: 'stroke fill', textShadow: '0 4px 0 rgba(30,41,59,.35)' }}
              >
                {banner.text}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {paused && (
          <div className="absolute inset-0 grid place-items-center bg-white/60 p-4 backdrop-blur-[2px] dark:bg-night/60">
            <Card className="p-5 text-center">
              <h3 className="font-display text-xl font-extrabold">Pauza</h3>
              <div className="mt-4 flex gap-2">
                <Button variant="soft" onClick={onExit}>
                  Chiqish
                </Button>
                <Button onClick={() => setPaused(false)} autoFocus>
                  <Play size={17} /> Davom etish
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {!attack && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {cur.opts.map((o, i) => (
            <OptionButton
              key={o.id}
              index={i + 1}
              state={flying ? optionState(o, cur.choice >= 0 ? cur.opts[cur.choice] : TIMEOUT, cur.word) : 'idle'}
              disabled={flying || paused}
              onClick={() => resolve(i)}
            >
              {o.uz}
            </OptionButton>
          ))}
        </div>
      )}
      <p className="mt-3 text-center text-xs text-ink-mute dark:text-night-soft">
        {attack ? 'Burchakni bos yoki 1–4 tugmalari' : '1–4 tugmalari bilan tanla'} · P — pauza
      </p>
    </div>
  );
}

function Tournament({ onPick, onExit }) {
  const { progress } = useProgress();
  const { unlocked, won } = progress.football;
  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={onExit} className="mb-2">
        <ArrowLeft size={17} /> O'yinlar
      </Button>
      <SectionTitle title="Gol! ⚽" subtitle="Penalti seriyasi: 5 tadan zarba. Durang bo'lsa — oltin gol!" />
      <ol className="space-y-2">
        {STAGES.map((s, i) => {
          const n = i + 1;
          const locked = n > unlocked;
          const final = n === 10;
          return (
            <li key={n}>
              <button
                type="button"
                disabled={locked}
                onClick={() => onPick(n)}
                className={`flex w-full items-center gap-3 rounded-2xl border-2 p-3 text-left transition ${
                  locked
                    ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-night-line dark:bg-white/5 dark:text-night-soft'
                    : final
                      ? 'border-gold-dark bg-gold text-ink shadow-[0_4px_0_#B98A00] hover:-translate-y-0.5 active:translate-y-1 active:shadow-none'
                      : 'border-slate-200 bg-white shadow-[0_4px_0_#CBD5E1] hover:-translate-y-0.5 hover:border-brand active:translate-y-1 active:shadow-none dark:border-night-line dark:bg-night-card dark:shadow-[0_4px_0_#16202F]'
                }`}
              >
                <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl font-display font-extrabold ${final ? 'bg-white/40' : 'bg-brand-light text-brand-dark dark:bg-brand/20 dark:text-white'}`}>
                  {locked ? <Lock size={17} /> : n}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">
                    {s.icon} {s.name}
                  </span>
                  <span className="text-xs font-semibold opacity-75">
                    Taymer: {timeLimit(n).toFixed(1)} s{n >= 7 ? ' · iboralar ham chiqadi' : ''}
                  </span>
                </span>
                <CefrBadge level={LEVEL_CEFR[i]} />
                {won[n] && <Trophy size={20} className="shrink-0 text-gold-dark" aria-label="Yutilgan" />}
              </button>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default function PenaltyGame({ onExit }) {
  const { finishFootball, setInGame, settings, petStage } = useProgress();
  const [stage, setStage] = useState(null);
  const [round, setRound] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setInGame(stage != null && !result);
    return () => setInGame(false);
  }, [stage, result, setInGame]);

  const onFinish = useCallback(
    (r) => {
      finishFootball({ stage, won: r.won, goalsFor: r.goalsFor, goalsAgainst: r.goalsAgainst });
      if (r.won) sfx.crowd(2.2);
      setResult(r);
    },
    [finishFootball, stage],
  );

  const play = (n) => {
    setResult(null);
    setStage(n);
    setRound((r) => r + 1);
  };

  if (stage == null) return <Tournament onPick={play} onExit={onExit} />;

  if (result) {
    const pet = settings.pet || { type: 'owl' };
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
        <Confetti fire={result.won ? 'win' : null} />
        <Card className="p-6 text-center">
          <PetAvatar type={pet.type} stage={Math.max(1, petStage)} mood={result.won ? 'happy' : 'normal'} shirt size={96} className="mx-auto" />
          <h2 className="mt-1 font-display text-2xl font-extrabold">
            {result.won ? (stage === 10 ? 'JAHON CHEMPIONI! 🌍' : "G'alaba! 🏆") : 'Mag\'lubiyat. Qayta urin!'}
          </h2>
          <p className="mt-3 font-display text-3xl font-extrabold tabular-nums">
            SIZ {result.goalsFor} : {result.goalsAgainst} RAQIB
          </p>
          {result.won && stage < 10 && <p className="mt-2 font-semibold text-leaf-dark dark:text-green-300">{stage + 1}-bosqich ochildi!</p>}
          <ReviewList words={result.wrong} />
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button variant="soft" onClick={() => setStage(null)}>
              Turnir
            </Button>
            <Button variant={result.won && stage < 10 ? 'soft' : 'primary'} onClick={() => play(stage)}>
              <RotateCcw size={17} /> Qayta
            </Button>
            {result.won && stage < 10 && (
              <Button onClick={() => play(stage + 1)}>
                Keyingi bosqich <ArrowRight size={17} />
              </Button>
            )}
          </div>
        </Card>
      </motion.div>
    );
  }

  return <Match key={round} stage={stage} onFinish={onFinish} onExit={() => setStage(null)} />;
}
