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
  logout: () => Promise<void>;
  sync: () => Promise<{ ok: boolean; error?: string }>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isSyncing: false,

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const user = await res.json();
        set({ user, isLoading: false });
      } else {
        set({ user: null, isLoading: false });
      }
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout');
    set({ user: null });
  },

  sync: async () => {
    set({ isSyncing: true });
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) {
        set({ isSyncing: false });
        return { ok: false, error: 'Falha ao sincronizar' };
      }
      const { statuses, ratings, favorites } = await res.json();
      useUserListStore.getState().replaceUserData({ statuses, ratings, favorites });
      set({ isSyncing: false });
      return { ok: true };
    } catch {
      set({ isSyncing: false });
      return { ok: false, error: 'Erro de rede' };
    }
  },
}));
