'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { fetchPageVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { buildMushafLayoutLines } from '@/lib/mushaf-layout';
import { getSurahByNumber } from '@/lib/quran-data';

export const MUSHAF_TOTAL_PAGES = 604;
const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064e\u0647\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';
const NO_BISMILLAH = new Set([1, 9]);

export type PagePairMode = 'single' | 'spread';

export function getSpreadPages(page: number) {
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

/** Data Layer: Quran.com page fetch + preloading for page flips. */
export function useMushafPageData(page: number, pagePairMode: PagePairMode, viewMode: 'page' | 'ayah') {
  const [pageVerses, setPageVerses] = useState<QuranVerse[]>([]);
  const [spreadPageVerses, setSpreadPageVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const spread = getSpreadPages(page);

  useEffect(() => {
    if (viewMode !== 'page') return;
    let cancelled = false;
    setLoading(true);

    const pageStart = pagePairMode === 'spread' ? spread.rightPage : page;
    const tasks = [fetchPageVerses(pageStart)];
    if (pagePairMode === 'spread') {
      tasks.push(fetchPageVerses(spread.leftPage));
    }

    Promise.all(tasks).then(([first, second]) => {
      if (cancelled) return;
      setPageVerses(first ?? []);
      setSpreadPageVerses(second ?? []);
      setLoading(false);
      preloadAdjacentPages(pageStart);
    });

    return () => {
      cancelled = true;
    };
  }, [page, pagePairMode, spread.leftPage, spread.rightPage, viewMode]);

  return { pageVerses, spreadPageVerses, loading, spread };
}

/** Layout Engine: deterministic line slots from mushaf-page-layout.json. */
function useMushafCanvasLayout(page: number, verses: QuranVerse[]) {
  return useMemo(() => buildMushafLayoutLines(page, verses), [page, verses]);
}

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

/** Typography Layer: Uthmani script glyphs + RTL line wrapping per line slot. */
export function MushafPageCanvas({
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
  const lines = useMushafCanvasLayout(page, verses);
  const verseByKey = useMemo(() => new Map(verses.map(verse => [verse.verse_key, verse])), [verses]);

  return (
    <div className={`mushaf-frame mushaf-page-canvas mx-auto w-full overflow-hidden ${compact ? 'max-w-[25rem]' : 'max-w-[36rem]'}`}>
      <div className="mushaf-page-canvas-inner">
        <div className="mushaf-page-top-rules" aria-hidden="true">
          <span className="mushaf-page-top-rule" />
          <span className="mushaf-page-top-rule mushaf-page-top-rule-accent" />
        </div>

        {(() => {
          const headers: React.ReactNode[] = [];
          let prevSurah = 0;
          for (const verse of verses) {
            if (verse.chapter_id !== prevSurah) {
              headers.push(<SurahHeader key={`hdr-${verse.chapter_id}`} surahNumber={verse.chapter_id} />);
              if (!NO_BISMILLAH.has(verse.chapter_id) && verse.verse_number === 1) {
                headers.push(
                  <div key={`bis-${verse.chapter_id}`} className="mushaf-bismillah">
                    {BISMILLAH}
                  </div>,
                );
              }
              prevSurah = verse.chapter_id;
            }
          }
          return headers;
        })()}

        <div className="mushaf-page flex-1" dir="rtl">
          {lines.map(line => (
            <div key={`line-${line.index}`} className="mushaf-layout-line-shell" style={{ width: `${line.widthPercent}%` }}>
              <div className={`mushaf-layout-line ${line.isLast ? 'mushaf-layout-line--last' : ''}`} role="presentation">
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
            </div>
          ))}
        </div>

        <div className="mushaf-page-bottom-rule" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 text-center sm:bottom-3">
          <span className="font-sans text-[11px] tabular-nums text-[#8a7b55]">{page}</span>
        </div>
      </div>
    </div>
  );
}

export function MushafPageSpreadCanvas(props: {
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
    <div className="relative grid items-stretch gap-0 lg:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]" dir="rtl">
      <div className="flex h-full items-stretch">
        <MushafPageCanvas
          verses={props.rightPageVerses}
          page={props.rightPage}
          activePlaybackAyah={props.activePlaybackAyah}
          onPlayAyah={props.onPlayAyah}
          onAyahTap={props.onAyahTap}
          selectedAyahKey={props.selectedAyahKey}
          compact
        />
      </div>
      <div className="relative hidden h-full lg:block" aria-hidden="true">
        <div className="absolute inset-y-4 left-0 w-px bg-[#c4b690]/40" />
      </div>
      <div className="flex h-full items-stretch">
        <MushafPageCanvas
          verses={props.leftPageVerses}
          page={props.leftPage}
          activePlaybackAyah={props.activePlaybackAyah}
          onPlayAyah={props.onPlayAyah}
          onAyahTap={props.onAyahTap}
          selectedAyahKey={props.selectedAyahKey}
          compact
        />
      </div>
    </div>
  );
}

/** Navigation Layer: dedicated mushaf page flip controls. */
export function MushafPageFlipNav({
  page,
  pagePairMode,
  spread,
  onFlip,
}: {
  page: number;
  pagePairMode: PagePairMode;
  spread: { rightPage: number; leftPage: number };
  onFlip: (delta: number) => void;
}) {
  return (
    <div className="flex items-center justify-between px-2 py-1.5">
      <button
        type="button"
        onClick={() => onFlip(1)}
        disabled={pagePairMode === 'spread' ? spread.rightPage >= MUSHAF_TOTAL_PAGES - 1 : page >= MUSHAF_TOTAL_PAGES}
        className="rounded-md p-1.5 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
        aria-label="Next page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <p className="text-xs text-white/60 font-sans tabular-nums">
        {pagePairMode === 'spread' ? `${spread.rightPage}–${spread.leftPage}` : `${page}`}
        <span className="text-white/30 ml-1">/ {MUSHAF_TOTAL_PAGES}</span>
      </p>
      <button
        type="button"
        onClick={() => onFlip(-1)}
        disabled={page <= 1}
        className="rounded-md p-1.5 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
        aria-label="Previous page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Audio Hook Layer: future-ready integration surface for playback adapters. */
export function useMushafAudioHooks() {
  return {
    onAudioPageFlip: (_page: number) => {
      // Reserved for upcoming page-synced recitation cues.
    },
  };
}
