// src/components/StateRenderer.tsx
'use client';

import React from 'react';

interface StateRendererProps {
  isLoading: boolean;
  error: string | null;
  loadingComponent: React.ReactNode;
  // Permite passar uma função que recebe o erro e renderiza o componente de erro
  errorComponent: (error: string) => React.ReactNode;
  children: React.ReactNode;
}

/**
 * Um componente de ordem superior para gerenciar e renderizar de forma consistente
 * os estados de UI de carregamento (loading), erro (error) e sucesso (children).
 * Isso remove a lógica repetitiva de 'if (isLoading)... if (error)...' dos componentes.
 */
export default function StateRenderer({
  isLoading,
  error,
  loadingComponent,
  errorComponent,
  children,
}: StateRendererProps) {
  if (isLoading) {
    return <>{loadingComponent}</>;
  }

  if (error) {
    return <>{errorComponent(error)}</>;
  }

  // Renderiza o conteúdo principal quando não há carregamento nem erro.
  return <>{children}</>;
}
