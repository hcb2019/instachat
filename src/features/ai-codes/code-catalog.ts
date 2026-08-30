export type CodeCategory = typeof CODE_CATEGORIES[number];

export type AiCode = {
  code: string;
  description: string;
  category: CodeCategory;
};

export const CODE_CATEGORIES = [
  "Todos",
  "Melhorar foto",
  "Rosto e beleza",
  "Roupa e estilo",
  "Fundos e cenários",
  "Luz e cor",
  "Câmera e ângulos",
  "Arte e personagens",
  "Estilos e efeitos",
  "Perfil e social",
  "Transformações",
] as const;

export const CODE_CATALOG: AiCode[] = [
  { "code": "/FLOWCHART", "description": "Converte o conteúdo em um fluxograma visual claro.", "category": "Transformações" },
  { "code": "/STATISTICAL", "description": "Apresenta os dados como uma composição estatística visual.", "category": "Transformações" },
  { "code": "/TIMELINE-INFOGRAFIC", "description": "Monta um infográfico em formato de linha do tempo.", "category": "Transformações" },
  { "code": "/TOGETHER", "description": "Coloca as pessoas juntas na mesma composição fotográfica.", "category": "Transformações" },
  {
    "code": "/4K",
    "description": "Eleva a imagem para acabamento visual em resolução 4K.",
    "category": "Melhorar foto"
  },
  {
    "code": "/8K",
    "description": "Amplia a definição da imagem para qualidade visual 8K.",
    "category": "Melhorar foto"
  },
  {
    "code": "/ACTIONFIGURE",
    "description": "Transforma a pessoa em uma figura de ação colecionável.",
    "category": "Arte e personagens"
  },
  {
    "code": "/AESTHETIC",
    "description": "Aplica à imagem uma estética visual harmoniosa e marcante.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/AIAVATAR",
    "description": "Gera um avatar de inteligência artificial a partir da pessoa.",
    "category": "Perfil e social"
  },
  {
    "code": "/ALTLIFE",
    "description": "Retrata a pessoa vivendo uma versão alternativa de sua vida.",
    "category": "Transformações"
  },
  {
    "code": "/ANCIENTEGYPT",
    "description": "Transporta a cena para a estética do Egito Antigo.",
    "category": "Transformações"
  },
  {
    "code": "/ANCIENTROME",
    "description": "Reimagina a imagem no contexto visual da Roma Antiga.",
    "category": "Transformações"
  },
  {
    "code": "/ANIME",
    "description": "Redesenha a imagem com traços característicos de anime.",
    "category": "Arte e personagens"
  },
  {
    "code": "/ASTRONAUT",
    "description": "Mostra a pessoa caracterizada como astronauta.",
    "category": "Transformações"
  },
  {
    "code": "/AURORA",
    "description": "Adiciona uma aurora luminosa ao céu da composição.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/AUTUMN",
    "description": "Transforma o ambiente em uma cena típica de outono.",
    "category": "Transformações"
  },
  {
    "code": "/AVATAR",
    "description": "Cria uma representação visual da pessoa para uso como avatar.",
    "category": "Perfil e social"
  },
  {
    "code": "/BACKVIEW",
    "description": "Recompõe o retrato mostrando a pessoa vista de costas.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/BEARD",
    "description": "Adiciona ou modifica a barba no rosto retratado.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/BEAUTY",
    "description": "Realça visualmente a beleza natural da pessoa.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/BESTLOOK",
    "description": "Apresenta a pessoa em sua melhor versão visual.",
    "category": "Transformações"
  },
  {
    "code": "/BGBLUR",
    "description": "Desfoca apenas o fundo para destacar o assunto principal.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGCINEMATIC",
    "description": "Substitui o fundo por um cenário de linguagem cinematográfica.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGCITY",
    "description": "Posiciona o assunto diante de um cenário urbano.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGDEPTH",
    "description": "Cria profundidade visual entre o assunto e o fundo.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGLUXURY",
    "description": "Troca o fundo por um ambiente de aparência luxuosa.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGNATURE",
    "description": "Insere um fundo composto por elementos da natureza.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGPRO",
    "description": "Aplica um fundo com acabamento fotográfico profissional.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGREMOVE",
    "description": "Recorta o assunto e remove completamente o fundo original.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGSTUDIO",
    "description": "Coloca o assunto diante de um fundo típico de estúdio.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BILLBOARDME",
    "description": "Exibe a pessoa como destaque visual em um grande outdoor.",
    "category": "Transformações"
  },
  {
    "code": "/BIOLUMINESCENT",
    "description": "Adiciona elementos com brilho bioluminescente à cena.",
    "category": "Transformações"
  },
  {
    "code": "/BIRDEYEVIEW",
    "description": "Mostra a composição pela perspectiva aérea de um pássaro.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/BIRTHDAYBALLOONS",
    "description": "Decora a imagem de aniversário com balões festivos.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYCAKE",
    "description": "Inclui um bolo como elemento central da celebração de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYCARD",
    "description": "Transforma a foto em um cartão visual de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYCOLLAGE",
    "description": "Reúne fotos em uma colagem comemorativa de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYGLOW",
    "description": "Acrescenta um brilho festivo à cena de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYKING",
    "description": "Retrata o aniversariante como rei da comemoração.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYMEMORY",
    "description": "Cria uma lembrança visual afetiva do aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYPARTY",
    "description": "Converte a cena em uma animada festa de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYPOSTER",
    "description": "Monta um pôster comemorativo para o aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYQUEEN",
    "description": "Retrata a aniversariante como rainha da comemoração.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYREEL",
    "description": "Prepara um visual vertical para reel de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYSTORY",
    "description": "Formata a imagem como story comemorativo de aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYWISH",
    "description": "Cria uma mensagem visual de felicitação pelo aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BLOCKWORLD",
    "description": "Reconstrói a cena como um mundo formado por blocos.",
    "category": "Transformações"
  },
  {
    "code": "/BLURFIX",
    "description": "Corrige o desfoque indesejado presente na imagem.",
    "category": "Transformações"
  },
  {
    "code": "/BOKEH",
    "description": "Cria círculos de bokeh no fundo desfocado da foto.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CAMERAREADY",
    "description": "Dá ao retrato aparência pronta para ser fotografada.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CANDID",
    "description": "Recria o momento com aspecto espontâneo e não posado.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CANDIDLOOK",
    "description": "Deixa a pose e a expressão com naturalidade de flagrante.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CANDLEWISH",
    "description": "Mostra o instante de fazer um pedido diante das velas.",
    "category": "Transformações"
  },
  {
    "code": "/CASUAL",
    "description": "Veste a pessoa com um look informal e cotidiano.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/CASUALSTYLE",
    "description": "Aplica uma linguagem de moda casual à composição.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/CHARCOAL",
    "description": "Redesenha a imagem como ilustração feita a carvão.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CHIBI",
    "description": "Converte a pessoa em personagem chibi de proporções fofas.",
    "category": "Transformações"
  },
  {
    "code": "/CHILDHOODME",
    "description": "Reimagina a pessoa com a aparência de sua infância.",
    "category": "Transformações"
  },
  {
    "code": "/CINEMATIC",
    "description": "Confere à cena composição e atmosfera de cinema.",
    "category": "Transformações"
  },
  {
    "code": "/CITYBG",
    "description": "Troca o plano de fundo por uma paisagem de cidade.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/CLAY",
    "description": "Modela o assunto visualmente como uma escultura de argila.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CLAYMATION",
    "description": "Transforma a cena em animação quadro a quadro de massinha.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CLEANBACKGROUND",
    "description": "Simplifica e limpa os elementos visuais do fundo.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/CLONEME",
    "description": "Duplica a pessoa em versões clonadas na mesma cena.",
    "category": "Transformações"
  },
  {
    "code": "/CLOSEUP",
    "description": "Aproxima o enquadramento para um close do assunto.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/COLORFIX",
    "description": "Corrige desequilíbrios e desvios de cor na imagem.",
    "category": "Luz e cor"
  },
  {
    "code": "/COLORGRADE",
    "description": "Aplica uma gradação de cores com acabamento autoral.",
    "category": "Luz e cor"
  },
  {
    "code": "/COMICBOOK",
    "description": "Transforma a cena em uma página ilustrada de quadrinhos.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CROWDREMOVE",
    "description": "Remove a multidão presente ao redor do assunto principal.",
    "category": "Transformações"
  },
  {
    "code": "/CYBERPUNK",
    "description": "Reestiliza a imagem com visual futurista cyberpunk.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/DARKTOBRIGHT",
    "description": "Clareia uma imagem escura preservando seus detalhes visuais.",
    "category": "Luz e cor"
  },
  {
    "code": "/DATELOOK",
    "description": "Monta um visual apropriado para um encontro romântico.",
    "category": "Transformações"
  },
  {
    "code": "/DEBLUR",
    "description": "Recupera a nitidez perdida por borrões na fotografia.",
    "category": "Melhorar foto"
  },
  {
    "code": "/DENOISE",
    "description": "Reduz o ruído e a granulação digital da imagem.",
    "category": "Melhorar foto"
  },
  {
    "code": "/DEPTHLOOK",
    "description": "Intensifica a sensação de profundidade no retrato.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/DESERT",
    "description": "Transporta o assunto para uma paisagem desértica.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/DETAILUP",
    "description": "Evidencia pequenos detalhes e texturas da fotografia.",
    "category": "Melhorar foto"
  },
  {
    "code": "/DIGITALTWIN",
    "description": "Cria um gêmeo digital visualmente semelhante à pessoa.",
    "category": "Transformações"
  },
  {
    "code": "/DISNEY",
    "description": "Redesenha a pessoa como personagem de animação Disney.",
    "category": "Arte e personagens"
  },
  {
    "code": "/DISTRACTIONREMOVE",
    "description": "Apaga elementos que desviam a atenção do foco principal.",
    "category": "Transformações"
  },
  {
    "code": "/DOF",
    "description": "Aplica profundidade de campo fotográfica à composição.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/DOUBLEEXPOSURE",
    "description": "Combina duas imagens em um efeito de dupla exposição.",
    "category": "Transformações"
  },
  {
    "code": "/DP",
    "description": "Recorta um retrato adequado para foto de exibição do perfil.",
    "category": "Perfil e social"
  },
  {
    "code": "/DPREADY",
    "description": "Finaliza a imagem para uso imediato como foto de perfil.",
    "category": "Perfil e social"
  },
  {
    "code": "/DRAGON",
    "description": "Insere um dragão como elemento fantástico da cena.",
    "category": "Transformações"
  },
  {
    "code": "/DREAMLIFE",
    "description": "Representa visualmente a vida dos sonhos da pessoa.",
    "category": "Transformações"
  },
  {
    "code": "/DREAMYNATURE",
    "description": "Cria um cenário natural com atmosfera de sonho.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/DRESSUP",
    "description": "Troca a roupa da pessoa por uma produção mais elaborada.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/DRONEVIEW",
    "description": "Reenquadra a cena como uma tomada capturada por drone.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/DSLR",
    "description": "Simula o acabamento óptico de uma câmera DSLR.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/ELECTRIC",
    "description": "Adiciona energia e efeitos elétricos à composição.",
    "category": "Transformações"
  },
  {
    "code": "/ELEGANT",
    "description": "Refina a cena com aparência visual elegante.",
    "category": "Transformações"
  },
  {
    "code": "/ELF",
    "description": "Transforma a pessoa em um personagem élfico.",
    "category": "Transformações"
  },
  {
    "code": "/ETHNIC",
    "description": "Aplica vestimentas inspiradas em uma identidade étnica.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/EYEPOP",
    "description": "Realça os olhos para que ganhem destaque no rosto.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/EYESHARP",
    "description": "Aumenta a definição e a nitidez visual dos olhos.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FACEFIX",
    "description": "Corrige imperfeições visuais perceptíveis no rosto.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FACEGLOW",
    "description": "Adiciona luminosidade saudável à aparência facial.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FANTASY",
    "description": "Transporta a imagem para um universo visual de fantasia.",
    "category": "Transformações"
  },
  {
    "code": "/FASHION",
    "description": "Produz a pessoa com estética de editorial de moda.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/FILMGRAIN",
    "description": "Acrescenta granulação característica de filme fotográfico.",
    "category": "Luz e cor"
  },
  {
    "code": "/FIRE",
    "description": "Envolve a cena com chamas e efeitos visuais de fogo.",
    "category": "Transformações"
  },
  {
    "code": "/FISHEYE",
    "description": "Aplica a distorção curva de uma lente olho de peixe.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FOG",
    "description": "Adiciona uma camada de neblina à composição.",
    "category": "Transformações"
  },
  {
    "code": "/FOGYFOREST",
    "description": "Coloca o assunto em uma floresta coberta de nevoeiro.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/FOREST",
    "description": "Substitui o cenário por uma paisagem de floresta.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/FORMAL",
    "description": "Veste a pessoa com traje formal apropriado à ocasião.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/FORMALSTYLE",
    "description": "Adota uma linguagem visual de moda clássica e formal.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/FUNKO",
    "description": "Converte a pessoa em boneco colecionável de estilo Funko.",
    "category": "Arte e personagens"
  },
  {
    "code": "/FUTUREME",
    "description": "Imagina visualmente a aparência futura da pessoa.",
    "category": "Transformações"
  },
  {
    "code": "/GALAXY",
    "description": "Integra galáxias e elementos cósmicos à imagem.",
    "category": "Transformações"
  },
  {
    "code": "/GHIBLI",
    "description": "Redesenha a cena com atmosfera de animação do Studio Ghibli.",
    "category": "Arte e personagens"
  },
  {
    "code": "/GIANTME",
    "description": "Transforma a pessoa em gigante dentro do ambiente.",
    "category": "Transformações"
  },
  {
    "code": "/GLASSES",
    "description": "Adiciona óculos ao rosto retratado.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/GLITCH",
    "description": "Insere falhas digitais e distorções de efeito glitch.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/GLOWUP",
    "description": "Revela uma versão renovada e visualmente mais cuidada da pessoa.",
    "category": "Transformações"
  },
  {
    "code": "/GOLDENHOUR",
    "description": "Banhe a cena com a luz quente da hora dourada.",
    "category": "Luz e cor"
  },
  {
    "code": "/GOLDLUXURY",
    "description": "Aplica uma estética luxuosa dominada por tons dourados.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/HAIRCHANGE",
    "description": "Altera visualmente o cabelo da pessoa.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAIRCOLOR",
    "description": "Troca a cor dos cabelos retratados.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAIRFIX",
    "description": "Corrige fios desalinhados e falhas visuais no cabelo.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAIRSTYLE",
    "description": "Experimenta um novo penteado na pessoa.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HANDSOME",
    "description": "Realça traços que conferem aparência mais bonita ao homem.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAPPYBIRTHDAY",
    "description": "Cria uma composição alegre com tema de feliz aniversário.",
    "category": "Melhorar foto"
  },
  {
    "code": "/HDREAL",
    "description": "Aumenta a definição mantendo uma aparência fotográfica real.",
    "category": "Melhorar foto"
  },
  {
    "code": "/HOLOGRAM",
    "description": "Projeta o assunto como um holograma luminoso.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/HOLOGRAPHIC",
    "description": "Reveste a imagem com reflexos cromáticos holográficos.",
    "category": "Transformações"
  },
  {
    "code": "/HYPERREAL",
    "description": "Converte a cena para um acabamento hiper-realista.",
    "category": "Melhorar foto"
  },
  {
    "code": "/IMAX",
    "description": "Amplia a cena com escala e enquadramento de experiência IMAX.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/INKDRAWING",
    "description": "Transforma a fotografia em desenho feito com tinta.",
    "category": "Arte e personagens"
  },
  {
    "code": "/INSTAPRO",
    "description": "Dá à postagem um acabamento profissional para Instagram.",
    "category": "Perfil e social"
  },
  {
    "code": "/INSTAREADY",
    "description": "Ajusta a imagem para publicação imediata no Instagram.",
    "category": "Perfil e social"
  },
  {
    "code": "/IRIDESCENT",
    "description": "Aplica reflexos iridescentes que mudam conforme a luz.",
    "category": "Transformações"
  },
  {
    "code": "/JAWLINE",
    "description": "Define visualmente o contorno da mandíbula.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/JUNGLE",
    "description": "Posiciona o assunto em um cenário de selva densa.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/KEEPFACE",
    "description": "Mantém inalteradas as características visuais do rosto.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/KEEPIDENTITY",
    "description": "Preserva a identidade reconhecível da pessoa na edição.",
    "category": "Transformações"
  },
  {
    "code": "/KEEPITREAL",
    "description": "Mantém o resultado com aparência natural e crível.",
    "category": "Melhorar foto"
  },
  {
    "code": "/LEGO",
    "description": "Reconstrói a imagem com peças e personagens no estilo LEGO.",
    "category": "Arte e personagens"
  },
  {
    "code": "/LENSFLARE",
    "description": "Adiciona reflexos luminosos típicos de lente fotográfica.",
    "category": "Transformações"
  },
  {
    "code": "/LIGHTFIX",
    "description": "Corrige problemas de exposição e iluminação da foto.",
    "category": "Luz e cor"
  },
  {
    "code": "/LIGHTNING",
    "description": "Insere relâmpagos iluminando dramaticamente a cena.",
    "category": "Luz e cor"
  },
  {
    "code": "/LONGEXPOSURE",
    "description": "Simula rastros luminosos de uma fotografia de longa exposição.",
    "category": "Transformações"
  },
  {
    "code": "/LOWANGLE",
    "description": "Mostra o assunto a partir de um ângulo baixo.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/LOWPOLY",
    "description": "Reduz as formas a uma estética geométrica low poly.",
    "category": "Arte e personagens"
  },
  {
    "code": "/LUXURY",
    "description": "Eleva a composição com sinais visuais de luxo.",
    "category": "Transformações"
  },
  {
    "code": "/LUXURYBG",
    "description": "Cria um plano de fundo com ambiente sofisticado e luxuoso.",
    "category": "Transformações"
  },
  {
    "code": "/LUXURYFIT",
    "description": "Veste a pessoa com uma produção de moda luxuosa.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/MACRO",
    "description": "Aproxima detalhes minúsculos em um enquadramento macro.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/MAGAZINECOVER",
    "description": "Transforma o retrato na capa de uma revista.",
    "category": "Perfil e social"
  },
  {
    "code": "/MAINCHARACTER",
    "description": "Coloca a pessoa em evidência como protagonista da cena.",
    "category": "Transformações"
  },
  {
    "code": "/MAKEITBETTER",
    "description": "Aprimora o resultado visual geral sem mudar seu tema.",
    "category": "Transformações"
  },
  {
    "code": "/MAKEOVER",
    "description": "Renova por completo a aparência visual da pessoa.",
    "category": "Transformações"
  },
  {
    "code": "/MAKEUP",
    "description": "Aplica maquiagem ao rosto retratado.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/MANGA",
    "description": "Redesenha a imagem com traços gráficos de mangá.",
    "category": "Arte e personagens"
  },
  {
    "code": "/MARS",
    "description": "Transporta a cena para a superfície do planeta Marte.",
    "category": "Transformações"
  },
  {
    "code": "/MEDIEVAL",
    "description": "Reimagina pessoas e ambiente em uma época medieval.",
    "category": "Transformações"
  },
  {
    "code": "/MESSYCLEAN",
    "description": "Organiza visualmente uma cena que está bagunçada.",
    "category": "Transformações"
  },
  {
    "code": "/MINIATURE",
    "description": "Converte o assunto em uma miniatura detalhada.",
    "category": "Arte e personagens"
  },
  {
    "code": "/MINIMAL",
    "description": "Simplifica a composição para uma estética minimalista.",
    "category": "Transformações"
  },
  {
    "code": "/MINIME",
    "description": "Cria uma versão pequena da própria pessoa na cena.",
    "category": "Transformações"
  },
  {
    "code": "/MIRROR",
    "description": "Produz uma composição baseada em reflexo de espelho.",
    "category": "Transformações"
  },
  {
    "code": "/MIRRORSELFIE",
    "description": "Recria o retrato como uma selfie diante do espelho.",
    "category": "Perfil e social"
  },
  {
    "code": "/MIST",
    "description": "Espalha uma névoa fina e suave pelo ambiente.",
    "category": "Transformações"
  },
  {
    "code": "/MISTY",
    "description": "Envolve o cenário em uma atmosfera úmida e enevoada.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MISTYMOUNTAIN",
    "description": "Cria uma paisagem de montanhas cobertas por névoa.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MODELLOOK",
    "description": "Dá à pessoa postura e aparência de modelo fotográfico.",
    "category": "Transformações"
  },
  {
    "code": "/MOODY",
    "description": "Aplica luz e cores para uma atmosfera intensa e melancólica.",
    "category": "Luz e cor"
  },
  {
    "code": "/MOONLIGHT",
    "description": "Ilumina o ambiente com luz noturna de luar.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MOTIONBLUR",
    "description": "Simula borrão de movimento nos elementos em ação.",
    "category": "Transformações"
  },
  {
    "code": "/MOUNTAIN",
    "description": "Coloca o assunto diante de uma paisagem montanhosa.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MOVIEVERSION",
    "description": "Reimagina a imagem como uma cena de versão cinematográfica.",
    "category": "Transformações"
  },
  {
    "code": "/MYERA",
    "description": "Representa a pessoa na época visual que mais combina com ela.",
    "category": "Transformações"
  },
  {
    "code": "/MYTHOLOGY",
    "description": "Insere a pessoa em uma representação de mitologia.",
    "category": "Transformações"
  },
  {
    "code": "/NATURAL",
    "description": "Deixa a aparência geral mais natural e sem artificialidade.",
    "category": "Transformações"
  },
  {
    "code": "/NATURALPHOTO",
    "description": "Converte o resultado em uma fotografia espontânea e realista.",
    "category": "Transformações"
  },
  {
    "code": "/NATURECINEMA",
    "description": "Transforma a paisagem natural em cenário cinematográfico.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/NATUREPORTRAIT",
    "description": "Compõe um retrato integrado a um ambiente natural.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/NEON",
    "description": "Ilumina a cena com luzes coloridas de neon.",
    "category": "Luz e cor"
  },
  {
    "code": "/NEWBG",
    "description": "Substitui o fundo original por um cenário novo.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/NIGHTBG",
    "description": "Troca o ambiente por um plano de fundo noturno.",
    "category": "Transformações"
  },
  {
    "code": "/NIGHTFIX",
    "description": "Recupera luz, cor e detalhes de uma fotografia noturna.",
    "category": "Luz e cor"
  },
  {
    "code": "/NINJA",
    "description": "Caracteriza a pessoa visualmente como ninja.",
    "category": "Transformações"
  },
  {
    "code": "/NOIR",
    "description": "Aplica contraste e sombras de estética cinematográfica noir.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/OBJECTREMOVE",
    "description": "Apaga um objeto indesejado da composição.",
    "category": "Transformações"
  },
  {
    "code": "/OILPAINTING",
    "description": "Converte a fotografia em pintura feita a óleo.",
    "category": "Arte e personagens"
  },
  {
    "code": "/OLDMONEY",
    "description": "Adota a estética clássica e discreta do estilo old money.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/OUTFIT",
    "description": "Substitui a roupa atual por um novo conjunto.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/OUTFITMATCH",
    "description": "Coordena as peças para formar um look visualmente combinado.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/OVERTHESHOULDER",
    "description": "Enquadra a cena por cima do ombro de uma pessoa.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/PAPARAZZI",
    "description": "Simula um flagrante fotográfico feito por paparazzi.",
    "category": "Transformações"
  },
  {
    "code": "/PARALLELME",
    "description": "Cria uma versão da pessoa em uma realidade paralela.",
    "category": "Transformações"
  },
  {
    "code": "/PARTYLOOK",
    "description": "Produz a pessoa com um visual pronto para festa.",
    "category": "Transformações"
  },
  {
    "code": "/PARTYVIBES",
    "description": "Adiciona à cena a energia visual de uma celebração.",
    "category": "Transformações"
  },
  {
    "code": "/PARTYWEAR",
    "description": "Veste a pessoa com roupa adequada para uma festa.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/PASSPORTPHOTO",
    "description": "Formata o rosto como fotografia formal de passaporte.",
    "category": "Perfil e social"
  },
  {
    "code": "/PENCILSKETCH",
    "description": "Redesenha a imagem como esboço feito a lápis.",
    "category": "Arte e personagens"
  },
  {
    "code": "/PEOPLECLEAN",
    "description": "Remove pessoas indesejadas que poluem a composição.",
    "category": "Transformações"
  },
  {
    "code": "/PERFECTSHOT",
    "description": "Refina enquadramento e aparência para uma foto ideal.",
    "category": "Transformações"
  },
  {
    "code": "/PHOTOFIX",
    "description": "Corrige defeitos gerais visíveis na fotografia.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PHOTOREALISTIC",
    "description": "Faz a imagem parecer uma fotografia real.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PHOTORESCUE",
    "description": "Restaura visualmente uma foto danificada ou degradada.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PHOTOUPGRADE",
    "description": "Atualiza a fotografia com acabamento visual superior.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PIXAR",
    "description": "Transforma a pessoa em personagem de animação estilo Pixar.",
    "category": "Arte e personagens"
  },
  {
    "code": "/PIXELART",
    "description": "Reconstrói a imagem com pixels de arte digital retrô.",
    "category": "Arte e personagens"
  },
  {
    "code": "/POLAROID",
    "description": "Emula cores e moldura de uma fotografia Polaroid.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/PORTALME",
    "description": "Coloca a pessoa atravessando um portal visual fantástico.",
    "category": "Transformações"
  },
  {
    "code": "/PORTRAITPRO",
    "description": "Refina o enquadramento para um retrato profissional.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/POSTER",
    "description": "Organiza a imagem como um pôster gráfico.",
    "category": "Perfil e social"
  },
  {
    "code": "/POSTREADY",
    "description": "Finaliza proporção e acabamento para publicação em feed.",
    "category": "Perfil e social"
  },
  {
    "code": "/POVSHOT",
    "description": "Reenquadra a cena pela perspectiva em primeira pessoa.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/PREMIUM",
    "description": "Dá à composição um acabamento visual de padrão premium.",
    "category": "Transformações"
  },
  {
    "code": "/PRODUCTSHOT",
    "description": "Cria uma fotografia comercial focada no produto.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/PROFILE",
    "description": "Prepara um retrato identificável para perfil digital.",
    "category": "Perfil e social"
  },
  {
    "code": "/PROSHOT",
    "description": "Simula uma foto capturada em sessão profissional.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/QUALITYMAX",
    "description": "Maximiza definição, limpeza e acabamento da imagem.",
    "category": "Melhorar foto"
  },
  {
    "code": "/QUIETLUXURY",
    "description": "Aplica a sofisticação discreta da estética quiet luxury.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/RAIN",
    "description": "Adiciona chuva visível e atmosfera de tempo chuvoso.",
    "category": "Transformações"
  },
  {
    "code": "/RAINYFOREST",
    "description": "Cria um cenário de floresta sob a chuva.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/REALISMMAX",
    "description": "Leva texturas e detalhes ao máximo de realismo visual.",
    "category": "Melhorar foto"
  },
  {
    "code": "/REDCARPET",
    "description": "Coloca a pessoa em uma aparição de tapete vermelho.",
    "category": "Transformações"
  },
  {
    "code": "/REELCOVER",
    "description": "Monta uma capa vertical chamativa para reel.",
    "category": "Perfil e social"
  },
  {
    "code": "/REFLECTION",
    "description": "Acrescenta um reflexo coerente ao assunto da imagem.",
    "category": "Transformações"
  },
  {
    "code": "/RETRO90S",
    "description": "Reestiliza a cena com referências visuais dos anos 1990.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/RICHLOOK",
    "description": "Confere à pessoa uma aparência visual rica e sofisticada.",
    "category": "Transformações"
  },
  {
    "code": "/RIMLIGHT",
    "description": "Contorna o assunto com uma luz de recorte.",
    "category": "Luz e cor"
  },
  {
    "code": "/SAMURAI",
    "description": "Caracteriza a pessoa como um guerreiro samurai.",
    "category": "Transformações"
  },
  {
    "code": "/SELFIEFIX",
    "description": "Corrige problemas visuais comuns de uma selfie.",
    "category": "Perfil e social"
  },
  {
    "code": "/SELFIEPRO",
    "description": "Transforma a selfie em um retrato de acabamento profissional.",
    "category": "Perfil e social"
  },
  {
    "code": "/SHARPEN",
    "description": "Aumenta a nitidez dos contornos e detalhes da foto.",
    "category": "Melhorar foto"
  },
  {
    "code": "/SHARPREAL",
    "description": "Reforça a definição sem perder o aspecto realista.",
    "category": "Melhorar foto"
  },
  {
    "code": "/SIDEVIEW",
    "description": "Reenquadra a pessoa ou objeto em vista lateral.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/SILHOUETTE",
    "description": "Transforma o assunto em uma silhueta destacada contra o fundo.",
    "category": "Transformações"
  },
  {
    "code": "/SKINCLEAN",
    "description": "Limpa visualmente marcas e impurezas aparentes da pele.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SKINCLEAR",
    "description": "Deixa a pele mais uniforme e livre de obstruções visuais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SKINREAL",
    "description": "Preserva poros e textura para uma pele de aspecto real.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SKINTONE",
    "description": "Equilibra o tom de pele na imagem.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SMILEFIX",
    "description": "Corrige visualmente o sorriso da pessoa.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SMOKE",
    "description": "Adiciona fumaça volumétrica ao redor do assunto.",
    "category": "Transformações"
  },
  {
    "code": "/SNOW",
    "description": "Inclui neve caindo sobre a composição.",
    "category": "Transformações"
  },
  {
    "code": "/SNOWSCENE",
    "description": "Transforma o ambiente em uma cena coberta de neve.",
    "category": "Transformações"
  },
  {
    "code": "/SNOWYFOREST",
    "description": "Posiciona o assunto em uma floresta nevada.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SOFTLIGHT",
    "description": "Ilumina o retrato com luz suave e difusa.",
    "category": "Luz e cor"
  },
  {
    "code": "/SPACE",
    "description": "Transporta o fundo para o espaço sideral.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SPRING",
    "description": "Converte a paisagem para uma atmosfera florida de primavera.",
    "category": "Transformações"
  },
  {
    "code": "/STATUE",
    "description": "Transforma a pessoa ou objeto em uma estátua.",
    "category": "Transformações"
  },
  {
    "code": "/STORM",
    "description": "Cria ao fundo um clima visual de tempestade.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/STORYREADY",
    "description": "Ajusta a composição vertical para publicação em stories.",
    "category": "Perfil e social"
  },
  {
    "code": "/STREETSNAP",
    "description": "Simula um registro espontâneo feito na rua.",
    "category": "Transformações"
  },
  {
    "code": "/STREETSTYLE",
    "description": "Produz a pessoa com visual inspirado na moda urbana.",
    "category": "Transformações"
  },
  {
    "code": "/STUDIOBG",
    "description": "Substitui o cenário por um fundo fotográfico de estúdio.",
    "category": "Transformações"
  },
  {
    "code": "/STYLEUP",
    "description": "Atualiza a aparência com uma produção mais estilosa.",
    "category": "Transformações"
  },
  {
    "code": "/SUNRISE",
    "description": "Cria um cenário iluminado pelo nascer do sol.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SUNSET",
    "description": "Transforma o ambiente em uma paisagem ao pôr do sol.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SUNSETBEACH",
    "description": "Coloca o assunto em uma praia durante o entardecer.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SUNSETGLOW",
    "description": "Adiciona o brilho quente característico do fim de tarde.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SURPRISEPARTY",
    "description": "Monta uma cena visual de festa surpresa.",
    "category": "Transformações"
  },
  {
    "code": "/SURREAL",
    "description": "Reimagina a foto com elementos impossíveis e surreais.",
    "category": "Melhorar foto"
  },
  {
    "code": "/SYNTHWAVE",
    "description": "Aplica cores neon e horizonte retrô da estética synthwave.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/THENNOW",
    "description": "Compara visualmente a pessoa ou cena entre antes e agora.",
    "category": "Transformações"
  },
  {
    "code": "/TIMESPLIT",
    "description": "Divide a composição para mostrar dois períodos diferentes.",
    "category": "Transformações"
  },
  {
    "code": "/TOPVIEW",
    "description": "Reenquadra a cena diretamente de cima.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/TOY",
    "description": "Transforma o assunto em uma versão de brinquedo.",
    "category": "Arte e personagens"
  },
  {
    "code": "/TOYBOX",
    "description": "Apresenta a pessoa como brinquedo dentro de uma caixa.",
    "category": "Arte e personagens"
  },
  {
    "code": "/TRADITIONAL",
    "description": "Veste a pessoa com traje de aparência tradicional.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/TRAVELBG",
    "description": "Troca o fundo por um destino visual de viagem.",
    "category": "Transformações"
  },
  {
    "code": "/UNDERWATER",
    "description": "Submerge o assunto em um cenário debaixo d’água.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/VAPORWAVE",
    "description": "Aplica gradientes, estátuas e nostalgia da estética vaporwave.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/VIKING",
    "description": "Caracteriza a pessoa como um guerreiro viking.",
    "category": "Transformações"
  },
  {
    "code": "/VINTAGEFILM",
    "description": "Simula cores e textura de um filme fotográfico antigo.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/VOLCANO",
    "description": "Coloca ao fundo uma paisagem dominada por vulcão.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/VOXEL",
    "description": "Reconstrói a cena com formas tridimensionais em voxels.",
    "category": "Arte e personagens"
  },
  {
    "code": "/WATERCOLOR",
    "description": "Converte a imagem em pintura de aquarela translúcida.",
    "category": "Luz e cor"
  },
  {
    "code": "/WEDDING",
    "description": "Produz a pessoa com traje e contexto visual de casamento.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/WEDDINGLOOK",
    "description": "Cria um look completo para uma celebração de casamento.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/WESTERN",
    "description": "Veste a pessoa com referências do estilo faroeste.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/WIDEANGLE",
    "description": "Amplia o campo de visão com perspectiva de grande angular.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/WILDERNESS",
    "description": "Insere o assunto em uma paisagem natural selvagem.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/WINDOWLIGHT",
    "description": "Ilumina a pessoa com luz natural vinda de uma janela.",
    "category": "Luz e cor"
  },
  {
    "code": "/WIZARD",
    "description": "Transforma a pessoa em um personagem mago.",
    "category": "Transformações"
  },
  {
    "code": "/Y2K",
    "description": "Reestiliza a imagem com a estética pop do início dos anos 2000.",
    "category": "Estilos e efeitos"
  }
] as AiCode[];

export function filterCodeCatalog(catalog: readonly AiCode[], { query, category }: { query: string; category: CodeCategory }): AiCode[] {
  const normalized = query.trim().toLocaleLowerCase("pt-BR").replace(/^\//, "");
  return catalog.filter((item) => {
    const matchesCategory = category === "Todos" || item.category === category;
    const haystack = `${item.code.slice(1)} ${item.description} ${item.category}`.toLocaleLowerCase("pt-BR");
    return matchesCategory && (!normalized || haystack.includes(normalized));
  });
}
