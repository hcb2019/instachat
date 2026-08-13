import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  automationMessageSuggestionsSchema,
  buildFallbackAutomationSuggestions,
  suggestionsAreSafeForCaption,
  type AutomationMessageSuggestion,
} from "@/lib/automation-suggestions";
import { env } from "@/lib/env";
import { HUMANIZER_PROMPT, humanizeText, textPassesHumanizer } from "@/lib/humanizer";

const SYSTEM_PROMPT = `Você escreve mensagens curtas para automações de comentários em Reels do Instagram.
Use a legenda somente para compreender o contexto e gere exatamente três pares de mensagens em português do Brasil.
Cada par deve ter um estilo diferente: direto, acolhedor e orientado à ação.
A resposta pública deve ter no máximo 110 caracteres e apenas confirmar, de forma natural, que algo foi enviado no direct.
A mensagem privada deve ter no máximo 150 caracteres, ser natural e terminar preparando o link que o sistema acrescentará depois.
As três respostas públicas e as três mensagens privadas devem ser claramente diferentes entre si.
REGRA OBRIGATÓRIA: nunca copie, cite, resuma ou encaixe palavras, frases, títulos, chamadas, @usuários, hashtags ou a palavra-chave da legenda nas mensagens. Não use construções como "sobre [tema]", "continuação de [título]" ou "próximo passo de [legenda]". A legenda serve apenas como contexto interno.
Não inclua URL, hashtags ou nome de usuário. Não invente produto, desconto, benefício ou resultado.
Evite linguagem agressiva, promessas comerciais e frases com aparência de spam.

${HUMANIZER_PROMPT}`;

function humanizeSuggestions(suggestions: AutomationMessageSuggestion[]) {
  return suggestions.map((suggestion) => ({
    ...suggestion,
    label: humanizeText(suggestion.label),
    publicReply: humanizeText(suggestion.publicReply),
    dmMessage: humanizeText(suggestion.dmMessage),
    rationale: humanizeText(suggestion.rationale),
  }));
}

export async function generateAutomationMessageSuggestions(caption: string, variationSeed = 0): Promise<AutomationMessageSuggestion[]> {
  const fallback = humanizeSuggestions(buildFallbackAutomationSuggestions(caption, variationSeed));
  if (!env.OPENAI_API_KEY) return fallback;

  try {
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 30_000, maxRetries: 1 });
    const response = await client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({
        reelCaption: caption.slice(0, 2_200) || "Reel sem legenda",
        variationSeed,
        instruction: "Produza uma combinação nova; evite repetir fórmulas genéricas de gerações anteriores.",
      }),
      text: { format: zodTextFormat(automationMessageSuggestionsSchema, "automation_message_suggestions") },
    });
    const suggestions = response.output_parsed?.suggestions;
    if (!suggestions) return fallback;
    const humanized = humanizeSuggestions(suggestions);
    const allTextPassed = automationMessageSuggestionsSchema.safeParse({ suggestions: humanized }).success
      && humanized.every(({ publicReply, dmMessage, rationale }) =>
      [publicReply, dmMessage, rationale].every(textPassesHumanizer),
      );
    return allTextPassed && suggestionsAreSafeForCaption(humanized, caption) ? humanized : fallback;
  } catch (error) {
    console.warn("Automation message suggestions fell back to local generation", {
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return fallback;
  }
}
