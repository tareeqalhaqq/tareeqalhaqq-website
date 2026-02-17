'use client';

import { Pause, Play, Repeat, SkipForward } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { buildAudioQueue, createQuranAudioPlayer } from '@/lib/quran-audio';
import type { AyahRange, MushafLoopMode, MushafPlaybackMode, MushafPosition, Reciter } from './types';

type PlaybackControlsProps = {
  playbackMode: MushafPlaybackMode;
  position: MushafPosition;
  selectedReciter: Reciter;
  range: AyahRange | null;
  pageAyahs: Array<{ surah: number; ayah: number }>;
  playlistAyahs: Array<{ surah: number; ayah: number }>;
  playbackRate: number;
  onPlaybackModeChange: (mode: MushafPlaybackMode) => void;
  onPlaybackRateChange: (rate: number) => void;
  onActiveAyahChange: (surah: number, ayah: number) => void;
  onPlayStateChange: (isPlaying: boolean) => void;
  onLoopModeChange: (mode: MushafLoopMode) => void;
  autoPlayRequest?: number;
};

const PLAYBACK_MODE_LABELS: Record<MushafPlaybackMode, string> = {
  single_ayah: 'Ayah',
  ayah_range: 'Range',
  surah: 'Surah',
  page: 'Page',
  playlist: 'Playlist',
};

const PLAYBACK_MODE_ORDER: MushafPlaybackMode[] = ['single_ayah', 'page', 'surah', 'ayah_range', 'playlist'];

const SPEED_STEPS = [0.75, 0.85, 1.0, 1.15, 1.25];

function clampRate(value: number) {
  return Number(Math.min(Math.max(value, 0.75), 1.25).toFixed(2));
}

async function warmAudioCache(queue: Array<{ url: string }>) {
  if (typeof window === 'undefined' || !('caches' in window) || !navigator.onLine) {
    return;
  }

  try {
    const cache = await caches.open('mushaf-audio-v1');
    await Promise.all(
      queue.slice(0, 4).map(async track => {
        try {
          const existing = await cache.match(track.url);
          if (existing) {
            return;
          }

          const response = await fetch(track.url, { mode: 'cors' });
          if (response.ok) {
            await cache.put(track.url, response.clone());
          }
        } catch {
          // Ignore individual cache failures.
        }
      }),
    );
  } catch {
    // Best-effort cache.
  }
}

