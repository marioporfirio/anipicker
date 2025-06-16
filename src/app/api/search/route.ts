import { NextResponse } from 'next/server';
import { searchAnime } from '@/lib/anilist';
import { PAGINATION } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { params, page, perPage } = await request.json();

    if (!params || typeof page !== 'number') {
      return NextResponse.json({ message: 'Parâmetros de busca inválidos.' }, { status: 400 });
    }

    const pageSize = perPage || PAGINATION.DEFAULT_GRID_PAGE_SIZE;
    const result = await searchAnime(params, page, pageSize);

    return NextResponse.json(result);

  } catch (error) {
    console.error('API Error em /api/search:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar animes.' }, { status: 500 });
  }
}