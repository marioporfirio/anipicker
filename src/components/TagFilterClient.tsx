// =================================================================
// ============== ARQUIVO: src/components/TagFilterClient.tsx ==============
// =================================================================
'use client';

import { useFilterStore, Selection, Language } from '@/store/filterStore';
import { useState, useMemo, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { Tag } from '@/lib/anilist';
import { translate, tagCategoryTranslations, tagTranslations } from '@/lib/translations';


const sortTagCategories = (categories: string[], language: Language): string[] => {
  return [...categories].sort((a, b) => {
    const specialOrder: { [key: string]: number } = { 'Themes': 1, 'Demographic': 2 };
    const aOrder = specialOrder[a] || 99;
    const bOrder = specialOrder[b] || 99;
    if (aOrder !== bOrder) return aOrder - bOrder;
    
    const nameA = language === 'pt' ? translate(tagCategoryTranslations, a) : a;
    const nameB = language === 'pt' ? translate(tagCategoryTranslations, b) : b;
    return nameA.localeCompare(nameB, language === 'pt' ? 'pt-BR' : undefined);
  });
};

const sortTagsByName = (tags: Tag[], language: Language): Tag[] => {
    return [...tags].sort((tA, tB) => {
        const nameA = language === 'pt' ? translate(tagTranslations, tA.name) : tA.name;
        const nameB = language === 'pt' ? translate(tagTranslations, tB.name) : tB.name;
        return nameA.localeCompare(nameB, language === 'pt' ? 'pt-BR' : undefined);
    });
};

function TagPill({ tag, onToggle }: { tag: Selection, onToggle: (name: string) => void }) {
  const language = useFilterStore((state) => state.language);
  const baseClasses = "flex items-center gap-1.5 px-2 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors";
  const colorClasses = tag.mode === 'include'
    ? 'bg-primary/80 text-black hover:bg-primary'
    : 'bg-red-500/80 text-white hover:bg-red-500';
  
  const displayName = language === 'pt' ? translate(tagTranslations, tag.name) : tag.name;

  return (
    <button type="button" className={`${baseClasses} ${colorClasses}`} onClick={() => onToggle(tag.name)}>
      {tag.mode === 'exclude' ? 
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        : 
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      }
      {displayName}
    </button>
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
            <button
              type="button"
              key={tag.name}
              onClick={() => onToggle(tag.name)}
              className="px-2 py-1 text-xs bg-gray-700 text-text-secondary rounded-full cursor-pointer hover:bg-accent/20 hover:text-accent flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
              {displayTagName}
            </button>
          );
        })}
        {!showAll && tags.length > initialLimit && (
          <button
            type="button"
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
  const [debouncedSearch] = useDebounce(search, 300);
  const [showAllCategories, setShowAllCategories] = useState(false);
  
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const categorizedTags = useMemo(() => {
    const grouped = allTags.reduce((acc, tag) => {
      const category = tag.category || 'Outros';
      if (!acc[category]) { acc[category] = []; }
      acc[category].push(tag);
      return acc;
    }, {} as Record<string, Tag[]>);

    const sortedCategories = sortTagCategories(Object.keys(grouped), language);

    const sortedGrouped: Record<string, Tag[]> = {};
    for (const category of sortedCategories) {
      sortedGrouped[category] = sortTagsByName(grouped[category], language);
    }
    return sortedGrouped;
  }, [allTags, language]);

  const lowerCaseSearch = debouncedSearch.toLowerCase();
  
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

      {isClient ? (
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={language === 'pt' ? 'Buscar tag...' : 'Search tag...'}
          className="w-full bg-background border border-gray-600 rounded-md px-3 py-1.5 text-sm mb-2 focus:ring-1 focus:ring-primary focus:outline-none"
        />
      ) : (
        <div className="w-full h-[38px] bg-background border border-gray-600 rounded-md mb-2"></div>
      )}

      <div className="max-h-[30rem] overflow-y-auto pr-2 space-y-3">
        {debouncedSearch.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {allTags
              .filter(tag => 
                (tag.name.toLowerCase().includes(lowerCaseSearch) || 
                 (language === 'pt' && translate(tagTranslations, tag.name).toLowerCase().includes(lowerCaseSearch))) && 
                !selectedTags.find(st => st.name === tag.name)
              )
              .sort((tA, tB) => {
                const nameA = language === 'pt' ? translate(tagTranslations, tA.name) : tA.name;
                const nameB = language === 'pt' ? translate(tagTranslations, tB.name) : tB.name;
                return nameA.localeCompare(nameB, language === 'pt' ? 'pt-BR' : undefined);
              })
              .slice(0, 20)
              .map(tag => (
                <button
                  type="button"
                  key={tag.name}
                  onClick={() => toggleTag(tag.name)}
                  className="px-2 py-1 text-xs bg-gray-700 text-text-secondary rounded-full cursor-pointer hover:bg-accent/20 hover:text-accent flex items-center gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                  {language === 'pt' ? translate(tagTranslations, tag.name) : tag.name}
                </button>
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
                type="button"
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