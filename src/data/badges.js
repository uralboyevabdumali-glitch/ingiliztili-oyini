// Unvonlar, yorliqlar va sertifikatlar

export const CLASSIC_GAMES = ['quiz', 'match', 'scramble', 'fill'];

export const TITLES = [
  { icon: '🥚', name: 'Tuxumcha', min: 0 },
  { icon: '🐣', name: "Jo'jacha", min: 100 },
  { icon: '🔍', name: 'Izlanuvchi', min: 350 },
  { icon: '📘', name: 'Talaba', min: 800 },
  { icon: '💡', name: 'Bilimdon', min: 1600 },
  { icon: '🎓', name: 'Ustoz', min: 3000 },
  { icon: '🧠', name: 'Professor', min: 5500 },
  { icon: '👑', name: 'Afsona', min: 9000 },
];

export function titleIndex(points) {
  let i = 0;
  TITLES.forEach((t, idx) => {
    if (points >= t.min) i = idx;
  });
  return i;
}

/** Hamrohning o'sish bosqichi unvonga bog'liq: tuxum → chaqaloq → yosh → olim → qirol */
export const PET_STAGES = ['Tuxum', 'Chaqaloq', 'Yosh', 'Olim', 'Qirol'];
export function petStage(titleIdx) {
  if (titleIdx <= 0) return 0;
  if (titleIdx <= 2) return 1;
  if (titleIdx <= 4) return 2;
  if (titleIdx <= 6) return 3;
  return 4;
}

const passed = (p, game, level) => (p.levels?.[game]?.[level] || 0) > 0;
const anyPassed = (p, level) => CLASSIC_GAMES.some((g) => passed(p, g, level));

export function totalStars(p) {
  return CLASSIC_GAMES.reduce((s, g) => s + Object.values(p.levels?.[g] || {}).reduce((a, b) => a + b, 0), 0);
}

