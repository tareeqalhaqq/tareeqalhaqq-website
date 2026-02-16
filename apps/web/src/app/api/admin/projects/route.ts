import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth-server';
import { projectSelectFields } from '@/lib/projects';

export async function GET() {
  try {
    const { supabase, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    const { data, error } = await supabase
      .from('projects')
      .select(projectSelectFields)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ projects: data ?? [] });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { supabase, userId, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    const payload = await request.json();
    const { title, description, tag, href, display_order, is_published } = payload || {};

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title, description' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        title: title.trim(),
        description: description.trim(),
        tag: tag?.trim() || null,
        href: href?.trim() || null,
        display_order: Number.isFinite(Number(display_order)) ? Number(display_order) : null,
        is_published: Boolean(is_published),
        created_by_clerk: userId,
      })
      .select(projectSelectFields)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
