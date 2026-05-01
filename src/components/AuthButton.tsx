'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function AuthButton() {
  const { user, isLoading, isSyncing, checkAuth, sync } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleSync = () => {
    toast.promise(sync(), {
      loading: 'Sincronizando lista do AniList...',
      success: 'Lista sincronizada!',
      error: 'Falha ao sincronizar.',
    });
  };

  const handleLogout = () => {
    window.location.href = '/api/auth/logout';
  };

  const iconButtonClass =
    'p-2 bg-surface text-text-secondary rounded-lg hover:bg-primary/20 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary';

  if (isLoading) {
    return <div className="w-9 h-9 rounded-lg bg-surface animate-pulse" />;
  }

  if (!user) {
    return (
      <a
        href="/api/auth/login"
        className={`${iconButtonClass} flex items-center gap-1.5 px-3 text-sm font-semibold text-text-secondary hover:text-primary`}
        title="Entrar com AniList"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
          <polyline points="10 17 15 12 10 7" />
          <line x1="15" y1="12" x2="3" y2="12" />
        </svg>
        <span className="hidden sm:inline">AniList</span>
      </a>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={handleSync}
        disabled={isSyncing}
        className={`${iconButtonClass} ${isSyncing ? 'opacity-50 cursor-not-allowed' : ''}`}
        title="Sincronizar lista do AniList"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={isSyncing ? 'animate-spin' : ''}
        >
          <polyline points="23 4 23 10 17 10" />
          <polyline points="1 20 1 14 7 14" />
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
        </svg>
      </button>

      <div className="relative group">
        {user.avatar ? (
          <Image
            src={user.avatar}
            alt={user.name}
            width={36}
            height={36}
            className="rounded-full cursor-pointer ring-2 ring-transparent group-hover:ring-primary transition-all"
            unoptimized
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold cursor-pointer">
            {user.name[0].toUpperCase()}
          </div>
        )}
        <div className="absolute right-0 top-full mt-2 w-40 bg-surface rounded-lg shadow-lg ring-1 ring-black/20 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity z-50 py-1">
          <div className="px-3 py-2 text-sm font-semibold text-text-main border-b border-gray-700 truncate">
            {user.name}
          </div>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 text-sm text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}
