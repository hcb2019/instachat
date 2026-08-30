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
  { "code": "/FLOWCHART", "description": "Organiza um processo em fluxograma.", "category": "Transformações" },
  { "code": "/STATISTICAL", "description": "Transforma dados em um visual informativo.", "category": "Transformações" },
  { "code": "/TIMELINE-INFOGRAFIC", "description": "Organiza fatos em uma linha do tempo visual.", "category": "Transformações" },
  { "code": "/TOGETHER", "description": "Reúne pessoas em uma mesma imagem.", "category": "Transformações" },
  {
    "code": "/4K",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/8K",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/ACTIONFIGURE",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/AESTHETIC",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/AIAVATAR",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/ALTLIFE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/ANCIENTEGYPT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/ANCIENTROME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/ANIME",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/ASTRONAUT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/AURORA",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/AUTUMN",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/AVATAR",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/BACKVIEW",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/BEARD",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/BEAUTY",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/BESTLOOK",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/BGBLUR",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGCINEMATIC",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGCITY",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGDEPTH",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGLUXURY",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGNATURE",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGPRO",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGREMOVE",
    "description": "Remove o fundo da imagem.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BGSTUDIO",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/BILLBOARDME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/BIOLUMINESCENT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/BIRDEYEVIEW",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/BIRTHDAYBALLOONS",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYCAKE",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYCARD",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYCOLLAGE",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYGLOW",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYKING",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYMEMORY",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYPARTY",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYPOSTER",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYQUEEN",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYREEL",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYSTORY",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BIRTHDAYWISH",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/BLOCKWORLD",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/BLURFIX",
    "description": "Reduz o desfoque da foto.",
    "category": "Transformações"
  },
  {
    "code": "/BOKEH",
    "description": "Desfoca o fundo, como em lente DSLR.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CAMERAREADY",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CANDID",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CANDIDLOOK",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/CANDLEWISH",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/CASUAL",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/CASUALSTYLE",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/CHARCOAL",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CHIBI",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/CHILDHOODME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/CINEMATIC",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/CITYBG",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/CLAY",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CLAYMATION",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CLEANBACKGROUND",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/CLONEME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/CLOSEUP",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/COLORFIX",
    "description": "Corrige as cores da imagem.",
    "category": "Luz e cor"
  },
  {
    "code": "/COLORGRADE",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/COMICBOOK",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/CROWDREMOVE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/CYBERPUNK",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/DARKTOBRIGHT",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/DATELOOK",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/DEBLUR",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/DENOISE",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/DEPTHLOOK",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/DESERT",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/DETAILUP",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/DIGITALTWIN",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/DISNEY",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/DISTRACTIONREMOVE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/DOF",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/DOUBLEEXPOSURE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/DP",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/DPREADY",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/DRAGON",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/DREAMLIFE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/DREAMYNATURE",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/DRESSUP",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/DRONEVIEW",
    "description": "Mostra a cena em visão aérea.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/DSLR",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/ELECTRIC",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/ELEGANT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/ELF",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/ETHNIC",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/EYEPOP",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/EYESHARP",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FACEFIX",
    "description": "Melhora detalhes e aparência do rosto.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FACEGLOW",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FANTASY",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/FASHION",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/FILMGRAIN",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/FIRE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/FISHEYE",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/FOG",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/FOGYFOREST",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/FOREST",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/FORMAL",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/FORMALSTYLE",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/FUNKO",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/FUTUREME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/GALAXY",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/GHIBLI",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/GIANTME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/GLASSES",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/GLITCH",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/GLOWUP",
    "description": "Eleva a aparência geral da imagem.",
    "category": "Transformações"
  },
  {
    "code": "/GOLDENHOUR",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/GOLDLUXURY",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/HAIRCHANGE",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAIRCOLOR",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAIRFIX",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAIRSTYLE",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HANDSOME",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/HAPPYBIRTHDAY",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/HDREAL",
    "description": "Melhora a qualidade e o realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/HOLOGRAM",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/HOLOGRAPHIC",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/HYPERREAL",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/IMAX",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/INKDRAWING",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/INSTAPRO",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/INSTAREADY",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/IRIDESCENT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/JAWLINE",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/JUNGLE",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/KEEPFACE",
    "description": "Preserva o rosto da pessoa.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/KEEPIDENTITY",
    "description": "Preserva a identidade da pessoa.",
    "category": "Transformações"
  },
  {
    "code": "/KEEPITREAL",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/LEGO",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/LENSFLARE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/LIGHTFIX",
    "description": "Corrige a iluminação.",
    "category": "Luz e cor"
  },
  {
    "code": "/LIGHTNING",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/LONGEXPOSURE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/LOWANGLE",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/LOWPOLY",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/LUXURY",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/LUXURYBG",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/LUXURYFIT",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/MACRO",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/MAGAZINECOVER",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/MAINCHARACTER",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MAKEITBETTER",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MAKEOVER",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MAKEUP",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/MANGA",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/MARS",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MEDIEVAL",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MESSYCLEAN",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MINIATURE",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/MINIMAL",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MINIME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MIRROR",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MIRRORSELFIE",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/MIST",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MISTY",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MISTYMOUNTAIN",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MODELLOOK",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MOODY",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/MOONLIGHT",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MOTIONBLUR",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MOUNTAIN",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/MOVIEVERSION",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MYERA",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/MYTHOLOGY",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/NATURAL",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/NATURALPHOTO",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/NATURECINEMA",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/NATUREPORTRAIT",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/NEON",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/NEWBG",
    "description": "Troca o fundo por um novo cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/NIGHTBG",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/NIGHTFIX",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/NINJA",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/NOIR",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/OBJECTREMOVE",
    "description": "Remove objetos indesejados.",
    "category": "Transformações"
  },
  {
    "code": "/OILPAINTING",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/OLDMONEY",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/OUTFIT",
    "description": "Troca ou cria uma nova roupa.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/OUTFITMATCH",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/OVERTHESHOULDER",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/PAPARAZZI",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PARALLELME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PARTYLOOK",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PARTYVIBES",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PARTYWEAR",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/PASSPORTPHOTO",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/PENCILSKETCH",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/PEOPLECLEAN",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PERFECTSHOT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PHOTOFIX",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PHOTOREALISTIC",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PHOTORESCUE",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PHOTOUPGRADE",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/PIXAR",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/PIXELART",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/POLAROID",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/PORTALME",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PORTRAITPRO",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/POSTER",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/POSTREADY",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/POVSHOT",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/PREMIUM",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/PRODUCTSHOT",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/PROFILE",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/PROSHOT",
    "description": "Dá acabamento de foto profissional.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/QUALITYMAX",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/QUIETLUXURY",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/RAIN",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/RAINYFOREST",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/REALISMMAX",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/REDCARPET",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/REELCOVER",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/REFLECTION",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/RETRO90S",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/RICHLOOK",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/RIMLIGHT",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/SAMURAI",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SELFIEFIX",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/SELFIEPRO",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/SHARPEN",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/SHARPREAL",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/SIDEVIEW",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/SILHOUETTE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SKINCLEAN",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SKINCLEAR",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SKINREAL",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SKINTONE",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SMILEFIX",
    "description": "Ajusta rosto, pele, cabelo ou detalhes pessoais.",
    "category": "Rosto e beleza"
  },
  {
    "code": "/SMOKE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SNOW",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SNOWSCENE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SNOWYFOREST",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SOFTLIGHT",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/SPACE",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SPRING",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/STATUE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/STORM",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/STORYREADY",
    "description": "Prepara uma imagem para perfil ou redes sociais.",
    "category": "Perfil e social"
  },
  {
    "code": "/STREETSNAP",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/STREETSTYLE",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/STUDIOBG",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/STYLEUP",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SUNRISE",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SUNSET",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SUNSETBEACH",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SUNSETGLOW",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/SURPRISEPARTY",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/SURREAL",
    "description": "Melhora a qualidade, nitidez ou realismo.",
    "category": "Melhorar foto"
  },
  {
    "code": "/SYNTHWAVE",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/THENNOW",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/TIMESPLIT",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/TOPVIEW",
    "description": "Mostra a cena vista de cima.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/TOY",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/TOYBOX",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/TRADITIONAL",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/TRAVELBG",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/UNDERWATER",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/VAPORWAVE",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/VIKING",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/VINTAGEFILM",
    "description": "Aplica estética, época ou efeito visual.",
    "category": "Estilos e efeitos"
  },
  {
    "code": "/VOLCANO",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/VOXEL",
    "description": "Transforma a imagem em estilo artístico ou personagem.",
    "category": "Arte e personagens"
  },
  {
    "code": "/WATERCOLOR",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/WEDDING",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/WEDDINGLOOK",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/WESTERN",
    "description": "Altera roupa, look ou linguagem de estilo.",
    "category": "Roupa e estilo"
  },
  {
    "code": "/WIDEANGLE",
    "description": "Muda enquadramento, lente ou perspectiva.",
    "category": "Câmera e ângulos"
  },
  {
    "code": "/WILDERNESS",
    "description": "Cria ou muda fundo, ambiente e cenário.",
    "category": "Fundos e cenários"
  },
  {
    "code": "/WINDOWLIGHT",
    "description": "Ajusta iluminação, atmosfera ou cores.",
    "category": "Luz e cor"
  },
  {
    "code": "/WIZARD",
    "description": "Cria uma variação visual ou transformação criativa.",
    "category": "Transformações"
  },
  {
    "code": "/Y2K",
    "description": "Aplica estética, época ou efeito visual.",
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
