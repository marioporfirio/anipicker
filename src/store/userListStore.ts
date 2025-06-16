import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface AiringAnime {
    media: {
      id: number;
    };
}

export interface CustomList {
    id: string;
    name: string;
    animeIds: number[];
}

export type ListStatus = 'WATCHING' | 'COMPLETED' | 'PLANNED' | 'DROPPED' | 'PAUSED' | 'SKIPPING';

interface ImportedUserData {
    statuses: Record<number, ListStatus>;
    ratings: Record<number, number>;
    favorites?: number[];
}

interface UserListState {
    statuses: Record<number, ListStatus>;
    ratings: Record<number, number>; 
    customLists: CustomList[];
    toggleStatus: (animeId: number, status: ListStatus) => void;
    getAnimeStatus: (animeId: number) => ListStatus | null;
    skipAllWithoutStatus: (schedule: AiringAnime[]) => void;
    setRating: (animeId: number, rating: number) => void;
    getRating: (animeId: number) => number | null;
    createList: (name: string) => string;
    deleteList: (listId: string) => void;
    renameList: (listId: string, newName: string) => void;
    toggleAnimeInList: (listId: string, animeId: number) => void;
    isAnimeInList: (listId: string, animeId: number) => boolean;
    moveAnimeInList: (listId: string, oldIndex: number, newIndex: number) => void;
    moveAnimeToPosition: (listId: string, animeId: number, newPosition: number) => void;
    replaceUserData: (data: ImportedUserData) => void;
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
            skipAllWithoutStatus: (schedule) => {
                set(state => {
                    const newStatuses = { ...state.statuses };
                    schedule.forEach(anime => {
                        if (!newStatuses[anime.media.id]) {
                            newStatuses[anime.media.id] = 'SKIPPING';
                        }
                    });
                    return { statuses: newStatuses };
                });
            },
            setRating: (animeId, rating) => {
                set(state => {
                    const newRatings = { ...state.ratings };
                    if (rating === 0 || newRatings[animeId] === rating) {
                        delete newRatings[animeId];
                    } else {
                        newRatings[animeId] = rating;
                    }
                    return { ratings: newRatings };
                });
            },
            getRating: (animeId) => get().ratings[animeId] || null,
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
                                : [animeId, ...list.animeIds];
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
            moveAnimeInList: (listId, oldIndex, newIndex) => {
                 set(state => ({
                    customLists: state.customLists.map(list => {
                        if (list.id === listId) {
                            const result = Array.from(list.animeIds);
                            const [removed] = result.splice(oldIndex, 1);
                            result.splice(newIndex, 0, removed);
                            return { ...list, animeIds: result };
                        }
                        return list;
                    })
                }));
            },
            moveAnimeToPosition: (listId, animeId, newPosition) => {
                const state = get();
                const list = state.customLists.find(l => l.id === listId);
                if (!list) return;

                const oldIndex = list.animeIds.findIndex(id => id === animeId);
                if (oldIndex === -1) return;
                
                const newIndex = Math.max(0, Math.min(newPosition - 1, list.animeIds.length - 1));
                state.moveAnimeInList(listId, oldIndex, newIndex);
            },
            
            replaceUserData: (data) => {
                set(state => {
                    // Para status e notas, a substituição é o comportamento correto.
                    const newStatuses = data.statuses;
                    const newRatings = data.ratings;
                    
                    // Lógica de sincronização para a lista de favoritos
                    const anilistFavorites = new Set(data.favorites || []);
                    const localFavorites = state.customLists.find(l => l.id === 'favorites')?.animeIds || [];

                    // 1. Apaga: Mantém apenas os favoritos locais que TAMBÉM existem no AniList
                    let syncedFavorites = localFavorites.filter(id => anilistFavorites.has(id));

                    // 2. Adiciona: Adiciona os favoritos do AniList que não estão na lista local
                    //    Isso preserva a ordem dos itens que já existiam localmente.
                    const existingSyncedIds = new Set(syncedFavorites);
                    (data.favorites || []).forEach(id => {
                        if (!existingSyncedIds.has(id)) {
                            syncedFavorites.unshift(id); // Adiciona novos no início
                        }
                    });

                    // 3. Atualiza a lista de 'favorites' com os IDs sincronizados
                    const updatedLists = state.customLists.map(list => {
                        if (list.id === 'favorites') {
                            return { ...list, animeIds: syncedFavorites };
                        }
                        // Mantém todas as outras listas customizadas intactas
                        return list; 
                    });
                    
                    // Atualiza o estado global
                    return {
                        statuses: newStatuses,
                        ratings: newRatings,
                        customLists: updatedLists
                    };
                });
            },
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