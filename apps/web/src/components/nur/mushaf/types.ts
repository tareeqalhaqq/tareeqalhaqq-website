export type MushafViewMode = 'page' | 'ayah';

export type MushafPlaybackMode = 'single_ayah' | 'ayah_range' | 'full_surah' | 'full_page';

export type MushafPosition = {
  surah: number;
  ayah: number;
  page: number;
};

export type Reciter = {
  id: string;
  name: string;
  baseUrl: string;
};
