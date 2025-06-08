// src/components/PersonDetailsModal.tsx
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PersonDetails, Anime } from '@/lib/anilist';
import Image from 'next/image';
import Link from 'next/link';
import { useFilterStore } from '@/store/filterStore';
import { translateStaffRole } from '@/lib/translations';

// Ordem de importância dos cargos de Staff (com "Storyboard" adicionado)
const staffRoleOrder = [
  'Original Creator', 'Director', 'Series Director', 'Chief Director', 'Screenplay', 'Script',
  'Episode Director', 'Storyboard', 'Character Design', 'Art Director', 'Sound Director', 'Music',
  'Key Animation', 'Theme Song Performance', 'Insert Song Performance', 'Theme Song Composition', 
  'Theme Song Arrangement', 'Theme Song Lyrics'
];

// Helper para extrair o cargo base de uma string de cargo completa
// Usa a lista ordenada (do mais longo para o mais curto) para evitar correspondências erradas
const getBaseRole = (roleString: string, sortedRoleList: string[]): string => {
    const baseRole = sortedRoleList.find(r => roleString.startsWith(r));
    return baseRole || roleString;
}

export default function PersonDetailsModal() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const personId = searchParams.get('person');

  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const language = useFilterStore((state) => state.language);

  // Criamos uma versão da lista de cargos ordenada pelo comprimento da string (do maior para o menor)
  // Isso garante que "Series Director" seja verificado antes de "Director", corrigindo o bug sutil.
  const sortedStaffRoleOrderForMatching = useMemo(() =>
    [...staffRoleOrder].sort((a, b) => b.length - a.length),
  []);

  const handleClose = useCallback(() => {
    router.back();
  }, [router]);

  useEffect(() => {
    if (personId) {
      const fetchData = async () => {
        setIsLoading(true);
        setPerson(null);
        try {
          const res = await fetch(`/api/person/${personId}`);
          if (!res.ok) throw new Error('Falha ao buscar dados');
          const data = await res.json();
          setPerson(data);
        } catch (error) {
          console.error(error);
          handleClose();
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [personId, handleClose]);

  type UnifiedStaffRole = { anime: Anime; details: string[] };
  type GroupedAndUnifiedRoles = Record<string, Record<number, UnifiedStaffRole>>;

  const groupedAndUnifiedRoles = useMemo(() => {
    if (!person?.staffMedia?.edges) return {};

    const validEdges = person.staffMedia.edges.filter(edge => edge.node);

    return validEdges.reduce((acc, edge) => {
      const { staffRole, node: anime } = edge;
      // Usamos a lista ordenada para a detecção correta do cargo base
      const baseRole = getBaseRole(staffRole, sortedStaffRoleOrderForMatching);
      
      const details = staffRole.substring(baseRole.length).trim();

      if (!acc[baseRole]) {
        acc[baseRole] = {};
      }
      if (!acc[baseRole][anime.id]) {
        acc[baseRole][anime.id] = { anime, details: [] };
      }
      if (details) {
        acc[baseRole][anime.id].details.push(details);
      }
      
      return acc;
    }, {} as GroupedAndUnifiedRoles);
  }, [person, sortedStaffRoleOrderForMatching]);

  const sortedRoles = useMemo(() => {
    return Object.keys(groupedAndUnifiedRoles).sort((a, b) => {
        const indexA = staffRoleOrder.indexOf(a);
        const indexB = staffRoleOrder.indexOf(b);

        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });
  }, [groupedAndUnifiedRoles]);


  if (!personId) return null;

  return (
    <div onClick={handleClose} className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto bg-black/70 animate-fade-in">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl bg-background rounded-lg shadow-2xl relative animate-slide-up my-16">
        <button onClick={handleClose} className="absolute top-2 right-2 z-10 p-2 rounded-full bg-black/50 text-white hover:bg-black/80 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        {isLoading && (
          <div className="h-[50vh] flex justify-center items-center">
            <p className="text-text-secondary text-lg animate-pulse">{language === 'pt' ? 'Carregando detalhes...' : 'Loading details...'}</p>
          </div>
        )}

        {person && (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              <div className="w-32 h-32 sm:w-40 sm:h-40 relative flex-shrink-0 rounded-full overflow-hidden shadow-lg border-4 border-surface">
                <Image src={person.image.large} alt={person.name.full} fill className="object-cover" />
              </div>
              <div className="flex-grow text-center sm:text-left">
                <h1 className="text-3xl font-bold text-primary">{person.name.full}</h1>
                {person.description && (
                  <div className="prose prose-sm prose-invert text-text-secondary max-w-none mt-2" dangerouslySetInnerHTML={{ __html: person.description }} />
                )}
              </div>
            </div>

            {person.characterMedia?.edges?.length > 0 && (
              <section className="mt-8">
                <h2 className="text-2xl font-semibold mb-4 border-l-4 border-primary pl-3">{language === 'pt' ? 'Papéis (Voz)' : 'Voice Acting Roles'}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {person.characterMedia.edges.map(edge => {
                    const character = edge.characters[0];
                    const anime = edge.node;
                    if (!character || !anime) return null;
                    return (
                        <Link href={`/?anime=${anime.id}`} key={`${anime.id}-${character.id}`} scroll={false} className="bg-surface p-2 rounded-lg flex items-center gap-3 hover:bg-gray-800 transition-colors group">
                            <div className="w-16 h-16 relative flex-shrink-0 rounded-md overflow-hidden">
                                <Image src={anime.coverImage.extraLarge} alt={anime.title.romaji} fill className="object-cover" />
                            </div>
                            <div className="flex-grow min-w-0">
                                <p className="font-semibold text-text-main truncate group-hover:text-primary">{anime.title.romaji}</p>
                                <div className="flex items-center gap-2 mt-1 text-sm text-text-secondary">
                                    <div className="w-8 h-8 relative rounded-full overflow-hidden flex-shrink-0">
                                        <Image src={character.image.large} alt={character.name.full} fill className="object-cover" />
                                    </div>
                                    <p className="truncate">{character.name.full}</p>
                                </div>
                            </div>
                        </Link>
                    );
                })}
                </div>
              </section>
            )}

            {sortedRoles.length > 0 && (
              <section className="mt-12">
                <h2 className="text-2xl font-semibold mb-4 border-l-4 border-primary pl-3">{language === 'pt' ? 'Papéis (Staff)' : 'Staff Roles'}</h2>
                <div className="space-y-6">
                  {sortedRoles.map(role => (
                    <div key={role}>
                      <h3 className="font-bold text-lg text-text-secondary mb-2">
                        {language === 'pt' ? translateStaffRole(role) : role}
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-3 gap-y-4">
                        {Object.values(groupedAndUnifiedRoles[role])
                          .sort((a,b) => a.anime.title.romaji.localeCompare(b.anime.title.romaji))
                          .map(({ anime, details }) => (
                          <div key={anime.id} className="text-center">
                            <Link href={`/?anime=${anime.id}`} scroll={false} className="group block">
                              <div className="aspect-[2/3] relative rounded-md overflow-hidden shadow-lg transition-transform group-hover:-translate-y-1">
                                  <Image src={anime.coverImage.extraLarge} alt={anime.title.romaji} fill className="object-cover" />
                              </div>
                              <p className="text-xs mt-1.5 text-text-secondary truncate group-hover:text-primary">{anime.title.romaji}</p>
                            </Link>
                            {details.length > 0 && (
                                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                                    {details.join(', ')}
                                </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
            <div className="h-8"></div>
          </div>
        )}
      </div>
    </div>
  );
}