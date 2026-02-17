import layoutData from '@/data/mushaf-page-layout.json';
import type { QuranVerse } from '@/lib/quran-api';

type LayoutPage = { page: number; lineWidths: number[] };

type LineSegment = {
  type: 'text' | 'marker';
  verseKey: string;
  surah: number;
  ayah: number;
  text?: string;
};

export type MushafLayoutLine = { index: number; segments: LineSegment[]; isLast: boolean };

const PAGES = new Map<number, LayoutPage>((layoutData.pages as LayoutPage[]).map(page => [page.page, page]));

function splitVerseWords(verse: QuranVerse) {
  return verse.text_uthmani.split(/\s+/).filter(Boolean).map(word => ({
    type: 'text' as const,
    verseKey: verse.verse_key,
    surah: verse.chapter_id,
    ayah: verse.verse_number,
    text: word,
  }));
}

export function buildMushafLayoutLines(page: number, verses: QuranVerse[]): MushafLayoutLine[] {
  const pageLayout = PAGES.get(page) ?? { page, lineWidths: Array.from({ length: 15 }, () => 42) };
  const tokens: LineSegment[] = verses.flatMap(verse => ([...splitVerseWords(verse), {
    type: 'marker' as const,
    verseKey: verse.verse_key,
    surah: verse.chapter_id,
    ayah: verse.verse_number,
  }]));

  const lines: MushafLayoutLine[] = pageLayout.lineWidths.map((_, index) => ({ index, segments: [], isLast: false }));
  let tokenIndex = 0;

  for (let lineIndex = 0; lineIndex < pageLayout.lineWidths.length; lineIndex += 1) {
    const targetWidth = pageLayout.lineWidths[lineIndex];
    let consumed = 0;

    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const size = token.type === 'marker' ? 2 : Math.max(1, Math.ceil((token.text?.length ?? 1) * 0.8));
      if (consumed > 0 && consumed + size > targetWidth) break;
      lines[lineIndex].segments.push(token);
      consumed += size;
      tokenIndex += 1;
    }
  }

  if (tokenIndex < tokens.length) {
    lines[lines.length - 1].segments.push(...tokens.slice(tokenIndex));
  }

  // Mark the last line that actually has content as the "last" line (for centered styling)
  for (let i = lines.length - 1; i >= 0; i--) {
    if (lines[i].segments.length > 0) {
      lines[i].isLast = true;
      break;
    }
  }

  return lines;
}
