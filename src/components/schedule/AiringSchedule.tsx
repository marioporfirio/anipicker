// src/components/schedule/AiringSchedule.tsx

'use client';

import React, { useMemo, useState, useEffect, Fragment } from 'react';
import { AiringAnime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { useUserListStore, ListStatus } from '@/store/userListStore';
import { listButtonConfig, statusConfig } from '@/lib/translations';
import Image from 'next/image';
import Link from 'next/link';
import { Popover, Transition } from '@headlessui/react';
import clsx from 'clsx';

function StatusMenu({ animeId, currentStatus }: { animeId: number, currentStatus: ListStatus | null }) {
    const { language } = useFilterStore();
    const { toggleStatus } = useUserListStore();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    let leaveTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
        clearTimeout(leaveTimeout);
        setIsMenuOpen(true);
    };
    const handleMouseLeave = () => {
        leaveTimeout = setTimeout(() => {
            setIsMenuOpen(false);
        }, 100); 
    };

    return (
        <div 
            className="absolute top-1 left-1 z-20"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <Popover>
                <Popover.Button className="p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                </Popover.Button>
                <Transition
                    as={Fragment}
                    show={isMenuOpen}
                    enter="transition-[clip-path] duration-300 ease-out"
                    enterFrom="[clip-path:circle(0%_at_10px_10px)]"
                    enterTo="[clip-path:circle(150%_at_10px_10px)]"
                    leave="transition-[clip-path] duration-200 ease-in"
                    leaveFrom="[clip-path:circle(150%_at_10px_10px)]"
                    leaveTo="[clip-path:circle(0%_at_10px_10px)]"
                >
                    <Popover.Panel static className="absolute left-0 mt-1 w-max origin-top-left z-30">
                        <div className="overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className="relative flex flex-col bg-surface/80 backdrop-blur-lg border border-white/10 p-1">
                                {listButtonConfig.map(({ label, status }) => (
                                    <button
                                        key={status}
                                        onClick={() => {
                                            toggleStatus(animeId, status);
                                            setIsMenuOpen(false);
                                        }}
                                        className={clsx(
                                            'w-full text-left px-2 py-1 text-xs font-semibold rounded-sm transition-colors',
                                            currentStatus === status
                                                ? `${statusConfig[status].buttonColor} ${statusConfig[status].textColor}`
                                                : 'text-text-main hover:bg-surface'
                                        )}
                                    >
                                        {label[language]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </Popover.Panel>
                </Transition>
            </Popover>
        </div>
    );
}

function ScheduleItem({ anime, status }: { anime: AiringAnime; status: ListStatus | null }) {
    const statusColor = status ? statusConfig[status].borderColor : 'border-transparent';
    const airingDate = useMemo(() => new Date(anime.airingAt * 1000), [anime.airingAt]);
    const timeFormatted = airingDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="group relative animate-fade-in p-2 rounded-lg">
             <div className={clsx(
                "absolute inset-0 backdrop-blur-sm rounded-lg transition-opacity duration-300 pointer-events-none z-0 opacity-0 group-hover:opacity-15",
                {
                    'bg-green-500': status === 'WATCHING',
                    'bg-blue-500': status === 'COMPLETED',
                    'bg-yellow-500': status === 'PLANNED',
                    'bg-red-500': status === 'DROPPED',
                    'bg-purple-500': status === 'PAUSED',
                    'bg-gray-600': status === 'SKIPPING',
                    'bg-white': !status,
                }
            )}></div>

            <div className="relative z-10">
                <p className="text-sm font-semibold text-text-secondary mb-1 pl-1">{timeFormatted}</p>
                <div className="flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                        <Link href={`/?anime=${anime.media.id}`} scroll={false} className="block">
                            <div className={`relative w-24 h-36 rounded-md border-2 ${statusColor} transition-colors shadow-lg`}>
                                <Image
                                src={anime.media.coverImage.large}
                                alt={anime.media.title.romaji}
                                fill
                                sizes="96px"
                                className="object-cover rounded"
                                />
                            </div>
                        </Link>
                        <StatusMenu animeId={anime.media.id} currentStatus={status} />
                    </div>
                    <div className="min-w-0 flex-grow self-start">
                        <Link href={`/?anime=${anime.media.id}`} scroll={false}>
                                <p className="font-semibold text-sm text-text-main group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                                    {anime.media.title.romaji}
                                </p>
                        </Link>
                        <p className="text-sm text-text-secondary mt-1">Ep. {anime.episode}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

// >> INÍCIO DA CORREÇÃO: Estrutura do TimeLineMarker foi redesenhada <<
function TimeLineMarker({ time }: { time: Date }) {
    const timeFormatted = time.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return (
        <div className="flex items-center gap-2 my-4" aria-label={`Hora atual: ${timeFormatted}`}>
            {/* Linha da esquerda */}
            <div className="flex-grow h-px bg-red-500/80"></div>
            
            {/* Pílula de tempo centralizada */}
            <div className="flex-shrink-0 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
                {timeFormatted}
            </div>
            
            {/* Linha da direita */}
            <div className="flex-grow h-px bg-red-500/80"></div>
        </div>
    )
}
// >> FIM DA CORREÇÃO <<

type ScheduleDisplayItem = AiringAnime | { type: 'timeline' };

interface AiringScheduleProps {
    schedule: AiringAnime[];
    isLoading: boolean;
    currentDate: Date;
    onPrevWeek: () => void;
    onNextWeek: () => void;
    onToday: () => void;
}

export default function AiringSchedule({
    schedule,
    isLoading,
    currentDate,
    onPrevWeek,
    onNextWeek,
    onToday
}: AiringScheduleProps) {
    const { language } = useFilterStore();
    const { getAnimeStatus, statuses, skipAllWithoutStatus } = useUserListStore();
    const [now, setNow] = useState(new Date());
    const [isClient, setIsClient] = useState(false);
    const [calendarStatusFilter, setCalendarStatusFilter] = useState<ListStatus | null>(null);

    useEffect(() => {
        setIsClient(true);
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const filteredSchedule = useMemo(() => {
        if (!calendarStatusFilter) {
            return schedule;
        }
        if (calendarStatusFilter === 'WATCHING') {
            return schedule.filter(item => ['WATCHING', 'PLANNED'].includes(statuses[item.media.id] || ''));
        }
        return schedule.filter(item => statuses[item.media.id] === calendarStatusFilter);
    }, [schedule, calendarStatusFilter, statuses]);

    const animesByDay = useMemo(() => {
        const grouped: Record<number, ScheduleDisplayItem[]> = {};
        const todayIndex = now.getDay();

        for (let i = 0; i < 7; i++) grouped[i] = [];
        
        if(isClient) {
            filteredSchedule.forEach((item) => {
                const dayOfWeek = new Date(item.airingAt * 1000).getDay();
                if (grouped[dayOfWeek] != null) {
                    grouped[dayOfWeek].push(item);
                }
            });

            for (const day in grouped) {
                grouped[day].sort((a, b) => ((a as AiringAnime).airingAt || 0) - ((b as AiringAnime).airingAt || 0));
            }
            
            const startOfThisWeek = new Date(now);
            startOfThisWeek.setHours(0, 0, 0, 0);
            startOfThisWeek.setDate(startOfThisWeek.getDate() - todayIndex);
            
            const startOfDisplayedWeek = new Date(currentDate);
            startOfDisplayedWeek.setHours(0, 0, 0, 0);
            startOfDisplayedWeek.setDate(startOfDisplayedWeek.getDate() - startOfDisplayedWeek.getDay());

            const isCurrentWeek = startOfThisWeek.getTime() === startOfDisplayedWeek.getTime();
            
            if (isCurrentWeek && grouped[todayIndex]) {
                const todayAnimes = grouped[todayIndex] as AiringAnime[];
                let inserted = false;
                if(todayAnimes.length === 0){
                    (grouped[todayIndex] as ScheduleDisplayItem[]).push({ type: 'timeline' });
                    inserted = true;
                } else {
                    for (let i = 0; i < todayAnimes.length; i++) {
                        if (todayAnimes[i].airingAt * 1000 > now.getTime()) {
                            (grouped[todayIndex] as ScheduleDisplayItem[]).splice(i, 0, { type: 'timeline' });
                            inserted = true;
                            break;
                        }
                    }
                }

                if (!inserted) {
                    (grouped[todayIndex] as ScheduleDisplayItem[]).push({ type: 'timeline' });
                }
            }
        }

        return grouped;
    }, [filteredSchedule, now, isClient, currentDate]);

    const weekDayHeaders = useMemo(() => {
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
        
        const dayColors = [
            'text-red-400', 'text-orange-400', 'text-yellow-400', 
            'text-green-400', 'text-blue-400', 'text-indigo-400', 'text-purple-400'
        ];
        
        return Array.from({ length: 7 }).map((_, i) => {
            const day = new Date(startOfWeek);
            day.setDate(startOfWeek.getDate() + i);
            const dayName = day.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { weekday: 'short' });
            const monthName = day.toLocaleDateString(language === 'pt' ? 'pt-BR' : 'en-US', { month: 'short' });
            const dayOfMonth = day.getDate();
            const cleanDayName = dayName.replace('.','');
            const finalDayName = cleanDayName.charAt(0).toUpperCase() + cleanDayName.slice(1);
            const formattedDate = `${finalDayName} ${dayOfMonth} ${monthName.charAt(0).toUpperCase() + monthName.slice(1).replace('.','')}`;
            
            const isToday = day.toDateString() === new Date().toDateString();

            return {
                name: formattedDate,
                dayIndex: day.getDay(),
                isToday: isToday,
                color: dayColors[day.getDay()]
            };
        });
    }, [language, currentDate]);

    return (
        <section>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
                    <div className='flex items-center gap-4'>
                        <h2 className="text-2xl font-semibold border-l-4 border-accent pl-3">Calendário</h2>
                        <div className="flex items-center gap-2">
                            <button onClick={onPrevWeek} className="p-2 rounded-md hover:bg-surface">‹</button>
                            <button onClick={onToday} className="px-3 py-1 text-sm font-semibold rounded-md hover:bg-surface">Hoje</button>
                            <button onClick={onNextWeek} className="p-2 rounded-md hover:bg-surface">›</button>
                        </div>
                         <button
                            onClick={() => skipAllWithoutStatus(schedule)}
                            className="px-3 py-1 text-xs font-semibold rounded-md bg-gray-700 text-white hover:bg-gray-600 transition-colors"
                            title="Marcar todos os animes sem status como 'Skipping'"
                        >
                            Ignorar Restantes
                        </button>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                        <button 
                            onClick={() => setCalendarStatusFilter(null)} 
                            className={clsx(
                                'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
                                !calendarStatusFilter 
                                ? 'bg-cyan-neon text-black' 
                                : 'bg-surface text-text-secondary hover:bg-cyan-neon/20'
                            )}
                        >
                            Todos
                        </button>
                        {listButtonConfig.map(option => (
                            <button 
                                key={option.status} 
                                onClick={() => setCalendarStatusFilter(option.status)} 
                                className={clsx(
                                    'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
                                    calendarStatusFilter === option.status 
                                    ? `${statusConfig[option.status].buttonColor} ${statusConfig[option.status].textColor}`
                                    : 'bg-surface text-text-secondary hover:bg-cyan-neon/20'
                                )}
                            >
                                {option.label[language]}
                            </button>
                        ))}
                    </div>
            </div>

            <div className="bg-surface rounded-lg shadow-xl h-[75vh] overflow-y-auto relative">
                <div className="grid grid-cols-7 text-center font-bold sticky top-0 bg-surface/90 backdrop-blur-sm z-20">
                    {weekDayHeaders.map((day) => (
                        <div key={day.dayIndex} className={`py-3 border-b-4 ${day.isToday ? 'border-primary' : 'border-transparent'}`}>
                            <span className={`${day.isToday ? 'text-primary' : day.color}`}>{day.name}</span>
                        </div>
                    ))}
                </div>
                
                {isLoading && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex justify-center items-center z-30">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                )}
                
                <div className="grid grid-cols-7 items-start">
                    {isClient && weekDayHeaders.map((day) => (
                        <div key={day.dayIndex} className="flex flex-col gap-4 p-2">
                            {animesByDay[day.dayIndex]?.map((item, index) => {
                            if ('type' in item && item.type === 'timeline') {
                                return <TimeLineMarker key={`timeline-${index}`} time={now} />;
                            }
                            const anime = item as AiringAnime;
                            return <ScheduleItem key={anime.id} anime={anime} status={getAnimeStatus(anime.media.id)} />;
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}