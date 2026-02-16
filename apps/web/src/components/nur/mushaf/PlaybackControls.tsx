'use client';

import { ExternalLink, Play } from 'lucide-react';
import type { MushafPlaybackMode, MushafPosition, Reciter } from './types';

type PlaybackControlsProps = {
  playbackMode: MushafPlaybackMode;
  position: MushafPosition;
  selectedReciter: Reciter;
  onPlaybackModeChange: (mode: MushafPlaybackMode) => void;
};

const playbackModes: { value: MushafPlaybackMode; label: string }[] = [
  { value: 'single_ayah', label: 'Single Ayah' },
  { value: 'ayah_range', label: 'Ayah Range' },
  { value: 'full_surah', label: 'Full Surah' },
  { value: 'full_page', label: 'Full Page' },
];

function formatEveryAyahTrack(surah: number, ayah: number) {
  return `${String(surah).padStart(3, '0')}${String(ayah).padStart(3, '0')}.mp3`;
}

export function PlaybackControls({ playbackMode, position, selectedReciter, onPlaybackModeChange }: PlaybackControlsProps) {
  const sampleTrackUrl = `${selectedReciter.baseUrl}${formatEveryAyahTrack(position.surah, position.ayah)}`;

  return (
    <div className="space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <p className="text-xs uppercase tracking-[0.16em] text-white/40">Playback</p>
      <div className="grid grid-cols-2 gap-2">
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
      <a
        href={sampleTrackUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-1.5 text-xs text-cyan-200/80 transition hover:text-cyan-100"
      >
        <Play className="h-3.5 w-3.5" />
        Preview selected ayah audio
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
