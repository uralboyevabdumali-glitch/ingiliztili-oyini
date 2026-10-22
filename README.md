# So'zlik — ingliz tilini o'yin bilan o'rgan

O'zbek tilida so'zlashuvchilar uchun ingliz tili o'rganish veb-ilovasi: 1698 ta so'z (A1–C2, 8 mavzu),
4 ta klassik o'yin, "So'z yo'li" yugurish o'yini, "Gol!" penalti o'yini, kartochkalar, lug'at,
AI tarjimon va gaplashadigan hamroh-hayvoncha.

**Texnologiyalar:** React 18 + Vite, Tailwind CSS, framer-motion, lucide-react, Canvas API, Web Speech API,
Web Audio API. Progress brauzerning `localStorage`'ida saqlanadi. AI — Anthropic Claude, serverless funksiya orqali.

## O'rnatish

Node.js 18+ kerak.

```bash
npm install
```

## Ishga tushirish

```bash
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
npm run preview  # build'ni lokal ko'rish (AI endpoint'siz)
```

AI'siz ham hamma narsa ishlaydi: o'yinlar, lug'at, kartochkalar, yutuqlar va natijalar to'liq oflayn ishlaydi.
Faqat **Tarjimon** va **Hamroh chati** AI talab qiladi — kalit bo'lmasa ular chiroyli xato xabarini ko'rsatadi.

## .env sozlamalari

`.env.example` faylidan nusxa oling:

```bash
cp .env.example .env
```

| O'zgaruvchi | Majburiy | Tavsif |
|---|---|---|
| `ANTHROPIC_API_KEY` | ha (AI uchun) | Anthropic API kaliti. Faqat serverda ishlatiladi. |
| `ANTHROPIC_MODEL` | yo'q | Model nomi. Standart: `claude-sonnet-5-5`. Arzonroq: `claude-haiku-5-5`. |

`npm run dev` paytida Vite `.env` faylini o'qiydi va `/api/chat` so'rovlarini `api/chat.js` funksiyasiga
yo'naltiradi — ya'ni lokalda ham AI ishlaydi. API kalit hech qachon brauzerga yuborilmaydi.

## Deploy

### Vercel

1. Loyihani GitHub'ga yuklang va Vercel'da import qiling (framework: **Vite** avtomatik aniqlanadi).
2. **Settings → Environment Variables** bo'limida `ANTHROPIC_API_KEY` (va xohlasangiz `ANTHROPIC_MODEL`) qo'shing.
3. Deploy. `api/chat.js` avtomatik ravishda Edge funksiya sifatida `/api/chat` manzilida ishlaydi.

CLI orqali:

```bash
npm i -g vercel
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

### Netlify

1. Loyihani Netlify'ga ulang — `netlify.toml` build buyrug'i (`npm run build`), `dist` papkasi va
   funksiyalar papkasini o'zi ko'rsatadi.
2. **Site configuration → Environment variables** bo'limida `ANTHROPIC_API_KEY` qo'shing.
3. Deploy. `netlify/functions/chat.mjs` xuddi shu `api/chat.js` handlerini `/api/chat` manzilida ishga tushiradi.

## Loyiha tuzilmasi

```
api/chat.js                 – serverless AI endpoint (Anthropic SSE → oddiy matn oqimi)
netlify/functions/chat.mjs  – Netlify uchun o'ram
src/
  data/words/               – so'zlar bazasi (o'zgartirilmaydi)
  data/badges.js            – unvonlar, 29 ta yorliq, 6 ta sertifikat
  data/pets.js              – 5 ta hamroh va ularning xarakteri
  hooks/useLocalStorage.js  – localStorage bilan sinxron state (try/catch bilan)
  hooks/useProgress.js      – ochko, seriya, darajalar, xatolar, yutuqlar (Context)
  hooks/useSpeech.js        – talaffuz (en-US, rate 0.85)
  lib/ai.js                 – askAI(messages, { onText, signal }) — streaming
  lib/words.js              – so'z yordamchilari, CEFR, variantlar
  lib/sound.js              – Web Audio bilan sintez qilingan ovozlar
  lib/certificate.js        – sertifikatni canvas'da chizish va PNG yuklab olish
  lib/petPrompt.js          – hamroh uchun tizim prompti (progressni biladi)
  components/               – Header, TabNav, WordCard, LevelMap, Modal, Confetti, PetAvatar, PetFab, ...
  games/                    – Quiz, Match, Scramble, FillBlank, ClassicGame, WordRunner (+runnerEngine), PenaltyGame
  pages/                    – Games, Dictionary, Translator, Flashcards, Pet, Achievements, Stats
```

## Qoidalar qisqacha

- **Klassik o'yinlar:** 10 daraja (1–2 A1, 3–4 A2, 5–6 B1, 7 B2, 8–9 C1, 10 FINAL C2). Keyingi daraja 70% dan ochiladi.
  Yulduzlar: 100% → 3, 85% → 2, 70% → 1. Har to'g'ri javob: `4 + daraja` ochko, 3 tadan ortiq ketma-ket bo'lsa +3.
- **So'z yo'li:** ← → yo'lak, ↑/Probel sakrash, P/Esc pauza, telefonda surish. Har 6 ta to'g'ri so'zdan keyin
  daraja va tezlik oshadi. Natijaning 1/5 qismi umumiy ochkoga qo'shiladi.
- **Gol!:** 5 tadan zarba, durangda oltin gol. Himoya taymeri 7 s dan 4 s gacha qisqaradi. 10 bosqichli turnir.
- **Kunlik seriya:** har kuni kamida bitta o'yin tugatilsa oshadi, bir kun o'tkazib yuborilsa 0 ga tushadi.
- Sahifa yashirilganda o'yinlar avtomatik pauzaga tushadi. `prefers-reduced-motion` hurmat qilinadi.

## Ma'lumotlarni tozalash

"Natijalarim → Natijalarni tozalash" — progressni o'chiradi, hamroh va ism saqlanib qoladi.
Hammasini butunlay tozalash uchun brauzerda `sozlik:` bilan boshlanadigan localStorage kalitlarini o'chiring.
