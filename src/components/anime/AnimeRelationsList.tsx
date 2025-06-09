// src/components/anime/AnimeRelationsList.tsx
'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import * as Tooltip from '@radix-ui/react-tooltip';
import { AnimeDetails } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { translateRelationType, translateAnimeFormat } from '@/lib/translations';

type RelationEdge = AnimeDetails['relations']['edges'][0];

interface AnimeRelationsListProps {
  relations: RelationEdge[];
}

// CORRIGIDO: Adicionado um conjunto de formatos que consideramos como "Anime"
const ANIME_FORMATS = new Set([
  'TV',
  'TV_SHORT',
  'MOVIE',
  'SPECIAL',
  'OVA',
  'ONA',
  'MUSIC'
]);

const RELATION_ORDER: Record<string, number> = {
  SOURCE: 1, PREQUEL: 2, SEQUEL: 3, PARENT: 4, SIDE_STORY: 5,
  SPIN_OFF: 6, ALTERNATIVE: 7, SUMMARY: 8, CHARACTER: 9, OTHER: 10,
};

export default function AnimeRelationsList({ relations }: AnimeRelationsListProps) {
  const { language } = useFilterStore();

  const groupedRelations = useMemo(() => {
    if (!relations) return {};
    // CORRIGIDO: Filtrar relações que não têm um 'node' válido
    return relations
      .filter(edge => edge.node)
      .reduce((acc, edge) => {
        const type = edge.relationType;
        if (!acc[type]) acc[type] = [];
        acc[type].push(edge.node);
        return acc;
      }, {} as Record<string, any[]>);
  }, [relations]);

  const sortedGroupedRelations = Object.entries(groupedRelations).sort((a, b) => {
    const orderA = RELATION_ORDER[a[0]] || 99;
    const orderB = RELATION_ORDER[b[0]] || 99;
    return orderA - orderB;
  });

  return (
    <div className="px-4 sm:px-6 lg:px-8 mt-8">
      <h3 className="text-xl font-bold text-text-main mb-4 border-t border-surface pt-6">
        {language === 'pt' ? 'Relações' : 'Relations'}
      </h3>
      
      <div className="space-y-4">
        {sortedGroupedRelations.map(([relationType, animes]) => (
          <div key={relationType}>
            <h4 className="text-md font-bold text-amber-400 mb-2">
              {translateRelationType(relationType, language)}
            </h4>
            
            <ul className="pl-4 space-y-1.5">
              {animes.map((anime) => {
                // CORRIGIDO: Verifica se o formato é de um anime
                const isAnime = ANIME_FORMATS.has(anime.format);

                if (isAnime) {
                  // Se for um anime, renderiza o link clicável com Tooltip
                  return (
                    <li key={anime.id} className="text-sm">
                      <Tooltip.Provider delayDuration={150}>
                        <Tooltip.Root>
                          <Tooltip.Trigger asChild>
                            <Link
                              href={`/?anime=${anime.id}`}
                              scroll={false}
                              className="text-text-main hover:text-primary transition-colors"
                            >
                              {anime.title.romaji}
                              <span className="text-text-secondary ml-2">
                                ({translateAnimeFormat(anime.format, language)})
                              </span>
                            </Link>
                          </Tooltip.Trigger>
                          <Tooltip.Portal>
                            <Tooltip.Content 
                              sideOffset={10} 
                              className="bg-black/80 p-1 rounded-lg shadow-2xl z-50 animate-fade-in border border-slate-700"
                            >
                              <div className="w-40 h-60 relative rounded-md overflow-hidden">
                                <Image
                                  src={anime.coverImage.extraLarge}
                                  alt={`Capa de ${anime.title.romaji}`}
                                  fill
                                  sizes="160px"
                                  className="object-cover"
                                />
                              </div>
                              <Tooltip.Arrow className="fill-black/80" />
                            </Tooltip.Content>
                          </Tooltip.Portal>
                        </Tooltip.Root>
                      </Tooltip.Provider>
                    </li>
                  );
                } else {
                  // Se NÃO for um anime, renderiza como texto simples não clicável
                  return (
                    <li key={anime.id} className="text-sm">
                      <span className="text-text-secondary cursor-not-allowed" title="Formato não suportado para visualização">
                        {anime.title.romaji}
                        <span className="ml-2">
                          ({translateAnimeFormat(anime.format, language)})
                        </span>
                      </span>
                    </li>
                  );
                }
              })}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}