// src/lib/translations.ts

export const staffRoleTranslations: { [key: string]: string } = {
  'Director': 'Diretor(a)',
  'Series Director': 'Diretor(a) da Série',
  'Episode Director': 'Diretor(a) de Episódio',
  'Original Creator': 'Criador(a) Original',
  'Chief Director': 'Diretor(a) Chefe',
  'Screenplay': 'Composição de Série',
  'Script': 'Roteiro',
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
  'Executive Producer': 'Produtor(a) Executivo(a)',
  'Director of Photography': 'Diretor(a) de Fotografia',
  'Editing': 'Edição',
  'Storyboard': 'Storyboard',
  'Insert Song Performance': 'Intérprete da Música de Inserção' // Adicionado para cobrir casos como em "Gi(a)rlish Number"
};

// Ordena as chaves da mais longa para a mais curta para garantir que "Series Director" seja encontrado antes de "Director"
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

export const tagCategoryTranslations: { [key: string]: string } = {
  'Demographic': 'Demografia',
  'Cast-Main Cast': 'Elenco Principal', // Mais direto
  'Cast-Traits': 'Traços de Personagem', // Mais descritivo
  'Setting': 'Ambientação',
  'Setting-Scene': 'Cenário Específico', // Diferencia de "Ambientação" geral
  'Setting-Time': 'Época/Período', // Mais preciso que "Tempo"
  'Setting-Universe': 'Universo',
  'Technical': 'Aspectos Técnicos', // Mais completo que "Técnica"
  'Theme-Action': 'Ação',
  'Theme-Arts': 'Artes',
  'Theme-Arts-Music': 'Música',
  'Theme-Comedy': 'Comédia',
  'Theme-Drama': 'Drama',
  'Theme-Fantasy': 'Fantasia',
  'Theme-Game': 'Jogos',
  'Theme-Game-Card & Board Game': 'Jogos de Cartas e Tabuleiro',
  'Theme-Game-Sport': 'Esportes', // Simplificado
  'Theme-Other': 'Outros Temas',
  'Theme-Other-Organisations': 'Organizações', // Simplificado
  'Theme-Other-Vehicle': 'Veículos', // Simplificado
  'Theme-Romance': 'Romance',
  'Theme-Sci-Fi': 'Ficção Científica',
  'Theme-Sci-Fi-Mecha': 'Mecha', // Simplificado
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
  'Mahou Shoujo': 'Mahou Shoujo', // Termo consagrado, melhor que "Garota Mágica"
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
    'Estranged Family': 'Laços Familiares Rompidos', // Mais evocativo que "Família Distante"
    'Female Protagonist': 'Protagonista Feminina',
    'Male Protagonist': 'Protagonista Masculino',
    'Primarily Adult Cast': 'Elenco-Adulto', // Mais preciso
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
    'Crossdressing': 'Cross-dressing', // Termo neutro e mais usado que "Transvestismo" neste contexto
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
    'Maids': 'Maids', // O termo da trope é mais forte que a tradução literal "Empregadas"
    'Mermaid': 'Sereia',
    'Monster Boy': 'Garoto Monstruoso', // Soa mais natural que "Garoto Monstro"
    'Monster Girl': 'Garota Monstruosa', // Soa mais natural que "Garota Monstro"
    'Nekomimi': 'Nekomimi',
    'Ninja': 'Ninja',
    'Naked': 'Nudez',
    'Nun': 'Freira',
    'Office Lady': 'Office Lady (OL)', // O termo da trope é mais usado
    'Oiran': 'Oiran',
    'Ojou-sama': 'Ojou-sama',
    'Orphan': 'Órfão', // Correção de acento
    'Pirates': 'Piratas',
    'Robots': 'Robôs',
    'Samurai': 'Samurai',
    'Shrine Maidens': 'Miko (Sacerdotisa)', // "Miko" é o termo consagrado
    'Skeleton': 'Esqueleto',
    'Succubus': 'Súcubo',
    'Tanned Skin': 'Pele Bronzeada',
    'Teacher': 'Professor(a)',
    'Tomboy': 'Tomboy', // Termo mais direto e comum que "Menina Moleca"
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
    'Coastal': 'Litoral', // Mais comum que "Costeiro"
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
    'Curses': 'Maldições', // Plural
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
    'Cheerleading': 'Líderes de Torcida', // Mais específico
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
    'Found Family': 'Família por Escolha', // Mais evocativo
    'Gambling': 'Jogos de Azar',
    'Gender Bending': 'Troca de Gênero', // Mais claro no contexto de fantasia/comédia
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
    'Proxy Battle': 'Batalha por Procuração', // Tradução mais correta
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
    'Female Harem': 'Harém', // Termo padrão para harém com protagonista feminina
    'Heterosexual': 'Heterossexual',
    'Love Triangle': 'Triângulo Amoroso',
    'Male Harem': 'Harém Invertido', // "Harém Masculino" é redundante, "Harém" já implica isso
    'Matchmaking': 'Agenciamento de Casais', // Diferente de "Casamento Arranjado"
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