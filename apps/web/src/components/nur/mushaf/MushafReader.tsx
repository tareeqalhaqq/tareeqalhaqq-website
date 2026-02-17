'use client';

import { ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPageVerses, fetchSurahVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { getSurahByNumber, surahs } from '@/lib/quran-data';
import { buildMushafLayoutLines } from '@/lib/mushaf-layout';
import {
  clampAyahToSurah,
  findMostRelevantPageForSurah,
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

const MUSHAF_TOTAL_PAGES = 604;

function getSpreadPages(page: number) {
  const safePage = Math.max(1, Math.min(MUSHAF_TOTAL_PAGES, page));
  if (safePage <= 1) {
    return { rightPage: 1, leftPage: 2 };
  }
  if (safePage >= MUSHAF_TOTAL_PAGES) {
    return { rightPage: MUSHAF_TOTAL_PAGES - 1, leftPage: MUSHAF_TOTAL_PAGES };
  }

  return safePage % 2 === 1
    ? { rightPage: safePage, leftPage: safePage + 1 }
    : { rightPage: safePage - 1, leftPage: safePage };
}

const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064e\u0647\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';

// Surahs that don't start with Bismillah
const NO_BISMILLAH = new Set([1, 9]);

function AyahNumberMarker({ number }: { number: number }) {
  return (
    <span className="mushaf-ayah-marker" aria-label={`Ayah ${number}`}>
      <svg viewBox="0 0 100 100" className="h-[1.5em] w-[1.5em]" aria-hidden="true">
        <polygon
          points="50,2 62,15 82,15 82,35 98,50 82,65 82,85 62,85 50,98 38,85 18,85 18,65 2,50 18,35 18,15 38,15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
        />
      </svg>
      <span className="mushaf-ayah-marker-number">{number}</span>
    </span>
  );
}

function SurahHeader({ surahNumber }: { surahNumber: number }) {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return null;

  return (
    <div className="mushaf-surah-header">
      <span className="text-base">{surah.nameArabic}</span>
    </div>
  );
}

function MushafPageView({
  verses,
  page,
  activePlaybackAyah,
  onPlayAyah,
  onAyahTap,
  selectedAyahKey,
  compact,
}: {
  verses: QuranVerse[];
  page: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
  compact?: boolean;
}) {
  const lines = buildMushafLayoutLines(page, verses);
  const verseByKey = new Map(verses.map(verse => [verse.verse_key, verse]));

  return (
    <div className={`mushaf-frame mx-auto w-full rounded-lg overflow-hidden ${compact ? 'max-w-[22rem]' : 'max-w-[32rem]'}`}>
      <div className="relative flex flex-col px-5 pb-10 pt-4 sm:px-7 sm:pb-12 sm:pt-5" style={{ minHeight: compact ? '28rem' : '36rem' }}>
        {/* Top decorative rules */}
        <div className="mushaf-page-top-rules" aria-hidden="true">
          <span className="mushaf-page-top-rule" />
          <span className="mushaf-page-top-rule mushaf-page-top-rule-accent" />
        </div>

        {/* Surah headers at top of page */}
        {(() => {
          const headers: React.ReactNode[] = [];
          let prevSurah = 0;
          for (const verse of verses) {
            if (verse.chapter_id !== prevSurah) {
              headers.push(
                <SurahHeader key={`hdr-${verse.chapter_id}`} surahNumber={verse.chapter_id} />
              );
              if (!NO_BISMILLAH.has(verse.chapter_id) && verse.verse_number === 1) {
                headers.push(
                  <div key={`bis-${verse.chapter_id}`} className="mushaf-bismillah">
                    {BISMILLAH}
                  </div>
                );
              }
              prevSurah = verse.chapter_id;
            }
          }
          return headers;
        })()}

        {/* Mushaf text lines – justified RTL */}
        <div className="mushaf-page flex-1" dir="rtl">
          {lines.map(line => (
            <div
              key={`line-${line.index}`}
              className={`mushaf-layout-line ${line.isLast ? 'mushaf-layout-line--last' : ''}`}
              role="presentation"
            >
              {line.segments.map((segment, segmentIndex) => {
                const isActive = activePlaybackAyah?.surah === segment.surah && activePlaybackAyah?.ayah === segment.ayah;
                const isSelected = selectedAyahKey === segment.verseKey;
                if (segment.type === 'marker') {
                  return <AyahNumberMarker key={`m-${segment.verseKey}-${segmentIndex}`} number={segment.ayah} />;
                }

                const verse = verseByKey.get(segment.verseKey);
                if (!verse || !segment.text) return null;

                return (
                  <span
                    key={`w-${segment.verseKey}-${segmentIndex}`}
                    data-verse-key={segment.verseKey}
                    className={`cursor-pointer transition-colors duration-150 ${isActive ? 'mushaf-highlight-active' : ''} ${isSelected ? 'bg-cyan-400/10 rounded-sm' : ''}`}
                    onClick={() => onAyahTap(verse)}
                    onDoubleClick={() => onPlayAyah(verse.chapter_id, verse.verse_number)}
                  >
                    {segment.text}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom decorative rule */}
        <div className="mushaf-page-bottom-rule" aria-hidden="true" />

        {/* Page number */}
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-center sm:bottom-3">
          <span className="font-sans text-[11px] tabular-nums text-[#8a7b55]">{page}</span>
        </div>
      </div>
    </div>
  );
}


function MushafPageSpreadView({
  rightPageVerses,
  leftPageVerses,
  rightPage,
  leftPage,
  activePlaybackAyah,
  onPlayAyah,
  onAyahTap,
  selectedAyahKey,
}: {
  rightPageVerses: QuranVerse[];
  leftPageVerses: QuranVerse[];
  rightPage: number;
  leftPage: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
}) {
  return (
    <div
      className="relative grid items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]"
      dir="rtl"
    >
      <div className="flex h-full items-stretch">
        <MushafPageView
          verses={rightPageVerses}
          page={rightPage}
          activePlaybackAyah={activePlaybackAyah}
          onPlayAyah={onPlayAyah}
          onAyahTap={onAyahTap}
          selectedAyahKey={selectedAyahKey}
          compact
        />
      </div>

      <div className="relative hidden h-full lg:block" aria-hidden="true">
        <div className="absolute inset-y-4 left-0 w-px bg-[#c4b690]/40" />
      </div>

      <div className="flex h-full items-stretch">
        <MushafPageView
          verses={leftPageVerses}
          page={leftPage}
          activePlaybackAyah={activePlaybackAyah}
          onPlayAyah={onPlayAyah}
          onAyahTap={onAyahTap}
          selectedAyahKey={selectedAyahKey}
          compact
        />
      </div>
    </div>
  );
}

function MushafAyahView({
  verses,
  surah,
  activePlaybackAyah,
  onPlayAyah,
  onAyahTap,
  selectedAyahKey,
  rangeSelection,
}: {
  verses: QuranVerse[];
  surah: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  options: MushafReaderOptions;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
  rangeSelection: AyahRange | null;
}) {
  const surahMeta = getSurahByNumber(surah);

  return (
    <div className="space-y-2">
      {/* Surah header */}
      <div className="mushaf-surah-header">
        <p className="font-['KFGQPC_Hafs','UthmanTN',serif] text-2xl">{surahMeta?.nameArabic}</p>
        <p className="text-[11px] text-[#8a7b55] mt-0.5 font-sans">
          {surahMeta?.name} &middot; {surahMeta?.verses} Ayat &middot; {surahMeta?.revelationType === 'meccan' ? 'Meccan' : 'Medinan'}
        </p>
      </div>

      {/* Bismillah */}
      {surahMeta && !NO_BISMILLAH.has(surah) && (
        <div className="mushaf-bismillah text-xl">
          {BISMILLAH}
        </div>
      )}

      {/* Ayah list */}
      {verses.map(verse => {
        const isActive = activePlaybackAyah?.surah === verse.chapter_id && activePlaybackAyah.ayah === verse.verse_number;
        const isSelected = selectedAyahKey === verse.verse_key;
        const isInRange = rangeSelection && verse.chapter_id === surah &&
          verse.verse_number >= rangeSelection.startAyah &&
          verse.verse_number <= rangeSelection.endAyah;

        return (
          <article
            key={verse.verse_key}
            data-verse-key={verse.verse_key}
            onClick={() => onAyahTap(verse)}
            className={`group relative rounded-lg border p-3 cursor-pointer transition-all duration-150 ${
              isSelected
                ? 'border-cyan-300/40 bg-cyan-400/10'
                : isInRange
                  ? 'border-cyan-300/20 bg-cyan-400/5'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
            } ${isActive ? 'ring-1 ring-emerald-300/40' : ''}`}
          >
            {/* Ayah number + play */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/15 text-[10px] text-white/60 font-sans tabular-nums">
                  {verse.verse_number}
                </span>
                <span className="text-[10px] text-white/35 font-sans">{verse.verse_key}</span>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onPlayAyah(verse.chapter_id, verse.verse_number);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-2 py-1 text-[10px] text-cyan-100"
              >
                <Play className="h-2.5 w-2.5" />
                Play
              </button>
            </div>

            {/* Arabic text */}
            <p
              dir="rtl"
              className="font-['KFGQPC_Hafs','UthmanTN',serif] text-[1.6rem] leading-[2.4] text-white/90 text-right"
            >
              {verse.text_uthmani}
            </p>
          </article>
        );
      })}

      {verses.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300/40 mx-auto mb-2" />
          <p className="text-xs text-white/40">Loading ayat...</p>
        </div>
      )}
    </div>
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
  const [pageVerses, setPageVerses] = useState<QuranVerse[]>([]);
  const [spreadPageVerses, setSpreadPageVerses] = useState<QuranVerse[]>([]);
  const [surahVerses, setSurahVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAyahKey, setSelectedAyahKey] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const spread = getSpreadPages(position.page);

  // Fetch page verses
  useEffect(() => {
    if (viewMode !== 'page') return;
    let cancelled = false;
    setLoading(true);

    const pageStart = options.pagePairMode === 'spread' ? spread.rightPage : position.page;

    const tasks = [fetchPageVerses(pageStart)];
    if (options.pagePairMode === 'spread') {
      tasks.push(fetchPageVerses(spread.leftPage));
    }

    Promise.all(tasks).then(([first, second]) => {
      if (!cancelled) {
        setPageVerses(first ?? []);
        setSpreadPageVerses(second ?? []);
        setLoading(false);
        preloadAdjacentPages(pageStart);
      }
    });

    return () => { cancelled = true; };
  }, [options.pagePairMode, spread.leftPage, spread.rightPage, viewMode, position.page]);

  // Fetch surah verses
  useEffect(() => {
    if (viewMode !== 'ayah') return;
    let cancelled = false;
    setLoading(true);

    fetchSurahVerses(position.surah).then(verses => {
      if (!cancelled) {
        setSurahVerses(verses);
        setLoading(false);
      }
    });

    return () => { cancelled = true; };
  }, [viewMode, position.surah]);

  // Scroll restoration
  useEffect(() => {
    restoredScrollTopRef.current = scrollTop;
  }, [scrollTop]);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollTop = Math.max(0, restoredScrollTopRef.current);
  }, [scrollRestoreKey]);

  // Auto-scroll to active playback ayah
  useEffect(() => {
    if (!options.followPlayback || !activePlaybackAyah || !scrollContainerRef.current) return;
    const target = scrollContainerRef.current.querySelector<HTMLElement>(
      `[data-verse-key="${activePlaybackAyah.surah}:${activePlaybackAyah.ayah}"]`,
    );
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [activePlaybackAyah, options.followPlayback]);

  const handlePageNav = useCallback((delta: number) => {
    if (options.pagePairMode === 'spread') {
      const nextLeadPage = Math.max(1, Math.min(MUSHAF_TOTAL_PAGES - 1, spread.rightPage + (delta * 2)));
      if (nextLeadPage === spread.rightPage) return;
      onPositionChange({ ...position, page: nextLeadPage });
      onRangeChange(null);
      setSelectedAyahKey(null);
      return;
    }

    const nextPage = Math.max(1, Math.min(MUSHAF_TOTAL_PAGES, position.page + delta));
    if (nextPage === position.page) return;
    onPositionChange({ ...position, page: nextPage });
    onRangeChange(null);
    setSelectedAyahKey(null);
  }, [onPositionChange, onRangeChange, options.pagePairMode, position, spread.rightPage]);

  const handleSurahNav = useCallback((delta: number) => {
    const nextSurah = Math.max(1, Math.min(114, position.surah + delta));
    if (nextSurah === position.surah) return;
    const clampedAyah = clampAyahToSurah(nextSurah, 1);
    onPositionChange({
      ...position,
      surah: nextSurah,
      ayah: clampedAyah,
      page: findMostRelevantPageForSurah(nextSurah),
    });
    onRangeChange(null);
    setSelectedAyahKey(null);
  }, [onPositionChange, onRangeChange, position]);

  const handleAyahTap = useCallback((verse: QuranVerse) => {
    setSelectedAyahKey(verse.verse_key);
    onPositionChange({
      ...position,
      surah: verse.chapter_id,
      ayah: verse.verse_number,
      page: verse.page_number,
    });

    // Range selection logic
    if (rangeStart !== null && verse.chapter_id === position.surah) {
      const start = Math.min(rangeStart, verse.verse_number);
      const end = Math.max(rangeStart, verse.verse_number);
      const range: AyahRange = { startAyah: start, endAyah: end };
      onRangeChange(range);
      onSelectionChange({
        activeAyah: {
          key: verse.verse_key,
          surah: verse.chapter_id,
          ayah: verse.verse_number,
          page: verse.page_number,
          text: verse.text_uthmani,
          tokens: [],
        },
        range,
      });
      setRangeStart(null);
    } else {
      onRangeChange(null);
      onSelectionChange({
        activeAyah: {
          key: verse.verse_key,
          surah: verse.chapter_id,
          ayah: verse.verse_number,
          page: verse.page_number,
          text: verse.text_uthmani,
          tokens: [],
        },
        range: null,
      });
    }
  }, [onPositionChange, onRangeChange, onSelectionChange, position, rangeStart]);

  // Surah selector for ayah view
  const surahOptions = surahs.map(s => ({
    number: s.number,
    label: `${s.number}. ${s.name}`,
    arabic: s.nameArabic,
  }));

  const activeRange: AyahRange | null = rangeStart !== null ? null : (
    selectedAyahKey ? null : null
  );

  return (
    <div className="flex h-full flex-col">
      {/* Compact navigation bar */}
      {viewMode === 'page' ? (
        <div className="flex items-center justify-between px-2 py-1.5">
          <button
            type="button"
            onClick={() => handlePageNav(1)}
            disabled={options.pagePairMode === 'spread' ? spread.rightPage >= MUSHAF_TOTAL_PAGES - 1 : position.page >= MUSHAF_TOTAL_PAGES}
            className="rounded-md p-1.5 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
            aria-label="Next page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <p className="text-xs text-white/60 font-sans tabular-nums">
            {options.pagePairMode === 'spread'
              ? `${spread.rightPage}–${spread.leftPage}`
              : `${position.page}`}
            <span className="text-white/30 ml-1">/ {MUSHAF_TOTAL_PAGES}</span>
          </p>
          <button
            type="button"
            onClick={() => handlePageNav(-1)}
            disabled={position.page <= 1}
            className="rounded-md p-1.5 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
            aria-label="Previous page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 px-2 py-1.5">
          <button
            type="button"
            onClick={() => handleSurahNav(1)}
            disabled={position.surah >= 114}
            className="rounded-md p-1.5 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
            aria-label="Next surah"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <select
            value={position.surah}
            onChange={e => {
              const num = Number(e.target.value);
              onPositionChange({
                ...position,
                surah: num,
                ayah: 1,
                page: findMostRelevantPageForSurah(num),
              });
              onRangeChange(null);
              setSelectedAyahKey(null);
            }}
            className="flex-1 bg-transparent text-center text-xs text-white/70 outline-none appearance-none cursor-pointer"
          >
            {surahOptions.map(s => (
              <option key={s.number} value={s.number} className="bg-slate-900 text-white">
                {s.label} - {s.arabic}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => handleSurahNav(-1)}
            disabled={position.surah <= 1}
            className="rounded-md p-1.5 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
            aria-label="Previous surah"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main content area – takes all available space */}
      <div
        ref={scrollContainerRef}
        onScroll={e => onScrollPositionChange(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto overflow-x-hidden px-1"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-300/40 mb-2" />
            <p className="text-xs text-white/40">Loading Quran text...</p>
          </div>
        ) : viewMode === 'page' ? (
          options.pagePairMode === 'spread' ? (
            <MushafPageSpreadView
              rightPageVerses={pageVerses}
              leftPageVerses={spreadPageVerses}
              rightPage={spread.rightPage}
              leftPage={spread.leftPage}
              activePlaybackAyah={activePlaybackAyah}
              onPlayAyah={onPlayAyah}
              onAyahTap={handleAyahTap}
              selectedAyahKey={selectedAyahKey}
            />
          ) : (
            <MushafPageView
              verses={pageVerses}
              page={position.page}
              activePlaybackAyah={activePlaybackAyah}
              onPlayAyah={onPlayAyah}
              onAyahTap={handleAyahTap}
              selectedAyahKey={selectedAyahKey}
            />
          )
        ) : (
          <MushafAyahView
            verses={surahVerses}
            surah={position.surah}
            activePlaybackAyah={activePlaybackAyah}
            options={options}
            onPlayAyah={onPlayAyah}
            onAyahTap={handleAyahTap}
            selectedAyahKey={selectedAyahKey}
            rangeSelection={activeRange}
          />
        )}
      </div>

      {/* Minimal info line */}
      <div className="flex items-center justify-center py-1 text-[10px] text-white/30">
        <span>Tap to select &middot; Double-tap to play</span>
      </div>
    </div>
  );
}
