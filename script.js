document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'https://api.jikan.moe/v4';
    const MAX_RESULTS_PER_PAGE_API = 25;
    const ITEMS_PER_LIST_PAGE_DISPLAY = 24;
    const MAX_API_CALLS_TOTAL = 45; // Limite total de chamadas por ação do usuário
    const API_DELAY_MS = 1200; // Aumentado para 1.2 segundos para respeitar melhor o rate limit

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
    const homeButton = document.getElementById('home-icon-button');
    const shareButton = document.getElementById('share-button');
    const strictModeCheckbox = document.getElementById('strict-mode-checkbox');

    const sortBySelect = document.getElementById('sort-by');
    const sortOrderToggle = document.getElementById('sort-order-toggle');
    const listSummaryCount = document.getElementById('list-summary-count');

    const loadingIndicator = document.getElementById('loading-indicator');
    const errorMessageDiv = document.getElementById('error-message');
    const resultContainer = document.getElementById('result-container');
    const animeDetailsDiv = document.getElementById('anime-details');
    const listResultContainer = document.getElementById('list-result-container');
    const animeListDisplay = document.getElementById('anime-list-display');

    // Elementos de Paginação Superior
    const paginationControlsTop = document.getElementById('list-pagination-controls-top');
    const prevPageListButtonTop = document.getElementById('prev-page-list-top');
    const nextPageListButtonTop = document.getElementById('next-page-list-top');
    const currentPageListSpanTop = document.getElementById('current-page-list-top');

    // Elementos de Paginação Inferior
    const paginationControlsBottom = document.getElementById('list-pagination-controls-bottom');
    const prevPageListButtonBottom = document.getElementById('prev-page-list-bottom');
    const nextPageListButtonBottom = document.getElementById('next-page-list-bottom');
    const currentPageListSpanBottom = document.getElementById('current-page-list-bottom');


    let allFetchedAnimesForList = [];
    let currentPageForListDisplay = 1;
    let totalApiCallsMadeThisAction = 0;
    let currentSortBy = 'relevance_score';
    let currentSortOrderAsc = false; // false = Descending (default for relevance, score, date), true = Ascending

    // Função para pausar a execução
    function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

    // Função para fazer fetch com controle de rate limiting
    async function fetchWithRateLimit(url, options = {}, delay = API_DELAY_MS) {
        // Verifica se o limite total de chamadas para esta ação já foi atingido
        if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) {
            console.warn("Limite de chamadas à API auto-imposto atingido nesta ação.");
            throw new Error("Limite de chamadas à API atingido para esta busca. Tente filtros mais específicos.");
        }
        await sleep(delay); // Espera antes de fazer a chamada
        totalApiCallsMadeThisAction++; // Incrementa o contador de chamadas para esta ação
        // console.log(`API Call #${totalApiCallsMadeThisAction}: ${url}`); // Log da chamada (opcional)
        return fetch(url, options);
    }

    function populateScoreOptions() { minScoreSelect.innerHTML = '<option value="">Qualquer</option>'; maxScoreSelect.innerHTML = '<option value="">Qualquer</option>'; for (let i = 1; i <= 10; i += 0.5) { const valStr = i.toFixed(1); const option = document.createElement('option'); option.value = valStr; option.textContent = valStr; minScoreSelect.appendChild(option.cloneNode(true)); maxScoreSelect.appendChild(option); } }
    function populateDecadeOptions() { const currentYear = new Date().getFullYear(); for (let year = 1910; year < currentYear + 10; year += 10) { if (year + 9 < 1917) continue; const option = document.createElement('option'); option.value = year; option.textContent = `${year}s`; decadeSelect.appendChild(option); } }

    async function fetchAndPopulateFilterOptions(endpoint, container, nameKey = 'name', categoryName) {
        const cacheKey = `jikan_filter_cache_${endpoint.replace(/[/?=]/g, '_')}`;
        const cacheDuration = 24 * 60 * 60 * 1000;
        try {
            container.innerHTML = '<p>Carregando...</p>';
            let dataToProcess;
            const cachedItem = localStorage.getItem(cacheKey);
            if (cachedItem) { const { timestamp, data } = JSON.parse(cachedItem); if (Date.now() - timestamp < cacheDuration) { dataToProcess = data; } }
            if (!dataToProcess) {
                // Não usar fetchWithRateLimit aqui, pois são chamadas iniciais e geralmente poucas.
                // Mas ainda é bom ter um pequeno delay para não sobrecarregar na inicialização.
                await sleep(API_DELAY_MS / 2); 
                const response = await fetch(`${API_BASE_URL}/${endpoint}`);
                if (!response.ok) { const errorJson = await response.json().catch(() => ({ message: `HTTP error ${response.status}` })); throw new Error(`Erro ${response.status} ao buscar ${categoryName}: ${errorJson.message || 'Erro desconhecido'}`); }
                const apiData = await response.json();
                if (!apiData.data || !Array.isArray(apiData.data)) { throw new Error(`Resposta inesperada da API para ${categoryName}.`); }
                dataToProcess = apiData.data; localStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data: dataToProcess }));
            }
            let finalDataForDisplay = dataToProcess;
            if (categoryName === 'genres') { finalDataForDisplay = dataToProcess.filter(item => CURATED_GENRES_NAMES.includes(item[nameKey])); }
            container.innerHTML = '';
            const sortedData = finalDataForDisplay.sort((a, b) => a[nameKey].localeCompare(b[nameKey]));
            if (sortedData.length === 0 && categoryName === 'genres') { container.innerHTML = '<p class="error-text">Nenhum gênero curado encontrado.</p>'; return; }
            if (sortedData.length === 0) { container.innerHTML = `<p>Nenhum item de ${categoryName} encontrado.</p>`; return; }
            sortedData.forEach(item => {
                const label = document.createElement('label'); const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox'; checkboxInput.value = item.mal_id; checkboxInput.name = categoryName; checkboxInput.dataset.filterState = "0";
                label.appendChild(checkboxInput); label.appendChild(document.createTextNode(item[nameKey]));
                label.setAttribute('role', 'checkbox'); label.setAttribute('aria-checked', 'false'); label.tabIndex = 0;
                label.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); let S = parseInt(checkboxInput.dataset.filterState || "0"); S = (S + 1) % 3; checkboxInput.dataset.filterState = S.toString(); updateLabelStateVisual(label, S); });
                label.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); label.click(); } }); container.appendChild(label);
            });
        } catch (error) { console.error(`Falha ${categoryName}:`, error); container.innerHTML = `<p class="error-text">Erro ${categoryName}. (${error.message})</p>`; localStorage.removeItem(cacheKey); }
    }
    function updateLabelStateVisual(label, state) { label.classList.remove('state-include', 'state-exclude'); let S = "false"; if (state === 1) { label.classList.add('state-include'); S = "true"; } else if (state === 2) { label.classList.add('state-exclude'); S = "mixed"; } label.setAttribute('aria-checked', S); }
    function collectAllFilters() { const f = {}; f.types = Array.from(document.querySelectorAll('input[name="anime_type"]:checked')).map(c => c.value); f.minEpisodes = document.getElementById('min-episodes').value; f.maxEpisodes = document.getElementById('max-episodes').value; f.startYear = document.getElementById('start-year').value; f.endYear = document.getElementById('end-year').value; f.decade = decadeSelect.value; f.minScore = minScoreSelect.value; f.maxScore = maxScoreSelect.value; f.generoIDsIncluir = [], f.generoIDsExcluir = []; genresContainer.querySelectorAll('input[type="checkbox"]').forEach(c => { if (c.dataset.filterState === "1") f.generoIDsIncluir.push(c.value); else if (c.dataset.filterState === "2") f.generoIDsExcluir.push(c.value); }); f.temaIDsIncluir = [], f.temaIDsExcluir = []; themesContainer.querySelectorAll('input[type="checkbox"]').forEach(c => { if (c.dataset.filterState === "1") f.temaIDsIncluir.push(c.value); else if (c.dataset.filterState === "2") f.temaIDsExcluir.push(c.value); }); f.demografiaIDsIncluir = [], f.demografiaIDsExcluir = []; demographicsContainer.querySelectorAll('input[type="checkbox"]').forEach(c => { if (c.dataset.filterState === "1") f.demografiaIDsIncluir.push(c.value); else if (c.dataset.filterState === "2") f.demografiaIDsExcluir.push(c.value); }); f.isStrictMode = strictModeCheckbox.checked; f.studios = document.getElementById('studios').value; f.producers = document.getElementById('producers').value; f.directors = document.getElementById('directors').value; f.seiyuus = document.getElementById('seiyuus').value; return f; }
    function updateURLWithOptions(action, animeId = null, listPage = null) { const f = collectAllFilters(); const p = new URLSearchParams(); if (action) p.set('action', action); if (animeId && action === 'show_anime') p.set('id', animeId); if (listPage && action === 'list') p.set('page', listPage); if (f.types.length > 0) p.set('types', f.types.join(',')); if (f.minEpisodes) p.set('min_ep', f.minEpisodes); if (f.maxEpisodes) p.set('max_ep', f.maxEpisodes); if (f.startYear) p.set('start_year', f.startYear); if (f.endYear) p.set('end_year', f.endYear); if (f.decade && !(f.startYear && f.endYear)) p.set('decade', f.decade); if (f.minScore) p.set('min_score', f.minScore); if (f.maxScore) p.set('max_score', f.maxScore); if (f.generoIDsIncluir.length > 0) p.set('g_inc', f.generoIDsIncluir.join(',')); if (f.generoIDsExcluir.length > 0) p.set('g_exc', f.generoIDsExcluir.join(',')); if (f.temaIDsIncluir.length > 0) p.set('t_inc', f.temaIDsIncluir.join(',')); if (f.temaIDsExcluir.length > 0) p.set('t_exc', f.temaIDsExcluir.join(',')); if (f.demografiaIDsIncluir.length > 0) p.set('d_inc', f.demografiaIDsIncluir.join(',')); if (f.demografiaIDsExcluir.length > 0) p.set('d_exc', f.demografiaIDsExcluir.join(',')); if (f.isStrictMode) p.set('strict', '1'); if (f.studios) p.set('studios', f.studios); if (f.producers) p.set('producers', f.producers); if (f.directors) p.set('directors', f.directors); if (f.seiyuus) p.set('seiyuus', f.seiyuus); const N = `${window.location.pathname}?${p.toString()}`; history.pushState({ path: N }, '', N); shareButton.style.display = 'block'; }
    function applyFiltersFromURL() { const p = new URLSearchParams(window.location.search); const action = p.get('action'); let hasActualFilters = false; for (const key of p.keys()) { if (key !== 'action' && key !== 'page' && p.get(key) !== '') { hasActualFilters = true; break; } } if (hasActualFilters) { document.querySelectorAll('input[name="anime_type"]').forEach(c => c.checked = false); if (p.has('types')) p.get('types').split(',').forEach(v => { const c = document.querySelector(`input[name="anime_type"][value="${v}"]`); if (c) c.checked = true; }); document.getElementById('min-episodes').value = p.get('min_ep') || ''; document.getElementById('max-episodes').value = p.get('max_ep') || ''; document.getElementById('start-year').value = p.get('start_year') || ''; document.getElementById('end-year').value = p.get('end_year') || ''; minScoreSelect.value = p.get('min_score') || ''; maxScoreSelect.value = p.get('max_score') || ''; strictModeCheckbox.checked = p.get('strict') === '1'; document.getElementById('studios').value = p.get('studios') || ''; document.getElementById('producers').value = p.get('producers') || ''; document.getElementById('directors').value = p.get('directors') || ''; document.getElementById('seiyuus').value = p.get('seiyuus') || ''; const A = (c, I, E) => { const i = p.has(I) ? p.get(I).split(',') : []; const e = p.has(E) ? p.get(E).split(',') : []; setTimeout(() => { c.querySelectorAll('label').forEach(l => { const C = l.querySelector('input[type="checkbox"]'); if (!C) return; let s = 0; if (i.includes(C.value)) s = 1; else if (e.includes(C.value)) s = 2; C.dataset.filterState = s.toString(); updateLabelStateVisual(l, s); }); }, 150); }; A(genresContainer, 'g_inc', 'g_exc'); A(themesContainer, 't_inc', 't_exc'); A(demographicsContainer, 'd_inc', 'd_exc'); if (p.has('decade')) { decadeSelect.value = p.get('decade'); decadeSelect.dispatchEvent(new Event('change')); } else if (p.has('start_year')) { const s = parseInt(p.get('start_year')); if (s && s % 10 === 0 && document.querySelector(`#decade option[value="${s}"]`)) { decadeSelect.value = s.toString(); } else { decadeSelect.value = ""; } } } if (action === 'list' && hasActualFilters) { if (p.has('page')) currentPageForListDisplay = parseInt(p.get('page')) || 1; setTimeout(() => { if (!loadingIndicator.style.display || loadingIndicator.style.display === 'none') { listButton.click(); } }, 300); } else if (action === 'show_anime' && p.has('id')) { fetchAndShowSpecificAnime(p.get('id')); } if (p.toString().length > 0 && hasActualFilters) shareButton.style.display = 'block'; else shareButton.style.display = 'none'; }
    async function fetchAndShowSpecificAnime(animeId) { prepareForResults(); loadingIndicator.style.display = 'block'; try { const r = await fetchWithRateLimit(`${API_BASE_URL}/anime/${animeId}`); if (!r.ok) { const e = await r.json().catch(() => ({ message: r.statusText })); throw new Error(`Erro anime ${animeId}: ${r.status} ${e.message}`); } const d = await r.json(); displayAnimeDetails(d.data); resultContainer.style.display = 'block'; resultContainer.scrollIntoView({ behavior: 'smooth' }); } catch (e) { handleError(e, "busca anime específico"); } finally { finishLoading(); } }

    async function fetchAndFilterAnimesFromApi() {
        totalApiCallsMadeThisAction = 0; // Reseta o contador para cada nova ação de busca/listagem
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
        
        // Loop para buscar páginas de resultados da API
        while (hasNextPageApi) {
            const currentQueryParams = new URLSearchParams(queryParams); currentQueryParams.set('page', currentPageApi);
            let response;
            try {
                response = await fetchWithRateLimit(`${API_BASE_URL}/anime?${currentQueryParams.toString()}`);
            } catch (e) {
                if (e.message.includes("Limite de chamadas à API atingido para esta busca")) {
                    console.warn(e.message); 
                    hasNextPageApi = false; 
                    if (allAnimeFromApi.length === 0) throw e; 
                    break; 
                }
                throw e; 
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                if (response.status === 429) {
                    console.warn(`API Rate Limit atingido na página ${currentPageApi}. Tentando usar dados já obtidos.`);
                    handleError(new Error(`API Rate Limit (pág ${currentPageApi}): ${errorData.message || response.statusText}. Resultados podem estar incompletos.`), "busca API (Rate Limit)");
                    hasNextPageApi = false; 
                    break; 
                }
                throw new Error(`Erro API Jikan (pág ${currentPageApi}): ${response.status} ${errorData.message || response.statusText}`);
            }
            const data = await response.json();
            if (data.data && data.data.length > 0) {
                allAnimeFromApi.push(...data.data);
            }
            hasNextPageApi = data.pagination?.has_next_page || false;
            if (hasNextPageApi) currentPageApi++;
        }

        if (allAnimeFromApi.length === 0 && (queryParams.has('q') || currentPageApi === 1)) {
            throw new Error("Nenhum anime encontrado com os filtros básicos da API ou o limite de chamadas foi atingido muito cedo.");
        }


        clientFilteredAnime = allAnimeFromApi.filter(anime => {
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
        if (directorsToCheck.length > 0 && clientFilteredAnime.length > 0) { const directorFiltered = []; const seiyuusPossiblyToCheck = filters.seiyuus.split(',').map(s => s.trim().toLowerCase()).filter(s => s); for (const anime of clientFilteredAnime) { if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL - 1 && seiyuusPossiblyToCheck.length > 0) break; if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL && seiyuusPossiblyToCheck.length === 0) break; try { const staffRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/staff`); if (staffRes.ok) { const staffData = await staffRes.json(); if (staffData.data.some(s => s.positions.some(p => p.toLowerCase().includes('director')) && directorsToCheck.some(d => s.person.name.toLowerCase().includes(d)))) { directorFiltered.push(anime); } } } catch (e) { if (e.message.includes("Limite")) { console.warn("Limite de chamadas API atingido durante busca de diretores."); break;} console.warn(`Erro staff ${anime.title}: ${e.message}`); } } clientFilteredAnime = directorFiltered; }
        const seiyuusToCheck = filters.seiyuus.split(',').map(s => s.trim().toLowerCase()).filter(s => s);
        if (seiyuusToCheck.length > 0 && clientFilteredAnime.length > 0) { const seiyuuFiltered = []; for (const anime of clientFilteredAnime) { if (totalApiCallsMadeThisAction >= MAX_API_CALLS_TOTAL) break; try { const charsRes = await fetchWithRateLimit(`${API_BASE_URL}/anime/${anime.mal_id}/characters`); if (charsRes.ok) { const charsData = await charsRes.json(); if (charsData.data.some(c => c.voice_actors.some(v => v.language === 'Japanese' && seiyuusToCheck.some(sName => v.person.name.toLowerCase().includes(sName))))) { seiyuuFiltered.push(anime); } } } catch (e) { if (e.message.includes("Limite")) { console.warn("Limite de chamadas API atingido durante busca de seiyuus."); break;} console.warn(`Erro chars ${anime.title}: ${e.message}`); } } clientFilteredAnime = seiyuuFiltered; }
        return clientFilteredAnime;
    }

    // Função de ordenação revisada
    function sortAnimeList(animeList, sortBy, sortOrderAscToggle) {
        const sortedList = [...animeList];
        // sortOrderAscToggle = true  significa ordem ascendente (A-Z, menor para maior, mais antigo para mais novo, menor relevância para maior)
        // sortOrderAscToggle = false significa ordem descendente (Z-A, maior para menor, mais novo para mais antigo, maior relevância para menor)

        sortedList.sort((a, b) => {
            let valA, valB;
            switch (sortBy) {
                case 'title':
                    valA = (a.title || '').toLowerCase();
                    valB = (b.title || '').toLowerCase();
                    break;
                case 'score':
                    valA = parseFloat(a.score) || 0;
                    valB = parseFloat(b.score) || 0;
                    break;
                case 'start_date':
                    valA = a.aired && a.aired.from ? new Date(a.aired.from).getTime() : (a.year ? new Date(`${a.year}-01-01`).getTime() : Date.parse('1900-01-01'));
                    valB = b.aired && b.aired.from ? new Date(b.aired.from).getTime() : (b.year ? new Date(`${b.year}-01-01`).getTime() : Date.parse('1900-01-01'));
                    if (isNaN(valA)) valA = Date.parse('1900-01-01');
                    if (isNaN(valB)) valB = Date.parse('1900-01-01');
                    break;
                case 'relevance_score':
                    valA = a.relevanceScore || 0;
                    valB = b.relevanceScore || 0;
                    break;
                default:
                    return 0;
            }

            if (valA < valB) return sortOrderAscToggle ? -1 : 1;
            if (valA > valB) return sortOrderAscToggle ? 1 : -1;
            
            // Ordenação secundária por título (ascendente) se os valores primários forem iguais
            const titleA = (a.title || '').toLowerCase();
            const titleB = (b.title || '').toLowerCase();
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
            return 0;
        });
        return sortedList;
    }

    function prepareForResults() { loadingIndicator.style.display = 'block'; errorMessageDiv.style.display = 'none'; errorMessageDiv.textContent = ''; resultContainer.style.display = 'none'; listResultContainer.style.display = 'none'; const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text'); if (infoTextDiv) infoTextDiv.innerHTML = ''; const existingImg = animeDetailsDiv.querySelector('img'); if (existingImg) existingImg.remove(); animeListDisplay.innerHTML = ''; listSummaryCount.textContent = ''; }
    function handleError(error, context) { 
        console.error(`Erro ${context}:`, error); 
        if (!errorMessageDiv.textContent.includes("Resultados podem estar incompletos")) {
            errorMessageDiv.textContent = `Erro durante ${context}: ${error.message}`;
        }
        errorMessageDiv.style.display = 'block'; 
        if (!error.message.includes("Resultados podem estar incompletos")) {
            shareButton.style.display = 'none';
        }
    }
    function finishLoading() { loadingIndicator.style.display = 'none'; }
    function displayAnimeDetails(anime) { let seasonDisplay = anime.year ? (anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : anime.year.toString()) : 'N/A'; const synopsisFullForJs = anime.synopsis ? anime.synopsis.replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '<br>') : 'Sinopse não disponível.'; const synopsisShort = anime.synopsis ? (anime.synopsis.length > 400 ? anime.synopsis.substring(0, 400) + '...' : anime.synopsis) : 'Sinopse não disponível.'; const existingImg = animeDetailsDiv.querySelector('img'); if (existingImg) existingImg.remove(); const imgElement = document.createElement('img'); imgElement.src = anime.images.jpg.large_image_url; imgElement.alt = `Capa de ${anime.title}`; const infoTextDiv = animeDetailsDiv.querySelector('.anime-info-text'); infoTextDiv.innerHTML = `<h3>${anime.title}</h3> ${anime.title_english ? `<p><strong>Inglês:</strong> ${anime.title_english}</p>` : ''} ${anime.title_japanese ? `<p><strong>Japonês:</strong> ${anime.title_japanese}</p>` : ''} ${anime.title_synonyms && anime.title_synonyms.length > 0 ? `<p><strong>Outros:</strong> ${anime.title_synonyms.join(', ')}</p>` : ''} <p><strong>Nota:</strong> ${anime.score || 'N/A'} ${anime.scored_by ? `(${anime.scored_by.toLocaleString()} votos)` : ''}</p> <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p> <p><strong>Estúdio(s):</strong> ${anime.studios.map(s => s.name).join(', ') || 'N/A'}</p> <p><strong>Episódios:</strong> ${anime.episodes || 'N/A'}</p> <p><strong>Estreia:</strong> ${seasonDisplay}</p> <p><strong>Gêneros:</strong> ${anime.genres.map(g => g.name).join(', ') || 'N/A'}</p> <p><strong>Temas:</strong> ${anime.themes.map(t => t.name).join(', ') || 'N/A'}</p> <p><strong>Demografia:</strong> ${anime.demographics.map(d => d.name).join(', ') || 'N/A'}</p> <p><strong>Sinopse:</strong></p><p id="anime-synopsis-text">${synopsisShort.replace(/\n/g, '<br>')}</p> ${anime.synopsis && anime.synopsis.length > 400 ? `<button class="read-more-synopsis" onclick="document.getElementById('anime-synopsis-text').innerHTML='${synopsisFullForJs}'; this.style.display='none';">Ler Mais</button>` : ''} <p style="margin-top:10px;"><a href="${anime.url}" target="_blank" rel="noopener noreferrer">Ver no MyAnimeList</a></p>`; animeDetailsDiv.insertBefore(imgElement, infoTextDiv); }
    
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
                return tags.map(tag => includedIDs.includes(tag.mal_id.toString()) ? `<span class="filtered-tag">${tag.name}</span>` : `<span class="tag-item">${tag.name}</span>`).join(' '); 
            }; 
            const studiosText = anime.studios.map(s => s.name).join(', ') || 'N/A'; 
            const genresText = createTagString(anime.genres, generoIDsIncluir); 
            const themesText = createTagString(anime.themes, temaIDsIncluir); 
            const demographicsText = createTagString(anime.demographics, demografiaIDsIncluir); 
            itemDiv.innerHTML = `<a href="${anime.url}" target="_blank" rel="noopener noreferrer" class="anime-list-item-link"> <img src="${anime.images.jpg.image_url}" alt="${anime.title}" loading="lazy"><h4>${anime.title}</h4></a> <p><strong>Tipo:</strong> ${anime.type || 'N/A'}</p><p><strong>Nota:</strong> ${anime.score || 'N/A'}</p> <p><strong>Ep:</strong> ${anime.episodes || 'N/A'}</p> <p class="small-details"><strong>Estúdios:</strong> ${studiosText}</p> <p class="small-details"><strong>Gêneros:</strong> ${genresText}</p> ${anime.themes.length > 0 ? `<p class="small-details"><strong>Temas:</strong> ${themesText}</p>` : ''} ${anime.demographics.length > 0 ? `<p class="small-details"><strong>Demografia:</strong> ${demographicsText}</p>` : ''}`; 
            animeListDisplay.appendChild(itemDiv); 
        }); 
        updateListPaginationControls(); 
    }

    function updateListPaginationControls() {
        const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY);
        const displayStyle = totalPages > 0 ? 'block' : 'none'; 

        if (paginationControlsTop) {
            paginationControlsTop.style.display = displayStyle;
            if (totalPages > 0) {
                currentPageListSpanTop.textContent = `Página ${currentPageForListDisplay} de ${totalPages}`;
            } else {
                currentPageListSpanTop.textContent = '';
            }
            prevPageListButtonTop.disabled = totalPages <= 1;
            nextPageListButtonTop.disabled = totalPages <= 1;
        }

        if (paginationControlsBottom) {
            paginationControlsBottom.style.display = displayStyle;
            if (totalPages > 0) {
                currentPageListSpanBottom.textContent = `Página ${currentPageForListDisplay} de ${totalPages}`;
            } else {
                currentPageListSpanBottom.textContent = '';
            }
            prevPageListButtonBottom.disabled = totalPages <= 1;
            nextPageListButtonBottom.disabled = totalPages <= 1;
        }
    }

    function handlePageChange(direction) {
        const totalPages = Math.ceil(allFetchedAnimesForList.length / ITEMS_PER_LIST_PAGE_DISPLAY);
        if (totalPages <= 1) return; 

        if (direction === 'prev') {
            currentPageForListDisplay--;
            if (currentPageForListDisplay < 1) {
                currentPageForListDisplay = totalPages; 
            }
        } else if (direction === 'next') {
            currentPageForListDisplay++;
            if (currentPageForListDisplay > totalPages) {
                currentPageForListDisplay = 1; 
            }
        }

        displayAnimeListPage();
        updateURLWithOptions('list', null, currentPageForListDisplay);
        listResultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    if (prevPageListButtonTop) prevPageListButtonTop.addEventListener('click', () => handlePageChange('prev'));
    if (nextPageListButtonTop) nextPageListButtonTop.addEventListener('click', () => handlePageChange('next'));
    if (prevPageListButtonBottom) prevPageListButtonBottom.addEventListener('click', () => handlePageChange('prev'));
    if (nextPageListButtonBottom) nextPageListButtonBottom.addEventListener('click', () => handlePageChange('next'));
    
    decadeSelect.addEventListener('change', () => { const decade = decadeSelect.value; if (decade) { document.getElementById('start-year').value = decade; document.getElementById('end-year').value = (parseInt(decade) + 9).toString(); } else { document.getElementById('start-year').value = ''; document.getElementById('end-year').value = ''; } });

    function init() {
        populateScoreOptions(); populateDecadeOptions();
        // Define o estado inicial do botão de ordenação
        // currentSortOrderAsc é false por padrão, então o botão mostrará '↓' (Descendente)
        sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓';
        sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`;
        
        const initPromises = [
            fetchAndPopulateFilterOptions('genres/anime', genresContainer, 'name', 'genres'),
            fetchAndPopulateFilterOptions('genres/anime?filter=themes', themesContainer, 'name', 'themes'),
            fetchAndPopulateFilterOptions('genres/anime?filter=demographics', demographicsContainer, 'name', 'demographics')
        ];
        Promise.all(initPromises).then(() => {
            applyFiltersFromURL();
        }).catch(error => {
            console.error("Erro ao inicializar filtros:", error);
            handleError(error, "inicialização dos filtros");
        });
    }

    function resetToHomeState() {
        document.getElementById('min-episodes').value = ''; document.getElementById('max-episodes').value = '';
        document.getElementById('start-year').value = ''; document.getElementById('end-year').value = '';
        document.getElementById('studios').value = ''; document.getElementById('producers').value = '';
        document.getElementById('directors').value = ''; document.getElementById('seiyuus').value = '';
        decadeSelect.value = ''; minScoreSelect.value = ''; maxScoreSelect.value = '';
        
        sortBySelect.value = 'relevance_score'; // Define o dropdown para relevância
        currentSortBy = 'relevance_score';     // Define a variável interna de ordenação
        currentSortOrderAsc = false;           // Garante que a ordem para relevância seja descendente por padrão
        
        sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓'; // Atualiza o texto do botão
        sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`; // Atualiza o título do botão
        
        document.querySelectorAll('input[name="anime_type"]:checked').forEach(cb => cb.checked = false);
        [genresContainer, themesContainer, demographicsContainer].forEach(container => {
            container.querySelectorAll('label').forEach(label => {
                const cb = label.querySelector('input[type="checkbox"]');
                if (cb) { cb.dataset.filterState = "0"; updateLabelStateVisual(label, 0); }
            });
        });
        strictModeCheckbox.checked = false; 
        prepareForResults(); allFetchedAnimesForList = []; currentPageForListDisplay = 1; listSummaryCount.textContent = '';
        history.pushState({ path: window.location.pathname }, '', window.location.pathname);
        shareButton.style.display = 'none';
        loadingIndicator.style.display = 'none';
        errorMessageDiv.style.display = 'none'; errorMessageDiv.textContent = '';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    homeButton.addEventListener('click', resetToHomeState);

    randomizeButton.addEventListener('click', async () => { prepareForResults(); try { const filteredAnimes = await fetchAndFilterAnimesFromApi(); if (filteredAnimes.length === 0) throw new Error("Nenhum anime corresponde aos critérios."); const randomAnime = filteredAnimes[Math.floor(Math.random() * filteredAnimes.length)]; displayAnimeDetails(randomAnime); resultContainer.style.display = 'block'; resultContainer.scrollIntoView({ behavior: 'smooth' }); updateURLWithOptions('show_anime', randomAnime.mal_id); } catch (error) { handleError(error, "sorteio"); } finally { finishLoading(); } });
    
    listButton.addEventListener('click', async () => { 
        prepareForResults(); 
        const params = new URLSearchParams(window.location.search); 
        currentPageForListDisplay = (params.get('action') === 'list' && params.has('page')) ? parseInt(params.get('page')) || 1 : 1; 
        
        // Garante que ao listar, se a ordenação for por relevância, score ou data, a ordem inicial seja descendente.
        // Se o currentSortBy for um desses e currentSortOrderAsc for true (indicando ascendente),
        // resetamos currentSortOrderAsc para false para forçar a ordenação descendente inicial.
        // No entanto, currentSortOrderAsc já é false por padrão e no resetToHomeState.
        // A lógica de sortAnimeList agora interpreta currentSortOrderAsc=false como descendente para todos os casos.

        try { 
            let fetchedAndFilteredAnimes = await fetchAndFilterAnimesFromApi(); 
            if (fetchedAndFilteredAnimes.length === 0 && !errorMessageDiv.textContent.includes("Resultados podem estar incompletos") ) { 
                throw new Error("Nenhum anime corresponde aos critérios."); 
            } 
            allFetchedAnimesForList = sortAnimeList(fetchedAndFilteredAnimes, currentSortBy, currentSortOrderAsc); 
            listSummaryCount.textContent = `(${allFetchedAnimesForList.length})`; 
            if (allFetchedAnimesForList.length > 0) { 
                displayAnimeListPage(); 
            } else if (!errorMessageDiv.textContent.includes("Resultados podem estar incompletos")) { 
                throw new Error("Nenhum anime corresponde aos critérios após todos os filtros."); 
            } 
            listResultContainer.style.display = 'block'; 
            updateURLWithOptions('list', null, currentPageForListDisplay); 
        } catch (error) { 
            handleError(error, "listagem"); 
        } finally { 
            finishLoading(); 
        } 
    });

    sortBySelect.addEventListener('change', () => { 
        currentSortBy = sortBySelect.value; 
        // Ao mudar o tipo de ordenação, resetamos para a ordem descendente como padrão visual e lógico,
        // já que é o mais comum para score, relevância e data. Para título, o usuário pode inverter se quiser A-Z.
        currentSortOrderAsc = false; 
        sortOrderToggle.textContent = currentSortOrderAsc ? '↑' : '↓';
        sortOrderToggle.title = `Ordem: ${currentSortOrderAsc ? 'Ascendente' : 'Descendente'}`;
        
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
    
    init();
});
