// =================================================================
// ============== ARQUIVO: src/app/page-client.tsx =================
// =================================================================
'use client';

import { useState, useEffect, Suspense } from 'react';
import MainContent from '@/components/MainContent';
import { fetchAiringSchedule, AiringAnime, Anime } from '@/lib/anilist';
import { useSearchParams } from 'next/navigation';
import { useFilterStore } from '@/store/filterStore';
import StudioWorksModal from '@/components/StudioWorksModal';
import ImportModal from '@/components/modals/ImportModal';

// Componente interno para lidar com a lógica dos parâmetros de URL de forma limpa
function ModalRenderer() {
  const searchParams = useSearchParams();
  const studioId = searchParams.get('studioId');
  const studioName = searchParams.get('studioName');

  if (studioId && studioName) {
    return (
      <StudioWorksModal
        studioId={Number(studioId)}
        studioName={studioName}
      />
    );
  }

  return null;
}

const getWeekRange = (date: Date) => {
  const startOfWeek = new Date(date);
  startOfWeek.setDate(date.getDate() - date.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  endOfWeek.setSeconds(endOfWeek.getSeconds() - 1);

  return {
    start: Math.floor(startOfWeek.getTime() / 1000),
    end: Math.floor(endOfWeek.getTime() / 1000),
  };
};

interface PageClientProps {
    initialAnimes: Anime[];
    initialSchedule: AiringAnime[];
    filtersComponent: React.ReactNode;
}

export default function PageClient({ initialAnimes, initialSchedule, filtersComponent }: PageClientProps) {
  const [airingSchedule, setAiringSchedule] = useState<AiringAnime[]>(initialSchedule);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Hook para ler o estado da modal de importação
  const { isImportModalOpen } = useFilterStore();

  useEffect(() => {
    const today = new Date();
    if (currentDate.toDateString() === today.toDateString()) {
      if(airingSchedule !== initialSchedule) setAiringSchedule(initialSchedule);
      return;
    }

    const getScheduleData = async () => {
      setIsLoading(true);
      const { start, end } = getWeekRange(currentDate);
      const schedule = await fetchAiringSchedule(start, end);
      setAiringSchedule(schedule);
      setIsLoading(false);
    };
    
    getScheduleData();
  }, [currentDate, initialSchedule, airingSchedule]);

  const handlePrevWeek = () => {
    setCurrentDate(d => {
        const newDate = new Date(d);
        newDate.setDate(d.getDate() - 7);
        return newDate;
    });
  };

  const handleNextWeek = () => {
    setCurrentDate(d => {
        const newDate = new Date(d);
        newDate.setDate(d.getDate() + 7);
        return newDate;
    });
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <>
      <MainContent
        initialAnimes={initialAnimes}
        airingSchedule={airingSchedule}
        isLoadingSchedule={isLoading}
        currentDate={currentDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
        onToday={handleToday}
        filtersComponent={filtersComponent}
      />
      
      {/* Renderização condicional para ambas as modais */}
      <Suspense fallback={null}>
        <ModalRenderer />
      </Suspense>

      {isImportModalOpen && <ImportModal />}
    </>
  );
}