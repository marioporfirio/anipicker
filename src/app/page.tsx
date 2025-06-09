// src/app/page.tsx
import { fetchTrendingAnime } from '@/lib/anilist';
import GenreFilter from '@/components/GenreFilter';
import TagFilter from '@/components/TagFilter';
import MainContent from '@/components/MainContent'; // Importa o novo componente

// Esta página continua sendo um Server Component, o que é ótimo para performance.
export default async function HomePage() {
  // Busca os dados no servidor antes de a página ser renderizada.
  const trendingAnimes = await fetchTrendingAnime();

  return (
    // O container principal da página.
    <div className="container mx-auto p-4">
      {/* 
        Delega toda a lógica de layout e interatividade para o MainContent.
        Passa os dados iniciais e os componentes de filtro como props.
      */}
      <MainContent
        initialAnimes={trendingAnimes}
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