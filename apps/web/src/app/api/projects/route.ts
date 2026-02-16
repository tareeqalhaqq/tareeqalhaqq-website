import { NextResponse } from 'next/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { fallbackProjects, projectSelectFields } from '@/lib/projects';

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ projects: fallbackProjects });
  }

  try {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from('projects')
      .select(projectSelectFields)
      .eq('is_published', true)
      .order('display_order', { ascending: true, nullsFirst: false })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[API] /api/projects GET Supabase Error:', error);
      return NextResponse.json({ projects: fallbackProjects, warning: error.message });
    }

    if (!data?.length) {
      return NextResponse.json({ projects: fallbackProjects });
    }

    return NextResponse.json({ projects: data });
  } catch (err: any) {
    console.error('[API] /api/projects GET Critical Error:', err);
    return NextResponse.json({ projects: fallbackProjects, warning: err?.message || String(err) });
  }
}
