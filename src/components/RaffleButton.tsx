// src/components/RaffleButton.tsx
'use client';

import { useState } from 'react';
import { useFilterStore } from '@/store/filterStore';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { raffleModeTranslations } from '@/lib/translations';

export default function RaffleButton() {
  const { language, toggleRaffleMode, ...filters } = useFilterStore();
  const router = useRouter();
  const [isRaffling, setIsRaffling] = useState(false);
  const t = raffleModeTranslations[language];

  const handleRaffle = async () => {
    setIsRaffling(true);
    try {
      const res = await fetch('/api/anime/random', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(filters),
      });

      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.error || t.noResults);
        return;
      }

      const randomAnime = await res.json();
      if (randomAnime.id) {
        toggleRaffleMode();
        router.push(`/?anime=${randomAnime.id}`, { scroll: false });
      } else {
        toast.error(t.noResults);
      }
    } catch (error) {
      console.error("Raffle error:", error);
      toast.error(language === 'pt' ? 'Ocorreu um erro de rede.' : 'A network error occurred.');
    } finally {
      setTimeout(() => setIsRaffling(false), 1500);
    }
  };

  return (
    <button
      onClick={handleRaffle}
      disabled={isRaffling}
      className="bg-primary text-white font-bold py-2 px-5 rounded-lg text-md hover:bg-sky-500 transition-colors disabled:bg-gray-500 disabled:cursor-wait flex items-center justify-center gap-2 animate-fade-in"
    >
      {isRaffling ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
          {t.raffling}
        </>
      ) : (
        `🍀 ${t.button}`
      )}
    </button>
  );
}