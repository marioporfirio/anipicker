'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect, Fragment, useRef } from 'react';
import { Anime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';
import { translate, genreTranslations } from '@/lib/translations';
import { Transition } from '@headlessui/react';
import clsx from 'clsx';

function RankEditor({ rank, animeId, listId, maxRank }: { rank: number; animeId: number; listId: string; maxRank: number; }) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(rank.toString());
  const { moveAnimeToPosition } = useUserListStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const getRankColor = (r: number) => {
    if (r === 1) return 'bg-yellow-400 text-black shadow-lg shadow-yellow-400/30';
    if (r === 2) return 'bg-gray-300 text-black shadow-lg shadow-gray-300/30';
    if (r === 3) return 'bg-orange-400 text-black shadow-lg shadow-orange-400/30';
    if (r <= 10) return 'bg-blue-500 text-white';
    if (r <= 25) return 'bg-purple-500 text-white';
    return 'bg-gray-700 text-white';
  };

  const handleSubmit = () => {
    // >> INÍCIO DA CORREÇÃO <<
    const newRank = parseInt(inputValue, 10);
    if (!isNaN(newRank) && newRank >= 1 && newRank <= maxRank) {
      // Passa o newRank (base 1) diretamente para a função da store.
      // A store agora é responsável por converter para o índice (base 0).
      moveAnimeToPosition(listId, animeId, newRank);
    }
    // >> FIM DA CORREÇÃO <<
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') setIsEditing(false);
  };

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
        onBlur={handleSubmit}
        onKeyDown={handleKeyDown}
        className="absolute top-2 left-2 z-20 w-10 h-8 text-center bg-surface border border-primary rounded-md text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-primary"
      />
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsEditing(true); }}
      className={clsx(
        "absolute top-2 left-2 z-20 w-10 h-8 flex items-center justify-center rounded-md font-bold text-lg transition-transform hover:scale-110",
        getRankColor(rank)
      )}
    >
      {rank}
    </button>
  );
}

