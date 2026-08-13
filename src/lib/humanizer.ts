/**
 * Política editorial compartilhada por todo texto gerado pelo InstaChat.
 *
 * A primeira camada orienta o modelo. A segunda remove, no servidor, marcas
 * recorrentes de texto artificial antes de o conteúdo chegar ao usuário.
 */
export const HUMANIZER_VERSION = "humanizer-v1";

export const HUMANIZER_PROMPT = `
REVISÃO EDITORIAL OBRIGATÓRIA (${HUMANIZER_VERSION}):
- Escreva como uma pessoa brasileira de verdade, não como assistente, anúncio ou artigo corporativo.
- Preserve o sentido, mas use construções simples, específicas e naturais quando lidas em voz alta.
- Varie o ritmo. Misture frases curtas com frases um pouco mais longas sem criar uma estrutura perfeita demais.
- Evite grandiosidade, elogios vazios, promessas genéricas, atribuições vagas e conclusões otimistas sem conteúdo.
- Não use expressões como "é importante destacar", "vale ressaltar", "além disso", "nesse cenário", "jornada", "revolucionário", "transformador", "crucial", "fundamental", "pilar" ou "cenário em constante evolução".
- Evite "não é apenas... é...", "não se trata apenas...", listas forçadas de três itens e sequências de sinônimos.
- Não use travessão para dar falsa dramaticidade. Não decore títulos ou frases com emojis; use no máximo um emoji quando ele realmente combinar com uma conversa informal.
- Não escreva "claro", "com certeza", "espero que ajude", "aqui está" ou "se quiser, posso" como fala de assistente.
- Não invente experiência pessoal, emoção, dado, prova, autoridade, benefício ou resultado.
- Use português do Brasil, contrações naturais e o grau de informalidade pedido pelo contexto.
- Entregue somente o texto final. Nunca explique que ele foi humanizado.
`.trim();

const START_FILLERS = [
  /^(?:claro|com certeza|certamente)[!,.:;\s-]+/iu,
  /^(?:é importante (?:destacar|notar)|vale ressaltar|cabe destacar) que\s+/iu,
  /^(?:aqui está|aqui vai)\s+(?:o|a|um|uma)\s+/iu,
];

const PHRASE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/\balém disso,?\s*/giu, ""],
  [/\badicionalmente,?\s*/giu, ""],
  [/\bnesse cenário,?\s*/giu, ""],
  [/\bno cenário atual,?\s*/giu, "hoje, "],
  [/\bdevido ao fato de que\b/giu, "porque"],
  [/\bcom o objetivo de\b/giu, "para"],
  [/\ba fim de\b/giu, "para"],
  [/\bpossui a capacidade de\b/giu, "pode"],
  [/\btem a capacidade de\b/giu, "pode"],
  [/é importante (?:destacar|notar) que\s*/giu, ""],
  [/vale ressaltar que\s*/giu, ""],
  [/\bespero que (?:isso )?ajude[.!]?/giu, ""],
  [/\bse quiser,? posso[^.!?]*[.!?]?/giu, ""],
];

function preserveCapitalization(before: string, after: string) {
  if (!after || before === before.toLocaleLowerCase("pt-BR")) return after;
  return after.charAt(0).toLocaleUpperCase("pt-BR") + after.slice(1);
}

/** Revisa texto livre sem alterar quebras de parágrafo ou dados concretos. */
export function humanizeText(input: string) {
  let value = input.normalize("NFKC").trim();
  if (!value) return value;

  value = value
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+—\s+/g, ", ")
    .replace(/—/g, "-")
    .replace(/\.{3,}/g, "…");

  for (const pattern of START_FILLERS) value = value.replace(pattern, "");
  for (const [pattern, replacement] of PHRASE_REPLACEMENTS) {
    value = value.replace(pattern, (match) => preserveCapitalization(match, replacement));
  }

  value = value
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\s+([,.;!?])/g, "$1")
    .replace(/,{2,}/g, ",")
    .replace(/^\s*[,;:]\s*/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return value.replace(/^([a-záàâãéêíóôõúç])/, (letter) => letter.toLocaleUpperCase("pt-BR"));
}

export interface HumanizerFinding {
  pattern: string;
  excerpt: string;
}

const AI_PATTERNS: Array<[string, RegExp]> = [
  ["fala de assistente", /\b(?:espero que ajude|se quiser, posso|com certeza|certamente)\b/iu],
  ["ênfase vazia", /\b(?:é importante destacar|vale ressaltar|momento crucial|papel fundamental)\b/iu],
  ["vocabulário artificial", /\b(?:cenário em constante evolução|jornada transformadora|revolucionário|tapeçaria|pivotal)\b/iu],
  ["paralelismo artificial", /\b(?:não é apenas|não se trata apenas|não apenas).{0,100}\b(?:mas também|é)\b/iu],
  ["travessões em excesso", /—.*—/u],
];

export function inspectHumanizedText(input: string): HumanizerFinding[] {
  return AI_PATTERNS.flatMap(([pattern, regex]) => {
    const match = input.match(regex);
    return match ? [{ pattern, excerpt: match[0].slice(0, 140) }] : [];
  });
}

export function textPassesHumanizer(input: string) {
  return inspectHumanizedText(input).length === 0;
}
