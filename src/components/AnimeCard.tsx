// src/components/AnimeCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Anime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { translate, genreTranslations } from '@/lib/translations';

const getScoreColor = (score: number | null) => {
  if (score === null) return 'bg-gray-600';
  if (score >= 75) return 'bg-green-500';
  if (score >= 60) return 'bg-yellow-500';
  return 'bg-red-500';
};

interface AnimeCardProps {
  anime: Anime;
}

export default function AnimeCard({ anime }: AnimeCardProps) {
  const language = useFilterStore((state) => state.language);
  const mainStudio = anime.studios.nodes[0]?.name;

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

  return (
    <Link
      href={`/?anime=${anime.id}`}
      scroll={false}
      // --- CORREÇÃO APLICADA AQUI ---
      // Impede o Next.js de pré-carregar os dados para cada card na tela.
      prefetch={false}
      className="group block bg-surface rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1"
    >
      <div className="relative w-full aspect-[2/3]">
        <Image
          src={anime.coverImage.extraLarge}
          alt={`Capa de ${anime.title.romaji}`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 639px) 50vw, (max-width: 1023px) 33vw, (max-width: 1279px) 25vw, (max-width: 1535px) 20vw, 17vw"
        />
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