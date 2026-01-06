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
    .select('app_role, role')
    .eq('id', user.id)
    .single();

  const isAdmin = profile?.app_role === 'admin' || profile?.role === 'admin';
  if (error || !isAdmin) {
    return { supabase, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase };
};

export async function GET() {
  const { supabase, errorResponse } = await assertAdmin();
  if (errorResponse) return errorResponse;

  const { data, error } = await supabase.from('events').select(selectFields).order('date', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Unable to fetch events.' }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
}

export async function POST(request: Request) {
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
    .insert({
      title: payload.title,
      description: payload.description,
      location: payload.location,
      date: payload.date,
      time: payload.time ?? null,
      image_url: payload.image_url ?? null,
    })
    .select(selectFields)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Unable to create event.' }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
