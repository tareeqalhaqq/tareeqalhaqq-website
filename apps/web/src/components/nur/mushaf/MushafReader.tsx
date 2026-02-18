'use client';

import { ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchSurahVerses, type QuranVerse } from '@/lib/quran-api';
import { getSurahByNumber, surahs } from '@/lib/quran-data';
import {
  clampAyahToSurah,
  findMostRelevantPageForSurah,
} from '@/lib/quran-text';
import type { AyahRange, MushafPosition, MushafReaderOptions, MushafReaderSelection, MushafViewMode } from './types';
import {
  MUSHAF_TOTAL_PAGES,
  MushafPageCanvas,
  MushafPageFlipNav,
  MushafPageSpreadCanvas,
  useMushafAudioHooks,
  useMushafPageData,
} from './page-layers';
import {
  QcfMushafPageCanvas,
  QcfMushafPageSpreadCanvas,
  useQcfPageData,
} from './qcf-page-layers';

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
  const [surahVerses, setSurahVerses] = useState<QuranVerse[]>([]);
  const [surahLoading, setSurahLoading] = useState(false);
  const [selectedAyahKey, setSelectedAyahKey] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const { onAudioPageFlip } = useMushafAudioHooks();

  // QCF v2 glyph data (preferred: pixel-perfect Mushaf rendering)
  const {
    data: qcfData,
    spreadData: qcfSpreadData,
    loading: qcfLoading,
    failed: qcfFailed,
    spread: qcfSpread,
  } = useQcfPageData(position.page, options.pagePairMode, viewMode);

  // Text fallback data (used when QCF credentials are missing or API fails)
  const {
    pageVerses,
    spreadPageVerses,
    loading: textLoading,
    spread: textSpread,
  } = useMushafPageData(position.page, options.pagePairMode, viewMode);

  // Determine which rendering path to use
  const useQcf = !qcfFailed && qcfData !== null;
  const spread = useQcf ? qcfSpread : textSpread;
  const isPageLoading = qcfLoading || (qcfFailed && textLoading);

  // Fetch surah verses
  useEffect(() => {
    if (viewMode !== 'ayah') return;
    let cancelled = false;
    setSurahLoading(true);

    fetchSurahVerses(position.surah).then(verses => {
      if (!cancelled) {
        setSurahVerses(verses);
        setSurahLoading(false);
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
      onAudioPageFlip(nextLeadPage);
      onRangeChange(null);
      setSelectedAyahKey(null);
      return;
    }

    const nextPage = Math.max(1, Math.min(MUSHAF_TOTAL_PAGES, position.page + delta));
    if (nextPage === position.page) return;
    onPositionChange({ ...position, page: nextPage });
    onAudioPageFlip(nextPage);
    onRangeChange(null);
    setSelectedAyahKey(null);
  }, [onAudioPageFlip, onPositionChange, onRangeChange, options.pagePairMode, position, spread.rightPage]);

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

  // ── Page view content renderer ──

  function renderPageView() {
    // QCF v2 glyph rendering (preferred — pixel-perfect Mushaf)
    if (useQcf && qcfData) {
      if (options.pagePairMode === 'spread' && qcfSpreadData) {
        return (
          <QcfMushafPageSpreadCanvas
            rightData={qcfData}
            leftData={qcfSpreadData}
            rightPage={spread.rightPage}
            leftPage={spread.leftPage}
            activePlaybackAyah={activePlaybackAyah}
            onPlayAyah={onPlayAyah}
            onAyahTap={handleAyahTap}
            selectedAyahKey={selectedAyahKey}
          />
        );
      }
      return (
        <QcfMushafPageCanvas
          data={qcfData}
          page={position.page}
          activePlaybackAyah={activePlaybackAyah}
          onPlayAyah={onPlayAyah}
          onAyahTap={handleAyahTap}
          selectedAyahKey={selectedAyahKey}
        />
      );
    }

    // Text fallback (Uthmanic script with heuristic line breaks)
    if (options.pagePairMode === 'spread') {
      return (
        <MushafPageSpreadCanvas
          rightPageVerses={pageVerses}
          leftPageVerses={spreadPageVerses}
          rightPage={textSpread.rightPage}
          leftPage={textSpread.leftPage}
          activePlaybackAyah={activePlaybackAyah}
          onPlayAyah={onPlayAyah}
          onAyahTap={handleAyahTap}
          selectedAyahKey={selectedAyahKey}
        />
      );
    }
    return (
      <MushafPageCanvas
        verses={pageVerses}
        page={position.page}
        activePlaybackAyah={activePlaybackAyah}
        onPlayAyah={onPlayAyah}
        onAyahTap={handleAyahTap}
        selectedAyahKey={selectedAyahKey}
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      {/* Compact navigation bar */}
      {viewMode === 'page' ? (
        <MushafPageFlipNav page={position.page} pagePairMode={options.pagePairMode} spread={spread} onFlip={handlePageNav} />
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
        {(viewMode === 'page' ? isPageLoading : surahLoading) ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-cyan-300/40 mb-2" />
            <p className="text-xs text-white/40">Loading Quran text...</p>
          </div>
        ) : viewMode === 'page' ? (
          renderPageView()
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
