import { describe, expect, it } from "vitest";
import { contentPackageSchema } from "@/lib/content-studio";
import { buildConceptGenerationInput, buildDemoConcepts, buildDemoPackage, buildPackageGenerationInput } from "@/lib/content-studio-generation";
import type { ContentProject, CreatorProfile } from "@/types/content-studio";

const profile: CreatorProfile = { instagramHandle: "@hernando.ia", niche: "IA aplicada a negócios", audience: "Profissionais autônomos", voice: "Direto e conversado", preferredTerms: [], avoidedTerms: [], defaultCta: "Comente para receber." };

function project(id: string, title: string, topic: string): ContentProject {
  return { id, ownerId: "owner", sourceInsightId: null, title, topic, pillar: "ai_business", primaryGoal: "leads", secondaryGoal: "saves", hookIntensity: "provocative", deliverableType: "prompt", notes: "", status: "idea", concepts: [], selectedConceptIndex: null, contentPackage: null, mediaId: null, automationId: null, deliverableSlug: null, createdAt: "2026-08-17T00:00:00.000Z", updatedAt: "2026-08-17T00:00:00.000Z" };
}

describe("isolamento do Estúdio", () => {
  it("envia somente o briefing atual e nunca um pacote salvo", () => {
    const current = project("11111111-1111-4111-8111-111111111111", "Preço no Direct", "Ensinar a responder preço sem encerrar a conversa.");
    current.contentPackage = { onScreenHook: "conteúdo antigo" } as ContentProject["contentPackage"];
    const input = buildConceptGenerationInput(current, profile);
    expect(input.briefing.topic).toBe(current.topic);
    expect(JSON.stringify(input)).not.toContain("conteúdo antigo");
    expect(JSON.stringify(buildPackageGenerationInput(current, buildDemoConcepts(current)[0], profile))).not.toContain("conteúdo antigo");
  });

  it("cria conceitos, legendas e entregáveis diferentes para temas diferentes", () => {
    const price = project("11111111-1111-4111-8111-111111111111", "Preço no Direct", "Ensinar a responder preço sem encerrar a conversa.");
    const hiring = project("22222222-2222-4222-8222-222222222222", "Contratação com IA", "Criar um roteiro para comparar currículos com critérios claros.");
    const priceConcept = buildDemoConcepts(price)[0];
    const hiringConcept = buildDemoConcepts(hiring)[0];
    const pricePackage = buildDemoPackage(price, priceConcept, profile);
    const hiringPackage = buildDemoPackage(hiring, hiringConcept, profile);

    expect(priceConcept.hook).not.toBe(hiringConcept.hook);
    expect(pricePackage.fullCaption).not.toBe(hiringPackage.fullCaption);
    expect(pricePackage.deliverable.introduction).toContain("responder preço");
    expect(hiringPackage.deliverable.introduction).toContain("comparar currículos");
    expect(pricePackage.deliverable.templates?.[0].content).not.toBe(hiringPackage.deliverable.templates?.[0].content);
    expect(contentPackageSchema.safeParse(pricePackage).success).toBe(true);
    expect(contentPackageSchema.safeParse(hiringPackage).success).toBe(true);
  });
});
