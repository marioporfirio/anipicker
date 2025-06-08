// src/components/TagFilterClient.tsx
'use client';

import { useFilterStore, Selection } from '@/store/filterStore';
import { useState, useMemo } from 'react';
import { Tag } from '@/lib/anilist';
import { translate, tagCategoryTranslations, tagTranslations } from '@/lib/translations';

function TagPill({ tag, onToggle }: { tag: Selection, onToggle: (name: string) => void }) {
  const language = useFilterStore((state) => state.language);
  const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors";
  const colorClasses = tag.mode === 'include'
    ? 'bg-green-500/20 text-green-300 hover:bg-green-500/40'
    : 'bg-red-500/20 text-red-300 hover:bg-red-500/40';
  
  const displayName = language === 'pt' ? translate(tagTranslations, tag.name) : tag.name;

  return (
    <span className={`${baseClasses} ${colorClasses}`} onClick={() => onToggle(tag.name)}>
      {tag.mode === 'exclude' ? '− ' : '+ '}{displayName}
    </span>
  );
}

interface TagFilterClientProps {
  allTags: Tag[];
}

function TagCategory({ category, tags, selectedTags, onToggle, initialLimit = 8 }: {
  category: string;
  tags: Tag[];
  selectedTags: Selection[];
  onToggle: (name: string) => void;
  initialLimit?: number;
}) {
  const [showAll, setShowAll] = useState(false);
  const language = useFilterStore((state) => state.language);
  const visibleTags = showAll ? tags : tags.slice(0, initialLimit);
  
  const displayCategoryName = language === 'pt' ? translate(tagCategoryTranslations, category) : category;

  return (
    <div>
      <h4 className="text-xs font-bold text-text-secondary mb-1.5">{displayCategoryName}</h4>
      <div className="flex flex-wrap gap-2">
        {visibleTags.map((tag) => {
          const isSelected = selectedTags.find(t => t.name === tag.name);
          if (isSelected) return null;
          const displayTagName = language === 'pt' ? translate(tagTranslations, tag.name) : tag.name;
          return (
            <span
              key={tag.name}
              onClick={() => onToggle(tag.name)}
              className="px-2 py-1 text-xs bg-gray-700 text-text-secondary rounded-full cursor-pointer hover:bg-primary hover:text-white"
            >
              + {displayTagName}
            </span>
          );
        })}
        {!showAll && tags.length > initialLimit && (
          <button
            onClick={() => setShowAll(true)}
            className="px-2 py-1 text-xs text-primary hover:underline"
          >
            ...{language === 'pt' ? 'mais' : 'more'}
          </button>
        )}
      </div>
    </div>
  );
}


export default function TagFilterClient({ allTags }: TagFilterClientProps) {
  const { tags: selectedTags, toggleTag, language } = useFilterStore();
  const [search, setSearch] = useState('');
  const [showAllCategories, setShowAllCategories] = useState(false);

  const categorizedTags = useMemo(() => {
    const grouped = allTags.reduce((acc, tag) => {
      const category = tag.category || 'Outros';
      if (!acc[category]) { acc[category] = []; }
      acc[category].push(tag);
      return acc;
    }, {} as Record<string, Tag[]>);

    const sortedCategories = Object.keys(grouped).sort((a, b) => {
      // Manter categorias importantes no topo
      const specialOrder: { [key: string]: number } = { 'Themes': 1, 'Demographic': 2 };
      const aOrder = specialOrder[a] || 99;
      const bOrder = specialOrder[b] || 99;
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Ordenar o resto alfabeticamente com base no idioma
      const nameA = language === 'pt' ? translate(tagCategoryTranslations, a) : a;
      const nameB = language === 'pt' ? translate(tagCategoryTranslations, b) : b;
      return nameA.localeCompare(nameB, language === 'pt' ? 'pt-BR' : undefined);
    });

    const sortedGrouped: Record<string, Tag[]> = {};
    for (const category of sortedCategories) {
      // Ordenar as tags dentro de cada categoria com base no idioma
      sortedGrouped[category] = grouped[category].sort((tA, tB) => {
        const nameA = language === 'pt' ? translate(tagTranslations, tA.name) : tA.name;
        const nameB = language === 'pt' ? translate(tagTranslations, tB.name) : tB.name;
        return nameA.localeCompare(nameB, language === 'pt' ? 'pt-BR' : undefined);
      });
    }
    return sortedGrouped;
  }, [allTags, language]); // Adicionado `language` como dependência

  const lowerCaseSearch = search.toLowerCase();
  
  const visibleCategories = showAllCategories 
    ? Object.entries(categorizedTags)
    : Object.entries(categorizedTags).slice(0, 4);

  return (
    <div className="border-t border-gray-700 pt-4">
      <label className="block text-sm font-medium text-text-secondary mb-1">
        Tags
      </label>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedTags.map(t => <TagPill key={t.name} tag={t} onToggle={toggleTag} />)}
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={language === 'pt' ? 'Buscar tag...' : 'Search tag...'}
        className="w-full bg-background border border-gray-600 rounded-md px-3 py-1.5 text-sm mb-2 focus:ring-1 focus:ring-primary focus:outline-none"
      />

      <div className="max-h-[30rem] overflow-y-auto pr-2 space-y-3">
        {search.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allTags
              .filter(tag => 
                (tag.name.toLowerCase().includes(lowerCaseSearch) || 
                 (language === 'pt' && translate(tagTranslations, tag.name).toLowerCase().includes(lowerCaseSearch))) && 
                !selectedTags.find(st => st.name === tag.name)
              )
              .sort((tA, tB) => { // Ordenar os resultados da busca
                const nameA = language === 'pt' ? translate(tagTranslations, tA.name) : tA.name;
                const nameB = language === 'pt' ? translate(tagTranslations, tB.name) : tB.name;
                return nameA.localeCompare(nameB, language === 'pt' ? 'pt-BR' : undefined);
              })
              .slice(0, 20)
              .map(tag => (
                <span
                  key={tag.name}
                  onClick={() => toggleTag(tag.name)}
                  className="px-2 py-1 text-xs bg-gray-700 text-text-secondary rounded-full cursor-pointer hover:bg-primary hover:text-white"
                >
                  + {language === 'pt' ? translate(tagTranslations, tag.name) : tag.name}
                </span>
              ))}
          </div>
        ) : (
          <>
            {visibleCategories.map(([category, tags]) => (
              <TagCategory
                key={category}
                category={category}
                tags={tags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            ))}
            {!showAllCategories && Object.keys(categorizedTags).length > 4 && (
              <button
                onClick={() => setShowAllCategories(true)}
                className="w-full text-center text-sm text-primary hover:underline mt-2"
              >
                {language === 'pt' ? 'Mostrar todas as categorias' : 'Show all categories'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}