// src/lib/anilist.ts
import { cache } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import { Selection } from '@/store/filterStore';

const API_URL = 'https://graphql.anilist.co';

const client = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

export interface Anime {
  id: number;
  title: { romaji: string; english: string | null; };
  coverImage: { extraLarge: string; color: string | null; };
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  genres: string[];
  studios: { nodes: { name: string; }[]; };
}
export interface AnimeDetails extends Anime {
  bannerImage: string | null;
  description: string;
  characters: { edges: { role: 'MAIN' | 'SUPPORTING'; node: { id: number; name: { full: string; }; image: { large: string; }; }; voiceActors: { id: number; name: { full: string; }; image: { large: string; }; }[]; }[]; };
  staff: { edges: { role: string; node: { id: number; name: { full: string; }; image: { large: string; }; }; }[]; };
  tags: { name: string; rank: number; }[];
  openingThemes?: string[];
  endingThemes?: string[];
}
export interface Tag { name: string; category: string; }
interface AniListPage<T> { Page: { pageInfo: { hasNextPage: boolean; total: number; }; media: T[]; }; }

export interface PersonDetails {
  id: number;
  name: { full: string };
  image: { large: string };
  description: string;
  staffMedia: {
    edges: {
      staffRole: string;
      node: Anime;
    }[];
  };
  characterMedia: {
    edges: {
      characterRole: 'MAIN' | 'SUPPORTING';
      characters: {
        id: number;
        name: { full: string; };
        image: { large: string; };
      }[];
      node: Anime;
    }[];
  };
}


const ANIME_CARD_FIELDS = gql`
  fragment AnimeCardFields on Media {
    id
    title { romaji english }
    coverImage { extraLarge color }
    season
    seasonYear
    episodes
    duration
    averageScore
    genres
    studios(isMain: true) { nodes { name } }
  }
`;

const SEARCH_ANIME_QUERY = gql`
  ${ANIME_CARD_FIELDS}
  query (
    $page: Int, 
    $perPage: Int, 
    $search: String,
    $startDate_greater: FuzzyDateInt,
    $endDate_lesser: FuzzyDateInt,
    $averageScore_greater: Int,
    $averageScore_lesser: Int,
    $genre_in: [String],
    $genre_not_in: [String],
    $tag_in: [String],
    $tag_not_in: [String],
    $sort: [MediaSort],
    $format_in: [MediaFormat],
    $status_in: [MediaStatus]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage, total }
      media(
        search: $search, 
        startDate_greater: $startDate_greater,
        endDate_lesser: $endDate_lesser,
        averageScore_greater: $averageScore_greater,
        averageScore_lesser: $averageScore_lesser,
        genre_in: $genre_in,
        genre_not_in: $genre_not_in,
        tag_in: $tag_in,
        tag_not_in: $tag_not_in,
        sort: $sort,
        format_in: $format_in,
        status_in: $status_in,
        type: ANIME, 
        isAdult: false
      ) { ...AnimeCardFields }
    }
  }
`;

export interface SearchParams {
  search?: string;
  yearRange?: [number, number];
  scoreRange?: [number, number];
  genres?: Selection[];
  tags?: Selection[];
  sortBy?: string;
  formats?: string[];
  includeTBA?: boolean;
}

export interface SearchResult {
  animes: Anime[];
  hasNextPage: boolean;
  total: number;
}

interface AniListSearchVariables {
  page: number;
  perPage: number;
  search?: string;
  startDate_greater?: number;
  endDate_lesser?: number;
  averageScore_greater?: number;
  averageScore_lesser?: number;
  genre_in?: string[];
  genre_not_in?: string[];
  tag_in?: string[];
  tag_not_in?: string[];
  sort?: string[];
  format_in?: string[];
  status_in?: string[];
}

export async function searchAnime(params: SearchParams, page: number = 1, perPage: number = 20): Promise<SearchResult> {
  const variables: AniListSearchVariables = {
    page,
    perPage,
  };

  if (params.search && params.search.length > 0) {
    variables.search = params.search;
  }

  if (params.formats && params.formats.length > 0) {
    variables.format_in = params.formats;
  }

  if (params.includeTBA) {
    variables.status_in = ['NOT_YET_RELEASED'];
  } else if (params.yearRange) {
    const [start, end] = params.yearRange;
    const MIN_YEAR = 1970;
    const MAX_YEAR = new Date().getFullYear() + 1;
    if (start > MIN_YEAR || end < MAX_YEAR) {
      variables.startDate_greater = Number(`${start}0101`);
      variables.endDate_lesser = Number(`${end}1231`);
    }
  }

  if (params.genres && params.genres.length > 0) {
    const includedGenres = params.genres.filter(g => g.mode === 'include').map(g => g.name);
    const excludedGenres = params.genres.filter(g => g.mode === 'exclude').map(g => g.name);
    if (includedGenres.length > 0) variables.genre_in = includedGenres;
    if (excludedGenres.length > 0) variables.genre_not_in = excludedGenres;
  }
  if (params.tags && params.tags.length > 0) {
    const includedTags = params.tags.filter(t => t.mode === 'include').map(t => t.name);
    const excludedTags = params.tags.filter(t => t.mode === 'exclude').map(t => t.name);
    if (includedTags.length > 0) variables.tag_in = includedTags;
    if (excludedTags.length > 0) variables.tag_not_in = excludedTags;
  }
  if (params.scoreRange) {
    const [start, end] = params.scoreRange;
    if (start > 0) variables.averageScore_greater = start;
    if (end < 100) variables.averageScore_lesser = end;
  }

  if (variables.search) {
    variables.sort = ['SEARCH_MATCH'];
  } else if (params.sortBy) {
    variables.sort = [params.sortBy];
  }
  
  try {
    const data = await client.request<AniListPage<Anime>>(SEARCH_ANIME_QUERY, variables);
    return {
      animes: data.Page.media,
      hasNextPage: data.Page.pageInfo.hasNextPage,
      total: data.Page.pageInfo.total,
    };
  } catch (error: any) {
    console.error("Erro na busca de animes:", error);
    return { animes: [], hasNextPage: false, total: 0 };
  }
}

