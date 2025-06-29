// =================================================================
// ============== ARQUIVO: src/components/Header.tsx ===============
// =================================================================
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useFilterStore } from '@/store/filterStore';
import RaffleButton from './RaffleButton';
import { Fragment, useState } from 'react';
import { Popover, Transition } from '@headlessui/react';
import { useUserListStore } from '@/store/userListStore';

function ListsDropdown() {
    const { customLists, createList, deleteList } = useUserListStore();
    const { activeListId, setActiveListId } = useFilterStore();
    const [newListName, setNewListName] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    let leaveTimeout: NodeJS.Timeout;

    const handleMouseEnter = () => {
        clearTimeout(leaveTimeout);
        setIsOpen(true);
    };

    const handleMouseLeave = () => {
        leaveTimeout = setTimeout(() => {
            setIsOpen(false);
        }, 200);
    };

    const handleCreateList = (e: React.FormEvent) => {
        e.preventDefault();
        if (newListName.trim()) {
            createList(newListName.trim());
            setNewListName('');
        }
    };

    return (
        <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <Popover className="relative">
                <Popover.Button as="div" className={`p-2 bg-surface text-text-secondary rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary ${isOpen || (activeListId && activeListId !== 'favorites') ? 'bg-primary/20 text-primary' : 'hover:bg-primary/20'}`} title="Minhas Listas">
                    <Image src="/list.svg" alt="Minhas Listas" width={28} height={28} unoptimized />
                </Popover.Button>
                <Transition
                    as={Fragment}
                    show={isOpen}
                    enter="transition ease-out duration-200"
                    enterFrom="opacity-0 translate-y-1"
                    enterTo="opacity-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="opacity-100 translate-y-0"
                    leaveTo="opacity-0 translate-y-1"
                >
                    <Popover.Panel static className="absolute right-0 mt-2 w-80 origin-top-right z-50">
                        <div className="overflow-hidden rounded-md shadow-lg ring-1 ring-black ring-opacity-5 bg-surface">
                            <div className="p-3">
                                <h3 className="text-md font-bold text-primary mb-2">Minhas Listas</h3>
                                <form onSubmit={handleCreateList} className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={newListName}
                                        onChange={(e) => setNewListName(e.target.value)}
                                        placeholder="Nova lista..."
                                        className="flex-grow bg-background text-text-main px-2 py-1.5 text-sm rounded-md border border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary"
                                    />
                                    <button type="submit" className="bg-primary text-white font-semibold px-3 rounded-md hover:bg-primary-dark transition-colors shrink-0 text-sm">Criar</button>
                                </form>
                                <div className="max-h-60 overflow-y-auto pr-1">
                                    {customLists.filter(list => list.id !== 'favorites').map(list => (
                                        <div key={list.id} className={`w-full text-left p-2 rounded-md font-semibold text-sm flex items-center justify-between gap-2 transition-colors group ${activeListId === list.id ? 'bg-primary/20' : 'hover:bg-primary/20'}`}>
                                            <button onClick={() => { setActiveListId(list.id); setIsOpen(false); }} className={`flex-grow flex items-center gap-2 text-left ${activeListId === list.id ? 'text-primary' : 'text-text-secondary group-hover:text-primary'}`}>
                                                <Image src="/list.svg" alt="Ícone de lista" width={16} height={16} unoptimized /> <span>{list.name}</span>
                                            </button>
                                            {list.id !== 'favorites' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        if (window.confirm(`Tem certeza que deseja apagar a lista "${list.name}"?`)) {
                                                            deleteList(list.id);
                                                        }
                                                    }}
                                                    className="p-1 rounded-full text-text-secondary opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-opacity"
                                                    title="Apagar lista"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Popover.Panel>
                </Transition>
            </Popover>
        </div>
    );
}

export default function Header() {
  const { 
    language, setLanguage, resetAllFilters, viewMode, setViewMode,
    setActiveListId, activeListId,
    toggleImportModal // ✨ Pega a ação para abrir a modal
  } = useFilterStore();

  const handleLogoClick = () => {
    setViewMode('grid');
    resetAllFilters();
  };

  const iconButtonClass = "p-2 bg-surface text-text-secondary rounded-lg hover:bg-primary/20 hover:text-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary";
  const activeIconButtonClass = "bg-primary/20 text-primary";

  return (
    <header className="bg-surface sticky top-0 z-40 shadow-lg shadow-black/20">
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-4">
            <Link href="/" onClick={handleLogoClick} className="h-full w-48 relative">
              <Image 
                src="/logo.png" 
                alt="AniPicker Logo" 
                width={250}
                height={80}
                className="object-contain object-left"
                priority 
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            
            <button
              onClick={() => setViewMode('schedule')}
              className={`${iconButtonClass} ${viewMode === 'schedule' ? activeIconButtonClass : ''}`}
              title={language === 'pt' ? 'Calendário' : 'Schedule'}
            >
              <Image src="/calendar.svg" alt="Calendário" width={28} height={28} unoptimized />
            </button>

            <button
              onClick={() => setActiveListId('favorites')}
              className={`${iconButtonClass} ${viewMode === 'list' && activeListId === 'favorites' ? activeIconButtonClass : ''}`}
              title={language === 'pt' ? 'Favoritos' : 'Favorites'}
            >
              <Image src="/favorites.svg" alt="Favoritos" width={28} height={28} unoptimized />
            </button>
            
            <ListsDropdown />

            <RaffleButton />

            <button onClick={resetAllFilters} className={iconButtonClass} title={language === 'pt' ? 'Limpar Filtros' : 'Reset Filters'}>
              <Image src="/clear-filters.svg" alt="Limpar Filtros" width={28} height={28} unoptimized />
            </button>
            
            {/* ✨ BOTÃO ADICIONADO PARA IMPORTAÇÃO ✨ */}
            <button
              onClick={toggleImportModal}
              title="Importar do AniList"
              className={iconButtonClass}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
            </button>
            
            <button onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')} className={`${iconButtonClass} hover:text-primary`} title={language === 'pt' ? 'Mudar para Inglês' : 'Switch to Portuguese'}>
              <Image
                src={language === 'pt' ? '/flag-br.svg' : '/flag-us.svg'}
                alt={language === 'pt' ? 'Bandeira do Brasil' : 'Bandeira dos EUA'}
                width={28}
                height={28}
                className="rounded-sm"
                unoptimized
              />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}