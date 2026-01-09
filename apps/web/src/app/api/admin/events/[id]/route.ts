import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const selectFields = 'id, title, description, location, date, time, image_url, created_at';
const defaultEventImage = '/images/logo1.png';

const assertAdmin = async () => {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const [profileResult, membershipResult] = await Promise.all([
    supabase.from('profiles').select('app_role').eq('id', user.id).maybeSingle(),
    supabase.from('academy_memberships').select('academy_role').eq('user_id', user.id).maybeSingle(),
  ]);

  const isAdmin =
    profileResult.data?.app_role === 'admin' || membershipResult.data?.academy_role === 'admin';
  if (profileResult.error || membershipResult.error || !isAdmin) {
    return { supabase, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase };
};

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, errorResponse } = await assertAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const payload = (await request.json()) as {
    title: string;
    description: string;
    location: string | null;
    date: string | null;
    time?: string | null;
    image_url?: string | null;
  };

  const normalizedLocation = payload.location?.trim() || null;
  const normalizedDate = payload.date || null;
  const normalizedTime = payload.time || null;
  const normalizedImage = payload.image_url?.trim() || defaultEventImage;

  const { data, error } = await supabase
    .from('events')
    .update({
      title: payload.title.trim(),
      description: payload.description.trim(),
      location: normalizedLocation,
      date: normalizedDate,
      time: normalizedTime,
      image_url: normalizedImage,
    })
    .eq('id', id)
    .select(selectFields)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to update event.' }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { supabase, errorResponse } = await assertAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await params;

  const { data, error } = await supabase.from('events').delete().eq('id', id).select('id');

  if (error) {
    return NextResponse.json({ error: 'Unable to delete event.' }, { status: 500 });
  }

  if (!data?.length) {
    return NextResponse.json({ error: 'Event not found.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
