// src/app/page.tsx
import MainContent from '@/components/MainContent';
import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';
import { fetchTrendingAnime, fetchAiringSchedule, AiringAnime } from '@/lib/anilist';

const getWeekRange = () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon,...

  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - dayOfWeek);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  // Converte para segundos Unix
  return {
    start: Math.floor(startOfWeek.getTime() / 1000),
    end: Math.floor(endOfWeek.getTime() / 1000),
  };
};

export default async function HomePage() {
  const initialAnimes = await fetchTrendingAnime();
  const { start, end } = getWeekRange();
  const airingSchedule: AiringAnime[] = await fetchAiringSchedule(start, end);

  return (
    // Removidas classes de container para permitir que o conteúdo se expanda
    // Adicionado padding para manter um espaçamento das bordas da tela
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <MainContent 
        initialAnimes={initialAnimes}
        airingSchedule={airingSchedule}
        filtersComponent={
          <>
            <GenreFilter />
            <TagFilter />
          </>
        }
      />
    </div>
  );
}