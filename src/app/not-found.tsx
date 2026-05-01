import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
      <p className="text-8xl font-black text-primary mb-4 select-none">404</p>
      <h1 className="text-2xl font-bold text-text-main mb-2">Página não encontrada</h1>
      <p className="text-text-secondary mb-8 max-w-sm">
        Essa URL não existe. Pode ter sido removida ou você digitou algo errado.
      </p>
      <Link
        href="/"
        className="bg-primary text-black font-bold py-2 px-8 rounded-lg hover:bg-primary/80 transition-colors"
      >
        Voltar para o início
      </Link>
    </div>
  );
}
