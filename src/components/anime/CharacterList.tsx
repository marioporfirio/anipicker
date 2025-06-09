// src/components/anime/CharacterList.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimeDetails } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';

interface CharacterListProps {
  characters: AnimeDetails['characters'];
}

export default function CharacterList({ characters }: CharacterListProps) {
  const language = useFilterStore((state) => state.language);
  const mainCharacters = characters.edges.filter(c => c.role === 'MAIN');
  const supportingCharacters = characters.edges.filter(c => c.role === 'SUPPORTING');

  if (mainCharacters.length === 0 && supportingCharacters.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-8">
      {mainCharacters.length > 0 && (
        <>
          <h2 className="text-2xl font-semibold mb-4 border-l-4 border-primary pl-3">
            {language === 'pt' ? 'Personagens Principais' : 'Main Characters'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mainCharacters.map(edge => (
              <CharacterCard key={edge.node.id} characterEdge={edge} />
            ))}
          </div>
        </>
      )}

      {supportingCharacters.length > 0 && (
         <>
          <h2 className="text-2xl font-semibold mt-12 mb-4 border-l-4 border-primary pl-3">
            {language === 'pt' ? 'Personagens de Suporte' : 'Supporting Characters'}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {supportingCharacters.map(edge => (
              <CharacterCard key={edge.node.id} characterEdge={edge} />
            ))}
          </div>
         </>
      )}
    </div>
  );
}

function CharacterCard({ characterEdge }: { characterEdge: AnimeDetails['characters']['edges'][0] }) {
  const searchParams = useSearchParams();
  const character = characterEdge.node;
  const voiceActor = characterEdge.voiceActors?.[0];

  const CardContent = () => (
    <>
      <div className="w-16 h-24 relative flex-shrink-0">
        <Image src={character.image.large} alt={character.name.full} fill className="object-cover" sizes="64px" />
      </div>
      <div className="p-3 flex-grow min-w-0">
        <p className="font-semibold truncate text-text-main">{character.name.full}</p>
        {voiceActor && (
          <div className="flex items-center gap-2 mt-1 text-xs text-text-secondary">
             <div className="w-6 h-6 relative rounded-full overflow-hidden flex-shrink-0">
                <Image src={voiceActor.image.large} alt={voiceActor.name.full} fill className="object-cover" sizes="24px" />
             </div>
             <p className="truncate">{voiceActor.name.full}</p>
          </div>
        )}
      </div>
    </>
  );

  if (voiceActor) {
    // CORRIGIDO: Lógica de link para preservar o anime ID
    const buildPersonLink = (targetPersonId: number) => {
        const params = new URLSearchParams(searchParams.toString());
        // A prop 'anime' já estará na URL se este componente estiver sendo renderizado
        // Então, só precisamos adicionar o parâmetro 'person'
        params.set('person', targetPersonId.toString());
        return `/?${params.toString()}`;
    }

    return (
      <Link 
        href={buildPersonLink(voiceActor.id)} 
        scroll={false} 
        className="bg-surface rounded-lg shadow-md flex items-center overflow-hidden transition-colors hover:bg-gray-800"
      >
        <CardContent />
      </Link>
    );
  }

  return (
    <div className="bg-surface rounded-lg shadow-md flex items-center overflow-hidden">
      <CardContent />
    </div>
  );
}