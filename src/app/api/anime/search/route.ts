import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';
import { PAGINATION } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    // Pega os parâmetros do corpo da requisição POST
    const { params, page } = await request.json();

    // Validação básica
    if (!params || typeof page !== 'number') {
        return NextResponse.json({ message: 'Parâmetros inválidos.' }, { status: 400 });
    }

    // Chama a função de busca que já existe no lado do servidor
    const result = await searchAnime(params, page, PAGINATION.DEFAULT_GRID_PAGE_SIZE);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error em /api/anime/search:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar animes.' }, { status: 500 });
  }
}