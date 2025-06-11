// src/components/RaffleButton.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useFilterStore } from '@/store/filterStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { raffleModeTranslations } from '@/lib/translations';

export default function RaffleButton() {
  const { language, ...filters } = useFilterStore((state) => ({
    language: state.language,
    search: state.search,
    yearRange: state.yearRange,
    scoreRange: state.scoreRange,
    genres: state.genres,
    tags: state.tags,
    sortBy: state.sortBy,
    sortDirection: state.sortDirection,
    formats: state.formats,
    sources: state.sources,
    includeTBA: state.includeTBA,
    statuses: state.statuses,
    excludeNoScore: state.excludeNoScore,
  }));
  const router = useRouter();
  const [isRaffling, setIsRaffling] = useState(false);
  const t = raffleModeTranslations[language];
  const raffleLabel = language === 'pt' ? 'Sortear Anime' : 'Raffle Anime';

  const handleRaffle = async () => {
    setIsRaffling(true);
    toast.loading(t.raffling, { id: 'raffle-toast' });

    try {
      const res = await fetch('/api/anime/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || t.noResults, { id: 'raffle-toast' });
        return;
      }

      const randomAnime = await res.json();
      if (randomAnime.id) {
        toast.success(language === 'pt' ? 'Anime sorteado!' : 'Anime raffled!', { id: 'raffle-toast' });
        router.push(`/?anime=${randomAnime.id}`, { scroll: false });
      } else {
        toast.error(t.noResults, { id: 'raffle-toast' });
      }
    } catch (error) {
      console.error("Raffle error:", error);
      toast.error(language === 'pt' ? 'Ocorreu um erro de rede.' : 'A network error occurred.', { id: 'raffle-toast' });
    } finally {
      setIsRaffling(false);
    }
  };

  return (
    <button
      onClick={handleRaffle}
      disabled={isRaffling}
      className="p-2 bg-surface text-text-secondary rounded-lg hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-wait"
      title={raffleLabel}
    >
      {isRaffling ? (
        <svg className="animate-spin h-7 w-7 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <Image
            src="/gambler-luck.svg"
            alt="Sortear"
            width={28}
            height={28}
            // CORREÇÃO: Removida a classe 'filter invert'
        />
      )}
    </button>
  );
}