import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase';
import { buildScheduleItems, SURAH_VERSES, UNIT_MAX } from '@/lib/nur-schedule';
import type { QuranUnit, TrackType } from '@/lib/nur-types';

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { itemId, completed } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'Item ID required' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();

    const { data: profile } = await supabase
      .from('nur_profiles')
      .select('id')
      .eq('clerk_id', userId)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const { data: item, error } = await supabase
      .from('nur_schedule_items')
      .update({
        completed,
        completed_at: completed ? new Date().toISOString() : null,
      })
      .eq('id', itemId)
      .eq('nur_profile_id', profile.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating item:', error);
      return NextResponse.json({ error: 'Failed to update item' }, { status: 500 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST() {
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
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    const unitType: QuranUnit = profile.preferred_unit ?? 'ayah';
    const trackTypes: TrackType[] = (profile.track_types as TrackType[])?.length ? profile.track_types as TrackType[] : ['memorization'];

    const { data: existingItems } = await supabase
      .from('nur_schedule_items')
      .select('*')
      .eq('nur_profile_id', profile.id)
      .order('date', { ascending: true });

    const lastDate = existingItems?.length
      ? new Date(`${existingItems[existingItems.length - 1].date}T12:00:00`)
      : new Date();

    const generated = trackTypes.flatMap(trackType => {
      const trackItems = (existingItems ?? []).filter(item => item.task_type === trackType);
      const lastTrackItem = trackItems[trackItems.length - 1];

      let nextSurah = unitType === 'ayah' ? (lastTrackItem?.surah_number ?? profile.memorization_current_surah ?? 1) : 1;
      let nextRange = lastTrackItem ? lastTrackItem.range_end + 1 : profile.memorization_current_ayah ?? 1;

      if (unitType === 'ayah') {
        const maxAyah = SURAH_VERSES[nextSurah] ?? 1;
        if (nextRange > maxAyah) {
          nextSurah += 1;
          nextRange = 1;
        }
      } else {
        nextRange = Math.min(Math.max(nextRange, 1), UNIT_MAX[unitType]);
      }

      return buildScheduleItems({
        profileId: profile.id,
        trackTypes: [trackType],
        unitType,
        startDate: new Date(lastDate.getTime() + 24 * 60 * 60 * 1000),
        days: 7,
        dailyNewAmount: profile.daily_new_amount,
        dailyRevisionAmount: profile.daily_revision_amount,
        startSurah: nextSurah,
        startRange: nextRange,
      });
    });

    if (generated.length > 0) {
      const { error } = await supabase.from('nur_schedule_items').insert(generated);
      if (error) {
        console.error('Error inserting schedule items:', error);
        return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
      }
    }

    return NextResponse.json({ items: generated, generated: generated.length });
  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
