// src/components/anime/AnimeHero.tsx
import Image from 'next/image';
import Link from 'next/link';
import { AnimeDetails } from '@/lib/anilist';
import { translate, genreTranslations, tagTranslations, sourceOptionTranslations } from '@/lib/translations';
import { useFilterStore } from '@/store/filterStore';

interface AnimeHeroProps {
  anime: AnimeDetails;
}

export default function AnimeHero({ anime }: AnimeHeroProps) {
  const language = useFilterStore((state) => state.language);
  const accentColor = anime.coverImage.color || '#38bdf8';
  // Agora pegamos o objeto completo do estúdio principal
  const mainStudio = anime.studios.nodes.find(studio => studio.id);

  const topTags = [...anime.tags].sort((a, b) => b.rank - a.rank).slice(0, 5);

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
          </div>
        </div>
        
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-surface p-4 rounded-lg shadow-md space-y-3 text-sm">
                {anime.averageScore && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Nota Média:' : 'Score:'}</strong> {anime.averageScore} / 100</div>)}
                {anime.source && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Fonte:' : 'Source:'}</strong> {sourceOptionTranslations[anime.source]?.[language] || sourceOptionTranslations[anime.source]?.['pt'] || anime.source.replace(/_/g, ' ')}</div>)}
                
                {mainStudio && (
                  <div style={{borderColor: accentColor}} className="border-l-4 pl-3">
                    <strong>{language === 'pt' ? 'Estúdio:' : 'Studio:'}</strong>{' '}
                    <Link
                      // --- CORREÇÃO APLICADA AQUI ---
                      // Passa o ID e o Nome do estúdio na URL
                      href={`?anime=${anime.id}&studioId=${mainStudio.id}&studioName=${encodeURIComponent(mainStudio.name)}`}
                      scroll={false}
                      className="hover:text-primary transition-colors cursor-pointer underline-offset-2 hover:underline"
                    >
                      {mainStudio.name}
                    </Link>
                  </div>
                )}
                
                {anime.episodes && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Episódios:' : 'Episodes:'}</strong> {anime.episodes}</div>)}
                {anime.duration && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Duração:' : 'Duration:'}</strong> {anime.duration} min/ep</div>)}
                {anime.season && anime.seasonYear && (<div style={{borderColor: accentColor}} className="border-l-4 pl-3"><strong>{language === 'pt' ? 'Temporada:' : 'Season:'}</strong> {translatedSeason(anime.season, anime.seasonYear)}</div>)}
                <div style={{borderColor: accentColor}} className="border-l-4 pl-3">
                    <strong className="block mb-1">{language === 'pt' ? 'Gêneros:' : 'Genres:'}</strong>
                    <div className="flex flex-wrap gap-2">{anime.genres.map(genre => (<span key={genre} className="bg-background px-2 py-1 rounded-full text-xs">{language === 'pt' ? translate(genreTranslations, genre) : genre}</span>))}</div>
                </div>
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