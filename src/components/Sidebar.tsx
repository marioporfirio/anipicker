// src/components/Sidebar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore, MediaStatus, MediaSource } from '@/store/filterStore';
import * as Slider from '@radix-ui/react-slider';
import { sidebarLabelTranslations, formatOptionTranslations, statusOptionTranslations, sourceOptionTranslations, listButtonConfig } from '@/lib/translations';
import SearchInput from './SearchInput';
import { ListStatus } from '@/store/userListStore';

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

  const labels = sidebarLabelTranslations[language] || sidebarLabelTranslations.pt;
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const listStatusOptions = listButtonConfig.filter(b => b.status !== 'SKIPPING');

  return (
    <aside className="w-full bg-surface rounded-lg shadow-lg self-start md:sticky md:top-24 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-primary">{labels.filtersTitle}</h2>
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
              className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                listStatusFilter === null 
                  ? 'bg-primary text-white' 
                  : 'bg-gray-700 text-text-secondary hover:bg-gray-600'
              }`}
            >
              {language === 'pt' ? 'Todos' : 'All'}
            </button>
            {listStatusOptions.map(option => (
              <button
                // CORREÇÃO: Usando `option.status` para a chave e o clique
                key={option.status}
                onClick={() => setListStatusFilter(option.status)}
                className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                  listStatusFilter === option.status
                    ? 'bg-primary text-white' 
                    : 'bg-gray-700 text-text-secondary hover:bg-gray-600'
                }`}
              >
                {option.label[language]}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">{labels.animeType}</label>
          <div className="grid grid-cols-2 gap-2">
            {Object.keys(formatOptionTranslations).map((key) => (<FormatCheckbox key={key} formatKey={key} label={formatOptionTranslations[key][language] || formatOptionTranslations[key]['pt']}/>))}
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">{labels.status}</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(statusOptionTranslations) as MediaStatus[]).map((key) => (<StatusCheckbox key={key} statusKey={key} label={statusOptionTranslations[key][language] || statusOptionTranslations[key]['pt']}/>))}
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">{labels.source || 'Fonte'}</label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.keys(sourceOptionTranslations) as MediaSource[]).map((key) => (<SourceCheckbox key={key} sourceKey={key} label={sourceOptionTranslations[key][language] || sourceOptionTranslations[key]['pt']}/>))}
          </div>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-3">{labels.averageScore}</label>
          <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" defaultValue={[0, 100]} min={0} max={100} step={1} value={scoreRange} onValueChange={(value) => setScoreRange([value[0], value[1]])}>
            <Slider.Track className="bg-background relative grow rounded-full h-[3px]"><Slider.Range className="absolute bg-primary rounded-full h-full" /></Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
          </Slider.Root>
          <div className="flex justify-between items-center text-xs text-text-secondary mt-2">
            {isClient ? (
                <>
                    <RangeInput value={scoreRange[0]} onChange={(val) => setScoreRange([val, scoreRange[1]])} min={0} max={100} />
                    <RangeInput value={scoreRange[1]} onChange={(val) => setScoreRange([scoreRange[0], val])} min={0} max={100} />
                </>
            ) : (
                <>
                    <div className="w-16 h-[34px] bg-background rounded-md" />
                    <div className="w-16 h-[34px] bg-background rounded-md" />
                </>
            )}
          </div>
          <label className="flex items-center space-x-2 mt-3 cursor-pointer">
              <input type="checkbox" checked={excludeNoScore} onChange={toggleExcludeNoScore} className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"/>
              <span className="text-sm text-text-main">{language === 'pt' ? 'Excluir sem nota' : 'Exclude no score'}</span>
          </label>
        </div>
        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-3">{labels.releaseYear}</label>
          <div className={`transition-opacity duration-300 ${includeTBA ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
            <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" defaultValue={[MIN_YEAR, MAX_YEAR]} min={MIN_YEAR} max={MAX_YEAR} step={1} value={yearRange} onValueChange={(value) => setYearRange(value as [number, number])} disabled={includeTBA}>
              <Slider.Track className="bg-background relative grow rounded-full h-[3px]"><Slider.Range className="absolute bg-primary rounded-full h-full" /></Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
              <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            </Slider.Root>
            <div className="flex justify-between items-center text-xs text-text-secondary mt-2">
                {isClient ? (
                    <>
                        <RangeInput value={yearRange[0]} onChange={(val) => setYearRange([val, yearRange[1]])} min={MIN_YEAR} max={MAX_YEAR} />
                        <RangeInput value={yearRange[1]} onChange={(val) => setYearRange([yearRange[0], val])} min={MIN_YEAR} max={MAX_YEAR} />
                    </>
                ) : (
                    <>
                        <div className="w-16 h-[34px] bg-background rounded-md" />
                        <div className="w-16 h-[34px] bg-background rounded-md" />
                    </>
                )}
            </div>
          </div>
          <label className="flex items-center space-x-2 mt-3 cursor-pointer">
              <input type="checkbox" checked={includeTBA} onChange={toggleIncludeTBA} className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"/>
              <span className="text-sm text-text-main">{labels.includeTBA}</span>
          </label>
        </div>
        
        {filters}

      </div>
    </aside>
  );
}