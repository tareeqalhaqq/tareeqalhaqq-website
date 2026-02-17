'use client';

import { ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPageVerses, fetchSurahVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { getSurahByNumber } from '@/lib/quran-data';
import { findMostRelevantPageForSurah } from '@/lib/quran-text';
import type { AyahRange, MushafPosition, MushafReaderOptions, MushafReaderSelection, MushafViewMode } from './types';

type MushafReaderProps = {
  viewMode: MushafViewMode;
  position: MushafPosition;
  options: MushafReaderOptions;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  scrollTop: number;
  scrollRestoreKey: string;
  twoPageSpread: boolean;
  onPositionChange: (position: MushafPosition) => void;
  onPlayAyah: (surah: number, ayah: number) => void;
  onRangeChange: (range: AyahRange | null) => void;
  onSelectionChange: (selection: MushafReaderSelection) => void;
  onScrollPositionChange: (scrollTop: number) => void;
  onVersesLoaded?: (verses: Array<{ surah: number; ayah: number }>) => void;
};

const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064e\u0647\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';
const NO_BISMILLAH = new Set([1, 9]);

function AyahNumberMarker({ number }: { number: number }) {
  return (
    <span className="mushaf-ayah-marker">
      {number}
    </span>
  );
}

function SurahHeader({ surahNumber }: { surahNumber: number }) {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return null;
  return (
    <div className="mushaf-surah-header">
      <span className="text-lg">{surah.nameArabic}</span>
    </div>
  );
}

function SinglePageView({
  verses,
  page,
  activePlaybackAyah,
  onPlayAyah,
  onAyahTap,
  selectedAyahKey,
}: {
  verses: QuranVerse[];
  page: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
}) {
  // Collect surah headers
  const headers: React.ReactNode[] = [];
  let prevSurah = 0;
  for (const verse of verses) {
    if (verse.chapter_id !== prevSurah) {
      headers.push(
        <SurahHeader key={`hdr-${verse.chapter_id}`} surahNumber={verse.chapter_id} />
      );
      if (!NO_BISMILLAH.has(verse.chapter_id) && verse.verse_number === 1) {
        headers.push(
          <div key={`bis-${verse.chapter_id}`} className="mushaf-bismillah">{BISMILLAH}</div>
        );
      }
      prevSurah = verse.chapter_id;
    }
  }

  // Build continuous text with inline ayah markers
  const textParts: React.ReactNode[] = [];
  let lastSurah = 0;
  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];
    const isActive = activePlaybackAyah?.surah === verse.chapter_id && activePlaybackAyah?.ayah === verse.verse_number;
    const isSelected = selectedAyahKey === verse.verse_key;

    if (verse.chapter_id !== lastSurah && lastSurah !== 0) {
      textParts.push(<br key={`br-${verse.chapter_id}`} />);
    }
    lastSurah = verse.chapter_id;

    textParts.push(
      <span
        key={verse.verse_key}
        data-verse-key={verse.verse_key}
        className={`cursor-pointer transition-colors duration-200 ${
          isActive ? 'mushaf-highlight-active' : ''
        } ${isSelected ? 'bg-cyan-400/15 rounded px-0.5' : ''}`}
        onClick={() => onAyahTap(verse)}
        onDoubleClick={() => onPlayAyah(verse.chapter_id, verse.verse_number)}
      >
        {verse.text_uthmani}
      </span>
    );
    textParts.push(<AyahNumberMarker key={`m-${verse.verse_key}`} number={verse.verse_number} />);
    if (i < verses.length - 1) textParts.push(<span key={`sp-${i}`}> </span>);
  }

  return (
    <div className="mushaf-frame rounded-lg overflow-hidden h-full flex flex-col">
      <div className="px-5 py-4 sm:px-8 sm:py-6 flex-1 flex flex-col min-h-0">
        {headers}
        <div className="mushaf-page flex-1" dir="rtl">{textParts}</div>
        <div className="mt-2 text-center">
          <span className="text-[11px] text-[#8a7b55] font-sans tabular-nums">{page}</span>
        </div>
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
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
  rangeSelection: AyahRange | null;
}) {
  const surahMeta = getSurahByNumber(surah);

  return (
    <div className="space-y-1.5">
      {/* Surah header */}
      <div className="text-center py-3 border-b border-white/[0.08]">
        <h2 className="font-['Amiri_Quran','Noto_Naskh_Arabic',serif] text-2xl text-white/90">
          {surahMeta?.nameArabic}
        </h2>
        <p className="text-[11px] text-white/40 mt-0.5">
          {surahMeta?.name} &middot; {surahMeta?.verses} Ayat &middot; {surahMeta?.revelationType === 'meccan' ? 'Meccan' : 'Medinan'}
        </p>
      </div>

      {/* Bismillah */}
      {surahMeta && !NO_BISMILLAH.has(surah) && (
        <div className="text-center py-2 font-['Amiri_Quran','Noto_Naskh_Arabic',serif] text-xl text-white/60">
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
            className={`group relative rounded-lg border px-3 py-2.5 cursor-pointer transition-all duration-200 ${
              isSelected
                ? 'border-cyan-300/30 bg-cyan-400/[0.08]'
                : isInRange
                  ? 'border-cyan-300/15 bg-cyan-400/[0.04]'
                  : 'border-white/[0.05] bg-white/[0.015] hover:border-white/[0.1] hover:bg-white/[0.03]'
            } ${isActive ? 'ring-1 ring-emerald-300/30' : ''}`}
          >
            <div className="flex items-start gap-2">
              <div className="flex flex-col items-center gap-1 pt-1 shrink-0">
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full border border-white/10 text-[11px] text-white/50 font-sans tabular-nums">
                  {verse.verse_number}
                </span>
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); onPlayAyah(verse.chapter_id, verse.verse_number); }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity w-6 h-6 inline-flex items-center justify-center rounded-full border border-cyan-300/25 bg-cyan-400/10 text-cyan-200"
                >
                  <Play className="h-2.5 w-2.5" />
                </button>
              </div>
              <p
                dir="rtl"
                className="font-['Amiri_Quran','Noto_Naskh_Arabic',serif] text-[1.55rem] leading-[2.4] text-white/85 text-right flex-1"
              >
                {verse.text_uthmani}
              </p>
            </div>
          </article>
        );
      })}

      {verses.length === 0 && (
        <div className="text-center py-12">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300/30 mx-auto mb-2" />
          <p className="text-[11px] text-white/35">Loading ayat...</p>
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
  twoPageSpread,
  onPositionChange,
  onPlayAyah,
  onRangeChange,
  onSelectionChange,
  onScrollPositionChange,
  onVersesLoaded,
}: MushafReaderProps) {
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const restoredScrollTopRef = useRef(scrollTop);
  const [pageVerses, setPageVerses] = useState<QuranVerse[]>([]);
  const [secondPageVerses, setSecondPageVerses] = useState<QuranVerse[]>([]);
  const [surahVerses, setSurahVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAyahKey, setSelectedAyahKey] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<number | null>(null);

  // Compute spread pages: right page (odd) and left page (even)
  const rightPage = position.page % 2 === 1 ? position.page : position.page - 1;
  const leftPage = rightPage + 1;
  const effectiveSpread = twoPageSpread && viewMode === 'page';

  // Fetch page verses
  useEffect(() => {
    if (viewMode !== 'page') return;
    let cancelled = false;
    setLoading(true);

    if (effectiveSpread) {
      // Fetch both pages for two-page spread
      const rp = rightPage;
      const lp = Math.min(leftPage, 604);
      Promise.all([
        fetchPageVerses(rp),
        rp !== lp ? fetchPageVerses(lp) : Promise.resolve([]),
      ]).then(([rightVerses, leftVerses]) => {
        if (cancelled) return;
        setPageVerses(rightVerses);
        setSecondPageVerses(leftVerses);
        setLoading(false);
        // Emit all loaded verses for audio queue
        const allVerses = [...rightVerses, ...leftVerses];
        onVersesLoaded?.(allVerses.map(v => ({ surah: v.chapter_id, ayah: v.verse_number })));
        // Preload adjacent spread
        preloadAdjacentPages(rp);
        if (lp + 1 <= 604) void fetchPageVerses(lp + 1);
        if (lp + 2 <= 604) void fetchPageVerses(lp + 2);
      });
    } else {
      fetchPageVerses(position.page).then(verses => {
        if (cancelled) return;
        setPageVerses(verses);
        setSecondPageVerses([]);
        setLoading(false);
        onVersesLoaded?.(verses.map(v => ({ surah: v.chapter_id, ayah: v.verse_number })));
        preloadAdjacentPages(position.page);
      });
    }

    return () => { cancelled = true; };
  }, [viewMode, position.page, effectiveSpread, rightPage, leftPage, onVersesLoaded]);

  // Fetch surah verses
  useEffect(() => {
    if (viewMode !== 'ayah') return;
    let cancelled = false;
    setLoading(true);

    fetchSurahVerses(position.surah).then(verses => {
      if (cancelled) return;
      setSurahVerses(verses);
      setLoading(false);
      onVersesLoaded?.(verses.map(v => ({ surah: v.chapter_id, ayah: v.verse_number })));
    });

    return () => { cancelled = true; };
  }, [viewMode, position.surah, onVersesLoaded]);

  // Scroll restoration
  useEffect(() => { restoredScrollTopRef.current = scrollTop; }, [scrollTop]);
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

  const pageStep = effectiveSpread ? 2 : 1;

  const handlePageNav = useCallback((delta: number) => {
    const step = delta * pageStep;
    const nextPage = Math.max(1, Math.min(604, position.page + step));
    if (nextPage === position.page) return;
    onPositionChange({ ...position, page: nextPage });
    onRangeChange(null);
    setSelectedAyahKey(null);
  }, [onPositionChange, onRangeChange, position, pageStep]);

  const handleSurahNav = useCallback((delta: number) => {
    const nextSurah = Math.max(1, Math.min(114, position.surah + delta));
    if (nextSurah === position.surah) return;
    onPositionChange({
      ...position,
      surah: nextSurah,
      ayah: 1,
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

  return (
    <div className="flex flex-col h-full">
      {/* Main content area */}
      <div
        ref={scrollContainerRef}
        onScroll={e => onScrollPositionChange(e.currentTarget.scrollTop)}
        className="flex-1 overflow-y-auto overflow-x-hidden relative"
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-300/30 mb-2" />
            <p className="text-[11px] text-white/35">Loading...</p>
          </div>
        ) : viewMode === 'page' ? (
          effectiveSpread ? (
            /* Two-page spread: RTL order (right page first, left page second) */
            <div className="flex gap-3 h-full px-2 py-1" dir="rtl">
              <div className="flex-1 min-w-0">
                <SinglePageView
                  verses={pageVerses}
                  page={rightPage}
                  activePlaybackAyah={activePlaybackAyah}
                  onPlayAyah={onPlayAyah}
                  onAyahTap={handleAyahTap}
                  selectedAyahKey={selectedAyahKey}
                />
              </div>
              {secondPageVerses.length > 0 && (
                <div className="flex-1 min-w-0">
                  <SinglePageView
                    verses={secondPageVerses}
                    page={leftPage}
                    activePlaybackAyah={activePlaybackAyah}
                    onPlayAyah={onPlayAyah}
                    onAyahTap={handleAyahTap}
                    selectedAyahKey={selectedAyahKey}
                  />
                </div>
              )}
            </div>
          ) : (
            /* Single page */
            <div className="max-w-2xl mx-auto px-2 py-1 h-full">
              <SinglePageView
                verses={pageVerses}
                page={position.page}
                activePlaybackAyah={activePlaybackAyah}
                onPlayAyah={onPlayAyah}
                onAyahTap={handleAyahTap}
                selectedAyahKey={selectedAyahKey}
              />
            </div>
          )
        ) : (
          /* Ayah view */
          <div className="max-w-2xl mx-auto px-2 py-1">
            <MushafAyahView
              verses={surahVerses}
              surah={position.surah}
              activePlaybackAyah={activePlaybackAyah}
              onPlayAyah={onPlayAyah}
              onAyahTap={handleAyahTap}
              selectedAyahKey={selectedAyahKey}
              rangeSelection={null}
            />
          </div>
        )}

        {/* Page navigation arrows (page view only) */}
        {viewMode === 'page' && !loading && (
          <>
            <button
              type="button"
              onClick={() => handlePageNav(-1)}
              disabled={position.page <= 1}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center rounded-l-lg bg-black/20 text-white/30 hover:text-white/70 hover:bg-black/40 transition disabled:opacity-0"
              aria-label="Previous page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handlePageNav(1)}
              disabled={position.page >= 604}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center rounded-r-lg bg-black/20 text-white/30 hover:text-white/70 hover:bg-black/40 transition disabled:opacity-0"
              aria-label="Next page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Surah navigation (ayah view only) */}
        {viewMode === 'ayah' && !loading && (
          <>
            <button
              type="button"
              onClick={() => handleSurahNav(-1)}
              disabled={position.surah <= 1}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center rounded-l-lg bg-black/20 text-white/30 hover:text-white/70 hover:bg-black/40 transition disabled:opacity-0"
              aria-label="Previous surah"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => handleSurahNav(1)}
              disabled={position.surah >= 114}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-16 flex items-center justify-center rounded-r-lg bg-black/20 text-white/30 hover:text-white/70 hover:bg-black/40 transition disabled:opacity-0"
              aria-label="Next surah"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
