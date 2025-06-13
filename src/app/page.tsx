// src/app/page.tsx

import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';
import { fetchTrendingAnime, fetchAiringSchedule } from '@/lib/anilist';
import PageClient from './page-client'; // O novo componente de cliente

// Função auxiliar para obter o intervalo da semana inicial no servidor
const getWeekRange = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  endOfWeek.setSeconds(endOfWeek.getSeconds() - 1);

  return {
    start: Math.floor(startOfWeek.getTime() / 1000),
    end: Math.floor(endOfWeek.getTime() / 1000),
  };
};

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
