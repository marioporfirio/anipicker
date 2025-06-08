// src/components/AnimeGrid.tsx
'use client';

// Adicione 'useMemo' à importação do React
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { searchAnime, Anime } from '@/lib/anilist';
import AnimeCard from '@/components/AnimeCard';
import { useRouter } from 'next/navigation';
import { useDebounce } from 'use-debounce';

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

const sortOptions = {
  'POPULARITY_DESC': 'Popularidade',
  'SCORE_DESC': 'Nota Média',
  'TRENDING_DESC': 'Em Alta',
  'START_DATE_DESC': 'Mais Recentes',
  'TITLE_ROMAJI': 'A-Z',
};

function SortModeOverlay() {
    const { search, yearRange, scoreRange, genres, tags, sortBy, formats, includeTBA, toggleSortMode } = useFilterStore();
    const router = useRouter();
    const [isSorting, setIsSorting] = useState(false);

    const handleSortear = async () => {
        setIsSorting(true);
        try {
            const filters = { search, yearRange, scoreRange, genres, tags, sortBy, formats, includeTBA };
    
            const res = await fetch('/api/anime/random', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(filters),
            });
    
            if (!res.ok) {
                const errorData = await res.json();
                alert(`Erro ao sortear: ${errorData.error || 'Tente novamente.'}`);
                return;
            }
    
            const randomAnime = await res.json();
            toggleSortMode();
            router.push(`/?anime=${randomAnime.id}`, { scroll: false });
    
        } catch (error) {
            console.error(error);
            alert('Ocorreu um erro de rede. Verifique sua conexão.');
        } finally {
            setIsSorting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <div className="text-center p-4">
                <h3 className="text-3xl font-bold text-primary drop-shadow-lg">Modo Sorteio Ativado</h3>
                <p className="text-text-secondary mt-2">Ajuste os filtros e clique no botão para sortear!</p>
                <button
                    onClick={handleSortear}
                    disabled={isSorting}
                    className="mt-8 bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-sky-500 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {isSorting ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sorteando...
                        </>
                    ) : (
                        '🍀 Sortear com estes filtros!'
                    )}
                </button>
            </div>
        </div>
    );
}


interface AnimeGridProps {
  initialAnimes: Anime[];
}

