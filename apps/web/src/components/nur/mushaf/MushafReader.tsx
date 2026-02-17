'use client';

import { BookOpenText, ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchPageVerses, fetchSurahVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { getSurahByNumber, surahs } from '@/lib/quran-data';
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
    <span className={`mushaf-ayah-marker ${isDark ? 'mushaf-ayah-marker-dark' : ''}`}>
      {number}
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
}: {
  verses: QuranVerse[];
  page: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
}) {
  // Group consecutive verses and detect surah boundaries
  const elements: React.ReactNode[] = [];
  let lastSurah = 0;

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];
    const isNewSurah = verse.chapter_id !== lastSurah;

    if (isNewSurah) {
      // Surah header
      elements.push(
        <SurahHeader key={`header-${verse.chapter_id}`} surahNumber={verse.chapter_id} />
      );

      // Bismillah (skip for Al-Fatihah and At-Tawbah)
      if (!NO_BISMILLAH.has(verse.chapter_id)) {
        elements.push(
          <div key={`bismillah-${verse.chapter_id}`} className="mushaf-bismillah">
            {BISMILLAH}
          </div>
        );
      }

      lastSurah = verse.chapter_id;
    }
  }

  // Build the continuous text with inline ayah markers
  const textParts: React.ReactNode[] = [];
  lastSurah = 0;

  for (let i = 0; i < verses.length; i++) {
    const verse = verses[i];
    const isNewSurah = verse.chapter_id !== lastSurah;
    const isActive = activePlaybackAyah?.surah === verse.chapter_id && activePlaybackAyah?.ayah === verse.verse_number;
    const isSelected = selectedAyahKey === verse.verse_key;

    if (isNewSurah && lastSurah !== 0) {
      // Line break before new surah inline
      textParts.push(<br key={`br-${verse.chapter_id}`} />);
    }

    lastSurah = verse.chapter_id;

    textParts.push(
      <span
        key={verse.verse_key}
        data-verse-key={verse.verse_key}
        className={`cursor-pointer transition-colors duration-200 ${
          isActive ? 'mushaf-highlight-active' : ''
        } ${isSelected ? 'bg-cyan-400/15 rounded px-1' : ''}`}
        onClick={() => onAyahTap(verse)}
        onDoubleClick={() => onPlayAyah(verse.chapter_id, verse.verse_number)}
      >
        {verse.text_uthmani}
      </span>
    );

    textParts.push(
      <AyahNumberMarker key={`marker-${verse.verse_key}`} number={verse.verse_number} />
    );

    // Add space between ayahs
    if (i < verses.length - 1) {
      textParts.push(<span key={`space-${i}`}> </span>);
    }
  }

  return (
    <div className="mushaf-frame rounded-lg overflow-hidden">
      <div className="px-6 py-5 sm:px-10 sm:py-8 min-h-[520px] flex flex-col">
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

        {/* Continuous ayah text */}
        <div className="mushaf-page flex-1" dir="rtl">
          {textParts}
        </div>

        {/* Page number */}
        <div className="mt-4 text-center">
          <span className="text-xs text-[#8a7b55] font-sans tabular-nums">{page}</span>
        </div>
      </div>
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
  const [surahVerses, setSurahVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAyahKey, setSelectedAyahKey] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<number | null>(null);

  // Fetch page verses
  useEffect(() => {
    if (viewMode !== 'page') return;
    let cancelled = false;
    setLoading(true);

    fetchPageVerses(position.page).then(verses => {
      if (!cancelled) {
        setPageVerses(verses);
        setLoading(false);
        preloadAdjacentPages(position.page);
      }
    });

    return () => { cancelled = true; };
  }, [viewMode, position.page]);

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
    const nextPage = Math.max(1, Math.min(604, position.page + delta));
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
    <div className="space-y-3">
      {/* Navigation bar */}
      {viewMode === 'page' ? (
        <div className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-black/20 p-2">
          <button
            type="button"
            onClick={() => handlePageNav(-1)}
            disabled={position.page <= 1}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-white/90">Page {position.page}</p>
            <p className="text-[11px] text-white/40">of 604</p>
          </div>
          <button
            type="button"
            onClick={() => handlePageNav(1)}
            disabled={position.page >= 604}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2 rounded-xl border border-white/[0.08] bg-black/20 p-2">
          <button
            type="button"
            onClick={() => handleSurahNav(-1)}
            disabled={position.surah <= 1}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
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
            onClick={() => handleSurahNav(1)}
            disabled={position.surah >= 114}
            className="rounded-lg border border-white/10 p-2.5 text-white/80 transition hover:bg-white/5 disabled:opacity-30"
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
          <MushafPageView
            verses={pageVerses}
            page={position.page}
            activePlaybackAyah={activePlaybackAyah}
            onPlayAyah={onPlayAyah}
            onAyahTap={handleAyahTap}
            selectedAyahKey={selectedAyahKey}
          />
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
          {viewMode === 'page' ? `Page ${position.page}` : getSurahLabel(position.surah)}
        </div>
        <span>Tap ayah to select &middot; Double-tap to play</span>
      </div>
    </div>
  );
}
