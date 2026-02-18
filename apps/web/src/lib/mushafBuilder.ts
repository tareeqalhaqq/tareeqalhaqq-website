// src/lib/mushafBuilder.ts
// Groups QCF v2 words by line_number (1..15) for Mushaf page rendering.

import type { QfWord, QfVerse } from "./qfApi";

export type MushafLine = {
  lineNumber: number;
  words: QfWord[];
};

export type MushafPageModel = {
  pageNumber: number;
  lines: MushafLine[]; // always 15
};

export function buildMushafPageModel(pageNumber: number, verses: QfVerse[]): MushafPageModel {
  const words: QfWord[] = verses.flatMap((v) => v.words ?? []);

  const buckets: QfWord[][] = Array.from({ length: 15 }, () => []);

  for (const w of words) {
    const ln = w.line_number ?? 1;
    if (ln >= 1 && ln <= 15) buckets[ln - 1].push(w);
  }

  const lines: MushafLine[] = buckets.map((ws, idx) => ({
    lineNumber: idx + 1,
    words: ws,
  }));

  return { pageNumber, lines };
}
