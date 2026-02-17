import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { MISTAKE_TYPES, type MistakeType } from '@/components/nur/mushaf/types';
import { createSupabaseServiceClient } from '@/lib/supabase';

const MISTAKE_TYPE_SET = new Set<string>(MISTAKE_TYPES);
const MISSING_TABLE_CODES = new Set(['42P01', 'PGRST204']);

type MaybeError = { code?: string; message?: string } | null;

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(Math.trunc(value), min), max);
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function safeData<T>(
  label: string,
  promise: Promise<{ data: T | null; error: MaybeError }>,
  fallback: T,
): Promise<T> {
  const { data, error } = await promise;
  if (error) {
    if (!MISSING_TABLE_CODES.has(error.code ?? '') && error.code !== 'PGRST116') {
      console.error(`[mushaf:${label}]`, error);
    }
    return fallback;
  }

  return (data ?? fallback) as T;
}

async function getProfileId(supabase: ReturnType<typeof createSupabaseServiceClient>, clerkId: string) {
  const { data, error } = await supabase
    .from('nur_profiles')
    .select('id')
    .eq('clerk_id', clerkId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.id as string;
}

function computeSpacedReview(card: {
  interval_days: number | null;
  ease_factor: number | null;
  repetitions: number | null;
  lapses: number | null;
}, grade: number) {
  const previousInterval = Math.max(card.interval_days ?? 1, 1);
  let easeFactor = Math.min(Math.max(card.ease_factor ?? 2.5, 1.3), 3.0);
  let repetitions = Math.max(card.repetitions ?? 0, 0);
  let lapses = Math.max(card.lapses ?? 0, 0);

  let nextInterval = 1;

  if (grade < 3) {
    lapses += 1;
    repetitions = 0;
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    nextInterval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) {
      nextInterval = 1;
    } else if (repetitions === 2) {
      nextInterval = 3;
    } else {
      nextInterval = Math.max(1, Math.round(previousInterval * (easeFactor + grade * 0.08)));
    }

    easeFactor = Math.min(
      3.0,
      Math.max(1.3, easeFactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))),
    );
  }

  return {
    previousInterval,
    nextInterval,
    easeFactor,
    repetitions,
    lapses,
  };
}

type MistakeRow = {
  verse_key: string;
  surah_number: number;
  ayah_number: number;
  confidence: number | null;
  repeated_correction: boolean | null;
  stopped_mid_ayah: boolean | null;
  event_time: string;
  mistake_type: MistakeType;
};

