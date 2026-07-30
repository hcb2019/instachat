# Reels agendados e automações antecipadas

## Limite atual da Meta

O endpoint usado pelo InstaChat para sincronizar mídia (`/me/media`) lista
objetos já publicados. Um Reel agendado diretamente no Instagram ou no Meta
Business Suite ainda não possui um objeto de mídia publicado que o InstaChat
possa selecionar.

Por isso, o aplicativo não deve fingir que consegue importar rascunhos ou
agendamentos da Meta. Também não deve ativar uma automação em um Reel parecido,
pois isso poderia responder no conteúdo errado.

## Caminho seguro previsto

A evolução recomendada é uma **automação aguardando publicação**:

1. o proprietário informa a data aproximada e cola uma frase única da legenda;
2. a automação fica em `aguardando Reel`, sem responder ninguém;
3. depois do horário previsto, o worker sincroniza os Reels publicados;
4. o sistema só vincula quando encontra exatamente um Reel novo contendo a
   frase informada;
5. a automação passa para `ativa` e registra qual mídia foi vinculada;
6. ausência ou ambiguidade mantém a automação parada e pede revisão humana.

Esse fluxo permite preparar palavra-chave e mensagens antes da publicação sem
exigir que o InstaChat publique o vídeo e sem correr o risco de usar o Reel
errado.

## Alternativa futura

Com `instagram_business_content_publish`, o InstaChat também pode receber o
arquivo de vídeo, criar um container e chamar `/media_publish` no horário
programado. Essa alternativa transforma o produto em um publicador de conteúdo
e exige armazenamento de vídeo, scheduler, monitoramento do processamento da
Meta e uma experiência própria de agendamento.
