import { getSurahByNumber, surahs } from './quran-data';

export type TajweedRule = 'ghunnah' | 'qalqalah' | 'madd' | 'ikhfa' | 'idgham' | 'normal';

export type AyahWordToken = {
  text: string;
  tajweed: TajweedRule;
  mutashabihKey?: string;
};

export type QuranAyah = {
  key: string;
  surah: number;
  ayah: number;
  page: number;
  text: string;
  tokens: AyahWordToken[];
};

const LOCAL_AYAHS: QuranAyah[] = [
  {
    key: '1:1',
    surah: 1,
    ayah: 1,
    page: 1,
    text: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    tokens: [
      { text: 'بِسْمِ', tajweed: 'normal' },
      { text: 'اللَّهِ', tajweed: 'madd', mutashabihKey: 'allah' },
      { text: 'الرَّحْمَٰنِ', tajweed: 'ghunnah', mutashabihKey: 'rahman' },
      { text: 'الرَّحِيمِ', tajweed: 'ghunnah', mutashabihKey: 'rahim' },
    ],
  },
  {
    key: '1:2',
    surah: 1,
    ayah: 2,
    page: 1,
    text: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    tokens: [
      { text: 'الْحَمْدُ', tajweed: 'qalqalah' },
      { text: 'لِلَّهِ', tajweed: 'madd', mutashabihKey: 'allah' },
      { text: 'رَبِّ', tajweed: 'ghunnah' },
      { text: 'الْعَالَمِينَ', tajweed: 'madd' },
    ],
  },
  {
    key: '1:3',
    surah: 1,
    ayah: 3,
    page: 1,
    text: 'الرَّحْمَٰنِ الرَّحِيمِ',
    tokens: [
      { text: 'الرَّحْمَٰنِ', tajweed: 'ghunnah', mutashabihKey: 'rahman' },
      { text: 'الرَّحِيمِ', tajweed: 'ghunnah', mutashabihKey: 'rahim' },
    ],
  },
  {
    key: '1:4',
    surah: 1,
    ayah: 4,
    page: 1,
    text: 'مَالِكِ يَوْمِ الدِّينِ',
    tokens: [
      { text: 'مَالِكِ', tajweed: 'madd' },
      { text: 'يَوْمِ', tajweed: 'normal' },
      { text: 'الدِّينِ', tajweed: 'ikhfa' },
    ],
  },
  {
    key: '1:5',
    surah: 1,
    ayah: 5,
    page: 1,
    text: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    tokens: [
      { text: 'إِيَّاكَ', tajweed: 'madd' },
      { text: 'نَعْبُدُ', tajweed: 'qalqalah' },
      { text: 'وَإِيَّاكَ', tajweed: 'madd' },
      { text: 'نَسْتَعِينُ', tajweed: 'ikhfa' },
    ],
  },
  {
    key: '1:6',
    surah: 1,
    ayah: 6,
    page: 1,
    text: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    tokens: [
      { text: 'اهْدِنَا', tajweed: 'idgham' },
      { text: 'الصِّرَاطَ', tajweed: 'normal' },
      { text: 'الْمُسْتَقِيمَ', tajweed: 'madd' },
    ],
  },
  {
    key: '1:7',
    surah: 1,
    ayah: 7,
    page: 1,
    text: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
    tokens: [
      { text: 'صِرَاطَ', tajweed: 'normal' },
      { text: 'الَّذِينَ', tajweed: 'idgham' },
      { text: 'أَنْعَمْتَ', tajweed: 'ikhfa' },
      { text: 'عَلَيْهِمْ', tajweed: 'madd' },
      { text: 'غَيْرِ', tajweed: 'normal' },
      { text: 'الْمَغْضُوبِ', tajweed: 'qalqalah' },
      { text: 'عَلَيْهِمْ', tajweed: 'madd' },
      { text: 'وَلَا', tajweed: 'madd' },
      { text: 'الضَّالِّينَ', tajweed: 'madd' },
    ],
  },
  {
    key: '112:1', surah: 112, ayah: 1, page: 604,
    text: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
    tokens: [
      { text: 'قُلْ', tajweed: 'qalqalah' },
      { text: 'هُوَ', tajweed: 'normal' },
      { text: 'اللَّهُ', tajweed: 'madd', mutashabihKey: 'allah' },
      { text: 'أَحَدٌ', tajweed: 'ghunnah' },
    ],
  },
  { key: '112:2', surah: 112, ayah: 2, page: 604, text: 'اللَّهُ الصَّمَدُ', tokens: [{ text: 'اللَّهُ', tajweed: 'madd', mutashabihKey: 'allah' }, { text: 'الصَّمَدُ', tajweed: 'qalqalah' }] },
  { key: '112:3', surah: 112, ayah: 3, page: 604, text: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', tokens: [{ text: 'لَمْ', tajweed: 'ghunnah' }, { text: 'يَلِدْ', tajweed: 'qalqalah' }, { text: 'وَلَمْ', tajweed: 'ghunnah' }, { text: 'يُولَدْ', tajweed: 'qalqalah' }] },
  { key: '112:4', surah: 112, ayah: 4, page: 604, text: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', tokens: [{ text: 'وَلَمْ', tajweed: 'ghunnah' }, { text: 'يَكُن', tajweed: 'ikhfa' }, { text: 'لَّهُ', tajweed: 'idgham' }, { text: 'كُفُوًا', tajweed: 'madd' }, { text: 'أَحَدٌ', tajweed: 'ghunnah' }] },
  { key: '113:1', surah: 113, ayah: 1, page: 604, text: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', tokens: [{ text: 'قُلْ', tajweed: 'qalqalah' }, { text: 'أَعُوذُ', tajweed: 'madd' }, { text: 'بِرَبِّ', tajweed: 'ghunnah' }, { text: 'الْفَلَقِ', tajweed: 'qalqalah' }] },
  { key: '113:2', surah: 113, ayah: 2, page: 604, text: 'مِن شَرِّ مَا خَلَقَ', tokens: [{ text: 'مِن', tajweed: 'ikhfa' }, { text: 'شَرِّ', tajweed: 'ghunnah' }, { text: 'مَا', tajweed: 'madd' }, { text: 'خَلَقَ', tajweed: 'qalqalah' }] },
  { key: '113:3', surah: 113, ayah: 3, page: 604, text: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', tokens: [{ text: 'وَمِن', tajweed: 'ikhfa' }, { text: 'شَرِّ', tajweed: 'ghunnah' }, { text: 'غَاسِقٍ', tajweed: 'madd' }, { text: 'إِذَا', tajweed: 'madd' }, { text: 'وَقَبَ', tajweed: 'qalqalah' }] },
  { key: '113:4', surah: 113, ayah: 4, page: 604, text: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', tokens: [{ text: 'وَمِن', tajweed: 'ikhfa' }, { text: 'شَرِّ', tajweed: 'ghunnah' }, { text: 'النَّفَّاثَاتِ', tajweed: 'ghunnah' }, { text: 'فِي', tajweed: 'madd' }, { text: 'الْعُقَدِ', tajweed: 'qalqalah' }] },
  { key: '113:5', surah: 113, ayah: 5, page: 604, text: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', tokens: [{ text: 'وَمِن', tajweed: 'ikhfa' }, { text: 'شَرِّ', tajweed: 'ghunnah' }, { text: 'حَاسِدٍ', tajweed: 'madd' }, { text: 'إِذَا', tajweed: 'madd' }, { text: 'حَسَدَ', tajweed: 'normal' }] },
  { key: '114:1', surah: 114, ayah: 1, page: 604, text: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', tokens: [{ text: 'قُلْ', tajweed: 'qalqalah' }, { text: 'أَعُوذُ', tajweed: 'madd' }, { text: 'بِرَبِّ', tajweed: 'ghunnah' }, { text: 'النَّاسِ', tajweed: 'ghunnah' }] },
  { key: '114:2', surah: 114, ayah: 2, page: 604, text: 'مَلِكِ النَّاسِ', tokens: [{ text: 'مَلِكِ', tajweed: 'normal' }, { text: 'النَّاسِ', tajweed: 'ghunnah' }] },
  { key: '114:3', surah: 114, ayah: 3, page: 604, text: 'إِلَٰهِ النَّاسِ', tokens: [{ text: 'إِلَٰهِ', tajweed: 'madd' }, { text: 'النَّاسِ', tajweed: 'ghunnah' }] },
  { key: '114:4', surah: 114, ayah: 4, page: 604, text: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', tokens: [{ text: 'مِن', tajweed: 'ikhfa' }, { text: 'شَرِّ', tajweed: 'ghunnah' }, { text: 'الْوَسْوَاسِ', tajweed: 'madd' }, { text: 'الْخَنَّاسِ', tajweed: 'ghunnah' }] },
  { key: '114:5', surah: 114, ayah: 5, page: 604, text: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', tokens: [{ text: 'الَّذِي', tajweed: 'idgham' }, { text: 'يُوَسْوِسُ', tajweed: 'normal' }, { text: 'فِي', tajweed: 'madd' }, { text: 'صُدُورِ', tajweed: 'madd' }, { text: 'النَّاسِ', tajweed: 'ghunnah' }] },
  { key: '114:6', surah: 114, ayah: 6, page: 604, text: 'مِنَ الْجِنَّةِ وَالنَّاسِ', tokens: [{ text: 'مِنَ', tajweed: 'ikhfa' }, { text: 'الْجِنَّةِ', tajweed: 'ghunnah' }, { text: 'وَالنَّاسِ', tajweed: 'ghunnah' }] },
];

const bySurah = new Map<number, QuranAyah[]>();
const byPage = new Map<number, QuranAyah[]>();

for (const ayah of LOCAL_AYAHS) {
  const surahItems = bySurah.get(ayah.surah) ?? [];
  surahItems.push(ayah);
  bySurah.set(ayah.surah, surahItems);

  const pageItems = byPage.get(ayah.page) ?? [];
  pageItems.push(ayah);
  byPage.set(ayah.page, pageItems);
}

export function getAyahsForSurah(surah: number): QuranAyah[] {
  return bySurah.get(surah) ?? [];
}

export function getAyahsForPage(page: number): QuranAyah[] {
  return byPage.get(page) ?? [];
}

export function getAyah(surah: number, ayah: number): QuranAyah | undefined {
  return getAyahsForSurah(surah).find(item => item.ayah === ayah);
}

export function getAvailableSurahs(): number[] {
  return Array.from(bySurah.keys()).sort((a, b) => a - b);
}

export function getAvailablePages(): number[] {
  return Array.from(byPage.keys()).sort((a, b) => a - b);
}

export function getSurahLabel(surahNumber: number): string {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) {
    return `Surah ${surahNumber}`;
  }

  return `${surah.number}. ${surah.name} • ${surah.nameArabic}`;
}

export function getDataCoverageMessage() {
  const availableSurahs = getAvailableSurahs();
  const first = availableSurahs[0];
  const last = availableSurahs[availableSurahs.length - 1];

  return `Local native dataset loaded for ${availableSurahs.length} surahs (${first}-${last}) while we wire full 114-surah ingestion from Supabase.`;
}

export function clampAyahToSurah(surahNumber: number, ayahNumber: number): number {
  const localAyahs = getAyahsForSurah(surahNumber);
  const surahMeta = getSurahByNumber(surahNumber);
  const maxAyah = localAyahs.length > 0 ? localAyahs[localAyahs.length - 1].ayah : surahMeta?.verses ?? 1;

  return Math.min(Math.max(ayahNumber, 1), maxAyah);
}

export function findMostRelevantPageForSurah(surahNumber: number): number {
  const firstAyah = getAyahsForSurah(surahNumber)[0];
  return firstAyah?.page ?? 1;
}

export function getMutashabihStats(ayahs: QuranAyah[]) {
  const counts = new Map<string, number>();

  ayahs.forEach(ayah => {
    ayah.tokens.forEach(token => {
      if (!token.mutashabihKey) {
        return;
      }

      counts.set(token.mutashabihKey, (counts.get(token.mutashabihKey) ?? 0) + 1);
    });
  });

  return counts;
}

export const totalLocalAyahs = LOCAL_AYAHS.length;
export const totalSurahCount = surahs.length;
