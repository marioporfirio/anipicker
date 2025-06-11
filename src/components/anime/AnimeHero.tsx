// src/components/anime/AnimeHero.tsx
import Image from 'next/image';
import Link from 'next/link';
import { AnimeDetails } from '@/lib/anilist';
import { translate, genreTranslations, tagTranslations, sourceOptionTranslations, translateAnimeFormat, translateMediaStatus, listButtonConfig } from '@/lib/translations';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';

const listStatusColors: Record<ListStatus, string> = {
  WATCHING: 'bg-green-500 text-white',
  COMPLETED: 'bg-blue-500 text-white',
  PLANNED: 'bg-yellow-500 text-black',
  DROPPED: 'bg-red-500 text-white',
  PAUSED: 'bg-purple-500 text-white',
  SKIPPING: 'bg-gray-600 text-white',
};

function ListManagementButtons({ animeId }: { animeId: number }) {
  const { language } = useFilterStore();
  const { getAnimeStatus, toggleListStatus, favorites, toggleFavorite } = useUserListStore();

  const currentStatus = getAnimeStatus(animeId);
  const isFavorite = favorites.includes(animeId);

  const favoriteLabel = isFavorite 
    ? (language === 'pt' ? 'Favorito' : 'Favorite')
    : (language === 'pt' ? 'Favoritar' : 'Add to Favorites');

  return (
    <div className="flex flex-wrap items-center gap-3 mt-4">
      <div className="flex items-center bg-surface rounded-lg p-1 gap-1 flex-wrap">
        {listButtonConfig.map(({ label, status }) => {
          const isActive = currentStatus === status;
          return (
            <button
              key={status}
              onClick={() => toggleListStatus(animeId, status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                isActive 
                  // CORREÇÃO: Usa a cor do status quando ativo
                  ? `${listStatusColors[status]} shadow-md scale-105` 
                  : 'bg-transparent text-text-secondary hover:bg-primary/20'
              }`}
            >
              {label[language]}
            </button>
          )
        })}
      </div>
      <button 
        onClick={() => toggleFavorite(animeId)}
        title={favoriteLabel}
        className={`p-2.5 rounded-lg transition-all ${
          isFavorite 
            ? 'bg-red-500/20 text-red-400 scale-110' 
            : 'bg-surface text-text-secondary hover:bg-red-500/20 hover:text-red-400'
        }`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
        </svg>
      </button>
    </div>
  );
}


interface AnimeHeroProps {
  anime: AnimeDetails;
}

export default function AnimeHero({ anime }: AnimeHeroProps) {
  const language = useFilterStore((state) => state.language);
  const accentColor = anime.coverImage.color || '#38bdf8';
  const mainStudio = anime.studios?.nodes?.find(studio => studio.id);

  const topTags = anime.tags ? [...anime.tags].sort((a, b) => b.rank - a.rank).slice(0, 5) : [];

  const translatedSeason = (season: string, year: number) => {
    if (language === 'en' || !season) { if (!season) return `${year}`; const formattedSeason = season.charAt(0).toUpperCase() + season.slice(1).toLowerCase(); return `${formattedSeason} ${year}`; }
    const seasonPT: { [key: string]: string } = { 'WINTER': 'Inverno', 'SPRING': 'Primavera', 'SUMMER': 'Verão', 'FALL': 'Outono' };
    return `${seasonPT[season] || season} ${year}`;
  }

  return (
    <div>
      <div className="h-48 md:h-64 w-full relative">
        {anime.bannerImage ? ( <Image src={anime.bannerImage} alt={`Banner de ${anime.title.romaji}`} fill className="object-cover" priority sizes="(max-width: 1024px) 100vw, 1024px" /> ) : ( <div className="h-full w-full bg-surface" /> )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <div className="container mx-auto px-4 md:px-8 relative -mt-24 md:-mt-32 pb-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-end">
          <div className="w-32 md:w-48 flex-shrink-0">
            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-xl" style={{ outline: `3px solid ${accentColor}` }}>
              <Image src={anime.coverImage.extraLarge} alt={`Capa de ${anime.title.romaji}`} fill className="object-cover" priority sizes="(max-width: 767px) 128px, 192px" />
            </div>
          </div>
          <div className="flex-grow">
            <h1 className="text-2xl md:text-4xl font-bold text-text-main drop-shadow-lg">{anime.title.romaji}</h1>
            {anime.title.english && ( <h2 className="text-lg md:text-xl text-text-secondary -mt-1">{anime.title.english}</h2> )}
            {anime.title.native && ( <h3 className="text-md text-text-secondary/70">{anime.title.native}</h3> )}
            <ListManagementButtons animeId={anime.id} />
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-surface p-4 rounded-lg shadow-md space-y-3 text-sm">
                {anime.averageScore && anime.averageScore > 0 ? (
                  <div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Nota Média:' : 'Score:'}</strong> {anime.averageScore} / 100</div>
                ) : null}
                {anime.popularity && anime.popularity > 0 ? (
                  <div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Popularidade:' : 'Popularity:'}</strong> {anime.popularity.toLocaleString(language === 'pt' ? 'pt-BR' : 'en-US')} {language === 'pt' ? 'usuários' : 'users'}</div>
                ) : null}
                {anime.format && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Formato:' : 'Format:'}</strong> {translateAnimeFormat(anime.format, language)}</div>)}
                {anime.status && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Status:' : 'Status:'}</strong> {translateMediaStatus(anime.status, language)}</div>)}
                {anime.episodes && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Episódios:' : 'Episodes:'}</strong> {anime.episodes}</div>)}
                {anime.duration && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Duração:' : 'Duration:'}</strong> {anime.duration} min/ep</div>)}
                {anime.season && anime.seasonYear && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Temporada:' : 'Season:'}</strong> {translatedSeason(anime.season, anime.seasonYear)}</div>)}
                {anime.source && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Fonte:' : 'Source:'}</strong> {sourceOptionTranslations[anime.source]?.[language] || sourceOptionTranslations[anime.source]?.['pt'] || anime.source.replace(/_/g, ' ')}</div>)}
                {mainStudio && (
                  <div style={{borderColor: accentColor}} className="border-l-4 pl-3">
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
                
                {anime.genres && anime.genres.length > 0 && (
                  <div style={{borderColor: accentColor}} className="border-l-4 pl-3">
                      <strong className="block mb-1">{language === 'pt' ? 'Gêneros:' : 'Genres:'}</strong>
                      <div className="flex flex-wrap gap-2">{anime.genres.map(genre => (<span key={genre} className="bg-background px-2 py-1 rounded-full text-xs">{language === 'pt' ? translate(genreTranslations, genre) : genre}</span>))}</div>
                  </div>
                )}
                {topTags.length > 0 && (
                  <div style={{borderColor: accentColor}} className="border-l-4 pl-3">
                      <strong className="block mb-1">{language === 'pt' ? 'Tags Principais:' : 'Top Tags:'}</strong>
                      <div className="flex flex-wrap gap-2">{topTags.map(tag => ( <span key={tag.name} className="bg-background px-2 py-1 rounded-full text-xs">{language === 'pt' ? translate(tagTranslations, tag.name) : tag.name}</span> ))}</div>
                  </div>
                )}
            </div>
          </div>
          <div className="lg:col-span-3">
             <h3 className="text-xl font-semibold mb-2">{language === 'pt' ? 'Sinopse' : 'Synopsis'}</h3>
             <div className="prose prose-sm prose-invert text-text-secondary max-w-none" dangerouslySetInnerHTML={{ __html: anime.description || '' }}/>
          </div>
        </div>
      </div>
    </div>
  );
}