document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.jikan.moe/v4';
    const MAX_RESULTS_PER_PAGE_API = 25;
    const ITEMS_PER_LIST_PAGE_DISPLAY = 24;
    const MAX_API_CALLS_TOTAL = 45; 
    const API_DELAY_MS = 1200; 

    const CURATED_GENRES_NAMES = [
        "Action", "Adventure", "Avant Garde", "Award Winning", "Boys Love",
        "Comedy", "Drama", "Fantasy", "Girls Love", "Gourmet",
        "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life",
        "Sports", "Supernatural", "Suspense",
        "Ecchi", "Erotica", "Hentai"
    ];

    // Elementos do DOM
    const minScoreSelect = document.getElementById('min-score');
    const maxScoreSelect = document.getElementById('max-score');
    const decadeSelect = document.getElementById('decade');
    const genresContainer = document.getElementById('genres-container');
    const themesContainer = document.getElementById('themes-container');
    const demographicsContainer = document.getElementById('demographics-container');
    const randomizeButton = document.getElementById('randomize-button');
    const listButton = document.getElementById('list-button');
    const homeButton = document.getElementById('home-icon-button');
    const shareButton = document.getElementById('share-button');
    const strictModeCheckbox = document.getElementById('strict-mode-checkbox');
    const sortBySelect = document.getElementById('sort-by');
    const sortOrderToggle = document.getElementById('sort-order-toggle');
    const listSummaryCount = document.getElementById('list-summary-count');
    const loadingIndicator = document.getElementById('loading-indicator');
    const cancelSearchButton = document.getElementById('cancel-search-button');
    const errorMessageDiv = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const animeDetailsDiv = document.getElementById('anime-details');
    const listResultContainer = document.getElementById('list-result-container');
    const animeListDisplay = document.getElementById('anime-list-display');
    const paginationControlsTop = document.getElementById('list-pagination-controls-top');
    const prevPageListButtonTop = document.getElementById('prev-page-list-top');
    const nextPageListButtonTop = document.getElementById('next-page-list-top');
    const currentPageListSpanTop = document.getElementById('current-page-list-top');
    const paginationControlsBottom = document.getElementById('list-pagination-controls-bottom');
    const prevPageListButtonBottom = document.getElementById('prev-page-list-bottom');
    const nextPageListButtonBottom = document.getElementById('next-page-list-bottom');
    const currentPageListSpanBottom = document.getElementById('current-page-list-bottom');

    // Inputs de filtro para adicionar listeners
    const textInputFilters = ['studios', 'producers', 'directors', 'seiyuus'];
    const numberInputFilters = ['min-episodes', 'max-episodes', 'start-year', 'end-year'];
    const selectInputFilters = ['decade', 'min-score', 'max-score'];
    const checkboxGroupContainers = ['anime-types-container']; 


    // Estado da aplicação
    let allFetchedAnimesForList = [];
    let currentPageForListDisplay = 1;
    let totalApiCallsMadeThisAction = 0;
    let currentSortBy = 'title'; 
    let currentSortOrderAsc = true; 
    let currentAbortController = null; 
    let wasManuallyCancelled = false; // Flag para cancelamento explícito pelo botão

    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    async function fetchWithRateLimit(url, options = {}, delay = API_DELAY_MS, signal) {
        if (signal && signal.aborted) { throw new DOMException('Busca cancelada antes do fetch.', 'AbortError'); }
        if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) {
            console.warn("Limite de chamadas à API auto-imposto atingido nesta ação.");
            throw new Error("Limite de chamadas à API atingido para esta busca. Tente filtros mais específicos.");
        }
        await sleep(delay); 
        if (signal && signal.aborted) { throw new DOMException('Busca cancelada durante o sleep.', 'AbortError'); }
        totalApiCallsMadeThisAction++; 
        const fetchOptions = { ...options, signal }; 
        return fetch(url, fetchOptions);
    }

    function formatDate(isoDateString) {
        if (!isoDateString) return 'N/A';
        try {
            const date = new Date(isoDateString);
            const day = String(date.getUTCDate()).padStart(2, '0');
            const month = String(date.getUTCMonth() + 1).padStart(2, '0'); 
            const year = date.getUTCFullYear();
            return `${day}/${month}/${year}`;
        } catch (e) {
            console.error("Erro ao formatar data:", isoDateString, e);
            return 'N/A';
        }
    }

    function formatSeason(season, year) {
        if (!season && !year) return 'N/A';
        if (!season) return year ? year.toString() : 'N/A';
        const capitalizedSeason = season.charAt(0).toUpperCase() + season.slice(1);
        return year ? `${capitalizedSeason} ${year}` : capitalizedSeason;
    }


    function populateScoreOptions() { minScoreSelect.innerHTML = '<option value="">Qualquer</option>'; maxScoreSelect.innerHTML = '<option value="">Qualquer</option>'; for (let i = 1; i <= 10; i += 0.5) { const valStr = i.toFixed(1); const option = document.createElement('option'); option.value = valStr; option.textContent = valStr; minScoreSelect.appendChild(option.cloneNode(true)); maxScoreSelect.appendChild(option); } }
    function populateDecadeOptions() { const currentYear = new Date().getFullYear(); for (let year = 1910; year < currentYear + 10; year += 10) { if (year + 9 < 1917) continue; const option = document.createElement('option'); option.value = year; option.textContent = `${year}s`; decadeSelect.appendChild(option); } }

    async function fetchAndPopulateFilterOptions(endpoint, container, nameKey = 'name', categoryName, signal) {
        const cacheKey = `jikan_filter_cache_${endpoint.replace(/[/?=]/g, '_')}`;
        const cacheDuration = 24 * 60 * 60 * 1000; 
        try {
            container.innerHTML = '<p>Carregando...</p>';
            let dataToProcess;
            const cachedItem = localStorage.getItem(cacheKey);
            if (cachedItem) { const { timestamp, data } = JSON.parse(cachedItem); if (Date.now() - timestamp < cacheDuration) { dataToProcess = data; } }
            
            if (!dataToProcess) {
                await sleep(API_DELAY_MS / 2); 
                 if (signal && signal.aborted) { throw new DOMException('Busca de filtros cancelada.', 'AbortError'); }
                const response = await fetch(`${API_BASE_URL}/${endpoint}`, { signal }); 
                if (!response.ok) { const errorJson = await response.json().catch(()=> ({message: `HTTP error ${response.status}`})); throw new Error(`Erro ${response.status} ao buscar ${categoryName}: ${errorJson.message || 'Erro desconhecido'}`); }
                const apiData = await response.json();
                if (!apiData.data || !Array.isArray(apiData.data)) { throw new Error(`Resposta inesperada da API para ${categoryName}.`); }
                dataToProcess = apiData.data; localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: dataToProcess }));
            }

            if (signal && signal.aborted) { throw new DOMException('Busca de filtros cancelada.', 'AbortError'); }
            
            let finalDataForDisplay = dataToProcess;
            if (categoryName === 'genres') { finalDataForDisplay = dataToProcess.filter(item => CURATED_GENRES_NAMES.includes(item[nameKey]));}
            
            container.innerHTML = '';
            const sortedData = finalDataForDisplay.sort((a, b) => a[nameKey].localeCompare(b[nameKey]));
            
            if (sortedData.length === 0 && categoryName === 'genres') { container.innerHTML = '<p class="error-text">Nenhum gênero curado encontrado.</p>'; return; }
            if (sortedData.length === 0) { container.innerHTML = `<p>Nenhum item de ${categoryName} encontrado.</p>`; return; }
            
            sortedData.forEach(item => {
                const label = document.createElement('label'); const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox'; checkboxInput.value = item.mal_id; checkboxInput.name = categoryName; checkboxInput.dataset.filterState = "0"; 
                label.appendChild(checkboxInput); label.appendChild(document.createTextNode(item[nameKey])); 
                label.setAttribute('role', 'checkbox'); label.setAttribute('aria-checked', 'false'); label.tabIndex = 0; 
                label.addEventListener('click', (e) => { 
                    e.preventDefault(); e.stopPropagation(); 
                    let S = parseInt(checkboxInput.dataset.filterState||"0"); S=(S+1)%3; 
                    checkboxInput.dataset.filterState=S.toString(); 
                    updateLabelStateVisual(label,S);
                    updateSortOptions(); 
                    updateURLWithOptions(); 
                });
                label.addEventListener('keydown', (e) => { if (e.key===' '||e.key==='Enter'){e.preventDefault();label.click();}}); container.appendChild(label);
            });
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log(`Busca de ${categoryName} cancelada.`);
                container.innerHTML = `<p>Busca de ${categoryName} cancelada.</p>`;
            } else {
                console.error(`Falha ${categoryName}:`, error); container.innerHTML = `<p class="error-text">Erro ${categoryName}. (${error.message})</p>`; localStorage.removeItem(cacheKey);
            }
        }
    }
    function updateLabelStateVisual(label, state) { label.classList.remove('state-include','state-exclude');let S="false";if(state===1){label.classList.add('state-include');S="true";}else if(state===2){label.classList.add('state-exclude');S="mixed";}label.setAttribute('aria-checked',S);}
    function collectAllFilters() { const f={};f.types=Array.from(document.querySelectorAll('input[name="anime_type"]:checked')).map(c=>c.value);f.minEpisodes=document.getElementById('min-episodes').value;f.maxEpisodes=document.getElementById('max-episodes').value;f.startYear=document.getElementById('start-year').value;f.endYear=document.getElementById('end-year').value;f.decade=decadeSelect.value;f.minScore=minScoreSelect.value;f.maxScore=maxScoreSelect.value;f.generoIDsIncluir=[],f.generoIDsExcluir=[];genresContainer.querySelectorAll('input[type="checkbox"]').forEach(c=>{if(c.dataset.filterState==="1")f.generoIDsIncluir.push(c.value);else if(c.dataset.filterState==="2")f.generoIDsExcluir.push(c.value);});f.temaIDsIncluir=[],f.temaIDsExcluir=[];themesContainer.querySelectorAll('input[type="checkbox"]').forEach(c=>{if(c.dataset.filterState==="1")f.temaIDsIncluir.push(c.value);else if(c.dataset.filterState==="2")f.temaIDsExcluir.push(c.value);});f.demografiaIDsIncluir=[],f.demografiaIDsExcluir=[];demographicsContainer.querySelectorAll('input[type="checkbox"]').forEach(c=>{if(c.dataset.filterState==="1")f.demografiaIDsIncluir.push(c.value);else if(c.dataset.filterState==="2")f.demografiaIDsExcluir.push(c.value);});f.isStrictMode=strictModeCheckbox.checked;f.studios=document.getElementById('studios').value;f.producers=document.getElementById('producers').value;f.directors=document.getElementById('directors').value;f.seiyuus=document.getElementById('seiyuus').value;return f;}
    
    function updateURLWithOptions(action = null, animeId = null, listPage = null) {
        const f = collectAllFilters();
        const p = new URLSearchParams();
        if (action) p.set('action', action);
        if (animeId && action === 'show_anime') p.set('id', animeId);
        if (listPage && action === 'list') p.set('page', listPage);

        if (f.types.length > 0) p.set('types', f.types.join(','));
        if (f.minEpisodes) p.set('min_ep', f.minEpisodes);
        if (f.maxEpisodes) p.set('max_ep', f.maxEpisodes);
        
        if (f.decade) {
            p.set('decade', f.decade);
            p.delete('start_year');
            p.delete('end_year');
        } else {
            if (f.startYear) p.set('start_year', f.startYear);
            if (f.endYear) p.set('end_year', f.endYear);
        }

        if (f.minScore) p.set('min_score', f.minScore);
        if (f.maxScore) p.set('max_score', f.maxScore);
        if (f.generoIDsIncluir.length > 0) p.set('g_inc', f.generoIDsIncluir.join(','));
        if (f.generoIDsExcluir.length > 0) p.set('g_exc', f.generoIDsExcluir.join(','));
        if (f.temaIDsIncluir.length > 0) p.set('t_inc', f.temaIDsIncluir.join(','));
        if (f.temaIDsExcluir.length > 0) p.set('t_exc', f.temaIDsExcluir.join(','));
        if (f.demografiaIDsIncluir.length > 0) p.set('d_inc', f.demografiaIDsIncluir.join(','));
        if (f.demografiaIDsExcluir.length > 0) p.set('d_exc', f.demografiaIDsExcluir.join(','));
        if (f.isStrictMode) p.set('strict', '1');
        if (f.studios) p.set('studios', f.studios);
        if (f.producers) p.set('producers', f.producers);
        if (f.directors) p.set('directors', f.directors);
        if (f.seiyuus) p.set('seiyuus', f.seiyuus);

        const N = `${window.location.pathname}?${p.toString()}`;
        history.pushState({ path: N }, '', N);

        const tempParams = new URLSearchParams(p.toString());
        tempParams.delete('action');
        tempParams.delete('id');
        tempParams.delete('page');
        
        let hasOnlyFilters = false;
        for(const key of tempParams.keys()){ 
            if(tempParams.get(key)){ 
                hasOnlyFilters = true;
                break;
            }
        }
        shareButton.style.display = (action || hasOnlyFilters) ? 'block' : 'none';
    }
    
    function applyFiltersFromURL(){ 
        const p=new URLSearchParams(window.location.search);
        let hasActualFilters = false;
        const filterKeys = ['types', 'min_ep', 'max_ep', 'start_year', 'end_year', 'decade', 'min_score', 'max_score', 'g_inc', 'g_exc', 't_inc', 't_exc', 'd_inc', 'd_exc', 'strict', 'studios', 'producers', 'directors', 'seiyuus'];
        for(const key of filterKeys){
            if(p.has(key) && p.get(key) !== ''){
                hasActualFilters = true;
                break;
            }
        }
        
        if(hasActualFilters){
            document.querySelectorAll('input[name="anime_type"]').forEach(c=>c.checked=false);
            if(p.has('types'))p.get('types').split(',').forEach(v=>{const c=document.querySelector(`input[name="anime_type"][value="${v}"]`);if(c)c.checked=true;});
            document.getElementById('min-episodes').value=p.get('min_ep')||'';
            document.getElementById('max-episodes').value=p.get('max_ep')||'';
            document.getElementById('start-year').value = '';
            document.getElementById('end-year').value = '';
            decadeSelect.value = ""; 

            if (p.has('decade')) {
                decadeSelect.value = p.get('decade');
                decadeSelect.dispatchEvent(new Event('change')); 
            } else {
                document.getElementById('start-year').value=p.get('start_year')||'';
                document.getElementById('end-year').value=p.get('end_year')||'';
            }
            minScoreSelect.value=p.get('min_score')||'';
            maxScoreSelect.value=p.get('max_score')||'';
            strictModeCheckbox.checked=p.get('strict')==='1';
            document.getElementById('studios').value=p.get('studios')||'';
            document.getElementById('producers').value=p.get('producers')||'';
            document.getElementById('directors').value=p.get('directors')||'';
            document.getElementById('seiyuus').value=p.get('seiyuus')||'';
            
            const A=(c,I,E)=>{const i=p.has(I)?p.get(I).split(','):[];const e=p.has(E)?p.get(E).split(','):[];
                setTimeout(()=>{ 
                    c.querySelectorAll('label').forEach(l=>{const C=l.querySelector('input[type="checkbox"]');if(!C)return;let s=0;if(i.includes(C.value))s=1;else if(e.includes(C.value))s=2;C.dataset.filterState=s.toString();updateLabelStateVisual(l,s);});
                    updateSortOptions(); 
                },250); 
            };
            A(genresContainer,'g_inc','g_exc');
            A(themesContainer,'t_inc','t_exc');
            A(demographicsContainer,'d_inc','d_exc');

        } else {
             updateSortOptions(); 
        }
        
        shareButton.style.display = (p.has('action') || hasActualFilters) ? 'block' : 'none';
    }
    
    async function fetchAndShowSpecificAnime(animeId, signal) {
        try {
            const r = await fetchWithRateLimit(`${API_BASE_URL}/anime/${animeId}`, {}, API_DELAY_MS, signal);
            if (signal && signal.aborted) throw new DOMException('Busca de detalhes cancelada.', 'AbortError');
            if (!r.ok) { const e = await r.json().catch(() => ({ message: r.statusText })); throw new Error(`Erro anime ${animeId}: ${r.status} ${e.message}`); }
            const d = await r.json();
            if (signal && signal.aborted) throw new DOMException('Busca de detalhes cancelada.', 'AbortError');
            
            resultContainer.style.display = 'none'; 
            const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text'); 
            if (infoTextDiv) infoTextDiv.innerHTML = ''; 
            const existingImg = animeDetailsDiv.querySelector('img'); 
            if(existingImg) existingImg.remove();

            displayAnimeDetails(d.data);
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
            updateURLWithOptions('show_anime', animeId); 
        } catch (error) { 
            throw error;
        }
    }

    async function fetchAndFilterAnimesFromApi(signal) {
        totalApiCallsMadeThisAction = 0;
        const filters = collectAllFilters();
        const isStrictMode = filters.isStrictMode;
        let queryParams = new URLSearchParams({ sfw: 'true', limit: MAX_RESULTS_PER_PAGE_API });
        if (filters.types.length > 0) queryParams.append('type', filters.types.join(','));
        if (filters.minScore) queryParams.append('min_score', filters.minScore);
        if (filters.maxScore) queryParams.append('max_score', filters.maxScore);
        let startYearVal = filters.startYear; let endYearVal = filters.endYear;
        if (filters.decade) { 
            startYearVal = filters.decade; endYearVal = (parseInt(filters.decade) + 9).toString();
        } else if (startYearVal && !endYearVal) {
            endYearVal = startYearVal;
        } else if (!startYearVal && endYearVal) {
            startYearVal = endYearVal;
        }
        if (startYearVal) queryParams.append('start_date', `${startYearVal}-01-01`);
        if (endYearVal) queryParams.append('end_date', `${endYearVal}-12-31`);


        if (isStrictMode) {
            if (filters.generoIDsIncluir.length > 0) queryParams.append('genres', filters.generoIDsIncluir.join(','));
            if (filters.temaIDsIncluir.length > 0) queryParams.append('themes', filters.temaIDsIncluir.join(','));
            if (filters.demografiaIDsIncluir.length > 0) queryParams.append('demographics', filters.demografiaIDsIncluir.join(','));
        } else {
            if (filters.generoIDsIncluir.length === 1) queryParams.append('genres', filters.generoIDsIncluir[0]);
            if (filters.temaIDsIncluir.length === 1) queryParams.append('themes', filters.temaIDsIncluir[0]);
            if (filters.demografiaIDsIncluir.length === 1) queryParams.append('demographics', filters.demografiaIDsIncluir[0]);
        }

        let allAnimeFromApi = []; let currentPageApi = 1; let hasNextPageApi = true;
        while (hasNextPageApi) {
            if (signal.aborted) throw new DOMException('Busca cancelada pelo usuário.', 'AbortError');
            const currentQueryParams = new URLSearchParams(queryParams); currentQueryParams.set('page', currentPageApi);
            let response;
            try {
                response = await fetchWithRateLimit(`${API_BASE_URL}/anime?${currentQueryParams.toString()}`, {}, API_DELAY_MS, signal);
            } catch (e) {
                if (e.name === 'AbortError') throw e; 
                if (e.message.includes("Limite de chamadas à API atingido para esta busca")) {
                    console.warn(e.message); 
                    hasNextPageApi = false; 
                    if (allAnimeFromApi.length === 0) throw e; 
                    break; 
                }
                throw e; 
            }
            if (signal.aborted) throw new DOMException('Busca cancelada pelo usuário.', 'AbortError');
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                if (response.status === 429) {
                    console.warn(`API Rate Limit atingido na página ${currentPageApi}. Tentando usar dados já obtidos.`);
                    handleError(new Error(`API Rate Limit (pág ${currentPageApi}). Resultados podem estar incompletos.`), "busca API (Rate Limit)"); 
                    hasNextPageApi = false; 
                    break; 
                }
                throw new Error(`Erro API Jikan (pág ${currentPageApi}): ${response.status} ${errorData.message || response.statusText}`);
            }
            const data = await response.json();
            if (signal.aborted) throw new DOMException('Busca cancelada pelo usuário.', 'AbortError');
            if (data.data && data.data.length > 0) {
                allAnimeFromApi.push(...data.data);
            }
            hasNextPageApi = data.pagination?.has_next_page || false;
            if (hasNextPageApi) currentPageApi++;
        }
        if (signal.aborted) throw new DOMException('Busca cancelada pelo usuário.', 'AbortError');
        
        let clientFilteredAnime = allAnimeFromApi.filter(anime => {
            if (filters.minEpisodes && (anime.episodes === null || anime.episodes < parseInt(filters.minEpisodes))) return false;
            if (filters.maxEpisodes && (anime.episodes === null || anime.episodes > parseInt(filters.maxEpisodes))) return false;
            if (anime.episodes === null && (filters.minEpisodes || filters.maxEpisodes)) return false;
            if (filters.generoIDsExcluir.length > 0 && anime.genres.map(g => g.mal_id.toString()).some(id => filters.generoIDsExcluir.includes(id))) return false;
            if (filters.temaIDsExcluir.length > 0 && anime.themes.map(t => t.mal_id.toString()).some(id => filters.temaIDsExcluir.includes(id))) return false;
            if (filters.demografiaIDsExcluir.length > 0 && anime.demographics.map(d => d.mal_id.toString()).some(id => filters.demografiaIDsExcluir.includes(id))) return false;
            const studiosToCheck = filters.studios.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
            if (studiosToCheck.length > 0 && !studiosToCheck.some(input => anime.studios.map(s => s.name.toLowerCase()).some(as => as.includes(input)))) return false;
            const producersToCheck = filters.producers.split(',').map(p => p.trim().toLowerCase()).filter(p => p);
            if (producersToCheck.length > 0 && !producersToCheck.some(input => anime.producers.map(p => p.name.toLowerCase()).some(ap => ap.includes(input)))) return false;
            const animeGenreIDs = anime.genres.map(g => g.mal_id.toString());
            const animeThemeIDs = anime.themes.map(t => t.mal_id.toString());
            const animeDemographicIDs = anime.demographics.map(d => d.mal_id.toString());
            const hasGenreInclusionFilter = filters.generoIDsIncluir.length > 0;
            const hasThemeInclusionFilter = filters.temaIDsIncluir.length > 0;
            const hasDemographicInclusionFilter = filters.demografiaIDsIncluir.length > 0;
            if (isStrictMode) {
                if (hasGenreInclusionFilter && !filters.generoIDsIncluir.every(id => animeGenreIDs.includes(id))) return false;
                if (hasThemeInclusionFilter && !filters.temaIDsIncluir.every(id => animeThemeIDs.includes(id))) return false;
                if (hasDemographicInclusionFilter && !filters.demografiaIDsIncluir.every(id => animeDemographicIDs.includes(id))) return false;
            } else {
                const anyGTDInclusionFilterActuallySelected = hasGenreInclusionFilter || hasThemeInclusionFilter || hasDemographicInclusionFilter;
                if (anyGTDInclusionFilterActuallySelected) {
                    let passesNonStrictCriteria = false;
                    if (hasGenreInclusionFilter && filters.generoIDsIncluir.some(id => animeGenreIDs.includes(id))) passesNonStrictCriteria = true;
                    if (!passesNonStrictCriteria && hasThemeInclusionFilter && filters.temaIDsIncluir.some(id => animeThemeIDs.includes(id))) passesNonStrictCriteria = true;
                    if (!passesNonStrictCriteria && hasDemographicInclusionFilter && filters.demografiaIDsIncluir.some(id => animeDemographicIDs.includes(id))) passesNonStrictCriteria = true;
                    if (!passesNonStrictCriteria) return false;
                }
            }
            return true;
        });
        clientFilteredAnime.forEach(anime => { anime.relevanceScore = 0; const animeGenreIDs = anime.genres.map(g => g.mal_id.toString()); const animeThemeIDs = anime.themes.map(t => t.mal_id.toString()); const animeDemographicIDs = anime.demographics.map(d => d.mal_id.toString()); let genreMatchCount = 0, themeMatchCount = 0, demographicMatchCount = 0; let categoriesMatchedCount = 0; if (filters.generoIDsIncluir.length > 0) { const currentCategoryMatches = filters.generoIDsIncluir.filter(id => animeGenreIDs.includes(id)).length; if (isStrictMode ? (currentCategoryMatches === filters.generoIDsIncluir.length) : (currentCategoryMatches > 0)) { anime.relevanceScore += 1000; genreMatchCount = currentCategoryMatches; categoriesMatchedCount++; } } if (filters.temaIDsIncluir.length > 0) { const currentCategoryMatches = filters.temaIDsIncluir.filter(id => animeThemeIDs.includes(id)).length; if (isStrictMode ? (currentCategoryMatches === filters.temaIDsIncluir.length) : (currentCategoryMatches > 0)) { anime.relevanceScore += 500; themeMatchCount = currentCategoryMatches; categoriesMatchedCount++; } } if (filters.demografiaIDsIncluir.length > 0) { const currentCategoryMatches = filters.demografiaIDsIncluir.filter(id => animeDemographicIDs.includes(id)).length; if (isStrictMode ? (currentCategoryMatches === filters.demografiaIDsIncluir.length) : (currentCategoryMatches > 0)) { anime.relevanceScore += 300; demographicMatchCount = currentCategoryMatches; categoriesMatchedCount++; } } anime.relevanceScore += genreMatchCount * 10; anime.relevanceScore += themeMatchCount * 5; anime.relevanceScore += demographicMatchCount * 3; if (categoriesMatchedCount === 2) anime.relevanceScore += 2000; if (categoriesMatchedCount === 3) anime.relevanceScore += 5000; });
        const directorsToCheck = filters.directors.split(',').map(d => d.trim().toLowerCase()).filter(d => d);
        if (directorsToCheck.length > 0 && clientFilteredAnime.length > 0) { 
            const directorFiltered = []; 
            const seiyuusPossiblyToCheck = filters.seiyuus.split(',').map(s => s.trim().toLowerCase()).filter(s => s); 
            for (const anime of clientFilteredAnime) { 
                if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL - 1 && seiyuusPossiblyToCheck.length > 0) {
                    if(clientFilteredAnime.length === directorFiltered.length && directorFiltered.length === 0) { // Se nenhum diretor foi encontrado E o limite está prestes a estourar
                         throw new Error("Limite de chamadas API atingido ao verificar diretores. Tente filtros mais específicos.");
                    }
                    break; 
                }
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL && seiyuusPossiblyToCheck.length === 0) {
                     if(clientFilteredAnime.length === directorFiltered.length && directorFiltered.length === 0) {
                        throw new Error("Limite de chamadas API atingido ao verificar diretores. Tente filtros mais específicos.");
                    }
                    break;
                }
                try { 
                    const staffRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/staff`, {}, API_DELAY_MS, signal); 
                    if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
                    if (staffRes.ok) { 
                        const staffData = await staffRes.json(); 
                        if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
                        if (staffData.data.some(s => s.positions.some(p => p.toLowerCase().includes('director')) && directorsToCheck.some(d => s.person.name.toLowerCase().includes(d)))) { 
                            directorFiltered.push(anime); 
                        } 
                    } 
                } catch (e) { 
                    if (e.name === 'AbortError') throw e;
                    if (e.message.includes("Limite")) { console.warn("Limite de chamadas API atingido durante busca de diretores."); break;} 
                    console.warn(`Erro staff ${anime.title}: ${e.message}`); 
                } 
            } 
            clientFilteredAnime = directorFiltered; 
        }
        const seiyuusToCheck = filters.seiyuus.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        if (seiyuusToCheck.length > 0 && clientFilteredAnime.length > 0) { 
            const seiyuuFiltered = []; 
            for (const anime of clientFilteredAnime) { 
                if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) {
                    if(clientFilteredAnime.length === seiyuuFiltered.length && seiyuuFiltered.length === 0) {
                        throw new Error("Limite de chamadas API atingido ao verificar seiyuus. Tente filtros mais específicos.");
                    }
                    break;
                }
                try { 
                    const charsRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/characters`, {}, API_DELAY_MS, signal); 
                    if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
                    if (charsRes.ok) { 
                        const charsData = await charsRes.json(); 
                        if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
                        if (charsData.data.some(c => c.voice_actors.some(v => v.language === 'Japanese' && seiyuusToCheck.some(sName => v.person.name.toLowerCase().includes(sName))))) { 
                            seiyuuFiltered.push(anime); 
                        } 
                    } 
                } catch (e) { 
                    if (e.name === 'AbortError') throw e;
                    if (e.message.includes("Limite")) { console.warn("Limite de chamadas API atingido durante busca de seiyuus."); break;} 
                    console.warn(`Erro chars ${anime.title}: ${e.message}`); 
                } 
            } 
            clientFilteredAnime = seiyuuFiltered; 
        }

        if (signal.aborted) throw new DOMException('Busca cancelada.', 'AbortError');
        
        if (clientFilteredAnime.length === 0) {
            if ((filters.directors.length > 0 || filters.seiyuus.length > 0) && totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) {
                 throw new Error("Limite de chamadas API atingido ao verificar diretores/seiyuus. Nenhum resultado compatível ou a verificação não pôde ser concluída. Tente filtros mais específicos ou menos nomes.");
            }
             // Se não for por limite de API em D/S, a chamada à função que invocou esta (listButton/randomizeButton)
             // irá tratar o array vazio e lançar "Nenhum anime corresponde..." se necessário.
        }
        return clientFilteredAnime;
    }

    function sortAnimeList(animeList, sortBy, sortOrderAscToggle) {
        const sortedList = [...animeList];
        sortedList.sort((a, b) => {
            let valA, valB;
            switch (sortBy) {
                case 'title': valA = (a.title || '').toLowerCase(); valB = (b.title || '').toLowerCase(); break;
                case 'score': valA = parseFloat(a.score) || 0; valB = parseFloat(b.score) || 0; break;
                case 'start_date': valA = a.aired && a.aired.from ? new Date(a.aired.from).getTime() : (a.year ? new Date(`${a.year}-01-01`).getTime() : Date.parse('1900-01-01')); valB = b.aired && b.aired.from ? new Date(b.aired.from).getTime() : (b.year ? new Date(`${b.year}-01-01`).getTime() : Date.parse('1900-01-01')); if (isNaN(valA)) valA = Date.parse('1900-01-01'); if (isNaN(valB)) valB = Date.parse('1900-01-01'); break;
                case 'relevance_score': valA = a.relevanceScore || 0; valB = b.relevanceScore || 0; break;
                default: return 0;
            }
            if (valA < valB) return sortOrderAscToggle ? -1 : 1;
            if (valA > valB) return sortOrderAscToggle ? 1 : -1;
            const titleA = (a.title || '').toLowerCase(); const titleB = (b.title || '').toLowerCase();
            if (titleA < titleB) return -1; if (titleA > titleB) return 1; return 0;
        });
        return sortedList;
    }

    function prepareForResults(isSpecificAnimeSearch = false) {
        if (currentAbortController && currentAbortController.signal && !currentAbortController.signal.aborted) {
            console.log("Busca anterior detectada, abortando (silenciosamente)...");
            wasManuallyCancelled = false; 
            currentAbortController.abort("New search initiated by button"); 
        }
        currentAbortController = new AbortController(); 
        wasManuallyCancelled = false; 
        
        loadingIndicator.style.display = 'block';
        cancelSearchButton.style.display = 'block'; 
        randomizeButton.disabled = true;
        listButton.disabled = true;

        errorMessageDiv.style.display = 'none'; 
        errorMessageDiv.textContent = ''; 
        if (!isSpecificAnimeSearch) { 
            resultContainer.style.display = 'none'; 
            listResultContainer.style.display = 'none';
        }
        const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text'); 
        if (infoTextDiv) infoTextDiv.innerHTML = ''; 
        const existingImg = animeDetailsDiv.querySelector('img'); 
        if(existingImg) existingImg.remove(); 
        animeListDisplay.innerHTML = ''; 
        listSummaryCount.textContent = '';
    }

    function handleError(error, context) { 
        console.error(`Erro ${context}:`, error); 
        if (error.name === 'AbortError') {
            if (wasManuallyCancelled) { 
                errorMessageDiv.textContent = `Busca cancelada: ${context}.`;
                errorMessageDiv.style.display = 'block';
            } else {
                console.log(`Busca (${context}) cancelada silenciosamente.`);
                errorMessageDiv.style.display = 'none'; 
            }
        } else { 
            errorMessageDiv.textContent = `Erro durante ${context}: ${error.message}`;
            errorMessageDiv.style.display = 'block';
        }
        
        // Esconde o botão de compartilhar se o erro não for sobre resultados parciais ou se for um AbortError.
        if (error.name === 'AbortError' || (error.message && !error.message.includes("Resultados podem estar incompletos"))) {
            shareButton.style.display = 'none';
        }
        finishLoading(); 
    }

    function finishLoading() { 
        loadingIndicator.style.display = 'none';
        cancelSearchButton.style.display = 'none'; 
        randomizeButton.disabled = false; 
        listButton.disabled = false;
        wasManuallyCancelled = false; 
    }

    function displayAnimeDetails(anime) {
        const airedFrom = anime.aired && anime.aired.from ? formatDate(anime.aired.from) : 'N/A';
        const seasonInfo = formatSeason(anime.season, anime.year);

        let cleanSynopsis = anime.synopsis || 'Sinopse não disponível.';
        cleanSynopsis = cleanSynopsis.replace(/\[Written by MAL Rewrite\]/gi, '').trim();
        
        const synopsisHtml = cleanSynopsis.replace(/\n/g, '<br>');
        
        const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text'); 
        const existingImg = animeDetailsDiv.querySelector('img'); 
        if (existingImg) existingImg.remove(); 
        const imgElement = document.createElement('img'); 
        imgElement.src = anime.images.jpg.large_image_url; 
        imgElement.alt = `Capa de ${anime.title}`; 
        infoTextDiv.innerHTML = `
            <h3>${anime.title}</h3>
            ${anime.title_english ? `<p><strong>Inglês:</strong> ${anime.title_english}</p>` : ''}
            ${anime.title_japanese ? `<p><strong>Japonês:</strong> ${anime.title_japanese}</p>` : ''}
            ${anime.title_synonyms && anime.title_synonyms.length > 0 ? `<p><strong>Outros:</strong> ${anime.title_synonyms.join(', ')}</p>` : ''}
            <p><strong>Nota:</strong> ${anime.score || 'N/A'} ${anime.scored_by ? `(${anime.scored_by.toLocaleString()} votos)` : ''}</p>
            <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p>
            <p><strong>Estúdio(s):</strong> ${anime.studios.map(s => s.name).join(', ') || 'N/A'}</p>
            <p><strong>Episódios:</strong> ${anime.episodes || 'N/A'}</p>
            <p><strong>Estreia:</strong> ${airedFrom}</p>
            <p><strong>Temporada:</strong> ${seasonInfo}</p>
            <p><strong>Gêneros:</strong> ${anime.genres.map(g => g.name).join(', ') || 'N/A'}</p>
            <p><strong>Temas:</strong> ${anime.themes.map(t => t.name).join(', ') || 'N/A'}</p>
            <p><strong>Demografia:</strong> ${anime.demographics.map(d => d.name).join(', ') || 'N/A'}</p>
            <p><strong>Sinopse:</strong></p><p id="anime-synopsis-text">${synopsisHtml}</p>
            <p style="margin-top:10px;"><a href="${anime.url}" target="_blank" rel="noopener noreferrer">Ver no MyAnimeList</a></p>`; 
        animeDetailsDiv.insertBefore(imgElement, infoTextDiv); 
    }

    function displayAnimeListPage() { 
        animeListDisplay.innerHTML = ''; 
        const startIndex = (currentPageForListDisplay - 1) * ITEMS_PER_LIST_PAGE_DISPLAY; 
        const filters = collectAllFilters(); 
        const { generoIDsIncluir, temaIDsIncluir, demografiaIDsIncluir } = filters; 
        const animesToShowOnPage = allFetchedAnimesForList.slice(startIndex, startIndex + ITEMS_PER_LIST_PAGE_DISPLAY); 
        animesToShowOnPage.forEach(anime => { 
            const itemDiv = document.createElement('div'); 
            itemDiv.className = 'anime-list-item'; 
            const createTagString = (tags, includedIDs) => { 
                if (!tags || tags.length === 0) return 'N/A'; 
                return tags.map(tag => includedIDs.includes(tag.mal_id.toString()) ? `<span class="filtered-tag">${tag.name}</span>` : `<span class="tag-item">${tag.name}</span>` ).join(' '); 
            }; 
            const studiosText = anime.studios.map(s => s.name).join(', ') || 'N/A'; 
            const genresText = createTagString(anime.genres, generoIDsIncluir); 
            const themesText = createTagString(anime.themes, temaIDsIncluir); 
            const demographicsText = createTagString(anime.demographics, demografiaIDsIncluir); 
            const airedFrom = anime.aired && anime.aired.from ? formatDate(anime.aired.from) : 'N/A';
            const seasonInfo = formatSeason(anime.season, anime.year);

            itemDiv.innerHTML = `
                <a href="${anime.url}" target="_blank" rel="noopener noreferrer" class="anime-list-item-link"> 
                    <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy">
                    <h4>${anime.title}</h4>
                </a> 
                <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p>
                <p><strong>Nota:</strong> ${anime.score || 'N/A'}</p> 
                <p><strong>Ep:</strong> ${anime.episodes || 'N/A'}</p> 
                <p class="small-details"><strong>Estreia:</strong> ${airedFrom}</p>
                <p class="small-details"><strong>Temporada:</strong> ${seasonInfo}</p>
                <p class="small-details"><strong>Estúdios:</strong> ${studiosText}</p> 
                <p class="small-details"><strong>Gêneros:</strong> ${genresText}</p> 
                ${anime.themes.length > 0 ? `<p class="small-details"><strong>Temas:</strong> ${themesText}</p>` : ''} 
                ${anime.demographics.length > 0 ? `<p class="small-details"><strong>Demografia:</strong> ${demographicsText}</p>` : ''}`; 
            animeListDisplay.appendChild(itemDiv); 
        }); 
        updateListPaginationControls(); 
    }
    function updateListPaginationControls() { const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY); const displayStyle = totalPages > 0 ? 'block' : 'none';  if (paginationControlsTop) { paginationControlsTop.style.display = displayStyle; if (totalPages > 0) { currentPageListSpanTop.textContent = `Página ${currentPageForListDisplay} de ${totalPages}`; } else { currentPageListSpanTop.textContent = ''; } prevPageListButtonTop.disabled = totalPages <= 1; nextPageListButtonTop.disabled = totalPages <= 1; } if (paginationControlsBottom) { paginationControlsBottom.style.display = displayStyle; if (totalPages > 0) { currentPageListSpanBottom.textContent = `Página ${currentPageForListDisplay} de ${totalPages}`; } else { currentPageListSpanBottom.textContent = ''; } prevPageListButtonBottom.disabled = totalPages <= 1; nextPageListButtonBottom.disabled = totalPages <= 1; } }
    function handlePageChange(direction) { const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY); if (totalPages <= 1) return;  if (direction === 'prev') { currentPageForListDisplay--; if (currentPageForListDisplay < 1) { currentPageForListDisplay = totalPages; } } else if (direction === 'next') { currentPageForListDisplay++; if (currentPageForListDisplay > totalPages) { currentPageForListDisplay = 1; } } displayAnimeListPage(); updateURLWithOptions('list', null, currentPageForListDisplay); listResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

    function updateSortOptions() {
        const filters = collectAllFilters();
        const isStrictMode = filters.isStrictMode;
        const gtdIncludeFiltersCount = filters.generoIDsIncluir.length + filters.temaIDsIncluir.length + filters.demografiaIDsIncluir.length;
        const relevanceOption = sortBySelect.querySelector('option[value="relevance_score"]');

        let shouldShowRelevance = !isStrictMode && gtdIncludeFiltersCount >= 1;

        if (relevanceOption) {
            relevanceOption.style.display = shouldShowRelevance ? 'block' : 'none';
        }

        if (!shouldShowRelevance && sortBySelect.value === 'relevance_score') {
            sortBySelect.value = 'title'; 
        }
        
        currentSortBy = sortBySelect.value;
        if (currentSortBy === 'title') {
            currentSortOrderAsc = true; 
        } else { 
            currentSortOrderAsc = false; 
        }
        
        sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓';
        sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`;
    }

    // Event Listeners
    if (prevPageListButtonTop) prevPageListButtonTop.addEventListener('click', () => handlePageChange('prev'));
    if (nextPageListButtonTop) nextPageListButtonTop.addEventListener('click', () => handlePageChange('next'));
    if (prevPageListButtonBottom) prevPageListButtonBottom.addEventListener('click', () => handlePageChange('prev'));
    if (nextPageListButtonBottom) nextPageListButtonBottom.addEventListener('click', () => handlePageChange('next'));
    decadeSelect.addEventListener('change', () => { 
        const decadeValue = decadeSelect.value;
        if (decadeValue) { 
            document.getElementById('start-year').value = decadeValue; 
            document.getElementById('end-year').value = (parseInt(decadeValue) + 9).toString(); 
        }
        updateURLWithOptions();
    });
    document.getElementById('start-year').addEventListener('input', () => { if(document.getElementById('start-year').value) decadeSelect.value = ""; updateURLWithOptions(); });
    document.getElementById('end-year').addEventListener('input', () => { if(document.getElementById('end-year').value) decadeSelect.value = ""; updateURLWithOptions(); });


    homeButton.addEventListener('click', resetToHomeState);
    strictModeCheckbox.addEventListener('change', () => {
        updateSortOptions();
        if (allFetchedAnimesForList.length > 0) {
             allFetchedAnimesForList = sortAnimeList(allFetchedAnimesForList, currentSortBy, currentSortOrderAsc);
             currentPageForListDisplay = 1; 
             displayAnimeListPage();
        }
         updateURLWithOptions();
    });

    textInputFilters.forEach(id => {
        const element = document.getElementById(id);
        if (element) element.addEventListener('input', () => updateURLWithOptions());
    });
    numberInputFilters.forEach(id => {
        const element = document.getElementById(id);
        if (element && id !== 'start-year' && id !== 'end-year') { 
            element.addEventListener('input', () => updateURLWithOptions());
        }
    });
    selectInputFilters.forEach(id => {
        const element = document.getElementById(id);
        if (element && id !== 'decade') { 
             element.addEventListener('change', () => updateURLWithOptions());
        }
    });
    checkboxGroupContainers.forEach(containerId => {
        const containerElement = document.getElementById(containerId);
        if (containerElement) {
            containerElement.addEventListener('change', (event) => { 
                if (event.target.type === 'checkbox') {
                    updateURLWithOptions();
                }
            });
        }
    });


    async function startSearchProcess(searchFunctionAsync) {
        prepareForResults(); 
        const signal = currentAbortController.signal; 
        let caughtError = null; 

        try {
            await searchFunctionAsync(signal);
            if (!signal.aborted) { 
                finishLoading();
            }
        } catch (error) { 
            caughtError = error; 
            handleError(error, "Busca"); 
        } finally {
            // Verifica se a busca foi abortada E se não foi cancelada manualmente.
            // Se foi manual, handleError já chamou finishLoading.
            // Se foi silenciosa, precisamos garantir que finishLoading seja chamado.
            if (signal && signal.aborted && !wasManuallyCancelled) {
                 console.log("Finalizando busca (abortada silenciosamente) em startSearchProcess.");
                 finishLoading(); 
            }
        }
    }
    
    randomizeButton.addEventListener('click', async () => {
        prepareForResults(); 
        const operationSignal = currentAbortController.signal;
        try {
            let filteredAnimes = await fetchAndFilterAnimesFromApi(operationSignal);
            if (operationSignal.aborted) { return; } 
            if (filteredAnimes.length === 0) throw new Error("Nenhum anime corresponde aos critérios para sortear.");

            const randomAnime = filteredAnimes[Math.floor(Math.random() * filteredAnimes.length)];
            
            await fetchAndShowSpecificAnime(randomAnime.mal_id, operationSignal);
            
            if (!operationSignal.aborted) {
                finishLoading();
            }
        } catch (error) {
            handleError(error, "sorteio");
        }
    });

    listButton.addEventListener('click', () => {
        currentPageForListDisplay = 1; 
        startSearchProcess(async (signal) => { 
            updateSortOptions(); 
            const filters = collectAllFilters();
            const isStrictMode = filters.isStrictMode;
            const gtdIncludeFiltersCount = filters.generoIDsIncluir.length + filters.temaIDsIncluir.length + filters.demografiaIDsIncluir.length;
            const relevanceOptionIsVisible = sortBySelect.querySelector('option[value="relevance_score"]').style.display !== 'none';

            if (!isStrictMode && gtdIncludeFiltersCount >= 1 && relevanceOptionIsVisible) {
                if(sortBySelect.value !== 'relevance_score'){ 
                    sortBySelect.value = 'relevance_score';
                    sortBySelect.dispatchEvent(new Event('change')); 
                } else { 
                     currentSortBy = 'relevance_score';
                     currentSortOrderAsc = false;
                }
            } else { 
                if (sortBySelect.value === 'relevance_score') { 
                    sortBySelect.value = 'title';
                     sortBySelect.dispatchEvent(new Event('change'));
                } else { 
                    currentSortBy = sortBySelect.value;
                    currentSortOrderAsc = (currentSortBy === 'title');
                }
            }
            sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓';
            sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`;
            
            let fetchedAndFilteredAnimes = await fetchAndFilterAnimesFromApi(signal);
            if (signal.aborted) { console.log("Listagem abortada durante fetchAndFilterAnimesFromApi"); return; }

            // Verifica se a lista está vazia APÓS todas as buscas e filtros.
            // A mensagem de "Resultados podem estar incompletos" de handleError terá prioridade se já estiver definida.
            if (fetchedAndFilteredAnimes.length === 0 && !errorMessageDiv.textContent.includes("Resultados podem estar incompletos")) {
                throw new Error("Nenhum anime corresponde aos critérios da lista.");
            }
            
            allFetchedAnimesForList = sortAnimeList(fetchedAndFilteredAnimes, currentSortBy, currentSortOrderAsc);
            listSummaryCount.textContent = `(${allFetchedAnimesForList.length})`;

            if (allFetchedAnimesForList.length > 0) { // Só mostra a lista se houver algo para mostrar
                displayAnimeListPage();
                listResultContainer.style.display = 'block';
            } else if (!errorMessageDiv.textContent.includes("Resultados podem estar incompletos")) {
                // Se chegou aqui com lista vazia e sem erro de rate limit, é porque realmente não há resultados.
                // A exceção já foi lançada acima.
                listResultContainer.style.display = 'none'; // Garante que a área da lista não apareça
            } else {
                 // Se há mensagem de rate limit, e a lista está vazia, mostra a msg de erro mas não a lista.
                 listResultContainer.style.display = 'none';
            }
            
            updateURLWithOptions('list', null, currentPageForListDisplay); 
        }); 
    });


    cancelSearchButton.addEventListener('click', () => {
        if (currentAbortController) {
            wasManuallyCancelled = true; 
            currentAbortController.abort("User cancelled via button"); 
            console.log("Busca cancelada pelo botão.");
        }
    });

    sortBySelect.addEventListener('change', () => { 
        updateSortOptions(); 
        if (allFetchedAnimesForList.length > 0) { 
            allFetchedAnimesForList = sortAnimeList(allFetchedAnimesForList, currentSortBy, currentSortOrderAsc); 
            currentPageForListDisplay = 1; 
            displayAnimeListPage(); 
            updateURLWithOptions('list', null, currentPageForListDisplay); 
        } 
    });
    sortOrderToggle.addEventListener('click', () => { 
        currentSortOrderAsc = !currentSortOrderAsc; 
        sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓'; 
        sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`; 
        if (allFetchedAnimesForList.length > 0) { 
            allFetchedAnimesForList = sortAnimeList(allFetchedAnimesForList, currentSortBy, currentSortOrderAsc); 
            currentPageForListDisplay = 1; 
            displayAnimeListPage(); 
            updateURLWithOptions('list', null, currentPageForListDisplay); 
        } 
    });
    shareButton.addEventListener('click', () => { const urlToShare = window.location.href; navigator.clipboard.writeText(urlToShare).then(() => { alert('Link copiado!'); }).catch(err => { console.error('Erro ao copiar link:', err); alert('Erro ao copiar o link.'); }); });
    
    function init() {
        const initialController = new AbortController(); 
        populateScoreOptions(); 
        populateDecadeOptions();
        
        const initPromises = [
            fetchAndPopulateFilterOptions('genres/anime', genresContainer, 'name', 'genres', initialController.signal),
            fetchAndPopulateFilterOptions('genres/anime?filter=themes', themesContainer, 'name', 'themes', initialController.signal),
            fetchAndPopulateFilterOptions('genres/anime?filter=demographics', demographicsContainer, 'name', 'demographics', initialController.signal)
        ];
        Promise.all(initPromises)
            .then(() => {
                if (!initialController.signal.aborted) {
                    applyFiltersFromURL(false); 
                    updateSortOptions(); 
                    
                    const filters = collectAllFilters();
                    const isStrictMode = filters.isStrictMode;
                    const gtdIncludeFiltersCount = filters.generoIDsIncluir.length + filters.temaIDsIncluir.length + filters.demografiaIDsIncluir.length;
                    const relevanceOptionIsVisible = sortBySelect.querySelector('option[value="relevance_score"]').style.display !== 'none';

                    if (!isStrictMode && gtdIncludeFiltersCount >= 1 && relevanceOptionIsVisible) { 
                        currentSortBy = 'relevance_score';
                        currentSortOrderAsc = false; 
                        sortBySelect.value = 'relevance_score';
                    } else {
                        currentSortBy = 'title';
                        currentSortOrderAsc = true; 
                        sortBySelect.value = 'title';
                    }
                    sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓';
                    sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`;
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error("Erro ao inicializar filtros:", error);
                    handleError(error, "inicialização dos filtros");
                } else {
                    console.log("Inicialização de filtros cancelada.");
                }
            });
    }

    function resetToHomeState() {
        if (currentAbortController && typeof currentAbortController.abort === 'function') {
            wasManuallyCancelled = false; 
            currentAbortController.abort(); 
            currentAbortController = null; 
        }
        document.getElementById('min-episodes').value = ''; document.getElementById('max-episodes').value = '';
        document.getElementById('start-year').value = ''; document.getElementById('end-year').value = '';
        document.getElementById('studios').value = ''; document.getElementById('producers').value = '';
        document.getElementById('directors').value = ''; document.getElementById('seiyuus').value = '';
        decadeSelect.value = ''; minScoreSelect.value = ''; maxScoreSelect.value = '';
        
        strictModeCheckbox.checked = false; 
        
        document.querySelectorAll('input[name="anime_type"]:checked').forEach(cb => cb.checked = false);
        [genresContainer, themesContainer, demographicsContainer].forEach(container => {
            container.querySelectorAll('label').forEach(label => {
                const cb = label.querySelector('input[type="checkbox"]');
                if (cb) { cb.dataset.filterState = "0"; updateLabelStateVisual(label, 0); }
            });
        });
        
        updateSortOptions(); 

        currentSortBy = 'title';
        currentSortOrderAsc = true; 
        sortBySelect.value = 'title';
        sortOrderToggle.textContent = '↑'; 
        sortOrderToggle.title = `Ordem: Ascendente`;
        
        prepareForResults(); 
        finishLoading(); 
        allFetchedAnimesForList = []; currentPageForListDisplay = 1; listSummaryCount.textContent = '';
        history.pushState({ path: window.location.pathname }, '', window.location.pathname);
        shareButton.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    init();
});
