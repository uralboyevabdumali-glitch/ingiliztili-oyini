import { Suspense, lazy, useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import Header from './components/Header.jsx';
import TabNav, { TABS } from './components/TabNav.jsx';
import PetFab from './components/PetFab.jsx';
import Modal from './components/Modal.jsx';
import PetChooser from './components/PetChooser.jsx';
import AwardModal from './components/AwardModal.jsx';
import useProgress from './hooks/useProgress.js';
import { readStorage, writeStorage } from './hooks/useLocalStorage.js';

const PAGES = {
  games: lazy(() => import('./pages/Games.jsx')),
  dictionary: lazy(() => import('./pages/Dictionary.jsx')),
  flashcards: lazy(() => import('./pages/Flashcards.jsx')),
  translator: lazy(() => import('./pages/Translator.jsx')),
  pet: lazy(() => import('./pages/Pet.jsx')),
  achievements: lazy(() => import('./pages/Achievements.jsx')),
  stats: lazy(() => import('./pages/Stats.jsx')),
};

function Loader() {
  return (
    <div className="grid h-64 place-items-center" role="status" aria-label="Yuklanmoqda">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-soft border-t-brand" />
    </div>
  );
}

export default function App() {
  const { settings, setSettings, inGame } = useProgress();
  const [tab, setTab] = useState(() => {
    const t = readStorage('sozlik:tab', 'games');
    return TABS.some((x) => x.id === t) ? t : 'games';
  });
  const [gameRequest, setGameRequest] = useState(null);
  const [navKey, setNavKey] = useState(0);

  useEffect(() => {
    writeStorage('sozlik:tab', tab);
    window.scrollTo({ top: 0 });
  }, [tab]);

  const go = (id, request = null) => {
    setGameRequest(request);
    setTab(id);
    setNavKey((k) => k + 1);
  };

  const Page = PAGES[tab];

  return (
    <MotionConfig reducedMotion="user">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90] focus:rounded-xl focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        Asosiy qismga o'tish
      </a>
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-paper/85 backdrop-blur-md dark:border-night-line dark:bg-night/85">
        <Header onTitleClick={() => go('achievements')} />
        {!inGame && <TabNav tab={tab} onChange={(id) => go(id)} />}
      </header>

      <main id="main" className="mx-auto max-w-6xl px-3 pb-28 pt-4 sm:px-5 sm:pt-6">
        <Suspense fallback={<Loader />}>
          <Page key={navKey} go={go} request={gameRequest} clearRequest={() => setGameRequest(null)} />
        </Suspense>
      </main>

      <PetFab onOpen={() => go('pet')} />
      <AwardModal />

      <Modal open={!settings.pet} dismissable={false} labelledBy="welcome-title">
        <h2 id="welcome-title" className="font-display text-xl font-extrabold">
          So'zlikka xush kelibsan! 👋
        </h2>
        <p className="mb-4 mt-1 text-sm text-ink-soft dark:text-night-soft">
          Ingliz tilini o'yin orqali birga o'rganamiz. Avval o'zingga hamroh tanla — u har doim yoningda bo'ladi.
        </p>
        <PetChooser
          onDone={({ type, name, userName }) => setSettings((s) => ({ ...s, pet: { type, name }, userName }))}
        />
      </Modal>
    </MotionConfig>
  );
}
