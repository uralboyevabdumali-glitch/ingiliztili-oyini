import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useProgress from '../hooks/useProgress.js';
import { PETS } from '../data/pets.js';
import PetAvatar from './PetAvatar.jsx';

function phrases({ pet, name, mood, giftAvailable, streak, nextTitle, progress, userName }) {
  const hi = userName ? `${userName}, ` : '';
  const list = [];
  if (mood === 'sleep') list.push(`${pet.sound} Z-z-z... Seni sog'indim! Bitta o'yin o'ynaymizmi?`);
  if (giftAvailable) list.push(`${pet.sound} ${hi}bugungi sovg'ang tayyor! Meni bos 🎁`);
  if (streak > 0) list.push(`${streak} kunlik seriya! Olovni o'chirma 🔥`);
  if (nextTitle) list.push(`"${nextTitle.name}" unvoniga ${nextTitle.min - progress.points} ochko qoldi!`);
  const m = Object.keys(progress.mistakes || {}).length;
  if (m > 0) list.push(`${m} ta so'z takrorlashni kutyapti. Birga mashq qilamizmi?`);
  list.push(`${pet.sound} Men ${name}. Bugun nima o'rganamiz?`);
  return list;
}

export default function PetFab({ onOpen }) {
  const ctx = useProgress();
  const { settings, inGame, petStage, mood } = ctx;
  const [bubble, setBubble] = useState(null);
  const pet = settings.pet ? PETS[settings.pet.type] : null;
  const list = useMemo(
    () => (pet ? phrases({ ...ctx, pet, name: settings.pet.name, userName: settings.userName }) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pet, settings.pet?.name, ctx.mood, ctx.giftAvailable, ctx.streak],
  );

  useEffect(() => {
    if (!list.length || inGame) return;
    setBubble(list[0]);
    const hide = setTimeout(() => setBubble(null), 5500);
    return () => clearTimeout(hide);
  }, [list, inGame]);

  if (!pet || inGame) return null;

  return (
    <div className="pointer-events-none fixed bottom-4 right-3 z-40 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            className="pointer-events-auto relative max-w-[230px] rounded-2xl rounded-br-md bg-brand px-3.5 py-2.5 text-sm font-semibold leading-snug text-white shadow-lift"
            role="status"
          >
            {bubble}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        type="button"
        onClick={onOpen}
        className="pointer-events-auto grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-brand-light shadow-lift transition hover:-translate-y-1 active:translate-y-0 dark:border-night-card dark:bg-night-line"
        aria-label={`${settings.pet.name} bilan gaplashish`}
      >
        <PetAvatar type={settings.pet.type} stage={petStage} mood={mood} size={54} className="animate-floaty" />
      </button>
    </div>
  );
}
