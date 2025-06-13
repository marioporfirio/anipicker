// src/store/userListStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

// Define a estrutura para uma única lista personalizada
export interface CustomList {
  id: string;
  name: string;
  animeIds: number[];
}

export type ListStatus = 'WATCHING' | 'COMPLETED' | 'PLANNED' | 'DROPPED' | 'PAUSED' | 'SKIPPING';

interface UserListState {
  statuses: Record<number, ListStatus>;
  // CORREÇÃO: 'favorites' é substituído por um sistema de listas múltiplas
  customLists: CustomList[];

  // --- Ações para Statuses ---
  toggleStatus: (animeId: number, status: ListStatus) => void;
  getAnimeStatus: (animeId: number) => ListStatus | null;
  
  // --- Ações para Listas Customizadas ---
  createList: (name: string) => string; // Retorna o ID da nova lista
  deleteList: (listId: string) => void;
  renameList: (listId: string, newName: string) => void;
  toggleAnimeInList: (listId: string, animeId: number) => void;
  isAnimeInList: (listId: string, animeId: number) => boolean;
  reorderAnimeInList: (listId: string, startIndex: number, endIndex: number) => void;
}

// Helper para garantir que a lista de "Favoritos" sempre exista
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

      // --- Custom List Actions ---
      createList: (name) => {
        const newList: CustomList = { id: uuidv4(), name, animeIds: [] };
        set(state => ({ customLists: [...state.customLists, newList] }));
        return newList.id;
      },

      deleteList: (listId) => {
        if (listId === 'favorites') return; // Protege a lista padrão
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
      // Garante que a lista de "Favoritos" exista mesmo se o storage estiver vazio
      onRehydrateStorage: () => (state) => {
          if (state) {
              state.customLists = ensureDefaultList(state.customLists);
          }
      }
    }
  )
);
