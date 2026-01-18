import { supabase } from "./supabaseClient";
import { Book } from "@/types/entities";

export const fetchBooks = async (search?: string, category?: string) => {
  let query = supabase
    .from("books")
    .select("*")
    .order("created_at", { ascending: false });

  if (search && search.trim().length > 0) {
    query = query.ilike("title", `%${search.trim()}%`);
  }

  if (category && category !== "all") {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) {
    throw error;
  }

  return data as Book[];
};

export const fetchBookById = async (id: string) => {
  const { data, error } = await supabase
    .from("books")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    throw error;
  }

  return data as Book;
};
