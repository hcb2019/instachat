import { z } from "zod";
import { contentGoals, contentPillars, deliverableTypes } from "@/types/content-studio";

export const INSTAGRAM_TREND_LIMIT = "A Instagram API with Instagram Login não entrega Reels de terceiros, busca de hashtag nem o Explore. O Vortex aproxima com os seus Reels de melhor desempenho, os sinais do Radar e padrões de conteúdo de IA em alta, sem copiar texto, design ou nome de ninguém.";

export const studioIdeaSources = ["own_reel", "audience", "ai_pattern"] as const;
export type StudioIdeaSource = typeof studioIdeaSources[number];

export interface StudioIdea {
  title: string;
  topic: string;
  hook: string;
  angle: string;
  reason: string;
  source: StudioIdeaSource;
  suggestedDeliverable: (typeof deliverableTypes)[number];
  suggestedGoal: (typeof contentGoals)[number];
  suggestedPillar: (typeof contentPillars)[number];
}

export interface StudioIdeaSignalReel {
  caption: string;
  views: number;
  comments: number;
  saved: number;
  shares: number;
  publishedAt: string;
}

export interface StudioIdeaSignals {
  connected: boolean;
  reels: StudioIdeaSignalReel[];
  audienceThemes: string[];
  audienceRequests: string[];
  limitNote: string;
}

export const studioIdeaSchema = z.object({
  title: z.string().trim().min(4).max(80),
  topic: z.string().trim().min(12).max(400),
  hook: z.string().trim().min(12).max(160),
  angle: z.string().trim().min(12).max(280),
  reason: z.string().trim().min(12).max(220),
  source: z.enum(studioIdeaSources),
  suggestedDeliverable: z.enum(deliverableTypes),
  suggestedGoal: z.enum(contentGoals),
  suggestedPillar: z.enum(contentPillars),
});

export const studioIdeasOutputSchema = z.object({
  ideas: z.array(studioIdeaSchema).min(4).max(8),
  limitNote: z.string().trim().min(20).max(400),
});

export function buildDemoStudioIdeas(): StudioIdea[] {
  return [
    {
      title: "IA sem dado pessoal",
      topic: "Mostrar na prática como montar um fluxo com IA sem colocar dado pessoal no prompt, e empacotar isso num checklist vendável.",
      hook: "se a IA viu dado pessoal, o problema não é a ferramenta. é o teu processo.",
      angle: "Abrir na cena de colar conversa inteira no chat e virar isso num limite simples.",
      reason: "Padrão em alta: tutoriais de IA com segurança, modelado pra quem empacota o método.",
      source: "ai_pattern",
      suggestedDeliverable: "checklist",
      suggestedGoal: "leads",
      suggestedPillar: "ai_business",
    },
    {
      title: "Mostra o processo",
      topic: "Ensinar a gravar a tela do próprio fluxo com IA e transformar o gravado num produto, sem fingir bastidor de agência.",
      hook: "eu não vendo o futuro da IA. eu mostro o processo e empacoto.",
      angle: "Contraste entre conteúdo de guru e conteúdo que a pessoa consegue repetir.",
      reason: "Reels de 'build in public' com IA performam quando tem um artefato no final.",
      source: "ai_pattern",
      suggestedDeliverable: "guide",
      suggestedGoal: "saves",
      suggestedPillar: "content_sales",
    },
    {
      title: "Resposta que não parece robô",
      topic: "Usar IA pra responder pedido de orçamento sem parecer texto automático, com revisão humana e pergunta no fim.",
      hook: "se a resposta parece IA, a pessoa não desconfia da ferramenta. desconfia de vc.",
      angle: "Cena de copiar a resposta cru e perder o lead no tom.",
      reason: "Comentários pedem tom humano; o material precisa ser um prompt com limite, não um discurso.",
      source: "audience",
      suggestedDeliverable: "prompt",
      suggestedGoal: "leads",
      suggestedPillar: "ai_business",
    },
    {
      title: "Uma tarefa, não a vida",
      topic: "Escolher a primeira tarefa chata do dia pra testar IA, com critério de pronto e trava do que não automatizar.",
      hook: "automatizar tudo é o jeito mais rápido de não automatizar nada.",
      angle: "Abrir na lista enorme e fechar numa tarefa de 10 minutos.",
      reason: "Seus Reels de recorte prático costumam salvar mais do que visão de futuro.",
      source: "own_reel",
      suggestedDeliverable: "checklist",
      suggestedGoal: "saves",
      suggestedPillar: "automation_productivity",
    },
    {
      title: "Empacota o método",
      topic: "Transformar um fluxo que vc já usa com IA num material que outra pessoa compra e aplica no mesmo dia.",
      hook: "se só vc sabe fazer, ainda não é produto. é um favor.",
      angle: "Mostrar a diferença entre ajudar no direct e entregar uma página com começo, meio e fim.",
      reason: "Conteúdo de productização de serviço com IA está performando quando tem passo concreto.",
      source: "ai_pattern",
      suggestedDeliverable: "page",
      suggestedGoal: "offer",
      suggestedPillar: "content_sales",
    },
    {
      title: "Revisão humana",
      topic: "Criar um critério simples pra revisar saída de IA antes de mandar pro cliente, sem teatro de compliance.",
      hook: "a IA erra. o problema é vc enviar isso como se fosse sua voz.",
      angle: "Cena de quase mandar e parar num detalhe falso.",
      reason: "Objeção recorrente: medo de errar em público. O material resolve com uma trava, não com medo.",
      source: "audience",
      suggestedDeliverable: "checklist",
      suggestedGoal: "education",
      suggestedPillar: "ai_business",
    },
  ];
}
