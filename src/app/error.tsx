'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <h2 className="text-2xl font-bold text-red-400 mb-2">Algo deu errado</h2>
      <p className="text-text-secondary mb-6 max-w-md">
        Ocorreu um erro inesperado. Você pode tentar recarregar ou voltar para a página inicial.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="bg-primary text-black font-bold py-2 px-6 rounded-lg hover:bg-primary/80 transition-colors"
        >
          Tentar novamente
        </button>
        <a
          href="/"
          className="bg-surface border border-gray-600 text-text-secondary font-semibold py-2 px-6 rounded-lg hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors"
        >
          Página inicial
        </a>
      </div>
    </div>
  );
}
