import { z } from "zod";

export function normalizeKeyword(value: string) {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ").toLocaleLowerCase("pt-BR");
}

export function keywordMatches(comment: string, keyword: string) {
  return normalizeKeyword(comment) === normalizeKeyword(keyword);
}

export const httpsUrlSchema = z
  .string()
  .trim()
  .url("Informe uma URL válida.")
  .refine((value) => new URL(value).protocol === "https:", "Use uma URL HTTPS.");

export const automationSchema = z
  .object({
    id: z.string().uuid().optional(),
    name: z.string().trim().max(80, "Use até 80 caracteres."),
    mediaId: z.string().trim().max(120),
    keyword: z.string().trim().max(80, "Use até 80 caracteres."),
    publicReply: z.string().trim().max(500, "Use até 500 caracteres."),
    dmMessage: z.string().trim().max(900, "Use até 900 caracteres."),
    destinationUrl: z.string().trim().max(2048),
    intent: z.enum(["draft", "active"]),
  })
  .superRefine((data, context) => {
    if (data.intent === "draft") return;
    const required: Array<[keyof typeof data, string]> = [
      ["name", "Informe um nome."],
      ["mediaId", "Selecione um Reel."],
      ["keyword", "Informe uma palavra-chave."],
      ["publicReply", "Informe a resposta pública."],
      ["dmMessage", "Informe a mensagem privada."],
      ["destinationUrl", "Informe o destino."],
    ];
    for (const [field, message] of required) {
      if (!data[field]) context.addIssue({ code: "custom", path: [field], message });
    }
    if (data.destinationUrl) {
      const parsed = httpsUrlSchema.safeParse(data.destinationUrl);
      if (!parsed.success) context.addIssue({ code: "custom", path: ["destinationUrl"], message: parsed.error.issues[0]?.message ?? "URL inválida." });
    }
  });

export function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(value));
}

export function formatPercent(numerator: number, denominator: number) {
  if (!denominator) return "0%";
  return new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 1 }).format(numerator / denominator);
}
