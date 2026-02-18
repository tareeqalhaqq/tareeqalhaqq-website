// src/lib/mushafBuilder.ts
// Groups QCF v2 words by line_number (1..15) for Mushaf page rendering.
// Propagates verse_key from parent verse to each word for client-side interactivity.

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
  // Flatten words and ensure each has verse_key from parent verse
  const words: QfWord[] = verses.flatMap((v) =>
    (v.words ?? []).map((w) => ({
      ...w,
      verse_key: w.verse_key || v.verse_key,
    }))
  );

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
