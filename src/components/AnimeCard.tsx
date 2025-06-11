// src/components/AnimeCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { Anime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';
import { translate, genreTranslations } from '@/lib/translations';

const getScoreColor = (score: number | null) => {
  if (score === null) return 'bg-gray-600';
  if (score >= 75) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

// CORREÇÃO: Adicionada a cor para o novo status 'SKIPPING'
const statusColors: Record<ListStatus, string> = {
  WATCHING: 'border-green-500',
  COMPLETED: 'border-blue-500',
  PLANNED: 'border-yellow-500',
  DROPPED: 'border-red-500',
  PAUSED: 'border-purple-500',
  SKIPPING: 'border-gray-600', 
};

interface AnimeCardProps {
  anime: Anime;
  priority?: boolean;
}

export default function AnimeCard({ anime, priority = false }: AnimeCardProps) {
  const language = useFilterStore((state) => state.language);
  const { favorites, toggleFavorite, getAnimeStatus } = useUserListStore();
  const isFavorite = favorites.includes(anime.id);
  const animeStatus = getAnimeStatus(anime.id);

  const mainStudio = anime.studios.nodes[0]?.name;
  const borderColorClass = animeStatus ? statusColors[animeStatus] : 'border-transparent';

  const seasonLabel = language === 'pt' ? 'Temporada' : 'Season';
  const scoreLabel = language === 'pt' ? 'Nota' : 'Score';
  const episodesLabel = language === 'pt' ? 'episódios' : 'episodes';
  const episodesTBALabel = language === 'pt' ? 'Episódios: A ser anunciado' : 'Episodes: TBA';
  const studioLabel = language === 'pt' ? 'Estúdio' : 'Studio';

  const translatedSeason = (season: string, year: number) => {
    if (language === 'en') {
      const formattedSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
      return `${formattedSeason} ${year}`;
    }
    const seasonPT = {
      WINTER: 'Inverno',
      SPRING: 'Primavera',
      SUMMER: 'Verão',
      FALL: 'Outono',
    }[season];
    return `${seasonPT} ${year}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(anime.id);
  };

  return (
    <Link
      href={`/?anime=${anime.id}`}
      scroll={false}
      prefetch={false}
      className={`group block bg-surface rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1 border-2 ${borderColorClass}`}
    >
      <div className="relative w-full aspect-[2/3]">
        <Image
          src={anime.coverImage.extraLarge}
          alt={`Capa de ${anime.title.romaji}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 17vw"
          priority={priority}
        />

        <button 
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 z-10 p-1.5 rounded-full transition-all duration-200 
            ${isFavorite 
              ? 'bg-red-500/80 text-white opacity-100 scale-110' 
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80'
            }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth={isFavorite ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
          <div className='space-y-2 drop-shadow-lg'>
            {anime.averageScore && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreColor(anime.averageScore)}`}>
                {scoreLabel}: {anime.averageScore}
              </span>
            )}
            <h4 className="font-bold text-lg leading-tight">
              {anime.title.romaji}
            </h4>
            <div className='text-xs text-gray-300 space-y-1'>
              <p>
                {anime.episodes ? `${anime.episodes} ${episodesLabel}` : episodesTBALabel}
                {anime.season && anime.seasonYear ? ` • ${translatedSeason(anime.season, anime.seasonYear)}` : ''}
              </p>
              {mainStudio && <p>{studioLabel}: {mainStudio}</p>}
            </div>
            {anime.genres.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {anime.genres.slice(0, 3).map(genre => (
                  <span key={genre} className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                    {language === 'pt' ? translate(genreTranslations, genre) : genre}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}