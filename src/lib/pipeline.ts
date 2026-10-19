import { z } from "zod";
import {
  automationConversationFlowSchema,
  buildKeywordVariants,
  httpsUrlSchema,
  normalizeConversationFlow,
  normalizeKeyword,
  type AutomationConversationFlow,
} from "@/lib/domain";

export const PIPELINE_VIDEO_BUCKET = "pipeline-videos";

export const pipelineStatuses = [
  "draft",
  "uploading",
  "processing",
  "published",
  "automation_created",
  "failed",
] as const;

export type PipelineStatus = typeof pipelineStatuses[number];

export const pipelineDeliverableTypes = ["prompt", "sistema", "app", "repositorio"] as const;

export type PipelineDeliverableType = typeof pipelineDeliverableTypes[number];

export interface PipelinePostInput {
  caption: string;
  hashtags: string[];
  keyword: string;
  deliverableType: PipelineDeliverableType;
  deliverableUrl: string;
  conversationFlow: AutomationConversationFlow;
  scheduledAt: string | null;
  source: "ui" | "api";
}

const hashtagSchema = z
  .string()
  .trim()
  .transform((value) => value.replace(/^#+/u, ""))
  .pipe(z.string().min(1, "Informe a hashtag.").max(60, "Use até 60 caracteres."))
  .refine((value) => /^[\p{L}\p{N}_]+$/u.test(value), "Use apenas letras, números e underline.");

export const pipelinePostInputSchema = z
  .object({
    caption: z.string().trim().min(1, "Informe a legenda.").max(2200, "Use até 2.200 caracteres."),
    hashtags: z.array(hashtagSchema).max(5, "Use no máximo 5 hashtags.").default([]),
    keyword: z.string().trim().min(1, "Informe a palavra-chave.").max(80, "Use até 80 caracteres."),
    deliverableType: z.enum(pipelineDeliverableTypes),
    deliverableUrl: httpsUrlSchema,
    conversationFlow: automationConversationFlowSchema,
    scheduledAt: z.string().trim().nullable().default(null),
    source: z.enum(["ui", "api"]).default("ui"),
  })
  .transform((data): PipelinePostInput => ({
    ...data,
    keyword: data.keyword.trim(),
    hashtags: dedupeHashtags(data.hashtags),
    conversationFlow: normalizeConversationFlow(data.conversationFlow),
    scheduledAt: normalizeScheduledAt(data.scheduledAt),
  }))
  .superRefine((data, context) => {
    if (new Set(data.hashtags.map((item) => item.toLocaleLowerCase("pt-BR"))).size !== data.hashtags.length) {
      context.addIssue({ code: "custom", path: ["hashtags"], message: "Remova hashtags duplicadas." });
    }
    if (!normalizeKeyword(data.keyword)) {
      context.addIssue({ code: "custom", path: ["keyword"], message: "Informe uma palavra-chave válida." });
    }
    if (data.scheduledAt && Number.isNaN(new Date(data.scheduledAt).getTime())) {
      context.addIssue({ code: "custom", path: ["scheduledAt"], message: "Informe uma data de agendamento válida." });
    }
    if (data.conversationFlow.steps.length > 0 && !flowHasUrlButton(normalizeConversationFlow(data.conversationFlow))) {
      context.addIssue({ code: "custom", path: ["conversationFlow"], message: "Inclua ao menos um botão final com a URL do material." });
    }
  });

const allowedTransitions: Record<PipelineStatus, PipelineStatus[]> = {
  draft: ["uploading", "processing", "failed"],
  uploading: ["processing", "failed"],
  processing: ["published", "automation_created", "failed"],
  published: ["automation_created", "failed"],
  automation_created: [],
  failed: ["draft", "processing"],
};

export function canTransitionPipelineStatus(from: PipelineStatus, to: PipelineStatus) {
  return from === to || allowedTransitions[from].includes(to);
}

export function assertPipelineStatusTransition(from: PipelineStatus, to: PipelineStatus) {
  if (!canTransitionPipelineStatus(from, to)) {
    throw new Error(`Transição inválida do pipeline: ${from} -> ${to}.`);
  }
}

export function normalizeHashtag(value: string) {
  return hashtagSchema.parse(value);
}

export function dedupeHashtags(values: string[]) {
  const seen = new Set<string>();
  const next: string[] = [];
  for (const value of values) {
    const parsed = hashtagSchema.safeParse(value);
    if (!parsed.success) continue;
    const key = parsed.data.toLocaleLowerCase("pt-BR");
    if (seen.has(key)) continue;
    seen.add(key);
    next.push(parsed.data);
  }
  return next.slice(0, 5);
}

export function buildCaptionWithHashtags(caption: string, hashtags: string[]) {
  const normalizedCaption = caption.trim();
  const suffix = dedupeHashtags(hashtags).map((hashtag) => `#${hashtag}`).join(" ");
  return suffix ? `${normalizedCaption}\n\n${suffix}` : normalizedCaption;
}

export function normalizeScheduledAt(value: string | null | undefined) {
  if (!value?.trim()) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toISOString();
}

export function isScheduledForFuture(scheduledAt: string | null | undefined, now = new Date()) {
  return Boolean(scheduledAt && new Date(scheduledAt).getTime() > now.getTime());
}

export function buildDefaultPipelineFlow(deliverableUrl: string): AutomationConversationFlow {
  return {
    steps: [
      {
        id: "inicio",
        text: "Quer que eu te envie o material agora?",
        buttons: [{ id: "quero", label: "Quero sim", nextStepId: "entrega", url: null }],
      },
      {
        id: "entrega",
        text: "Perfeito. Aqui está o material:",
        buttons: [{ id: "abrir", label: "Abrir material", nextStepId: null, url: deliverableUrl }],
      },
    ],
  };
}

export function flowHasUrlButton(flow: AutomationConversationFlow) {
  return flow.steps.some((step) => step.buttons.some((button) => Boolean(button.url)));
}

export function normalizePipelineConversationFlow(flow: AutomationConversationFlow, deliverableUrl: string) {
  const normalized = normalizeConversationFlow(flow);
  return normalized.steps.length ? normalized : buildDefaultPipelineFlow(deliverableUrl);
}

export function buildPipelineKeywordVariants(keyword: string) {
  return buildKeywordVariants(keyword);
}