export const BADGES = [
  { id: 'first_step', icon: '👣', name: 'Birinchi qadam', desc: '1 ta o\'yinni tugat', check: (p) => p.gamesPlayed >= 1 },
  { id: 'diligent', icon: '📚', name: 'Tirishqoq', desc: '10 ta o\'yin o\'yna', check: (p) => p.gamesPlayed >= 10 },
  { id: 'tireless', icon: '🏋️', name: 'Charchamas', desc: '50 ta o\'yin o\'yna', check: (p) => p.gamesPlayed >= 50 },
  { id: 'perfect', icon: '💎', name: 'Mukammal', desc: 'Birorta darajadan 3 yulduz ol', check: (p) => CLASSIC_GAMES.some((g) => Object.values(p.levels?.[g] || {}).some((s) => s >= 3)) },
  { id: 'star_hunter', icon: '⭐', name: 'Yulduz ovchisi', desc: '30 ta yulduz to\'pla', check: (p) => totalStars(p) >= 30 },
  { id: 'star_sky', icon: '🌌', name: 'Yulduzlar osmoni', desc: '90 ta yulduz to\'pla', check: (p) => totalStars(p) >= 90 },
  { id: 'hot', icon: '🔥', name: 'Qizib ketdi', desc: '5 ta ketma-ket to\'g\'ri javob', check: (p) => p.bestCombo >= 5 },
  { id: 'unstoppable', icon: '⚡', name: "To'xtatib bo'lmas", desc: '10 ta ketma-ket to\'g\'ri javob', check: (p) => p.bestCombo >= 10 },
  { id: 'fire_start', icon: '🕯️', name: 'Olovli boshlanish', desc: '3 kunlik seriya', check: (p) => p.bestStreak >= 3 },
  { id: 'week_fire', icon: '🎇', name: 'Haftalik olov', desc: '7 kunlik seriya', check: (p) => p.bestStreak >= 7 },
  { id: 'month_legend', icon: '🌋', name: 'Oylik afsona', desc: '30 kunlik seriya', check: (p) => p.bestStreak >= 30 },
  { id: 'b2_border', icon: '🚧', name: 'B2 chegarasi', desc: '7-darajani o\'t', check: (p) => anyPassed(p, 7) },
  { id: 'finalist', icon: '🏁', name: 'Finalchi', desc: 'C2 finalini o\'t', check: (p) => anyPassed(p, 10) },
  { id: 'c2_champion', icon: '🏆', name: 'C2 chempioni', desc: '4 ta o\'yinning hammasida finalni o\'t', check: (p) => CLASSIC_GAMES.every((g) => passed(p, g, 10)) },
  { id: 'sniper', icon: '🎯', name: 'Mergan', desc: '7+ darajadagi juftliklarni xatosiz top', check: (p) => !!p.flags?.sniper },
  { id: 'collector', icon: '🧺', name: "So'z yig'uvchi", desc: '30 ta so\'zni o\'rgan', check: (p) => Object.keys(p.learned || {}).length >= 30 },
  { id: 'dict_master', icon: '📖', name: "Lug'at ustasi", desc: '100 ta so\'zni o\'rgan', check: (p) => Object.keys(p.learned || {}).length >= 100 },
  { id: 'mistake_cure', icon: '🩹', name: 'Xatolar davosi', desc: '10 ta xatoni tuzat', check: (p) => p.fixedMistakes >= 10 },
  { id: 'translator', icon: '🌐', name: 'Tarjimon', desc: '5 ta tarjima qil', check: (p) => p.translations >= 5 },
  { id: 'pet_friend', icon: '💬', name: "Hamrohning do'sti", desc: 'Hamroh bilan 10 marta suhbatlash', check: (p) => p.chats >= 10 },
  { id: 'night_owl', icon: '🌙', name: "Tungi qo'riqchi", desc: '22:00 dan keyin o\'yna', check: (p) => !!p.flags?.nightOwl },
  { id: 'fast_feet', icon: '👟', name: 'Tez oyoq', desc: "So'z yo'lida 500 ochko", check: (p) => p.runner.best >= 500 },
  { id: 'marathon', icon: '🏃', name: 'Marafonchi', desc: "So'z yo'lida 2000 ochko", check: (p) => p.runner.best >= 2000 },
  { id: 'road_master', icon: '🛣️', name: "Yo'l ustasi", desc: "So'z yo'lida C1 ga yet", check: (p) => p.runner.bestLevel >= 4 },
  { id: 'gatekeeper', icon: '🚪', name: 'Darvozabon', desc: "Bitta yugurishda 20 ta so'z", check: (p) => p.runner.bestWords >= 20 },
  { id: 'first_goal', icon: '⚽', name: 'Birinchi gol', desc: '"Gol!" o\'yinida gol ur', check: (p) => p.football.goals >= 1 },
  { id: 'hat_trick', icon: '🎩', name: 'Hat-trik', desc: 'Bir o\'yinda 3 ta gol ur', check: (p) => p.football.bestGoals >= 3 },
  { id: 'clean_sheet', icon: '🧤', name: "Quruq o'yin", desc: 'Birorta gol o\'tkazmay o\'yinni tugat', check: (p) => !!p.flags?.cleanSheet },
  { id: 'world_champ', icon: '🌍', name: 'Jahon chempioni', desc: 'Jahon chempionati finalini yut', check: (p) => !!p.football.won?.[10] },
];

/** Sertifikat: barcha 4 klassik o'yinda shu CEFR darajasidagi hamma darajalar o'tilgan bo'lsa */
export const CERT_LEVELS = {
  A1: [1, 2],
  A2: [3, 4],
  B1: [5, 6],
  B2: [7],
  C1: [8, 9],
  C2: [10],
};

export const CERTS = Object.keys(CERT_LEVELS).map((cefr) => ({
  id: cefr,
  name: `${cefr} sertifikati`,
  check: (p) => CLASSIC_GAMES.every((g) => CERT_LEVELS[cefr].every((l) => passed(p, g, l))),
}));

export function certCode(cefr) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `SZ-${cefr}-${s}`;
}

export const GAME_INFO = {
  quiz: { name: 'Viktorina', desc: "Tarjimani top, inglizchasini top, tinglab top" },
  match: { name: 'Juftlikni top', desc: "Inglizcha so'zni tarjimasi bilan juftla" },
  scramble: { name: "So'z yig'ish", desc: "Aralashgan harflardan so'zni yig'" },
  fill: { name: "Gapni to'ldir", desc: "Gapdagi bo'sh joyga mos so'zni qo'y" },
};
