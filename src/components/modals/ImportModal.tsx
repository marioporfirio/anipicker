'use client';

import { useState, useRef, useEffect } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useUserListStore } from '@/store/userListStore';
import { useUiStore } from '@/store/uiStore';
import { toast } from 'react-hot-toast';
import { Z_INDEX } from '@/lib/constants';

export default function ImportModal() {
  const [isLoading, setIsLoading] = useState(false);
  const { replaceUserData, statuses, ratings, customLists } = useUserListStore();
  const { toggleImportModal } = useUiStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>();
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) toggleImportModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, toggleImportModal]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/json') {
      toast.error('Por favor, selecione um arquivo JSON válido (animelist.json).');
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();

    reader.onload = async (e) => {
      const content = e.target?.result;
      if (typeof content !== 'string') {
        toast.error('Não foi possível ler o conteúdo do arquivo.');
        return;
      }

      setIsLoading(true);
      const toastId = toast.loading('Processando sua lista...');

      try {
        const jsonData = JSON.parse(content);

        const listRes = await fetch('/api/import/anilist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });

        if (!listRes.ok) {
          const errorData = await listRes.json().catch(() => null);
          throw new Error(errorData?.message || 'Falha ao processar a lista de animes.');
        }
        const { statuses: importedStatuses, ratings: importedRatings } = await listRes.json();

        const usernameForFavorites = prompt("Para sincronizar seus favoritos, por favor, insira seu nome de usuário do AniList:", "");
        let favorites: number[] = [];

        if (usernameForFavorites && usernameForFavorites.trim() !== '') {
          toast.loading('Buscando favoritos...', { id: toastId });
          const favRes = await fetch(`/api/favorites?username=${usernameForFavorites.trim()}`);
          if (favRes.ok) {
            const favData = await favRes.json();
            favorites = favData.favorites || [];
          } else {
            toast.error("Não foi possível buscar os favoritos, mas o resto da lista foi importado.", { id: toastId });
          }
        }

        replaceUserData({ statuses: importedStatuses, ratings: importedRatings, favorites });

        const totalAnimes = Object.keys(importedStatuses).length;
        toast.success(`Lista com ${totalAnimes} animes importada com sucesso!`, { id: toastId });
        toggleImportModal();
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Erro ao processar o arquivo JSON.';
        toast.error(message, { id: toastId });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = { statuses, ratings, customLists };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'anipicker-data.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Dados exportados com sucesso!');
  };

  return (
    <div onClick={toggleImportModal} className="fixed inset-0 bg-black/70 flex items-center justify-center animate-fade-in" style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}>
      <div ref={dialogRef} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-md animate-slide-up flex flex-col gap-4 focus:outline-none" style={{ zIndex: Z_INDEX.MODAL_CONTENT }} tabIndex={-1}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Importar / Exportar Dados</h2>
          <button onClick={toggleImportModal} className="p-1 rounded-full text-text-secondary hover:bg-black/50 transition-colors" aria-label="Fechar modal" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="border-b border-gray-700 pb-4">
          <h3 className="text-sm font-semibold text-text-main mb-2">Exportar seus dados</h3>
          <p className="text-text-secondary text-xs mb-3">Salva seu progresso local (status, notas e listas) como um arquivo JSON.</p>
          <button
            onClick={handleExport}
            className="w-full bg-surface border border-gray-600 text-text-main font-semibold py-2 px-4 rounded-md hover:bg-primary/20 hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Exportar dados (anipicker-data.json)
          </button>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-text-main mb-2">Importar do AniList</h3>
          <div className="text-text-secondary text-xs space-y-1 mb-3">
            <p>Exportar sua lista no AniList: Perfil → Settings → Apps → Export.</p>
            <p className="text-yellow-400"><strong>Atenção:</strong> Isso substituirá seus dados locais.</p>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="application/json"
            disabled={isLoading}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="w-full bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
          >
            {isLoading ? 'Processando...' : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Selecionar Arquivo (animelist.json)
              </>
            )}
          </button>
          {selectedFileName && !isLoading && (
            <p className="text-xs text-text-secondary mt-1">Arquivo: {selectedFileName}</p>
          )}
        </div>
      </div>
    </div>
  );
}
