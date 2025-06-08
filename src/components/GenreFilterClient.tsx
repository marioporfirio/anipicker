// src/components/GenreFilterClient.tsx
'use client';

import { useFilterStore, Selection } from '@/store/filterStore';
import { useState } from 'react';
import { translate, genreTranslations } from '@/lib/translations';

function GenrePill({ genre, onToggle }: { genre: Selection, onToggle: (name: string) => void }) {
  const language = useFilterStore((state) => state.language);
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors";
  const colorClasses = genre.mode === 'include'
    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/40'
    : 'bg-red-500/20 text-red-300 hover:bg-red-500/40';
  
  const displayName = language === 'pt' ? translate(genreTranslations, genre.name) : genre.name;

  return (
    <span className={`${baseClasses} ${colorClasses}`} onClick={() => onToggle(genre.name)}>
      {genre.mode === 'exclude' ? '− ' : '+ '}{displayName}
    </span>
  );
}

interface GenreFilterClientProps {
  allGenres: string[];
}

export default function GenreFilterClient({ allGenres }: GenreFilterClientProps) {
  const { genres: selectedGenres, toggleGenre, language } = useFilterStore();
  const [search, setSearch] = useState('');

  const filteredGenres = allGenres
    .filter(g => 
        g.toLowerCase().includes(search.toLowerCase()) ||
        (language === 'pt' && translate(genreTranslations, g).toLowerCase().includes(search.toLowerCase()))
    )
    .slice(0, 15);

  return (
    <div className="border-t border-gray-700 pt-4">
      <label className="block text-sm font-medium text-text-secondary mb-1">
        {language === 'pt' ? 'Gêneros' : 'Genres'}
      </label>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedGenres.map(g => <GenrePill key={g.name} genre={g} onToggle={toggleGenre} />)}
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={language === 'pt' ? 'Buscar gênero...' : 'Search genre...'}
        className="w-full bg-background border border-gray-600 rounded-md px-3 py-1.5 text-sm mb-2 focus:ring-1 focus:ring-primary focus:outline-none"
      />

      <div className="max-h-40 overflow-y-auto pr-2">
        <div className="flex flex-wrap gap-2">
          {filteredGenres.map((genre) => {
            const isSelected = selectedGenres.find(g => g.name === genre);
            if (isSelected) return null;

            const displayName = language === 'pt' ? translate(genreTranslations, genre) : genre;
            return (
              <span
                key={genre}
                onClick={() => toggleGenre(genre)}
                className="px-2 py-1 text-xs bg-gray-700 text-text-secondary rounded-full cursor-pointer hover:bg-primary hover:text-white"
              >
                + {displayName}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}