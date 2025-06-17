import { NextResponse } from 'next/server';
import { ListStatus } from '@/store/userListStore';

interface AnilistExportEntry {
  mediaId: number;
  status: string;
  score: number; // Nota de 0-100
}

interface AnilistList {
  name: string;
  entries: AnilistExportEntry[];
}

interface AnilistCollection {
  MediaListCollection: {
    lists: AnilistList[];
  };
}

export async function POST(request: Request) {
  try {
    const body: AnilistCollection = await request.json();

    // Validação da estrutura principal do JSON
    if (!body?.MediaListCollection?.lists || !Array.isArray(body.MediaListCollection.lists)) {
      return NextResponse.json({ message: 'Formato de arquivo JSON inválido. Estrutura "MediaListCollection" não encontrada.' }, { status: 400 });
    }

    const statuses: Record<number, ListStatus> = {};
    const ratings: Record<number, number> = {};
    const statusMap: Record<string, ListStatus> = {
      'CURRENT': 'WATCHING',
      'COMPLETED': 'COMPLETED',
      'PLANNING': 'PLANNED',
      'DROPPED': 'DROPPED',
      'PAUSED': 'PAUSED',
      'REPEATING': 'WATCHING',
    };

    // Itera sobre cada lista (Completed, Watching, etc.)
    for (const list of body.MediaListCollection.lists) {
      // Itera sobre cada anime dentro da lista
      for (const entry of list.entries) {
        if (!entry || !entry.mediaId) continue; // Pula entradas inválidas

        const mappedStatus = statusMap[entry.status];
        if (mappedStatus) {
          statuses[entry.mediaId] = mappedStatus;
        }

        // A nota do arquivo de exportação é 0-100. Dividimos para normalizar.
        if (entry.score > 0) {
          ratings[entry.mediaId] = entry.score / 10;
        }
      }
    }
    
    // Retorna APENAS os status e as notas. Favoritos são tratados em outra rota.
    return NextResponse.json({ statuses, ratings });

  } catch (error: any) {
    console.error("Erro no processamento do arquivo de importação:", error);
    return NextResponse.json({ message: 'Erro ao processar o arquivo. Verifique se o formato está correto.' }, { status: 500 });
  }
}