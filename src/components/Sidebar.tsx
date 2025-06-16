'use client';

import React, { useState, useEffect } from 'react';
import { useFilterStore, MediaStatus, MediaSource } from '@/store/filterStore';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { 
    sidebarLabelTranslations, 
    formatOptionTranslations, 
    statusOptionTranslations, 
    sourceOptionTranslations, 
    listButtonConfig, 
    statusConfig 
} from '@/lib/translations';
import SearchInput from './SearchInput';
import clsx from 'clsx';
import { FILTER_LIMITS } from '@/lib/constants';

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
      suppressHydrationWarning={true} // CORREÇÃO AQUI
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

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const {
    yearRange, setYearRange,
    scoreRange, setScoreRange,
    language,
    toggleSidebar,
    listStatusFilter, setListStatusFilter
  } = useFilterStore();

  const labels = sidebarLabelTranslations[language] || sidebarLabelTranslations.pt;
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
            Minhas Listas
          </label>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => setListStatusFilter(null)} className={clsx('px-3 py-1 text-xs font-semibold rounded-full transition-colors', listStatusFilter === null ? 'bg-cyan-neon text-black' : 'bg-gray-700 text-text-secondary hover:bg-cyan-neon/20')}>
              {labels.all}
            </button>
            {listStatusOptions.map(option => (
              <button key={option.status} onClick={() => setListStatusFilter(option.status)} className={clsx('px-3 py-1 text-xs font-semibold rounded-full transition-colors', listStatusFilter === option.status ? `${statusConfig[option.status].buttonColor} ${statusConfig[option.status].textColor}` : 'bg-gray-700 text-text-secondary hover:bg-cyan-neon/20')}>
                {option.label[language]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-6 border-t border-gray-700 pt-4">
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">{labels.animeType}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(formatOptionTranslations).map(([key, value]) => (<FormatCheckbox key={key} formatKey={key} label={value[language]} />))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">{labels.status}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(statusOptionTranslations).map(([key, value]) => (<StatusCheckbox key={key} statusKey={key as MediaStatus} label={value[language]} />))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-text-secondary mb-2">{labels.source}</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(sourceOptionTranslations).map(([key, value]) => (<SourceCheckbox key={key} sourceKey={key as MediaSource} label={value[language]} />))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{labels.releaseYear}</label>
            <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" value={yearRange} onValueChange={setYearRange} min={FILTER_LIMITS.MIN_YEAR} max={FILTER_LIMITS.MAX_YEAR} step={1}>
              <Slider.Track className="bg-gray-700 relative grow rounded-full h-1"><Slider.Range className="absolute bg-primary rounded-full h-full" /></Slider.Track>
              <SliderThumbWithTooltip value={yearRange[0]} /><SliderThumbWithTooltip value={yearRange[1]} />
            </Slider.Root>
            <div className="flex justify-between mt-2">
              <RangeInput value={yearRange[0]} onChange={(val) => setYearRange([val, yearRange[1]])} min={FILTER_LIMITS.MIN_YEAR} max={yearRange[1]}/>
              <RangeInput value={yearRange[1]} onChange={(val) => setYearRange([yearRange[0], val])} min={yearRange[0]} max={FILTER_LIMITS.MAX_YEAR}/>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">{labels.averageScore}</label>
            <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" value={scoreRange} onValueChange={setScoreRange} min={0} max={100} step={1}>
              <Slider.Track className="bg-gray-700 relative grow rounded-full h-1"><Slider.Range className="absolute bg-primary rounded-full h-full" /></Slider.Track>
              <SliderThumbWithTooltip value={scoreRange[0]} /><SliderThumbWithTooltip value={scoreRange[1]} />
            </Slider.Root>
            <div className="flex justify-between mt-2">
              <RangeInput value={scoreRange[0]} onChange={(val) => setScoreRange([val, scoreRange[1]])} min={0} max={scoreRange[1]}/>
              <RangeInput value={scoreRange[1]} onChange={(val) => setScoreRange([scoreRange[0], val])} min={scoreRange[0]} max={100}/>
            </div>
          </div>
          
          {children}
        </div>
      </div>
    </aside>
  );
}