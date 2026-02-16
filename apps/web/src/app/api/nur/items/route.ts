import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createSupabaseServiceClient } from '@/lib/supabase';

// PUT /api/nur/items - Toggle item completion
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

    // Verify ownership
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
        completed: completed,
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

// POST /api/nur/items - Generate more schedule items
export async function POST(request: Request) {
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

    // Get the last scheduled item to continue from
    const { data: lastItems } = await supabase
      .from('nur_schedule_items')
      .select('*')
      .eq('nur_profile_id', profile.id)
      .order('date', { ascending: false })
      .order('range_end', { ascending: false })
      .limit(1);

    const lastItem = lastItems?.[0];
    let startSurah = profile.memorization_current_surah ?? 1;
    let startAyah = profile.memorization_current_ayah ?? 1;

    if (lastItem) {
      startSurah = lastItem.surah_number ?? startSurah;
      startAyah = lastItem.range_end + 1;
      // Check if we need to move to next surah
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
      if (startAyah > (surahVerses[startSurah] ?? 1)) {
        startSurah++;
        startAyah = 1;
      }
    }

    // Get the last date to schedule from
    const lastDate = lastItem?.date ? new Date(lastItem.date + 'T12:00:00') : new Date();
    const unitType: string = profile.preferred_unit ?? 'ayah';
    const primaryTrack: string = (profile.track_types as string[])?.[0] ?? 'memorization';

    const items: Array<{
      nur_profile_id: string;
      date: string;
      task_type: string;
      unit_type: string;
      surah_number: number | null;
      range_start: number;
      range_end: number;
      completed: boolean;
      carried_over: boolean;
    }> = [];

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

    let curSurah = startSurah;
    let curAyah = startAyah;

    for (let day = 1; day <= 7; day++) {
      const date = new Date(lastDate);
      date.setDate(date.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];

      let amountLeft = profile.daily_new_amount;
      while (amountLeft > 0 && curSurah <= 114) {
        const maxAyah = surahVerses[curSurah] ?? 1;
        const available = maxAyah - curAyah + 1;
        const toAssign = Math.min(amountLeft, available);

        items.push({
          nur_profile_id: profile.id,
          date: dateStr,
          task_type: primaryTrack,
          unit_type: unitType,
          surah_number: unitType === 'ayah' ? curSurah : null,
          range_start: curAyah,
          range_end: curAyah + toAssign - 1,
          completed: false,
          carried_over: false,
        });

        amountLeft -= toAssign;
        curAyah += toAssign;
        if (curAyah > maxAyah) {
          curSurah++;
          curAyah = 1;
        }
      }
    }

    if (items.length > 0) {
      const { error } = await supabase.from('nur_schedule_items').insert(items);
      if (error) {
        console.error('Error inserting schedule items:', error);
        return NextResponse.json({ error: 'Failed to generate schedule' }, { status: 500 });
      }
    }

    return NextResponse.json({ items, generated: items.length });
  } catch (error) {
    console.error('Error generating schedule:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
