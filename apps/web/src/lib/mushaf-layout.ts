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

export type MushafLayoutLine = {
  index: number;
  segments: LineSegment[];
  isLast: boolean;
  widthPercent: number;
};

const PAGES = new Map<number, LayoutPage>((layoutData.pages as LayoutPage[]).map(page => [page.page, page]));
const DEFAULT_WIDTHS = [36, 38, 40, 42, 44, 44, 44, 44, 44, 44, 44, 44, 42, 40, 38];
const TOTAL_LINES = 15;

function createEmptyLines(page: number): MushafLayoutLine[] {
  const lineWidths = PAGES.get(page)?.lineWidths ?? DEFAULT_WIDTHS;
  const maxWidth = Math.max(...lineWidths);

  return Array.from({ length: TOTAL_LINES }, (_, index) => ({
    index,
    segments: [],
    isLast: false,
    widthPercent: Math.round(((lineWidths[index] ?? 44) / maxWidth) * 1000) / 10,
  }));
}

function markLastLine(lines: MushafLayoutLine[]) {
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    if (lines[i].segments.length > 0) {
      lines[i].isLast = true;
      break;
    }
  }
}

function hasCanonicalLineNumbers(verses: QuranVerse[]) {
  return verses.some(verse => verse.words?.some(word => typeof word.line_number === 'number'));
}

function buildFromCanonicalWordLineNumbers(page: number, verses: QuranVerse[]) {
  const lines = createEmptyLines(page);

  for (const verse of verses) {
    const words = (verse.words ?? [])
      .filter(word => word.text_uthmani)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

    if (!words.length) continue;

    let lastLineIndex = 0;

    for (const word of words) {
      const lineNum = typeof word.line_number === 'number' ? word.line_number : 1;
      const lineIndex = Math.min(TOTAL_LINES - 1, Math.max(0, lineNum - 1));
      lastLineIndex = lineIndex;

      lines[lineIndex].segments.push({
        type: 'text',
        verseKey: verse.verse_key,
        surah: verse.chapter_id,
        ayah: verse.verse_number,
        text: word.text_uthmani,
      });
    }

    lines[lastLineIndex].segments.push({
      type: 'marker',
      verseKey: verse.verse_key,
      surah: verse.chapter_id,
      ayah: verse.verse_number,
    });
  }

  markLastLine(lines);
  return lines;
}

function splitVerseWords(verse: QuranVerse) {
  return verse.text_uthmani.split(/\s+/).filter(Boolean).map(word => ({
    type: 'text' as const,
    verseKey: verse.verse_key,
    surah: verse.chapter_id,
    ayah: verse.verse_number,
    text: word,
  }));
}

function measureTokenWeight(token: LineSegment) {
  if (token.type === 'marker') return 1.8;
  const text = token.text ?? '';
  const marks = (text.match(/[\u064B-\u065F\u0670]/g) ?? []).length;
  return Math.max(1.2, text.length * 0.58 + marks * 0.45);
}

function buildFallbackHeuristic(page: number, verses: QuranVerse[]) {
  const lineWidths = PAGES.get(page)?.lineWidths ?? DEFAULT_WIDTHS;
  const lines = createEmptyLines(page);

  const tokens: LineSegment[] = verses.flatMap(verse => ([...splitVerseWords(verse), {
    type: 'marker' as const,
    verseKey: verse.verse_key,
    surah: verse.chapter_id,
    ayah: verse.verse_number,
  }]));

  let tokenIndex = 0;
  for (let lineIndex = 0; lineIndex < lineWidths.length; lineIndex += 1) {
    const targetWidth = lineWidths[lineIndex];
    let consumed = 0;

    while (tokenIndex < tokens.length) {
      const token = tokens[tokenIndex];
      const tokenWeight = measureTokenWeight(token);
      const withMarkerSafety = token.type === 'marker' ? tokenWeight * 1.15 : tokenWeight;

      if (consumed > 0 && consumed + withMarkerSafety > targetWidth) break;
      lines[lineIndex].segments.push(token);
      consumed += withMarkerSafety;
      tokenIndex += 1;
    }
  }

  if (tokenIndex < tokens.length) {
    lines[lines.length - 1].segments.push(...tokens.slice(tokenIndex));
  }

  markLastLine(lines);
  return lines;
}

/**
 * Preferred path: canonical Madani line-breaking from Quran.com word line_number metadata.
 * Fallback path: heuristic widths when line_number metadata is unavailable.
 */
export function buildMushafLayoutLines(page: number, verses: QuranVerse[]): MushafLayoutLine[] {
  if (hasCanonicalLineNumbers(verses)) {
    return buildFromCanonicalWordLineNumbers(page, verses);
  }

  return buildFallbackHeuristic(page, verses);
}
