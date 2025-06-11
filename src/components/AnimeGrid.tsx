// src/components/AnimeGrid.tsx
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { searchAnime, Anime, SearchParams } from '@/lib/anilist';
import { sortOptionTranslations, sidebarLabelTranslations } from '@/lib/translations';
import AnimeCard from '@/components/AnimeCard';
import { useDebounce } from 'use-debounce';
import AnimeGridLoading from './loading/AnimeGridLoading';
import { useUserListStore } from '@/store/userListStore';

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

const invertibleSortOptions = [
  'POPULARITY_DESC', 'SCORE_DESC', 'START_DATE_DESC', 'END_DATE_DESC', 
  'EPISODES_DESC', 'DURATION_DESC', 'ID_DESC', 
  'TITLE_ROMAJI_DESC', 'TITLE_ENGLISH_DESC', 'TITLE_NATIVE_DESC'
];

interface AnimeGridProps {
  initialAnimes: Anime[];
}

export default function AnimeGrid({ initialAnimes }: AnimeGridProps) {
  const { 
    search, yearRange, scoreRange, genres, tags, formats, sources,
    includeTBA, sortBy, statuses, language, sortDirection, listStatusFilter,
    setSortBy, isSidebarOpen, toggleSortDirection
  } = useFilterStore();
  
  const { lists } = useUserListStore();
  
  const filters = useMemo(() => ({ search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statuses, language, sortDirection }), [search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statuses, language, sortDirection]);
  const [debouncedFilters] = useDebounce(filters, 500);

  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  
  useEffect(() => {
    const isAnyApiFilterActive = debouncedFilters.search.length > 0 || debouncedFilters.formats.length > 0 || debouncedFilters.sources.length > 0 || debouncedFilters.statuses.length > 0 || debouncedFilters.includeTBA || debouncedFilters.yearRange[0] > MIN_YEAR || debouncedFilters.yearRange[1] < MAX_YEAR || debouncedFilters.scoreRange[0] > 0 || debouncedFilters.scoreRange[1] < 100 || debouncedFilters.genres.length > 0 || debouncedFilters.tags.length > 0;
    const isDefaultSort = debouncedFilters.sortBy === 'POPULARITY_DESC' && debouncedFilters.sortDirection === 'DESC';
    const isDefaultState = !isAnyApiFilterActive && isDefaultSort && !listStatusFilter;

    const fetchData = async () => {
      setIsLoading(true);
      setPage(1);
      
      const searchParams: SearchParams = { ...debouncedFilters };
      
      if (listStatusFilter) {
        const animeIds = Object.keys(lists)
          .filter(id => lists[parseInt(id)] === listStatusFilter)
          .map(Number);
        
        if (animeIds.length === 0) {
          setAnimes([]);
          setHasNextPage(false);
          setIsLoading(false);
          return;
        }
        searchParams.animeIds = animeIds;
      }
      
      const results = await searchAnime(searchParams, 1, listStatusFilter ? 50 : 20);
      setAnimes(results.animes);
      setHasNextPage(listStatusFilter ? false : results.hasNextPage);
      
      setIsLoading(false);
      window.scrollTo(0, 0);
    };

    if (isDefaultState) {
        setAnimes(initialAnimes);
        setPage(1);
        setHasNextPage(true);
        setIsLoading(false);
    } else {
        fetchData();
    }
  }, [debouncedFilters, initialAnimes, listStatusFilter, lists]); 

  const loadMoreAnimes = useCallback(async () => {
    if (isNextPageLoading || !hasNextPage || listStatusFilter) return;
    setIsNextPageLoading(true); 
    const nextPage = page + 1;
    const results = await searchAnime(debouncedFilters, nextPage);
    setAnimes(prev => [...prev, ...results.animes]); 
    setPage(nextPage);
    setHasNextPage(results.hasNextPage); 
    setIsNextPageLoading(false);
  }, [isNextPageLoading, hasNextPage, page, debouncedFilters, listStatusFilter]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isNextPageLoading) return; 
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => { 
      if (entries[0].isIntersecting && hasNextPage && !listStatusFilter) { 
        loadMoreAnimes(); 
      } 
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isNextPageLoading, hasNextPage, loadMoreAnimes, listStatusFilter]);
  
  const renderGridContent = () => {
    if (isLoading) {
      return <AnimeGridLoading isSidebarOpen={isSidebarOpen} />;
    }

    if (animes.length > 0) {
      return (
        <div className={`grid grid-cols-2 gap-4 transition-all duration-300 sm:grid-cols-3 ${isSidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
          {animes.map((anime, index) => {
            const isLastElement = animes.length === index + 1;
            const props = { anime: anime, priority: index < 10 };

            if (isLastElement && hasNextPage && !listStatusFilter) {
              return <div ref={lastAnimeElementRef} key={`${anime.id}-${index}`}><AnimeCard {...props} /></div>;
            }
            return <AnimeCard key={`${anime.id}-${index}`} {...props} />;
          })}
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <p className="text-xl text-text-secondary">Nenhum anime encontrado.</p>
        <p className="text-md text-gray-500 mt-2">Tente ajustar seus filtros.</p>
      </div>
    );
  };
  
  const currentTitle = listStatusFilter ? "Minha Lista" : ( (debouncedFilters.search.length > 0 || (debouncedFilters.genres && debouncedFilters.genres.length > 0)) ? 'Resultados da Busca' : 'Animes Populares');
  const isSearchTextActive = debouncedFilters.search.length > 0;
  const finalSortByForDisplay = isSearchTextActive ? 'RELEVANCE' : sortBy;
  const isCurrentSortInvertible = invertibleSortOptions.includes(sortBy);
  
  return (
    <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold border-l-4 border-primary pl-3">{currentTitle}</h2>
          <div className="flex items-center gap-2">
              <label htmlFor="sort-by" className="text-sm text-text-secondary">{sidebarLabelTranslations[language]?.sortByLabel || sidebarLabelTranslations.pt.sortByLabel}</label>
              <select 
                id="sort-by" 
                value={finalSortByForDisplay} 
                onChange={(e) => setSortBy(e.target.value)} 
                disabled={isSearchTextActive}
                className="bg-surface border border-gray-600 rounded-md px-3 py-1.5 text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {Object.entries(sortOptionTranslations).map(([value, translations]) => (
                  <option key={value} value={value}>
                    {translations?.[language] || translations?.['pt'] || value}
                  </option>
                ))}
              </select>
              <button 
                onClick={toggleSortDirection} 
                disabled={isSearchTextActive || !isCurrentSortInvertible}
                title={language === 'pt' ? 'Inverter Ordem' : 'Invert Order'}
                className="p-1.5 bg-surface border border-gray-600 rounded-md text-text-secondary disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 hover:text-primary"
              >
                {sortDirection === 'DESC' ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> :
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                }
              </button>
          </div>
        </div>
        
        <div className="relative">
          {renderGridContent()}
        </div>

        {isNextPageLoading && <div className="flex justify-center items-center mt-8 h-16"><p className="text-text-secondary animate-pulse">Carregando mais...</p></div>}
        {!hasNextPage && animes.length > 0 && !listStatusFilter && <div className="text-center mt-8 text-text-secondary"><p>Você chegou ao fim dos resultados.</p></div>}
    </section>
  );
}