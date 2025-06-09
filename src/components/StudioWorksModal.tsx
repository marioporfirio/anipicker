// src/components/StudioWorksModal.tsx
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Anime } from '@/lib/anilist';
import AnimeCard from '@/components/AnimeCard';
import { sortOptionTranslations } from '@/lib/translations';
import { useFilterStore } from '@/store/filterStore';

export default function StudioWorksModal({ studioId, studioName }: { studioId: number, studioName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useFilterStore();

  const [animes, setAnimes] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [sortBy, setSortBy] = useState('POPULARITY_DESC');

  const observer = useRef<IntersectionObserver | null>(null);
  
  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('studioId');
    params.delete('studioName');
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const fetchStudioWorks = useCallback(async (currentPage: number, sortOrder: string, shouldAppend: boolean = false) => {
    if (shouldAppend) {
      setIsNextPageLoading(true);
    } else {
      setIsLoading(true);
      setAnimes([]);
    }
    setError(null);

    try {
      const res = await fetch(`/api/studio/${studioId}?page=${currentPage}&sort=${sortOrder}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Falha ao buscar os trabalhos do estúdio.' }));
        throw new Error(errorData.message || 'Falha ao buscar os trabalhos do estúdio.');
      }
      const data: { animes: Anime[], hasNextPage: boolean } = await res.json();
      
      setAnimes(prev => shouldAppend ? [...prev, ...data.animes] : data.animes);
      setHasNextPage(data.hasNextPage);
      setPage(currentPage);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
      setIsNextPageLoading(false);
    }
  }, [studioId]);
  
  useEffect(() => {
    fetchStudioWorks(1, sortBy);
  }, [studioId, sortBy, fetchStudioWorks]);

  const loadMoreAnimes = useCallback(() => {
    if (isNextPageLoading || !hasNextPage) return;
    fetchStudioWorks(page + 1, sortBy, true);
  }, [isNextPageLoading, hasNextPage, page, sortBy, fetchStudioWorks]);

  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isNextPageLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage) {
        loadMoreAnimes();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isNextPageLoading, hasNextPage, loadMoreAnimes]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
  };

  return (
    <div
      onClick={handleClose}
      className="fixed inset-0 z-[60] flex justify-center items-start overflow-y-auto bg-black/70 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-4xl bg-background rounded-lg shadow-2xl relative animate-slide-up my-16 flex flex-col max-h-[90vh]"
      >
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-4 border-b border-gray-700 flex justify-between items-center z-10 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-primary truncate pr-2">
            Estúdio: <span className="text-white">{studioName}</span>
          </h2>
          <div className="flex items-center gap-4">
            <select 
              id="sort-by-studio" 
              value={sortBy} 
              onChange={handleSortChange} 
              className="bg-surface border border-gray-600 rounded-md px-2 py-1 text-xs sm:text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {Object.keys(sortOptionTranslations).map((value) => (
                <option key={value} value={value}>
                  {sortOptionTranslations[value]?.[language] || sortOptionTranslations[value]?.['pt'] || value}
                </option>
              ))}
            </select>
            <button
              onClick={handleClose}
              className="p-2 rounded-full text-white hover:bg-black/50 transition-colors"
              aria-label="Fechar modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-6 flex-grow">
          {isLoading && <p className="text-center text-text-secondary animate-pulse">Carregando animes...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          
          {!isLoading && !error && animes.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {animes.map((anime, index) => {
                const isLastElement = animes.length === index + 1;
                if (isLastElement && hasNextPage) {
                  return <div ref={lastAnimeElementRef} key={anime.id}><AnimeCard anime={anime} /></div>;
                }
                return <AnimeCard key={anime.id} anime={anime} />;
              })}
            </div>
          )}

          {isNextPageLoading && <div className="flex justify-center items-center mt-8 h-16"><p className="text-text-secondary animate-pulse">Carregando mais...</p></div>}
          
          {!hasNextPage && animes.length > 0 && (
            <div className="text-center mt-8 text-text-secondary">
              <p>Você chegou ao fim dos resultados.</p>
            </div>
          )}
           
           {!isLoading && !error && animes.length === 0 && (
            <p className="text-center text-text-secondary">Nenhum anime encontrado para este estúdio.</p>
           )}
        </div>
      </div>
    </div>
  );
}