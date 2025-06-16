import { NextResponse } from 'next/server';
import { fetchAiringSchedule } from '@/lib/anilist';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('start');
    const endParam = searchParams.get('end');

    if (!startParam || !endParam) {
      return NextResponse.json({ message: 'Parâmetros start e end são obrigatórios.' }, { status: 400 });
    }

    const start = parseInt(startParam, 10);
    const end = parseInt(endParam, 10);

    if (isNaN(start) || isNaN(end)) {
        return NextResponse.json({ message: 'Parâmetros start e end devem ser números.' }, { status: 400 });
    }
    
    const schedule = await fetchAiringSchedule(start, end);

    return NextResponse.json(schedule);

  } catch (error) {
    console.error('API Error em /api/schedule:', error);
    return NextResponse.json({ message: 'Erro interno do servidor ao buscar o calendário.' }, { status: 500 });
  }
}