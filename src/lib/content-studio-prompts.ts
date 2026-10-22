import { CREATOR_POSITIONING, CREATOR_VOICE, DELIVERABLE_TYPE_BRIEF, HOOK_FORMULAS, STORYTELLING_TACTICS } from "@/lib/creator-identity";
import { HUMANIZER_PROMPT } from "@/lib/humanizer";
import type { ContentGoal, DeliverableType } from "@/types/content-studio";

export const CONTENT_PROMPT_VERSION = "content-studio-v6-hernando-storytelling";

const CAPTION_RULES = `
Legenda (obrigatório):
- Começa exatamente com o @ informado, depois linha em branco, depois o hook.
- Os ~125 primeiros caracteres (o preview do Instagram antes de "mais") precisam carregar o hook. Não gaste essa janela com saudação ou contexto.
- Corpo: 1 ou 2 táticas de storytelling, em parágrafos curtos, como áudio de WhatsApp.
- CTA isolado numa linha só, no tom "comenta PALAVRA que eu te mando no direct". Nunca "link na bio".
- Hashtags são opcionais. Se usar, no máximo 5, no final da legenda completa, só se ajudarem a descoberta. Prefira zero a hashtag genérica.
- Três tamanhos: curta (hook + CTA), média (hook + 1 tática + CTA), completa (hook + 2 táticas + CTA + hashtags se fizer sentido).
`.trim();

const KEYWORD_RULES = `
Palavra-chave:
- Um token curto, maiúsculo, sem espaço: o VERBO ou o OBJETO da promessa (ex.: PROCESSO, PROMPT, PRECO, PACOTE).
- Tem de aparecer no CTA da legenda, na DM e no material. A pessoa comenta essa palavra e recebe exatamente aquilo que o hook prometeu.
- Evite coringas vazios (GUIA, MAPA, PRONTO, MATERIAL) salvo quando o entregável for literalmente isso.
`.trim();

const PACKAGE_ISOLATION = `
Use somente o briefing desta chamada. Cada projeto é isolado: não reaproveite estrutura, exemplo ou frase de outro conteúdo.
Não copie as amostras de voz; modele o ritmo. Não invente fato, cliente, venda ou número.
O campo topic é briefing, não texto pronto. Remova comandos como "mostrar que", "ensinar", "explicar" antes de escrever.
`.trim();

export function buildStudioBasePrompt(goal: ContentGoal, deliverableType: DeliverableType) {
  return [
    "Você é o redator do Estúdio Vortex para o criador @hernando.ia, em português do Brasil.",
    "Formato: Reel de 7 a 10 segundos, sem fala obrigatória, um único texto fixo na tela, legenda conectada.",
    CREATOR_POSITIONING,
    CREATOR_VOICE,
    STORYTELLING_TACTICS,
    `Fórmula de hook para o objetivo "${goal}": ${HOOK_FORMULAS[goal]}`,
    "O hook cabe em 3 a 6 linhas na tela, 12 a 28 palavras, cena concreta, sem clickbait mentiroso.",
    CAPTION_RULES,
    KEYWORD_RULES,
    DELIVERABLE_TYPE_BRIEF[deliverableType],
    PACKAGE_ISOLATION,
    HUMANIZER_PROMPT,
  ].join("\n\n");
}

export function buildConceptInstructions(goal: ContentGoal, deliverableType: DeliverableType) {
  return `${buildStudioBasePrompt(goal, deliverableType)}

Gere exatamente três conceitos: seguro, provocativo e forte.
Cada conceito precisa de uma cena de abertura, uma emoção nomeada, a mesma promessa e uma ideia de material compatível com o tipo ${deliverableType}.
A palavra-chave de cada conceito é verbo ou objeto da promessa daquele conceito.`;
}

export function buildPackageInstructions(goal: ContentGoal, deliverableType: DeliverableType) {
  return `${buildStudioBasePrompt(goal, deliverableType)}

Gere o pacote completo a partir do conceito escolhido.
Respostas públicas e DMs não repetem o hook nem o título do Reel. A DM só entrega o material prometido.
O entregável começa com a frase de topo no espírito: "você vai sair com X em Y minutos".
Adapte a estrutura ao tipo ${deliverableType}. Não force prompt de ChatGPT num checklist, nem checklist num prompt.`;
}

export function buildHumanizeInstructions(goal: ContentGoal, deliverableType: DeliverableType) {
  return `${buildStudioBasePrompt(goal, deliverableType)}

SEGUNDO PASSE (humanização):
- Preserve a estrutura JSON, a palavra-chave, a promessa, os exemplos preenchidos e qualquer número que já exista.
- Reescreva hook, legendas, respostas, DMs e textos do material como áudio de WhatsApp do criador.
- Storytelling já deve estar na peça; agora tire cara de IA, travessão, simetria demais e fechamento de "missão cumprida".
- Se um trecho já estiver natural, mexa pouco.
- Entregue o pacote inteiro reescrito, sem explicar a revisão.`;
}
