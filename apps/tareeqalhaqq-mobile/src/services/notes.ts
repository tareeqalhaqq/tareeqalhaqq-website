import { supabase } from "./supabaseClient";
import { Note } from "@/types/entities";

export const fetchNotes = async (userId: string, bookId?: string | null) => {
  let query = supabase
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (bookId) {
    query = query.eq("book_id", bookId);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data as Note[];
};

export const createNote = async (payload: Partial<Note>) => {
  const { data, error } = await supabase
    .from("notes")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Note;
};

export const updateNote = async (id: string, payload: Partial<Note>) => {
  const { data, error } = await supabase
    .from("notes")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as Note;
};

export const deleteNote = async (id: string) => {
  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) {
    throw error;
  }
};
