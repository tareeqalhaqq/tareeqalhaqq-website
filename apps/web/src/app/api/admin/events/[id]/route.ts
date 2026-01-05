import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { createClient } from '@/utils/supabase/server';

const selectFields = 'id, title, description, location, date, time, image_url, created_at';

const assertAdmin = async () => {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('app_role')
    .eq('id', user.id)
    .single();

  if (error || profile?.app_role !== 'admin') {
    return { supabase, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase };
};

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const { supabase, errorResponse } = await assertAdmin();
  if (errorResponse) return errorResponse;

  const payload = (await request.json()) as {
    title: string;
    description: string;
    location: string;
    date: string;
    time?: string | null;
    image_url?: string | null;
  };

  const { data, error } = await supabase
    .from('events')
    .update({
      title: payload.title,
      description: payload.description,
      location: payload.location,
      date: payload.date,
      time: payload.time ?? null,
      image_url: payload.image_url ?? null,
    })
    .eq('id', params.id)
    .select(selectFields)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to update event.' }, { status: 500 });
  }

  return NextResponse.json({ event: data });
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { supabase, errorResponse } = await assertAdmin();
  if (errorResponse) return errorResponse;

  const { error } = await supabase.from('events').delete().eq('id', params.id);

  if (error) {
    return NextResponse.json({ error: 'Unable to delete event.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
