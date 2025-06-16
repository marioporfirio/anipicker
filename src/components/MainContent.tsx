// =================================================================
// ============== ARQUIVO: src/components/MainContent.tsx ==========
// =================================================================
'use client';

import { useFilterStore } from '@/store/filterStore';
import Sidebar from './Sidebar';
import AnimeGrid from './AnimeGrid';
import { Anime, AiringAnime } from '@/lib/anilist';
import React, { Suspense } from 'react'; // Adicionado Suspense
import AiringSchedule from './schedule/AiringSchedule';
import clsx from 'clsx';
import { useSearchParams } from 'next/navigation'; // Importado
import StudioWorksModal from './StudioWorksModal'; // Importado

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

// NOVO COMPONENTE INTERNO: Lida com a lógica de renderização da modal
function StudioModalRenderer() {
  const searchParams = useSearchParams();
  const studioId = searchParams.get('studioId');
  const studioName = searchParams.get('studioName');

  if (studioId && studioName) {
    return (
      <StudioWorksModal
        studioId={Number(studioId)}
        studioName={studioName}
      />
    );
  }

  return null;
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
  const showSidebar = isSidebarOpen && viewMode === 'grid';

  return (
    // O React.Fragment <> é necessário para agrupar os elementos adjacentes
    <>
      <div className="flex flex-col md:flex-row gap-8 items-start pt-8">
        {!isSidebarOpen && viewMode === 'grid' && (
          <button
            onClick={toggleSidebar}
            className="fixed top-24 left-0 z-30 bg-primary text-black p-2 rounded-r-lg shadow-lg hover:bg-primary/80 transition-all"
            title="Mostrar filtros"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}

        <div
          className={clsx(
            "flex-shrink-0 transition-all duration-300 ease-in-out",
            "md:w-64 lg:w-72",
            showSidebar ? "md:block" : "md:hidden",
            "hidden"
          )}
        >
          <Sidebar>
            {filtersComponent}
          </Sidebar>
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
            <AnimeGrid initialAnimes={initialAnimes} />
          )}
        </div>
      </div>
      
      {/* CORREÇÃO: Renderiza a modal condicionalmente aqui. */}
      {/* Suspense é necessário porque useSearchParams pode suspender a renderização. */}
      <Suspense fallback={null}>
        <StudioModalRenderer />
      </Suspense>
    </>
  );
}