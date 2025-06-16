import { NextResponse } from 'next/server';
import { searchAnime, SearchParams } from '@/lib/anilist';

const MAX_RESULTS_FOR_RANDOM = 5000;

export async function POST(request: Request) {
  try {
    const params: SearchParams = await request.json();
    const initialResult = await searchAnime(params, 1, 1);
    let total = initialResult.total;

    if (total === 0) {
      return NextResponse.json({ error: 'Nenhum anime encontrado com os filtros selecionados.' }, { status: 404 });
    }
    if (total > MAX_RESULTS_FOR_RANDOM) {
      total = MAX_RESULTS_FOR_RANDOM;
    }

    const perPage = 20;
    const randomItemIndex = Math.floor(Math.random() * total);
    const randomPage = Math.floor(randomItemIndex / perPage) + 1;
    const indexOnPage = randomItemIndex % perPage;

    const randomPageResult = await searchAnime(params, randomPage, perPage);
    
    if (!randomPageResult.animes || randomPageResult.animes.length === 0) {
        const fallbackResult = await searchAnime(params, 1, perPage);
        if(!fallbackResult.animes || fallbackResult.animes.length === 0) {
           return NextResponse.json({ error: 'Não foi possível sortear um anime.' }, { status: 500 });
        }
        return NextResponse.json(fallbackResult.animes[0]);
    }

    const randomAnime = randomPageResult.animes[indexOnPage];
    
    if (!randomAnime) {
        return NextResponse.json(randomPageResult.animes[0]);
    }
    
    return NextResponse.json(randomAnime);

  } catch (error) {
    console.error('API Error em /api/random:', error);
    return NextResponse.json({ error: 'Erro interno do servidor ao sortear anime.' }, { status: 500 });
  }
}