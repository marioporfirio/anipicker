'use client';

import { useState, useEffect, Suspense, useCallback } from 'react';
import MainContent from '@/components/MainContent';
import { AiringAnime, Anime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { useUiStore } from '@/store/uiStore';
import { getWeekRange } from '@/lib/utils';
import ImportModal from '@/components/modals/ImportModal';
import ModalController from '@/components/ModalController';

interface PageClientProps {
    initialAnimes: Anime[];
    initialSchedule: AiringAnime[];
    filtersComponent: React.ReactNode;
}

export default function PageClient({ initialAnimes, initialSchedule, filtersComponent }: PageClientProps) {
  const [airingSchedule, setAiringSchedule] = useState<AiringAnime[]>(initialSchedule);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const { isImportModalOpen } = useUiStore();

  useEffect(() => {
    const isSameWeek = (dateA: Date, dateB: Date) => {
        const startA = getWeekRange(dateA).start;
        const startB = getWeekRange(dateB).start;
        return startA === startB;
    }

    if (isSameWeek(currentDate, new Date())) {
      setAiringSchedule(initialSchedule);
      return;
    }

    const getScheduleData = async () => {
      setIsLoading(true);
      const { start, end } = getWeekRange(currentDate);
      try {
        const res = await fetch(`/api/schedule?start=${start}&end=${end}`);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Falha ao buscar o calendário da API interna:", errorData.message || res.statusText);
          setAiringSchedule([]);
        } else {
          const scheduleData = await res.json();
          setAiringSchedule(scheduleData);
        }
      } catch (error) {
        console.error("Erro de rede ao buscar calendário:", error);
        setAiringSchedule([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    getScheduleData();
  }, [currentDate, initialSchedule]);

  const handlePrevWeek = useCallback(() => {
    setCurrentDate(d => {
        const newDate = new Date(d);
        newDate.setDate(d.getDate() - 7);
        return newDate;
    });
  }, []);

  const handleNextWeek = useCallback(() => {
    setCurrentDate(d => {
        const newDate = new Date(d);
        newDate.setDate(d.getDate() + 7);
        return newDate;
    });
  }, []);

  const handleToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

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
      
      <Suspense fallback={null}>
        <ModalController />
      </Suspense>

      {isImportModalOpen && <ImportModal />}
    </>
  );
}