import { z } from "zod";

export const DEFAULT_FOLLOW_GATE_MESSAGE = "Se você já me segue, digite PRONTO. Se não, me segue e depois volta aqui e digita PRONTO.";
export const DEFAULT_NOT_FOLLOWING_MESSAGE = "Poxa… você quer o conteúdo e ainda não me segue? 😅 Me segue primeiro e depois digita PRONTO aqui de novo.";

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
    requireFollow: z.boolean().default(false),
    followGateMessage: z.string().trim().max(900, "Use até 900 caracteres.").default(DEFAULT_FOLLOW_GATE_MESSAGE),
    notFollowingMessage: z.string().trim().max(900, "Use até 900 caracteres.").default(DEFAULT_NOT_FOLLOWING_MESSAGE),
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
    if (data.requireFollow && !data.followGateMessage) {
      context.addIssue({ code: "custom", path: ["followGateMessage"], message: "Informe a mensagem que pede a confirmação." });
    }
    if (data.requireFollow && !data.notFollowingMessage) {
      context.addIssue({ code: "custom", path: ["notFollowingMessage"], message: "Informe a mensagem para quem ainda não segue." });
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
