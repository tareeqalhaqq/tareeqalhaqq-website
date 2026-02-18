import { NextResponse } from 'next/server';
import { fetchQuranComVersesByPage, fetchQuranComVersesBySurah } from '@/lib/quran-com-client';

function parsePositiveInt(value: string | null) {
  if (!value) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? null : parsed;
}

function parseBoolean(value: string | null) {
  return value === '1' || value === 'true';
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parsePositiveInt(searchParams.get('page'));
    const surah = parsePositiveInt(searchParams.get('surah'));
    const words = parseBoolean(searchParams.get('words'));

    if (page) {
      const data = await fetchQuranComVersesByPage(page, { words });
      return NextResponse.json(data);
    }

    if (surah) {
      const data = await fetchQuranComVersesBySurah(surah);
      return NextResponse.json(data);
    }

    return NextResponse.json(
      { error: 'Either a valid `page` or `surah` query param is required.' },
      { status: 400 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
