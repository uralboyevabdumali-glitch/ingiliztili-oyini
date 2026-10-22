import { WORDS, CEFR_LEVELS } from '../data/words/index.js';

export const WORD_BY_ID = new Map(WORDS.map((w) => [w.id, w]));

export const BY_CEFR = CEFR_LEVELS.reduce((acc, l) => {
  acc[l] = WORDS.filter((w) => w.cefr === l);
  return acc;
}, {});

/** Klassik o'yinlardagi 10 ta daraja va ularning CEFR darajasi */
export const LEVEL_CEFR = ['A1', 'A1', 'A2', 'A2', 'B1', 'B1', 'B2', 'C1', 'C1', 'C2'];
export const levelCefr = (level) => LEVEL_CEFR[level - 1];

export const CEFR_STYLE = {
  A1: 'bg-leaf-light text-leaf-dark ring-leaf/30 dark:bg-leaf/20 dark:text-green-300',
  A2: 'bg-leaf-light text-leaf-dark ring-leaf/30 dark:bg-leaf/20 dark:text-green-300',
  B1: 'bg-brand-light text-brand-dark ring-brand/30 dark:bg-brand/25 dark:text-blue-200',
  B2: 'bg-grape-light text-grape-dark ring-grape/30 dark:bg-grape/25 dark:text-violet-200',
  C1: 'bg-tang-light text-tang-dark ring-tang/30 dark:bg-tang/25 dark:text-orange-200',
  C2: 'bg-rose-light text-rose-dark ring-rose/30 dark:bg-rose/25 dark:text-red-200',
};
export const CEFR_HEX = { A1: '#16A34A', A2: '#16A34A', B1: '#2D55F0', B2: '#7C3AED', C1: '#EA580C', C2: '#EF4444' };

export function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function sample(arr, n) {
  return shuffle(arr).slice(0, n);
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const norm = (s) => s.trim().toLowerCase();

/** To'g'ri so'z uchun shu CEFR darajasidan, inglizchasi ham o'zbekchasi ham farqli bo'lgan noto'g'ri variantlar */
export function distractors(word, n = 3, pool = BY_CEFR[word.cefr]) {
  const out = [];
  const seenEn = new Set([norm(word.en)]);
  const seenUz = new Set([norm(word.uz)]);
  for (const w of shuffle(pool)) {
    if (out.length >= n) break;
    if (seenEn.has(norm(w.en)) || seenUz.has(norm(w.uz))) continue;
    seenEn.add(norm(w.en));
    seenUz.add(norm(w.uz));
    out.push(w);
  }
  if (out.length < n && pool !== WORDS) return out.concat(distractors(word, n - out.length, WORDS).filter((w) => !out.includes(w)));
  return out;
}

/** 4 ta variant: to'g'ri + 3 ta noto'g'ri, aralashtirilgan */
export function options(word, n = 4) {
  return shuffle([word, ...distractors(word, n - 1)]);
}

export const isPlainWord = (w) => /^[a-z]+$/i.test(w.en);
export const isPhrase = (w) => /\s/.test(w.en.trim());

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function wordRegex(en) {
  return new RegExp(`\\b${escapeRe(en)}\\b`, 'i');
}

/** Misol gapni so'zdan oldingi, so'zning o'zi va keyingi qismlarga ajratadi */
export function splitExample(word) {
  const m = word.example.match(wordRegex(word.en));
  if (!m) return [word.example, '', ''];
  return [word.example.slice(0, m.index), m[0], word.example.slice(m.index + m[0].length)];
}

export function starsFor(correct, total) {
  const p = total ? correct / total : 0;
  if (p >= 0.999) return 3;
  if (p >= 0.85) return 2;
  if (p >= 0.7) return 1;
  return 0;
}

export function dayKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function daysBetween(a, b) {
  if (!a || !b) return Infinity;
  const [ay, am, ad] = a.split('-').map(Number);
  const [by, bm, bd] = b.split('-').map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

export function formatDate(iso) {
  try {
    const d = iso ? new Date(iso) : new Date();
    return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
  } catch {
    return '';
  }
}
