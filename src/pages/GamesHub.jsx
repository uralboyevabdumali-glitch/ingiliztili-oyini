import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Check, Flame, Gift, Play, Puzzle, Shuffle, Star, TextCursorInput, Trophy, Volume2 } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { speak } from '../hooks/useSpeech.js';
import { CLASSIC_GAMES, GAME_INFO } from '../data/badges.js';
import { PETS } from '../data/pets.js';
import { wordOfDay } from '../data/quests.js';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import CefrBadge from '../components/CefrBadge.jsx';
import PetAvatar from '../components/PetAvatar.jsx';
import Confetti from '../components/Confetti.jsx';
import { Example } from '../components/WordCard.jsx';

const CLASSIC_STYLE = {
  quiz: { icon: Brain, grad: 'from-[#2D55F0] to-[#5B7BFF]', shadow: 'shadow-[0_6px_0_#1F3BB8]', emoji: '🧠' },
  match: { icon: Puzzle, grad: 'from-[#7C3AED] to-[#A06BFF]', shadow: 'shadow-[0_6px_0_#5B21B6]', emoji: '🧩' },
  scramble: { icon: Shuffle, grad: 'from-[#F5B700] to-[#FFD24D]', shadow: 'shadow-[0_6px_0_#B98A00]', emoji: '🔤' },
  fill: { icon: TextCursorInput, grad: 'from-[#16A34A] to-[#3CC46C]', shadow: 'shadow-[0_6px_0_#0F7A36]', emoji: '✍️' },
};

function greetingLine(mood, streak) {
  const h = new Date().getHours();
  const time = h < 5 ? 'Xayrli tun' : h < 12 ? 'Xayrli tong' : h < 18 ? 'Xayrli kun' : 'Xayrli kech';
  if (mood === 'sleep') return { time, sub: "Seni sog'indik! Bugun bitta o'yin bilan qaytamizmi?" };
  if (streak >= 2) return { time, sub: `${streak} kunlik seriya! Olovni o'chirmaslik uchun bugun ham o'yna 🔥` };
  if (mood === 'happy') return { time, sub: "Bugun zo'r ishlayapsan! Yana bir darajani ochamizmi?" };
  return { time, sub: "Bugun nimani o'rganamiz? O'yinni tanla va boshla!" };
}

function Hero({ onQuickPlay }) {
  const { settings, petStage, mood, streak, title, nextTitle, progress, stars } = useProgress();
  const pet = PETS[settings.pet?.type] || PETS.owl;
  const { time, sub } = greetingLine(mood, streak);
  const pct = nextTitle ? Math.min(100, ((progress.points - title.min) / (nextTitle.min - title.min)) * 100) : 100;
  return (
    <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#2D55F0] via-[#4361F5] to-[#7C3AED] p-5 text-white shadow-lift sm:p-8">
      {/* bezak doiralar */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10" aria-hidden />
      <div className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-gold/20" aria-hidden />
      <div className="pointer-events-none absolute right-1/3 top-6 h-4 w-4 rotate-45 rounded bg-gold/80" aria-hidden />
      <div className="pointer-events-none absolute bottom-10 right-10 h-3 w-3 rounded-full bg-white/70" aria-hidden />

      <div className="relative flex flex-col-reverse items-center gap-4 sm:flex-row sm:items-center">
        <div className="w-full min-w-0 flex-1">
          <p className="text-sm font-bold text-blue-100">{time}{settings.userName ? `, ${settings.userName}` : ''}! 👋</p>
          <h1 className="mt-1 font-display text-2xl font-extrabold leading-tight sm:text-4xl">Bugun ham o'rganamiz!</h1>
          <p className="mt-2 max-w-md text-[15px] text-blue-50/90 sm:text-base">{sub}</p>

          <div className="mt-4 flex flex-wrap gap-2 text-sm font-bold">
            <span className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur">
              {title.icon} {title.name}
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur">
              <Flame size={16} className="fill-orange-300 text-orange-300" /> {streak} kun
            </span>
            <span className="flex items-center gap-1.5 rounded-xl bg-white/15 px-3 py-1.5 backdrop-blur">
              <Star size={16} className="fill-gold text-gold" /> {stars}/120
            </span>
          </div>

          <div className="mt-4 max-w-md">
            <div className="h-2.5 overflow-hidden rounded-full bg-white/20">
              <motion.div className="h-full rounded-full bg-gold" initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8 }} />
            </div>
            <p className="mt-1 text-xs font-semibold text-blue-100">
              {nextTitle ? `${nextTitle.icon} ${nextTitle.name} unvonigacha ${nextTitle.min - progress.points} ochko` : 'Eng yuqori unvon! 👑'}
            </p>
          </div>

          <Button variant="gold" size="lg" className="mt-5" onClick={onQuickPlay}>
            <Play size={20} className="fill-ink" /> Tezkor o'yin
          </Button>
        </div>

        <div className="relative shrink-0">
          <div className="absolute inset-4 rounded-full bg-white/15 blur-xl" aria-hidden />
          <PetAvatar type={pet.id} stage={petStage} mood={mood} size={200} className="relative h-36 w-36 animate-floaty sm:h-52 sm:w-52" title={settings.pet?.name} />
          <span className="absolute -left-2 top-2 rounded-2xl rounded-br-sm bg-white px-3 py-1.5 text-sm font-extrabold text-brand shadow-card sm:-left-8">
            {pet.sound}
          </span>
        </div>
      </div>
    </section>
  );
}

