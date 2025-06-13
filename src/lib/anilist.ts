import { cache } from 'react';
import { GraphQLClient, gql } from 'graphql-request';
import { Selection, MediaSource, SortDirection } from '@/store/filterStore';

const API_URL = 'https://graphql.anilist.co';

const client = new GraphQLClient(API_URL, {
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  next: { revalidate: 600 }
});

export interface Anime {
  id: number;
  title: { romaji: string; english: string | null; native: string | null; };
  coverImage: { extraLarge: string; color: string | null; };
  season: 'WINTER' | 'SPRING' | 'SUMMER' | 'FALL' | null;
  seasonYear: number | null;
  episodes: number | null;
  duration: number | null;
  averageScore: number | null;
  popularity: number | null;
  genres: string[];
  studios: { nodes: { id: number; name: string; }[]; };
  format?: string;
  status?: string;
  source?: MediaSource;
  relations?: { edges: AnimeRelationEdge[] };
  startDate?: { year: number | null; month: number | null; day: number | null; };
  endDate?: { year: number | null; month: number | null; day: number | null; };
}

export type MediaRelationType = 'ADAPTATION' | 'PREQUEL' | 'SEQUEL' | 'PARENT' | 'SIDE_STORY' | 'CHARACTER' | 'SUMMARY' | 'ALTERNATIVE' | 'SPIN_OFF' | 'OTHER' | 'SOURCE' | 'COMPILATION' | 'CONTAINS';
export interface AnimeRelationEdge { relationType: MediaRelationType; node: Anime; }

export interface AnimeDetails extends Anime { 
  bannerImage: string | null; 
  description: string; 
  relations: { edges: AnimeRelationEdge[]; }; 
  characters: { edges: { role: 'MAIN' | 'SUPPORTING'; node: { id: number; name: { full: string; }; image: { large: string; }; }; voiceActors: { id: number; name: { full: string; }; image: { large: string; }; }[]; }[]; }; 
  staff: { edges: { role: string; node: { id: number; name: { full: string; }; image: { large: string; }; }; }[]; }; 
  tags: { name: string; rank: number; }[];
  recommendations?: { nodes: { mediaRecommendation: Anime }[] };
}

export interface Tag { name: string; category: string; }
interface AniListPage<T> { Page: { pageInfo: { hasNextPage: boolean; total: number; }; media: T[]; }; }
export interface PersonDetails { id: number; name: { full: string }; image: { large: string }; description: string; staffMedia: { edges: { staffRole: string; node: Anime; }[]; }; characterMedia: { edges: { characterRole: 'MAIN' | 'SUPPORTING'; characters: { id: number; name: { full: string; }; image: { large: string; }; }[]; node: Anime; }[]; }; }

export interface AiringAnime {
  id: number;
  episode: number;
  airingAt: number;
  media: {
    id: number;
    title: {
      romaji: string;
      english: string | null;
    };
    coverImage: {
      large: string;
    };
  };
}

const ANIME_CARD_FIELDS = gql`
  fragment AnimeCardFields on Media {
    id
    title { romaji english }
    coverImage { extraLarge color }
    format
    status
    source(version: 3)
    season
    seasonYear
    episodes
    duration
    averageScore
    genres
    studios(isMain: true) { 
      nodes { 
        id
        name 
      } 
    }
  }
`;

