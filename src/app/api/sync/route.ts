import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ListStatus } from '@/store/userListStore';

const MEDIA_LIST_QUERY = `
  query ($userId: Int) {
    MediaListCollection(userId: $userId, type: ANIME) {
      lists {
        name
        entries {
          mediaId
          status
          score(format: POINT_100)
        }
      }
    }
    User(id: $userId) {
      favourites {
        anime {
          nodes { id }
        }
      }
    }
  }
`;

const statusMap: Record<string, ListStatus> = {
  CURRENT: 'WATCHING',
  COMPLETED: 'COMPLETED',
  PLANNING: 'PLANNED',
  DROPPED: 'DROPPED',
  PAUSED: 'PAUSED',
  REPEATING: 'WATCHING',
};

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('anilist_token')?.value;
  const userCookie = cookieStore.get('anilist_user')?.value;

  if (!token || !userCookie) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let userId: number;
  try {
    userId = JSON.parse(userCookie).id;
  } catch {
    return NextResponse.json({ error: 'Invalid user session' }, { status: 401 });
  }

  const res = await fetch('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query: MEDIA_LIST_QUERY, variables: { userId } }),
  });

  if (!res.ok) {
    return NextResponse.json({ error: 'AniList request failed' }, { status: 502 });
  }

  const { data } = await res.json();

  const statuses: Record<number, ListStatus> = {};
  const ratings: Record<number, number> = {};

  for (const list of data.MediaListCollection.lists) {
    for (const entry of list.entries) {
      if (!entry?.mediaId) continue;
      const mapped = statusMap[entry.status];
      if (mapped) statuses[entry.mediaId] = mapped;
      if (entry.score > 0) ratings[entry.mediaId] = entry.score / 10;
    }
  }

  const favorites: number[] = (data.User?.favourites?.anime?.nodes ?? []).map(
    (n: { id: number }) => n.id
  );

  return NextResponse.json({ statuses, ratings, favorites });
}
