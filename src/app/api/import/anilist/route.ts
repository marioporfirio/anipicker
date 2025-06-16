// src/app/api/import/anilist/route.ts

import { NextResponse } from 'next/server';
import { ListStatus } from '@/store/userListStore';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Função para buscar a lista geral (status, notas)
async function fetchUserListFromAnilist(username: string) {
    const query = `
      query ($userName: String, $page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
          pageInfo {
            hasNextPage
          }
          mediaList(userName: $userName, type: ANIME, status_not_in: [REPEATING]) {
            mediaId
            status
            score(format: POINT_100)
          }
        }
      }
    `;
    const allEntries: any[] = [];
    let page = 1;
    let hasNextPage = true;

    while (hasNextPage) {
        const variables = { userName: username, page, perPage: 50 };
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables }),
            cache: 'no-store'
        });
        if (!res.ok) {
            if (res.status === 429) { await sleep(5000); continue; }
            if (res.status === 404) return null;
            throw new Error(`Erro na API AniList: ${res.statusText}`);
        }
        const data = await res.json();
        const pageData = data.data.Page;
        if (pageData && pageData.mediaList) {
            allEntries.push(...pageData.mediaList);
        }
        hasNextPage = pageData?.pageInfo?.hasNextPage || false;
        page++;
        if (hasNextPage) await sleep(1200);
    }
    return allEntries;
}

// >> INÍCIO DA CORREÇÃO: Nova função específica para buscar favoritos <<
async function fetchUserFavoritesFromAnilist(username: string): Promise<number[] | null> {
    const query = `
      query ($userName: String) {
        User(name: $userName) {
          favourites {
            anime(page: 1, perPage: 500) { # Pega até 500 animes favoritos
              nodes {
                id
              }
            }
          }
        }
      }
    `;
    const variables = { userName: username };
    try {
        const res = await fetch('https://graphql.anilist.co', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ query, variables }),
            cache: 'no-store'
        });

        if (!res.ok) return []; // Retorna vazio em caso de erro, não quebra a importação

        const data = await res.json();
        const favoriteNodes = data.data?.User?.favourites?.anime?.nodes;

        if (favoriteNodes && Array.isArray(favoriteNodes)) {
            // Extrai apenas os IDs: [{id: 123}, {id: 456}] -> [123, 456]
            return favoriteNodes.map((node: { id: number }) => node.id);
        }
        return [];
    } catch (error) {
        console.error("Erro ao buscar favoritos do AniList:", error);
        return []; // Retorna array vazio em caso de falha
    }
}
// >> FIM DA CORREÇÃO <<


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ message: 'Nome de usuário é obrigatório.' }, { status: 400 });
    }

    // >> INÍCIO DA CORREÇÃO: Executa as duas buscas em paralelo <<
    const [anilistEntries, favoriteIds] = await Promise.all([
        fetchUserListFromAnilist(username),
        fetchUserFavoritesFromAnilist(username)
    ]);
    // >> FIM DA CORREÇÃO <<

    if (!anilistEntries) {
      return NextResponse.json({ message: `Usuário '${username}' não encontrado.` }, { status: 404 });
    }

    const statuses: Record<number, ListStatus> = {};
    const ratings: Record<number, number> = {};
    const statusMap: Record<string, ListStatus> = {
      'CURRENT': 'WATCHING',
      'COMPLETED': 'COMPLETED',
      'PLANNING': 'PLANNED',
      'DROPPED': 'DROPPED',
      'PAUSED': 'PAUSED',
    };

    for (const entry of anilistEntries) {
      const mappedStatus = statusMap[entry.status];
      if (mappedStatus) statuses[entry.mediaId] = mappedStatus;
      
      if (entry.score > 0) {
        ratings[entry.mediaId] = entry.score / 10;
      }
    }

    // Retorna os dados, usando a lista de favoritos dedicada que foi buscada
    return NextResponse.json({ statuses, ratings, favorites: favoriteIds || [] });

  } catch (error: any) {
    console.error("Erro na rota de importação:", error);
    return NextResponse.json({ message: error.message || 'Erro interno do servidor.' }, { status: 500 });
  }
}