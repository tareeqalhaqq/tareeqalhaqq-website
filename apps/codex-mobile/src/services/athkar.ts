import { supabase } from './supabase';
import { AthkarCategory, AthkarItem } from './types';

export async function fetchAthkarCategories() {
  const { data, error } = await supabase
    .from('athkar_categories')
    .select('*')
    .order('order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as AthkarCategory[];
}

export async function fetchAthkarItems(categoryId: string) {
  const { data, error } = await supabase
    .from('athkar_items')
    .select('*')
    .eq('category_id', categoryId)
    .order('repeat', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []) as AthkarItem[];
}
