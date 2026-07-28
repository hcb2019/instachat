import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import {
  automationMessageSuggestionsSchema,
  buildFallbackAutomationSuggestions,
  type AutomationMessageSuggestion,
} from "@/lib/automation-suggestions";
import { env } from "@/lib/env";

const SYSTEM_PROMPT = `Você escreve mensagens curtas para automações de comentários em Reels do Instagram.
Analise somente a legenda fornecida e gere exatamente três pares de mensagens em português do Brasil.
Cada par deve ter um estilo diferente: direto, acolhedor e orientado à ação.
A resposta pública deve ter no máximo 110 caracteres, confirmar o envio no direct e citar naturalmente o tema do Reel.
A mensagem privada deve ter no máximo 150 caracteres, ser direta, contextualizar o tema do Reel e terminar preparando o link que o sistema acrescentará depois.
As três respostas públicas e as três mensagens privadas devem ser claramente diferentes entre si.
Não inclua URL, hashtags, nome de usuário ou palavra-chave. Não invente produto, desconto, material, benefício ou resultado que não esteja explícito na legenda.
Evite linguagem agressiva, promessas comerciais e frases com aparência de spam.`;

export async function generateAutomationMessageSuggestions(caption: string, variationSeed = 0): Promise<AutomationMessageSuggestion[]> {
  const fallback = buildFallbackAutomationSuggestions(caption, variationSeed);
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
    return response.output_parsed?.suggestions ?? fallback;
  } catch (error) {
    console.warn("Automation message suggestions fell back to local generation", {
      error: error instanceof Error ? error.name : "UnknownError",
    });
    return fallback;
  }
}
