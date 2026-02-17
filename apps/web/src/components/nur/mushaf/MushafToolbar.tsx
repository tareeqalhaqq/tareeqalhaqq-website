'use client';

import { BookMarked, Highlighter, LayoutGrid, ScrollText, Waypoints } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getSurahByNumber } from '@/lib/quran-data';
import type { MushafPlaybackMode, MushafPosition, MushafReaderOptions, MushafViewMode } from './types';

type MushafToolbarProps = {
  showNavigationControls?: boolean;
  viewMode: MushafViewMode;
  playbackMode: MushafPlaybackMode;
  options: MushafReaderOptions;
  onViewModeChange: (mode: MushafViewMode) => void;
  onOptionsChange: (options: MushafReaderOptions) => void;
  onJumpToPage: (page: number) => void;
  onJumpToJuz: (juz: number) => void;
  onJumpToSurahAyah: (surah: number, ayah: number) => void;
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
  onJumpToSurahAyah,
  onReset,
  position,
  showNavigationControls = true,
}: MushafToolbarProps) {
  const [pageInput, setPageInput] = useState(String(position.page));
  const [juzInput, setJuzInput] = useState('30');
  const [surahInput, setSurahInput] = useState(String(position.surah));
  const [ayahInput, setAyahInput] = useState(String(position.ayah));

  useEffect(() => {
    setPageInput(String(position.page));
    setSurahInput(String(position.surah));
    setAyahInput(String(position.ayah));
  }, [position.ayah, position.page, position.surah]);

  return (
    <div className="space-y-2.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-2.5">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.16em] text-white/40">View mode</p>
        <button type="button" onClick={onReset} className="text-[11px] text-cyan-200/80 transition hover:text-cyan-100">
          Reset
        </button>
      </div>

      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          onClick={() => onViewModeChange('page')}
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] transition ${
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
          className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-2 py-1.5 text-[11px] transition ${
            viewMode === 'ayah'
              ? 'border-cyan-300/40 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/70 hover:border-white/[0.2]'
          }`}
        >
          <ScrollText className="h-3.5 w-3.5" />
          Ayah
        </button>
      </div>

      <div className="grid gap-1.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => onOptionsChange({ ...options, tajweedEnabled: !options.tajweedEnabled })}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] transition ${
            options.tajweedEnabled
              ? 'border-emerald-300/50 bg-emerald-400/10 text-emerald-100'
              : 'border-white/[0.1] bg-black/10 text-white/70'
          }`}
        >
          <Highlighter className="h-3.5 w-3.5" />Tajweed
        </button>
        <button
          type="button"
          onClick={() => onOptionsChange({ ...options, followPlayback: !options.followPlayback })}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] transition ${
            options.followPlayback
              ? 'border-cyan-300/50 bg-cyan-400/10 text-cyan-100'
              : 'border-white/[0.1] bg-black/10 text-white/70'
          }`}
        >
          <Waypoints className="h-3.5 w-3.5" />Follow
        </button>
        <button
          type="button"
          onClick={() => onOptionsChange({ ...options, pagePairMode: options.pagePairMode === 'single' ? 'spread' : 'single' })}
          className={`inline-flex items-center justify-center gap-1 rounded-lg border px-2 py-1.5 text-[11px] transition ${
            options.pagePairMode === 'spread'
              ? 'border-amber-300/50 bg-amber-400/10 text-amber-100'
              : 'border-white/[0.1] bg-black/10 text-white/70'
          }`}
        >
          <BookMarked className="h-3.5 w-3.5" />
          {options.pagePairMode === 'spread' ? '2 Pages' : '1 Page'}
        </button>
      </div>
      {showNavigationControls && (
        <div className="grid gap-1.5 sm:grid-cols-3">
          <form className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-black/10 px-2 py-1" onSubmit={e => { e.preventDefault(); onJumpToPage(Number(pageInput)); }}>
            <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Page</p>
            <input inputMode="numeric" value={pageInput} onChange={e => setPageInput(e.target.value)} className="w-full bg-transparent text-right text-[11px] text-white/80 outline-none" />
          </form>
          <form className="flex items-center gap-2 rounded-lg border border-white/[0.1] bg-black/10 px-2 py-1" onSubmit={e => { e.preventDefault(); onJumpToJuz(Number(juzInput)); }}>
            <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">Juz</p>
            <input inputMode="numeric" value={juzInput} onChange={e => setJuzInput(e.target.value)} className="w-full bg-transparent text-right text-[11px] text-white/80 outline-none" />
          </form>
          <form className="flex items-center gap-1 rounded-lg border border-white/[0.1] bg-black/10 px-2 py-1" onSubmit={e => {
            e.preventDefault();
            const surah = Number(surahInput);
            const maxAyah = getSurahByNumber(surah)?.verses ?? 1;
            const ayah = Math.max(1, Math.min(Number(ayahInput) || 1, maxAyah));
            onJumpToSurahAyah(Math.max(1, Math.min(surah || 1, 114)), ayah);
          }}>
            <p className="text-[10px] uppercase tracking-[0.1em] text-white/45">S:A</p>
            <input inputMode="numeric" value={surahInput} onChange={e => setSurahInput(e.target.value)} className="w-full bg-transparent text-right text-[11px] text-white/80 outline-none" />
            <span className="text-white/30">:</span>
            <input inputMode="numeric" value={ayahInput} onChange={e => setAyahInput(e.target.value)} className="w-full bg-transparent text-right text-[11px] text-white/80 outline-none" />
          </form>
        </div>
      )}

      <p className="text-[11px] text-white/45">
        {viewMode === 'page'
          ? `Page ${position.page} • ${options.pagePairMode === 'spread' ? '2-page spread' : 'single page'} • Playback: ${playbackMode.replaceAll('_', ' ')}`
          : `Surah ${position.surah}, Ayah ${position.ayah} • Playback: ${playbackMode.replaceAll('_', ' ')}`}
      </p>
    </div>
  );
}
