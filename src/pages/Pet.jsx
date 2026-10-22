import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Gift, RefreshCw, Send, Square, Trash2 } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { PETS } from '../data/pets.js';
import { PET_STAGES, TITLES } from '../data/badges.js';
import { askAI, aiErrorMessage } from '../lib/ai.js';
import { QUICK_PROMPTS, buildPetSystem, greeting } from '../lib/petPrompt.js';
import PetAvatar from '../components/PetAvatar.jsx';
import PetChooser from '../components/PetChooser.jsx';
import Modal from '../components/Modal.jsx';
import Button from '../components/Button.jsx';
import Card, { SectionTitle } from '../components/Card.jsx';
import Confetti from '../components/Confetti.jsx';

const MOOD_TEXT = { happy: 'Xursand 😊', normal: 'Seni kutyapti', sleep: 'Uxlab qolgan 💤' };
// Har bir o'sish bosqichiga mos minimal unvon indeksi: tuxum 0, chaqaloq 1, yosh 3, olim 5, qirol 7
const STAGE_TITLE = [0, 1, 3, 5, 7];

/** **qalin** matnni ajratib ko'rsatadigan juda sodda renderer */
function RichText({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => (p.startsWith('**') && p.endsWith('**') ? <strong key={i}>{p.slice(2, -2)}</strong> : <span key={i}>{p}</span>));
}

