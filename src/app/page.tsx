// src/app/page.tsx

import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';
import { fetchTrendingAnime, fetchAiringSchedule } from '@/lib/anilist';
import { getWeekRange } from '@/lib/utils';
import PageClient from './page-client';

// A página agora é um Server Component novamente
export default async function HomePage() {
  // Busca os dados iniciais no servidor
  const initialAnimes = await fetchTrendingAnime();
  const { start, end } = getWeekRange(new Date());
  const initialSchedule = await fetchAiringSchedule(start, end);

  // Passa os dados e os componentes de servidor como props para o componente de cliente
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
