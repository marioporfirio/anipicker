// =================================================================
// ============== ARQUIVO: src/components/AnimeDetailsModal.tsx ==============
// =================================================================
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AnimeDetails } from '@/lib/anilist';
import AnimeHero from './anime/AnimeHero';
import CharacterList from './anime/CharacterList';
import StaffList from './anime/StaffList';
import AnimeRelationsList from './anime/AnimeRelationsList';
import StateRenderer from './StateRenderer';
import { Z_INDEX } from '@/lib/constants';
import RecommendedAnimeList from './anime/RecommendedAnimeList';

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
          const res = await fetch(`/api/anime/${animeId}`, { cache: 'no-store' });
          
          if (!res.ok) {
            if (res.status === 429) {
              throw new Error('Muitas requisições feitas. Por favor, aguarde e tente novamente.');
            }
            const errorData = await res.json().catch(() => ({ message: `Falha ao buscar dados (Status: ${res.status}).` }));
            throw new Error(errorData.message || `Falha ao buscar dados (Status: ${res.status}).`);
          }

          const data = await res.json();
          setAnime(data);

        } catch (err: unknown) {
          console.error('AnimeDetailsModal fetch error:', err);
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Ocorreu um erro desconhecido ao buscar os detalhes do anime.');
          }
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
      className="fixed inset-0 flex justify-center items-start overflow-y-auto bg-black/70 animate-fade-in"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl bg-background rounded-lg shadow-2xl relative animate-slide-up my-16"
        style={{ zIndex: Z_INDEX.ANIME_DETAILS_MODAL }}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          aria-label="Fechar modal"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <StateRenderer
          isLoading={isLoading}
          error={error}
          loadingComponent={
            <div className="h-[50vh] flex justify-center items-center">
              <p className="text-text-secondary text-lg animate-pulse">Carregando detalhes...</p>
            </div>
          }
          errorComponent={(err) => (
            <div className="h-[50vh] flex flex-col justify-center items-center text-center p-8">
              <p className="text-red-500 text-xl font-semibold">Ocorreu um erro</p>
              <p className="text-text-secondary mt-2 max-w-md">{err}</p>
              <button
                onClick={handleClose}
                className="mt-8 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-primary-dark transition-colors"
              >
                Fechar
              </button>
            </div>
          )}
        >
          {anime && (
            <div className="pb-8">
              <AnimeHero anime={anime} />
              <CharacterList characters={anime.characters} />
              <StaffList staff={anime.staff} />
              {anime.relations && anime.relations.edges.length > 0 && (
                <AnimeRelationsList relations={anime.relations.edges} />
              )}
              <RecommendedAnimeList anime={anime} />
            </div>
          )}
        </StateRenderer>
      </div>
    </div>
  );
}