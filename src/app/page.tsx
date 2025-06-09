// src/app/page.tsx
import AnimeGrid from '@/components/AnimeGrid';
import Sidebar from '@/components/Sidebar';
import { fetchTrendingAnime } from '@/lib/anilist';
import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';

export default async function HomePage() {
  const trendingAnimes = await fetchTrendingAnime();

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-8 items-start">
      <Sidebar 
        filters={
          <>
            <GenreFilter />
            <TagFilter />
          </>
        } 
      />
      <div className="flex-1 w-full overflow-hidden">
        <AnimeGrid initialAnimes={trendingAnimes} />
      </div>
    </div>
  );
}