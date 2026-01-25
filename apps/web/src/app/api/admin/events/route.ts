import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth-server';

const selectFields = 'id, title, description, location, date, time, image_url, event_type, created_at';
const defaultEventImage = '/images/logo1.png';

export async function GET() {
  try {
    const { supabase, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    const { data, error } = await supabase
      .from('events')
      .select(selectFields)
      .order('date', { ascending: true });

    if (error) {
      console.error('[API] /api/admin/events GET Supabase Error:', error);
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ events: data ?? [] });
  } catch (err: any) {
    console.error('[API] /api/admin/events GET Critical Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, errorResponse, userId } = await assertAdmin();
    if (errorResponse) return errorResponse;

    let payload: any;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { title, description, location, date, time, image_url, event_type } = payload || {};

    // Basic validation
    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title, description' }, { status: 400 });
    }

    const normalizedLocation = location?.trim() || null;
    const normalizedDate = date || null;
    const normalizedTime = time || null;
    const normalizedImage = image_url?.trim() || defaultEventImage;
    const normalizedEventType = event_type === 'markaz' ? 'markaz' : 'tareeq';

    const { data, error } = await supabase
      .from('events')
      .insert({
        title: title.trim(),
        description: description.trim(),
        location: normalizedLocation,
        date: normalizedDate,
        time: normalizedTime,
        image_url: normalizedImage,
        event_type: normalizedEventType,
        created_by_clerk: userId,
      })
      .select(selectFields)
      .single();

    if (error) {
      console.error('[API] /api/admin/events POST Supabase Error:', error);
      return NextResponse.json(
        { error: `Database insert failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data }, { status: 201 });

  } catch (err: any) {
    console.error('[API] /api/admin/events POST Critical Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
