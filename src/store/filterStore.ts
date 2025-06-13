// =================================================================
// ============== ARQUIVO: src/store/filterStore.ts ==============
// =================================================================
import { create } from 'zustand';
import { ListStatus } from './userListStore';
import { FILTER_LIMITS } from '@/lib/constants';

export type Language = 'en' | 'pt';
export type MediaStatus = 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS';
export type MediaSource = 'ORIGINAL' | 'MANGA' | 'LIGHT_NOVEL' | 'VISUAL_NOVEL' | 'VIDEO_GAME' | 'WEB_NOVEL' | 'OTHER';
export type SortDirection = 'DESC' | 'ASC';
export type ViewMode = 'grid' | 'schedule' | 'list';

export interface Selection {
  name: string;
  mode: 'include' | 'exclude';
}

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
  listStatusFilter: ListStatus | null;
  activeListId: string | null;
  isListsModalOpen: boolean; 
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
  setListStatusFilter: (status: ListStatus | null) => void;
  setActiveListId: (listId: string | null) => void;
  toggleListsModal: () => void;
}

type FilterStore = FilterState & FilterActions;

export const useFilterStore = create<FilterStore>((set, get) => ({
  search: '',
  yearRange: [FILTER_LIMITS.MIN_YEAR, FILTER_LIMITS.MAX_YEAR],
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
  listStatusFilter: null,
  activeListId: null,
  isListsModalOpen: false,

  setSearch: (query) => set({ search: query }),
  setYearRange: (range) => set({ yearRange: range }),
  setScoreRange: (range) => set({ scoreRange: range }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setLanguage: (lang) => set({ language: lang }),
  
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  toggleIncludeTBA: () => set((state) => ({ includeTBA: !state.includeTBA })),
  toggleExcludeNoScore: () => set((state) => ({ excludeNoScore: !state.excludeNoScore })),
  toggleListsModal: () => set((state) => ({ isListsModalOpen: !state.isListsModalOpen })),

  setViewMode: (mode) => {
    set({ viewMode: mode, listStatusFilter: null, activeListId: mode !== 'list' ? null : get().activeListId })
  }, 
  
  setListStatusFilter: (status) => {
    set({ listStatusFilter: status, viewMode: 'grid', activeListId: null });
  },

  toggleSortDirection: () => set((state) => ({
    sortDirection: state.sortDirection === 'DESC' ? 'ASC' : 'DESC'
  })),

  toggleFormat: (format: string) => set(state => ({ formats: state.formats.includes(format) ? state.formats.filter(f => f !== format) : [...state.formats, format] })),
  toggleSource: (source: MediaSource) => set(state => ({ sources: state.sources.includes(source) ? state.sources.filter(s => s !== source) : [...state.sources, source] })),
  toggleStatus: (status: MediaStatus) => set(state => ({ statuses: state.statuses.includes(status) ? state.statuses.filter(s => s !== status) : [...state.statuses, status] })),

  toggleGenre: (genreName: string) => set(state => {
    const existing = state.genres.find(g => g.name === genreName);
    if (!existing) {
      return { genres: [...state.genres, { name: genreName, mode: 'include' }] };
    }
    if (existing.mode === 'include') {
      return { genres: state.genres.map(g => g.name === genreName ? { ...g, mode: 'exclude' } : g) };
    }
    return { genres: state.genres.filter(g => g.name !== genreName) };
  }),

  toggleTag: (tagName: string) => set(state => {
      const existing = state.tags.find(t => t.name === tagName);
      if (!existing) {
          return { tags: [...state.tags, { name: tagName, mode: 'include' }] };
      }
      if (existing.mode === 'include') {
          return { tags: state.tags.map(t => t.name === tagName ? { ...t, mode: 'exclude' } : t) };
      }
      return { tags: state.tags.filter(t => t.name !== tagName) };
  }),

  resetAllFilters: () => set({
    search: '',
    yearRange: [FILTER_LIMITS.MIN_YEAR, FILTER_LIMITS.MAX_YEAR],
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
    viewMode: 'grid',
    activeListId: null,
  }),

  setActiveListId: (listId) => set({ activeListId: listId, viewMode: 'list', listStatusFilter: null }),
}));