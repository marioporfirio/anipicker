// src/lib/translations.ts
import { ListStatus } from '@/store/userListStore';

export const staffRoleTranslations: { [key: string]: string } = {
  'Art Coordination Design': 'Coordenador de Arte do Design',
  'Art Design': 'Design de Arte',
  'Director': 'Diretor(a)',
  'Background Art': 'Arte de Cenário',
  'Series Director': 'Diretor(a) da Série',
  'Episode Director': 'Diretor(a) de Episódio',
  'Original Creator': 'Criador(a) Original',
  'Chief Director': 'Diretor(a) Chefe',
  'Color Script': 'Roteiro de Cores',
  'Screenplay': 'Composição de Série',
  'Script': 'Roteiro',
  'Design Works': 'Projetos de Design',
  'Planning': 'Planejamento',
  'Music': 'Música',
  'Insert Song Lyrics': 'Letra da Música de Inserção',
  'Art Director': 'Diretor(a) de Arte',
  'Sound Director': 'Diretor(a) de Som',
  'Character Design': 'Design de Personagens',
  'Key Animation': 'Animação Chave',
  'Theme Song Performance': 'Intérprete da Música Tema',
  'Theme Song Composition': 'Composição da Música Tema',
  'Theme Song Arrangement': 'Arranjo da Música Tema',
  'Theme Song Lyrics': 'Letra da Música Tema',
  'Chief Animation Director': 'Diretor(a) Chefe de Animação',
  'Animation': 'Animação',
  'In-between Animation': 'Animação Intermediária',
  'Animation Director': 'Diretor(a) de Animação',
  'Producer': 'Produtor(a)',
  'Original Character Design': 'Design Original de Personagem',
  'Executive Producer': 'Produtor(a) Executivo(a)',
  'Director of Photography': 'Diretor(a) de Fotografia',
  'Editing': 'Edição',
  'Storyboard': 'Storyboard',
  'Insert Song Performance': 'Intérprete da Música de Inserção',
  'Sub Character Design': 'Design de Personagens Secundários',
};

export const relationTypeTranslations: { [key: string]: { [lang: string]: string } } = {
  SOURCE: { pt: 'Fonte Original', en: 'Source' },
  PREQUEL: { pt: 'Prelúdio', en: 'Prequel' },
  SEQUEL: { pt: 'Sequência', en: 'Sequel' },
  PARENT: { pt: 'Principal', en: 'Parent' },
  SIDE_STORY: { pt: 'História Paralela', en: 'Side Story' },
  SPIN_OFF: { pt: 'Spin-Off', en: 'Spin-Off' },
  ALTERNATIVE: { pt: 'Alternativo', en: 'Alternative' },
  SUMMARY: { pt: 'Resumo', en: 'Summary' },
  CHARACTER: { pt: 'Personagem', en: 'Character' },
  OTHER: { pt: 'Outro', en: 'Other' },
};

export const animeFormatTranslations: { [key: string]: { [lang: string]: string } } = {
    TV: { pt: 'TV', en: 'TV' },
    TV_SHORT: { pt: 'TV Curta', en: 'TV Short' },
    MOVIE: { pt: 'Filme', en: 'Movie' },
    SPECIAL: { pt: 'Especial', en: 'Special' },
    OVA: { pt: 'OVA', en: 'OVA' },
    ONA: { pt: 'ONA', en: 'ONA' },
    MUSIC: { pt: 'Música', en: 'Music' },
    MANGA: { pt: 'Mangá', en: 'Manga' },
    NOVEL: { pt: 'Novel', en: 'Novel' },
    ONE_SHOT: { pt: 'One-shot', en: 'One-shot' },
};

const sortedStaffKeys = Object.keys(staffRoleTranslations).sort((a, b) => b.length - a.length);

export const translateStaffRole = (roleString: string): string => {
  if (!roleString) return '';

  // Procura pela correspondência mais longa primeiro
  const matchingKey = sortedStaffKeys.find(key => roleString.startsWith(key));

  if (matchingKey) {
    const translation = staffRoleTranslations[matchingKey];
    // Pega o resto da string, ex: " (eps 1, 22)"
    const details = roleString.substring(matchingKey.length); 
    return `${translation}${details}`;
  }
  
  // Se nenhuma chave corresponder ao início da string, retorna a string original
  return roleString;
};

