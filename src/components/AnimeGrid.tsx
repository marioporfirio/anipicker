'use client';
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore } from '@/store/userListStore';
import { Anime, SearchResult } from '@/lib/anilist';
import {
  sortOptionTranslations,
  sidebarLabelTranslations,
  listButtonConfig
} from '@/lib/translations';
import AnimeCard from '@/components/AnimeCard';
import { useDebounce } from 'use-debounce';
import AnimeGridLoading from './loading/AnimeGridLoading';
import { PAGINATION } from '@/lib/constants';
import clsx from 'clsx';

import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  arrayMove,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimeGridProps {
  initialAnimes: Anime[];
}

function SortableGridItem({
  anime,
  index,
  maxRank,
  priority,
  isRanked,
  activeListId,
  isDragging
}: {
  anime: Anime;
  index: number;
  maxRank: number;
  priority: boolean;
  isRanked: boolean;
  activeListId?: string;
  isDragging: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: anime.id.toString() });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab'
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="rounded-lg aspect-[2/3] bg-surface/30" />;
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layoutId={`card-${anime.id}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      {...attributes}
      {...listeners}
    >
      <AnimeCard
        anime={anime}
        priority={priority}
        rank={index + 1}
        maxRank={maxRank}
        isRanked={isRanked}
        activeListId={activeListId}
      />
    </motion.div>
  );
}

export default function AnimeGrid({ initialAnimes }: AnimeGridProps) {
  const {
    search, yearRange, scoreRange, genres, tags, formats, sources,
    includeTBA, sortBy, statuses: statusFilters, language, sortDirection,
    listStatusFilter, setSortBy, isSidebarOpen, activeListId, toggleSortDirection
  } = useFilterStore();
  // Renomeado para `reorderAnimeInStore` para clareza
  const { customLists, statuses: userStatuses, moveAnimeInList: reorderAnimeInStore } = useUserListStore();

  const [animes, setAnimes] = useState<Anime[]>(initialAnimes);
  const [rawUserListData, setRawUserListData] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isNextPageLoading, setIsNextPageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [activeAnime, setActiveAnime] = useState<Anime | null>(null);

  // >> INÍCIO DA CORREÇÃO: Estado local para a lista exibida <<
  const [displayedList, setDisplayedList] = useState<Anime[]>([]);
  // >> FIM DA CORREÇÃO <<

  useEffect(() => { setIsClient(true); }, []);

  const canonicalIdString = useMemo(() => {
    const list = customLists.find(l => l.id === activeListId);
    if (!list || list.animeIds.length === 0) return '';
    return [...list.animeIds].sort((a, b) => a - b).join(',');
  }, [activeListId, customLists]);

  useEffect(() => {
    if (!activeListId) {
      setRawUserListData([]);
      return;
    }
    const fetchRankedListData = async () => {
      setIsLoading(true);
      const list = customLists.find(l => l.id === activeListId);
      const animeIds = list?.animeIds || [];

      if (animeIds.length === 0) {
        setRawUserListData([]);
        setIsLoading(false);
        return;
      }

      const allAnimes: Anime[] = [];
      let currentPage = 1;
      let hasMorePages = true;

      while (hasMorePages) {
        try {
          const res = await fetch('/api/anime/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              params: { animeIds },
              page: currentPage,
              perPage: PAGINATION.USER_LIST_PAGE_SIZE
            })
          });
          const results: SearchResult = await res.json();
          allAnimes.push(...results.animes);
          hasMorePages = results.hasNextPage;
          currentPage++;
        } catch (error) {
          console.error("Erro ao buscar página da lista de animes:", error);
          hasMorePages = false;
        }
      }
      
      setRawUserListData(allAnimes);
      setIsLoading(false);
    };
    
    fetchRankedListData();
  }, [activeListId, canonicalIdString, customLists]);

  const orderedUserListData = useMemo(() => {
    if (!activeListId) return [];
    const list = customLists.find(l => l.id === activeListId);
    if (!list) return [];
    return list.animeIds.map(id => rawUserListData.find(a => a.id === id)).filter((a): a is Anime => !!a);
  }, [activeListId, customLists, rawUserListData]);

  // >> INÍCIO DA CORREÇÃO: Sincroniza o estado local com a fonte de dados (Zustand ou API) <<
  useEffect(() => {
    if (activeListId) {
        setDisplayedList(orderedUserListData);
    } else {
        setDisplayedList(animes);
    }
  }, [orderedUserListData, animes, activeListId]);
  // >> FIM DA CORREÇÃO <<

  const filters = useMemo(() => ({
    search, yearRange, scoreRange, genres, tags, formats, sources,
    includeTBA, sortBy, statuses: statusFilters, sortDirection
  }), [search, yearRange, scoreRange, genres, tags, formats, sources, includeTBA, sortBy, statusFilters, sortDirection]);
  
  const [debouncedFilters] = useDebounce(filters, 500);

  const fetchData = useCallback(async (pageNum: number) => {
    const isFirstPage = pageNum === 1;
    if (isFirstPage) setIsLoading(true); else setIsNextPageLoading(true);

    let apiParams: any = { ...debouncedFilters };

    if (listStatusFilter) {
      const animeIds = Object.entries(userStatuses)
        .filter(([, status]) => status === listStatusFilter)
        .map(([id]) => Number(id));

      if (animeIds.length === 0) {
        setAnimes([]);
        setHasNextPage(false);
        setIsLoading(false);
        setIsNextPageLoading(false);
        return;
      }
      apiParams.animeIds = animeIds;
    }
    
    try {
      const res = await fetch('/api/anime/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ params: apiParams, page: pageNum }),
      });

      if (!res.ok) { throw new Error('Falha ao buscar dados da API'); }

      const results: SearchResult = await res.json();
      
      if (isFirstPage) { setAnimes(results.animes); } 
      else { setAnimes(prev => [...prev, ...results.animes]); }
      
      setPage(pageNum);
      setHasNextPage(results.hasNextPage);
    } catch (error) {
        console.error("Erro ao buscar dados na grid:", error);
    } finally {
        setIsLoading(false);
        setIsNextPageLoading(false);
    }
  }, [debouncedFilters, listStatusFilter, userStatuses]);

  useEffect(() => {
    if (activeListId) { setAnimes([]); return; }
    fetchData(1);
  }, [activeListId, debouncedFilters, listStatusFilter, fetchData]);

  const loadMoreAnimes = useCallback(() => {
    if (isNextPageLoading || !hasNextPage || activeListId) return;
    fetchData(page + 1);
  }, [isNextPageLoading, hasNextPage, activeListId, page, fetchData]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastAnimeElementRef = useCallback((node: HTMLDivElement) => {
    if (isLoading || isNextPageLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasNextPage && !activeListId) {
        loadMoreAnimes();
      }
    });
    if (node) observer.current.observe(node);
  }, [isLoading, isNextPageLoading, hasNextPage, loadMoreAnimes, activeListId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));
  
  const handleDragStart = (event: DragStartEvent) => {
    const anime = displayedList.find(a => a.id.toString() === event.active.id);
    if (anime) setActiveAnime(anime);
  };
  
  // >> INÍCIO DA CORREÇÃO: Lógica de atualização otimista <<
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id && activeListId) {
      const oldIndex = displayedList.findIndex(a => a.id.toString() === active.id);
      const newIndex = displayedList.findIndex(a => a.id.toString() === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        // 1. Atualiza o estado local IMEDIATAMENTE para a animação ser suave.
        setDisplayedList(list => arrayMove(list, oldIndex, newIndex));
        // 2. Atualiza o estado global no Zustand para persistir a mudança.
        reorderAnimeInStore(activeListId, oldIndex, newIndex);
      }
    }
    setActiveAnime(null);
  };
  // >> FIM DA CORREÇÃO <<

  const renderGridContent = () => {
    if (isLoading) { return <AnimeGridLoading isSidebarOpen={isSidebarOpen} />; }
    
    // >> INÍCIO DA CORREÇÃO: Usa o estado local `displayedList` para renderizar <<
    const listToRender = activeListId ? displayedList : animes;
    // >> FIM DA CORREÇÃO <<

    if (listToRender.length === 0) {
      if (activeListId) { return (<div className="text-center h-96 flex flex-col justify-center"><p className="text-xl text-text-secondary">Esta lista está vazia.</p><p className="text-md text-gray-500 mt-2">Adicione animes para começar!</p></div>); }
      if (listStatusFilter) { return (<div className="text-center h-96 flex flex-col justify-center"><p className="text-xl text-text-secondary">Nenhum anime nesta lista.</p></div>); }
      return (<div className="text-center h-96 flex flex-col justify-center"><p className="text-xl text-text-secondary">Nenhum anime encontrado.</p><p className="text-md text-gray-500 mt-2">Tente ajustar seus filtros.</p></div>);
    }

    // >> INÍCIO DA CORREÇÃO: O modo ranqueado agora usa `displayedList` <<
    if (activeListId && isClient) {
      return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragCancel={() => setActiveAnime(null)}>
          <SortableContext items={displayedList.map(a => a.id.toString())} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
              <AnimatePresence>
                {displayedList.map((anime, idx) => (
                  <SortableGridItem key={anime.id} anime={anime} index={idx} maxRank={displayedList.length} priority={idx < 10} isRanked={true} activeListId={activeListId} isDragging={activeAnime?.id === anime.id} />
                ))}
              </AnimatePresence>
            </div>
          </SortableContext>
          <DragOverlay dropAnimation={null}>
            {activeAnime ? (<motion.div className="rounded-lg shadow-2xl cursor-grabbing scale-105"><AnimeCard anime={activeAnime} priority={true} rank={displayedList.findIndex(a => a.id === activeAnime.id) + 1} maxRank={displayedList.length} isRanked={true} activeListId={activeListId} /></motion.div>) : null}
          </DragOverlay>
        </DndContext>
      );
    }
    // >> FIM DA CORREÇÃO <<
    
    return (
      <div className={clsx("grid grid-cols-2 gap-4 sm:grid-cols-3", isSidebarOpen ? 'lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6')}>
        {listToRender.map((anime, index) => {
          const props = { anime, priority: index < 10, rank: index + 1, maxRank: listToRender.length, isRanked: false, activeListId };
          if (index === listToRender.length - 1 && hasNextPage && !activeListId) {
            return (<div ref={lastAnimeElementRef} key={`${anime.id}-${index}`}><AnimeCard {...props} /></div>);
          }
          return <AnimeCard key={`${anime.id}-${index}`} {...props} />;
        })}
      </div>
    );
  };

  const currentTitle = useMemo(() => {
    if (activeListId) { const list = customLists.find(l => l.id === activeListId); return list?.name || 'Minhas Listas'; }
    if (listStatusFilter) { return (listButtonConfig.find(l => l.status === listStatusFilter)?.label[language] || 'Minha Lista'); }
    if (search.length > 0 || genres.length > 0 || tags.length > 0) { return language === 'pt' ? 'Resultados da Busca' : 'Search Results'; }
    return language === 'pt' ? 'Animes Populares' : 'Popular Anime';
  }, [listStatusFilter, search, genres, tags, language, activeListId, customLists]);

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-2xl font-semibold border-l-4 border-primary pl-3">{currentTitle}</h2>
        {!activeListId && (
          <div className="flex items-center gap-2">
            <label htmlFor="sort-by" className="text-sm text-text-secondary">{sidebarLabelTranslations[language]?.sortByLabel || sidebarLabelTranslations.pt.sortByLabel}</label>
            <select id="sort-by" value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-surface border border-gray-600 rounded-md px-3 py-1.5 text-sm text-text-main focus:ring-1 focus:ring-primary focus:outline-none">{Object.entries(sortOptionTranslations).map(([value, translations]) => (<option key={value} value={value}>{translations?.[language] || translations?.pt || value}</option>))}</select>
            <button onClick={toggleSortDirection} title={language === 'pt' ? 'Inverter Ordem' : 'Invert Order'} className="p-1.5 bg-surface border border-gray-600 rounded-md text-text-secondary hover:bg-gray-700 hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={sortBy.startsWith('POPULARITY')}>
              {sortDirection === 'DESC' ? (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M19 12l-7 7-7-7" /></svg>) : (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>)}
            </button>
          </div>
        )}
      </div>
      <div className="relative">{renderGridContent()}</div>
      {isNextPageLoading && (<div className="flex justify-center items-center mt-8 h-16"><p className="text-text-secondary animate-pulse">Carregando mais...</p></div>)}
      {!hasNextPage && animes.length > 0 && !activeListId && !listStatusFilter && (<div className="text-center mt-8 text-text-secondary"><p>Chegou ao fim dos resultados.</p></div>)}
    </section>
  );
}