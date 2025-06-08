// src/components/ClientLayoutWrapper.tsx
'use client';

import { useFilterStore } from '@/store/filterStore';
import { useEffect, useState } from 'react';
// Removed: import { fetchAnimationStudios } from '@/lib/anilist';

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
  sidebar: React.ReactNode; // A sidebar inteira é passada como uma prop
}

export default function ClientLayoutWrapper({ children, sidebar }: ClientLayoutWrapperProps) {
  const { isSidebarOpen, toggleSidebar } = useFilterStore(); // Removed setAllStudios, allStudios
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Removed useEffect for fetching studios

  return (
    <div className="flex flex-col md:flex-row gap-8">
      {/* Botão flutuante para abrir a sidebar */}
      {isClient && !isSidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-20 left-4 z-30 p-2 bg-surface rounded-full shadow-lg text-text-secondary hover:text-primary"
          title="Mostrar filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      )}

      {/* Renderiza a sidebar (que foi passada como prop) se estiver aberta */}
      {isClient && isSidebarOpen && sidebar}
      
      {/* O conteúdo da página principal */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}