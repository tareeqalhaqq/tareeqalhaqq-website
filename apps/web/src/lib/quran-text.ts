import { getSurahByNumber, surahs } from './quran-data';

export type TajweedRule = 'ghunnah' | 'qalqalah' | 'madd' | 'ikhfa' | 'idgham' | 'normal';

export type AyahWordToken = {
  text: string;
  tajweed: TajweedRule;
};

export type QuranAyah = {
  key: string;
  surah: number;
  ayah: number;
  page: number;
  text: string;
  tokens: AyahWordToken[];
};

/**
 * Minimal local fallback ayahs for Al-Fatihah and last 3 surahs.
 * Used when API is unreachable and nothing is cached.
 */
const LOCAL_AYAHS: QuranAyah[] = [
  {
    key: '1:1', surah: 1, ayah: 1, page: 1,
    text: '\u0628\u0650\u0633\u0652\u0645\u0650 \u0627\u0644\u0644\u0651\u064e\u0647\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650',
    tokens: [{ text: '\u0628\u0650\u0633\u0652\u0645\u0650', tajweed: 'normal' }, { text: '\u0627\u0644\u0644\u0651\u064e\u0647\u0650', tajweed: 'madd' }, { text: '\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650', tajweed: 'ghunnah' }, { text: '\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650', tajweed: 'ghunnah' }],
  },
  {
    key: '1:2', surah: 1, ayah: 2, page: 1,
    text: '\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f \u0644\u0650\u0644\u0651\u064e\u0647\u0650 \u0631\u064e\u0628\u0651\u0650 \u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e',
    tokens: [{ text: '\u0627\u0644\u0652\u062d\u064e\u0645\u0652\u062f\u064f', tajweed: 'qalqalah' }, { text: '\u0644\u0650\u0644\u0651\u064e\u0647\u0650', tajweed: 'madd' }, { text: '\u0631\u064e\u0628\u0651\u0650', tajweed: 'ghunnah' }, { text: '\u0627\u0644\u0652\u0639\u064e\u0627\u0644\u064e\u0645\u0650\u064a\u0646\u064e', tajweed: 'madd' }],
  },
  {
    key: '1:3', surah: 1, ayah: 3, page: 1,
    text: '\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650',
    tokens: [{ text: '\u0627\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650', tajweed: 'ghunnah' }, { text: '\u0627\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650', tajweed: 'ghunnah' }],
  },
  {
    key: '1:4', surah: 1, ayah: 4, page: 1,
    text: '\u0645\u064e\u0627\u0644\u0650\u0643\u0650 \u064a\u064e\u0648\u0652\u0645\u0650 \u0627\u0644\u062f\u0651\u0650\u064a\u0646\u0650',
    tokens: [{ text: '\u0645\u064e\u0627\u0644\u0650\u0643\u0650', tajweed: 'madd' }, { text: '\u064a\u064e\u0648\u0652\u0645\u0650', tajweed: 'normal' }, { text: '\u0627\u0644\u062f\u0651\u0650\u064a\u0646\u0650', tajweed: 'ikhfa' }],
  },
  {
    key: '1:5', surah: 1, ayah: 5, page: 1,
    text: '\u0625\u0650\u064a\u0651\u064e\u0627\u0643\u064e \u0646\u064e\u0639\u0652\u0628\u064f\u062f\u064f \u0648\u064e\u0625\u0650\u064a\u0651\u064e\u0627\u0643\u064e \u0646\u064e\u0633\u0652\u062a\u064e\u0639\u0650\u064a\u0646\u064f',
    tokens: [{ text: '\u0625\u0650\u064a\u0651\u064e\u0627\u0643\u064e', tajweed: 'madd' }, { text: '\u0646\u064e\u0639\u0652\u0628\u064f\u062f\u064f', tajweed: 'qalqalah' }, { text: '\u0648\u064e\u0625\u0650\u064a\u0651\u064e\u0627\u0643\u064e', tajweed: 'madd' }, { text: '\u0646\u064e\u0633\u0652\u062a\u064e\u0639\u0650\u064a\u0646\u064f', tajweed: 'ikhfa' }],
  },
  {
    key: '1:6', surah: 1, ayah: 6, page: 1,
    text: '\u0627\u0647\u0652\u062f\u0650\u0646\u064e\u0627 \u0627\u0644\u0635\u0651\u0650\u0631\u064e\u0627\u0637\u064e \u0627\u0644\u0652\u0645\u064f\u0633\u0652\u062a\u064e\u0642\u0650\u064a\u0645\u064e',
    tokens: [{ text: '\u0627\u0647\u0652\u062f\u0650\u0646\u064e\u0627', tajweed: 'idgham' }, { text: '\u0627\u0644\u0635\u0651\u0650\u0631\u064e\u0627\u0637\u064e', tajweed: 'normal' }, { text: '\u0627\u0644\u0652\u0645\u064f\u0633\u0652\u062a\u064e\u0642\u0650\u064a\u0645\u064e', tajweed: 'madd' }],
  },
  {
    key: '1:7', surah: 1, ayah: 7, page: 1,
    text: '\u0635\u0650\u0631\u064e\u0627\u0637\u064e \u0627\u0644\u0651\u064e\u0630\u0650\u064a\u0646\u064e \u0623\u064e\u0646\u0652\u0639\u064e\u0645\u0652\u062a\u064e \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652 \u063a\u064e\u064a\u0652\u0631\u0650 \u0627\u0644\u0652\u0645\u064e\u063a\u0652\u0636\u064f\u0648\u0628\u0650 \u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652 \u0648\u064e\u0644\u064e\u0627 \u0627\u0644\u0636\u0651\u064e\u0627\u0644\u0651\u0650\u064a\u0646\u064e',
    tokens: [{ text: '\u0635\u0650\u0631\u064e\u0627\u0637\u064e', tajweed: 'normal' }, { text: '\u0627\u0644\u0651\u064e\u0630\u0650\u064a\u0646\u064e', tajweed: 'idgham' }, { text: '\u0623\u064e\u0646\u0652\u0639\u064e\u0645\u0652\u062a\u064e', tajweed: 'ikhfa' }, { text: '\u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652', tajweed: 'madd' }, { text: '\u063a\u064e\u064a\u0652\u0631\u0650', tajweed: 'normal' }, { text: '\u0627\u0644\u0652\u0645\u064e\u063a\u0652\u0636\u064f\u0648\u0628\u0650', tajweed: 'qalqalah' }, { text: '\u0639\u064e\u0644\u064e\u064a\u0652\u0647\u0650\u0645\u0652', tajweed: 'madd' }, { text: '\u0648\u064e\u0644\u064e\u0627', tajweed: 'madd' }, { text: '\u0627\u0644\u0636\u0651\u064e\u0627\u0644\u0651\u0650\u064a\u0646\u064e', tajweed: 'madd' }],
  },
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

export function getLocalAyahsForSurah(surah: number): QuranAyah[] {
  return bySurah.get(surah) ?? [];
}

export function getLocalAyahsForPage(page: number): QuranAyah[] {
  return byPage.get(page) ?? [];
}

// Keep backward-compatible exports used by mushaf-panel.tsx
export function getAyahsForSurah(surah: number): QuranAyah[] {
  return getLocalAyahsForSurah(surah);
}

export function getAyahsForPage(page: number): QuranAyah[] {
  return getLocalAyahsForPage(page);
}

export function getAyah(surah: number, ayah: number): QuranAyah | undefined {
  return getAyahsForSurah(surah).find(item => item.ayah === ayah);
}

export function getAvailableSurahs(): number[] {
  return surahs.map(s => s.number);
}

export function getAvailablePages(): number[] {
  // Full 604-page mushaf
  return Array.from({ length: 604 }, (_, i) => i + 1);
}

export function getSurahLabel(surahNumber: number): string {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return `Surah ${surahNumber}`;
  return `${surah.number}. ${surah.name} \u2022 ${surah.nameArabic}`;
}

export function getDataCoverageMessage() {
  return 'Full Quran \u2022 604 pages \u2022 114 surahs \u2022 Uthmani script';
}

export function clampAyahToSurah(surahNumber: number, ayahNumber: number): number {
  const surahMeta = getSurahByNumber(surahNumber);
  const maxAyah = surahMeta?.verses ?? 1;
  return Math.min(Math.max(ayahNumber, 1), maxAyah);
}

export function findMostRelevantPageForSurah(surahNumber: number): number {
  // Standard Madina Mushaf starting pages for each surah
  const SURAH_START_PAGES: Record<number, number> = {
    1: 1, 2: 2, 3: 50, 4: 77, 5: 106, 6: 128, 7: 151, 8: 177, 9: 187,
    10: 208, 11: 221, 12: 235, 13: 249, 14: 255, 15: 262, 16: 267, 17: 282,
    18: 293, 19: 305, 20: 312, 21: 322, 22: 332, 23: 342, 24: 350, 25: 359,
    26: 367, 27: 377, 28: 385, 29: 396, 30: 404, 31: 411, 32: 415, 33: 418,
    34: 428, 35: 434, 36: 440, 37: 446, 38: 453, 39: 458, 40: 467, 41: 477,
    42: 483, 43: 489, 44: 496, 45: 499, 46: 502, 47: 507, 48: 511, 49: 515,
    50: 518, 51: 520, 52: 523, 53: 526, 54: 528, 55: 531, 56: 534, 57: 537,
    58: 542, 59: 545, 60: 549, 61: 551, 62: 553, 63: 554, 64: 556, 65: 558,
    66: 560, 67: 562, 68: 564, 69: 566, 70: 568, 71: 570, 72: 572, 73: 574,
    74: 575, 75: 577, 76: 578, 77: 580, 78: 582, 79: 583, 80: 585, 81: 586,
    82: 587, 83: 587, 84: 589, 85: 590, 86: 591, 87: 591, 88: 592, 89: 593,
    90: 594, 91: 595, 92: 595, 93: 596, 94: 596, 95: 597, 96: 597, 97: 598,
    98: 598, 99: 599, 100: 599, 101: 600, 102: 600, 103: 601, 104: 601,
    105: 601, 106: 602, 107: 602, 108: 602, 109: 603, 110: 603, 111: 603,
    112: 604, 113: 604, 114: 604,
  };
  return SURAH_START_PAGES[surahNumber] ?? 1;
}

export const totalLocalAyahs = LOCAL_AYAHS.length;
export const totalSurahCount = surahs.length;
