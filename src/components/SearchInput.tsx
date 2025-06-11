// src/components/SearchInput.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useDebounce } from 'use-debounce';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

interface Suggestion {
  id: number;
  title: {
    romaji: string;
    english?: string | null;
  };
  coverImage: {
    medium: string;
  };
}

export default function SearchInput() {
  const { search, setSearch, language } = useFilterStore();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [debouncedSearch] = useDebounce(search, 300);
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const placeholderText = language === 'pt' ? 'Buscar anime...' : 'Search anime...';

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearch.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsLoading(true);
      try {
        const res = await fetch(`/api/anime/search-suggestions?q=${debouncedSearch}`);
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data);
        }
      } catch (error) {
        console.error("Failed to fetch suggestions", error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSuggestions();
  }, [debouncedSearch]);

  // Efeito para fechar o dropdown se clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleSuggestionClick = (animeId: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('anime', animeId.toString());
    router.push(`/?${params.toString()}`, { scroll: false });
    setSuggestions([]);
    setIsFocused(false);
  };

  const showSuggestions = isFocused && (suggestions.length > 0 || isLoading);

  return (
    <div className="relative" ref={searchContainerRef}>
      <input
        type="text"
        id="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onFocus={() => setIsFocused(true)}
        placeholder={placeholderText}
        className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
        autoComplete="off"
      />
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-gray-700 rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-text-secondary">Buscando...</div>
          ) : (
            <ul>
              {suggestions.map((anime) => (
                <li key={anime.id}>
                  <button
                    onClick={() => handleSuggestionClick(anime.id)}
                    className="w-full text-left flex items-center gap-3 p-2 hover:bg-primary/20 transition-colors"
                  >
                    <div className="w-10 h-14 relative flex-shrink-0">
                      <Image
                        src={anime.coverImage.medium}
                        alt={anime.title.romaji}
                        fill
                        sizes="40px"
                        className="object-cover rounded-sm"
                      />
                    </div>
                    <span className="text-sm font-medium">
                      {anime.title.romaji}
                      {anime.title.english && <span className="block text-xs text-text-secondary">{anime.title.english}</span>}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}