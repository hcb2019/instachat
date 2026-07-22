import "server-only";
import type { AudienceEvidence, AudienceInsight, AudienceRadarData, AudienceTheme } from "@/types/audience";
import type { InstagramMedia } from "@/types/domain";

const now = Date.now();

function evidence(id: number, text: string, username: string, media: InstagramMedia, daysAgo: number): AudienceEvidence {
  return {
    id: `50000000-0000-4000-8000-${String(id).padStart(12, "0")}`,
    text,
    username,
    mediaId: media.id,
    mediaCaption: media.caption,
    publishedAt: new Date(now - daysAgo * 86_400_000).toISOString(),
  };
}

export function createDemoAudienceData(media: InstagramMedia[]): AudienceRadarData {
  const [history, launch, habits] = media;
  if (!history || !launch || !habits) throw new Error("Fixtures de mídia insuficientes para o Radar.");

  const courseEvidence = [
    evidence(1, "Tem um curso completo ensinando esse processo do zero?", "marina.cria", history, 1),
    evidence(2, "Quero aprender a aplicar isso no meu negócio, onde compro?", "leo.co", history, 2),
    evidence(3, "Você vende mentoria sobre esse método?", "nina.studio", habits, 3),
  ];
  const beginnerEvidence = [
    evidence(4, "Funciona para quem ainda está começando e tem poucos seguidores?", "bia.lima", habits, 1),
    evidence(5, "Tenho só 800 seguidores, será que já consigo usar?", "caio.lab", habits, 4),
    evidence(6, "Qual seria o primeiro passo para uma conta pequena?", "ana.v", launch, 5),
  ];
  const priceEvidence = [
    evidence(7, "Quanto custa para ter acesso ao material completo?", "joaopedro", history, 2),
    evidence(8, "Tem uma versão mais acessível para começar?", "mariax", launch, 6),
  ];
  const templateEvidence = [
    evidence(9, "Faz um vídeo mostrando o roteiro que você usa.", "studio.mari", launch, 1),
    evidence(10, "Queria um modelo pronto de mensagem para copiar.", "rafa.copy", habits, 2),
    evidence(11, "Mostra exemplos reais de CTA em um próximo Reel.", "dani.social", history, 4),
  ];
  const praiseEvidence = [
    evidence(12, "Finalmente alguém explicou sem enrolação. Excelente!", "gui.produtor", history, 1),
    evidence(13, "Salvei porque vou rever antes do próximo lançamento.", "lu.brand", launch, 2),
  ];

  const themes: AudienceTheme[] = [
    { id: "theme-course", label: "Aprender o método completo", summary: "A audiência quer sair de dicas isoladas para um caminho estruturado, do básico à aplicação.", volume: 47, share: 0.26, trend: 0.18, confidence: 0.93, relatedMediaIds: [history.id, habits.id], evidence: courseEvidence },
    { id: "theme-beginner", label: "Começar com audiência pequena", summary: "Contas menores têm interesse, mas não sabem se o método funciona antes de ganhar escala.", volume: 35, share: 0.19, trend: 0.31, confidence: 0.89, relatedMediaIds: [habits.id, launch.id], evidence: beginnerEvidence },
    { id: "theme-templates", label: "Exemplos e modelos prontos", summary: "Pedidos por roteiros, mensagens e CTAs mostram preferência por materiais imediatamente aplicáveis.", volume: 29, share: 0.16, trend: 0.12, confidence: 0.91, relatedMediaIds: [launch.id, habits.id, history.id], evidence: templateEvidence },
    { id: "theme-price", label: "Preço e porta de entrada", summary: "Existe intenção de compra, acompanhada de dúvida sobre preço e uma opção inicial mais acessível.", volume: 18, share: 0.1, trend: -0.04, confidence: 0.86, relatedMediaIds: [history.id, launch.id], evidence: priceEvidence },
  ];

  const baseInsights: AudienceInsight[] = [
    {
      id: "60000000-0000-4000-8000-000000000001", category: "purchase_intent", title: "Existe demanda por uma oferta completa", summary: "Pessoas estão perguntando espontaneamente por curso e mentoria, sem que o Reel apresente uma oferta direta.", recommendation: "Teste um Reel apresentando o método em três etapas e convide a audiência a comentar MAPA para receber a estrutura.", confidence: 0.94, evidenceCount: 3, isEarlySignal: false, status: "new", feedback: null, priority: 96, mediaIds: [history.id, habits.id], evidence: courseEvidence,
      contentSuggestion: { hook: "Você não precisa de mais uma dica de Instagram — precisa de um mapa.", angle: "Mostrar o método como uma jornada de três etapas e revelar onde a maioria trava.", outline: ["O erro de colecionar dicas", "As três etapas do método", "Como identificar sua etapa atual"], cta: "Comente MAPA para receber a estrutura completa.", keyword: "MAPA", publicReply: "O mapa já está a caminho. Confira seu direct.", dmMessage: "Aqui está o mapa com as três etapas para aplicar o método no seu negócio:" }, createdAutomationId: null, createdAt: new Date(now - 3_600_000).toISOString(),
    },
    {
      id: "60000000-0000-4000-8000-000000000002", category: "question", title: "Contas pequenas não sabem por onde começar", summary: "A principal dúvida não é se a estratégia funciona, mas qual etapa faz sentido com poucos seguidores.", recommendation: "Crie um conteúdo específico para perfis abaixo de mil seguidores com uma primeira ação executável em 15 minutos.", confidence: 0.9, evidenceCount: 3, isEarlySignal: false, status: "new", feedback: null, priority: 91, mediaIds: [habits.id, launch.id], evidence: beginnerEvidence,
      contentSuggestion: { hook: "Se você tem menos de mil seguidores, comece por aqui.", angle: "Retirar a escala como pré-requisito e oferecer uma ação pequena, mensurável e segura.", outline: ["O que não fazer no início", "A única métrica que importa", "A rotina de 15 minutos"], cta: "Comente COMEÇO para receber o checklist.", keyword: "COMEÇO", publicReply: "Seu checklist de começo já foi enviado.", dmMessage: "Preparei um checklist enxuto para aplicar mesmo com uma audiência pequena:" }, createdAutomationId: null, createdAt: new Date(now - 7_200_000).toISOString(),
    },
    {
      id: "60000000-0000-4000-8000-000000000003", category: "objection", title: "Preço aparece antes do valor percebido", summary: "A audiência demonstra interesse, mas procura uma opção de entrada antes de entender o formato completo.", recommendation: "Explique o resultado e o que está incluído antes de apresentar preço; teste um material gratuito como ponte.", confidence: 0.86, evidenceCount: 2, isEarlySignal: false, status: "reviewed", feedback: "useful", priority: 84, mediaIds: [history.id, launch.id], evidence: priceEvidence, contentSuggestion: null, createdAutomationId: null, createdAt: new Date(now - 10_800_000).toISOString(),
    },
    {
      id: "60000000-0000-4000-8000-000000000004", category: "content_request", title: "Modelos prontos têm forte apelo", summary: "Roteiros e exemplos concretos são pedidos com mais frequência do que explicações conceituais.", recommendation: "Publique uma série curta de antes/depois com roteiro, CTA e mensagem de DM anotados.", confidence: 0.92, evidenceCount: 3, isEarlySignal: false, status: "new", feedback: null, priority: 88, mediaIds: [launch.id, habits.id, history.id], evidence: templateEvidence,
      contentSuggestion: { hook: "Copie este roteiro para seu próximo Reel de venda.", angle: "Abrir o documento real e explicar por que cada linha existe.", outline: ["Gancho em sete palavras", "Prova sem exagero", "CTA que inicia conversa"], cta: "Comente ROTEIRO para receber o modelo editável.", keyword: "ROTEIRO", publicReply: "Enviei o roteiro editável no seu direct.", dmMessage: "Aqui está o roteiro para adaptar ao seu próximo Reel:" }, createdAutomationId: null, createdAt: new Date(now - 14_400_000).toISOString(),
    },
    {
      id: "60000000-0000-4000-8000-000000000005", category: "praise", title: "Clareza é um atributo reconhecido", summary: "Os comentários positivos destacam explicações diretas e materiais que podem ser revisitados.", recommendation: "Preserve a linguagem simples e transforme conteúdos densos em recursos salváveis.", confidence: 0.81, evidenceCount: 2, isEarlySignal: false, status: "reviewed", feedback: null, priority: 63, mediaIds: [history.id, launch.id], evidence: praiseEvidence, contentSuggestion: null, createdAutomationId: null, createdAt: new Date(now - 18_000_000).toISOString(),
    },
  ];

  const ideas: AudienceInsight[] = baseInsights.filter((item) => item.contentSuggestion);
  return {
    metrics: { analyzedComments: 184, openQuestions: 38, purchaseIntent: 31, contentRequests: 29, objections: 18, lastUpdatedAt: new Date(now - 18 * 60_000).toISOString() },
    themes,
    insights: baseInsights,
    ideas,
    latestRun: { id: "70000000-0000-4000-8000-000000000001", status: "succeeded", model: "mock-audience-v1", promptVersion: "audience-v1", periodDays: 30, commentCount: 184, inputTokens: 0, outputTokens: 0, durationMs: 1280, createdAt: new Date(now - 20 * 60_000).toISOString(), completedAt: new Date(now - 18 * 60_000).toISOString() },
  };
}
