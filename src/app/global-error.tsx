'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-background text-text-main flex flex-col items-center justify-center min-h-screen text-center px-4">
        <h2 className="text-2xl font-bold text-red-400 mb-2">Erro crítico</h2>
        <p className="text-gray-400 mb-6">Ocorreu um erro inesperado no aplicativo.</p>
        <button
          onClick={reset}
          className="bg-primary text-black font-bold py-2 px-6 rounded-lg"
        >
          Tentar novamente
        </button>
      </body>
    </html>
  );
}
