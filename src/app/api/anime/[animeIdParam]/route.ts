// ESTA É A VERSÃO CORRETA PARA O NEXT.JS 14
import { NextResponse } from 'next/server';
import { fetchAnimeDetails } from '@/lib/anilist';

export async function GET(
  request: Request,
  { params }: { params: { animeIdParam: string } }
) {
  try {
    const animeId = parseInt(params.animeIdParam, 10); // Sem await aqui!
    if (isNaN(animeId)) {
      return NextResponse.json({ message: 'ID de anime inválido' }, { status: 400 });
    }

    const anime = await fetchAnimeDetails(animeId);
    
    if (!anime) {
      return NextResponse.json({ message: `Anime com ID ${animeId} não encontrado.` }, { status: 404 });
    }
    
    return NextResponse.json(anime);

  } catch (error) {
    console.error(`API Error for anime details ID ${params.animeIdParam}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar detalhes do anime.' }, { status: 500 });
  }
}