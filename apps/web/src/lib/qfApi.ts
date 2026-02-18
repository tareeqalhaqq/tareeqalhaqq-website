// src/lib/qfApi.ts
// Server-only — never import from client components.

import { getQfConfig } from "./qfConfig";
import { getQfAccessToken } from "./qfAuth";

export type QfWord = {
  id: number;
  position: number;
  text?: string;
  code_v2: string;
  v2_page: number;
  page_number: number;
  line_number: number;
  char_type_name?: string;
  verse_key?: string;
};

export type QfVerse = {
  id: number;
  verse_key: string;
  words: QfWord[];
};

export async function fetchMushafPageVerses(pageNumber: number): Promise<QfVerse[]> {
  const { apiBaseUrl } = getQfConfig();
  const token = await getQfAccessToken();

  const url = `${apiBaseUrl}/content/verses/by_page/${pageNumber}?mushaf=1&words=true&per_page=50`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Mushaf page ${pageNumber} (status ${res.status}).`);
  }

  const data = await res.json();
  return data.verses as QfVerse[];
}
