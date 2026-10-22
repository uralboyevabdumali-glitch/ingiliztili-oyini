import { BADGES, PET_STAGES } from '../data/badges.js';
import { PETS } from '../data/pets.js';
import { BY_CEFR, WORD_BY_ID, LEVEL_CEFR, sample } from './words.js';

/** O'quvchining taxminiy darajasi: eng yuqori ochilgan klassik daraja bo'yicha */
function learnerCefr(ctx) {
  const max = Math.max(...ctx.classicGames.map((g) => ctx.unlockedLevel(g)));
  return LEVEL_CEFR[max - 1];
}

/** Hamroh uchun tizim prompti: xarakter + o'quvchining progressi */
export function buildPetSystem(ctx) {
  const { settings, progress, title, nextTitle, streak, stars, petStage } = ctx;
  const pet = PETS[settings.pet?.type] || PETS.owl;
  const name = settings.pet?.name || pet.defaultName;
  const nextBadge = BADGES.find((b) => !progress.badges[b.id]);
  const mistakes = Object.entries(progress.mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([id, n]) => {
      const w = WORD_BY_ID.get(id);
      return w ? `${w.en} — ${w.uz} (${n} marta xato)` : null;
    })
    .filter(Boolean);
  const cefr = learnerCefr(ctx);
  const fresh = sample(
    BY_CEFR[cefr].filter((w) => !progress.learned[w.id]),
    6,
  ).map((w) => `${w.en} — ${w.uz} (misol: ${w.example})`);

  return [
    `Sen "So'zlik" ingliz tili o'rganish ilovasidagi hamroh hayvonchasan: ${pet.kind}, isming ${name}. ${pet.persona}`,
    `O'quvchi${settings.userName ? ` ismi ${settings.userName}` : ''}. U o'zbek tilida so'zlashadi va ingliz tilini o'rganmoqda.`,
    '',
    'QOIDALAR:',
    "- Doim o'zbek tilida (lotin yozuvida), \"sen\" deb, do'stona va qisqa javob ber: 2–5 gap. Ro'yxat kerak bo'lsa ham qisqa bo'lsin.",
    "- Inglizcha so'z va gaplarni ajratib ko'rsat, kerak bo'lsa tarjimasini qavsda yoz.",
    "- So'z o'rgatganda: so'z, tarjima va bitta sodda misol gap.",
    "- Mini-test so'ralsa: bitta-bitta savol ber (masalan, 3 ta variantli), javobni kut, keyin to'g'ri-noto'g'riligini ayt va keyingisiga o't.",
    "- O'quvchi inglizcha yozsa, xatolarini muloyimlik bilan tuzat: to'g'ri variantni ko'rsat va qisqacha sababini ayt.",
    "- \"Let's talk in English!\" desa — oddiy ingliz tilida (o'quvchi darajasiga mos) suhbatlash, har javob oxirida qavs ichida qisqa o'zbekcha izoh yoki tuzatish ber.",
    "- Ilova haqida so'rasa, quyidagi ma'lumotlardan foydalan. Ma'lumot yo'q narsani o'ylab topma.",
    "- Mavzudan juda chetga chiqsa, muloyimlik bilan ingliz tiliga qaytar. Shaxsiy ma'lumot so'rama.",
    `- Gapda ba'zan o'z ovozingni ishlat: "${pet.sound}".`,
    '',
    "O'QUVCHINING PROGRESSI:",
    `- Unvon: ${title.icon} ${title.name}, ochko: ${progress.points}.`,
    nextTitle ? `- Keyingi unvon: ${nextTitle.icon} ${nextTitle.name}, unga ${nextTitle.min - progress.points} ochko qoldi.` : '- Eng yuqori unvonga (Afsona) yetgan!',
    `- Hamrohning o'sish bosqichi: ${PET_STAGES[petStage]}.`,
    `- Kunlik seriya: ${streak} kun (eng uzun: ${progress.bestStreak}). Yulduzlar: ${stars}/120. O'yinlar soni: ${progress.gamesPlayed}.`,
    `- O'rgangan so'zlari: ${Object.keys(progress.learned).length} ta. Taxminiy darajasi: ${cefr}.`,
    `- Yorliqlar: ${Object.keys(progress.badges).length}/${BADGES.length}.` +
      (nextBadge ? ` Keyingi yorliq: "${nextBadge.name}" — ${nextBadge.desc}.` : ' Hamma yorliqlar olingan!'),
    `- "So'z yo'li" rekordi: ${progress.runner.best} ochko. "Gol!" turniri: ${Object.keys(progress.football.won).length}/10 bosqich yutilgan, jami ${progress.football.goals} gol.`,
    mistakes.length ? `- Ko'p xato qiladigan so'zlari: ${mistakes.join('; ')}.` : "- Hozircha xatolar ro'yxati bo'sh.",
    '',
    `YANGI SO'Z O'RGATISH UCHUN (shu ro'yxatdan tanla, o'zing so'z o'ylab topma):`,
    ...fresh.map((f) => `- ${f}`),
  ].join('\n');
}

export const QUICK_PROMPTS = [
  "Menga 3 ta yangi so'z o'rgat",
  "Mini-test o'tkaz",
  'Keyingi yorliqqa nima qoldi?',
  "Let's talk in English!",
];

export function greeting(ctx) {
  const pet = PETS[ctx.settings.pet?.type] || PETS.owl;
  const name = ctx.settings.pet?.name || pet.defaultName;
  const who = ctx.settings.userName ? `, ${ctx.settings.userName}` : '';
  if (ctx.mood === 'sleep') return `${pet.sound} Z-z... Oh, keldingmi${who}! Seni juda sog'indim. Bugun birga nimadir o'rganamizmi?`;
  return `${pet.sound} Salom${who}! Men ${name}. Senga so'z o'rgatishim, mini-test o'tkazishim yoki inglizcha gaplaringni tekshirishim mumkin. Nimadan boshlaymiz?`;
}

