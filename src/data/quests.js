// Kunlik vazifalar: har kuni 3 ta, sanaga qarab almashadi
import { WORDS } from './words/index.js';

const POOL = {
  games2: { key: 'games', icon: '🎮', text: "2 ta o'yinni tugat", target: 2, reward: 20 },
  games4: { key: 'games', icon: '🎮', text: "4 ta o'yinni tugat", target: 4, reward: 35 },
  correct20: { key: 'correct', icon: '✅', text: "20 ta to'g'ri javob ber", target: 20, reward: 25 },
  correct40: { key: 'correct', icon: '✅', text: "40 ta to'g'ri javob ber", target: 40, reward: 40 },
  runner300: { key: 'runner', icon: '🏃', text: "So'z yo'lida 300 ochko to'pla", target: 300, reward: 30 },
  goals3: { key: 'goals', icon: '⚽', text: '"Gol!" o\'yinida 3 ta gol ur', target: 3, reward: 30 },
};

const SETS = [
  ['games2', 'correct20', 'runner300'],
  ['games2', 'correct20', 'goals3'],
  ['games4', 'correct40', 'runner300'],
  ['games2', 'correct40', 'goals3'],
];

function dayNumber(day) {
  const [y, m, d] = day.split('-').map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function questsFor(day) {
  return SETS[dayNumber(day) % SETS.length].map((id) => ({ id, ...POOL[id] }));
}

export function emptyDaily(day) {
  return { day, games: 0, correct: 0, runner: 0, goals: 0, claimed: {} };
}

/** Kun so'zi: har kuni bitta, hamma uchun bir xil */
export function wordOfDay(day) {
  const n = dayNumber(day);
  return WORDS[(n * 7919) % WORDS.length];
}
