import type { AudienceCategory, AudienceClassification, AudienceProviderResult } from "@/types/audience";
import type { AudienceIntelligenceInput, AudienceIntelligenceProvider } from "@/server/audience/types";

const rules: Array<{ category: AudienceCategory; pattern: RegExp; theme: string }> = [
  { category: "purchase_intent", pattern: /compr|curso|mentoria|preço|valor|onde encontro/i, theme: "Oferta e acesso" },
  { category: "objection", pattern: /caro|não consigo|poucos seguidores|funciona|difícil/i, theme: "Barreiras para começar" },
  { category: "content_request", pattern: /faz um vídeo|mostra|modelo|roteiro|exemplo/i, theme: "Conteúdo prático" },
  { category: "question", pattern: /\?|como|qual|quando|onde|por que/i, theme: "Dúvidas recorrentes" },
  { category: "support", pattern: /erro|não abre|não recebi|ajuda/i, theme: "Suporte" },
  { category: "praise", pattern: /excelente|amei|obrigad|salvei|muito bom/i, theme: "Reconhecimento" },
];

export class MockAudienceIntelligenceProvider implements AudienceIntelligenceProvider {
  async analyze(input: AudienceIntelligenceInput) {
    const classifications: AudienceClassification[] = input.comments.map(({ alias, text }) => {
      const matched = rules.find(({ pattern }) => pattern.test(text));
      return { alias, category: matched?.category ?? "irrelevant", sentiment: matched?.category === "praise" ? "positive" : matched?.category === "objection" || matched?.category === "support" ? "negative" : "neutral", urgency: matched?.category === "purchase_intent" ? 4 : 2, confidence: matched ? 0.88 : 0.7, theme: matched?.theme ?? "Outros", opportunity: matched ? `Aprofundar ${matched.theme.toLocaleLowerCase("pt-BR")}.` : "" };
    });
    const grouped = Map.groupBy(classifications.filter(({ category }) => category !== "irrelevant"), ({ category }) => category);
    const insights = Array.from(grouped, ([category, items], index) => ({
      category,
      title: `${items[0]?.theme ?? "Sinal"} aparece na audiência`,
      summary: `${items.length} comentário${items.length === 1 ? "" : "s"} indica${items.length === 1 ? "" : "m"} uma oportunidade relacionada a ${items[0]?.theme.toLocaleLowerCase("pt-BR")}.`,
      recommendation: "Revise as evidências e transforme o sinal em um conteúdo ou rascunho de automação.",
      confidence: Math.min(0.95, 0.72 + items.length * 0.04),
      evidenceAliases: items.slice(0, 5).map(({ alias }) => alias),
      priority: Math.max(40, 95 - index * 8),
      suggestion: null,
    }));
    return { classifications, insights, usage: { inputTokens: 0, outputTokens: 0 } };
  }

  async synthesize(input: { results: AudienceProviderResult[]; periodDays: 7 | 30 | 90 }) {
    const grouped = Map.groupBy(input.results.flatMap(({ insights }) => insights), ({ category }) => category);
    const insights = Array.from(grouped, ([category, items]) => ({
      ...items.sort((a, b) => b.priority - a.priority)[0]!,
      category,
      confidence: Math.max(...items.map(({ confidence }) => confidence)),
      evidenceAliases: [...new Set(items.flatMap(({ evidenceAliases }) => evidenceAliases))].slice(0, 5),
    }));
    return { insights, usage: { inputTokens: 0, outputTokens: 0 } };
  }
}
