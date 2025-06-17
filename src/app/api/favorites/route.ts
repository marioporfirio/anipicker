import { NextResponse } from 'next/server';

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

        if (!res.ok) {
          console.error(`Erro ao buscar favoritos para ${username}: ${res.statusText}`);
          return [];
        }

        const data = await res.json();
        const favoriteNodes = data.data?.User?.favourites?.anime?.nodes;

        if (favoriteNodes && Array.isArray(favoriteNodes)) {
            return favoriteNodes.map((node: { id: number }) => node.id);
        }
        return [];
    } catch (error) {
        console.error("Erro de rede ao buscar favoritos do AniList:", error);
        return []; // Retorna array vazio em caso de falha de rede
    }
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ message: 'Nome de usuário é obrigatório.' }, { status: 400 });
        }

        const favoriteIds = await fetchUserFavoritesFromAnilist(username);
        
        return NextResponse.json({ favorites: favoriteIds || [] });

    } catch (error: any) {
        console.error("Erro na rota de favoritos:", error);
        return NextResponse.json({ message: error.message || 'Erro interno do servidor.' }, { status: 500 });
    }
}