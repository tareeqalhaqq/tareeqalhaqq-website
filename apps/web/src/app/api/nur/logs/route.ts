import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

// POST /api/nur/logs - Create or update a daily log
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseServiceClient();

    const { data: profile } = await supabase
      .from('nur_profiles')
      .select('id, preferred_unit')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    // Calculate counts from completed items for this date
    const { data: completedItems } = await supabase
      .from('nur_schedule_items')
      .select('*')
      .eq('nur_profile_id', profile.id)
      .eq('date', body.date)
      .eq('completed', true);

    const totalNew = (completedItems ?? [])
      .filter(i => i.task_type === 'memorization')
      .reduce((sum: number, i: { range_end: number; range_start: number }) => sum + (i.range_end - i.range_start + 1), 0);

    const totalRevised = (completedItems ?? [])
      .filter(i => i.task_type === 'revision')
      .reduce((sum: number, i: { range_end: number; range_start: number }) => sum + (i.range_end - i.range_start + 1), 0);

    const totalRecited = (completedItems ?? [])
      .filter(i => i.task_type === 'recitation')
      .reduce((sum: number, i: { range_end: number; range_start: number }) => sum + (i.range_end - i.range_start + 1), 0);

    // Calculate streak
    let streakCount = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const { data: dayItems } = await supabase
        .from('nur_schedule_items')
        .select('completed')
        .eq('nur_profile_id', profile.id)
        .eq('date', dateStr);

      if (dayItems && dayItems.length > 0 && dayItems.every(item => item.completed)) {
        streakCount++;
      } else if (dayItems && dayItems.length > 0) {
        break;
      } else if (i > 0) {
        break;
      }
    }

    // Upsert the log
    const { data: log, error } = await supabase
      .from('nur_daily_logs')
      .upsert(
        {
          nur_profile_id: profile.id,
          date: body.date,
          total_new: totalNew,
          total_revised: totalRevised,
          total_recited: totalRecited,
          unit_type: profile.preferred_unit ?? 'ayah',
          streak_count: streakCount,
          day_rating: body.day_rating ?? null,
          reflection: body.reflection ?? null,
        },
        { onConflict: 'nur_profile_id,date' },
      )
      .select()
      .single();

    if (error) {
      console.error('Error saving log:', error);
      return NextResponse.json({ error: 'Failed to save log' }, { status: 500 });
    }

    return NextResponse.json({ log });
  } catch (error) {
    console.error('Error saving log:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
