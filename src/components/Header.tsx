// src/components/Header.tsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFilterStore } from '@/store/filterStore';
import RaffleButton from './RaffleButton';

export default function Header() {
  const { 
    language, 
    setLanguage, 
    resetAllFilters,
    viewMode,
    setViewMode,
  } = useFilterStore();

  const toggleLanguage = () => {
    const newLang = language === 'pt' ? 'en' : 'pt';
    setLanguage(newLang);
  };

  const handleLogoClick = () => {
    setViewMode('grid');
  };

  const scheduleLabel = language === 'pt' ? 'Calendário' : 'Schedule';
  const resetLabel = language === 'pt' ? 'Limpar Filtros' : 'Reset Filters';
  const languageLabel = language === 'pt' ? 'Mudar para Inglês' : 'Switch to Portuguese';

  // Estilo base para os botões de ícone
  const iconButtonClass = "p-2 bg-surface text-text-secondary rounded-lg hover:bg-primary/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary";
  const activeIconButtonClass = "bg-primary/20";

  return (
    <header className="bg-surface sticky top-0 z-40 shadow-md">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" onClick={handleLogoClick} className="text-primary font-bold text-2xl">
              AniPicker
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            
            <button
              onClick={() => setViewMode(viewMode === 'schedule' ? 'grid' : 'schedule')}
              className={`${iconButtonClass} ${viewMode === 'schedule' ? activeIconButtonClass : ''}`}
              title={scheduleLabel}
            >
              <Image
                src="/calendar.svg"
                alt="Calendário"
                width={28}
                height={28}
              />
            </button>
            
            <RaffleButton />

            <button
              onClick={resetAllFilters}
              className={iconButtonClass}
              title={resetLabel}
            >
              <Image
                src="/clear-filters.svg"
                alt="Limpar Filtros"
                width={28}
                height={28}
              />
            </button>
            
            {/* CORREÇÃO: Adicionadas as classes de hover ao botão da bandeira */}
            <button
              onClick={toggleLanguage}
              className={`${iconButtonClass} hover:text-primary`} // Adicionado hover:text-primary para consistência, embora não afete a imagem
              title={languageLabel}
            >
              <Image
                src={language === 'pt' ? '/flag-br.svg' : '/flag-us.svg'}
                alt={language === 'pt' ? 'Bandeira do Brasil' : 'Bandeira dos EUA'}
                width={28}
                height={28}
                className="rounded-sm"
              />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}