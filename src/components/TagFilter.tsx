// src/components/TagFilter.tsx
import { getTags } from '@/lib/anilist';
import TagFilterClient from './TagFilterClient';

export default async function TagFilter() {
  const allTags = await getTags();
  return <TagFilterClient allTags={allTags} />;
}