import { useState } from 'react';
import { BookCheck, Coins, Crown, Flame, Footprints, Star, Trash2, Volume2, Zap } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { CLASSIC_GAMES, GAME_INFO } from '../data/badges.js';
import { WORD_BY_ID } from '../lib/words.js';
import { speak } from '../hooks/useSpeech.js';
import Card, { SectionTitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import Modal from '../components/Modal.jsx';
import CefrBadge from '../components/CefrBadge.jsx';

function Tile({ icon: Icon, label, value, sub, tint }) {
  return (
    <Card className="p-4">
      <div className={`mb-2 grid h-9 w-9 place-items-center rounded-xl ${tint}`}>
        <Icon size={18} />
      </div>
      <div className="font-display text-2xl font-extrabold leading-none">{value}</div>
      <div className="mt-1 text-xs font-semibold text-ink-mute dark:text-night-soft">
        {label}
        {sub && <span className="block">{sub}</span>}
      </div>
    </Card>
  );
}

export default function Stats({ go }) {
  const { progress, streak, stars, resetProgress } = useProgress();
  const [confirm, setConfirm] = useState(false);
  const [shown, setShown] = useState(20);
  const finals = CLASSIC_GAMES.filter((g) => (progress.levels[g]?.[10] || 0) > 0).length;
  const mistakes = Object.entries(progress.mistakes)
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) => ({ w: WORD_BY_ID.get(id), n }))
    .filter((x) => x.w);

  return (
    <div className="space-y-6">
      <SectionTitle title="Natijalarim" subtitle="Sening yo'ling raqamlarda" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Tile icon={Zap} label="Ochko" value={progress.points} tint="bg-gold-light text-gold-dark dark:bg-gold/20 dark:text-gold" />
        <Tile icon={Flame} label="Kunlik seriya" value={streak} sub={`eng uzun: ${progress.bestStreak}`} tint="bg-rose-light text-rose dark:bg-rose/20" />
        <Tile icon={Star} label="Yulduzlar" value={`${stars}/120`} tint="bg-gold-light text-gold-dark dark:bg-gold/20 dark:text-gold" />
        <Tile icon={BookCheck} label="Bilgan so'zlar" value={Object.keys(progress.learned).length} tint="bg-leaf-light text-leaf dark:bg-leaf/20" />
        <Tile icon={Crown} label="Finallar" value={`${finals}/4`} tint="bg-grape-light text-grape dark:bg-grape/25 dark:text-violet-200" />
        <Tile icon={Footprints} label="Yugurish rekordi" value={progress.runner.best} sub={`${progress.runner.runs} ta yugurish`} tint="bg-brand-light text-brand dark:bg-brand/20 dark:text-blue-200" />
        <Tile icon={Coins} label="Tangalar" value={progress.runner.coins} tint="bg-gold-light text-gold-dark dark:bg-gold/20 dark:text-gold" />
        <Tile
          icon={() => <span className="text-base">⚽</span>}
          label="Futbol"
          value={`${Object.keys(progress.football.won).length}/10`}
          sub={`${progress.football.goals} gol · rekord ${progress.football.bestGoals}`}
          tint="bg-leaf-light dark:bg-leaf/20"
        />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-display text-lg font-extrabold">O'yinlar bo'yicha</h2>
        <ul className="space-y-4">
          {CLASSIC_GAMES.map((g) => {
            const lv = progress.levels[g] || {};
            const passed = Object.values(lv).filter((s) => s > 0).length;
            const st = Object.values(lv).reduce((a, b) => a + b, 0);
            return (
              <li key={g}>
                <div className="mb-1 flex items-center justify-between text-sm font-bold">
                  <span>{GAME_INFO[g].name}</span>
                  <span className="text-ink-mute dark:text-night-soft">
                    {passed}/10 daraja · ⭐ {st}/30
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10" role="progressbar" aria-valuenow={passed} aria-valuemin={0} aria-valuemax={10} aria-label={GAME_INFO[g].name}>
                  <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${passed * 10}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card className="p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-lg font-extrabold">
            Xatolar ro'yxati <span className="text-ink-mute dark:text-night-soft">{mistakes.length}</span>
          </h2>
          {mistakes.length > 0 && (
            <Button variant="red" size="sm" onClick={() => go('games', { practice: true })}>
              Xatolar bo'yicha mashq
            </Button>
          )}
        </div>
        {mistakes.length === 0 ? (
          <p className="rounded-2xl bg-leaf-light p-4 text-center text-sm font-semibold text-leaf-dark dark:bg-leaf/15 dark:text-green-200">
            Xatolar yo'q — zo'r! Xato qilgan so'zlaring shu yerda to'planadi, to'g'ri javob bergan sari ro'yxatdan chiqib boradi.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-slate-100 dark:divide-night-line">
              {mistakes.slice(0, shown).map(({ w, n }) => (
                <li key={w.id} className="flex items-center gap-2 py-2">
                  <button
                    type="button"
                    onClick={() => speak(w.en)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand hover:bg-brand-light dark:text-blue-300 dark:hover:bg-brand/20"
                    aria-label={`${w.en} — tinglash`}
                  >
                    <Volume2 size={16} />
                  </button>
                  <span className="min-w-0 flex-1 text-sm">
                    <b>{w.en}</b> <span className="text-ink-mute dark:text-night-soft">— {w.uz}</span>
                  </span>
                  <CefrBadge level={w.cefr} />
                  <span className="w-14 shrink-0 text-right text-xs font-extrabold text-rose">{n} marta</span>
                </li>
              ))}
            </ul>
            {mistakes.length > shown && (
              <div className="mt-3 flex justify-center">
                <Button variant="soft" size="sm" onClick={() => setShown((s) => s + 20)}>
                  Yana ko'rsatish ({mistakes.length - shown} ta qoldi)
                </Button>
              </div>
            )}
          </>
        )}
      </Card>

      <Card className="flex flex-wrap items-center gap-3 p-5">
        <div className="min-w-0 flex-1">
          <h2 className="font-bold">Natijalarni tozalash</h2>
          <p className="text-sm text-ink-mute dark:text-night-soft">Ochko, yulduz, yutuq va xatolar o'chadi. Hamroh va isming saqlanib qoladi.</p>
        </div>
        <Button variant="soft" size="sm" onClick={() => setConfirm(true)} className="text-rose">
          <Trash2 size={16} /> Tozalash
        </Button>
      </Card>

      <Modal open={confirm} onClose={() => setConfirm(false)} title="Rostdan ham tozalaysanmi?">
        <p className="text-ink-soft dark:text-night-soft">Barcha natijalar o'chib ketadi va buni qaytarib bo'lmaydi. Hamroh va isming saqlanadi.</p>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="soft" onClick={() => setConfirm(false)} data-autofocus>
            Bekor qilish
          </Button>
          <Button
            variant="red"
            onClick={() => {
              resetProgress();
              setConfirm(false);
            }}
          >
            Ha, tozalash
          </Button>
        </div>
      </Modal>
    </div>
  );
}
