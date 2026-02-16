import { NextResponse } from 'next/server';
import { assertAdmin } from '@/lib/auth-server';
import { projectSelectFields } from '@/lib/projects';

type RouteParams = {
  params: {
    id: string;
  };
};

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { supabase, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    if (!params.id) {
      return NextResponse.json({ error: 'Missing project id.' }, { status: 400 });
    }

    const payload = await request.json();
    const { title, description, tag, href, display_order, is_published } = payload || {};

    if (!title || !description) {
      return NextResponse.json({ error: 'Missing required fields: title, description' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('projects')
      .update({
        title: title.trim(),
        description: description.trim(),
        tag: tag?.trim() || null,
        href: href?.trim() || null,
        display_order: Number.isFinite(Number(display_order)) ? Number(display_order) : null,
        is_published: Boolean(is_published),
      })
      .eq('id', params.id)
      .select(projectSelectFields)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { supabase, errorResponse } = await assertAdmin();
    if (errorResponse) return errorResponse;

    if (!params.id) {
      return NextResponse.json({ error: 'Missing project id.' }, { status: 400 });
    }

    const { data, error } = await supabase.from('projects').delete().eq('id', params.id).select(projectSelectFields).single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Internal Server Error' }, { status: 500 });
  }
}
