import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

// GET /api/nur - Get user's Nur profile and data
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();

    // Fetch profile
    const { data: profile } = await supabase
      .from('nur_profiles')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ profile: null, items: [], goals: [], logs: [] });
    }

    // Fetch schedule items, goals, and logs in parallel
    const [itemsRes, goalsRes, logsRes] = await Promise.all([
      supabase
        .from('nur_schedule_items')
        .select('*')
        .eq('nur_profile_id', profile.id)
        .order('date', { ascending: true }),
      supabase
        .from('nur_goals')
        .select('*')
        .eq('nur_profile_id', profile.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('nur_daily_logs')
        .select('*')
        .eq('nur_profile_id', profile.id)
        .order('date', { ascending: true }),
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

// POST /api/nur - Create Nur profile (setup wizard)
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = createSupabaseServiceClient();

    // Get user's display name from profiles table
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('clerk_id', userId)
      .single();

    // Create Nur profile
    const { data: nurProfile, error: profileError } = await supabase
      .from('nur_profiles')
      .insert({
        clerk_id: userId,
        display_name: userProfile?.full_name ?? null,
        track_type: body.trackType ?? 'memorization',
        day_end_setting: body.dayEndSetting ?? 'midnight',
        fajr_time: body.fajrTime ?? null,
        memorization_start_surah: body.startSurah ?? 1,
        memorization_start_ayah: body.startAyah ?? 1,
        memorization_current_surah: body.startSurah ?? 1,
        memorization_current_ayah: body.startAyah ?? 1,
        daily_new_verses: body.dailyNewVerses ?? 5,
        daily_revision_pages: body.dailyRevisionPages ?? 2,
        preferred_time: body.preferredTime ?? null,
        reminder_enabled: body.reminderEnabled ?? true,
        setup_completed: true,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error creating Nur profile:', profileError);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    // Generate initial schedule (7 days)
    const scheduleItems = generateSchedule(
      nurProfile.id,
      body.startSurah ?? 1,
      body.startAyah ?? 1,
      body.dailyNewVerses ?? 5,
      body.trackType ?? 'memorization',
      7,
    );

    if (scheduleItems.length > 0) {
      await supabase.from('nur_schedule_items').insert(scheduleItems);
    }

    return NextResponse.json({ profile: nurProfile });
  } catch (error) {
    console.error('Error creating Nur profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/nur - Update Nur profile settings
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

// Helper: Generate schedule items
function generateSchedule(
  profileId: string,
  startSurah: number,
  startAyah: number,
  dailyVerses: number,
  trackType: string,
  days: number,
) {
  // Surah verse counts for scheduling
  const surahVerses: Record<number, number> = {
    1: 7, 2: 286, 3: 200, 4: 176, 5: 120, 6: 165, 7: 206, 8: 75, 9: 129, 10: 109,
    11: 123, 12: 111, 13: 43, 14: 52, 15: 99, 16: 128, 17: 111, 18: 110, 19: 98, 20: 135,
    21: 112, 22: 78, 23: 118, 24: 64, 25: 77, 26: 227, 27: 93, 28: 88, 29: 69, 30: 60,
    31: 34, 32: 30, 33: 73, 34: 54, 35: 45, 36: 83, 37: 182, 38: 88, 39: 75, 40: 85,
    41: 54, 42: 53, 43: 89, 44: 59, 45: 37, 46: 35, 47: 38, 48: 29, 49: 18, 50: 45,
    51: 60, 52: 49, 53: 62, 54: 55, 55: 78, 56: 96, 57: 29, 58: 22, 59: 24, 60: 13,
    61: 14, 62: 11, 63: 11, 64: 18, 65: 12, 66: 12, 67: 30, 68: 52, 69: 52, 70: 44,
    71: 28, 72: 28, 73: 20, 74: 56, 75: 40, 76: 31, 77: 50, 78: 40, 79: 46, 80: 42,
    81: 29, 82: 19, 83: 36, 84: 25, 85: 22, 86: 17, 87: 19, 88: 26, 89: 30, 90: 20,
    91: 15, 92: 21, 93: 11, 94: 8, 95: 8, 96: 19, 97: 5, 98: 8, 99: 8, 100: 11,
    101: 11, 102: 8, 103: 3, 104: 9, 105: 5, 106: 4, 107: 7, 108: 3, 109: 6, 110: 3,
    111: 5, 112: 4, 113: 5, 114: 6,
  };

  const items: Array<{
    nur_profile_id: string;
    date: string;
    task_type: string;
    surah_number: number;
    start_ayah: number;
    end_ayah: number;
    completed: boolean;
    carried_over: boolean;
  }> = [];

  let currentSurah = startSurah;
  let currentAyah = startAyah;

  for (let day = 0; day < days; day++) {
    const date = new Date();
    date.setDate(date.getDate() + day);
    const dateStr = date.toISOString().split('T')[0];

    let versesLeft = dailyVerses;
    while (versesLeft > 0 && currentSurah <= 114) {
      const maxAyah = surahVerses[currentSurah] ?? 1;
      const available = maxAyah - currentAyah + 1;
      const toAssign = Math.min(versesLeft, available);

      items.push({
        nur_profile_id: profileId,
        date: dateStr,
        task_type: trackType,
        surah_number: currentSurah,
        start_ayah: currentAyah,
        end_ayah: currentAyah + toAssign - 1,
        completed: false,
        carried_over: false,
      });

      versesLeft -= toAssign;
      currentAyah += toAssign;

      if (currentAyah > maxAyah) {
        currentSurah++;
        currentAyah = 1;
      }
    }
  }

  return items;
}
