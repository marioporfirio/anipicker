// src/components/ThemeSongs.tsx
'use client';

import { Music } from "lucide-react";

interface ThemeSongsProps {
  openings?: string[];
  endings?: string[];
}

export default function ThemeSongs({ openings, endings }: ThemeSongsProps) {
  const hasOpenings = openings && openings.length > 0;
  const hasEndings = endings && endings.length > 0;

  if (!hasOpenings && !hasEndings) {
    return null; // Não renderiza nada se não houver músicas
  }

  // Remove aspas do texto da música para uma exibição mais limpa
  const formatTheme = (theme: string) => {
    return theme.replace(/"/g, '');
  };

  return (
    <div className="px-4 md:px-8 mt-6">
      <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-text-main">
        <Music size={20} className="text-primary" />
        Músicas Tema
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-surface/50 p-4 rounded-lg">
        {hasOpenings && (
          <div>
            <h4 className="font-semibold text-text-main mb-2">Aberturas (OP)</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-text-secondary">
              {openings.map((op, index) => (
                <li key={`op-${index}`}>{formatTheme(op)}</li>
              ))}
            </ol>
          </div>
        )}
        {hasEndings && (
          <div>
            <h4 className="font-semibold text-text-main mb-2">Encerramentos (ED)</h4>
            <ol className="list-decimal list-inside space-y-1.5 text-sm text-text-secondary">
              {endings.map((ed, index) => (
                <li key={`ed-${index}`}>{formatTheme(ed)}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}