'use client';

import { Highlighter, LayoutGrid, ScanSearch, ScrollText } from 'lucide-react';
import type { MushafPlaybackMode, MushafPosition, MushafReaderOptions, MushafViewMode } from './types';

type MushafToolbarProps = {
  viewMode: MushafViewMode;
  playbackMode: MushafPlaybackMode;
  options: MushafReaderOptions;
  onViewModeChange: (mode: MushafViewMode) => void;
  onOptionsChange: (options: MushafReaderOptions) => void;
  onReset: () => void;
  position: MushafPosition;
};

export function MushafToolbar({
  viewMode,
  playbackMode,
  options,
  onViewModeChange,
  onOptionsChange,
  onReset,
  position,
}: MushafToolbarProps) {
  return (
    <div className="space-y-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-white/40">View mode</p>
        <button type="button" onClick={onReset} className="text-xs text-cyan-200/80 transition hover:text-cyan-100">
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
          Ayah by Ayah
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onOptionsChange({ ...options, tajweedEnabled: !options.tajweedEnabled })}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
            options.tajweedEnabled
              ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-100'
              : 'border-white/[0.1] bg-black/10 text-white/70'
          }`}
        >
          <Highlighter className="h-3.5 w-3.5" />
          Tajweed Colors
        </button>
        <button
          type="button"
          onClick={() => onOptionsChange({ ...options, mutashabihatEnabled: !options.mutashabihatEnabled })}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
            options.mutashabihatEnabled
              ? 'border-amber-300/50 bg-amber-400/10 text-amber-100'
              : 'border-white/[0.1] bg-black/10 text-white/70'
          }`}
        >
          <ScanSearch className="h-3.5 w-3.5" />
          Mutashabihaat
        </button>
      </div>

      <p className="text-xs text-white/45">
        {viewMode === 'page'
          ? `Page ${position.page} • Playback: ${playbackMode.replaceAll('_', ' ')}`
          : `Surah ${position.surah}, Ayah ${position.ayah} • Playback: ${playbackMode.replaceAll('_', ' ')}`}
      </p>
    </div>
  );
}
