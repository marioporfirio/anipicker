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
            // Garante que o estado de loading esteja ativo no início da busca
            setIsLoading(true); 
            try {
                const response = await fetch('/api/recommendations', {
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
                } else {
                    // Se a API falhar, garante que a lista fique vazia
                    setRecommendations([]);
                }
            } catch (error) {
                console.error("Failed to fetch recommendations", error);
                setRecommendations([]);
            } finally {
                // Termina o loading apenas no final de todo o processo
                setIsLoading(false);
            }
        };

        if (anime.genres && anime.averageScore) {
            fetchRecommendations();
        } else {
            // Se não houver dados para buscar, simplesmente para de carregar
            setIsLoading(false);
        }
    }, [anime.id, anime.genres, anime.averageScore]);

    // >> INÍCIO DA CORREÇÃO NA LÓGICA DE RENDERIZAÇÃO <<

    // Se estiver carregando, sempre mostre o esqueleto.
    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8 mt-8">
                <h3 className="text-xl font-bold text-text-main mb-4 border-t border-surface pt-6">Você também pode gostar de...</h3>
                <div className="flex space-x-4 overflow-x-auto pb-4 -mx-4 px-4 recommendations-scrollbar">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-52 animate-pulse">
                            <div className="aspect-[2/3] bg-surface rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Se NÃO estiver carregando E a lista estiver vazia, não mostre nada.
    if (!isLoading && recommendations.length === 0) {
        return null;
    }

    // Se chegou até aqui, significa que não está carregando E tem recomendações.
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
                            priority={index < 5}
                            rank={index + 1}
                            maxRank={recommendations.length}
                            isRanked={false}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
    // >> FIM DA CORREÇÃO <<
}