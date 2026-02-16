'use client';

import { BookMarked, ExternalLink } from 'lucide-react';

import type { MushafPosition, MushafViewMode } from './types';


type MushafReaderProps = {
  viewMode: MushafViewMode;
  position: MushafPosition;
  onPositionChange: (position: MushafPosition) => void;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function MushafReader({ viewMode, position, onPositionChange }: MushafReaderProps) {
  const quranUrl =
    viewMode === 'page'
      ? `https://quran.com/page/${position.page}`
      : `https://quran.com/${position.surah}/${position.ayah}`;

  return (
    <div className="space-y-3 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Mushaf Reader</p>
        <a
          href={quranUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-cyan-200/80 transition hover:text-cyan-100"
        >
          Open on Quran.com
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {viewMode === 'page' ? (
        <div className="space-y-1">
          <label htmlFor="mushaf-page" className="text-xs uppercase tracking-[0.16em] text-white/40">
            Page
          </label>
          <div className="flex items-center gap-2">
            <BookMarked className="h-4 w-4 text-cyan-300/80" />
            <input
              id="mushaf-page"
              type="number"
              min={1}
              max={604}
              value={position.page}
              onChange={event =>
                onPositionChange({
                  ...position,
                  page: clamp(Number(event.target.value) || 1, 1, 604),
                })
              }
              className="w-full rounded-lg border border-white/[0.1] bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
            />
          </div>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="mushaf-surah" className="text-xs uppercase tracking-[0.16em] text-white/40">
              Surah
            </label>
            <input
              id="mushaf-surah"
              type="number"
              min={1}
              max={114}
              value={position.surah}
              onChange={event =>
                onPositionChange({
                  ...position,
                  surah: clamp(Number(event.target.value) || 1, 1, 114),
                })
              }
              className="w-full rounded-lg border border-white/[0.1] bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="mushaf-ayah" className="text-xs uppercase tracking-[0.16em] text-white/40">
              Ayah
            </label>
            <input
              id="mushaf-ayah"
              type="number"
              min={1}
              max={286}
              value={position.ayah}
              onChange={event =>
                onPositionChange({
                  ...position,
                  ayah: clamp(Number(event.target.value) || 1, 1, 286),
                })
              }
              className="w-full rounded-lg border border-white/[0.1] bg-black/20 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300/40"
            />
          </div>
        </div>
      )}
    </div>
  );
}
