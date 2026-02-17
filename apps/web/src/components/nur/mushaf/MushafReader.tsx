'use client';

import { BookOpenText, ChevronLeft, ChevronRight, Play, TimerReset } from 'lucide-react';
import { useEffect, useRef } from 'react';
import {
  clampAyahToSurah,
  findMostRelevantPageForSurah,
  getAvailablePages,
  getAvailableSurahs,
  getAyahsForPage,
  getAyahsForSurah,
  getDataCoverageMessage,
  getMutashabihStats,
  getSurahLabel,
  type TajweedRule,
} from '@/lib/quran-text';
import type { AyahRange, MushafPosition, MushafReaderOptions, MushafReaderSelection, MushafViewMode } from './types';

type MushafReaderProps = {
  viewMode: MushafViewMode;
  position: MushafPosition;
  options: MushafReaderOptions;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  scrollTop: number;
  scrollRestoreKey: string;
  onPositionChange: (position: MushafPosition) => void;
  onPlayAyah: (surah: number, ayah: number) => void;
  onRangeChange: (range: AyahRange | null) => void;
  onSelectionChange: (selection: MushafReaderSelection) => void;
  onScrollPositionChange: (scrollTop: number) => void;
};

const tajweedClassMap: Record<TajweedRule, string> = {
  normal: 'text-white/95',
  madd: 'text-sky-300',
  ghunnah: 'text-emerald-300',
  qalqalah: 'text-amber-300',
  ikhfa: 'text-fuchsia-300',
  idgham: 'text-violet-300',
};

const availableSurahs = getAvailableSurahs();
const availablePages = getAvailablePages();

function getPrevious<T extends number>(collection: T[], value: T, fallback: T): T {
  const idx = collection.indexOf(value);
  return idx <= 0 ? fallback : collection[idx - 1];
}

function getNext<T extends number>(collection: T[], value: T, fallback: T): T {
  const idx = collection.indexOf(value);
  return idx === -1 || idx >= collection.length - 1 ? fallback : collection[idx + 1];
}

function AyahText({
  text,
  tokens,
  options,
  mutashabihStats,
}: {
  text: string;
  tokens: Array<{ text: string; tajweed: TajweedRule; mutashabihKey?: string }>;
  options: MushafReaderOptions;
  mutashabihStats: Map<string, number>;
}) {
  if (!tokens.length) {
    return <p className="text-right font-[\'Amiri\',serif] text-3xl leading-relaxed text-white/95">{text}</p>;
  }

  return (
    <p dir="rtl" className="text-right font-['Amiri',serif] text-3xl leading-relaxed">
      {tokens.map((token, idx) => {
        const tajweedClass = options.tajweedEnabled ? tajweedClassMap[token.tajweed] : 'text-white/95';
        const isMutashabih = options.mutashabihatEnabled && token.mutashabihKey && (mutashabihStats.get(token.mutashabihKey) ?? 0) > 1;

        return (
          <span
            key={`${token.text}-${idx}`}
            className={`inline-block px-0.5 ${tajweedClass} ${isMutashabih ? 'rounded bg-yellow-300/20 ring-1 ring-yellow-200/40' : ''}`}
          >
            {token.text}{' '}
          </span>
        );
      })}
    </p>
  );
}

