// =================================================================
// ============== ARQUIVO: src/components/StudioWorksModal.tsx =====
// =================================================================
'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Anime } from '@/lib/anilist';
import AnimeCard from '@/components/AnimeCard';
import { sortOptionTranslations } from '@/lib/translations';
import { useFilterStore } from '@/store/filterStore';
import { Z_INDEX } from '@/lib/constants';
import StateRenderer from './StateRenderer';

type SortDirection = 'ASC' | 'DESC';

export default function StudioWorksModal({ studioId, studioName }: { studioId: number, studioName: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { language } = useFilterStore();

  const [rawAnimes, setRawAnimes] = useState<Anime[]>([]); // Dados brutos da API
  const [isLoading, setIsLoading] = useState(true);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  const [sortBy, setSortBy] = useState('POPULARITY_DESC'); // Guarda o critério de busca (sempre _DESC)
  const [sortDirection, setSortDirection] = useState<SortDirection>('DESC'); // Guarda a direção de exibição

  const observer = useRef<IntersectionObserver>();
  const loadingRef = useRef({ isLoading, isNextPageLoading });
  const hasNextPageRef = useRef(hasNextPage);

  useEffect(() => {
    loadingRef.current = { isLoading, isNextPageLoading };
    hasNextPageRef.current = hasNextPage;
  }, [isLoading, isNextPageLoading, hasNextPage]);

  const handleClose = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('studioId');
    params.delete('studioName');
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);
  
  const fetchStudioWorks = useCallback(async (currentPage: number, sortOrder: string, shouldAppend: boolean = false) => {
    if (shouldAppend) setIsNextPageLoading(true); else { setIsLoading(true); setRawAnimes([]); }
    setError(null);
    try {
      const res = await fetch(`/api/studio/${studioId}?page=${currentPage}&sort=${sortOrder}`);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: 'Falha ao buscar os trabalhos do estúdio.' }));
        throw new Error(errorData.message || 'Falha ao buscar os trabalhos do estúdio.');
      }
      const data: { animes: Anime[], hasNextPage: boolean } = await res.json();
      setRawAnimes(prev => shouldAppend ? [...prev, ...data.animes] : data.animes);
      setHasNextPage(data.hasNextPage);
      setPage(currentPage);
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
      setIsNextPageLoading(false);
    }
  }, [studioId]);
  
  useEffect(() => {
    // Sempre busca a versão _DESC do critério, que é garantido de funcionar.
    const descSort = sortBy.replace('_ASC', '_DESC');
    fetchStudioWorks(1, descSort);
  }, [studioId, sortBy, fetchStudioWorks]);

  const loadMoreAnimes = useCallback(() => {
    const descSort = sortBy.replace('_ASC', '_DESC');
    fetchStudioWorks(page + 1, descSort, true);
  }, [page, sortBy, fetchStudioWorks]);

  // Ordena os animes no cliente baseado na direção escolhida
  const displayedAnimes = useMemo(() => {
    if (sortDirection === 'ASC') {
      return [...rawAnimes].reverse();
    }
    return rawAnimes;
  }, [rawAnimes, sortDirection]);

  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPageRef.current && !loadingRef.current.isLoading && !loadingRef.current.isNextPageLoading) {
        loadMoreAnimes();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadMoreAnimes]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    setSortDirection('DESC'); // Sempre reseta para DESC ao mudar o critério
  };
  
  const toggleSortDirection = () => {
    setSortDirection(prev => (prev === 'DESC' ? 'ASC' : 'DESC'));
  };

  const isPopularitySort = sortBy.startsWith('POPULARITY');

  return (
    <div onClick={handleClose} className="fixed inset-0 flex justify-center items-start overflow-y-auto bg-black/70 animate-fade-in" style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-4xl bg-background rounded-lg shadow-2xl relative animate-slide-up my-16 flex flex-col max-h-[90vh]" style={{ zIndex: Z_INDEX.STUDIO_WORKS_MODAL }}>
        <div className="sticky top-0 bg-background/80 backdrop-blur-sm p-4 border-b border-gray-700 flex justify-between items-center z-10 flex-shrink-0">
          <h2 className="text-lg md:text-xl font-bold text-primary truncate pr-2">Estúdio: <span className="text-white">{studioName}</span></h2>
          <div className="flex items-center gap-2">
            <select
              id="sort-by-studio"
              value={sortBy}
              onChange={handleSortChange}
              className="bg-surface border border-gray-600 rounded-md px-2 py-1 text-xs sm:text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
            >
              {Object.entries(sortOptionTranslations).map(([value, translations]) => (
                // Renderiza apenas as opções _DESC, pois a inversão é feita no cliente
                value.endsWith('_DESC') && (
                  <option key={value} value={value}>
                    {translations[language] || translations['pt']}
                  </option>
                )
              ))}
            </select>
            
            <button 
              onClick={toggleSortDirection} 
              title={language === 'pt' ? 'Inverter Ordem' : 'Invert Order'} 
              className="p-1.5 bg-surface border border-gray-600 rounded-md text-text-secondary hover:bg-gray-700 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isPopularitySort} // Desabilita o botão para Popularidade
            >
              {sortDirection === 'DESC' ? (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>)}
            </button>

            <button onClick={handleClose} className="p-2 rounded-full text-white hover:bg-black/50 transition-colors" aria-label="Fechar modal">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
        <div className="overflow-y-auto p-6 flex-grow">
          <StateRenderer isLoading={isLoading} error={error} loadingComponent={<p className="text-center text-text-secondary animate-pulse">Carregando animes...</p>} errorComponent={(err) => <p className="text-center text-red-500">{err}</p>}>
            {displayedAnimes.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
                {displayedAnimes.map((anime, index) => {
                  const isLastElement = displayedAnimes.length === index + 1;
                  const commonProps = { anime, priority: index < 8, rank: index + 1, maxRank: displayedAnimes.length, isRanked: false };
                  if (isLastElement && hasNextPage) { return ( <div ref={lastAnimeElementRef} key={anime.id}><AnimeCard {...commonProps} /></div> ); }
                  return <AnimeCard key={anime.id} {...commonProps} />;
                })}
              </div>
            ) : !isLoading && <p className="text-center text-text-secondary">Nenhum anime encontrado para este estúdio.</p>}
          </StateRenderer>
          {isNextPageLoading && <div className="flex justify-center items-center mt-8 h-16"><p className="text-text-secondary animate-pulse">Carregando mais...</p></div>}
          {!hasNextPage && rawAnimes.length > 0 && ( <div className="text-center mt-8 text-text-secondary"><p>Você chegou ao fim dos resultados.</p></div> )}
        </div>
      </div>
    </div>
  );
}