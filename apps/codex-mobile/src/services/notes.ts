import { supabase } from './supabase';
import { Note } from './types';

export async function fetchNotes(userId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as Note[];
}

export async function fetchNoteById(noteId: string) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', noteId)
    .single();

  if (error) {
    throw error;
  }

  return data as Note;
}

export async function upsertNote(payload: Partial<Note> & { user_id: string }) {
  const { data, error } = await supabase
    .from('notes')
    .upsert(payload)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Note;
}

export async function deleteNote(noteId: string) {
  const { error } = await supabase.from('notes').delete().eq('id', noteId);
  if (error) {
    throw error;
  }
}
