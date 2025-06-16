// =================================================================
// ============== ARQUIVO: src/components/modals/ImportModal.tsx ===
// =================================================================
'use client';

import { useState } from 'react';
import { useUserListStore } from '@/store/userListStore';
import { useFilterStore } from '@/store/filterStore';
import { toast } from 'react-hot-toast';
import { Z_INDEX } from '@/lib/constants'; 

export default function ImportModal() {
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { replaceUserData } = useUserListStore();
  const { toggleImportModal } = useFilterStore();

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error('Por favor, insira um nome de usuário do AniList.');
      return;
    }
    setIsLoading(true);
    const toastId = toast.loading('Importando sua lista...');

    try {
      // ✨ CORREÇÃO: Adicionado timestamp para evitar o cache do navegador. ✨
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/import/anilist?username=${username.trim()}&t=${timestamp}`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        const errorMessage = errorData?.message || `Erro: ${res.status} - ${res.statusText}`;
        throw new Error(errorMessage);
      }
      
      const importedData = await res.json();

      if (Object.keys(importedData.statuses).length === 0 && Object.keys(importedData.ratings).length === 0) {
          throw new Error('Nenhum anime encontrado na sua lista pública do AniList.');
      }
      
      replaceUserData(importedData);
      toast.success('Sua lista do AniList foi importada com sucesso!', { id: toastId });
      toggleImportModal();

    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro desconhecido.', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div onClick={toggleImportModal} className="fixed inset-0 bg-black/70 flex items-center justify-center animate-fade-in" style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-md animate-slide-up flex flex-col gap-4" style={{ zIndex: Z_INDEX.MODAL_CONTENT }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Importar do AniList</h2>
          <button onClick={toggleImportModal} className="p-1 rounded-full text-text-secondary hover:bg-black/50 transition-colors" aria-label="Fechar modal">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <p className="text-text-secondary text-sm">Insira seu nome de usuário do AniList para importar suas listas de status e notas.<br /><strong className="text-yellow-400">Atenção:</strong> Isso substituirá seus dados locais de status e notas. Suas listas customizadas serão mantidas.</p>
        <form onSubmit={handleImport} className="flex flex-col gap-4">
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Nome de usuário do AniList" className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 text-text-main focus:ring-2 focus:ring-primary focus:outline-none transition-colors" disabled={isLoading} autoFocus />
          <button type="submit" disabled={isLoading || !username.trim()} className="w-full bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? 'Importando...' : 'Importar Minha Lista'}
          </button>
        </form>
      </div>
    </div>
  );
}