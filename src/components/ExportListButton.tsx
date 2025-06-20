// src/components/ExportListButton.tsx
'use client';

import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import { useUserListStore, CustomList, ListStatus } from '@/store/userListStore'; // Added ListStatus
import { searchAnime, Anime } from '@/lib/anilist';
import { useFilterStore } from '@/store/filterStore';
import { translate, genreTranslations, listButtonConfig } from '@/lib/translations'; // Added listButtonConfig

interface ExportListButtonProps {
  listId: string;
  listName: string;
}

// Helper function for translating season, adapted from AnimeCard.tsx
const translatedSeason = (season: string, year: number, lang: string): string => {
    if (lang === 'en') return `${season.charAt(0).toUpperCase() + season.slice(1).toLowerCase()} ${year}`;
    const seasonPT: Record<string, string> = { WINTER: 'Inverno', SPRING: 'Primavera', SUMMER: 'Verão', FALL: 'Outono' };
    return `${seasonPT[season] || season} ${year}`;
};

// Define status colors
const statusColors: Record<ListStatus, string> = {
  WATCHING: '#22c55e',  // green-500
  COMPLETED: '#3b82f6', // blue-500
  PLANNED: '#eab308',   // yellow-500
  DROPPED: '#ef4444',   // red-500
  PAUSED: '#8b5cf6',    // purple-500
  SKIPPING: '#6b7280'   // gray-500 
};

