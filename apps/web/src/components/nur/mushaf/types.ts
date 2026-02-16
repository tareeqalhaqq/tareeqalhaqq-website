import type { PlaybackMode, QuranReciter } from '@/lib/quran-audio';
import type { QuranAyah } from '@/lib/quran-text';

export type MushafViewMode = 'page' | 'ayah';

export type MushafPlaybackMode = PlaybackMode;

export type MushafPosition = {
  surah: number;
  ayah: number;
  page: number;
};

export type Reciter = QuranReciter;

export type MushafReaderOptions = {
  tajweedEnabled: boolean;
  mutashabihatEnabled: boolean;
};

export type AyahRange = {
  startAyah: number;
  endAyah: number;
};

export type MushafReaderSelection = {
  activeAyah: QuranAyah | null;
  range: AyahRange | null;
};
