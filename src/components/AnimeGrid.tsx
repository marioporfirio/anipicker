// src/components/AnimeGrid.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { searchAnime, Anime } from '@/lib/anilist';
import { sortOptionTranslations, sidebarLabelTranslations } from '@/lib/translations';
import AnimeCard from '@/components/AnimeCard';
import { useDebounce } from 'use-debounce';

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

interface AnimeGridProps {
  initialAnimes: Anime[];
}

export default function AnimeGrid({ initialAnimes }: AnimeGridProps) {
  const { 
    search, yearRange, scoreRange, genres, tags, formats, sources,
    includeTBA, sortBy, statuses, language,
    setSortBy, isSidebarOpen, isRaffleMode 
  } = useFilterStore();
  
  // Incluído `sources` no objeto de dependências do useMemo
  const filters = useMemo(() => ({ search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statuses, language }), [search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statuses, language]);
  const [debouncedFilters] = useDebounce(filters, 500);
  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    if (isRaffleMode) return;
    const isAnyFilterActive = debouncedFilters.search.length > 0 || debouncedFilters.formats.length > 0 || (debouncedFilters.sources && debouncedFilters.sources.length > 0) || (debouncedFilters.statuses && debouncedFilters.statuses.length > 0) || debouncedFilters.includeTBA || debouncedFilters.yearRange[0] > MIN_YEAR || debouncedFilters.yearRange[1] < MAX_YEAR || debouncedFilters.scoreRange[0] > 0 || debouncedFilters.scoreRange[1] < 100 || debouncedFilters.genres.length > 0 || debouncedFilters.tags.length > 0;
    const isDefaultSort = debouncedFilters.sortBy === 'POPULARITY_DESC';
    const fetchData = async () => {
      setIsLoading(true); setPage(1);
      const results = await searchAnime(debouncedFilters, 1);
      setAnimes(results.animes); setHasNextPage(results.hasNextPage);
      setIsLoading(false); window.scrollTo(0, 0);
    };
    if (filters === debouncedFilters) { if (isAnyFilterActive || !isDefaultSort) { fetchData(); } else { setAnimes(initialAnimes); setPage(1); setHasNextPage(true); } }
  }, [debouncedFilters, initialAnimes, isRaffleMode, filters]);

  const loadMoreAnimes = useCallback(async () => {
    if (isNextPageLoading || !hasNextPage || isRaffleMode) return;
    setIsNextPageLoading(true); const nextPage = page + 1;
    const results = await searchAnime(debouncedFilters, nextPage);
    setAnimes(prev => [...prev, ...results.animes]); setPage(nextPage);
    setHasNextPage(results.hasNextPage); setIsNextPageLoading(false);
  }, [isNextPageLoading, hasNextPage, page, debouncedFilters, isRaffleMode]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isNextPageLoading) return; if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => { if (entries[0].isIntersecting && hasNextPage) { loadMoreAnimes(); } });
    if (node) observer.current.observe(node);
  }, [isLoading, isNextPageLoading, hasNextPage, loadMoreAnimes]);
  
  const isAnyFilterActiveForUI = debouncedFilters.search.length > 0 || debouncedFilters.formats.length > 0 || (debouncedFilters.sources && debouncedFilters.sources.length > 0) || (debouncedFilters.statuses && debouncedFilters.statuses.length > 0) || debouncedFilters.includeTBA || debouncedFilters.yearRange[0] > MIN_YEAR || debouncedFilters.yearRange[1] < MAX_YEAR || debouncedFilters.scoreRange[0] > 0 || debouncedFilters.scoreRange[1] < 100 || debouncedFilters.genres.length > 0 || debouncedFilters.tags.length > 0;
  const currentTitle = isAnyFilterActiveForUI ? (language === 'pt' ? 'Resultados da Busca' : 'Search Results') : (language === 'pt' ? 'Animes Populares' : 'Popular Anime');
  const isSearchActive = !!debouncedFilters.search;

  if (isLoading && !isRaffleMode) {
    return <div className="flex justify-center items-center h-96"><p className="text-text-secondary text-lg animate-pulse">Buscando animes...</p></div>;
  }

  return (
    <section className="px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold border-l-4 border-primary pl-3">{currentTitle}</h2>
          <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-sm text-text-secondary">{sidebarLabelTranslations[language]?.sortByLabel || sidebarLabelTranslations.pt.sortByLabel}</label>
              <select id="sort-by" value={sortBy} onChange={(e) => setSortBy(e.target.value)} disabled={isSearchActive || isRaffleMode} className="bg-surface border border-gray-600 rounded-md px-3 py-1.5 text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50">
                  {Object.keys(sortOptionTranslations).map((value) => (<option key={value} value={value}>{sortOptionTranslations[value]?.[language] || sortOptionTranslations[value]?.['pt'] || value}</option>))}
              </select>
          </div>
        </div>
        
        <div className="relative">
            {isRaffleMode && (
                <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-sm rounded-md transition-opacity duration-300" aria-hidden="true"></div>
            )}
            
            {animes.length > 0 ? (
                <div className={`grid grid-cols-2 gap-4 transition-all duration-300 sm:grid-cols-3 ${isSidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
                {animes.map((anime, index) => {
                    const isLastElement = animes.length === index + 1;
                    const props = {
                      anime: anime,
                      priority: index < 10
                    };

                    if (isLastElement && hasNextPage && (isAnyFilterActiveForUI || sortBy !== 'POPULARITY_DESC')) {
                      return <div ref={lastAnimeElementRef} key={anime.id}><AnimeCard {...props} /></div>;
                    }
                    return <AnimeCard key={anime.id} {...props} />;
                })}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-96 text-center"><p className="text-xl text-text-secondary">Nenhum anime encontrado.</p><p className="text-md text-gray-500 mt-2">Tente ajustar seus filtros.</p></div>
            )}
        </div>

        {isNextPageLoading && <div className="flex justify-center items-center mt-8 h-16"><p className="text-text-secondary animate-pulse">Carregando mais...</p></div>}
        {!hasNextPage && animes.length > 0 && (isAnyFilterActiveForUI || sortBy !== 'POPULARITY_DESC') && <div className="text-center mt-8 text-text-secondary"><p>Você chegou ao fim dos resultados.</p></div>}
    </section>
  );
}