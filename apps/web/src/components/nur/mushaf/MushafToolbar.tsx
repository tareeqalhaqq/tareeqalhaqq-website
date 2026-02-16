'use client';

import { LayoutGrid, ScrollText } from 'lucide-react';
import type { MushafPlaybackMode, MushafPosition, MushafViewMode } from './types';

type MushafToolbarProps = {
  viewMode: MushafViewMode;
  playbackMode: MushafPlaybackMode;
  onViewModeChange: (mode: MushafViewMode) => void;
  onReset: () => void;
  position: MushafPosition;
};

export function MushafToolbar({ viewMode, playbackMode, onViewModeChange, onReset, position }: MushafToolbarProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">View mode</p>
        <button
          type="button"
          onClick={onReset}
          className="text-xs text-cyan-200/80 transition hover:text-cyan-100"
        >
          Reset
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onViewModeChange('page')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
            viewMode === 'page'
              ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/70 hover:border-white/[0.2]'
          }`}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Page
        </button>
        <button
          type="button"
          onClick={() => onViewModeChange('ayah')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
            viewMode === 'ayah'
              ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/70 hover:border-white/[0.2]'
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Ayah
        </button>
      </div>
      <p className="text-xs text-white/45">
        {viewMode === 'page'
          ? `Viewing page ${position.page}. Playback mode: ${playbackMode.replaceAll('_', ' ')}.`
          : `Viewing Surah ${position.surah}, Ayah ${position.ayah}. Playback mode: ${playbackMode.replaceAll('_', ' ')}.`}
      </p>
    </div>
  );
}
