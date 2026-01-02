import { supabase } from './supabase';
import { ReadingActivity } from './types';

export async function fetchReadingActivity(userId: string) {
  const { data, error } = await supabase
    .from('reading_activity')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .order('last_opened_at', { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return (data ?? []) as ReadingActivity[];
}
