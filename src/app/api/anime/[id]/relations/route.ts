// src/app/api/anime/[id]/relations/route.ts
import { NextResponse } from 'next/server';
import { fetchFromAnilist } from '@/lib/anilist';

const RELATIONS_QUERY = `
query GetAnimeRelations($id: Int) {
  Media(id: $id, type: ANIME) {
    id
    relations {
      edges {
        relationType(version: 2)
        node {
          id
          title {
            romaji
            english
          }
          coverImage {
            extraLarge
            color
          }
          type
          format
          status
          startDate {
            year
            month
            day
          }
        }
      }
    }
  }
}
`;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = parseInt(params.id, 10);

  if (isNaN(id)) {
    return NextResponse.json({ error: 'Invalid anime ID' }, { status: 400 });
  }

  try {
    const data = await fetchFromAnilist(RELATIONS_QUERY, { id });

    if (data.errors) {
      console.error('AniList API errors:', data.errors);
      // Check for a specific "not found" error, if anilist provides one
      if (data.errors.some((err: any) => err.status === 404)) {
        return NextResponse.json({ error: 'Anime not found' }, { status: 404 });
      }
      return NextResponse.json({ error: 'Failed to fetch data from AniList', details: data.errors }, { status: 500 });
    }

    if (!data.data?.Media?.relations?.edges) {
      // This could mean the anime exists but has no relations, which is not an error
      // Or it could mean the anime wasn't found (if not caught by error status 404 above)
      // For now, assume no relations if Media object is there but no edges.
      if (data.data?.Media) {
        return NextResponse.json([], { status: 200 }); 
      }
      return NextResponse.json({ error: 'Anime not found or no relations data' }, { status: 404 });
    }

    const relations = data.data.Media.relations.edges.map((edge: any) => ({
      relationType: edge.relationType,
      anime: edge.node,
    }));

    return NextResponse.json(relations, { status: 200 });
  } catch (error) {
    console.error('Error fetching anime relations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
