# AniPicker 🎬✨

[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/Guide/HTML/HTML5)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/pt-BR/docs/Web/CSS)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/pt-BR/docs/Web/JavaScript)
[![Jikan API](https://img.shields.io/badge/API-Jikan_v4-2DB0D9?style=for-the-badge)](https://docs.api.jikan.moe/)

<!-- 
SUGESTÃO: Adicione aqui um screenshot ou GIF do AniPicker em ação!
Exemplo:
![AniPicker em Ação](link_para_seu_gif_ou_screenshot.png) 
-->

## 🌟 Sobre o Projeto

O AniPicker é uma ferramenta web interativa projetada para ajudar os amantes de anime a descobrir novas séries e filmes. Seja para encontrar um anime aleatório que se encaixe em critérios específicos ou para listar todas as opções disponíveis, o AniPicker oferece uma interface rica em filtros e funcionalidades para refinar sua busca.

Utilizando a API Jikan (v4), o AniPicker busca informações detalhadas e atualizadas sobre uma vasta gama de animes.

## 📑 Tabela de Conteúdos
* [Sobre o Projeto](#-sobre-o-projeto)
* [Funcionalidades Principais](#-funcionalidades-principais)
* [Como Usar](#-como-usar)
* [Tecnologias Utilizadas](#️-tecnologias-utilizadas)
* [API](#-api)
* [Possíveis Melhorias Futuras](#-possíveis-melhorias-futuras)
* [Como Contribuir](#🤝-como-contribuir)
* [Licença](#📄-licença)

## ✨ Funcionalidades Principais

O AniPicker vem com um conjunto robusto de funcionalidades para personalizar sua experiência de descoberta de animes:

* **🎲 Sortear Anime:** Encontre um anime aleatório com base nos filtros selecionados.
* **📜 Listar Animes:** Gere uma lista paginada de animes que correspondem aos seus critérios.
* **🔍 Filtragem Detalhada:**
    * **Tipo:** TV, Filme, OVA, ONA, Especial, Música.
    * **Número de Episódios:** Defina um intervalo mínimo e/ou máximo.
    * **Ano de Estreia:** Especifique um ano de início, fim ou uma década específica (a seleção de década preenche os anos, e a edição manual dos anos limpa a seleção de década).
    * **Nota (Score):** Filtre por nota mínima e/ou máxima do MyAnimeList.
    * **Gêneros, Temas e Demografia:**
        * **Modo Tri-state:** Para cada item, você pode: Não selecionar, **Incluir ✓**, ou **Excluir ✕**.
        * **Modo Estrito:**
            * **Ativado:** O anime DEVE conter TODOS os itens marcados para "Incluir".
            * **Desativado (Padrão):** O anime precisa ter PELO MENOS UM dos itens marcados para "Incluir" em QUALQUER UMA das categorias (Gênero OU Tema OU Demografia).
    * **Estúdios e Produtores:** Busque por nomes específicos (separados por vírgula).
    * **Diretores e Seiyuus (Dubladores):** Busque por nomes específicos (separados por vírgula). *Aviso: Usar esses filtros pode tornar a busca mais lenta e está sujeito a um limite de chamadas à API.*
* **🚫 Cancelamento de Busca:**
    * Um botão "Cancelar Busca" aparece durante as operações de listagem ou sorteio.
    * Clicar neste botão interrompe a busca atual e reabilita os botões "Listar Animes" e "Sortear Anime".
    * Os botões "Listar Animes" e "Sortear Anime" ficam desabilitados durante uma busca ativa.
* **📑 Paginação:**
    * Controles de paginação na parte superior e inferior da lista de resultados.
    * Navegação circular (ir da primeira para a última página e vice-versa).
    * Ao aplicar novos filtros e listar, a visualização da lista sempre começa na página 1.
* **📊 Ordenação da Lista Dinâmica:**
    * **Relevância (G/T/D):**
        * Disponível apenas no **modo não estrito** e se houver pelo menos um filtro de inclusão de Gênero, Tema ou Demografia selecionado.
        * Se aplicável, torna-se a ordenação padrão (mais relevante primeiro).
    * **Nome (A-Z / Z-A):** Ordenação padrão se "Relevância" não for aplicável (ex: modo estrito).
    * **Nota (Maior / Menor)**
    * **Data de Estreia (Mais Recente / Mais Antigo)**
* **🔗 Compartilhamento de Links:**
    * O botão "Copiar Link de Compartilhamento" aparece assim que qualquer filtro é modificado ou uma ação de busca é realizada.
    * A URL é atualizada dinamicamente conforme os filtros são selecionados.
    * Ao carregar uma URL compartilhada, os filtros são aplicados, mas a busca não é executada automaticamente.
* **🏠 Botão Home:** Limpa todos os filtros, reseta a visualização e cancela qualquer busca em andamento.
* **ℹ️ Exibição de Detalhes:**
    * Data de estreia formatada como DD/MM/YYYY.
    * Temporada de estreia (ex: Winter 2022).
    * Sinopse completa exibida em uma área de rolagem, sem botão "Ler Mais".
* **🎨 Interface Moderna:** Estilo Web 3.0 com tema escuro e responsivo.
* **⚙️ Otimizações:**
    * Cache no lado do cliente para opções de filtro (gêneros, temas, demografias).
    * Controle de taxa de chamadas à API para evitar sobrecarga e erros 429, com mensagens informativas ao usuário caso o limite seja atingido.

## 🚀 Como Usar

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git](https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git)
    ```
    (Substitua `SEU_USUARIO/SEU_REPOSITORIO` pelo caminho real do seu projeto no GitHub)
2.  **Navegue até a pasta do projeto:**
    ```bash
    cd SEU_REPOSITORIO
    ```
3.  **Abra o arquivo `index.html`** em seu navegador de preferência.
4.  Utilize os diversos filtros para refinar sua busca. A URL e o botão de compartilhamento serão atualizados instantaneamente.
5.  Clique em "Sortear Anime" para uma sugestão aleatória ou "Listar Animes" para ver todas as correspondências.
6.  Se uma busca estiver demorando, você pode usar o botão "Cancelar Busca".
7.  Explore os resultados! ✨

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura da página.
* **CSS3:** Estilização e design responsivo.
    * Variáveis CSS para fácil customização do tema.
    * Flexbox e Grid Layout para organização dos elementos.
* **JavaScript (ES6+):** Lógica da aplicação, interações, manipulação do DOM e chamadas à API.
    * Programação assíncrona (Async/Await, Promises).
    * `AbortController` para cancelamento de chamadas `fetch`.
    * Manipulação de eventos e DOM.
    * LocalStorage para cache de dados da API.

## 🔗 API

* **Jikan API v4:** API não oficial do MyAnimeList utilizada para buscar dados e informações sobre animes.
    * Documentação: [https://docs.api.jikan.moe/](https://docs.api.jikan.moe/)

## 🔮 Possíveis Melhorias Futuras

* [ ] Implementar busca por nome do anime.
* [ ] Paginação "inteligente" para filtros de Diretor/Seiyuu, buscando apenas o necessário e informando o progresso.

## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Se você tem alguma sugestão para melhorar o AniPicker, sinta-se à vontade para:

1.  Fazer um "Fork" do projeto.
2.  Criar uma nova "Branch" (`git checkout -b feature/NovaFuncionalidade`).
3.  Fazer o "Commit" das suas alterações (`git commit -m 'Adiciona NovaFuncionalidade'`).
4.  Fazer o "Push" para a Branch (`git push origin feature/NovaFuncionalidade`).
5.  Abrir um "Pull Request".

Alternativamente, você pode abrir uma "Issue" com a tag "enhancement" para discutir novas funcionalidades ou melhorias.

## 📄 Licença

Este projeto está atualmente sem uma licença definida. Sinta-se livre para adicionar uma, como a MIT, se desejar.

---

Espero que goste do AniPicker! 😊 Se tiver alguma dúvida ou sugestão, não hesite em abrir uma "Issue".