export function PlaybackControls({
  playbackMode,
  position,
  selectedReciter,
  range,
  pageAyahs,
  playlistAyahs,
  playbackRate,
  onPlaybackModeChange,
  onPlaybackRateChange,
  onActiveAyahChange,
  onPlayStateChange,
  onLoopModeChange,
  autoPlayRequest,
}: PlaybackControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onActiveAyahChangeRef = useRef(onActiveAyahChange);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  const [player, setPlayer] = useState<ReturnType<typeof createQuranAudioPlayer> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<MushafLoopMode>('off');
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    onActiveAyahChangeRef.current = onActiveAyahChange;
  }, [onActiveAyahChange]);

  useEffect(() => {
    onPlayStateChangeRef.current = onPlayStateChange;
  }, [onPlayStateChange]);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    setPlayer(
      createQuranAudioPlayer(audioRef.current, {
        onTrackChange: item => {
          if (item) {
            onActiveAyahChangeRef.current(item.surah, item.ayah);
          }
        },
      }),
    );
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    const handleStateChange = () => {
      const nextPlaying = !audio.paused;
      setIsPlaying(nextPlaying);
      onPlayStateChangeRef.current(nextPlaying);
    };

    audio.addEventListener('play', handleStateChange);
    audio.addEventListener('pause', handleStateChange);

    return () => {
      audio.removeEventListener('play', handleStateChange);
      audio.removeEventListener('pause', handleStateChange);
    };
  }, []);

  useEffect(() => {
    if (!player) {
      return;
    }
    player.setPlaybackRate(clampRate(playbackRate));
  }, [player, playbackRate]);

  useEffect(() => {
    if (!player) {
      return;
    }
    player.setLoopMode(loopMode);
    onLoopModeChange(loopMode);
  }, [loopMode, onLoopModeChange, player]);


  useEffect(() => {
    setPlaybackError(null);
  }, [playbackMode, selectedReciter.id, position.surah, position.ayah, range?.startAyah, range?.endAyah, pageAyahs.length, playlistAyahs.length]);

  const playQueue = async () => {
    if (!player) {
      return;
    }

    const queue = buildAudioQueue(playbackMode, selectedReciter.id, position, {
      range: range ?? undefined,
      pageAyahs,
      playlistAyahs,
    });
    if (!queue.length) {
      setPlaybackError('No ayat available for this mode.');
      return;
    }
    await warmAudioCache(queue);
    try {
      await player.playQueue(queue);
      setPlaybackError(null);
    } catch {
      setPlaybackError('Unable to play audio. Try again.');
    }
  };


  useEffect(() => {
    if (!player || !autoPlayRequest) {
      return;
    }
    void playQueue();
  }, [autoPlayRequest, player]);

  const togglePlayPause = async () => {
    if (!player) {
      return;
    }

    if (player.isPaused()) {
      if (audioRef.current?.src) {
        try {
          await player.play();
          setPlaybackError(null);
        } catch {
          setPlaybackError('Playback blocked. Press play again.');
        }
      } else {
        await playQueue();
      }
      return;
    }

    player.pause();
  };

  const handleNext = async () => {
    if (!player) {
      return;
    }

    await player.next();
  };

  const handleRepeat = () => {
    const queueLoop = playbackMode === 'single_ayah' ? 'track' : 'queue';
    setLoopMode(current => (current === 'off' ? queueLoop : 'off'));
  };

  const cycleSpeed = () => {
    const currentIndex = SPEED_STEPS.findIndex(s => Math.abs(s - playbackRate) < 0.01);
    const nextIndex = (currentIndex + 1) % SPEED_STEPS.length;
    const nextRate = clampRate(SPEED_STEPS[nextIndex]);
    onPlaybackRateChange(nextRate);
    player?.setPlaybackRate(nextRate);
  };

  const cyclePlaybackMode = () => {
    const currentIndex = PLAYBACK_MODE_ORDER.indexOf(playbackMode);
    const nextIndex = (currentIndex + 1) % PLAYBACK_MODE_ORDER.length;
    const nextMode = PLAYBACK_MODE_ORDER[nextIndex];
    // Skip playlist if empty
    if (nextMode === 'playlist' && playlistAyahs.length === 0) {
      onPlaybackModeChange(PLAYBACK_MODE_ORDER[0]);
      return;
    }
    onPlaybackModeChange(nextMode);
  };

  const trackLabel = `${position.surah}:${position.ayah}`;

  return (
    <div className="flex items-center gap-1.5 px-2 py-1.5">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="inline-flex items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-400/10 p-2 text-cyan-100 transition hover:bg-cyan-400/20"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>

      {/* Track info */}
      <div className="flex-1 min-w-0 px-1.5">
        <p className="text-[11px] text-white/80 truncate font-sans">
          <span className="text-white/50">{PLAYBACK_MODE_LABELS[playbackMode]}</span>
          {' '}&middot;{' '}
          <span className="tabular-nums">{trackLabel}</span>
        </p>
        {playbackError && <p className="text-[10px] text-rose-300/80 truncate">{playbackError}</p>}
      </div>

      {/* Mode cycle button */}
      <button
        type="button"
        onClick={cyclePlaybackMode}
        className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/60 transition hover:border-white/20 hover:text-white/80"
        title={`Mode: ${PLAYBACK_MODE_LABELS[playbackMode]}`}
      >
        {PLAYBACK_MODE_LABELS[playbackMode]}
      </button>

      {/* Speed button */}
      <button
        type="button"
        onClick={cycleSpeed}
        className="rounded-md border border-white/10 px-1.5 py-1 text-[10px] tabular-nums text-white/60 transition hover:border-white/20 hover:text-white/80"
        title="Playback speed"
      >
        {playbackRate.toFixed(2)}x
      </button>

      {/* Loop */}
      <button
        type="button"
        onClick={handleRepeat}
        className={`rounded-md border p-1.5 transition ${
          loopMode !== 'off'
            ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
            : 'border-white/10 text-white/50 hover:border-white/20 hover:text-white/70'
        }`}
        aria-label={loopMode === 'off' ? 'Enable loop' : 'Disable loop'}
        title={loopMode === 'off' ? 'Loop off' : loopMode === 'track' ? 'Loop ayah' : 'Loop queue'}
      >
        <Repeat className="h-3.5 w-3.5" />
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={handleNext}
        className="rounded-md border border-white/10 p-1.5 text-white/50 transition hover:border-white/20 hover:text-white/70"
        aria-label="Next"
      >
        <SkipForward className="h-3.5 w-3.5" />
      </button>

      <audio ref={audioRef} preload="none" className="hidden" />
    </div>
  );
}
