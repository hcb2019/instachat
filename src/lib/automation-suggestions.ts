import { z } from "zod";

export const automationMessageSuggestionSchema = z.object({
  label: z.string().min(2).max(40),
  publicReply: z.string().min(8).max(500),
  dmMessage: z.string().min(12).max(900),
  rationale: z.string().min(8).max(180),
});

export const automationMessageSuggestionsSchema = z.object({
  suggestions: z.array(automationMessageSuggestionSchema).length(3),
});

export type AutomationMessageSuggestion = z.infer<typeof automationMessageSuggestionSchema>;

const GENERIC_MESSAGE_TERMS = new Set([
  "acesso", "aqui", "conteudo", "direct", "enviar", "enviei", "material",
  "mensagem", "pedido", "pronto", "prometido", "reel", "reels", "video",
]);

function normalizedWords(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .match(/[a-z0-9]+/g) ?? [];
}

function hashText(value: string) {
  let hash = 2166136261;
  for (const character of value.normalize("NFKC")) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function rotate<T>(items: T[], offset: number) {
  return items.map((_, index) => items[(index + offset) % items.length]!);
}

export function suggestionReferencesCaption(suggestion: AutomationMessageSuggestion, caption: string) {
  const message = `${suggestion.publicReply} ${suggestion.dmMessage}`;
  if (/@[\p{L}\p{N}_.]+/u.test(message)) return true;

  const specificTerms = new Set(
    normalizedWords(caption)
      .filter((term) => term.length >= 5 && !GENERIC_MESSAGE_TERMS.has(term)),
  );
  if (!specificTerms.size) return false;

  const messageTerms = new Set(normalizedWords(message));
  return [...specificTerms].some((term) => messageTerms.has(term));
}

export function suggestionsAreSafeForCaption(suggestions: AutomationMessageSuggestion[], caption: string) {
  return suggestions.every((suggestion) => !suggestionReferencesCaption(suggestion, caption));
}

export function buildFallbackAutomationSuggestions(caption: string, variationSeed = 0): AutomationMessageSuggestion[] {
  const offset = (hashText(`${caption}:${variationSeed}`) + variationSeed) % 6;
  const publicTemplates = rotate([
    "Prontinho! Enviei no seu direct — dá uma conferida ✨",
    "Chegou na sua DM. Pode abrir por lá!",
    "Tudo certo! Acabei de mandar no direct.",
    "Enviei por mensagem. Depois me conta se chegou 🙌",
    "Já está no seu direct — confere lá!",
    "Feito! Dá uma olhadinha nas suas mensagens.",
  ], offset);
  const dmTemplates = rotate([
    "Deixei o conteúdo logo abaixo:",
    "Prontinho! O que você pediu está aqui:",
    "Separei tudo. É só abrir:",
    "Pode acessar por aqui:",
    "Está na mão! Dá uma olhada:",
    "O acesso está logo abaixo:",
  ], (offset + 2) % 6);
  const styles = [
    ["Direta", "Confirma o envio com clareza, sem repetir a legenda do Reel."],
    ["Acolhedora", "Mantém um tom humano e curto, sem copiar trechos do conteúdo."],
    ["Ação", "Convida a pessoa a abrir a DM sem parecer uma resposta robótica."],
  ] as const;

  return styles.map(([label, rationale], index) => ({
    label,
    publicReply: publicTemplates[index]!,
    dmMessage: dmTemplates[index]!,
    rationale,
  }));
}
