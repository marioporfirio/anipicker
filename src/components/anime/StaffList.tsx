// src/components/anime/StaffList.tsx
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AnimeDetails } from '@/lib/anilist';
import { translateStaffRole } from '@/lib/translations';
import { useFilterStore } from '@/store/filterStore';

interface StaffListProps {
  staff: AnimeDetails['staff'];
}

export default function StaffList({ staff }: StaffListProps) {
  const language = useFilterStore((state) => state.language);
  const mainRoles = [ 'Director', 'Series Director', 'Original Creator', 'Screenplay', 'Script', 'Music', 'Art Director', 'Sound Director', 'Episode Director' ];
  const mainStaff = staff.edges.filter(s => mainRoles.includes(s.role) || s.role.includes('Character Design'));
  const uniqueStaff = Array.from(new Map(mainStaff.map(item => [item.node.id, item])).values());

  if (uniqueStaff.length === 0) return null;

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12">
      <h2 className="text-2xl font-semibold mb-4 border-l-4 border-primary pl-3">
        {language === 'pt' ? 'Staff Principal' : 'Main Staff'}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {uniqueStaff.map(edge => (
          <StaffCard key={`${edge.node.id}-${edge.role}`} staffEdge={edge} />
        ))}
      </div>
    </div>
  );
}

function StaffCard({ staffEdge }: { staffEdge: AnimeDetails['staff']['edges'][0] }) {
  const searchParams = useSearchParams();
  const staff = staffEdge.node;
  const language = useFilterStore((state) => state.language);
  const displayName = translateStaffRole(staffEdge.role);

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
      href={buildPersonLink(staff.id)}
      scroll={false}
      className="bg-surface rounded-lg shadow-md flex items-center overflow-hidden transition-colors hover:bg-gray-800"
    >
      <div className="w-16 h-24 relative flex-shrink-0">
        <Image src={staff.image.large} alt={staff.name.full} fill className="object-cover" sizes="64px" />
      </div>
      <div className="p-3 flex-grow min-w-0">
        <p className="font-semibold truncate text-text-main">{staff.name.full}</p>
        <p className="text-xs text-text-secondary truncate">{displayName}</p>
      </div>
    </Link>
  );
}