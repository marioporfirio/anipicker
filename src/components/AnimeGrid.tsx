// =================================================================
// ============== ARQUIVO: src/components/AnimeGrid.tsx ==============
// =================================================================
'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore } from '@/store/userListStore';
import { searchAnime, Anime } from '@/lib/anilist';
import { sortOptionTranslations, sidebarLabelTranslations, listButtonConfig } from '@/lib/translations';
import AnimeCard from '@/components/AnimeCard';
import { useDebounce } from 'use-debounce';
import AnimeGridLoading from './loading/AnimeGridLoading';
import { FILTER_LIMITS, PAGINATION } from '@/lib/constants';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';

interface AnimeGridProps {
  initialAnimes: Anime[];
}

export default function AnimeGrid({ initialAnimes }: AnimeGridProps) {
  const {
    search, yearRange, scoreRange, genres, tags, formats, sources,
    includeTBA, sortBy, statuses: statusFilters, language, sortDirection, listStatusFilter,
    setSortBy, isSidebarOpen, activeListId, toggleSortDirection
  } = useFilterStore();

  const { customLists, statuses: userStatuses, reorderAnimeInList } = useUserListStore();

  const filters = useMemo(() => ({ search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statuses: statusFilters, language, sortDirection }), [search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statusFilters, language, sortDirection]);
  const [debouncedFilters] = useDebounce(filters, 500);

  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [userListData, setUserListData] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!activeListId && !listStatusFilter) return;

    const fetchUserListData = async () => {
        setIsLoading(true);
        setUserListData([]);

        let animeIds: number[] = [];

        if (activeListId) {
            const currentList = customLists.find(l => l.id === activeListId);
            animeIds = currentList?.animeIds || [];
        } else if (listStatusFilter) {
            animeIds = Object.keys(userStatuses)
                .filter(id => userStatuses[parseInt(id)] === listStatusFilter)
                .map(Number);
        }

        if (animeIds.length === 0) {
            setHasNextPage(false);
            setIsLoading(false);
            return;
        }

        const results = await searchAnime({ animeIds }, 1, 50);

        const ordered = activeListId
            ? animeIds.map(id => results.animes.find(anime => anime.id === id)).filter((anime): anime is Anime => anime !== undefined)
            : results.animes;

        setUserListData(ordered);
        setHasNextPage(false);
        setIsLoading(false);
    };

    fetchUserListData();
  }, [activeListId, listStatusFilter, customLists, userStatuses]);

  useEffect(() => {
    if (activeListId || listStatusFilter) {
      setAnimes([]);
      return;
    };

    const isAnyApiFilterActive = debouncedFilters.search.length > 0 || debouncedFilters.formats.length > 0 || debouncedFilters.sources.length > 0 || debouncedFilters.statuses.length > 0 || debouncedFilters.includeTBA || debouncedFilters.yearRange[0] > FILTER_LIMITS.MIN_YEAR || debouncedFilters.yearRange[1] < FILTER_LIMITS.MAX_YEAR || debouncedFilters.scoreRange[0] > 0 || debouncedFilters.scoreRange[1] < 100 || debouncedFilters.genres.length > 0 || debouncedFilters.tags.length > 0;
    const isDefaultSort = debouncedFilters.sortBy === 'POPULARITY_DESC' && debouncedFilters.sortDirection === 'DESC';
    const isDefaultState = !isAnyApiFilterActive && isDefaultSort;

    const fetchData = async () => {
      setIsLoading(true);
      setPage(1);
      const results = await searchAnime(debouncedFilters, 1, PAGINATION.DEFAULT_GRID_PAGE_SIZE);
      setAnimes(results.animes);
      setHasNextPage(results.hasNextPage);
      setIsLoading(false);
    };

    if (isDefaultState) {
        setAnimes(initialAnimes);
        setPage(1);
        setHasNextPage(true);
        setIsLoading(false);
    } else {
        fetchData();
    }
  }, [debouncedFilters, initialAnimes, activeListId, listStatusFilter]);


  const loadMoreAnimes = useCallback(async () => {
    if (isNextPageLoading || !hasNextPage || activeListId || listStatusFilter) return;
    setIsNextPageLoading(true);
    const nextPage = page + 1;
    const results = await searchAnime(debouncedFilters, nextPage);
    setAnimes(prev => [...prev, ...results.animes]);
    setPage(nextPage);
    setHasNextPage(results.hasNextPage);
    setIsNextPageLoading(false);
  }, [isNextPageLoading, hasNextPage, page, debouncedFilters, activeListId, listStatusFilter]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isNextPageLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !activeListId && !listStatusFilter) {
        loadMoreAnimes();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isNextPageLoading, hasNextPage, loadMoreAnimes, activeListId, listStatusFilter]);

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result;
    if (!destination || destination.index === source.index || !activeListId) return;

    reorderAnimeInList(activeListId, source.index, destination.index);
  };

  const renderGridContent = () => {
    if (isLoading) {
      return <AnimeGridLoading isSidebarOpen={isSidebarOpen} />;
    }

    const isUserListMode = !!activeListId || !!listStatusFilter;
    const listToRender = isUserListMode ? userListData : animes;

    if (listToRender.length === 0) {
        if(activeListId) return <div className="text-center h-96 flex flex-col justify-center"><p className="text-xl text-text-secondary">Esta lista está vazia.</p><p className="text-md text-gray-500 mt-2">Adicione animes para começar!</p></div>
        if(listStatusFilter) return <div className="text-center h-96 flex flex-col justify-center"><p className="text-xl text-text-secondary">Nenhum anime nesta lista.</p></div>
        return <div className="text-center h-96 flex flex-col justify-center"><p className="text-xl text-text-secondary">Nenhum anime encontrado.</p><p className="text-md text-gray-500 mt-2">Tente ajustar seus filtros.</p></div>
    }

    if (activeListId && isClient) {
        return (
            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable droppableId="custom-list-grid">
                    {(provided) => (
                        <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className={`grid grid-cols-2 gap-4 transition-all duration-300 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6`}
                        >
                            {listToRender.map((anime, index) => (
                                <Draggable key={anime.id} draggableId={anime.id.toString()} index={index}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            className={snapshot.isDragging ? 'shadow-2xl scale-105' : ''}
                                            style={provided.draggableProps.style}
                                        >
                                            <AnimeCard
                                                anime={anime}
                                                priority={index < 10}
                                                rank={index + 1}
                                                maxRank={listToRender.length}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                </Droppable>
            </DragDropContext>
        )
    }

    return (
        <div className={`grid grid-cols-2 gap-4 transition-all duration-300 sm:grid-cols-3 ${isSidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'}`}>
          {listToRender.map((anime, index) => {
            const isLastElement = listToRender.length === index + 1;
            // ATENÇÃO: Mudança aqui para incluir rank e maxRank
            const props = {
              anime: anime,
              priority: index < 10,
              rank: index + 1, // Adicionado
              maxRank: listToRender.length, // Adicionado
            };

            if (isLastElement && hasNextPage && !isUserListMode) {
              return <div ref={lastAnimeElementRef} key={`${anime.id}-${index}`}><AnimeCard {...props} /></div>;
            }
            return <AnimeCard key={`${anime.id}-${index}`} {...props} />;
          })}
        </div>
    );
  };

  const currentTitle = useMemo(() => {
    if(activeListId) {
        const list = customLists.find(l => l.id === activeListId);
        return list?.name || 'Minhas Listas';
    }
    if(listStatusFilter) return listButtonConfig.find(l => l.status === listStatusFilter)?.label[language] || 'Minha Lista';
    if(debouncedFilters.search.length > 0 || debouncedFilters.genres.length > 0) return language === 'pt' ? 'Resultados da Busca' : 'Search Results';
    return language === 'pt' ? 'Animes Populares' : 'Popular Anime';
  }, [listStatusFilter, debouncedFilters, language, activeListId, customLists]);

  return (
    <section>
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <h2 className="text-2xl font-semibold border-l-4 border-primary pl-3">{currentTitle}</h2>
          {!activeListId && !listStatusFilter && (
            <div className="flex items-center gap-2">
                <label htmlFor="sort-by" className="text-sm text-text-secondary">{sidebarLabelTranslations[language]?.sortByLabel || sidebarLabelTranslations.pt.sortByLabel}</label>
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-surface border border-gray-600 rounded-md px-3 py-1.5 text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  {Object.entries(sortOptionTranslations).map(([value, translations]) => (
                    <option key={value} value={value}>
                      {translations?.[language] || translations?.['pt'] || value}
                    </option>
                  ))}
                </select>
                <button
                  onClick={toggleSortDirection}
                  title={language === 'pt' ? 'Inverter Ordem' : 'Invert Order'}
                  className="p-1.5 bg-surface border border-gray-600 rounded-md text-text-secondary hover:bg-gray-700 hover:text-primary"
                >
                  {sortDirection === 'DESC' ?
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg> :
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                  }
                </button>
            </div>
          )}
        </div>

        <div className="relative">
          {renderGridContent()}
        </div>

        {isNextPageLoading && <div className="flex justify-center items-center mt-8 h-16"><p className="text-text-secondary animate-pulse">Carregando mais...</p></div>}
        {!hasNextPage && animes.length > 0 && !activeListId && !listStatusFilter && <div className="text-center mt-8 text-text-secondary"><p>Chegou ao fim dos resultados.</p></div>}
    </section>
  );
}