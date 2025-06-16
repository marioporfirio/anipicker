// =================================================================
// ============== ARQUIVO: src/lib/constants.ts ====================
// =================================================================

/**
 * Centraliza os valores de z-index usados na aplicação para garantir uma
 * sobreposição consistente e evitar conflitos.
 */
export const Z_INDEX = {
  BACK_TO_TOP: 50,
  HEADER: 40,
  SIDEBAR_TOGGLE: 30,
  MODAL_BACKDROP: 50,
  
  // ✨ NOVA CHAVE ADICIONADA ✨
  // Usada para o conteúdo principal de modais genéricas como a de importação.
  MODAL_CONTENT: 60, 

  ANIME_DETAILS_MODAL: 55, // Talvez esses também devessem ser maiores que o backdrop.
  STUDIO_WORKS_MODAL: 60,
  PERSON_DETAILS_MODAL: 65,
};

/**
 * Constantes relacionadas à paginação e limites de busca.
 */
export const PAGINATION = {
  DEFAULT_GRID_PAGE_SIZE: 20,
  USER_LIST_PAGE_SIZE: 50, // Tamanho maior para listas de usuário
  STUDIO_WORKS_PAGE_SIZE: 20,
};

/**
 * Constantes para os limites dos filtros de slider.
 */
export const FILTER_LIMITS = {
    MIN_YEAR: 1970,
    MAX_YEAR: new Date().getFullYear() + 1,
    MIN_SCORE: 0,
    MAX_SCORE: 100,
}