function rankWeakAyat(rows: MistakeRow[]) {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const ranked = new Map<
    string,
    {
      verse_key: string;
      surah_number: number;
      ayah_number: number;
      mistake_count: number;
      repeated_corrections: number;
      stop_mid_count: number;
      last_7d_mistakes: number;
      weak_score: number;
      last_mistake_at: string;
    }
  >();

  rows.forEach(row => {
    const eventTs = new Date(row.event_time).getTime();
    const daysAgo = Math.max((now - eventTs) / (24 * 60 * 60 * 1000), 0);
    const recencyDecay = Math.exp(-daysAgo / 14);
    const confidence = Math.min(Math.max(row.confidence ?? 0.5, 0), 1);
    const repeated = row.repeated_correction ? 1 : 0;
    const stopMid = row.stopped_mid_ayah ? 1 : 0;
    const contribution =
      (1 + confidence * 0.9) *
      (1 + repeated * 0.55 + stopMid * 0.4) *
      (1 + recencyDecay * 0.8);

    const existing = ranked.get(row.verse_key) ?? {
      verse_key: row.verse_key,
      surah_number: row.surah_number,
      ayah_number: row.ayah_number,
      mistake_count: 0,
      repeated_corrections: 0,
      stop_mid_count: 0,
      last_7d_mistakes: 0,
      weak_score: 0,
      last_mistake_at: row.event_time,
    };

    existing.mistake_count += 1;
    existing.repeated_corrections += repeated;
    existing.stop_mid_count += stopMid;
    existing.weak_score += contribution;
    if (eventTs >= sevenDaysAgo) {
      existing.last_7d_mistakes += 1;
    }
    if (new Date(existing.last_mistake_at).getTime() < eventTs) {
      existing.last_mistake_at = row.event_time;
    }

    ranked.set(row.verse_key, existing);
  });

  return Array.from(ranked.values())
    .map(item => ({
      ...item,
      weak_score: Number(
        (
          item.weak_score +
          item.mistake_count * 0.6 +
          item.repeated_corrections * 1.2 +
          item.stop_mid_count * 0.9 +
          item.last_7d_mistakes * 0.8
        ).toFixed(2),
      ),
    }))
    .sort((a, b) => b.weak_score - a.weak_score || b.mistake_count - a.mistake_count);
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createSupabaseServiceClient();
    const profileId = await getProfileId(supabase, userId);
    if (!profileId) {
      return NextResponse.json({
        weakAyat: [],
        dueReviews: [],
        recentMistakes: [],
        stats: {
          weekly_sessions: 0,
          monthly_minutes: 0,
          most_recited_surah: null,
          streak_days: 0,
          longest_session_minutes: 0,
          total_ayat_reviewed: 0,
          review_consistency: 0,
          improvement_trend: 0,
        },
      });
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const sevenDaysAgo = addDays(now, -7).toISOString();
    const thirtyDaysAgo = addDays(now, -30).toISOString();
    const fourteenDaysAgo = addDays(now, -14).toISOString();

    const [mistakeRows, dueReviews, reviewCount, reviewDaysRows, recentSessions] = await Promise.all([
      safeData(
        'mistakes',
        supabase
          .from('mushaf_mistake_events')
          .select(
            'verse_key,surah_number,ayah_number,confidence,repeated_correction,stopped_mid_ayah,event_time,mistake_type',
          )
          .eq('nur_profile_id', profileId)
          .gte('event_time', addDays(now, -90).toISOString())
          .order('event_time', { ascending: false })
          .limit(1500),
        [] as MistakeRow[],
      ),
      safeData(
        'due-reviews',
        supabase
          .from('mushaf_review_cards')
          .select(
            'id,verse_key,surah_number,start_ayah,end_ayah,due_date,interval_days,ease_factor,repetitions,lapses,last_grade',
          )
          .eq('nur_profile_id', profileId)
          .eq('suspended', false)
          .lte('due_date', today)
          .order('due_date', { ascending: true })
          .limit(40),
        [] as Array<{
          id: string;
          verse_key: string;
          surah_number: number;
          start_ayah: number;
          end_ayah: number;
          due_date: string;
          interval_days: number;
          ease_factor: number;
          repetitions: number;
          lapses: number;
          last_grade: number | null;
        }>,
      ),
      supabase
        .from('mushaf_review_history')
        .select('id', { head: true, count: 'exact' })
        .eq('nur_profile_id', profileId),
      safeData(
        'review-days',
        supabase
          .from('mushaf_review_history')
          .select('reviewed_at')
          .eq('nur_profile_id', profileId)
          .gte('reviewed_at', sevenDaysAgo),
        [] as Array<{ reviewed_at: string }>,
      ),
      safeData(
        'sessions',
        supabase
          .from('mushaf_recitation_sessions')
          .select('id,started_at,duration_seconds,surah_number')
          .eq('nur_profile_id', profileId)
          .gte('started_at', thirtyDaysAgo)
          .order('started_at', { ascending: false })
          .limit(500),
        [] as Array<{ id: string; started_at: string; duration_seconds: number | null; surah_number: number | null }>,
      ),
    ]);

    const weakAyat = rankWeakAyat(mistakeRows);
    const recentMistakes = mistakeRows.slice(0, 80);

    const thisWeekMistakes = mistakeRows.filter(row => new Date(row.event_time).getTime() >= new Date(sevenDaysAgo).getTime()).length;
    const previousWeekMistakes = mistakeRows.filter(row => {
      const ts = new Date(row.event_time).getTime();
      return ts >= new Date(fourteenDaysAgo).getTime() && ts < new Date(sevenDaysAgo).getTime();
    }).length;

    const improvementTrend = previousWeekMistakes <= 0
      ? thisWeekMistakes > 0 ? -100 : 0
      : Math.round(((previousWeekMistakes - thisWeekMistakes) / previousWeekMistakes) * 100);

    const weeklySessions = recentSessions.filter(session => new Date(session.started_at).getTime() >= new Date(sevenDaysAgo).getTime()).length;
    const monthlyMinutes = Math.round(
      recentSessions.reduce((sum, session) => sum + Math.max(session.duration_seconds ?? 0, 0), 0) / 60,
    );
    const longestSessionMinutes = Math.round(
      recentSessions.reduce((max, session) => Math.max(max, Math.max(session.duration_seconds ?? 0, 0)), 0) / 60,
    );

    const surahCounts = new Map<number, number>();
    recentSessions.forEach(session => {
      if (!session.surah_number) {
        return;
      }
      surahCounts.set(session.surah_number, (surahCounts.get(session.surah_number) ?? 0) + 1);
    });
    const mostRecitedSurah = Array.from(surahCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    const sessionDates = Array.from(
      new Set(
        recentSessions.map(session => {
          const date = new Date(session.started_at);
          return date.toISOString().split('T')[0];
        }),
      ),
    );
    let streakDays = 0;
    for (let i = 0; i < 365; i += 1) {
      const cursor = addDays(now, -i).toISOString().split('T')[0];
      if (sessionDates.includes(cursor)) {
        streakDays += 1;
      } else {
        break;
      }
    }

    const reviewDays = new Set(reviewDaysRows.map(item => item.reviewed_at.split('T')[0])).size;
    const reviewConsistency = Number((reviewDays / 7).toFixed(2));

    return NextResponse.json({
      weakAyat,
      dueReviews,
      recentMistakes,
      stats: {
        weekly_sessions: weeklySessions,
        monthly_minutes: monthlyMinutes,
        most_recited_surah: mostRecitedSurah,
        streak_days: streakDays,
        longest_session_minutes: longestSessionMinutes,
        total_ayat_reviewed: reviewCount.count ?? 0,
        review_consistency: reviewConsistency,
        improvement_trend: improvementTrend,
      },
    });
  } catch (error) {
    console.error('Error fetching mushaf analytics:', error);
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
    const action = body?.action as string | undefined;
    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 });
    }

    const supabase = createSupabaseServiceClient();
    const profileId = await getProfileId(supabase, userId);
    if (!profileId) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
    }

    if (action === 'reader_state') {
      const payload = body.payload ?? {};
      const updates: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };

      if (payload.view_mode === 'page' || payload.view_mode === 'ayah') {
        updates.mushaf_view_mode = payload.view_mode;
      }
      if (typeof payload.surah === 'number') {
        updates.mushaf_last_surah = clamp(payload.surah, 1, 114);
      }
      if (typeof payload.ayah === 'number') {
        updates.mushaf_last_ayah = clamp(payload.ayah, 1, 286);
      }
      if (typeof payload.page === 'number') {
        updates.mushaf_last_page = clamp(payload.page, 1, 604);
      }
      if (typeof payload.scroll_page === 'number') {
        updates.mushaf_scroll_page = Math.max(0, Math.trunc(payload.scroll_page));
      }
      if (typeof payload.scroll_ayah === 'number') {
        updates.mushaf_scroll_ayah = Math.max(0, Math.trunc(payload.scroll_ayah));
      }
      if (typeof payload.playback_rate === 'number') {
        updates.mushaf_playback_rate = Math.max(0.75, Math.min(1.25, payload.playback_rate));
      }
      if (typeof payload.follow_playback === 'boolean') {
        updates.mushaf_follow_playback_enabled = payload.follow_playback;
      }

      const { error } = await supabase
        .from('nur_profiles')
        .update(updates)
        .eq('id', profileId);

      if (error) {
        if (error.code === '42703') {
          return NextResponse.json({ ok: true });
        }
        console.error('Error saving reader state:', error);
        return NextResponse.json({ error: 'Failed to save reader state' }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'start_session') {
      const payload = body.payload ?? {};
      const { data, error } = await supabase
        .from('mushaf_recitation_sessions')
        .insert({
          nur_profile_id: profileId,
          surah_number: clamp(payload.surah ?? 1, 1, 114),
          start_ayah: Math.max(Math.trunc(payload.ayah ?? 1), 1),
          reciter_id: payload.reciter_id ?? null,
          playback_mode: payload.playback_mode ?? 'single_ayah',
          playback_speed: Math.max(0.75, Math.min(1.25, payload.playback_rate ?? 1)),
          started_at: new Date().toISOString(),
        })
        .select('id,started_at')
        .single();

      if (error) {
        if (MISSING_TABLE_CODES.has(error.code ?? '')) {
          return NextResponse.json({ session: { id: `local-${Date.now()}`, started_at: new Date().toISOString() } });
        }
        console.error('Error starting session:', error);
        return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
      }

      return NextResponse.json({ session: data });
    }

    if (action === 'end_session') {
      const payload = body.payload ?? {};
      const sessionId = String(payload.session_id ?? '');
      if (!sessionId || sessionId.startsWith('local-')) {
        return NextResponse.json({ ok: true });
      }

      const { error } = await supabase
        .from('mushaf_recitation_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_seconds: Math.max(0, Math.trunc(payload.duration_seconds ?? 0)),
          surah_number: typeof payload.surah === 'number' ? clamp(payload.surah, 1, 114) : null,
          end_ayah: typeof payload.ayah === 'number' ? Math.max(Math.trunc(payload.ayah), 1) : null,
          loop_ayah_count: Math.max(Math.trunc(payload.loop_ayah_count ?? 0), 0),
          loop_range_count: Math.max(Math.trunc(payload.loop_range_count ?? 0), 0),
          loop_surah_count: Math.max(Math.trunc(payload.loop_surah_count ?? 0), 0),
          mistake_count: Math.max(Math.trunc(payload.mistake_count ?? 0), 0),
          confidence_score: payload.confidence_score == null ? null : clamp(payload.confidence_score, 0, 100),
        })
        .eq('id', sessionId)
        .eq('nur_profile_id', profileId);

      if (error && !MISSING_TABLE_CODES.has(error.code ?? '')) {
        console.error('Error ending session:', error);
        return NextResponse.json({ error: 'Failed to end session' }, { status: 500 });
      }

      return NextResponse.json({ ok: true });
    }

    if (action === 'log_mistake') {
      const payload = body.payload ?? {};
      const mistakeType = String(payload.mistake_type ?? '') as MistakeType;
      if (!MISTAKE_TYPE_SET.has(mistakeType)) {
        return NextResponse.json({ error: 'Invalid mistake type' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('mushaf_mistake_events')
        .insert({
          nur_profile_id: profileId,
          session_id: typeof payload.session_id === 'string' && !payload.session_id.startsWith('local-')
            ? payload.session_id
            : null,
          verse_key: payload.verse_key,
          surah_number: clamp(payload.surah ?? 1, 1, 114),
          ayah_number: Math.max(Math.trunc(payload.ayah ?? 1), 1),
          mistake_type: mistakeType,
          confidence: Math.max(0, Math.min(1, Number(payload.confidence ?? 0.6))),
          repeated_correction: Boolean(payload.repeated_correction || mistakeType === 'REPEAT'),
          stopped_mid_ayah: Boolean(payload.stopped_mid_ayah || mistakeType === 'STOP_MID'),
          event_time: new Date().toISOString(),
        })
        .select('id,verse_key,mistake_type,event_time')
        .single();

      if (error) {
        if (MISSING_TABLE_CODES.has(error.code ?? '')) {
          return NextResponse.json({
            event: {
              id: `local-${Date.now()}`,
              verse_key: payload.verse_key,
              mistake_type: mistakeType,
              event_time: new Date().toISOString(),
            },
          });
        }
        console.error('Error logging mistake:', error);
        return NextResponse.json({ error: 'Failed to log mistake' }, { status: 500 });
      }

      return NextResponse.json({ event: data });
    }

    if (action === 'enqueue_review') {
      const payload = body.payload ?? {};
      const startAyah = Math.max(Math.trunc(payload.start_ayah ?? payload.ayah ?? 1), 1);
      const endAyah = Math.max(Math.trunc(payload.end_ayah ?? startAyah), startAyah);
      const { data, error } = await supabase
        .from('mushaf_review_cards')
        .upsert(
          {
            nur_profile_id: profileId,
            verse_key: payload.verse_key,
            surah_number: clamp(payload.surah ?? 1, 1, 114),
            start_ayah: startAyah,
            end_ayah: endAyah,
            source_type: payload.source_type ?? 'manual',
            due_date: new Date().toISOString().split('T')[0],
            interval_days: 1,
            ease_factor: 2.5,
            repetitions: 0,
            lapses: 0,
            suspended: false,
          },
          { onConflict: 'nur_profile_id,verse_key,start_ayah,end_ayah' },
        )
        .select(
          'id,verse_key,surah_number,start_ayah,end_ayah,due_date,interval_days,ease_factor,repetitions,lapses,last_grade',
        )
        .single();

      if (error) {
        if (MISSING_TABLE_CODES.has(error.code ?? '')) {
          return NextResponse.json({
            card: {
              id: `local-${Date.now()}`,
              verse_key: payload.verse_key,
              surah_number: clamp(payload.surah ?? 1, 1, 114),
              start_ayah: startAyah,
              end_ayah: endAyah,
              due_date: new Date().toISOString().split('T')[0],
              interval_days: 1,
              ease_factor: 2.5,
              repetitions: 0,
              lapses: 0,
              last_grade: null,
            },
          });
        }

        console.error('Error enqueueing review:', error);
        return NextResponse.json({ error: 'Failed to enqueue review' }, { status: 500 });
      }

      return NextResponse.json({ card: data });
    }

    if (action === 'grade_review') {
      const payload = body.payload ?? {};
      const cardId = String(payload.card_id ?? '');
      const grade = clamp(payload.grade ?? 0, 0, 5);
      if (!cardId) {
        return NextResponse.json({ error: 'Missing card id' }, { status: 400 });
      }
      if (cardId.startsWith('local-')) {
        return NextResponse.json({ ok: true });
      }

      const card = await safeData(
        'review-card',
        supabase
          .from('mushaf_review_cards')
          .select('id,due_date,interval_days,ease_factor,repetitions,lapses')
          .eq('id', cardId)
          .eq('nur_profile_id', profileId)
          .single(),
        null as {
          id: string;
          due_date: string;
          interval_days: number;
          ease_factor: number;
          repetitions: number;
          lapses: number;
        } | null,
      );

      if (!card) {
        return NextResponse.json({ error: 'Review card not found' }, { status: 404 });
      }

      const next = computeSpacedReview(card, grade);
      const now = new Date();
      const nextDue = addDays(now, next.nextInterval).toISOString().split('T')[0];

      const updateRes = await supabase
        .from('mushaf_review_cards')
        .update({
          due_date: nextDue,
          interval_days: next.nextInterval,
          ease_factor: next.easeFactor,
          repetitions: next.repetitions,
          lapses: next.lapses,
          last_grade: grade,
          last_reviewed_at: now.toISOString(),
        })
        .eq('id', card.id)
        .eq('nur_profile_id', profileId)
        .select(
          'id,verse_key,surah_number,start_ayah,end_ayah,due_date,interval_days,ease_factor,repetitions,lapses,last_grade',
        )
        .single();

      if (updateRes.error) {
        console.error('Error updating review card:', updateRes.error);
        return NextResponse.json({ error: 'Failed to grade review' }, { status: 500 });
      }

      const historyRes = await supabase.from('mushaf_review_history').insert({
        nur_profile_id: profileId,
        review_card_id: card.id,
        reviewed_at: now.toISOString(),
        grade,
        previous_interval_days: next.previousInterval,
        next_interval_days: next.nextInterval,
        due_date_before: card.due_date,
        due_date_after: nextDue,
      });

      if (historyRes.error && !MISSING_TABLE_CODES.has(historyRes.error.code ?? '')) {
        console.error('Error inserting review history:', historyRes.error);
      }

      return NextResponse.json({ card: updateRes.data, review: next });
    }

    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  } catch (error) {
    console.error('Error in mushaf action route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
