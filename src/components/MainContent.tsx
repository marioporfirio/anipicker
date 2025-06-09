// src/components/MainContent.tsx
'use client';

import { useFilterStore } from '@/store/filterStore';
import Sidebar from './Sidebar';
import AnimeGrid from './AnimeGrid';
import { Anime } from '@/lib/anilist';
import React from 'react';

// Define a interface para as props que o componente recebe
interface MainContentProps {
  initialAnimes: Anime[];
  filtersComponent: React.ReactNode;
}

export default function MainContent({ initialAnimes, filtersComponent }: MainContentProps) {
  // Lê o estado da sidebar da store Zustand
  const { isSidebarOpen, toggleSidebar } = useFilterStore();

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      
      {/* Botão para MOSTRAR a sidebar quando ela estiver escondida */}
      {/* Ele fica fora da div da sidebar para poder ser posicionado de forma fixa na tela */}
      {!isSidebarOpen && (
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

      {/* 
        Container da Sidebar.
        A visibilidade é controlada por classes do Tailwind CSS.
        'hidden' esconde em telas pequenas e 'md:block' mostra em telas médias ou maiores,
        mas a classe 'hidden' é aplicada condicionalmente, removendo o componente do layout.
      */}
      <div 
        className={`
          md:w-64 lg:w-72 flex-shrink-0 
          transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'md:block' : 'hidden'}
        `}
      >
        <Sidebar filters={filtersComponent} />
      </div>

      {/* Container do Grid de Animes */}
      <div className="flex-1 w-full overflow-hidden">
        <AnimeGrid initialAnimes={initialAnimes} />
      </div>

    </div>
  );
}