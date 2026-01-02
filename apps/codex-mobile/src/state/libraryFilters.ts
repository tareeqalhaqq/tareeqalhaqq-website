import { create } from 'zustand';

type LibraryFilterState = {
  search: string;
  category: string | null;
  setSearch: (value: string) => void;
  setCategory: (value: string | null) => void;
};

export const useLibraryFilters = create<LibraryFilterState>((set) => ({
  search: '',
  category: null,
  setSearch: (search) => set({ search }),
  setCategory: (category) => set({ category })
}));