function DailyQuests() {
  const { quests, daily, claimQuest } = useProgress();
  const [fx, setFx] = useState(0);
  const doneCount = quests.filter((q) => daily.claimed[q.id]).length;
  return (
    <Card className="p-5">
      <Confetti fire={fx || null} count={70} />
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-display text-lg font-extrabold">🎯 Kunlik vazifalar</h2>
        <span className="rounded-lg bg-brand-light px-2 py-0.5 text-xs font-extrabold text-brand-dark dark:bg-brand/20 dark:text-blue-100">
          {doneCount}/{quests.length}
        </span>
      </div>
      <ul className="space-y-3">
        {quests.map((q) => {
          const val = Math.min(daily[q.key], q.target);
          const done = val >= q.target;
          const claimed = daily.claimed[q.id];
          return (
            <li key={q.id} className="flex items-center gap-3">
              <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-xl ${claimed ? 'bg-leaf-light dark:bg-leaf/20' : 'bg-slate-100 dark:bg-white/5'}`} aria-hidden>
                {claimed ? <Check size={20} className="text-leaf" strokeWidth={3} /> : q.icon}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`truncate text-sm font-bold ${claimed ? 'text-ink-mute line-through dark:text-night-soft' : ''}`}>{q.text}</span>
                  <span className="shrink-0 text-xs font-bold text-ink-mute dark:text-night-soft">
                    {val}/{q.target}
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                  <div className={`h-full rounded-full transition-all ${done ? 'bg-leaf' : 'bg-brand'}`} style={{ width: `${(val / q.target) * 100}%` }} />
                </div>
              </div>
              {done && !claimed ? (
                <Button
                  variant="gold"
                  size="sm"
                  className="animate-pop"
                  onClick={() => {
                    if (claimQuest(q.id)) setFx((n) => n + 1);
                  }}
                >
                  <Gift size={15} /> +{q.reward}
                </Button>
              ) : (
                <span className={`w-14 shrink-0 text-right text-xs font-extrabold ${claimed ? 'text-leaf' : 'text-[#8A6400] dark:text-gold'}`}>
                  {claimed ? 'Olindi' : `+${q.reward}`}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function WordOfDay() {
  const { today } = useProgress();
  const w = wordOfDay(today);
  return (
    <Card className="relative overflow-hidden p-5">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gold/15" aria-hidden />
      <div className="relative">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold">☀️ Kun so'zi</h2>
          <CefrBadge level={w.cefr} />
        </div>
        <div className="flex items-center gap-3">
          <p lang="en" className="break-words font-display text-3xl font-extrabold text-brand dark:text-blue-300">
            {w.en}
          </p>
          <button
            type="button"
            onClick={() => speak(w.en)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand text-white shadow-[0_3px_0_#1F3BB8] transition active:translate-y-[3px] active:shadow-none"
            aria-label={`${w.en} — tinglash`}
          >
            <Volume2 size={19} />
          </button>
        </div>
        <p className="mt-1 text-lg font-bold">{w.uz}</p>
        <Example word={w} className="mt-2 rounded-2xl bg-slate-50 p-3 text-[15px] leading-relaxed text-ink-soft dark:bg-white/5 dark:text-slate-300" />
      </div>
    </Card>
  );
}

function FeatureCard({ onClick, grad, title, desc, stat, children }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -6, rotate: -0.5 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex min-h-[270px] w-full flex-col justify-end overflow-hidden rounded-[2rem] bg-gradient-to-br ${grad} p-5 text-left text-white shadow-lift sm:min-h-[260px] sm:p-6`}
    >
      {children}
      <div className="relative">
        <h2 className="font-display text-2xl font-extrabold drop-shadow sm:text-3xl">{title}</h2>
        <p className="mt-1 max-w-xs text-[15px] font-semibold text-white/90">{desc}</p>
        <div className="mt-3 flex items-center gap-2">
          <span className="rounded-xl bg-white/20 px-3 py-1 text-sm font-bold backdrop-blur">{stat}</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-extrabold text-ink shadow-[0_4px_0_rgba(30,41,59,.25)] transition group-hover:scale-105">
            <Play size={15} className="fill-ink" /> O'ynash
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function Hub({ open }) {
  const { progress, unlockedLevel, settings, petStage } = useProgress();
  const mistakes = Object.keys(progress.mistakes).length;
  const petType = settings.pet?.type || 'owl';
  const stage = Math.max(1, petStage);

  return (
    <div className="space-y-6">
      <Hero onQuickPlay={() => open({ view: 'play', game: 'quiz', level: unlockedLevel('quiz') })} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DailyQuests />
        <WordOfDay />
      </div>

      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold">🔥 Katta o'yinlar</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <FeatureCard
            onClick={() => open({ view: 'runner' })}
            grad="from-[#38BDF8] via-[#2D55F0] to-[#1F3BB8]"
            title="So'z yo'li"
            desc="Samarqand ko'chalarida yugur va to'g'ri darvozadan o't!"
            stat={`🏆 Rekord: ${progress.runner.best}`}
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-full" aria-hidden>
              <div className="absolute right-6 top-5 flex items-end gap-1 opacity-90">
                <span className="h-16 w-3 rounded-t-full bg-[#E5C48E]" />
                <span className="h-12 w-14 rounded-t-full bg-[#1FA2C8]" />
                <span className="h-16 w-3 rounded-t-full bg-[#E5C48E]" />
              </div>
              <div className="absolute bottom-0 right-8 h-32 w-48 bg-[#80889A]/80 [clip-path:polygon(40%_0,60%_0,100%_100%,0_100%)]" />
              <PetAvatar type={petType} stage={stage} mood="happy" shirt size={96} className="absolute right-20 top-4 transition group-hover:-translate-y-2 sm:right-24" />
            </div>
          </FeatureCard>
          <FeatureCard
            onClick={() => open({ view: 'penalty' })}
            grad="from-[#4ADE80] via-[#16A34A] to-[#0F7A36]"
            title="Gol! ⚽"
            desc="Penalti seriyasi: so'zni top — gol ur, tarjimani top — to'pni qaytar!"
            stat={`🏆 Turnir: ${Object.keys(progress.football.won).length}/10`}
          >
            <div className="pointer-events-none absolute inset-0" aria-hidden>
              <div className="absolute right-6 top-5 h-24 w-40 rounded-t-lg border-4 border-b-0 border-white/90 bg-[linear-gradient(90deg,rgba(255,255,255,.25)_1px,transparent_1px),linear-gradient(rgba(255,255,255,.25)_1px,transparent_1px)] bg-[length:10px_10px]" />
              <span className="absolute right-12 top-16 text-4xl transition group-hover:-translate-x-6 group-hover:-translate-y-6 group-hover:rotate-180">⚽</span>
              <PetAvatar type={petType} stage={stage} mood="happy" shirt size={92} className="absolute right-40 top-6 transition group-hover:-translate-y-2 sm:right-48" />
            </div>
          </FeatureCard>
        </div>
      </section>

      <section>
        <h2 className="mb-3 font-display text-xl font-extrabold">📚 Klassik o'yinlar</h2>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {CLASSIC_GAMES.map((g) => {
            const s = CLASSIC_STYLE[g];
            const Icon = s.icon;
            const starsN = Object.values(progress.levels[g] || {}).reduce((a, b) => a + b, 0);
            const lvl = unlockedLevel(g);
            return (
              <motion.button
                key={g}
                type="button"
                onClick={() => open({ view: 'levels', game: g })}
                whileHover={{ y: -5 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-card dark:border-night-line dark:bg-night-card"
              >
                <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br ${s.grad} sm:h-32`}>
                  <span className="absolute -right-3 -top-3 text-6xl opacity-25 sm:text-7xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <span className={`grid h-14 w-14 place-items-center rounded-2xl bg-white/95 text-ink sm:h-16 sm:w-16 ${s.shadow}`}>
                    <Icon size={30} />
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-3 sm:p-4">
                  <h3 className="font-display text-[15px] font-extrabold leading-tight sm:text-lg">{GAME_INFO[g].name}</h3>
                  <p className="mt-1 hidden flex-1 text-sm text-ink-soft dark:text-night-soft sm:block">{GAME_INFO[g].desc}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-ink-mute dark:text-night-soft">
                    <span className="flex items-center gap-1">
                      <Star size={13} className="fill-gold text-gold-dark" /> {starsN}/30
                    </span>
                    <span>{lvl === 10 ? 'FINAL' : `${lvl}-daraja`}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
                    <div className="h-full rounded-full bg-gold" style={{ width: `${(starsN / 30) * 100}%` }} />
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {mistakes > 0 && (
        <Card className="flex flex-wrap items-center gap-3 p-4 sm:p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-rose-light text-2xl dark:bg-rose/20">🩹</div>
          <div className="min-w-0 flex-1">
            <p className="font-bold">Xatolar ustida ishlash</p>
            <p className="text-sm text-ink-soft dark:text-night-soft">{mistakes} ta so'z takrorlashni kutyapti</p>
          </div>
          <Button variant="red" onClick={() => open({ view: 'practice' })}>
            Mashq qilish
          </Button>
        </Card>
      )}

      <p className="flex items-center justify-center gap-2 text-center text-xs text-ink-mute dark:text-night-soft">
        <Trophy size={14} /> Har bir o'yin ochko beradi — yangi unvon va yorliqlarni och!
      </p>
    </div>
  );
}
