import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';

export async function POST(request: Request) {
  try {
    const { genres, averageScore, excludeId } = await request.json();

    if (!genres || !Array.isArray(genres) || genres.length === 0 || !averageScore || !excludeId) {
      return NextResponse.json({ message: 'Parâmetros inválidos para recomendações.' }, { status: 400 });
    }

    const scoreThreshold = 10;
    const scoreLowerBound = Math.max(0, averageScore - scoreThreshold);
    const scoreUpperBound = Math.min(100, averageScore + scoreThreshold);

    // Converte o array de strings de gênero para o formato que searchAnime espera.
    const genresForSearch = genres.map((genre: string) => ({
        name: genre,
        mode: 'include' as const 
    }));

    // >> INÍCIO DA CORREÇÃO: Usar a variável `genresForSearch` corrigida <<
    const result = await searchAnime({
      genres: genresForSearch, // CORRIGIDO
      scoreRange: [scoreLowerBound, scoreUpperBound],
      sortBy: 'SCORE_DESC',
      excludeId: excludeId,
    }, 1, 15);
    // >> FIM DA CORREÇÃO <<

    return NextResponse.json(result.animes);

  } catch (error) {
    console.error('API Error em /api/recommendations:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar recomendações.' }, { status: 500 });
  }
}