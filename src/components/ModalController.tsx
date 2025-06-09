// src/components/ModalController.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import AnimeDetailsModal from '@/components/AnimeDetailsModal';
import StudioWorksModal from '@/components/StudioWorksModal';
import PersonDetailsModal from '@/components/PersonDetailsModal'; // Importar de volta

export default function ModalController() {
  const searchParams = useSearchParams();
  const animeId = searchParams.get('anime');
  const studioId = searchParams.get('studioId');
  const studioName = searchParams.get('studioName');
  // --- LÓGICA DO PERSON RESTAURADA ---
  const personId = searchParams.get('person');
  
  return (
    <>
      {/* 
        O Modal de Anime é a base. Ele só precisa do 'animeId' para abrir.
        Seu z-index é 50.
      */}
      {animeId && <AnimeDetailsModal />}

      {/* 
        O Modal de Estúdio abre "por cima" do de Anime. Precisa do ID e do Nome.
        Seu z-index é 60, então aparece na frente.
      */}
      {studioId && studioName && (
        <StudioWorksModal 
          studioId={parseInt(studioId)} 
          studioName={decodeURIComponent(studioName)} 
        />
      )}

      {/* 
        O Modal de Pessoa também abre "por cima". Precisa do ID da pessoa.
        Vamos dar a ele um z-index de 70 para garantir que ele esteja sempre no topo.
      */}
      {personId && <PersonDetailsModal />}
    </>
  );
}