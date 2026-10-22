import { useMemo } from 'react';
import { motion } from 'framer-motion';
import Modal from './Modal.jsx';
import Confetti from './Confetti.jsx';
import Button from './Button.jsx';
import PetAvatar from './PetAvatar.jsx';
import useProgress from '../hooks/useProgress.js';
import { BADGES, TITLES } from '../data/badges.js';
import { PETS } from '../data/pets.js';

function describe(item) {
  if (item.kind === 'title') {
    const t = TITLES[item.id];
    return { icon: t.icon, head: 'Yangi unvon!', name: t.name, desc: `Endi sen — ${t.name}! Shunday davom et.` };
  }
  if (item.kind === 'cert') {
    return { icon: '📜', head: 'Yangi sertifikat!', name: `${item.id} sertifikati`, desc: "Barcha klassik o'yinlarda shu darajani o'tding. Uni \"Yutuqlar\" bo'limidan yuklab olishing mumkin." };
  }
  const b = BADGES.find((x) => x.id === item.id);
  return { icon: b.icon, head: 'Yangi yorliq!', name: b.name, desc: b.desc };
}

/** Navbatdagi yutuqlarni hamroh birma-bir topshiradi. O'yin paytida ko'rsatilmaydi. */
export default function AwardModal() {
  const { awardQueue, shiftAward, inGame, settings, petStage } = useProgress();
  const item = !inGame && settings.pet ? awardQueue[0] : null;
  const info = useMemo(() => (item ? describe(item) : null), [item]);
  const pet = settings.pet ? PETS[settings.pet.type] : null;
  const key = item ? `${item.kind}:${item.id}` : '';

  return (
    <>
      <Confetti fire={key} />
      <Modal open={!!item} onClose={shiftAward} labelledBy="award-title">
        {info && (
          <div key={key} className="text-center">
            <div className="relative mx-auto mb-1 flex h-32 items-end justify-center">
              <PetAvatar type={settings.pet.type} stage={petStage} mood="happy" size={110} />
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14, delay: 0.15 }}
                className="absolute right-[18%] top-0 grid h-16 w-16 place-items-center rounded-2xl bg-gold-light text-4xl shadow-card ring-4 ring-gold/40 dark:bg-gold/20"
                aria-hidden
              >
                {info.icon}
              </motion.div>
            </div>
            <p className="text-sm font-bold uppercase tracking-wider text-brand dark:text-blue-300">{info.head}</p>
            <h2 id="award-title" className="mt-1 font-display text-2xl font-extrabold">
              {info.name}
            </h2>
            <p className="mt-2 text-ink-soft dark:text-night-soft">{info.desc}</p>
            <p className="mt-3 rounded-2xl bg-brand-light px-4 py-2.5 text-sm font-semibold text-brand-dark dark:bg-brand/15 dark:text-blue-100">
              {pet.sound} {settings.pet.name}: "Tabriklayman! Buni sen uchun olib keldim!"
            </p>
            <Button className="mt-4 w-full" size="lg" onClick={shiftAward} data-autofocus>
              {awardQueue.length > 1 ? `Rahmat! Keyingisi (${awardQueue.length - 1})` : 'Rahmat!'}
            </Button>
          </div>
        )}
      </Modal>
    </>
  );
}
