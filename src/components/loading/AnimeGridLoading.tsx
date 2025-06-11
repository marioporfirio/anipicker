// src/components/loading/AnimeGridLoading.tsx
import React, { useMemo } from 'react';
import AnimeCardSkeleton from './AnimeCardSkeleton';

interface AnimeGridLoadingProps {
  isSidebarOpen: boolean;
  count?: number;
}

export default function AnimeGridLoading({ isSidebarOpen, count = 12 }: AnimeGridLoadingProps) {
  // Usamos useMemo para garantir que as classes sejam calculadas apenas quando necessário
  const gridClasses = useMemo(() => {
    return `grid grid-cols-2 gap-4 transition-all duration-300 sm:grid-cols-3 ${
      isSidebarOpen 
        ? 'lg:grid-cols-3 xl:grid-cols-4' 
        : 'lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    }`;
  }, [isSidebarOpen]);

  return (
    <div className={gridClasses}>
      {Array.from({ length: count }).map((_, index) => (
        <AnimeCardSkeleton key={index} />
      ))}
    </div>
  );
}