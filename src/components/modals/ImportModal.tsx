'use client';

import { useState, useRef, useEffect } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useUserListStore } from '@/store/userListStore';
import { useUiStore } from '@/store/uiStore';
import { toast } from 'react-hot-toast';
import { Z_INDEX } from '@/lib/constants';
import { ListStatus } from '@/store/userListStore';

type Step = 'initial' | 'username';

interface ParsedData {
  statuses: Record<number, ListStatus>;
  ratings: Record<number, number>;
}

export default function ImportModal() {
  const [step, setStep] = useState<Step>('initial');
  const [isLoading, setIsLoading] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [anilistUsername, setAnilistUsername] = useState('');
  const { replaceUserData, statuses, ratings, customLists } = useUserListStore();
  const { toggleImportModal } = useUiStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading) toggleImportModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isLoading, toggleImportModal]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (event.target) event.target.value = '';

    if (file.type !== 'application/json') {
      toast.error('Por favor, selecione um arquivo JSON válido (animelist.json).');
      return;
    }

    setIsLoading(true);
    const toastId = toast.loading('Lendo arquivo...');

    try {
      const content = await file.text();
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
      toast.dismiss(toastId);
      setParsedData({ statuses: importedStatuses, ratings: importedRatings });
      setStep('username');
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao processar o arquivo JSON.';
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsLoading(true);
    const toastId = toast.loading('Importando lista...');

    try {
      let favorites: number[] = [];

      if (anilistUsername.trim()) {
        toast.loading('Buscando favoritos...', { id: toastId });
        const favRes = await fetch(`/api/favorites?username=${anilistUsername.trim()}`);
        if (favRes.ok) {
          const favData = await favRes.json();
          favorites = favData.favorites || [];
        } else {
          toast.error('Não foi possível buscar os favoritos, mas o resto da lista foi importado.', { id: toastId });
        }
      }

      replaceUserData({ statuses: parsedData.statuses, ratings: parsedData.ratings, favorites });
      const totalAnimes = Object.keys(parsedData.statuses).length;
      toast.success(`Lista com ${totalAnimes} animes importada com sucesso!`, { id: toastId });
      toggleImportModal();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Erro ao importar dados.';
      toast.error(message, { id: toastId });
    } finally {
      setIsLoading(false);
    }
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
    <div
      onClick={!isLoading ? toggleImportModal : undefined}
      className="fixed inset-0 bg-black/70 flex items-center justify-center animate-fade-in"
      style={{ zIndex: Z_INDEX.MODAL_BACKDROP }}
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        className="bg-surface p-6 rounded-lg shadow-xl w-full max-w-md animate-slide-up flex flex-col gap-4 focus:outline-none"
        style={{ zIndex: Z_INDEX.MODAL_CONTENT }}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-primary">Importar / Exportar Dados</h2>
          <button
            onClick={toggleImportModal}
            disabled={isLoading}
            className="p-1 rounded-full text-text-secondary hover:bg-black/50 transition-colors disabled:opacity-50"
            aria-label="Fechar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {step === 'initial' && (
          <>
            <div className="border-b border-gray-700 pb-4">
              <h3 className="text-sm font-semibold text-text-main mb-2">Exportar seus dados</h3>
              <p className="text-text-secondary text-xs mb-3">
                Salva seu progresso local (status, notas e listas) como um arquivo JSON.
              </p>
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
                <p className="text-yellow-400">
                  <strong>Atenção:</strong> Isso substituirá seus dados locais.
                </p>
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
                {isLoading ? (
                  'Processando...'
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Selecionar Arquivo (animelist.json)
                  </>
                )}
              </button>
            </div>
          </>
        )}

        {step === 'username' && parsedData && (
          <div className="flex flex-col gap-4">
            <div className="bg-background rounded-md p-3 text-sm text-text-secondary">
              ✅ <span className="text-text-main font-semibold">{Object.keys(parsedData.statuses).length} animes</span> encontrados no arquivo.
            </div>

            <div>
              <label htmlFor="anilist-username" className="block text-sm font-medium text-text-secondary mb-1">
                Usuário do AniList <span className="text-gray-500">(opcional — para importar favoritos)</span>
              </label>
              <input
                id="anilist-username"
                type="text"
                value={anilistUsername}
                onChange={(e) => setAnilistUsername(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleImport(); }}
                placeholder="seu-usuario"
                autoFocus
                className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
                disabled={isLoading}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => { setStep('initial'); setParsedData(null); setAnilistUsername(''); }}
                disabled={isLoading}
                className="flex-1 py-2 px-4 rounded-md border border-gray-600 text-text-secondary hover:bg-primary/10 transition-colors disabled:opacity-50"
              >
                Voltar
              </button>
              <button
                onClick={handleImport}
                disabled={isLoading}
                className="flex-1 bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-wait"
              >
                {isLoading ? 'Importando...' : 'Importar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
