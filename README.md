AniPicker 🎬
🌟 Sobre o Projeto
O AniPicker é uma ferramenta web interativa projetada para ajudar os amantes de anime a descobrir novas séries e filmes. Seja para encontrar um anime aleatório que se encaixe em critérios específicos ou para listar todas as opções disponíveis, o AniPicker oferece uma interface rica em filtros e funcionalidades para refinar sua busca.

Utilizando a API Jikan (v4), o AniPicker busca informações detalhadas e atualizadas sobre uma vasta gama de animes.

✨ Funcionalidades Principais
O AniPicker vem com um conjunto robusto de funcionalidades para personalizar sua experiência de descoberta de animes:

🎲 Sortear Anime: Encontre um anime aleatório com base nos filtros selecionados. Perfeito para quando você não consegue decidir o que assistir!

📜 Listar Animes: Gere uma lista paginada de animes que correspondem aos seus critérios, com opções de ordenação.

🔍 Filtragem Detalhada:

Tipo: TV, Filme, OVA, ONA, Especial, Música.

Número de Episódios: Defina um intervalo mínimo e/ou máximo.

Ano de Estreia: Especifique um ano de início, fim ou uma década específica.

Nota (Score): Filtre por nota mínima e/ou máxima do MyAnimeList.

Gêneros, Temas e Demografia:

Modo Tri-state: Para cada item, você pode:

Não selecionar (ignorar).

Incluir ✓: O anime DEVE ter este item (ou um dos itens selecionados na categoria, dependendo do modo estrito).

Excluir ✕: O anime NÃO PODE ter este item.

Modo Estrito:

Ativado: O anime DEVE conter TODOS os gêneros, temas ou demografias marcados para "Incluir".

Desativado (Padrão): O anime precisa ter PELO MENOS UM dos itens marcados para "Incluir" em QUALQUER UMA das categorias (Gênero OU Tema OU Demografia). Dentro de uma mesma categoria com múltiplos itens para "Incluir" (ex: Ação e Aventura), o anime precisa ter PELO MENOS UM deles.

Estúdios e Produtores: Busque por nomes específicos (separados por vírgula).

Diretores e Seiyuus (Dubladores): Busque por nomes específicos (separados por vírgula). Aviso: Usar esses filtros pode tornar a busca mais lenta devido à necessidade de chamadas adicionais à API por anime.

📑 Paginação:

Controles de paginação na parte superior e inferior da lista de resultados.

Navegação circular (ir da primeira para a última página e vice-versa).

📊 Ordenação da Lista:

Relevância (G/T/D): Prioriza animes com mais correspondências aos filtros de gênero, tema e demografia. Padrão: Mais relevante primeiro.

Nome (A-Z / Z-A)

Nota (Maior / Menor)

Data de Estreia (Mais Recente / Mais Antigo)

🔗 Compartilhamento: Copie um link com os filtros atuais para compartilhar suas buscas.

🏠 Botão Home: Limpa todos os filtros e reseta a visualização.

🎨 Interface Moderna: Estilo Web 3.0 com tema escuro e responsivo.

⚙️ Otimizações:

Cache no lado do cliente para opções de filtro (gêneros, temas, demografias) para reduzir chamadas à API.

Controle de taxa de chamadas à API para evitar sobrecarga e erros 429.

🚀 Como Usar
Clone o repositório (ou baixe os arquivos).

Abra o arquivo index.html em seu navegador de preferência.

Utilize os diversos filtros para refinar sua busca.

Clique em "Sortear Anime" para uma sugestão aleatória ou "Listar Animes" para ver todas as correspondências.

Explore os resultados!

🛠️ Tecnologias Utilizadas
HTML5: Estrutura da página.

CSS3: Estilização e design responsivo.

Variáveis CSS para fácil customização do tema.

Flexbox e Grid Layout para organização dos elementos.

JavaScript (ES6+): Lógica da aplicação, interações, manipulação do DOM e chamadas à API.

Programação assíncrona (Async/Await, Promises) para chamadas à API.

Manipulação de eventos e DOM.

LocalStorage para cache de dados da API.

🔗 API
Jikan API v4: API não oficial do MyAnimeList utilizada para buscar dados e informações sobre animes. (https://docs.api.jikan.moe/)

🔮 Possíveis Melhorias Futuras
[ ] Implementar busca por nome do anime.

[ ] Adicionar opção para salvar filtros favoritos.



Espero que goste do AniPicker! 😊
