/**
 * Quran.com API client with IndexedDB caching for offline-first experience.
 * Fetches Uthmani text for any surah/page on demand and caches permanently.
 */

const API_BASE = 'https://api.quran.com/api/v4';
const INTERNAL_API_BASE = '/api/quran/verses';
const DB_NAME = 'quran_text_cache';
const DB_VERSION = 2;
const STORE_PAGES = 'pages';
const STORE_SURAHS = 'surahs';

export type QuranWord = {
  text_uthmani: string;
  line_number?: number;
  position?: number;
};

export type QuranVerse = {
  verse_key: string;
  text_uthmani: string;
  chapter_id: number;
  verse_number: number;
  page_number: number;
  words?: QuranWord[];
};

// In-memory caches for instant access after first load
const memoryPageCache = new Map<number, QuranVerse[]>();
const memorySurahCache = new Map<number, QuranVerse[]>();

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB not available'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_PAGES)) db.createObjectStore(STORE_PAGES);
      if (!db.objectStoreNames.contains(STORE_SURAHS)) db.createObjectStore(STORE_SURAHS);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function dbGet<T>(store: string, key: IDBValidKey): Promise<T | undefined> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readonly');
      const req = tx.objectStore(store).get(key);
      req.onsuccess = () => resolve(req.result as T | undefined);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return undefined;
  }
}

async function dbPut(store: string, key: IDBValidKey, value: unknown): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite');
      tx.objectStore(store).put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Silently fail cache writes
  }
}

function parseWords(words: unknown): QuranWord[] {
  if (!Array.isArray(words)) return [];
  return words
    .map((word: Record<string, unknown>) => ({
      text_uthmani: typeof word.text_uthmani === 'string' ? word.text_uthmani : '',
      line_number: typeof word.line_number === 'number' ? word.line_number : undefined,
      position: typeof word.position === 'number' ? word.position : undefined,
    }))
    .filter(word => word.text_uthmani.length > 0);
}

function parseVerses(data: { verses?: Record<string, unknown>[] }): QuranVerse[] {
  return (data.verses ?? []).map((v: Record<string, unknown>) => ({
    verse_key: v.verse_key as string,
    text_uthmani: v.text_uthmani as string,
    chapter_id: v.chapter_id as number,
    verse_number: v.verse_number as number,
    page_number: v.page_number as number,
    words: parseWords(v.words),
  }));
}

export async function fetchPageVerses(page: number): Promise<QuranVerse[]> {
  if (memoryPageCache.has(page)) return memoryPageCache.get(page)!;

  const cached = await dbGet<QuranVerse[]>(STORE_PAGES, page);
  if (cached?.length) {
    memoryPageCache.set(page, cached);
    return cached;
  }

  try {
    let data: { verses?: Record<string, unknown>[] } = {};
    const internalRes = await fetch(`${INTERNAL_API_BASE}?page=${page}&words=true`, { cache: 'no-store' });

    if (internalRes.ok) {
      data = await internalRes.json();
    } else {
      const fallbackUrl = `${API_BASE}/verses/by_page/${page}?language=en&words=true&word_fields=text_uthmani,line_number,position&fields=text_uthmani,chapter_id,verse_number,page_number,verse_key&per_page=50`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) throw new Error(`API ${fallbackRes.status}`);
      data = await fallbackRes.json();
    }

    const verses = parseVerses(data);
    memoryPageCache.set(page, verses);
    void dbPut(STORE_PAGES, page, verses);
    return verses;
  } catch {
    return [];
  }
}

export async function fetchSurahVerses(surah: number): Promise<QuranVerse[]> {
  if (memorySurahCache.has(surah)) return memorySurahCache.get(surah)!;

  const cached = await dbGet<QuranVerse[]>(STORE_SURAHS, surah);
  if (cached?.length) {
    memorySurahCache.set(surah, cached);
    return cached;
  }

  try {
    let data: { verses?: Record<string, unknown>[] } = {};
    const internalRes = await fetch(`${INTERNAL_API_BASE}?surah=${surah}`, { cache: 'no-store' });

    if (internalRes.ok) {
      data = await internalRes.json();
    } else {
      const fallbackUrl = `${API_BASE}/verses/by_chapter/${surah}?language=en&words=false&fields=text_uthmani,chapter_id,verse_number,page_number,verse_key&per_page=300`;
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok) throw new Error(`API ${fallbackRes.status}`);
      data = await fallbackRes.json();
    }

    const verses = parseVerses(data);
    memorySurahCache.set(surah, verses);
    void dbPut(STORE_SURAHS, surah, verses);
    return verses;
  } catch {
    return [];
  }
}

export function preloadAdjacentPages(currentPage: number): void {
  const pagesToPreload = [currentPage - 1, currentPage + 1, currentPage + 2];
  for (const p of pagesToPreload) {
    if (p >= 1 && p <= 604 && !memoryPageCache.has(p)) {
      void fetchPageVerses(p);
    }
  }
}

export function isPageCached(page: number): boolean {
  return memoryPageCache.has(page);
}

export function getCachedPageCount(): number {
  return memoryPageCache.size;
}
