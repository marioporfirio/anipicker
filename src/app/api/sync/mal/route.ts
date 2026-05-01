import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ListStatus } from '@/store/userListStore';

const STATUS_MAP: Record<string, ListStatus> = {
  watching: 'WATCHING',
  completed: 'COMPLETED',
  on_hold: 'PAUSED',
  dropped: 'DROPPED',
  plan_to_watch: 'PLANNED',
};

// 25 per batch is safer — AniList Page(perPage:50) can miss results at the edge
const BATCH_SIZE = 25;
const BATCH_DELAY_MS = 400;

const ANILIST_QUERY = `
  query ($ids: [Int]) {
    Page(perPage: 25) {
      media(idMal_in: $ids, type: ANIME) { id idMal }
    }
  }
`;

interface MalEntry {
  node: { id: number };
  list_status: { status: string; score: number };
}

async function fetchAllMalEntries(token: string): Promise<MalEntry[]> {
  const entries: MalEntry[] = [];
  let offset = 0;

  while (true) {
    const url = `https://api.myanimelist.net/v2/users/@me/animelist?fields=list_status&limit=1000&offset=${offset}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`MAL API ${res.status}: ${body}`);
    }

    const data = await res.json();
    if (!Array.isArray(data.data) || data.data.length === 0) break;
    entries.push(...data.data);
    if (!data.paging?.next) break;
    offset += 1000;
  }

  return entries;
}

async function buildIdMap(malIds: number[]): Promise<Map<number, number>> {
  const map = new Map<number, number>();

  const chunks: number[][] = [];
  for (let i = 0; i < malIds.length; i += BATCH_SIZE) {
    chunks.push(malIds.slice(i, i + BATCH_SIZE));
  }

  for (let i = 0; i < chunks.length; i++) {
    if (i > 0) await new Promise(r => setTimeout(r, BATCH_DELAY_MS));

    const res = await fetch('https://graphql.anilist.co', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: ANILIST_QUERY, variables: { ids: chunks[i] } }),
    });

    if (!res.ok) {
      console.warn(`AniList batch ${i} failed: ${res.status}`);
      continue;
    }

    const json = await res.json();
    for (const media of json.data?.Page?.media ?? []) {
      if (media.idMal) map.set(media.idMal, media.id);
    }
  }

  return map;
}

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('mal_token')?.value;

  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  try {
    const entries = await fetchAllMalEntries(token);
    console.log(`MAL sync: ${entries.length} entries fetched`);

    const malIds = [...new Set(entries.map(e => e.node.id))];
    const idMap = await buildIdMap(malIds);
    console.log(`MAL sync: ${idMap.size}/${malIds.length} IDs converted to AniList`);

    const statuses: Record<number, ListStatus> = {};
    const ratings: Record<number, number> = {};

    for (const entry of entries) {
      const anilistId = idMap.get(entry.node.id);
      if (!anilistId) continue;

      const mapped = STATUS_MAP[entry.list_status.status];
      if (mapped) statuses[anilistId] = mapped;
      if (entry.list_status.score > 0) ratings[anilistId] = entry.list_status.score;
    }

    const synced = Object.keys(statuses).length;
    console.log(`MAL sync: ${synced} anime synced`);

    return NextResponse.json({ statuses, ratings, favorites: [], _debug: { fetched: entries.length, converted: idMap.size, synced } });
  } catch (err) {
    console.error('MAL sync error:', err);
    return NextResponse.json({ error: String(err) }, { status: 502 });
  }
}
