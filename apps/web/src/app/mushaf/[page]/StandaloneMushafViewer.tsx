'use client';

import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { ensureQcfFontLoaded } from '@/components/fontLoader';
import { fetchPageVerses, preloadAdjacentPages, type QuranVerse } from '@/lib/quran-api';
import { buildMushafLayoutLines } from '@/lib/mushaf-layout';
import { MushafPageCanvas, MUSHAF_TOTAL_PAGES } from '@/components/nur/mushaf/page-layers';
import { QcfMushafPageCanvas, type QcfPageData } from '@/components/nur/mushaf/qcf-page-layers';

export default function StandaloneMushafViewer({ initialPage }: { initialPage: number }) {
  const [page, setPage] = useState(initialPage);
  const [qcfData, setQcfData] = useState<QcfPageData | null>(null);
  const [textVerses, setTextVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(true);
  const [qcfFailed, setQcfFailed] = useState(false);

  // Fetch data
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setQcfFailed(false);
    setQcfData(null);

    // Try QCF first, text as fallback — both in parallel
    const qcfPromise = fetch(`/api/mushaf/page/${page}`)
      .then(r => r.ok ? r.json() as Promise<QcfPageData> : null)
      .catch(() => null);

    const textPromise = fetchPageVerses(page);

    Promise.all([qcfPromise, textPromise]).then(([qcf, text]) => {
      if (cancelled) return;
      if (qcf) {
        setQcfData(qcf);
        ensureQcfFontLoaded(page);
        if (page > 1) ensureQcfFontLoaded(page - 1);
        if (page < MUSHAF_TOTAL_PAGES) ensureQcfFontLoaded(page + 1);
      } else {
        setQcfFailed(true);
      }
      setTextVerses(text ?? []);
      preloadAdjacentPages(page);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [page]);

  // Keyboard navigation (RTL-aware)
  const goNext = useCallback(() => setPage(p => Math.min(MUSHAF_TOTAL_PAGES, p + 1)), []);
  const goPrev = useCallback(() => setPage(p => Math.max(1, p - 1)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowLeft') goNext();
      if (e.key === 'ArrowRight') goPrev();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  // No-op handlers for standalone view (no audio/selection in this route)
  const noop = useCallback(() => {}, []);
  const noopAyah = useCallback((_s: number, _a: number) => {}, []);
  const noopTap = useCallback((_v: QuranVerse) => {}, []);

  const useQcf = !qcfFailed && qcfData !== null;

  return (
    <div className="min-h-screen bg-[hsl(220,20%,4%)] flex flex-col items-center px-4 py-6">
      {/* Navigation */}
      <div className="flex items-center gap-4 mb-4" dir="rtl">
        <button
          type="button"
          onClick={goPrev}
          disabled={page <= 1}
          className="rounded-md p-2 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
          aria-label="Previous page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <p className="text-sm text-white/60 font-sans tabular-nums min-w-[100px] text-center">
          {page} <span className="text-white/30">/ {MUSHAF_TOTAL_PAGES}</span>
        </p>
        <button
          type="button"
          onClick={goNext}
          disabled={page >= MUSHAF_TOTAL_PAGES}
          className="rounded-md p-2 text-white/70 transition hover:bg-white/5 disabled:opacity-25"
          aria-label="Next page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      </div>

      {/* Mushaf page */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-300/40 mb-2" />
          <p className="text-xs text-white/40">Loading page {page}...</p>
        </div>
      ) : useQcf && qcfData ? (
        <QcfMushafPageCanvas
          data={qcfData}
          page={page}
          activePlaybackAyah={null}
          onPlayAyah={noopAyah}
          onAyahTap={noopTap}
          selectedAyahKey={null}
        />
      ) : (
        <MushafPageCanvas
          verses={textVerses}
          page={page}
          activePlaybackAyah={null}
          onPlayAyah={noopAyah}
          onAyahTap={noopTap}
          selectedAyahKey={null}
        />
      )}
    </div>
  );
}
