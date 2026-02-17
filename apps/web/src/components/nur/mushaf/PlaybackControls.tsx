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
};

function clampRate(value: number) {
  return Number(Math.min(Math.max(value, 0.75), 1.25).toFixed(2));
}

const SPEED_STEPS = [0.75, 0.85, 1.0, 1.1, 1.25];

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
}: PlaybackControlsProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onActiveAyahChangeRef = useRef(onActiveAyahChange);
  const onPlayStateChangeRef = useRef(onPlayStateChange);
  const [player, setPlayer] = useState<ReturnType<typeof createQuranAudioPlayer> | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [loopMode, setLoopMode] = useState<MushafLoopMode>('off');

  useEffect(() => { onActiveAyahChangeRef.current = onActiveAyahChange; }, [onActiveAyahChange]);
  useEffect(() => { onPlayStateChangeRef.current = onPlayStateChange; }, [onPlayStateChange]);

  // Create audio player
  useEffect(() => {
    if (!audioRef.current) return;
    setPlayer(
      createQuranAudioPlayer(audioRef.current, {
        onTrackChange: item => {
          if (item) onActiveAyahChangeRef.current(item.surah, item.ayah);
        },
      }),
    );
  }, []);

  // Listen for play/pause state
  useEffect(() => {
    if (!audioRef.current) return;
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

  // Sync playback rate
  useEffect(() => {
    if (player) player.setPlaybackRate(clampRate(playbackRate));
  }, [player, playbackRate]);

  // Sync loop mode
  useEffect(() => {
    if (player) {
      player.setLoopMode(loopMode);
      onLoopModeChange(loopMode);
    }
  }, [loopMode, onLoopModeChange, player]);

  const playQueue = async () => {
    if (!player) return;
    const queue = buildAudioQueue(playbackMode, selectedReciter.id, position, {
      range: range ?? undefined,
      pageAyahs,
      playlistAyahs,
    });
    if (queue.length > 0) {
      await player.playQueue(queue);
    }
  };

  const togglePlayPause = async () => {
    if (!player) return;
    if (player.isPaused()) {
      if (audioRef.current?.src) await player.play();
      else await playQueue();
      return;
    }
    player.pause();
  };

  const handleNext = async () => {
    if (player) await player.next();
  };

  const handleRepeat = () => {
    const queueLoop = playbackMode === 'single_ayah' ? 'track' : 'queue';
    setLoopMode(current => (current === 'off' ? queueLoop : 'off'));
  };

  const cycleSpeed = () => {
    const idx = SPEED_STEPS.findIndex(s => Math.abs(s - playbackRate) < 0.03);
    const next = SPEED_STEPS[(idx + 1) % SPEED_STEPS.length];
    onPlaybackRateChange(next);
  };

  return (
    <div className="flex items-center gap-1.5 sm:gap-2.5">
      {/* Play / Pause */}
      <button
        type="button"
        onClick={togglePlayPause}
        className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-100 transition hover:bg-cyan-500/30 shrink-0"
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
      </button>

      {/* Next */}
      <button
        type="button"
        onClick={handleNext}
        className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/10 text-white/50 transition hover:text-white/80 hover:border-white/20 shrink-0"
        aria-label="Next"
      >
        <SkipForward className="h-3 w-3" />
      </button>

      {/* Loop */}
      <button
        type="button"
        onClick={handleRepeat}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full border transition shrink-0 ${
          loopMode !== 'off'
            ? 'border-cyan-400/40 text-cyan-200 bg-cyan-500/10'
            : 'border-white/10 text-white/35 hover:text-white/60'
        }`}
        aria-label={loopMode === 'off' ? 'Enable loop' : 'Disable loop'}
      >
        <Repeat className="h-3 w-3" />
      </button>

      <div className="w-px h-5 bg-white/[0.08] mx-0.5 hidden sm:block" />

      {/* Playback mode */}
      <select
        value={playbackMode}
        onChange={e => onPlaybackModeChange(e.target.value as MushafPlaybackMode)}
        className="bg-transparent border border-white/[0.08] rounded px-1.5 py-1 text-[11px] text-white/60 outline-none cursor-pointer hover:border-white/15 transition"
      >
        <option value="single_ayah" className="bg-slate-900">Ayah</option>
        <option value="ayah_range" className="bg-slate-900">Range</option>
        <option value="surah" className="bg-slate-900">Surah</option>
        <option value="page" className="bg-slate-900">Page</option>
        <option value="playlist" className="bg-slate-900" disabled={!playlistAyahs.length}>Playlist</option>
      </select>

      {/* Speed */}
      <button
        type="button"
        onClick={cycleSpeed}
        className="text-[11px] text-white/45 border border-white/[0.08] rounded px-1.5 py-1 hover:text-white/70 transition tabular-nums hidden sm:block"
      >
        {playbackRate.toFixed(2)}x
      </button>

      {/* Position indicator */}
      <span className="text-[11px] text-white/30 ml-auto tabular-nums hidden md:block">
        {position.surah}:{position.ayah}
      </span>

      <audio ref={audioRef} preload="none" className="hidden" />
    </div>
  );
}
