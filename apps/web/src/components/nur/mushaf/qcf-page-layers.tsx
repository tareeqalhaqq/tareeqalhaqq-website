'use client';

import { useEffect, useState } from 'react';
import { ensureQcfFontLoaded } from '@/components/fontLoader';
import type { QuranVerse } from '@/lib/quran-api';
import { getSpreadPages, MUSHAF_TOTAL_PAGES, type PagePairMode } from './page-layers';

// ── QCF v2 types ────────────────────────────────────────────────

export type QcfWord = {
  code_v2: string;
  v2_page: number;
  line_number: number;
  char_type_name?: string;
  verse_key?: string;
  position?: number;
};

export type QcfLine = {
  lineNumber: number;
  words: QcfWord[];
};

export type QcfPageData = {
  pageNumber: number;
  lines: QcfLine[];
};

// ── Data Layer: fetch QCF v2 data from server API route ─────────

async function fetchQcfPage(page: number): Promise<QcfPageData | null> {
  try {
    const res = await fetch(`/api/mushaf/page/${page}`);
    if (!res.ok) return null;
    return (await res.json()) as QcfPageData;
  } catch {
    return null;
  }
}

export function useQcfPageData(page: number, pagePairMode: PagePairMode, viewMode: 'page' | 'ayah') {
  const [data, setData] = useState<QcfPageData | null>(null);
  const [spreadData, setSpreadData] = useState<QcfPageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const spread = getSpreadPages(page);

  useEffect(() => {
    if (viewMode !== 'page') return;
    let cancelled = false;
    setLoading(true);
    setFailed(false);

    const mainPage = pagePairMode === 'spread' ? spread.rightPage : page;
    const tasks: Promise<QcfPageData | null>[] = [fetchQcfPage(mainPage)];
    if (pagePairMode === 'spread') {
      tasks.push(fetchQcfPage(spread.leftPage));
    }

    Promise.all(tasks).then(([first, second]) => {
      if (cancelled) return;
      if (first) {
        setData(first);
        ensureQcfFontLoaded(mainPage);
        // Preload adjacent page fonts
        if (mainPage > 1) ensureQcfFontLoaded(mainPage - 1);
        if (mainPage < MUSHAF_TOTAL_PAGES) ensureQcfFontLoaded(mainPage + 1);
      } else {
        setFailed(true);
      }
      if (second) {
        setSpreadData(second);
        ensureQcfFontLoaded(spread.leftPage);
      }
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [page, pagePairMode, spread.leftPage, spread.rightPage, viewMode]);

  return { data, spreadData, loading, failed, spread };
}

// ── Helpers ─────────────────────────────────────────────────────

function parseVerseKey(vk: string | undefined): { surah: number; ayah: number } {
  if (!vk) return { surah: 0, ayah: 0 };
  const [s, a] = vk.split(':').map(Number);
  return { surah: s || 0, ayah: a || 0 };
}

function qcfWordToVerse(word: QcfWord, page: number): QuranVerse {
  const { surah, ayah } = parseVerseKey(word.verse_key);
  return {
    verse_key: word.verse_key ?? '',
    text_uthmani: '',
    chapter_id: surah,
    verse_number: ayah,
    page_number: page,
  };
}

// ── Typography Layer: QCF v2 glyph rendering ────────────────────

export function QcfMushafPageCanvas({
  data,
  page,
  activePlaybackAyah,
  onPlayAyah,
  onAyahTap,
  selectedAyahKey,
  compact,
}: {
  data: QcfPageData;
  page: number;
  activePlaybackAyah: { surah: number; ayah: number } | null;
  onPlayAyah: (surah: number, ayah: number) => void;
  onAyahTap: (verse: QuranVerse) => void;
  selectedAyahKey: string | null;
  compact?: boolean;
}) {
  return (
    <div className={`mushaf-frame mushaf-page-canvas mx-auto w-full overflow-hidden ${compact ? 'max-w-[25rem]' : 'max-w-[36rem]'}`}>
      <div className="mushaf-qcf-inner">
        <div className="mushaf-page-top-rules" aria-hidden="true">
          <span className="mushaf-page-top-rule" />
          <span className="mushaf-page-top-rule mushaf-page-top-rule-accent" />
        </div>

        <div className="mushaf-qcf-page" dir="rtl">
          {data.lines.map(line => (
            <div key={line.lineNumber} className="mushaf-qcf-line" aria-label={`line ${line.lineNumber}`}>
              {line.words.map((word, idx) => {
                const isEndMarker = word.char_type_name === 'end';
                const fontFamily = isEndMarker
                  ? '"KFGQPC Hafs", "UthmanTN", serif'
                  : `p${word.v2_page}-v2`;

                const verseKey = word.verse_key ?? '';
                const { surah, ayah } = parseVerseKey(word.verse_key);
                const hasVerse = surah > 0 && ayah > 0;
                const isActive = hasVerse && activePlaybackAyah?.surah === surah && activePlaybackAyah?.ayah === ayah;
                const isSelected = hasVerse && selectedAyahKey === verseKey;

                return (
                  <span
                    key={idx}
                    data-verse-key={verseKey || undefined}
                    className={`mushaf-qcf-word${hasVerse ? ' cursor-pointer' : ''}${isActive ? ' mushaf-highlight-active' : ''}${isSelected ? ' mushaf-qcf-word--selected' : ''}`}
                    style={{ fontFamily }}
                    onClick={hasVerse ? () => onAyahTap(qcfWordToVerse(word, page)) : undefined}
                    onDoubleClick={hasVerse ? () => onPlayAyah(surah, ayah) : undefined}
                    dangerouslySetInnerHTML={{ __html: word.code_v2 }}
                  />
                );
              })}
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

export function QcfMushafPageSpreadCanvas(props: {
  rightData: QcfPageData;
  leftData: QcfPageData;
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
        <QcfMushafPageCanvas
          data={props.rightData}
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
        <QcfMushafPageCanvas
          data={props.leftData}
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
