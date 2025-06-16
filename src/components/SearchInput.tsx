// src/components/SearchInput.tsx

'use client';

import { useFilterStore } from '@/store/filterStore';

export default function SearchInput() {
  // Pega apenas o que é necessário da store: o valor da busca, a função para atualizá-la e o idioma.
  const { search, setSearch, language } = useFilterStore();

  const placeholderText = language === 'pt' ? 'Buscar anime...' : 'Search anime...';

  // O componente agora é apenas um input controlado, sem lógica extra.
  return (
    <div className="relative">
      <input
        type="text"
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={placeholderText}
        className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
        autoComplete="off"
      />
    </div>
  );
}