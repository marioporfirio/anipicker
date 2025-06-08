// src/components/GenreFilter.tsx
import { getGenres } from '@/lib/anilist';
import GenreFilterClient from './GenreFilterClient';

export default async function GenreFilter() {
  const allGenres = await getGenres();

  return <GenreFilterClient allGenres={allGenres} />;
}