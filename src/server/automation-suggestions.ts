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
A resposta pública deve confirmar que a pessoa receberá uma mensagem no direct.
A mensagem privada deve contextualizar o assunto do Reel e terminar preparando a leitura do link que o sistema acrescentará depois.
Não inclua URL, hashtags, nome de usuário ou palavra-chave. Não invente produto, desconto, material, benefício ou resultado que não esteja explícito na legenda.
Evite linguagem agressiva, promessas comerciais e frases com aparência de spam.`;

export async function generateAutomationMessageSuggestions(caption: string): Promise<AutomationMessageSuggestion[]> {
  const fallback = buildFallbackAutomationSuggestions(caption);
  if (!env.OPENAI_API_KEY) return fallback;

  try {
    const client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 30_000, maxRetries: 1 });
    const response = await client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({ reelCaption: caption.slice(0, 2_200) || "Reel sem legenda" }),
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
