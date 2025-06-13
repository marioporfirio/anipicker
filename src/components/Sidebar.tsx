// =================================================================
// ============== ARQUIVO: src/components/Sidebar.tsx ==============
// =================================================================
'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore, MediaStatus, MediaSource } from '@/store/filterStore';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { sidebarLabelTranslations, formatOptionTranslations, statusOptionTranslations, sourceOptionTranslations, listButtonConfig, statusConfig } from '@/lib/translations';
import SearchInput from './SearchInput';
import clsx from 'clsx';
import GenreFilter from './GenreFilter';
import TagFilter from './TagFilter';

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

function FormatCheckbox({ formatKey, label }: { formatKey: string, label: string }) {
    const { formats, toggleFormat } = useFilterStore();
    const isChecked = formats.includes(formatKey);
    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={() => toggleFormat(formatKey)} className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"/>
            <span className="text-sm text-text-main">{label}</span>
        </label>
    );
}
function StatusCheckbox({ statusKey, label }: { statusKey: MediaStatus, label: string }) {
    const { statuses, toggleStatus } = useFilterStore();
    const isChecked = statuses.includes(statusKey);
    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={() => toggleStatus(statusKey)} className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"/>
            <span className="text-sm text-text-main">{label}</span>
        </label>
    );
}
function SourceCheckbox({ sourceKey, label }: { sourceKey: MediaSource, label: string }) {
    const { sources, toggleSource } = useFilterStore();
    const isChecked = sources.includes(sourceKey);
    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input type="checkbox" checked={isChecked} onChange={() => toggleSource(sourceKey)} className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"/>
            <span className="text-sm text-text-main">{label}</span>
        </label>
    );
}
function RangeInput({ value, onChange, min, max }: { value: number, onChange: (val: number) => void, min: number, max: number }) {
  const [inputValue, setInputValue] = useState(value.toString());
  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);
  const handleBlur = () => {
    let numValue = parseInt(inputValue, 10);
    if (isNaN(numValue) || numValue < min) numValue = min;
    if (numValue > max) numValue = max;
    setInputValue(numValue.toString());
    onChange(numValue);
  };
  return (
    <input
      type="text"
      value={inputValue}
      onChange={(e) => setInputValue(e.target.value.replace(/[^0-9]/g, ''))}
      onBlur={handleBlur}
      onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
      className="w-16 bg-background border border-gray-600 rounded-md px-2 py-1 text-center text-sm focus:ring-1 focus:ring-primary focus:outline-none"
    />
  );
}

const SliderThumbWithTooltip = ({ value }: { value: number }) => (
    <Tooltip.Provider>
        <Tooltip.Root>
            <Tooltip.Trigger asChild>
                <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-green-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            </Tooltip.Trigger>
            <Tooltip.Portal>
                <Tooltip.Content 
                    className="bg-black text-white px-2 py-1 text-xs rounded-md shadow-lg z-50" 
                    sideOffset={5}
                >
                    {value}
                    <Tooltip.Arrow className="fill-black" />
                </Tooltip.Content>
            </Tooltip.Portal>
        </Tooltip.Root>
    </Tooltip.Provider>
);

export default function Sidebar({ filters }: { filters: React.ReactNode }) {
  const { 
    yearRange, setYearRange,
    scoreRange, setScoreRange,
    excludeNoScore, toggleExcludeNoScore,
    includeTBA, toggleIncludeTBA,
    language,
    toggleSidebar,
    listStatusFilter, setListStatusFilter
  } = useFilterStore();

  const labels = sidebarLabelTranslations[language] || {filtersTitle: "Filtros", searchAnime: "Buscar Anime", hideFilters: "Esconder Filtros", includeTBA: "Incluir TBA"};
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const listStatusOptions = listButtonConfig.filter(b => b.status !== 'SKIPPING');

  return (
    <aside className="w-full bg-surface rounded-lg shadow-lg self-start md:sticky md:top-24 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-accent">{labels.filtersTitle}</h2>
        <button onClick={toggleSidebar} className="p-1 text-text-secondary hover:text-primary" title={labels.hideFilters}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>
      <div className="p-4 space-y-6">
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-text-secondary mb-1">{labels.searchAnime}</label>
          <SearchInput />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Status na Minha Lista
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setListStatusFilter(null)}
              className={clsx(
                'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
                listStatusFilter === null 
                  ? 'bg-cyan-neon text-black' 
                  : 'bg-gray-700 text-text-secondary hover:bg-cyan-neon/20'
              )}
            >
              Todos
            </button>
            {listStatusOptions.map(option => {
              const isActive = listStatusFilter === option.status;
              return (
                <button
                  key={option.status}
                  onClick={() => setListStatusFilter(option.status)}
                  className={clsx(
                      'px-3 py-1 text-xs font-semibold rounded-full transition-colors',
                      isActive
                        ? `${statusConfig[option.status].buttonColor} ${statusConfig[option.status].textColor}`
                        : 'bg-gray-700 text-text-secondary hover:bg-cyan-neon/20'
                  )}
                >
                  {option.label.pt}
                </button>
              )
            })}
          </div>
        </div>
        
        {filters}

      </div>
    </aside>
  );
}