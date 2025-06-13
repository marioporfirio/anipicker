// =================================================================
// ============== ARQUIVO: src/app/api/anime/recommendations/route.ts ==============
// =================================================================
import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';

export async function POST(request: Request) {
  try {
    const { genres, averageScore, excludeId } = await request.json();

    if (!genres || genres.length === 0 || !averageScore || !excludeId) {
      return NextResponse.json({ message: 'Parâmetros inválidos para recomendações.' }, { status: 400 });
    }

    const scoreThreshold = 10;
    const scoreLowerBound = Math.max(0, averageScore - scoreThreshold);
    const scoreUpperBound = Math.min(100, averageScore + scoreThreshold);

    const result = await searchAnime({
      genres: genres,
      scoreRange: [scoreLowerBound, scoreUpperBound],
      sortBy: 'SCORE_DESC',
      excludeId: excludeId,
    }, 1, 15); // Busca até 15 animes

    return NextResponse.json(result.animes);

  } catch (error) {
    console.error('API Error em /api/anime/recommendations:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar recomendações.' }, { status: 500 });
  }
}