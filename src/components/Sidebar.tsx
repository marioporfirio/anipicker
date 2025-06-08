// src/components/Sidebar.tsx
'use client';

import { useFilterStore } from '@/store/filterStore';
import * as Slider from '@radix-ui/react-slider';

const MIN_YEAR = 1970;
const MAX_YEAR = new Date().getFullYear() + 1;

const formatOptions = {
    'TV': 'TV',
    'TV_SHORT': 'TV Curto',
    'MOVIE': 'Filme',
    'SPECIAL': 'Especial',
    'OVA': 'OVA',
    'ONA': 'ONA',
    'MUSIC': 'Música',
};

function FormatCheckbox({ formatKey, label }: { formatKey: string, label: string }) {
    const { formats, toggleFormat } = useFilterStore();
    const isChecked = formats.includes(formatKey);

    return (
        <label className="flex items-center space-x-2 cursor-pointer">
            <input
                type="checkbox"
                checked={isChecked}
                onChange={() => toggleFormat(formatKey)}
                className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"
            />
            <span className="text-sm text-text-main">{label}</span>
        </label>
    );
}

export default function Sidebar({ children }: { children: React.ReactNode }) {
  const { 
    search, setSearch, 
    yearRange, setYearRange,
    scoreRange, setScoreRange,
    includeTBA, toggleIncludeTBA,
    isSortMode, toggleSortMode,
    toggleSidebar 
  } = useFilterStore();

  return (
    <aside className="w-full md:w-64 lg:w-72 bg-surface rounded-lg shadow-lg self-start md:sticky md:top-24 max-h-[calc(100vh-7rem)] flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-xl font-bold text-primary">Filtros</h2>
        <button
          onClick={toggleSidebar}
          className="p-1 text-text-secondary hover:text-primary"
          title="Esconder filtros"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
        </button>
      </div>

      <div className="flex-grow p-4 overflow-y-auto space-y-6">
        
        <div className="flex items-center justify-between p-2 bg-background rounded-lg">
          <label htmlFor="sort-mode-toggle" className="font-semibold text-text-main">
            🎲 Modo Sorteio
          </label>
          <button
            id="sort-mode-toggle"
            onClick={toggleSortMode}
            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${isSortMode ? 'bg-primary' : 'bg-gray-600'}`}
          >
            <span
              className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isSortMode ? 'translate-x-6' : 'translate-x-1'}`}
            />
          </button>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label htmlFor="search" className="block text-sm font-medium text-text-secondary mb-1">
            Buscar Anime
          </label>
          <input
            type="text"
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ex: Cowboy Bebop"
            className="w-full bg-background border border-gray-600 rounded-md px-3 py-2 text-text-main focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(formatOptions).map(([key, label]) => (
                <FormatCheckbox key={key} formatKey={key} label={label} />
            ))}
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Nota Média
          </label>
          <Slider.Root
            className="relative flex items-center select-none touch-none w-full h-5"
            defaultValue={[0, 100]}
            min={0}
            max={100}
            step={1}
            value={scoreRange}
            onValueChange={(value) => setScoreRange([value[0], value[1]])}
          >
            <Slider.Track className="bg-background relative grow rounded-full h-[3px]">
              <Slider.Range className="absolute bg-primary rounded-full h-full" />
            </Slider.Track>
            <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
          </Slider.Root>
          <div className="flex justify-between text-xs text-text-secondary mt-2">
            <span>{scoreRange[0]}</span>
            <span>{scoreRange[1]}</span>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-4">
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Ano de Estreia
          </label>
          <div className={`transition-opacity duration-300 ${includeTBA ? 'opacity-50 cursor-not-allowed' : 'opacity-100'}`}>
            <Slider.Root
              className="relative flex items-center select-none touch-none w-full h-5"
              defaultValue={[MIN_YEAR, MAX_YEAR]}
              min={MIN_YEAR}
              max={MAX_YEAR}
              step={1}
              value={yearRange}
              onValueChange={(value) => setYearRange(value as [number, number])}
              disabled={includeTBA}
            >
              <Slider.Track className="bg-background relative grow rounded-full h-[3px]">
                <Slider.Range className="absolute bg-primary rounded-full h-full" />
              </Slider.Track>
              <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
              <Slider.Thumb className="block w-4 h-4 bg-primary shadow-md rounded-full hover:bg-sky-400 focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer" />
            </Slider.Root>
            <div className="flex justify-between text-xs text-text-secondary mt-2">
              <span>{yearRange[0]}</span>
              <span>{yearRange[1]}</span>
            </div>
          </div>
          <label className="flex items-center space-x-2 mt-3 cursor-pointer">
              <input
                  type="checkbox"
                  checked={includeTBA}
                  onChange={toggleIncludeTBA}
                  className="h-4 w-4 rounded border-gray-500 bg-surface text-primary focus:ring-primary"
              />
              <span className="text-sm text-text-main">Incluir animes sem data (TBA)</span>
          </label>
        </div>
        
        {children}
      </div>
    </aside>
  );
}