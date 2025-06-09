// src/app/api/person/[id]/route.ts
import { fetchPersonDetails } from '@/lib/anilist';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: { id: string } } 
) {
  try {
    const personId = parseInt(params.id, 10); 
    if (isNaN(personId)) {
      return NextResponse.json({ message: 'ID de pessoa inválido' }, { status: 400 });
    }

    const details = await fetchPersonDetails(personId);

    if (!details) {
      return NextResponse.json({ message: `Pessoa com ID ${personId} não encontrada.` }, { status: 404 });
    }

    return NextResponse.json(details);
  } catch (error) {
    console.error(`API Error for person ${params.id}:`, error);
    return NextResponse.json({ message: 'Erro interno do servidor.' }, { status: 500 });
  }
}