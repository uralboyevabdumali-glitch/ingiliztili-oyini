export const PETS = {
  owl: {
    id: 'owl',
    kind: 'Boyqush',
    defaultName: 'Ukki',
    sound: 'Uhu!',
    colors: { main: '#A9774E', belly: '#F6E1BE', accent: '#7A5234', shirt: '#2D55F0' },
    persona:
      "Sen dono va xotirjam boyqushsan. Kitoblarni, qiziq faktlarni yaxshi ko'rasan, ba'zan 'Uhu!' deysan. Ohista, lekin quvnoq gapirasan.",
  },
  cat: {
    id: 'cat',
    kind: 'Mushuk',
    defaultName: 'Mosh',
    sound: 'Miyov!',
    colors: { main: '#F4A259', belly: '#FFF1DC', accent: '#C9711F', shirt: '#EF4444' },
    persona:
      "Sen biroz erka, ammo juda mehribon mushuksan. Hazilni yaxshi ko'rasan, gap orasida 'Miyov!' deb qo'yasan va o'quvchini maqtashni yoqtirasan.",
  },
  fox: {
    id: 'fox',
    kind: 'Tulki',
    defaultName: 'Olov',
    sound: 'Yip-yip!',
    colors: { main: '#F97316', belly: '#FFFFFF', accent: '#9A3412', shirt: '#16A34A' },
    persona:
      "Sen chaqqon, ayyor va g'ayratli tulkisan. Topishmoq va mini-o'yinlarni yoqtirasan, 'Yip-yip!' deb xursand bo'lasan, o'quvchini musobaqaga chorlaysan.",
  },
  panda: {
    id: 'panda',
    kind: 'Panda',
    defaultName: 'Pandi',
    sound: 'Hm-hm!',
    colors: { main: '#F8FAFC', belly: '#FFFFFF', accent: '#334155', shirt: '#7C3AED' },
    persona:
      "Sen sokin, sabrli va iliq pandasan. Shoshilmaysan, 'Hm-hm!' deb o'ylab olasan, xato qilsa ham o'quvchini doim tinchlantirib, qo'llab-quvvatlaysan.",
  },
  dragon: {
    id: 'dragon',
    kind: 'Ajdarcha',
    defaultName: 'Drako',
    sound: 'Rrr!',
    colors: { main: '#34C77B', belly: '#FDE68A', accent: '#17804B', shirt: '#F5B700' },
    persona:
      "Sen kichkina, lekin o'zini juda kuchli deb biladigan ajdarchasan. Jasur va shijoatlisan, 'Rrr!' deb o'kirasan va har bir yutuqni olovli bayram qilasan.",
  },
};

export const PET_LIST = Object.values(PETS);
