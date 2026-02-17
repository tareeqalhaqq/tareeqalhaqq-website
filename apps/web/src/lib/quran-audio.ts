import { getSurahByNumber } from './quran-data';

export const PLAYBACK_MODES = ['single_ayah', 'ayah_range', 'surah', 'page', 'playlist'] as const;

export type PlaybackMode = (typeof PLAYBACK_MODES)[number];

export type LoopMode = 'off' | 'track' | 'queue';

export type ReciterId = 'husary' | 'minshawi' | 'abdul-basit' | 'ahmad-al-nufais';

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
  'ahmad-al-nufais': {
    id: 'ahmad-al-nufais',
    displayName: 'Ahmad Al-Nufais',
    bitrateKbps: 32,
    sourceUrlPattern: 'https://everyayah.com/data/Ahmed_Neana_32kbps/{track}.mp3',
    sourceName: 'Ahmad_Al_Nufais',
  },
};

export const QURAN_RECITER_CATALOG = Object.freeze(Object.values(RECITER_CATALOG));

export const DEFAULT_RECITER_ID: ReciterId = 'husary';

const LEGACY_RECITER_ALIASES: Record<string, ReciterId> = {
  'ahmed-neana': 'ahmad-al-nufais',
};

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

  const normalized = LEGACY_RECITER_ALIASES[reciterId] ?? (reciterId as ReciterId);
  return RECITER_CATALOG[normalized] ?? RECITER_CATALOG[DEFAULT_RECITER_ID];
}

export function formatAyahTrack(surah: number, ayah: number): string {
  return `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}`;
}

export function buildAyahAudioUrl(reciterId: ReciterId, surah: number, ayah: number): string {
  const reciter = getReciterById(reciterId);
  const track = formatAyahTrack(surah, ayah);
  return reciter.sourceUrlPattern.replace('{track}', track);
}

export type AudioQueueItem = {
  url: string;
  surah: number;
  ayah: number;
  verseKey: string;
};

function toQueueItem(reciterId: ReciterId, surah: number, ayah: number): AudioQueueItem {
  return {
    url: buildAyahAudioUrl(reciterId, surah, ayah),
    surah,
    ayah,
    verseKey: `${surah}:${ayah}`,
  };
}

export function buildAudioQueue(
  mode: PlaybackMode,
  reciterId: ReciterId,
  position: { surah: number; ayah: number },
  options?: {
    range?: { startAyah: number; endAyah: number };
    pageAyahs?: Array<{ surah: number; ayah: number }>;
    playlistAyahs?: Array<{ surah: number; ayah: number }>;
  },
): AudioQueueItem[] {
  if (mode === 'surah') {
    const surah = getSurahByNumber(position.surah);
    const maxAyah = surah?.verses ?? position.ayah;
    const startAyah = Math.min(Math.max(position.ayah, 1), maxAyah);
    return Array.from({ length: maxAyah - startAyah + 1 }, (_, index) =>
      toQueueItem(reciterId, position.surah, startAyah + index),
    );
  }

  if (mode === 'ayah_range') {
    const surah = getSurahByNumber(position.surah);
    const maxAyah = surah?.verses ?? position.ayah;
    const rangeStart = Math.max(options?.range?.startAyah ?? position.ayah, 1);
    const rangeEnd = Math.min(options?.range?.endAyah ?? position.ayah + 4, maxAyah);

    return Array.from({ length: Math.max(1, rangeEnd - rangeStart + 1) }, (_, index) =>
      toQueueItem(reciterId, position.surah, rangeStart + index),
    );
  }

  if (mode === 'page') {
    const pageAyahs = options?.pageAyahs ?? [];
    if (!pageAyahs.length) {
      return [toQueueItem(reciterId, position.surah, position.ayah)];
    }

    return pageAyahs.map(item => toQueueItem(reciterId, item.surah, item.ayah));
  }

  if (mode === 'playlist') {
    const playlistAyahs = options?.playlistAyahs ?? [];
    if (!playlistAyahs.length) {
      return [toQueueItem(reciterId, position.surah, position.ayah)];
    }

    return playlistAyahs.map(item => toQueueItem(reciterId, item.surah, item.ayah));
  }

  return [toQueueItem(reciterId, position.surah, position.ayah)];
}

type QuranAudioPlayerCallbacks = {
  onTrackChange?: (item: AudioQueueItem | null, index: number) => void;
};

export type QuranAudioPlayer = {
  playQueue: (queue: AudioQueueItem[], startIndex?: number) => Promise<void>;
  play: () => Promise<void>;
  pause: () => void;
  next: () => Promise<void>;
  setLoopMode: (mode: LoopMode) => void;
  getLoopMode: () => LoopMode;
  setPlaybackRate: (rate: number) => void;
  getPlaybackRate: () => number;
  getCurrentItem: () => AudioQueueItem | null;
  isPaused: () => boolean;
};

export function createQuranAudioPlayer(audio: HTMLAudioElement, callbacks?: QuranAudioPlayerCallbacks): QuranAudioPlayer {
  let queue: AudioQueueItem[] = [];
  let index = 0;
  let loopMode: LoopMode = 'off';

  const clampRate = (rate: number) => Math.min(Math.max(rate, 0.75), 1.25);

  const emitTrackChange = () => {
    callbacks?.onTrackChange?.(queue[index] ?? null, index);
  };

  const loadTrack = async () => {
    const item = queue[index];
    if (!item) {
      return;
    }

    audio.src = item.url;
    await audio.play();
    emitTrackChange();
  };

  audio.onended = async () => {
    if (!queue.length) {
      return;
    }

    if (loopMode === 'track') {
      await loadTrack();
      return;
    }

    if (index < queue.length - 1) {
      index += 1;
      await loadTrack();
      return;
    }

    if (loopMode === 'queue') {
      index = 0;
      await loadTrack();
      return;
    }

    emitTrackChange();
  };

  return {
    async playQueue(nextQueue: AudioQueueItem[], startIndex = 0) {
      queue = nextQueue;
      index = Math.min(Math.max(startIndex, 0), Math.max(nextQueue.length - 1, 0));
      await loadTrack();
    },
    async play() {
      await audio.play();
      emitTrackChange();
    },
    pause() {
      audio.pause();
    },
    async next() {
      if (index >= queue.length - 1) {
        if (loopMode === 'queue') {
          index = 0;
          await loadTrack();
        }
        return;
      }

      index += 1;
      await loadTrack();
    },
    setLoopMode(mode: LoopMode) {
      loopMode = mode;
    },
    getLoopMode() {
      return loopMode;
    },
    setPlaybackRate(rate: number) {
      audio.playbackRate = clampRate(rate);
    },
    getPlaybackRate() {
      return clampRate(audio.playbackRate || 1);
    },
    getCurrentItem() {
      return queue[index] ?? null;
    },
    isPaused() {
      return audio.paused;
    },
  };
}
