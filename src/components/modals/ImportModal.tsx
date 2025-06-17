'use client';

import { useState, useRef } from 'react';
import { useUserListStore } from '@/store/userListStore';
import { useFilterStore } from '@/store/filterStore';
import { toast } from 'react-hot-toast';
import { Z_INDEX } from '@/lib/constants'; 

export default function ImportModal() {
  const [isLoading, setIsLoading] = useState(false);
  const { replaceUserData } = useUserListStore();
  const { toggleImportModal } = useFilterStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

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
        
        // 1. Envia o arquivo para obter status e notas
        const listRes = await fetch('/api/import/anilist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(jsonData),
        });

        if (!listRes.ok) {
          const errorData = await listRes.json().catch(() => null);
          throw new Error(errorData?.message || 'Falha ao processar a lista de animes.');
        }
        const { statuses, ratings } = await listRes.json();

        // 2. Pede o nome de usuário para buscar os favoritos
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
        
        replaceUserData({ statuses, ratings, favorites });

        const totalAnimes = Object.keys(statuses).length;
        toast.success(`Lista com ${totalAnimes} animes importada com sucesso!`, { id: toastId });
        toggleImportModal();

      } catch (error: any) {
        toast.error(error.message || 'Erro ao processar o arquivo JSON.', { id: toastId });
      } finally {
        setIsLoading(false);
        if(fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      }
    };
    reader.readAsText(file);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div onClick={toggleImportModal} className="fixed inset-0 bg-black/70 flex items-center justify-center animate-fade-in" style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-md animate-slide-up flex flex-col gap-4" style={{ zIndex: Z_INDEX.MODAL_CONTENT }}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Importar Lista do AniList</h2>
          <button onClick={toggleImportModal} className="p-1 rounded-full text-text-secondary hover:bg-black/50 transition-colors" aria-label="Fechar modal" disabled={isLoading}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        {/* >> INÍCIO DA CORREÇÃO << */}
        <div className="text-text-secondary text-sm space-y-2">
            <p>
                Para importar, você precisa exportar sua lista do AniList primeiro.
            </p>
            <ol className="list-decimal list-inside text-xs space-y-1">
                <li>Vá em seu perfil no AniList e clique em Settings.</li>
                <li>No menu lateral, clique em Apps.</li>
                <li>Na seção Import/Export, clique em Export.</li>
                <li>Isso irá baixar o arquivo <strong className='text-amber-300'>`animelist.json`</strong>.</li>
            </ol>
             <p className="pt-2"><strong className="text-yellow-400">Atenção:</strong> Isso substituirá seus dados locais de status, notas e favoritos.</p>
        </div>
        {/* >> FIM DA CORREÇÃO << */}

        <div>
            <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="application/json"
                disabled={isLoading}
            />
            <button
                onClick={handleButtonClick}
                disabled={isLoading}
                className="w-full bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
            >
                {isLoading ? 'Processando...' : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Selecionar Arquivo (animelist.json)
                    </>
                )}
            </button>
        </div>

      </div>
    </div>
  );
}