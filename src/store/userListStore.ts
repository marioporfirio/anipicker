// =================================================================
// ============== ARQUIVO: src/store/userListStore.ts ==============
// =================================================================
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export interface CustomList {
  id: string;
  name: string;
  animeIds: number[];
}

export type ListStatus = 'WATCHING' | 'COMPLETED' | 'PLANNED' | 'DROPPED' | 'PAUSED' | 'SKIPPING';

interface UserListState {
  statuses: Record<number, ListStatus>;
  ratings: Record<number, number>; 
  customLists: CustomList[];

  // --- Ações para Statuses ---
  toggleStatus: (animeId: number, status: ListStatus) => void;
  getAnimeStatus: (animeId: number) => ListStatus | null;
  
  // --- Ações para Notas ---
  setRating: (animeId: number, rating: number) => void;
  getRating: (animeId: number) => number | null;

  // --- Ações para Listas Customizadas ---
  createList: (name: string) => string;
  deleteList: (listId: string) => void;
  renameList: (listId: string, newName: string) => void;
  toggleAnimeInList: (listId: string, animeId: number) => void;
  isAnimeInList: (listId: string, animeId: number) => boolean;
  reorderAnimeInList: (listId: string, startIndex: number, endIndex: number) => void;
}

const ensureDefaultList = (lists: CustomList[]): CustomList[] => {
    const hasFavorites = lists.some(list => list.id === 'favorites');
    if (!hasFavorites) {
        return [{ id: 'favorites', name: 'Favoritos', animeIds: [] }, ...lists];
    }
    return lists;
};


export const useUserListStore = create(
  persist<UserListState>(
    (set, get) => ({
      statuses: {},
      ratings: {},
      customLists: ensureDefaultList([]),

      // --- Status Actions ---
      toggleStatus: (animeId, status) => {
        set(state => {
            const newStatuses = { ...state.statuses };
            if (newStatuses[animeId] === status) {
                delete newStatuses[animeId];
            } else {
                newStatuses[animeId] = status;
            }
            return { statuses: newStatuses };
        });
      },
      getAnimeStatus: (animeId) => get().statuses[animeId] || null,

      // --- Rating Actions ---
      setRating: (animeId, rating) => {
        set(state => {
          const newRatings = { ...state.ratings };
          if (newRatings[animeId] === rating) {
            delete newRatings[animeId];
          } else {
            newRatings[animeId] = rating;
          }
          return { ratings: newRatings };
        });
      },
      getRating: (animeId) => get().ratings[animeId] || null,

      // --- Custom List Actions ---
      createList: (name) => {
        const newList: CustomList = { id: uuidv4(), name, animeIds: [] };
        set(state => ({ customLists: [...state.customLists, newList] }));
        return newList.id;
      },

      deleteList: (listId) => {
        if (listId === 'favorites') return;
        set(state => ({
            customLists: state.customLists.filter(list => list.id !== listId)
        }));
      },
      
      renameList: (listId, newName) => {
        set(state => ({
            customLists: state.customLists.map(list => 
                list.id === listId ? { ...list, name: newName } : list
            )
        }));
      },

      toggleAnimeInList: (listId, animeId) => {
        set(state => ({
            customLists: state.customLists.map(list => {
                if (list.id === listId) {
                    const newAnimeIds = list.animeIds.includes(animeId)
                        ? list.animeIds.filter(id => id !== animeId)
                        : [...list.animeIds, animeId];
                    return { ...list, animeIds: newAnimeIds };
                }
                return list;
            })
        }));
      },

      isAnimeInList: (listId, animeId) => {
        const list = get().customLists.find(l => l.id === listId);
        return list?.animeIds.includes(animeId) || false;
      },

      reorderAnimeInList: (listId, startIndex, endIndex) => {
        set(state => ({
            customLists: state.customLists.map(list => {
                if (list.id === listId) {
                    const result = Array.from(list.animeIds);
                    const [removed] = result.splice(startIndex, 1);
                    result.splice(endIndex, 0, removed);
                    return { ...list, animeIds: result };
                }
                return list;
            })
        }));
      }
    }),
    {
      name: 'ani-picker-user-data',
      onRehydrateStorage: (state) => {
          if (state) {
              state.customLists = ensureDefaultList(state.customLists || []);
          }
      }
    }
  )
);