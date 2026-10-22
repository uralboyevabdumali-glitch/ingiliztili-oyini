import { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowBigUp, ChevronLeft, ChevronRight, Coins, Heart, Pause, Play, RotateCcw, X } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { sfx } from '../lib/sound.js';
import { CEFR_HEX } from '../lib/words.js';
import PetAvatar from '../components/PetAvatar.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import CefrBadge from '../components/CefrBadge.jsx';
import Confetti from '../components/Confetti.jsx';
import { ReviewList } from './ClassicGame.jsx';
import { CEFR, createGame, currentGate, draw, makeView, renderBackground, score, update } from './runnerEngine.js';

const TOAST_MS = { ok: 600, level: 900, jump: 700, bad: 1500 };
const TOAST_STYLE = {
  ok: 'bg-leaf text-white',
  level: 'bg-brand text-white',
  jump: 'bg-gold text-ink',
  bad: 'bg-rose text-white',
};

export default function WordRunner({ onExit }) {
  const { settings, petStage, answer, finishRunner, progress, setInGame } = useProgress();
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const petRef = useRef(null);
  const scoreRef = useRef(null);
  const gameRef = useRef(null);
  const inputRef = useRef({ left: false, right: false, jump: false });
  const pausedRef = useRef(false);
  const petImg = useRef(null);
  const bestBefore = useRef(progress.runner.best);
  const toastId = useRef(0);

  const [phase, setPhase] = useState('ready'); // ready | play | over
  const [paused, setPaused] = useState(false);
  const [hud, setHud] = useState({ lives: 3, coins: 0, level: 0, word: null });
  const [toasts, setToasts] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    setInGame(phase !== 'over');
    return () => setInGame(false);
  }, [phase, setInGame]);

  // Hamroh rasmini canvas uchun tayyorlaymiz
  useEffect(() => {
    const svg = petRef.current;
    if (!svg) return;
    try {
      const xml = new XMLSerializer().serializeToString(svg);
      const img = new Image();
      img.onload = () => (petImg.current = img);
      img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml);
    } catch {
      /* zaxira: oddiy doira chiziladi */
    }
  }, []);

  const toast = useCallback((kind, text) => {
    const id = ++toastId.current;
    setToasts((t) => [...t.filter((x) => x.kind !== kind).slice(-1), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), TOAST_MS[kind]);
  }, []);

  const setPause = useCallback((v) => {
    pausedRef.current = v;
    setPaused(v);
  }, []);

  const start = () => {
    gameRef.current = createGame();
    bestBefore.current = progress.runner.best;
    setHud({ lives: 3, coins: 0, level: 0, word: null });
    setToasts([]);
    setResult(null);
    setPause(false);
    setPhase('play');
  };

  // Asosiy o'yin sikli
  useEffect(() => {
    if (phase !== 'play') return;
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    const ctx = canvas.getContext('2d');
    let view;
    let bg;
    let dpr = 1;

    const resize = () => {
      const w = wrap.clientWidth;
      const h = wrap.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      view = makeView(w, h);
      bg = renderBackground(view, dpr);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    let raf;
    let last = performance.now();
    const g = gameRef.current;

    const handleEvents = () => {
      if (!g.events.length) return;
      let hudChanged = false;
      for (const e of g.events) {
        if (e.type === 'coin') {
          sfx.coin();
          hudChanged = true;
        } else if (e.type === 'jump') sfx.jump();
        else if (e.type === 'hit') {
          sfx.hit();
          toast('jump', '↑ Sakra!');
          hudChanged = true;
        } else if (e.type === 'gate') {
          answer(e.word, e.ok, { combo: e.combo || 0 });
          if (e.ok) {
            sfx.correct();
            toast('ok', `✓ ${e.word.en} — ${e.word.uz}  +${e.points}`);
          } else {
            sfx.wrong();
            toast('bad', `✗ To'g'ri javob: ${e.word.en} — ${e.word.uz}`);
          }
          hudChanged = true;
        } else if (e.type === 'level') {
          sfx.levelUp();
          toast('level', `Yangi daraja: ${e.level}! Tezlik oshdi`);
          hudChanged = true;
        } else if (e.type === 'word') hudChanged = true;
        else if (e.type === 'over') {
          const res = { score: score(g), coins: g.coins, words: g.correctWords.length, levelIdx: g.levelIdx };
          finishRunner(res);
          setResult({ ...res, correct: g.correctWords.slice(), wrong: g.wrongWords.slice(), record: res.score > bestBefore.current });
          setTimeout(() => setPhase('over'), 650);
        }
      }
      g.events.length = 0;
      if (hudChanged) {
        const cur = currentGate(g);
        setHud({ lives: g.lives, coins: g.coins, level: g.levelIdx, word: cur ? cur.word : null });
      }
    };

    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!pausedRef.current && !g.over) {
        update(g, dt, inputRef.current);
        handleEvents();
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(ctx, view, g, bg, petImg.current);
      if (scoreRef.current) scoreRef.current.textContent = score(g);
      raf = requestAnimationFrame(loop);
    };
    // birinchi so'zni darhol ko'rsatamiz
    update(g, 0, inputRef.current);
    g.events.length = 0;
    const cur = currentGate(g);
    setHud((h) => ({ ...h, word: cur?.word || null }));
    raf = requestAnimationFrame(loop);

    const onVis = () => {
      if (document.hidden) setPause(true);
    };
    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onVis);
    };
  }, [phase, answer, finishRunner, toast, setPause]);

  // Klaviatura
  useEffect(() => {
    if (phase !== 'play') return;
    const onKey = (e) => {
      const k = e.key;
      if (k === 'p' || k === 'P' || k === 'Escape') {
        e.preventDefault();
        setPause(!pausedRef.current);
        return;
      }
      if (pausedRef.current) return;
      if (k === 'ArrowLeft' || k === 'a' || k === 'A') inputRef.current.left = true;
      else if (k === 'ArrowRight' || k === 'd' || k === 'D') inputRef.current.right = true;
      else if (k === 'ArrowUp' || k === ' ' || k === 'w' || k === 'W') inputRef.current.jump = true;
      else return;
      e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase, setPause]);

  // Barmoq bilan surish
  const touch = useRef(null);
  const onPointerDown = (e) => {
    touch.current = { x: e.clientX, y: e.clientY };
  };
  const onPointerUp = (e) => {
    if (!touch.current || pausedRef.current) return;
    const dx = e.clientX - touch.current.x;
    const dy = e.clientY - touch.current.y;
    touch.current = null;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 25) inputRef.current[dx < 0 ? 'left' : 'right'] = true;
    else if (dy < -25) inputRef.current.jump = true;
  };
  const press = (k) => () => {
    if (!pausedRef.current) inputRef.current[k] = true;
  };

  const pet = settings.pet || { type: 'owl', name: 'Ukki' };

  if (phase === 'over' && result) {
    return (
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-xl">
        <Confetti fire={result.record ? 'record' : null} />
        <Card className="p-6 text-center">
          <PetAvatar type={pet.type} stage={petStage} mood="happy" size={96} className="mx-auto" />
          <h2 className="mt-1 font-display text-2xl font-extrabold">{result.record ? 'Yangi rekord! 🏆' : 'Yugurish tugadi!'}</h2>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              ['Ochko', result.score, 'bg-brand-light text-brand-dark dark:bg-brand/15 dark:text-white'],
              ['Rekord', Math.max(result.score, bestBefore.current), 'bg-gold-light text-[#8A6400] dark:bg-gold/15 dark:text-gold'],
              ['Tangalar', result.coins, 'bg-gold-light text-[#8A6400] dark:bg-gold/15 dark:text-gold'],
              ["So'zlar", result.words, 'bg-leaf-light text-leaf-dark dark:bg-leaf/15 dark:text-green-200'],
            ].map(([label, val, cls]) => (
              <div key={label} className={`rounded-2xl p-3 ${cls}`}>
                <div className="font-display text-xl font-extrabold">{val}</div>
                <div className="text-xs font-semibold opacity-80">{label}</div>
              </div>
            ))}
          </div>
          <p className="mt-3 flex items-center justify-center gap-2 text-sm font-semibold text-ink-soft dark:text-night-soft">
            Yetib borilgan daraja: <CefrBadge level={CEFR[result.levelIdx]} /> · Umumiy ochkoga +{Math.round(result.score / 5)}
          </p>
          <ReviewList words={result.correct} title="To'g'ri topilgan so'zlar" />
          <ReviewList words={result.wrong} />
          <div className="mt-6 flex justify-center gap-2">
            <Button variant="soft" onClick={onExit}>
              Chiqish
            </Button>
            <Button onClick={start}>
              <RotateCcw size={17} /> Yana yugurish
            </Button>
          </div>
        </Card>
      </motion.div>
    );
  }

  const cefr = CEFR[hud.level];

  return (
    <div className="mx-auto max-w-4xl">
      {/* Canvas uchun hamroh SVG manbasi (ko'rinmaydi) */}
      <div className="hidden" aria-hidden>
        <PetAvatar ref={petRef} type={pet.type} stage={Math.max(1, petStage)} mood="happy" shirt size={240} />
      </div>

      <div className="mb-2 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onExit} aria-label="O'yindan chiqish">
          <X size={22} />
        </Button>
        <h2 className="font-display text-base font-extrabold">So'z yo'li</h2>
        {phase === 'play' && (
          <div className="ml-auto flex items-center gap-1.5 text-sm font-extrabold">
            <span className="flex items-center gap-0.5" aria-label={`${hud.lives} ta jon`}>
              {[0, 1, 2].map((i) => (
                <Heart key={i} size={18} className={i < hud.lives ? 'fill-rose text-rose' : 'text-slate-300 dark:text-night-line'} />
              ))}
            </span>
            <span className="flex h-8 items-center gap-1 rounded-xl bg-gold-light px-2 text-[#8A6400] dark:bg-gold/15 dark:text-gold">
              <Coins size={15} /> {hud.coins}
            </span>
            <span className="flex h-8 min-w-[52px] items-center justify-center rounded-xl bg-brand-light px-2 text-brand-dark dark:bg-brand/20 dark:text-white" ref={scoreRef}>
              0
            </span>
            <Button variant="soft" size="icon" onClick={() => setPause(!paused)} aria-label={paused ? 'Davom etish' : 'Pauza'}>
              {paused ? <Play size={18} /> : <Pause size={18} />}
            </Button>
          </div>
        )}
      </div>

      <div
        ref={wrapRef}
        className="touch-none-all relative h-[min(74vh,780px)] min-h-[440px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-[#BFE3FF] shadow-card dark:border-night-line"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-label="So'z yo'li o'yin maydoni" role="img" />

        {phase === 'play' && hud.word && (
          <div className="pointer-events-none absolute inset-x-0 top-2.5 flex justify-center px-3">
            <motion.div
              key={hud.word.id}
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="flex max-w-full items-center gap-2 rounded-2xl bg-white/95 px-4 py-2 shadow-card dark:bg-night-card/95"
            >
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: CEFR_HEX[cefr] }} />
              <span className="truncate font-display text-lg font-extrabold sm:text-xl">{hud.word.uz}</span>
              <CefrBadge level={hud.word.cefr} />
            </motion.div>
          </div>
        )}

        {/* Ogohlantirishlar: osmon qismida, darvozalardagi so'zlarni to'smaydi */}
        <div className="pointer-events-none absolute inset-x-0 top-[17%] flex flex-col items-center gap-1 px-3" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 6, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
                className={`max-w-full truncate rounded-xl px-3 py-1 text-sm font-extrabold shadow-card ${TOAST_STYLE[t.kind]}`}
              >
                {t.text}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {phase === 'ready' && (
          <div className="absolute inset-0 grid place-items-center bg-white/55 p-4 backdrop-blur-[2px] dark:bg-night/60">
            <Card className="max-w-sm p-5 text-center">
              <PetAvatar type={pet.type} stage={Math.max(1, petStage)} mood="happy" shirt size={88} className="mx-auto" />
              <h3 className="mt-1 font-display text-xl font-extrabold">So'z yo'li</h3>
              <ul className="mt-2 space-y-1 text-left text-sm text-ink-soft dark:text-night-soft">
                <li>🔤 Tepada o'zbekcha so'z chiqadi — inglizchasi yozilgan darvozadan o't</li>
                <li>🚧 To'siqlardan sakra, 🪙 tangalarni yig'. Senda 3 ta jon bor</li>
                <li>⬆️ Har 6 ta to'g'ri so'zdan keyin daraja va tezlik oshadi</li>
                <li>⌨️ ← → yo'lak, ↑ yoki Probel — sakrash, P/Esc — pauza. Telefonda — suring</li>
              </ul>
              <Button size="lg" className="mt-4 w-full" onClick={start} data-autofocus>
                <Play size={18} /> Boshlash
              </Button>
              <p className="mt-2 text-xs font-semibold text-ink-mute dark:text-night-soft">Rekord: {progress.runner.best}</p>
            </Card>
          </div>
        )}

        {phase === 'play' && paused && (
          <div className="absolute inset-0 grid place-items-center bg-white/55 p-4 backdrop-blur-[2px] dark:bg-night/60">
            <Card className="p-5 text-center">
              <h3 className="font-display text-xl font-extrabold">Pauza</h3>
              <div className="mt-4 flex gap-2">
                <Button variant="soft" onClick={onExit}>
                  Chiqish
                </Button>
                <Button onClick={() => setPause(false)} autoFocus>
                  <Play size={17} /> Davom etish
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>

      {phase === 'play' && (
        <div className="mt-3 grid grid-cols-3 gap-2">
          <Button variant="soft" size="lg" onPointerDown={press('left')} aria-label="Chap yo'lak">
            <ChevronLeft size={26} />
          </Button>
          <Button variant="gold" size="lg" onPointerDown={press('jump')} aria-label="Sakrash">
            <ArrowBigUp size={26} /> <span className="hidden sm:inline">Sakra</span>
          </Button>
          <Button variant="soft" size="lg" onPointerDown={press('right')} aria-label="O'ng yo'lak">
            <ChevronRight size={26} />
          </Button>
        </div>
      )}
    </div>
  );
}
