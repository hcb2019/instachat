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

export function reelTopicFromCaption(caption: string) {
  const normalized = caption
    .normalize("NFKC")
    .replace(/https?:\/\/\S+/gi, "")
    .replace(/#[\p{L}\p{N}_]+/gu, "")
    .replace(/\s+/g, " ")
    .trim();
  const firstThought = normalized.split(/[.!?\n]/u)[0]?.trim() ?? "";
  const topic = firstThought || normalized;
  if (!topic) return "este conteúdo";
  return topic.length > 54 ? `${topic.slice(0, 51).trimEnd()}…` : topic;
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

export function buildFallbackAutomationSuggestions(caption: string, variationSeed = 0): AutomationMessageSuggestion[] {
  const topic = reelTopicFromCaption(caption);
  const offset = (hashText(`${caption}:${variationSeed}`) + variationSeed) % 6;
  const publicTemplates = rotate([
    `Pronto! Te mandei sobre “${topic}” no direct ✨`,
    `Chegou na sua DM: o próximo passo sobre “${topic}”.`,
    `Enviei no direct o conteúdo de “${topic}”. Dá uma olhada!`,
    `Boa! A continuação de “${topic}” já está na sua DM.`,
    `Acabei de te enviar os detalhes de “${topic}” no direct.`,
    `Tudo certo — o conteúdo sobre “${topic}” está na sua DM.`,
  ], offset);
  const dmTemplates = rotate([
    `Aqui está o conteúdo sobre “${topic}”:`,
    `Separei para você o próximo passo de “${topic}”:`,
    `Como prometido, aqui vai o material de “${topic}”:`,
    `Vamos continuar? Veja os detalhes de “${topic}”:`,
    `Este é o conteúdo complementar de “${topic}”:`,
    `Para avançar em “${topic}”, comece por aqui:`,
  ], (offset + 2) % 6);
  const styles = [
    ["Direta", "Confirma o envio com clareza e cita o assunto do Reel."],
    ["Próxima", "Mantém um tom humano, curto e relacionado ao conteúdo."],
    ["Ação", "Convida a pessoa a abrir a DM sem criar uma promessa artificial."],
  ] as const;

  return styles.map(([label, rationale], index) => ({
    label,
    publicReply: publicTemplates[index]!,
    dmMessage: dmTemplates[index]!,
    rationale,
  }));
}
