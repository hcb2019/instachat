# ADR 006 — Inteligência de audiência assistida

## Decisão

O Radar analisa comentários em lotes de até 100 por meio de `AudienceIntelligenceProvider`. A implementação OpenAI usa Responses API, `store: false` e Structured Outputs; a implementação mock oferece a mesma interface para desenvolvimento e testes.

Antes do envio, cada comentário perde username e identificadores externos e recebe um alias temporário (`C0001`). O servidor mantém o mapa alias → evento somente durante o job. Insights sem evidência válida são descartados; uma evidência é exibida como “sinal inicial” e duas ou mais formam um insight consolidado.

## Controles

- Máximo configurável de 2.000 comentários e duas análises por proprietário/dia.
- Fingerprint SHA-256 impede repetir o mesmo conjunto e escopo.
- O webhook nunca invoca IA; ao atingir 20 pendências, apenas cria uma mensagem durável.
- O job diário sincroniza comentários e métricas, enfileira dados ainda não analisados e consome a fila.
- Modelo, prompt, tokens, duração e estado ficam registrados; falhas exibem apenas mensagem sanitizada.
- A IA não ativa automações, envia mensagens nem publica conteúdo. Sugestões geram apenas rascunhos.

## Consequências

A síntese de vários lotes adiciona custo, mas evita temas fragmentados. Métricas indisponíveis na Meta são tratadas individualmente e não impedem a importação de comentários. Dados individuais seguem a retenção de 180 dias; insights agregados podem permanecer sem evidências identificáveis.
