// src/components/AnimeDetailsModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeDetails } from '@/lib/anilist';
import AnimeHero from './anime/AnimeHero';
import CharacterList from './anime/CharacterList';
import StaffList from './anime/StaffList';

export default function AnimeDetailsModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const animeId = searchParams.get('anime');

  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (animeId) {
      const fetchData = async () => {
        setIsLoading(true);
        setAnime(null);
        try {
          const res = await fetch(`/api/anime/${animeId}`);
          if (!res.ok) throw new Error('Falha ao buscar dados');
          const data = await res.json();
          setAnime(data);
        } catch (error) {
          console.error(error);
          handleClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [animeId]);

  const handleClose = () => {
    router.back();
  };

  if (!animeId) {
    return null;
  }

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/70 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-background rounded-lg shadow-2xl relative animate-slide-up my-16"
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {isLoading && (
          <div className="h-[50vh] flex justify-center items-center">
            <p className="text-text-secondary text-lg animate-pulse">Carregando detalhes...</p>
          </div>
        )}
        
        {anime && (
          <div>
            <AnimeHero anime={anime} />
            <CharacterList characters={anime.characters} />
            <StaffList staff={anime.staff} />
            <div className="h-8"></div>
          </div>
        )}
      </div>
    </div>
  );
}