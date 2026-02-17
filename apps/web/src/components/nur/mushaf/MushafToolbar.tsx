'use client';

import { Highlighter, LayoutGrid, ScrollText, Waypoints } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { MushafPlaybackMode, MushafPosition, MushafReaderOptions, MushafViewMode } from './types';

type MushafToolbarProps = {
  viewMode: MushafViewMode;
  playbackMode: MushafPlaybackMode;
  options: MushafReaderOptions;
  onViewModeChange: (mode: MushafViewMode) => void;
  onOptionsChange: (options: MushafReaderOptions) => void;
  onJumpToPage: (page: number) => void;
  onJumpToJuz: (juz: number) => void;
  onReset: () => void;
  position: MushafPosition;
};

export function MushafToolbar({
  viewMode,
  playbackMode,
  options,
  onViewModeChange,
  onOptionsChange,
  onJumpToPage,
  onJumpToJuz,
  onReset,
  position,
}: MushafToolbarProps) {
  const [pageInput, setPageInput] = useState(String(position.page));
  const [juzInput, setJuzInput] = useState('30');

  useEffect(() => {
    setPageInput(String(position.page));
  }, [position.page]);

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
          Mushaf Page
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
          onClick={() => onOptionsChange({ ...options, followPlayback: !options.followPlayback })}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs transition ${
            options.followPlayback
              ? 'border-cyan-300/50 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/70'
          }`}
        >
          <Waypoints className="h-3.5 w-3.5" />
          Auto-follow
        </button>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        <form
          className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-black/10 px-2 py-1.5"
          onSubmit={event => {
            event.preventDefault();
            const page = Number(pageInput);
            if (Number.isFinite(page)) {
              onJumpToPage(page);
            }
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/45">Page</p>
          <input
            inputMode="numeric"
            value={pageInput}
            onChange={event => setPageInput(event.target.value)}
            className="w-full bg-transparent text-right text-xs text-white/80 outline-none"
          />
        </form>
        <form
          className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-black/10 px-2 py-1.5"
          onSubmit={event => {
            event.preventDefault();
            const juz = Number(juzInput);
            if (Number.isFinite(juz)) {
              onJumpToJuz(juz);
            }
          }}
        >
          <p className="text-[11px] uppercase tracking-[0.1em] text-white/45">Juz</p>
          <input
            inputMode="numeric"
            value={juzInput}
            onChange={event => setJuzInput(event.target.value)}
            className="w-full bg-transparent text-right text-xs text-white/80 outline-none"
          />
        </form>
      </div>

      <p className="text-xs text-white/45">
        {viewMode === 'page'
          ? `Page ${position.page} \u2022 Playback: ${playbackMode.replaceAll('_', ' ')} \u2022 Follow: ${options.followPlayback ? 'On' : 'Off'}`
          : `Surah ${position.surah}, Ayah ${position.ayah} \u2022 Playback: ${playbackMode.replaceAll('_', ' ')} \u2022 Follow: ${options.followPlayback ? 'On' : 'Off'}`}
      </p>
    </div>
  );
}
