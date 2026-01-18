import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseClient } from '@/lib/supabase';

const selectFields = 'id, title, description, location, date, time, image_url, event_type, is_virtual, created_at';
const defaultEventImage = '/images/logo1.png';

const normalizeRole = (role?: string | null) => role?.trim().toLowerCase() ?? null;
const adminRoles = new Set(['admin', 'administrator', 'owner', 'super_admin', 'superadmin']);
const isAdminRole = (role?: string | null) => {
  const normalized = normalizeRole(role);
  return normalized ? adminRoles.has(normalized) : false;
};

const assertAdmin = async () => {
  const { userId, sessionClaims } = await auth();
  const supabase = await createSupabaseClient();

  if (!userId) {
    return { supabase, errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const [profileResult, membershipResult] = await Promise.all([
    supabase.from('profiles').select('app_role').eq('clerk_id', userId).maybeSingle(),
    supabase.from('academy_memberships').select('academy_role').eq('clerk_id', userId).maybeSingle(),
  ]);

  const publicMetadata = sessionClaims?.publicMetadata as { role?: string; app_role?: string } | undefined;
  const unsafeMetadata = sessionClaims?.unsafeMetadata as { role?: string; app_role?: string } | undefined;
  const clerkRole = normalizeRole(
    publicMetadata?.role ?? publicMetadata?.app_role ?? unsafeMetadata?.role ?? unsafeMetadata?.app_role,
  );
  const isAdmin =
    isAdminRole(profileResult.data?.app_role) ||
    isAdminRole(membershipResult.data?.academy_role) ||
    isAdminRole(clerkRole);

  if (profileResult.error || membershipResult.error || !isAdmin) {
    return { supabase, errorResponse: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  return { supabase, userId };
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
    return NextResponse.json({ error: 'Unable to create event.' }, { status: 500 });
  }

  return NextResponse.json({ event: data }, { status: 201 });
}
