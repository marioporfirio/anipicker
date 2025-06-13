// =================================================================
// ============== ARQUIVO: src/app/page-client.tsx =================
// =================================================================
'use client';

import { useState, useEffect } from 'react';
import MainContent from '@/components/MainContent';
import { fetchAiringSchedule, AiringAnime, Anime } from '@/lib/anilist';

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

  useEffect(() => {
    const today = new Date();
    if (currentDate.toDateString() === today.toDateString()) {
      setAiringSchedule(initialSchedule);
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
  }, [currentDate, initialSchedule]);

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
  );
}