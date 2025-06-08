// src/components/AnimeRelationsModal.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useFilterStore } from '@/store/filterStore';

interface RelatedAnime {
  id: number;
  title: { romaji: string; english?: string; };
  coverImage: { extraLarge: string; color?: string; };
  type?: string;
  format?: string;
  status?: string;
}

interface RelationEdge {
  relationType: string;
  anime: RelatedAnime;
}

interface AnimeRelationsModalProps {
  animeId: number | null; // Allow null to handle initial state or no selection
  animeTitle: string | null;
  onClose: () => void;
}

export default function AnimeRelationsModal({ animeId, animeTitle, onClose }: AnimeRelationsModalProps) {
  const [relations, setRelations] = useState<RelationEdge[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { language } = useFilterStore();

  useEffect(() => {
    if (!animeId) {
      setIsLoading(false);
      setRelations(null);
      setError(null);
      return;
    }

    const fetchRelations = async () => {
      setIsLoading(true);
      setError(null);
      setRelations(null);
      try {
        const response = await fetch(`/api/anime/${animeId}/relations`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `Error: ${response.status}` }));
          throw new Error(errorData.message || `Error fetching relations: ${response.status}`);
        }
        const data: RelationEdge[] = await response.json();
        setRelations(data);
      } catch (err: any) {
        setError(err.message || (language === 'pt' ? 'Falha ao buscar relações.' : 'Failed to fetch relations.'));
        console.error('Fetch relations error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelations();
  }, [animeId, language]);

  const groupedRelations = useMemo(() => {
    if (!relations) return {};
    return relations.reduce((acc, relation) => {
      const type = relation.relationType;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(relation.anime);
      return acc;
    }, {} as Record<string, RelatedAnime[]>);
  }, [relations]);

  const formatRelationType = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleModalContentClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (!animeId || !animeTitle) { // Don't render if no animeId or title (modal not active)
    return null;
  }

  return (
    <div 
      onClick={handleOverlayClick} 
      className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/70 animate-fade-in p-4 pt-16 md:pt-24"
    >
      <div 
        onClick={handleModalContentClick} 
        className="w-full max-w-screen-lg bg-background rounded-lg shadow-2xl relative animate-slide-up"
      >
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors"
          aria-label={language === 'pt' ? 'Fechar modal' : 'Close modal'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-primary mb-6">
            {language === 'pt' ? `Relações para ${animeTitle}` : `Relations for ${animeTitle}`}
          </h2>

          <div className="max-h-[70vh] overflow-y-auto pr-2"> {/* Added pr-2 for scrollbar spacing */}
            {isLoading && (
              <p className="text-text-secondary text-center py-10">
                {language === 'pt' ? 'Carregando relações...' : 'Loading relations...'}
              </p>
            )}

            {!isLoading && error && (
              <p className="text-red-500 text-center py-10">
                {language === 'pt' ? 'Erro: ' : 'Error: '} {error}
              </p>
            )}

            {!isLoading && !error && relations && relations.length === 0 && (
              <p className="text-text-secondary text-center py-10">
                {language === 'pt' ? 'Nenhuma relação encontrada para este anime.' : 'No relations found for this anime.'}
              </p>
            )}

            {!isLoading && !error && relations && relations.length > 0 && (
              Object.entries(groupedRelations).map(([relationType, animesInGroup]) => (
                <section key={relationType} className="mb-6 last:mb-0">
                  <h3 className="text-xl font-semibold text-text-secondary mt-4 mb-3 first:mt-0">
                    {formatRelationType(relationType)}
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {animesInGroup.map((anime) => (
                      <Link 
                        href={`/?anime=${anime.id}`} 
                        scroll={false} 
                        key={anime.id}
                        onClick={onClose} // Close current modal when navigating to another anime
                        className="bg-surface p-2 rounded-lg flex flex-col items-center gap-1 group block text-center transition-colors hover:bg-gray-800"
                      >
                        <div className="w-24 h-36 relative rounded overflow-hidden shadow-md">
                          <Image 
                            src={anime.coverImage.extraLarge} 
                            alt={anime.title.romaji} 
                            fill 
                            className="object-cover" 
                            sizes="96px" // w-24 is 6rem = 96px
                          />
                        </div>
                        <p className="text-xs mt-1.5 text-text-main group-hover:text-primary truncate w-full">
                          {anime.title.romaji}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
