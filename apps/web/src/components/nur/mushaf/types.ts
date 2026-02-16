import type { PlaybackMode, QuranReciter } from '@/lib/quran-audio';

export type MushafViewMode = 'page' | 'ayah';

export type MushafPlaybackMode = PlaybackMode;

export type MushafPosition = {
  surah: number;
  ayah: number;
  page: number;
};

export type Reciter = QuranReciter;