export function MushafReader({
  viewMode,
  position,
  options,
  activePlaybackAyah,
  scrollTop,
  scrollRestoreKey,
  onPositionChange,
  onPlayAyah,
  onRangeChange,
  onSelectionChange,
  onScrollPositionChange,
}: MushafReaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const restoredScrollTopRef = useRef(scrollTop);
  const pageAyahs = getAyahsForPage(position.page);
  const surahAyahs = getAyahsForSurah(position.surah);
  const activeAyahs = viewMode === 'page' ? pageAyahs : surahAyahs;
  const mutashabihStats = getMutashabihStats(activeAyahs);
  const coverageMessage = getDataCoverageMessage();

  useEffect(() => {
    restoredScrollTopRef.current = scrollTop;
  }, [scrollTop]);

  useEffect(() => {
    if (!scrollContainerRef.current) {
      return;
    }
    scrollContainerRef.current.scrollTop = Math.max(0, restoredScrollTopRef.current);
  }, [scrollRestoreKey]);

  useEffect(() => {
    if (!options.followPlayback || !activePlaybackAyah || !scrollContainerRef.current) {
      return;
    }

    const target = scrollContainerRef.current.querySelector<HTMLDivElement>(
      `[data-verse-key="${activePlaybackAyah.surah}:${activePlaybackAyah.ayah}"]`,
    );
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activePlaybackAyah, options.followPlayback]);

  const applySurah = (surah: number) => {
    const clampedAyah = clampAyahToSurah(surah, 1);
    onPositionChange({
      ...position,
      surah,
      ayah: clampedAyah,
      page: findMostRelevantPageForSurah(surah),
    });
    onRangeChange(null);
  };

  const handleAyahSelection = (ayah: { surah: number; ayah: number; page: number }) => {
    onPositionChange({
      ...position,
      surah: ayah.surah,
      ayah: ayah.ayah,
      page: ayah.page,
    });
    const activeAyah = activeAyahs.find(item => item.ayah === ayah.ayah && item.surah === ayah.surah) ?? null;
    onSelectionChange({ activeAyah, range: null });
    onRangeChange(null);
  };

  const toggleRangeAtAyah = (ayah: { surah: number; ayah: number; page: number }) => {
    if (ayah.surah !== position.surah) {
      onPositionChange({
        ...position,
        surah: ayah.surah,
        ayah: ayah.ayah,
        page: ayah.page,
      });
      onRangeChange(null);
      return;
    }

    const start = Math.min(position.ayah, ayah.ayah);
    const end = Math.max(position.ayah, ayah.ayah);
    const range: AyahRange = { startAyah: start, endAyah: end };
    onRangeChange(range);
    const activeAyah = activeAyahs.find(item => item.ayah === ayah.ayah && item.surah === ayah.surah) ?? null;
    onSelectionChange({ activeAyah, range });
  };

  const jumpToPage = (page: number) => {
    const targetPage = Math.min(Math.max(page, availablePages[0]), availablePages[availablePages.length - 1]);
    const firstAyah = getAyahsForPage(targetPage)[0];

    onPositionChange({
      ...position,
      page: targetPage,
      surah: firstAyah?.surah ?? position.surah,
      ayah: firstAyah?.ayah ?? position.ayah,
    });
    onRangeChange(null);
  };

  return (
    <div className="space-y-4 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.04] p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Native Mushaf Reader</p>
          <p className="text-xs text-cyan-100/70">{coverageMessage}</p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-white/60">
          <BookOpenText className="h-3.5 w-3.5" />
          {viewMode === 'page' ? `Page ${position.page}` : getSurahLabel(position.surah)}
        </div>
      </div>

      {viewMode === 'page' ? (
        <div className="flex items-center justify-between rounded-lg border border-white/[0.08] bg-black/20 p-2">
          <button
            type="button"
            onClick={() => jumpToPage(getPrevious(availablePages, position.page, availablePages[0]))}
            className="rounded-md border border-white/10 p-2 text-white/80"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-sm text-white/80">Page {position.page}</p>
          <button
            type="button"
            onClick={() => jumpToPage(getNext(availablePages, position.page, availablePages[availablePages.length - 1]))}
            className="rounded-md border border-white/10 p-2 text-white/80"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-white/[0.08] bg-black/20 p-2">
          <button type="button" onClick={() => applySurah(getPrevious(availableSurahs, position.surah, availableSurahs[0]))} className="rounded-md border border-white/10 p-2 text-white/80">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-center text-sm text-white/80">{getSurahLabel(position.surah)}</p>
          <button type="button" onClick={() => applySurah(getNext(availableSurahs, position.surah, availableSurahs[availableSurahs.length - 1]))} className="rounded-md border border-white/10 p-2 text-white/80">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={event => onScrollPositionChange(event.currentTarget.scrollTop)}
        className="max-h-[24rem] space-y-3 overflow-y-auto pr-1"
      >
        {activeAyahs.map(ayah => {
          const isActive = position.surah === ayah.surah && position.ayah === ayah.ayah;
          const isPlaybackAyah = activePlaybackAyah?.surah === ayah.surah && activePlaybackAyah.ayah === ayah.ayah;
          return (
            <article
              key={ayah.key}
              data-verse-key={ayah.key}
              className={`rounded-xl border p-3 ${isActive ? 'border-cyan-300/40 bg-cyan-400/10' : 'border-white/[0.08] bg-black/20'} ${isPlaybackAyah ? 'ring-1 ring-emerald-300/50' : ''}`}
            >
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs text-cyan-100/70">{ayah.surah}:{ayah.ayah}</p>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => onPlayAyah(ayah.surah, ayah.ayah)} className="inline-flex items-center gap-1 rounded-md border border-cyan-300/40 px-2 py-1 text-[11px] text-cyan-100">
                    <Play className="h-3 w-3" />
                    Play
                  </button>
                  <button type="button" onClick={() => toggleRangeAtAyah(ayah)} className="inline-flex items-center gap-1 rounded-md border border-white/15 px-2 py-1 text-[11px] text-white/80">
                    <TimerReset className="h-3 w-3" />
                    Range
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => handleAyahSelection(ayah)} className="w-full text-left">
                <AyahText text={ayah.text} tokens={ayah.tokens} options={options} mutashabihStats={mutashabihStats} />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
