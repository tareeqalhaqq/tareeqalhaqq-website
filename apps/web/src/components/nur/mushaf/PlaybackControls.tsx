'use client';

import { Gauge, Pause, Play, Repeat, SkipForward } from 'lucide-react';
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

const playbackModes: { value: MushafPlaybackMode; label: string }[] = [
  { value: 'single_ayah', label: 'Single Ayah' },
  { value: 'ayah_range', label: 'Ayah Range' },
  { value: 'surah', label: 'Surah' },
  { value: 'page', label: 'Page' },
  { value: 'playlist', label: 'Playlist' },
];

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

  const playQueue = async () => {
    if (!player) {
      return;
    }

    const queue = buildAudioQueue(playbackMode, selectedReciter.id, position, {
      range: range ?? undefined,
      pageAyahs,
      playlistAyahs,
    });
    await warmAudioCache(queue);
    try {
      await player.playQueue(queue);
      setPlaybackError(null);
    } catch {
      setPlaybackError('Unable to play audio right now. Try a different reciter or press play again.');
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
          setPlaybackError('Playback was blocked by your browser. Press play again to retry.');
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

  const effectiveLoopLabel = loopMode === 'off'
    ? 'Loop Off'
    : loopMode === 'track'
      ? 'Loop Ayah'
      : playbackMode === 'surah'
        ? 'Loop Surah'
        : playbackMode === 'ayah_range'
          ? 'Loop Range'
          : 'Loop Queue';

  const handleSpeedChange = (nextRate: number) => {
    const clamped = clampRate(nextRate);
    onPlaybackRateChange(clamped);
    player?.setPlaybackRate(clamped);
  };

  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">Playback</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {playbackModes.map(mode => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onPlaybackModeChange(mode.value)}
            disabled={mode.value === 'playlist' && playlistAyahs.length === 0}
            className={`rounded-lg border px-2 py-2 text-xs transition ${
              playbackMode === mode.value
                ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                : 'border-white/[0.1] bg-black/10 text-white/70 hover:border-white/[0.2]'
            } ${mode.value === 'playlist' && playlistAyahs.length === 0 ? 'cursor-not-allowed opacity-40' : ''}`}
            title={mode.value === 'playlist' && playlistAyahs.length === 0 ? 'Load a playlist first' : undefined}
          >
            {mode.label}
          </button>
        ))}
      </div>

      <div className="space-y-1 rounded-lg border border-white/[0.08] bg-black/15 px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.16em] text-white/45">
            <Gauge className="h-3.5 w-3.5" />
            Speed
          </p>
          <p className="text-xs text-cyan-100">{playbackRate.toFixed(2)}x</p>
        </div>
        <input
          type="range"
          min={0.75}
          max={1.25}
          step={0.05}
          value={playbackRate}
          onChange={event => handleSpeedChange(Number(event.target.value))}
          className="w-full accent-cyan-300"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={togglePlayPause}
          className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-300/40 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100"
        >
          {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isPlaying ? 'Pause' : 'Play'}
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.1] bg-black/10 px-3 py-2 text-xs text-white/80"
        >
          <SkipForward className="h-3.5 w-3.5" />
          Next
        </button>
        <button
          type="button"
          onClick={handleRepeat}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs ${
            loopMode !== 'off'
              ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/80'
          }`}
        >
          <Repeat className="h-3.5 w-3.5" />
          {effectiveLoopLabel}
        </button>
      </div>

      {playbackError && <p className="text-[11px] text-rose-200/80">{playbackError}</p>}

      <audio ref={audioRef} preload="none" className="hidden" />
    </div>
  );
}
