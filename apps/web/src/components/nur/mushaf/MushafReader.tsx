'use client';

import { BookOpenText, ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPageVerses, fetchSurahVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { getSurahByNumber, surahs } from '@/lib/quran-data';
import { buildMushafLayoutLines } from '@/lib/mushaf-layout';
import {
  clampAyahToSurah,
  findMostRelevantPageForSurah,
  getSurahLabel,
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

const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064e\u0647\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';

// Surahs that don't start with Bismillah
const NO_BISMILLAH = new Set([1, 9]);

function AyahNumberMarker({ number, isDark }: { number: number; isDark?: boolean }) {
  return (
    <span className={`mushaf-ayah-marker ${isDark ? 'mushaf-ayah-marker-dark' : ''}`} aria-label={`Ayah ${number}`}>
      <svg viewBox="0 0 100 100" className="h-[1.7em] w-[1.7em]" aria-hidden="true">
        <polygon points="50,3 65,16 84,16 84,35 97,50 84,65 84,84 65,84 50,97 35,84 16,84 16,65 3,50 16,35 16,16 35,16" fill="none" stroke="currentColor" strokeWidth="4" />
      </svg>
      <span className="mushaf-ayah-marker-number">{number}</span>
    </span>
  );
}

function SurahHeader({ surahNumber, isDark }: { surahNumber: number; isDark?: boolean }) {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return null;

  return (
    <div className={`mushaf-surah-header ${isDark ? 'mushaf-surah-header-dark' : ''}`}>
      <span className="text-lg">{surah.nameArabic}</span>
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
    <div className="mushaf-frame mushaf-book-page rounded-lg overflow-hidden">
      <div className={`px-4 py-4 sm:px-6 sm:py-5 ${compact ? 'min-h-[430px]' : 'min-h-[520px]'} flex flex-col`}>
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

        {/* Fixed layout lines (no browser wrapping) */}
        <div className="mushaf-page flex-1" dir="rtl">
          {lines.map(line => (
            <div key={`line-${line.index}`} className="mushaf-layout-line" role="presentation">
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
                    className={`cursor-pointer transition-colors duration-200 px-[0.05em] ${isActive ? 'mushaf-highlight-active' : ''} ${isSelected ? 'bg-cyan-400/15 rounded' : ''}`}
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

        {/* Page number */}
        <div className="mt-4 text-center">
          <span className="text-xs text-[#8a7b55] font-sans tabular-nums">{page}</span>
        </div>
      </div>
    </div>
  );
}


function MushafPageSpreadView({
  firstPageVerses,
  secondPageVerses,
  firstPage,
  secondPage,
  activePlaybackAyah,
  onPlayAyah,
  onAyahTap,
  selectedAyahKey,
}: {
  firstPageVerses: QuranVerse[];
  secondPageVerses: QuranVerse[];
  firstPage: number;
  secondPage: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
}) {
  return (
    <div className="grid gap-3 rounded-xl border border-[#d7c79f]/35 bg-[#f5e9ca]/90 p-3 shadow-[0_12px_40px_rgba(0,0,0,0.2)] lg:grid-cols-2" dir="rtl">
      <MushafPageView
        verses={firstPageVerses}
        page={firstPage}
        activePlaybackAyah={activePlaybackAyah}
        onPlayAyah={onPlayAyah}
        onAyahTap={onAyahTap}
        selectedAyahKey={selectedAyahKey}
        compact
      />
      <MushafPageView
        verses={secondPageVerses}
        page={secondPage}
        activePlaybackAyah={activePlaybackAyah}
        onPlayAyah={onPlayAyah}
        onAyahTap={onAyahTap}
        selectedAyahKey={selectedAyahKey}
        compact
      />
    </div>
  );
}
function MushafAyahView({
  verses,
  surah,
  activePlaybackAyah,
  options,
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
      <div className="text-center py-4 border-b border-white/10">
        <h2 className="font-['Amiri_Quran','Noto_Naskh_Arabic',serif] text-3xl text-white/90">
          {surahMeta?.nameArabic}
        </h2>
        <p className="text-xs text-white/50 mt-1">
          {surahMeta?.name} &middot; {surahMeta?.verses} Ayat &middot; {surahMeta?.revelationType === 'meccan' ? 'Meccan' : 'Medinan'}
        </p>
      </div>

      {/* Bismillah */}
      {surahMeta && !NO_BISMILLAH.has(surah) && (
        <div className="text-center py-3 font-['Amiri_Quran','Noto_Naskh_Arabic',serif] text-2xl text-white/70">
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
            className={`group relative rounded-xl border p-4 cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'border-cyan-300/40 bg-cyan-400/10'
                : isInRange
                  ? 'border-cyan-300/20 bg-cyan-400/5'
                  : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12] hover:bg-white/[0.04]'
            } ${isActive ? 'ring-1 ring-emerald-300/40' : ''}`}
          >
            {/* Ayah number badge + play button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/15 text-xs text-white/60 font-sans tabular-nums">
                  {verse.verse_number}
                </span>
                <span className="text-[11px] text-white/40">{verse.verse_key}</span>
              </div>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  onPlayAyah(verse.chapter_id, verse.verse_number);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1 rounded-full border border-cyan-300/30 bg-cyan-400/10 px-3 py-1.5 text-[11px] text-cyan-100"
              >
                <Play className="h-3 w-3" />
                Play
              </button>
            </div>

            {/* Arabic text */}
            <p
              dir="rtl"
              className="font-['Amiri_Quran','Noto_Naskh_Arabic',serif] text-[1.75rem] leading-[2.6] text-white/90 text-right"
            >
              {verse.text_uthmani}
            </p>
          </article>
        );
      })}

      {verses.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300/40 mx-auto mb-2" />
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

  // Fetch page verses
  useEffect(() => {
    if (viewMode !== 'page') return;
    let cancelled = false;
    setLoading(true);

    const pageStart = options.pagePairMode === 'spread'
      ? (position.page % 2 === 0 ? Math.max(position.page - 1, 1) : position.page)
      : position.page;

    const tasks = [fetchPageVerses(pageStart)];
    if (options.pagePairMode === 'spread' && pageStart < 604) {
      tasks.push(fetchPageVerses(pageStart + 1));
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
  }, [options.pagePairMode, viewMode, position.page]);

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
    const step = options.pagePairMode === 'spread' ? 2 : 1;
    const nextPage = Math.max(1, Math.min(604, position.page + (delta * step)));
    if (nextPage === position.page) return;
    onPositionChange({ ...position, page: nextPage });
    onRangeChange(null);
    setSelectedAyahKey(null);
  }, [onPositionChange, onRangeChange, position]);

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
  }, [onPositionChange, onRangeChange, options.pagePairMode, position]);

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
    <div className="space-y-3">
      {/* Navigation bar */}
      {viewMode === 'page' ? (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/20 p-2">
          <button
            type="button"
            onClick={() => handlePageNav(1)}
            disabled={position.page >= (options.pagePairMode === 'spread' ? 603 : 604)}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
            aria-label="Next page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/90">
              {options.pagePairMode === 'spread'
                ? `Pages ${position.page % 2 === 0 ? position.page - 1 : position.page}–${Math.min((position.page % 2 === 0 ? position.page : position.page + 1), 604)}`
                : `Page ${position.page}`}
            </p>
            <p className="text-[11px] text-white/40">of 604</p>
          </div>
          <button
            type="button"
            onClick={() => handlePageNav(-1)}
            disabled={position.page <= 1}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
            aria-label="Previous page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-2">
          <button
            type="button"
            onClick={() => handleSurahNav(1)}
            disabled={position.surah >= 114}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
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
            className="flex-1 bg-transparent text-center text-sm text-white/90 outline-none appearance-none cursor-pointer"
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
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
            aria-label="Previous surah"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main content area */}
      <div
        ref={scrollContainerRef}
        onScroll={e => onScrollPositionChange(e.currentTarget.scrollTop)}
        className="overflow-y-auto overflow-x-hidden"
        style={{ maxHeight: 'calc(100vh - 280px)', minHeight: '400px' }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-300/40 mb-3" />
            <p className="text-sm text-white/40">Loading Quran text...</p>
          </div>
        ) : viewMode === 'page' ? (
          options.pagePairMode === 'spread' ? (
            <MushafPageSpreadView
              firstPageVerses={pageVerses}
              secondPageVerses={spreadPageVerses}
              firstPage={position.page % 2 === 0 ? position.page - 1 : position.page}
              secondPage={Math.min((position.page % 2 === 0 ? position.page : position.page + 1), 604)}
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

      {/* Info bar */}
      <div className="flex items-center justify-between text-[11px] text-white/40 px-1">
        <div className="flex items-center gap-1.5">
          <BookOpenText className="h-3 w-3" />
          {viewMode === 'page'
            ? options.pagePairMode === 'spread'
              ? `Pages ${position.page % 2 === 0 ? position.page - 1 : position.page}-${Math.min((position.page % 2 === 0 ? position.page : position.page + 1), 604)}`
              : `Page ${position.page}`
            : getSurahLabel(position.surah)}
        </div>
        <span>Tap ayah to select &middot; Double-tap to play</span>
      </div>
    </div>
  );
}
