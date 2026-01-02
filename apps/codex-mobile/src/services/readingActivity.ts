import { supabase } from "./supabaseClient";
import { ReadingActivity } from "@/types/entities";

export const fetchRecentReading = async (userId: string) => {
  const { data, error } = await supabase
    .from("reading_activity")
    .select("id, user_id, book_id, last_position, last_opened_at, book:books(*)")
    .eq("user_id", userId)
    .order("last_opened_at", { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return data as ReadingActivity[];
};

export const upsertReadingActivity = async (
  userId: string,
  bookId: string,
  lastPosition = 0
) => {
  const { data, error } = await supabase
    .from("reading_activity")
    .upsert(
      {
        user_id: userId,
        book_id: bookId,
        last_position: lastPosition,
        last_opened_at: new Date().toISOString()
      },
      { onConflict: "user_id,book_id" }
    )
    .select("id, user_id, book_id, last_position, last_opened_at")
    .single();

  if (error) {
    throw error;
  }

  return data as ReadingActivity;
};
