// src/app/api/anime/[id]/route.ts
import { NextResponse } from 'next/server';
import { fetchAnimeDetails } from '@/lib/anilist'; // Reutilizamos nossa função de busca

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const animeId = parseInt(params.id, 10);

  if (isNaN(animeId)) {
    return NextResponse.json({ error: 'ID de anime inválido' }, { status: 400 });
  }

  try {
    const anime = await fetchAnimeDetails(animeId);
    if (!anime) {
      return NextResponse.json({ error: 'Anime não encontrado' }, { status: 404 });
    }
    return NextResponse.json(anime);
  } catch (error) {
    console.error(`API Error for anime ID ${animeId}:`, error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}