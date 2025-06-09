// src/app/api/studio/[studioId]/route.ts
import { fetchAnimesByStudioId } from '@/lib/anilist';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { studioId: string } } 
) {
  try {
    const studioId = parseInt(params.studioId, 10);
    if (isNaN(studioId)) {
      return NextResponse.json({ message: 'ID do estúdio é inválido.' }, { status: 400 });
    }
    
    // CORRIGIDO: Pega os parâmetros 'page' e 'sort' da URL da requisição
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = searchParams.get('sort') || 'POPULARITY_DESC';

    // CORRIGIDO: Passa os novos parâmetros para a função de fetch
    const result = await fetchAnimesByStudioId(studioId, page, [sort]);

    if (result === null) {
      return NextResponse.json({ message: `Estúdio com ID '${studioId}' não encontrado ou erro na busca.` }, { status: 404 });
    }
    
    // Retorna o objeto completo com 'animes' e 'hasNextPage'
    return NextResponse.json(result);
    
  } catch (error) {
    console.error(`Erro crítico na rota /api/studio:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}