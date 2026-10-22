import { useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowLeftRight, Check, Copy, History, Languages, Square, Trash2, Volume2, X } from 'lucide-react';
import useProgress from '../hooks/useProgress.js';
import useLocalStorage from '../hooks/useLocalStorage.js';
import { speak } from '../hooks/useSpeech.js';
import { askAI, aiErrorMessage } from '../lib/ai.js';
import Card, { SectionTitle } from '../components/Card.jsx';
import Button from '../components/Button.jsx';

const MAX = 1000;
const LANG = { uz: "O'zbekcha", en: 'Inglizcha' };

function systemPrompt(from) {
  const src = from === 'uz' ? "o'zbek" : 'ingliz';
  const dst = from === 'uz' ? 'ingliz' : "o'zbek (lotin yozuvida)";
  return [
    `Sen tajribali tarjimonsan. Foydalanuvchi matnini ${src} tilidan ${dst} tiliga tabiiy va aniq tarjima qil.`,
    'Javob formati qat\'iy shunday bo\'lsin:',
    '1) Avval faqat tarjimaning o\'zi (izohsiz, qo\'shtirnoqsiz).',
    "2) So'ng alohida qatorda uchta chiziqcha: ---",
    "3) Keyin tarjimadagi muhim so'z yoki iboradan foydalanilgan 2 ta qisqa misol gap, har biri yangi qatorda, formatda: English sentence — O'zbekcha tarjimasi",
    "Boshqa hech narsa yozma. Agar matn ma'nosiz bo'lsa ham, imkon qadar tarjima qil.",
  ].join('\n');
}

function parse(text) {
  const [main, rest = ''] = text.split(/\n\s*-{3,}\s*\n?/);
  const examples = rest
    .split('\n')
    .map((l) => l.replace(/^\s*[-*\d.)]+\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 3);
  return { translation: (main || '').trim(), examples };
}

