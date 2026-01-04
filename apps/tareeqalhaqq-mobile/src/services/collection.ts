import { supabase } from "./supabaseClient";
import { UserLibraryItem } from "@/types/entities";

export const fetchCollection = async (userId: string) => {
  const { data, error } = await supabase
    .from("user_library")
    .select("id, user_id, book_id, pinned, created_at, book:books(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data as UserLibraryItem[];
};

export const addToCollection = async (userId: string, bookId: string) => {
  const { data, error } = await supabase
    .from("user_library")
    .insert({ user_id: userId, book_id: bookId, pinned: false })
    .select("id, user_id, book_id, pinned, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as UserLibraryItem;
};

export const removeFromCollection = async (userId: string, bookId: string) => {
  const { error } = await supabase
    .from("user_library")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) {
    throw error;
  }
};

export const togglePinned = async (id: string, pinned: boolean) => {
  const { data, error } = await supabase
    .from("user_library")
    .update({ pinned })
    .eq("id", id)
    .select("id, user_id, book_id, pinned, created_at")
    .single();

  if (error) {
    throw error;
  }

  return data as UserLibraryItem;
};

export const fetchCollectionItem = async (userId: string, bookId: string) => {
  const { data, error } = await supabase
    .from("user_library")
    .select("id, user_id, book_id, pinned, created_at")
    .eq("user_id", userId)
    .eq("book_id", bookId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as UserLibraryItem | null;
};
