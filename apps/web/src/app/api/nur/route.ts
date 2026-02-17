import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { buildScheduleItems } from '@/lib/nur-schedule';
import { DEFAULT_RECITER_ID } from '@/lib/quran-audio';
import type { QuranUnit, TrackType } from '@/lib/nur-types';

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: profile } = await supabase
      .from('nur_profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ profile: null, items: [], goals: [], logs: [] });
    }

    const [itemsRes, goalsRes, logsRes] = await Promise.all([
      supabase.from('nur_schedule_items').select('*').eq('nur_profile_id', profile.id).order('date', { ascending: true }),
      supabase.from('nur_goals').select('*').eq('nur_profile_id', profile.id).order('created_at', { ascending: false }),
      supabase.from('nur_daily_logs').select('*').eq('nur_profile_id', profile.id).order('date', { ascending: true }),
    ]);

    return NextResponse.json({
      profile,
      items: itemsRes.data ?? [],
      goals: goalsRes.data ?? [],
      logs: logsRes.data ?? [],
    });
  } catch (error) {
    console.error('Error fetching Nur data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseServiceClient();

    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_id', userId)
      .single();

    const trackTypes: TrackType[] = body.trackTypes ?? ['memorization'];
    const preferredUnit: QuranUnit = body.preferredUnit ?? 'ayah';

    const { data: nurProfile, error: profileError } = await supabase
      .from('nur_profiles')
      .insert({
        clerk_id: userId,
        display_name: userProfile?.full_name ?? null,
        track_types: trackTypes,
        preferred_unit: preferredUnit,
        day_end_setting: body.dayEndSetting ?? 'midnight',
        fajr_time: body.fajrTime ?? null,
        memorization_current_surah: body.startSurah ?? 1,
        memorization_current_ayah: body.startAyah ?? 1,
        daily_new_amount: body.dailyNewAmount ?? 5,
        daily_revision_amount: body.dailyRevisionAmount ?? 2,
        preferred_time: body.preferredTime ?? null,
        reminder_enabled: body.reminderEnabled ?? true,
        selected_reciter_id: DEFAULT_RECITER_ID,
        mushaf_view_mode: 'page',
        mushaf_tajweed_enabled: true,
        setup_completed: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating Nur profile:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    const scheduleItems = buildScheduleItems({
      profileId: nurProfile.id,
      trackTypes,
      unitType: preferredUnit,
      startDate: new Date(),
      days: 7,
      dailyNewAmount: body.dailyNewAmount ?? 5,
      dailyRevisionAmount: body.dailyRevisionAmount ?? 2,
      startSurah: body.startSurah ?? 1,
      startRange: body.startAyah ?? 1,
    });

    if (scheduleItems.length > 0) {
      await supabase.from('nur_schedule_items').insert(scheduleItems);
    }

    return NextResponse.json({ profile: nurProfile });
  } catch (error) {
    console.error('Error creating Nur profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseServiceClient();

    const { data: profile, error } = await supabase
      .from('nur_profiles')
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq('clerk_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating Nur profile:', error);
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating Nur profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
