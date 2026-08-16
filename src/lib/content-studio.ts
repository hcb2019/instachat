import { z } from "zod";
import { contentGoals, contentPillars, deliverableTypes, hookIntensities } from "@/types/content-studio";

export const creatorProfileSchema = z.object({
  instagramHandle: z.string().trim().regex(/^@[A-Za-z0-9._]{1,30}$/, "Use um @ válido."),
  niche: z.string().trim().min(3).max(180),
  audience: z.string().trim().min(3).max(300),
  voice: z.string().trim().min(3).max(300),
  preferredTerms: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  avoidedTerms: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  defaultCta: z.string().trim().min(3).max(300),
});

export const contentProjectInputSchema = z.object({
  title: z.string().trim().min(2, "Dê um nome para o projeto.").max(120),
  topic: z.string().trim().min(3, "Explique o assunto do Reel.").max(500),
  pillar: z.enum(contentPillars),
  primaryGoal: z.enum(contentGoals),
  secondaryGoal: z.enum(contentGoals).nullable(),
  hookIntensity: z.enum(hookIntensities),
  deliverableType: z.enum(deliverableTypes),
  notes: z.string().trim().max(1500),
  sourceInsightId: z.string().uuid().nullable().default(null),
});

export const contentConceptSchema = z.object({
  title: z.string().trim().min(2).max(100),
  style: z.enum(hookIntensities),
  hook: z.string().trim().min(12).max(180),
  angle: z.string().trim().min(10).max(500),
  audiencePain: z.string().trim().min(5).max(300),
  promise: z.string().trim().min(5).max(300),
  visualDirection: z.string().trim().min(5).max(400),
  deliverableIdea: z.string().trim().min(5).max(300),
  cta: z.string().trim().min(5).max(240),
  keywords: z.tuple([z.string().trim().min(2).max(30), z.string().trim().min(2).max(30), z.string().trim().min(2).max(30)]),
});
export const contentConceptsOutputSchema = z.object({ concepts: z.array(contentConceptSchema).length(3) });

const deliverableSectionSchema = z.object({
  heading: z.string().trim().min(2).max(100), body: z.string().trim().max(1200), items: z.array(z.string().trim().min(2).max(500)).max(12), practicalTip: z.string().trim().min(3).max(500).optional(),
  objective: z.string().trim().min(5).max(500).optional(), action: z.string().trim().min(5).max(700).optional(), example: z.string().trim().min(5).max(1000).optional(), responsePrompt: z.string().trim().min(5).max(400).optional(), responsePlaceholder: z.string().trim().min(5).max(700).optional(), completionCriterion: z.string().trim().min(5).max(500).optional(),
});
const deliverableExampleSchema = z.object({ title: z.string().trim().min(2).max(100), scenario: z.string().trim().min(5).max(600), application: z.string().trim().min(5).max(1200), result: z.string().trim().min(5).max(600) });
const deliverableTemplateSchema = z.object({ title: z.string().trim().min(2).max(100), description: z.string().trim().min(5).max(500), content: z.string().trim().min(20).max(3000) });
const deliverablePitfallSchema = z.object({ mistake: z.string().trim().min(3).max(300), correction: z.string().trim().min(5).max(500) });
const generatedDeliverableSchema = z.object({
  title: z.string().trim().min(2).max(140), summary: z.string().trim().min(5).max(500), introduction: z.string().trim().min(5).max(1200), sections: z.array(deliverableSectionSchema).min(2).max(8), closing: z.string().trim().min(3).max(600),
  authorHandle: z.string().trim().regex(/^@[A-Za-z0-9._]{1,30}$/).optional(), outcome: z.string().trim().min(10).max(600).optional(), estimatedMinutes: z.number().int().min(5).max(90).optional(), difficulty: z.enum(["beginner","intermediate"]).optional(), prerequisites: z.array(z.string().trim().min(3).max(300)).max(8).optional(), examples: z.array(deliverableExampleSchema).max(4).optional(), templates: z.array(deliverableTemplateSchema).max(5).optional(), pitfalls: z.array(deliverablePitfallSchema).max(8).optional(), nextSteps: z.array(z.string().trim().min(3).max(400)).max(8).optional(), startHere: z.string().trim().min(10).max(500).optional(), finalArtifact: z.string().trim().min(10).max(600).optional(), completionCriteria: z.array(z.string().trim().min(5).max(300)).max(8).optional(),
});
const richGeneratedDeliverableSchema = z.object({
  title: z.string().trim().min(2).max(140), summary: z.string().trim().min(40).max(500), introduction: z.string().trim().min(80).max(1200), authorHandle: z.string().trim().regex(/^@[A-Za-z0-9._]{1,30}$/), outcome: z.string().trim().min(30).max(600), estimatedMinutes: z.number().int().min(5).max(90), difficulty: z.enum(["beginner","intermediate"]), prerequisites: z.array(z.string().trim().min(3).max(300)).min(2).max(6), startHere: z.string().trim().min(20).max(500), finalArtifact: z.string().trim().min(20).max(600), completionCriteria: z.array(z.string().trim().min(5).max(300)).min(2).max(6), sections: z.array(deliverableSectionSchema.extend({ items: z.array(z.string().trim().min(5).max(500)).min(2).max(8), practicalTip: z.string().trim().min(10).max(500), objective: z.string().trim().min(10).max(500), action: z.string().trim().min(10).max(700), example: z.string().trim().min(10).max(1000), responsePrompt: z.string().trim().min(10).max(400), responsePlaceholder: z.string().trim().min(10).max(700), completionCriterion: z.string().trim().min(10).max(500) })).min(4).max(7), examples: z.array(deliverableExampleSchema).min(1).max(3), templates: z.array(deliverableTemplateSchema).min(2).max(4), pitfalls: z.array(deliverablePitfallSchema).min(3).max(6), nextSteps: z.array(z.string().trim().min(5).max(400)).min(3).max(6), closing: z.string().trim().min(20).max(600),
});
export const contentPackageSchema = z.object({
  onScreenHook: z.string().trim().min(12).max(180),
  visualDirection: z.string().trim().min(5).max(500),
  shortCaption: z.string().trim().min(30).max(800),
  mediumCaption: z.string().trim().min(80).max(1500),
  fullCaption: z.string().trim().min(150).max(2200),
  selectedKeyword: z.string().trim().min(2).max(30),
  keywordSuggestions: z.tuple([z.string().trim().min(2).max(30), z.string().trim().min(2).max(30), z.string().trim().min(2).max(30)]),
  publicReplies: z.tuple([z.string().trim().min(8).max(110), z.string().trim().min(8).max(110), z.string().trim().min(8).max(110)]),
  dmMessages: z.tuple([z.string().trim().min(12).max(150), z.string().trim().min(12).max(150), z.string().trim().min(12).max(150)]),
  deliverable: generatedDeliverableSchema,
});
export const richContentPackageSchema = contentPackageSchema.extend({ deliverable: richGeneratedDeliverableSchema });

export const pillarLabel = (value: string) => ({ ai_business: "IA para negócios", automation_productivity: "Automação e produtividade", content_sales: "Conteúdo e vendas" }[value] ?? value);
export const goalLabel = (value: string) => ({ leads: "Gerar comentários e leads", followers: "Ganhar seguidores", saves: "Gerar salvamentos", shares: "Gerar compartilhamentos", education: "Educar a audiência", offer: "Apresentar uma oferta" }[value] ?? value);
export const deliverableLabel = (value: string) => ({ prompt: "Prompt pronto", checklist: "Checklist", guide: "Guia rápido", page: "Página prática" }[value] ?? value);