const SEARCH_ANIME_QUERY = gql`
  ${ANIME_CARD_FIELDS}
  query (
    $page: Int, 
    $perPage: Int, 
    $id_in: [Int],
    $id_not: Int,
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
    $status_in: [MediaStatus],
    $source_in: [MediaSource]
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { hasNextPage, total }
      media(
        id_in: $id_in,
        id_not: $id_not,
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
        source_in: $source_in,
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
  excludeNoScore?: boolean;
  genres?: Selection[]; 
  tags?: Selection[]; 
  sortBy?: string; 
  formats?: string[]; 
  includeTBA?: boolean; 
  statuses?: string[]; 
  sources?: string[];
  sortDirection?: SortDirection;
  animeIds?: number[];
  excludeId?: number;
}
export interface SearchResult { animes: Anime[]; hasNextPage: boolean; total: number; }
interface AniListSearchVariables { page: number; perPage: number; id_in?: number[]; id_not?: number; search?: string; startDate_greater?: number; endDate_lesser?: number; averageScore_greater?: number; averageScore_lesser?: number; genre_in?: string[]; genre_not_in?: string[]; tag_in?: string[]; tag_not_in?: string[]; sort?: string[]; format_in?: string[]; status_in?: string[]; source_in?: string[]; }

export async function searchAnime(params: SearchParams, page: number = 1, perPage: number = 20): Promise<SearchResult> {
  const variables: AniListSearchVariables = { page, perPage };
  
  if (params.excludeId) {
    variables.id_not = params.excludeId;
  }

  if (params.animeIds && params.animeIds.length > 0) {
    variables.id_in = params.animeIds;
    let baseSort = params.sortBy || 'POPULARITY_DESC';
    if (params.sortDirection === 'ASC' && baseSort.endsWith('_DESC')) {
        variables.sort = [baseSort.replace('_DESC', '')];
    } else {
        variables.sort = [baseSort];
    }
  } else { 
    if (params.formats && params.formats.length > 0) { variables.format_in = params.formats; }
    if (params.sources && params.sources.length > 0) { variables.source_in = params.sources; }
    let statuses = params.statuses ? [...params.statuses] : [];
    if (params.includeTBA && !statuses.includes('NOT_YET_RELEASED')) {
      statuses.push('NOT_YET_RELEASED');
    }
    if (statuses.length > 0) {
      variables.status_in = statuses;
    }
    if (params.yearRange) { 
      const [start, end] = params.yearRange; 
      const MIN_YEAR = 1970; 
      const MAX_YEAR = new Date().getFullYear() + 1; 
      if (start > MIN_YEAR) variables.startDate_greater = Number(`${start}0101`); 
      if (end < MAX_YEAR) variables.endDate_lesser = Number(`${end}1231`); 
    }

    if (params.scoreRange) { 
      const [start, end] = params.scoreRange; 
      if (start > 0) variables.averageScore_greater = start; 
      if (end < 100) variables.averageScore_lesser = end; 
    }
    if (params.excludeNoScore && variables.averageScore_greater === undefined) {
      variables.averageScore_greater = 0;
    }

    const includedGenres = params.genres?.filter(g => g.mode === 'include').map(g => g.name) || [];
    const excludedGenres = params.genres?.filter(g => g.mode === 'exclude').map(g => g.name) || [];
    const includedTags = params.tags?.filter(t => t.mode === 'include').map(t => t.name) || [];
    const excludedTags = params.tags?.filter(t => t.mode === 'exclude').map(t => t.name) || [];
    
    if (includedGenres.length > 0) variables.genre_in = includedGenres;
    if (excludedGenres.length > 0) variables.genre_not_in = excludedGenres;
    if (includedTags.length > 0) variables.tag_in = includedTags;
    if (excludedTags.length > 0) variables.tag_not_in = excludedTags;
    
    if (params.search && params.search.length > 0) {
        variables.search = params.search;
        variables.sort = ['SEARCH_MATCH'];
    } else {
        let baseSort = params.sortBy || 'POPULARITY_DESC';
        if (baseSort === 'RELEVANCE') baseSort = 'POPULARITY_DESC';

        if (params.sortDirection === 'ASC' && baseSort.endsWith('_DESC')) {
            variables.sort = [baseSort.replace('_DESC', '')];
        } else {
            variables.sort = [baseSort];
        }
    }
  }
  
  try { 
    const data = await client.request<AniListPage<Anime>>(SEARCH_ANIME_QUERY, variables); 
    return { animes: data.Page.media, hasNextPage: data.Page.pageInfo.hasNextPage, total: data.Page.pageInfo.total }; 
  } catch (error: any) { 
    console.error("Erro na busca de animes:", error.response?.errors || error.message); 
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
    const mainQuery = gql`
      query ($id: Int) {
        Media(id: $id, type: ANIME) { 
          id
          title { romaji english native }
          coverImage { extraLarge color }
          bannerImage
          format
          status
          description(asHtml: true)
          startDate { year month day }
          endDate { year month day }
          season
          seasonYear
          episodes
          duration
          source(version: 3)
          genres
          tags { name rank }
          averageScore
          popularity
          studios(isMain: true) { 
            nodes { 
              id
              name 
            } 
          }
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
          relations {
            edges {
              relationType(version: 2)
              node {
                id
                title { romaji }
                format
                coverImage { extraLarge }
              }
            }
          }
        }
      }
    `;
    const data = await client.request<{ Media: AnimeDetails }>(mainQuery, { id });
    if (!data.Media) {
      return null;
    }
    return data.Media;
  } catch (error) {
    console.error(`Erro ao buscar detalhes para o anime ID ${id}:`, error);
    return null;
  }
}

export async function fetchPersonDetails(id: number): Promise<PersonDetails | null> {
  const PERSON_DETAILS_QUERY = gql`
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
  try {
    const data = await client.request<{ Staff: PersonDetails }>(PERSON_DETAILS_QUERY, { id });
    return data.Staff || null;
  } catch (error) {
    console.error(`Erro ao buscar detalhes para a pessoa ID ${id}:`, error);
    return null;
  }
}

