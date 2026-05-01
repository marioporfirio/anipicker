'use client';

import { useEffect } from 'react';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useUserListStore } from '@/store/userListStore';
import { useUiStore } from '@/store/uiStore';
import { toast } from 'react-hot-toast';
import { Z_INDEX } from '@/lib/constants';

export default function ImportModal() {
  const { statuses, ratings, customLists } = useUserListStore();
  const { toggleImportModal } = useUiStore();
  const dialogRef = useFocusTrap<HTMLDivElement>();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggleImportModal();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [toggleImportModal]);

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
      onClick={toggleImportModal}
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
          <h2 className="text-xl font-bold text-primary">Exportar Dados</h2>
          <button
            onClick={toggleImportModal}
            className="p-1 rounded-full text-text-secondary hover:bg-black/50 transition-colors"
            aria-label="Fechar modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <p className="text-text-secondary text-sm">
          Salva seu progresso local (status, notas e listas customizadas) como um arquivo JSON de backup.
        </p>

        <button
          onClick={handleExport}
          className="w-full bg-primary text-black font-bold py-2 px-4 rounded-md hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Exportar (anipicker-data.json)
        </button>
      </div>
    </div>
  );
}
