// =================================================================
// ============== ARQUIVO: src/components/anime/RecommendedAnimeList.tsx ==============
// =================================================================
'use client'

import { useState, useEffect } from 'react';
import { Anime, AnimeDetails } from '@/lib/anilist';
import AnimeCard from '../AnimeCard';

interface RecommendedAnimeListProps {
    anime: AnimeDetails;
}

export default function RecommendedAnimeList({ anime }: RecommendedAnimeListProps) {
    const [recommendations, setRecommendations] = useState<Anime[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/anime/recommendations', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        genres: anime.genres,
                        averageScore: anime.averageScore,
                        excludeId: anime.id,
                    }),
                });
                if (response.ok) {
                    const data = await response.json();
                    setRecommendations(data);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (anime.genres && anime.averageScore) {
            fetchRecommendations();
        } else {
            setIsLoading(false);
        }
    }, [anime.id, anime.genres, anime.averageScore]);

    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 mt-8">
                <h3 className="text-xl font-bold text-text-main mb-4 border-t border-surface pt-6">Você também pode gostar de...</h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4">
                    {[...Array(5)].map((_, i) => (
                           <div key={i} className="flex-shrink-0 w-52 animate-pulse">
                                {/* Aqui não precisamos passar AnimeCardProps, pois é um placeholder */}
                                <div className="aspect-[2/3] bg-surface rounded-lg"></div>
                           </div>
                    ))}
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8 mt-8">
            <h3 className="text-xl font-bold text-text-main mb-4 border-t border-surface pt-6">
                Você também pode gostar de...
            </h3>
            <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 recommendations-scrollbar" >
                {recommendations.map((rec, index) => (
                    <div key={rec.id} className="flex-shrink-0 w-52">
                       <AnimeCard
                            anime={rec}
                            priority={index < 5} // Prioriza os primeiros 5 para carregamento rápido
                            rank={index + 1} // Posição do anime na lista
                            maxRank={recommendations.length} // Total de recomendações
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}