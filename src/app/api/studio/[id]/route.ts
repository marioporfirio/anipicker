import { fetchAnimesByStudioId } from '@/lib/anilist';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } } 
) {
  try {
    const studioId = parseInt(params.id, 10);
    if (isNaN(studioId)) {
      return NextResponse.json({ message: 'ID do estúdio é inválido.' }, { status: 400 });
    }
    
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const sort = searchParams.get('sort') || 'POPULARITY_DESC';

    const result = await fetchAnimesByStudioId(studioId, page, [sort]);

    if (!result) {
      return NextResponse.json({ message: `Estúdio com ID '${studioId}' não encontrado ou erro na busca.` }, { status: 404 });
    }
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error(`Erro crítico na rota /api/studio:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Erro interno do servidor.';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}