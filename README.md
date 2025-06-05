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

## 📑 Tabela de Conteúdos (Opcional)
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

* **🎲 Sortear Anime:** Encontre um anime aleatório com base nos filtros selecionados. Perfeito para quando você não consegue decidir o que assistir!
* **📜 Listar Animes:** Gere uma lista paginada de animes que correspondem aos seus critérios, com opções de ordenação.
* **🔍 Filtragem Detalhada:**
    * **Tipo:** TV, Filme, OVA, ONA, Especial, Música.
    * **Número de Episódios:** Defina um intervalo mínimo e/ou máximo.
    * **Ano de Estreia:** Especifique um ano de início, fim ou uma década específica.
    * **Nota (Score):** Filtre por nota mínima e/ou máxima do MyAnimeList.
    * **Gêneros, Temas e Demografia:**
        * **Modo Tri-state:** Para cada item, você pode:
            1.  Não selecionar (ignorar).
            2.  **Incluir ✓:** O anime DEVE ter este item (ou um dos itens selecionados na categoria, dependendo do modo estrito).
            3.  **Excluir ✕:** O anime NÃO PODE ter este item.
        * **Modo Estrito:**
            * **Ativado:** O anime DEVE conter TODOS os gêneros, temas ou demografias marcados para "Incluir".
            * **Desativado (Padrão):** O anime precisa ter PELO MENOS UM dos itens marcados para "Incluir" em QUALQUER UMA das categorias (Gênero OU Tema OU Demografia). Dentro de uma mesma categoria com múltiplos itens para "Incluir" (ex: Ação e Aventura), o anime precisa ter PELO MENOS UM deles.
    * **Estúdios e Produtores:** Busque por nomes específicos (separados por vírgula).
    * **Diretores e Seiyuus (Dubladores):** Busque por nomes específicos (separados por vírgula). *Aviso: Usar esses filtros pode tornar a busca mais lenta devido à necessidade de chamadas adicionais à API por anime.*
* **📑 Paginação:**
    * Controles de paginação na parte superior e inferior da lista de resultados.
    * Navegação circular (ir da primeira para a última página e vice-versa).
* **📊 Ordenação da Lista:**
    * Relevância (G/T/D): Prioriza animes com mais correspondências aos filtros de gênero, tema e demografia. **Padrão: Mais relevante primeiro.**
    * Nome (A-Z / Z-A)
    * Nota (Maior / Menor)
    * Data de Estreia (Mais Recente / Mais Antigo)
* **🔗 Compartilhamento:** Copie um link com os filtros atuais para compartilhar suas buscas.
* **🏠 Botão Home:** Limpa todos os filtros e reseta a visualização.
* **🎨 Interface Moderna:** Estilo Web 3.0 com tema escuro e responsivo.
* **⚙️ Otimizações:**
    * Cache no lado do cliente para opções de filtro (gêneros, temas, demografias) para reduzir chamadas à API.
    * Controle de taxa de chamadas à API para evitar sobrecarga e erros 429.

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
4.  Utilize os diversos filtros para refinar sua busca.
5.  Clique em "Sortear Anime" para uma sugestão aleatória ou "Listar Animes" para ver todas as correspondências.
6.  Explore os resultados! ✨

## 🛠️ Tecnologias Utilizadas

* **HTML5:** Estrutura da página.
* **CSS3:** Estilização e design responsivo.
    * Variáveis CSS para fácil customização do tema.
    * Flexbox e Grid Layout para organização dos elementos.
* **JavaScript (ES6+):** Lógica da aplicação, interações, manipulação do DOM e chamadas à API.
    * Programação assíncrona (Async/Await, Promises) para chamadas à API.
    * Manipulação de eventos e DOM.
    * LocalStorage para cache de dados da API.

## 🔗 API

* **Jikan API v4:** API não oficial do MyAnimeList utilizada para buscar dados e informações sobre animes.
    * Documentação: [https://docs.api.jikan.moe/](https://docs.api.jikan.moe/)

## 🔮 Possíveis Melhorias Futuras

* [ ] Implementar busca por nome do anime.
* [ ] Adicionar opção para salvar filtros favoritos.


## 🤝 Como Contribuir

Contribuições são sempre bem-vindas! Se você tem alguma sugestão para melhorar o AniPicker, sinta-se à vontade para:

1.  Fazer um "Fork" do projeto.
2.  Criar uma nova "Branch" (`git checkout -b feature/NovaFuncionalidade`).
3.  Fazer o "Commit" das suas alterações (`git commit -m 'Adiciona NovaFuncionalidade'`).
4.  Fazer o "Push" para a Branch (`git push origin feature/NovaFuncionalidade`).
5.  Abrir um "Pull Request".

Alternativamente, você pode abrir uma "Issue" com a tag "enhancement" para discutir novas funcionalidades ou melhorias.

## 📄 Licença

Este projeto está atualmente sem uma licença definida. Você pode adicionar uma licença como MIT, Apache 2.0, etc., se desejar.

---

Espero que goste do AniPicker! 😊 Se tiver alguma dúvida ou sugestão, não hesite em abrir uma "Issue".
