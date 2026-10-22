import { Suspense, lazy, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import { GAME_INFO } from '../data/badges.js';
import { WORD_BY_ID, shuffle } from '../lib/words.js';
import Card, { SectionTitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import LevelMap from '../components/LevelMap.jsx';
import ClassicGame from '../games/ClassicGame.jsx';
import Hub from './GamesHub.jsx';

const WordRunner = lazy(() => import('../games/WordRunner.jsx'));
const PenaltyGame = lazy(() => import('../games/PenaltyGame.jsx'));

export function mistakeWords(progress, n = 10) {
  return shuffle(
    Object.entries(progress.mistakes)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n * 2)
      .map(([id]) => WORD_BY_ID.get(id))
      .filter(Boolean),
  ).slice(0, n);
}

function Levels({ game, onBack, onPick }) {
  const { progress, unlockedLevel } = useProgress();
  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
        <ArrowLeft size={17} /> O'yinlar
      </Button>
      <SectionTitle title={GAME_INFO[game].name} subtitle={GAME_INFO[game].desc} />
      <Card className="p-4 sm:p-5">
        <LevelMap stars={progress.levels[game]} unlocked={unlockedLevel(game)} onPick={onPick} />
        <ul className="mt-4 space-y-1 text-xs font-semibold text-ink-mute dark:text-night-soft">
          <li>• 1–2: A1 · 3–4: A2 · 5–6: B1 · 7: B2 · 8–9: C1 · FINAL: C2</li>
          <li>• Keyingi darajani ochish uchun kamida 70% to'g'ri javob kerak</li>
          <li>• Yulduzlar: 100% → ⭐⭐⭐ · 85% → ⭐⭐ · 70% → ⭐</li>
        </ul>
      </Card>
    </div>
  );
}

function Loading() {
  return (
    <div className="grid h-64 place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
    </div>
  );
}

export default function Games({ request, clearRequest }) {
  const { progress } = useProgress();
  const [state, setState] = useState({ view: 'hub' });

  const open = (s) => {
    if (s.view === 'practice') s = { ...s, words: mistakeWords(progress) };
    setState({ ...s, key: Date.now() });
  };

  useEffect(() => {
    if (request?.practice) {
      open({ view: 'practice' });
      clearRequest();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [request]);

  const hub = () => setState({ view: 'hub' });

  let content;
  if (state.view === 'levels') {
    content = <Levels game={state.game} onBack={hub} onPick={(level) => open({ view: 'play', game: state.game, level })} />;
  } else if (state.view === 'play') {
    content = (
      <ClassicGame
        key={state.key}
        game={state.game}
        level={state.level}
        onExit={() => open({ view: 'levels', game: state.game })}
        onReplay={() => open({ view: 'play', game: state.game, level: state.level })}
        onLevel={(level) => open({ view: 'play', game: state.game, level })}
      />
    );
  } else if (state.view === 'practice') {
    content = state.words.length ? (
      <ClassicGame key={state.key} game="quiz" level={1} practiceWords={state.words} onExit={hub} onReplay={() => open({ view: 'practice' })} onLevel={hub} />
    ) : (
      <Card className="mx-auto max-w-md p-6 text-center">
        <div className="text-5xl">✨</div>
        <p className="mt-2 font-bold">Xatolar ro'yxati bo'sh. Zo'r!</p>
        <Button className="mt-4" onClick={hub}>
          O'yinlarga qaytish
        </Button>
      </Card>
    );
  } else if (state.view === 'runner') {
    content = <WordRunner key={state.key} onExit={hub} />;
  } else if (state.view === 'penalty') {
    content = <PenaltyGame key={state.key} onExit={hub} />;
  } else {
    content = <Hub open={open} />;
  }

  return (
    <Suspense fallback={<Loading />}>
      <motion.div key={state.view + (state.key || '')} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {content}
      </motion.div>
    </Suspense>
  );
}
