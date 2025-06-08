// src/app/api/person/[id]/route.ts
import { NextResponse } from 'next/server';
import { fetchPersonDetails } from '@/lib/anilist';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  console.log(`\n--- [API ROUTE] /api/person/[id] ---`);
  console.log(`[API ROUTE] Rota acessada com o ID: ${id}`);

  if (!id) {
    console.log(`[API ROUTE] ID não fornecido. Retornando 400.`);
    return NextResponse.json({ error: 'Person ID is required' }, { status: 400 });
  }

  try {
    const personId = parseInt(id, 10);
    if (isNaN(personId)) {
      console.log(`[API ROUTE] ID inválido. Retornando 400.`);
      return NextResponse.json({ error: 'Invalid Person ID' }, { status: 400 });
    }
    
    console.log(`[API ROUTE] Buscando detalhes para a pessoa com ID: ${personId}`);
    const personDetails = await fetchPersonDetails(personId);
    
    // Logar o que recebemos da API do AniList
    console.log(`[API ROUTE] Resultado de fetchPersonDetails:`, personDetails ? 'Recebeu dados' : 'Recebeu null');

    if (!personDetails) {
      console.log(`[API ROUTE] Pessoa não encontrada na API do AniList. Retornando 404.`);
      return NextResponse.json({ error: 'Person not found' }, { status: 404 });
    }

    console.log(`[API ROUTE] Sucesso! Retornando dados da pessoa.`);
    return NextResponse.json(personDetails);

  } catch (error) {
    console.error(`[API ROUTE] Ocorreu um erro catastrófico:`, error);
    return NextResponse.json({ error: 'Failed to fetch person data' }, { status: 500 });
  }
}