// =================================================================
// ============== ARQUIVO: src/components/GenreFilterClient.tsx ==============
// =================================================================
'use client';

import { useFilterStore, Selection } from '@/store/filterStore';
import { translate, genreTranslations } from '@/lib/translations';

function GenrePill({ genre, onToggle }: { genre: Selection, onToggle: (name: string) => void }) {
  const language = useFilterStore((state) => state.language);
  const baseClasses = "flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors";
  const colorClasses = genre.mode === 'include'
    ? 'bg-primary/80 text-black hover:bg-primary'
    : 'bg-red-500/80 text-white hover:bg-red-500';
  
  const displayName = language === 'pt' ? translate(genreTranslations, genre.name) : genre.name;

  return (
    <button type="button" className={`${baseClasses} ${colorClasses}`} onClick={() => onToggle(genre.name)}>
      {genre.mode === 'exclude' ? 
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        : 
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      }
      {displayName}
    </button>
  );
}

interface GenreFilterClientProps {
  allGenres: string[];
}

export default function GenreFilterClient({ allGenres }: GenreFilterClientProps) {
  const { genres: selectedGenres, toggleGenre, language } = useFilterStore();

  return (
    <div className="border-t border-gray-700 pt-4">
      <label className="block text-sm font-medium text-text-secondary mb-2">
        {language === 'pt' ? 'Gêneros' : 'Genres'}
      </label>

      {selectedGenres.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedGenres.map(g => <GenrePill key={g.name} genre={g} onToggle={toggleGenre} />)}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {allGenres.map((genre) => {
          const isSelected = selectedGenres.find(g => g.name === genre);
          if (isSelected) return null;

          const displayName = language === 'pt' ? translate(genreTranslations, genre) : genre;
          return (
            <button
              type="button"
              key={genre}
              onClick={() => toggleGenre(genre)}
              className="px-2 py-1 text-xs bg-gray-700 text-text-secondary rounded-full cursor-pointer hover:bg-accent/20 hover:text-accent flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {displayName}
            </button>
          );
        })}
      </div>
    </div>
  );
}