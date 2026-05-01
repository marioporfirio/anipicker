'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

export default function AuthButton() {
  const {
    anilistUser, malUser, isLoading, isSyncing,
    checkAuth, syncAnilist, syncMal, logoutAnilist, logoutMal,
  } = useAuthStore();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { checkAuth(); }, [checkAuth]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSync = (provider: 'anilist' | 'mal') => {
    setIsOpen(false);
    const fn = provider === 'anilist' ? syncAnilist : syncMal;
    const label = provider === 'anilist' ? 'AniList' : 'MyAnimeList';
    toast.promise(fn(), {
      loading: `Sincronizando ${label}...`,
      success: `${label} sincronizado!`,
      error: `Falha ao sincronizar ${label}.`,
    });
  };

  const iconButtonClass =
    'p-2 bg-surface text-text-secondary rounded-lg hover:bg-primary/20 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary';

  if (isLoading) {
    return <div className="w-9 h-9 rounded-lg bg-surface animate-pulse" />;
  }

  const isConnected = anilistUser || malUser;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(o => !o)}
        className={`${iconButtonClass} flex items-center gap-1.5 ${isConnected ? 'px-1' : 'px-3'}`}
        title="Contas conectadas"
        disabled={isSyncing}
      >
        {isConnected ? (
          <div className="flex items-center -space-x-1">
            {anilistUser && (
              <Image
                src={anilistUser.avatar}
                alt={anilistUser.name}
                width={28}
                height={28}
                className="rounded-full ring-2 ring-surface"
                unoptimized
              />
            )}
            {malUser && (
              malUser.avatar ? (
                <Image
                  src={malUser.avatar}
                  alt={malUser.name}
                  width={28}
                  height={28}
                  className="rounded-full ring-2 ring-surface"
                  unoptimized
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold ring-2 ring-surface">
                  {malUser.name[0].toUpperCase()}
                </div>
              )
            )}
          </div>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <span className="hidden sm:inline text-sm font-semibold">Conectar</span>
          </>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-lg shadow-xl ring-1 ring-black/20 z-50 py-1 animate-fade-in">

          {/* AniList */}
          <div className="px-3 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider border-b border-gray-700">
            AniList
          </div>
          {anilistUser ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2">
                <Image src={anilistUser.avatar} alt={anilistUser.name} width={24} height={24} className="rounded-full" unoptimized />
                <span className="text-sm text-text-main font-semibold truncate">{anilistUser.name}</span>
              </div>
              <button
                onClick={() => handleSync('anilist')}
                disabled={isSyncing}
                className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSyncing ? 'animate-spin' : ''}>
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Sincronizar lista
              </button>
              <button
                onClick={() => { setIsOpen(false); logoutAnilist(); }}
                className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <a
              href="/api/auth/login"
              className="block px-3 py-2 text-sm text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Entrar com AniList
            </a>
          )}

          {/* MAL */}
          <div className="px-3 py-1.5 text-xs font-bold text-text-secondary uppercase tracking-wider border-t border-b border-gray-700 mt-1">
            MyAnimeList
          </div>
          {malUser ? (
            <>
              <div className="flex items-center gap-2 px-3 py-2">
                {malUser.avatar ? (
                  <Image src={malUser.avatar} alt={malUser.name} width={24} height={24} className="rounded-full" unoptimized />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center text-blue-400 text-xs font-bold">
                    {malUser.name[0].toUpperCase()}
                  </div>
                )}
                <span className="text-sm text-text-main font-semibold truncate">{malUser.name}</span>
              </div>
              <button
                onClick={() => handleSync('mal')}
                disabled={isSyncing}
                className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={isSyncing ? 'animate-spin' : ''}>
                  <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Sincronizar lista
              </button>
              <button
                onClick={() => { setIsOpen(false); logoutMal(); }}
                className="w-full text-left px-3 py-1.5 text-sm text-text-secondary hover:bg-red-500/10 hover:text-red-400 transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <a
              href="/api/auth/mal/login"
              className="block px-3 py-2 text-sm text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Entrar com MyAnimeList
            </a>
          )}
        </div>
      )}
    </div>
  );
}
