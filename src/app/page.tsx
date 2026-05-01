import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';
import { fetchTrendingAnime, fetchAiringSchedule } from '@/lib/anilist';
import { getWeekRange } from '@/lib/utils';
import PageClient from './page-client';

export default async function HomePage() {
  const { start, end } = getWeekRange(new Date());
  const [initialAnimes, initialSchedule] = await Promise.all([
    fetchTrendingAnime(),
    fetchAiringSchedule(start, end),
  ]);

  return (
    <PageClient
      initialAnimes={initialAnimes}
      initialSchedule={initialSchedule}
      filtersComponent={
        <>
          <GenreFilter />
          <TagFilter />
        </>
      }
    />
  );
}
