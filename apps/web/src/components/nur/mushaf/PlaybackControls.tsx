'use client';

import { Pause, Play, Repeat, SkipForward } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { buildAudioQueue, createQuranAudioPlayer } from '@/lib/quran-audio';
import type { AyahRange, MushafPlaybackMode, MushafPosition, Reciter } from './types';

type PlaybackControlsProps = {
  playbackMode: MushafPlaybackMode;
  position: MushafPosition;
  selectedReciter: Reciter;
  range: AyahRange | null;
  pageAyahs: Array<{ surah: number; ayah: number }>;
  onPlaybackModeChange: (mode: MushafPlaybackMode) => void;
};

const playbackModes: { value: MushafPlaybackMode; label: string }[] = [
  { value: 'single_ayah', label: 'Single Ayah' },
  { value: 'ayah_range', label: 'Ayah Range' },
  { value: 'surah', label: 'Surah' },
  { value: 'page', label: 'Page' },
];

export function PlaybackControls({
  playbackMode,
  position,
  selectedReciter,
  range,
  pageAyahs,
  onPlaybackModeChange,
}: PlaybackControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRepeatEnabled, setIsRepeatEnabled] = useState(false);

  const player = useMemo(() => {
    if (!audioRef.current) {
      return null;
    }

    return createQuranAudioPlayer(audioRef.current);
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    const audio = audioRef.current;
    const handleStateChange = () => setIsPlaying(!audio.paused);

    audio.addEventListener('play', handleStateChange);
    audio.addEventListener('pause', handleStateChange);

    return () => {
      audio.removeEventListener('play', handleStateChange);
      audio.removeEventListener('pause', handleStateChange);
    };
  }, []);

  const playQueue = async () => {
    if (!player) {
      return;
    }

    const queue = buildAudioQueue(playbackMode, selectedReciter.id, position, {
      range: range ?? undefined,
      pageAyahs,
    });
    await player.playQueue(queue);
  };

  const togglePlayPause = async () => {
    if (!player) {
      return;
    }

    if (player.isPaused()) {
      if (audioRef.current?.src) {
        await player.play();
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
    if (!player) {
      return;
    }

    const next = !isRepeatEnabled;
    setIsRepeatEnabled(next);
    player.setRepeat(next);
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
            className={`rounded-lg border px-2 py-2 text-xs transition ${
              playbackMode === mode.value
                ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
                : 'border-white/[0.1] bg-black/10 text-white/70 hover:border-white/[0.2]'
            }`}
          >
            {mode.label}
          </button>
        ))}
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
            isRepeatEnabled
              ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/80'
          }`}
        >
          <Repeat className="h-3.5 w-3.5" />
          Repeat
        </button>
      </div>

      <audio ref={audioRef} preload="none" className="hidden" />
    </div>
  );
}