export async function fetchAnimesByStudioId(
  studioId: number, 
  page: number = 1, 
  sort: string[] = ['POPULARITY_DESC'],
  perPage: number = 20
): Promise<{ animes: Anime[], hasNextPage: boolean } | null> {
  const STUDIO_WORKS_QUERY = gql`
    ${ANIME_CARD_FIELDS}
    query ($studioId: Int, $page: Int, $perPage: Int, $sort: [MediaSort]) {
      Studio(id: $studioId) {
        media(page: $page, perPage: $perPage, sort: $sort, isMain: true) {
          pageInfo {
            hasNextPage
          }
          nodes {
            ...AnimeCardFields
          }
        }
      }
    }
  `;
  try {
    const data = await client.request<{ Studio: { media: { pageInfo: { hasNextPage: boolean }, nodes: Anime[] } } | null }>(
      STUDIO_WORKS_QUERY,
      { studioId, page, perPage, sort }
    );
    if (!data.Studio?.media) {
      return null;
    }
    return {
      animes: data.Studio.media.nodes,
      hasNextPage: data.Studio.media.pageInfo.hasNextPage
    };
  } catch (error: any) {
    console.error(`Erro ao buscar animes para o studio ID ${studioId}:`, error);
    return null;
  }
}

export async function fetchAiringSchedule(
  startOfWeek: number,
  endOfWeek: number
): Promise<AiringAnime[]> {
  const AIRING_SCHEDULE_QUERY = gql`
    query ($start: Int, $end: Int, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo {
          hasNextPage
        }
        airingSchedules(
          airingAt_greater: $start,
          airingAt_lesser: $end,
          sort: TIME
        ) {
          id
          episode
          airingAt
          media {
            id
            title {
              romaji
              english
            }
            coverImage {
              large
            }
          }
        }
      }
    }
  `;
  try {
    let allSchedules: AiringAnime[] = [];
    let page = 1;
    let hasNextPage = true;

    while(hasNextPage && page <= 2) {
        const data = await client.request<{ Page: { pageInfo: { hasNextPage: boolean }, airingSchedules: AiringAnime[] } }>(
            AIRING_SCHEDULE_QUERY,
            { start: startOfWeek, end: endOfWeek, page, perPage: 50 }
        );
        allSchedules.push(...data.Page.airingSchedules);
        hasNextPage = data.Page.pageInfo.hasNextPage;
        page++;
    }
    
    return allSchedules;
  } catch (error) {
    console.error(`Erro ao buscar a programação de animes:`, error);
    return [];
  }
}
