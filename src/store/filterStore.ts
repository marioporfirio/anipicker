// src/store/filterStore.ts
import { create } from 'zustand';
// Removed: import { Studio } from '@/lib/anilist'; 

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

export type Selection = {
  name: string;
  mode: 'include' | 'exclude';
};

export type Language = 'en' | 'pt';

export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';

interface FilterState {
  search: string;
  // studio: string; // Removido
  yearRange: [number, number];
  scoreRange: [number, number];
  genres: Selection[];
  tags: Selection[];
  sortBy: string;
  formats: string[];
  includeTBA: boolean;
  language: Language;
  isSidebarOpen: boolean;
  isSortMode: boolean;
  // Removed: studioId: number | null; 
  statuses: MediaStatus[];
  // Removed: allStudios: Studio[]; 
}

interface FilterActions {
  setSearch: (query: string) => void;
  // Removed: setStudioId: (id: number | null) => void; 
  // Removed: setAllStudios: (studios: Studio[]) => void; 
  toggleStatus: (status: MediaStatus) => void;
  setYearRange: (range: [number, number]) => void;
  setScoreRange: (range: [number, number]) => void;
  toggleGenre: (genreName: string) => void;
  toggleTag: (tagName: string) => void;
  setSortBy: (sort: string) => void;
  toggleFormat: (format: string) => void;
  toggleIncludeTBA: () => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  toggleSortMode: () => void;
  resetAllFilters: () => void; // Added resetAllFilters
}

export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  // Initial state values are already the defaults we want for reset
  search: '',
  yearRange: [MIN_YEAR, MAX_YEAR],
  scoreRange: [0, 100],
  genres: [],
  tags: [],
  sortBy: 'POPULARITY_DESC',
  formats: [],
  includeTBA: false,
  language: 'pt',
  isSidebarOpen: true,
  isSortMode: false,
  // Removed: studioId: null, 
  statuses: [],
  // Removed: allStudios: [], 

  setSearch: (query) => set({ search: query }),
  // Removed: setStudioId: (id) => set({ studioId: id }), 
  // Removed: setAllStudios: (studios) => set({ allStudios: studios }), 
  setYearRange: (range) => set({ yearRange: range }),
  setScoreRange: (range) => set({ scoreRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setLanguage: (lang) => set({ language: lang }),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleSortMode: () => set((state) => ({ isSortMode: !state.isSortMode })),
  toggleIncludeTBA: () => set((state) => ({ includeTBA: !state.includeTBA })),

  toggleFormat: (format: string) => {
    const currentFormats = get().formats;
    if (currentFormats.includes(format)) {
      set({ formats: currentFormats.filter(f => f !== format) });
    } else {
      set({ formats: [...currentFormats, format] });
    }
  },

  toggleStatus: (status: MediaStatus) => {
    const currentStatuses = get().statuses;
    if (currentStatuses.includes(status)) {
      set({ statuses: currentStatuses.filter(s => s !== status) });
    } else {
      set({ statuses: [...currentStatuses, status] });
    }
  },

  toggleGenre: (genreName: string) => {
    const currentGenres = get().genres;
    const existingGenre = currentGenres.find(g => g.name === genreName);

    if (!existingGenre) {
      set({ genres: [...currentGenres, { name: genreName, mode: 'include' }] });
    } else if (existingGenre.mode === 'include') {
      set({
        genres: currentGenres.map(g => 
          g.name === genreName ? { ...g, mode: 'exclude' } : g
        ),
      });
    } else {
      set({ genres: currentGenres.filter(g => g.name !== genreName) });
    }
  },

  toggleTag: (tagName: string) => {
    const currentTags = get().tags;
    const existingTag = currentTags.find(t => t.name === tagName);

    if (!existingTag) {
      set({ tags: [...currentTags, { name: tagName, mode: 'include' }] });
    } else if (existingTag.mode === 'include') {
      set({
        tags: currentTags.map(t => 
          t.name === tagName ? { ...t, mode: 'exclude' } : t
        ),
      });
    } else {
      set({ tags: currentTags.filter(t => t.name !== tagName) });
    }
  },

  resetAllFilters: () => set({
    search: '',
    yearRange: [MIN_YEAR, MAX_YEAR],
    scoreRange: [0, 100],
    genres: [],
    tags: [],
    formats: [],
    statuses: [],
    includeTBA: false,
    sortBy: 'POPULARITY_DESC',
    // Non-filter states like language, isSidebarOpen, isSortMode are not reset
  }),
}));