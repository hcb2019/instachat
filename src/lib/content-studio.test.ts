import { describe, expect, it } from "vitest";
import { contentConceptsOutputSchema, contentPackageSchema, contentProjectInputSchema, richContentPackageSchema } from "@/lib/content-studio";

describe("content studio schemas", () => {
  it("aceita um projeto completo e mantém o segundo objetivo opcional", () => {
    const result = contentProjectInputSchema.safeParse({
      title: "IA sem complicação",
      topic: "Como escolher a primeira tarefa para automatizar",
      pillar: "automation_productivity",
      primaryGoal: "leads",
      secondaryGoal: null,
      hookIntensity: "provocative",
      deliverableType: "checklist",
      notes: "Evitar promessas de dinheiro.",
      sourceInsightId: null,
    });

    expect(result.success).toBe(true);
  });

  it("exige exatamente três ideias e três variações de automação", () => {
    const concept = {
      title: "A tarefa escondida",
      style: "safe" as const,
      hook: "A tarefa que mais toma seu tempo talvez nem precise ser feita por você.",
      angle: "Mostrar uma repetição cotidiana antes de apresentar a IA.",
      audiencePain: "Tempo perdido com trabalho repetitivo.",
      promise: "Encontrar uma tarefa simples para testar hoje.",
      visualDirection: "Câmera parada enquanto uma planilha aparece ao fundo.",
      deliverableIdea: "Checklist para escolher a primeira automação.",
      cta: "Comente MAPA para receber no direct.",
      keywords: ["MAPA", "TEMPO", "FLUXO"] as [string, string, string],
    };
    expect(contentConceptsOutputSchema.safeParse({ concepts: [concept, concept, concept] }).success).toBe(true);
    expect(contentConceptsOutputSchema.safeParse({ concepts: [concept, concept] }).success).toBe(false);

    const packageResult = contentPackageSchema.safeParse({
      onScreenHook: concept.hook,
      visualDirection: concept.visualDirection,
      shortCaption: "@hernando.ia\n\nVocê pode começar por uma tarefa pequena.\n\nComente MAPA.",
      mediumCaption: "@hernando.ia\n\nVocê pode começar por uma tarefa pequena e repetitiva.\n\nAnote o que entra e o que precisa sair.\n\nComente MAPA.",
      fullCaption: "@hernando.ia\n\nVocê pode começar por uma tarefa pequena e repetitiva.\n\n1. Anote o que inicia a tarefa.\n2. Separe o que sempre se repete.\n3. Confira como é uma boa resposta.\n\nComente MAPA e eu mando o checklist no direct.",
      selectedKeyword: "MAPA",
      keywordSuggestions: ["MAPA", "TEMPO", "FLUXO"],
      publicReplies: ["Te mandei no direct. Confere lá!", "Prontinho, chegou na sua DM.", "Enviei agora. Dá uma olhada."],
      dmMessages: ["O material que você pediu está aqui:", "Separei o checklist neste link:", "Pode abrir o seu material por aqui:"],
      deliverable: {
        title: "Mapa da primeira automação",
        summary: "Um checklist curto para escolher por onde começar.",
        introduction: "Use este material com uma tarefa real do seu dia.",
        sections: [
          { heading: "Escolha", body: "Pegue uma tarefa pequena.", items: ["Ela se repete?"] },
          { heading: "Teste", body: "Confira o resultado antes de usar.", items: ["A resposta ficou boa?"] },
        ],
        closing: "Comece pequeno e ajuste com exemplos reais.",
      },
    });

    expect(packageResult.success).toBe(true);
    if (!packageResult.success) return;
    expect(richContentPackageSchema.safeParse(packageResult.data).success).toBe(false);

    const section = { heading: "Mapeie a tarefa", body: "Use um caso real antes de escolher qualquer ferramenta.", items: ["Separe uma entrada real", "Defina o resultado esperado"], practicalTip: "Se não existe exemplo real, o recorte ainda está amplo demais." };
    const richResult = richContentPackageSchema.safeParse({
      ...packageResult.data,
      deliverable: {
        ...packageResult.data.deliverable,
        authorHandle: "@hernando.ia",
        summary: "Um plano completo para escolher, testar e validar sua primeira automação com exemplos reais.",
        introduction: "Este material ajuda você a sair de uma ideia ampla e chegar a um teste verificável, usando uma tarefa real, critérios claros e revisão humana antes de colocar qualquer resposta em produção.",
        outcome: "Sair com uma tarefa priorizada, um primeiro prompt e critérios objetivos para aprovar ou rejeitar o teste.",
        estimatedMinutes: 25,
        difficulty: "beginner",
        prerequisites: ["Uma tarefa executada nesta semana", "Um exemplo de resposta aprovada"],
        sections: [section, { ...section, heading: "Dê uma nota" }, { ...section, heading: "Monte o teste" }, { ...section, heading: "Valide o resultado" }],
        examples: [{ title: "Pedido de orçamento", scenario: "A equipe recebe mensagens incompletas.", application: "A IA identifica os dados ausentes antes da resposta.", result: "O teste passa quando não inventa informações em três casos." }],
        templates: [{ title: "Diagnóstico", description: "Preencha antes do teste.", content: "Tarefa: [NOME]\nEntrada: [DADOS]\nSaída esperada: [RESULTADO]" }, { title: "Piloto", description: "Use com exemplos reais.", content: "Contexto: [SITUAÇÃO]\nCritérios: [LISTA]\nNão faça: [LIMITES]" }],
        pitfalls: [{ mistake: "Automatizar tudo", correction: "Recorte uma única decisão verificável." }, { mistake: "Testar um caso", correction: "Use pelo menos três exemplos diferentes." }, { mistake: "Usar critério vago", correction: "Defina tamanho, formato e informações obrigatórias." }],
        nextSteps: ["Escolha uma tarefa real", "Preencha o diagnóstico", "Teste com três exemplos"],
        closing: "Use os resultados do teste para decidir se vale ajustar, descartar ou transformar o fluxo em rotina.",
      },
    });
    expect(richResult.success).toBe(true);
  });
});
