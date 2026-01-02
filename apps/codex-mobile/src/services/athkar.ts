import { supabase } from "./supabaseClient";
import { AthkarCategory, AthkarItem } from "@/types/entities";

export const fetchAthkarCategories = async () => {
  const { data, error } = await supabase
    .from("athkar_categories")
    .select("*")
    .order("order", { ascending: true });

  if (error) {
    throw error;
  }

  return data as AthkarCategory[];
};

export const fetchAthkarByCategory = async (categoryId: string) => {
  const { data, error } = await supabase
    .from("athkar_items")
    .select("*")
    .eq("category_id", categoryId);

  if (error) {
    throw error;
  }

  return data as AthkarItem[];
};

export const fetchAthkarCategoryBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from("athkar_categories")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    throw error;
  }

  return data as AthkarCategory;
};
