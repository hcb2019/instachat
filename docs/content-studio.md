# Estúdio de conteúdo

O Estúdio gera campanhas de Instagram para `@hernando.ia`: hook na tela, legendas, material de valor e automação de comentário → DM.

## O que a geração injeta

- Posicionamento: constrói com IA, fala de segurança e LGPD, mostra o processo e empacota um produto. Nunca chama o criador de "dev". Nunca inventa venda, cliente ou número.
- Seis táticas de storytelling do Super Cérebro (cena forte, emoção específica, quase desistir, antes/depois concreto, mudança interna, ponta solta).
- Voz PT-BR de áudio de WhatsApp, com amostras de ritmo. O modelo não copia as amostras.
- Blacklist: farda, quartel, Exército, rua/rota pessoal, clichês de coach e travessão.
- Entregável por tipo: prompt, checklist, guia ou página. A frase de topo do material é "você vai sair com X em Y minutos".

A geração do pacote tem dois passes de modelo (storytelling → humanização) e um sanitizador regex no fim, com QA local de coerência (mesma promessa em hook, legenda, keyword, DM e página).

## Ideias automáticas e limite da Instagram API

O Vortex usa **Instagram API with Instagram Login** (`graph.instagram.com`). Essa API:

- lê Reels, comentários, insights e mensagens da **conta conectada**;
- **não** oferece busca de hashtag, Explore, Reels de terceiros nem Business Discovery.

Hashtag Search e Business Discovery existem só na Instagram API with Facebook Login, com Página do Facebook e `Instagram Public Content Access`. O Vortex não troca de login por causa disso.

Por isso o modo "ideias automáticas" aproxima tendência assim:

1. Reels da própria conta, ranqueados por salvamentos, comentários e views (quando houver snapshot de insights);
2. pedidos e perguntas do Radar de audiência;
3. padrões de conteúdo de IA em alta, modelados para a voz do criador — nunca copiando texto, design ou nome de terceiro.

O aviso aparece na tela do Estúdio. Sem Instagram conectado, as ideias usam só os padrões (e o Radar, se existir).

## Automação

O fluxo que já funciona permanece: comentar a palavra-chave → webhook → DM com o link `/materiais/{slug}`. A palavra-chave precisa ser o verbo ou o objeto da promessa daquele Reel.
