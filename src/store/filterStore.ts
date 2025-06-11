// src/store/filterStore.ts
import { create } from 'zustand';
import { ListStatus } from './userListStore';

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

export type Selection = {
  name: string;
  mode: 'include' | 'exclude';
};

export type Language = 'en' | 'pt';
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type MediaSource = 'ORIGINAL' | 'MANGA' | 'LIGHT_NOVEL' | 'VISUAL_NOVEL' | 'VIDEO_GAME' | 'WEB_NOVEL' | 'OTHER';
export type SortDirection = 'DESC' | 'ASC';
export type ViewMode = 'grid' | 'schedule';

interface FilterState {
  search: string;
  yearRange: [number, number];
  scoreRange: [number, number];
  excludeNoScore: boolean;
  genres: Selection[];
  tags: Selection[];
  sortBy: string;
  sortDirection: SortDirection;
  formats: string[];
  sources: MediaSource[];
  includeTBA: boolean;
  language: Language;
  isSidebarOpen: boolean;
  statuses: MediaStatus[];
  viewMode: ViewMode;
  showOnlyMyListInCalendar: boolean;
  listStatusFilter: ListStatus | null;
}

interface FilterActions {
  setSearch: (query: string) => void;
  toggleStatus: (status: MediaStatus) => void;
  toggleSource: (source: MediaSource) => void;
  setYearRange: (range: [number, number]) => void;
  setScoreRange: (range: [number, number]) => void;
  toggleExcludeNoScore: () => void;
  toggleGenre: (genreName: string) => void;
  toggleTag: (tagName: string) => void;
  setSortBy: (sort: string) => void;
  toggleSortDirection: () => void;
  toggleFormat: (format: string) => void;
  toggleIncludeTBA: () => void;
  setLanguage: (lang: Language) => void;
  toggleSidebar: () => void;
  resetAllFilters: () => void;
  setViewMode: (mode: ViewMode) => void;
  toggleShowOnlyMyListInCalendar: () => void;
  setListStatusFilter: (status: ListStatus | null) => void;
}

export const useFilterStore = create<FilterState & FilterActions>((set, get) => ({
  search: '',
  yearRange: [MIN_YEAR, MAX_YEAR],
  scoreRange: [0, 100],
  excludeNoScore: false,
  genres: [],
  tags: [],
  sortBy: 'POPULARITY_DESC',
  sortDirection: 'DESC',
  formats: [],
  sources: [],
  includeTBA: false,
  language: 'pt',
  isSidebarOpen: true,
  statuses: [],
  viewMode: 'grid',
  showOnlyMyListInCalendar: false,
  listStatusFilter: null,

  setSearch: (query) => set({ search: query }),
  setYearRange: (range) => set({ yearRange: range }),
  setScoreRange: (range) => set({ scoreRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setLanguage: (lang) => set({ language: lang }),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleIncludeTBA: () => set((state) => ({ includeTBA: !state.includeTBA })),
  toggleExcludeNoScore: () => set((state) => ({ excludeNoScore: !state.excludeNoScore })),
  setViewMode: (mode) => set({ viewMode: mode }),
  toggleShowOnlyMyListInCalendar: () => set((state) => ({ showOnlyMyListInCalendar: !state.showOnlyMyListInCalendar })),
  setListStatusFilter: (status) => set({ listStatusFilter: status }),

  toggleSortDirection: () => set((state) => ({
    sortDirection: state.sortDirection === 'DESC' ? 'ASC' : 'DESC'
  })),

  toggleFormat: (format: string) => {
    const currentFormats = get().formats;
    set({ formats: currentFormats.includes(format) ? currentFormats.filter(f => f !== format) : [...currentFormats, format] });
  },

  toggleSource: (source: MediaSource) => {
    const currentSources = get().sources;
    set({ sources: currentSources.includes(source) ? currentSources.filter(s => s !== source) : [...currentSources, source] });
  },

  toggleStatus: (status: MediaStatus) => {
    const currentStatuses = get().statuses;
    set({ statuses: currentStatuses.includes(status) ? currentStatuses.filter(s => s !== status) : [...currentStatuses, status] });
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
    excludeNoScore: false,
    genres: [],
    tags: [],
    formats: [],
    statuses: [],
    sources: [],
    includeTBA: false,
    sortBy: 'POPULARITY_DESC',
    sortDirection: 'DESC',
    listStatusFilter: null,
  }),
}));