export async function fetchTrendingAnime(): Promise<Anime[]> {
  try {
    const data = await client.request<{ Page: { media: Anime[] } }>(
      gql`
        ${ANIME_CARD_FIELDS}
        query ($page: Int, $perPage: Int) {
          Page(page: $page, perPage: $perPage) {
            media(sort: POPULARITY_DESC, type: ANIME, isAdult: false) {
              ...AnimeCardFields
            }
          }
        }
      `,
      { page: 1, perPage: 20 }
    );
    return data.Page.media;
  } catch (error) {
    console.error('Erro ao buscar animes trending:', error);
    throw new Error('Não foi possível carregar os animes em alta.');
  }
}

export const getGenres = cache(async (): Promise<string[]> => {
  try {
    const data = await client.request<{ GenreCollection: string[] }>(gql`query { GenreCollection }`);
    return data.GenreCollection.sort();
  } catch (error) {
    console.error("Erro ao buscar gêneros:", error);
    throw error;
  }
});

export const getTags = cache(async (): Promise<Tag[]> => {
  try {
    const data = await client.request<{ MediaTagCollection: (Tag & { isAdult: boolean })[] }>(gql`query { MediaTagCollection { name, category, isAdult } }`);
    return data.MediaTagCollection.filter(tag => !tag.isAdult);
  } catch (error) {
    console.error("Erro ao buscar tags:", error);
    throw error;
  }
});

export async function fetchAnimeDetails(id: number): Promise<AnimeDetails | null> {
  try {
    const data = await client.request<{ Media: AnimeDetails }>(
      gql`
        ${ANIME_CARD_FIELDS}
        fragment AnimeDetailsFields on Media {
          description(asHtml: true)
          tags { name rank }
          bannerImage
          characters(sort: ROLE, perPage: 12) {
            edges {
              role
              node { id, name { full }, image { large } }
              voiceActors(language: JAPANESE, sort: RELEVANCE) {
                id, name { full }, image { large }
              }
            }
          }
          staff(sort: RELEVANCE, perPage: 16) {
            edges {
              role
              node { id, name { full }, image { large } }
            }
          }
        }
        query ($id: Int) {
          Media(id: $id, type: ANIME) { 
            ...AnimeCardFields 
            ...AnimeDetailsFields
          }
        }
      `, { id }
    );
    return data.Media;
  } catch (error) {
    console.error(`Erro ao buscar detalhes para o anime ID ${id}:`, error);
    return null;
  }
}

export async function fetchPersonDetails(id: number): Promise<PersonDetails | null> {
  const STAFF_INFO_QUERY = gql`
    ${ANIME_CARD_FIELDS}
    query ($id: Int) {
      Staff(id: $id) {
        id
        name { full }
        image { large }
        description(asHtml: true)
        staffMedia(sort: [POPULARITY_DESC, START_DATE_DESC], type: ANIME, perPage: 25) {
          edges {
            staffRole
            node { ...AnimeCardFields }
          }
        }
      }
    }
  `;

  const VOICE_ACTING_QUERY = gql`
    ${ANIME_CARD_FIELDS}
    query ($id: Int) {
      Staff(id: $id) {
        characterMedia(sort: [POPULARITY_DESC, START_DATE_DESC], perPage: 50) {
          edges {
            characterRole
            characters {
                id
                name { full }
                image { large }
            }
            node { ...AnimeCardFields }
          }
        }
      }
    }
  `;

  let staffInfo: Omit<PersonDetails, 'characterMedia'>;
  
  try {
    const staffInfoResponse = await client.request<{ Staff: Omit<PersonDetails, 'characterMedia'> }>(STAFF_INFO_QUERY, { id });
    if (!staffInfoResponse || !staffInfoResponse.Staff) {
        return null; 
    }
    staffInfo = staffInfoResponse.Staff;
  } catch (error) {
    console.error(`Erro ao buscar informações de STAFF para a pessoa ID ${id}:`, error);
    return null; 
  }
  
  let voiceRoles: PersonDetails['characterMedia'] = { edges: [] };
  try {
    const voiceActingResponse = await client.request<{ Staff: Pick<PersonDetails, 'characterMedia'> }>(VOICE_ACTING_QUERY, { id });
    if (voiceActingResponse?.Staff?.characterMedia?.edges) {
        const sortedEdges = voiceActingResponse.Staff.characterMedia.edges.sort((a, b) => {
            if (a.node && b.node) {
                return a.node.title.romaji.localeCompare(b.node.title.romaji);
            }
            return 0;
        });
        voiceRoles = { edges: sortedEdges };
    }
  } catch (error) {
      console.error(`Erro ao buscar papéis de DUBLAGEM para a pessoa ID ${id}. Continuando com dados de staff.`, error);
  }

  return {
      ...staffInfo,
      characterMedia: voiceRoles,
  };
}