const ExportListButton: React.FC<ExportListButtonProps> = ({ listId, listName }) => {
  const [isExporting, setIsExporting] = useState(false);
  const { customLists, getAnimeStatus } = useUserListStore(); // Added getAnimeStatus
  const { language } = useFilterStore();

  const handleExport = async () => {
    setIsExporting(true);

    const list = customLists.find(l => l.id === listId);
    if (!list || list.animeIds.length === 0) {
      alert('This list is empty or not found.');
      setIsExporting(false); 
      return;
    }

    let exportContainer: HTMLDivElement | null = null; 

    try {
      const result = await searchAnime({ animeIds: list.animeIds }, 1, list.animeIds.length);
      const animesFromApi = result.animes; 

      if (!animesFromApi || animesFromApi.length === 0) {
        alert('Could not fetch anime details for this list.');
        return; 
      }

      // Re-sort animes based on list.animeIds order
      const idToAnimeMap = new Map(animesFromApi.map(anime => [anime.id, anime]));
      const sortedAnimes = list.animeIds
                                   .map(id => idToAnimeMap.get(id))
                                   .filter((anime): anime is Anime => anime !== undefined);

      if (!sortedAnimes || sortedAnimes.length === 0) { 
        alert('Could not prepare sorted anime details for this list.');
        return;
      }

      exportContainer = document.createElement('div');
      exportContainer.id = 'export-list-container';
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px'; 
      exportContainer.style.top = '0';
      exportContainer.style.width = `${Math.min(sortedAnimes.length, 5) * (180 + 16) + 16}px`;
      exportContainer.style.padding = '16px';
      exportContainer.style.backgroundColor = '#111827'; 
      exportContainer.style.display = 'flex';
      exportContainer.style.flexDirection = 'column';
      exportContainer.style.alignItems = 'center'; 
      document.body.appendChild(exportContainer);

      const listTitleElement = document.createElement('h2');
      listTitleElement.textContent = listName;
      listTitleElement.style.fontSize = '28px';
      listTitleElement.style.fontWeight = 'bold';
      listTitleElement.style.color = '#FFFFFF';
      listTitleElement.style.textAlign = 'center';
      listTitleElement.style.width = '100%'; 
      listTitleElement.style.padding = '0 10px'; 
      listTitleElement.style.boxSizing = 'border-box';
      listTitleElement.style.marginBottom = '20px';
      exportContainer.appendChild(listTitleElement);

      const legendContainerDiv = document.createElement('div');
      legendContainerDiv.style.display = 'flex';
      legendContainerDiv.style.flexWrap = 'wrap';
      legendContainerDiv.style.justifyContent = 'center';
      legendContainerDiv.style.gap = '8px 15px'; // row gap, column gap
      legendContainerDiv.style.marginTop = '5px'; // Space from title
      legendContainerDiv.style.marginBottom = '15px'; // Space before grid
      legendContainerDiv.style.width = '100%';
      legendContainerDiv.style.padding = '0 10px'; // Horizontal padding for legend items if container is constrained
      legendContainerDiv.style.boxSizing = 'border-box';

      const legendOrder: ListStatus[] = ['WATCHING', 'COMPLETED', 'PLANNED', 'DROPPED', 'PAUSED'];

      legendOrder.forEach(statusKey => {
        const statusConfig = listButtonConfig.find(s => s.status === statusKey);
        if (statusConfig && statusColors[statusKey]) {
          const legendItemDiv = document.createElement('div');
          legendItemDiv.style.display = 'flex';
          legendItemDiv.style.alignItems = 'center';
          legendItemDiv.style.gap = '5px';

          const legendColorBoxSpan = document.createElement('span');
          legendColorBoxSpan.style.width = '10px';
          legendColorBoxSpan.style.height = '10px';
          legendColorBoxSpan.style.backgroundColor = statusColors[statusKey];
          legendColorBoxSpan.style.border = '1px solid #718096'; // gray-500 for box visibility

          const legendLabelSpan = document.createElement('span');
          // Ensure 'language' is 'pt' or 'en' for this to work directly with label structure
          const labelText = (language === 'pt' || language === 'en') ? statusConfig.label[language] : statusConfig.label.pt;
          legendLabelSpan.textContent = labelText;
          legendLabelSpan.style.fontSize = '10px';
          legendLabelSpan.style.color = '#A0AEC0'; // gray-400
          // Remove previous lineHeight if any
          legendLabelSpan.style.display = 'inline-flex';
          legendLabelSpan.style.alignItems = 'center';
          legendLabelSpan.style.height = '12px'; // Match color box total height

          legendItemDiv.appendChild(legendColorBoxSpan);
          legendItemDiv.appendChild(legendLabelSpan);
          legendContainerDiv.appendChild(legendItemDiv);
        }
      });
      exportContainer.appendChild(legendContainerDiv);

      const cardGridContainer = document.createElement('div');
      cardGridContainer.style.display = 'grid';
      cardGridContainer.style.gridTemplateColumns = `repeat(${Math.min(sortedAnimes.length, 5)}, minmax(180px, 1fr))`;
      cardGridContainer.style.gap = '16px'; 

      sortedAnimes.forEach(anime => { 
        const card = document.createElement('div');
        card.style.width = '180px';
        card.style.backgroundColor = '#1f2937';
        card.style.borderRadius = '8px';
        card.style.overflow = 'hidden';
        card.style.color = 'white';
        card.style.fontFamily = '"Inter", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';

        // Add status border
        const currentAnimeStatus = getAnimeStatus(anime.id);
        const borderColor = currentAnimeStatus ? statusColors[currentAnimeStatus] : 'transparent';
        card.style.border = `1.5px solid ${borderColor}`;
        card.style.boxSizing = 'border-box';
        
        const poster = document.createElement('img');
        poster.src = anime.coverImage.extraLarge;
        poster.crossOrigin = 'anonymous';
        poster.style.width = '100%';
        poster.style.height = '270px';
        poster.style.objectFit = 'cover';
        card.appendChild(poster);

        const detailsOverlay = document.createElement('div');
        detailsOverlay.style.padding = '2px 6px'; 
        detailsOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        detailsOverlay.style.position = 'relative'; 
        detailsOverlay.style.height = '106px'; // Increased height for streaming icons

        const titleEl = document.createElement('h4'); 
        const MAX_TITLE_LENGTH = 60; // User's title length from "perfect" code (was 60 in message, but 40 in code)
        const displayTitle = anime.title.romaji.length > MAX_TITLE_LENGTH ? anime.title.romaji.substring(0, MAX_TITLE_LENGTH - 3) + "..." : anime.title.romaji;
        titleEl.textContent = displayTitle;
        titleEl.style.fontWeight = 'bold';
        titleEl.style.fontSize = '12px'; 
        titleEl.style.lineHeight = '1.3';
        titleEl.style.marginTop = '-6px'; // User's negative margin (was -6px in message, 0px in code)
        titleEl.style.marginBottom = '-4px'; // User's negative margin (was -4px in message, 2px in code)
        titleEl.style.height = '37px'; // User's title height (was 37px in message, 32px in code)
        titleEl.style.overflow = 'hidden';
        detailsOverlay.appendChild(titleEl);

        const episodesSeason = document.createElement('p');
        let epSeasonText = anime.episodes ? `${anime.episodes} ${language === 'pt' ? 'episódios' : 'episodes'}` : (language === 'pt' ? 'Episódios: TBA' : 'Episodes: TBA');
        if (anime.season && anime.seasonYear) {
          epSeasonText += ` • ${translatedSeason(anime.season, anime.seasonYear, language)}`;
        }
        episodesSeason.textContent = epSeasonText;
        episodesSeason.style.fontSize = '10px';
        episodesSeason.style.color = '#d1d5db';
        episodesSeason.style.marginTop = '0px'; 
        episodesSeason.style.marginBottom = '2px'; 
        detailsOverlay.appendChild(episodesSeason);

        const mainStudio = anime.studios.nodes[0]?.name;
        if (mainStudio) {
          const studioP = document.createElement('p');
          studioP.textContent = `${language === 'pt' ? 'Estúdio' : 'Studio'}: ${mainStudio}`;
          studioP.style.fontSize = '10px';
          studioP.style.color = '#d1d5db';
          studioP.style.marginTop = '0px'; 
          detailsOverlay.appendChild(studioP);
        }

        if (anime.genres && anime.genres.length > 0) {
          const genreTextContainer = document.createElement('p');
          const selectedGenres = anime.genres.slice(0, 3);
          const genreText = selectedGenres
            .map(genre => (language === 'pt' ? translate(genreTranslations, genre) : genre))
            .join(', ');
          genreTextContainer.textContent = genreText;
          genreTextContainer.style.fontSize = '10px';
          genreTextContainer.style.color = '#d1d5db';
          genreTextContainer.style.marginTop = '0px';  
          genreTextContainer.style.marginBottom = '2px'; 
          detailsOverlay.appendChild(genreTextContainer);
        }

        // Add Streaming Icons
        if (anime.externalLinks && anime.externalLinks.length > 0) {
          const streamingLinks = anime.externalLinks.filter(link => link.type === "STREAMING").slice(0, 4); // Max 4 icons
          if (streamingLinks.length > 0) {
            const iconsContainer = document.createElement('div');
            iconsContainer.style.position = 'absolute';
            iconsContainer.style.bottom = '6px';
            iconsContainer.style.left = '6px';
            iconsContainer.style.right = '6px';
            iconsContainer.style.display = 'flex';
            iconsContainer.style.alignItems = 'center';
            iconsContainer.style.gap = '4px';
            // marginTop and padding removed

            streamingLinks.forEach(link => {
              if (link.icon) {
                const iconImg = document.createElement('img');
                iconImg.src = link.icon;
                iconImg.alt = link.site; // Alt text for accessibility
                iconImg.crossOrigin = 'anonymous';
                iconImg.style.width = '16px';
                iconImg.style.height = '16px';
                iconImg.style.borderRadius = '3px';
                if (link.color) { // Optional background color from link
                  iconImg.style.backgroundColor = link.color;
                }
                iconsContainer.appendChild(iconImg);
              } else {
                const siteSpan = document.createElement('span');
                siteSpan.textContent = link.site;
                siteSpan.style.fontSize = '9px';
                siteSpan.style.padding = '2px 4px';
                siteSpan.style.backgroundColor = '#4A5568'; // gray-700
                siteSpan.style.color = 'white';
                siteSpan.style.borderRadius = '3px';
                iconsContainer.appendChild(siteSpan);
              }
            });
            detailsOverlay.appendChild(iconsContainer);
          }
        }
        card.appendChild(detailsOverlay);
        if (cardGridContainer) { 
          cardGridContainer.appendChild(card);
        }
      });
      
      if (exportContainer) { 
          exportContainer.appendChild(cardGridContainer);
      }
            
      if (exportContainer) { 
        const currentContainer: HTMLDivElement = exportContainer; 
        await new Promise(resolve => setTimeout(resolve, 100));
        const canvas = await html2canvas(currentContainer, { 
          scale: 2,
          backgroundColor: '#111827',
          useCORS: true,
          logging: true
        } as any); 
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        const sanitizedListName = listName
          .normalize("NFD") 
          .replace(/[\u0300-\u036f]/g, "") 
          .replace(/[^\w\s-]/gi, '') 
          .trim() 
          .replace(/\s+/g, '_'); 
        link.download = `${sanitizedListName || 'lista'}_export.png`;
        link.click();
      } else {
        console.error("ExportListButton: exportContainer is null before html2canvas call.");
        alert("Failed to prepare image for export: container not created.");
      }
    } catch (error) {
      console.error('Error exporting list with html2canvas:', error);
      alert('An error occurred while exporting the list with html2canvas.');
    } finally {
      if (exportContainer && document.body.contains(exportContainer)) {
        document.body.removeChild(exportContainer);
      }
      setIsExporting(false);
    }
  };

  return (  // Button JSX remains the same
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="p-1.5 text-text-secondary hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
      title={isExporting ? `Exportando ${listName}...` : `Exportar ${listName} como imagem`}
    >
      {isExporting ? (
        <svg className="animate-spin h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="16" height="16">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      )}
    </button>
  );
};

export default ExportListButton;
