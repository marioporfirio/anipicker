// =================================================================
// ============== ARQUIVO: src/pages/[animeId]/AnimeHero.tsx =======
// =================================================================
'use client';
import React, { Fragment, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';
import { AnimeDetails } from '@/lib/anilist';
import {
  translate,
  genreTranslations,
  tagTranslations,
  sourceOptionTranslations,
  translateAnimeFormat,
  translateMediaStatus,
  listButtonConfig,
  statusConfig // Importar a configuração centralizada
} from '@/lib/translations';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';
import { Popover, Transition } from '@headlessui/react';
import { toast } from 'react-hot-toast';

interface SmartStarRatingProps {
  animeId: number;
}
const SmartStarRating: React.FC<SmartStarRatingProps> = ({ animeId }) => {
  const { getRating, setRating } = useUserListStore();
  const [hoverRating, setHoverRating] = useState(0);
  const currentRating = getRating(animeId) || 0;
  const displayRating = hoverRating || currentRating;

  const handleClick = (rating: number) => setRating(animeId, rating);
  const handleMouseLeave = () => setHoverRating(0);

  const getColor = (value: number) => {
    if (value <= 2) return 'text-red-500';
    if (value <= 4) return 'text-orange-400';
    if (value <= 6) return 'text-yellow-400';
    if (value <= 8) return 'text-lime-500';
    return 'text-green-500';
  };

  const handleStarClick = (i: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
    const rating = (i + 1) - (isLeftHalf ? 0.5 : 0);
    handleClick(rating);
  };
  const handleStarHover = (i: number, e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const isLeftHalf = (e.clientX - rect.left) < rect.width / 2;
    const hoverValue = (i + 1) - (isLeftHalf ? 0.5 : 0);
    setHoverRating(hoverValue);
  };
  const getStarFill = (i: number) => {
    const starValue = i + 1;
    if (displayRating >= starValue) return 100;
    if (displayRating >= starValue - 0.5) return 50;
    return 0;
  };

  return (
    <div className="flex items-center gap-2 mt-4">
      <div className="flex gap-1" onMouseLeave={handleMouseLeave}>
        {Array.from({ length: 10 }, (_, i) => (
          <button
            key={i}
            className="relative w-6 h-6 transition-transform hover:scale-110 cursor-pointer group"
            onClick={(e) => handleStarClick(i, e)}
            onMouseMove={(e) => handleStarHover(i, e)}
          >
            <Star className="w-6 h-6 text-gray-600 transition-colors group-hover:text-gray-500" />
            <div
              className="absolute inset-0 overflow-hidden transition-all duration-200"
              style={{ width: `${getStarFill(i)}%` }}
            >
              <Star className={`w-6 h-6 transition-colors ${getColor(displayRating)} fill-current`} />
            </div>
            <div className="absolute inset-0 bg-yellow-400/20 rounded-full scale-0 group-hover:scale-150 transition-transform duration-200" />
          </button>
        ))}
      </div>
      {displayRating > 0 && (
        <span className="text-sm text-text-secondary font-medium min-w-[2.5rem]">
          {displayRating.toFixed(1)}/10
        </span>
      )}
    </div>
  );
};

// REMOVIDO: A definição local de statusConfig foi removida para usar a versão centralizada.
/*
const statusConfig: Record<ListStatus, { color: string; hoverColor: string; buttonColor: string }> = {
  WATCHING:   { color: 'bg-green-500 text-white',   hoverColor: 'hover:bg-green-500/20',   buttonColor: 'bg-green-500 text-white' },
  COMPLETED:  { color: 'bg-blue-500 text-white',    hoverColor: 'hover:bg-blue-500/20',    buttonColor: 'bg-blue-500 text-white' },
  PLANNED:    { color: 'bg-yellow-500 text-black',  hoverColor: 'hover:bg-yellow-500/20',  buttonColor: 'bg-yellow-500 text-black' },
  DROPPED:    { color: 'bg-red-500 text-white',     hoverColor: 'hover:bg-red-500/20',     buttonColor: 'bg-red-500 text-white' },
  PAUSED:     { color: 'bg-purple-500 text-white',  hoverColor: 'hover:bg-purple-500/20',  buttonColor: 'bg-purple-500 text-white' },
  SKIPPING:   { color: 'bg-gray-600 text-white',    hoverColor: 'hover:bg-gray-600/20',    buttonColor: 'bg-gray-600 text-white' },
};
*/

function ListManagementButtons({ animeId }: { animeId: number }) {
  const { language } = useFilterStore();
  const { getAnimeStatus, toggleStatus, customLists, isAnimeInList, toggleAnimeInList } = useUserListStore();
  const [isListMenuOpen, setIsListMenuOpen] = useState(false);
  const listMenuTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const currentStatus = getAnimeStatus(animeId);
  const isFavorite = isAnimeInList('favorites', animeId);

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => toast.success(language === 'pt' ? 'Link copiado!' : 'Link copied!'))
      .catch(() => toast.error(language === 'pt' ? 'Não foi possível copiar o link.' : 'Failed to copy link.'));
  };

  const handleListMenuEnter = () => {
    if (listMenuTimeoutId.current) clearTimeout(listMenuTimeoutId.current);
    setIsListMenuOpen(true);
  };
  const handleListMenuLeave = () => {
    listMenuTimeoutId.current = setTimeout(() => setIsListMenuOpen(false), 200);
  };
  useEffect(() => () => {
    if (listMenuTimeoutId.current) clearTimeout(listMenuTimeoutId.current);
  }, []);

  return (
    <div className="flex flex-col items-start">
      <div className="flex flex-wrap items-center gap-3 mt-4">
        <div className="flex items-center bg-surface rounded-lg p-1 gap-1 flex-wrap">
          {listButtonConfig.map(({ label, status }) => {
            if (status === 'SKIPPING') return null;
            const isActive = currentStatus === status;
            return (
              <button
                key={status}
                onClick={() => toggleStatus(animeId, status)}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${isActive
                    ? `${statusConfig[status].buttonColor} ${statusConfig[status].textColor} shadow-md scale-105`
                    : 'bg-transparent text-text-secondary hover:bg-primary/20'
                  }`}
              >
                {label[language]}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => toggleAnimeInList('favorites', animeId)}
          title={language === 'pt' ? 'Favoritar' : 'Favorite'}
          className={`p-2.5 rounded-lg transition-all ${isFavorite
              ? 'bg-red-500/20 text-red-400 scale-110'
              : 'bg-surface text-text-secondary hover:bg-red-500/20 hover:text-red-400'
            }`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
        <div onMouseEnter={handleListMenuEnter} onMouseLeave={handleListMenuLeave} className="relative">
          <Popover>
            <Popover.Button as="div"
              className="p-2.5 rounded-lg bg-surface text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors cursor-pointer"
              title={language === 'pt' ? 'Adicionar a uma lista' : 'Add to a list'}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </Popover.Button>
            <Transition as={Fragment} show={isListMenuOpen}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Popover.Panel static className="absolute left-0 top-full mt-2 w-56 origin-top-left z-20">
                <div className="overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                  <div className="relative flex flex-col bg-gray-800 p-1">
                    {customLists.filter(l => l.id !== 'favorites').map(list => {
                      const isInList = isAnimeInList(list.id, animeId);
                      return (
                        <button key={list.id}
                          onClick={() => toggleAnimeInList(list.id, animeId)}
                          className={`w-full text-left px-3 py-1.5 text-sm font-semibold rounded-sm transition-colors flex items-center justify-between ${isInList ? 'bg-primary/20 text-primary' : 'hover:bg-surface'
                            }`}
                        >
                          <span>{list.name}</span>
                          {isInList && (
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                              viewBox="0 0 24 24" fill="none" stroke="currentColor"
                              strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Popover.Panel>
            </Transition>
          </Popover>
        </div>
        <button
          onClick={handleShareClick}
          title={language === 'pt' ? 'Compartilhar' : 'Share'}
          className="p-2.5 rounded-lg bg-surface text-text-secondary hover:bg-primary/20 hover:text-primary transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="18" cy="5" r="3"></circle>
            <circle cx="6" cy="12" r="3"></circle>
            <circle cx="18" cy="19" r="3"></circle>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
          </svg>
        </button>
      </div>
      <SmartStarRating animeId={animeId} />
    </div>
  );
}

interface AnimeHeroProps {
  anime: AnimeDetails;
}

export default function AnimeHero({ anime }: AnimeHeroProps) {
  const language = useFilterStore(state => state.language);
  const accentColor = anime.coverImage.color || '#38bdf8';
  const mainStudio = anime.studios?.nodes?.find(s => s.id);
  const topTags = anime.tags ? [...anime.tags].sort((a, b) => b.rank - a.rank).slice(0, 5) : [];
  const translatedSeason = (season: string | null | undefined, year: number | null | undefined) => {
    if (language === 'en' || !season) {
      if (!season) return `${year}`;
      return `${season.charAt(0) + season.slice(1).toLowerCase()} ${year}`;
    }
    const seasonPT: Record<string, string> = {
      WINTER: 'Inverno',
      SPRING: 'Primavera',
      SUMMER: 'Verão',
      FALL: 'Outono'
    };
    return `${seasonPT[season] || season} ${year}`;
  };

  return (
    <div>
      <div className="h-48 md:h-64 w-full relative">
        {anime.bannerImage ? (
          <Image
            src={anime.bannerImage}
            alt={`Banner de ${anime.title.romaji}`}
            fill
            className="object-cover"
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>
      <div className="container mx-auto px-4 md:px-8 relative -mt-24 md:-mt-32 pb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-end">
          <div className="w-32 md:w-48 flex-shrink-0">
            <div
              className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl"
              style={{ outline: `3px solid ${accentColor}` }}
            >
              <Image
                src={anime.coverImage.extraLarge}
                alt={`Capa de ${anime.title.romaji}`}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 767px) 128px, 192px"
              />
            </div>
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl md:text-4xl font-bold text-text-main drop-shadow-lg">
              {anime.title.romaji}
            </h1>
            {anime.title.english && (
              <h2 className="text-lg md:text-xl text-text-secondary -mt-1">
                {anime.title.english}
              </h2>
            )}
            {anime.title.native && (
              <h3 className="text-md text-text-secondary/70">
                {anime.title.native}
              </h3>
            )}
            <ListManagementButtons animeId={anime.id} />
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-surface p-4 rounded-lg shadow-md space-y-3 text-sm">
              {anime.averageScore != null && anime.averageScore > 0 && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Nota Média:' : 'Score:'}</strong> {anime.averageScore} / 100
                </div>
              )}
              {anime.popularity != null && anime.popularity > 0 && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Popularidade:' : 'Popularity:'}</strong> {anime.popularity.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')} {language === 'pt' ? 'usuários' : 'users'}
                </div>
              )}
              {anime.format && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Formato:' : 'Format:'}</strong> {translateAnimeFormat(anime.format, language)}
                </div>
              )}
              {anime.status && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Status:' : 'Status:'}</strong> {translateMediaStatus(anime.status, language)}
                </div>
              )}
              {anime.episodes && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Episódios:' : 'Episodes:'}</strong> {anime.episodes}
                </div>
              )}
              {anime.duration && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Duração:' : 'Duration:'}</strong> {anime.duration} min/ep
                </div>
              )}
              {anime.season && anime.seasonYear && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Temporada:' : 'Season:'}</strong> {translatedSeason(anime.season, anime.seasonYear)}
                </div>
              )}
              {anime.source && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Fonte:' : 'Source:'}</strong> {sourceOptionTranslations[anime.source]?.[language] || sourceOptionTranslations[anime.source]?.['pt'] || anime.source.replace(/_/g, ' ')}
                </div>
              )}
              {mainStudio && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong>{language === 'pt' ? 'Estúdio:' : 'Studio:'}</strong>{' '}
                  <Link
                    href={`?anime=${anime.id}&studioId=${mainStudio.id}&studioName=${encodeURIComponent(mainStudio.name)}`}
                    scroll={false}
                    className="hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                  >
                    {mainStudio.name}
                  </Link>
                </div>
              )}
              {anime.genres?.length > 0 && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong className="block mb-1">{language === 'pt' ? 'Gêneros:' : 'Genres:'}</strong>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map(genre => (
                      <span key={genre} className="bg-background px-2 py-1 rounded-full text-xs">
                        {language === 'pt' ? translate(genreTranslations, genre) : genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {topTags.length > 0 && (
                <div style={{ borderColor: accentColor }} className="border-l-4 pl-3">
                  <strong className="block mb-1">{language === 'pt' ? 'Tags Principais:' : 'Top Tags:'}</strong>
                  <div className="flex flex-wrap gap-2">
                    {topTags.map(tag => (
                      <span key={tag.name} className="bg-background px-2 py-1 rounded-full text-xs">
                        {language === 'pt' ? translate(tagTranslations, tag.name) : tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="lg:col-span-3">
            <h3 className="text-xl font-semibold mb-2">
              {language === 'pt' ? 'Sinopse' : 'Synopsis'}
            </h3>
            <div
              className="prose prose-sm prose-invert text-text-secondary max-w-none"
              dangerouslySetInnerHTML={{ __html: anime.description || '' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}