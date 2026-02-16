import { getSurahByNumber } from './quran-data';

export const PLAYBACK_MODES = ['single_ayah', 'ayah_range', 'surah', 'page'] as const;

export type PlaybackMode = (typeof PLAYBACK_MODES)[number];

export type ReciterId = 'husary' | 'minshawi' | 'abdul-basit' | 'ahmed-neana';

export type QuranReciter = {
  id: ReciterId;
  displayName: string;
  bitrateKbps: number;
  sourceUrlPattern: string;
  sourceName: string;
};

const RECITER_CATALOG: Record<ReciterId, QuranReciter> = {
  husary: {
    id: 'husary',
    displayName: 'Mahmoud Khalil Al-Husary',
    bitrateKbps: 64,
    sourceUrlPattern: 'https://everyayah.com/data/Husary_64kbps/{track}.mp3',
    sourceName: 'Husary',
  },
  minshawi: {
    id: 'minshawi',
    displayName: 'Mohamed Siddiq Al-Minshawi (Murattal)',
    bitrateKbps: 128,
    sourceUrlPattern: 'https://everyayah.com/data/Minshawy_Murattal_128kbps/{track}.mp3',
    sourceName: 'Minshawi',
  },
  'abdul-basit': {
    id: 'abdul-basit',
    displayName: 'Abdul Basit Abdus Samad (Murattal)',
    bitrateKbps: 64,
    sourceUrlPattern: 'https://everyayah.com/data/Abdul_Basit_Murattal_64kbps/{track}.mp3',
    sourceName: 'Abdul_Basit',
  },
  'ahmed-neana': {
    id: 'ahmed-neana',
    displayName: 'Ahmed Neana',
    bitrateKbps: 32,
    sourceUrlPattern: 'https://everyayah.com/data/Ahmed_Neana_32kbps/{track}.mp3',
    sourceName: 'Ahmed_Neana',
  },
};

export const QURAN_RECITER_CATALOG = Object.freeze(Object.values(RECITER_CATALOG));

export const DEFAULT_RECITER_ID: ReciterId = 'husary';

function normalizeName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '');
}

function validateReciterCatalog() {
  for (const reciter of QURAN_RECITER_CATALOG) {
    const display = normalizeName(reciter.displayName);
    const source = normalizeName(reciter.sourceName);

    if (!display.includes(source)) {
      throw new Error(`Reciter label/source mismatch for ${reciter.id}: ${reciter.displayName} vs ${reciter.sourceName}`);
    }
  }
}

validateReciterCatalog();

export function getReciterById(reciterId: string | null | undefined): QuranReciter {
  if (!reciterId) {
    return RECITER_CATALOG[DEFAULT_RECITER_ID];
  }

  return RECITER_CATALOG[reciterId as ReciterId] ?? RECITER_CATALOG[DEFAULT_RECITER_ID];
}

export function formatAyahTrack(surah: number, ayah: number): string {
  return `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}`;
}

export function buildAyahAudioUrl(reciterId: ReciterId, surah: number, ayah: number): string {
  const reciter = getReciterById(reciterId);
  const track = formatAyahTrack(surah, ayah);
  return reciter.sourceUrlPattern.replace('{track}', track);
}

export function buildAudioQueue(
  mode: PlaybackMode,
  reciterId: ReciterId,
  position: { surah: number; ayah: number },
  options?: {
    range?: { startAyah: number; endAyah: number };
    pageAyahs?: Array<{ surah: number; ayah: number }>;
  },
): string[] {
  if (mode === 'surah') {
    const surah = getSurahByNumber(position.surah);
    const maxAyah = surah?.verses ?? position.ayah;
    return Array.from({ length: maxAyah }, (_, index) => buildAyahAudioUrl(reciterId, position.surah, index + 1));
  }

  if (mode === 'ayah_range') {
    const surah = getSurahByNumber(position.surah);
    const maxAyah = surah?.verses ?? position.ayah;
    const rangeStart = Math.max(options?.range?.startAyah ?? position.ayah, 1);
    const rangeEnd = Math.min(options?.range?.endAyah ?? position.ayah + 4, maxAyah);

    return Array.from({ length: Math.max(1, rangeEnd - rangeStart + 1) }, (_, index) =>
      buildAyahAudioUrl(reciterId, position.surah, rangeStart + index),
    );
  }

  if (mode === 'page') {
    const pageAyahs = options?.pageAyahs ?? [];
    if (!pageAyahs.length) {
      return [buildAyahAudioUrl(reciterId, position.surah, position.ayah)];
    }

    return pageAyahs.map(item => buildAyahAudioUrl(reciterId, item.surah, item.ayah));
  }

  return [buildAyahAudioUrl(reciterId, position.surah, position.ayah)];
}

export type QuranAudioPlayer = {
  playQueue: (queue: string[]) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  next: () => Promise<void>;
  setRepeat: (enabled: boolean) => void;
  isPaused: () => boolean;
};

export function createQuranAudioPlayer(audio: HTMLAudioElement): QuranAudioPlayer {
  let queue: string[] = [];
  let index = 0;
  let repeat = false;

  const loadTrack = async () => {
    if (!queue[index]) {
      return;
    }

    audio.src = queue[index];
    await audio.play();
  };

  audio.onended = async () => {
    if (!queue.length) {
      return;
    }

    if (index < queue.length - 1) {
      index += 1;
      await loadTrack();
      return;
    }

    if (repeat) {
      index = 0;
      await loadTrack();
    }
  };

  return {
    async playQueue(nextQueue: string[]) {
      queue = nextQueue;
      index = 0;
      await loadTrack();
    },
    async play() {
      await audio.play();
    },
    pause() {
      audio.pause();
    },
    async next() {
      if (index >= queue.length - 1) {
        if (repeat) {
          index = 0;
          await loadTrack();
        }
        return;
      }

      index += 1;
      await loadTrack();
    },
    setRepeat(enabled: boolean) {
      repeat = enabled;
    },
    isPaused() {
      return audio.paused;
    },
  };
}
