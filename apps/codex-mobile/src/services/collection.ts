import { supabase } from './supabase';
import { UserLibrary } from './types';

export async function fetchCollection(userId: string) {
  const { data, error } = await supabase
    .from('user_library')
    .select('*, book:books(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as UserLibrary[];
}

export async function addToCollection(userId: string, bookId: string) {
  const { data, error } = await supabase
    .from('user_library')
    .insert({ user_id: userId, book_id: bookId, pinned: false })
    .select('*, book:books(*)')
    .single();

  if (error) {
    throw error;
  }

  return data as UserLibrary;
}

export async function togglePinned(libraryId: string, pinned: boolean) {
  const { data, error } = await supabase
    .from('user_library')
    .update({ pinned })
    .eq('id', libraryId)
    .select('*, book:books(*)')
    .single();

  if (error) {
    throw error;
  }

  return data as UserLibrary;
}
