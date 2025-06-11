// src/app/api/anime/search-suggestions/route.ts
import { NextResponse } from 'next/server';
import { GraphQLClient, gql } from 'graphql-request';

const API_URL = 'https://graphql.anilist.co';
const client = new GraphQLClient(API_URL);

// Query otimizada para buscar apenas o essencial para as sugestões
const SEARCH_SUGGESTIONS_QUERY = gql`
  query ($search: String) {
    Page(page: 1, perPage: 8) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH, isAdult: false) {
        id
        title {
          romaji
          english
        }
        coverImage {
          medium
        }
      }
    }
  }
`;

interface Suggestion {
  id: number;
  title: {
    romaji: string;
    english?: string | null;
  };
  coverImage: {
    medium: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || query.trim().length < 3) {
    // Não busca se a query for muito curta
    return NextResponse.json([]);
  }

  try {
    const data = await client.request<{ Page: { media: Suggestion[] } }>(
      SEARCH_SUGGESTIONS_QUERY,
      { search: query }
    );
    return NextResponse.json(data.Page.media);
  } catch (error) {
    console.error('API Error for search suggestions:', error);
    return NextResponse.json({ message: 'Erro ao buscar sugestões.' }, { status: 500 });
  }
}