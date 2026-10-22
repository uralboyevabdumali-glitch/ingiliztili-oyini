import { createContext, createElement, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import useLocalStorage from './useLocalStorage.js';
import { BADGES, CERTS, CLASSIC_GAMES, TITLES, certCode, petStage, titleIndex, totalStars } from '../data/badges.js';
import { dayKey, daysBetween, starsFor } from '../lib/words.js';
import { emptyDaily, questsFor } from '../data/quests.js';

export const INITIAL_PROGRESS = {
  points: 0,
  streak: 0,
  bestStreak: 0,
  lastPlayDay: null,
  gamesPlayed: 0,
  bestCombo: 0,
  levels: { quiz: {}, match: {}, scramble: {}, fill: {} },
  mistakes: {},
  fixedMistakes: 0,
  learned: {},
  known: {},
  runner: { best: 0, bestLevel: 0, bestWords: 0, coins: 0, runs: 0 },
  football: { unlocked: 1, won: {}, goals: 0, bestGoals: 0, matches: 0 },
  translations: 0,
  chats: 0,
  flags: {},
  badges: {},
  certs: {},
  titleSeen: 0,
  lastGiftDay: null,
  daily: null,
};

/** Bugungi kunlik hisoblagichlar (kun almashsa — yangidan) */
export function dailyOf(p, today = dayKey()) {
  return p.daily?.day === today ? p.daily : emptyDaily(today);
}

function bumpDaily(p, fn) {
  const d = dailyOf(p);
  return { ...p, daily: { ...d, ...fn(d) } };
}

const INITIAL_SETTINGS = { userName: '', pet: null, dark: false, lastVisit: null };

const ProgressContext = createContext(null);

export function unlockedLevel(progress, game) {
  const lv = progress.levels?.[game] || {};
  let n = 1;
  while (n < 10 && (lv[n] || 0) > 0) n++;
  return n;
}

function markGameDone(p) {
  const today = dayKey();
  let streak = p.streak;
  if (p.lastPlayDay !== today) streak = daysBetween(p.lastPlayDay, today) === 1 ? p.streak + 1 : 1;
  const h = new Date().getHours();
  return {
    ...bumpDaily(p, (d) => ({ games: d.games + 1 })),
    gamesPlayed: p.gamesPlayed + 1,
    streak,
    bestStreak: Math.max(p.bestStreak, streak),
    lastPlayDay: today,
    flags: { ...p.flags, nightOwl: p.flags?.nightOwl || h >= 22 || h < 4 },
  };
}

export function ProgressProvider({ children }) {
  const [progress, setProgress] = useLocalStorage('sozlik:progress', INITIAL_PROGRESS);
  const [settings, setSettings] = useLocalStorage('sozlik:settings', INITIAL_SETTINGS);
  const [awardQueue, setAwardQueue] = useState([]);
  const [inGame, setInGame] = useState(false);
  const today = dayKey();

  // Oldingi tashrif sanasini eslab qolamiz (hamroh kayfiyati uchun), so'ng bugungi sanani yozamiz
  const prevVisit = useRef(settings.lastVisit);
  useEffect(() => {
    if (settings.lastVisit !== today) setSettings((s) => ({ ...s, lastVisit: today }));
  }, [today, settings.lastVisit, setSettings]);

  // Dark mode
  useEffect(() => {
    document.documentElement.classList.toggle('dark', !!settings.dark);
  }, [settings.dark]);

  // Yangi yutuqlarni aniqlash
  useEffect(() => {
    const newBadges = BADGES.filter((b) => !progress.badges?.[b.id] && b.check(progress));
    const newCerts = CERTS.filter((c) => !progress.certs?.[c.id] && c.check(progress));
    const tIdx = titleIndex(progress.points);
    const titleUp = tIdx > (progress.titleSeen || 0);
    if (!newBadges.length && !newCerts.length && !titleUp && tIdx === (progress.titleSeen || 0)) return;
    const now = new Date().toISOString();
    setProgress((p) => {
      const badges = { ...p.badges };
      newBadges.forEach((b) => (badges[b.id] = now));
      const certs = { ...p.certs };
      newCerts.forEach((c) => (certs[c.id] = { date: now, code: certCode(c.id) }));
      return { ...p, badges, certs, titleSeen: tIdx };
    });
    const items = [
      ...(titleUp ? [{ kind: 'title', id: tIdx }] : []),
      ...newBadges.map((b) => ({ kind: 'badge', id: b.id })),
      ...newCerts.map((c) => ({ kind: 'cert', id: c.id })),
    ];
    if (items.length) setAwardQueue((q) => [...q, ...items]);
  }, [progress, setProgress]);

  const answer = useCallback(
    (word, correct, { points = 0, combo = 0 } = {}) => {
      setProgress((p) => {
        const mistakes = { ...p.mistakes };
        let fixedMistakes = p.fixedMistakes;
        let learned = p.learned;
        if (correct) {
          if (mistakes[word.id]) {
            delete mistakes[word.id];
            fixedMistakes += 1;
          }
          if (!learned[word.id]) learned = { ...learned, [word.id]: 1 };
        } else {
          mistakes[word.id] = (mistakes[word.id] || 0) + 1;
        }
        const base = correct ? bumpDaily(p, (d) => ({ correct: d.correct + 1 })) : p;
        return { ...base, points: p.points + points, bestCombo: Math.max(p.bestCombo, combo), mistakes, fixedMistakes, learned };
      });
    },
    [setProgress],
  );

  const finishClassic = useCallback(
    ({ game, level, correct, total, flawless = false }) => {
      const stars = starsFor(correct, total);
      const prev = progress.levels?.[game]?.[level] || 0;
      setProgress((p) => {
        const next = markGameDone(p);
        const lv = { ...(next.levels[game] || {}) };
        lv[level] = Math.max(lv[level] || 0, stars);
        const flags = { ...next.flags };
        if (game === 'match' && flawless && level >= 7) flags.sniper = true;
        return { ...next, levels: { ...next.levels, [game]: lv }, flags };
      });
      return { stars, newlyUnlocked: stars > 0 && prev === 0 && level < 10 ? level + 1 : null };
    },
    [progress, setProgress],
  );

  const finishPractice = useCallback(() => setProgress((p) => markGameDone(p)), [setProgress]);

  const finishRunner = useCallback(
    ({ score, coins, words, levelIdx }) => {
      setProgress((p) => {
        const next = bumpDaily(markGameDone(p), (d) => ({ runner: Math.max(d.runner, score) }));
        const r = next.runner;
        return {
          ...next,
          points: next.points + Math.round(score / 5),
          runner: {
            best: Math.max(r.best, score),
            bestLevel: Math.max(r.bestLevel, levelIdx),
            bestWords: Math.max(r.bestWords, words),
            coins: r.coins + coins,
            runs: r.runs + 1,
          },
        };
      });
    },
    [setProgress],
  );

  const finishFootball = useCallback(
    ({ stage, won, goalsFor, goalsAgainst }) => {
      setProgress((p) => {
        const next = bumpDaily(markGameDone(p), (d) => ({ goals: d.goals + goalsFor }));
        const f = next.football;
        return {
          ...next,
          points: next.points + (won ? 20 + stage * 5 : 0),
          flags: { ...next.flags, cleanSheet: next.flags.cleanSheet || goalsAgainst === 0 },
          football: {
            unlocked: won ? Math.max(f.unlocked, Math.min(10, stage + 1)) : f.unlocked,
            won: won ? { ...f.won, [stage]: true } : f.won,
            goals: f.goals + goalsFor,
            bestGoals: Math.max(f.bestGoals, goalsFor),
            matches: f.matches + 1,
          },
        };
      });
    },
    [setProgress],
  );

  const markKnown = useCallback(
    (word) =>
      setProgress((p) => ({
        ...p,
        known: { ...p.known, [word.id]: 1 },
        learned: p.learned[word.id] ? p.learned : { ...p.learned, [word.id]: 1 },
      })),
    [setProgress],
  );

  const markReview = useCallback(
    (word) =>
      setProgress((p) => {
        const known = { ...p.known };
        delete known[word.id];
        return { ...p, known, mistakes: { ...p.mistakes, [word.id]: (p.mistakes[word.id] || 0) + 1 } };
      }),
    [setProgress],
  );

  const addPoints = useCallback((n) => setProgress((p) => ({ ...p, points: p.points + n })), [setProgress]);
  const incCounter = useCallback((key) => setProgress((p) => ({ ...p, [key]: (p[key] || 0) + 1 })), [setProgress]);

  /** Bajarilgan kunlik vazifa mukofotini olish */
  const claimQuest = useCallback(
    (id) => {
      const q = questsFor(today).find((x) => x.id === id);
      const d = dailyOf(progress, today);
      if (!q || d.claimed[id] || d[q.key] < q.target) return false;
      setProgress((p) => {
        const dd = dailyOf(p, today);
        if (dd.claimed[id]) return p;
        return { ...p, points: p.points + q.reward, daily: { ...dd, claimed: { ...dd.claimed, [id]: true } } };
      });
      return true;
    },
    [progress, today, setProgress],
  );

  const claimGift = useCallback(() => {
    if (progress.lastGiftDay === today) return false;
    setProgress((p) => ({ ...p, points: p.points + 25, lastGiftDay: today }));
    return true;
  }, [progress.lastGiftDay, today, setProgress]);

  const resetProgress = useCallback(() => {
    setProgress(INITIAL_PROGRESS);
    setAwardQueue([]);
  }, [setProgress]);

  const shiftAward = useCallback(() => setAwardQueue((q) => q.slice(1)), []);

  const value = useMemo(() => {
    const tIdx = titleIndex(progress.points);
    const streak = daysBetween(progress.lastPlayDay, today) <= 1 ? progress.streak : 0;
    const playedToday = progress.lastPlayDay === today;
    const away = daysBetween(prevVisit.current, today);
    const mood = playedToday ? 'happy' : away > 2 && away !== Infinity ? 'sleep' : 'normal';
    return {
      progress,
      settings,
      setSettings,
      today,
      streak,
      titleIdx: tIdx,
      title: TITLES[tIdx],
      nextTitle: TITLES[tIdx + 1] || null,
      stars: totalStars(progress),
      petStage: petStage(tIdx),
      mood,
      giftAvailable: progress.lastGiftDay !== today,
      answer,
      finishClassic,
      finishRunner,
      finishPractice,
      finishFootball,
      markKnown,
      markReview,
      addPoints,
      incCounter,
      claimQuest,
      daily: dailyOf(progress, today),
      quests: questsFor(today),
      claimGift,
      resetProgress,
      awardQueue,
      shiftAward,
      inGame,
      setInGame,
      unlockedLevel: (game) => unlockedLevel(progress, game),
      classicGames: CLASSIC_GAMES,
    };
  }, [progress, settings, setSettings, today, answer, finishClassic, finishPractice, finishRunner, finishFootball, markKnown, markReview, addPoints, incCounter, claimQuest, claimGift, resetProgress, awardQueue, shiftAward, inGame]);

  return createElement(ProgressContext.Provider, { value }, children);
}

export default function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error('useProgress ProgressProvider ichida ishlatilishi kerak');
  return ctx;
}
