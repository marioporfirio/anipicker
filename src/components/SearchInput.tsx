'use client';

import { useFilterStore } from '@/store/filterStore';

export default function SearchInput() {
  const { search, setSearch, language } = useFilterStore();

  const placeholderText = language === 'pt' ? 'Buscar anime...' : 'Search anime...';

  return (
    <div className="relative">
      <input
        type="text"
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholderText}
        className="w-full bg-background border border-gray-600 rounded-md pl-3 pr-8 py-2 text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
        autoComplete="off"
      />
      {search && (
        <button
          onClick={() => setSearch('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-main transition-colors"
          aria-label="Limpar busca"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      )}
    </div>
  );
}
