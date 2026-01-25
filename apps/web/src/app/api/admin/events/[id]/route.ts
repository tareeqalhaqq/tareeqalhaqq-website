import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth-server';

// Verified against schema: 'event_type' and 'is_virtual' do NOT exist.
const selectFields = 'id, title, description, location, date, time, image_url, created_at';
const defaultEventImage = '/images/logo1.png';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { supabase, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });
    }

    let payload: any;
    try {
      payload = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { title, description, location, date, time, image_url } = payload || {};

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title, description' }, { status: 400 });
    }

    const normalizedLocation = location?.trim() || null;
    const normalizedDate = date || null;
    const normalizedTime = time || null;
    const normalizedImage = image_url === null ? null : image_url?.trim() || defaultEventImage;

    const { data, error } = await supabase
      .from('events')
      .update({
        title: title.trim(),
        description: description.trim(),
        location: normalizedLocation,
        date: normalizedDate,
        time: normalizedTime,
        image_url: normalizedImage,
      })
      .eq('id', eventId)
      .select(selectFields)
      .single();

    if (error) {
      console.error('[API] /api/admin/events/[id] PUT Supabase Error:', error);
      return NextResponse.json(
        { error: `Database update failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data });
  } catch (err: any) {
    console.error('[API] /api/admin/events/[id] PUT Critical Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { supabase, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    const eventId = params.id;
    if (!eventId) {
      return NextResponse.json({ error: 'Missing event id.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('events').delete().eq('id', eventId).select(selectFields).single();

    if (error) {
      console.error('[API] /api/admin/events/[id] DELETE Supabase Error:', error);
      return NextResponse.json(
        { error: `Database delete failed: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ event: data });
  } catch (err: any) {
    console.error('[API] /api/admin/events/[id] DELETE Critical Error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
