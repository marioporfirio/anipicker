document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.jikan.moe/v4';
    const MAX_RESULTS_PER_PAGE_API = 25;
    const ITEMS_PER_LIST_PAGE_DISPLAY = 24;
    const MAX_API_CALLS_TOTAL = 45; 
    const API_DELAY_MS = 550; 

    // LISTA CURADA DE GÊNEROS PRINCIPAIS E EXPLÍCITOS DO MAL
    const CURATED_GENRES_NAMES = [
        "Action", "Adventure", "Avant Garde", "Award Winning", "Boys Love", 
        "Comedy", "Drama", "Fantasy", "Girls Love", "Gourmet", 
        "Horror", "Mystery", "Romance", "Sci-Fi", "Slice of Life", 
        "Sports", "Supernatural", "Suspense",
        "Ecchi", "Erotica", "Hentai"
    ];

    const minScoreSelect = document.getElementById('min-score');
    const maxScoreSelect = document.getElementById('max-score');
    const decadeSelect = document.getElementById('decade');
    const genresContainer = document.getElementById('genres-container');
    const themesContainer = document.getElementById('themes-container');
    const demographicsContainer = document.getElementById('demographics-container');
    
    const randomizeButton = document.getElementById('randomize-button');
    const listButton = document.getElementById('list-button');
    const shareButton = document.getElementById('share-button');
    const strictModeCheckbox = document.getElementById('strict-mode-checkbox');

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

    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function fetchWithRateLimit(url, options = {}, delay = API_DELAY_MS) {
        if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) {
            throw new Error("Limite de chamadas à API atingido. Tente uma busca menos abrangente ou aguarde um momento.");
        }
        await sleep(delay); 
        totalApiCallsMadeThisAction++;
        return fetch(url, options);
    }

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

    async function fetchAndPopulateFilterOptions(endpoint, container, nameKey = 'name', categoryName) {
        // console.log(`%cPOPULANDO FILTRO: categoryName='${categoryName}', endpoint='${endpoint}', containerId='${container.id}'`, 'color: yellow; font-weight: bold;');
        const cacheKey = `jikan_filter_cache_${endpoint.replace(/[/?=]/g, '_')}`;
        const cacheDuration = 24 * 60 * 60 * 1000; 

        try {
            container.innerHTML = '<p>Carregando...</p>';
            let dataToProcess;
            const cachedItem = localStorage.getItem(cacheKey);
            if (cachedItem) {
                const { timestamp, data } = JSON.parse(cachedItem);
                if (Date.now() - timestamp < cacheDuration) { dataToProcess = data; }
            }
            if (!dataToProcess) {
                await sleep(API_DELAY_MS); 
                const response = await fetch(`${API_BASE_URL}/${endpoint}`);
                if (!response.ok) {
                    const errorJson = await response.json().catch(()=> ({message: `HTTP error ${response.status}`}));
                    throw new Error(`Erro ${response.status} ao buscar ${categoryName}: ${errorJson.message || 'Erro desconhecido'}`);
                }
                const apiData = await response.json();
                if (!apiData.data || !Array.isArray(apiData.data)) { throw new Error(`Resposta inesperada da API para ${categoryName}.`); }
                dataToProcess = apiData.data;
                localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: dataToProcess }));
            }
            
            let finalDataForDisplay = dataToProcess;
            if (categoryName === 'genres') {
                finalDataForDisplay = dataToProcess.filter(item => CURATED_GENRES_NAMES.includes(item[nameKey]));
                // console.log(`%cGÊNEROS CURADOS (após filtro, primeiros 5):`, 'color: purple;', finalDataForDisplay.slice(0,5).map(item => item[nameKey]));
            }

            container.innerHTML = '';
            const sortedData = finalDataForDisplay.sort((a, b) => a[nameKey].localeCompare(b[nameKey]));
            
            if (sortedData.length === 0 && categoryName === 'genres') {
                container.innerHTML = '<p class="error-text">Nenhum gênero curado encontrado. Verifique a lista CURATED_GENRES_NAMES e os dados da API.</p>';
                return;
            }
            if (sortedData.length === 0) { // Para outras categorias se vierem vazias
                container.innerHTML = `<p>Nenhum item de ${categoryName} encontrado.</p>`;
                return;
            }

            sortedData.forEach(item => {
                const label = document.createElement('label');
                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox'; 
                checkboxInput.value = item.mal_id;
                checkboxInput.name = categoryName; 
                checkboxInput.dataset.filterState = "0"; 
                
                label.appendChild(checkboxInput); 
                label.appendChild(document.createTextNode(item[nameKey])); 
                label.setAttribute('role', 'checkbox'); 
                label.setAttribute('aria-checked', 'false'); 
                label.tabIndex = 0; 

                label.addEventListener('click', (e) => {
                    let currentState = parseInt(checkboxInput.dataset.filterState || "0");
                    currentState = (currentState + 1) % 3; 
                    checkboxInput.dataset.filterState = currentState.toString();
                    updateLabelStateVisual(label, currentState);
                });
                label.addEventListener('keydown', (e) => { 
                    if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); label.click(); }
                });
                container.appendChild(label);
            });
        } catch (error) {
            console.error(`Falha ao popular ${categoryName}:`, error);
            container.innerHTML = `<p class="error-text">Não foi possível carregar ${categoryName}. (${error.message})</p>`;
            localStorage.removeItem(cacheKey); 
        }
    }

    function updateLabelStateVisual(label, state, isInitial = false) {
        label.classList.remove('state-include', 'state-exclude');
        let ariaState = "false";
        if (state === 1) {
            label.classList.add('state-include');
            ariaState = "true";
        } else if (state === 2) {
            label.classList.add('state-exclude');
            ariaState = "mixed"; 
        }
        label.setAttribute('aria-checked', ariaState);
        if (!isInitial && label.querySelector('input')) { 
             label.querySelector('input').dataset.filterState = state.toString();
        }
    }
    
    function collectAllFilters() {
        const filters = {};
        filters.types = Array.from(document.querySelectorAll('input[name="anime_type"]:checked')).map(cb => cb.value);
        filters.minEpisodes = document.getElementById('min-episodes').value;
        filters.maxEpisodes = document.getElementById('max-episodes').value;
        filters.startYear = document.getElementById('start-year').value;
        filters.endYear = document.getElementById('end-year').value;
        filters.decade = decadeSelect.value; 
        filters.minScore = minScoreSelect.value;
        filters.maxScore = maxScoreSelect.value;

        filters.generoIDsIncluir = [], filters.generoIDsExcluir = [];
        genresContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.dataset.filterState === "1") filters.generoIDsIncluir.push(cb.value);
            else if (cb.dataset.filterState === "2") filters.generoIDsExcluir.push(cb.value);
        });
        filters.temaIDsIncluir = [], filters.temaIDsExcluir = [];
        themesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.dataset.filterState === "1") filters.temaIDsIncluir.push(cb.value);
            else if (cb.dataset.filterState === "2") filters.temaIDsExcluir.push(cb.value);
        });
        filters.demografiaIDsIncluir = [], filters.demografiaIDsExcluir = [];
        demographicsContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (cb.dataset.filterState === "1") filters.demografiaIDsIncluir.push(cb.value);
            else if (cb.dataset.filterState === "2") filters.demografiaIDsExcluir.push(cb.value);
        });

        filters.isStrictMode = strictModeCheckbox.checked;
        filters.studios = document.getElementById('studios').value;
        filters.producers = document.getElementById('producers').value;
        filters.directors = document.getElementById('directors').value;
        filters.seiyuus = document.getElementById('seiyuus').value;
        return filters;
    }

    function updateURLWithOptions(action, animeId = null, listPage = null) {
        const filters = collectAllFilters();
        const params = new URLSearchParams();

        if (action) params.set('action', action);
        if (animeId && action === 'show_anime') params.set('id', animeId);
        if (listPage && action === 'list') params.set('page', listPage);

        if (filters.types.length > 0) params.set('types', filters.types.join(','));
        if (filters.minEpisodes) params.set('min_ep', filters.minEpisodes);
        if (filters.maxEpisodes) params.set('max_ep', filters.maxEpisodes);
        if (filters.startYear) params.set('start_year', filters.startYear);
        if (filters.endYear) params.set('end_year', filters.endYear);
        if (filters.decade && !(filters.startYear && filters.endYear)) { 
             params.set('decade', filters.decade);
        }
        if (filters.minScore) params.set('min_score', filters.minScore);
        if (filters.maxScore) params.set('max_score', filters.maxScore);

        if (filters.generoIDsIncluir.length > 0) params.set('g_inc', filters.generoIDsIncluir.join(','));
        if (filters.generoIDsExcluir.length > 0) params.set('g_exc', filters.generoIDsExcluir.join(','));
        if (filters.temaIDsIncluir.length > 0) params.set('t_inc', filters.temaIDsIncluir.join(','));
        if (filters.temaIDsExcluir.length > 0) params.set('t_exc', filters.temaIDsExcluir.join(','));
        if (filters.demografiaIDsIncluir.length > 0) params.set('d_inc', filters.demografiaIDsIncluir.join(','));
        if (filters.demografiaIDsExcluir.length > 0) params.set('d_exc', filters.demografiaIDsExcluir.join(','));
        
        if (filters.isStrictMode) params.set('strict', '1');
        if (filters.studios) params.set('studios', filters.studios);
        if (filters.producers) params.set('producers', filters.producers);
        if (filters.directors) params.set('directors', filters.directors);
        if (filters.seiyuus) params.set('seiyuus', filters.seiyuus);
        
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        history.pushState({path: newUrl}, '', newUrl);
        shareButton.style.display = 'block';
    }

    function applyFiltersFromURL() {
        const params = new URLSearchParams(window.location.search);
        
        document.querySelectorAll('input[name="anime_type"]').forEach(cb => cb.checked = false);
        if (params.has('types')) params.get('types').split(',').forEach(val => {
            const cb = document.querySelector(`input[name="anime_type"][value="${val}"]`);
            if (cb) cb.checked = true;
        });
        document.getElementById('min-episodes').value = params.get('min_ep') || '';
        document.getElementById('max-episodes').value = params.get('max_ep') || '';
        document.getElementById('start-year').value = params.get('start_year') || '';
        document.getElementById('end-year').value = params.get('end_year') || '';
        minScoreSelect.value = params.get('min_score') || '';
        maxScoreSelect.value = params.get('max_score') || '';
        strictModeCheckbox.checked = params.get('strict') === '1';
        document.getElementById('studios').value = params.get('studios') || '';
        document.getElementById('producers').value = params.get('producers') || '';
        document.getElementById('directors').value = params.get('directors') || '';
        document.getElementById('seiyuus').value = params.get('seiyuus') || '';

        const applyTriState = (container, incParam, excParam) => {
            const incIds = params.has(incParam) ? params.get(incParam).split(',') : [];
            const excIds = params.has(excParam) ? params.get(excParam).split(',') : [];
             setTimeout(() => { // Adicionado timeout para garantir que os elementos existam
                 container.querySelectorAll('label').forEach(label => {
                    const cb = label.querySelector('input[type="checkbox"]');
                    if (!cb) return; 
                    let state = 0;
                    if (incIds.includes(cb.value)) state = 1;
                    else if (excIds.includes(cb.value)) state = 2;
                    cb.dataset.filterState = state.toString();
                    updateLabelStateVisual(label, state, true); 
                });
            }, 150); // Ajuste este delay se necessário
        };
        applyTriState(genresContainer, 'g_inc', 'g_exc');
        applyTriState(themesContainer, 't_inc', 't_exc');
        applyTriState(demographicsContainer, 'd_inc', 'd_exc');

        if (params.has('decade')) {
            decadeSelect.value = params.get('decade');
            decadeSelect.dispatchEvent(new Event('change'));
        } else if (params.has('start_year')) { 
            const startY = parseInt(params.get('start_year'));
            if (startY && startY % 10 === 0 && document.querySelector(`#decade option[value="${startY}"]`)) {
                decadeSelect.value = startY.toString();
            } else {
                decadeSelect.value = "";
            }
        }

        const action = params.get('action');
        if (action === 'list') {
            if(params.has('page')) { currentPageForListDisplay = parseInt(params.get('page')) || 1; }
            setTimeout(() => listButton.click(), 250); 
        } else if (action === 'show_anime' && params.has('id')) {
            fetchAndShowSpecificAnime(params.get('id'));
        }
         if(params.toString().length > 0){ shareButton.style.display = 'block';} else { shareButton.style.display = 'none'; }
    }

    async function fetchAndShowSpecificAnime(animeId) {
        prepareForResults();
        loadingIndicator.style.display = 'block';
        try {
            const response = await fetchWithRateLimit(`${API_BASE_URL}/anime/${animeId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Erro ao buscar anime ${animeId}: ${response.status} ${errorData.message}`);
            }
            const animeData = await response.json();
            displayAnimeDetails(animeData.data);
            resultContainer.style.display = 'block';
            resultContainer.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            handleError(error, "busca de anime específico");
        } finally {
            finishLoading();
        }
    }

    async function fetchAndFilterAnimesFromApi() {
        totalApiCallsMadeThisAction = 0; 
        const filters = collectAllFilters(); 
        const isStrictMode = filters.isStrictMode;

        let queryParams = new URLSearchParams({ sfw: 'true', limit: MAX_RESULTS_PER_PAGE_API });
        if (filters.types.length > 0) queryParams.append('type', filters.types.join(','));
        if (filters.minScore) queryParams.append('min_score', filters.minScore);
        if (filters.maxScore) queryParams.append('max_score', filters.maxScore);
        
        let startYearVal = filters.startYear;
        let endYearVal = filters.endYear;
        if (filters.decade && (!startYearVal || !endYearVal)) { 
            startYearVal = filters.decade;
            endYearVal = (parseInt(filters.decade) + 9).toString();
        }
        if (startYearVal) queryParams.append('start_date', `${startYearVal}-01-01`);
        if (endYearVal) queryParams.append('end_date', `${endYearVal}-12-31`);

        if (filters.generoIDsIncluir.length > 0) queryParams.append('genres', filters.generoIDsIncluir.join(','));
        if (filters.temaIDsIncluir.length > 0) queryParams.append('themes', filters.temaIDsIncluir.join(','));
        if (filters.demografiaIDsIncluir.length > 0) queryParams.append('demographics', filters.demografiaIDsIncluir.join(','));
        
        let allAnimeFromApi = [];
        let currentPageApi = 1;
        let hasNextPageApi = true;

        while (hasNextPageApi) {
            const currentQueryParams = new URLSearchParams(queryParams);
            currentQueryParams.set('page', currentPageApi);
            let response;
            try { response = await fetchWithRateLimit(`${API_BASE_URL}/anime?${currentQueryParams.toString()}`); } 
            catch (e) { throw e; }
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(`Erro na API Jikan (página ${currentPageApi}): ${response.status} ${errorData.message || response.statusText}`);
            }
            const data = await response.json();
            allAnimeFromApi.push(...data.data);
            hasNextPageApi = data.pagination?.has_next_page || false;
            if (hasNextPageApi) currentPageApi++;
            if (currentPageApi > 15 && (filters.directors.length > 0 || filters.seiyuus.length > 0)) { hasNextPageApi = false; }
            if (currentPageApi > 30) { hasNextPageApi = false; }
        }
        if (allAnimeFromApi.length === 0 && !queryParams.has('q')) {
            throw new Error("Nenhum anime encontrado com os filtros primários (API).");
        }

        clientFilteredAnime = allAnimeFromApi.filter(anime => {
            if (filters.minEpisodes && (anime.episodes === null || anime.episodes < parseInt(filters.minEpisodes))) return false;
            if (filters.maxEpisodes && (anime.episodes === null || anime.episodes > parseInt(filters.maxEpisodes))) return false;
            if (anime.episodes === null && (filters.minEpisodes || filters.maxEpisodes)) return false;

            if (filters.generoIDsIncluir.length > 0) {
                const animeGenreIDs = anime.genres.map(g => g.mal_id.toString());
                const match = isStrictMode ? filters.generoIDsIncluir.every(id => animeGenreIDs.includes(id)) : filters.generoIDsIncluir.some(id => animeGenreIDs.includes(id));
                if (!match) return false; 
            }
            if (filters.temaIDsIncluir.length > 0) {
                const animeThemeIDs = anime.themes.map(t => t.mal_id.toString());
                const match = isStrictMode ? filters.temaIDsIncluir.every(id => animeThemeIDs.includes(id)) : filters.temaIDsIncluir.some(id => animeThemeIDs.includes(id));
                if (!match) return false; 
            }
            if (filters.demografiaIDsIncluir.length > 0) {
                const animeDemographicIDs = anime.demographics.map(d => d.mal_id.toString());
                const match = isStrictMode ? filters.demografiaIDsIncluir.every(id => animeDemographicIDs.includes(id)) : filters.demografiaIDsIncluir.some(id => animeDemographicIDs.includes(id));
                if (!match) return false; 
            }

            if (filters.generoIDsExcluir.length > 0 && anime.genres.map(g => g.mal_id.toString()).some(id => filters.generoIDsExcluir.includes(id))) return false;
            if (filters.temaIDsExcluir.length > 0 && anime.themes.map(t => t.mal_id.toString()).some(id => filters.temaIDsExcluir.includes(id))) return false;
            if (filters.demografiaIDsExcluir.length > 0 && anime.demographics.map(d => d.mal_id.toString()).some(id => filters.demografiaIDsExcluir.includes(id))) return false;
            
            const studiosToCheck = filters.studios.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
            if (studiosToCheck.length > 0 && !studiosToCheck.some(input => anime.studios.map(s => s.name.toLowerCase()).some(as => as.includes(input)))) return false;
            
            const producersToCheck = filters.producers.split(',').map(p => p.trim().toLowerCase()).filter(p => p);
            if (producersToCheck.length > 0 && !producersToCheck.some(input => anime.producers.map(p => p.name.toLowerCase()).some(ap => ap.includes(input)))) return false;
            
            return true;
        });

        const directorsToCheck = filters.directors.split(',').map(d => d.trim().toLowerCase()).filter(d => d);
        if (directorsToCheck.length > 0 && clientFilteredAnime.length > 0) {
            const directorFiltered = [];
            for (const anime of clientFilteredAnime) {
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL -1 && seiyuusToCheck.length > 0) break;
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL && seiyuusToCheck.length === 0) break; 
                try {
                    const staffRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/staff`);
                    if (staffRes.ok) {
                        const staffData = await staffRes.json();
                        if (staffData.data.some(s => s.positions.some(p => p.toLowerCase().includes('director')) && directorsToCheck.some(d => s.person.name.toLowerCase().includes(d)))) {
                            directorFiltered.push(anime);
                        }
                    }
                } catch (e) { if (e.message.includes("Limite")) throw e; console.warn(`Erro staff ${anime.title}: ${e.message}`); }
            }
            clientFilteredAnime = directorFiltered;
        }

        const seiyuusToCheck = filters.seiyuus.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        if (seiyuusToCheck.length > 0 && clientFilteredAnime.length > 0) {
            const seiyuuFiltered = [];
            for (const anime of clientFilteredAnime) {
                if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) break;
                try {
                    const charsRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/characters`);
                    if (charsRes.ok) {
                        const charsData = await charsRes.json();
                        if (charsData.data.some(c => c.voice_actors.some(v => v.language === 'Japanese' && seiyuusToCheck.some(sName => v.person.name.toLowerCase().includes(sName))))) {
                            seiyuuFiltered.push(anime);
                        }
                    }
                } catch (e) { if (e.message.includes("Limite")) throw e; console.warn(`Erro chars ${anime.title}: ${e.message}`); }
            }
            clientFilteredAnime = seiyuuFiltered;
        }
        return clientFilteredAnime;
    }

    function prepareForResults() {
        loadingIndicator.style.display = 'block'; errorMessageDiv.style.display = 'none';
        resultContainer.style.display = 'none'; listResultContainer.style.display = 'none';
        const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text');
        if (infoTextDiv) infoTextDiv.innerHTML = ''; 
        const existingImg = animeDetailsDiv.querySelector('img');
        if(existingImg) existingImg.remove(); 
        animeListDisplay.innerHTML = '';
    }
    function handleError(error, context) {
        console.error(`Erro ${context}:`, error);
        errorMessageDiv.textContent = error.message;
        errorMessageDiv.style.display = 'block';
        shareButton.style.display = 'none'; 
    }
    function finishLoading() {
        loadingIndicator.style.display = 'none';
    }

    function displayAnimeDetails(anime) {
        let seasonDisplay = anime.year ? (anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : anime.year.toString()) : 'N/A';
        const synopsisFullForJs = anime.synopsis ? anime.synopsis.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '<br>') : 'Sinopse não disponível.';
        const synopsisShort = anime.synopsis ? (anime.synopsis.length > 400 ? anime.synopsis.substring(0,400) + '...' : anime.synopsis) : 'Sinopse não disponível.';
        
        const existingImg = animeDetailsDiv.querySelector('img');
        if (existingImg) existingImg.remove(); 
        const imgElement = document.createElement('img');
        imgElement.src = anime.images.jpg.large_image_url;
        imgElement.alt = `Capa de ${anime.title}`;
        
        const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text'); 
        infoTextDiv.innerHTML = `<h3>${anime.title}</h3>
            ${anime.title_english ? `<p><strong>Inglês:</strong> ${anime.title_english}</p>` : ''}
            ${anime.title_japanese ? `<p><strong>Japonês:</strong> ${anime.title_japanese}</p>` : ''}
            ${anime.title_synonyms && anime.title_synonyms.length > 0 ? `<p><strong>Outros:</strong> ${anime.title_synonyms.join(', ')}</p>` : ''}
            <p><strong>Nota:</strong> ${anime.score || 'N/A'} ${anime.scored_by ? `(${anime.scored_by.toLocaleString()} votos)` : ''}</p>
            <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p>
            <p><strong>Estúdio(s):</strong> ${anime.studios.map(s => s.name).join(', ') || 'N/A'}</p>
            <p><strong>Episódios:</strong> ${anime.episodes || 'N/A'}</p>
            <p><strong>Estreia:</strong> ${seasonDisplay}</p>
            <p><strong>Gêneros:</strong> ${anime.genres.map(g => g.name).join(', ') || 'N/A'}</p>
            <p><strong>Temas:</strong> ${anime.themes.map(t => t.name).join(', ') || 'N/A'}</p>
            <p><strong>Demografia:</strong> ${anime.demographics.map(d => d.name).join(', ') || 'N/A'}</p>
            <p><strong>Sinopse:</strong></p><p id="anime-synopsis-text">${synopsisShort.replace(/\n/g, '<br>')}</p>
            ${anime.synopsis && anime.synopsis.length > 400 ? `<button class="read-more-synopsis" onclick="document.getElementById('anime-synopsis-text').innerHTML='${synopsisFullForJs}'; this.style.display='none';">Ler Mais</button>` : ''}
            <p style="margin-top:10px;"><a href="${anime.url}" target="_blank" rel="noopener noreferrer">Ver no MyAnimeList</a></p>`;
        animeDetailsDiv.insertBefore(imgElement, infoTextDiv);
    }

    function displayAnimeListPage() {
        animeListDisplay.innerHTML = '';
        const startIndex = (currentPageForListDisplay - 1) * ITEMS_PER_LIST_PAGE_DISPLAY;
        const animesToShowOnPage = allFetchedAnimesForList.slice(startIndex, startIndex + ITEMS_PER_LIST_PAGE_DISPLAY);
        animesToShowOnPage.forEach(anime => {
            const itemDiv = document.createElement('div'); itemDiv.className = 'anime-list-item';
            itemDiv.innerHTML = `<a href="${anime.url}" target="_blank" rel="noopener noreferrer" class="anime-list-item-link">
                <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy"><h4>${anime.title}</h4></a>
                <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p><p><strong>Nota:</strong> ${anime.score || 'N/A'}</p>
                <p><strong>Ep:</strong> ${anime.episodes || 'N/A'}</p>
                <p class="small-details"><strong>Estúdios:</strong> ${anime.studios.map(s => s.name).join(', ') || 'N/A'}</p>
                <p class="small-details"><strong>Gêneros:</strong> ${anime.genres.map(g => g.name).join(', ') || 'N/A'}</p>
                ${anime.themes.length > 0 ? `<p class="small-details"><strong>Temas:</strong> ${anime.themes.map(t => t.name).join(', ') || 'N/A'}</p>` : ''}
                ${anime.demographics.length > 0 ? `<p class="small-details"><strong>Demografia:</strong> ${anime.demographics.map(d => d.name).join(', ') || 'N/A'}</p>` : ''}`;
            animeListDisplay.appendChild(itemDiv);
        });
        updateListPaginationControls();
    }

    function updateListPaginationControls() {
        const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY);
        listPaginationControls.style.display = totalPages <= 1 ? 'none' : 'block';
        if (totalPages > 0) { 
             currentPageListSpan.textContent = `Página ${currentPageForListDisplay} de ${totalPages}`;
        } else {
            currentPageListSpan.textContent = ''; 
        }
        prevPageListButton.disabled = currentPageForListDisplay === 1;
        nextPageListButton.disabled = currentPageForListDisplay === totalPages || totalPages === 0;
    }

    prevPageListButton.addEventListener('click', () => { if (currentPageForListDisplay > 1) { currentPageForListDisplay--; displayAnimeListPage(); updateURLWithOptions('list', null, currentPageForListDisplay); listResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }});
    nextPageListButton.addEventListener('click', () => { const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY); if (currentPageForListDisplay < totalPages) { currentPageForListDisplay++; displayAnimeListPage(); updateURLWithOptions('list', null, currentPageForListDisplay); listResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' }); }});
    
    decadeSelect.addEventListener('change', () => {
        const decade = decadeSelect.value;
        if (decade) {
            document.getElementById('start-year').value = decade;
            document.getElementById('end-year').value = (parseInt(decade) + 9).toString();
        } else { 
            document.getElementById('start-year').value = '';
            document.getElementById('end-year').value = '';
        }
    });
    
    function init() {
        console.log("CHAMANDO INIT"); // DEBUG
        populateScoreOptions(); populateDecadeOptions();
        const initPromises = [
            fetchAndPopulateFilterOptions('genres/anime', genresContainer, 'name', 'genres'), 
            fetchAndPopulateFilterOptions('genres/anime?filter=themes', themesContainer, 'name', 'themes'), 
            fetchAndPopulateFilterOptions('genres/anime?filter=demographics', demographicsContainer, 'name', 'demographics')
        ];
        Promise.all(initPromises).then(() => {
            console.log("FILTROS DA UI POPULADOS, APLICANDO FILTROS DA URL"); // DEBUG
            applyFiltersFromURL(); 
        }).catch(error => {
            console.error("Erro ao inicializar filtros:", error);
        });
    }

    randomizeButton.addEventListener('click', async () => { 
        prepareForResults();
        try {
            const filteredAnimes = await fetchAndFilterAnimesFromApi();
            if (filteredAnimes.length === 0) throw new Error("Nenhum anime corresponde a TODOS os critérios.");
            const randomAnime = filteredAnimes[Math.floor(Math.random() * filteredAnimes.length)];
            displayAnimeDetails(randomAnime);
            resultContainer.style.display = 'block'; resultContainer.scrollIntoView({ behavior: 'smooth' });
            updateURLWithOptions('show_anime', randomAnime.mal_id);
        } catch (error) { handleError(error, "sorteio"); } finally { finishLoading(); }
    });
    listButton.addEventListener('click', async () => { 
        prepareForResults();
        const params = new URLSearchParams(window.location.search);
        currentPageForListDisplay = (params.get('action') === 'list' && params.has('page')) 
                                      ? parseInt(params.get('page')) || 1 
                                      : 1;
        try {
            allFetchedAnimesForList = await fetchAndFilterAnimesFromApi();
            if (allFetchedAnimesForList.length === 0) throw new Error("Nenhum anime corresponde a TODOS os critérios.");
            listSummary.textContent = `Encontrados ${allFetchedAnimesForList.length} animes.`;
            displayAnimeListPage(); 
            listResultContainer.style.display = 'block'; listResultContainer.scrollIntoView({ behavior: 'smooth' });
            updateURLWithOptions('list', null, currentPageForListDisplay);
        } catch (error) { handleError(error, "listagem"); } finally { finishLoading(); }
    });

    shareButton.addEventListener('click', () => {
        const urlToShare = window.location.href;
        navigator.clipboard.writeText(urlToShare).then(() => {
            alert('Link de compartilhamento copiado para a área de transferência!');
        }).catch(err => {
            console.error('Erro ao copiar link: ', err);
            alert('Não foi possível copiar o link. Por favor, copie manualmente da barra de endereço.');
        });
    });

    init();
});
