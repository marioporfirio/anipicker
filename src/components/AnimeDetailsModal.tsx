// src/components/AnimeDetailsModal.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeDetails } from '@/lib/anilist';
import AnimeHero from './anime/AnimeHero';
import CharacterList from './anime/CharacterList';
import StaffList from './anime/StaffList';
import AnimeRelationsList from './anime/AnimeRelationsList';
// import ThemeSongs from './ThemeSongs'; // <-- REMOVIDO

export default function AnimeDetailsModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const animeId = searchParams.get('anime');

  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('anime');
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  useEffect(() => {
    if (animeId) {
      const fetchData = async () => {
        setIsLoading(true);
        setAnime(null);
        setError(null);
        try {
          const res = await fetch(`/api/anime/${animeId}`);
          
          if (!res.ok) {
            if (res.status === 429) {
              throw new Error('Muitas requisições feitas em um curto período. Por favor, aguarde um momento e tente novamente.');
            }
            const errorData = await res.json().catch(() => ({ message: `Falha ao buscar dados (Status: ${res.status}).` }));
            throw new Error(errorData.message || `Falha ao buscar dados (Status: ${res.status}).`);
          }

          const data = await res.json();
          setAnime(data);

        } catch (err: any) {
          console.error('AnimeDetailsModal fetch error:', err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [animeId]);

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
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {isLoading && (
          <div className="h-[50vh] flex justify-center items-center">
            <p className="text-text-secondary text-lg animate-pulse">Carregando detalhes...</p>
          </div>
        )}

        {!isLoading && error && (
          <div className="h-[50vh] flex flex-col justify-center items-center text-center p-8">
              <p className="text-red-500 text-xl font-semibold">Ocorreu um erro</p>
              <p className="text-text-secondary mt-2 max-w-md">{error}</p>
              <button
                onClick={handleClose}
                className="mt-8 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Fechar
              </button>
          </div>
        )}
        
        {!isLoading && !error && anime && (
          <div className="pb-8">
            <AnimeHero anime={anime} />
            <CharacterList characters={anime.characters} />
            <StaffList staff={anime.staff} />
            
            {/* <ThemeSongs ... />  REMOVIDO */}
            
            {anime.relations && anime.relations.edges.length > 0 && (
              <AnimeRelationsList relations={anime.relations.edges} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}