function Chat() {
  const ctx = useProgress();
  const { settings, petStage, mood, incCounter } = ctx;
  const pet = PETS[settings.pet?.type] || PETS.owl;
  const [messages, setMessages] = useLocalStorage('sozlik:chat', []);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(null); // joriy javob matni
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const listRef = useRef(null);
  const hello = useMemo(() => greeting(ctx), [settings.pet?.type, settings.pet?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = listRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, streaming, error]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = async (text) => {
    const content = text.trim().slice(0, 1000);
    if (!content || streaming != null) return;
    setError(null);
    setInput('');
    const history = [...messages, { role: 'user', content }].slice(-24);
    setMessages(history);
    setStreaming('');
    const ac = new AbortController();
    abortRef.current = ac;
    let partial = '';
    try {
      const full = await askAI(history, {
        system: buildPetSystem(ctx),
        signal: ac.signal,
        maxTokens: 500,
        onText: (t) => {
          partial = t;
          setStreaming(t);
        },
      });
      setMessages([...history, { role: 'assistant', content: full }]);
      incCounter('chats');
    } catch (e) {
      if (e?.name === 'AbortError') {
        // To'xtatilgan javobning qismini saqlaymiz
        if (partial && !ac.cleared) setMessages([...history, { role: 'assistant', content: partial + ' …' }]);
      } else {
        setError(aiErrorMessage(e));
      }
    } finally {
      setStreaming(null);
      abortRef.current = null;
    }
  };

  const bubble = (role, content, key) => (
    <motion.div
      key={key}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-end gap-2 ${role === 'user' ? 'justify-end' : ''}`}
    >
      {role !== 'user' && <PetAvatar type={pet.id} stage={Math.max(1, petStage)} mood="happy" size={30} className="mb-0.5 shrink-0" />}
      <div
        className={`max-w-[82%] whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2.5 text-[15px] leading-relaxed ${
          role === 'user'
            ? 'rounded-br-md bg-brand text-white'
            : 'rounded-bl-md bg-brand-light text-ink dark:bg-[#22325A] dark:text-slate-100'
        }`}
      >
        <RichText text={content} />
      </div>
    </motion.div>
  );

  return (
    <Card className="flex flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-night-line">
        <h2 className="font-display text-base font-extrabold">{settings.pet?.name} bilan suhbat</h2>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (abortRef.current) {
                abortRef.current.cleared = true;
                abortRef.current.abort();
              }
              setMessages([]);
              setError(null);
            }}
            aria-label="Suhbatni tozalash"
          >
            <Trash2 size={16} /> Tozalash
          </Button>
        )}
      </div>
      <div ref={listRef} className="h-[380px] space-y-3 overflow-y-auto p-4" aria-live="polite">
        {bubble('assistant', hello, 'hello')}
        {messages.map((m, i) => bubble(m.role, m.content, i))}
        {streaming != null &&
          (streaming ? (
            bubble('assistant', streaming, 'stream')
          ) : (
            <div className="flex items-center gap-2 pl-10 text-sm font-semibold text-ink-mute dark:text-night-soft">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-brand" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </span>
              {settings.pet?.name} o'ylayapti...
            </div>
          ))}
        {error && (
          <div className="flex items-start gap-2 rounded-2xl border border-rose/30 bg-rose-light px-3.5 py-2.5 text-sm font-semibold text-rose-dark dark:bg-rose/15 dark:text-red-200" role="alert">
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold hover:bg-white/60 dark:hover:bg-white/10"
              onClick={() => {
                const last = [...messages].reverse().find((m) => m.role === 'user');
                if (last) {
                  setMessages(messages.slice(0, messages.lastIndexOf(last)));
                  setTimeout(() => send(last.content), 0);
                }
              }}
            >
              <RefreshCw size={13} /> Qayta
            </button>
          </div>
        )}
      </div>
      <div className="no-scrollbar flex gap-1.5 overflow-x-auto border-t border-slate-100 px-3 pt-3 dark:border-night-line">
        {QUICK_PROMPTS.map((q) => (
          <button
            key={q}
            type="button"
            disabled={streaming != null}
            onClick={() => send(q)}
            className="h-9 shrink-0 rounded-xl bg-brand-light px-3 text-sm font-bold text-brand-dark transition hover:bg-brand hover:text-white disabled:opacity-50 dark:bg-brand/20 dark:text-blue-100"
          >
            {q}
          </button>
        ))}
      </div>
      <form
        className="flex gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
          placeholder="Xabar yoz (o'zbekcha yoki inglizcha)..."
          aria-label="Xabar"
          className="h-12 min-w-0 flex-1 rounded-2xl border-2 border-slate-200 bg-white px-4 outline-none placeholder:text-slate-400 focus:border-brand dark:border-night-line dark:bg-night"
        />
        {streaming != null ? (
          <Button variant="red" size="icon" className="h-12 w-12" onClick={() => abortRef.current?.abort()} aria-label="To'xtatish">
            <Square size={18} className="fill-white" />
          </Button>
        ) : (
          <Button type="submit" size="icon" className="h-12 w-12" disabled={!input.trim()} aria-label="Yuborish">
            <Send size={19} />
          </Button>
        )}
      </form>
    </Card>
  );
}

export default function Pet() {
  const { settings, setSettings, petStage, mood, titleIdx, progress, giftAvailable, claimGift } = useProgress();
  const [choosing, setChoosing] = useState(false);
  const [gift, setGift] = useState(0);
  const pet = PETS[settings.pet?.type] || PETS.owl;
  const nextStageTitle = TITLES[STAGE_TITLE[petStage + 1]];

  if (!settings.pet) return null;

  return (
    <div>
      <Confetti fire={gift || null} />
      <SectionTitle title="Hamroh" subtitle="U sen bilan birga o'sadi va o'rganadi" />
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card className="p-5 text-center">
          <div className="relative mx-auto grid h-44 w-44 place-items-center rounded-full bg-brand-light dark:bg-brand/15">
            <PetAvatar type={pet.id} stage={petStage} mood={mood} size={160} className={mood === 'sleep' ? '' : 'animate-floaty'} title={`${settings.pet.name}, ${pet.kind}`} />
          </div>
          <h2 className="mt-3 font-display text-2xl font-extrabold">{settings.pet.name}</h2>
          <p className="text-sm font-semibold text-ink-mute dark:text-night-soft">
            {pet.kind} · "{pet.sound}"
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-1.5 text-xs font-bold">
            <span className="rounded-lg bg-brand-light px-2.5 py-1 text-brand-dark dark:bg-brand/20 dark:text-blue-100">Bosqich: {PET_STAGES[petStage]}</span>
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-ink-soft dark:bg-white/10 dark:text-night-soft">{MOOD_TEXT[mood]}</span>
          </div>

          <div className="mt-4 flex items-center justify-between gap-1">
            {PET_STAGES.map((s, i) => (
              <div key={s} className="flex flex-col items-center gap-1">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${i <= petStage ? 'bg-brand-light dark:bg-brand/20' : 'bg-slate-100 opacity-50 grayscale dark:bg-white/5'}`}>
                  <PetAvatar type={pet.id} stage={i} size={36} />
                </div>
                <span className="text-[10px] font-bold text-ink-mute dark:text-night-soft">{s}</span>
              </div>
            ))}
          </div>
          {nextStageTitle && (
            <p className="mt-3 text-xs font-semibold text-ink-mute dark:text-night-soft">
              Keyingi bosqich "{nextStageTitle.name}" unvonida — yana {Math.max(0, nextStageTitle.min - progress.points)} ochko
            </p>
          )}

          <div className="mt-4 grid gap-2">
            <Button
              variant="gold"
              disabled={!giftAvailable}
              onClick={() => {
                if (claimGift()) setGift((g) => g + 1);
              }}
            >
              <Gift size={18} /> {giftAvailable ? "Kunlik sovg'a: +25 ochko" : "Sovg'a olindi — ertaga yana!"}
            </Button>
            <Button variant="soft" onClick={() => setChoosing(true)}>
              Hamrohni almashtirish
            </Button>
          </div>
          <AnimatePresence>
            {gift > 0 && !giftAvailable && (
              <motion.p initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-2 text-sm font-bold text-leaf-dark dark:text-green-300">
                {pet.sound} Mana senga +25 ochko!
              </motion.p>
            )}
          </AnimatePresence>
          <p className="sr-only">Unvon darajasi: {titleIdx + 1}</p>
        </Card>
        <Chat />
      </div>

      <Modal open={choosing} onClose={() => setChoosing(false)} title="Hamrohni almashtirish">
        <PetChooser
          initialType={settings.pet.type}
          initialName={settings.pet.name}
          userName={settings.userName}
          submitLabel="Saqlash"
          onDone={({ type, name, userName }) => {
            setSettings((s) => ({ ...s, pet: { type, name }, userName }));
            setChoosing(false);
          }}
        />
      </Modal>
    </div>
  );
}
