export type Book = {
  id: string;
  title: string;
  author: string | null;
  description: string | null;
  cover_url: string | null;
  file_url: string | null;
  type: string | null;
  category: string | null;
  created_at: string;
};

export type UserLibraryItem = {
  id: string;
  user_id: string;
  book_id: string;
  pinned: boolean | null;
  created_at: string;
  book?: Book | null;
};

export type ReadingActivity = {
  id: string;
  user_id: string;
  book_id: string;
  last_position: number | null;
  last_opened_at: string;
  book?: Book | null;
};

export type Note = {
  id: string;
  user_id: string;
  book_id: string | null;
  title: string;
  content: string;
  location: string | null;
  created_at: string;
  updated_at: string;
};

export type AthkarCategory = {
  id: string;
  name: string;
  slug: string;
  time_of_day: string | null;
  order: number | null;
};

export type AthkarItem = {
  id: string;
  category_id: string;
  arabic_text: string;
  translation: string | null;
  transliteration: string | null;
  repeat: number | null;
  audio_url: string | null;
};