function AddToListMenu({ animeId }: { animeId: number; }) {
    const { customLists, toggleAnimeInList, isAnimeInList } = useUserListStore();
    const [isOpen, setIsOpen] = useState(false);
    const timeoutId = useRef<NodeJS.Timeout | null>(null);

    const handleEnter = () => { if (timeoutId.current) clearTimeout(timeoutId.current); setIsOpen(true); };
    const handleLeave = () => { timeoutId.current = setTimeout(() => setIsOpen(false), 200); };
    
    useEffect(() => () => { if (timeoutId.current) clearTimeout(timeoutId.current); }, []);

    const buttonClasses = "p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all duration-200 focus:outline-none bg-black/50 hover:bg-green-500/80";

    return (
        <div onMouseEnter={handleEnter} onMouseLeave={handleLeave} className="relative">
            <button className={buttonClasses} aria-label="Adicionar a uma lista"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg></button>
            <Transition as={Fragment} show={isOpen} enter="transition ease-out duration-100" enterFrom="transform opacity-0 scale-95" enterTo="transform opacity-100 scale-100" leave="transition ease-in duration-75" leaveFrom="transform opacity-100 scale-100" leaveTo="transform opacity-0 scale-95"><div className="absolute left-0 mt-2 w-56 origin-top-left z-20"><div className="overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5"><div className="relative flex flex-col bg-surface p-1">{customLists.filter(l => l.id !== 'favorites').map(list => {const isInList = isAnimeInList(list.id, animeId);return (<button key={list.id} onClick={(e) => {e.preventDefault();e.stopPropagation();toggleAnimeInList(list.id, animeId);}} className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-sm transition-colors flex items-center justify-between ${isInList ? 'bg-primary/20 text-primary' : 'text-text-secondary hover:bg-primary/20 hover:text-primary'}`}><span className="truncate">{list.name}</span>{isInList && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}</button>);})}{customLists.filter(l => l.id !== 'favorites').length === 0 && (<div className="px-3 py-2 text-sm text-text-secondary text-center">Nenhuma lista criada.</div>)}</div></div></div></Transition>
        </div>
    );
}

const getScoreColor = (score: number | null) => { if (score === null) return 'bg-gray-600'; if (score >= 75) return 'bg-green-500'; if (score >= 60) return 'bg-yellow-500'; return 'bg-red-500'; };
const statusColors: Record<ListStatus, string> = { WATCHING: 'border-green-500', COMPLETED: 'border-blue-500', PLANNED: 'border-yellow-500', DROPPED: 'border-red-500', PAUSED: 'border-purple-500', SKIPPING: 'border-gray-600' };

interface AnimeCardProps {
  anime: Anime;
  priority: boolean;
  rank: number;
  maxRank: number;
  isRanked: boolean;
  activeListId?: string | null;
}

export default function AnimeCard({ anime, priority = false, rank, maxRank, isRanked, activeListId }: AnimeCardProps) {
  const language = useFilterStore((state) => state.language);
  const { isAnimeInList, toggleAnimeInList, getAnimeStatus } = useUserListStore();
  
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isFavorite = isMounted ? isAnimeInList('favorites', anime.id) : false;
  const animeStatus = isMounted ? getAnimeStatus(anime.id) : null;
  
  const mainStudio = anime.studios.nodes[0]?.name;
  const borderColorClass = animeStatus ? statusColors[animeStatus] : 'border-transparent';

  const translatedSeason = (season: string, year: number) => {
    if (language === 'en') return `${season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()} ${year}`;
    const seasonPT: Record<string, string> = { WINTER: 'Inverno', SPRING: 'Primavera', SUMMER: 'Verão', FALL: 'Outono' };
    return `${seasonPT[season]} ${year}`;
  };

  const handleFavoriteClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); e.stopPropagation(); toggleAnimeInList('favorites', anime.id);
  };

  return (
    <Link
      href={`/?anime=${anime.id}`}
      scroll={false}
      prefetch={false}
      className={`group block bg-surface rounded-lg overflow-hidden transition-transform duration-300 hover:-translate-y-1`}
    >
      <div className={`relative w-full aspect-[2/3] rounded-lg overflow-hidden border-2 ${borderColorClass} transition-all duration-300 group-hover:shadow-2xl group-hover:shadow-primary/20`}>
        <Image src={anime.coverImage.extraLarge} alt={`Capa de ${anime.title.romaji}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 17vw" priority={priority} />
        
        <button 
          onClick={handleFavoriteClick}
          className={`absolute top-2 right-2 z-20 p-1.5 rounded-full transition-all duration-200  
            ${isFavorite 
              ? 'bg-red-500/80 text-white opacity-100 scale-110' 
              : 'bg-black/50 text-white opacity-0 group-hover:opacity-100 hover:bg-red-500/80'
            }`}
          aria-label={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            stroke="currentColor" 
            strokeWidth={isFavorite ? '0' : '2'} 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
          </svg>
        </button>
        
        <div className="absolute top-0 left-0 z-10">
          {isRanked && activeListId ? ( <RankEditor rank={rank} animeId={anime.id} listId={activeListId} maxRank={maxRank} /> ) : ( <AddToListMenu animeId={anime.id} /> )}
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 text-white">
          <div className='space-y-2 drop-shadow-lg'>
            {anime.averageScore && (<span className={`text-xs font-bold px-2 py-1 rounded-full ${getScoreColor(anime.averageScore)}`}>{language === 'pt' ? 'Nota' : 'Score'}: {anime.averageScore}</span>)}
            <h4 className="font-bold text-lg leading-tight">{anime.title.romaji}</h4>
            <div className='text-xs text-gray-300 space-y-1'>
              <p>{anime.episodes ? `${anime.episodes} episódios` : 'Episódios: TBA'}{anime.season && anime.seasonYear ? ` • ${translatedSeason(anime.season, anime.seasonYear)}` : ''}</p>
              {mainStudio && <p>Estúdio: {mainStudio}</p>}
            </div>
            {anime.genres.length > 0 && (<div className="flex flex-wrap gap-1 pt-1">{anime.genres.slice(0, 3).map(genre => (<span key={genre} className="text-xs bg-white/20 px-1.5 py-0.5 rounded">{language === 'pt' ? translate(genreTranslations, genre) : genre}</span>))}</div>)}
          </div>
        </div>
      </div>
    </Link>
  );
}