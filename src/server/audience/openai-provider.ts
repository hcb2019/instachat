import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { audienceModelOutputSchema, audienceSynthesisSchema, providerResultSchema } from "@/lib/audience";
import { env } from "@/lib/env";
import type { AudienceIntelligenceInput, AudienceIntelligenceProvider } from "@/server/audience/types";
import type { AudienceProviderResult } from "@/types/audience";

const SYSTEM_PROMPT = `Você é o analista de audiência do InstaChat. Analise comentários em português do Brasil sem inventar fatos.
Use somente os aliases recebidos como evidências. Agrupe linguagem equivalente, diferencie intenção de compra, dúvida, objeção, pedido de conteúdo, suporte, elogio e irrelevante.
Toda recomendação deve ser específica e executável. Gere sugestão de conteúdo apenas quando houver uma oportunidade clara. Nunca sugira enviar ou publicar algo automaticamente.
Retorne no máximo 12 insights, ordenados por prioridade. Um insight deve citar de 1 a 5 aliases existentes.`;

export class OpenAIAudienceIntelligenceProvider implements AudienceIntelligenceProvider {
  private readonly client: OpenAI;

  constructor() {
    if (!env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY não configurada.");
    this.client = new OpenAI({ apiKey: env.OPENAI_API_KEY, timeout: 60_000, maxRetries: 2 });
  }

  async analyze(input: AudienceIntelligenceInput) {
    const response = await this.client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({ periodDays: input.periodDays, context: input.context, comments: input.comments }),
      text: { format: zodTextFormat(audienceModelOutputSchema, "audience_intelligence") },
    });
    if (!response.output_parsed) throw new Error("A análise não retornou uma resposta estruturada.");
    const knownAliases = new Set(input.comments.map(({ alias }) => alias));
    const parsed = providerResultSchema.parse({
      ...response.output_parsed,
      classifications: response.output_parsed.classifications.filter(({ alias }) => knownAliases.has(alias)),
      insights: response.output_parsed.insights.map((insight) => ({
        ...insight,
        evidenceAliases: insight.evidenceAliases.filter((alias) => knownAliases.has(alias)),
      })).filter((insight) => insight.evidenceAliases.length > 0),
      usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 },
    });
    return parsed;
  }

  async synthesize(input: { results: AudienceProviderResult[]; periodDays: 7 | 30 | 90 }) {
    if (input.results.length === 1) return { insights: input.results[0]?.insights ?? [], usage: { inputTokens: 0, outputTokens: 0 } };
    const response = await this.client.responses.parse({
      model: env.OPENAI_AUDIENCE_MODEL,
      store: false,
      instructions: `${SYSTEM_PROMPT}\nConsolide insights de vários lotes. Una sinais equivalentes, preserve somente aliases citados e não aumente a confiança sem evidência.`,
      input: JSON.stringify({ periodDays: input.periodDays, batchInsights: input.results.map(({ insights }) => insights) }),
      text: { format: zodTextFormat(audienceSynthesisSchema, "audience_synthesis") },
    });
    if (!response.output_parsed) throw new Error("A síntese não retornou uma resposta estruturada.");
    const knownAliases = new Set(input.results.flatMap(({ classifications }) => classifications.map(({ alias }) => alias)));
    return {
      insights: response.output_parsed.insights.map((insight) => ({ ...insight, evidenceAliases: insight.evidenceAliases.filter((alias) => knownAliases.has(alias)) })).filter(({ evidenceAliases }) => evidenceAliases.length > 0),
      usage: { inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 },
    };
  }
}
