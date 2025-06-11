// src/store/userListStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type ListStatus = 'WATCHING' | 'COMPLETED' | 'PLANNED' | 'DROPPED' | 'PAUSED' | 'SKIPPING';

interface UserListState {
  lists: Record<number, ListStatus>; 
  favorites: number[];
  toggleListStatus: (animeId: number, status: ListStatus) => void;
  removeFromList: (animeId: number) => void;
  toggleFavorite: (animeId: number) => void;
  getAnimeStatus: (animeId: number) => ListStatus | null;
  markMultipleAsSkipping: (animeIds: number[]) => void; // <-- NOVO
}

export const useUserListStore = create(
  persist<UserListState>(
    (set, get) => ({
      lists: {},
      favorites: [],

      toggleListStatus: (animeId, status) => {
        const currentLists = get().lists;
        const currentStatus = currentLists[animeId];

        if (currentStatus === status) {
          const { [animeId]: _, ...rest } = currentLists;
          set({ lists: rest });
        } else {
          set({ lists: { ...currentLists, [animeId]: status } });
        }
      },

      removeFromList: (animeId) => {
        const { [animeId]: _, ...rest } = get().lists;
        set({ lists: rest });
      },

      toggleFavorite: (animeId) => {
        const currentFavorites = get().favorites;
        if (currentFavorites.includes(animeId)) {
          set({ favorites: currentFavorites.filter((id) => id !== animeId) });
        } else {
          set({ favorites: [...currentFavorites, animeId] });
        }
      },
      
      getAnimeStatus: (animeId) => {
        return get().lists[animeId] || null;
      },
      
      markMultipleAsSkipping: (animeIds) => {
        const currentLists = get().lists;
        const newLists = { ...currentLists };
        animeIds.forEach(id => {
            // Só marca como SKIPPING se já não tiver um status
            if(!newLists[id]) {
                newLists[id] = 'SKIPPING';
            }
        });
        set({ lists: newLists });
      }
    }),
    {
      name: 'ani-picker-user-lists',
      storage: createJSONStorage(() => localStorage),
    }
  )
);