export default function Translator() {
  const { incCounter } = useProgress();
  const [from, setFrom] = useState('uz');
  const [src, setSrc] = useState('');
  const [out, setOut] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useLocalStorage('sozlik:translations', []);
  const abortRef = useRef(null);
  const to = from === 'uz' ? 'en' : 'uz';
  const { translation, examples } = parse(out);

  useEffect(() => () => abortRef.current?.abort(), []);

  const translate = async () => {
    const text = src.trim();
    if (!text || busy) return;
    setError(null);
    setOut('');
    setBusy(true);
    const ac = new AbortController();
    abortRef.current = ac;
    try {
      const full = await askAI([{ role: 'user', content: text }], {
        system: systemPrompt(from),
        signal: ac.signal,
        maxTokens: 900,
        onText: (t) => setOut(t),
      });
      const parsed = parse(full);
      setHistory((h) => [{ from, src: text, out: full, at: Date.now() }, ...h.filter((x) => !(x.src === text && x.from === from))].slice(0, 12));
      if (parsed.translation) incCounter('translations');
    } catch (e) {
      const msg = aiErrorMessage(e);
      if (msg) setError(msg);
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  };

  const swap = () => {
    abortRef.current?.abort();
    setFrom(to);
    if (translation) setSrc(translation.slice(0, MAX));
    setOut('');
    setError(null);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard ruxsati yo'q */
    }
  };

  const englishText = from === 'en' ? src : translation;

  return (
    <div className="space-y-4">
      <SectionTitle title="Tarjimon" subtitle="O'zbekcha ⇄ inglizcha, AI yordamida" />

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 dark:border-night-line">
          <span className="flex-1 text-sm font-extrabold">{LANG[from]}</span>
          <Button variant="soft" size="icon" onClick={swap} aria-label="Yo'nalishni almashtirish">
            <ArrowLeftRight size={18} />
          </Button>
          <span className="flex-1 text-right text-sm font-extrabold">{LANG[to]}</span>
        </div>
        <div className="grid md:grid-cols-2">
          <div className="relative border-b border-slate-100 p-4 dark:border-night-line md:border-b-0 md:border-r">
            <textarea
              value={src}
              onChange={(e) => setSrc(e.target.value.slice(0, MAX))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) translate();
              }}
              rows={6}
              maxLength={MAX}
              lang={from}
              placeholder={from === 'uz' ? 'Matnni kiriting...' : 'Enter text...'}
              aria-label={`${LANG[from]} matn`}
              className="w-full resize-none bg-transparent text-lg leading-relaxed outline-none placeholder:text-slate-400"
            />
            <div className="mt-2 flex items-center gap-2">
              {src && (
                <button
                  type="button"
                  onClick={() => {
                    setSrc('');
                    setOut('');
                  }}
                  className="grid h-9 w-9 place-items-center rounded-xl text-ink-mute hover:bg-slate-100 dark:hover:bg-white/5"
                  aria-label="Matnni tozalash"
                >
                  <X size={18} />
                </button>
              )}
              {from === 'en' && src && (
                <button
                  type="button"
                  onClick={() => speak(src)}
                  className="grid h-9 w-9 place-items-center rounded-xl text-brand hover:bg-brand-light dark:text-blue-300 dark:hover:bg-brand/20"
                  aria-label="Inglizcha matnni tinglash"
                >
                  <Volume2 size={18} />
                </button>
              )}
              <span className={`ml-auto text-xs font-semibold ${src.length >= MAX ? 'text-rose' : 'text-ink-mute dark:text-night-soft'}`}>
                {src.length}/{MAX}
              </span>
            </div>
          </div>
          <div className="bg-slate-50/70 p-4 dark:bg-white/[.03]" aria-live="polite">
            <div className={`min-h-[150px] whitespace-pre-wrap text-lg leading-relaxed ${translation ? '' : 'text-slate-400'}`} lang={to}>
              {translation || (busy ? 'Tarjima qilinmoqda...' : 'Tarjima shu yerda chiqadi')}
              {busy && <span className="ml-0.5 inline-block h-5 w-1.5 animate-pulse rounded bg-brand align-middle" />}
            </div>
            {translation && !busy && (
              <div className="mt-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={copy}
                  className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-ink-soft hover:bg-slate-100 dark:text-night-soft dark:hover:bg-white/5"
                >
                  {copied ? <Check size={17} className="text-leaf" /> : <Copy size={17} />} {copied ? 'Nusxalandi' : 'Nusxa olish'}
                </button>
                {to === 'en' && (
                  <button
                    type="button"
                    onClick={() => speak(englishText)}
                    className="flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-sm font-bold text-brand hover:bg-brand-light dark:text-blue-300 dark:hover:bg-brand/20"
                  >
                    <Volume2 size={17} /> Tinglash
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 border-t border-slate-100 p-3 dark:border-night-line">
          <span className="mr-auto hidden text-xs text-ink-mute dark:text-night-soft sm:inline">Ctrl + Enter — tarjima qilish</span>
          {busy ? (
            <Button variant="red" onClick={() => abortRef.current?.abort()}>
              <Square size={16} className="fill-white" /> To'xtatish
            </Button>
          ) : (
            <Button onClick={translate} disabled={!src.trim()}>
              <Languages size={18} /> Tarjima qilish
            </Button>
          )}
        </div>
      </Card>

      {error && (
        <div className="flex items-start gap-2 rounded-2xl border border-rose/30 bg-rose-light p-4 text-sm font-semibold text-rose-dark dark:bg-rose/15 dark:text-red-200" role="alert">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {examples.length > 0 && (
        <Card className="p-5">
          <h2 className="mb-2 font-display text-base font-extrabold">Misol gaplar</h2>
          <ul className="space-y-2">
            {examples.map((ex, i) => {
              const en = ex.split(/\s[—–-]\s/)[0];
              return (
                <li key={i} className="flex items-start gap-2 text-[15px]">
                  <button
                    type="button"
                    onClick={() => speak(en)}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-brand hover:bg-brand-light dark:text-blue-300 dark:hover:bg-brand/20"
                    aria-label="Misolni tinglash"
                  >
                    <Volume2 size={16} />
                  </button>
                  <span className="pt-1">{ex}</span>
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {history.length > 0 && (
        <Card className="p-5">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-display text-base font-extrabold">
              <History size={18} /> Oxirgi tarjimalar
            </h2>
            <Button variant="ghost" size="sm" onClick={() => setHistory([])}>
              <Trash2 size={15} /> Tozalash
            </Button>
          </div>
          <ul className="divide-y divide-slate-100 dark:divide-night-line">
            {history.map((h) => (
              <li key={h.at}>
                <button
                  type="button"
                  onClick={() => {
                    abortRef.current?.abort();
                    setFrom(h.from);
                    setSrc(h.src);
                    setOut(h.out);
                    setError(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full rounded-xl px-2 py-2.5 text-left transition hover:bg-slate-50 dark:hover:bg-white/5"
                >
                  <span className="block truncate text-sm font-bold">{h.src}</span>
                  <span className="block truncate text-sm text-ink-mute dark:text-night-soft">
                    {h.from === 'uz' ? 'UZ → EN' : 'EN → UZ'} · {parse(h.out).translation}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
