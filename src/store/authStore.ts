'use client';

import { create } from 'zustand';
import { useUserListStore } from './userListStore';

interface AniListUser {
  id: number;
  name: string;
  avatar: string;
}

interface MALUser {
  id: number;
  name: string;
  avatar: string | null;
}

interface AuthState {
  anilistUser: AniListUser | null;
  malUser: MALUser | null;
  isLoading: boolean;
  isSyncing: boolean;
  checkAuth: () => Promise<void>;
  logoutAnilist: () => void;
  logoutMal: () => void;
  syncAnilist: () => Promise<{ ok: boolean; error?: string }>;
  syncMal: () => Promise<{ ok: boolean; error?: string }>;
}

async function doSync(endpoint: string, set: (s: Partial<AuthState>) => void) {
  set({ isSyncing: true });
  try {
    const res = await fetch(endpoint);
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
}

export const useAuthStore = create<AuthState>((set) => ({
  anilistUser: null,
  malUser: null,
  isLoading: true,
  isSyncing: false,

  checkAuth: async () => {
    set({ isLoading: true });
    const [anilistRes, malRes] = await Promise.allSettled([
      fetch('/api/auth/me'),
      fetch('/api/auth/mal/me'),
    ]);

    const anilistUser =
      anilistRes.status === 'fulfilled' && anilistRes.value.ok
        ? await anilistRes.value.json()
        : null;

    const malUser =
      malRes.status === 'fulfilled' && malRes.value.ok
        ? await malRes.value.json()
        : null;

    set({ anilistUser, malUser, isLoading: false });
  },

  logoutAnilist: () => { window.location.href = '/api/auth/logout'; },
  logoutMal: () => { window.location.href = '/api/auth/mal/logout'; },

  syncAnilist: () => doSync('/api/sync', set),
  syncMal: () => doSync('/api/sync/mal', set),
}));
