import type { ContentGoal, CreatorProfile, DeliverableType } from "@/types/content-studio";

/**
 * Identidade editorial do criador @hernando.ia.
 *
 * Fica no código (não só no banco) para a geração não depender de o perfil
 * ter sido preenchido. O perfil salvo pode especializar termos e CTA.
 */
export const CREATOR_HANDLE = "@hernando.ia";

export const CREATOR_POSITIONING = `
Posicionamento (obrigatório):
- Nunca chame o criador de "dev", "programador" ou "guru".
- Ele constrói soluções com IA, respeita segurança e LGPD, e diz isso abertamente.
- O conteúdo mostra o processo na prática e empacota o método num produto pra vender.
- Nunca invente venda, cliente, faturamento, autoridade, prêmio ou número que não esteja no briefing.
- Não fale de farda, quartel, Exército, patente, rotina militar, rua, bairro ou rota pessoal.
`.trim();

export const STORYTELLING_TACTICS = `
Táticas de storytelling do Super Cérebro (aplique de verdade, não cite os números):
1. Abrir pela cena mais forte, não pela introdução. O primeiro quadro e a primeira linha da legenda já jogam a pessoa no meio da situação.
2. Nomear emoções específicas (aperto no peito, vergonha de perguntar, alívio de ver o processo). Evite "sentir-se motivado".
3. Mostrar o momento em que quase desistiu e o que segurou: um detalhe concreto, não uma moral.
4. Contraste antes/depois com cena e número só quando o briefing tiver número. Sem inventar métrica.
5. Revelar a mudança interna de mentalidade em uma frase simples ("eu achava que o problema era X; na real era Y").
6. Não terminar como se tudo estivesse resolvido. Deixe um próximo passo ou uma ponta solta honesta.
`.trim();

export const CREATOR_VOICE = `
Voz: PT-BR casual, humanizado, cara de áudio de WhatsApp. Frases curtas misturadas com uma média. Abreviações naturais (vc, tb, pq, q, pra, tá, né).
Sem clichê de coach, sem travessão, sem "vale ressaltar", "jornada", "revolucionário", "guru", "além disso", "neste cenário".
Não escreva como artigo, anúncio ou assistente. Não explique que o texto foi humanizado.
`.trim();

export const CAPTION_SAMPLES = [
  `${CREATOR_HANDLE}

ontem eu tava montando um fluxo e percebi q o medo não era a IA quebrar.

era eu não saber explicar o q ela fez.

gravei a tela, mostrei o prompt e falei: dado pessoal não entra aqui.

comenta VORTEX q eu te mando o checklist pra fazer o mesmo no teu processo.`,
  `${CREATOR_HANDLE}

se a IA responde o cliente e vc não revisa, isso não é automação.

é vc terceirizando a conversa sem saber o q saiu.

eu mostro o processo: o prompt, o limite e o q eu não deixo a ferramenta inventar.

comenta PROCESSO q eu te mando o roteiro pra testar isso hoje.`,
  `${CREATOR_HANDLE}

eu não vendo "o futuro da IA".

eu pego uma tarefa chata, mostro como eu resolvo com IA e empacoto isso pra outra pessoa repetir.

se isso te serve, comenta PACOTE q eu te mando o material.`,
];

export const DEFAULT_PREFERRED_TERMS = [
  "na prática",
  "testa isso",
  "vc",
  "tb",
  "pq",
  "pra",
  "comenta VORTEX",
  "LGPD",
  "mostra o processo",
  "empacota",
];

export const DEFAULT_AVOIDED_TERMS = [
  "dev",
  "guru",
  "jornada",
  "revolucionário",
  "transformador",
  "vale ressaltar",
  "além disso",
  "farda",
  "quartel",
  "Exército",
  "link na bio",
];

export const DEFAULT_CTA = "Comenta VORTEX que eu te mando no direct.";

export const BLACKLIST_TERMS = [
  "farda",
  "quartel",
  "exército",
  "exercito",
  "patente",
  "sargento",
  "tenente",
  "cfap",
  "guru",
  "jornada",
  "revolucionário",
  "revolucionario",
  "vale ressaltar",
  "link na bio",
] as const;

const identityPhrases = [
  /\bcomo dev\b/iu,
  /\beu sou (?:um )?dev\b/iu,
  /\bprogramador\b/iu,
  /\b(?:no|do|ao) quartel\b/iu,
  /\bfarda\b/iu,
  /\bex[ée]rcito\b/iu,
];

export function textHitsCreatorBlacklist(input: string) {
  const normalized = input.normalize("NFKC");
  if (identityPhrases.some((pattern) => pattern.test(normalized))) return true;
  const lower = normalized.toLocaleLowerCase("pt-BR");
  return BLACKLIST_TERMS.some((term) => lower.includes(term.toLocaleLowerCase("pt-BR")));
}

export const HOOK_FORMULAS: Record<ContentGoal, string> = {
  leads: "Abra numa cena concreta e termine a curiosidade no comentário. A pessoa precisa sentir que o material resolve aquela cena, não um tema genérico.",
  followers: "Abra numa identidade ou num erro comum. A ponta solta fica no perfil, não num clickbait vazio.",
  saves: "Abra com a utilidade visível: o que a pessoa leva embora em poucos minutos. Sem enrolação.",
  shares: "Abra numa cena que a pessoa vai querer mandar pra alguém específico. Diga pra quem, sem inventar urgência.",
  education: "Abra no detalhe que muda a decisão. Ensine pela cena, não pelo conceito.",
  offer: "Abra no problema real e mostre o que o material entrega. Sem prova social inventada e sem desconto fictício.",
};

export const DELIVERABLE_TYPE_BRIEF: Record<DeliverableType, string> = {
  prompt: "O material é UM prompt copiável, com contexto, variáveis entre colchetes, exemplo preenchido e como colar na IA. Não vire um curso.",
  checklist: "O material é uma lista de ações verificáveis. Cada item é um verbo. Sem prompt obrigatório pra colar no ChatGPT.",
  guide: "O material ensina decisões: o que fazer, por quê, e como saber se ficou bom. Sem fingir que é um prompt único.",
  page: "O material funciona como ferramenta na página: a pessoa preenche, copia e aplica. Frase de topo: o que sai pronto e em quanto tempo.",
};

export function mergeCreatorProfile(profile: CreatorProfile): CreatorProfile {
  return {
    ...profile,
    instagramHandle: profile.instagramHandle || CREATOR_HANDLE,
    preferredTerms: profile.preferredTerms.length ? profile.preferredTerms : DEFAULT_PREFERRED_TERMS,
    avoidedTerms: profile.avoidedTerms.length ? profile.avoidedTerms : DEFAULT_AVOIDED_TERMS,
    defaultCta: profile.defaultCta.trim() || DEFAULT_CTA,
    captionSamples: profile.captionSamples?.length ? profile.captionSamples : CAPTION_SAMPLES,
  };
}

export function buildCreatorBrief(profile: CreatorProfile) {
  const merged = mergeCreatorProfile(profile);
  return {
    instagramHandle: merged.instagramHandle,
    niche: merged.niche,
    audience: merged.audience,
    voice: merged.voice,
    preferredTerms: merged.preferredTerms,
    avoidedTerms: merged.avoidedTerms,
    defaultCta: merged.defaultCta,
    captionSamples: merged.captionSamples,
    positioning: CREATOR_POSITIONING,
  };
}
