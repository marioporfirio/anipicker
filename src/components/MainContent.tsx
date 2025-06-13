// src/components/MainContent.tsx
'use client';

import { useFilterStore } from '@/store/filterStore';
import Sidebar from './Sidebar';
import AnimeGrid from './AnimeGrid';
import { Anime, AiringAnime } from '@/lib/anilist';
import React from 'react';
import AiringSchedule from './schedule/AiringSchedule';

interface MainContentProps {
  initialAnimes: Anime[];
  airingSchedule: AiringAnime[];
  filtersComponent: React.ReactNode;
  isLoadingSchedule: boolean;
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export default function MainContent({ 
    initialAnimes, 
    airingSchedule, 
    filtersComponent,
    isLoadingSchedule,
    currentDate,
    onPrevWeek,
    onNextWeek,
    onToday
}: MainContentProps) {
  const { isSidebarOpen, toggleSidebar, viewMode } = useFilterStore();

  // CORREÇÃO: A sidebar agora só é relevante para a visualização em grid.
  const showSidebar = isSidebarOpen && viewMode === 'grid';

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start pt-8">
      
      {/* CORREÇÃO: O botão para abrir a sidebar agora só aparece na visualização em grid. */}
      {!isSidebarOpen && viewMode === 'grid' && (
        <button 
          onClick={toggleSidebar}
          className="fixed top-24 left-0 z-30 bg-primary text-white p-2 rounded-r-lg shadow-lg hover:bg-primary-dark transition-all"
          title="Mostrar filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      )}

      <div 
        className={`
          md:w-64 lg:w-72 flex-shrink-0 
          transition-all duration-300 ease-in-out
          ${showSidebar ? 'md:block' : 'hidden'}
        `}
      >
        <Sidebar filters={filtersComponent} />
      </div>

      <div className="flex-1 w-full overflow-hidden">
        {viewMode === 'schedule' ? (
          <AiringSchedule 
            schedule={airingSchedule}
            isLoading={isLoadingSchedule}
            currentDate={currentDate}
            onPrevWeek={onPrevWeek}
            onNextWeek={onNextWeek}
            onToday={onToday}
          />
        ) : (
          // O AnimeGrid continua a lidar com 'grid' e 'favorites'
          <AnimeGrid initialAnimes={initialAnimes} />
        )}
      </div>

    </div>
  );
}
