document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.jikan.moe/v4';
    const MAX_RESULTS_PER_PAGE_API = 25;
    const ITEMS_PER_LIST_PAGE_DISPLAY = 24;
    const MAX_API_CALLS_TOTAL = 45; 
    const API_DELAY_MS = 550; 

    // DOM Elements
    const minScoreSelect = document.getElementById('min-score');
    const maxScoreSelect = document.getElementById('max-score');
    const decadeSelect = document.getElementById('decade');
    const genresContainer = document.getElementById('genres-container');
    const themesContainer = document.getElementById('themes-container');
    const demographicsContainer = document.getElementById('demographics-container');
    
    const randomizeButton = document.getElementById('randomize-button');
    const listButton = document.getElementById('list-button');
    
    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageDiv = document.getElementById('error-message');
    
    const resultContainer = document.getElementById('result-container');
    const animeDetailsDiv = document.getElementById('anime-details');
    
    const listResultContainer = document.getElementById('list-result-container');
    const listSummary = document.getElementById('list-summary');
    const animeListDisplay = document.getElementById('anime-list-display');
    const listPaginationControls = document.getElementById('list-pagination-controls');
    const prevPageListButton = document.getElementById('prev-page-list');
    const nextPageListButton = document.getElementById('next-page-list');
    const currentPageListSpan = document.getElementById('current-page-list');

    let allFetchedAnimesForList = [];
    let currentPageForListDisplay = 1;
    let totalApiCallsMadeThisAction = 0; 


    // --- Helper Functions ---
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchWithRateLimit(url, options = {}, delay = API_DELAY_MS) {
        if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) {
            console.warn("Limite máximo de chamadas à API Jikan atingido para esta ação.");
            throw new Error("Limite de chamadas à API atingido. Tente uma busca menos abrangente ou aguarde um momento.");
        }
        await sleep(delay); 
        totalApiCallsMadeThisAction++;
        // console.log(`API Call (Action) #${totalApiCallsMadeThisAction}: ${url}`);
        return fetch(url, options);
    }

    // --- Populate Filter Options (with Caching) ---
    function populateScoreOptions() {
        minScoreSelect.innerHTML = '<option value="">Qualquer</option>';
        maxScoreSelect.innerHTML = '<option value="">Qualquer</option>';
        for (let i = 1; i <= 10; i += 0.5) {
            const valStr = i.toFixed(1);
            const option = document.createElement('option');
            option.value = valStr;
            option.textContent = valStr;
            minScoreSelect.appendChild(option.cloneNode(true));
            maxScoreSelect.appendChild(option);
        }
    }

    function populateDecadeOptions() {
        const currentYear = new Date().getFullYear();
        for (let year = 1910; year < currentYear + 10; year += 10) {
            if (year + 9 < 1917) continue; 
            const option = document.createElement('option');
            option.value = year;
            option.textContent = `${year}s`;
            decadeSelect.appendChild(option);
        }
    }

    async function fetchAndPopulateFilterOptions(endpoint, container, nameKey = 'name') {
        const cacheKey = `jikan_filter_cache_${endpoint.replace(/[/?=]/g, '_')}`;
        const cacheDuration = 24 * 60 * 60 * 1000; // 24 horas

        try {
            container.innerHTML = '<p>Carregando...</p>';
            let dataToProcess;

            const cachedItem = localStorage.getItem(cacheKey);
            if (cachedItem) {
                const { timestamp, data } = JSON.parse(cachedItem);
                if (Date.now() - timestamp < cacheDuration) {
                    console.log(`Usando cache para ${endpoint}`);
                    dataToProcess = data;
                }
            }

            if (!dataToProcess) {
                console.log(`Buscando da API para ${endpoint}`);
                await sleep(API_DELAY_MS); 
                const response = await fetch(`${API_BASE_URL}/${endpoint}`);
                
                if (!response.ok) {
                    const errorJson = await response.json().catch(()=> ({message: `HTTP error ${response.status}`}));
                    throw new Error(`Erro ${response.status} ao buscar ${endpoint}: ${errorJson.message || 'Erro desconhecido'}`);
                }
                const apiData = await response.json();
                if (!apiData.data || !Array.isArray(apiData.data)) {
                    throw new Error(`Resposta inesperada da API para ${endpoint}.`);
                }
                dataToProcess = apiData.data;
                localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: dataToProcess }));
            }
            
            container.innerHTML = ''; 
            dataToProcess.sort((a, b) => a[nameKey].localeCompare(b[nameKey])).forEach(item => {
                const label = document.createElement('label');
                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = item.mal_id;
                
                let checkboxName = "unknown";
                if (endpoint === 'genres/anime' && !endpoint.includes('filter=')) checkboxName = 'genres'; // Garante que apenas 'genres/anime' seja 'genres'
                else if (endpoint.includes('?filter=themes')) checkboxName = 'themes';
                else if (endpoint.includes('?filter=demographics')) checkboxName = 'demographics';
                
                checkbox.name = checkboxName; 

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(` ${item[nameKey]}`));
                container.appendChild(label);
            });

        } catch (error) {
            console.error(`Falha ao popular ${endpoint}:`, error);
            let displayEndpointName = endpoint;
            if (endpoint === 'genres/anime' && !endpoint.includes('filter=')) displayEndpointName = 'gêneros';
            else if (endpoint.includes('?filter=themes')) displayEndpointName = 'temas';
            else if (endpoint.includes('?filter=demographics')) displayEndpointName = 'demografias';

            container.innerHTML = `<p class="error-text">Não foi possível carregar ${displayEndpointName}. (${error.message})</p>`;
            localStorage.removeItem(cacheKey); 
        }
    }
    
    // --- Main Fetch and Filter Logic ---
    async function fetchAndFilterAnimesFromApi() {
        totalApiCallsMadeThisAction = 0; 

        // 1. Collect Filters
        const types = Array.from(document.querySelectorAll('input[name="anime_type"]:checked')).map(cb => cb.value);
        let startYearVal = document.getElementById('start-year').value;
        let endYearVal = document.getElementById('end-year').value;
        const selectedDecade = decadeSelect.value;

        if (selectedDecade) {
            startYearVal = selectedDecade;
            endYearVal = (parseInt(selectedDecade) + 9).toString();
        }
        
        const minEpisodes = document.getElementById('min-episodes').value;
        const maxEpisodes = document.getElementById('max-episodes').value;
        const minScore = minScoreSelect.value;
        const maxScore = maxScoreSelect.value;
        
        const generoIDsSelecionados = Array.from(genresContainer.querySelectorAll('input[name="genres"]:checked')).map(cb => cb.value);
        const temaIDsSelecionados = Array.from(themesContainer.querySelectorAll('input[name="themes"]:checked')).map(cb => cb.value);
        const demografiaIDsSelecionadas = Array.from(demographicsContainer.querySelectorAll('input[name="demographics"]:checked')).map(cb => cb.value);

        const studiosInput = document.getElementById('studios').value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const producersInput = document.getElementById('producers').value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const directorsInput = document.getElementById('directors').value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        const seiyuusInput = document.getElementById('seiyuus').value.split(',').map(s => s.trim().toLowerCase()).filter(s => s);

        // 2. Build Jikan API Query
        let queryParams = new URLSearchParams({ sfw: 'true', limit: MAX_RESULTS_PER_PAGE_API });
        if (types.length > 0) queryParams.append('type', types.join(','));
        if (minScore) queryParams.append('min_score', minScore);
        if (maxScore) queryParams.append('max_score', maxScore);
        
        if (startYearVal) queryParams.append('start_date', `${startYearVal}-01-01`);
        if (endYearVal) queryParams.append('end_date', `${endYearVal}-12-31`);

        if (generoIDsSelecionados.length > 0) queryParams.append('genres', generoIDsSelecionados.join(','));
        if (temaIDsSelecionados.length > 0) queryParams.append('themes', temaIDsSelecionados.join(','));
        if (demografiaIDsSelecionadas.length > 0) queryParams.append('demographics', demografiaIDsSelecionadas.join(','));
        
        // 3. Fetch all anime (API pagination)
        let allAnimeFromApi = [];
        let currentPageApi = 1;
        let hasNextPageApi = true;

        console.log("Iniciando busca na Jikan API com params:", queryParams.toString());
        console.log("URL da API construída:", `${API_BASE_URL}/anime?${queryParams.toString()}`);


        while (hasNextPageApi) {
            const currentQueryParams = new URLSearchParams(queryParams);
            currentQueryParams.set('page', currentPageApi);
            
            let response;
            try {
                response = await fetchWithRateLimit(`${API_BASE_URL}/anime?${currentQueryParams.toString()}`);
            } catch (e) { 
                 throw e;
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Erro na API Jikan (página ${currentPageApi}): ${response.status} ${errorData.message || response.statusText}`);
            }
            const data = await response.json();
            allAnimeFromApi.push(...data.data);
            
            hasNextPageApi = data.pagination?.has_next_page || false;
            if (hasNextPageApi) currentPageApi++;
            
            if (currentPageApi > 15 && (directorsInput.length > 0 || seiyuusInput.length > 0)) {
                 console.warn("Limitando páginas da API (15) devido a filtros de Diretor/Seiyuu ativos.");
                 hasNextPageApi = false; 
            }
            if (currentPageApi > 30) {
                console.warn("Máximo de páginas da API (30) atingido.");
                hasNextPageApi = false;
            }
        }
        console.log(`Total de ${allAnimeFromApi.length} animes encontrados APÓS busca na API Jikan.`);
        if (allAnimeFromApi.length > 0) {
            // console.log("Primeiro anime da API (antes de filtros cliente):", allAnimeFromApi[0].title, allAnimeFromApi[0].demographics.map(d=>d.name));
        }


        if (allAnimeFromApi.length === 0 && !queryParams.has('q')) { // Se não houver resultados e não foi uma busca por 'q'
            throw new Error("Nenhum anime encontrado com os filtros primários (API) especificados.");
        }

        // 4. Client-side filtering
        let clientFilteredAnime = allAnimeFromApi.filter(anime => {
            if (minEpisodes && (anime.episodes === null || anime.episodes < parseInt(minEpisodes))) return false;
            if (maxEpisodes && (anime.episodes === null || anime.episodes > parseInt(maxEpisodes))) return false;
            if (anime.episodes === null && (minEpisodes || maxEpisodes)) return false;

            if (generoIDsSelecionados.length > 0) {
                const animeGenreIDs = anime.genres.map(g => g.mal_id.toString());
                if (!generoIDsSelecionados.some(selectedID => animeGenreIDs.includes(selectedID))) {
                    return false; 
                }
            }

            if (temaIDsSelecionados.length > 0) {
                const animeThemeIDs = anime.themes.map(t => t.mal_id.toString());
                if (!temaIDsSelecionados.some(selectedID => animeThemeIDs.includes(selectedID))) {
                    return false; 
                }
            }

            if (demografiaIDsSelecionadas.length > 0) {
                const animeDemographicIDs = anime.demographics.map(d => d.mal_id.toString());
                if (!demografiaIDsSelecionadas.some(selectedID => animeDemographicIDs.includes(selectedID))) {
                    return false; 
                }
            }

            if (studiosInput.length > 0) {
                const animeStudios = anime.studios.map(s => s.name.toLowerCase());
                if (!studiosInput.some(inputStudio => animeStudios.some(as => as.includes(inputStudio)))) return false;
            }

            if (producersInput.length > 0) {
                const animeProducers = anime.producers.map(p => p.name.toLowerCase());
                if (!producersInput.some(inputProducer => animeProducers.some(ap => ap.includes(inputProducer)))) return false;
            }
            return true;
        });
        console.log(`${clientFilteredAnime.length} animes APÓS filtros de episódio, GÊNERO, TEMA, DEMOGRAFIA (CLIENT-SIDE), estúdio e produtor.`);
        if (clientFilteredAnime.length > 0) {
            // console.log("Primeiro anime DEPOIS de TODOS os filtros cliente (exceto dir/seiyuu):", clientFilteredAnime[0].title, clientFilteredAnime[0].demographics.map(d=>d.name), clientFilteredAnime[0].studios.map(s=>s.name) );
        }


        // 4.1. Advanced Client-side filtering for Directors and Seiyuus
        if (directorsInput.length > 0 && clientFilteredAnime.length > 0) {
            const directorFiltered = [];
            for (const anime of clientFilteredAnime) {
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL -1 && seiyuusInput.length > 0) break;
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL && seiyuusInput.length === 0) break; 
                try {
                    const staffRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/staff`);
                    if (staffRes.ok) {
                        const staffData = await staffRes.json();
                        const isDirectedBy = staffData.data.some(staff =>
                            staff.positions.some(pos => pos.toLowerCase().includes('director')) &&
                            directorsInput.some(dirName => staff.person.name.toLowerCase().includes(dirName))
                        );
                        if (isDirectedBy) directorFiltered.push(anime);
                    }
                } catch (e) { 
                    if (e.message.includes("Limite de chamadas à API atingido")) throw e;
                    console.warn(`Erro ao buscar staff para ${anime.title_english || anime.title}: ${e.message}`); 
                }
            }
            clientFilteredAnime = directorFiltered;
            console.log(`${clientFilteredAnime.length} animes após filtro de diretor.`);
        }

        if (seiyuusInput.length > 0 && clientFilteredAnime.length > 0) {
            const seiyuuFiltered = [];
            for (const anime of clientFilteredAnime) {
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) break;
                try {
                    const charsRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/characters`);
                    if (charsRes.ok) {
                        const charsData = await charsRes.json();
                        const hasSeiyuu = charsData.data.some(charEntry =>
                            charEntry.voice_actors.some(va =>
                                va.language === 'Japanese' &&
                                seiyuusInput.some(seiName => va.person.name.toLowerCase().includes(seiName))
                            )
                        );
                        if (hasSeiyuu) seiyuuFiltered.push(anime);
                    }
                } catch (e) { 
                    if (e.message.includes("Limite de chamadas à API atingido")) throw e;
                    console.warn(`Erro ao buscar personagens para ${anime.title_english || anime.title}: ${e.message}`); 
                }
            }
            clientFilteredAnime = seiyuuFiltered;
            console.log(`${clientFilteredAnime.length} animes após filtro de seiyuu.`);
        }
        
        return clientFilteredAnime;
    }

    // --- Event Listeners for Action Buttons ---
    randomizeButton.addEventListener('click', async () => {
        prepareForResults();
        try {
            const filteredAnimes = await fetchAndFilterAnimesFromApi();
            if (filteredAnimes.length === 0) {
                throw new Error("Nenhum anime corresponde a TODOS os critérios especificados.");
            }
            const randomAnime = filteredAnimes[Math.floor(Math.random() * filteredAnimes.length)];
            displayAnimeDetails(randomAnime);
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            handleError(error, "sorteio");
        } finally {
            finishLoading();
        }
    });

    listButton.addEventListener('click', async () => {
        prepareForResults();
        try {
            allFetchedAnimesForList = await fetchAndFilterAnimesFromApi();
            if (allFetchedAnimesForList.length === 0) {
                throw new Error("Nenhum anime corresponde a TODOS os critérios especificados.");
            }
            listSummary.textContent = `Encontrados ${allFetchedAnimesForList.length} animes.`;
            currentPageForListDisplay = 1;
            displayAnimeListPage();
            listResultContainer.style.display = 'block';
            listResultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            handleError(error, "listagem");
        } finally {
            finishLoading();
        }
    });
    
    // --- UI Update Functions ---
    function prepareForResults() {
        loadingIndicator.style.display = 'block';
        errorMessageDiv.style.display = 'none';
        resultContainer.style.display = 'none';
        listResultContainer.style.display = 'none';
        animeDetailsDiv.innerHTML = ''; 
        animeListDisplay.innerHTML = '';
    }

    function handleError(error, context) {
        console.error(`Erro no processo de ${context}:`, error);
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
    }

    function finishLoading() {
        loadingIndicator.style.display = 'none';
    }

    function displayAnimeDetails(anime) {
        let seasonDisplay = 'N/A';
        if (anime.season && anime.year) {
            seasonDisplay = `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}`;
        } else if (anime.year) {
            seasonDisplay = anime.year.toString();
        }

        const synopsisFullForJs = anime.synopsis ? anime.synopsis.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '<br>') : 'Sinopse não disponível.';
        const synopsisShort = anime.synopsis ? (anime.synopsis.length > 400 ? anime.synopsis.substring(0,400) + '...' : anime.synopsis) : 'Sinopse não disponível.';
        
        animeDetailsDiv.innerHTML = `
            <img src="${anime.images.jpg.large_image_url}" alt="Capa de ${anime.title}">
            <h3>${anime.title}</h3>
            ${anime.title_english ? `<p><strong>Título em Inglês:</strong> ${anime.title_english}</p>` : ''}
            ${anime.title_japanese ? `<p><strong>Título em Japonês:</strong> ${anime.title_japanese}</p>` : ''}
            ${anime.title_synonyms && anime.title_synonyms.length > 0 ? `<p><strong>Outros Títulos:</strong> ${anime.title_synonyms.join(', ')}</p>` : ''}
            
            <p><strong>Nota:</strong> ${anime.score || 'N/A'} ${anime.scored_by ? `(${anime.scored_by.toLocaleString()} votos)` : ''}</p>
            <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p>
            <p><strong>Estúdio(s):</strong> ${anime.studios.map(s => s.name).join(', ') || 'N/A'}</p>
            <p><strong>Produtor(es):</strong> ${anime.producers.map(p => p.name).join(', ') || 'N/A'}</p>
            <p><strong>Episódios:</strong> ${anime.episodes || 'N/A'}</p>
            <p><strong>Status:</strong> ${anime.status || 'N/A'}</p>
            <p><strong>Estreia:</strong> ${seasonDisplay}</p>
            <p><strong>Exibição:</strong> ${anime.aired.string || 'N/A'}</p>
            <p><strong>Gêneros:</strong> ${anime.genres.map(g => g.name).join(', ') || 'N/A'}</p>
            <p><strong>Temas:</strong> ${anime.themes.map(t => t.name).join(', ') || 'N/A'}</p>
            <p><strong>Demografia:</strong> ${anime.demographics.map(d => d.name).join(', ') || 'N/A'}</p>
            <p><strong>Sinopse:</strong></p>
            <p id="anime-synopsis-text">${synopsisShort.replace(/\n/g, '<br>')}</p>
            ${anime.synopsis && anime.synopsis.length > 400 ? `<button class="read-more-synopsis" onclick="document.getElementById('anime-synopsis-text').innerHTML='${synopsisFullForJs}'; this.style.display='none';">Ler Mais</button>` : ''}
            <p style="margin-top:10px;"><a href="${anime.url}" target="_blank" rel="noopener noreferrer">Ver no MyAnimeList</a></p>
        `;
    }

    function displayAnimeListPage() {
        animeListDisplay.innerHTML = '';
        const startIndex = (currentPageForListDisplay - 1) * ITEMS_PER_LIST_PAGE_DISPLAY;
        const endIndex = startIndex + ITEMS_PER_LIST_PAGE_DISPLAY;
        const animesToShowOnPage = allFetchedAnimesForList.slice(startIndex, endIndex);
        
        animesToShowOnPage.forEach(anime => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'anime-list-item';

            const genresText = anime.genres.map(g => g.name).join(', ') || 'N/A';
            const themesText = anime.themes.map(t => t.name).join(', ') || 'N/A';
            const demographicsText = anime.demographics.map(d => d.name).join(', ') || 'N/A';
            const studiosText = anime.studios.map(s => s.name).join(', ') || 'N/A';

            itemDiv.innerHTML = `
                <a href="${anime.url}" target="_blank" rel="noopener noreferrer" class="anime-list-item-link">
                    <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
                    <h4>${anime.title}</h4>
                </a>
                <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p>
                <p><strong>Nota:</strong> ${anime.score || 'N/A'}</p>
                <p><strong>Ep:</strong> ${anime.episodes || 'N/A'}</p>
                <p class="small-details"><strong>Estúdios:</strong> ${studiosText}</p>
                <p class="small-details"><strong>Gêneros:</strong> ${genresText}</p>
                ${anime.themes.length > 0 ? `<p class="small-details"><strong>Temas:</strong> ${themesText}</p>` : ''}
                ${anime.demographics.length > 0 ? `<p class="small-details"><strong>Demografia:</strong> ${demographicsText}</p>` : ''}
            `;
            animeListDisplay.appendChild(itemDiv);
        });
        updateListPaginationControls();
    }

    function updateListPaginationControls() {
        const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY);
        if (totalPages <= 1) {
            listPaginationControls.style.display = 'none';
            return;
        }
        listPaginationControls.style.display = 'block';
        currentPageListSpan.textContent = `Página ${currentPageForListDisplay} de ${totalPages}`;
        prevPageListButton.disabled = currentPageForListDisplay === 1;
        nextPageListButton.disabled = currentPageForListDisplay === totalPages;
    }

    prevPageListButton.addEventListener('click', () => {
        if (currentPageForListDisplay > 1) {
            currentPageForListDisplay--;
            displayAnimeListPage();
            animeListDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    nextPageListButton.addEventListener('click', () => {
        const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY);
        if (currentPageForListDisplay < totalPages) {
            currentPageForListDisplay++;
            displayAnimeListPage();
            animeListDisplay.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });

    // --- Initialize Page ---
    function init() {
        populateScoreOptions();
        populateDecadeOptions();
        
        fetchAndPopulateFilterOptions('genres/anime', genresContainer, 'name');
        fetchAndPopulateFilterOptions('genres/anime?filter=themes', themesContainer, 'name'); 
        fetchAndPopulateFilterOptions('genres/anime?filter=demographics', demographicsContainer, 'name');
    }

    init();
});