export default function AnimeGrid({ initialAnimes }: AnimeGridProps) {
  const { 
    search, yearRange, scoreRange, genres, tags, formats, 
    includeTBA, sortBy, statuses, // Removed studioId
    setSortBy, isSidebarOpen, isSortMode 
  } = useFilterStore();
  
  const filters = useMemo(() => ({
    search, yearRange, scoreRange, genres, tags, formats, includeTBA, sortBy, statuses // Removed studioId
  }), [search, yearRange, scoreRange, genres, tags, formats, includeTBA, sortBy, statuses]); // Removed studioId
  
  const [debouncedFilters] = useDebounce(filters, 500);

  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);

  useEffect(() => {
    // Com a correção acima, este `useEffect` não entrará mais em loop infinito.
    if (isSortMode) return;
    
    // Pequena otimização: não precisa recalcular isAnyFilterActive aqui, pode usar debouncedFilters diretamente
    const isAnyFilterActive = 
        debouncedFilters.search.length > 0 ||
        debouncedFilters.formats.length > 0 ||
        (debouncedFilters.statuses && debouncedFilters.statuses.length > 0) ||
        // Removed: debouncedFilters.studioId !== null ||
        debouncedFilters.includeTBA || 
        debouncedFilters.yearRange[0] > MIN_YEAR || debouncedFilters.yearRange[1] < MAX_YEAR ||
        debouncedFilters.scoreRange[0] > 0 || debouncedFilters.scoreRange[1] < 100 ||
        debouncedFilters.genres.length > 0 ||
        debouncedFilters.tags.length > 0;

    const isDefaultSort = debouncedFilters.sortBy === 'POPULARITY_DESC';

    const fetchData = async () => {
      setIsLoading(true);
      setPage(1);
      // Removed apiFilters logic, pass debouncedFilters directly
      const results = await searchAnime(debouncedFilters, 1);
      setAnimes(results.animes);
      setHasNextPage(results.hasNextPage);
      setIsLoading(false);
      window.scrollTo(0, 0); // Scroll to top
    };
    
    // A condição `filters === debouncedFilters` garante que só rodamos a busca
    // quando o debounce terminar para a versão mais recente dos filtros.
    if (filters === debouncedFilters) {
        if (isAnyFilterActive || !isDefaultSort) {
          fetchData();
        } else {
          setAnimes(initialAnimes);
          setPage(1);
          setHasNextPage(true);
        }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters, initialAnimes, isSortMode]); // A lista de dependências está correta agora, pois debouncedFilters é estável.

  const loadMoreAnimes = useCallback(async () => {
    if (isNextPageLoading || !hasNextPage || isSortMode) return;
    
    setIsNextPageLoading(true);
    const nextPage = page + 1;
    // Removed apiFilters logic, pass debouncedFilters directly
    const results = await searchAnime(debouncedFilters, nextPage);
    
    setAnimes(prev => [...prev, ...results.animes]);
    setPage(nextPage);
    setHasNextPage(results.hasNextPage);
    setIsNextPageLoading(false);
  }, [isNextPageLoading, hasNextPage, page, debouncedFilters, isSortMode]);

  const observer = useRef<IntersectionObserver>();
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
  
  const isAnyFilterActiveForUI = 
    debouncedFilters.search.length > 0 ||
    debouncedFilters.formats.length > 0 ||
    (debouncedFilters.statuses && debouncedFilters.statuses.length > 0) ||
    // Removed: debouncedFilters.studioId !== null ||
    debouncedFilters.includeTBA ||
    debouncedFilters.yearRange[0] > MIN_YEAR || debouncedFilters.yearRange[1] < MAX_YEAR ||
    debouncedFilters.scoreRange[0] > 0 || debouncedFilters.scoreRange[1] < 100 ||
    debouncedFilters.genres.length > 0 ||
    debouncedFilters.tags.length > 0;

  const currentTitle = isAnyFilterActiveForUI ? 'Resultados da Busca' : 'Animes Populares';
  const isSearchActive = !!debouncedFilters.search;

  if (isLoading && !isSortMode) {
    return <div className="flex justify-center items-center h-96"><p className="text-text-secondary text-lg animate-pulse">Buscando animes...</p></div>;
  }

  return (
    <section className="relative">
      {isSortMode && <SortModeOverlay />}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-3">{currentTitle}</h2>
        <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-sm text-text-secondary">Ordenar por:</label>
            <select
                id="sort-by"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                disabled={isSearchActive || isSortMode}
                className="bg-surface border border-gray-600 rounded-md px-3 py-1.5 text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none disabled:opacity-50"
            >
                {Object.entries(sortOptions).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                ))}
            </select>
        </div>
      </div>
      {animes.length > 0 ? (
        <div className={`grid grid-cols-2 gap-4 transition-all duration-300 sm:grid-cols-3 ${isSidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-4' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
          {animes.map((anime, index) => {
            const isLastElement = animes.length === index + 1;
            if (isLastElement && hasNextPage && (isAnyFilterActiveForUI || sortBy !== 'POPULARITY_DESC')) {
              return <div ref={lastAnimeElementRef} key={anime.id}><AnimeCard anime={anime} /></div>;
            }
            return <AnimeCard key={anime.id} anime={anime} />;
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-96 text-center">
            <p className="text-xl text-text-secondary">Nenhum anime encontrado.</p>
            <p className="text-md text-gray-500 mt-2">Tente ajustar seus filtros.</p>
        </div>
      )}
      {isNextPageLoading && (
        <div className="flex justify-center items-center mt-8 h-16">
          <p className="text-text-secondary animate-pulse">Carregando mais...</p>
        </div>
      )}
      {!hasNextPage && animes.length > 0 && (isAnyFilterActiveForUI || sortBy !== 'POPULARITY_DESC') && (
        <div className="text-center mt-8 text-text-secondary">
          <p>Você chegou ao fim dos resultados.</p>
        </div>
      )}
    </section>
  );
}