export const translateRelationType = (type: string, lang: 'pt' | 'en'): string => {
  const translation = relationTypeTranslations[type]?.[lang];
  return translation || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
};

export const translateAnimeFormat = (type: string | null | undefined, lang: 'pt' | 'en'): string => {
    if (!type) return 'N/A';
    const translation = animeFormatTranslations[type]?.[lang];
    return translation || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const translateMediaStatus = (type: string | null | undefined, lang: 'pt' | 'en'): string => {
  if (!type) return 'N/A';
  const translation = statusOptionTranslations[type]?.[lang];
  return translation || type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

export const tagCategoryTranslations: { [key: string]: string } = {
  'Demographic': 'Demografia',
  'Cast-Main Cast': 'Elenco Principal',
  'Cast-Traits': 'Traços de Personagem',
  'Setting': 'Ambientação',
  'Setting-Scene': 'Cenário Específico',
  'Setting-Time': 'Época/Período',
  'Setting-Universe': 'Universo',
  'Technical': 'Aspectos Técnicos',
  'Theme-Action': 'Ação',
  'Theme-Arts': 'Artes',
  'Theme-Arts-Music': 'Música',
  'Theme-Comedy': 'Comédia',
  'Theme-Drama': 'Drama',
  'Theme-Fantasy': 'Fantasia',
  'Theme-Game': 'Jogos',
  'Theme-Game-Card & Board Game': 'Jogos de Cartas e Tabuleiro',
  'Theme-Game-Sport': 'Esportes',
  'Theme-Other': 'Outros Temas',
  'Theme-Other-Organisations': 'Organizações',
  'Theme-Other-Vehicle': 'Veículos',
  'Theme-Romance': 'Romance',
  'Theme-Sci-Fi': 'Ficção Científica',
  'Theme-Sci-Fi-Mecha': 'Mecha',
  'Theme-Slice of Life': 'Slice of Life',
};

export const genreTranslations: { [key: string]: string } = {
  'Action': 'Ação',
  'Adventure': 'Aventura',
  'Comedy': 'Comédia',
  'Drama': 'Drama',
  'Ecchi': 'Ecchi',
  'Fantasy': 'Fantasia',
  'Hentai': 'Hentai',
  'Horror': 'Terror',
  'Mahou Shoujo': 'Mahou Shoujo',
  'Mecha': 'Mecha',
  'Music': 'Música',
  'Mystery': 'Mistério',
  'Psychological': 'Psicológico',
  'Romance': 'Romance',
  'Sci-Fi': 'Ficção Científica',
  'Slice of Life': 'Slice of Life',
  'Sports': 'Esportes',
  'Supernatural': 'Sobrenatural',
  'Thriller': 'Suspense',
};

export const tagTranslations: { [key: string]: string } = {
    // Demographics
    'Josei': 'Josei',
    'Kids': 'Infantil',
    'Seinen': 'Seinen',
    'Shoujo': 'Shoujo',
    'Shounen': 'Shounen',
    
    // Cast-Main Cast
    'Anti-Hero': 'Anti-herói',
    'Elderly Protagonist': 'Protagonista Idoso(a)',
    'Ensemble Cast': 'Múltiplos Protagonistas',
    'Estranged Family': 'Laços Familiares Rompidos',
    'Female Protagonist': 'Protagonista Feminina',
    'Male Protagonist': 'Protagonista Masculino',
    'Primarily Adult Cast': 'Elenco-Adulto',
    'Primarily Animal Cast': 'Elenco-Animal',
    'Primarily Child Cast': 'Elenco-Infantil',
    'Primarily Female Cast': 'Elenco-Feminino',
    'Primarily Male Cast': 'Elenco-Masculino',
    'Primarily Teen Cast': 'Elenco-Adolescente',

    // Cast-Traits
    'Age Regression': 'Regressão de Idade',
    'Agender': 'Agênero',
    'Aliens': 'Alienígenas',
    'Amnesia': 'Amnésia',
    'Angel': 'Anjo',
    'Anthropomorphism': 'Antropomorfismo',
    'Aromantic': 'Arromântico',
    'Arranged Marriage': 'Casamento Arranjado',
    'Artificial Intelligence': 'Inteligência Artificial',
    'Asexual': 'Assexual',
    'Bisexual': 'Bissexual',
    'Butler': 'Mordomo',
    'Centaur': 'Centauro',
    'Chimera': 'Quimera',
    'Chuunibyou': 'Chuunibyou',
    'Clone': 'Clone',
    'Cosplay': 'Cosplay',
    'Cowboys': 'Cowboys',
    'Crossdressing': 'Cross-dressing',
    'Cyborg': 'Ciborgue',
    'Delinquent': 'Jovem Delinquente',
    'Demons': 'Demônios',
    'Detective': 'Detetive',
    'Dinosaurs': 'Dinossauros',
    'Disability': 'Deficiência',
    'Dissociative Identities': 'Identidades Dissociativas',
    'Dragons': 'Dragões',
    'Dullahan': 'Dullahan',
    'Elf': 'Elfo',
    'Fairy': 'Fada',
    'Femboy': 'Femboy',
    'Ghost': 'Fantasma',
    'Goblin': 'Goblin',
    'Gods': 'Deuses',
    'Gyaru': 'Gyaru',
    'Hikikomori': 'Hikikomori',
    'Homeless': 'Sem-teto',
    'Idol': 'Idol',
    'Kemomimi': 'Kemonomimi',
    'Kuudere': 'Kuudere',
    'Maids': 'Maids',
    'Mermaid': 'Sereia',
    'Monster Boy': 'Garoto Monstruoso',
    'Monster Girl': 'Garota Monstruosa',
    'Nekomimi': 'Nekomimi',
    'Ninja': 'Ninja',
    'Naked': 'Nudez',
    'Nun': 'Freira',
    'Office Lady': 'Office Lady (OL)',
    'Oiran': 'Oiran',
    'Ojou-sama': 'Ojou-sama',
    'Orphan': 'Órfão',
    'Pirates': 'Piratas',
    'Robots': 'Robôs',
    'Samurai': 'Samurai',
    'Shrine Maidens': 'Miko (Sacerdotisa)',
    'Skeleton': 'Esqueleto',
    'Succubus': 'Súcubo',
    'Tanned Skin': 'Pele Bronzeada',
    'Teacher': 'Professor(a)',
    'Tomboy': 'Tomboy',
    'Transgender': 'Transgênero',
    'Tsundere': 'Tsundere',
    'Twins': 'Gêmeos',
    'Vampire': 'Vampiro',
    'Veterinarian': 'Veterinário(a)',
    'Vikings': 'Vikings',
    'Villainess': 'Vilã',
    'VTuber': 'VTuber',
    'Werewolf': 'Lobisomem',
    'Witch': 'Bruxa',
    'Yandere': 'Yandere',
    'Zombie': 'Zumbi',

    // Setting
    'Matriarchy': 'Matriarcado',
    
    // Setting-Scene
    'Bar': 'Bar',
    'Boarding School': 'Internato',
    'Camping': 'Acampamento',
    'Circus': 'Circo',
    'Coastal': 'Litoral',
    'College': 'Faculdade',
    'Desert': 'Deserto',
    'Dungeon': 'Masmorra',
    'Foreign': 'No Exterior',
    'Inn': 'Estalagem/Pousada',
    'Konbini': 'Konbini',
    'Natural Disaster': 'Desastre Natural',
    'Office': 'Escritório',
    'Outdoor Activities': 'Atividades ao Ar Livre',
    'Prison': 'Prisão',
    'Restaurant': 'Restaurante',
    'Rural': 'Zona Rural',
    'School': 'Ambiente Escolar',
    'School Club': 'Clube Escolar',
    'Snowscape': 'Paisagem Nevada',
    'Urban': 'Urbano',
    'Wilderness': 'Natureza Selvagem',
    'Work': 'Ambiente de Trabalho',
    
    // Setting-Time
    'Achronological Order': 'Ordem Acronológica',
    'Anachronism':  'Anacronismo',
    'Ancient China': 'China Antiga',
    'Dystopian': 'Distopia',
    'Historical': 'Histórico',
    'Medieval': 'Medieval',
    'Time Skip': 'Salto Temporal',
    
    // Setting-Universe
    'Afterlife': 'Vida Após a Morte',
    'Alternate Universe': 'Universo Alternativo',
    'Augmented Reality': 'Realidade Aumentada',
    'Post-Apocalyptic': 'Pós-apocalíptico',
    'Space': 'Espaço Sideral',
    'Urban Fantasy': 'Fantasia Urbana',
    'Virtual World': 'Mundo Virtual',
    
    // Technical
    '4-koma': '4-koma',
    'Achromatic': 'Acromático',
    'Advertisement': 'Publicidade',
    'Anthology': 'Antologia',
    'CGI': 'CGI',
    'Episodic': 'Episódico',
    'Flash': 'Animação em Flash',
    'Full CGI': 'Totalmente em CGI',
    'Full Color': 'Totalmente Colorido',
    'Long Strip': 'Webtoon/Tira Longa',
    'Mixed Media': 'Mídia Mista',
    'No Dialogue': 'Sem Diálogo',
    'Non-fiction': 'Não Ficção',
    'POV': 'Ponto de Vista (POV)',
    'Puppetry': 'Marionetes/Fantoches',
    'Rotoscoping': 'Rotoscopia',
    'Stop Motion': 'Stop Motion',
    'Vertical Video': 'Vídeo Vertical',
    
    // Theme-Action
    'Archery': 'Arco e Flecha',
    'Battle Royale': 'Battle Royale',
    'Espionage': 'Espionagem',
    'Fugitive': 'Fugitivo',
    'Guns': 'Armas de Fogo',
    'Martial Arts': 'Artes Marciais',
    'Spearplay': 'Combate com Lança',
    'Swordplay': 'Combate com Espada',
    
    // Theme-Arts
    'Acting': 'Atuação',
    'Calligraphy': 'Caligrafia',
    'Classic Literature': 'Literatura Clássica',
    'Drawing': 'Desenho',
    'Fashion': 'Moda',
    'Food': 'Culinária',
    'Makeup': 'Maquiagem',
    'Photography': 'Fotografia',
    'Rakugo': 'Rakugo',
    'Writing': 'Escrita',
    
    // Theme-Arts-Music
    'Band': 'Banda',
    'Classical Music': 'Música Clássica',
    'Dancing': 'Dança',
    'Hip-hop Music': 'Hip-Hop',
    'Jazz Music': 'Jazz',
    'Metal Music': 'Metal',
    'Musical Theater': 'Teatro Musical',
    'Rock Music': 'Rock',
    
    // Theme-Comedy
    'Parody': 'Paródia',
    'Satire': 'Sátira',
    'Slapstick': 'Comédia Física',
    'Surreal Comedy': 'Comédia Surreal',
    
    // Theme-Drama
    'Bullying': 'Bullying',
    'Class Struggle': 'Luta de Classes',
    'Coming of Age': 'Amadurecimento',
    'Conspiracy': 'Conspiração',
    'Eco-Horror': 'Terror Ecológico',
    'Fake Relationship': 'Relacionamento de Fachada',
    'Kingdom Management': 'Gerenciamento de Reino',
    'Rehabilitation': 'Reabilitação',
    'Revenge': 'Vingança',
    'Suicide': 'Suicídio',
    'Tragedy': 'Tragédia',
    
    // Theme-Fantasy
    'Alchemy': 'Alquimia',
    'Body Swapping': 'Troca de Corpos',
    'Cultivation': 'Cultivo',
    'Curses': 'Maldições',
    'Exorcism': 'Exorcismo',
    'Fairy Tale': 'Conto de Fadas',
    'Henshin': 'Henshin',
    'Isekai': 'Isekai',
    'Kaiju': 'Kaiju',
    'Magic': 'Magia',
    'Mythology': 'Mitologia',
    'Necromancy': 'Necromancia',
    'Shapeshifting': 'Metamorfose',
    'Steampunk': 'Steampunk',
    'Super Power': 'Superpoderes',
    'Super Hero': 'Super-herói',
    'Wuxia': 'Wuxia',
    'Youkai': 'Youkai',
    
    // Theme-Game
    'Board Game': 'Jogo de Tabuleiro',
    'E-sports': 'E-sports',
    'Video Games': 'Videogames',
    
    //Theme-Game Card & Board
    'Card Battle': 'Batalha de Cartas',
    'Go': 'Go',
    'Karuta': 'Karuta',
    'Mahjong': 'Mahjong',
    'Poker': 'Poker',
    'Shogi': 'Shogi',
    
    //Theme-Game-Sport
    'Acrobatics': 'Acrobacias',
    'Airsoft': 'Airsoft',
    'American Football': 'Futebol Americano',
    'Athletics': 'Atletismo',
    'Badminton': 'Badminton',
    'Baseball': 'Beisebol',
    'Basketball': 'Basquete',
    'Bowling': 'Boliche',
    'Boxing': 'Boxe',
    'Cheerleading': 'Líderes de Torcida',
    'Cycling': 'Ciclismo',
    'Fencing': 'Esgrima',
    'Fishing': 'Pesca',
    'Fitness': 'Fitness',
    'Football': 'Futebol',
    'Golf': 'Golfe',
    'Handball': 'Handebol',
    'Ice Skating': 'Patinação no Gelo',
    'Judo': 'Judô',
    'Lacrosse': 'Lacrosse',
    'Parkour': 'Parkour',
    'Rugby': 'Rugby',
    'Scuba Diving': 'Mergulho',
    'Skateboarding': 'Skate',
    'Sumo': 'Sumô',
    'Surfing': 'Surfe',
    'Swimming': 'Natação',
    'Table Tennis': 'Tênis de Mesa',
    'Tennis': 'Tênis',
    'Volleyball': 'Voleibol',
    'Wrestling': 'Luta Livre',
    
    // Theme-Other
    'Adoption': 'Adoção',
    'Animals': 'Animais',
    'Astronomy': 'Astronomia',
    'Autobiographical': 'Autobiográfico',
    'Biographical': 'Biográfico',
    'Blackmail': 'Chantagem',
    'Body Image': 'Imagem Corporal',
    'Body Horror': 'Horror Corporal',
    'Cannibalism': 'Canibalismo',
    'Chibi': 'Chibi',
    'Cosmic Horror': 'Horror Cósmico',
    'Creature Taming': 'Domesticação de Criaturas',
    'Crime': 'Crime',
    'Crossover': 'Crossover',
    'Death Game': 'Jogo Mortal',
    'Denpa': 'Denpa',
    'Drugs': 'Drogas',
    'Economics': 'Economia',
    'Educational': 'Educacional',
    'Environmental': 'Ambiental',
    'Ero Guro': 'Ero Guro',
    'Filmmaking': 'Produção de Filmes',
    'Found Family': 'Família por Escolha',
    'Gambling': 'Jogos de Azar',
    'Gender Bending': 'Troca de Gênero',
    'Gore': 'Gore',
    'Indigenous Cultures': 'Culturas Indígenas',
    'Language Barrier': 'Barreira Linguística',
    'LGBTQ+ Themes': 'Temática LGBTQ+',
    'Lost Civilization': 'Civilização Perdida',
    'Marriage': 'Casamento',
    'Medicine': 'Medicina',
    'Memory Manipulation': 'Manipulação de Memória',
    'Meta': 'Metalinguagem',
    'Mountaineering': 'Alpinismo/Montanhismo',
    'Noir': 'Noir',
    'Otaku Culture': 'Cultura Otaku',
    'Pandemic': 'Pandemia',
    'Philosophy': 'Filosofia',
    'Politics': 'Política',
    'Pregnancy': 'Gravidez',
    'Proxy Battle': 'Batalha por Procuração',
    'Psychosexual': 'Psicossexual',
    'Reincarnation': 'Reencarnação',
    'Religion': 'Religião',
    'Rescue': 'Resgate',
    'Royal Affairs': 'Assuntos da Realeza',
    'Slavery': 'Escravidão',
    'Software Development': 'Desenvolvimento de Software',
    'Survival': 'Sobrevivência',
    'Terrorism': 'Terrorismo',
    'Torture': 'Tortura',
    'Travel': 'Viagem',
    'Vocal Synth': 'Sintetizador de Voz (Vocaloid)',
    'War': 'Guerra',
    
    // Theme-Other-Organisations
    'Assassins': 'Assassinos',
    'Criminal Organizations': 'Organizações Criminosas',
    'Cult': 'Seita / Culto',
    'Firefighters': 'Bombeiros',
    'Gangs': 'Gangues',
    'Mafia': 'Máfia',
    'Military': 'Militar',
    'Police': 'Polícia',
    'Triads': 'Tríades',
    'Yakuza': 'Yakuza',
    
    //Theme-Other-Vehicle
    'Aviation': 'Aviação',
    'Cars': 'Carros',
    'Mopeds': 'Ciclomotores',
    'Motorcycles': 'Motocicletas',
    'Ships': 'Navios',
    'Tanks': 'Tanques de Guerra',
    'Trains': 'Trens',
    
    // Theme-Romance
    'Age Gap': 'Diferença de Idade',
    'Boys Love': 'Boys Love (BL)',
    'Cohabitation': 'Coabitação',
    'Female Harem': 'Harém',
    'Heterosexual': 'Heterossexual',
    'Love Triangle': 'Triângulo Amoroso',
    'Male Harem': 'Harém Invertido',
    'Matchmaking': 'Agenciamento de Casais',
    'Mixed Gender Harem': 'Harém Misto',
    'Polyamorous': 'Poliamor',
    'Teens\' Love': 'Romance Adolescente',
    'Unrequited Love': 'Amor Não Correspondido',
    'Yuri': 'Yuri',
    
    // Theme-Sci-Fi
    'Cyberpunk': 'Cyberpunk',
    'Space Opera': 'Space Opera',
    'Time Loop': 'Loop Temporal',
    'Time Manipulation': 'Manipulação do Tempo',
    'Tokusatsu': 'Tokusatsu',
    
    // Theme-Sci-Fi-Mecha
    'Real Robot': 'Real Robot',
    'Super Robot': 'Super Robot',
    
    // Theme-Slice of Life
    'Agriculture': 'Agricultura',
    'Cute Boys Doing Cute Things': 'Garotos Fofos',
    'Cute Girls Doing Cute Things': 'Garotas Fofas',
    'Family Life': 'Vida em Família',
    'Horticulture': 'Horticultura',
    'Iyashikei': 'Iyashikei',
    'Parenthood': 'Paternidade/Maternidade',
};

export const sidebarLabelTranslations: { [lang: string]: { [key: string]: string } } = {
  pt: {
    filtersTitle: 'Filtros',
    raffleMode: '🎲 Modo Sorteio',
    searchAnime: 'Buscar Anime',
    animeType: 'Tipo',
    status: 'Status',
    source: 'Fonte',
    averageScore: 'Nota Média',
    releaseYear: 'Ano de Estreia',
    includeTBA: 'TBA',
    hideFilters: 'Esconder filtros',
    sortByLabel: 'Ordenar por:', 
    skipVisible: 'Marcar visíveis como Ignorado',
    resetFilters: 'Limpar Filtros',
  },
  en: {
    filtersTitle: 'Filters',
    raffleMode: '🎲 Raffle Mode',
    searchAnime: 'Search Anime',
    animeType: 'Type',
    status: 'Status',
    source: 'Source',
    averageScore: 'Average Score',
    releaseYear: 'Release Year',
    includeTBA: 'TBA',
    hideFilters: 'Hide filters',
    sortByLabel: 'Sort By:',
    resetFilters: 'Reset Filters',
    skipVisible: 'Mark visible as Ignored',
  }
};

export const formatOptionTranslations: { [key: string]: { [lang: string]: string } } = {
  'TV': { pt: 'TV', en: 'TV' },
  'TV_SHORT': { pt: 'TV Curto', en: 'TV Short' },
  'MOVIE': { pt: 'Filme', en: 'Movie' },
  'SPECIAL': { pt: 'Especial', en: 'Special' },
  'OVA': { pt: 'OVA', en: 'OVA' },
  'ONA': { pt: 'ONA', en: 'ONA' },
  'MUSIC': { pt: 'Música', en: 'Music' },
};

export const statusOptionTranslations: { [key: string]: { [lang: string]: string } } = {
  'FINISHED': { pt: 'Finalizado', en: 'Finished' },
  'RELEASING': { pt: 'Lançando', en: 'Releasing' },
  'NOT_YET_RELEASED': { pt: 'A Lançar', en: 'Unreleased' },
  'CANCELLED': { pt: 'Cancelado', en: 'Cancelled' },
  'HIATUS': { pt: 'Em Hiato', en: 'Hiatus' },
};

export const sourceOptionTranslations: { [key: string]: { [lang: string]: string } } = {
  'ORIGINAL': { pt: 'Original', en: 'Original' },
  'MANGA': { pt: 'Mangá', en: 'Manga' },
  'LIGHT_NOVEL': { pt: 'Light Novel', en: 'Light Novel' },
  'VISUAL_NOVEL': { pt: 'Visual Novel', en: 'Visual Novel' },
  'VIDEO_GAME': { pt: 'Video Game', en: 'Video Game' },
  'WEB_NOVEL': { pt: 'Web Novel', en: 'Web Novel' },
  'OTHER': { pt: 'Outro', en: 'Other' },
};

export const sortOptionTranslations: { [key: string]: { [lang: string]: string } } = {
  'POPULARITY_DESC': { pt: 'Popularidade', en: 'Popularity' },
  'SCORE_DESC': { pt: 'Nota Média', en: 'Average Score' },
  'START_DATE_DESC': { pt: 'Mais Recentes', en: 'Most Recent' },
  'TITLE_ROMAJI_DESC': { pt: 'A-Z', en: 'A-Z' },
};

// Função auxiliar para obter a tradução ou retornar o original
export const translate = (
  dictionary: { [key: string]: string },
  term: string,
  fallback?: string
): string => {
  if (!term) return '';
  // Retorna a tradução se ela existir e não for uma string vazia, senão retorna o termo original
  const translation = dictionary[term];
  return (translation && translation.trim() !== '') ? translation : (fallback || term);
};

export const listButtonConfig: { label: { pt: string; en: string }; status: ListStatus }[] = [
  { label: { pt: "Assistindo", en: "Watching" }, status: "WATCHING" },
  { label: { pt: "Concluído", en: "Completed" }, status: "COMPLETED" },
  { label: { pt: "Planejado", en: "Plan to Watch" }, status: "PLANNED" },
  { label: { pt: "Pausado", en: "Paused" }, status: "PAUSED" },
  { label: { pt: "Dropado", en: "Dropped" }, status: "DROPPED" },
  { label: { pt: "Ignorado", en: "Skipping" }, status: "SKIPPING" },
];

export const raffleModeTranslations: { [lang: string]: { [key: string]: string } } = {
  pt: {
    title: 'Modo Sorteio Ativado',
    description: 'Ajuste os filtros e clique no botão para sortear!',
    button: 'Sortear com estes filtros!',
    noResults: 'Nenhum anime encontrado com os filtros selecionados.',
    raffling: 'Sorteando...',
  },
  en: {
    title: 'Raffle Mode Activated',
    description: 'Adjust the filters and click the button to raffle!',
    button: 'Raffle with these filters!',
    noResults: 'No anime found with the selected filters.',
    raffling: 'Raffling...',
  }
};
// **NOVO**: Configuração de cores centralizada para status
export const statusConfig: Record<ListStatus, { buttonColor: string; textColor: string; borderColor: string; }> = {
  WATCHING:  { buttonColor: 'bg-primary',      textColor: 'text-black',      borderColor: 'border-primary' },
  COMPLETED: { buttonColor: 'bg-blue-500',     textColor: 'text-white',      borderColor: 'border-blue-500' },
  PLANNED:   { buttonColor: 'bg-yellow-500',   textColor: 'text-black',      borderColor: 'border-yellow-500' },
  DROPPED:   { buttonColor: 'bg-red-500',      textColor: 'text-white',      borderColor: 'border-red-500' },
  PAUSED:    { buttonColor: 'bg-accent',       textColor: 'text-white',      borderColor: 'border-accent' },
  SKIPPING:  { buttonColor: 'bg-gray-600',     textColor: 'text-white',      borderColor: 'border-gray-600' },
};
