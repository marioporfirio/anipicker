// src/components/Sidebar.tsx
'use client';

import { useFilterStore, MediaStatus, MediaSource } from '@/store/filterStore';
import * as Slider from '@radix-ui/react-slider';
import { sidebarLabelTranslations, formatOptionTranslations, statusOptionTranslations, sourceOptionTranslations } from '@/lib/translations';

// As funções auxiliares não precisam de GenreFilter e TagFilter importados aqui
// import GenreFilter from './GenreFilter';
// import TagFilter from './TagFilter';

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

export default function Sidebar({ filters }: { filters: React.ReactNode }) {
  const { 
    search, setSearch, 
    yearRange, setYearRange,
    scoreRange, setScoreRange,
    includeTBA, toggleIncludeTBA,
    isRaffleMode, toggleRaffleMode,
    language,
    resetAllFilters,
    toggleSidebar 
  } = useFilterStore();

  const labels = sidebarLabelTranslations[language] || sidebarLabelTranslations.pt;

  return (
    // A classe flex-shrink-0 foi removida, pois o componente pai já define a largura.
    <aside className="w-full bg-surface rounded-lg shadow-lg self-start md:sticky md:top-24 max-h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-primary">{labels.filtersTitle}</h2>
          <button onClick={resetAllFilters} className="bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-primary-dark transition-colors">{labels.resetFilters || 'Limpar Filtros'}</button>
        </div>
        <button onClick={toggleSidebar} className="p-1 text-text-secondary hover:text-primary" title={labels.hideFilters}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        <div className="flex items-center justify-between p-2 bg-background rounded-lg">
          <label htmlFor="raffle-mode-toggle" className="font-semibold text-text-main">{labels.raffleMode}</label>
          <button id="raffle-mode-toggle" onClick={toggleRaffleMode} className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isRaffleMode ? 'bg-primary' : 'bg-gray-600'}`}>
            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isRaffleMode ? 'translate-x-6' : 'translate-x-1'}`}/>
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label htmlFor="search" className="block text-sm font-medium text-text-secondary mb-1">{labels.searchAnime}</label>
          <input type="text" id="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Ex: Cowboy Bebop" className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 text-text-main focus:ring-1 focus:ring-primary focus:outline-none"/>
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
          <div className="flex justify-between text-xs text-text-secondary mt-2"><span>{scoreRange[0]}</span><span>{scoreRange[1]}</span></div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-3">{labels.releaseYear}</label>
          <div className={`transition-opacity duration-300 ${includeTBA ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
            <Slider.Root className="relative flex items-center select-none touch-none w-full h-5" defaultValue={[MIN_YEAR, MAX_YEAR]} min={MIN_YEAR} max={MAX_YEAR} step={1} value={yearRange} onValueChange={(value) => setYearRange(value as [number, number])} disabled={includeTBA}>
              <Slider.Track className="bg-background relative grow rounded-full h-[3px]"><Slider.Range className="absolute bg-primary rounded-full h-full" /></Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
              <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            </Slider.Root>
            <div className="flex justify-between text-xs text-text-secondary mt-2"><span>{yearRange[0]}</span><span>{yearRange[1]}</span></div>
          </div>
          <label className="flex items-center space-x-2 mt-3 cursor-pointer">
              <input type="checkbox" checked={includeTBA} onChange={toggleIncludeTBA} className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"/>
              <span className="text-sm text-text-main">{labels.includeTBA}</span>
          </label>
        </div>
        
        {/* Renderiza os filtros de gênero e tag que foram passados como props */}
        {filters}

      </div>
    </aside>
  );
}