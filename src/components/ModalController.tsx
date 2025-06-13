// src/components/ModalController.tsx
'use client';

import { useSearchParams } from 'next/navigation';
import AnimeDetailsModal from '@/components/AnimeDetailsModal';
import StudioWorksModal from '@/components/StudioWorksModal';
import PersonDetailsModal from '@/components/PersonDetailsModal';
// O ListsModal já não é necessário, pois a sua funcionalidade está agora no Header.

export default function ModalController() {
  const searchParams = useSearchParams();
  
  const animeId = searchParams.get('anime');
  const studioId = searchParams.get('studioId');
  const studioName = searchParams.get('studioName');
  const personId = searchParams.get('person');
  
  return (
    <>
      {animeId && <AnimeDetailsModal />}

      {studioId && studioName && (
        <StudioWorksModal 
          studioId={parseInt(studioId)} 
          studioName={decodeURIComponent(studioName)} 
        />
      )}
      
      {personId && <PersonDetailsModal />}
    </>
  );
}
