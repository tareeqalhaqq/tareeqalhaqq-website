import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth-server';

const selectFields = 'id, title, description, location, date, time, image_url, event_type, is_virtual, created_at';
const defaultEventImage = '/images/logo1.png';

export async function GET() {
  const { supabase, errorResponse } = await assertAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase.from('events').select(selectFields).order('date', { ascending: true });

  if (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Unable to fetch events.' }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
  const { supabase, errorResponse, userId } = await assertAdmin();
  if (errorResponse) return errorResponse;


  const payload = (await request.json()) as {
    title: string;
    description: string;
    location: string | null;
    date: string | null;
    time?: string | null;
    image_url?: string | null;
    event_type?: string | null;
    is_virtual?: boolean | null;
  };

  const normalizedLocation = payload.location?.trim() || null;
  const normalizedDate = payload.date || null;
  const normalizedTime = payload.time || null;
  const normalizedImage = payload.image_url?.trim() || defaultEventImage;

  const { data, error } = await supabase
    .from('events')
    .insert({
      title: payload.title.trim(),
      description: payload.description.trim(),
      location: normalizedLocation,
      date: normalizedDate,
      time: normalizedTime,
      image_url: normalizedImage,
      event_type: payload.event_type ?? 'tareeq',
      is_virtual: payload.is_virtual ?? false,
      created_by_clerk: userId,
    })
    .select(selectFields)
    .single();

  if (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Unable to create event.' }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
