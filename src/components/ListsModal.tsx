// src/components/ListsModal.tsx
'use client';

import { useState } from 'react';
import { useUserListStore, CustomList } from '@/store/userListStore';
import { useFilterStore } from '@/store/filterStore';
import { Z_INDEX } from '@/lib/constants';

// --- Ícones para as listas ---
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13"/><path d="M8 12h13"/><path d="M8 18h13"/><path d="M3 6h.01"/><path d="M3 12h.01"/><path d="M3 18h.01"/></svg>
);
const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
);


// --- Componente para um único item da lista ---
function ListItem({ list }: { list: CustomList }) {
    const { renameList, deleteList } = useUserListStore();
    const { activeListId, setActiveListId, toggleListsModal } = useFilterStore();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(list.name);

    const handleRename = () => {
        if (name.trim() && name.trim() !== list.name) {
            renameList(list.id, name.trim());
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(`Tem a certeza que quer apagar a lista "${list.name}"?`)) {
            deleteList(list.id);
        }
    };

    const handleViewList = () => {
        setActiveListId(list.id);
        toggleListsModal();
    }
    
    const isActive = list.id === activeListId;

    return (
        // CORREÇÃO: Adicionado highlight quando a lista está ativa
        <li className={`flex items-center justify-between p-3 rounded-lg transition-colors group ${isActive ? 'bg-primary/20' : 'hover:bg-surface-light'}`}>
            {isEditing ? (
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleRename}
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                    className="flex-grow bg-background text-text-main px-2 py-1 rounded-md border border-primary outline-none"
                    autoFocus
                />
            ) : (
                <div className="flex items-center gap-3 cursor-pointer flex-grow" onClick={handleViewList}>
                    {/* CORREÇÃO: Ícone de coração para favoritos, ícone de lista para as outras */}
                    {list.id === 'favorites' ? <HeartIcon filled={isActive} /> : <ListIcon />}
                    <span className={`font-semibold ${isActive ? 'text-primary' : 'text-text-main'}`}>
                        {list.name} ({list.animeIds.length})
                    </span>
                </div>
            )}

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {list.id !== 'favorites' && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="p-1.5 text-text-secondary hover:text-primary" title="Renomear lista">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                    </button>
                )}
                {list.id !== 'favorites' && !isEditing && (
                     <button onClick={handleDelete} className="p-1.5 text-text-secondary hover:text-red-500" title="Apagar lista">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                )}
            </div>
        </li>
    );
}


// --- Componente do Modal Principal ---
export default function ListsModal() {
  const { customLists, createList } = useUserListStore();
  const { toggleListsModal } = useFilterStore();
  const [newListName, setNewListName] = useState('');

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (newListName.trim()) {
      createList(newListName.trim());
      setNewListName('');
    }
  };

  return (
    <div
      onClick={toggleListsModal}
      className="fixed inset-0 flex justify-center items-center overflow-y-auto bg-black/70 animate-fade-in"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-surface rounded-lg shadow-2xl relative animate-slide-up my-16 flex flex-col"
        style={{ zIndex: Z_INDEX.ANIME_DETAILS_MODAL }}
      >
        <div className="flex justify-between items-center p-4 border-b border-surface-light">
          <h2 className="text-xl font-bold text-primary">Minhas Listas</h2>
          <button onClick={toggleListsModal} className="p-2 rounded-full hover:bg-surface-light">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
            <form onSubmit={handleCreateList} className="flex gap-2">
                <input 
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Nome da nova lista..."
                    className="flex-grow bg-background text-text-main px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button type="submit" className="bg-primary text-white font-semibold px-4 rounded-md hover:bg-primary-dark transition-colors">Criar</button>
            </form>
            
            <ul className="space-y-1 max-h-80 overflow-y-auto">
                {customLists.map(list => <ListItem key={list.id} list={list} />)}
            </ul>
        </div>
      </div>
    </div>
  );
}

