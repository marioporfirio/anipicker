'use client';

import { create } from 'zustand';
import { useUserListStore } from './userListStore';

interface AniListUser {
  id: number;
  name: string;
  avatar: string;
}

interface AuthState {
  user: AniListUser | null;
  isLoading: boolean;
  isSyncing: boolean;
  checkAuth: () => Promise<void>;
  logout: () => void;
  sync: () => Promise<{ ok: boolean; count?: number; error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isSyncing: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me');
      set({ user: res.ok ? await res.json() : null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: () => { window.location.href = '/api/auth/logout'; },

  sync: async () => {
    set({ isSyncing: true });
    try {
      const res = await fetch('/api/sync');
      const json = await res.json();
      if (!res.ok) {
        set({ isSyncing: false });
        return { ok: false, error: json.error ?? 'Falha ao sincronizar' };
      }
      const { statuses, ratings, favorites } = json;
      const count = Object.keys(statuses ?? {}).length;
      if (count === 0) {
        set({ isSyncing: false });
        return { ok: false, error: 'Nenhum anime encontrado na lista' };
      }
      useUserListStore.getState().replaceUserData({ statuses, ratings, favorites });
      set({ isSyncing: false });
      return { ok: true, count };
    } catch {
      set({ isSyncing: false });
      return { ok: false, error: 'Erro de rede' };
    }
  },
}));
