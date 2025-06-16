import { NextResponse } from 'next/server';
import { ListStatus } from '@/store/userListStore';

// Função auxiliar para esperar, se necessário
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Tipagem para a entrada da API do AniList
interface AnilistEntry {
  mediaId: number;
  status: string;
  score: number;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ message: 'Nome de usuário é obrigatório.' }, { status: 400 });
  }

  try {
    // --- BUSCA DA LISTA PRINCIPAL (STATUS E NOTAS) ---
    const allEntries: AnilistEntry[] = [];
    let currentPage = 1;
    let hasNextPage = true;

    while (hasNextPage) {
      const query = `
        query ($userName: String, $page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            pageInfo { hasNextPage }
            mediaList(userName: $userName, type: ANIME, status_not_in: [REPEATING]) {
              mediaId
              status
              score(format: POINT_100)
            }
          }
        }
      `;
      const variables = { userName: username, page: currentPage, perPage: 50 };

      try {
        const res = await fetch('https://graphql.anilist.co', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ query, variables }),
          cache: 'no-store',
        });
        
        if (res.status === 429) {
          console.warn(`Rate limit atingido na página ${currentPage}. Aguardando 5 segundos...`);
          await sleep(5000);
          continue; // Tenta a mesma página novamente
        }

        if (!res.ok) {
           console.error(`Erro na API AniList para a página ${currentPage}: ${res.statusText}`);
           hasNextPage = false; // Interrompe o loop em caso de erro grave
           continue;
        }

        const data = await res.json();
        const pageData = data.data?.Page;

        if (pageData && Array.isArray(pageData.mediaList)) {
          // Filtra entradas nulas ou sem mediaId antes de adicionar
          const validEntries = pageData.mediaList.filter((entry: any) => entry && entry.mediaId);
          allEntries.push(...validEntries);
        }

        hasNextPage = pageData?.pageInfo?.hasNextPage || false;
        currentPage++;
        
        if (hasNextPage) await sleep(100); // Pequena pausa para ser gentil com a API

      } catch (pageError) {
        console.error(`Falha ao buscar a página ${currentPage}. Continuando com os dados obtidos.`, pageError);
        hasNextPage = false; // Interrompe o loop em caso de erro de rede
      }
    }

    // --- BUSCA DA LISTA DE FAVORITOS (SEPARADAMENTE) ---
    let favoriteIds: number[] = [];
    try {
        const favQuery = `query ($userName: String) { User(name: $userName) { favourites { anime(page: 1, perPage: 500) { nodes { id } } } } }`;
        const favRes = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query: favQuery, variables: { userName: username } }),
            cache: 'no-store',
        });
        if (favRes.ok) {
            const favData = await favRes.json();
            const nodes = favData.data?.User?.favourites?.anime?.nodes;
            if (Array.isArray(nodes)) {
                favoriteIds = nodes.map((node: { id: number }) => node.id);
            }
        }
    } catch(favError) {
        console.error("Não foi possível buscar a lista de favoritos.", favError);
        // Continua mesmo se a busca de favoritos falhar
    }

    // --- PROCESSAMENTO FINAL DOS DADOS ---
    const statuses: Record<number, ListStatus> = {};
    const ratings: Record<number, number> = {};
    const statusMap: Record<string, ListStatus> = {
      'CURRENT': 'WATCHING', 'COMPLETED': 'COMPLETED', 'PLANNING': 'PLANNED',
      'DROPPED': 'DROPPED', 'PAUSED': 'PAUSED',
    };

    for (const entry of allEntries) {
      const mappedStatus = statusMap[entry.status];
      if (mappedStatus) statuses[entry.mediaId] = mappedStatus;
      if (entry.score > 0) ratings[entry.mediaId] = entry.score / 10;
    }
    
    return NextResponse.json({ statuses, ratings, favorites: favoriteIds });

  } catch (error: any) {
    console.error("Erro crítico na rota de importação:", error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}