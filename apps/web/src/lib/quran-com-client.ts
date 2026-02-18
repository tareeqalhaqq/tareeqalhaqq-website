const QURAN_COM_API_BASE = 'https://apis.quran.foundation/content/api/v4';
const TOKEN_BUFFER_SECONDS = 30;
const MAX_RETRIES = 3;

type TokenState = {
  token: string;
  expiresAt: number;
};

type VerseApiWord = {
  text_uthmani?: string;
  line_number?: number;
  position?: number;
};

type VerseApiResponse = {
  verses?: Array<{
    verse_key: string;
    text_uthmani: string;
    chapter_id: number;
    verse_number: number;
    page_number: number;
    words?: VerseApiWord[];
  }>;
};

let tokenState: TokenState | null = null;
let inFlightTokenRequest: Promise<string> | null = null;

function getClientCredentials() {
  const clientId = process.env.QURAN_CLIENT_ID;
  const clientSecret = process.env.QURAN_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Missing QURAN_CLIENT_ID or QURAN_CLIENT_SECRET environment variables.');
  }

  return { clientId, clientSecret };
}

function canReuseToken() {
  if (!tokenState) return false;
  return Date.now() < tokenState.expiresAt - TOKEN_BUFFER_SECONDS * 1000;
}

async function requestAccessToken(): Promise<string> {
  if (canReuseToken()) return tokenState!.token;
  if (inFlightTokenRequest) return inFlightTokenRequest;

  inFlightTokenRequest = (async () => {
    const { clientId, clientSecret } = getClientCredentials();

    const res = await fetch(`${QURAN_COM_API_BASE}/auth/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': clientId,
      },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Failed to obtain Quran.com token (${res.status}).`);
    }

    const data = (await res.json()) as { access_token?: string; expires_in?: number };
    const accessToken = data.access_token;
    const expiresIn = typeof data.expires_in === 'number' ? data.expires_in : 300;

    if (!accessToken) throw new Error('Quran.com token response did not include access_token.');

    tokenState = {
      token: accessToken,
      expiresAt: Date.now() + expiresIn * 1000,
    };

    return accessToken;
  })();

  try {
    return await inFlightTokenRequest;
  } finally {
    inFlightTokenRequest = null;
  }
}

async function fetchWithRetry(endpoint: string) {
  const { clientId } = getClientCredentials();
  let lastError: unknown = null;

  for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
    try {
      const token = await requestAccessToken();
      const res = await fetch(`${QURAN_COM_API_BASE}${endpoint}`, {
        method: 'GET',
        headers: {
          'x-client-id': clientId,
          'x-auth-token': token,
        },
        cache: 'no-store',
      });

      if (res.status === 401) tokenState = null;
      if (res.ok) return res;
      if (res.status < 500 && res.status !== 429) {
        throw new Error(`Quran.com API request failed (${res.status}).`);
      }

      lastError = new Error(`Retryable Quran.com API status (${res.status}).`);
    } catch (error) {
      lastError = error;
    }

    const backoffMs = 250 * 2 ** attempt;
    await new Promise(resolve => setTimeout(resolve, backoffMs));
  }

  throw lastError instanceof Error ? lastError : new Error('Quran.com API request failed after retries.');
}

export async function fetchQuranComVersesByPage(page: number, options?: { words?: boolean }): Promise<VerseApiResponse> {
  const wordsEnabled = options?.words ?? false;
  const endpoint = wordsEnabled
    ? `/verses/by_page/${page}?language=en&words=true&word_fields=text_uthmani,line_number,position&fields=text_uthmani,chapter_id,verse_number,page_number,verse_key&per_page=50`
    : `/verses/by_page/${page}?language=en&words=false&fields=text_uthmani,chapter_id,verse_number,page_number,verse_key&per_page=50`;
  const res = await fetchWithRetry(endpoint);
  return (await res.json()) as VerseApiResponse;
}

export async function fetchQuranComVersesBySurah(surah: number): Promise<VerseApiResponse> {
  const endpoint = `/verses/by_chapter/${surah}?language=en&words=false&fields=text_uthmani,chapter_id,verse_number,page_number,verse_key&per_page=300`;
  const res = await fetchWithRetry(endpoint);
  return (await res.json()) as VerseApiResponse;
}
