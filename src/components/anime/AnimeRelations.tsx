// src/components/anime/AnimeRelations.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { AnimeRelationEdge, MediaRelationType } from '@/lib/anilist'; // Adjusted import path

interface AnimeRelationsProps {
  relations: {
    edges: AnimeRelationEdge[];
  };
  currentAnimeId: number;
  onClose: () => void; // To close current modal and open new one
}

// Helper function to format relation type
function formatRelationType(relationType: MediaRelationType): string {
  switch (relationType) {
    case 'ADAPTATION': return 'Adaptação';
    case 'PREQUEL': return 'Prequel';
    case 'SEQUEL': return 'Sequel';
    case 'PARENT': return 'História Principal';
    case 'SIDE_STORY': return 'História Paralela';
    case 'CHARACTER': return 'Personagem';
    case 'SUMMARY': return 'Resumo';
    case 'ALTERNATIVE': return 'Alternativo';
    case 'SPIN_OFF': return 'Spin-Off';
    case 'OTHER': return 'Outro';
    case 'SOURCE': return 'Original'; // Changed from 'Fonte' to 'Original' for clarity as it's usually manga/novel
    case 'COMPILATION': return 'Compilação';
    case 'CONTAINS': return 'Contém';
    default:
      // Fallback for any unhandled relation types (should ideally not happen with MediaRelationType)
      // Cast to string to satisfy .replace, and explicitly type 'txt'
      const relationStr = relationType as string;
      return relationStr.replace(/_/g, ' ').replace(/\w\S*/g, (txt: string) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}

// Helper function to format media status
function formatMediaStatus(status: string | undefined): string {
  if (!status) return 'N/A';
  switch (status) {
    case 'FINISHED': return 'Finalizado';
    case 'RELEASING': return 'Em Lançamento';
    case 'NOT_YET_RELEASED': return 'Não Lançado';
    case 'CANCELLED': return 'Cancelado';
    case 'HIATUS': return 'Em Hiato';
    default: return status;
  }
}

export default function AnimeRelations({ relations, currentAnimeId, onClose }: AnimeRelationsProps) {
  if (!relations?.edges?.length) {
    return <p className="text-center text-text-secondary mt-4">Nenhuma relação encontrada.</p>;
  }

  return (
    <div className="mt-6">
      <h3 className="text-xl font-semibold text-text-main mb-3">Relações</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {relations.edges.map((edge) => {
          if (!edge.node) return null; // Skip if node is null
          const { node, relationType } = edge;
          
          // Prevent linking to the same anime page from relations
          const isCurrentAnime = node.id === currentAnimeId;

          return (
            <div key={`${relationType}-${node.id}`} className="bg-surface-alt rounded-lg shadow overflow-hidden">
              <Link 
                href={isCurrentAnime ? '#' : `/?anime=${node.id}`} 
                onClick={isCurrentAnime ? (e) => e.preventDefault() : undefined} // Let Link handle navigation if not current anime
                className={`block group ${isCurrentAnime ? 'cursor-default' : ''}`}
                scroll={false}
              >
                <div className="relative w-full h-32">
                  {node.coverImage?.extraLarge && (
                    <Image
                      src={node.coverImage.extraLarge}
                      alt={node.title.romaji || node.title.english || 'Anime Cover'}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:opacity-80 transition-opacity"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent p-2 flex flex-col justify-end">
                    <h4 className="text-sm font-semibold text-white truncate group-hover:underline" title={node.title.romaji || node.title.english || ''}>
                      {node.title.romaji || node.title.english || 'Título Desconhecido'}
                    </h4>
                  </div>
                </div>
              </Link>
              <div className="p-3">
                <p className="text-xs font-semibold text-primary mb-1">{formatRelationType(relationType)}</p>
                <p className="text-xs text-text-secondary mb-2"> {/* Added mb-2 for spacing */}
                  {node.format?.replace(/_/g, ' ') || 'Formato N/A'} · {formatMediaStatus(node.status as string | undefined)}
                </p>

                {/* Display Level 2 Relations */}
                {node.relations && node.relations.edges.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700/50">
                    <h5 className="text-xs font-semibold text-text-main mb-1">Sub-Relações:</h5>
                    <div className="space-y-1 pl-2">
                      {node.relations.edges.map((edgeL2) => {
                        if (!edgeL2.node) return null;
                        const isL2CurrentAnime = edgeL2.node.id === currentAnimeId;
                        return (
                          <div key={`${edgeL2.relationType}-${edgeL2.node.id}`} className="text-xs">
                            <span className="text-accent-secondary">{formatRelationType(edgeL2.relationType)}: </span>
                            <Link
                              href={isL2CurrentAnime ? '#' : `/?anime=${edgeL2.node.id}`}
                              onClick={isL2CurrentAnime ? (e) => e.preventDefault() : undefined} // Let Link handle navigation
                              className={`hover:underline ${isL2CurrentAnime ? 'cursor-default text-text-secondary' : 'text-text-main'}`}
                              scroll={false}
                            >
                              {edgeL2.node.title.romaji || edgeL2.node.title.english || 'Título Desconhecido'}
                            </Link>
                            <span className="text-xxs text-gray-400 ml-1">
                              ({edgeL2.node.format?.replace(/_/g, ' ') || 'N/A'} · {formatMediaStatus(edgeL2.node.status as string | undefined)})
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
