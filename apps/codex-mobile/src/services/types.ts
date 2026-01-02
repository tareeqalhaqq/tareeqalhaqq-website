export type Book = {
  id: string;
  title: string;
  author: string;
  description: string;
  cover_url?: string | null;
  file_url?: string | null;
  type: string;
  category: string;
  created_at: string;
};

export type UserLibrary = {
  id: string;
  user_id: string;
  book_id: string;
  pinned: boolean;
  created_at: string;
  book?: Book;
};

export type ReadingActivity = {
  id: string;
  user_id: string;
  book_id: string;
  last_position: number;
  last_opened_at: string;
  book?: Book;
};

export type Note = {
  id: string;
  user_id: string;
  book_id?: string | null;
  title: string;
  content: string;
  location?: string | null;
  created_at: string;
  updated_at: string;
};

export type AthkarCategory = {
  id: string;
  name: string;
  slug: string;
  time_of_day?: string | null;
  order: number;
};

export type AthkarItem = {
  id: string;
  category_id: string;
  arabic_text: string;
  translation: string;
  transliteration?: string | null;
  repeat: number;
  audio_url?: string | null;
};
