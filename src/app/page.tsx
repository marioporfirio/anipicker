// src/app/page.tsx
import AnimeGrid from '@/components/AnimeGrid';
import { fetchTrendingAnime } from '@/lib/anilist'; // Reutilizamos nossa função original

// Esta página volta a ser um Componente de Servidor (assíncrono)
export default async function HomePage() {
  // 1. Buscamos os dados no servidor, antes da página carregar no cliente
  const trendingAnimes = await fetchTrendingAnime();

  // 2. Passamos os dados iniciais para o AnimeGrid
  return <AnimeGrid initialAnimes={trendingAnimes} />;
}