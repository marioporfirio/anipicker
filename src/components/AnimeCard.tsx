// =================================================================
// ============== ARQUIVO: src/components/AnimeCard.tsx ==============
// =================================================================
'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Anime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';
import { translate, genreTranslations } from '@/lib/translations';
import { Transition } from '@headlessui/react';
import clsx from 'clsx'; // Importar clsx para facilitar a condicional de classes

function AddToListMenu({ animeId }: { animeId: number }) {
    const { customLists, toggleAnimeInList, isAnimeInList } = useUserListStore();
    const [isOpen, setIsOpen] = useState(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const handleEnter = () => {
        if (timeoutId.current) {
            clearTimeout(timeoutId.current);
        }
        setIsOpen(true);
    };

    const handleLeave = () => {
        timeoutId.current = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };
    
    useEffect(() => {
        return () => {
            if (timeoutId.current) {
                clearTimeout(timeoutId.current);
            }
        };
    }, []);

    const buttonClasses = clsx(
        "p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        {
            'bg-green-500/80': isOpen,
            'bg-black/50 hover:bg-green-500/80': !isOpen,
        }
    );

    return (
        <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="relative">
            <button className={buttonClasses} aria-label="Adicionar a uma lista">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
            <Transition
                as={Fragment}
                show={isOpen}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <div className="absolute left-0 mt-2 w-56 origin-top-left z-20">
                    <div className="overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="relative flex flex-col bg-surface p-1">
                            {customLists.filter(l => l.id !== 'favorites').map(list => {
                                const isInList = isAnimeInList(list.id, animeId);
                                return (
                                    <button
                                        key={list.id}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            toggleAnimeInList(list.id, animeId);
                                        }}
                                        className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-sm transition-colors flex items-center justify-between ${isInList ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-primary/20 hover:text-primary'}`}
                                    >
                                        <span className="truncate">{list.name}</span>
                                        {isInList && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </button>
                                );
                            })}
                            {customLists.filter(l => l.id !== 'favorites').length === 0 && (
                                <div className="px-3 py-2 text-sm text-text-secondary text-center">Nenhuma lista criada.</div>
                            )}
                        </div>
                    </div>
                </div>
            </Transition>
        </div>
    );
}

const getScoreColor = (score: number | null) => {
  if (score === null) return 'bg-gray-600';
  if (score >= 75) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

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
  const { isAnimeInList, toggleAnimeInList, getAnimeStatus } = useUserListStore();
  const isFavorite = isAnimeInList('favorites', anime.id);
  const animeStatus = getAnimeStatus(anime.id);

  const mainStudio = anime.studios.nodes[0]?.name;
  const borderColorClass = animeStatus ? statusColors[animeStatus] : 'border-transparent';

  const translatedSeason = (season: string, year: number) => {
    if (language === 'en') {
      const formattedSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase();
      return `${formattedSeason} ${year}`;
    }
    const seasonPT: Record<string, string> = {
      WINTER: 'Inverno',
      SPRING: 'Primavera',
      SUMMER: 'Verão',
      FALL: 'Outono',
    };
    return `${seasonPT[season]} ${year}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    toggleAnimeInList('favorites', anime.id);
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
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-all duration-200  
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

        <div className="absolute top-2 left-2 z-10">
          <AddToListMenu animeId={anime.id} />
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
          <div className='space-y-2 drop-shadow-lg'>
            {anime.averageScore && (
              <span className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreColor(anime.averageScore)}`}>
                {language === 'pt' ? 'Nota' : 'Score'}: {anime.averageScore}
              </span>
            )}
            <h4 className="font-bold text-lg leading-tight">
              {anime.title.romaji}
            </h4>
            <div className='text-xs text-gray-300 space-y-1'>
              <p>
                {anime.episodes ? `${anime.episodes} episódios` : 'Episódios: TBA'}
                {anime.season && anime.seasonYear ? ` • ${translatedSeason(anime.season, anime.seasonYear)}` : ''}
              </p>
              {mainStudio && <p>Estúdio: {mainStudio}</p>}
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