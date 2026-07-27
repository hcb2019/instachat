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
  return topic.length > 88 ? `${topic.slice(0, 85).trimEnd()}…` : topic;
}

export function buildFallbackAutomationSuggestions(caption: string): AutomationMessageSuggestion[] {
  const topic = reelTopicFromCaption(caption);
  return [
    {
      label: "Direta",
      publicReply: "Pronto! Enviei os detalhes no seu direct. Dá uma olhadinha por lá.",
      dmMessage: `Olá! Vi que você se interessou pelo Reel sobre “${topic}”. Separei o próximo passo para ajudar você a colocar essa ideia em prática:`,
      rationale: "Confirma o envio de forma objetiva e conecta a DM diretamente ao assunto do Reel.",
    },
    {
      label: "Acolhedora",
      publicReply: "Que bom que esse conteúdo chamou sua atenção! Acabei de te enviar uma mensagem no direct.",
      dmMessage: `Que bom ter você por aqui! Como o Reel sobre “${topic}” chamou sua atenção, deixei este conteúdo complementar para você continuar:`,
      rationale: "Cria proximidade sem prometer resultados ou materiais que não aparecem na automação.",
    },
    {
      label: "Orientada à ação",
      publicReply: "Seu próximo passo já está no direct. Depois me conta o que achou!",
      dmMessage: `Vamos avançar? A partir do que mostrei no Reel sobre “${topic}”, este é o próximo passo que recomendo para você:`,
      rationale: "Transforma o interesse no Reel em uma ação clara, mantendo um tom natural.",
    },
  ];
}
