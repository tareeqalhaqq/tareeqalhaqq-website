'use client';

import { ChevronLeft, ChevronRight, Loader2, Play } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { fetchPageVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { buildMushafLayoutLines, type MushafLayoutLine } from '@/lib/mushaf-layout';
import { getSurahByNumber } from '@/lib/quran-data';

const TOTAL_PAGES = 604;
const BISMILLAH = '\u0628\u0650\u0633\u0652\u0645\u0650 \u0671\u0644\u0644\u0651\u064e\u0647\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0652\u0645\u064e\u0670\u0646\u0650 \u0671\u0644\u0631\u0651\u064e\u062d\u0650\u064a\u0645\u0650';
const NO_BISMILLAH = new Set([1, 9]);

/** Convert a Western numeral to Eastern Arabic numeral string. */
function toArabicNumeral(n: number): string {
  const digits = ['\u0660', '\u0661', '\u0662', '\u0663', '\u0664', '\u0665', '\u0666', '\u0667', '\u0668', '\u0669'];
  return String(n).replace(/\d/g, d => digits[Number(d)]);
}

/** Ornamental ayah end marker — star polygon with verse number. */
function AyahEndMarker({ number }: { number: number }) {
  return (
    <span className="tarteel-ayah-end" aria-label={`Ayah ${number}`}>
      <svg viewBox="0 0 100 100" className="tarteel-ayah-end-svg" aria-hidden="true">
        <polygon
          points="50,2 62,15 82,15 82,35 98,50 82,65 82,85 62,85 50,98 38,85 18,85 18,65 2,50 18,35 18,15 38,15"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
        />
      </svg>
      <span className="tarteel-ayah-end-num">{toArabicNumeral(number)}</span>
    </span>
  );
}

/** Ornamental surah header banner. */
function SurahHeaderBanner({ surahNumber }: { surahNumber: number }) {
  const surah = getSurahByNumber(surahNumber);
  if (!surah) return null;

  return (
    <div className="tarteel-surah-banner">
      <div className="tarteel-surah-banner-inner">
        <span className="tarteel-surah-banner-ornament" aria-hidden="true">&#x2726;</span>
        <div className="tarteel-surah-banner-content">
          <span className="tarteel-surah-banner-arabic">{surah.nameArabic}</span>
          <span className="tarteel-surah-banner-meta">
            {surah.name} &middot; {surah.verses} Ayat &middot;{' '}
            {surah.revelationType === 'meccan' ? 'Makkiyyah' : 'Madaniyyah'}
          </span>
        </div>
        <span className="tarteel-surah-banner-ornament" aria-hidden="true">&#x2726;</span>
      </div>
    </div>
  );
}

/** Bismillah line between surah header and verses. */
function BismillahLine() {
  return (
    <div className="tarteel-bismillah">
      {BISMILLAH}
    </div>
  );
}

/** A single mushaf page canvas with word-level interactions. */
function TarteelPageCanvas({
  verses,
  page,
  selectedVerseKey,
  onWordHover,
  onAyahSelect,
}: {
  verses: QuranVerse[];
  page: number;
  selectedVerseKey: string | null;
  onWordHover: (verseKey: string | null) => void;
  onAyahSelect: (verseKey: string) => void;
}) {
  const lines = useMemo(() => buildMushafLayoutLines(page, verses), [page, verses]);
  const verseByKey = useMemo(() => new Map(verses.map(v => [v.verse_key, v])), [verses]);

  // Determine which surahs start on this page (for headers + bismillahs)
  const pageHeaders = useMemo(() => {
    const headers: { surahNumber: number; needsBismillah: boolean }[] = [];
    let prevSurah = 0;
    for (const verse of verses) {
      if (verse.chapter_id !== prevSurah) {
        headers.push({
          surahNumber: verse.chapter_id,
          needsBismillah: !NO_BISMILLAH.has(verse.chapter_id) && verse.verse_number === 1,
        });
        prevSurah = verse.chapter_id;
      }
    }
    return headers;
  }, [verses]);

  // Identify the primary surah for the page header
  const primarySurah = verses.length > 0 ? getSurahByNumber(verses[0].chapter_id) : null;

  return (
    <div className="tarteel-page">
      {/* Top ornamental rules */}
      <div className="tarteel-page-rules-top" aria-hidden="true">
        <div className="tarteel-rule tarteel-rule--thin" />
        <div className="tarteel-rule tarteel-rule--thick" />
      </div>

      {/* Surah name header */}
      <div className="tarteel-page-header">
        <span className="tarteel-page-header-juz">
          {primarySurah ? `Juz ${primarySurah.juz[0]}` : ''}
        </span>
        <span className="tarteel-page-header-surah">
          {primarySurah?.nameArabic ?? ''}
        </span>
        <span className="tarteel-page-header-surah-en">
          {primarySurah?.name ?? ''}
        </span>
      </div>

      {/* Surah banners + bismillahs for new surahs on this page */}
      {pageHeaders.map(h => (
        <div key={`hdr-${h.surahNumber}`}>
          <SurahHeaderBanner surahNumber={h.surahNumber} />
          {h.needsBismillah && <BismillahLine />}
        </div>
      ))}

      {/* Main mushaf text lines */}
      <div className="tarteel-text-body" dir="rtl">
        {lines.map(line => (
          <div
            key={`line-${line.index}`}
            className="tarteel-line-shell"
            style={{ width: `${line.widthPercent}%` }}
          >
            <div className={`tarteel-line ${line.isLast ? 'tarteel-line--last' : ''}`}>
              {line.segments.map((seg, si) => {
                if (seg.type === 'marker') {
                  return <AyahEndMarker key={`m-${seg.verseKey}-${si}`} number={seg.ayah} />;
                }

                const isSelected = selectedVerseKey === seg.verseKey;

                return (
                  <span
                    key={`w-${seg.verseKey}-${si}`}
                    data-verse-key={seg.verseKey}
                    className={`tarteel-word ${isSelected ? 'tarteel-word--ayah-selected' : ''}`}
                    onMouseEnter={() => onWordHover(seg.verseKey)}
                    onMouseLeave={() => onWordHover(null)}
                    onClick={() => onAyahSelect(seg.verseKey)}
                  >
                    {seg.text}
                  </span>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom rule */}
      <div className="tarteel-page-rules-bottom" aria-hidden="true">
        <div className="tarteel-rule tarteel-rule--thick" />
        <div className="tarteel-rule tarteel-rule--thin" />
      </div>

      {/* Page number in Arabic numerals */}
      <div className="tarteel-page-number">
        {toArabicNumeral(page)}
      </div>
    </div>
  );
}

/** Ayah info tooltip shown when an ayah is selected. */
function AyahInfoTooltip({
  verseKey,
  onClose,
  onPlay,
}: {
  verseKey: string;
  onClose: () => void;
  onPlay: () => void;
}) {
  const [surah, ayah] = verseKey.split(':').map(Number);
  const surahMeta = getSurahByNumber(surah);

  return (
    <div className="tarteel-tooltip">
      <div className="tarteel-tooltip-content">
        <span className="tarteel-tooltip-badge">
          {toArabicNumeral(ayah)}
        </span>
        <div className="tarteel-tooltip-info">
          <span className="tarteel-tooltip-surah">{surahMeta?.nameArabic ?? ''}</span>
          <span className="tarteel-tooltip-key">{surahMeta?.name} {ayah}</span>
        </div>
        <button
          type="button"
          className="tarteel-tooltip-play"
          onClick={e => { e.stopPropagation(); onPlay(); }}
          aria-label="Play this ayah"
        >
          <Play className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          className="tarteel-tooltip-close"
          onClick={e => { e.stopPropagation(); onClose(); }}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

/** Page input for jumping to a specific page. */
function PageJumpInput({
  page,
  onJump,
}: {
  page: number;
  onJump: (page: number) => void;
}) {
  const [value, setValue] = useState(String(page));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setValue(String(page));
  }, [page]);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="tarteel-nav-page-btn"
        title="Jump to page"
      >
        <span className="tarteel-nav-page-current">{page}</span>
        <span className="tarteel-nav-page-total">/ {TOTAL_PAGES}</span>
      </button>
    );
  }

  return (
    <form
      onSubmit={e => {
        e.preventDefault();
        const n = Number(value);
        if (n >= 1 && n <= TOTAL_PAGES) {
          onJump(n);
          setOpen(false);
        }
      }}
      className="tarteel-nav-jump-form"
    >
      <input
        type="number"
        min={1}
        max={TOTAL_PAGES}
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={() => setOpen(false)}
        autoFocus
        className="tarteel-nav-jump-input"
      />
      <span className="tarteel-nav-page-total">/ {TOTAL_PAGES}</span>
    </form>
  );
}

// ─── Main viewer ───────────────────────────────────────────────

export default function TarteelMushafViewer({ initialPage }: { initialPage: number }) {
  const [page, setPage] = useState(initialPage);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredVerseKey, setHoveredVerseKey] = useState<string | null>(null);
  const [selectedVerseKey, setSelectedVerseKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch page data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSelectedVerseKey(null);

    fetchPageVerses(page).then(data => {
      if (cancelled) return;
      setVerses(data ?? []);
      setLoading(false);
      preloadAdjacentPages(page);
    });

    return () => { cancelled = true; };
  }, [page]);

  // Keyboard navigation (RTL-aware: Left = next page, Right = prev page)
  const goNext = useCallback(() => setPage(p => Math.min(TOTAL_PAGES, p + 1)), []);
  const goPrev = useCallback(() => setPage(p => Math.max(1, p - 1)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
      if (e.key === 'Escape') setSelectedVerseKey(null);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleWordHover = useCallback((verseKey: string | null) => {
    setHoveredVerseKey(verseKey);
  }, []);

  const handleAyahSelect = useCallback((verseKey: string) => {
    setSelectedVerseKey(prev => prev === verseKey ? null : verseKey);
  }, []);

  const handlePlay = useCallback(() => {
    // Placeholder for future audio integration
  }, []);

  const handleJump = useCallback((p: number) => {
    setPage(p);
    containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="tarteel-viewer" ref={containerRef}>
      {/* Background texture layer */}
      <div className="tarteel-viewer-bg" aria-hidden="true" />

      {/* Navigation bar */}
      <nav className="tarteel-nav" dir="rtl">
        <button
          type="button"
          onClick={goPrev}
          disabled={page <= 1}
          className="tarteel-nav-btn"
          aria-label="Previous page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <PageJumpInput page={page} onJump={handleJump} />

        <button
          type="button"
          onClick={goNext}
          disabled={page >= TOTAL_PAGES}
          className="tarteel-nav-btn"
          aria-label="Next page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </nav>

      {/* Mushaf page */}
      <main className="tarteel-main">
        {loading ? (
          <div className="tarteel-loading">
            <Loader2 className="h-7 w-7 animate-spin text-[#C5973A]/60" />
            <p className="tarteel-loading-text">Loading page {toArabicNumeral(page)}...</p>
          </div>
        ) : (
          <div className="tarteel-page-wrapper">
            <TarteelPageCanvas
              verses={verses}
              page={page}
              selectedVerseKey={selectedVerseKey}
              onWordHover={handleWordHover}
              onAyahSelect={handleAyahSelect}
            />

            {/* Ayah info tooltip */}
            {selectedVerseKey && (
              <AyahInfoTooltip
                verseKey={selectedVerseKey}
                onClose={() => setSelectedVerseKey(null)}
                onPlay={handlePlay}
              />
            )}
          </div>
        )}
      </main>

      {/* Keyboard hint */}
      <footer className="tarteel-footer">
        <span>Use <kbd>&larr;</kbd> <kbd>&rarr;</kbd> arrow keys to navigate &middot; Click any word to select its ayah</span>
      </footer>
    </div>
  );
}
